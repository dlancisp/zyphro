import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Register from './Register';
import DOMPurify from 'dompurify';
import { Toaster, toast } from 'react-hot-toast'; // ✅ Notificaciones bonitas

// --- CONFIGURACIÓN API ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// --- UTILIDADES CRIPTOGRÁFICAS (AES-GCM) ---
const cryptoUtils = {
  enc: new TextEncoder(),
  dec: new TextDecoder(),
  
  generateKey: async () => {
    const key = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
    );
    return (await window.crypto.subtle.exportKey("jwk", key)).k;
  },

  importKey: async (k) => {
    return await window.crypto.subtle.importKey(
      "jwk", { k, kty: "oct", alg: "A256GCM", ext: true },
      { name: "AES-GCM" }, false, ["encrypt", "decrypt"]
    );
  },

  encryptData: async (text, keyStr) => {
    const key = await cryptoUtils.importKey(keyStr);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = cryptoUtils.enc.encode(text);
    const cipherBuffer = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
    
    const buffer = new Uint8Array(iv.byteLength + cipherBuffer.byteLength);
    buffer.set(iv);
    buffer.set(new Uint8Array(cipherBuffer), iv.byteLength);
    return btoa(String.fromCharCode(...buffer));
  },

  decryptData: async (base64Data, keyStr) => {
    const key = await cryptoUtils.importKey(keyStr);
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
    
    const iv = bytes.slice(0, 12);
    const data = bytes.slice(12);
    const decryptedBuffer = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return cryptoUtils.dec.decode(decryptedBuffer);
  }
};

// --- ICONOS (Con tu Logo Nuevo) ---
const Icons = {
  Logo: () => (
    <svg width="40" height="40" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="zyphroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" /> {/* Azul */}
          <stop offset="100%" stopColor="#9333ea" /> {/* Violeta */}
        </linearGradient>
      </defs>
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M17 0C17.5523 0 18 0.447715 18 1V8.39648C18 8.61918 18.2693 8.7307 18.4268 8.57324L26.4141 0.585938C26.7891 0.210936 27.2978 7.97938e-05 27.8281 0H36.5859C36.8511 4.04019e-05 37.1055 0.105468 37.293 0.292969L40.293 3.29297C40.6834 3.68347 40.6834 4.31653 40.293 4.70703L36.4268 8.57324C36.2693 8.73073 36.3808 8.99997 36.6035 9H44.5859C44.8511 9.00004 45.1055 9.10547 45.293 9.29297L48.293 12.293C48.6834 12.6835 48.6834 13.3165 48.293 13.707L44.3535 17.6465C44.1583 17.8417 44.1583 18.1583 44.3535 18.3535L47.5859 21.5859C48.4914 22.4914 49 23.7195 49 25C49 26.2805 48.4913 27.5086 47.5859 28.4141L36.5859 39.4141C36.2109 39.7891 35.7022 39.9999 35.1719 40H32C31.4477 40 31 39.5523 31 39V31.6035C31 31.3808 30.7307 31.2693 30.5732 31.4268L22.5859 39.4141C22.2109 39.7891 21.7022 39.9999 21.1719 40H12.4141C12.1489 40 11.8945 39.8945 11.707 39.707L8.70703 36.707C8.31661 36.3165 8.31661 35.6835 8.70703 35.293L12.5732 31.4268C12.7307 31.2693 12.6192 31 12.3965 31H4.41406C4.1489 31 3.89453 30.8945 3.70703 30.707L0.707031 27.707C0.316606 27.3165 0.316607 26.6835 0.707031 26.293L4.64648 22.3535C4.8417 22.1583 4.8417 21.8417 4.64648 21.6465L1.41406 18.4141C0.508652 17.5086 0 16.2805 0 15C0 13.7195 0.508651 12.4914 1.41406 11.5859L12.4141 0.585938C12.7891 0.210936 13.2978 8.00463e-05 13.8281 0H17ZM20.0713 9C18.7452 9 17.4728 9.52716 16.5352 10.4648L5.85352 21.1465C5.53861 21.4615 5.76165 21.9999 6.20703 22H20.793C21.2383 22.0001 21.4613 22.5386 21.1465 22.8535L13.8535 30.1465C13.5386 30.4615 13.7616 30.9999 14.207 31H28.9287C30.2548 31 31.5272 30.4728 32.4648 29.5352L43.1465 18.8535C43.4417 18.5583 43.2642 18.0663 42.874 18.0059L42.793 18H28.207C27.7616 18 27.5386 17.4615 27.8535 17.1465L35.1465 9.85352C35.4614 9.53855 35.2384 9.00006 34.793 9H20.0713Z" 
        fill="url(#zyphroGrad)" 
      />
    </svg>
  ),
  Menu: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>),
  Close: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>),
  Home: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
  Lock: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>),
  Shield: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
  Send: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>),
  Check: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>),
  User: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>)
};

// --- COMPONENTES ---

function HomeView() {
  const navigate = useNavigate();
  return (
    <div className="hero-wrapper">
      <h1 className="hero-title">Seguridad <span style={{color: 'var(--primary)'}}>Nativa.</span></h1>
      <p className="hero-subtitle">Infraestructura Web Crypto API. Cifrado AES-GCM acelerado por hardware directamente en tu navegador.</p>
      <div style={{marginTop: '40px'}}>
        <button className="btn-primary" style={{width: 'auto', padding: '16px 32px'}} onClick={() => navigate('/drop')}>
          Probar Ahora
        </button>
      </div>
    </div>
  );
}

function SecureDrop() {
  const [state, setState] = useState({ text: '', link: '', loading: false });

  const create = async () => {
    if (!state.text) {
        toast.error('Por favor, escribe un secreto.');
        return;
    }
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const keyStr = await cryptoUtils.generateKey();
      const encrypted = await cryptoUtils.encryptData(state.text, keyStr);
      
      const res = await fetch(`${API_URL}/secret`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ cipherText: encrypted }) 
      });
      
      if (!res.ok) throw new Error('Error en servidor');
      const data = await res.json();
      
      setState({ 
        text: '', 
        loading: false, 
        link: `${window.location.origin}/?id=${data.id}#${keyStr}` 
      });
      toast.success('¡Secreto encriptado correctamente!');

    } catch (e) { 
      console.error(e);
      toast.error('Error de encriptación o conexión');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="feature-wrapper">
      <div className="section-header">
        <h2 className="section-title">Secure Drop</h2>
        <p className="section-desc">Cifrado AES-256-GCM. Nadie más puede leerlo.</p>
      </div>
      
      {!state.link ? (
        <>
          <div className="input-group">
            <label className="input-label">CONTENIDO PRIVADO</label>
            <textarea 
              placeholder="Escribe aquí tu secreto..." 
              value={state.text} 
              onChange={e => setState({...state, text: e.target.value})} 
            />
          </div>
          <button className="btn-primary" onClick={create} disabled={state.loading}>
            {state.loading ? 'Encriptando...' : 'Encriptar y Generar Enlace'}
          </button>
        </>
      ) : (
        <div className="result-card">
          <div style={{display:'flex', alignItems:'center', gap:'8px', fontWeight:'600', color:'var(--text-heading)'}}>
            <Icons.Check /><span>Enlace Seguro Generado</span>
          </div>
          <div className="result-link">{state.link}</div>
          <div className="action-row">
            <button className="btn-primary" style={{flex:1}} onClick={() => {
                navigator.clipboard.writeText(state.link);
                toast.success('¡Enlace copiado al portapapeles!');
            }}>Copiar</button>
            <button className="btn-secondary" onClick={() => setState({text:'', link:'', loading:false})}>Nuevo</button>
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
  const [loading, setLoading] = useState(false);

  const activate = async () => {
    if(!form.to || !form.msg) return toast.error("Rellena todos los campos");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/switch/create`, { 
          method: 'POST', headers: {'Content-Type':'application/json'}, 
          body: JSON.stringify({ recipientEmail: form.to, encryptedContent: form.msg, checkInFrequency: form.time }) 
      });
      const data = await res.json();
      setActiveId(data.id); 
      setActive(true);
      toast.success('Protocolo activado. El tiempo corre.');
    } catch(e) { toast.error("Error al conectar"); }
    setLoading(false);
  };

  const checkIn = async () => {
    await fetch(`${API_URL}/switch/checkin`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: activeId }) });
    toast.success('Vida confirmada. Contador reseteado.');
  };

  return (
    <div className="feature-wrapper">
      <div className="section-header">
        <h2 className="section-title">Dead Man's Switch</h2>
        <p className="section-desc">Si no das señales de vida, enviamos el mensaje.</p>
      </div>
      {!active ? (
        <>
          <div className="input-group"><label className="input-label">DESTINATARIO</label><input type="email" value={form.to} onChange={e => setForm({...form, to: e.target.value})} /></div>
          <div className="input-group"><label className="input-label">MENSAJE SECRETO</label><textarea value={form.msg} onChange={e => setForm({...form, msg: e.target.value})} /></div>
          <div className="input-group"><label className="input-label">TIEMPO (MINUTOS)</label><input type="number" min="1" value={form.time} onChange={e => setForm({...form, time: e.target.value})} /></div>
          <button className="btn-primary" onClick={activate} disabled={loading} style={{background:'#dc2626'}}>
            {loading ? 'Activando...' : 'Activar Protocolo'}
          </button>
        </>
      ) : (
        <div className="result-card" style={{textAlign:'center'}}>
          <div style={{color:'var(--primary)', marginBottom:'10px'}}><Icons.Shield /></div>
          <h3>Monitoreo Activo</h3>
          <p style={{marginBottom:'20px'}}>Debes confirmar vida cada {form.time} min.</p>
          <button className="btn-primary" onClick={checkIn} style={{background:'#16a34a'}}>Confirmar Vida</button>
        </div>
      )}
    </div>
  );
}

function AnonymousMail() {
  const [form, setForm] = useState({ to: '', sub: '', body: '' });
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/email`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ to: form.to, subject: form.sub, message: form.body }) });
      toast.success('Correo anónimo enviado con éxito.'); 
      setForm({ to: '', sub: '', body: '' });
    } catch(e) { toast.error("Error al enviar"); }
    setLoading(false);
  };

  return (
    <div className="feature-wrapper">
      <div className="section-header"><h2 className="section-title">Anon Mail</h2><p className="section-desc">Envía correos sin dejar rastro.</p></div>
      <div className="input-group"><label className="input-label">DESTINATARIO</label><input value={form.to} onChange={e => setForm({...form, to: e.target.value})} /></div>
      <div className="input-group"><label className="input-label">ASUNTO</label><input value={form.sub} onChange={e => setForm({...form, sub: e.target.value})} /></div>
      <div className="input-group"><label className="input-label">MENSAJE</label><textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} /></div>
      <button className="btn-primary" onClick={send} disabled={loading}><Icons.Send /><span style={{marginLeft:'8px'}}>{loading ? 'Enviando...' : 'Enviar'}</span></button>
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
          setMsg('⛔ Este mensaje ha sido destruido o no existe.');
          toast.error('Mensaje no encontrado');
        } else if(d?.cipherText) {
          try { 
            const decrypted = await cryptoUtils.decryptData(d.cipherText, hash);
            const cleanMessage = DOMPurify.sanitize(decrypted); 
            setMsg(cleanMessage); 
            toast.success('Mensaje descifrado correctamente');
          } catch (e) { 
            setMsg('❌ Error: La llave de desencriptado es incorrecta.'); 
            toast.error('Llave incorrecta');
          }
        }
      })
      .catch(() => {
          setMsg('Error de conexión con el servidor.');
          toast.error('Error de conexión');
      });
  }, [id, hash]);

  return (
    <div style={{padding:'40px 20px', maxWidth:'600px', margin:'0 auto', textAlign:'center'}}>
      <h2 className="section-title">Mensaje Seguro Recibido</h2>
      <div className="result-card" style={{marginTop:'20px', background:'white', whiteSpace:'pre-wrap', textAlign:'left', borderLeft: '4px solid var(--primary)', color: '#333'}}>
        {msg}
      </div>
      <a href="/" style={{display:'block', marginTop:'30px', color:'var(--primary)', textDecoration:'none', fontWeight:'600'}}>Crear mi propio secreto en ZYPH</a>
    </div>
  );
}

// --- APP PRINCIPAL ---

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [viewerParams, setViewerParams] = useState(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const id = p.get('id');
    const hash = window.location.hash.substring(1);
    if(id && hash) setViewerParams({id, hash});
  }, []);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  if (viewerParams) return <Viewer id={viewerParams.id} hash={viewerParams.hash} />;

  return (
    <div className="app-container">
      {/* HEADER MÓVIL */}
      <header className="mobile-header">
        <div style={{display:'flex', alignItems:'center', gap:'8px'}} onClick={() => navigate('/')}>
          <div style={{color:'var(--primary)'}}><Icons.Logo /></div>
          <span style={{fontWeight:'700', fontSize:'1.1rem'}}>ZYPHRO</span>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{background:'none', border:'none', cursor:'pointer', color:'var(--text-heading)'}}>
          {menuOpen ? <Icons.Close /> : <Icons.Menu />}
        </button>
      </header>
      
      <div className={`mobile-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}></div>

      {/* SIDEBAR */}
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand-section" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <div className="brand-logo"><Icons.Logo /></div>
          <span className="brand-text">ZYPHRO</span>
        </div>
        <nav className="nav-menu">
          <button className={`nav-item ${isActive('/')}`} onClick={() => {navigate('/'); setMenuOpen(false);}}><Icons.Home /> <span>Inicio</span></button>
          <button className={`nav-item ${isActive('/drop')}`} onClick={() => {navigate('/drop'); setMenuOpen(false);}}><Icons.Lock /> <span>Secure Drop</span></button>
          <button className={`nav-item ${isActive('/switch')}`} onClick={() => {navigate('/switch'); setMenuOpen(false);}}><Icons.Shield /> <span>Dead Man Switch</span></button>
          <button className={`nav-item ${isActive('/mail')}`} onClick={() => {navigate('/mail'); setMenuOpen(false);}}><Icons.Send /> <span>Anon Mail</span></button>
          
          <div style={{margin:'15px 0', height:'1px', background:'#e5e7eb'}}></div>
          
          <button className={`nav-item ${isActive('/register')}`} onClick={() => {navigate('/register'); setMenuOpen(false);}}><Icons.User /> <span>Crear Cuenta</span></button>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/drop" element={<SecureDrop />} />
          <Route path="/switch" element={<DeadMansSwitch />} />
          <Route path="/mail" element={<AnonymousMail />} />
          <Route path="/register" element={<Register />} />
        </Routes>

        {/* FOOTER - PIE DE PÁGINA PROFESIONAL */}
        <footer style={{
            marginTop: '80px', 
            borderTop: '1px solid var(--border)', 
            paddingTop: '30px',
            paddingBottom: '30px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem'
        }}>
            <div style={{display:'flex', justifyContent:'center', gap:'10px', alignItems:'center', marginBottom:'15px'}}>
                <Icons.Logo /> 
                <span style={{fontWeight:'600', color:'white'}}>ZYPHRO</span>
            </div>
            <p>© 2026 Zyphro Security Inc. Protocolo Zero-Knowledge.</p>
        </footer>
      </main>

      {/* SISTEMA DE NOTIFICACIONES */}
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#1e293b', /* Fondo oscuro a juego con el tema */
            color: '#fff',
            border: '1px solid #334155',
            borderRadius: '10px',
          },
        }}
      />
      
    </div>
  );
}

export default App;