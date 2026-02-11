import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAuth, UserButton } from "@clerk/clerk-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-container">
        
        {/* LOGO (Solo Texto) */}
        <Link to="/" className="nav-brand">
          <span>ZYPHRO</span>
        </Link>

        {/* ENLACES CENTRO (Desktop) */}
        <div className="nav-links-center">
          <Link to="/drop" className="nav-link">Secure Drop</Link>
          <Link to="/mail" className="nav-link">Anon Mail</Link>
          
          <div className="dropdown-wrapper group">
            <button className="nav-link group flex items-center gap-1">
              Dead Man Switch <ChevronDown size={16} className="group-hover:rotate-180 transition-transform" />
            </button>
            <div className="dropdown-content hidden group-hover:flex flex-col absolute top-full left-0 bg-white border border-slate-200 rounded-lg shadow-lg p-2 min-w-[200px]">
              <Link to="/switch" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md">Gestionar Switches</Link>
              <Link to="/switch/create" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md">Crear Nuevo</Link>
            </div>
          </div>
        </div>

        {/* BOTONES DERECHA (Auth) */}
        <div className="nav-auth-buttons flex items-center gap-4">
          {!isSignedIn ? (
            <>
              <Link to="/sign-in" className="btn-login">Entrar</Link>
              <Link to="/sign-up" className="btn-register-small">
                Empezar Gratis
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
                Panel
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
        </div>

        {/* MENÚ MÓVIL (Hamburguesa) */}
        <button className="mobile-menu-btn md:hidden text-slate-700" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Menú Móvil Desplegable (Básico) */}
      {isOpen && (
        <div className="md:hidden absolute top-[var(--nav-height)] left-0 w-full bg-white border-b border-slate-200 shadow-lg p-4 flex flex-col gap-4">
            <Link to="/drop" className="text-slate-700 font-medium py-2" onClick={() => setIsOpen(false)}>Secure Drop</Link>
            <Link to="/mail" className="text-slate-700 font-medium py-2" onClick={() => setIsOpen(false)}>Anon Mail</Link>
            <Link to="/switch" className="text-slate-700 font-medium py-2" onClick={() => setIsOpen(false)}>Dead Man Switch</Link>
            {!isSignedIn ? (
                <div className="flex flex-col gap-2 mt-2">
                    <Link to="/sign-in" className="btn-login text-center py-2 border border-slate-200 rounded-md" onClick={() => setIsOpen(false)}>Entrar</Link>
                    <Link to="/sign-up" className="btn-register-small text-center py-2" onClick={() => setIsOpen(false)}>Empezar Gratis</Link>
                </div>
            ) : (
                 <Link to="/dashboard" className="text-blue-600 font-medium py-2" onClick={() => setIsOpen(false)}>Ir al Panel</Link>
            )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;