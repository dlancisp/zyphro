import React, { useEffect, useState, useRef } from 'react';
import { socket } from '../socket'; // Importamos el socket configurado
import SimplePeer from 'simple-peer';
import { UploadCloud, Download, ShieldCheck, Link as LinkIcon, File, Zap, Activity, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const Drop = () => {
  const [isSender, setIsSender] = useState(true);
  const [file, setFile] = useState(null);
  const [sharingLink, setSharingLink] = useState('');
  const [connected, setConnected] = useState(false);
  const [progress, setProgress] = useState(0);
  const [incomingSignal, setIncomingSignal] = useState(null);
  
  const peerRef = useRef();

  useEffect(() => {
    // 1. Detectar si venimos de un enlace de invitación
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('connectTo');

    if (targetId) {
      setIsSender(false);
      // Avisamos al emisor que estamos listos para recibir
      toast.info("Conectando con el emisor...");
    }

    // 2. Escuchar peticiones de conexión (Para el Receptor)
    socket.on('callUser', (data) => {
      setIncomingSignal(data);
      toast.success("¡Archivo detectado! Pulsa aceptar.");
    });

    // 3. Escuchar aceptación (Para el Emisor)
    socket.on('callAccepted', (signal) => {
      setConnected(true);
      peerRef.current.signal(signal);
    });

    return () => {
      socket.off('callUser');
      socket.off('callAccepted');
    };
  }, []);

  // Función para el EMISOR: Inicia el Peer y genera el link
  const startSharing = () => {
     if (!file) return toast.error("Selecciona un archivo primero");

     const peer = new SimplePeer({ initiator: true, trickle: false });

     peer.on('signal', (data) => {
        // 🚨 USAMOS window.location.origin PARA QUE EL LINK SEA DINÁMICO
         const currentDomain = window.location.origin;
         const link = `${currentDomain}/drop?type=p2p&connectTo=${socket.id}`;
    
         setSharingLink(link);
      
      // Guardamos la señal para enviarla cuando el receptor entre
      socket.on('requestSignal', (receiverId) => {
        socket.emit('callUser', {
          userToCall: receiverId,
          signalData: data,
          from: socket.id,
          fileName: file.name,
          fileSize: file.size
        });
      });
    });

    peer.on('connect', () => {
      setConnected(true);
      // Envío de metadatos iniciales
      peer.send(JSON.stringify({ name: file.name, size: file.size }));
      
      // Envío del archivo por trozos
      const stream = file.stream();
      const reader = stream.getReader();
      let sentBytes = 0;

      const read = () => {
        reader.read().then(({ done, value }) => {
          if (done) return;
          peer.send(value);
          sentBytes += value.byteLength;
          setProgress(((sentBytes / file.size) * 100).toFixed(1));
          read();
        });
      };
      read();
    });

    peerRef.current = peer;
  };

  // Función para el RECEPTOR: Acepta la conexión
  const acceptIncoming = () => {
    const peer = new SimplePeer({ initiator: false, trickle: false });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: incomingSignal.from });
    });

    let receivedChunks = [];
    let metadata = null;

    peer.on('data', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.name) metadata = msg;
      } catch (e) {
        receivedChunks.push(data);
        const currentProgress = ((receivedChunks.length * 16384) / metadata.size) * 100;
        setProgress(Math.min(currentProgress, 100).toFixed(1));

        if (currentProgress >= 100) {
          const blob = new Blob(receivedChunks);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = metadata.name;
          a.click();
          toast.success("Descarga completa");
        }
      }
    });

    peer.signal(incomingSignal.signalData);
    peerRef.current = peer;
    setConnected(true);
  };

  // Avisar al emisor que hemos entrado (Solo Receptor)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('connectTo');
    if (targetId && socket.id) {
      socket.emit('notifyEntry', targetId);
    }
  }, [socket.id]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 pt-24">
      <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-corporate-lg border border-slate-200 overflow-hidden">
        
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 text-slate-900">
          <div className="flex items-center gap-2 text-[10px] font-black text-accent tracking-[0.2em] uppercase">
            <ShieldCheck size={16} /> Secure Drop P2P
          </div>
          <button onClick={() => window.location.href='/drop'} className="text-slate-400 hover:text-accent flex items-center gap-1 text-[10px] font-bold">
            <RotateCcw size={14} /> REINICIAR
          </button>
        </div>

        <div className="p-10 text-slate-900">
          {/* MODO EMISOR */}
          {isSender && !sharingLink && (
            <div className="space-y-6 animate-in fade-in">
              <label className="border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center cursor-pointer hover:bg-slate-50 transition-all group">
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                <UploadCloud size={48} className="text-accent mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-lg font-bold">{file ? file.name : "Selecciona un archivo"}</span>
                <span className="text-sm text-slate-400">P2P Ilimitado y Seguro</span>
              </label>
              <button onClick={startSharing} className="w-full bg-accent text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20">
                GENERAR ENLACE DE ENVÍO
              </button>
            </div>
          )}

          {/* LINK GENERADO */}
          {sharingLink && !connected && (
            <div className="text-center space-y-6 py-6 animate-in zoom-in">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto border-2 border-blue-100">
                <LinkIcon className="text-accent" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Enlace de Transferencia</h3>
              <div className="bg-slate-900 p-4 rounded-2xl flex items-center gap-2">
                <input readOnly value={sharingLink} className="bg-transparent text-blue-400 font-mono text-xs flex-1 outline-none truncate" />
                <button onClick={() => {navigator.clipboard.writeText(sharingLink); toast.success("Copiado")}} className="bg-accent text-white px-4 py-2 rounded-lg font-bold text-xs">COPIAR</button>
              </div>
              <p className="text-xs text-slate-400">Envía este link. Mantén esta pestaña abierta.</p>
            </div>
          )}

          {/* MODO RECEPTOR: BOTÓN ACEPTAR */}
          {incomingSignal && !connected && (
            <div className="text-center space-y-6 py-6 animate-in bounce-in">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100">
                <Download size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">¿Recibir archivo?</h2>
              <button onClick={acceptIncoming} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                <Zap size={18} fill="currentColor" /> ACEPTAR Y DESCARGAR
              </button>
            </div>
          )}

          {/* TRANSFERENCIA ACTIVA */}
          {connected && (
            <div className="space-y-8 py-6 animate-in fade-in">
              <div className="flex justify-between items-end">
                <p className="text-4xl font-black text-accent">{progress}%</p>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</p>
                    <p className="text-sm font-bold flex items-center gap-2 text-emerald-500">
                        <Activity size={16} className="animate-pulse" /> TRANSFERENCIA ACTIVA
                    </p>
                </div>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Drop;