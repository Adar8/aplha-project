// מונח מקצועי: עברית, ואחריה המונח באנגלית בסוגריים.
export default function Term({ he, en }) {
  return (
    <span className="term">
      <strong className="term__he">{he}</strong>{' '}
      <span className="term__en">
        (<bdi dir="ltr">{en}</bdi>)
      </span>
    </span>
  )
}
