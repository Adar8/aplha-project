import { Link } from 'react-router'
import Callout from '../../components/Callout.jsx'
import ModuleLayout from '../../components/ModuleLayout.jsx'
import Term from '../../components/Term.jsx'
import { getModule } from '../../data/modules.js'
import EquitySimulator from './EquitySimulator.jsx'
import PositionCalculator from './PositionCalculator.jsx'
import RecoveryCalculator from './RecoveryCalculator.jsx'
import './RiskManagement.css'

const lesson = getModule('risk-management')

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

export default function RiskManagement() {
  return (
    <ModuleLayout
      module={lesson}
      intro="אף אחד לא צודק בכל עסקה. מה שמבדיל סוחר ששורד מסוחר שנמחק הוא לא כמה הוא צודק, אלא כמה הוא מפסיד כשהוא טועה. במודול הזה נבנה את הכלים לזה: סטופ, גודל פוזיציה ויחס סיכון-סיכוי."
    >
      {/* ---------- 4.1 ---------- */}
      <section aria-labelledby="asymmetry">
        <SectionTitle num="4.1" id="asymmetry">
          החשבון הלא-הוגן של הפסדים
        </SectionTitle>
        <p>
          נתחיל מעובדה מתמטית שכל סוחר צריך להכיר: הפסד ורווח לא מתקזזים באופן סימטרי. אם התיק
          ירד ב-50%, עלייה של 50% לא תחזיר אתכם לנקודת ההתחלה. היא תחזיר אתכם ל-75%. כדי לחזור
          צריך להכפיל את מה שנשאר, כלומר רווח של 100%.
        </p>
        <p>
          ככל שההפסד גדול יותר, הדרך חזרה מתארכת בקצב מפחיד. זו הסיבה שהמטרה הראשונה של ניהול
          סיכונים היא לא להרוויח יותר, אלא להימנע מהפסד גדול.
        </p>

        <RecoveryCalculator />
      </section>

      {/* ---------- 4.2 ---------- */}
      <section aria-labelledby="stop">
        <SectionTitle num="4.2" id="stop">
          סטופ: להחליט מראש איפה טעיתם
        </SectionTitle>
        <p>
          <Term he="פקודת סטופ" en="Stop-Loss" /> היא פקודה שממתינה מתחת למחיר, ואם המחיר יורד
          אליה, היא מוכרת את המניה. היא מגבילה את ההפסד, אבל חשוב עוד יותר מה שהיא מחייבת אתכם
          לעשות: להחליט <strong>לפני</strong> העסקה באיזה מחיר הרעיון שלכם כבר לא נכון.
        </p>
        <p>איפה שמים אותו? לא באחוז שרירותי, אלא במקום שבו השוק ״מוכיח״ שטעיתם:</p>
        <ul className="bullets">
          <li>
            <strong>מתחת לתמיכה.</strong> קניתם כי המחיר קפץ מ-96? אם הוא יורד מתחת ל-96, הסיבה
            לעסקה נעלמה. על תמיכות ראו{' '}
            <Link to="/modules/chart-reading">מודול 03</Link>.
          </li>
          <li>
            <strong>עם קצת מרווח.</strong> תמיכה היא אזור, לא קו. סטופ שצמוד מדי לרמה ייפגע מתנודה
            רגילה, רגע לפני שהמחיר ממשיך לכיוון שלכם.
          </li>
          <li>
            <strong>ולא מזיזים אותו למטה</strong> כשהמחיר מתקרב אליו. זו הדרך הכי מהירה להפוך הפסד
            קטן להפסד גדול.
          </li>
        </ul>

        <Callout title="הסטופ הוא לא חומת מגן" variant="warning">
          <p>
            פקודת סטופ רגילה הופכת לפקודת שוק כשהמחיר מגיע אליה, ולכן היא מבטיחה ביצוע, לא מחיר
            (בדיוק כמו ב<Link to="/modules/order-types">מודול 02</Link>). אם מניה נסגרת ב-50 ונפתחת
            למחרת ב-44 אחרי חדשות רעות, זה <Term he="פער פתיחה" en="Gap" />: הסטופ שלכם ב-47.5
            יתבצע בסביבות 44, ותפסידו יותר ממה שתכננתם.
          </p>
        </Callout>
      </section>

      {/* ---------- 4.3 ---------- */}
      <section aria-labelledby="sizing">
        <SectionTitle num="4.3" id="sizing">
          גודל פוזיציה: כמה לקנות
        </SectionTitle>
        <p>
          כאן רוב המתחילים עושים את זה הפוך: מחליטים ״אקנה במאה אלף״ ורק אחר כך חושבים על הסטופ.
          הדרך הנכונה מתחילה מהשאלה <strong>כמה אני מוכן להפסיד בעסקה הזו</strong>, ומשם נגזר כמה
          לקנות. זה נקרא <Term he="גודל פוזיציה" en="Position Sizing" />.
        </p>
        <p>
          הסכום שאתם מוכנים להפסיד בעסקה נקרא <Term he="סיכון לעסקה" en="Risk per Trade" />, או
          בקיצור <bdi className="mono">1R</bdi>. כלל אצבע נפוץ אצל סוחרים הוא לסכן 1%–2% מההון
          בעסקה בודדת. זה לא חוק טבע, אבל בסימולטור שבהמשך תראו למה המספר הזה קטן כל כך.
        </p>
        <p>
          תחשבו על זה כך: סטופ רחוק לא אומר ״יותר סיכון״, הוא אומר ״פחות מניות״. סטופ צמוד מאפשר
          יותר מניות באותו סיכון. בשני המקרים ההפסד המקסימלי זהה, והוא זה שקבעתם מראש.
        </p>

        <PositionCalculator />
      </section>

      {/* ---------- 4.4 ---------- */}
      <section aria-labelledby="rr">
        <SectionTitle num="4.4" id="rr">
          יחס סיכון-סיכוי: למה אפשר לטעות רוב הזמן ועדיין להרוויח
        </SectionTitle>
        <p>
          <Term he="יחס סיכון-סיכוי" en="Risk/Reward Ratio" /> משווה בין מה שמסכנים לבין מה שמצפים
          להרוויח. עסקה עם סיכון של ₪1,000 ויעד של ₪2,000 היא עסקה של <bdi className="mono">1:2</bdi>,
          או <bdi className="mono">2R</bdi>.
        </p>
        <p>
          ביחד עם <Term he="אחוז ההצלחה" en="Win Rate" /> הוא קובע את ה<Term he="תוחלת" en="Expectancy" />:
          כמה מרוויחים בממוצע על כל עסקה. בעסקאות של <bdi className="mono">1:2</bdi> מספיק להצליח
          בקצת יותר משליש מהעסקאות כדי להרוויח. בעסקאות של <bdi className="mono">1:1</bdi> צריך יותר
          מחצי.
        </p>
        <div className="formula">
          <p className="formula__title">תוחלת לעסקה (ב-R)</p>
          <p className="formula__eq">
            אחוז הצלחה × רווח בהצלחה − אחוז כישלון × <bdi className="mono">1R</bdi>
          </p>
          <p className="formula__example">
            למשל: <bdi className="mono">45% × 2R − 55% × 1R = +0.35R</bdi>. על כל ₪1,000 שמסכנים,
            מרוויחים בממוצע ₪350.
          </p>
        </div>
      </section>

      {/* ---------- 4.5 ---------- */}
      <section aria-labelledby="sim">
        <SectionTitle num="4.5" id="sim">
          סימולטור: אותו מזל, סיכון אחר
        </SectionTitle>
        <p>
          שיטה עם תוחלת חיובית עדיין עוברת רצפים של הפסדים. השאלה היא אם תשרדו אותם. הסימולטור
          מריץ 100 עסקאות ב-20 עתידים אפשריים. כשמשנים את אחוז הסיכון, רצף ההצלחות והכישלונות
          נשאר בדיוק אותו דבר, ורואים רק מה הסיכון עצמו עושה.
        </p>

        <EquitySimulator />

        <h3>נסו בעצמכם</h3>
        <ul className="bullets">
          <li>
            התחילו ב״זהיר״ (<bdi className="mono">1%</bdi>), ואז עברו ל״הימורי״ (
            <bdi className="mono">20%</bdi>). התוצאה החציונית אולי גדלה, אבל הסתכלו כמה מסלולים ירדו
            ביותר מחצי בדרך. בחיים האמיתיים, מעט אנשים ממשיכים לסחור אחרי שאיבדו חצי מהכסף.
          </li>
          <li>
            עכשיו, עם <bdi className="mono">20%</bdi> סיכון, הורידו את אחוז ההצלחה מ-45% ל-35%.
            השיטה עדיין רווחית על הנייר, אבל רוב המסלולים נמחקים. חזרו ל-
            <bdi className="mono">1%</bdi> וראו את ההבדל.
          </li>
          <li>
            העלו את הסיכון ל-<bdi className="mono">40%</bdi>. גם עם שיטה טובה, סיכון גדול מדי מקטין
            אפילו את התוצאה החציונית.
          </li>
          <li>
            נסו שיטה בלי יתרון: <bdi className="mono">40%</bdi> הצלחה ורווח של{' '}
            <bdi className="mono">1R</bdi>. שום אחוז סיכון לא מציל אותה.
          </li>
        </ul>

        <Callout title="למה זה כל כך חשוב" variant="simple">
          <p>
            בסימולטור אנחנו יודעים מה אחוז ההצלחה. במציאות אתם לא יודעים, ואפשר רק להעריך אותו
            מהעבר. סיכון קטן לעסקה הוא מה שמאפשר לכם לטעות גם בהערכה הזו ולהישאר במשחק.
          </p>
        </Callout>

        <Callout title="חשוב לזכור" variant="warning">
          <p>
            הסימולטור מניח שכל סטופ מתבצע בדיוק במחיר שלו ושכל עסקה בלתי תלויה בקודמת. במציאות יש
            פערי פתיחה, עמלות, החלקות ורצפים שנוטים להתקבץ, ולכן התוצאות האמיתיות גרועות יותר. זה
            תוכן לימודי, לא המלצה על אחוז סיכון מסוים.
          </p>
        </Callout>
      </section>

      {/* ---------- סיכום ---------- */}
      <section aria-labelledby="summary">
        <SectionTitle num="✓" id="summary">
          מה לוקחים מהמודול
        </SectionTitle>
        <ul className="takeaways">
          <li>הפסדים גדולים קשים לתיקון: אחרי הפסד של 50% צריך רווח של 100% כדי לחזור.</li>
          <li>את הסטופ קובעים לפני העסקה, במקום שבו הרעיון מתברר כשגוי, ולא מזיזים אותו למטה.</li>
          <li>
            קודם מחליטים כמה מוכנים להפסיד, ורק אחר כך כמה לקנות: (הון × סיכון) ÷ (כניסה − סטופ).
          </li>
          <li>יחס סיכון-סיכוי טוב מאפשר להרוויח גם כשצודקים בפחות ממחצית העסקאות.</li>
          <li>סיכון קטן לעסקה לא נועד להרוויח יותר. הוא נועד לשרוד את הרצפים הרעים ואת הטעויות בהערכה.</li>
        </ul>
      </section>
    </ModuleLayout>
  )
}
