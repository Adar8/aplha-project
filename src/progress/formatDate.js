const formatter = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })

export function formatDate(iso) {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : formatter.format(date)
}
