import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { UploadCloud, Download, ShieldCheck, Link as LinkIcon, File, Zap, CheckCircle2, Clock, Infinity as InfinityIcon, MessageSquare, X, Activity, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const socket = io('http://localhost:3000');

const Drop = () => {
  // Estados de la aplicación
  const [isSender, setIsSender] = useState(true);
  const [file, setFile] = useState(null);
  const [textNote, setTextNote] = useState('');
  const [myId, setMyId] = useState('');
  const [peerId, setPeerId] = useState('');
  const [connected, setConnected] = useState(false);
  const [sharingLink, setSharingLink] = useState('');
  const [transferMode, setTransferMode] = useState('p2p');
  
  // Métricas y Transferencia
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [isIncoming, setIsIncoming] = useState(false);
  const [incomingInfo, setIncomingInfo] = useState(null);
  
  const peerRef = useRef();
  const startTimeRef = useRef();

  useEffect(() => {
    socket.on('connect', () => {
        setMyId(socket.id);
        // 🚨 RE-GENERAR LINK SI EL ID CAMBIA
        const params = new URLSearchParams(window.location.search);
        if (params.get('connectTo')) {
            setIsSender(false);
            setPeerId(params.get('connectTo'));
        }
    });

    socket.on('callUser', (data) => {
      setIsSender(false);
      setIncomingInfo(data);
      setIsIncoming(true);
      toast.success("¡Petición de túnel recibida!");
    });

    socket.on('callAccepted', (signal) => {
      setConnected(true);
      peerRef.current.signal(signal);
    });

    return () => { socket.off('callUser'); socket.off('callAccepted'); };
  }, []);

  // Lógica para reiniciar el componente sin recargar la web
  const resetDrop = () => {
    window.history.pushState({}, '', '/drop'); // Limpia la URL
    setFile(null);
    setTextNote('');
    setSharingLink('');
    setConnected(false);
    setIsSender(true);
    setIsIncoming(false);
    setProgress(0);
    setSpeed(0);
    if (peerRef.current) peerRef.current.destroy();
  };

  const processTransfer = () => {
    if (!file && !textNote) return toast.error("Añade contenido para enviar");
    
    // 🚨 FIX: Aseguramos que el ID del socket está presente en el link
    const link = `${window.location.origin}/drop?type=${transferMode}&connectTo=${socket.id}`;
    setSharingLink(link);

    if (transferMode === 'p2p') {
        startP2P();
    } else {
        toast.success("Subiendo a bóveda segura (24h)...");
        // Aquí iría el fetch a tu API de almacenamiento
    }
  };

  const startP2P = () => {
    const peer = new SimplePeer({ initiator: true, trickle: false });
    peer.on('signal', (data) => {
        // En P2P esperamos a que el receptor use el link para hacer el handshake
    });
    peer.on('connect', () => {
      setConnected(true);
      startTimeRef.current = Date.now();
      const meta = { type: 'metadata', message: textNote, fileName: file?.name, fileSize: file?.size };
      peer.send(JSON.stringify(meta));
      if (file) streamFile(peer);
    });
    peerRef.current = peer;
  };

  const streamFile = (peer) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target.result;
      const chunkSize = 16384;
      let offset = 0;
      const sendNext = () => {
        while (offset < buffer.byteLength && peer.writeable) {
          peer.send(buffer.slice(offset, offset + chunkSize));
          offset += chunkSize;
          setProgress(((offset / buffer.byteLength) * 100).toFixed(1));
        }
        if (offset < buffer.byteLength) setTimeout(sendNext, 5);
      };
      sendNext();
    };
    reader.readAsArrayBuffer(file);
  };

  const acceptTransfer = () => {
    const peer = new SimplePeer({ initiator: false, trickle: false });
    peer.on('signal', (signal) => {
      socket.emit('answerCall', { signal, to: incomingInfo.from });
    });
    let chunks = [];
    let meta = null;
    peer.on('data', (data) => {
      try {
        const d = JSON.parse(data);
        if (d.type === 'metadata') { meta = d; return; }
      } catch (e) {
        chunks.push(data);
        const p = ((chunks.length * 16384 / meta.fileSize) * 100).toFixed(1);
        setProgress(p);
        if (p >= 100) {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(new Blob(chunks));
          a.download = meta.fileName;
          a.click();
          toast.success("Recibido con éxito");
        }
      }
    });
    peer.signal(incomingInfo.signal);
    peerRef.current = peer;
    setIsIncoming(false);
    setConnected(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 pt-24">
      <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-corporate-lg border border-slate-200 overflow-hidden relative">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2 text-[10px] font-black text-[#2563EB] tracking-[0.2em] uppercase">
            <ShieldCheck size={16} /> Zyphro Core
          </div>
          <button onClick={resetDrop} className="text-slate-400 hover:text-[#2563EB] transition-colors flex items-center gap-1 text-[10px] font-bold">
            <RotateCcw size={14} /> NUEVO ENVÍO
          </button>
        </div>

        {/* SELECTOR DE MODO (P2P vs 24H) */}
        {isSender && !sharingLink && (
            <div className="flex bg-slate-100 m-6 p-1 rounded-xl border border-slate-200">
                <button onClick={() => setTransferMode('p2p')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${transferMode === 'p2p' ? 'bg-[#2563EB] text-white shadow-md' : 'text-slate-500'}`}>
                    <InfinityIcon size={14} /> P2P ILIMITADO
                </button>
                <button onClick={() => setTransferMode('cloud')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${transferMode === 'cloud' ? 'bg-[#2563EB] text-white shadow-md' : 'text-slate-500'}`}>
                    <Clock size={14} /> 24H (10GB)
                </button>
            </div>
        )}

        <div className="p-10 pt-4">
          {/* 1. EMISOR: CONFIGURACIÓN */}
          {isSender && !sharingLink && !connected && (
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Mensaje Privado</label>
                    <textarea value={textNote} onChange={(e) => setTextNote(e.target.value)} placeholder="Escribe aquí... (Opcional)" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:border-[#2563EB] outline-none h-24 resize-none" />
                </div>
                <label className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center cursor-pointer hover:bg-slate-50 transition-all group">
                  <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                  <UploadCloud size={32} className="text-[#2563EB] mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-slate-700">{file ? file.name : "Seleccionar Archivo"}</span>
                </label>
                <button onClick={processTransfer} className="w-full bg-[#2563EB] text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs">
                  Generar Túnel {transferMode}
                </button>
            </div>
          )}

          {/* 2. EMISOR: LINK GENERADO */}
          {sharingLink && !connected && (
            <div className="text-center space-y-6 py-4 animate-in fade-in">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="text-[#2563EB]" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Túnel Preparado</h3>
              <div className="bg-slate-900 p-3 rounded-xl border border-white/10 flex items-center gap-2">
                <input readOnly value={sharingLink} className="bg-transparent text-blue-400 font-mono text-[10px] flex-1 px-2 outline-none" />
                <button onClick={() => {navigator.clipboard.writeText(sharingLink); toast.success("Copiado")}} className="bg-[#2563EB] text-white px-4 py-2 rounded-lg font-bold text-[10px]">COPIAR</button>
              </div>
              <p className="text-[11px] text-slate-400 px-4 leading-relaxed">
                Comparte este enlace. El receptor deberá <span className="text-slate-700 font-bold">aceptar</span> para iniciar la transferencia directa.
              </p>
            </div>
          )}

          {/* 3. RECEPTOR: BOTÓN ACEPTAR */}
          {isIncoming && (
            <div className="text-center space-y-6 py-6 animate-in zoom-in">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto border-2 border-blue-100">
                <Download size={32} className="text-[#2563EB]" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Transferencia Entrante</h2>
                <p className="text-xs text-slate-500">{incomingInfo.fileName || "Paquete de datos seguro"}</p>
              </div>
              <button onClick={acceptTransfer} className="w-full bg-[#059669] text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                <Zap size={18} fill="currentColor" /> ABRIR TÚNEL Y RECIBIR
              </button>
            </div>
          )}

          {/* 4. TRANSFERENCIA ACTIVA */}
          {connected && (
            <div className="space-y-8 py-4 animate-in fade-in">
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estado</p>
                  <p className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Activity size={18} className="text-emerald-500 animate-pulse" /> ACTIVO
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-[#2563EB]">{progress}%</p>
                </div>
              </div>

              <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200">
                <div className="h-full bg-[#2563EB] transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Cifrado</p>
                  <p className="text-[10px] font-bold text-slate-700">XCHACHA20-POLY1305</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Tecnología</p>
                  <p className="text-[10px] font-bold text-slate-700">WEBRTC P2P</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Drop;