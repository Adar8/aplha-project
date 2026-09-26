// הלוגו: שני נרות קטנים וטקסט. אותו סימן כמו בפביקון (public/favicon.svg)
export default function Logo() {
  return (
    <span className="logo">
      <svg className="logo__mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path className="logo__wick" d="M8 3v18M16 6v12" />
        <rect className="logo__body" x="5" y="7" width="6" height="10" />
        <rect className="logo__body" x="13" y="9" width="6" height="6" />
      </svg>
      <span className="logo__text" dir="ltr">
        AlphaTrader <span className="logo__sub">Learn</span>
      </span>
    </span>
  )
}
