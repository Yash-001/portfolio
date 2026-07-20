import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { i18n, loadLocale } from '@/i18n'
import { LOCALES, type LocaleCode } from '@/types/i18n.types'
import { persistLocale, getPersistedLocale, detectBrowserLocale, applyRtl } from '@/i18n/utils/locale'

export function useLocale() {
  const { t, tm, locale } = useI18n()

  const currentLocale = computed(() => LOCALES.find((l) => l.code === locale.value) ?? LOCALES[0])

  async function setLocale(code: LocaleCode): Promise<void> {
    await loadLocale(code)
    const g = i18n.global as any
    g.locale.value = code
    persistLocale(code)
    applyRtl(code)
  }

  async function initLocale(): Promise<void> {
    const target = getPersistedLocale() ?? detectBrowserLocale() ?? 'en'
    await setLocale(target)
  }

  return { t, tm, locale, currentLocale, setLocale, initLocale, locales: LOCALES }
}
