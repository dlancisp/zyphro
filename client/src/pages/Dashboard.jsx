import { useUser, SignOutButton, useAuth } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';
import { 
  LogOut, HeartPulse, Zap, Key, ShieldCheck, 
  ArrowUpRight, User, LayoutGrid, Activity, Mail 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { API_URL } from '../apiConfig';
import ApiKeyManager from '../components/ApiKeyManager';
import DmsConfig from '../components/DmsConfig';
import VortexManager from '../components/VortexManager';
import toast from 'react-hot-toast';

function Dashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [mailStats, setMailStats] = useState({ active: 0, messages: 0 });

  // 1. CARGAR ESTADÍSTICAS RÁPIDAS DE ANON MAIL
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_URL}/api/v1/mail/aliases`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setMailStats({ active: data.length, messages: 0 }); // Aquí podrías sumar mensajes si quieres
        }
      } catch (err) { console.error("Error en stats"); }
    };
    fetchStats();
  }, [getToken]);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans pb-20 selection:bg-blue-500/30">
      
      {/* NAVBAR DARK */}
      <nav className="bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center group">
            <span style={{ fontSize: '1.5rem', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-0.05em', textTransform: 'uppercase', color: '#2563eb', paddingRight: '0.4em' }}>
              ZYPHRO
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/mail" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-blue-500 transition-all">Anon Mail</Link>
            <Link to="/switch" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-blue-500 transition-all">Protocolo DMS</Link>
            <SignOutButton>
              <button className="flex items-center gap-2 bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 text-slate-400 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all border border-white/10 uppercase">
                <LogOut size={14} /> SALIR
              </button>
            </SignOutButton>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        
        {/* HEADER PERFIL: CENTRO DE OPERACIONES */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 bg-slate-900/20 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center gap-6 relative z-10">
            <div className="relative">
              <div className="absolute -inset-1 bg-blue-600 rounded-[2.2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <img src={user?.imageUrl} alt="Profile" className="relative w-24 h-24 rounded-[2rem] border-2 border-white/10 object-cover shadow-2xl" />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full border-4 border-[#020617]"></div>
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2">Estado de Agente: Activo</p>
              <h2 className="text-5xl font-black tracking-tight leading-none text-white italic uppercase">
                {user?.firstName || "Usuario"}
              </h2>
            </div>
          </div>

          <button className="group relative z-10 flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95">
            <HeartPulse className="group-hover:animate-ping" size={18} />
            Check-In de Seguridad
          </button>
          
          <Activity className="absolute right-[-20px] top-[-20px] text-white/5 w-64 h-64 -rotate-12 pointer-events-none" />
        </div>

        {/* RESUMEN DE ACTIVOS (Vórtices y Anon Mail) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Gestión de Vórtices */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Activos Efímeros</h4>
                </div>
                <VortexManager isSummary={true} /> 
            </div>

            {/* Widget Rápido Anon Mail */}
            <Link to="/mail" className="group block h-full">
                <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] h-full hover:border-blue-500/30 transition-all relative overflow-hidden shadow-2xl">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-600/20 text-blue-500">
                            <Mail size={24} />
                        </div>
                        <span className="text-emerald-500 text-[8px] font-black px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">ACTIVE_RELAY</span>
                    </div>
                    <h3 className="text-3xl font-black italic uppercase text-white mb-2">Anon Mail</h3>
                    <div className="flex gap-6 mt-4">
                        <div>
                            <p className="text-2xl font-black italic text-white">{mailStats.active}</p>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nodos Activos</p>
                        </div>
                        <div>
                            <p className="text-2xl font-black italic text-blue-500">0</p>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Interceptados</p>
                        </div>
                    </div>
                    <Zap className="absolute right-[-10px] bottom-[-10px] text-white/5 w-32 h-32" />
                </div>
            </Link>
        </div>

        {/* GRID INFERIOR: DMS Y API */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* DMS RESUMEN */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-500" />
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Protocolo Dead Man Switch</h4>
              </div>
              <Link to="/switch" className="text-[9px] font-black text-blue-500 hover:text-white transition-colors uppercase tracking-widest">Configurar Protocolo →</Link>
            </div>
            <DmsConfig isSummary={true} />
          </div>

          {/* API Y ACCESO RÁPIDO */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-2 px-4">
                <Key size={16} className="text-blue-500" />
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Infraestructura de Desarrollador</h4>
              </div>
              <div className="bg-slate-950/40 backdrop-blur-2xl p-2 rounded-[2.5rem] border border-white/5">
                  <ApiKeyManager />
              </div>
            </div>
            
            <Link to="/drop" className="block group">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 transition-all group-hover:scale-[1.01] active:scale-95 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-white text-3xl font-black italic mb-2 uppercase tracking-tighter flex items-center gap-3">
                    Inyectar Nuevo Vórtice <ArrowUpRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-blue-100 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Crear nodo de transferencia segura</p>
                </div>
                <Zap className="absolute right-[-20px] bottom-[-20px] text-white/10 w-48 h-48 rotate-12" />
              </div>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;