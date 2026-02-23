import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, Trash2, ShieldAlert, Terminal, 
  RefreshCw, Plus, Copy, Zap, ShieldCheck, Mail as MailIcon,
  Clock, Eye, ChevronRight
} from 'lucide-react';
import { SignedIn, UserButton, useAuth } from "@clerk/clerk-react";
import { API_URL } from '../apiConfig';
import toast from 'react-hot-toast';

const AnonMail = () => {
  const { getToken } = useAuth();
  const [aliases, setAliases] = useState([]); 
  const [messages, setMessages] = useState([]);
  const [selectedAlias, setSelectedAlias] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [duration, setDuration] = useState(60); // Minutos por defecto (1h)

  const fetchAliases = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/v1/mail/aliases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAliases(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Error de sincronización");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (aliasId) => {
    setLoadingMessages(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/v1/mail/messages/${aliasId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Error al leer mensajes");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => { fetchAliases(); }, []);

  const generateAlias = async () => {
    setIsCreating(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/v1/mail/generate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ durationMinutes: duration })
      });
      
      if (res.ok) {
        toast.success(`Nodo temporal creado (${duration}m)`);
        fetchAliases();
      }
    } catch (err) {
      toast.error("Error en la red de retransmisión");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center relative z-[100]">
        <Link to="/" className="flex items-center group">
          <span className="text-3xl font-black italic tracking-tighter text-blue-600 uppercase">ZYPHRO</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
           <Link to="/dashboard" className="text-[10px] font-black uppercase text-slate-400 hover:text-white tracking-widest transition-all">Dashboard</Link>
           <SignedIn><UserButton afterSignOutUrl="/" /></SignedIn>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-12 pb-20">
        {/* CABECERA CON SELECTOR DE TIEMPO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-white">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <MailIcon className="text-emerald-500" size={28} />
              </div> 
              Burner Mail
            </h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-4">Identidades volátiles para registros efímeros.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-[2rem] border border-white/5">
            <select 
              value={duration} 
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="bg-transparent border-none text-[10px] font-black uppercase text-blue-400 outline-none px-4 cursor-pointer"
            >
              <option value={30}>30 Minutos</option>
              <option value={60}>1 Hora</option>
              <option value={1440}>24 Horas</option>
            </select>
            <button 
              onClick={generateAlias}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50"
            >
              {isCreating ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />}
              Generar Correo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* PANEL IZQUIERDO: MIS CORREOS TEMPORALES */}
          <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 p-6 shadow-2xl relative">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 block">Nodos de Identidad</span>
            
            <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              {aliases.map(alias => (
                <div 
                  key={alias.id} 
                  onClick={() => { setSelectedAlias(alias); fetchMessages(alias.id); }}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer group ${selectedAlias?.id === alias.id ? 'bg-blue-600/20 border-blue-600/50 shadow-lg' : 'bg-black/40 border-white/5 hover:border-blue-600/30'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="max-w-[70%]">
                      <p className={`text-[10px] font-black uppercase truncate ${selectedAlias?.id === alias.id ? 'text-white' : 'text-blue-500'}`}>{alias.alias_email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={10} className="text-slate-500" />
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Temporal</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className={selectedAlias?.id === alias.id ? 'text-blue-500' : 'text-slate-700'} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PANEL DERECHO: BANDEJA DE ENTRADA (MESSAGES) */}
          <div className="lg:col-span-8 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col shadow-2xl min-h-[500px]">
            {!selectedAlias ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4 opacity-40">
                <Terminal size={40} className="text-slate-700" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Selecciona un nodo para interceptar paquetes</p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Bandeja de Entrada</span>
                    <h3 className="text-xs font-black text-white uppercase truncate max-w-[300px] mt-1">{selectedAlias.alias_email}</h3>
                  </div>
                  <button onClick={() => fetchMessages(selectedAlias.id)} className="p-3 hover:bg-white/5 rounded-xl transition-all text-slate-400">
                    <RefreshCw size={14} className={loadingMessages ? 'animate-spin' : ''} />
                  </button>
                </div>

                <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[550px] custom-scrollbar">
                  {messages.length === 0 ? (
                    <div className="text-center py-20 animate-pulse uppercase text-[10px] font-black text-slate-700 tracking-[0.4em]">Esperando datos entrantes...</div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className="p-6 bg-slate-900/50 border border-white/5 rounded-[1.5rem] hover:bg-slate-900/80 transition-all border-l-2 border-l-blue-600">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">{msg.from_address}</span>
                          <span className="text-[9px] text-slate-600 font-bold uppercase">{new Date(msg.received_at).toLocaleTimeString()}</span>
                        </div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-4">{msg.subject}</h4>
                        <div 
                          className="text-xs text-slate-400 leading-relaxed font-mono whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: msg.body_html }}
                        />
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default AnonMail;