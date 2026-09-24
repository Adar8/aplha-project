import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadPortfolio, savePortfolio } from '../progress/storage.js'
import { PortfolioContext } from './PortfolioContext.js'
import { SYMBOL_PATTERN } from './portfolio.js'

const EMPTY = { transactions: [], prices: {}, nextSeq: 1 }

// נתונים מהדפדפן יכולים להיות פגומים או ישנים: שומרים רק רשומות תקינות
function sanitize(raw) {
  if (!raw || !Array.isArray(raw.transactions)) return EMPTY
  const transactions = raw.transactions.filter(
    (t) =>
      t &&
      typeof t.id === 'string' &&
      SYMBOL_PATTERN.test(t.symbol) &&
      (t.type === 'buy' || t.type === 'sell') &&
      /^\d{4}-\d{2}-\d{2}$/.test(t.date) &&
      t.shares > 0 &&
      t.price > 0 &&
      t.fees >= 0 &&
      Number.isFinite(t.seq),
  )
  const prices = {}
  for (const [symbol, q] of Object.entries(raw.prices ?? {})) {
    if (SYMBOL_PATTERN.test(symbol) && q?.price > 0) prices[symbol] = { price: q.price, updatedAt: q.updatedAt ?? null }
  }
  const nextSeq = Math.max(Number(raw.nextSeq) || 1, ...transactions.map((t) => t.seq + 1), 1)
  return { transactions, prices, nextSeq }
}

export default function PortfolioProvider({ children }) {
  const [portfolio, setPortfolio] = useState(() => sanitize(loadPortfolio()))

  useEffect(() => {
    savePortfolio(portfolio)
  }, [portfolio])

  const addTransaction = useCallback((t) => {
    setPortfolio((prev) => ({
      ...prev,
      transactions: [...prev.transactions, { ...t, id: `tx-${prev.nextSeq}`, seq: prev.nextSeq }],
      nextSeq: prev.nextSeq + 1,
    }))
  }, [])

  const deleteTransaction = useCallback((id) => {
    setPortfolio((prev) => ({ ...prev, transactions: prev.transactions.filter((t) => t.id !== id) }))
  }, [])

  const setPrice = useCallback((symbol, price) => {
    setPortfolio((prev) => ({
      ...prev,
      prices: { ...prev.prices, [symbol]: { price, updatedAt: new Date().toISOString() } },
    }))
  }, [])

  const resetPortfolio = useCallback(() => setPortfolio(EMPTY), [])

  const value = useMemo(
    () => ({ ...portfolio, addTransaction, deleteTransaction, setPrice, resetPortfolio }),
    [portfolio, addTransaction, deleteTransaction, setPrice, resetPortfolio],
  )

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
}
