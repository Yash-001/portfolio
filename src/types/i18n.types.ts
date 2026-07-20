export type LocaleCode = 'en' | 'hi' | 'de' | 'fr' | 'ja' | 'ru'

export interface LocaleConfig {
  code:       LocaleCode
  label:      string
  labelEn:    string
  dir:        'ltr' | 'rtl'
  dateLocale: string
  flag:       string
}

export const LOCALES: LocaleConfig[] = [
  { code: 'en', label: 'English',  labelEn: 'English',  dir: 'ltr', dateLocale: 'en-US', flag: '🇺🇸' },
  { code: 'hi', label: 'हिन्दी',   labelEn: 'Hindi',    dir: 'ltr', dateLocale: 'hi-IN', flag: '🇮🇳' },
  { code: 'de', label: 'Deutsch',  labelEn: 'German',   dir: 'ltr', dateLocale: 'de-DE', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', labelEn: 'French',   dir: 'ltr', dateLocale: 'fr-FR', flag: '🇫🇷' },
  { code: 'ja', label: '日本語',   labelEn: 'Japanese', dir: 'ltr', dateLocale: 'ja-JP', flag: '🇯🇵' },
  { code: 'ru', label: 'Русский',  labelEn: 'Russian',  dir: 'ltr', dateLocale: 'ru-RU', flag: '🇷🇺' },
]
