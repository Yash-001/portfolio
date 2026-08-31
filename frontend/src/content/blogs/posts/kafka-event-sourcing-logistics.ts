import type { BlogPostFull } from '@/types/content'
import { BLOG_AUTHOR } from '../author'

const post: BlogPostFull = {
  id:          'blog-4',
  slug:        'kafka-event-sourcing-logistics',
  title:       'From 90-Second Staleness to 3 Seconds: Kafka Event Streaming in Practice',
  excerpt:     "We replaced a polling-based GPS tracking system with Kafka event streaming. Location staleness dropped from 90 seconds to under 3 seconds. Here's the architecture, the tradeoffs, and what we got wrong the first time.",
  category:    'Backend',
  author:      BLOG_AUTHOR,
  tags:        [{ name: 'Kafka', slug: 'kafka' }, { name: 'Event Sourcing', slug: 'event-sourcing' }, { name: 'Spring Boot', slug: 'spring-boot' }],
  status:      'published',
  featured:    false,
  readingTime: 14,
  publishedAt: '2024-01-22',
  coverImage:  undefined,
  content: `
## The Problem With Polling

The system we inherited tracked delivery vehicles on a map. Every 30 seconds, the frontend polled a REST endpoint. That endpoint queried a PostgreSQL table that a background job updated every 60 seconds by calling the GPS provider's API.

So in the worst case, a vehicle moved and the dashboard showed the old position for up to 90 seconds. For internal ops dashboards, that was tolerable. When we started exposing live tracking to end customers — "watch your delivery in real time" — 90 seconds was not tolerable.

The obvious fix was to poll faster. We tried 10-second polling. The GPS provider rate-limited us. We tried caching the GPS responses and polling the cache — we just moved the staleness problem one layer up.

The real problem wasn't the polling interval. It was the architecture: pull-based systems are fundamentally limited by how often you can ask. We needed to flip it — let the data come to us when it changes.

---

## The Architecture We Landed On

The final architecture has three parts:

1. **GPS provider webhooks → Kafka topic**: The GPS provider supports webhooks. Each position update hits an ingest endpoint, which publishes to a Kafka topic (\`vehicle.location.raw\`). No polling.
2. **Kafka consumer → Redis**: A Spring Boot consumer reads from the topic, enriches the event (adds route context, ETA recalculation), and writes the latest position to Redis with a 5-minute TTL.
3. **WebSocket push → frontend**: Instead of the frontend polling, the backend pushes updates over WebSocket whenever a new event is processed.

Staleness is now bounded by the GPS provider's webhook latency (typically under 1 second) plus our processing time (under 500ms). End-to-end: under 3 seconds including network.

---

## Setting Up the Kafka Topic

We use a single partitioned topic for location events. Partition key is \`vehicle_id\` — this guarantees ordering per vehicle, which matters when you're computing movement deltas.

\`\`\`java
@Configuration
public class KafkaTopicConfig {

  @Bean
  public NewTopic vehicleLocationTopic() {
    return TopicBuilder.name("vehicle.location.raw")
      .partitions(12)
      .replicas(3)
      .config(TopicConfig.RETENTION_MS_CONFIG, String.valueOf(Duration.ofHours(24).toMillis()))
      .build();
  }
}
\`\`\`

12 partitions for the consumer group — sized based on the number of concurrent vehicles we expected to be active during peak delivery windows. Retention of 24 hours means we can replay a full day of location history if a consumer falls behind or we need to reprocess.

---

## The Ingest Endpoint

The webhook receiver is intentionally thin. It validates the payload, publishes to Kafka, and returns 200 immediately. No database writes, no enrichment — that happens downstream.

\`\`\`java
@RestController
@RequestMapping("/webhooks/gps")
public class GpsWebhookController {

  private final KafkaTemplate<String, VehicleLocationEvent> kafkaTemplate;

  @PostMapping("/location")
  public ResponseEntity<Void> receiveLocation(@RequestBody GpsWebhookPayload payload,
                                               @RequestHeader("X-Webhook-Secret") String secret) {
    if (!webhookSecretValidator.isValid(secret)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    VehicleLocationEvent event = VehicleLocationEvent.builder()
      .vehicleId(payload.getVehicleId())
      .latitude(payload.getLat())
      .longitude(payload.getLng())
      .timestamp(payload.getTimestamp())
      .build();

    kafkaTemplate.send("vehicle.location.raw", event.getVehicleId(), event);
    return ResponseEntity.ok().build();
  }
}
\`\`\`

The partition key is \`vehicleId\`. Kafka routes all events for the same vehicle to the same partition, so the consumer always sees them in order.

---

## The Consumer: Enrichment and Redis Write

The consumer does the actual work — it takes the raw GPS event, adds context, and writes to Redis.

\`\`\`java
@Component
public class VehicleLocationConsumer {

  private final RedisTemplate<String, VehicleLocationState> redisTemplate;
  private final RouteService routeService;

  @KafkaListener(
    topics = "vehicle.location.raw",
    groupId = "location-processor",
    concurrency = "12"
  )
  public void consume(VehicleLocationEvent event) {
    RouteContext route = routeService.getActiveRoute(event.getVehicleId());

    VehicleLocationState state = VehicleLocationState.builder()
      .vehicleId(event.getVehicleId())
      .latitude(event.getLatitude())
      .longitude(event.getLongitude())
      .updatedAt(event.getTimestamp())
      .etaMinutes(route != null ? route.calculateEta(event.getLatitude(), event.getLongitude()) : null)
      .routeId(route != null ? route.getId() : null)
      .build();

    String key = "vehicle:location:" + event.getVehicleId();
    redisTemplate.opsForValue().set(key, state, Duration.ofMinutes(5));

    locationBroadcaster.broadcast(event.getVehicleId(), state);
  }
}
\`\`\`

\`concurrency = "12"\` matches the partition count — one thread per partition. Each thread processes events for a subset of vehicles sequentially, so ordering is preserved.

The 5-minute TTL on Redis means stale entries expire automatically. If a vehicle stops sending updates, its key disappears rather than sitting in Redis indefinitely showing an old position.

---

## WebSocket Push

The \`locationBroadcaster\` pushes the updated state to any connected clients watching that vehicle.

\`\`\`java
@Component
public class LocationBroadcaster {

  private final SimpMessagingTemplate messagingTemplate;

  public void broadcast(String vehicleId, VehicleLocationState state) {
    messagingTemplate.convertAndSend(
      "/topic/vehicle/" + vehicleId + "/location",
      state
    );
  }
}
\`\`\`

On the frontend, clients subscribe to \`/topic/vehicle/{vehicleId}/location\` when they open the tracking view and unsubscribe when they close it. No polling, no wasted requests.

---

## What We Got Wrong the First Time

### 1. We used a single partition

Our first version had one partition. Simple, easy to reason about. It also meant one consumer thread processing all vehicles sequentially. During peak hours — late afternoon when most deliveries complete — the consumer fell behind. Events were sitting in Kafka for 20–30 seconds before being processed. We'd traded 90-second polling staleness for 30-second queue staleness.

The fix was obvious in hindsight: partition by \`vehicle_id\`, scale consumer concurrency to match. With 12 partitions, the consumer processes 12 vehicles in parallel. Queue lag dropped to under 200ms even at peak.

### 2. We didn't handle out-of-order events

GPS devices occasionally send events out of order — a packet delayed in transit arrives after a newer one. With a single partition and ordered processing, this wasn't an issue. With 12 partitions, events for the same vehicle always go to the same partition (consistent hashing on \`vehicle_id\`), so ordering is still guaranteed within a vehicle. But we hadn't thought about this explicitly and got lucky that the partition key choice solved it.

The lesson: always think about ordering guarantees when choosing your partition key. If you partition by something other than the entity ID, you lose ordering for that entity.


### 3. The webhook endpoint was too slow initially

Our first version of the ingest endpoint did a database lookup to validate the vehicle ID before publishing to Kafka. Under load, that added 40–80ms per request. The GPS provider's webhook timeout is 5 seconds, but with enough concurrent deliveries, we started seeing occasional timeouts and retries — which meant duplicate events.

We moved vehicle validation to the consumer and made the ingest endpoint fire-and-forget. Invalid vehicle IDs get filtered out downstream. The endpoint now responds in under 5ms.

---

## Consumer Lag Monitoring

The thing that will bite you with Kafka is consumer lag — the gap between the latest offset and the consumer's current offset. If lag grows, your "real-time" system isn't real-time anymore.

We expose lag as a metric and alert if it exceeds 500 events:

\`\`\`java
@Scheduled(fixedDelay = 10000)
public void reportConsumerLag() {
  Map<TopicPartition, Long> endOffsets = kafkaAdminClient.listOffsets(...);
  Map<TopicPartition, OffsetAndMetadata> committedOffsets = kafkaAdminClient.listConsumerGroupOffsets("location-processor");

  committedOffsets.forEach((partition, committed) -> {
    long lag = endOffsets.get(partition) - committed.offset();
    meterRegistry.gauge("kafka.consumer.lag",
      Tags.of("topic", partition.topic(), "partition", String.valueOf(partition.partition())),
      lag
    );
  });
}
\`\`\`

If lag spikes, it usually means either the consumer is slow (check \`routeService.getActiveRoute\` — that was our bottleneck once) or the GPS provider is sending a burst of events (happens when vehicles come back online after a connectivity gap).

---

## The Tradeoffs

This architecture is more complex than polling. There's more infrastructure to operate — Kafka, Zookeeper (or KRaft), consumer group management, lag monitoring. For a small team that's a real ongoing cost, not just setup cost.

The tradeoffs are worth it when:
- You need sub-5-second staleness
- You have multiple consumers that need the same events (we later added a separate consumer for ETA notifications)
- You need event replay (we use it for debugging and for backfilling a new feature that needed historical location data)

They're probably not worth it when polling at a reasonable interval is fast enough and you only have one consumer. Don't add Kafka because it's interesting — add it because polling genuinely can't meet your latency requirements.

In our case, polling couldn't meet the requirement. Whether it's worth it for you depends on whether your latency requirement is actually strict or just aspirational.
`,
}

export default post
