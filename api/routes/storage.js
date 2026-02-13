import React, { useState, useEffect } from 'react';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import { ShieldCheck, Plus, X, Lock, Key, Eye, EyeOff, Copy, Trash2, Clock, Zap, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

// Usamos window.location para detectar si estamos en local o en producción
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

export default function Storage() {
  const { getToken, isLoaded, userId } = useAuth();
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState('note');
  const [saving, setSaving] = useState(false);
  const [revealedIds, setRevealedIds] = useState([]);

  useEffect(() => {
    if (isLoaded && userId) fetchSecrets();
  }, [isLoaded, userId]);

  const fetchSecrets = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/secrets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSecrets(data);
    } catch (err) {
      toast.error("Error al sincronizar con Neon");
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
      const res = await fetch(`${API_URL}/api/secrets/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          type: newType,
          nonce: null,
          // Si es un drop, calculamos 24h desde ahora
          expiresAt: newType === 'drop' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null
        })
      });
      if (!res.ok) throw new Error();
      toast.success("Elemento protegido en Neon");
      fetchSecrets();
      setIsFormOpen(false);
      setNewTitle(''); setNewContent('');
    } catch (err) {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const deleteSecret = async (id) => {
    if (!confirm("¿Eliminar este secreto permanentemente?")) return;
    try {
      const token = await getToken();
      await fetch(`${API_URL}/api/secrets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Eliminado");
      setSecrets(secrets.filter(s => s.id !== id));
    } catch (err) {
      toast.error("No se pudo eliminar");
    }
  };

  const toggleReveal = (id) => {
    setRevealedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-mono text-accent">Sincronizando...</div>;

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-slate-900">
        <div className="w-20 h-20 bg-accent-light rounded-3xl flex items-center justify-center mb-8 shadow-corporate">
            <Lock className="w-10 h-10 text-accent" />
        </div>
        <h1 className="text-4xl font-black mb-4 tracking-tighter">Bóveda de Seguridad</h1>
        <p className="text-slate-500 text-center max-w-sm mb-10 font-medium">Inicia sesión para gestionar tus activos con cifrado XChaCha20.</p>
        <SignInButton mode="modal">
          <button className="bg-accent text-white px-10 py-4 rounded-2xl font-bold shadow-corporate-lg hover:bg-accent-dark transition-all flex items-center gap-3">
            Desbloquear Bóveda <Zap size={18} fill="currentColor" />
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 px-6 text-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-2 text-accent font-mono text-[10px] font-black tracking-[0.2em] mb-2 uppercase">
              <ShieldCheck size={16} /> Protocolo de Bóveda
            </div>
            <h1 className="text-4xl font-black tracking-tight">Mis Activos</h1>
          </div>
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-corporate-lg">
            {isFormOpen ? <X size={20} /> : <Plus size={20} />} {isFormOpen ? 'Cerrar' : 'Nuevo Item'}
          </button>
        </div>

        {isFormOpen && (
          <div className="mb-10 bg-white border border-slate-200 p-8 rounded-3xl shadow-corporate animate-in fade-in slide-in-from-top-4">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Identificador</label>
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:border-accent outline-none font-bold" placeholder="Ej: Password Principal" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tipo de Activo</label>
                  <select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:border-accent outline-none font-bold">
                    <option value="note">Nota Privada</option>
                    <option value="password">Credencial</option>
                    <option value="drop">Cloud Drop (24h)</option>
                  </select>
                </div>
              </div>
              <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 h-32 focus:border-accent outline-none font-mono text-sm" placeholder="Contenido a proteger..." />
              <button disabled={saving} className="w-full bg-accent text-white py-4 rounded-xl font-bold shadow-lg shadow-accent/20">{saving ? 'Procesando...' : 'Guardar en Neon'}</button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Sincronizando...</div>
        ) : (
          <div className="grid gap-4">
            {secrets.map((s) => (
              <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-accent">
                    {s.type === 'password' ? <Key size={20} /> : s.type === 'drop' ? <Clock size={20} /> : <FileText size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold">{s.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">{s.type}</span>
                      <p className="text-xs font-mono text-slate-400">{revealedIds.includes(s.id) ? s.content : '••••••••••••••••'}</p>
                      {s.expiresAt && <span className="text-[9px] font-bold text-amber-500 flex items-center gap-1 uppercase"><Clock size={10} /> Expira en 24h</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleReveal(s.id)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">{revealedIds.includes(s.id) ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  <button onClick={() => {navigator.clipboard.writeText(s.content); toast.success("Copiado")}} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Copy size={18} /></button>
                  <button onClick={() => deleteSecret(s.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}