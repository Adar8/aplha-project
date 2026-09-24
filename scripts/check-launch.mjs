// בדיקה לפני עלייה לאוויר: npm run check:launch
// נכשלת אם חסרים פרטים אמיתיים, קבצים חובה, או אזכור לבינה מלאכותית בתוכן האתר.
import fs from 'node:fs'
import path from 'node:path'
import { SITE, missingSiteFields } from '../src/data/site.js'

const root = path.resolve(import.meta.dirname, '..')
const problems = []

for (const field of missingSiteFields(SITE)) problems.push(`src/data/site.js: חסר ערך ל-${field}`)

const required = [
  'public/favicon.svg',
  'public/favicon.ico',
  'public/apple-touch-icon.png',
  'public/icon-192.png',
  'public/icon-512.png',
  'public/site.webmanifest',
  'src/legal/PrivacyPage.jsx',
  'src/legal/TermsPage.jsx',
  'src/legal/AccessibilityPage.jsx',
]
for (const file of required) if (!fs.existsSync(path.join(root, file))) problems.push(`חסר קובץ: ${file}`)

const app = fs.readFileSync(path.join(root, 'src/App.jsx'), 'utf8')
for (const route of ['/privacy', '/terms', '/accessibility']) {
  if (!app.includes(`path="${route}"`)) problems.push(`אין route ל-${route}`)
}

// אזכורים לבינה מלאכותית בקבצים שמגיעים לגולש
const AI_PATTERN = /\bAI\b|בינה מלאכותית|Claude|ChatGPT|OpenAI|Anthropic|Copilot|Gemini|generated (by|with)/i
const scan = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) scan(full)
    else if (/\.(jsx?|css|html|json|webmanifest|svg|txt)$/.test(entry.name)) {
      fs.readFileSync(full, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (AI_PATTERN.test(line)) problems.push(`אזכור AI: ${path.relative(root, full)}:${i + 1}`)
        })
    }
  }
}
scan(path.join(root, 'src'))
scan(path.join(root, 'public'))
if (AI_PATTERN.test(fs.readFileSync(path.join(root, 'index.html'), 'utf8'))) problems.push('אזכור AI: index.html')

if (problems.length) {
  console.error(`לא מוכן לעלייה לאוויר (${problems.length}):\n- ${problems.join('\n- ')}`)
  process.exit(1)
}
console.log('מוכן לעלייה לאוויר: כל הפרטים מולאו, הקבצים קיימים ואין אזכורי AI.')
