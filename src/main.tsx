import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App'
import { StoreProvider } from './app/store'
import { AuthProvider } from './app/auth'
import { DatosProvider } from './app/datos'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <DatosProvider>
          <StoreProvider>
            <App />
          </StoreProvider>
        </DatosProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
