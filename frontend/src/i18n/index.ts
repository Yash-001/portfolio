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

const localeModules = import.meta.glob('./locales/*/index.ts')

/** Recursively merge `source` into `target`, returning a new object.
 *  Keys present in `target` win; missing keys are filled from `source` (English). */
function deepMerge<T extends Record<string, unknown>>(target: T, source: T): T {
  const result = { ...source }
  for (const key of Object.keys(target) as (keyof T)[]) {
    const tv = target[key]
    const sv = source[key]
    if (tv && sv && typeof tv === 'object' && !Array.isArray(tv) && typeof sv === 'object' && !Array.isArray(sv)) {
      result[key] = deepMerge(tv as Record<string, unknown>, sv as Record<string, unknown>) as T[keyof T]
    } else {
      result[key] = tv
    }
  }
  return result as T
}

export async function loadLocale(locale: LocaleCode): Promise<void> {
  if (locale === 'en') return  // en is bundled at startup, always current
  const loader = localeModules[`./locales/${locale}/index.ts`]
  if (!loader) return
  const mod = await loader()
  const localeMessages = (mod as { default: Record<string, unknown> }).default
  const merged = deepMerge(localeMessages, en as unknown as Record<string, unknown>)
  ;((i18n.global as unknown) as { setLocaleMessage: (locale: string, messages: LocaleMessages<VueMessageType>) => void }).setLocaleMessage(locale, merged as LocaleMessages<VueMessageType>)
}
