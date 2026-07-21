import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'
import type { ResolvedThemeId } from '@/types/theme.types'

// ── Shared brand primary (indigo) ──────────────────────────────────────────
const PRIMARY = {
  50:  '#EEEEFF', 100: '#E0E0FF', 200: '#C7C8FF', 300: '#A5A6FF',
  400: '#8183FF', 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA',
  800: '#3730A3', 900: '#312E81', 950: '#1E1B4B',
}

// ── Dark (baseline — matches existing design system) ──────────────────────
export const DarkPreset = definePreset(Aura, {
  semantic: {
    primary: PRIMARY,
    colorScheme: {
      dark: {
        surface: {
          0: '#FFFFFF', 50: '#F5F5F5', 100: '#E5E5E5', 200: '#A0A0A0',
          300: '#737373', 400: '#555555', 500: '#404040', 600: '#333333',
          700: '#222222', 800: '#1A1A1A', 900: '#111111', 950: '#0A0A0A',
        },
      },
    },
  },
})

// ── Light ─────────────────────────────────────────────────────────────────
export const LightPreset = definePreset(Aura, {
  semantic: {
    primary: PRIMARY,
    colorScheme: {
      light: {
        surface: {
          0: '#FFFFFF', 50: '#FAFAFA', 100: '#F5F5F5', 200: '#E5E5E5',
          300: '#D4D4D4', 400: '#A3A3A3', 500: '#737373', 600: '#525252',
          700: '#404040', 800: '#262626', 900: '#171717', 950: '#0A0A0A',
        },
      },
    },
  },
})

// ── OLED (pure black) ─────────────────────────────────────────────────────
export const OledPreset = definePreset(Aura, {
  semantic: {
    primary: PRIMARY,
    colorScheme: {
      dark: {
        surface: {
          0: '#FFFFFF', 50: '#F5F5F5', 100: '#E5E5E5', 200: '#AAAAAA',
          300: '#888888', 400: '#666666', 500: '#444444', 600: '#2A2A2A',
          700: '#1A1A1A', 800: '#0D0D0D', 900: '#050505', 950: '#000000',
        },
      },
    },
  },
})

// ── Glass ─────────────────────────────────────────────────────────────────
export const GlassPreset = definePreset(Aura, {
  semantic: {
    primary: PRIMARY,
    colorScheme: {
      dark: {
        surface: {
          0: '#FFFFFF', 50: '#F5F5F5', 100: '#E5E5E5', 200: '#A0A0A0',
          300: '#737373', 400: '#555555', 500: '#404040', 600: '#333333',
          700: '#222222', 800: '#1A1A1A', 900: '#111111', 950: '#0A0A0A',
        },
      },
    },
  },
})

// ── Cyberpunk ─────────────────────────────────────────────────────────────
export const CyberpunkPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#E0FFFE', 100: '#B3FFFC', 200: '#80FFF9', 300: '#4DFFF6',
      400: '#1AFFF3', 500: '#00FFF0', 600: '#00CCC0', 700: '#009990',
      800: '#006660', 900: '#003330', 950: '#001A18',
    },
    colorScheme: {
      dark: {
        surface: {
          0: '#FFFFFF', 50: '#E0E0FF', 100: '#C0C0FF', 200: '#9090D0',
          300: '#6060A0', 400: '#404080', 500: '#2A2A60', 600: '#1A1A40',
          700: '#10102A', 800: '#0A0A1A', 900: '#05050F', 950: '#020208',
        },
      },
    },
  },
})

// ── High Contrast ─────────────────────────────────────────────────────────
export const HighContrastPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#FFFFFF', 100: '#FFFFFF', 200: '#FFFF00', 300: '#FFFF00',
      400: '#FFFF00', 500: '#FFFF00', 600: '#CCCC00', 700: '#999900',
      800: '#666600', 900: '#333300', 950: '#1A1A00',
    },
    colorScheme: {
      dark: {
        surface: {
          0: '#FFFFFF', 50: '#FFFFFF', 100: '#FFFFFF', 200: '#CCCCCC',
          300: '#AAAAAA', 400: '#888888', 500: '#555555', 600: '#333333',
          700: '#1A1A1A', 800: '#0D0D0D', 900: '#050505', 950: '#000000',
        },
      },
    },
  },
})

export const PRIMEVUE_PRESETS: Record<ResolvedThemeId, object> = {
  dark:           DarkPreset,
  light:          LightPreset,
  oled:           OledPreset,
  glass:          GlassPreset,
  cyberpunk:      CyberpunkPreset,
  'high-contrast': HighContrastPreset,
}
