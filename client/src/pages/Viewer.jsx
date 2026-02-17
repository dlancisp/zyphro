import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { cryptoUtils } from '../utils/crypto';
import { Shield, Lock, Trash2, Terminal, Loader2, ArrowRight, AlertTriangle } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

// --- FONDO DE PARTÍCULAS (Mismo que Home para consistencia) ---
function ParticleGlobe() {
  const ref = useRef();
  const particles = useMemo(() => {
    const temp = new Float32Array(4000 * 3);
    for (let i = 0; i < 4000; i++) {
      const stride = i * 3;
      const phi = Math.acos(-1 + (2 * i) / 4000);
      const theta = Math.sqrt(4000 * Math.PI) * phi;
      temp[stride] = Math.cos(theta) * Math.sin(phi) * 2.5;
      temp[stride + 1] = Math.sin(theta) * Math.sin(phi) * 2.5;
      temp[stride + 2] = Math.cos(phi) * 2.5;
    }
    return temp;
  }, []);
  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.05;
  });
  return (
    <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#2563eb" size={0.02} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} />
    </Points>
  );
}

const Viewer = () => {
  const { fileId } = useParams(); // Obtenemos el ID de la URL /d/:fileId
  const hash = window.location.hash.substring(1); // Obtenemos la clave tras el #
  
  const [status, setStatus] = useState('loading'); // loading, success, error, destroyed
  const [secretContent, setSecretContent] = useState('');
  const [decodingText, setDecodingText] = useState('');
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current || !fileId || !hash) return;
    fetched.current = true;

    const fetchAndDecrypt = async () => {
      try {
        const res = await fetch(`${API_URL}/api/messages/${fileId}`);
        
        if (res.status === 404 || res.status === 410) {
          setStatus('destroyed');
          return;
        }

        const data = await res.json();
        if (!data.content) throw new Error('Datos corruptos');

        try {
          const decrypted = await cryptoUtils.decryptData(data.content, hash);
          const clean = DOMPurify.sanitize(decrypted);
          
          // Simulación de descifrado tipo terminal
          let i = 0;
          const fullText = clean;
          const interval = setInterval(() => {
            setDecodingText(fullText.substring(0, i));
            i++;
            if (i > fullText.length) {
              clearInterval(interval);
              setSecretContent(clean);
              setStatus('success');
            }
          }, 30);

        } catch (err) {
          setStatus('error');
        }
      } catch (e) {
        setStatus('destroyed');
      }
    };

    fetchAndDecrypt();
  }, [fileId, hash]);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans overflow-hidden relative flex flex-col items-center justify-center p-6">
      
      {/* FONDO 3D */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
          <Suspense fallback={null}>
            <ParticleGlobe />
          </Suspense>
        </Canvas>
      </div>

      <nav className="absolute top-0 w-full p-8 flex justify-center z-50">
        <Link to="/" className="text-2xl font-black italic tracking-tighter text-blue-600 uppercase">ZYPHRO</Link>
      </nav>

      <main className="relative z-10 w-full max-w-3xl">
        
        {/* ESTADO: CARGANDO / DESCIFRANDO */}
        {status === 'loading' && (
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-12 text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="relative w-20 h-20 mx-auto mb-8">
                <Loader2 className="text-blue-600 animate-spin w-full h-full" size={48} />
                <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={20} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-widest italic mb-2">Descifrando Nodo</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Protocolo XChaCha20-Poly1305 Activo</p>
          </div>
        )}

        {/* ESTADO: ERROR / DESTRUIDO */}
        {(status === 'destroyed' || status === 'error') && (
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-rose-500/20 rounded-[2.5rem] p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
                <AlertTriangle className="text-rose-500" size={32} />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4">Acceso Denegado</h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 max-w-xs mx-auto">
              {status === 'error' 
                ? 'La clave de descifrado es incorrecta o el enlace está dañado.' 
                : 'Este secreto ha sido purgado permanentemente tras su lectura o expiración.'}
            </p>
            <Link to="/" className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              Volver a Zyphro <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* ESTADO: ÉXITO (MENSAJE DESCIFRADO) */}
        {status === 'success' && (
          <div className="animate-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-full">
                    <Shield size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black tracking-[0.2em] text-emerald-500 uppercase">Verificación Completa</span>
                </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-1 shadow-2xl">
              <div className="bg-black/40 rounded-[2.8rem] p-10 md:p-14 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-transparent opacity-40"></div>
                
                <div className="flex items-center gap-3 mb-10 text-slate-600 font-mono text-[10px] uppercase tracking-[0.3em]">
                    <Terminal size={14} /> <span>Packet_Output:</span>
                </div>

                <div className="font-mono text-lg md:text-xl leading-relaxed text-blue-50 break-words whitespace-pre-wrap">
                  {decodingText}
                  <span className="inline-block w-2 h-5 bg-blue-600 ml-1 animate-pulse"></span>
                </div>

                <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-3 text-rose-500/60 font-black text-[9px] uppercase tracking-[0.2em]">
                        <Trash2 size={14} /> Purgado del servidor
                    </div>
                    <Link to="/" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
                        Enviar mi propio secreto
                    </Link>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="absolute bottom-8 text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] italic">
        Zyphro Secure Relay Node
      </footer>
    </div>
  );
};

export default Viewer;