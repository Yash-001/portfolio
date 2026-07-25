export const BREAKPOINTS = {
  XS:  480,
  SM:  640,
  MD:  768,
  LG:  1024,
  XL:  1280,
  '2XL': 1536,
  '3XL': 1920,
} as const

export const BREAKPOINT_QUERIES = {
  XS:  '(min-width: 480px)',
  SM:  '(min-width: 640px)',
  MD:  '(min-width: 768px)',
  LG:  '(min-width: 1024px)',
  XL:  '(min-width: 1280px)',
  '2XL': '(min-width: 1536px)',
} as const
