import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './state/AuthProvider'
import { DataProvider } from './state/DataProvider'
import { ToastProvider } from './components/ui/Toast'
import { isSupabaseConfigured } from './lib/supabase'
import './index.css'

function MissingConfig() {
  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 560, margin: '80px auto', padding: 24, lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 22 }}>Configuração pendente</h1>
      <p>
        Defina as variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> (arquivo <code>.env.local</code> em
        desenvolvimento ou <em>Environment Variables</em> na Vercel) e gere o build novamente.
      </p>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isSupabaseConfigured ? (
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    ) : (
      <MissingConfig />
    )}
  </StrictMode>,
)
