// client/src/App.jsx
import { useState, useEffect, useRef } from 'react';
import CryptoJS from 'crypto-js';
import './App.css';

const API_URL = 'http://127.0.0.1:4000/api';

// --- ICONOS VECTORIALES (SVG) ---
const Icons = {
  Logo: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
  Home: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Lock: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Shield: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Send: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Copy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  )
};

// --- VISTAS ---

function HomeView({ onNavigate }) {
  return (
    <div className="hero-wrapper">
      <h1 className="hero-title">
        Seguridad<br />
        <span style={{color: 'var(--primary)'}}>sin concesiones.</span>
      </h1>
      <p className="hero-subtitle">
        ZYPH proporciona infraestructura de encriptación de conocimiento cero. 
        Protege tus comunicaciones críticas sin intermediarios y sin dejar rastro digital.
      </p>
      
      <div style={{marginTop: '40px', display: 'flex', gap: '16px'}}>
        <button className="btn-primary" style={{width: 'auto', padding: '16px 32px'}} onClick={() => onNavigate('drop')}>
          Comenzar ahora
        </button>
      </div>
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
      const key = Math.random().toString(36).substring(2);
      const encrypted = CryptoJS.AES.encrypt(text, key).toString();
      const res = await fetch(`${API_URL}/secret`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cipherText: encrypted })
      });
      const data = await res.json();
      setLink(`${window.location.origin}/?id=${data.id}#${key}`);
    } catch (e) { alert('Error de conexión'); }
    setLoading(false);
  };

  return (
    <div className="feature-wrapper">
      <div className="section-header">
        <h2 className="section-title">Secure Drop</h2>
        <p className="section-desc">Comparte credenciales o datos sensibles mediante un enlace de un solo uso.</p>
      </div>
      
      {!link ? (
        <>
          <div className="input-group">
            <label className="input-label">CONTENIDO PRIVADO</label>
            <textarea placeholder="Pegue aquí la contraseña, clave API o mensaje confidencial..." value={text} onChange={e => setText(e.target.value)} autoFocus />
          </div>
          <button className="btn-primary" onClick={create} disabled={loading}>
            {loading ? 'Encriptando...' : 'Generar Enlace Seguro'}
          </button>
        </>
      ) : (
        <div className="result-card">
          <div style={{display:'flex', alignItems:'center', gap:'8px', color:'var(--text-heading)', fontWeight:'600'}}>
            <Icons.Check />
            <span>Enlace generado correctamente</span>
          </div>
          
          <div className="result-link">{link}</div>
          
          <div className="action-row">
            <button className="btn-primary" onClick={() => navigator.clipboard.writeText(link)}>
              Copiar Enlace
            </button>
            <button className="btn-secondary" onClick={() => {setLink(''); setText('')}}>
              Crear Nuevo
            </button>
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
    const res = await fetch(`${API_URL}/switch/create`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ recipientEmail: form.to, encryptedContent: form.msg, checkInFrequency: form.time })
    });
    const data = await res.json();
    setActiveId(data.id);
    setActive(true);
  };

  const checkIn = async () => {
    await fetch(`${API_URL}/switch/checkin`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ id: activeId })
    });
    alert('Vida confirmada. Temporizador reiniciado.');
  };

  return (
    <div className="feature-wrapper">
      <div className="section-header">
        <h2 className="section-title">Dead Man's Switch</h2>
        <p className="section-desc">Sistema automatizado de liberación de información por inactividad.</p>
      </div>
      
      {!active ? (
        <>
          <div className="input-group">
            <label className="input-label">DESTINATARIO</label>
            <input type="email" placeholder="email@ejemplo.com" value={form.to} onChange={e => setForm({...form, to: e.target.value})} />
          </div>

          <div className="input-group">
            <label className="input-label">MENSAJE AUTOMÁTICO</label>
            <textarea placeholder="Este mensaje se enviará si dejas de responder..." value={form.msg} onChange={e => setForm({...form, msg: e.target.value})} />
          </div>
          
          <div className="input-group">
            <label className="input-label">PERIODO DE INACTIVIDAD (MINUTOS)</label>
            <input type="number" min="1" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
          </div>

          <button className="btn-primary" onClick={activate} style={{backgroundColor:'#dc2626'}}>
            Activar Protocolo
          </button>
        </>
      ) : (
        <div className="result-card" style={{textAlign:'center'}}>
          <div style={{color:'var(--primary)', marginBottom:'20px'}}>
             <Icons.Shield />
          </div>
          <h3 style={{margin:'0 0 10px 0'}}>Monitoreo Activo</h3>
          <p style={{color:'var(--text-muted)', marginBottom:'24px'}}>El sistema espera tu confirmación cada {form.time} minutos.</p>
          <button className="btn-primary" onClick={checkIn} style={{backgroundColor:'#16a34a'}}>
            Confirmar Actividad
          </button>
        </div>
      )}
    </div>
  );
}

function AnonymousMail() {
  const [form, setForm] = useState({ to: '', sub: '', body: '' });
  const send = async () => {
    await fetch(`${API_URL}/email`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ to: form.to, subject: form.sub, message: form.body })
    });
    alert('Correo enviado a la cola de salida.');
    setForm({ to: '', sub: '', body: '' });
  };

  return (
    <div className="feature-wrapper">
      <div className="section-header">
        <h2 className="section-title">Anonymous Mail</h2>
        <p className="section-desc">Envío de comunicaciones unidireccionales sin metadatos de origen.</p>
      </div>

      <div className="input-group">
        <label className="input-label">DESTINATARIO</label>
        <input placeholder="cliente@empresa.com" value={form.to} onChange={e => setForm({...form, to: e.target.value})} />
      </div>

      <div className="input-group">
        <label className="input-label">ASUNTO</label>
        <input placeholder="Asunto del mensaje" value={form.sub} onChange={e => setForm({...form, sub: e.target.value})} />
      </div>

      <div className="input-group">
        <label className="input-label">MENSAJE</label>
        <textarea placeholder="Escriba su mensaje..." value={form.body} onChange={e => setForm({...form, body: e.target.value})} />
      </div>

      <button className="btn-primary" onClick={send}>
        <span style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <Icons.Send /> Enviar Correo
        </span>
      </button>
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
      .then(r => r.status===404 ? 'exp' : r.json())
      .then(d => {
        if(d==='exp') setMsg('⛔ Mensaje destruido o inexistente.');
        else if(d?.cipherText) {
             try { setMsg(CryptoJS.AES.decrypt(d.cipherText, hash).toString(CryptoJS.enc.Utf8)); }
             catch { setMsg('Error de llave de desencriptado'); }
        }
      })
      .catch(() => setMsg('Error de conexión'));
  }, [id, hash]);

  return (
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', flexDirection:'column'}}>
      <div style={{maxWidth:'600px', width:'100%', padding:'20px'}}>
        <h2 className="section-title" style={{textAlign:'center'}}>Mensaje Seguro</h2>
        <div className="result-card" style={{marginTop:'20px', background:'white'}}>
            <div style={{whiteSpace:'pre-wrap', fontFamily:'inherit', color:'var(--text-heading)'}}>{msg}</div>
        </div>
        <div style={{textAlign:'center', marginTop:'30px'}}>
            <a href="/" style={{color:'var(--primary)', fontWeight:'600', textDecoration:'none'}}>Ir a ZYPH</a>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState('home');
  const [params, setParams] = useState(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const id = p.get('id');
    const hash = window.location.hash.substring(1);
    if(id && hash) { setParams({id, hash}); setView('read'); }
  }, []);

  if (view === 'read') return <Viewer id={params.id} hash={params.hash} />;

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-logo"><Icons.Logo /></div>
          <span className="brand-text">ZYPH</span>
        </div>
        
        <nav className="nav-menu">
          <button className={`nav-item ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')}>
            <Icons.Home /> <span>Inicio</span>
          </button>
          
          <button className={`nav-item ${view === 'drop' ? 'active' : ''}`} onClick={() => setView('drop')}>
            <Icons.Lock /> <span>Secure Drop</span>
          </button>

          <button className={`nav-item ${view === 'switch' ? 'active' : ''}`} onClick={() => setView('switch')}>
            <Icons.Shield /> <span>Dead Man Switch</span>
          </button>

          <button className={`nav-item ${view === 'mail' ? 'active' : ''}`} onClick={() => setView('mail')}>
            <Icons.Send /> <span>Anon Mail</span>
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {view === 'home' && <HomeView onNavigate={setView} />}
        {view === 'drop' && <SecureDrop />}
        {view === 'switch' && <DeadMansSwitch />}
        {view === 'mail' && <AnonymousMail />}
      </main>
    </div>
  );
}

export default App;