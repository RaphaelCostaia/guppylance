import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { MockDbProvider } from './state/MockDbProvider'
import { ToastProvider } from './components/ui/Toast'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MockDbProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MockDbProvider>
    </BrowserRouter>
  </StrictMode>,
)
