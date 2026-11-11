// מפת נושאים לשתי המתכונות.
// status: common = משותף | old = ייחודי לישנה | new = ייחודי לחדשה | check = דורש בדיקה
// confidence: official = כותרות פרקים בשאלוני בגרות רשמיים (meyda) | secondary = אתר הוראה פרטי | unverified = לא אומת
// חשוב: מסמכי תוכנית הלימודים הרשמיים עצמם עדיין לא נקראו במלואם (האתרים של משרד החינוך חסומים ברשת של סביבת הפיתוח).
// כל סיווג שאינו official הוא זמני, וצריך לאמת אותו מול תוכנית הלימודים ודף ההבהרות של משרד החינוך.

export const SOURCES = {
  s581: { title: 'שאלון 035581, קיץ תשפ"ד – משרד החינוך', url: 'https://meyda.education.gov.il/sheeloney_bagrut/2024/6/HEB/35581.pdf', kind: 'official' },
  s582: { title: 'שאלון 035582, קיץ תשפ"ה – משרד החינוך', url: 'https://meyda.education.gov.il/sheeloney_bagrut/2025/6/HEB/35582.PDF', kind: 'official' },
  s571: { title: 'שאלון 035571, קיץ תשפ"ג – משרד החינוך', url: 'https://meyda.education.gov.il/sheeloney_bagrut/2023/6/HEB/35571.pdf', kind: 'official' },
  curr5: { title: 'תוכנית לימודים – מתמטיקה 5 יח"ל (מזכירות פדגוגית)', url: 'https://meyda.education.gov.il/files/Mazkirut_Pedagogit/matematika/mat_5u.pdf', kind: 'official' },
  newCurr: { title: 'תוכנית הלימודים החדשה – האתר הפדגוגי של משרד החינוך', url: 'https://pop.education.gov.il/tchumey_daat/matmatika/chativa-elyona/teaching-mathematics/new-curriculum/', kind: 'official' },
  mmath: { title: 'm-math – השוואת 581 ל-571 (אתר פרטי)', url: 'https://www.m-math.co.il/learn-math-5-new-2/', kind: 'secondary' },
  goren: { title: 'בני גורן – תוכנית הלימודים החדשה ל-5 יח"ל (אתר פרטי)', url: 'https://www.bennygoren.co.il/blog/%D7%AA%D7%95%D7%9B%D7%A0%D7%99%D7%AA-%D7%94%D7%9C%D7%99%D7%9E%D7%95%D7%93%D7%99%D7%9D-%D7%94%D7%97%D7%93%D7%A9%D7%94-%D7%9C-5-%D7%99%D7%97%D7%B4%D7%9C/', kind: 'secondary' },
  openbook: { title: 'Openbook – קורס 35572 (אתר פרטי)', url: 'https://openbook.co.il/OnlineCourse/85', kind: 'secondary' },
  melumad: { title: 'מלומד – תוכנית ישנה או חדשה (אתר פרטי)', url: 'https://www.melumad.co.il/5-%D7%91%D7%97%D7%A8%D7%95-%D7%AA%D7%9B%D7%A0%D7%99%D7%AA/', kind: 'secondary' },
};

export const EXAMS = {
  old: {
    name: 'המתכונת הישנה',
    papers: [
      { code: '035581', weight: 60, structure: '3 פרקים, 8 שאלות. פרק א: 2 מתוך 3 (40 נק׳). פרק ב: 1 מתוך 2 (20 נק׳). פרק ג: 2 מתוך 3 (40 נק׳).', confidence: 'official', src: ['s581'] },
      { code: '035582', weight: 40, structure: '2 פרקים, 5 שאלות. עונים על 3, לפחות אחת מכל פרק (כ-33⅓ נק׳ לשאלה).', confidence: 'official', src: ['s582'] },
    ],
  },
  new: {
    name: 'המתכונת החדשה',
    papers: [
      { code: '035571', weight: 60, structure: 'פרק שאלות קצרות (3 מתוך 4) ועוד שלושה פרקים: הסתברות, סדרות ואינדוקציה; גאומטריה וטריגונומטריה (1 מתוך 2); חדו"א (1 מתוך 2). המשקל 60% לפי מקור משני.', confidence: 'secondary', src: ['s571', 'mmath'] },
      { code: '035572', weight: 40, structure: 'פרק א: גאומטריה אנליטית, וקטורים. פרק ב: חדו"א של פונקציות מעריכיות ולוגריתמיות. החלוקה המדויקת לא אומתה.', confidence: 'secondary', src: ['openbook'] },
    ],
  },
};

// כל נושא: באיזה שאלון הוא בכל מתכונת (null = לא נכלל / לא ידוע)
export const TOPICS = [
  // ---- שאלון ראשון (581 / 571) ----
  { id: 'word-problems', name: 'בעיות מילוליות: תנועה, הספק, קנייה ומכירה', old: '035581', new: null, status: 'old', confidence: 'secondary', src: ['s581', 'mmath'],
    note: 'לפי m-math, שאלה 1 ב-581 הוקדשה לנושא, ובשאלון 571 הוחלפה בשאלות קצרות. דורש אימות מול תוכנית הלימודים.' },
  { id: 'sequences', name: 'סדרות: חשבונית, הנדסית, נסיגה', old: '035581', new: '035571', status: 'common', confidence: 'official', src: ['s581', 's571'], lessons: ['arithmetic-sequence'],
    note: 'מופיע בכותרות הפרקים של שני השאלונים. לפי מקור משני, בחדשה הדגש פחות טכני ויותר רעיוני.' },
  { id: 'probability', name: 'הסתברות: מותנית, דיאגרמת עץ, התפלגות בינומית', old: '035581', new: '035571', status: 'common', confidence: 'official', src: ['s581', 's571'] },
  { id: 'induction', name: 'אינדוקציה מתמטית', old: null, new: '035571', status: 'new', confidence: 'official', src: ['s571', 'goren'],
    note: 'מופיע בכותרת פרק ב של 571. לא מופיע בכותרות 581.' },
  { id: 'plane-geometry', name: 'גאומטריה במישור: מעגל, דמיון, משולשים', old: '035581', new: '035571', status: 'common', confidence: 'official', src: ['s581', 's571'] },
  { id: 'plane-trig', name: 'טריגונומטריה במישור: משפט הסינוסים והקוסינוסים', old: '035581', new: '035571', status: 'common', confidence: 'official', src: ['s581', 's571'], lessons: ['sine-cosine-law'] },
  { id: 'calc-poly', name: 'חדו"א: פולינומים – נגזרת, משיק, קיצון', old: '035581', new: '035571', status: 'common', confidence: 'official', src: ['s581', 's571'], lessons: ['derivative-extrema'] },
  { id: 'calc-rational-root', name: 'חדו"א: פונקציות רציונליות ופונקציות שורש', old: '035581', new: '035571', status: 'check', confidence: 'secondary', src: ['s581', 'mmath'],
    note: 'מופיע בוודאות ב-581. לפי m-math שאלות 3–8 דומות ב-571, אבל רשימת סוגי הפונקציות ב-571 עוד לא אומתה.' },
  { id: 'calc-trig', name: 'חדו"א: פונקציות טריגונומטריות', old: '035581', new: '035571', status: 'check', confidence: 'secondary', src: ['s581', 'mmath'], note: 'כמו בשורה הקודמת.' },
  { id: 'integrals', name: 'אינטגרלים ושטחים', old: '035581', new: '035571', status: 'common', confidence: 'secondary', src: ['s581', 'goren'] },
  { id: 'accum-integral', name: 'האינטגרל כפונקציה צוברת שטח', old: null, new: '035571', status: 'check', confidence: 'secondary', src: ['goren'], note: 'מקור משני מציין שנוסף לחדשה. לא ברור אם הופיע גם בישנה.' },
  { id: 'pre-analysis', name: 'קדם-אנליזה: תכונות גרפיות וטרנספורמציות של פונקציות', old: null, new: '035571', status: 'new', confidence: 'secondary', src: ['goren'] },
  { id: 'short-questions', name: 'שאלות קצרות מכל החומר (מבנה, לא נושא)', old: null, new: '035571', status: 'new', confidence: 'official', src: ['s571', 'mmath'] },
  // ---- שאלון שני (582 / 572) ----
  { id: 'analytic', name: 'גאומטריה אנליטית: ישר, מעגל, מקומות גאומטריים', old: '035582', new: '035572', status: 'common', confidence: 'secondary', src: ['s582', 'openbook'] },
  { id: 'conics', name: 'חתכי חרוט: פרבולה, אליפסה', old: '035582', new: '035572', status: 'check', confidence: 'unverified', src: ['s582'], note: 'רשימת חתכי החרוט בכל מתכונת טרם אומתה.' },
  { id: 'hyperbola', name: 'היפרבולה', old: null, new: '035572', status: 'new', confidence: 'secondary', src: ['goren'] },
  { id: 'vectors', name: 'וקטורים במרחב: ישרים ומישורים', old: '035582', new: '035572', status: 'common', confidence: 'secondary', src: ['s582', 'openbook'] },
  { id: 'space-trig', name: 'טריגונומטריה במרחב', old: '035582', new: '035572', status: 'check', confidence: 'secondary', src: ['s582', 'openbook'], note: 'מופיע בכותרת 582. לגבי 572 המקורות סותרים.' },
  { id: 'complex', name: 'מספרים מרוכבים', old: '035582', new: '035572', status: 'check', confidence: 'secondary', src: ['s582', 'openbook'], note: 'מופיע בכותרת 582. לגבי 572 המקורות סותרים: אותו אתר גם כולל וגם מוציא את הנושא.' },
  { id: 'growth', name: 'גדילה ודעיכה', old: '035582', new: null, status: 'check', confidence: 'official', src: ['s582'], note: 'מופיע בכותרת 582. לא נמצא מידע על 572.' },
  { id: 'power-func', name: 'פונקציות חזקה עם מעריך רציונלי', old: '035582', new: null, status: 'check', confidence: 'official', src: ['s582'], note: 'מופיע בכותרת 582. לא נמצא מידע על 572.' },
  { id: 'exp-log', name: 'חדו"א: פונקציות מעריכיות ולוגריתמיות', old: '035582', new: '035572', status: 'common', confidence: 'secondary', src: ['s582', 'openbook'] },
  { id: 'solids', name: 'גופים: גליל, חרוט, כדור', old: null, new: null, status: 'check', confidence: 'unverified', src: ['openbook'], note: 'לפי Openbook לא יופיע ב-572. לא נבדק לגבי 582.' },
];

export const STATUS = {
  common: { label: 'משותף', cls: 'b-common' },
  old: { label: 'ייחודי לישנה', cls: 'b-old' },
  new: { label: 'ייחודי לחדשה', cls: 'b-new' },
  check: { label: 'דורש בדיקה', cls: 'b-check' },
};

export const CONFIDENCE = {
  official: 'מקור: כותרות שאלון רשמי',
  secondary: 'מקור משני, ממתין לאימות',
  unverified: 'לא אומת',
};
