import Hero from '../components/Hero.jsx'
import ModuleList from '../components/ModuleList.jsx'
import { modules } from '../data/modules.js'
import PlanPanel from '../onboarding/PlanPanel.jsx'
import { useProfile } from '../profile/ProfileContext.js'
import { buildPlan } from '../profile/profile.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useProgress } from '../progress/ProgressContext.js'

export default function HomePage() {
  useDocumentTitle(null)
  const { progress } = useProgress()
  const { profile } = useProfile()
  const plan = buildPlan(modules, profile, progress)
  // עם שאלון: המודולים בסדר המומלץ, והמילון בסוף
  const ordered = profile?.answers ? [...plan.order, ...modules.filter((m) => m.kind !== 'module')] : modules

  return (
    <>
      <Hero />
      <PlanPanel plan={plan} />
      <ModuleList modules={ordered} plan={profile?.answers ? plan : null} />
    </>
  )
}
