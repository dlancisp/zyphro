import React, { useState, useEffect } from 'react';
import { Shield, Clock, Mail, Save, AlertTriangle, MessageSquare } from 'lucide-react';
import { useAuth } from "@clerk/clerk-react";
import toast from 'react-hot-toast';

const DmsConfig = () => {
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
      const res = await fetch(`http://localhost:3000/api/switch/config`, {
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
      const res = await fetch(`http://localhost:3000/api/switch/update`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          switchEnabled: config.switchEnabled,
          recipientEmail: config.recipientEmail,
          checkInInterval: parseInt(config.checkInInterval),
          dmsNote: config.dmsNote // <--- ESTO ES LO QUE ESTABA FALLANDO
        })
      });

      if (res.ok) toast.success("Protocolo actualizado y mensaje asegurado");
      else toast.error("Error al guardar");
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-slate-400 animate-pulse font-medium">Sincronizando bóveda...</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-6">
      <div className="bg-blue-600 p-6 flex items-center gap-4">
        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm text-white">
          <Shield size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Dead Man Switch</h3>
          <p className="text-blue-100 text-sm">Protocolo de liberación de activos.</p>
        </div>
      </div>

      <div className="p-6 space-y-6 text-slate-900 font-sans">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <span className="text-slate-900 font-bold block italic uppercase text-[10px] tracking-widest">Estado</span>
            <span className="text-xs text-slate-500 font-medium">Vigilancia activa</span>
          </div>
          <button 
            onClick={() => setConfig({...config, switchEnabled: !config.switchEnabled})}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${config.switchEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.switchEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Clock size={12} /> Intervalo (Días)
            </label>
            <input 
              type="number" 
              value={config.checkInInterval}
              onChange={(e) => setConfig({...config, checkInInterval: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none focus:border-blue-600 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Mail size={12} /> Email del Heredero
            </label>
            <input 
              type="email" 
              placeholder="heredero@zyphro.com"
              value={config.recipientEmail || ''}
              onChange={(e) => setConfig({...config, recipientEmail: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <MessageSquare size={12} /> Nota de Última Voluntad
          </label>
          <textarea 
            rows="4"
            placeholder="Introduce aquí las claves o el mensaje secreto..."
            value={config.dmsNote || ''}
            onChange={(e) => setConfig({...config, dmsNote: e.target.value})}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium outline-none focus:border-blue-600 transition-all resize-none shadow-inner"
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 text-[10px] uppercase tracking-widest"
        >
          <Save size={16} />
          {saving ? "Asegurando..." : "Actualizar Protocolo de Seguridad"}
        </button>
      </div>
    </div>
  );
};

export default DmsConfig;