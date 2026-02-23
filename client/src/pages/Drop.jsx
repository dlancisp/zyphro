import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Clock, RotateCcw, ArrowLeft, Lock, ChevronDown, 
  Cloud, Mail as MailIcon, Eye, Gauge, ShieldCheck, Link as LinkIcon 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SignedIn, UserButton, useAuth } from "@clerk/clerk-react"; 
import toast from 'react-hot-toast';
import { cryptoUtils } from '../utils/crypto';
import { API_URL } from '../apiConfig';

// --- COMPONENTE DEL TEMPORIZADOR ---
const CountdownTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expirationDate = new Date(expiresAt).getTime();
      const distance = expirationDate - now;
      if (isNaN(distance) || distance < 0) {
        setTimeLeft("EXPIRADO");
        clearInterval(interval);
      } else {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] bg-rose-500/10 px-6 py-3 rounded-2xl border border-rose-500/20 animate-pulse">
      <Clock size={14} /> Autodestrucción: {timeLeft}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function SecureDrop() {
  const [text, setText] = useState('');
  const [maxViews, setMaxViews] = useState(1);
  const [expirationHours, setExpirationHours] = useState(24);
  const [link, setLink] = useState('');
  const [incomingMsg, setIncomingMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  
  const { getToken } = useAuth(); 
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    
    // Detectamos si venimos de un enlace con parámetros
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const key = window.location.hash.substring(1);
    
    if (id && key) {
      hasFetched.current = true;
      fetchAndDecryptMessage(id, key);
    }
  }, []);

  const fetchAndDecryptMessage = async (id, key) => {
    setLoading(true);
    try {
      // Petición pública (sin token de Clerk para que el receptor pueda leerlo)
      const res = await fetch(`${API_URL}/api/v1/vortex/get/${id}`);
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Mensaje destruido o inexistente.");
      }
      
      const data = await res.json();
      
      // Desencriptación local xchacha20
      const decryptedText = await cryptoUtils.decryptData(data.content, key);
      
      if (!decryptedText) throw new Error("Llave de desencriptación inválida.");
      
      setIncomingMsg({ ...data, content: decryptedText });
    } catch (err) { 
      console.error("Vortex Error:", err);
      toast.error(err.message); 
      // Si falla, volvemos a la pantalla limpia tras un momento
      setTimeout(() => { window.location.href = '/drop'; }, 3000);
    } finally { 
      setLoading(false); 
    }
  };

  const handleCreate = async () => {
    if (!text) return toast.error("Escribe algo");
    setLoading(true);
    try {
      const token = await getToken(); 
      
      // 1. Cifrado Zero-Knowledge
      const masterKey = await cryptoUtils.generateKey();
      const encryptedBase64 = await cryptoUtils.encryptData(text, masterKey);
      
      // 2. Envío al servidor
      const res = await fetch(`${API_URL}/api/v1/vortex/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: encryptedBase64, 
          maxViews: parseInt(maxViews), 
          expirationHours: parseInt(expirationHours) 
        })
      });
      
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Fallo en el servidor");

      localStorage.setItem(`vortex_key_${data.vortexId}`, masterKey);

      // Generamos el link de producción
      const finalLink = `${window.location.origin}/drop?id=${data.vortexId}#${masterKey}`;
      setLink(finalLink);
      toast.success("Vórtice generado con éxito");

    } catch (err) { 
      console.error(err);
      toast.error(err.message || "Error al generar"); 
    } finally { 
      setLoading(false); 
    }
  };

  // ESTILOS
  const labelStyle = "text-[10px] font-black uppercase text-blue-300/60 ml-3 tracking-widest mb-2 flex items-center gap-2";
  const selectStyle = "appearance-none w-full bg-[#0a101f]/80 backdrop-blur-xl border border-blue-900/30 rounded-2xl p-4 pr-12 text-xs font-bold uppercase text-blue-100 outline-none transition-all hover:border-blue-500/50 focus:border-blue-500 cursor-pointer tracking-wider";

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      
      <nav className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center relative z-[100]">
        <Link to="/" className="flex items-center">
          <span className="text-3xl font-black italic tracking-tighter text-blue-600 uppercase">ZYPHRO</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-[10px] font-black uppercase text-slate-400 hover:text-white tracking-widest">Home</Link>
          <div className="relative" onMouseEnter={() => setIsServicesOpen(true)} onMouseLeave={() => setIsServicesOpen(false)}>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase text-white tracking-widest bg-transparent border-none cursor-pointer">
              Servicios <ChevronDown size={12} className={isServicesOpen ? 'rotate-180' : ''} />
            </button>
            {isServicesOpen && (
              <div className="absolute top-full -left-4 pt-4">
                <div className="w-64 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl">
                  <Link to="/drop" className="flex items-center gap-4 p-3 rounded-xl bg-blue-600/10 border border-blue-600/20">
                    <Cloud size={16} className="text-blue-500" />
                    <p className="text-[10px] font-black uppercase">Secure Drop</p>
                  </Link>
                  <Link to="/mail" className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 mt-1">
                    <MailIcon size={16} className="text-emerald-500" />
                    <p className="text-[10px] font-black uppercase">Anon Mail</p>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
           <Link to="/dashboard" className="text-[10px] font-black tracking-widest uppercase text-slate-400">Dashboard</Link>
           <SignedIn><UserButton afterSignOutUrl="/" /></SignedIn>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center pt-10 pb-20 px-6">
        <Link to="/dashboard" className="mb-8 flex items-center gap-2 text-slate-600 hover:text-blue-500 font-black text-[10px] tracking-[0.2em] uppercase transition-all">
          <ArrowLeft size={14} /> Volver al panel
        </Link>

        <div className="w-full max-w-2xl bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md z-50 flex flex-col items-center justify-center">
              <Lock className="text-blue-600 animate-bounce mb-4" size={40} />
              <span className="text-xs font-black tracking-[0.3em] text-blue-400 uppercase animate-pulse">Procesando Vórtice...</span>
            </div>
          )}

          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0a101f]/50 text-blue-500 font-black italic uppercase tracking-tighter">
            <div className="flex items-center gap-3">
                <ShieldCheck size={20} />
                <span>ZYPHRO <span className="text-[10px] not-italic text-blue-300/50 ml-1 font-bold tracking-widest uppercase">Secure Drop</span></span>
            </div>
            <button onClick={() => window.location.href='/drop'} className="p-2 text-slate-500 hover:text-blue-500 transition-transform hover:rotate-180 duration-500 bg-transparent border-none cursor-pointer">
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="p-10">
            {!incomingMsg ? (
              !link ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="relative group">
                    <textarea value={text} onChange={(e) => setText(e.target.value)}
                        className="w-full h-56 bg-[#0a101f]/80 backdrop-blur-xl border border-blue-900/30 rounded-3xl p-8 text-sm focus:border-blue-500/50 outline-none resize-none text-blue-50 placeholder:text-blue-700/50 transition-all"
                        placeholder="Escribe aquí el secreto, credenciales o mensaje sensible..." />
                    <div className="absolute bottom-6 right-8 text-[9px] font-black uppercase text-blue-700/50 tracking-widest">
                        End-to-End Encrypted
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelStyle}><Eye size={12}/> Lecturas</label>
                      <div className="relative">
                        <select value={maxViews} onChange={(e) => setMaxViews(e.target.value)} className={selectStyle}>
                          <option value="1">1 Solo Uso</option>
                          <option value="5">5 Visitas</option>
                          <option value="10">10 Visitas</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className={labelStyle}><Clock size={12}/> Expiración</label>
                      <div className="relative">
                        <select value={expirationHours} onChange={(e) => setExpirationHours(e.target.value)} className={selectStyle}>
                          <option value="1">1 Hora</option>
                          <option value="24">24 Horas</option>
                          <option value="168">7 Días</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] border-none cursor-pointer">
                    <Zap size={16} className="inline mr-2"/> Generar Vórtice
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-10 py-8 animate-in zoom-in-95 duration-500">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center border border-blue-500/30 animate-pulse">
                        <Cloud className="text-blue-400" size={40} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase text-blue-100">Vórtice Establecido</h3>
                    <p className="text-[10px] text-blue-300/70 font-black uppercase tracking-widest">Comparte este enlace seguro</p>
                  </div>

                  <div className="bg-[#0a101f]/80 backdrop-blur-xl p-1 rounded-3xl border border-blue-900/30 flex items-center">
                    <div className="p-4 text-blue-500"><LinkIcon size={18} /></div>
                    <input readOnly value={link} className="bg-transparent text-blue-100 font-mono text-[10px] w-full outline-none truncate pl-2" />
                    <button onClick={() => {navigator.clipboard.writeText(link); toast.success("Copiado")}} className="bg-blue-600 hover:bg-blue-700 text-white m-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase border-none cursor-pointer">
                        Copiar
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-10 animate-in fade-in duration-700">
                <div className="flex flex-col items-center gap-4">
                  <CountdownTimer expiresAt={incomingMsg.expiresAt} />
                  <div className="text-[9px] font-black uppercase text-blue-300/70 tracking-widest bg-blue-900/20 px-5 py-2.5 rounded-full border border-blue-500/20">
                    Visitas restantes: <span className="text-blue-100">{incomingMsg.remainingViews}</span>
                  </div>
                </div>
                <div className="bg-[#0a101f]/80 backdrop-blur-xl border border-blue-900/30 rounded-3xl p-12 font-mono text-sm text-blue-50 shadow-2xl relative overflow-hidden">
                    <pre className="whitespace-pre-wrap break-words">{incomingMsg.content}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="mt-12 text-[9px] text-slate-700 font-black uppercase tracking-[0.4em] flex items-center gap-2 opacity-50">
            <ShieldCheck size={10}/> xchacha20-poly1305 zero-knowledge protocol
        </p>
      </main>
    </div>
  );
}