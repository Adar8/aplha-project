import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './styles/tokens.css'
import './styles/global.css'
import ProgressProvider from './progress/ProgressProvider.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </BrowserRouter>
  </StrictMode>,
)
