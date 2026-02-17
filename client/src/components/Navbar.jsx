import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Cloud, Mail, Skull, ShieldCheck } from 'lucide-react';
import { useAuth, UserButton, SignedIn, SignedOut } from "@clerk/clerk-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <nav className="relative bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 z-[100]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO UNIFICADO */}
        <Link to="/" className="flex items-center group">
          <span 
            style={{ 
              display: 'inline-block',
              fontSize: '1.5rem', 
              fontWeight: '900', 
              fontStyle: 'italic', 
              letterSpacing: '-0.05em', 
              textTransform: 'uppercase',
              color: '#2563eb', 
              paddingRight: '0.4em', 
              lineHeight: '1.2'
            }}
          >
            ZYPHRO
          </span>
        </Link>

        {/* ENLACES CENTRO (Desktop) */}
        <div className="hidden md:flex items-center gap-10 h-full">
          <Link to="/" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-colors">
            Home
          </Link>

          {/* DESPLEGABLE DE SERVICIOS PREMIUM */}
          <div 
            className="relative h-full flex items-center"
            onMouseEnter={() => setIsServicesOpen(true)}
            onMouseLeave={() => setIsServicesOpen(false)}
          >
            <button className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white flex items-center gap-2 transition-all cursor-pointer outline-none">
              Servicios 
              <ChevronDown size={12} className={`transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isServicesOpen && (
              <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-64 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl">
                  <Link to="/drop" onClick={() => setIsServicesOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group">
                    <div className="bg-blue-600/20 p-2 rounded-lg text-blue-500"><Cloud size={16} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Secure Drop</p>
                      <p className="text-[9px] text-slate-500 font-bold">Vórtice efímero</p>
                    </div>
                  </Link>
                  <Link to="/mail" onClick={() => setIsServicesOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all mt-1">
                    <div className="bg-emerald-600/20 p-2 rounded-lg text-emerald-500"><Mail size={16} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Anon Mail</p>
                      <p className="text-[9px] text-slate-500 font-bold">Correo blindado</p>
                    </div>
                  </Link>
                  <Link to="/switch" onClick={() => setIsServicesOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all mt-1">
                    <div className="bg-rose-600/20 p-2 rounded-lg text-rose-500"><Skull size={16} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Dead Man Switch</p>
                      <p className="text-[9px] text-slate-500 font-bold">Herencia digital</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link to="/contact" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-colors">
            Contact Us
          </Link>
        </div>

        {/* BOTONES DERECHA (Auth Dinámica) */}
        <div className="hidden md:flex items-center gap-6">
          <SignedOut>
            <Link to="/sign-in" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-all">
              Login
            </Link>
            <Link to="/sign-up" className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest active:scale-95">
              Get Started
            </Link>
          </SignedOut>

          <SignedIn>
            <Link to="/dashboard" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-all">
              Dashboard
            </Link>
            <div className="border-l border-white/10 pl-4">
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9 border border-blue-500/50 shadow-lg shadow-blue-500/10"
                  }
                }}
              />
            </div>
          </SignedIn>
        </div>

        {/* MENÚ MÓVIL */}
        <button 
          className="md:hidden p-2 text-slate-400 hover:text-white transition-colors" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Menú Móvil Desplegable Dark */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#020617] border-b border-white/5 shadow-2xl p-6 flex flex-col gap-4 z-[100] animate-in slide-in-from-top-5">
            <Link to="/drop" className="text-slate-400 font-black text-[10px] uppercase tracking-widest p-3 hover:bg-white/5 rounded-xl" onClick={() => setIsOpen(false)}>Secure Drop</Link>
            <Link to="/mail" className="text-slate-400 font-black text-[10px] uppercase tracking-widest p-3 hover:bg-white/5 rounded-xl" onClick={() => setIsOpen(false)}>Anon Mail</Link>
            <Link to="/switch" className="text-slate-400 font-black text-[10px] uppercase tracking-widest p-3 hover:bg-white/5 rounded-xl" onClick={() => setIsOpen(false)}>Dead Man Switch</Link>
            <div className="h-[1px] bg-white/5 my-2" />
            <SignedOut>
                <Link to="/sign-in" className="text-center py-4 font-black text-[10px] uppercase tracking-widest text-slate-400 border border-white/10 rounded-xl" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/sign-up" className="bg-blue-600 text-white text-center py-4 font-black text-[10px] uppercase tracking-widest rounded-xl" onClick={() => setIsOpen(false)}>Get Started</Link>
            </SignedOut>
            <SignedIn>
                <Link to="/dashboard" className="bg-blue-600/10 text-blue-500 text-center py-4 font-black text-[10px] uppercase tracking-widest rounded-xl border border-blue-600/20" onClick={() => setIsOpen(false)}>Ir al Panel</Link>
            </SignedIn>
        </div>
      )}
    </nav>
  );
};

export default Navbar;