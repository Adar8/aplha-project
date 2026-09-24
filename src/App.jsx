import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import Header from './components/Header.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFound from './pages/NotFound.jsx'
import WhatIsAStock from './modules/what-is-a-stock/WhatIsAStock.jsx'
import OrderTypes from './modules/order-types/OrderTypes.jsx'
import ChartReading from './modules/chart-reading/ChartReading.jsx'
import GlossaryPage from './glossary/GlossaryPage.jsx'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    // גוללים רק במעבר עמוד. עם עוגן (/glossary#bid) העמוד עצמו גולל למקום הנכון
    if (!hash) window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/modules/what-is-a-stock" element={<WhatIsAStock />} />
          <Route path="/modules/order-types" element={<OrderTypes />} />
          <Route path="/modules/chart-reading" element={<ChartReading />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="site-footer container">
        <p>התוכן לימודי בלבד ואינו מהווה ייעוץ השקעות.</p>
      </footer>
    </>
  )
}
