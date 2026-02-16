import React, { useState, useEffect } from 'react';
import { Shield, Clock, Mail, Save, AlertTriangle } from 'lucide-react';
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
    dmsStatus: 'IDLE'
  });

  // Cargar configuración inicial
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3000/api/switch/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setConfig(data);
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
        body: JSON.stringify(config)
      });
      if (res.ok) toast.success("Configuración de seguridad guardada");
      else toast.error("Error al guardar");
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-zinc-500 animate-pulse">Cargando protocolos de seguridad...</div>;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
          <Shield className="text-emerald-500" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Interruptor de Hombre Muerto</h3>
          <p className="text-zinc-400 text-sm">Si dejas de dar señales de vida, liberaremos tus secretos.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Estado del Interruptor */}
        <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg border border-zinc-800">
          <div className="flex flex-col">
            <span className="text-white font-medium">Estado del Sistema</span>
            <span className="text-xs text-zinc-500">Activa o desactiva la vigilancia global.</span>
          </div>
          <button 
            onClick={() => setConfig({...config, switchEnabled: !config.switchEnabled})}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.switchEnabled ? 'bg-emerald-600' : 'bg-zinc-700'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.switchEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Configuración de Tiempo y Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400 flex items-center gap-2">
              <Clock size={14} /> Intervalo de Check-in (Días)
            </label>
            <input 
              type="number" 
              value={config.checkInInterval}
              onChange={(e) => setConfig({...config, checkInInterval: parseInt(e.target.value)})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-400 flex items-center gap-2">
              <Mail size={14} /> Email del Heredero
            </label>
            <input 
              type="email" 
              placeholder="ejemplo@correo.com"
              value={config.recipientEmail || ''}
              onChange={(e) => setConfig({...config, recipientEmail: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Advertencia de Estado */}
        {config.dmsStatus === 'TRIGGERED' && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex gap-3 items-start">
            <AlertTriangle className="text-red-500 shrink-0" size={20} />
            <p className="text-sm text-red-200">
              <span className="font-bold">SISTEMA DISPARADO:</span> El tiempo ha expirado y los secretos han sido liberados o están en proceso de envío.
            </p>
          </div>
        )}

        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-white text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
        >
          <Save size={18} />
          {saving ? "Guardando..." : "Guardar Configuración de Seguridad"}
        </button>
      </div>
    </div>
  );
};

export default DmsConfig;