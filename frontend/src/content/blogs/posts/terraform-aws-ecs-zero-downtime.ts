import type { BlogPostFull } from '@/types/content'
import { BLOG_AUTHOR } from '../author'

const post: BlogPostFull = {
  id:          'blog-5',
  slug:        'terraform-aws-ecs-zero-downtime',
  title:       'Zero-Downtime AWS ECS Deployments with Terraform and Blue/Green',
  excerpt:     'A step-by-step guide to blue/green deployments on AWS ECS using Terraform. Covers ALB listener rules, task definition versioning, health check configuration, and automated rollback on smoke test failure.',
  category:    'DevOps',
  author:      BLOG_AUTHOR,
  tags:        [{ name: 'AWS', slug: 'aws' }, { name: 'Terraform', slug: 'terraform' }, { name: 'ECS', slug: 'ecs' }],
  status:      'published',
  featured:    false,
  readingTime: 11,
  publishedAt: '2024-01-08',
  coverImage:  undefined,
  content: `
## Why We Needed This

We were doing rolling deployments on ECS. Most of the time they were fine. Every so often a deployment would cause a window where some requests hit the old task and some hit the new one — and if the new task had a startup issue, users would see errors until ECS cycled it out.

The real problem was no clean rollback path. If a deployment went bad, we'd re-deploy the previous image and wait for another rolling update. That took a few minutes. For a B2B product where clients notice downtime, that's not acceptable.

Blue/green gives you an instant rollback: if the new version fails health checks, traffic never shifts to it. The old version keeps serving. No manual intervention, no re-deploy.

---

## The Core Concept

Blue/green on ECS works like this:

- You have two ECS services: **blue** (current live) and **green** (new version)
- Both are registered as target groups behind an ALB
- The ALB listener routes 100% of traffic to blue
- You deploy the new version to green, wait for it to pass health checks
- You shift the ALB listener to route 100% to green
- If green fails health checks, you never shift — blue keeps serving
- Once green is stable, you tear down blue (or keep it for the next deployment cycle)

The key is that the traffic shift is atomic — it happens at the ALB listener level, not at the task level. There's no window where half your tasks are old and half are new.

---

## Terraform Structure

We manage this with three Terraform modules: \`ecs-service\`, \`alb-target-group\`, and \`deployment\`. Here's the relevant structure:

\`\`\`hcl
# Two target groups — one per colour
resource "aws_lb_target_group" "blue" {
  name        = "\${var.service_name}-blue"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = var.health_check_path
    interval            = 15
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }
}

resource "aws_lb_target_group" "green" {
  name        = "\${var.service_name}-green"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = var.health_check_path
    interval            = 15
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }
}
\`\`\`

\`\`\`hcl
# ALB listener — points to active target group
resource "aws_lb_listener_rule" "main" {
  listener_arn = var.https_listener_arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = var.active_colour == "blue" ? aws_lb_target_group.blue.arn : aws_lb_target_group.green.arn
  }

  condition {
    host_header {
      values = [var.domain]
    }
  }
}
\`\`\`

\`active_colour\` is a Terraform variable. Switching traffic is a \`terraform apply\` with \`-var active_colour=green\`. That's it — one variable change, one apply, instant traffic shift.

---

## ECS Service Configuration

Each colour has its own ECS service. They share the same task definition family but pin to different revisions:

\`\`\`hcl
resource "aws_ecs_service" "blue" {
  name            = "\${var.service_name}-blue"
  cluster         = var.cluster_arn
  task_definition = "\${var.service_name}:\${var.blue_task_revision}"
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.service_sg_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.blue.arn
    container_name   = var.service_name
    container_port   = var.container_port
  }

  lifecycle {
    ignore_changes = [desired_count]
  }
}
\`\`\`

The \`ignore_changes = [desired_count]\` is important — it prevents Terraform from resetting the task count if you've scaled it manually or via auto-scaling. Without this, every \`terraform apply\` would reset your running task count to whatever's in the config.

---

## Task Definition Versioning

Every deployment creates a new task definition revision. We never mutate an existing revision — ECS task definitions are immutable by design, which is what makes rollback reliable.

\`\`\`hcl
resource "aws_ecs_task_definition" "app" {
  family                   = var.service_name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([{
    name      = var.service_name
    image     = "\${var.ecr_repo_url}:\${var.image_tag}"
    essential = true

    portMappings = [{
      containerPort = var.container_port
      protocol      = "tcp"
    }]

    environment = var.environment_variables

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/\${var.service_name}"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }

    healthCheck = {
      command     = ["CMD-SHELL", "curl -f http://localhost:\${var.container_port}\${var.health_check_path} || exit 1"]
      interval    = 15
      timeout     = 5
      retries     = 3
      startPeriod = 30
    }
  }])
}
\`\`\`

The \`startPeriod\` of 30 seconds is critical. Without it, ECS starts health-checking immediately after the container starts. Spring Boot apps take 15–20 seconds to be ready. Without \`startPeriod\`, ECS marks the task unhealthy before it's had a chance to start, kills it, and you get a deployment loop.

---

## The Deployment Script

The actual deployment is a shell script that wraps Terraform. It deploys to the inactive colour, waits for health checks to pass, then shifts traffic:

\`\`\`bash
#!/bin/bash
set -euo pipefail

SERVICE=$1
IMAGE_TAG=$2
ACTIVE_COLOUR=$(terraform output -raw active_colour)
NEW_COLOUR=$([ "$ACTIVE_COLOUR" = "blue" ] && echo "green" || echo "blue")

echo "Active: $ACTIVE_COLOUR → Deploying to: $NEW_COLOUR"

# 1. Update task definition with new image
terraform apply -auto-approve \
  -var "image_tag=$IMAGE_TAG" \
  -var "active_colour=$ACTIVE_COLOUR"  # don't shift traffic yet

# 2. Update the inactive service to use the new task definition
NEW_REVISION=$(aws ecs describe-task-definition \
  --task-definition "$SERVICE" \
  --query 'taskDefinition.revision' \
  --output text)

terraform apply -auto-approve \
  -var "image_tag=$IMAGE_TAG" \
  -var "active_colour=$ACTIVE_COLOUR" \
  -var "\${NEW_COLOUR}_task_revision=$NEW_REVISION"

# 3. Wait for the new colour to be healthy
echo "Waiting for $NEW_COLOUR to stabilise..."
aws ecs wait services-stable \
  --cluster "$CLUSTER_ARN" \
  --services "\${SERVICE}-\${NEW_COLOUR}"

# 4. Run smoke tests against the inactive target group directly
SMOKE_TARGET=$(aws elbv2 describe-target-groups \
  --names "\${SERVICE}-\${NEW_COLOUR}" \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

if ! ./scripts/smoke-test.sh "$SMOKE_TARGET"; then
  echo "Smoke tests failed. Aborting — $ACTIVE_COLOUR still serving traffic."
  exit 1
fi

# 5. Shift traffic
terraform apply -auto-approve \
  -var "image_tag=$IMAGE_TAG" \
  -var "active_colour=$NEW_COLOUR" \
  -var "\${NEW_COLOUR}_task_revision=$NEW_REVISION"

echo "Deployment complete. $NEW_COLOUR is now live."
\`\`\`

Step 4 is the safety net. We run smoke tests directly against the new target group — bypassing the ALB listener — before shifting traffic. If they fail, the script exits and the old colour keeps serving. No manual rollback needed.

---

## Smoke Tests

The smoke test script hits a handful of critical endpoints and checks response codes and basic response shape:

\`\`\`bash
#!/bin/bash
TARGET_GROUP_ARN=$1

# Get a healthy target IP directly
TARGET_IP=$(aws elbv2 describe-target-health \
  --target-group-arn "$TARGET_GROUP_ARN" \
  --query 'TargetHealthDescriptions[?TargetHealth.State==\`healthy\`].Target.Id' \
  --output text | head -1)

BASE_URL="http://$TARGET_IP:8080"

check() {
  local path=$1
  local expected_status=$2
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")
  if [ "$status" != "$expected_status" ]; then
    echo "FAIL: $path returned $status, expected $expected_status"
    return 1
  fi
  echo "OK: $path"
}

check "/actuator/health" "200"
check "/api/v1/status"   "200"
check "/api/v1/version"  "200"
\`\`\`

These are intentionally minimal — we're not testing business logic here, just that the app started correctly and the critical paths respond. Full integration tests run earlier in the CI pipeline.

---

## What This Looks Like in Practice

A typical deployment runs in about 5 minutes end-to-end: CI builds and pushes the image, the script deploys to the inactive colour, waits for ECS to stabilise, runs smoke tests, then shifts traffic. The old colour stays running for 30 minutes before we scale it down — long enough to catch anything that slipped through smoke tests.

The main operational overhead is keeping track of which colour is active. We store it in Terraform state and expose it as an output, so it's always queryable. We also tag the active ALB target group in AWS so it's visible in the console without running Terraform.
`,
}

export default post
