import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, Trash2, Clock, Eye, RotateCcw, ArrowLeft, Lock, ChevronDown, Cloud, Skull, Mail as MailIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SignedIn, UserButton } from "@clerk/clerk-react";
import toast from 'react-hot-toast';
import { cryptoUtils } from '../utils/crypto';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

const CountdownTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expirationDate = new Date(expiresAt).getTime();
      const distance = expirationDate - now;
      if (isNaN(distance) || distance < 0) {
        setTimeLeft("EXPIRADO");
        clearInterval(interval);
      } else {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] bg-rose-500/10 px-6 py-3 rounded-2xl border border-rose-500/20 animate-pulse">
      <Clock size={14} /> Autodestrucción: {timeLeft}
    </div>
  );
};

export default function SecureDrop() {
  const [text, setText] = useState('');
  // Nuevos estados para la "Mejora Adri"
  const [maxViews, setMaxViews] = useState(1);
  const [expirationHours, setExpirationHours] = useState(24);
  const [link, setLink] = useState('');
  const [incomingMsg, setIncomingMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const key = window.location.hash.substring(1);
    if (id && key) fetchAndDecryptMessage(id, key);
  }, []);

  const fetchAndDecryptMessage = async (id, key) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/vortex/get/${id}`); // Ruta actualizada a v1
      if (!res.ok) throw new Error("Mensaje destruido o inexistente.");
      const data = await res.json();
      const decryptedText = await cryptoUtils.decryptData(data.content, key);
      setIncomingMsg({ ...data, content: decryptedText });
    } catch (err) { 
      toast.error(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleCreate = async () => {
    if (!text) return toast.error("Escribe algo");
    setLoading(true);
    try {
      const masterKey = await cryptoUtils.generateKey();
      const encryptedBase64 = await cryptoUtils.encryptData(text, masterKey);
      
      const res = await fetch(`${API_URL}/api/v1/vortex/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: encryptedBase64, 
          maxViews: parseInt(maxViews), 
          expirationHours: parseInt(expirationHours) 
        })
      });
      
      const data = await res.json();
      // Usamos vortexId que es lo que devuelve el nuevo controlador
      setLink(`${window.location.origin}/drop?id=${data.vortexId}#${masterKey}`);
      toast.success("Vórtice generado");
    } catch (err) { 
      toast.error("Error al generar"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center relative z-[100]">
        <Link to="/" className="flex items-center">
          <span className="text-[1.875rem] font-[900] italic tracking-[-0.05em] uppercase text-[#2563eb] pr-[0.4em]">
            ZYPHRO
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-colors">Home</Link>
          <div className="relative" onMouseEnter={() => setIsServicesOpen(true)} onMouseLeave={() => setIsServicesOpen(false)}>
            <button className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-white transition-all cursor-pointer outline-none bg-transparent border-none">
              Servicios <ChevronDown size={12} className={isServicesOpen ? 'rotate-180' : ''} />
            </button>
            {isServicesOpen && (
              <div className="absolute top-full -left-4 pt-4">
                <div className="w-64 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl">
                  <Link to="/drop" className="flex items-center gap-4 p-3 rounded-xl bg-blue-600/10 border border-blue-600/20">
                    <Cloud size={16} className="text-blue-500" />
                    <div><p className="text-[10px] font-black uppercase">Secure Drop</p></div>
                  </Link>
                  <Link to="/mail" className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 mt-1">
                    <MailIcon size={16} className="text-emerald-500" />
                    <div><p className="text-[10px] font-black uppercase tracking-widest">Anon Mail</p></div>
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

      <main className="flex flex-col items-center justify-center pt-10 pb-20 px-6">
        <Link to="/dashboard" className="mb-8 flex items-center gap-2 text-slate-600 hover:text-blue-500 font-black text-[10px] tracking-[0.2em] transition-all uppercase">
          <ArrowLeft size={14} /> Volver al panel
        </Link>

        <div className="w-full max-w-xl bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
              <Lock className="text-blue-600 animate-bounce mb-3" size={32} />
              <span className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase">Procesando...</span>
            </div>
          )}

          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 text-blue-600 font-black italic uppercase tracking-tighter">
            ZYPHRO <span className="text-[10px] not-italic text-slate-500 ml-1 font-bold tracking-widest">SECURE DROP</span>
            <button onClick={() => window.location.href='/drop'} className="p-2 text-slate-500 hover:text-blue-500 bg-transparent border-none cursor-pointer"><RotateCcw size={18} /></button>
          </div>

          <div className="p-10">
            {!incomingMsg ? (
              !link ? (
                <div className="space-y-6">
                  <textarea value={text} onChange={(e) => setText(e.target.value)}
                    className="w-full h-48 bg-black/40 border border-white/10 rounded-3xl p-8 text-sm focus:border-blue-600/50 outline-none resize-none text-blue-50 placeholder:text-slate-700"
                    placeholder="Escribe el secreto..." />
                  
                  {/* SELECTORES NUEVOS PARA ADRI */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Visitas Máximas</label>
                      <select 
                        value={maxViews} 
                        onChange={(e) => setMaxViews(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-2xl p-4 text-[10px] font-black uppercase text-blue-500 outline-none focus:border-blue-600/50"
                      >
                        <option value="1">1 Visita</option>
                        <option value="5">5 Visitas</option>
                        <option value="10">10 Visitas</option>
                        <option value="100">100 Visitas</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Expira en</label>
                      <select 
                        value={expirationHours} 
                        onChange={(e) => setExpirationHours(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-2xl p-4 text-[10px] font-black uppercase text-blue-500 outline-none focus:border-blue-600/50"
                      >
                        <option value="1">1 Hora</option>
                        <option value="24">24 Horas</option>
                        <option value="168">7 Días</option>
                        <option value="720">30 Días</option>
                      </select>
                    </div>
                  </div>

                  <button onClick={handleCreate} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all">Generar Vórtice</button>
                </div>
              ) : (
                <div className="text-center space-y-8 py-4">
                  <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto border border-blue-600/30"><Zap className="text-blue-500" size={32} fill="currentColor" /></div>
                  <div className="bg-black/60 p-6 rounded-3xl border border-white/5">
                    <input readOnly value={link} className="bg-transparent text-blue-400 font-mono text-[10px] w-full text-center outline-none mb-4" />
                    <button onClick={() => {navigator.clipboard.writeText(link); toast.success("Copiado!")}} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase border-none cursor-pointer">Copiar Enlace</button>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col items-center gap-3">
                  <CountdownTimer expiresAt={incomingMsg.expiresAt} />
                  <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
                    Visitas restantes: {incomingMsg.remainingViews}
                  </div>
                </div>
                <div className="bg-black/40 border-l-4 border-blue-600 rounded-2xl p-10 font-mono text-sm text-blue-50 shadow-inner">{incomingMsg.content}</div>
              </div>
            )}
          </div>
        </div>
        <p className="mt-12 text-[9px] text-slate-700 font-black uppercase tracking-[0.4em] italic">XChaCha20 Security Protocol</p>
      </main>
    </div>
  );
}