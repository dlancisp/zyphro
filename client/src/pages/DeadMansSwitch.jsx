import { useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- ESTILOS PERSONALIZADOS PARA EL PALPITAR LENTO ---
// Esto crea una animación de "respiro" de 6 segundos, mucho más suave.
const customStyles = `
  @keyframes slow-breathe {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.02); }
  }
  .animate-slow-breathe {
    animation: slow-breathe 6s ease-in-out infinite;
  }
`;

// --- NUEVO ICONO: BATERÍA LLENA ---
const BatteryFullIcon = className => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" className={className}>
    {/* Carcasa */}
    <rect x="2" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" className="text-gray-500/50"/>
    {/* Polo positivo */}
    <line x1="22" y1="10" x2="22" y2="14" stroke="currentColor" strokeWidth="2" className="text-gray-500/50"/>
    {/* Carga interna (La que brilla) */}
    <rect x="4" y="8" width="14" height="8" rx="1" fill="#10b981" className="drop-shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-slow-breathe" />
  </svg>
);

const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;

export default function DeadMansSwitchVault() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('vault');
  
  const [vaultItems] = useState([
    { id: 1, title: 'Acceso Binance', type: 'password', date: 'Hace 2 días' },
    { id: 2, title: 'Carta para María', type: 'note', date: 'Hace 1 mes' },
    { id: 3, title: 'Seed Phrase Ledger', type: 'crypto', date: 'Hoy' },
  ]);

  const [status] = useState({
    state: 'ARMED',
    nextCheck: '12 Días',
    recipient: 'abogado@bufete.com'
  });

  return (
    <div className="min-h-screen text-white p-6 font-sans relative">
      {/* Inyectamos los estilos personalizados */}
      <style>{customStyles}</style>

      {/* --- CABECERA DE ESTADO (MEJORADA) --- */}
      <div className="max-w-4xl mx-auto mb-12 relative z-10">
        {/* CAMBIO 1: Glassmorphism (fondo semitransparente y borroso) */}
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden group">
          
          {/* Luz ambiental de fondo (Lenta) */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-emerald-900/10 via-emerald-500/5 to-emerald-900/10 animate-slow-breathe -z-10"></div>
          
          <div className="flex items-center gap-6">
            {/* CAMBIO 2: La Batería */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-black/40 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                {/* CAMBIO 3: Icono de batería con carga interna palpitante */}
                <BatteryFullIcon />
              </div>
            </div>

            <div>
              <h2 className="text-gray-400 text-xs tracking-[0.3em] uppercase font-bold mb-1">Estado del Sistema</h2>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">OPERATIVO</span>
                <span className="text-emerald-400 text-[10px] font-bold px-2 py-1 bg-emerald-950/50 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-slow-breathe"></span>
                  VIGILANDO
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 md:mt-0 flex items-center gap-8 text-right">
            <div className="hidden md:block">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Próximo Check-in</p>
              <p className="text-2xl font-mono text-white font-bold">{status.nextCheck}</p>
            </div>
            
            {/* Botón mejorado */}
            <button className="group/btn relative bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Confirmar Vida
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:translate-x-1 transition-transform"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </span>
              {/* Brillo al pasar el ratón */}
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
            </button>
          </div>
        </div>
      </div>

      {/* --- ZONA PRINCIPAL (VAULT) - Con fondo mejorado --- */}
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-6 p-1 bg-white/5 rounded-full backdrop-blur-md border border-white/10">
            <button 
              onClick={() => setActiveTab('vault')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'vault' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400 hover:text-white'}`}
            >
              MI BÓVEDA
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400 hover:text-white'}`}
            >
              CONFIGURACIÓN
            </button>
          </div>
          
          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-full font-bold text-sm transition-all border border-white/10 hover:border-white/30 backdrop-blur-md shadow-lg">
            <PlusIcon /> Nuevo Secreto
          </button>
        </div>

        {/* BÓVEDA (Tarjetas con Glassmorphism también) */}
        {activeTab === 'vault' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence>
              {vaultItems.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  // CAMBIO: Glassmorphism en las tarjetas
                  className="group bg-black/30 backdrop-blur-md border border-white/10 p-6 rounded-2xl cursor-pointer transition-all relative overflow-hidden shadow-xl"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-xl bg-black/50 flex items-center justify-center text-gray-400 border border-white/5 group-hover:border-white/20 group-hover:text-white transition-colors">
                      {item.type === 'password' ? <LockIcon /> : <FileTextIcon />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">{item.title}</h3>
                      <p className="text-xs text-gray-500 font-medium">Añadido: {item.date}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* TARJETA VACÍA */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                className="border-2 border-dashed border-white/10 hover:border-white/30 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:text-white transition-all cursor-pointer min-h-[120px] bg-white/5 backdrop-blur-sm"
              >
                <PlusIcon />
                <span className="text-xs mt-3 font-bold tracking-wider uppercase">Añadir otro ítem</span>
              </motion.div>

            </AnimatePresence>
          </div>
        )}

        {/* CONFIGURACIÓN (Placeholder) */}
        {activeTab === 'settings' && (
           <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center text-gray-400">
               Panel de configuración en construcción...
           </div>
        )}
      </div>
    </div>
  );
}