import Hero from '../components/Hero.jsx'
import ModuleList from '../components/ModuleList.jsx'
import { modules } from '../data/modules.js'

export default function HomePage() {
  return (
    <>
      <Hero />
      <ModuleList modules={modules} />
    </>
  )
}
