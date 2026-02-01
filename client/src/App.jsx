import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'; // <--- IMPORTANTE: Nuevas herramientas
import './App.css';
import Register from './Register'; // Importamos tu nueva página

// --- CONFIGURACIÓN API ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// --- UTILIDADES DE CRIPTOGRAFÍA NATIVA (WEB CRYPTO API) ---
const enc = new TextEncoder();
const dec = new TextDecoder();

// Genera una clave segura para la URL
const generateKey = async () => {
  const key = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const exported = await window.crypto.subtle.exportKey("jwk", key);
  return exported.k;
};

const importKey = async (k) => {
  return await window.crypto.subtle.importKey(
    "jwk",
    { k, kty: "oct", alg: "A256GCM", ext: true },
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
};

const encryptData = async (text, keyStr) => {
  const key = await importKey(keyStr);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = enc.encode(text);
  
  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoded
  );
  
  const buffer = new Uint8Array(iv.byteLength + cipherBuffer.byteLength);
  buffer.set(iv);
  buffer.set(new Uint8Array(cipherBuffer), iv.byteLength);
  
  return btoa(String.fromCharCode(...buffer));
};

const decryptData = async (base64Data, keyStr) => {
  const key = await importKey(keyStr);
  const binaryStr = atob(base64Data);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
  
  const iv = bytes.slice(0, 12);
  const data = bytes.slice(12);
  
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    data
  );
  
  return dec.decode(decryptedBuffer);
};

// --- ICONOS ---
const Icons = {
  Logo: () => (
    <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#2563EB"/>
      <path d="M14 16H50L30 36H54L18 56L38 36H10L14 16Z" fill="white"/>
    </svg>
  ),
  Menu: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>),
  Close: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>),
  Home: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
  Lock: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>),
  Shield: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
  Send: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>),
  Check: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>),
  User: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>)
};

// --- COMPONENTES DE VISTA ---

function HomeView() {
  const navigate = useNavigate();
  return (
    <div className="hero-wrapper">
      <h1 className="hero-title">Seguridad <span style={{color: 'var(--primary)'}}>Nativa.</span></h1>
      <p className="hero-subtitle">Infraestructura Web Crypto API. Cifrado AES-GCM acelerado por hardware directamente en tu navegador.</p>
      <div style={{marginTop: '40px'}}><button className="btn-primary" style={{width: 'auto', padding: '16px 32px'}} onClick={() => navigate('/drop')}>Probar Ahora</button></div>
    </div>
  );
}

function SecureDrop() {
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const keyStr = await generateKey();
      const encrypted = await encryptData(text, keyStr);
      
      const res = await fetch(`${API_URL}/secret`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ cipherText: encrypted }) 
      });
      const data = await res.json();
      
      setLink(`${window.location.origin}/?id=${data.id}#${keyStr}`);
    } catch (e) { 
      console.error(e);
      alert('Error de encriptación o conexión'); 
    }
    setLoading(false);
  };

  return (
    <div className="feature-wrapper">
      <div className="section-header"><h2 className="section-title">Secure Drop (GCM)</h2><p className="section-desc">Cifrado AES-256-GCM. Máxima seguridad estándar.</p></div>
      {!link ? (
        <>
          <div className="input-group"><label className="input-label">CONTENIDO PRIVADO</label><textarea placeholder="Tus secretos aquí..." value={text} onChange={e => setText(e.target.value)} /></div>
          <button className="btn-primary" onClick={create} disabled={loading}>{loading ? 'Procesando...' : 'Encriptar y Generar Enlace'}</button>
        </>
      ) : (
        <div className="result-card">
          <div style={{display:'flex', alignItems:'center', gap:'8px', fontWeight:'600', color:'var(--text-heading)'}}><Icons.Check /><span>Enlace Seguro Listo</span></div>
          <div className="result-link">{link}</div>
          <div className="action-row">
            <button className="btn-primary" style={{flex:1}} onClick={() => navigator.clipboard.writeText(link)}>Copiar</button>
            <button className="btn-secondary" style={{background:'white', border:'1px solid #e5e7eb', padding:'10px', borderRadius:'8px', cursor:'pointer'}} onClick={() => {setLink(''); setText('')}}>Nuevo</button>
          </div>
        </div>
      )}
    </div>
  );
}

function DeadMansSwitch() {
  const [active, setActive] = useState(false);
  const [form, setForm] = useState({ to: '', msg: '', time: 1 });
  const [activeId, setActiveId] = useState(null);

  const activate = async () => {
    // Nota: En producción real, esto también debería ir cifrado
    const res = await fetch(`${API_URL}/switch/create`, { 
        method: 'POST', headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify({ recipientEmail: form.to, encryptedContent: form.msg, checkInFrequency: form.time }) 
    });
    const data = await res.json();
    setActiveId(data.id); setActive(true);
  };

  const checkIn = async () => {
    await fetch(`${API_URL}/switch/checkin`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: activeId }) });
    alert('Vida confirmada.');
  };

  return (
    <div className="feature-wrapper">
      <div className="section-header"><h2 className="section-title">Dead Man's Switch</h2><p className="section-desc">Liberación automática por inactividad.</p></div>
      {!active ? (
        <>
          <div className="input-group"><label className="input-label">DESTINATARIO</label><input type="email" value={form.to} onChange={e => setForm({...form, to: e.target.value})} /></div>
          <div className="input-group"><label className="input-label">MENSAJE</label><textarea value={form.msg} onChange={e => setForm({...form, msg: e.target.value})} /></div>
          <div className="input-group"><label className="input-label">MINUTOS INACTIVIDAD</label><input type="number" min="1" value={form.time} onChange={e => setForm({...form, time: e.target.value})} /></div>
          <button className="btn-primary" onClick={activate} style={{background:'#dc2626'}}>Activar Protocolo</button>
        </>
      ) : (
        <div className="result-card" style={{textAlign:'center'}}>
          <div style={{color:'var(--primary)', marginBottom:'10px'}}><Icons.Shield /></div>
          <h3>Monitoreo Activo</h3>
          <p style={{marginBottom:'20px'}}>Confirmar cada {form.time} min.</p>
          <button className="btn-primary" onClick={checkIn} style={{background:'#16a34a'}}>Confirmar Vida</button>
        </div>
      )}
    </div>
  );
}

function AnonymousMail() {
  const [form, setForm] = useState({ to: '', sub: '', body: '' });
  const send = async () => {
    await fetch(`${API_URL}/email`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ to: form.to, subject: form.sub, message: form.body }) });
    alert('Enviado.'); setForm({ to: '', sub: '', body: '' });
  };
  return (
    <div className="feature-wrapper">
      <div className="section-header"><h2 className="section-title">Anon Mail</h2><p className="section-desc">Envío unidireccional anónimo.</p></div>
      <div className="input-group"><label className="input-label">DESTINATARIO</label><input value={form.to} onChange={e => setForm({...form, to: e.target.value})} /></div>
      <div className="input-group"><label className="input-label">ASUNTO</label><input value={form.sub} onChange={e => setForm({...form, sub: e.target.value})} /></div>
      <div className="input-group"><label className="input-label">MENSAJE</label><textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} /></div>
      <button className="btn-primary" onClick={send}><Icons.Send /><span style={{marginLeft:'8px'}}>Enviar</span></button>
    </div>
  );
}

function Viewer({ id, hash }) {
  const [msg, setMsg] = useState('Verificando integridad...');
  const fetched = useRef(false);

  useEffect(() => {
    if(fetched.current) return; 
    fetched.current = true;
    
    fetch(`${API_URL}/secret/${id}`)
      .then(r => r.status === 404 ? 'exp' : r.json())
      .then(async (d) => {
        if(d === 'exp') {
          setMsg('⛔ Mensaje destruido o inexistente.');
        } else if(d?.cipherText) {
             try { 
               const decrypted = await decryptData(d.cipherText, hash);
               setMsg(decrypted); 
             }
             catch (e) { 
               console.error(e);
               setMsg('Error: Llave incorrecta o datos corruptos.'); 
             }
        }
      })
      .catch(() => setMsg('Error de conexión'));
  }, [id, hash]);

  return (
    <div style={{padding:'40px 20px', maxWidth:'600px', margin:'0 auto', textAlign:'center'}}>
      <h2 className="section-title">Mensaje Seguro</h2>
      <div className="result-card" style={{marginTop:'20px', background:'white', whiteSpace:'pre-wrap', textAlign:'left'}}>{msg}</div>
      <a href="/" style={{display:'block', marginTop:'30px', color:'var(--primary)', textDecoration:'none', fontWeight:'600'}}>Ir a ZYPH</a>
    </div>
  );
}

// --- APP PRINCIPAL CON ROUTER ---

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate(); // Hook para navegar
  const location = useLocation(); // Hook para saber dónde estamos

  // Lógica para detectar si estamos viendo un secreto (Legacy links con ?id=...)
  const [viewerParams, setViewerParams] = useState(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const id = p.get('id');
    const hash = window.location.hash.substring(1);
    if(id && hash) { 
      setViewerParams({id, hash}); 
    }
  }, []);

  // Función auxiliar para saber qué botón está activo
  const isActive = (path) => location.pathname === path ? 'active' : '';

  // Si hay parámetros de URL (alguien abrió un link secreto), mostramos el Viewer directamente
  if (viewerParams) return <Viewer id={viewerParams.id} hash={viewerParams.hash} />;

  return (
    <div className="app-container">
      {/* HEADER MÓVIL */}
      <header className="mobile-header">
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <div style={{color:'var(--primary)'}}><Icons.Logo /></div>
          <span style={{fontWeight:'700', fontSize:'1.1rem'}}>ZYPH</span>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{background:'none', border:'none', cursor:'pointer', color:'var(--text-heading)'}}>
          {menuOpen ? <Icons.Close /> : <Icons.Menu />}
        </button>
      </header>
      <div className={`mobile-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}></div>

      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand-section">
          <div className="brand-logo"><Icons.Logo /></div>
          <span className="brand-text">ZYPH</span>
        </div>
        <nav className="nav-menu">
          <button className={`nav-item ${isActive('/')}`} onClick={() => {navigate('/'); setMenuOpen(false);}}><Icons.Home /> <span>Inicio</span></button>
          <button className={`nav-item ${isActive('/drop')}`} onClick={() => {navigate('/drop'); setMenuOpen(false);}}><Icons.Lock /> <span>Secure Drop</span></button>
          <button className={`nav-item ${isActive('/switch')}`} onClick={() => {navigate('/switch'); setMenuOpen(false);}}><Icons.Shield /> <span>Dead Man Switch</span></button>
          <button className={`nav-item ${isActive('/mail')}`} onClick={() => {navigate('/mail'); setMenuOpen(false);}}><Icons.Send /> <span>Anon Mail</span></button>
          
          <div style={{margin:'10px 0', height:'1px', background:'#e5e7eb'}}></div>
          
          {/* NUEVO BOTÓN DE REGISTRO */}
          <button className={`nav-item ${isActive('/register')}`} onClick={() => {navigate('/register'); setMenuOpen(false);}}><Icons.User /> <span>Crear Cuenta</span></button>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL (RUTAS) */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/drop" element={<SecureDrop />} />
          <Route path="/switch" element={<DeadMansSwitch />} />
          <Route path="/mail" element={<AnonymousMail />} />
          
          {/* 👇 AQUÍ ESTÁ TU NUEVA RUTA */}
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;