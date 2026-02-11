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
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {secrets.map((secret) => (
              <div 
                key={secret.id} 
                onClick={() => { setSelectedSecret(secret); setIsRevealed(false); }}
                className="bg-gray-900/40 border border-white/5 p-5 rounded-xl hover:bg-gray-800/50 hover:border-blue-500/30 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-blue-500/10 p-2 rounded text-blue-400">
                    <InternalIcons.Lock />
                  </div>
                  <span className="text-xs font-mono text-gray-600">
                    {new Date(secret.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-200 mb-1 group-hover:text-white transition-colors">{secret.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                   <span className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse"></span>
                   ENCRIPTADO
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- MODAL DE DETALLES (Sofisticado) --- */}
        {selectedSecret && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-[#0A0A0A] border border-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
              
              {/* Header del Modal */}
              <div className="bg-gray-900/50 p-6 border-b border-gray-800 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedSecret.title}</h2>
                  <p className="text-xs text-gray-500 font-mono mt-1">ID: {selectedSecret.id.slice(0, 8)}...</p>
                </div>
                <button 
                  onClick={() => setSelectedSecret(null)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <InternalIcons.Close />
                </button>
              </div>

              {/* Contenido Seguro */}
              <div className="p-6 relative">
                <p className="text-xs text-gray-500 font-mono mb-2 uppercase tracking-widest">Contenido Descifrado</p>
                
                <div className="relative group">
                  {/* El contenido real */}
                  <div className={`bg-black border border-gray-800 p-4 rounded-lg font-mono text-sm text-gray-300 break-all transition-all duration-500 ${isRevealed ? 'blur-none' : 'blur-md select-none'}`}>
                    {selectedSecret.content}
                  </div>

                  {/* Capa de protección (Blur Overlay) */}
                  {!isRevealed && (
                    <div 
                      onClick={() => setIsRevealed(true)}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer z-10 hover:bg-white/5 transition-colors rounded-lg"
                    >
                      <div className="bg-black/80 backdrop-blur-sm border border-gray-700 px-4 py-2 rounded-full flex items-center gap-2 text-sm text-white shadow-xl">
                        <InternalIcons.Eye />
                        <span>Hacer clic para revelar</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => copyToClipboard(selectedSecret.content)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-gray-700"
                  >
                    <InternalIcons.Copy /> Copiar
                  </button>
                  <button 
                    onClick={() => setSelectedSecret(null)}
                    className="flex-1 bg-transparent hover:bg-gray-900 text-gray-400 hover:text-white py-3 rounded-lg font-bold text-sm transition-colors border border-transparent hover:border-gray-800"
                  >
                    Cerrar
                  </button>
                </div>
              </div>

              {/* Decoración Footer */}
              <div className="bg-blue-900/20 h-1 w-full"></div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// --- ICONOS INTERNOS ---
const InternalIcons = {
  Lock: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  Eye: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  Close: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Plus: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  ChevronRight: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
  Copy: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
};