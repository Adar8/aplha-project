import Callout from '../../components/Callout.jsx'
import { Deep, Simple } from '../../profile/Depth.jsx'
import ModuleLayout from '../../components/ModuleLayout.jsx'
import Term from '../../components/Term.jsx'
import { getModule } from '../../data/modules.js'
import OrderBookSimulator from './OrderBookSimulator.jsx'
import './OrderTypes.css'

const lesson = getModule('order-types')

const ANATOMY = [
  { he: 'כיוון', en: 'Side', text: 'קנייה או מכירה.' },
  { he: 'כמות', en: 'Quantity', text: 'כמה מניות.' },
  { he: 'סוג פקודה', en: 'Order Type', text: 'לבצע מיד בכל מחיר, או רק במחיר שקבעתם.' },
  { he: 'מחיר גבול', en: 'Limit Price', text: 'רק בפקודה מוגבלת: הגבול שלכם.' },
]

// דוגמה: פקודת שוק לקניית 600 מניות "מטפסת" בספר
const WALK = [
  { price: '100.08', size: 300, take: 0 },
  { price: '100.05', size: 500, take: 400 },
  { price: '100.03', size: 200, take: 200 },
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

export default function OrderTypes() {
  return (
    <ModuleLayout
      module={lesson}
      intro="החלטתם לקנות. עכשיו צריך להגיד לברוקר איך. במודול הזה נכיר את שני סוגי הפקודות הבסיסיים, פקודת שוק ופקודה מוגבלת, ונראה בדיוק מה קורה בספר הפקודות כששולחים כל אחת מהן."
    >
      {/* ---------- 2.1 ---------- */}
      <section aria-labelledby="anatomy">
        <SectionTitle num="2.1" id="anatomy">
          מה יש בתוך פקודה
        </SectionTitle>
        <p>
          <Term he="פקודה" en="Order" /> היא הוראה לברוקר, והיא תמיד בנויה מאותם חלקים:
        </p>
        <dl className="anatomy">
          {ANATOMY.map((item) => (
            <div key={item.en} className="anatomy__item">
              <dt>
                <Term he={item.he} en={item.en} />
              </dt>
              <dd>{item.text}</dd>
            </div>
          ))}
        </dl>
        <p>
          ברוב הפלטפורמות יש גם <Term he="תוקף" en="Time in Force" />: למשל פקודה יומית{' '}
          (<bdi>Day</bdi>) שמתבטלת בסוף יום המסחר, או פקודה עד ביטול (<bdi>GTC</bdi>). בשלב הזה
          מספיק לדעת שזה קיים.
        </p>

        <Simple>
          <p>פקודה היא כמו הזמנה במסעדה: מה (איזו מניה), כמה, לקנות או למכור, ואיך. ״תביא מה שיש עכשיו״ זו פקודת שוק. ״רק אם זה עולה עד X״ זו פקודה מוגבלת.</p>
        </Simple>
        <Deep>
          <p>סוגי תוקף נוספים: <bdi className="mono">IOC</bdi> (Immediate or Cancel) מבצעת מה שאפשר מיד ומבטלת את השאר. <bdi className="mono">FOK</bdi> (Fill or Kill) מבצעת את כל הכמות מיד, או כלום.</p>
          <p>ויש פקודות מותנות, שמחכות ״בצד״ עד שהמחיר מגיע לרמה מסוימת. הנפוצה היא <Term he="פקודת סטופ" en="Stop Order" />, שנפגוש במודול 04.</p>
        </Deep>
      </section>

      {/* ---------- 2.2 ---------- */}
      <section aria-labelledby="market">
        <SectionTitle num="2.2" id="market">
          פקודת שוק: עכשיו, בכל מחיר
        </SectionTitle>
        <p>
          <Term he="פקודת שוק" en="Market Order" /> אומרת לברוקר: ״תקנה עכשיו, במחיר הכי טוב שיש
          כרגע.״ היא מתבצעת מיד מול ההצעות שכבר מחכות בספר: פקודת קנייה מול ה-Ask, פקודת מכירה
          מול ה-Bid.
        </p>
        <p>
          הבעיה מתחילה כשהכמות שלכם גדולה ממה שמחכה במחיר הכי טוב. הפקודה לא נעצרת: היא ״אוכלת״
          את הרמה הראשונה בספר, ממשיכה לרמה הבאה, ואחריה לעוד אחת, עד שהיא מתמלאת.
        </p>

        <figure className="walk">
          <figcaption>
            פקודת שוק לקניית <span className="mono">600</span> מניות, מול צד המוכרים בספר:
          </figcaption>
          <table className="walk__table" dir="ltr">
            <thead>
              <tr>
                <th scope="col">Ask</th>
                <th scope="col">Size</th>
                <th scope="col">Taken</th>
              </tr>
            </thead>
            <tbody>
              {WALK.map((row) => (
                <tr key={row.price} className={row.take ? 'walk__hit' : ''}>
                  <td>{row.price}</td>
                  <td>
                    <span className="walk__bar">
                      <span style={{ inlineSize: `${(row.take / row.size) * 100}%` }} />
                    </span>
                    {row.size}
                  </td>
                  <td>{row.take ? `−${row.take}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="walk__result">
            <div>
              <dt>המחיר שראיתם על המסך</dt>
              <dd className="mono">100.03</dd>
            </div>
            <div>
              <dt>המחיר הממוצע שקיבלתם</dt>
              <dd className="mono is-down">100.043</dd>
            </div>
            <div>
              <dt>כמה ההחלקה עלתה לכם</dt>
              <dd className="mono is-down">₪8</dd>
            </div>
          </dl>
        </figure>

        <p>
          הפער בין המחיר שראיתם לבין המחיר הממוצע שקיבלתם נקרא <Term he="החלקה" en="Slippage" />.
          במניה גדולה עם הרבה <Term he="נזילות" en="Liquidity" />, כלומר הרבה קונים ומוכרים בכל
          רמת מחיר, ההחלקה זניחה. במניה קטנה, בפתיחת המסחר או סביב חדשות, היא יכולה להיות כואבת.
        </p>

        <Callout title="פקודת שוק מבטיחה ביצוע, לא מחיר" variant="warning">
          <p>
            אתם יודעים בוודאות שהעסקה תתבצע, אבל לא יודעים מראש בכמה. אם הספר ״דליל״, אתם עלולים
            לשלם הרבה יותר ממה שחשבתם.
          </p>
        </Callout>

        <Simple>
          <p>פקודת שוק היא ״תן לי עכשיו, לא משנה כמה״. בכמות קטנה במניה גדולה זה כמעט תמיד בסדר. בכמות גדולה, או במניה שנסחרת מעט, אפשר לשלם יותר ממה שראיתם על המסך.</p>
        </Simple>
        <Deep>
          <p>המחיר הממוצע הוא סכום (מחיר × כמות) בכל רמה, חלקי הכמות הכוללת. בדוגמה: <bdi className="mono">100.043 − 100.03 = 0.013</bdi> למניה, כפול <bdi className="mono">600</bdi> מניות, יוצא בערך <bdi className="mono">₪8</bdi>.</p>
          <p>ההחלקה גדלה בפתיחת המסחר, כשהספר עוד לא התייצב, סביב פרסום נתונים, כשעושי שוק מושכים הצעות, ובמסחר מחוץ לשעות הרגילות. ברוקרים בארה״ב מחויבים לחתור ל״ביצוע הטוב ביותר״ (Best Execution), אבל זה לא מבטיח מחיר.</p>
        </Deep>
      </section>

      {/* ---------- 2.3 ---------- */}
      <section aria-labelledby="limit">
        <SectionTitle num="2.3" id="limit">
          פקודה מוגבלת: רק במחיר שלי
        </SectionTitle>
        <p>
          <Term he="פקודה מוגבלת" en="Limit Order" /> (בשפת היום-יום: ״פקודת לימיט״) אומרת: ״תקנה,
          אבל לא ביותר מ-X.״ בפקודת מכירה: ״תמכור, אבל לא בפחות מ-X.״ המחיר שקבעתם הוא הגבול, ואף
          פעם לא תקבלו מחיר גרוע ממנו.
        </p>
        <p>מה שקורה אחרי השליחה תלוי במקום שבו שמתם את הגבול:</p>

        <div className="cases">
          <div className="cases__card cases__card--cross">
            <p className="cases__tag mono" dir="ltr">
              LIMIT ≥ ASK
            </p>
            <h3>הגבול ״חוצה״ את המרווח</h3>
            <p>
              קנייה מוגבלת ב-<bdi className="mono">100.06</bdi> כשה-Ask הוא{' '}
              <bdi className="mono">100.03</bdi>: הפקודה מתבצעת מיד, כמו פקודת שוק, אבל עוצרת
              ב-<bdi className="mono">100.06</bdi>. מה שלא התמלא עד הגבול נשאר לחכות בספר.
            </p>
          </div>
          <div className="cases__card cases__card--rest">
            <p className="cases__tag mono" dir="ltr">
              LIMIT &lt; ASK
            </p>
            <h3>הגבול מתחת ל-Ask</h3>
            <p>
              קנייה מוגבלת ב-<bdi className="mono">99.98</bdi>: אין מוכר שמוכן למחיר הזה כרגע, אז
              הפקודה נכנסת לספר ומחכה. מהרגע הזה אתם חלק מה-Bid, ואחרים רואים את ההצעה שלכם.
            </p>
          </div>
        </div>

        <p>
          פקודה שמחכה בספר עומדת בתור. הבורסה מבצעת לפי{' '}
          <Term he="עדיפות מחיר-זמן" en="Price-Time Priority" />: קודם המחיר הטוב ביותר, ובמחיר
          זהה, מי שהגיע ראשון. אם לפניכם כבר מחכות 400 מניות באותו מחיר, הן יתבצעו לפניכם.
        </p>

        <Callout title="פקודה מוגבלת מבטיחה מחיר, לא ביצוע" variant="simple">
          <p>
            אם המחיר ברח ולא חזר, הפקודה פשוט לא תתבצע ואתם ״מפספסים״ את העסקה. זה המחיר של
            השליטה. ייתכן גם <Term he="ביצוע חלקי" en="Partial Fill" />: רק חלק מהכמות מתבצע, והשאר
            ממשיך לחכות.
          </p>
        </Callout>

        <Simple>
          <p>פקודה מוגבלת היא ״אני קונה, אבל לא ביותר מ-X״. אם אין מי שמוכר ב-X, מחכים. אולי הוא יבוא, ואולי לא.</p>
        </Simple>
        <Deep>
          <p>מי שמכניס פקודה שמחכה בספר ״מספק נזילות״ (Maker), ומי שמבצע מול הספר ״לוקח נזילות״ (Taker). אצל חלק מהבורסות והברוקרים העמלה שונה לכל אחד מהם.</p>
          <p>יש לפקודה ממתינה גם חיסרון פחות מוכר: היא מתבצעת בדיוק כשמישהו אחר מחליט למכור לכם, לפעמים כי הוא יודע משהו שאתם עוד לא יודעים. לזה קוראים ״בחירה שלילית״ (Adverse Selection).</p>
        </Deep>
      </section>

      {/* ---------- 2.4 ---------- */}
      <section aria-labelledby="compare">
        <SectionTitle num="2.4" id="compare">
          השוואה מהירה
        </SectionTitle>
        <div className="compare-wrap" tabIndex={0} role="region" aria-label="טבלת השוואה: פקודת שוק מול פקודה מוגבלת">
          <table className="compare">
            <thead>
              <tr>
                <td />
                <th scope="col" className="compare__market">
                  פקודת שוק
                </th>
                <th scope="col" className="compare__limit">
                  פקודה מוגבלת
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">מה מובטח</th>
                <td>ביצוע</td>
                <td>מחיר (או טוב ממנו)</td>
              </tr>
              <tr>
                <th scope="row">מה לא מובטח</th>
                <td>המחיר</td>
                <td>הביצוע</td>
              </tr>
              <tr>
                <th scope="row">מהירות</th>
                <td>מיידית</td>
                <td>מיידית אם המחיר זמין, אחרת ממתינה בספר</td>
              </tr>
              <tr>
                <th scope="row">הסיכון העיקרי</th>
                <td>החלקה</td>
                <td>לפספס את העסקה</td>
              </tr>
              <tr>
                <th scope="row">מתאימה כש...</th>
                <td>המניה נזילה, הכמות קטנה, וחשוב לבצע עכשיו</td>
                <td>המניה פחות נזילה, הכמות גדולה, או שיש מחיר ברור שמוכנים לשלם</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          נוהג נפוץ אצל סוחרים: גם כשרוצים ביצוע מיידי, שולחים פקודה מוגבלת עם גבול קצת מעל
          ה-Ask. ככה מקבלים ביצוע מהיר, עם תקרה שמגנה מהפתעות.
        </p>

        <Simple>
          <p>שוק: בטוח שתקנו, לא בטוח בכמה. מוגבלת: בטוח בכמה, לא בטוח שתקנו.</p>
        </Simple>
        <Deep>
          <p>הנוהג שתואר למעלה, פקודה מוגבלת עם גבול קצת מעל ה-Ask, נקרא Marketable Limit. הוא נפוץ במיוחד במניות פחות נזילות ובמסחר מחוץ לשעות הרגילות, שבו ברוקרים רבים מאפשרים רק פקודות מוגבלות.</p>
        </Deep>
      </section>

      {/* ---------- 2.5 ---------- */}
      <section aria-labelledby="sim">
        <SectionTitle num="2.5" id="sim">
          סימולטור ספר פקודות
        </SectionTitle>
        <p>
          זה ספר פקודות חי של מניה דמיונית. בחרו כיוון, סוג פקודה וכמות, ולפני השליחה תראו מה
          בדיוק יקרה. הפקודות שלכם מסומנות בספר במסגרת, והכמות שלהן מופיעה בעמודה <bdi className="mono">Yours</bdi>.
        </p>

        <OrderBookSimulator />

        <h3>נסו בעצמכם</h3>
        <ul className="bullets">
          <li>
            שלחו קנייה בשוק של <span className="mono">1,000</span> מניות. בכמה רמות מחיר היא עברה,
            ומה הייתה ההחלקה?
          </li>
          <li>
            שלחו קנייה מוגבלת בגובה ה-Bid (כפתור Bid). מצאו אותה בספר ובדקו כמה מניות עומדות
            לפניכם בתור. עכשיו לחצו ״צעד בשוק״ וצפו בתור מתקצר. לפעמים המחיר ״בורח״ למעלה והפקודה
            לא מתבצעת בכלל: זה בדיוק הסיכון של פקודה מוגבלת.
          </li>
          <li>
            שלחו קנייה מוגבלת של <span className="mono">1,000</span> מניות במחיר שמעל ה-Ask. חלק
            יתבצע מיד וחלק יחכה בספר: זה בדיוק המקרה של גבול ״שחוצה״ את המרווח.
          </li>
          <li>
            נסו מכירה בשוק של <span className="mono">10,000</span> מניות. מה קרה ליתרה, ולמה?
          </li>
        </ul>

        <Simple>
          <p>בחרו קנייה, סוג ״שוק״ וכמות קטנה, ושלחו. שימו לב למחיר שקיבלתם. אחר כך נסו אותו דבר עם כמות גדולה, והשוו.</p>
        </Simple>
        <Deep>
          <p>שימו לב לעושי השוק בסימולטור: כשהמרווח מתרחב, הם מוסיפים הצעות וסוגרים אותו. בשוק אמיתי הם מרוויחים מהמרווח ומסתכנים בכך שהם מחזיקים מלאי. כשהם נסוגים, למשל סביב חדשות, הספר מתרוקן, ופקודות שוק הופכות ליקרות במיוחד.</p>
        </Deep>
      </section>

      {/* ---------- סיכום ---------- */}
      <section aria-labelledby="summary">
        <SectionTitle num="2.6" id="summary">
          מה לוקחים מהמודול
        </SectionTitle>
        <ul className="takeaways">
          <li>כל פקודה כוללת כיוון, כמות וסוג, ובפקודה מוגבלת גם מחיר גבול.</li>
          <li>פקודת שוק מתבצעת מיד מול הספר. היא מבטיחה ביצוע, אבל לא מחיר.</li>
          <li>
            כמות גדולה מול ספר דליל ״מטפסת״ על כמה רמות מחיר, וההפרש מהמחיר שראיתם הוא ההחלקה.
          </li>
          <li>
            פקודה מוגבלת מבטיחה מחיר או טוב ממנו, אבל לא ביצוע. אם היא לא מתבצעת מיד, היא נכנסת
            לספר ומחכה.
          </li>
          <li>בספר מבצעים לפי עדיפות מחיר-זמן: המחיר הטוב ביותר קודם, ובמחיר זהה מי שהגיע ראשון.</li>
        </ul>
      </section>
    </ModuleLayout>
  )
}
