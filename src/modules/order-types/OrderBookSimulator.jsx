import { useEffect, useRef, useState } from 'react'
import OrderBookTable from './OrderBookTable.jsx'
import {
  averagePrice,
  bestAsk,
  bestBid,
  cancelOrder,
  createBook,
  executeOrder,
  formatAverage,
  formatPrice,
  myOpenOrders,
  simulateMarket,
  toCents,
} from './orderBook.js'
import './OrderBookSimulator.css'

const LIVE_MS = 1400
const MAX_LOG = 8
const QTY_PRESETS = [100, 500, 1000]

const num = new Intl.NumberFormat('he-IL')
const SIDE_LABEL = { buy: 'קנייה', sell: 'מכירה' }
const TYPE_LABEL = { market: 'שוק', limit: 'מוגבלת' }

/** בודק את הטופס ומחזיר פקודה תקינה, או הודעת שגיאה */
function parseTicket(ticket) {
  const qty = Number(ticket.qty)
  if (!Number.isInteger(qty) || qty < 1 || qty > 10000) {
    return { error: 'כמות צריכה להיות מספר שלם בין 1 ל-10,000' }
  }
  if (ticket.type === 'market') return { order: { side: ticket.side, type: 'market', qty } }

  const price = Number(ticket.limit)
  if (!ticket.limit || !Number.isFinite(price) || price <= 0) {
    return { error: 'הזינו מחיר מוגבל חיובי' }
  }
  if (Math.abs(price * 100 - Math.round(price * 100)) > 1e-6) {
    return { error: 'המחיר צריך להיות בקפיצות של 0.01' }
  }
  return { order: { side: ticket.side, type: 'limit', qty, limit: toCents(price) } }
}

/** החלקה (Slippage) בסנטים ביחס למחיר הטוב ביותר ברגע השליחה. חיובי = גרוע יותר */
function slippage(side, fills, bestBefore) {
  const avg = averagePrice(fills)
  if (avg == null || bestBefore == null) return 0
  return side === 'buy' ? avg - bestBefore : bestBefore - avg
}

function sameSideQueue(book, order) {
  const list = order.side === 'buy' ? book.bids : book.asks
  return list.filter((o) => o.price === order.limit).reduce((sum, o) => sum + o.size, 0)
}

function Preview({ book, order }) {
  const result = executeOrder(book, order)
  const best = order.side === 'buy' ? bestAsk(book) : bestBid(book)
  const avg = averagePrice(result.fills)
  const slip = slippage(order.side, result.fills, best)
  const queue = result.restedId ? sameSideQueue(book, order) : 0
  const parts = []

  if (result.filled > 0) {
    parts.push(
      <p key="fill">
        <strong className="is-lime">תבוצע מיד{result.remaining ? ' חלקית' : ''}:</strong>{' '}
        <span className="mono">{num.format(result.filled)}</span> מניות במחיר ממוצע{' '}
        <bdi className="mono">{formatAverage(avg)}</bdi>
        {slip > 0.0001 && (
          <>
            {' '}
            (החלקה של <bdi className="mono">{(slip / 100).toFixed(3)}</bdi> למניה)
          </>
        )}
        .
      </p>,
    )
  }
  if (result.canceled) {
    parts.push(
      <p key="cancel" className="is-down">
        אין מספיק מניות בספר: <span className="mono">{num.format(result.canceled)}</span> מניות לא
        יבוצעו ויבוטלו.
      </p>,
    )
  }
  if (result.restedId) {
    parts.push(
      <p key="rest">
        <strong className="is-amber">{result.filled ? 'היתרה' : 'לא תבוצע מיד'}</strong>
        {result.filled ? ` (${num.format(result.remaining)} מניות)` : ''} תיכנס לספר כהצעת{' '}
        {order.side === 'buy' ? 'קנייה' : 'מכירה'} ב-<bdi className="mono">{formatPrice(order.limit)}</bdi>
        {queue > 0 ? (
          <>
            {' '}
            ותחכה בתור אחרי <span className="mono">{num.format(queue)}</span> מניות
            שכבר ממתינות באותו מחיר.
          </>
        ) : (
          ' ותהיה ראשונה בתור במחיר הזה.'
        )}
      </p>,
    )
  }
  if (result.selfCanceled.length) {
    parts.push(
      <p key="self" className="is-muted">
        פקודה פתוחה שלכם בצד השני תבוטל, כדי שלא תסחרו מול עצמכם.
      </p>,
    )
  }

  return (
    <div className="ticket__preview" aria-live="polite">
      <p className="ticket__preview-title">מה יקרה אם תשלחו עכשיו?</p>
      {parts}
    </div>
  )
}

export default function OrderBookSimulator() {
  const [book, setBook] = useState(createBook)
  const [ticket, setTicket] = useState({ side: 'buy', type: 'market', qty: '500', limit: '99.98' })
  const [report, setReport] = useState(null)
  const [log, setLog] = useState([])
  const [lastPrice, setLastPrice] = useState(null)
  const [live, setLive] = useState(false)
  const logId = useRef(0)

  const addLog = (entries) =>
    setLog((prev) =>
      [...entries.map((e) => ({ ...e, id: ++logId.current })).reverse(), ...prev].slice(0, MAX_LOG),
    )

  const { order, error } = parseTicket(ticket)
  const bid = bestBid(book)
  const ask = bestAsk(book)
  const openOrders = myOpenOrders(book)

  const update = (patch) => setTicket((t) => ({ ...t, ...patch }))

  const submit = (e) => {
    e.preventDefault()
    if (!order) return
    const bestBefore = order.side === 'buy' ? ask : bid
    const result = executeOrder(book, order)
    setBook(result.book)
    const spreadBefore = ask != null && bid != null ? ask - bid : null
    const afterAsk = bestAsk(result.book)
    const afterBid = bestBid(result.book)
    const spreadAfter = afterAsk != null && afterBid != null ? afterAsk - afterBid : null
    setReport({ order, ...result, bestBefore, spreadBefore, spreadAfter, avg: averagePrice(result.fills) })
    if (result.fills.length) setLastPrice(result.fills[result.fills.length - 1].price)

    const label = `${SIDE_LABEL[order.side]} ב${TYPE_LABEL[order.type]}`
    const entries = []
    if (result.filled) {
      entries.push({
        tone: 'me',
        text: `שלכם · ${label}: בוצעו ${num.format(result.filled)} מניות, ממוצע ${formatAverage(averagePrice(result.fills))}`,
      })
    }
    if (result.restedId) {
      entries.push({
        tone: 'me',
        text: `שלכם · ${label}: ${num.format(result.remaining)} מניות ממתינות בספר ב-${formatPrice(order.limit)}`,
      })
    }
    if (result.canceled) {
      entries.push({ tone: 'warn', text: `שלכם · ${num.format(result.canceled)} מניות בוטלו — לא היה מספיק היצע` })
    }
    addLog(entries)
  }

  const step = () => {
    const { book: next, trade, myFills } = simulateMarket(book)
    setBook(next)
    if (trade.last != null) setLastPrice(trade.last)
    const entries = [
      {
        tone: 'market',
        text: `סוחר אחר ${trade.side === 'buy' ? 'קנה' : 'מכר'} ${num.format(trade.qty)} מניות בפקודת שוק`,
      },
    ]
    for (const f of myFills) {
      entries.push({
        tone: 'fill',
        text: `הפקודה המוגבלת שלכם בוצעה: ${SIDE_LABEL[f.side]} ${num.format(f.size)} מניות ב-${formatPrice(f.price)}`,
      })
    }
    addLog(entries)
  }

  // מצב "שוק חי": צעד אוטומטי כל LIVE_MS
  const stepRef = useRef(step)
  useEffect(() => {
    stepRef.current = step
  })
  useEffect(() => {
    if (!live) return undefined
    const id = window.setInterval(() => stepRef.current(), LIVE_MS)
    return () => window.clearInterval(id)
  }, [live])

  const reset = () => {
    setLive(false)
    setBook(createBook())
    setReport(null)
    setLog([])
    setLastPrice(null)
  }

  const cancel = (id) => {
    setBook((b) => cancelOrder(b, id))
    addLog([{ tone: 'info', text: 'שלכם · פקודה מוגבלת בוטלה' }])
  }

  return (
    <div className="widget obsim">
      <span className="widget__tag" dir="ltr">
        SIMULATOR
      </span>
      <h3 className="widget__title">ספר פקודות: שלחו פקודה וראו מה קורה</h3>

      <div className="obsim__quote" dir="ltr">
        <span className="obsim__symbol">ALPHA</span>
        <span>
          <small>LAST</small> {lastPrice != null ? formatPrice(lastPrice) : '—'}
        </span>
        <span className="is-up">
          <small>BID</small> {bid != null ? formatPrice(bid) : '—'}
        </span>
        <span className="is-down">
          <small>ASK</small> {ask != null ? formatPrice(ask) : '—'}
        </span>
      </div>

      <div className="obsim__layout">
        {/* ---------- טופס פקודה ---------- */}
        <form className="ticket" onSubmit={submit} noValidate>
          <fieldset className="ticket__group">
            <legend>כיוון</legend>
            <div className="segmented">
              {['buy', 'sell'].map((side) => (
                <button
                  key={side}
                  type="button"
                  className={`segmented__btn segmented__btn--${side}`}
                  aria-pressed={ticket.side === side}
                  onClick={() => update({ side })}
                >
                  {SIDE_LABEL[side]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="ticket__group">
            <legend>סוג פקודה</legend>
            <div className="segmented">
              {['market', 'limit'].map((type) => (
                <button
                  key={type}
                  type="button"
                  className="segmented__btn"
                  aria-pressed={ticket.type === type}
                  onClick={() => update({ type })}
                >
                  {TYPE_LABEL[type]} <bdi className="mono">({type === 'market' ? 'Market' : 'Limit'})</bdi>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="ticket__group">
            <label htmlFor="ticket-qty">כמות מניות</label>
            <div className="ticket__row">
              <input
                id="ticket-qty"
                className="ticket__input"
                type="number"
                inputMode="numeric"
                min="1"
                max="10000"
                step="100"
                dir="ltr"
                value={ticket.qty}
                onChange={(e) => update({ qty: e.target.value })}
              />
              {QTY_PRESETS.map((q) => (
                <button key={q} type="button" className="chip" onClick={() => update({ qty: String(q) })}>
                  {num.format(q)}
                </button>
              ))}
            </div>
          </div>

          {ticket.type === 'limit' && (
            <div className="ticket__group">
              <label htmlFor="ticket-limit">
                {ticket.side === 'buy' ? 'מחיר מקסימלי לקנייה' : 'מחיר מינימלי למכירה'}
              </label>
              <div className="ticket__row">
                <input
                  id="ticket-limit"
                  className="ticket__input"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  dir="ltr"
                  value={ticket.limit}
                  onChange={(e) => update({ limit: e.target.value })}
                />
                {bid != null && (
                  <button type="button" className="chip chip--bid" onClick={() => update({ limit: formatPrice(bid) })}>
                    Bid
                  </button>
                )}
                {ask != null && (
                  <button type="button" className="chip chip--ask" onClick={() => update({ limit: formatPrice(ask) })}>
                    Ask
                  </button>
                )}
              </div>
            </div>
          )}

          {order ? <Preview book={book} order={order} /> : <p className="ticket__error">{error}</p>}

          <button
            type="submit"
            className={`btn ticket__submit ticket__submit--${ticket.side}`}
            disabled={!order}
          >
            שלחו פקודת {SIDE_LABEL[ticket.side]}
          </button>
        </form>

        {/* ---------- ספר פקודות ---------- */}
        <div className="obsim__book">
          <OrderBookTable book={book} />
          <div className="obsim__controls">
            <button type="button" className="btn btn--ghost btn--small" onClick={step} disabled={live}>
              צעד בשוק
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--small"
              aria-pressed={live}
              onClick={() => setLive((v) => !v)}
            >
              {live ? 'עצרו את השוק' : 'שוק חי'}
            </button>
            <button type="button" className="btn btn--ghost btn--small" onClick={reset}>
              התחלה מחדש
            </button>
          </div>
          <p className="obsim__hint">
            ״צעד בשוק״ שולח פקודת שוק של סוחר אחר ומוסיף פקודות חדשות לספר. ככה פקודה
            מוגבלת שלכם יכולה להתבצע גם אחרי שכבר שלחתם אותה.
          </p>
        </div>
      </div>

      {/* ---------- דוח ביצוע ---------- */}
      {report && (
        <div className="report">
          <p className="report__title">דוח ביצוע אחרון</p>
          <dl className="report__stats">
            <div>
              <dt>פקודה</dt>
              <dd>
                {SIDE_LABEL[report.order.side]} · {TYPE_LABEL[report.order.type]}
              </dd>
            </div>
            <div>
              <dt>בוצעו</dt>
              <dd className="mono">
                <bdi>
                  {num.format(report.filled)}/{num.format(report.order.qty)}
                </bdi>
              </dd>
            </div>
            <div>
              <dt>מחיר ממוצע</dt>
              <dd className="mono">{report.avg != null ? formatAverage(report.avg) : '—'}</dd>
            </div>
            <div>
              <dt>
                החלקה <bdi className="mono">(Slippage)</bdi>
              </dt>
              <dd className="mono">
                {report.filled
                  ? (slippage(report.order.side, report.fills, report.bestBefore) / 100).toFixed(3)
                  : '—'}
              </dd>
            </div>
          </dl>
          {report.spreadBefore != null && report.spreadAfter > report.spreadBefore && (
            <p className="report__note">
              הפקודה ״אכלה״ רמות מחיר מהספר, והמרווח התרחב מ-
              <bdi className="mono">{formatPrice(report.spreadBefore)}</bdi> ל-
              <bdi className="mono">{formatPrice(report.spreadAfter)}</bdi>. זו{' '}
              <strong>השפעת שוק</strong> (<bdi>Market Impact</bdi>). לחצו ״צעד בשוק״ כדי לראות
              נזילות חדשה נכנסת.
            </p>
          )}
          {report.fills.length > 0 && (
            <ul className="report__fills" dir="ltr">
              {report.fills.map((f, i) => (
                <li key={i}>
                  {num.format(f.size)} @ {formatPrice(f.price)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="obsim__bottom">
        {/* ---------- פקודות פתוחות ---------- */}
        <div className="panel">
          <p className="panel__title">הפקודות הפתוחות שלכם</p>
          {openOrders.length === 0 ? (
            <p className="panel__empty">אין פקודות ממתינות. פקודה מוגבלת שלא בוצעה מיד תופיע כאן.</p>
          ) : (
            <ul className="open-orders">
              {openOrders.map((o) => (
                <li key={o.id} className={`open-orders__item open-orders__item--${o.side}`}>
                  <span>
                    {SIDE_LABEL[o.side]} <span className="mono">{num.format(o.size)}</span> ב-
                    <bdi className="mono">{formatPrice(o.price)}</bdi>
                  </span>
                  <span className="open-orders__queue">
                    {o.ahead ? `לפניכם בתור: ${num.format(o.ahead)}` : 'ראשונים בתור'}
                  </span>
                  <button type="button" className="chip" onClick={() => cancel(o.id)}>
                    ביטול
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ---------- יומן ---------- */}
        <div className="panel">
          <p className="panel__title">יומן אירועים</p>
          {log.length === 0 ? (
            <p className="panel__empty">עוד לא קרה כלום. שלחו פקודה או לחצו ״צעד בשוק״.</p>
          ) : (
            <ol className="event-log">
              {log.map((entry) => (
                <li key={entry.id} className={`event-log__item event-log__item--${entry.tone}`}>
                  {entry.text}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
