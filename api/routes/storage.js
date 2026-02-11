import React, { useState, useEffect } from 'react';
import { useAuth, SignInButton } from '@clerk/clerk-react';

// --- CONFIGURACIÓN URL ---
const API_URL = ''; 

export default function DeadManSwitch() {
  const { getToken, isLoaded, userId } = useAuth();
  
  // Estados de datos
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de interfaz
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [saving, setSaving] = useState(false);

  // ESTADO NUEVO: El secreto que estamos "inspeccionando"
  const [selectedSecret, setSelectedSecret] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false); // Para el efecto de blur

  // --- CARGA DE DATOS ---
  useEffect(() => {
    if (isLoaded && userId) {
      fetchSecrets();
    }
  }, [isLoaded, userId]);

  const fetchSecrets = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/vault`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      setSecrets(data);
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con la bóveda.');
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
      const res = await fetch(`${API_URL}/api/vault`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          type: 'note',
          nonce: null
        })
      });

      if (!res.ok) throw new Error('Error al guardar');

      await fetchSecrets();
      setNewTitle('');
      setNewContent('');
      setIsFormOpen(false);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Función para copiar al portapapeles
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copiado al portapapeles");
  };

  // --- RENDERIZADO CONDICIONAL ---

  // 1. Cargando identidad
  if (!isLoaded) return <div className="min-h-screen pt-32 text-center text-white font-mono">Verificando identidad...</div>;

  // 2. NO LOGUEADO (Botón Arreglado)
  if (!userId) {
    return (
      <div className="min-h-screen bg-[#050505] text-white pt-32 px-6 flex flex-col items-center justify-center">
        <InternalIcons.Lock className="w-16 h-16 text-gray-600 mb-6" />
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 text-center">
          Bóveda Encriptada
        </h1>
        <p className="text-gray-400 max-w-md text-center mb-8">
          Almacenamiento de grado militar para tus activos digitales más importantes.
        </p>
        
        {/* BOTÓN DE CLERK OFICIAL */}
        <SignInButton mode="modal">
          <button className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2">
            Acceder / Crear Bóveda
            <InternalIcons.ChevronRight />
          </button>
        </SignInButton>
      </div>
    );
  }

  // 3. LOGUEADO (Interfaz Principal)
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-6 relative">
      <div className="max-w-5xl mx-auto">
        
        {/* CABECERA */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
              Bóveda Digital
            </h1>
            <p className="text-gray-500 text-sm md:text-base font-mono">
              Protocolo de seguridad activo.
            </p>
          </div>
          
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
          >
            {isFormOpen ? <InternalIcons.Close /> : <InternalIcons.Plus />}
            {isFormOpen ? 'Cancelar' : 'Añadir Item'}
          </button>
        </div>

        {/* FORMULARIO */}
        {isFormOpen && (
          <div className="mb-12 bg-gray-900/80 border border-white/10 p-8 rounded-2xl backdrop-blur-xl animate-fade-in-down shadow-2xl">
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">Título del Activo</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none font-medium"
                  placeholder="Ej: Seed Phrase Ledger"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">Contenido Seguro</label>
                <textarea 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white h-32 focus:border-blue-500 outline-none font-mono text-sm"
                  placeholder="Pegar contenido sensible aquí..."
                />
              </div>
              <button 
                disabled={saving}
                className="w-full bg-white text-black hover:bg-gray-200 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 mt-4"
              >
                {saving ? 'Encriptando...' : 'Guardar y Encriptar'}
              </button>
            </form>
          </div>
        )}

        {/* LISTA DE SECRETOS */}
        {loading ? (
           <div className="text-center py-20 text-gray-500 animate-pulse">Sincronizando con la nube...</div>
        ) : secrets.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-800 rounded-3xl">
            <div className="mx-auto h-12 w-12 text-gray-700 mb-4 flex justify-center"><InternalIcons.Lock /></div>
            <p className="text-gray-500">Bóveda vacía. Añade tu primer secreto.</p>