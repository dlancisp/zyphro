import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Globe, Shield, Lock, ChevronDown, Cloud, Mail as MailIcon, Skull, Terminal, CheckCircle2 } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import toast from 'react-hot-toast';

const Contact = () => {
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    
    // Simulamos un proceso de cifrado y envío técnico
    setTimeout(() => {
      setIsSending(false);
      setSent(true);
      toast.success("Informe transmitido con éxito");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* --- NAVBAR PREMIUM UNIFICADO --- */}
      <nav className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center relative z-[100]">
        <Link to="/" className="flex items-center">
          <span style={{ fontSize: '1.875rem', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-0.05em', textTransform: 'uppercase', color: '#2563eb', display: 'inline-block', paddingRight: '0.4em' }}>
            ZYPHRO
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-colors">Home</Link>
          <div className="relative" onMouseEnter={() => setIsServicesOpen(true)} onMouseLeave={() => setIsServicesOpen(false)}>
            <button className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-all cursor-pointer outline-none">
              Servicios <ChevronDown size={12} className={isServicesOpen ? 'rotate-180' : ''} />
            </button>
            {isServicesOpen && (
              <div className="absolute top-full -left-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-64 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl">
                  <Link to="/drop" className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group">
                    <div className="bg-blue-600/20 p-2 rounded-lg text-blue-500"><Cloud size={16} /></div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Secure Drop</p>
                  </Link>
                  <Link to="/mail" className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 mt-1">
                    <MailIcon size={16} className="text-emerald-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Anon Mail</p>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <Link to="/contact" className="text-[10px] font-black tracking-widest uppercase text-white transition-colors">Contact Us</Link>
        </div>

        <div className="flex items-center gap-6">
           <Link to="/dashboard" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-all">Dashboard</Link>
           <SignedIn><UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-9 h-9 border border-blue-500/50" } }} /></SignedIn>
        </div>
      </nav>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="max-w-4xl mx-auto px-6 pt-16 pb-24 relative z-10 text-center">
        
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-8 uppercase tracking-[0.3em] text-[10px] font-black text-blue-500 italic">
          Relay Channel: Alpha-Secure
        </div>

        <h1 className="text-6xl md:text-7xl font-black tracking-tighter italic uppercase mb-4">Establecer <span className="text-blue-600">Contacto.</span></h1>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-16">Transmisión de datos bajo túnel de cifrado simétrico.</p>

        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-1 shadow-2xl">
          <div className="bg-black/40 rounded-[2.8rem] p-8 md:p-12 relative overflow-hidden text-left">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-transparent opacity-30"></div>
            
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Identificador (Nombre)</label>
                    <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-blue-600 outline-none font-bold transition-all" placeholder="Agente 01" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Canal de Retorno (Email)</label>
                    <input required type="email" className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-blue-600 outline-none font-bold transition-all" placeholder="user@vortex.com" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Mensaje Clasificado</label>
                  <textarea required className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-blue-50 h-40 focus:border-blue-600 outline-none font-mono text-sm resize-none transition-all shadow-inner" placeholder="Escriba su consulta o informe técnico..." />
                </div>

                <button 
                  disabled={isSending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} /> Cifrando Paquete...
                    </>
                  ) : (
                    <>
                      <Send size={18} /> Iniciar Transmisión
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-12 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                  <CheckCircle2 className="text-emerald-500" size={48} />
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">Transmisión Exitosa</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs mx-auto mb-8 italic">
                  Su mensaje ha sido fragmentado, cifrado y enviado a través de nuestro túnel seguro. Recibirá respuesta en su nodo pronto.
                </p>
                <button onClick={() => setSent(false)} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">
                  Enviar nuevo informe
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-slate-900/30 rounded-3xl border border-white/5">
            <Terminal size={20} className="text-blue-600 mb-4" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-2 italic">PGP Encrypted</h4>
            <p className="text-slate-600 text-[10px] font-bold leading-relaxed uppercase">Soporte total para llaves públicas externas.</p>
          </div>
          <div className="p-6 bg-slate-900/30 rounded-3xl border border-white/5">
            <Shield size={20} className="text-blue-600 mb-4" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-2 italic">No Logs Policy</h4>
            <p className="text-slate-600 text-[10px] font-bold leading-relaxed uppercase">Los metadatos de contacto se purgan cada 24h.</p>
          </div>
          <div className="p-6 bg-slate-900/30 rounded-3xl border border-white/5">
            <Globe size={20} className="text-blue-600 mb-4" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-2 italic">EU Servers</h4>
            <p className="text-slate-600 text-[10px] font-bold leading-relaxed uppercase">Jurisdicción de privacidad europea estricta.</p>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex justify-between items-center opacity-30">
          <span className="text-[9px] font-black text-slate-700 tracking-[0.5em] uppercase italic">Zyphro secure communications</span>
          <Lock size={16} className="text-slate-700" />
      </footer>
    </div>
  );
};

export default Contact;