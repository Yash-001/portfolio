export const EASING = {
  OUT_EXPO:     'cubic-bezier(0.16, 1, 0.3, 1)',
  OUT_QUART:    'cubic-bezier(0.25, 1, 0.5, 1)',
  IN_OUT_QUART: 'cubic-bezier(0.76, 0, 0.24, 1)',
  IN_EXPO:      'cubic-bezier(0.7, 0, 0.84, 0)',
  SPRING:       'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const

export const DURATION = {
  INSTANT:    0,
  MICRO:      100,
  FAST:       200,
  NORMAL:     300,
  MEDIUM:     400,
  SLOW:       600,
  DELIBERATE: 800,
  CINEMATIC:  1200,
  EXTENDED:   2000,
} as const

export const STAGGER = {
  TIGHT:    0.05,
  NORMAL:   0.08,
  LOOSE:    0.12,
  DRAMATIC: 0.2,
} as const

export const SCROLL_TRIGGER_DEFAULTS = {
  start:     'top 85%',
  end:       'bottom 15%',
  once:      true,
  markers:   false,
} as const

export const HERO_SEQUENCE_DELAYS = {
  BACKGROUND:   0,
  STATUS_BADGE: 200,
  HEADLINE_1:   400,
  HEADLINE_2:   550,
  SUBHEADLINE:  800,
  CTA:          1000,
  TECH_ROW:     1200,
  SCROLL_IND:   1400,
  AMBIENT:      1600,
} as const
