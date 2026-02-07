import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// Iconos simples (puedes usar tu componente Icons si prefieres)
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;

export default function DeadMansSwitch() {
  const { getToken, userId, isLoaded } = useAuth();
  const { user } = useUser();
  
  const [loading, setLoading] = useState(false);
  const [activeSwitch, setActiveSwitch] = useState(null); // Guarda los datos si ya existe uno
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    recipient: '',
    interval: '30', // Por defecto 30 días
    note: ''
  });

  // 1. CARGAR ESTADO AL ENTRAR
  useEffect(() => {
    if (isLoaded && userId) {
      checkStatus();
    }
  }, [isLoaded, userId]);

  const checkStatus = async () => {
    try {
      const token = await getToken();
      // Nota: Necesitamos asegurar que esta ruta GET exista en el backend
      const res = await fetch('/api/dms/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Si devuelve un objeto con ID, es que está activo
        if (data && data.id) setActiveSwitch(data);
      }
    } catch (e) {
      console.error("Error cargando estado:", e);
    } finally {
      setFetching(false);
    }
  };

  // 2. ACTIVAR EL PROTOCOLO (CREAR)
  const activate = async (e) => {
    e.preventDefault();
    if (!form.recipient || !form.note) return toast.error("Rellena todos los campos");

    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/dms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
          recipientEmail: form.recipient,
          note: form.note,
          interval: form.interval
        })
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success('Protocolo activado correctamente.');
        checkStatus(); // Recargar para mostrar la pantalla de "Activo"
      } else {
        toast.error('Error: ' + data.error);
      }
    } catch (e) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // 3. CHECK-IN MANUAL (Opcional, ya que el automático lo hace)
  const manualCheckIn = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/dms/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId }) 
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Vida confirmada. Contador reiniciado.');
        checkStatus(); // Actualizar fechas
      }
    } catch (e) {
      toast.error("Error al conectar");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center mt-20 text-gray-500">Cargando estado...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      
      {/* CABECERA */}
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600 mb-2">
          Dead Man's Switch
        </h2>
        <p className="text-gray-400">
          Si dejas de dar señales de vida, nosotros entregamos tu legado.
        </p>
      </div>

      {/* PANTALLA: YA TIENE UN SWITCH ACTIVO */}
      {activeSwitch ? (
        <div className="bg-gray-900 border border-green-900/50 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse"></div>
          
          <div className="text-green-500 mb-4 flex justify-center">
            <ShieldIcon />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">Monitoreo Activo</h3>
          <p className="text-gray-400 mb-6">
            El sistema está vigilando tu actividad. Tu última señal de vida fue detectada.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8 text-left bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div>
              <span className="text-xs text-gray-500 uppercase font-bold">Destinatario</span>
              <p className="text-white truncate">{activeSwitch.recipientEmail}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase font-bold">Frecuencia</span>
              <p className="text-white">{activeSwitch.checkInInterval} Días</p>
            </div>
            <div className="col-span-2 mt-2">
              <span className="text-xs text-gray-500 uppercase font-bold">Próximo Disparo</span>
              <p className="text-red-400 font-mono text-lg">
                {new Date(activeSwitch.nextTriggerDate).toLocaleDateString()} 
                <span className="text-sm text-gray-500 ml-2">
                   ({Math.ceil((new Date(activeSwitch.nextTriggerDate) - new Date()) / (1000 * 60 * 60 * 24))} días restantes)
                </span>
              </p>
            </div>
          </div>

          <button 
            onClick={manualCheckIn} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2 mx-auto shadow-lg shadow-green-900/20"
          >
             {loading ? 'Confirmando...' : <><CheckIcon /> Confirmar Vida Ahora</>}
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            * Tu sesión activa ya ha renovado el contador automáticamente.
          </p>
        </div>
      ) : (
        /* PANTALLA: FORMULARIO DE CREACIÓN */
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={activate} className="space-y-6">
            
            {/* Destinatario */}
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2 tracking-wider">DESTINATARIO (EMAIL)</label>
              <input 
                type="email" 
                value={form.recipient}
                onChange={e => setForm({...form, recipient: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="abogado@ejemplo.com"
              />
            </div>

            {/* Mensaje */}
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2 tracking-wider">CONTENIDO SECRETO</label>
              <textarea 
                value={form.note}
                onChange={e => setForm({...form, note: e.target.value})}
                rows={5}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                placeholder="Escribe aquí tus claves privadas, mensaje de despedida o instrucciones..."
              />
            </div>

            {/* Tiempo */}
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2 tracking-wider">TIEMPO DE INACTIVIDAD</label>
              <select 
                value={form.interval}
                onChange={e => setForm({...form, interval: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="7">7 Días (1 Semana)</option>
                <option value="15">15 Días</option>
                <option value="30">30 Días (1 Mes)</option>
                <option value="90">90 Días (3 Meses)</option>
                <option value="365">365 Días (1 Año)</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Si no inicias sesión en este tiempo, el mensaje se enviará.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg transform hover:scale-[1.01]"
            >
              {loading ? 'Activando...' : 'ACTIVAR PROTOCOLO'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}