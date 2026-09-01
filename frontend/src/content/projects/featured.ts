// ─────────────────────────────────────────────────────────────────────────────
// src/content/projects/featured.ts
// Deep-dive data for both featured projects: CareerForge and EAMS.
// ─────────────────────────────────────────────────────────────────────────────

// ── CareerForge ───────────────────────────────────────────────────────────────

export const CAREERFORGE_PROJECT = {
  id:          'careerforge',
  title:       'CareerForge',
  tagline:     'AI-powered career management — resumes, job tracking, and tailoring in one platform.',
  description: 'A full-stack SaaS platform for professional profile management, AI-assisted resume analysis and tailoring, versioned resumes, server-side PDF export, job application tracking, and subscription billing. Built as a modular monolith with Java 21, Spring Boot, Vue.js 3, PostgreSQL, Flyway, and Docker.',
  role:        'Product Designer + Full-Stack Developer',
  duration:    'Ongoing',
  year:        2025,
  status:      'MVP in Production',
  liveUrl:     'https://careerforge.yashranjan.com/',
  type:        'Full-Stack SaaS Product',
} as const

export const CAREERFORGE_METRICS = [
  { value: '379',      label: 'Backend tests',        description: 'All passing — Phase 9I audit'         },
  { value: '167',      label: 'Frontend tests',       description: 'All passing — Vitest'                 },
  { value: '7',        label: 'DB migrations',        description: 'Flyway — ddl-auto=validate'           },
  { value: '15min',    label: 'Access token TTL',     description: 'JWT HS256, 7-day refresh token'       },
  { value: '₹750/mo',  label: 'Pro tier',             description: 'Unlimited resumes + PDF exports'      },
  { value: '0',        label: 'Stack traces exposed', description: 'Structured error responses only'      },
] as const

export const CAREERFORGE_TECH = [
  { name: 'Java 21',         color: '#f89820', category: 'Backend'        },
  { name: 'Spring Boot',     color: '#6db33f', category: 'Backend'        },
  { name: 'Spring Security', color: '#6db33f', category: 'Backend'        },
  { name: 'JWT (HS256)',     color: '#6366f1', category: 'Backend'        },
  { name: 'Vue.js 3',        color: '#42b883', category: 'Frontend'       },
  { name: 'TypeScript',      color: '#3178c6', category: 'Frontend'       },
  { name: 'PrimeVue',        color: '#41b883', category: 'Frontend'       },
  { name: 'Vite',            color: '#646cff', category: 'Frontend'       },
  { name: 'PostgreSQL',      color: '#336791', category: 'Database'       },
  { name: 'Flyway',          color: '#cc0200', category: 'Database'       },
  { name: 'Stripe',          color: '#635bff', category: 'Payments'       },
  { name: 'OpenPDF',         color: '#e84e4e', category: 'PDF'            },
  { name: 'Docker',          color: '#2496ed', category: 'Infrastructure' },
  { name: 'Nginx',           color: '#009639', category: 'Infrastructure' },
  { name: 'GitHub Actions',  color: '#2088ff', category: 'CI/CD'          },
  { name: 'JUnit',           color: '#25a162', category: 'Testing'        },
  { name: 'Vitest',          color: '#6e9f18', category: 'Testing'        },
] as const

export const CAREERFORGE_SCREENSHOTS = [
  { id: 'dashboard',    label: 'Dashboard',           description: 'Resume count, application pipeline summary, status breakdown, and quick actions.' },
  { id: 'resume',       label: 'Resume Builder',      description: 'Versioned resume editor — edit content without affecting other versions.' },
  { id: 'ai-analysis',  label: 'AI Analysis',         description: 'Paste a job description and get structured analysis of your resume against it.' },
  { id: 'ai-tailoring', label: 'AI Tailoring',        description: 'Bullet-level suggestions with original, suggested, matched keywords, and rationale.' },
  { id: 'pdf-export',   label: 'PDF Export',          description: 'ATS-friendly single-column PDF generated server-side via OpenPDF.' },
  { id: 'applications', label: 'Application Tracker', description: 'Track applications with status lifecycle and linked resume version.' },
] as const

export const CAREERFORGE_TABS = [
  { id: 'overview',   label: 'Overview',   icon: 'pi pi-home'   },
  { id: 'features',   label: 'Features',   icon: 'pi pi-star'   },
  { id: 'challenges', label: 'Challenges', icon: 'pi pi-bolt'   },
  { id: 'api',        label: 'API Design', icon: 'pi pi-code'   },
  { id: 'security',   label: 'Security',   icon: 'pi pi-shield' },
  { id: 'roadmap',    label: 'Roadmap',    icon: 'pi pi-map'    },
] as const

// ── EAMS — Enterprise Asset Management System ─────────────────────────────────

export const EAM_PROJECT = {
  id:          'enterprise-asset-management-system',
  title:       'AI-Powered Enterprise Asset Management Platform (EAMS)',
  tagline:     'Full-stack EAM platform — assets, maintenance, inventory, and work orders in one system.',
  description: 'A full-stack Enterprise Asset Management platform built from scratch using Java 21, Spring Boot, Vue.js 3, PostgreSQL, and Docker. Manages asset lifecycle, preventive maintenance schedules, inventory tracking, work orders, role-based access control, and AI-assisted maintenance intelligence.',
  role:        'Founder, Solution Architect & Full-Stack Engineer',
  duration:    'Ongoing',
  year:        2026,
  status:      'In Development',
  liveUrl:     'https://eams-frontend-2s6w.onrender.com/',
  type:        'Enterprise SaaS Platform',
} as const

export const EAM_METRICS = [
  { value: 'Modular',    label: 'Architecture',   description: 'Layered enterprise architecture'  },
  { value: 'JWT + RBAC', label: 'Authentication', description: 'Role-based authorization'         },
  { value: 'Spring Boot', label: 'Backend',       description: 'Java 21 REST API'                 },
  { value: 'Vue 3',      label: 'Frontend',       description: 'Modern responsive SPA'            },
  { value: 'Flyway',     label: 'Migrations',     description: 'Schema version control'           },
  { value: 'Docker',     label: 'Infrastructure', description: 'Containerized deployment'         },
] as const

export const EAM_TECH = [
  { name: 'Java 21',         color: '#f89820', category: 'Backend'        },
  { name: 'Spring Boot 3',   color: '#6db33f', category: 'Backend'        },
  { name: 'Spring Security', color: '#6db33f', category: 'Backend'        },
  { name: 'Vue.js 3',        color: '#42b883', category: 'Frontend'       },
  { name: 'TypeScript',      color: '#3178c6', category: 'Frontend'       },
  { name: 'PostgreSQL',      color: '#336791', category: 'Database'       },
  { name: 'Flyway',          color: '#cc0200', category: 'Database'       },
  { name: 'Docker',          color: '#2496ed', category: 'Infrastructure' },
  { name: 'Gradle',          color: '#02303a', category: 'Build'          },
  { name: 'GitHub Actions',  color: '#2088ff', category: 'CI/CD'          },
  { name: 'JWT',             color: '#6366f1', category: 'Security'       },
  { name: 'REST APIs',       color: '#8b5cf6', category: 'Backend'        },
] as const

export const EAM_TECH_CATEGORIES = ['Backend', 'Frontend', 'Database', 'Infrastructure', 'Build', 'CI/CD', 'Security'] as const

export const EAM_FEATURES = [
  { id: 'assets',      label: 'Asset Management',    description: 'Full asset lifecycle — registration, categorization, location tracking, and history.' },
  { id: 'maintenance', label: 'Maintenance',         description: 'Preventive maintenance schedules, work order generation, and completion tracking.' },
  { id: 'inventory',   label: 'Inventory',           description: 'Parts and supplies inventory with reorder thresholds and usage tracking.' },
  { id: 'workorders',  label: 'Work Orders',         description: 'Create, assign, prioritize, and close work orders with full audit trail.' },
  { id: 'ai',          label: 'AI Intelligence',     description: 'AI-assisted maintenance recommendations based on asset history and usage patterns.' },
  { id: 'rbac',        label: 'Access Control',      description: 'Role-based access control — admin, manager, technician, and viewer roles.' },
] as const

export const EAM_CHALLENGES = [
  { id: 'modular',     label: 'Module Boundaries',   description: 'Defining the right domain boundaries — coarse enough to stay simple, fine enough to stay maintainable.' },
  { id: 'migrations',  label: 'Schema Evolution',    description: 'Managing schema migrations with Flyway while keeping ddl-auto=validate in production.' },
  { id: 'ai-layer',    label: 'AI Integration',      description: 'Building a provider abstraction so the underlying AI model can be swapped without restructuring the application.' },
  { id: 'auth',        label: 'JWT + RBAC',          description: 'Stateless JWT authentication with role-based access control enforced at the API layer.' },
] as const

export const EAM_TABS = [
  { id: 'overview',   label: 'Overview',   icon: 'pi pi-home'     },
  { id: 'features',   label: 'Features',   icon: 'pi pi-th-large' },
  { id: 'challenges', label: 'Challenges', icon: 'pi pi-bolt'     },
  { id: 'process',    label: 'Architecture', icon: 'pi pi-sitemap' },
] as const

export type EamTabId = typeof EAM_TABS[number]['id']

// ── Featured project switcher ─────────────────────────────────────────────────

export const FEATURED_PROJECTS = [
  {
    key:         'careerforge' as const,
    label:       'CareerForge',
    sublabel:    'Full-Stack SaaS',
    icon:        'pi pi-sparkles',
    color:       '#10b981',
    project:     CAREERFORGE_PROJECT,
    metrics:     CAREERFORGE_METRICS,
    tech:        CAREERFORGE_TECH,
    screenshots: CAREERFORGE_SCREENSHOTS,
    tabs:        CAREERFORGE_TABS,
  },
  {
    key:         'eams' as const,
    label:       'EAMS',
    sublabel:    'Enterprise Platform',
    icon:        'pi pi-building',
    color:       '#6366f1',
    project:     EAM_PROJECT,
    metrics:     EAM_METRICS,
    tech:        EAM_TECH,
    screenshots: EAM_FEATURES,
    tabs:        EAM_TABS,
  },
] as const

export type FeaturedProjectKey = typeof FEATURED_PROJECTS[number]['key']
export type FeaturedProject    = typeof FEATURED_PROJECTS[number]

// ── PHIMS aliases removed — PHIMS is a separate project, not featured ─────────
export type CareerForgeTabId = typeof CAREERFORGE_TABS[number]['id']
