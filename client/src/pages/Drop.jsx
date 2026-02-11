import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { Copy, UploadCloud, Download, ShieldCheck, Link as LinkIcon, File, Zap, CheckCircle2, Clock, Infinity as InfinityIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const socket = io('http://localhost:3000');

const Drop = () => {
  const [isSender, setIsSender] = useState(true);
  const [file, setFile] = useState(null);
  const [myId, setMyId] = useState('');
  const [peerId, setPeerId] = useState('');
  const [connected, setConnected] = useState(false);
  const [sharingLink, setSharingLink] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [transferMode, setTransferMode] = useState('p2p'); // 'p2p' o 'cloud'
  const peerRef = useRef();

  // --- LÓGICA P2P (Sin cambios) ---
  useEffect(() => {
    socket.on('connect', () => { setMyId(socket.id); });
    socket.on('callUser', (data) => { setIsSender(false); setPeerId(data.from); answerCall(data); });
    socket.on('callAccepted', (signal) => { setConnected(true); toast.success('Túnel seguro establecido'); peerRef.current.signal(signal); });
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('connectTo');
    if (targetId) { setIsSender(false); setPeerId(targetId); }
    
    const preventDefault = (e) => { e.preventDefault(); e.stopPropagation(); };
    window.addEventListener('dragover', preventDefault);
    window.addEventListener('drop', preventDefault);

    return () => { 
        socket.off('callUser'); socket.off('callAccepted'); 
        window.removeEventListener('dragover', preventDefault);
        window.removeEventListener('drop', preventDefault);
    };
  }, []);

  // --- MANEJADORES DE DRAG & DROP ---
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) processFile(e.target.files[0]);
  };

  const processFile = (selectedFile) => {
    setFile(selectedFile); 
    setSharingLink(`${window.location.origin}/drop?connectTo=${myId}`); 
    if (transferMode === 'p2p') {
        startSharingP2P(selectedFile);
    } else {
        toast("Modo servidor 24h próximamente.", { icon: 'ℹ️' });
        startSharingP2P(selectedFile);
    }
  };

  const startSharingP2P = (fileToShare) => {
    const peer = new SimplePeer({ initiator: true, trickle: false, stream: false });
    peer.on('signal', (data) => { /* OK */ });
    peer.on('connect', () => {
      setConnected(true);
      toast.loading('Transferencia iniciada...', { id: 'sending' });
      setTimeout(() => { peer.send(fileToShare); }, 500);
    });
    peerRef.current = peer;
  };

  const answerCall = (data) => {
      const peer = new SimplePeer({ initiator: false, trickle: false });
      peer.on('signal', (signal) => { socket.emit('answerCall', { signal: signal, to: data.from }); });
      peer.on('data', (data) => {
          toast.dismiss('sending'); toast.success('Archivo descargado');
          const blob = new Blob([data]); const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = 'archivo-zyphro'; a.click();
      });
      peer.signal(data.signal); peerRef.current = peer; setConnected(true);
  };

  const copyLink = () => { navigator.clipboard.writeText(sharingLink); toast.success('Link copiado'); };

  // --- ESTILOS VISUALES CORPORATE HACKER (BLANCO/AZUL) ---
  const containerStyle = {
    position: 'fixed',
    top: '70px',
    left: 0, right: 0, bottom: 0,
    // Fondo técnico claro con rejilla azul sutil
    backgroundColor: '#f8fafc', 
    backgroundImage: 'radial-gradient(rgba(37, 99, 235, 0.08) 1px, transparent 1px)',
    backgroundSize: '30px 30px',
    zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    color: '#0f172a' // Texto oscuro
  };

  const cardStyle = {
    width: '100%', maxWidth: '650px',
    backgroundColor: '#ffffff', // Tarjeta blanca pura
    borderRadius: '24px',
    // Borde azul corporativo al arrastrar
    border: isDragging ? '2px dashed #2563eb' : '1px solid #e2e8f0', 
    position: 'relative', overflow: 'hidden', minHeight: '500px',
    display: 'flex', flexDirection: 'column',
    // Sombra técnica azulada
    boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.15), 0 0 20px rgba(37, 99, 235, 0.05) inset',
    transition: 'all 0.3s ease'
  };

  // Color azul corporativo principal
  const accentColor = '#2563eb';

  return (
    <div style={containerStyle}>
      
      {/* TARJETA PRINCIPAL BLANCA */}
      <div 
        style={cardStyle} 
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        className="animate-in fade-in zoom-in duration-300 mx-4"
      >
        
        {/* Header Tarjeta */}
        <div style={{width:'100%', padding:'20px 30px', display:'flex', justifyContent:'space-between', borderBottom:'1px solid #f1f5f9', zIndex:20, backgroundColor:'rgba(255,255,255,0.8)', backdropFilter:'blur(5px)'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px', color:'#475569', fontSize:'13px', fontWeight:'600', letterSpacing:'0.5px', fontFamily:'monospace'}}>
                <ShieldCheck size={16} style={{color: accentColor}} /> ZYPHRO SECURE CORE
            </div>
            {connected && <div style={{background:'#dcfce7', color:'#15803d', padding:'2px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:'bold', border:'1px solid #86efac'}}>CONEXIÓN ACTIVA</div>}
        </div>

        <div style={{flex:1, width:'100%', padding:'40px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', position:'relative', zIndex:10}}>

            {/* --- ESTADO 1: SUBIR (CON SELECTOR DE MODO) --- */}
            {isSender && !file && !connected && (
                <>
                    {/* SELECTOR DE MODO (TABS AZULES/BLANCAS) */}
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-8 border border-slate-200">
                        <button 
                            onClick={() => setTransferMode('p2p')}
                            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${transferMode === 'p2p' ? 'bg-[#2563eb] text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
                        >
                            <InfinityIcon size={16} /> P2P Ilimitado
                        </button>
                        <button 
                            onClick={() => setTransferMode('cloud')}
                            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${transferMode === 'cloud' ? 'bg-[#2563eb] text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
                        >
                            <Clock size={16} /> Guardar 24h
                        </button>
                    </div>

                    <input type="file" id="file" className="hidden" onChange={handleFileSelect} />
                    <label htmlFor="file" style={{cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', width:'100%'}}>
                        {/* Núcleo Técnico Azul */}
                        <div className={`group relative mb-6 transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`} style={{width:'160px', height:'160px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            <div style={{position:'absolute', inset:0, background: isDragging ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.05)', borderRadius:'50%', animation:'pulse 2s infinite'}}></div>
                            <div style={{
                                width:'120px', height:'120px', 
                                background:'#ffffff', 
                                borderRadius:'50%', 
                                display:'flex', alignItems:'center', justifyContent:'center', 
                                border: isDragging ? `2px dashed ${accentColor}` : '2px solid #f1f5f9', 
                                zIndex:2,
                                boxShadow: isDragging ? `0 0 30px rgba(37, 99, 235, 0.3)` : '0 4px 15px rgba(0,0,0,0.05)'
                            }}>
                                <UploadCloud size={48} className={isDragging ? "text-blue-600" : "text-blue-500"} />
                            </div>
                        </div>
                        
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                            {isDragging ? 'Suelta el archivo aquí' : 'Sube tus archivos'}
                        </h2>
                        <p style={{color:'#64748b', fontSize:'16px', maxWidth:'300px', lineHeight:'1.5', fontWeight:'500'}}>
                           {transferMode === 'p2p' 
                                ? <span>Streaming directo. <span style={{color: accentColor, fontWeight:'700'}}>Sin límite de tamaño.</span></span>
                                : <span>Almacenamiento temporal. <span style={{color: accentColor, fontWeight:'700'}}>Hasta 10 GB.</span></span>
                           }
                        </p>
                    </label>
                </>
            )}

            {/* --- ESTADO 2: LINK (LINK AZUL) --- */}
            {isSender && file && !connected && (
                <div style={{width:'100%', maxWidth:'450px'}}>
                    <div style={{width:'80px', height:'80px', margin:'0 auto 24px', background:'#f8fafc', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #e2e8f0'}}>
                        <LinkIcon size={32} style={{color: accentColor}} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Enlace seguro generado</h3>
                    
                    <div style={{background:'#f1f5f9', padding:'6px', borderRadius:'12px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', marginBottom:'20px', boxShadow:'inset 0 2px 4px rgba(0,0,0,0.03)'}}>
                        <input type="text" readOnly value={sharingLink} style={{background:'transparent', border:'none', color:'#334155', flex:1, padding:'12px', outline:'none', fontSize:'14px', fontFamily:'monospace', fontWeight:'600'}} />
                        <button onClick={copyLink} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg">Copiar</button>
                    </div>
                    <div style={{fontSize:'14px', color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', fontWeight:'500', background:'#f8fafc', padding:'8px 16px', borderRadius:'20px', width:'fit-content', margin:'0 auto'}}>
                        <File size={16} style={{color: accentColor}} /> {file.name}
                    </div>
                </div>
            )}

            {/* --- ESTADO 3: RECIBIR (BOTÓN AZUL) --- */}
            {!isSender && !connected && peerId && (
                <div className="animate-in zoom-in">
                     <div style={{width:'120px', height:'120px', margin:'0 auto 24px', background:'#f8fafc', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:`2px solid ${accentColor}`, boxShadow:`0 0 30px rgba(37, 99, 235, 0.15)`}}>
                        <Download size={48} style={{color: accentColor}} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Archivo Entrante</h2>
                    <p className="text-slate-500 mb-10 font-medium">Se ha detectado una transferencia segura entrante.</p>
                    <button onClick={() => answerCall({ from: peerId })} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-blue-600/30 hover:scale-105 transition-all flex items-center gap-3 mx-auto">
                        <Zap size={24} fill="currentColor"/> Aceptar y Descargar
                    </button>
                </div>
            )}

            {/* --- ESTADO 4: TRANSFIRIENDO (FLUJO AZUL) --- */}
            {connected && (
                <div>
                     <div style={{display:'flex', alignItems:'center', gap:'30px', marginBottom:'40px', justifyContent:'center', position:'relative'}}>
                        {/* Emisor */}
                        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px'}}>
                             <div style={{width:'70px', height:'70px', background:'#ffffff', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:`2px solid ${accentColor}`, boxShadow:'0 4px 10px rgba(0,0,0,0.05)'}}><UploadCloud style={{color: accentColor}} size={28}/></div>
                             <span className="text-xs font-extrabold text-blue-600 tracking-wider">ENVIANDO</span>
                        </div>
                        
                        {/* Stream de Datos Azul */}
                        <div style={{width:'140px', height:'6px', background:'#e2e8f0', borderRadius:'6px', overflow:'hidden', position:'relative'}}>
                            <div style={{position:'absolute', top:0, left:0, height:'100%', width:'50%', background:'linear-gradient(90deg, #2563eb, #06b6d4)', animation:'pulse 1s infinite'}}></div>
                        </div>

                        {/* Receptor */}
                        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px'}}>
                            <div style={{width:'70px', height:'70px', background:'#ffffff', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:`2px solid #06b6d4`, boxShadow:'0 4px 10px rgba(0,0,0,0.05)'}}><Download style={{color: '#06b6d4'}} size={28}/></div>
                            <span className="text-xs font-extrabold text-cyan-600 tracking-wider">RECIBIENDO</span>
                        </div>
                     </div>
                     <h3 className="text-3xl font-extrabold text-slate-900 animate-pulse mb-3">Transfiriendo...</h3>
                     <p className="text-slate-500 font-medium">Canal P2P cifrado activo. No cierres la ventana.</p>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default Drop;