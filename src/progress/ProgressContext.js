import { createContext, useContext } from 'react'

export const ProgressContext = createContext(null)

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) throw new Error('useProgress must be used inside <ProgressProvider>')
  return context
}
