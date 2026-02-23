import React, { useState, useEffect } from 'react';
import { Shield, Clock, Mail, Save, MessageSquare, Zap, Activity } from 'lucide-react';
import { useAuth } from "@clerk/clerk-react";
import toast from 'react-hot-toast';
import { API_URL } from '../apiConfig'; // Usamos tu config centralizada

const DmsConfig = ({ isSummary = false }) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    switchEnabled: false,
    recipientEmail: '',
    checkInInterval: 30,
    dmsNote: '',
    dmsStatus: 'IDLE'
  });

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/switch/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data) setConfig(data);
    } catch (err) {
      console.error("Error al cargar DMS:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/switch/update`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          switchEnabled: config.switchEnabled,
          recipientEmail: config.recipientEmail,
          checkInInterval: parseInt(config.checkInInterval),
          dmsNote: config.dmsNote
        })
      });

      if (res.ok) toast.success("Protocolo actualizado", { icon: '🔐' });
      else toast.error("Error al guardar");
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-slate-600 animate-pulse font-mono text-[10px] uppercase tracking-widest">Sincronizando Protocolo DMS...</div>;

  // --- MODO RESUMEN (Para el Dashboard General) ---
  if (isSummary) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield size={18} className={config.switchEnabled ? "text-emerald-500" : "text-slate-600"} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Dead Man Switch</h3>
          </div>
          <div className={`px-2 py-1 rounded-md text-[8px] font-black ${config.switchEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
            {config.switchEnabled ? 'ARMADO' : 'DESACTIVADO'}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500">
            <span>Intervalo:</span>
            <span className="text-blue-400">{config.checkInInterval} días</span>
          </div>
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500">
            <span>Heredero:</span>
            <span className="text-slate-300 truncate max-w-[120px]">{config.recipientEmail || 'No asignado'}</span>
          </div>
        </div>
      </div>
    );
  }

  // --- MODO CONFIGURACIÓN COMPLETA (Pestaña DMS) ---
  return (
    <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in duration-500">
      <div className="bg-blue-600 p-8 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md text-white shadow-inner">
            <Shield size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Dead Man Switch</h3>
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Protocolo de liberación final</p>
          </div>
        </div>
        <div className="hidden md:block">
           <Activity className={config.switchEnabled ? "text-emerald-300 animate-pulse" : "text-blue-300 opacity-30"} size={40} />
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Interruptor de Estado */}
        <div className="flex items-center justify-between p-6 bg-black/40 rounded-3xl border border-white/5 group hover:border-blue-500/20 transition-all">
          <div>
            <span className="text-white font-black italic uppercase text-xs tracking-widest block mb-1">Estado del Sistema</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {config.switchEnabled ? "Vigilancia de signos vitales activa" : "Sistema en modo espera"}
            </span>
          </div>
          <button 
            onClick={() => setConfig({...config, switchEnabled: !config.switchEnabled})}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all ${config.switchEnabled ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-800'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${config.switchEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-2">
              <Clock size={12} className="text-blue-500" /> Intervalo de Check-in (Días)
            </label>
            <input 
              type="number" 
              value={config.checkInInterval}
              onChange={(e) => setConfig({...config, checkInInterval: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white font-mono text-sm outline-none focus:border-blue-600 transition-all shadow-inner"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-2">
              <Mail size={12} className="text-blue-500" /> Endpoint del Heredero (Email)
            </label>
            <input 
              type="email" 
              placeholder="destino@seguro.com"
              value={config.recipientEmail || ''}
              onChange={(e) => setConfig({...config, recipientEmail: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white font-mono text-sm outline-none focus:border-blue-600 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-2">
            <MessageSquare size={12} className="text-blue-500" /> Payload de Última Voluntad
          </label>
          <textarea 
            rows="5"
            placeholder="Introduce los activos digitales o mensajes a liberar..."
            value={config.dmsNote || ''}
            onChange={(e) => setConfig({...config, dmsNote: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] px-5 py-4 text-blue-50 font-mono text-sm outline-none focus:border-blue-600 transition-all resize-none shadow-inner"
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-black/20 text-[11px] uppercase tracking-[0.2em] group"
        >
          <Save size={18} className="group-hover:rotate-12 transition-transform" />
          {saving ? "Encriptando Configuración..." : "Sincronizar Protocolo DMS"}
        </button>
      </div>
    </div>
  );
};

export default DmsConfig;