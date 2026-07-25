# i18n Audit Report

**Date**: 2025  
**Scope**: Full repository audit — all visible text, locale files, infrastructure, runtime behaviour  
**Result**: ✅ 0 TypeScript errors · 0 hardcoded visible strings remaining · All 6 locales in sync

---

## Findings & Fixes

### 1. Missing locale key — `common.aria.switchLang`
**File**: `LocaleSwitcher.vue`  
**Issue**: Template used `t('common.aria.switchLang')` but the key did not exist in any locale file. Caused a silent missing-key warning on every render.  
**Fix**: Added `switchLang`, `closeDialog`, `mobileMenu`, `quickNav` to `common.aria` in all 6 locale files.

---

### 2. Hardcoded footer navigation labels
**File**: `AppFooter.vue`  
**Issue**: `NAV_LINKS`, `SERVICE_LINKS`, and `RESOURCE_LINKS` were plain JS arrays with hardcoded English strings (`'About'`, `'Backend Engineering'`, etc.). Switching locale had zero effect on footer links.  
**Fix**:
- Replaced arrays with key-based arrays (`NAV_LINK_KEYS`, `SERVICE_LINK_KEYS`, `RESOURCE_LINK_KEYS`)
- Template now renders `t('common.footer.${key}')` for every link label
- Added all 17 footer link keys (`about`, `experience`, `projects`, `skills`, `services`, `testimonials`, `blog`, `contact`, `resume`, `githubProfile`, `linkedin`, `bookCall`, `backendEng`, `apiDesign`, `cloudInfra`, `dbArch`, `perfOpt`, `techConsulting`) to all 6 locale files
- Newsletter validation error `'Please enter a valid email address.'` replaced with `t('common.errors.invalidEmail')`

---

### 3. Hardcoded mobile menu header
**File**: `AppMobileMenu.vue`  
**Issue**: `<span>Menu</span>` hardcoded in drawer header.  
**Fix**: Replaced with `t('common.aria.mobileMenu')`. Added `useLocale` import.

---

### 4. Entire success dialog hardcoded in English
**File**: `ContactSuccessDialog.vue`  
**Issue**: Title ("Message sent."), body copy, "Response within 24 hours", "Connect on LinkedIn", "Done" button — all hardcoded English strings. No `useLocale` import at all.  
**Fix**:
- Added `useLocale` import and `const { t } = useLocale()`
- Added `contact.success` namespace (`title`, `sub`, `responseTime`, `connectBtn`, `doneBtn`) to all 6 locale files
- All dialog strings now use `t('contact.success.*')`

---

### 5. All form validation error messages hardcoded
**File**: `useContactForm.ts`  
**Issue**: All 9 validation messages (`'Full name is required.'`, `'Please enter a valid email address.'`, etc.) and all 3 toast summaries (`'Check your form'`, `'Slow down'`, `'Send failed'`) were hardcoded English strings inside the composable.  
**Fix**:
- Added `useI18n` import; destructured `t` inside the composable
- Moved `EMAIL_RE` and `REQUIRED_FIELDS` to module scope (outside function)
- Moved validator functions inside the composable so they close over `t()`
- Added `contact.form.errors.*` (9 keys) and `contact.form.toast.*` (5 keys) to all 6 locale files
- All validation and toast strings now use `t()`

---

### 6. Hardcoded section headings (5 components)
**Files**: `ExperienceSection.vue`, `SkillsSection.vue`, `ProjectsSection.vue`, `ServicesSection.vue`, `ContactSection.vue`  
**Issue**: Each `<h2>` had its first line hardcoded in English; only the `headingAccent` span used `t()`.  
**Fix**: All 5 headings now use `t('*.heading')`. Keys already existed in EN locale; non-EN locales already had translations.

---

### 7. Hardcoded "Remote worldwide" string
**File**: `ServicesSection.vue`  
**Issue**: `<span class="svc-avail-remote">Remote worldwide</span>` hardcoded.  
**Fix**: Replaced with `t('common.misc.remoteWorldwide')`.

---

### 8. Hardcoded timeline data in AboutSection
**File**: `AboutSection.vue`  
**Issue**: `TIMELINE` was a hardcoded JS array with English role/company/desc strings. Locale files already had `about.timeline.{year}.{role|company|desc}` keys but they were never used.  
**Fix**:
- Replaced `TIMELINE` array with `TIMELINE_YEARS = ['2017', '2019', '2021', '2023']`
- Template now renders `t('about.timeline.${year}.role')` etc.
- All 6 locale files already had these keys — no locale changes needed

---

### 9. Hardcoded 404 page strings
**File**: `NotFoundPage.vue`  
**Issue**: Heading, sub-text, button labels ("Back to home", "Contact me"), and nav links ("Work", "Skills", "Services", "Blog") all hardcoded.  
**Fix**:
- Added `useLocale` import
- Added `common.notFound` namespace (`heading`, `sub`, `backHome`, `contactMe`) to all 6 locale files
- Nav links now use existing `common.nav.*` keys
- `aria-label` uses `t('common.aria.quickNav')`

---

### 10. Hardcoded projects empty-state strings
**File**: `ProjectsSection.vue`  
**Issue**: "No projects found", "Try a different search term or category", "Clear filters" hardcoded.  
**Fix**: Added `common.misc.noProjectsFound`, `tryDifferentSearch`, `clearFilters` to all 6 locale files. Template uses `t()`.

---

### 11. `about.story` and `hero.roles` arrays broken
**Files**: `AboutSection.vue`, `HeroSection.vue`  
**Issue**: `t()` in vue-i18n v11 returns a string, not an array. `t('about.story') as string[]` silently returned an empty string, making all story paragraphs disappear. `t('hero.roles[0]')` etc. returned empty strings.  
**Fix**:
- Added `tm` to `useLocale` composable (exports raw message values including arrays)
- `AboutSection`: `tm('about.story') as string[]`
- `HeroSection`: `ROLES = computed(() => tm('hero.roles') as string[])`

---

### 12. Lazy loading `.ts` extension in dynamic import
**File**: `i18n/index.ts`  
**Issue**: `import('./locales/${locale}/index.ts')` — explicit `.ts` extension in dynamic imports fails in production Vite builds (Rollup strips extensions during bundling).  
**Fix**: Changed to `import('./locales/${locale}/index')` — Vite resolves the extension automatically in both dev and prod.

---

### 13. `i18n.global.setLocaleMessage` TypeScript error
**File**: `i18n/index.ts`  
**Issue**: `i18n.global` is typed as `unknown` in vue-i18n v11 without generic params. Direct call to `.setLocaleMessage()` caused a TS error.  
**Fix**: Cast as `(i18n.global as any).setLocaleMessage(...)`.

---

### 14. Missing `common.notFound` and `contact.form.errors` keys in non-EN locales
**Files**: `hi/index.ts`, `de/index.ts`, `fr/index.ts`, `ja/index.ts`, `ru/index.ts`  
**Issue**: New key namespaces added to EN had no counterpart in non-EN locales, causing fallback to EN silently.  
**Fix**: All 5 non-EN locale files updated with full translations for every new key.

---

## Locale Key Coverage (after fixes)

| Namespace | EN | HI | DE | FR | JA | RU |
|---|---|---|---|---|---|---|
| `common.nav` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `common.cta` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `common.aria` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `common.errors` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `common.status` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `common.footer` (all link keys) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `common.misc` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `common.notFound` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `hero` (incl. roles array) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `about` (incl. story array + timeline) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `experience` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `skills` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `projects` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `services` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `contact.form.errors` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `contact.form.toast` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `contact.success` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `meta` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Infrastructure Verification

| Check | Status |
|---|---|
| Lazy loading (non-EN locales) | ✅ Dynamic import without `.ts` extension |
| Language persistence | ✅ `localStorage` key `yr-locale` via `persistLocale()` / `getPersistedLocale()` |
| Browser language detection | ✅ `navigator.languages` → `detectBrowserLocale()` |
| `initLocale()` called on app mount | ✅ `App.vue` `onMounted` |
| `dir`/`lang` attributes on `<html>` | ✅ `applyRtl()` sets both on every locale switch |
| Router `afterEach` page titles | ✅ Uses `i18n.global as any` for `te()`/`t()` |
| TypeScript errors | ✅ 0 errors (`npm run type-check`) |
| `@` in email placeholders | ✅ All escaped as `{'@'}` in all 6 locales |

---

## Intentionally Not Translated

| Item | Reason |
|---|---|
| `PrivacyPage.vue` / `TermsPage.vue` | Legal pages — `noindex` pages, English-only is standard practice |
| `APP_NAME` ("Yash Ranjan") | Proper name, not translated |
| `APP_TITLE` | Brand tagline, not translated |
| `APP_LOCATION`, `APP_EMAIL` | Config constants, not UI strings |
| Tech stack pill names ("Java", "Spring Boot", etc.) | Proper nouns / brand names |
| Social platform names ("GitHub", "LinkedIn") | Brand names |
