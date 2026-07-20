import type { LocaleCode } from '@/types/i18n.types'
import { LOCALES } from '@/types/i18n.types'

const SUPPORTED = LOCALES.map((l) => l.code)
const KEY = 'yr-locale'

export function persistLocale(code: LocaleCode): void {
  localStorage.setItem(KEY, code)
}

export function getPersistedLocale(): LocaleCode | null {
  const stored = localStorage.getItem(KEY)
  return stored && SUPPORTED.includes(stored as LocaleCode) ? (stored as LocaleCode) : null
}

export function detectBrowserLocale(): LocaleCode | null {
  const langs = navigator.languages ?? [navigator.language]
  for (const lang of langs) {
    const code = lang.split('-')[0] as LocaleCode
    if (SUPPORTED.includes(code)) return code
  }
  return null
}

export function applyRtl(code: LocaleCode): void {
  const config = LOCALES.find((l) => l.code === code)
  document.documentElement.setAttribute('dir',  config?.dir  ?? 'ltr')
  document.documentElement.setAttribute('lang', code)
}
