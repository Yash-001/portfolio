export type ThemeId =
  | 'dark'
  | 'light'
  | 'oled'
  | 'glass'
  | 'cyberpunk'
  | 'high-contrast'
  | 'auto'

export type ResolvedThemeId = Exclude<ThemeId, 'auto'>

export interface ThemeConfig {
  id:            ThemeId
  labelKey:      string        // i18n key: common.theme.<id>
  icon:          string        // PrimeIcons class
  isDark:        boolean
  tailwindClass: string        // class applied to <html>
}
