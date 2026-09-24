import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './styles/tokens.css'
import './styles/global.css'
import ProgressProvider from './progress/ProgressProvider.jsx'
import ProfileProvider from './profile/ProfileProvider.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ProgressProvider>
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </ProgressProvider>
    </BrowserRouter>
  </StrictMode>,
)
