import { useState } from 'react'
import { SITE } from '../data/site.js'
import { useProfile } from '../profile/ProfileContext.js'
import { useProgress } from '../progress/ProgressContext.js'
import { Field } from './Missing.jsx'
import LegalLayout from './LegalLayout.jsx'

function DeleteMyData() {
  const { resetProgress } = useProgress()
  const { resetProfile } = useProfile()
  const [done, setDone] = useState(false)
  return (
    <div className="legal__data">
      <p>
        אפשר למחוק מכאן את כל מה שהאתר שמר בדפדפן הזה: ההתקדמות, תשובות השאלון, תוצאות מבחן המיקום ובחירות הרמה.
        המחיקה סופית.
      </p>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => {
          resetProgress()
          resetProfile()
          setDone(true)
        }}
      >
        מחיקת הנתונים שלי
      </button>
      <p role="status">{done ? 'הנתונים נמחקו מהדפדפן הזה.' : ''}</p>
    </div>
  )
}

export default function PrivacyPage() {
  const email = SITE.contactEmail
  return (
    <LegalLayout title="מדיניות פרטיות">
      <p>
        המסמך מסביר איזה מידע נשמר כשמשתמשים באתר {SITE.name}
        {SITE.domain ? (
          <>
            {' '}
            (<bdi>{SITE.domain}</bdi>)
          </>
        ) : null}
        , איפה הוא נשמר ומה אפשר לעשות איתו. האתר מופעל על ידי <Field value={SITE.operator} label="שם המפעיל" />.
      </p>

      <h2>בקצרה</h2>
      <ul>
        <li>אין באתר הרשמה, ואין לו כרגע שרת שאוסף מידע על המשתמשים.</li>
        <li>ההתקדמות ותשובות השאלון נשמרות רק בדפדפן שלכם, במכשיר שלכם. הן לא נשלחות אלינו.</li>
        <li>האתר לא משתמש בעוגיות (Cookies), לא בכלי מדידה וסטטיסטיקה ולא בפרסום.</li>
        <li>הגופנים של האתר נטענים משרתי Google, ולכן Google מקבלת פרטים טכניים על הבקשה.</li>
      </ul>

      <h2>מה נשמר בדפדפן שלכם</h2>
      <p>
        האתר שומר מידע באחסון המקומי של הדפדפן (localStorage). המידע נשאר במכשיר, ורק הדפדפן שלכם יכול לקרוא אותו:
      </p>
      <ul>
        <li>אילו מודולים סימנתם כהושלמו, ובאיזה תאריך.</li>
        <li>
          התשובות בשאלון ההתאמה: ניסיון, מטרה וזמן לימוד שבועי, ואם בחרתם לענות, גם טווח גילאים וסדר גודל של השקעה.
        </li>
        <li>התוצאות של מבחן המיקום, ורמת ההסבר (בסיסי או מעמיק) שבחרתם בכל מודול.</li>
      </ul>
      <p>
        התשובות משמשות רק כדי להתאים את הלימוד: סדר המודולים, רמת ההסבר, הערכת הזמן וסכומי ברירת המחדל בסימולטורים.
        הן לא משמשות להמלצה על השקעות, ואנחנו לא רואים אותן.
      </p>
      <DeleteMyData />
      <p>
        אפשר גם למחוק את המידע דרך הגדרות הדפדפן (ניקוי נתוני האתר). בגלישה פרטית המידע נמחק כשסוגרים את החלון.
      </p>

      <h2>מידע שנשלח לצדדים שלישיים</h2>
      <p>
        <strong>Google Fonts.</strong> הגופנים של האתר נטענים מהשרתים של Google. כשהדפדפן מבקש אותם, Google מקבלת את
        כתובת ה-IP שלכם ופרטים טכניים כמו סוג הדפדפן. השימוש של Google במידע הזה כפוף ל
        <a href="https://policies.google.com/privacy?hl=iw" rel="noopener noreferrer" target="_blank">
          מדיניות הפרטיות של Google
        </a>
        .
      </p>
      <p>
        <strong>שרת האחסון.</strong> כמו כל אתר, גם השרת שמגיש את קובצי האתר עשוי לרשום פרטים טכניים על כל בקשה:
        כתובת IP, סוג הדפדפן, הדף שהתבקש והשעה. אנחנו לא משתמשים בפרטים האלה כדי לזהות משתמשים.
      </p>

      <h2>שינויים עתידיים</h2>
      <p>
        אנחנו מתכננים להוסיף חשבונות משתמש, אפשרות להזין השקעות שביצעתם אצל ברוקר אחר כדי לעקוב אחריהן, ואזור שוק עם
        גרפים וחדשות מ-TradingView. אלה יחייבו שמירת מידע בשרת ויכניסו שירותים של צד שלישי. לפני שהם יעלו לאוויר, המסמך הזה יעודכן ויפרט מה נשמר, איפה, לכמה זמן ומי יכול לגשת אליו.
      </p>

      <h2>הזכויות שלכם</h2>
      <p>
        לפי חוק הגנת הפרטיות, התשמ״א-1981, אפשר לבקש לעיין במידע שנשמר עליכם ולבקש לתקן או למחוק אותו. כרגע כל המידע
        נמצא אצלכם בדפדפן, ואפשר למחוק אותו בכפתור שלמעלה. לשאלות על פרטיות:{' '}
        <Field value={email} label="דוא״ל ליצירת קשר" href={email ? `mailto:${email}` : undefined} />.
      </p>
    </LegalLayout>
  )
}
