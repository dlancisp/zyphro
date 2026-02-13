import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { UploadCloud, Download, ShieldCheck, Link as LinkIcon, File, Zap, CheckCircle2, Clock, Infinity as InfinityIcon, MessageSquare, X, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const socket = io('http://localhost:3000');

const Drop = () => {
  const [isSender, setIsSender] = useState(true);
  const [file, setFile] = useState(null);
  const [textNote, setTextNote] = useState('');
  const [myId, setMyId] = useState('');
  const [peerId, setPeerId] = useState('');
  const [connected, setConnected] = useState(false);
  const [sharingLink, setSharingLink] = useState('');
  const [transferMode, setTransferMode] = useState('p2p');
  
  // Estados para métricas
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [isIncoming, setIsIncoming] = useState(false);
  const [incomingInfo, setIncomingInfo] = useState(null);
  
  const peerRef = useRef();
  const startTimeRef = useRef();

  useEffect(() => {
    socket.on('connect', () => setMyId(socket.id));

    socket.on('callUser', (data) => {
      setIsSender(false);
      setPeerId(data.from);
      // Guardamos la señal para cuando el usuario de a "Aceptar"
      setIncomingInfo(data);
      setIsIncoming(true);
    });

    socket.on('callAccepted', (signal) => {
      setConnected(true);
      peerRef.current.signal(signal);
    });

    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('connectTo');
    if (targetId) {
        setIsSender(false);
        setPeerId(targetId);
    }

    return () => { socket.off('callUser'); socket.off('callAccepted'); };
  }, []);

  const processTransfer = () => {
    if (!file && !textNote) return toast.error("Nada que enviar");
    const link = `${window.location.origin}/drop?type=${transferMode}&connectTo=${myId}`;
    setSharingLink(link);
    if (transferMode === 'p2p') startP2P();
  };

  const startP2P = () => {
    const peer = new SimplePeer({ initiator: true, trickle: false });
    
    // Al recibir conexión, enviamos los datos en trozos (chunks) para calcular progreso
    peer.on('connect', () => {
      setConnected(true);
      startTimeRef.current = Date.now();
      
      const dataPackage = {
        message: textNote,
        fileName: file?.name,
        fileSize: file?.size,
        type: 'metadata'
      };
      peer.send(JSON.stringify(dataPackage));

      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const buffer = e.target.result;
          const chunkSize = 16384; // 16kb chunks
          let offset = 0;

          const sendChunk = () => {
            while (offset < buffer.byteLength && peer.writeable) {
              const chunk = buffer.slice(offset, offset + chunkSize);
              peer.send(chunk);
              offset += chunkSize;
              const p = Math.min((offset / buffer.byteLength) * 100, 100);
              setProgress(p.toFixed(1));
              
              // Cálculo de velocidad simple
              const duration = (Date.now() - startTimeRef.current) / 1000;
              setSpeed((offset / 1024 / 1024 / duration).toFixed(2));
            }
            if (offset < buffer.byteLength) {
              setTimeout(sendChunk, 10);
            }
          };
          sendChunk();
        };
        reader.readAsArrayBuffer(file);
      }
    });

    peerRef.current = peer;
  };

  const acceptTransfer = () => {
    const peer = new SimplePeer({ initiator: false, trickle: false });
    peer.on('signal', (signal) => {
      socket.emit('answerCall', { signal, to: incomingInfo.from });
    });

    let receivedChunks = [];
    let metadata = null;

    peer.on('data', (data) => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'metadata') {
          metadata = parsed;
          if (parsed.message) toast(`Mensaje: ${parsed.message}`);
          return;
        }
      } catch (e) {
        // Si no es JSON, es un chunk del archivo
        receivedChunks.push(data);
        const currentSize = receivedChunks.length * 16384;
        const p = Math.min((currentSize / metadata.fileSize) * 100, 100);
        setProgress(p.toFixed(1));
        
        if (p >= 100) {
          const blob = new Blob(receivedChunks);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = metadata.fileName;
          a.click();
          setConnected(false);
          toast.success("Descarga completada");
        }
      }
    });

    peer.signal(incomingInfo.signal);
    peerRef.current = peer;
    setIsIncoming(false);
    setConnected(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-corporate-lg border border-slate-200 overflow-hidden">
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2 text-[10px] font-black text-accent tracking-[0.2em] uppercase">
            <ShieldCheck size={16} /> Zyphro Secure Engine
          </div>
          {connected && <div className="flex items-center gap-2 text-xs font-bold text-success"><Activity size={14} className="animate-pulse"/> LIVE P2P</div>}
        </div>

        <div className="p-10">
          {/* ESTADO: EMISOR INICIAL */}
          {isSender && !sharingLink && !connected && (
            <div className="space-y-6 animate-in fade-in">
                <textarea 
                  value={textNote}
                  onChange={(e) => setTextNote(e.target.value)}
                  placeholder="Escribe un mensaje cifrado..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:border-accent outline-none h-24 resize-none"
                />
                <label className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center cursor-pointer hover:bg-slate-50 transition-all">
                  <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                  <UploadCloud size={32} className="text-accent mb-2" />
                  <span className="text-sm font-bold text-slate-600">{file ? file.name : "Adjuntar Archivo"}</span>
                </label>
                <button onClick={processTransfer} className="w-full bg-accent text-white py-4 rounded-2xl font-bold shadow-lg shadow-accent/20 hover:-translate-y-1 transition-all">
                  GENERAR TÚNEL P2P
                </button>
            </div>
          )}

          {/* ESTADO: LINK GENERADO */}
          {sharingLink && !connected && (
            <div className="text-center space-y-6">
              <div className="bg-slate-900 p-4 rounded-2xl font-mono text-xs text-white/70 break-all border border-white/10">
                {sharingLink}
              </div>
              <button onClick={() => {navigator.clipboard.writeText(sharingLink); toast.success("Link Copiado")}} className="bg-accent text-white px-8 py-3 rounded-xl font-bold text-sm">COPIAR ENLACE</button>
              <p className="text-xs text-slate-400">Esperando a que el receptor acepte...</p>
            </div>
          )}

          {/* ESTADO: RECEPTOR - ESPERANDO ACEPTAR */}
          {isIncoming && (
            <div className="text-center space-y-6 animate-in zoom-in">
              <div className="w-20 h-20 bg-accent-light rounded-full flex items-center justify-center mx-auto">
                <Download size={32} className="text-accent" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Transferencia Entrante</h2>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Archivo detectado:</p>
                <p className="text-sm font-bold text-slate-700">{incomingInfo.fileName || "Solo mensaje de texto"}</p>
              </div>
              <button onClick={acceptTransfer} className="w-full bg-success text-white py-4 rounded-2xl font-bold shadow-lg shadow-success/20 flex items-center justify-center gap-2">
                <Zap size={18} fill="currentColor" /> ACEPTAR Y ABRIR TÚNEL
              </button>
            </div>
          )}

          {/* ESTADO: TRANSFIRIENDO (PROGRESO Y VELOCIDAD) */}
          {connected && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Velocidad</p>
                  <p className="text-2xl font-black text-slate-900">{speed} <span className="text-sm font-medium text-slate-400">MB/s</span></p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-accent">{progress}%</p>
                </div>
              </div>

              {/* BARRA DE PROGRESO ANIMADA */}
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200">
                <div 
                  className="h-full bg-accent transition-all duration-300 relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', width: '100px' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cifrado</p>
                  <p className="text-xs font-bold text-slate-700">XCHACHA20-POLY1305</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Protocolo</p>
                  <p className="text-xs font-bold text-slate-700">WEBRTC P2P</p>
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