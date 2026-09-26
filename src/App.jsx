import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import Footer from './components/Footer.jsx'
import Sidebar from './components/Sidebar.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFound from './pages/NotFound.jsx'
import WhatIsAStock from './modules/what-is-a-stock/WhatIsAStock.jsx'
import OrderTypes from './modules/order-types/OrderTypes.jsx'
import ChartReading from './modules/chart-reading/ChartReading.jsx'
import RiskManagement from './modules/risk-management/RiskManagement.jsx'
import Fundamentals from './modules/fundamentals/Fundamentals.jsx'
import StockResearch from './modules/stock-research/StockResearch.jsx'
import GlossaryPage from './glossary/GlossaryPage.jsx'
import OnboardingPage from './onboarding/OnboardingPage.jsx'
import PortfolioPage from './portfolio/PortfolioPage.jsx'
import AccessibilityPage from './legal/AccessibilityPage.jsx'
import PrivacyPage from './legal/PrivacyPage.jsx'
import TermsPage from './legal/TermsPage.jsx'

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
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          // מעבירים את המיקוד בלי לשנות את הכתובת (העוגן #main היה מתנגש בעוגנים של המילון)
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}
      >
        דלג לתוכן הראשי
      </a>
      <ScrollToTop />
      <div className="app">
        <Sidebar />
        <div className="app__content">
          <main id="main" className="container" tabIndex={-1}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/modules/what-is-a-stock" element={<WhatIsAStock />} />
              <Route path="/modules/order-types" element={<OrderTypes />} />
              <Route path="/modules/chart-reading" element={<ChartReading />} />
              <Route path="/modules/risk-management" element={<RiskManagement />} />
              <Route path="/modules/fundamentals" element={<Fundamentals />} />
              <Route path="/modules/stock-research" element={<StockResearch />} />
              <Route path="/glossary" element={<GlossaryPage />} />
              <Route path="/start" element={<OnboardingPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/accessibility" element={<AccessibilityPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </>
  )
}
