import { useCallback, useEffect, useMemo, useState } from 'react'
import { ProgressContext } from './ProgressContext.js'
import { loadProgress, saveProgress } from './storage.js'

export default function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(loadProgress)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const markComplete = useCallback((id) => {
    setProgress((prev) => ({ ...prev, [id]: { completedAt: new Date().toISOString() } }))
  }, [])

  const markIncomplete = useCallback((id) => {
    setProgress((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ progress, markComplete, markIncomplete }),
    [progress, markComplete, markIncomplete],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}
