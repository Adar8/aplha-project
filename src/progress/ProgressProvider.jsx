import { useCallback, useEffect, useMemo, useState } from 'react'
import { ProgressContext } from './ProgressContext.js'
import { loadProgress, loadStarted, saveProgress, saveStarted } from './storage.js'

export default function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(loadProgress)
  const [started, setStarted] = useState(loadStarted)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  useEffect(() => {
    saveStarted(started)
  }, [started])

  // נקרא כשנכנסים למודול. משמש רק להצגת ״בתהליך״ בלוח הבקרה
  const markStarted = useCallback((id) => {
    setStarted((prev) => (prev[id] ? prev : { ...prev, [id]: { startedAt: new Date().toISOString() } }))
  }, [])

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

  const resetProgress = useCallback(() => {
    setProgress({})
    setStarted({})
  }, [])

  const value = useMemo(
    () => ({ progress, started, markStarted, markComplete, markIncomplete, resetProgress }),
    [progress, started, markStarted, markComplete, markIncomplete, resetProgress],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}
