import { useEffect } from 'react'
import { SITE } from '../data/site.js'

/** כותרת ייחודית לכל עמוד (חשוב לקוראי מסך ולהיסטוריית הדפדפן) */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE.name}` : SITE.name
  }, [title])
}
