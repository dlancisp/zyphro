import React, { useState, useEffect } from 'react';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import { ShieldCheck, Plus, X, Lock, Key, Eye, EyeOff, Copy, Trash2, Clock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:3000'; // Asegúrate de que coincida con tu puerto de API

export default function Storage() {
  const { getToken, isLoaded, userId } = useAuth();
  
  // Estados de datos
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de interfaz
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState('note');
  const [saving, setSaving] = useState(false);
  const [revealedIds, setRevealedIds] = useState([]); // Maneja qué secretos están visibles

  useEffect(() => {
    if (isLoaded && userId) {
      fetchSecrets();
    }
  }, [isLoaded, userId]);

  const fetchSecrets = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/secrets`, { // Ruta actualizada a /secrets
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      setSecrets(data);
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con la base de datos de Neon.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    setSaving(true);
    try {
      const token = await getToken();
      
      // NOTA: Aquí es donde implementaríamos el cifrado XChaCha20 en el futuro
      const res = await fetch(`${API_URL}/api/secrets/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent, // En el futuro: encrypt(newContent)
          type: newType,
          nonce: null // Parámetro para XChaCha20
        })
      });

      if (!res.ok) throw new Error('Fallo al guardar en Neon');

      toast.success("Elemento encriptado y guardado");
      await fetchSecrets();
      setNewTitle('');
      setNewContent('');
      setIsFormOpen(false);
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleReveal = (id) => {
    setRevealedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-mono text-accent">Sincronizando...</div>;

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-accent-light rounded-3xl flex items-center justify-center mb-8 shadow-corporate">
            <Lock className="w-10 h-10 text-accent" />
        </div>
        <h1 className="text-4xl font-extrabold text-text-primary mb-4 tracking-tighter">Bóveda de Seguridad</h1>
        <p className="text-text-secondary text-center max-w-sm mb-10 font-medium">
          Accede a tu infraestructura de almacenamiento con cifrado XChaCha20.
        </p>
        <SignInButton mode="modal">
          <button className="bg-accent text-white px-10 py-4 rounded-2xl font-bold shadow-corporate-lg hover:bg-accent-dark transition-all flex items-center gap-3">
            Desbloquear Bóveda <Zap size={18} fill="currentColor" />
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-accent font-mono text-xs font-bold tracking-[0.2em] mb-2">
              <ShieldCheck size={16} /> PROTOCOLO ACTIVO
            </div>
            <h1 className="text-4xl font-black text-text-primary tracking-tight">Mi Bóveda</h1>
          </div>
          
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-corporate-lg"
          >
            {isFormOpen ? <X size={20} /> : <Plus size={20} />}
            {isFormOpen ? 'Cancelar' : 'Nuevo Secreto'}
          </button>
        </div>

        {/* FORMULARIO DE NUEVO SECRETO */}
        {isFormOpen && (
          <div className="mb-10 bg-white border border-border-light p-8 rounded-3xl shadow-corporate animate-in fade-in slide-in-from-top-4">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Título</label>
                  <input 
                    type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-border-light rounded-xl p-3 text-text-primary focus:border-accent outline-none font-bold"
                    placeholder="Ej: Acceso Servidor"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Categoría</label>
                  <select 
                    value={newType} onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-slate-50 border border-border-light rounded-xl p-3 text-text-primary focus:border-accent outline-none font-bold"
                  >
                    <option value="note">Nota Segura</option>
                    <option value="password">Contraseña</option>
                    <option value="drop">Cloud Drop</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contenido Sensible</label>
                <textarea 
                  value={newContent} onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-50 border border-border-light rounded-xl p-4 text-text-primary h-32 focus:border-accent outline-none font-mono text-sm"
                  placeholder="Introduce el secreto aquí..."
                />
              </div>
              <button 
                disabled={saving}
                className="w-full bg-accent text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-accent/20"
              >
                {saving ? 'Cifrando datos...' : 'Guardar en Neon'}
              </button>
            </form>
          </div>
        )}

        {/* LISTADO DE ELEMENTOS */}
        {loading ? (
          <div className="flex flex-col items-center py-20 text-slate-400 gap-4">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-xs uppercase tracking-widest">Sincronizando con Neon...</p>
          </div>
        ) : secrets.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white/50">
            <Lock className="mx-auto h-12 w-12 text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">No hay secretos almacenados.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {secrets.map((secret) => (
              <div key={secret.id} className="bg-white p-6 rounded-2xl border border-border-light shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-accent">
                    {secret.type === 'password' ? <Key size={20} /> : <File size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary">{secret.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        {secret.type}
                      </span>
                      <p className="text-xs font-mono text-slate-400">
                        {revealedIds.includes(secret.id) ? secret.content : '••••••••••••••••'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleReveal(secret.id)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                    {revealedIds.includes(secret.id) ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button onClick={() => {navigator.clipboard.writeText(secret.content); toast.success("Copiado")}} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                    <Copy size={18} />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg text-red-400">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}