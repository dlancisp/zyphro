import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom' // <--- 1. IMPORTAR LIBRERÍA

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* <--- 2. ENVOLVER LA APP */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)