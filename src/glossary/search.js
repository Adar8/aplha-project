// חיפוש במילון: נרמול עברית + אנגלית, דירוג תוצאות וסימון התאמות.
// פונקציות טהורות — אין כאן React.

const FINAL_LETTERS = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' }
const REMOVED = /[֑-ׇ"'׳״`’‘“”/.]/ // ניקוד, גרשיים, גרש, לוכסן ונקודה — נמחקים
const SPACE_LIKE = /[\s\-־–—,()]/ // מקף, מקף עברי, פסיקים וסוגריים — הופכים לרווח

/**
 * מנרמל טקסט לחיפוש ושומר מיפוי לאינדקסים המקוריים, כדי שנוכל לסמן התאמות.
 * "אג״ח" → "אגח", "P/E" → "pe", "מחיר-זמן" → "מחיר זמנ"
 */
export function normalizeWithMap(text) {
  let norm = ''
  const map = []
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (REMOVED.test(ch)) continue
    if (SPACE_LIKE.test(ch)) {
      if (norm && norm[norm.length - 1] !== ' ') {
        norm += ' '
        map.push(i)
      }
      continue
    }
    norm += FINAL_LETTERS[ch] ?? ch.toLowerCase()
    map.push(i)
  }
  if (norm.endsWith(' ')) {
    norm = norm.slice(0, -1)
    map.pop()
  }
  return { norm, map }
}

export const normalize = (text) => normalizeWithMap(text).norm

/** מילות החיפוש, כולל גרסה בלי ה״א הידיעה / וי״ו החיבור בתחילת מילה ("המרווח" → "מרווח") */
function tokenize(query) {
  return normalize(query)
    .split(' ')
    .filter(Boolean)
    .map((token) => {
      const variants = [token]
      if (token.length > 3 && /^[הו]/.test(token)) variants.push(token.slice(1))
      return variants
    })
}

function indexTerm(term) {
  const names = [term.he, term.en, ...(term.aliases ?? [])].map(normalize)
  return {
    names,
    namesText: names.join(' | '),
    body: normalize(`${term.definition} ${term.example ?? ''}`),
  }
}

/**
 * מחפש מונחים. כל מילה בשאילתה חייבת להופיע בשם, בשם הנוסף או בהגדרה.
 * דירוג: 0 = שם זהה, 1 = שם שמתחיל בשאילתה, 2 = כל המילים בשם, 3 = התאמה בהגדרה.
 * @returns מונחים ממוינים לפי דירוג ואז לפי א״ב
 */
export function searchTerms(terms, query) {
  const tokens = tokenize(query)
  if (!tokens.length) return terms

  const full = normalize(query)
  const results = []
  for (const term of terms) {
    const idx = indexTerm(term)
    const inNames = (variants) => variants.some((v) => idx.namesText.includes(v))
    const inBody = (variants) => variants.some((v) => idx.body.includes(v))
    if (!tokens.every((variants) => inNames(variants) || inBody(variants))) continue

    let rank = 3
    if (idx.names.includes(full)) rank = 0
    else if (idx.names.some((n) => n.startsWith(full))) rank = 1
    else if (tokens.every(inNames)) rank = 2
    results.push({ term, rank })
  }

  return results
    .sort((a, b) => a.rank - b.rank || a.term.he.localeCompare(b.term.he, 'he'))
    .map((r) => r.term)
}

/**
 * טווחי התאמה בטקסט המקורי, לסימון עם <mark>.
 * @returns [[start, end], ...] ממוינים ולא חופפים
 */
export function matchRanges(text, query) {
  const tokens = tokenize(query)
  if (!tokens.length || !text) return []
  const { norm, map } = normalizeWithMap(text)

  const ranges = []
  for (const variants of tokens) {
    for (const token of variants) {
      let from = 0
      let at
      while ((at = norm.indexOf(token, from)) !== -1) {
        ranges.push([map[at], map[at + token.length - 1] + 1])
        from = at + token.length
      }
    }
  }

  ranges.sort((a, b) => a[0] - b[0])
  const merged = []
  for (const r of ranges) {
    const last = merged[merged.length - 1]
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1])
    else merged.push([...r])
  }
  return merged
}

/** האות הראשונה לקיבוץ לפי א״ב. מונחים שמתחילים באנגלית מקובצים תחת "A–Z" */
export function firstLetter(term) {
  const ch = term.he[0]
  return /[א-ת]/.test(ch) ? (FINAL_LETTERS[ch] ?? ch) : 'A–Z'
}
