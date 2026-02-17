import React, { useState, useEffect } from 'react';
import { useAuth, SignInButton, SignedIn, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { 
  Lock, Eye, X, Plus, ChevronRight, Copy, ShieldCheck, 
  Terminal, Trash2, Clock, ChevronDown, Cloud, Mail as MailIcon, Skull 
} from 'lucide-react';

const API_URL = ''; 

export default function DeadManSwitch() {
  const { getToken, isLoaded, userId } = useAuth();
  
  // Estados de datos
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de interfaz
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [saving, setSaving] = useState(false);

  const [selectedSecret, setSelectedSecret] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (isLoaded && userId) {
      fetchSecrets();
    }
  }, [isLoaded, userId]);

  const fetchSecrets = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/vault`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      setSecrets(data);
    } catch (err) {
      setError('No se pudo conectar con la bóveda.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/vault`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle, content: newContent, type: 'note', nonce: null })
      });
      if (!res.ok) throw new Error('Error al guardar');
      await fetchSecrets();
      setNewTitle('');
      setNewContent('');
      setIsFormOpen(false);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center bg-[#020617] text-blue-500 font-mono text-xs tracking-[0.3em] uppercase">Sincronizando...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* --- NAVBAR PREMIUM UNIFICADO --- */}
      <nav className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center relative z-[100]">
        <Link to="/" className="flex items-center group">
          <span style={{ fontSize: '1.875rem', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-0.05em', textTransform: 'uppercase', color: '#2563eb', display: 'inline-block', paddingRight: '0.4em' }}>
            ZYPHRO
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-colors">Home</Link>
          <div className="relative" onMouseEnter={() => setIsServicesOpen(true)} onMouseLeave={() => setIsServicesOpen(false)}>
            <button className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-white transition-all cursor-pointer outline-none">
              Servicios <ChevronDown size={12} className={isServicesOpen ? 'rotate-180' : ''} />
            </button>
            {isServicesOpen && (
              <div className="absolute top-full -left-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-64 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl text-left">
                  <Link to="/drop" className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group">
                    <div className="bg-blue-600/20 p-2 rounded-lg text-blue-500"><Cloud size={16} /></div>
                    <p className="text-[10px] font-black uppercase">Secure Drop</p>
                  </Link>
                  <Link to="/mail" className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 mt-1 transition-all">
                    <MailIcon size={16} className="text-emerald-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Anon Mail</p>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
           <Link to="/dashboard" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-all">Dashboard</Link>
           <SignedIn><UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-9 h-9 border border-blue-500/50" } }} /></SignedIn>
        </div>
      </nav>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="max-w-5xl mx-auto px-6 pt-12 pb-24 relative z-10">
        
        {/* CABECERA DE LA BÓVEDA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <div className="px-3 py-1 bg-blue-600/10 border border-blue-600/20 rounded-full text-[9px] font-black text-blue-500 uppercase tracking-widest">Protocolo Switch Activo</div>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white italic uppercase">Bóveda Digital</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
              <ShieldCheck size={14} className="text-blue-600" /> Cifrado de grado militar XChaCha20
            </p>
          </div>
          
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95"
          >
            {isFormOpen ? <X size={16} /> : <Plus size={16} />}
            {isFormOpen ? 'Cerrar Terminal' : 'Inyectar Secreto'}
          </button>
        </div>

        {/* FORMULARIO ESTILO TERMINAL */}
        {isFormOpen && (
          <div className="mb-16 bg-slate-900/40 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-3xl animate-in slide-in-from-top-4 duration-500 shadow-2xl">
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Título del Activo</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-blue-600 outline-none font-bold transition-all"
                    placeholder="Ej: Acceso Servidor Central"
                  />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Estado del Nodo</label>
                    <div className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-[10px] font-mono text-emerald-500 uppercase">
                        {">"} Node_Ready_for_encryption
                    </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Contenido Seguro (Payload)</label>
                <textarea 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-blue-50 h-40 focus:border-blue-600 outline-none font-mono text-sm resize-none transition-all shadow-inner"
                  placeholder="Introduce la información que será liberada..."
                />
              </div>
              <button 
                disabled={saving}
                className="w-full bg-white text-black hover:bg-slate-200 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all disabled:opacity-50"
              >
                {saving ? 'Cifrando Bits...' : 'Confirmar e Inyectar en Bóveda'}
              </button>
            </form>
          </div>
        )}

        {/* CUADRÍCULA DE SECRETOS */}
        {loading ? (
           <div className="text-center py-20 text-slate-600 font-mono text-[10px] uppercase tracking-[0.4em] animate-pulse italic">Escaneando sectores de memoria...</div>
        ) : secrets.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2 group hover:border-blue-600/20 transition-all">
            <Lock className="mx-auto h-12 w-12 text-slate-800 group-hover:text-blue-900 transition-colors mb-6" />
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">La bóveda está vacía. No hay secretos activos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {secrets.map((secret) => (
              <div 
                key={secret.id} 
                onClick={() => { setSelectedSecret(secret); setIsRevealed(false); }}
                className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] hover:bg-slate-800/60 hover:border-blue-600/30 transition-all cursor-pointer group shadow-xl"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-blue-600/10 p-3 rounded-xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Lock size={18} />
                  </div>
                  <span className="text-[9px] font-mono text-slate-600 group-hover:text-slate-400 transition-colors">
                    {new Date(secret.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-black italic uppercase tracking-tight text-slate-200 group-hover:text-white transition-colors mb-4">{secret.title}</h3>
                <div className="flex items-center gap-2 text-[9px] text-emerald-500 font-black tracking-widest">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   CIFRADO_ACTIVO
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- MODAL DE DETALLES PREMIUM --- */}
        {selectedSecret && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-[0_0_100px_rgba(37,99,235,0.15)] overflow-hidden">
              
              <div className="bg-white/5 p-8 border-b border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Inspección de Objeto</p>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">{selectedSecret.title}</h2>
                </div>
                <button onClick={() => setSelectedSecret(null)} className="text-slate-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="p-10">
                <p className="text-[9px] font-black text-slate-600 mb-4 uppercase tracking-[0.3em]">Capa de Datos (XChaCha20)</p>
                
                <div className="relative">
                  <div className={`bg-black/60 border border-white/5 p-8 rounded-[1.5rem] font-mono text-sm text-blue-100 break-all transition-all duration-700 ${isRevealed ? 'blur-none' : 'blur-xl select-none'}`}>
                    {selectedSecret.content}
                  </div>

                  {!isRevealed && (
                    <div 
                      onClick={() => setIsRevealed(true)}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                    >
                      <div className="bg-blue-600 text-white px-6 py-3 rounded-full flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-2xl group-hover:scale-110 transition-transform">
                        <Eye size={16} /> Ver Contenido
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mt-10">
                  <button 
                    onClick={() => {copyToClipboard(selectedSecret.content); alert("Copiado")}}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2"
                  >
                    <Copy size={16} /> Copiar
                  </button>
                  <button 
                    onClick={() => setSelectedSecret(null)}
                    className="flex-1 bg-slate-800 text-slate-400 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest"
                  >
                    Cerrar Bóveda
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex justify-center opacity-30">
          <span className="text-[9px] font-black text-slate-600 tracking-[0.5em] uppercase italic underline underline-offset-8 decoration-blue-500">Zyphro Encryption Vault v2.0</span>
      </footer>
    </div>
  );
}