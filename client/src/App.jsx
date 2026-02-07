// CAMBIO DE PRUEBA
import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SignedIn, SignedOut, SignIn, SignUp, UserButton, RedirectToSignIn } from "@clerk/clerk-react";
import AutoCheckIn from './components/AutoCheckIn'; // ✅ 1. ESTÁ IMPORTADO (BIEN)
import './App.css';

// Componentes
import { Icons } from './components/Icons';

// Páginas
import Home from './pages/Home';
import SecureDrop from './pages/SecureDrop';
import DeadMansSwitch from './pages/DeadMansSwitch';
import AnonymousMail from './pages/AnonymousMail';
import Viewer from './pages/Viewer';
import Dashboard from './pages/Dashboard';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  // Lógica del visor de secretos (no tocar)
  const [viewerParams, setViewerParams] = useState(null);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const id = p.get('id');
    const hash = window.location.hash.substring(1);
    if(id && hash) setViewerParams({id, hash});
  }, []);

  if (viewerParams) return <Viewer id={viewerParams.id} hash={viewerParams.hash} />;

  return (
    <div className="app-container">
      
      {/* ✅ 2. ¡AQUÍ ES DONDE FALTABA! */}
      {/* Componente invisible que avisa que estás vivo al hacer login */}
      <AutoCheckIn />

      {/* 1. BARRA DE NAVEGACIÓN */}
      <header className="navbar">
        <div className="nav-container">
          
          {/* IZQUIERDA: LOGO */}
          <Link to="/" className="nav-brand">
            <Icons.Logo />
            <span>ZYPHRO</span>
          </Link>

          {/* CENTRO: ENLACES NUEVOS (Precios, Productos, Nosotros...) */}
          <nav className="nav-links-center">
            
            {/* Desplegable Productos */}
            <div className="dropdown-wrapper">
              <span className="nav-link">Productos <Icons.ChevronDown /></span>
              <div className="dropdown-content">
                <Link to="/drop" className="dropdown-item"><Icons.Lock /> Secure Drop</Link>
                <Link to="/switch" className="dropdown-item"><Icons.Shield /> Dead Man Switch</Link>
                <Link to="/mail" className="dropdown-item"><Icons.Send /> Anon Mail</Link>
              </div>
            </div>

            <Link to="/precios" className="nav-link">Precios</Link>
            <Link to="/nosotros" className="nav-link">Nosotros</Link>
            <Link to="/valores" className="nav-link">Valores</Link>
          </nav>

          {/* DERECHA: LOGIN / REGISTRO */}
          <div className="nav-auth-buttons">
            <SignedOut>
              <Link to="/login" className="btn-login">Log in</Link>
              <Link to="/register" className="btn-register-small">Registro</Link>
            </SignedOut>
            
            <SignedIn>
              <Link to="/dashboard" className="btn-register-small" style={{marginRight:'10px'}}>Dashboard</Link>
              <UserButton afterSignOutUrl="/"/>
            </SignedIn>
          </div>

          {/* BOTÓN MÓVIL (Solo visible en pantallas pequeñas) */}
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <Icons.Close /> : <Icons.Menu />}
          </button>
        </div>
      </header>

      {/* 2. MENÚ MÓVIL (OCULTO EN PC) */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Link to="/drop" onClick={() => setMenuOpen(false)} className="mobile-link">Productos</Link>
        <Link to="/precios" onClick={() => setMenuOpen(false)} className="mobile-link">Precios</Link>
        <Link to="/nosotros" onClick={() => setMenuOpen(false)} className="mobile-link">Nosotros</Link>
        
        <div className="mobile-divider"></div>
        
        <SignedOut>
            <Link to="/login" onClick={() => setMenuOpen(false)} className="mobile-link">Log in</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} className="mobile-link highlight">Registro</Link>
        </SignedOut>
        <SignedIn>
            <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="mobile-link highlight">Ir al Dashboard</Link>
        </SignedIn>
      </div>

      {/* 3. CONTENIDO PRINCIPAL */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/drop" element={<SecureDrop />} />
          <Route path="/switch" element={<DeadMansSwitch />} />
          <Route path="/mail" element={<AnonymousMail />} />
          <Route path="/login/*" element={<div className="auth-wrapper"><SignIn routing="path" path="/login" /></div>} />
          <Route path="/register/*" element={<div className="auth-wrapper"><SignUp routing="path" path="/register" /></div>} />
          <Route path="/dashboard" element={<><SignedIn><Dashboard /></SignedIn><SignedOut><RedirectToSignIn /></SignedOut></>} />
          
          {/* Páginas vacías para que no de error 404 al probar los links nuevos */}
          <Route path="/precios" element={<div className="hero-wrapper"><h1 className="hero-title">Precios</h1></div>} />
          <Route path="/nosotros" element={<div className="hero-wrapper"><h1 className="hero-title">Nosotros</h1></div>} />
          <Route path="/valores" element={<div className="hero-wrapper"><h1 className="hero-title">Valores</h1></div>} />
        </Routes>
      </main>

      {/* 4. FOOTER CORPORATIVO */}
      <footer className="big-footer">
        <div className="footer-container">
          
          {/* GRID DE COLUMNAS */}
          <div className="footer-grid">
            
            {/* COLUMNA 1: PRODUCTOS */}
            <div className="footer-col">
              <h4 className="footer-title">Productos</h4>
              <Link to="/drop" className="footer-link">Secure Drop</Link>
              <Link to="/switch" className="footer-link">Dead Man Switch</Link>
              <Link to="/mail" className="footer-link">Anon Mail</Link>
              <Link to="/precios" className="footer-link highlight">Precios y Planes</Link>
            </div>

            {/* COLUMNA 2: RECURSOS (GITHUB) */}
            <div className="footer-col">
              <h4 className="footer-title">Comunidad</h4>
              <a href="https://github.com/tu-usuario/zyphro" target="_blank" rel="noopener noreferrer" className="footer-link">
                GitHub (Open Source)
              </a>
              <Link to="/valores" className="footer-link">Whitepaper (Pronto)</Link>
              <Link to="/docs" className="footer-link">Documentación API</Link>
              <span className="footer-link disabled">Estado del Servidor</span>
            </div>

            {/* COLUMNA 3: COMPAÑÍA */}
            <div className="footer-col">
              <h4 className="footer-title">Compañía</h4>
              <Link to="/nosotros" className="footer-link">Sobre Nosotros</Link>
              <Link to="/valores" className="footer-link">Manifiesto de Privacidad</Link>
              <Link to="/contacto" className="footer-link">Contacto</Link>
              <Link to="/blog" className="footer-link">Blog de Seguridad</Link>
            </div>

            {/* COLUMNA 4: LEGAL */}
            <div className="footer-col">
              <h4 className="footer-title">Legal</h4>
              <Link to="/legal" className="footer-link">Términos de Servicio</Link>
              <Link to="/privacidad" className="footer-link">Política de Privacidad</Link>
              <Link to="/cookies" className="footer-link">Política de Cookies</Link>
              <Link to="/canary" className="footer-link">Canary Warrant</Link>
            </div>
          </div>

          {/* BARRA INFERIOR (COPYRIGHT Y REDES) */}
          <div className="footer-bottom">
            <div className="footer-brand">
              <Icons.Logo style={{height:'24px'}} />
              <span>© 2026 Zyphro Security Inc.</span>
            </div>
            
            <div className="footer-socials">
              <a href="https://github.com/dlancisp/zyphro" className="social-icon"><Icons.Github /></a>
              <a href="https://twitter.com" className="social-icon"><Icons.Twitter /></a>
              <a href="https://linkedin.com" className="social-icon"><Icons.Linkedin /></a>
            </div>
          </div>

        </div>
      </footer>

      <Toaster position="bottom-center" />
    </div>
  );
}

export default App;