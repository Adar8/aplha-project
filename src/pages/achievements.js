// הישגים בלוח הבקרה. כל הישג מחושב מהנתונים של המשתמש בדפדפן, בלי נקודות או מספרים מומצאים.
export function buildAchievements({ lessons, progress, profile, transactions }) {
  const done = lessons.filter((m) => progress[m.id]).length
  const half = Math.ceil(lessons.length / 2)
  return [
    { id: 'first', title: 'צעד ראשון', rule: 'השלמת מודול אחד', earned: done >= 1 },
    { id: 'path', title: 'מסלול אישי', rule: 'מילוי שאלון ההתאמה', earned: Boolean(profile?.answers) },
    {
      id: 'placement',
      title: 'מבחן מיקום',
      rule: 'מענה על מבחן המיקום',
      earned: Object.keys(profile?.placement ?? {}).length > 0,
    },
    { id: 'half', title: 'חצי הדרך', rule: `השלמת ${half} מודולים`, earned: done >= half },
    { id: 'portfolio', title: 'תיק ראשון', rule: 'הזנת עסקה ב״התיק שלי״', earned: transactions.length > 0 },
    { id: 'all', title: 'כל המודולים', rule: `השלמת כל ${lessons.length} המודולים`, earned: done === lessons.length },
  ]
}
