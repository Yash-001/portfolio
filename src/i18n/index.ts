import { createI18n } from 'vue-i18n'
import type { LocaleCode } from '@/types/i18n.types'
import en from './locales/en/index'

export const i18n = createI18n({
  legacy:         false,
  locale:         'en' as LocaleCode,
  fallbackLocale: 'en',
  messages:       { en } as Record<string, any>,
  missingWarn:    false,
  fallbackWarn:   false,
})

export type I18nInstance = typeof i18n

const loaded = new Set<LocaleCode>(['en'])

export async function loadLocale(locale: LocaleCode): Promise<void> {
  if (loaded.has(locale)) return
  const messages = await import(/* @vite-ignore */ `./locales/${locale}/index.ts`)
  ;(i18n.global as any).setLocaleMessage(locale, messages.default)
  loaded.add(locale)
}
