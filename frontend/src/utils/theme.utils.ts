import type { ThemeId, ResolvedThemeId } from '@/types/theme.types'
import { THEMES, THEME_STORAGE_KEY } from '@/constants/theme.constants'

const VALID_THEMES = new Set<ThemeId>(
  Object.keys(THEMES) as ThemeId[]
)

export function persistTheme(id: ThemeId): void {
  try { localStorage.setItem(THEME_STORAGE_KEY, id) } catch { /* SSR / private */ }
}

export function getPersistedTheme(): ThemeId | null {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null
    return v && VALID_THEMES.has(v) ? v : null
  } catch { return null }
}

export function resolveAutoTheme(): ResolvedThemeId {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Apply data-theme attribute + Tailwind classes to <html>. */
export function applyThemeToDom(resolvedId: ResolvedThemeId): void {
  const html = document.documentElement
  const config = THEMES[resolvedId]

  // Remove all theme classes
  html.classList.remove(
    'dark',
    'theme-light',
    'theme-oled',
    'theme-glass',
    'theme-cyberpunk',
    'theme-high-contrast',
  )

  // Apply new classes
  config.tailwindClass.split(' ').filter(Boolean).forEach((c) => html.classList.add(c))

  // data-theme drives CSS custom properties
  html.setAttribute('data-theme', resolvedId)

  // color-scheme for native browser UI (scrollbars, inputs)
  html.style.colorScheme = config.isDark ? 'dark' : 'light'
}
