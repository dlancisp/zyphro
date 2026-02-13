import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, Trash2, Clock, Eye, Copy, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { cryptoUtils } from '../utils/crypto';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

// --- SUB-COMPONENTE: TEMPORIZADOR DE VIDA ---
const CountdownTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!expiresAt) return; // Si no hay fecha, no hacemos nada

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expirationDate = new Date(expiresAt).getTime(); // Convertimos explícitamente
      const distance = expirationDate - now;

      if (isNaN(distance) || distance < 0) { // Validamos si es un número real
        setTimeLeft("EXPIRADO");
        clearInterval(interval);
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-full border border-rose-100">
      <Clock size={12} /> Autodestrucción en: {timeLeft || 'Calculando...'}
    </div>
  );
};

export default function SecureDrop() {
  const [text, setText] = useState('');
  const [viewOnce, setViewOnce] = useState(true);
  const [link, setLink] = useState('');
  const [incomingMsg, setIncomingMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const key = window.location.hash.substring(1);
    
    if (id && key) {
      fetchAndDecryptMessage(id, key);
    }
  }, []);

  const fetchAndDecryptMessage = async (id, key) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/messages/${id}`);
      if (!res.ok) throw new Error("El mensaje se ha destruido o ha caducado.");
      
      const data = await res.json();
      const decryptedText = await cryptoUtils.decryptData(data.content, key);
      
      setIncomingMsg({ ...data, content: decryptedText });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!text) return toast.error("Escribe un mensaje");
    setLoading(true);
    try {
      const masterKey = await cryptoUtils.generateKey();
      const encryptedBase64 = await cryptoUtils.encryptData(text, masterKey);

      const res = await fetch(`${API_URL}/api/messages/create`, { // Usa ` (backtick), no ' (comilla simple)
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: encryptedBase64,
          viewOnce: viewOnce
        })
      });
      
      const data = await res.json();
      setLink(`${window.location.origin}/drop?id=${data.id}#${masterKey}`);
      toast.success("Vórtice generado con éxito");
    } catch (err) {
      toast.error("Fallo en la infraestructura de cifrado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-slate-900 font-sans">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-corporate-lg border border-slate-200 overflow-hidden">
        
        {/* HEADER */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 tracking-[0.2em] uppercase">
            <ShieldCheck size={16} /> Zyphro Pulse
          </div>
          <button onClick={() => window.location.href='/drop'} className="text-slate-400 hover:text-blue-600 font-bold text-[10px] flex items-center gap-1 transition-colors">
            <RotateCcw size={14} /> RESET
          </button>
        </div>

        <div className="p-10">
          {!incomingMsg ? (
            !link ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                <textarea 
                  value={text} 
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-40 bg-slate-50 border border-slate-200 rounded-3xl p-6 text-sm focus:border-blue-600 focus:bg-white outline-none resize-none font-medium transition-all shadow-inner"
                  placeholder="Introduce información confidencial..."
                />
                
                <div className="flex gap-4">
                  <button onClick={() => setViewOnce(true)}
                    className={`flex-1 p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-300 ${viewOnce ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-100 opacity-50 hover:opacity-100'}`}>
                    <Eye size={20} className={viewOnce ? 'text-blue-600' : 'text-slate-400'} />
                    <span className="text-[10px] font-black uppercase tracking-widest">1 Visualización</span>
                  </button>
                  <button onClick={() => setViewOnce(false)}
                    className={`flex-1 p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-300 ${!viewOnce ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-100 opacity-50 hover:opacity-100'}`}>
                    <Clock size={20} className={!viewOnce ? 'text-blue-600' : 'text-slate-400'} />
                    <span className="text-[10px] font-black uppercase tracking-widest">24 Horas</span>
                  </button>
                </div>

                <button onClick={handleCreate} disabled={loading}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-blue-500/20 uppercase tracking-[0.2em] text-[10px] active:scale-[0.98] transition-all disabled:opacity-50">
                  {loading ? 'Cifrando datos...' : 'Generar Vórtice Seguro'}
                </button>
              </div>
            ) : (
              <div className="text-center space-y-6 py-4 animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-100">
                  <Zap className="text-blue-600" size={24} fill="currentColor" />
                </div>
                <h3 className="text-xl font-black tracking-tight">Enlace Blindado</h3>
                <div className="bg-slate-900 p-4 rounded-2xl flex items-center gap-2 border border-slate-800 shadow-2xl">
                  <input readOnly value={link} className="bg-transparent text-blue-400 font-mono text-[10px] flex-1 outline-none truncate" />
                  <button onClick={() => {navigator.clipboard.writeText(link); toast.success("Copiado al portapapeles")}} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase hover:bg-blue-700 transition-colors">Copiar</button>
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.1em] leading-loose">
                  {viewOnce ? '⚠️ Este link es de un solo uso' : '⏱️ El link caducará automáticamente en 24h'}
                </p>
              </div>
            )
          ) : (
            <div className="space-y-6 animate-in fade-in duration-700">
              <div className="flex flex-col items-center gap-4">
                {incomingMsg.fileName === "view-once" ? (
                  <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
                    <Trash2 size={12} /> Última visualización: Se destruirá al cerrar
                  </div>
                ) : (
                  <CountdownTimer expiresAt={incomingMsg.expiresAt} />
                )}
              </div>
              
              <div className="bg-slate-50 border-2 border-blue-100 rounded-3xl p-8 font-mono text-sm leading-relaxed shadow-inner break-words relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                {incomingMsg.content}
              </div>
              
              <p className="text-[10px] text-slate-400 text-center font-bold italic tracking-wide">
                Protegido con XChaCha20-Poly1305. Contenido Zero-Knowledge.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}