import React, { useState, useEffect } from 'react';
import { useAuth, SignedIn, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { 
  Lock, Eye, X, Plus, Copy, ShieldCheck, 
  Trash2, Clock, ChevronDown, Cloud, Mail as MailIcon, 
  Terminal, ShieldAlert, LayoutGrid
} from 'lucide-react';
import { API_URL } from '../apiConfig'; // IMPORTANTE: Usamos la config centralizada
import DmsConfig from '../components/DmsConfig'; // Importamos tu nuevo componente dark

export default function DeadManSwitch() {
  const { getToken, isLoaded, userId } = useAuth();
  
  // Estados de datos
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // Ajustamos a tu ruta real de la API de bóveda
      const res = await fetch(`${API_URL}/api/vault`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      setSecrets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error de conexión con la bóveda.');
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
        body: JSON.stringify({ title: newTitle, content: newContent, type: 'note' })
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

  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="flex flex-col items-center gap-4">
        <Terminal className="text-blue-500 animate-pulse" size={40} />
        <span className="text-blue-500 font-mono text-[10px] tracking-[0.3em] uppercase">Sincronizando Bóveda...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* NAVBAR PREMIUM */}
      <nav className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center relative z-[100]">
        <Link to="/" className="flex items-center group">
          <span className="text-3xl font-black italic tracking-tighter text-blue-600 uppercase">ZYPHRO</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link to="/dashboard" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-colors">Dashboard</Link>
          <div className="relative" onMouseEnter={() => setIsServicesOpen(true)} onMouseLeave={() => setIsServicesOpen(false)}>
            <button className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-white transition-all cursor-pointer outline-none">
              Servicios <ChevronDown size={12} className={isServicesOpen ? 'rotate-180' : ''} />
            </button>
            {isServicesOpen && (
              <div className="absolute top-full -left-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-64 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl">
                  <Link to="/drop" className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all">
                    <Cloud size={16} className="text-blue-500" />
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
           <SignedIn><UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-9 h-9 border border-blue-500/50" } }} /></SignedIn>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-12 pb-24 relative z-10">
        
        {/* SECCIÓN 1: CONFIGURACIÓN DEL PROTOCOLO (EL CEREBRO) */}
        <div className="mb-20 space-y-8">
          <div className="flex items-center gap-3 px-4">
            <ShieldAlert size={20} className="text-blue-600" />
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Configuración del Interruptor</h4>
          </div>
          <DmsConfig isSummary={false} />
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-20" />

        {/* SECCIÓN 2: GESTIÓN DE LA BÓVEDA (LOS ACTIVOS) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <div className="px-3 py-1 bg-blue-600/10 border border-blue-600/20 rounded-full text-[9px] font-black text-blue-500 uppercase tracking-widest">Almacenamiento Cifrado</div>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white italic uppercase">Activos de Herencia</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
              <Lock size={14} className="text-blue-600" /> Estos secretos se liberarán solo si el protocolo DMS se activa.
            </p>
          </div>
          
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95"
          >
            {isFormOpen ? <X size={16} /> : <Plus size={16} />}
            {isFormOpen ? 'Cerrar Terminal' : 'Añadir Activo'}
          </button>
        </div>

        {isFormOpen && (
          <div className="mb-16 bg-slate-900/40 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-3xl animate-in slide-in-from-top-4 duration-500 shadow-2xl">
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Identificador del Secreto</label>
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-blue-600 outline-none font-bold" placeholder="Ej: Claves Ledger" />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Estado de Inyección</label>
                    <div className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-[10px] font-mono text-emerald-500 uppercase"> {">"} Ready_for_Vault_Storage </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Datos Sensibles (Payload)</label>
                <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-blue-50 h-40 focus:border-blue-600 outline-none font-mono text-sm resize-none shadow-inner" placeholder="Introduce la información que será liberada..." />
              </div>
              <button disabled={saving} className="w-full bg-white text-black hover:bg-slate-200 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all disabled:opacity-50">
                {saving ? 'Cifrando Bits...' : 'Asegurar en Bóveda'}
              </button>
            </form>
          </div>
        )}

        {/* LISTADO DE ACTIVOS */}
        {loading ? (
            <div className="text-center py-20 text-slate-600 font-mono text-[10px] uppercase tracking-[0.4em] animate-pulse italic">Escaneando memoria...</div>
        ) : secrets.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
            <p className="text-slate-600 font-black text-[10px] uppercase tracking-widest">Bóveda vacía. Protocolo DMS sin carga.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {secrets.map((secret) => (
              <div key={secret.id} onClick={() => { setSelectedSecret(secret); setIsRevealed(false); }} className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] hover:bg-slate-800/60 hover:border-blue-600/30 transition-all cursor-pointer group shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-blue-600/10 p-3 rounded-xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all"> <Lock size={18} /> </div>
                  <span className="text-[9px] font-mono text-slate-600"> {new Date(secret.createdAt).toLocaleDateString()} </span>
                </div>
                <h3 className="text-lg font-black italic uppercase tracking-tight text-slate-200 group-hover:text-white mb-4">{secret.title}</h3>
                <div className="flex items-center gap-2 text-[9px] text-emerald-500 font-black tracking-widest">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> PROTEGIDO
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL DE DETALLE */}
        {selectedSecret && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="bg-white/5 p-8 border-b border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Activo Digital</p>
                  <h2 className="text-2xl font-black italic uppercase text-white">{selectedSecret.title}</h2>
                </div>
                <button onClick={() => setSelectedSecret(null)} className="text-slate-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full"> <X size={20} /> </button>
              </div>
              <div className="p-10">
                <div className="relative mb-8">
                  <div className={`bg-black/60 border border-white/5 p-8 rounded-[1.5rem] font-mono text-sm text-blue-100 break-all transition-all duration-700 ${isRevealed ? 'blur-none' : 'blur-xl select-none'}`}>
                    {selectedSecret.content}
                  </div>
                  {!isRevealed && (
                    <div onClick={() => setIsRevealed(true)} className="absolute inset-0 flex items-center justify-center cursor-pointer group">
                      <div className="bg-blue-600 text-white px-6 py-3 rounded-full flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-2xl group-hover:scale-110 transition-all">
                        <Eye size={16} /> Inspeccionar Carga
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => {navigator.clipboard.writeText(selectedSecret.content); toast.success("Copiado")}} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-black text-[10px] uppercase transition-all border border-white/10 flex items-center justify-center gap-2"> <Copy size={16} /> Copiar </button>
                  <button onClick={() => setSelectedSecret(null)} className="flex-1 bg-slate-800 text-slate-400 py-4 rounded-xl font-black text-[10px] uppercase"> Cerrar </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}