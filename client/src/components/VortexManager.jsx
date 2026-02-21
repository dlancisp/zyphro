import React, { useState, useEffect } from 'react';
import { Copy, Clock, Trash2, Shield, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from "@clerk/clerk-react";

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

export default function VortexManager() {
  const [vortices, setVortices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const fetchVortices = async () => {
    try {
      const token = await getToken();
      // Usamos el timestamp para evitar el error 304 de caché
      const res = await fetch(`${API_URL}/api/v1/vortex/user?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setVortices(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Error de sincronización");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVortices(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("¿Deseas destruir este secreto permanentemente de la red?")) return;
    
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/v1/vortex/delete/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setVortices(vortices.filter(v => v.id !== id));
        toast.success("Vórtice desintegrado");
      } else {
        toast.error("No se pudo eliminar el secreto");
      }
    } catch (err) {
      toast.error("Error de conexión con el núcleo");
    }
  };

  const handleCopyLink = (id) => {
  // Construimos la URL base
  const baseUrl = window.location.origin;
  const fullUrl = `${baseUrl}/drop?id=${id}`;
  
  // Intentamos buscar si la llave está en el almacenamiento local (opcional)
  const savedKey = localStorage.getItem(`vortex_key_${id}`);
  const finalUrl = savedKey ? `${fullUrl}#${savedKey}` : fullUrl;

  navigator.clipboard.writeText(finalUrl).then(() => {
    if (savedKey) {
      toast.success("¡Enlace completo copiado con éxito!", { icon: '🔐' });
    } else {
      toast.success("ID copiado. Pega la Master Key al final del enlace.", {
        duration: 5000,
        icon: '🔗'
      });
    }
  });
};

  if (loading) return <div className="p-10 text-center animate-pulse text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Accediendo a Bóveda...</div>;

  return (
    <div className="space-y-4">
      {vortices.length === 0 ? (
        <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Bóveda vacía</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                <th className="px-4 pb-2">Vórtice</th>
                <th className="px-4 pb-2">Visitas</th>
                <th className="px-4 pb-2">Expira</th>
                <th className="px-4 pb-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vortices.map((v) => (
                <tr key={v.id} className="bg-white/5 group hover:bg-white/10 transition-all rounded-2xl overflow-hidden">
                  <td className="px-4 py-4 rounded-l-2xl border-y border-l border-white/5">
                    <div className="flex items-center gap-3">
                      <Shield size={14} className="text-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-100">Secure Drop</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-y border-white/5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <Eye size={12} /> {v.viewCount} / {v.maxViews}
                    </div>
                  </td>
                  <td className="px-4 py-4 border-y border-white/5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-rose-400">
                      <Clock size={12} /> {new Date(v.expiresAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 rounded-r-2xl border-y border-r border-white/5 text-right">
                    <button onClick={() => handleCopyLink(v.id)} className="p-2 text-slate-500 hover:text-blue-500 transition-all active:scale-90" title="Copiar Enlace Base">
                      <Copy size={14} />
                    </button>
                    <button onClick={() => handleDelete(v.id)} className="p-2 text-slate-500 hover:text-rose-500 transition-all active:scale-90" title="Borrar para siempre">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}