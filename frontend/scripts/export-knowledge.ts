// scripts/export-knowledge.ts
// Exports portfolio knowledge as JSON to the ai-service.
// Run via: npx vite-node scripts/export-knowledge.ts
// Called automatically by `npm run dev` and `npm run build`.

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildKnowledge } from '@/services/ai/knowledge/knowledge.builder'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT = resolve(__dirname, '../../ai-service/app/knowledge/portfolio_data.json')
const OUTPUT_DIR = dirname(OUTPUT)

// On Vercel (and other CI environments) the ai-service directory does not exist.
// Skip the write gracefully so the build is not blocked.
const AI_SERVICE_ROOT = resolve(__dirname, '../../ai-service')
if (!existsSync(AI_SERVICE_ROOT)) {
  process.stdout.write('[knowledge-export] ai-service not found — skipping (CI/Vercel environment)\n')
  process.exit(0)
}

mkdirSync(OUTPUT_DIR, { recursive: true })
writeFileSync(OUTPUT, JSON.stringify(buildKnowledge(), null, 2), 'utf-8')
process.stdout.write(`[knowledge-export] Written: ${OUTPUT}\n`)
