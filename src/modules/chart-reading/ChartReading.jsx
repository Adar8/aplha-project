import { Link } from 'react-router'
import Callout from '../../components/Callout.jsx'
import ModuleLayout from '../../components/ModuleLayout.jsx'
import Term from '../../components/Term.jsx'
import { getModule } from '../../data/modules.js'
import LevelsSimulator from './LevelsSimulator.jsx'
import TimeframeSwitcher from './TimeframeSwitcher.jsx'
import TrendQuiz from './TrendQuiz.jsx'
import './ChartReading.css'

const lesson = getModule('chart-reading')

const TRENDS = [
  {
    id: 'up',
    he: 'מגמת עלייה',
    en: 'Uptrend',
    rule: 'שיאים עולים ושפלים עולים',
    text: 'כל ירידה נעצרת גבוה יותר מהקודמת. הקונים מוכנים לשלם יותר ויותר.',
    path: '4,44 22,26 34,34 54,14 66,22 90,4',
  },
  {
    id: 'down',
    he: 'מגמת ירידה',
    en: 'Downtrend',
    rule: 'שיאים יורדים ושפלים יורדים',
    text: 'כל עלייה נעצרת נמוך יותר מהקודמת. המוכרים מוכנים לקבל פחות ופחות.',
    path: '4,4 22,22 34,14 54,34 66,26 90,44',
  },
  {
    id: 'sideways',
    he: 'דשדוש',
    en: 'Sideways / Range',
    rule: 'בלי שיאים או שפלים חדשים',
    text: 'המחיר נע בין רצפה לתקרה. אף צד לא משתלט, לפחות בינתיים.',
    path: '4,34 18,12 32,36 48,12 62,36 76,12 90,30',
  },
]

function SectionTitle({ num, id, children }) {
  return (
    <h2>
      <span className="section-num" dir="ltr">
        {num}
      </span>
      <span id={id}>{children}</span>
    </h2>
  )
}

export default function ChartReading() {
  return (
    <ModuleLayout
      module={lesson}
      intro="גרף מחירים הוא הסיפור של הקרב בין קונים למוכרים. במודול הזה נלמד לקרוא אותו: לזהות מגמה, למצוא את הרמות שבהן המחיר נוטה לעצור, ולהבין למה נפח המסחר חשוב."
    >
      {/* ---------- 3.1 ---------- */}
      <section aria-labelledby="axes">
        <SectionTitle num="3.1" id="axes">
          מה בעצם רואים בגרף
        </SectionTitle>
        <p>
          בגרף נרות הציר האופקי הוא הזמן והציר האנכי הוא המחיר. כל נר מסכם פרק זמן אחד: מחיר
          פתיחה, סגירה, גבוה ונמוך. אם צריך רענון, ראו את{' '}
          <Link to="/modules/what-is-a-stock">הסימולטור של מודול 01</Link>. מתחת למחירים מופיעים
          בדרך כלל עמודות של <Term he="נפח מסחר" en="Volume" />: כמה מניות החליפו ידיים באותו פרק
          זמן.
        </p>
        <p>
          הדבר הראשון שבוחרים הוא <Term he="טווח הזמן" en="Timeframe" />: כמה זמן מייצג כל נר. דקה,
          שעה, יום, שבוע. זו לא החלטה טכנית: אותה מניה, באותו רגע, יכולה לספר סיפור הפוך לגמרי
          בטווחי זמן שונים. נסו:
        </p>

        <TimeframeSwitcher />

        <Callout title="איך סוחרים מסתכלים על גרף">
          <p>
            מתחילים מטווח זמן ארוך כדי להבין את התמונה הגדולה, ורק אחר כך ״מתקרבים״ לטווח קצר כדי
            לתזמן. מי שמסתכל רק על גרף של דקות רואה בעיקר רעש.
          </p>
        </Callout>
      </section>

      {/* ---------- 3.2 ---------- */}
      <section aria-labelledby="trend">
        <SectionTitle num="3.2" id="trend">
          מגמה: לאן המחיר הולך
        </SectionTitle>
        <p>
          מחיר אף פעם לא זז בקו ישר. הוא עולה ויורד בגלים, וכל גל משאיר אחריו{' '}
          <Term he="שיא" en="Swing High" /> ו<Term he="שפל" en="Swing Low" />. ה
          <Term he="מגמה" en="Trend" /> נקבעת לפי היחס בין השיאים והשפלים האלה, ולא לפי נר בודד:
        </p>

        <div className="trends">
          {TRENDS.map((t) => (
            <div key={t.id} className={`trends__card trends__card--${t.id}`}>
              <svg viewBox="0 0 94 48" className="trends__svg" aria-hidden="true">
                <polyline points={t.path} />
              </svg>
              <h3>
                <Term he={t.he} en={t.en} />
              </h3>
              <p className="trends__rule">{t.rule}</p>
              <p>{t.text}</p>
            </div>
          ))}
        </div>

        <p>
          מגמה נחשבת שבורה כשהדפוס נשבר: למשל, כשבמגמת עלייה המחיר יורד מתחת לשפל האחרון. עד אז,
          ירידה במגמת עלייה היא ״תיקון״, לא היפוך. עכשיו תורכם:
        </p>

        <TrendQuiz />
      </section>

      {/* ---------- 3.3 ---------- */}
      <section aria-labelledby="levels">
        <SectionTitle num="3.3" id="levels">
          תמיכה והתנגדות: הרצפה והתקרה
        </SectionTitle>
        <p>
          <Term he="תמיכה" en="Support" /> היא אזור מחיר שבו הירידות נוטות להיעצר, כי שם קונים
          נכנסים שוב ושוב. <Term he="התנגדות" en="Resistance" /> היא ההפך: אזור שבו העליות נעצרות,
          כי שם מוכרים ממתינים.
        </p>
        <p>למה בכלל יש רמות כאלה? כי לשוק יש זיכרון:</p>
        <ul className="bullets">
          <li>
            מי שפספס קנייה ב-96 בפעם הקודמת מחכה להזדמנות שנייה, וכשהמחיר חוזר לשם, הוא קונה.
          </li>
          <li>
            מי שקנה ב-104 וראה את המחיר יורד שמח ״לצאת באפס״ כשהמחיר חוזר לשם, ולכן הוא מוכר.
          </li>
          <li>
            הרבה פקודות מוגבלות מחכות במספרים עגולים ובשיאים ובשפלים קודמים. זה בדיוק{' '}
            <Link to="/modules/order-types">ספר הפקודות ממודול 02</Link>.
          </li>
        </ul>
        <p>ארבעה דברים שחשוב לדעת על רמות:</p>
        <ul className="bullets">
          <li>
            <strong>אלה אזורים, לא קווים מדויקים.</strong> המחיר יכול לעצור קצת לפני הרמה או לחדור
            אותה מעט.
          </li>
          <li>
            <strong>כמה שיותר נגיעות, כך הרמה משמעותית יותר.</strong> אבל כל נגיעה גם ״שוחקת״ את
            הקונים או המוכרים שמחכים שם.
          </li>
          <li>
            <strong>
              <Term he="פריצה" en="Breakout" /> היא כשהמחיר עובר רמה ונשאר מעבר לה.
            </strong>{' '}
            לפעמים הוא עובר לרגע וחוזר מיד: זו <Term he="פריצת שווא" en="False Breakout" />.
          </li>
          <li>
            <strong>
              <Term he="היפוך תפקידים" en="Role Reversal" />:
            </strong>{' '}
            תקרה שנפרצה הופכת לרצפה, ורצפה שנשברה הופכת לתקרה.
          </li>
        </ul>
      </section>

      {/* ---------- 3.4 ---------- */}
      <section aria-labelledby="volume">
        <SectionTitle num="3.4" id="volume">
          נפח מסחר: מי באמת מאחורי התנועה
        </SectionTitle>
        <p>
          המחיר מספר לאן השוק זז, ונפח המסחר מספר כמה ״כסף״ עומד מאחורי התנועה. תנועה עם נפח גבוה
          אומרת שהרבה משתתפים מסכימים עם הכיוון. תנועה עם נפח נמוך יכולה להיות מקרית.
        </p>
        <p>
          זה חשוב במיוחד בפריצות: פריצה של התנגדות בנפח גבוה פי 2–3 מהרגיל אמינה הרבה יותר
          מפריצה שקטה. בסימולטור שלמטה, אחרי שתחשפו את ההמשך, הסתכלו על עמודות הנפח ברגע הפריצה.
        </p>
      </section>

      {/* ---------- 3.5 ---------- */}
      <section aria-labelledby="sim">
        <SectionTitle num="3.5" id="sim">
          סימולטור: סמנו את הרמות
        </SectionTitle>
        <p>
          שלושה גרפים, וכל אחד מסתיר את ההמשך שלו. סמנו את הרמות לפי מה שרואים, בדקו את עצמכם,
          ורק אז חשפו מה קרה אחר כך.
        </p>

        <LevelsSimulator />

        <Callout title="גרף הוא לא כדור בדולח" variant="warning">
          <p>
            תמיכה, התנגדות ומגמה מתארות מה קרה עד עכשיו ומה <strong>סביר</strong> שיקרה, לא מה
            בטוח יקרה. רמות נשברות, מגמות מתהפכות, וחדשות יכולות למחוק כל תבנית. ניתוח גרפים (
            <bdi>Technical Analysis</bdi>) הוא כלי לחשיבה על הסתברויות ועל ניהול סיכונים, לא
            נבואה. גם הגרפים בסימולטור נבנו כך שהרמות יעבדו, וזה ממש לא תמיד המצב במציאות.
          </p>
        </Callout>
      </section>

      {/* ---------- סיכום ---------- */}
      <section aria-labelledby="summary">
        <SectionTitle num="✓" id="summary">
          מה לוקחים מהמודול
        </SectionTitle>
        <ul className="takeaways">
          <li>טווח הזמן משנה את הסיפור. מתחילים מהתמונה הגדולה ורק אחר כך מתקרבים.</li>
          <li>
            מגמת עלייה היא שיאים ושפלים עולים, מגמת ירידה היא שיאים ושפלים יורדים, ודשדוש הוא טווח
            בלי שיאים ושפלים חדשים.
          </li>
          <li>תמיכה והתנגדות הן אזורים שבהם קונים או מוכרים נכנסו בעבר, ולכן המחיר נוטה לעצור שם.</li>
          <li>רמה שנפרצה מחליפה תפקיד: תקרה הופכת לרצפה, ולהפך.</li>
          <li>נפח מסחר גבוה נותן לתנועה, ובמיוחד לפריצה, יותר אמינות.</li>
        </ul>
      </section>
    </ModuleLayout>
  )
}
