import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
import plugin from 'tailwindcss/plugin'

export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand primary — Indigo
        primary: {
          50:  '#EEEEFF',
          100: '#E0E0FF',
          200: '#C7C8FF',
          300: '#A5A6FF',
          400: '#8183FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        // Secondary — Violet
        violet: {
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        // Accent — Cyan
        cyan: {
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
        },
        // Semantic — Success
        success: {
          50:  '#ECFDF5',
          100: '#D1FAE5',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        // Semantic — Error
        error: {
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
        },
        // Semantic — Warning
        warning: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        // Surfaces — driven by CSS vars (theme-aware)
        surface: {
          base:      'var(--bg-base)',
          primary:   'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          elevated:  'var(--bg-elevated)',
          overlay:   'var(--bg-overlay)',
        },
        // Border tokens — driven by CSS vars
        border: {
          subtle:  'var(--border-subtle)',
          default: 'var(--border-default)',
          active:  'var(--border-active)',
          focus:   'var(--border-focus)',
        },
        // Text tokens — driven by CSS vars
        content: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary:  'var(--text-tertiary)',
          disabled:  'var(--text-disabled)',
          inverse:   'var(--text-inverse)',
        },
        // Brand tokens — driven by CSS vars
        brand: {
          DEFAULT: 'var(--color-primary)',
          hover:   'var(--color-primary-hover)',
          muted:   'var(--color-primary-muted)',
          accent:  'var(--color-accent)',
        },
        // Neon tokens (cyberpunk)
        neon: {
          primary:   'var(--neon-primary)',
          secondary: 'var(--neon-secondary)',
        },
      },
      fontFamily: {
        sans:  ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono:  ['Geist Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-2xl': ['80px', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '600' }],
        'display-xl':  ['72px', { lineHeight: '1.08', letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-lg':  ['60px', { lineHeight: '1.1',  letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-md':  ['48px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-sm':  ['36px', { lineHeight: '1.2',  letterSpacing: '-0.02em', fontWeight: '600' }],
        'heading-xl':  ['32px', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'heading-lg':  ['28px', { lineHeight: '1.3',  letterSpacing: '-0.01em' }],
        'heading-md':  ['24px', { lineHeight: '1.35', letterSpacing: '-0.01em' }],
        'heading-sm':  ['20px', { lineHeight: '1.4' }],
        'heading-xs':  ['18px', { lineHeight: '1.4' }],
        'body-xl':     ['20px', { lineHeight: '1.75' }],
        'body-lg':     ['18px', { lineHeight: '1.7' }],
        'body-md':     ['16px', { lineHeight: '1.65' }],
        'body-sm':     ['14px', { lineHeight: '1.6' }],
        'body-xs':     ['13px', { lineHeight: '1.55' }],
        'label-lg':    ['14px', { lineHeight: '1.4', letterSpacing: '0.06em' }],
        'label-md':    ['12px', { lineHeight: '1.4', letterSpacing: '0.08em' }],
        'label-sm':    ['11px', { lineHeight: '1.4', letterSpacing: '0.10em' }],
        'mono-lg':     ['16px', { lineHeight: '1.6' }],
        'mono-md':     ['14px', { lineHeight: '1.6' }],
        'mono-sm':     ['12px', { lineHeight: '1.5' }],
        'mono-xs':     ['11px', { lineHeight: '1.5' }],
      },
      spacing: {
        '0.5': '2px',
        '4.5': '18px',
        '13':  '52px',
        '15':  '60px',
        '18':  '72px',
        '22':  '88px',
        '26':  '104px',
        '30':  '120px',
        '34':  '136px',
        '38':  '152px',
        '42':  '168px',
        '46':  '184px',
        '50':  '200px',
        '54':  '216px',
        '58':  '232px',
        '62':  '248px',
        '68':  '272px',
        '72':  '288px',
        '76':  '304px',
        '80':  '320px',
        '88':  '352px',
        '96':  '384px',
        '104': '416px',
        '112': '448px',
        '120': '480px',
        '128': '512px',
        '160': '640px',
      },
      maxWidth: {
        'content-xs': '480px',
        'content-sm': '640px',
        'content-md': '768px',
        'content-lg': '1024px',
        'content-xl': '1280px',
        'content-2xl': '1400px',
        'reading':    '65ch',
        'headline':   '800px',
        'subheadline':'600px',
      },
      borderRadius: {
        'xs':  '4px',
        'sm':  '6px',
        'md':  '8px',
        'lg':  '12px',
        'xl':  '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
        'pill': '9999px',
      },
      boxShadow: {
        'card':         '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover':   '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.12)',
        'card-accent':  '0 0 40px rgba(99,102,241,0.08)',
        'card-accent-hover': '0 0 60px rgba(99,102,241,0.15)',
        'btn-primary':  '0 8px 24px rgba(99,102,241,0.3)',
        'btn-accent':   '0 12px 40px rgba(99,102,241,0.5)',
        'glow-sm':      '0 0 20px rgba(99,102,241,0.15)',
        'glow-md':      '0 0 40px rgba(99,102,241,0.2)',
        'glow-lg':      '0 0 80px rgba(99,102,241,0.25)',
        'focus':        '0 0 0 2px #0A0A0A, 0 0 0 4px #6366F1',
        'elevated':     '0 4px 24px rgba(0,0,0,0.5)',
        'modal':        '0 24px 80px rgba(0,0,0,0.7)',
        'none':         'none',
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'gradient-hero':    'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.05) 40%, transparent 70%)',
        'gradient-card':    'linear-gradient(135deg, #1A1A1A 0%, #111111 100%)',
        'gradient-text':    'linear-gradient(135deg, #F5F5F5 0%, #A0A0A0 100%)',
        'gradient-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
        'gradient-footer':  'linear-gradient(to bottom, transparent, #0A0A0A)',
        'noise':            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse-slow':    'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-dot':     'pulseDot 2s ease-in-out infinite',
        'float':         'float 6s ease-in-out infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'count-up':      'countUp 1.2s ease-out forwards',
        'draw-line':     'drawLine 0.8s ease-out forwards',
        'fade-up':       'fadeUp 0.6s ease-out forwards',
        'fade-in':       'fadeIn 0.5s ease-out forwards',
        'slide-left':    'slideLeft 0.6s ease-out forwards',
        'clip-reveal':   'clipReveal 0.8s ease-out forwards',
        'spin-slow':     'spin 8s linear infinite',
        'bounce-subtle': 'bounceSubtle 1.5s ease-in-out infinite',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(0.85)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        clipReveal: {
          '0%':   { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0% 0 0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(6px)' },
        },
        drawLine: {
          '0%':   { width: '0%' },
          '100%': { width: '100%' },
        },
      },
      transitionTimingFunction: {
        'out-expo':     'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart':    'cubic-bezier(0.25, 1, 0.5, 1)',
        'in-out-quart': 'cubic-bezier(0.76, 0, 0.24, 1)',
        'in-expo':      'cubic-bezier(0.7, 0, 0.84, 0)',
        'spring':       'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '0':   '0ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
        '1000': '1000ms',
        '1200': '1200ms',
      },
      screens: {
        'xs':  '480px',
        'sm':  '640px',
        'md':  '768px',
        'lg':  '1024px',
        'xl':  '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      zIndex: {
        'behind':   '-1',
        'base':     '0',
        'raised':   '10',
        'dropdown': '100',
        'sticky':   '200',
        'overlay':  '300',
        'modal':    '400',
        'toast':    '500',
        'cursor':   '9999',
      },
    },
  },
  plugins: [
    typography,
    // Theme-specific Tailwind variants
    plugin(({ addVariant }) => {
      addVariant('theme-light',         '[data-theme="light"] &')
      addVariant('theme-oled',          '[data-theme="oled"] &')
      addVariant('theme-glass',         '[data-theme="glass"] &')
      addVariant('theme-cyberpunk',     '[data-theme="cyberpunk"] &')
      addVariant('theme-high-contrast', '[data-theme="high-contrast"] &')
    }),
  ],
} satisfies Config
