import type { PageMeta } from '@/types'

export const DEFAULT_META: PageMeta = {
  title:       'Yash Ranjan | Senior Software Engineer',
  description: 'Senior Software Engineer with 7+ years building enterprise backends, cloud infrastructure, and AI-assisted systems. Java, Spring Boot, Vue.js, AWS.',
  keywords:    'Senior Java Developer, Spring Boot, Vue.js, AWS, Enterprise Software, Freelance Developer, Backend Engineer',
  ogImage:     '/og-image.jpg',
}

export const PAGE_META: Record<string, PageMeta> = {
  home: {
    title:       'Yash Ranjan | Senior Software Engineer',
    description: 'I build the backend that startups bet their product on. 7+ years of enterprise engineering.',
  },
  about: {
    title:       'About | Yash Ranjan',
    description: 'Senior Software Engineer with a philosophy-first approach to building enterprise systems.',
  },
  experience: {
    title:       'Experience | Yash Ranjan',
    description: '7+ years of enterprise software engineering across Java, Spring Boot, AWS, and cloud infrastructure.',
  },
  projects: {
    title:       'Projects | Yash Ranjan',
    description: 'Selected work — enterprise systems, cloud infrastructure, and AI-assisted development.',
  },
  skills: {
    title:       'Skills | Yash Ranjan',
    description: 'Full technical picture — Java, Spring Boot, Vue.js, PostgreSQL, Oracle, Docker, AWS, Jenkins.',
  },
  services: {
    title:       'Services | Yash Ranjan',
    description: 'Backend engineering, cloud architecture, and technical consulting for startups and enterprises.',
  },
  testimonials: {
    title:       'Testimonials | Yash Ranjan',
    description: 'What clients and colleagues say about working with Yash Ranjan.',
  },
  blog: {
    title:       'Blog | Yash Ranjan',
    description: 'Thoughts on enterprise engineering, cloud architecture, and AI-assisted development.',
  },
  contact: {
    title:       'Contact | Yash Ranjan',
    description: "Let's build something serious. Available for new projects.",
  },
}
