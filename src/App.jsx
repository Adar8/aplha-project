import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import ModuleList from './components/ModuleList.jsx'
import { modules } from './data/modules.js'

export default function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Hero />
        <ModuleList modules={modules} />
      </main>
      <footer className="site-footer container">
        <p>התוכן לימודי בלבד ואינו מהווה ייעוץ השקעות.</p>
      </footer>
    </>
  )
}
