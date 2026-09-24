import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadProfile, saveProfile } from '../progress/storage.js'
import { ProfileContext } from './ProfileContext.js'

const now = () => new Date().toISOString()

export default function ProfileProvider({ children }) {
  // null = אין פרופיל. פרופיל יכול להתקיים גם בלי שאלון (רק בחירות רמה במודולים)
  const [profile, setProfile] = useState(loadProfile)

  useEffect(() => {
    saveProfile(profile)
  }, [profile])

  const saveAnswers = useCallback((answers) => {
    setProfile((prev) => ({ ...prev, answers, updatedAt: now() }))
  }, [])

  const savePlacement = useCallback((placement) => {
    setProfile((prev) => ({ ...prev, placement, updatedAt: now() }))
  }, [])

  const setModuleLevel = useCallback((moduleId, level) => {
    setProfile((prev) => ({
      ...prev,
      moduleLevels: { ...prev?.moduleLevels, [moduleId]: level },
      updatedAt: now(),
    }))
  }, [])

  const resetProfile = useCallback(() => setProfile(null), [])

  const value = useMemo(
    () => ({ profile, answers: profile?.answers ?? null, saveAnswers, savePlacement, setModuleLevel, resetProfile }),
    [profile, saveAnswers, savePlacement, setModuleLevel, resetProfile],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}
