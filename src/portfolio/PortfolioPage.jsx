import { useState } from 'react'
import { Link } from 'react-router'
import Callout from '../components/Callout.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatDate } from '../progress/formatDate.js'
import { usd, signedUsd, signedPct, pct, shares, tone } from './format.js'
import { usePortfolio } from './PortfolioContext.js'
import { canDelete, computePortfolio, daysSince, sortTransactions } from './portfolio.js'
import PriceInput from './PriceInput.jsx'
import TransactionForm from './TransactionForm.jsx'
import './PortfolioPage.css'

function Summary({ totals }) {
  // בלי אף מחיר נוכחי אין שווי: מציגים ״—״ ולא $0, שהיה מספר לא נכון
  const priced = totals.openCount - totals.missingPrices > 0
  const items = [
    ['עלות הפוזיציות הפתוחות', usd(totals.openCost), ''],
    ['שווי נוכחי', priced ? usd(totals.value) : '—', ''],
    ['רווח/הפסד לא ממומש', priced ? signedUsd(totals.unrealized) : '—', priced ? tone(totals.unrealized) : ''],
    ['תשואה על העלות', priced ? signedPct(totals.unrealizedPct) : '—', priced ? tone(totals.unrealized) : ''],
    ['רווח/הפסד ממומש (ממכירות)', signedUsd(totals.realized), tone(totals.realized)],
  ]
  return (
    <section aria-labelledby="pf-summary">
      <h2 id="pf-summary" className="pf__h2">
        סיכום
      </h2>
      <dl className="pf-summary">
        {items.map(([label, value, cls]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className={`mono ${cls}`}>
              <bdi>{value}</bdi>
            </dd>
          </div>
        ))}
      </dl>
      {totals.missingPrices > 0 && (
        <p className="pf__note">
          {totals.missingPrices === 1
            ? 'למניה אחת עדיין אין מחיר נוכחי, ולכן היא לא נכללת בשווי ובתשואה.'
            : `ל-${totals.missingPrices} מניות עדיין אין מחיר נוכחי, ולכן הן לא נכללות בשווי ובתשואה.`}{' '}
          מעדכנים את המחיר בטבלה שלמטה.
        </p>
      )}
    </section>
  )
}

function Holdings({ positions }) {
  const open = positions.filter((p) => p.shares > 0)
  if (!open.length) return null
  return (
    <section aria-labelledby="pf-holdings">
      <h2 id="pf-holdings" className="pf__h2">
        המניות בתיק
      </h2>
      <p className="pf__hint">
        את המחיר הנוכחי בודקים באפליקציה של הברוקר ומקלידים כאן. הוא נשמר עם תאריך העדכון, כדי שיהיה ברור עד כמה הוא
        עדכני.
      </p>
      <div className="pf-table-wrap" tabIndex={0} role="region" aria-label="טבלת המניות בתיק">
        <table className="pf-table">
          <thead>
            <tr>
              <th scope="col">סימול</th>
              <th scope="col">מניות</th>
              <th scope="col">עלות ממוצעת</th>
              <th scope="col">עלות</th>
              <th scope="col">מחיר נוכחי</th>
              <th scope="col">שווי</th>
              <th scope="col">רווח/הפסד</th>
              <th scope="col">משקל בתיק</th>
            </tr>
          </thead>
          <tbody>
            {open.map((p) => {
              const age = p.priceUpdatedAt ? daysSince(p.priceUpdatedAt) : null
              return (
                <tr key={p.symbol}>
                  <th scope="row" className="mono">
                    <bdi>{p.symbol}</bdi>
                    <span className="pf-table__since">מאז {formatDate(p.firstDate)}</span>
                  </th>
                  <td className="mono">
                    <bdi>{shares(p.shares)}</bdi>
                  </td>
                  <td className="mono">
                    <bdi>{usd(p.avgCost)}</bdi>
                  </td>
                  <td className="mono">
                    <bdi>{usd(p.cost)}</bdi>
                  </td>
                  <td>
                    {/* key: אחרי עדכון מחיר, השדה מתאפס לערך השמור */}
                    <PriceInput key={`${p.symbol}-${p.price}`} symbol={p.symbol} price={p.price} />
                    <span className="pf-table__updated">
                      {p.priceUpdatedAt
                        ? `עודכן ${formatDate(p.priceUpdatedAt)}${age >= 1 ? ` (לפני ${age === 1 ? 'יום' : `${age} ימים`})` : ''}`
                        : 'עוד לא הוזן מחיר'}
                    </span>
                  </td>
                  <td className="mono">
                    <bdi>{usd(p.value)}</bdi>
                  </td>
                  <td className={`mono ${tone(p.unrealized)}`}>
                    <bdi>{signedUsd(p.unrealized)}</bdi>
                    <span className="pf-table__pct">
                      <bdi>{signedPct(p.unrealizedPct)}</bdi>
                    </span>
                  </td>
                  <td className="mono">
                    <bdi>{pct(p.weight)}</bdi>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Closed({ positions }) {
  const closed = positions.filter((p) => p.shares === 0)
  if (!closed.length) return null
  return (
    <section aria-labelledby="pf-closed">
      <h2 id="pf-closed" className="pf__h2">
        מניות שנמכרו במלואן
      </h2>
      <ul className="pf-closed">
        {closed.map((p) => (
          <li key={p.symbol}>
            <bdi className="mono">{p.symbol}</bdi>: רווח/הפסד ממומש{' '}
            <bdi className={`mono ${tone(p.realized)}`}>{signedUsd(p.realized)}</bdi>
          </li>
        ))}
      </ul>
    </section>
  )
}

function TransactionRow({ t, all }) {
  const { deleteTransaction } = usePortfolio()
  const [confirming, setConfirming] = useState(false)
  const deletable = canDelete(t.id, all)
  return (
    <tr>
      <td className="mono">
        <bdi>{formatDate(t.date)}</bdi>
      </td>
      <td>{t.type === 'buy' ? 'קנייה' : 'מכירה'}</td>
      <td className="mono">
        <bdi>{t.symbol}</bdi>
      </td>
      <td className="mono">
        <bdi>{shares(t.shares)}</bdi>
      </td>
      <td className="mono">
        <bdi>{usd(t.price)}</bdi>
      </td>
      <td className="mono">
        <bdi>{usd(t.fees)}</bdi>
      </td>
      <td>
        {!deletable ? (
          <span className="pf-table__muted">יש מכירה שתלויה בה</span>
        ) : confirming ? (
          <span className="pf-table__confirm">
            <button type="button" className="chip chip--danger" onClick={() => deleteTransaction(t.id)}>
              למחוק?
            </button>
            <button type="button" className="chip" onClick={() => setConfirming(false)}>
              ביטול
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="chip"
            aria-label={`מחיקת ה${t.type === 'buy' ? 'קנייה' : 'מכירה'} של ${t.symbol} מ-${formatDate(t.date)}`}
            onClick={() => setConfirming(true)}
          >
            מחיקה
          </button>
        )}
      </td>
    </tr>
  )
}

function Transactions({ transactions }) {
  if (!transactions.length) return null
  const sorted = sortTransactions(transactions).reverse()
  return (
    <section aria-labelledby="pf-tx">
      <h2 id="pf-tx" className="pf__h2">
        כל העסקאות
      </h2>
      <div className="pf-table-wrap" tabIndex={0} role="region" aria-label="רשימת העסקאות">
        <table className="pf-table pf-table--tx">
          <thead>
            <tr>
              <th scope="col">תאריך</th>
              <th scope="col">סוג</th>
              <th scope="col">סימול</th>
              <th scope="col">מניות</th>
              <th scope="col">מחיר</th>
              <th scope="col">עמלה</th>
              <th scope="col">
                <span className="visually-hidden">פעולות</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => (
              <TransactionRow key={t.id} t={t} all={transactions} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function PortfolioPage() {
  useDocumentTitle('התיק שלי')
  const { transactions, prices } = usePortfolio()
  const { positions, totals } = computePortfolio(transactions, prices)

  return (
    <article className="pf">
      <nav className="lesson__breadcrumb" aria-label="ניווט">
        <Link to="/">→ דף הבית</Link>
      </nav>
      <header className="pf__header">
        <h1 className="pf__title">התיק שלי</h1>
        <p className="pf__lead">
          כאן מזינים עסקאות שביצעתם אצל הברוקר שלכם, למשל בבלינק או באינטראקטיב, ורואים מה הכסף עשה מאז. אנחנו לא
          מבצעים עסקאות ולא מחוברים לחשבון שלכם: הכול מבוסס על מה שמזינים כאן.
        </p>
        <p className="pf__privacy">
          הנתונים נשמרים רק בדפדפן הזה, במכשיר הזה. פרטים ב<Link to="/privacy">מדיניות הפרטיות</Link>.
        </p>
      </header>

      {transactions.length === 0 ? (
        <p className="pf__empty">
          עוד אין עסקאות בתיק. מוסיפים את הקנייה הראשונה בטופס שלמטה: סימול המניה, התאריך, הכמות (או הסכום בדולרים)
          והמחיר ששילמתם.
        </p>
      ) : (
        <>
          <Summary totals={totals} />
          <Holdings positions={positions} />
          <Closed positions={positions} />
        </>
      )}

      <TransactionForm />
      <Transactions transactions={transactions} />

      <Callout title="חשוב לדעת" variant="warning">
        <p>
          החישוב מבוסס רק על הנתונים שהזנתם, בשיטת העלות הממוצעת, ובדולרים. הוא לא מחשב מס ולא שער חליפין, ויכול להיות
          שונה מהדוחות של הברוקר. זה כלי מעקב אישי, לא ייעוץ השקעות ולא המלצה לקנות או למכור.
        </p>
      </Callout>
    </article>
  )
}
