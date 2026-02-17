import { useUser, SignOutButton } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';
import { LogOut, HeartPulse, Zap, Key, ShieldCheck, ArrowUpRight, User } from 'lucide-react';
import ApiKeyManager from '../components/ApiKeyManager';
import DmsConfig from '../components/DmsConfig';
import toast from 'react-hot-toast';

function Dashboard() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans pb-20 selection:bg-blue-500/30">
      
      {/* NAVBAR DARK */}
      <nav className="bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <span style={{ fontSize: '1.5rem', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-0.05em', textTransform: 'uppercase', color: '#2563eb', paddingRight: '0.4em' }}>
              ZYPHRO
            </span>
          </Link>

          <SignOutButton>
            <button className="flex items-center gap-2 bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 text-slate-400 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all border border-white/10 uppercase">
              <LogOut size={14} /> SALIR
            </button>
          </SignOutButton>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        
        {/* HEADER PERFIL DARK */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 bg-slate-900/30 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-blue-600 rounded-[2.2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <img src={user?.imageUrl} alt="Profile" className="relative w-24 h-24 rounded-[2rem] border-2 border-white/10 object-cover shadow-2xl" />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full border-4 border-[#020617]"></div>
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2">Bóveda de Seguridad</p>
              <h2 className="text-5xl font-black tracking-tight leading-none text-white">
                {user?.firstName || "Agente"}
              </h2>
            </div>
          </div>

          <button className="group relative flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95">
            <HeartPulse className="group-hover:animate-ping" size={18} />
            Check-In de Vida
          </button>
        </div>

        {/* GRID DE HERRAMIENTAS DARK */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-4">
              <ShieldCheck size={16} className="text-blue-500" />
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Protocolos de Herencia</h4>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-white/5 shadow-2xl">
                <DmsConfig />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 px-4">
              <Key size={16} className="text-blue-500" />
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Infraestructura API</h4>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-white/5 shadow-2xl">
                <ApiKeyManager />
            </div>
            
            <Link to="/drop" className="block group">
              <div className="bg-blue-600 p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 transition-all group-hover:bg-blue-700 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-white text-3xl font-black italic mb-2 uppercase tracking-tighter flex items-center gap-3">
                    Secure Drop <ArrowUpRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-60">Lanzar secreto efímero</p>
                </div>
                <Zap className="absolute right-[-20px] bottom-[-20px] text-white/5 w-48 h-48 rotate-12" />
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
export default Dashboard;