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

export async function loadLocale(locale: LocaleCode): Promise<void> {
  if (locale === 'en') return  // en is bundled at startup, always current
  const messages = await import(`./locales/${locale}/index`)
  ;((i18n.global as unknown) as { setLocaleMessage: (locale: string, messages: LocaleMessages<VueMessageType>) => void }).setLocaleMessage(locale, messages.default as LocaleMessages<VueMessageType>)
}
