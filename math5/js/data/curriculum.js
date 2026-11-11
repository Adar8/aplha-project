// מפת נושאים לשתי המתכונות – עודכן 11.11.2026 אחרי קריאה ישירה של מסמכי משרד החינוך.
// status: common = משותף | old = ייחודי לישנה | new = ייחודי לחדשה | check = דורש בדיקה
// confidence:
//   official        = מופיע במסמך רשמי של משרד החינוך (קישור במקורות)
//   official-varies = רשמי, אבל שני מקורות רשמיים לא מסכימים (למשל מבנה שהשתנה בין שנים)
//   secondary       = רק מאתר הוראה פרטי
//   unverified      = לא אומת
// חשוב: "רשמי" כאן מבוסס בעיקר על כותרות הפרקים בשאלוני בגרות ועל דף "מבנה בחינות בגרות" באתר הפדגוגי.
// תוכניות הלימודים המפורטות (yod5, yodalef5, yodbet5) ודף "מיקוד הלמידה" עוד לא נקראו סעיף אחר סעיף.

export const VERIFIED_ON = '11.11.2026';

export const SOURCES = {
  s581: { title: 'שאלון 035581, קיץ תשפ"ד (2024) – משרד החינוך', url: 'https://meyda.education.gov.il/sheeloney_bagrut/2024/6/HEB/35581.pdf', kind: 'official' },
  s582: { title: 'שאלון 035582, קיץ תשפ"ה (2025) – משרד החינוך', url: 'https://meyda.education.gov.il/sheeloney_bagrut/2025/6/HEB/35582.PDF', kind: 'official' },
  s571: { title: 'שאלון 035571, קיץ תשפ"ה (2025) – משרד החינוך', url: 'https://meyda.education.gov.il/sheeloney_bagrut/2025/6/HEB/35571.pdf', kind: 'official' },
  s572: { title: 'שאלון 035572, קיץ תשפ"ה (2025) – משרד החינוך', url: 'https://meyda.education.gov.il/sheeloney_bagrut/2025/6/HEB/35572.pdf', kind: 'official' },
  popStructure: { title: 'מבנה בחינות בגרות – תוכנית לימודים חדשה (האתר הפדגוגי)', url: 'https://pop.education.gov.il/tchumey_daat/matmatika/chativa-elyona/teaching-mathematics/new-curriculum/', kind: 'official' },
  currOld: { title: 'תוכנית לימודים מתמטיקה 5 יח"ל, 2015 (התוכנית הישנה)', url: 'https://meyda.education.gov.il/files/Mazkirut_Pedagogit/matematika/mat_5u.pdf', kind: 'official' },
  currNew10: { title: 'תוכנית הלימודים החדשה 5 יח"ל – כיתה י׳', url: 'https://meyda.education.gov.il/files/Mazkirut_Pedagogit/matematika/yod5.pdf', kind: 'official' },
  currNew11: { title: 'תוכנית הלימודים החדשה 5 יח"ל – כיתה י"א', url: 'https://meyda.education.gov.il/files/Mazkirut_Pedagogit/matematika/yodalef5.pdf', kind: 'official' },
  currNew12: { title: 'תוכנית הלימודים החדשה 5 יח"ל – כיתה י"ב', url: 'https://meyda.education.gov.il/files/Mazkirut_Pedagogit/matematika/yodbet5.pdf', kind: 'official' },
  mmath: { title: 'm-math – השוואת 581 ל-571 (אתר פרטי)', url: 'https://www.m-math.co.il/learn-math-5-new-2/', kind: 'secondary' },
  goren: { title: 'בני גורן – תוכנית הלימודים החדשה ל-5 יח"ל (אתר פרטי)', url: 'https://www.bennygoren.co.il/blog/%D7%AA%D7%95%D7%9B%D7%A0%D7%99%D7%AA-%D7%94%D7%9C%D7%99%D7%9E%D7%95%D7%93%D7%99%D7%9D-%D7%94%D7%97%D7%93%D7%A9%D7%94-%D7%9C-5-%D7%99%D7%97%D7%B4%D7%9C/', kind: 'secondary' },
  openbook: { title: 'Openbook – קורס 35572 (אתר פרטי)', url: 'https://openbook.co.il/OnlineCourse/85', kind: 'secondary' },
};

export const EXAMS = {
  old: {
    name: 'המתכונת הישנה',
    papers: [
      { code: '035581', weight: 60, structure: '3 פרקים, 8 שאלות. פרק א – אלגברה והסתברות: 2 מתוך 3 (40 נק׳). פרק ב – גאומטריה וטריגונומטריה במישור: 1 מתוך 2 (20 נק׳). פרק ג – חדו"א של פולינומים, שורש, רציונליות וטריגונומטריות: 2 מתוך 3 (40 נק׳).', confidence: 'official', src: ['s581'] },
      { code: '035582', weight: 40, structure: '2 פרקים, 5 שאלות. פרק א – גאומטריה אנליטית, וקטורים, טריגונומטריה במרחב, מספרים מרוכבים. פרק ב – גדילה ודעיכה, פונקציות חזקה, מעריכיות ולוגריתמיות. עונים על 3, לפחות אחת מכל פרק.', confidence: 'official', src: ['s582'] },
    ],
  },
  new: {
    name: 'המתכונת החדשה',
    papers: [
      { code: '035571', weight: 60,
        structure: 'פרק 1 – שאלות קצרות. פרק 2 – אינדוקציה, סדרות והסתברות. פרק 3 – גאומטריה וטריגונומטריה במישור. פרק 4 – חדו"א של פולינומים, שורש, רציונליות וטריגונומטריות. 20 נק׳ לשאלה.',
        versions: [
          { label: 'שאלון קיץ 2025', text: 'עונים על 5 מתוך 8: לפחות אחת מפרק 1 או 2, ולפחות אחת מכל אחד מפרקים 3 ו-4. בפרק השאלות הקצרות עונים על 2 מתוך 4 סעיפים. 4 שעות ורבע.', src: 's571' },
          { label: 'האתר הפדגוגי (עדכני)', text: 'שאלות קצרות – חובה, 3 מתוך 4 סעיפים. פרק 2: 1 מתוך 2. פרק 3: 1 מתוך 2. פרק 4: 2 מתוך 3. 3 שעות ו-45 דקות.', src: 'popStructure' },
        ],
        confidence: 'official-varies', src: ['s571', 'popStructure'] },
      { code: '035572', weight: 40,
        structure: 'פרק 1 – גאומטריה אנליטית, וקטורים (כולל טריגונומטריה במרחב), מספרים מרוכבים. פרק 2 – פונקציות מעריכיות ולוגריתמיות. 33⅓ נק׳ לשאלה.',
        versions: [
          { label: 'שאלון קיץ 2025', text: 'עונים על 3 מתוך 5, לפחות אחת מכל פרק. פרק 2 כולל גם גדילה ודעיכה. שעתיים ו-45 דקות.', src: 's572' },
          { label: 'האתר הפדגוגי (עדכני)', text: 'פרק 1: 2 מתוך 3. פרק 2 ("חדו"א של פונקציות מעריכיות ולוגריתמיות"): 1 מתוך 2. שעתיים וחצי.', src: 'popStructure' },
        ],
        confidence: 'official-varies', src: ['s572', 'popStructure'] },
    ],
  },
  weightsNote: 'משקל 60/40 רשמי: מופיע בשאלוני הבגרות ובדף מבנה הבחינות באתר הפדגוגי.',
  openQuestions: [
    'איזה מבנה בחינה יחול בקיץ 2027: זה של שאלון 2025 או זה שבאתר הפדגוגי?',
    'מה כולל "מיקוד הלמידה" לשנת הבחינה (אם יש צמצום חומר)?',
    'האם נבחן חיצוני שנבחן ב-581/582 יכול להיבחן שוב במתכונת הישנה ב-2027, והאם אפשר לשלב ציון ישן עם חדש? רק משרד החינוך יכול להכריע.',
  ],
};

export const TOPICS = [
  // ---- שאלון ראשון (581 / 571) ----
  { id: 'word-problems', name: 'בעיות מילוליות: תנועה, הספק, קנייה ומכירה', old: '035581', new: null, status: 'old', confidence: 'secondary', src: ['s581', 'mmath'],
    note: 'בשאלון 571 אין פרק אלגברה, ולפי m-math שאלת הבעיה המילולית הוחלפה בשאלות קצרות. לא נמצא מסמך רשמי שאומר זאת במפורש.' },
  { id: 'sequences', name: 'סדרות: חשבונית, הנדסית, נסיגה', old: '035581', new: '035571', status: 'common', confidence: 'official', src: ['s581', 's571', 'popStructure'], lessons: ['arithmetic-sequence'] },
  { id: 'probability', name: 'הסתברות: מותנית, דיאגרמת עץ, התפלגות בינומית', old: '035581', new: '035571', status: 'common', confidence: 'official', src: ['s581', 's571', 'popStructure'] },
  { id: 'induction', name: 'אינדוקציה מתמטית', old: null, new: '035571', status: 'new', confidence: 'official', src: ['s571', 'popStructure'], note: 'בכותרת פרק 2 של 571. לא מופיע בכותרות 581.' },
  { id: 'plane-geometry', name: 'גאומטריה במישור: מעגל, דמיון, משולשים', old: '035581', new: '035571', status: 'common', confidence: 'official', src: ['s581', 's571'] },
  { id: 'plane-trig', name: 'טריגונומטריה במישור: משפט הסינוסים והקוסינוסים', old: '035581', new: '035571', status: 'common', confidence: 'official', src: ['s581', 's571'], lessons: ['sine-cosine-law'] },
  { id: 'calc-poly', name: 'חדו"א: פולינומים – נגזרת, משיק, קיצון', old: '035581', new: '035571', status: 'common', confidence: 'official', src: ['s581', 's571'], lessons: ['derivative-extrema'] },
  { id: 'calc-rational-root', name: 'חדו"א: פונקציות רציונליות ופונקציות שורש', old: '035581', new: '035571', status: 'common', confidence: 'official', src: ['s581', 's571'], note: 'מופיע במפורש בכותרת פרק 4 של שאלון 571 (קיץ 2025).' },
  { id: 'calc-trig', name: 'חדו"א: פונקציות טריגונומטריות', old: '035581', new: '035571', status: 'common', confidence: 'official', src: ['s581', 's571'], note: 'מופיע במפורש בכותרת פרק 4 של שאלון 571 (קיץ 2025).' },
  { id: 'integrals', name: 'אינטגרלים ושטחים', old: '035581', new: '035571', status: 'common', confidence: 'official', src: ['s581', 's571'], note: 'כותרות שני השאלונים: "חשבון דיפרנציאלי ואינטגרלי".' },
  { id: 'accum-integral', name: 'האינטגרל כפונקציה צוברת שטח', old: null, new: '035571', status: 'check', confidence: 'secondary', src: ['goren'], note: 'רק מקור משני. צריך לבדוק בתוכנית הלימודים החדשה.' },
  { id: 'pre-analysis', name: 'קדם-אנליזה: תכונות גרפיות וטרנספורמציות של פונקציות', old: null, new: '035571', status: 'check', confidence: 'secondary', src: ['goren', 'currNew10'], note: 'רק מקור משני. צריך לבדוק בתוכנית הלימודים החדשה.' },
  { id: 'short-questions', name: 'שאלות קצרות מכל החומר (מבנה, לא נושא)', old: null, new: '035571', status: 'new', confidence: 'official-varies', src: ['s571', 'popStructure'], note: 'קיים בשני המקורות הרשמיים, אבל מספר הסעיפים שעונים עליהם שונה (2 מתוך 4 בשאלון 2025, 3 מתוך 4 באתר).' },
  // ---- שאלון שני (582 / 572) ----
  { id: 'analytic', name: 'גאומטריה אנליטית: ישר, מעגל, מקומות גאומטריים', old: '035582', new: '035572', status: 'common', confidence: 'official', src: ['s582', 's572', 'popStructure'] },
  { id: 'conics', name: 'חתכי חרוט: פרבולה, אליפסה', old: '035582', new: '035572', status: 'check', confidence: 'unverified', src: ['currOld', 'currNew12'], note: 'הכותרות אומרות "גאומטריה אנליטית" בלי פירוט. צריך לבדוק בתוכניות הלימודים.' },
  { id: 'hyperbola', name: 'היפרבולה', old: null, new: '035572', status: 'check', confidence: 'secondary', src: ['goren'], note: 'רק מקור משני.' },
  { id: 'vectors', name: 'וקטורים במרחב: ישרים ומישורים', old: '035582', new: '035572', status: 'common', confidence: 'official', src: ['s582', 's572', 'popStructure'] },
  { id: 'space-trig', name: 'טריגונומטריה במרחב', old: '035582', new: '035572', status: 'common', confidence: 'official', src: ['s582', 's572', 'popStructure'], note: 'בכותרת פרק 1 של 572 (קיץ 2025) ובאתר הפדגוגי ("וקטורים כולל טריגונומטריה במרחב").' },
  { id: 'complex', name: 'מספרים מרוכבים', old: '035582', new: '035572', status: 'common', confidence: 'official', src: ['s582', 's572', 'popStructure'], note: 'מקור משני טען שהנושא לא יופיע ב-572 – זה סותר את המקורות הרשמיים.' },
  { id: 'growth', name: 'גדילה ודעיכה', old: '035582', new: '035572', status: 'common', confidence: 'official-varies', src: ['s582', 's572', 'popStructure'], note: 'בכותרת פרק 2 של 572 בקיץ 2025, אבל לא בתיאור הפרק באתר הפדגוגי.' },
  { id: 'power-func', name: 'פונקציות חזקה עם מעריך רציונלי', old: '035582', new: null, status: 'check', confidence: 'official-varies', src: ['s582', 's572'], note: 'בכותרת 582, אבל לא בכותרת 572 (קיץ 2025). היעדר מכותרת אינו הוכחה שהנושא הוצא.' },
  { id: 'exp-log', name: 'חדו"א: פונקציות מעריכיות ולוגריתמיות', old: '035582', new: '035572', status: 'common', confidence: 'official', src: ['s582', 's572', 'popStructure'] },
  { id: 'solids', name: 'גופים: גליל, חרוט, כדור', old: null, new: null, status: 'check', confidence: 'unverified', src: ['openbook'], note: 'לא מופיע בכותרות השאלונים. לא נבדק בתוכניות הלימודים.' },
];

export const STATUS = {
  common: { label: 'משותף', cls: 'b-common' },
  old: { label: 'ייחודי לישנה', cls: 'b-old' },
  new: { label: 'ייחודי לחדשה', cls: 'b-new' },
  check: { label: 'דורש בדיקה', cls: 'b-check' },
};

export const CONFIDENCE = {
  official: 'רשמי מאומת',
  'official-varies': 'רשמי, משתנה בין מקורות',
  secondary: 'מקור משני, ממתין לאימות',
  unverified: 'לא אומת',
};
