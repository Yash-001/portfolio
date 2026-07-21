import type { ThemeConfig, ThemeId } from '@/types/theme.types'

export const THEMES: Record<ThemeId, ThemeConfig> = {
  dark: {
    id:            'dark',
    labelKey:      'common.theme.dark',
    icon:          'pi pi-moon',
    isDark:        true,
    tailwindClass: 'dark',
  },
  light: {
    id:            'light',
    labelKey:      'common.theme.light',
    icon:          'pi pi-sun',
    isDark:        false,
    tailwindClass: 'theme-light',
  },
  oled: {
    id:            'oled',
    labelKey:      'common.theme.oled',
    icon:          'pi pi-circle',
    isDark:        true,
    tailwindClass: 'dark theme-oled',
  },
  glass: {
    id:            'glass',
    labelKey:      'common.theme.glass',
    icon:          'pi pi-stop',
    isDark:        true,
    tailwindClass: 'dark theme-glass',
  },
  cyberpunk: {
    id:            'cyberpunk',
    labelKey:      'common.theme.cyberpunk',
    icon:          'pi pi-bolt',
    isDark:        true,
    tailwindClass: 'dark theme-cyberpunk',
  },
  'high-contrast': {
    id:            'high-contrast',
    labelKey:      'common.theme.highContrast',
    icon:          'pi pi-eye',
    isDark:        true,
    tailwindClass: 'dark theme-high-contrast',
  },
  auto: {
    id:            'auto',
    labelKey:      'common.theme.auto',
    icon:          'pi pi-desktop',
    isDark:        false, // resolved at runtime
    tailwindClass: '',    // resolved at runtime
  },
}

export const THEME_LIST = Object.values(THEMES)

export const THEME_STORAGE_KEY = 'yr-theme'
