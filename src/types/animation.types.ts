export type AnimationVariant =
  | 'fade-up'
  | 'fade-in'
  | 'slide-left'
  | 'slide-right'
  | 'scale-reveal'
  | 'clip-reveal'

export type EasingCurve =
  | 'out-expo'
  | 'out-quart'
  | 'in-out-quart'
  | 'in-expo'
  | 'spring'

export interface AnimationConfig {
  variant: AnimationVariant
  duration?: number
  delay?: number
  stagger?: number
  easing?: EasingCurve
  once?: boolean
  threshold?: number
}

export interface ScrollTriggerConfig {
  trigger?: string | Element
  start?: string
  end?: string
  scrub?: boolean | number
  pin?: boolean
  once?: boolean
  markers?: boolean
}
