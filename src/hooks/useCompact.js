import { useEffect, useState } from 'react'

const COMPACT_QUERY = '(max-width: 600px)'

/** true במסך צר — גרפים עוברים לפריסה שבה הטקסט נשאר קריא */
export function useCompact() {
  const [compact, setCompact] = useState(() => window.matchMedia(COMPACT_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(COMPACT_QUERY)
    const onChange = (e) => setCompact(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return compact
}
