// ─────────────────────────────────────────────────────────────────────────────
// src/composables/useResumeGenerator.ts
// Generates a resume from content layer data — zero hardcoded strings.
// ─────────────────────────────────────────────────────────────────────────────
import { NAME, TITLE, EMAIL, PHONE, LOCATION, GITHUB, LINKEDIN, RESUME_URL } from '@/content/settings/portfolio.config'
import { tracker, EVENTS } from '@/analytics'
import { EXPERIENCES } from '@/content/experience'
import { EDUCATION } from '@/content/education'
import { CERTIFICATIONS } from '@/content/certifications'
import { SKILL_GROUPS } from '@/content/skills'
import { PROJECTS } from '@/content/projects'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(date: string): string {
  if (date === 'present') return 'Present'
  const [year, month] = date.split('-')
  const d = new Date(Number(year), Number(month) - 1)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function featuredSkills(): string {
  return SKILL_GROUPS
    .map(g => {
      const names = g.skills
        .filter(s => s.featured)
        .map(s => s.name)
        .join(', ')
      return names ? `${g.label}: ${names}` : ''
    })
    .filter(Boolean)
    .join(' · ')
}

// ── HTML template ─────────────────────────────────────────────────────────────

function buildHtml(): string {
  const experienceHtml = EXPERIENCES
    .sort((a, b) => a.order - b.order)
    .map(exp => `
      <div class="entry">
        <div class="entry-header">
          <div>
            <span class="entry-title">${exp.role}</span>
            <span class="entry-sub"> — ${exp.company}</span>
          </div>
          <span class="entry-meta">${formatDate(exp.startDate)} – ${formatDate(exp.endDate)} · ${exp.location}</span>
        </div>
        <ul>
          ${exp.highlights.map(h => `<li>${h.text}</li>`).join('')}
        </ul>
        <div class="tags">${exp.tech.map(t => `<span>${t.name}</span>`).join('')}</div>
      </div>
    `).join('')

  const projectsHtml = PROJECTS
    .filter(p => p.featured)
    .sort((a, b) => a.order - b.order)
    .map(p => `
      <div class="entry">
        <div class="entry-header">
          <span class="entry-title">${p.title}</span>
          <span class="entry-meta">${p.year}${p.duration ? ` · ${p.duration}` : ''}</span>
        </div>
        <p>${p.tagline}</p>
        ${p.outcome ? `<p>${p.outcome}</p>` : ''}
        <div class="tags">${p.tech.map(t => `<span>${t.name}</span>`).join('')}</div>
      </div>
    `).join('')

  const educationHtml = EDUCATION.length
    ? EDUCATION.map(e => `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">${e.degree} in ${e.field}</span>
            <span class="entry-meta">${e.startYear} – ${e.endYear}</span>
          </div>
          <span class="entry-sub">${e.institution}, ${e.location}${e.grade ? ` · ${e.grade}` : ''}</span>
        </div>
      `).join('')
    : ''

  const certsHtml = CERTIFICATIONS.length
    ? `<section>
        <h2>Certifications</h2>
        ${CERTIFICATIONS.map(c => `
          <div class="entry">
            <div class="entry-header">
              <span class="entry-title">${c.name}</span>
              <span class="entry-meta">${formatDate(c.issuedDate)}${c.expiryDate ? ` – ${formatDate(c.expiryDate)}` : ''}</span>
            </div>
            <span class="entry-sub">${c.issuer}${c.credentialId ? ` · ID: ${c.credentialId}` : ''}</span>
          </div>
        `).join('')}
      </section>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${NAME} — Resume</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: #1a1a1a;
      padding: 32px 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { font-size: 22px; font-weight: 700; }
    h2 {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #4f46e5;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 3px;
      margin: 18px 0 10px;
    }
    .header { margin-bottom: 16px; }
    .header-title { font-size: 13px; color: #4b5563; margin: 2px 0 6px; }
    .contact { display: flex; flex-wrap: wrap; gap: 12px; font-size: 10px; color: #6b7280; }
    .contact a { color: #4f46e5; text-decoration: none; }
    .entry { margin-bottom: 12px; }
    .entry-header { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
    .entry-title { font-weight: 600; font-size: 11.5px; }
    .entry-sub { color: #6b7280; font-size: 10.5px; }
    .entry-meta { font-size: 10px; color: #9ca3af; white-space: nowrap; }
    ul { padding-left: 16px; margin: 4px 0; }
    li { margin-bottom: 2px; }
    p { margin: 3px 0; color: #374151; }
    .tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 5px; }
    .tags span {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 3px;
      padding: 1px 6px;
      font-size: 9.5px;
      color: #374151;
    }
    .skills-text { color: #374151; line-height: 1.7; }
    @media print {
      body { padding: 20px 28px; }
      @page { margin: 0.5cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${NAME}</h1>
    <div class="header-title">${TITLE}</div>
    <div class="contact">
      <span>${EMAIL}</span>
      <span>${PHONE}</span>
      <span>${LOCATION}</span>
      <a href="${GITHUB}">${GITHUB.replace('https://', '')}</a>
      <a href="${LINKEDIN}">${LINKEDIN.replace('https://www.', '')}</a>
    </div>
  </div>

  <section>
    <h2>Skills</h2>
    <div class="skills-text">${featuredSkills()}</div>
  </section>

  <section>
    <h2>Experience</h2>
    ${experienceHtml}
  </section>

  <section>
    <h2>Selected Projects</h2>
    ${projectsHtml}
  </section>

  ${educationHtml ? `<section><h2>Education</h2>${educationHtml}</section>` : ''}
  ${certsHtml}
</body>
</html>`
}

// ── Public API ────────────────────────────────────────────────────────────────

export function useResumeGenerator() {
  /** Open a print-ready resume in a new tab (browser Save as PDF). */
  function print(): void {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(buildHtml())
    win.document.close()
    win.focus()
    win.print()
  }

  /** Download the static resume.pdf if present, otherwise fall back to print. */
  function download(): void {
    tracker.track(EVENTS.RESUME_DOWNLOAD)
    if (RESUME_URL) {
      const a = document.createElement('a')
      a.href = RESUME_URL
      a.download = `${NAME.replace(/\s+/g, '_')}_Resume.pdf`
      a.click()
    } else {
      print()
    }
  }

  return { download, print }
}
