import React, { useState, useEffect } from 'react';
import { Key, Copy, Plus, Trash2, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useAuth, useUser } from "@clerk/clerk-react"; // Importamos useUser una sola vez
import toast from 'react-hot-toast';

const ApiKeyManager = () => {
  const { getToken } = useAuth();
  const { user } = useUser(); // Obtenemos el usuario de Clerk
  
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState({}); 

  // Cargar las llaves al entrar
  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const token = await getToken();
      // Ajustado para que funcione en local o prod
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const res = await fetch(`${baseUrl}/api/keys/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setKeys(data);
      }
    } catch (err) {
      console.error("Error cargando keys", err);
    }
  };

  const createKey = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // AHORA ENVIAMOS EL EMAIL EN EL BODY
      const res = await fetch(`${baseUrl}/api/keys/create`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
            name: "Default App",
            email: user?.primaryEmailAddress?.emailAddress // Enviamos el email con seguridad
        })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success("¡API Key generada! Guárdala bien.");
        fetchKeys(); 
      } else {
        toast.error(data.error || "Error creando la llave");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const revokeKey = async (id) => {
    if(!confirm("¿Estás seguro? Esta acción romperá cualquier app que use esta llave.")) return;
    
    try {
      const token = await getToken();
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      await fetch(`${baseUrl}/api/keys/revoke/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Llave revocada");
      fetchKeys();
    } catch (err) {
      toast.error("Error eliminando llave");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="text-emerald-500" size={24} />
            Developer API Keys
          </h3>
          <p className="text-zinc-400 text-sm mt-1">
            Usa estas llaves para integrar Zyphro en tus aplicaciones (Node.js, Python, etc).
          </p>
        </div>
        <button 
          onClick={createKey} 
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          {loading ? "Generando..." : "Nueva Key"}
        </button>
      </div>

      {keys.length === 0 ? (
        <div className="text-center py-8 bg-zinc-950/50 rounded-lg border border-zinc-800 border-dashed">
          <p className="text-zinc-500">No tienes llaves activas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {keys.map((k) => (
            <div key={k.id} className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex items-center justify-between group">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-white font-medium">{k.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${k.isEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {k.isEnabled ? 'Active' : 'Revoked'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-black/50 px-2 py-1 rounded text-zinc-300 font-mono text-sm">
                    {showKey[k.id] ? k.key : 'sk_live_••••••••••••••••••••••'}
                  </code>
                  <button onClick={() => setShowKey(prev => ({...prev, [k.id]: !prev[k.id]}))} className="text-zinc-500 hover:text-white">
                    {showKey[k.id] ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                  <button onClick={() => copyToClipboard(k.key)} className="text-zinc-500 hover:text-emerald-500 ml-2" title="Copiar">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              
              <div className="text-right flex items-center gap-6">
                <div className="text-xs text-zinc-500">
                  <p>Uso: {k.requestsUsed} / {k.requestsLimit}</p>
                  <p>Creada: {new Date(k.createdAt).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => revokeKey(k.id)}
                  className="text-zinc-600 hover:text-red-500 p-2 rounded-md hover:bg-red-500/10 transition-colors"
                  title="Revocar acceso"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-3 items-start">
        <ShieldAlert className="text-blue-400 shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-blue-200/80">
          <p className="font-medium text-blue-400">Seguridad</p>
          Tus llaves tienen acceso total a tu cuenta. No las compartas ni las subas a repositorios públicos como GitHub.
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;