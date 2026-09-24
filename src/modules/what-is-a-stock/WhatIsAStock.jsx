import Callout from '../../components/Callout.jsx'
import { Deep, Simple } from '../../profile/Depth.jsx'
import ModuleLayout from '../../components/ModuleLayout.jsx'
import Term from '../../components/Term.jsx'
import { getModule } from '../../data/modules.js'
import MarketPressureSimulator from './MarketPressureSimulator.jsx'
import OwnershipCalculator from './OwnershipCalculator.jsx'
import './WhatIsAStock.css'

const lesson = getModule('what-is-a-stock')

const FLOW = [
  { who: 'אתם', what: 'מחליטים לקנות' },
  { who: 'ברוקר', what: 'מעביר את הפקודה' },
  { who: 'בורסה', what: 'מצמידה קונה למוכר' },
  { who: 'משקיע אחר', what: 'מוכר לכם את המניה' },
]

const BOOK = {
  asks: [
    { price: '100.08', size: '300' },
    { price: '100.05', size: '500' },
    { price: '100.03', size: '200' },
  ],
  bids: [
    { price: '99.98', size: '400' },
    { price: '99.95', size: '700' },
    { price: '99.90', size: '1,000' },
  ],
}

function SectionTitle({ num, children }) {
  return (
    <h2>
      <span className="section-num" dir="ltr">
        {num}
      </span>
      {children}
    </h2>
  )
}

export default function WhatIsAStock() {
  return (
    <ModuleLayout
      module={lesson}
      intro="כשקונים מניה, קונים חתיכה קטנה מחברה אמיתית. במודול הזה נבין מה בדיוק מקבלים, איפה הקנייה קורית, ולמה המחיר לא מפסיק לזוז."
    >
      {/* ---------- 1. בעלות ---------- */}
      <section aria-labelledby="ownership">
        <SectionTitle num="1.1">
          <span id="ownership">מה זה אומר להיות בעלים</span>
        </SectionTitle>
        <p>
          כל חברה ציבורית מחולקת להמון חלקים שווים שנקראים <Term he="מניות" en="Shares" />. מי
          שמחזיק מניה הוא <Term he="בעל מניות" en="Shareholder" /> — כלומר שותף בחברה. לא עובד
          שלה ולא לקוח שלה: שותף, עם חלק אמיתי בעסק.
        </p>
        <p>
          נגיד שלחברה יש מיליון מניות, ויש לכם 1,000 מהן. אתם הבעלים של 0.1% מהחברה. זה נשמע
          קטן, אבל זה אומר שעל כל שקל שהחברה שווה, עשירית אגורה שייכת לכם.
        </p>

        <h3>מה מקבלים בתור בעלי מניות?</h3>
        <ul className="bullets">
          <li>
            <strong>חלק מהרווחים.</strong> כשהחברה מחליטה לחלק חלק מהרווח לבעלי המניות, זה נקרא{' '}
            <Term he="דיבידנד" en="Dividend" />, וכל אחד מקבל לפי מספר המניות שלו. החברה לא
            חייבת לחלק דיבידנד, והרבה חברות צמיחה מעדיפות להשקיע את הרווח בחזרה בעסק.
          </li>
          <li>
            <strong>עליית ערך.</strong> אם החברה גדלה ומרוויחה יותר, בדרך כלל גם המניה שלה שווה
            יותר, ואפשר למכור אותה ביותר ממה ששילמתם. ההפרש הזה נקרא{' '}
            <Term he="רווח הון" en="Capital Gain" />.
          </li>
          <li>
            <strong>זכות הצבעה.</strong> ב<Term he="אסיפה הכללית" en="Shareholders Meeting" />{' '}
            מצביעים על החלטות גדולות, כמו מינוי דירקטורים או מיזוג. ברוב המקרים: קול אחד לכל
            מניה.
          </li>
        </ul>

        <OwnershipCalculator />

        <Callout title="חשוב לדעת" variant="warning">
          <p>
            בעלות היא גם סיכון. אם לחברה הולך רע, ערך המניה יורד. במקרה הקיצוני של{' '}
            <Term he="פשיטת רגל" en="Bankruptcy" />, בעלי המניות אחרונים בתור לקבל כסף, אחרי
            הבנקים, בעלי האג״ח והספקים. לרוב לא נשאר להם כלום.
          </p>
        </Callout>

        <Simple>
          <p>תחשבו על פיצה שחתכו למיליון משולשים. מניה היא משולש אחד. אם הפיצרייה מרוויחה ומתרחבת, המשולש שלכם שווה יותר. אם היא נסגרת, הוא עלול להיות שווה אפס.</p>
        </Simple>
        <Deep>
          <p>לא כל המניות זהות. <Term he="מניות בכורה" en="Preferred Stock" /> מקבלות דיבידנד לפני המניות הרגילות, ובדרך כלל בלי זכות הצבעה. בחלק מהחברות יש כמה סוגי מניות עם כוח הצבעה שונה (Dual-Class), וכך המייסדים שולטים בחברה גם כשיש להם מיעוט מההון.</p>
          <p>ועוד מושג שכדאי להכיר: <Term he="דילול" en="Dilution" />. כשהחברה מנפיקה מניות חדשות, מספר המניות גדל, והאחוז שלכם בחברה קטן, גם אם לא מכרתם כלום.</p>
        </Deep>
      </section>

      {/* ---------- 2. בורסה ---------- */}
      <section aria-labelledby="exchange">
        <SectionTitle num="1.2">
          <span id="exchange">מה זו בורסה</span>
        </SectionTitle>
        <p>
          <Term he="בורסה" en="Stock Exchange" /> היא שוק. ממש כמו שוק הכרמל, רק שבמקום עגבניות
          קונים ומוכרים בה <Term he="ניירות ערך" en="Securities" />. התפקיד שלה הוא לחבר בין מי
          שרוצה לקנות לבין מי שרוצה למכור, לפי כללים ברורים ובשקיפות מלאה: כולם רואים את אותם
          מחירים באותו רגע.
        </p>
        <p>
          לבורסה לא פונים ישירות. עוברים דרך <Term he="ברוקר" en="Broker" />: בנק או בית השקעות
          שפותח לכם <Term he="חשבון מסחר" en="Trading Account" /> ושולח את הפקודות שלכם לבורסה.
        </p>

        <ol className="flow" aria-label="המסלול של פקודת קנייה">
          {FLOW.map((step, i) => (
            <li key={step.who} className="flow__step">
              <span className="flow__index mono">{String(i + 1).padStart(2, '0')}</span>
              <strong className="flow__who">{step.who}</strong>
              <span className="flow__what">{step.what}</span>
            </li>
          ))}
        </ol>

        <p>
          בישראל יש את <Term he="הבורסה לניירות ערך בתל אביב" en="TASE" />. בארה״ב פועלות שתי
          הבורסות הגדולות בעולם: <bdi className="mono">NYSE</bdi> ו-
          <bdi className="mono">NASDAQ</bdi>.
        </p>

        <Simple>
          <p>הבורסה היא המקום, והברוקר הוא הדלת. אתם לא נכנסים לבורסה בעצמכם, אלא מבקשים מהברוקר (בנק או אפליקציית מסחר) לקנות או למכור בשבילכם.</p>
        </Simple>
        <Deep>
          <p>בארה״ב המסחר הרגיל מתקיים בין <bdi className="mono">9:30</bdi> ל-<bdi className="mono">16:00</bdi> שעון ניו יורק, כלומר ברוב השנה בין <bdi className="mono">16:30</bdi> ל-<bdi className="mono">23:00</bdi> שעון ישראל. יש גם מסחר מוקדם ומאוחר (Pre-Market / After-Hours), עם פחות משתתפים ומרווחים רחבים יותר.</p>
          <p>פקודה לא תמיד מבוצעת בבורסה עצמה: בארה״ב חלק גדול מהפקודות של משקיעים פרטיים מבוצע אצל עושי שוק ובמערכות מסחר אחרות, בפיקוח של רשות ניירות הערך האמריקאית (SEC).</p>
        </Deep>
      </section>

      {/* ---------- 3. ראשוני מול משני ---------- */}
      <section aria-labelledby="markets">
        <SectionTitle num="1.3">
          <span id="markets">שוק ראשוני מול שוק משני</span>
        </SectionTitle>
        <p>
          לכל מניה יש שני שלבים בחיים. בפעם הראשונה החברה עצמה מוכרת אותה, ומאז היא עוברת מיד
          ליד בין משקיעים. זה אולי נשמע טכני, אבל זה משנה לגמרי את התשובה לשאלה ״לאן הכסף שלי
          הולך?״.
        </p>

        <div className="markets">
          <div className="markets__card markets__card--primary">
            <p className="markets__tag mono" dir="ltr">
              PRIMARY
            </p>
            <h3>
              <Term he="שוק ראשוני" en="Primary Market" />
            </h3>
            <p>
              החברה מוכרת מניות חדשות לציבור. בפעם הראשונה זה נקרא{' '}
              <Term he="הנפקה ראשונית לציבור" en="IPO" />.
            </p>
            <p className="markets__money">
              <span>מי מקבל את הכסף?</span> החברה. היא משתמשת בו כדי לגדול: לגייס עובדים, לפתח
              מוצרים, לפתוח סניפים.
            </p>
          </div>

          <div className="markets__card markets__card--secondary">
            <p className="markets__tag mono" dir="ltr">
              SECONDARY
            </p>
            <h3>
              <Term he="שוק משני" en="Secondary Market" />
            </h3>
            <p>
              משקיעים קונים ומוכרים זה מזה מניות שכבר קיימות, דרך הבורסה. כמעט כל המסחר היומיומי
              קורה כאן.
            </p>
            <p className="markets__money">
              <span>מי מקבל את הכסף?</span> המשקיע שמכר לכם. החברה עצמה לא רואה מזה שקל.
            </p>
          </div>
        </div>

        <Simple>
          <p>
            קניתם היום מניה של אפל? לא נתתם כסף לאפל. נתתם אותו למישהו שהחזיק את המניה ורצה
            למכור. אפל קיבלה כסף רק פעם אחת, כשהנפיקה את המניות.
          </p>
        </Simple>
        <Deep>
          <p>
            גם חברה שכבר נסחרת יכולה לחזור לשוק הראשוני: היא מנפיקה מניות נוספות ב
            <Term he="הנפקת המשך" en="Follow-on Offering" /> כדי לגייס כסף. יש יותר מניות, ולכן כל מניה קיימת
            מייצגת חלק קטן יותר מהחברה.
          </p>
          <p>
            ובכיוון ההפוך, חברה יכולה לקנות מניות של עצמה בשוק המשני, ב
            <Term he="רכישה עצמית" en="Buyback" />. מספר המניות קטן, והחלק של כל בעל מניות שנשאר גדל.
          </p>
        </Deep>
      </section>

      {/* ---------- 4. Bid / Ask ---------- */}
      <section aria-labelledby="bid-ask">
        <SectionTitle num="1.4">
          <span id="bid-ask">Bid ו-Ask: לכל מניה יש שני מחירים</span>
        </SectionTitle>
        <p>
          כשמסתכלים על מניה בזמן אמת, אין לה מחיר אחד. בכל רגע יש קונים שמחכים עם הצעות, ומוכרים
          שמחכים עם הצעות משלהם. יוצא שיש שני מחירים:
        </p>
        <ul className="bullets">
          <li>
            <Term he="מחיר ביקוש" en="Bid" />: ההצעה <strong>הגבוהה ביותר</strong> שקונה כלשהו
            מוכן לשלם כרגע.
          </li>
          <li>
            <Term he="מחיר היצע" en="Ask" />: ההצעה <strong>הנמוכה ביותר</strong> שמוכר כלשהו
            מוכן לקבל כרגע.
          </li>
          <li>
            <Term he="מרווח" en="Spread" />: ההפרש בין השניים.
          </li>
        </ul>

        <div className="book-snapshot">
          <table className="book" dir="ltr">
            <caption>
              תמונת מצב של <Term he="ספר הפקודות" en="Order Book" />
            </caption>
            <thead>
              <tr>
                <th scope="col">Price</th>
                <th scope="col">Size</th>
                <th scope="col">Side</th>
              </tr>
            </thead>
            <tbody>
              {BOOK.asks.map((row, i) => (
                <tr key={row.price} className={`book__ask${i === BOOK.asks.length - 1 ? ' book__best' : ''}`}>
                  <td>{row.price}</td>
                  <td>{row.size}</td>
                  <td>{i === BOOK.asks.length - 1 ? 'ASK ◀ best' : 'ask'}</td>
                </tr>
              ))}
              <tr className="book__spread">
                <td colSpan="3">spread 0.05</td>
              </tr>
              {BOOK.bids.map((row, i) => (
                <tr key={row.price} className={`book__bid${i === 0 ? ' book__best' : ''}`}>
                  <td>{row.price}</td>
                  <td>{row.size}</td>
                  <td>{i === 0 ? 'BID ◀ best' : 'bid'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="book-snapshot__explain">
            <p>
              <strong className="is-down">רוצים לקנות עכשיו?</strong> תשלמו את מחיר ההיצע{' '}
              (<bdi>Ask</bdi>), כלומר <bdi className="mono">100.03</bdi> למניה.
            </p>
            <p>
              <strong className="is-up">רוצים למכור עכשיו?</strong> תקבלו את מחיר הביקוש{' '}
              (<bdi>Bid</bdi>), כלומר <bdi className="mono">99.98</bdi> למניה.
            </p>
            <p>
              אם תקנו ותמכרו מיד, תפסידו את המרווח (<span className="mono">0.05</span> למניה) גם
              אם המחיר לא זז בכלל. זה המחיר של המיידיות. במניות גדולות עם הרבה מסחר המרווח זעיר,
              ובמניות קטנות עם מעט מסחר הוא יכול להיות גדול מאוד.
            </p>
          </div>
        </div>

        <Callout title="ומה זה ״המחיר״ שמופיע באפליקציה?">
          <p>
            בדרך כלל זה <Term he="המחיר האחרון" en="Last" />: המחיר שבו בוצעה העסקה האחרונה. הוא
            תמיד נמצא בסביבת ה-Bid וה-Ask, כי כל עסקה קורית כשקונה ומוכר מסכימים על מחיר.
          </p>
        </Callout>

        <Simple>
          <p>כמו בחלפן כספים: יש מחיר שבו הוא קונה מכם דולרים, ומחיר גבוה יותר שבו הוא מוכר לכם. ההפרש הוא הרווח שלו. בבורסה ההפרש הזה הוא המרווח, ומי שרוצה לבצע עכשיו משלם אותו.</p>
        </Simple>
        <Deep>
          <p>כדאי לחשוב על המרווח באחוזים: <bdi className="mono">0.05</bdi> על מניה של <bdi className="mono">100</bdi> זה <bdi className="mono">0.05%</bdi>, אבל <bdi className="mono">0.05</bdi> על מניה של <bdi className="mono">2</bdi> זה <bdi className="mono">2.5%</bdi>. זה ההבדל בין עלות זניחה לעלות שמרגישים בכל עסקה.</p>
          <p>חשוב גם ה״עומק״: כמה מניות מחכות בכל רמת מחיר. פקודה גדולה יכולה לעבור כמה רמות בספר, וזה בדיוק הנושא של מודול 02. מי שמציב הצעות קבועות בשני הצדדים ומרוויח מהמרווח נקרא <Term he="עושה שוק" en="Market Maker" />.</p>
        </Deep>
      </section>

      {/* ---------- 5. סימולטור ---------- */}
      <section aria-labelledby="simulator">
        <SectionTitle num="1.5">
          <span id="simulator">למה המחיר זז: לחץ קונים מול מוכרים</span>
        </SectionTitle>
        <p>
          מחיר של מניה זז בגלל דבר אחד: חוסר איזון בין קונים למוכרים. כשיש יותר קונים נלהבים
          ממוכרים, הקונים מסכימים לשלם יותר, ״מטפסים״ על ה-Ask, והמחיר עולה. כשהמוכרים לחוצים
          יותר, הם מסכימים לקבל פחות, יורדים עד ה-Bid, והמחיר נופל.
        </p>
        <p>
          הגרף שלמטה בנוי מ<Term he="נרות" en="Candlesticks" />. כל נר מסכם פרק זמן בארבעה
          מחירים: <Term he="פתיחה" en="Open" />, <Term he="גבוה" en="High" />,{' '}
          <Term he="נמוך" en="Low" /> ו<Term he="סגירה" en="Close" />.{' '}
          <strong className="is-up">נר טורקיז</strong> נסגר מעל מחיר הפתיחה (עלייה),{' '}
          <strong className="is-down">נר ורוד</strong> נסגר מתחתיו (ירידה). הקווים הדקים מעל
          ומתחת לגוף הנר הם <Term he="הפתילים" en="Wicks" />, והם מראים לאן המחיר הגיע בדרך.
        </p>

        <MarketPressureSimulator />

        <h3>נסו בעצמכם</h3>
        <ul className="bullets">
          <li>
            הזיזו את הקונים ל-85 ואת המוכרים ל-20, וצפו בשורה של נרות טורקיז. שימו לב לפתילים
            התחתונים: גם בזמן עלייה המחיר יורד קצת בדרך.
          </li>
          <li>
            השוו את שני הלחצים. המחיר ״ירקוד״ במקום, והנרות יהיו קטנים עם פתילים לשני הכיוונים.
          </li>
          <li>
            הורידו את שניהם כמעט לאפס, ושימו לב מה קורה למרווח (Spread). כשאין מספיק משתתפים,
            הפער בין הקונים למוכרים גדל.
          </li>
        </ul>

        <Simple>
          <p>כשיותר אנשים רוצים לקנות מאשר למכור, המחיר עולה. כשיותר רוצים למכור, הוא יורד. זה הכול. הסימולטור רק מראה את זה בנרות.</p>
        </Simple>
        <Deep>
          <p>במציאות ״לחץ״ הוא לא מספר האנשים, אלא כמה מניות נקנות או נמכרות בפקודות שמתבצעות מיד, מול כמה שמחכות בספר. חדשות משנות את הנכונות לשלם, ונפח מסחר גבוה מראה שהתנועה נתמכת בהרבה משתתפים (מודול 03).</p>
          <p>הסימולטור אקראי ומפושט: אין בו חדשות ואין בו עושי שוק, והמחיר שלו לא קשור לערך של חברה אמיתית.</p>
        </Deep>
      </section>

      {/* ---------- סיכום ---------- */}
      <section aria-labelledby="summary">
        <SectionTitle num="✓">
          <span id="summary">מה לוקחים מהמודול</span>
        </SectionTitle>
        <ul className="takeaways">
          <li>מניה היא חלק בבעלות על חברה, עם זכות לחלק מהרווחים ולהצבעה.</li>
          <li>הבורסה מחברת בין קונים למוכרים, וניגשים אליה דרך ברוקר.</li>
          <li>בשוק הראשוני החברה מגייסת כסף. בשוק המשני משקיעים סוחרים ביניהם.</li>
          <li>
            Bid הוא מה שהקונים מציעים, Ask הוא מה שהמוכרים מבקשים, והמרווח ביניהם הוא המחיר של
            עסקה מיידית.
          </li>
          <li>המחיר זז לפי חוסר האיזון בין לחץ הקונים ללחץ המוכרים.</li>
        </ul>
      </section>
    </ModuleLayout>
  )
}
