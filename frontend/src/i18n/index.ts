import { createI18n, type LocaleMessages, type VueMessageType } from 'vue-i18n'
import type { LocaleCode } from '@/types/i18n.types'
import en from './locales/en/index'

export const i18n = createI18n({
  legacy:         false,
  locale:         'en' as LocaleCode,
  fallbackLocale: 'en',
  messages:       { en } as unknown as Record<string, LocaleMessages<VueMessageType>>,
  missingWarn:    false,
  fallbackWarn:   false,
})

export type I18nInstance = typeof i18n

const loaded = new Set<LocaleCode>(['en'])

export async function loadLocale(locale: LocaleCode): Promise<void> {
  if (loaded.has(locale)) return
  const messages = await import(/* @vite-ignore */ `./locales/${locale}/index.ts`)
  ;((i18n.global as unknown) as { setLocaleMessage: (locale: string, messages: LocaleMessages<VueMessageType>) => void }).setLocaleMessage(locale, messages.default as LocaleMessages<VueMessageType>)
  loaded.add(locale)
}
