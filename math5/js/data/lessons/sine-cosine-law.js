const m = String.raw;

export default {
  id: 'sine-cosine-law',
  title: 'משפט הסינוסים ומשפט הקוסינוסים',
  topic: 'plane-trig',
  papers: { old: '035581', new: '035571' },
  minutes: 60,
  summary: 'פתרון משולש כללי, רדיוס המעגל החוסם ושטח משולש.',

  explain: [
    { h: 'למה צריך את המשפטים האלה?', body: m`
      <p>במשולש ישר-זווית מספיקים סינוס, קוסינוס ופיתגורס. אבל רוב המשולשים בבגרות אינם ישרי-זווית. שני המשפטים האלה עובדים <b>בכל משולש</b>.</p>
      <p>סימון קבוע: הצלע $a$ נמצאת מול הזווית $\alpha$, הצלע $b$ מול $\beta$, והצלע $c$ מול $\gamma$.</p>` },
    { h: 'משפט הסינוסים', body: m`
      <div class="formula">$$\frac{a}{\sin\alpha} = \frac{b}{\sin\beta} = \frac{c}{\sin\gamma} = 2R$$</div>
      <p>$R$ הוא רדיוס המעגל החוסם את המשולש. משתמשים במשפט כשיודעים <b>זוג</b>: צלע והזווית שמולה.</p>
      <p class="callout">כשמחפשים זווית בעזרת משפט הסינוסים, יש שתי זוויות עם אותו סינוס: $\sin x = \sin(180^\circ - x)$. צריך לבדוק אם שתיהן אפשריות במשולש.</p>` },
    { h: 'משפט הקוסינוסים', body: m`
      <div class="formula">$$c^2 = a^2 + b^2 - 2ab\cos\gamma$$</div>
      <p>זה "פיתגורס עם תיקון". כש-$\gamma = 90^\circ$, $\cos\gamma = 0$ ומקבלים בדיוק את פיתגורס.</p>
      <p>משתמשים בו כשיודעים <b>שלוש צלעות</b>, או <b>שתי צלעות והזווית שביניהן</b>.</p>
      <p>הזווית הגדולה ביותר במשולש נמצאת מול הצלע הגדולה ביותר. אם $\cos\gamma<0$, הזווית קהה.</p>` },
    { h: 'שטח משולש', body: m`
      <div class="formula">$$S = \tfrac12\,a\,b\,\sin\gamma$$</div>
      <p>חצי מכפלת שתי צלעות בסינוס הזווית <b>שביניהן</b>.</p>` },
  ],

  video: {
    status: 'pending',
    note: 'עדיין לא נבחר סרטון ספציפי ולא נבדק שהוא מתאים. בינתיים יש קישורי חיפוש.',
    links: [
      { label: 'חיפוש ביוטיוב: משפט הסינוסים והקוסינוסים', url: 'https://www.youtube.com/results?search_query=%D7%9E%D7%A9%D7%A4%D7%98+%D7%94%D7%A1%D7%99%D7%A0%D7%95%D7%A1%D7%99%D7%9D+%D7%95%D7%94%D7%A7%D7%95%D7%A1%D7%99%D7%A0%D7%95%D7%A1%D7%99%D7%9D' },
      { label: 'קמפוס IL – קורסים חינמיים (חיפוש קורס מתמטיקה)', url: 'https://campus.gov.il/' },
    ],
  },

  examples: [
    { title: 'שתי צלעות והזווית שביניהן', problem: m`במשולש $b = 8$, $c = 5$ והזווית ביניהן $\alpha = 60^\circ$. מצא את $a$.`,
      steps: [
        m`יודעים שתי צלעות והזווית שביניהן: משפט הקוסינוסים.`,
        m`$a^2 = b^2 + c^2 - 2bc\cos\alpha = 64 + 25 - 2\cdot 8\cdot 5\cdot\cos 60^\circ$.`,
        m`$\cos 60^\circ = \tfrac12$, ולכן $a^2 = 89 - 40 = 49$.`,
        m`$a = 7$.`,
      ], answer: m`$a = 7$` },
    { title: 'צלע ושתי זוויות', problem: m`במשולש $a = 10$, $\alpha = 30^\circ$, $\beta = 45^\circ$. מצא את $b$ ואת רדיוס המעגל החוסם.`,
      steps: [
        m`יש זוג צלע-זווית ($a$, $\alpha$): משפט הסינוסים.`,
        m`$\frac{b}{\sin 45^\circ} = \frac{10}{\sin 30^\circ} \Rightarrow b = \frac{10\cdot\sin45^\circ}{\sin30^\circ} = \frac{10\cdot 0.7071}{0.5}$.`,
        m`$b \approx 14.14$ (בדיוק: $10\sqrt2$).`,
        m`$2R = \frac{a}{\sin\alpha} = \frac{10}{0.5} = 20 \Rightarrow R = 10$.`,
      ], answer: m`$b = 10\sqrt2 \approx 14.14$, $R = 10$` },
    { title: 'שלוש צלעות', problem: m`במשולש הצלעות 5, 7 ו-8. מצא את הזווית שמול הצלע 7 ואת שטח המשולש.`,
      steps: [
        m`יודעים שלוש צלעות: משפט הקוסינוסים, ומבודדים את הקוסינוס.`,
        m`$7^2 = 5^2 + 8^2 - 2\cdot 5\cdot 8\cos\gamma \Rightarrow 49 = 89 - 80\cos\gamma$.`,
        m`$\cos\gamma = \frac{40}{80} = \frac12 \Rightarrow \gamma = 60^\circ$.`,
        m`השטח, עם שתי הצלעות שסביב הזווית: $S = \tfrac12\cdot5\cdot8\cdot\sin60^\circ = 20\cdot\frac{\sqrt3}{2} = 10\sqrt3 \approx 17.32$.`,
      ], answer: m`$\gamma = 60^\circ$, $S = 10\sqrt3 \approx 17.32$` },
  ],

  guided: [
    { id: 'g1', type: 'num', prompt: m`במשולש $a = 3$, $b = 5$ והזווית ביניהן $\gamma = 120^\circ$. מהו $c$?`, answer: 7,
      hints: [m`שתי צלעות והזווית שביניהן – משפט הקוסינוסים.`, m`$\cos 120^\circ = -\tfrac12$. שים לב לסימן.`, m`$c^2 = 9 + 25 - 2\cdot3\cdot5\cdot(-\tfrac12) = 34 + 15$.`],
      wrong: [{ v: 4.36, tag: 'cos-sign' }], tol: 0.01,
      solution: m`$c^2 = 34 + 15 = 49 \Rightarrow c = 7$.` },
    { id: 'g2', type: 'num', prompt: m`במשולש $a = 6$ ו-$\alpha = 30^\circ$. מהו רדיוס המעגל החוסם $R$?`, answer: 6,
      hints: [m`$\frac{a}{\sin\alpha} = 2R$.`, m`$\frac{6}{0.5} = 12 = 2R$.`], wrong: [{ v: 12, tag: 'two-r' }],
      solution: m`$2R = 12 \Rightarrow R = 6$.` },
    { id: 'g3', type: 'num', prompt: m`במשולש הצלעות 3, 5 ו-7. מהי הזווית הגדולה ביותר (במעלות)?`, answer: 120,
      hints: [m`הזווית הגדולה נמצאת מול הצלע הגדולה, 7.`, m`$\cos\gamma = \frac{3^2 + 5^2 - 7^2}{2\cdot3\cdot5}$.`, m`$\cos\gamma = \frac{-15}{30} = -\frac12$.`],
      wrong: [{ v: 60, tag: 'cos-sign' }],
      solution: m`$\cos\gamma = -\tfrac12 \Rightarrow \gamma = 120^\circ$.` },
  ],

  practice: [
    { id: 'p1', type: 'num', prompt: m`במשולש שתי צלעות באורך 6 ו-10, והזווית ביניהן $30^\circ$. מהו שטח המשולש?`, answer: 15,
      hints: [m`$S = \tfrac12 ab\sin\gamma$.`], wrong: [{ v: 30, tag: 'area-half' }],
      solution: m`$S = \tfrac12\cdot6\cdot10\cdot\tfrac12 = 15$.` },
    { id: 'p2', type: 'num', prompt: m`במשולש $a = 12$, $\alpha = 60^\circ$, $\beta = 45^\circ$. מהו $b$? (עגל לשתי ספרות אחרי הנקודה)`, answer: 9.80, tol: 0.02,
      hints: [m`$b = \frac{a\sin\beta}{\sin\alpha}$.`, m`$\frac{12\cdot 0.7071}{0.8660}$.`], wrong: [{ v: 14.70, tag: 'sine-ratio' }],
      solution: m`$b = \frac{12\sin45^\circ}{\sin60^\circ} = 4\sqrt6 \approx 9.80$.` },
    { id: 'p3', type: 'num', prompt: m`במשולש הצלעות 4, 5 ו-6. מהי הזווית שמול הצלע 6, במעלות? (עגל לספרה אחת אחרי הנקודה)`, answer: 82.8, tol: 0.1,
      hints: [m`$\cos\gamma = \frac{16 + 25 - 36}{2\cdot4\cdot5}$.`, m`$\cos\gamma = \frac{5}{40} = 0.125$. השתמש ב-$\cos^{-1}$ במחשבון (במצב מעלות).`],
      solution: m`$\cos\gamma = 0.125 \Rightarrow \gamma \approx 82.8^\circ$.` },
    { id: 'p4', type: 'mc', prompt: m`מצאת בעזרת משפט הסינוסים ש-$\sin\beta = 0.5$. מה צריך לבדוק?`,
      options: [{ t: m`אם גם $\beta = 150^\circ$ אפשרית במשולש`, ok: true }, { t: 'שום דבר, β = 30°', tag: 'ambiguous' }, { t: 'אם הצלעות מקיימות את משפט פיתגורס', tag: 'ambiguous' }, { t: m`אם $\cos\beta = 0.5$`, tag: 'ambiguous' }],
      hints: [m`$\sin 30^\circ = \sin 150^\circ$.`],
      solution: m`$\sin 30^\circ = \sin 150^\circ = 0.5$. צריך לבדוק אם סכום הזוויות עם $150^\circ$ עדיין קטן מ-$180^\circ$, ואם $\beta$ מול צלע גדולה מספיק.` },
  ],

  bagrut: [
    { id: 'b1', source: 'original',
      context: m`<p>במשולש $ABC$ נתון: $AB = 10$, $AC = 6$, $\angle BAC = 120^\circ$.</p>`,
      parts: [
        { id: 'b1a', type: 'num', label: 'א', prompt: m`מצא את אורך הצלע $BC$.`, answer: 14,
          hints: [m`שתי צלעות והזווית שביניהן.`, m`$BC^2 = 100 + 36 - 2\cdot10\cdot6\cos120^\circ$, ו-$\cos120^\circ = -\tfrac12$.`],
          wrong: [{ v: 8.72, tag: 'cos-sign' }], tol: 0.01,
          solution: m`$BC^2 = 136 + 60 = 196 \Rightarrow BC = 14$.` },
        { id: 'b1b', type: 'num', label: 'ב', prompt: m`מצא את רדיוס המעגל החוסם את המשולש. (עגל לשתי ספרות)`, answer: 8.08, tol: 0.02,
          hints: [m`$2R = \frac{BC}{\sin\angle A}$.`, m`$\sin120^\circ = \frac{\sqrt3}{2} \approx 0.866$.`], wrong: [{ v: 16.17, tag: 'two-r' }],
          solution: m`$2R = \frac{14}{\sin120^\circ} = \frac{28}{\sqrt3} \Rightarrow R = \frac{14}{\sqrt3} \approx 8.08$.` },
        { id: 'b1c', type: 'num', label: 'ג', prompt: m`מצא את שטח המשולש. (עגל לשתי ספרות)`, answer: 25.98, tol: 0.02,
          hints: [m`$S = \tfrac12\cdot AB\cdot AC\cdot\sin120^\circ$.`], wrong: [{ v: 51.96, tag: 'area-half' }],
          solution: m`$S = \tfrac12\cdot10\cdot6\cdot\frac{\sqrt3}{2} = 15\sqrt3 \approx 25.98$.` },
        { id: 'b1d', type: 'num', label: 'ד', prompt: m`מצא את אורך הגובה מהקודקוד $A$ לצלע $BC$. (עגל לשתי ספרות)`, answer: 3.71, tol: 0.02,
          hints: [m`השטח הוא גם $\tfrac12\cdot BC\cdot h$.`, m`$h = \frac{2S}{BC} = \frac{2\cdot 15\sqrt3}{14}$.`],
          solution: m`$h = \frac{30\sqrt3}{14} = \frac{15\sqrt3}{7} \approx 3.71$.` },
      ] },
  ],

  quiz: [
    { id: 'q1', type: 'num', prompt: m`במשולש $a = 5$, $b = 7$, $\gamma = 60^\circ$. מהו $c$? (עגל לשתי ספרות)`, answer: 6.24, tol: 0.02, wrong: [{ v: 10.44, tag: 'cos-sign' }], solution: m`$c^2 = 25 + 49 - 35 = 39 \Rightarrow c = \sqrt{39} \approx 6.24$.` },
    { id: 'q2', type: 'num', prompt: m`במשולש $a = 8$ ו-$\alpha = 30^\circ$. מהו $R$?`, answer: 8, wrong: [{ v: 16, tag: 'two-r' }], solution: m`$2R = \frac{8}{0.5} = 16 \Rightarrow R = 8$.` },
    { id: 'q3', type: 'num', prompt: m`במשולש ישר-זווית הניצבים 4 ו-9. מהו השטח, לפי $\tfrac12 ab\sin\gamma$?`, answer: 18, wrong: [{ v: 36, tag: 'area-half' }], solution: m`$\tfrac12\cdot4\cdot9\cdot\sin90^\circ = 18$.` },
    { id: 'q4', type: 'num', prompt: m`במשולש הצלעות 7, 8 ו-13. מהי הזווית שמול הצלע 13, במעלות?`, answer: 120, wrong: [{ v: 60, tag: 'cos-sign' }], solution: m`$\cos\gamma = \frac{49 + 64 - 169}{112} = -\tfrac12 \Rightarrow \gamma = 120^\circ$.` },
    { id: 'q5', type: 'mc', prompt: 'נתונות שלוש הצלעות של משולש. באיזה משפט כדאי להשתמש כדי למצוא זווית?',
      options: [{ t: 'משפט הקוסינוסים', ok: true }, { t: 'משפט הסינוסים', tag: 'choose-law' }, { t: 'משפט פיתגורס', tag: 'choose-law' }, { t: 'נוסחת השטח', tag: 'choose-law' }],
      solution: 'עם שלוש צלעות אין לנו זוג צלע-זווית, ולכן משתמשים במשפט הקוסינוסים.' },
  ],

  tags: {
    'cos-sign': { label: 'סימן הקוסינוס בזווית קהה', advice: 'בזווית קהה (מעל 90°) הקוסינוס שלילי, ולכן −2ab·cosγ נהיה חיבור. cos120° = −½.', section: 'explain' },
    'two-r': { label: 'בלבול בין R ל-2R', advice: 'היחס a/sinα שווה ל-2R, לא ל-R. בסוף מחלקים ב-2.', section: 'explain' },
    'area-half': { label: 'שכחת חצי בנוסחת השטח', advice: 'S = ½·a·b·sinγ.', section: 'explain' },
    'sine-ratio': { label: 'הפיכת היחס במשפט הסינוסים', advice: 'כל צלע מחולקת בסינוס הזווית שמולה: b = a·sinβ / sinα.', section: 'examples' },
    'ambiguous': { label: 'שני פתרונות לזווית', advice: 'sin x = sin(180° − x). כשמוצאים זווית ממשפט הסינוסים, בודקים את שתי האפשרויות.', section: 'explain' },
    'choose-law': { label: 'בחירת המשפט המתאים', advice: 'זוג צלע-זווית: סינוסים. שלוש צלעות, או שתיים והזווית שביניהן: קוסינוסים.', section: 'explain' },
  },
  next: null,
};
