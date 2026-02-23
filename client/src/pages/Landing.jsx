import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Zap, ChevronRight, Terminal, Mail, 
  Skull, ShieldCheck, Globe, Lock, Fingerprint
} from 'lucide-react';
import { SignedOut, SignedIn, UserButton } from "@clerk/clerk-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* --- GLOW EFFECTS DE FONDO --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full"></div>
      </div>

      {/* --- NAV MODIFICADA --- */}
      <nav className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-black italic tracking-tighter text-blue-600 uppercase">ZYPHRO</span>
        </div>
        
        <div className="flex items-center gap-4">
          <SignedOut>
            <Link to="/sign-in" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-colors px-4">
              Log In
            </Link>
            <Link to="/sign-up" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
              Registrarse
            </Link>
          </SignedOut>
          <SignedIn>
            <Link to="/dashboard" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white px-4">
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>

      {/* --- HERO SECTION MODIFICADA --- */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 mb-8">
          <Fingerprint size={14} className="text-blue-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">Protocolos de Privacidad de Grado Militar</span>
        </div>
        
        <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.85] mb-8">
          Tu rastro <br /> 
          <span className="text-blue-600">termina aquí.</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-slate-400 text-sm md:text-base font-medium leading-relaxed mb-12 uppercase tracking-wide">
          Bóvedas de datos cifradas con XChaCha20, correos efímeros y sistemas de herencia digital. 
          Toma el control total de tu legado y privacidad online.
        </p>

        {/* BOTÓN DE ACCIÓN ÚNICO Y CLARO */}
        <div className="flex justify-center">
          <Link to="/sign-up" className="group bg-white text-black px-12 py-6 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all hover:bg-blue-600 hover:text-white shadow-2xl flex items-center gap-3 active:scale-95">
            Empezar Ahora <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </header>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] shadow-2xl">
            <Mail size={24} className="text-blue-500 mb-6" />
            <h3 className="text-2xl font-black italic uppercase tracking-tight mb-4 text-white">Anon Mail</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-loose">
              Identidades volátiles. Crea bandejas de entrada temporales que se auto-destruyen tras su uso.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] shadow-2xl">
            <Skull size={24} className="text-emerald-500 mb-6" />
            <h3 className="text-2xl font-black italic uppercase tracking-tight mb-4 text-white">D.M.S.</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-loose">
              Protocolo de hombre muerto. Transfiere tus activos digitales de forma segura si dejas de estar activo.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] shadow-2xl">
            <Lock size={24} className="text-blue-500 mb-6" />
            <h3 className="text-2xl font-black italic uppercase tracking-tight mb-4 text-white">XChaCha20</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-loose">
              Cifrado de flujo de alta seguridad. Tus datos son inaccesibles para cualquier entidad externa.
            </p>
          </div>

        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 py-20 text-center border-t border-white/5">
        <p className="text-[9px] font-black text-slate-600 tracking-[0.5em] uppercase italic">
          Zyphro Private Network — No Logs. No Tracking.
        </p>
      </footer>
    </div>
  );
}