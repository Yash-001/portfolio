// scripts/export-knowledge.ts
// Exports portfolio knowledge as JSON to the ai-service.
// Run via: npx vite-node scripts/export-knowledge.ts
// Called automatically by `npm run dev` and `npm run build`.

import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildKnowledge } from '@/services/ai/knowledge/knowledge.builder'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT = resolve(__dirname, '../../ai-service/app/knowledge/portfolio_data.json')

mkdirSync(dirname(OUTPUT), { recursive: true })
writeFileSync(OUTPUT, JSON.stringify(buildKnowledge(), null, 2), 'utf-8')
console.log('[knowledge-export] Written:', OUTPUT)
