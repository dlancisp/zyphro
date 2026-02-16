import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAuth, UserButton } from "@clerk/clerk-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <nav className="navbar relative bg-white border-b border-slate-100 z-[100]">
      <div className="nav-container max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* LOGO (Solo Texto) */}
        <Link to="/" className="nav-brand group">
          <span className="text-2xl font-black italic tracking-tighter text-blue-600 transition-colors">
            ZYPHRO
          </span>
        </Link>

        {/* ENLACES CENTRO (Desktop) */}
        <div className="hidden md:flex items-center gap-8 h-full">
          <Link to="/drop" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
            Secure Drop
          </Link>
          <Link to="/mail" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
            Anon Mail
          </Link>
          
          {/* DESPLEGABLE CORREGIDO */}
          <div className="relative group h-full flex items-center">
            <button className="text-sm font-bold text-slate-600 group-hover:text-blue-600 flex items-center gap-1 transition-colors py-4">
              Dead Man Switch 
              <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
            </button>
            
            {/* El Menú Flotante Pequeño */}
            <div className="absolute top-full left-0 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-2 flex-col hidden group-hover:flex animate-in fade-in slide-in-from-top-2 duration-200">
              <Link 
                to="/switch" 
                className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Gestionar Switches
              </Link>
              <div className="h-[1px] bg-slate-50 mx-2" />
              <Link 
                to="/switch/create" 
                className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Crear Nuevo
              </Link>
            </div>
          </div>
        </div>

        {/* BOTONES DERECHA (Auth) */}
        <div className="hidden md:flex items-center gap-4">
          {!isSignedIn ? (
            <>
              <Link to="/sign-in" className="text-sm font-bold text-slate-600 hover:text-blue-600 px-3 py-2 transition-colors">
                Log in
              </Link>
              <Link to="/sign-up" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all shadow-md shadow-blue-200 active:scale-95">
                Regístrate
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                Panel de Control
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
        </div>

        {/* MENÚ MÓVIL (Hamburguesa) */}
        <button 
          className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Menú Móvil Desplegable */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl p-4 flex flex-col gap-2 z-[100] animate-in slide-in-from-top-5">
            <Link to="/drop" className="text-slate-700 font-bold p-3 hover:bg-slate-50 rounded-lg" onClick={() => setIsOpen(false)}>Secure Drop</Link>
            <Link to="/mail" className="text-slate-700 font-bold p-3 hover:bg-slate-50 rounded-lg" onClick={() => setIsOpen(false)}>Anon Mail</Link>
            <Link to="/switch" className="text-slate-700 font-bold p-3 hover:bg-slate-50 rounded-lg" onClick={() => setIsOpen(false)}>Dead Man Switch</Link>
            {!isSignedIn ? (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                    <Link to="/sign-in" className="text-center py-3 font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50" onClick={() => setIsOpen(false)}>Log in</Link>
                    <Link to="/sign-up" className="bg-blue-600 text-white text-center py-3 font-bold rounded-lg" onClick={() => setIsOpen(false)}>Regístrate</Link>
                </div>
            ) : (
                <Link to="/dashboard" className="bg-blue-50 text-blue-600 text-center py-3 font-bold rounded-lg mt-4" onClick={() => setIsOpen(false)}>Ir al Panel</Link>
            )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;