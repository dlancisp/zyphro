import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Shield, ArrowLeft, Trash2, ShieldAlert, Eye, Terminal, Clock, RefreshCw, ChevronDown, Cloud, Skull, Mail as MailIcon } from 'lucide-react';
import { SignedIn, UserButton } from "@clerk/clerk-react";

const AnonMail = () => {
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [emails] = useState([
    { id: 1, from: "noreply@bank.com", subject: "Verification Code", time: "2m ago", body: "Your code is 8829..." },
    { id: 2, from: "support@service.io", subject: "Welcome aboard", time: "15m ago", body: "Thanks for joining us..." }
  ]);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* --- NAVBAR PREMIUM UNIFICADO --- */}
      <nav className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center relative z-[100]">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <span style={{ 
            fontSize: '1.875rem', fontWeight: '900', fontStyle: 'italic', 
            letterSpacing: '-0.05em', textTransform: 'uppercase', color: '#2563eb',
            display: 'inline-block', paddingRight: '0.4em'
          }}>
            ZYPHRO
          </span>
        </Link>

        {/* Links Centrales */}
        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-colors">Home</Link>
          
          <div 
            className="relative"
            onMouseEnter={() => setIsServicesOpen(true)}
            onMouseLeave={() => setIsServicesOpen(false)}
          >
            <button className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-white transition-all cursor-pointer outline-none">
              Servicios <ChevronDown size={12} className={`transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} />
            </button>

            {isServicesOpen && (
              <div className="absolute top-full -left-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-64 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl">
                  <Link to="/drop" className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group">
                    <div className="bg-blue-600/20 p-2 rounded-lg text-blue-500"><Cloud size={16} /></div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Secure Drop</p>
                  </Link>
                  <Link to="/mail" className="flex items-center gap-4 p-3 rounded-xl bg-blue-600/10 border border-blue-600/20 mt-1">
                    <MailIcon size={16} className="text-emerald-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Anon Mail</p>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <Link to="/contact" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-colors">Contact Us</Link>
        </div>

        {/* Perfil */}
        <div className="flex items-center gap-6">
           <Link to="/dashboard" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-all">Dashboard</Link>
           <SignedIn>
             <UserButton 
                afterSignOutUrl="/" 
                appearance={{ elements: { userButtonAvatarBox: "w-9 h-9 border border-blue-500/50 shadow-lg shadow-blue-500/10" } }}
             />
           </SignedIn>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-12 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-600/30">
                <Mail className="text-blue-600" size={28} />
              </div> 
              Anon Mail 
              <span className="text-[10px] not-italic bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20 tracking-widest">ENCRYPTED_NODE</span>
            </h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-4">Identidad protegida bajo protocolo de retransmisión Zero-Knowledge.</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
            <RefreshCw size={16} /> Refrescar Nodo
          </button>
        </div>

        {/* INTERFAZ DE CORREO ESTILO TERMINAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[650px]">
          
          {/* LISTA DE MENSAJES */}
          <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Inbound Packets</span>
              <ShieldAlert size={14} className="text-blue-500 animate-pulse" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {emails.map(email => (
                <div key={email.id} className="p-6 rounded-3xl bg-black/20 border border-white/5 hover:border-blue-600/40 transition-all cursor-pointer group relative overflow-hidden">
                  <div className="absolute left-0 top-0 h-full w-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{email.from}</span>
                    <span className="text-[9px] text-slate-600 font-bold uppercase">{email.time}</span>
                  </div>
                  <h4 className="text-xs font-black text-white truncate uppercase tracking-tight">{email.subject}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* VISOR DE MENSAJES */}
          <div className="lg:col-span-8 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 flex flex-col relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-transparent opacity-30"></div>
            
            <div className="p-10 flex-1 font-mono text-sm leading-relaxed text-blue-100/70">
              <div className="flex items-center gap-3 mb-10 text-blue-500 opacity-40">
                <Terminal size={18} /> <span className="text-[10px] font-black tracking-widest">DECRYPTED_PAYLOAD_VIEW</span>
              </div>
              
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Origen:</span>
                  <span className="text-emerald-500 font-bold">noreply@bank.com</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Asunto:</span>
                  <span className="text-white font-black text-lg uppercase tracking-tight">Verification Code</span>
                </div>
                <div className="h-[1px] bg-white/5 w-full"></div>
                <div className="py-6 text-slate-300 space-y-6 leading-relaxed">
                  <p>Estimado agente,</p>
                  <p>Tu código de verificación para el acceso a la infraestructura ha sido generado con éxito:</p>
                  <div className="inline-block bg-blue-600/10 border border-blue-600/30 px-6 py-3 rounded-2xl">
                    <span className="text-blue-500 font-black text-xl tracking-[0.3em]">8829-10</span>
                  </div>
                  <p className="text-rose-500/60 italic text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 pt-10">
                    <Clock size={12} /> Este paquete se purgará automáticamente en 45 segundos.
                  </p>
                </div>
              </div>
            </div>

            {/* ACCIONES */}
            <div className="p-8 bg-black/40 border-t border-white/5 flex justify-end gap-6 items-center">
              <button className="flex items-center gap-2 text-slate-600 hover:text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                <Trash2 size={16} /> Purgar
              </button>
              <button className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                Archivar en Bóveda
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AnonMail;