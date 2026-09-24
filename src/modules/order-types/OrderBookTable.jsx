import { formatPrice, levels } from './orderBook.js'

const qty = new Intl.NumberFormat('en-US')

function Row({ level, side, maxSize, isBest }) {
  const depth = Math.max(4, (level.size / maxSize) * 100)
  return (
    <tr className={`ob__row ob__row--${side}${isBest ? ' ob__row--best' : ''}${level.mine ? ' ob__row--mine' : ''}`}>
      <td className="ob__price">{formatPrice(level.price)}</td>
      <td className="ob__size">
        <span className="ob__depth" style={{ inlineSize: `${depth}%` }} aria-hidden="true" />
        <span className="ob__size-num">{qty.format(level.size)}</span>
      </td>
      <td className="ob__mine">{level.mine ? qty.format(level.mine) : ''}</td>
    </tr>
  )
}

// ספר הפקודות: מוכרים (Ask) למעלה, קונים (Bid) למטה, והמרווח באמצע.
// בכוונה LTR — מספרים וטבלאות מסחר נקראים משמאל לימין.
export default function OrderBookTable({ book }) {
  const asks = levels(book.asks)
  const bids = levels(book.bids)
  const maxSize = Math.max(...asks.map((l) => l.size), ...bids.map((l) => l.size), 1)
  const spread = asks.length && bids.length ? asks[0].price - bids[0].price : null

  return (
    <table className="ob" dir="ltr">
      <caption className="ob__caption">ספר הפקודות של ALPHA</caption>
      <thead>
        <tr>
          <th scope="col">Price</th>
          <th scope="col">Size</th>
          <th scope="col">Yours</th>
        </tr>
      </thead>
      <tbody>
        {[...asks].reverse().map((level, i) => (
          <Row key={`a${level.price}`} level={level} side="ask" maxSize={maxSize} isBest={i === asks.length - 1} />
        ))}
        <tr className="ob__spread">
          <td colSpan="3">
            {spread != null ? (
              <>
                <span className="ob__spread-label">ASK</span>
                <span>spread {formatPrice(spread)}</span>
                <span className="ob__spread-label">BID</span>
              </>
            ) : (
              '—'
            )}
          </td>
        </tr>
        {bids.map((level, i) => (
          <Row key={`b${level.price}`} level={level} side="bid" maxSize={maxSize} isBest={i === 0} />
        ))}
      </tbody>
    </table>
  )
}
