import ModuleCard from './ModuleCard.jsx'
import './ModuleList.css'

export default function ModuleList({ modules, plan }) {
  return (
    <section className="modules" aria-labelledby="modules-title">
      <h2 id="modules-title" className="modules__title">
        מסלול הלימוד
      </h2>
      <ul className="modules__grid">
        {modules.map((module) => (
          <li key={module.id}>
            <ModuleCard
              module={module}
              isNext={plan?.next?.id === module.id}
              isKnown={plan?.known.has(module.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
