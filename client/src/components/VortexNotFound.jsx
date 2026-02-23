import React from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VortexNotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icono de Seguridad con pulso */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-rose-500/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative bg-white/5 border border-white/10 p-6 rounded-[2rem]">
            <ShieldAlert size={48} className="text-rose-500 mx-auto" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
            Vórtice No Encontrado
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            Este secreto ha sido desintegrado permanentemente. <br />
            Razones posibles: ya fue leído, expiró por tiempo o nunca existió.
          </p>
        </div>

        <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">
            Estado de Seguridad: Datos Eliminados
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link to="/" className="flex items-center justify-center gap-2 bg-white text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 hover:text-white transition-all">
            <Home size={14} /> Volver al Inicio
          </Link>
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center justify-center gap-2 text-slate-500 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
          >
            <RefreshCw size={14} /> Reintentar Sincronización
          </button>
        </div>
      </div>
    </div>
  );
}