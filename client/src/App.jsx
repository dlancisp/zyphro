import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SignedIn, SignedOut, SignIn, SignUp, UserButton, RedirectToSignIn } from "@clerk/clerk-react"; // Importamos Clerk
import './App.css';

// --- COMPONENTES (Piezas UI) ---
import { Icons } from './components/Icons';

// --- PÁGINAS (Vistas) ---
import Home from './pages/Home';
import SecureDrop from './pages/SecureDrop';
import DeadMansSwitch from './pages/DeadMansSwitch';
import AnonymousMail from './pages/AnonymousMail';
import Viewer from './pages/Viewer';
import Dashboard from './pages/Dashboard'; // ¡Importamos el nuevo Dashboard!

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  // Lógica para detectar si venimos a LEER un secreto (URL con ?id=...#hash)
  const [viewerParams, setViewerParams] = useState(null);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const id = p.get('id');
    const hash = window.location.hash.substring(1);
    if(id && hash) setViewerParams({id, hash});
  }, []);

  // Si hay parámetros de lectura, mostramos el Visor directamente (bypass de la app)
  if (viewerParams) return <Viewer id={viewerParams.id} hash={viewerParams.hash} />;

  return (
    <div className="app-container">
      
      {/* 1. NAVBAR SUPERIOR */}
      <header className="navbar">
        {/* Marca */}
        <Link to="/" className="nav-brand">
          <Icons.Logo />
          <span>ZYPHRO</span>
        </Link>

        {/* Menú Central */}
        <nav className="nav-links-center">
          <Link to="/" className="nav-link">Inicio</Link>
          <div className="dropdown-container">
            <div className="nav-link">Productos <Icons.ChevronDown /></div>
            <div className="dropdown-menu">
              <Link to="/drop" className="dropdown-item"><Icons.Lock /> Secure Drop</Link>
              <Link to="/switch" className="dropdown-item"><Icons.Shield /> Dead Man Switch</Link>
              <Link to="/mail" className="dropdown-item"><Icons.Send /> Anon Mail</Link>
            </div>
          </div>
          {/* Si estamos logueados, mostramos enlace al Dashboard aquí también */}
          <SignedIn>
            <Link to="/dashboard" className="nav-link" style={{color:'var(--primary)'}}>Mi Panel</Link>
          </SignedIn>
        </nav>

        {/* Botones Auth (CAMBIADO PARA CLERK) */}
        <div className="nav-auth-buttons">
          <SignedOut>
            {/* Si NO estás logueado, ves esto */}
            <Link to="/login" className="btn-login">Iniciar sesión</Link>
            <Link to="/register" className="btn-register-small">Crear Cuenta</Link>
          </SignedOut>
          
          <SignedIn>
            {/* Si SÍ estás logueado, ves tu avatar y botón Dashboard */}
            <Link to="/dashboard" className="btn-register-small" style={{marginRight:'10px'}}>Dashboard</Link>
            <UserButton afterSignOutUrl="/"/>
          </SignedIn>
        </div>

        {/* Menú Móvil */}
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <Icons.Close /> : <Icons.Menu />}
        </button>
      </header>

      {/* 2. MENÚ MÓVIL DESPLEGABLE */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Link to="/" className="mobile-nav-item" onClick={() => setMenuOpen(false)}><Icons.Home /> Inicio</Link>
        <Link to="/drop" className="mobile-nav-item" onClick={() => setMenuOpen(false)}><Icons.Lock /> Secure Drop</Link>
        <Link to="/switch" className="mobile-nav-item" onClick={() => setMenuOpen(false)}><Icons.Shield /> Dead Man Switch</Link>
        <Link to="/mail" className="mobile-nav-item" onClick={() => setMenuOpen(false)}><Icons.Send /> Anon Mail</Link>
        
        <div style={{height:'1px', background:'var(--border-color)', margin:'10px 0'}}></div>
        
        {/* Lógica Móvil Auth */}
        <SignedOut>
            <Link to="/login" className="mobile-nav-item" onClick={() => setMenuOpen(false)}> Iniciar Sesión</Link>
            <Link to="/register" className="mobile-nav-item" onClick={() => setMenuOpen(false)} style={{color:'var(--primary)'}}> Crear Cuenta</Link>
        </SignedOut>
        <SignedIn>
            <Link to="/dashboard" className="mobile-nav-item" onClick={() => setMenuOpen(false)} style={{color:'var(--primary)'}}> Ir a mi Dashboard</Link>
            <div className="mobile-nav-item"><UserButton /></div>
        </SignedIn>
      </div>

      {/* 3. CONTENIDO PRINCIPAL (Rutas) */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/drop" element={<SecureDrop />} />
          <Route path="/switch" element={<DeadMansSwitch />} />
          <Route path="/mail" element={<AnonymousMail />} />
          
          {/* Rutas de Login/Registro controladas por Clerk */}
          <Route path="/login/*" element={<div style={{display:'flex',justifyContent:'center',marginTop:'50px'}}><SignIn routing="path" path="/login" /></div>} />
          <Route path="/register/*" element={<div style={{display:'flex',justifyContent:'center',marginTop:'50px'}}><SignUp routing="path" path="/register" /></div>} />

          {/* RUTA PROTEGIDA: DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn>
                  <Dashboard />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
        </Routes>
      </main>

      {/* 4. FOOTER */}
      <footer style={{ background:'var(--bg-main)', borderTop: '1px solid var(--border-color)', padding: '40px', textAlign: 'center', color: 'var(--text-muted)'}}>
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:'10px', marginBottom:'15px'}}>
          <Icons.Logo /> <span style={{fontWeight:'700', color:'var(--text-heading)'}}>ZYPHRO</span>
        </div>
        <p>© 2026 Zyphro Security Inc.</p>
      </footer>

      <Toaster position="bottom-center" />
    </div>
  );
}

export default App;