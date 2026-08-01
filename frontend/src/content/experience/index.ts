// ─────────────────────────────────────────────────────────────────────────────
// src/content/experience/index.ts
// Single source of truth for all work experience.
// Each Experience is self-contained — typeConfig lives on the entry.
// EXPERIENCE_TYPE_CONFIG is derived — never edited manually.
// To add a role: add one object to EXPERIENCES. Nothing else.
// ─────────────────────────────────────────────────────────────────────────────
import type { Experience } from '@/types'

export const EXPERIENCES: Experience[] = [
  {
    id: 'lead-consultant',
    role: 'Enterprise Software & AI Consultant',
    company: 'Independent / Freelance',
    companyUrl: '',
    location: 'Remote — India',
    type: 'freelance',
    typeConfig: { label: 'Freelance', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    startDate: '2026-01',
    endDate: 'present',
    current: true,
    description:
      'Building enterprise-grade full-stack applications and AI-powered solutions for startups and businesses. Leveraging seven years of experience across US Healthcare, Jaguar Land Rover, and Government of Hawaii projects to design scalable software, modern APIs, cloud-native applications, and intelligent automation solutions.',
    highlights: [
      { text: 'Developing modern full-stack applications using Java 21, Spring Boot, Vue.js 3, PostgreSQL, and cloud-native architectures.' },
      { text: 'Integrating Large Language Models (LLMs), AI assistants, intelligent search, and workflow automation into enterprise applications.' },
      { text: 'Helping businesses modernize legacy systems, design scalable APIs, and implement clean, maintainable software architectures.' },
      { text: 'Building production-ready SaaS platforms with authentication, role-based access control, responsive UI, and secure backend services.' },
      { text: 'Providing end-to-end technical consulting—from architecture and development to deployment, performance optimization, and long-term maintainability.' },
    ],
    tech: [
      { name: 'Java 21' }, { name: 'Spring Boot 3' }, { name: 'Vue 3' },
      { name: 'PostgreSQL' }, { name: 'AWS ECS' }, { name: 'Docker' },
      { name: 'Jenkins' }, { name: 'OpenAI API' }, { name: 'TypeScript' },
      { name: 'Apache Kafka' }, { name: 'Kubernetes' }, { name: 'AWS EKS' },
      { name: 'Redis' }
    ],
    order: 1,
  },
  {
    id: 'senior-engineer',
    role: 'Senior Engineer',
    company: 'Innovan Technologies',
    companyUrl: '',
    location: 'Hyderabad, India',
    type: 'full-time',
    typeConfig: { label: 'Full-time', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    startDate: '2024-12',
    endDate: 'present',
    current: true,
    description:
      'Currently building enterprise applications for Government of Hawaii projects, developing secure and scalable solutions used by public sector organizations. As a Senior Full Stack Engineer, I lead feature implementation across Java and Vue.js, collaborate with architects and stakeholders, and drive the delivery of production-ready software using modern engineering practices.',
    highlights: [
      { text: 'Designed and implemented enterprise features using Java 21, Spring Boot, Vue.js 3, and Oracle Database for large-scale government applications.' },
      { text: 'Owned end-to-end feature delivery—from requirement analysis and technical design to implementation, testing, code reviews, and production deployment.' },
      { text: 'Developed secure REST APIs, optimized database interactions, and integrated backend services while following enterprise security and coding standards.' },
      { text: 'Collaborated closely with cross-functional teams to modernize legacy modules, improve maintainability, and deliver high-quality software through Agile development.' },
      { text: 'Mentored team members, reviewed pull requests, resolved complex production issues, and contributed to architectural decisions for long-term scalability.' },
    ],
    tech: [
      { name: 'Java 21' }, { name: 'Spring Boot' }, { name: 'Gradle' },
      { name: 'Vue' }, { name: 'Spring Security' }, { name: 'Spring Batch' },
      { name: 'Git' }, { name: 'Oracle DB' }, { name: 'Junit' },
      { name: 'Swagger' }
    ],
    order: 2,
  },
  {
    id: 'software-engineer',
    role: 'Software Engineer',
    company: 'TCS (Jaguar Land Rover)',
    companyUrl: '',
    location: 'Pune, India',
    type: 'full-time',
    typeConfig: { label: 'Full-time', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    startDate: '2021-04',
    endDate: '2024-12',
    current: false,
    description:
      'Worked as a Full Stack Engineer for Jaguar Land Rover, contributing to enterprise applications supporting global business operations. Collaborated with distributed teams to build scalable, maintainable solutions while following enterprise engineering standards, Agile practices, and modern cloud-based development workflows.',
    highlights: [
      { text: 'Developed and enhanced full-stack enterprise applications using Java, Spring Boot, Angular, and REST APIs for business-critical workflows.' },
      { text: 'Built scalable backend services and integrated multiple data sources to support reliable, high-performance enterprise applications.' },
      { text: 'Worked extensively with Google Cloud Platform, BigQuery, MySQL, Jenkins, and CI/CD pipelines to deliver secure and production-ready software.' },
      { text: 'Collaborated with global cross-functional teams including product owners, QA engineers, architects, and business stakeholders throughout the software development lifecycle.' },
      { text: 'Contributed to application performance improvements, bug fixes, feature development, code reviews, and continuous delivery while maintaining high code quality standards.' },
    ],
    tech: [
      { name: 'Java 8' }, { name: 'Spring Boot' }, { name: 'MySQL' },
      { name: 'BigQuery' }, { name: 'Maven' }, { name: 'Jenkins' },
      { name: 'REST APIs' }, { name: 'Hazelcast' }, { name: 'Angular' },
      { name: 'GCP' }, { name: 'Compute Engine' }
    ],
    order: 3,
  },
  {
    id: 'junior-fs-engineer',
    role: 'Junior Full Stack Engineer',
    company: 'L Cube Innovative Solutions Private Limited',
    companyUrl: '',
    location: 'Chennai, India',
    type: 'full-time',
    typeConfig: { label: 'Full-time', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    startDate: '2019-07',
    endDate: '2021-02',
    current: false,
    description:
      'Started my software engineering career building enterprise Electronic Medical Record (EMR) solutions used by hospitals across the United States. Working on healthcare systems taught me early that software isn\'t just about features—it must be reliable, secure, and maintainable because healthcare professionals depend on it every day.',
    highlights: [
      { text: 'Developed and enhanced enterprise EMR modules using Java, Spring MVC, Hibernate, and PostgreSQL while collaborating with cross-functional teams.' },
      { text: 'Built and maintained REST APIs, backend services, and database components supporting healthcare workflows and patient data management.' },
      { text: 'Investigated and resolved production issues, optimized application performance, and contributed to stable, high-quality software releases.' },
      { text: 'Worked within Agile development practices, participating in code reviews, sprint planning, testing, and continuous delivery of enterprise healthcare applications.' },
    ],
    tech: [
      { name: 'Java 8' }, { name: 'Spring MVC' }, { name: 'PostgreSQL' },
      { name: 'Maven' }, { name: 'REST APIs' },
      { name: 'GWT' }, { name: 'Git' }, { name: 'Hibernate' }
    ],
    order: 4,
  },
]

// ── Derived map — never edit manually ────────────────────────────────────────
export const EXPERIENCE_TYPE_CONFIG = Object.fromEntries(
  EXPERIENCES.map(e => [e.type, e.typeConfig])
) as Record<string, Experience['typeConfig']>
