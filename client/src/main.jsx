import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // <--- ¡ESTO ERA LO QUE FALTABA!
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'

// --- ESTILOS NUEVOS (Zyphro Design System) ---
import './styles/variables.css'
import './styles/components.css'
import './styles/layout.css'
import './index.css'

// Configuración de Clerk (Autenticación)
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  console.warn("⚠️ FALTA LA CLAVE DE CLERK: Asegúrate de tener el archivo .env con VITE_CLERK_PUBLISHABLE_KEY")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolvemos todo en Clerk (Auth) y Router (Navegación) */}
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>,
)