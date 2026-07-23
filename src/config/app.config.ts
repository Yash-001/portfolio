export const appConfig = {
  name:    'portfolio',
  version: '1.0.0',
  api: {
    baseUrl:     import.meta.env.VITE_BLOG_API_URL || '',
    timeout:     10000,
    retryCount:  2,
  },
  emailjs: {
    serviceId:   import.meta.env.VITE_EMAILJS_SERVICE_ID  || '',
    templateId:  import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
    publicKey:   import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || '',
  },
  analytics: {
    ga4MeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID  || '',
    plausibleDomain:  import.meta.env.VITE_PLAUSIBLE_DOMAIN   || '',
    clarityProjectId: import.meta.env.VITE_CLARITY_PROJECT_ID || '',
  },
  features: {
    customCursor:     true,
    pageTransitions:  true,
    scrollAnimations: true,
    blogEnabled:      true,
  },
} as const
