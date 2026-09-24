import { createContext, useContext } from 'react'

export const ProfileContext = createContext(null)

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) throw new Error('useProfile must be used inside <ProfileProvider>')
  return context
}

// הרמה של השיעור הפתוח כרגע (basic | deep). ModuleLayout מספק אותה
export const LevelContext = createContext('basic')

export function useLessonLevel() {
  return useContext(LevelContext)
}
