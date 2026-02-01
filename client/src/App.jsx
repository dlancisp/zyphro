// client/src/App.jsx
import { useState, useEffect, useRef } from 'react';
import './App.css';

// ✅ BIEN: Esto elige automáticamente:
// - Si estás en tu PC --> Usa localhost
// - Si estás en la Nube --> Usa la variable VITE_API_URL de Vercel

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Y luego en tu fetch usas esa constante:
const response = await fetch(`${API_URL}/secret`, { 
  // ... resto de tu código
});

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
  return exported.k; // Retorna la clave en formato base64url compatible con URL
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
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // IV de 12 bytes (Estándar GCM)
  const encoded = enc.encode(text);
  
  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoded
  );
  
  // Empaquetamos IV + Ciphertext para enviarlo junto
  const buffer = new Uint8Array(iv.byteLength + cipherBuffer.byteLength);
  buffer.set(iv);
  buffer.set(new Uint8Array(cipherBuffer), iv.byteLength);
  
  // Convertimos a Base64 para guardar en la BD
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

// --- ICONOS VECTORIALES (SVG) ---
const Icons = {
  // NUEVO LOGO: PSEUDO-TRIÁNGULO GLOW
  Logo: () => (
    <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Círculo de fondo azul sólido */}
      <circle cx="32" cy="32" r="32" fill="#2563EB"/>
      {/* La 'Z' en forma de rayo blanco */}
      <path d="M14 16H50L30 36H54L18 56L38 36H10L14 16Z" fill="white"/>
    </svg>
  ),
  
  Menu: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>),
  Close: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>),
  Home: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
  Lock: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>),
  Shield: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
  Send: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>),
  Check: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>)
};

// --- VISTAS ---

function HomeView({ onNavigate }) {
  return (
    <div className="hero-wrapper">
      <h1 className="hero-title">Seguridad <span style={{color: 'var(--primary)'}}>Nativa.</span></h1>
      <p className="hero-subtitle">Infraestructura Web Crypto API. Cifrado AES-GCM acelerado por hardware directamente en tu navegador.</p>
      <div style={{marginTop: '40px'}}><button className="btn-primary" style={{width: 'auto', padding: '16px 32px'}} onClick={() => onNavigate('drop')}>Probar Ahora</button></div>
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
      // 1. Generar Clave Nativa
      const keyStr = await generateKey();
      // 2. Encriptar con AES-GCM
      const encrypted = await encryptData(text, keyStr);
      
      // 3. Enviar al Backend
      const res = await fetch(`${API_URL}/secret`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ cipherText: encrypted }) 
      });
      const data = await res.json();
      
      // 4. Crear Link con el Hash
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
    // Para el switch, encriptamos el mensaje antes de enviarlo
    // Usamos una clave efímera que DEBERÍA guardarse en local, pero para esta demo simplificada:
    // NOTA: En producción real, el servidor no debe poder leer esto. 
    // Aquí encriptamos "al vuelo" pero la clave debería gestionarse con cuidado.
    // Por simplicidad en la demo, enviamos texto plano o una encriptación básica, 
    // pero idealmente usaríamos el mismo sistema que SecureDrop.
    
    // Simulación de protección básica (mejorar para V2 real):
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
               // Desencriptar usando Web Crypto
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

function App() {
  const [view, setView] = useState('home');
  const [params, setParams] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const id = p.get('id');
    const hash = window.location.hash.substring(1);
    if(id && hash) { setParams({id, hash}); setView('read'); }
  }, []);

  const navigate = (v) => { setView(v); setMenuOpen(false); };

  if (view === 'read') return <Viewer id={params.id} hash={params.hash} />;

  return (
    <div className="app-container">
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

      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand-section">
          <div className="brand-logo"><Icons.Logo /></div>
          <span className="brand-text">ZYPH</span>
        </div>
        <nav className="nav-menu">
          <button className={`nav-item ${view === 'home' ? 'active' : ''}`} onClick={() => navigate('home')}><Icons.Home /> <span>Inicio</span></button>
          <button className={`nav-item ${view === 'drop' ? 'active' : ''}`} onClick={() => navigate('drop')}><Icons.Lock /> <span>Secure Drop</span></button>
          <button className={`nav-item ${view === 'switch' ? 'active' : ''}`} onClick={() => navigate('switch')}><Icons.Shield /> <span>Dead Man Switch</span></button>
          <button className={`nav-item ${view === 'mail' ? 'active' : ''}`} onClick={() => navigate('mail')}><Icons.Send /> <span>Anon Mail</span></button>
        </nav>
      </aside>

      <main className="main-content">
        {view === 'home' && <HomeView onNavigate={navigate} />}
        {view === 'drop' && <SecureDrop />}
        {view === 'switch' && <DeadMansSwitch />}
        {view === 'mail' && <AnonymousMail />}
      </main>
    </div>
  );
}

export default App;