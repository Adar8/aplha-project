import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import Header from './components/Header.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFound from './pages/NotFound.jsx'
import WhatIsAStock from './modules/what-is-a-stock/WhatIsAStock.jsx'
import OrderTypes from './modules/order-types/OrderTypes.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="site-footer container">
        <p>התוכן לימודי בלבד ואינו מהווה ייעוץ השקעות.</p>
      </footer>
    </>
  )
}
