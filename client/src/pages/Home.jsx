import React, { Suspense, useRef, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Shield, Send, ArrowRight, Zap, Lock, Globe, ChevronDown, Mail, Skull, Cloud } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

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
    ref.current.rotation.y += delta * 0.08;
    ref.current.rotation.x += delta * 0.03;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#2563eb" size={0.02} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} />
      </Points>
    </group>
  );
}

const Home = () => {
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden font-sans relative">
      
      {/* FONDO 3D */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
          <Suspense fallback={null}>
            <ParticleGlobe />
          </Suspense>
        </Canvas>
      </div>

      {/* --- NAVBAR PREMIUM --- */}
      <nav className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center relative z-[100]">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <span style={{ 
            fontSize: '1.875rem', fontWeight: '900', fontStyle: 'italic', 
            letterSpacing: '-0.05em', textTransform: 'uppercase', color: '#2563eb',
            display: 'inline-block', paddingRight: '0.4em'
          }}>
            ZYPHRO
          </span>
        </Link>

        {/* Links Centrales */}
        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-[10px] font-black tracking-widest uppercase text-white hover:text-blue-500 transition-colors">Home</Link>
          
          {/* Dropdown de Servicios */}
          <div 
            className="relative"
            onMouseEnter={() => setIsServicesOpen(true)}
            onMouseLeave={() => setIsServicesOpen(false)}
          >
            <button className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-all cursor-pointer outline-none">
              Servicios <ChevronDown size={12} className={`transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} />
            </button>

            {isServicesOpen && (
              <div className="absolute top-full -left-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-64 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl">
                  <Link to="/drop" className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group">
                    <div className="bg-blue-600/20 p-2 rounded-lg text-blue-500"><Cloud size={16} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Secure Drop</p>
                      <p className="text-[9px] text-slate-500 font-bold">Vórtice efímero</p>
                    </div>
                  </Link>
                  <Link to="/dashboard" className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all mt-1">
                    <div className="bg-rose-600/20 p-2 rounded-lg text-rose-500"><Skull size={16} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Dead Man Switch</p>
                      <p className="text-[9px] text-slate-500 font-bold">Herencia digital</p>
                    </div>
                  </Link>
                  <Link to="/mail" className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all mt-1">
                    <div className="bg-emerald-600/20 p-2 rounded-lg text-emerald-500"><Mail size={16} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Anon Mail</p>
                      <p className="text-[9px] text-slate-500 font-bold">Correo blindado</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link to="/contact" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-colors">Contact Us</Link>
        </div>

        {/* Acceso Derecha Dinámico */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <Link to="/sign-in" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-all px-4">
              Login
            </Link>
            <Link to="/sign-up" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
              Get Started
            </Link>
          </SignedOut>
          
          <SignedIn>
            <Link to="/dashboard" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-all px-4">
              Dashboard
            </Link>
            <div className="border-l border-white/10 pl-4">
                <UserButton 
                    afterSignOutUrl="/" 
                    appearance={{
                        elements: {
                            userButtonAvatarBox: "w-9 h-9 border border-blue-500/50 shadow-lg shadow-blue-500/10"
                        }
                    }}
                />
            </div>
          </SignedIn>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative z-10 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-10">
          <Shield size={14} className="text-blue-500" />
          <span className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase italic">Vortex Infrastructure v2.5</span>
        </div>

        <h1 className="text-7xl md:text-8xl lg:text-[10rem] font-black tracking-tighter mb-8 leading-[0.8]">
          Internet más <br />
          <span className="text-blue-600 italic">ético y privado.</span>
        </h1>

        <p className="max-w-2xl text-slate-400 text-lg lg:text-xl font-medium mb-12 leading-relaxed">
          La alternativa europea blindada para el transporte de secretos. 
          Seguridad <span className="text-white border-b border-blue-600">XChaCha20</span> de grado militar.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 mb-24">
          <Link to="/drop" className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all shadow-2xl shadow-blue-600/30 flex items-center gap-3 active:scale-95">
            <Send size={20} /> Iniciar Vórtice
          </Link>
          <button className="bg-white/5 backdrop-blur-lg border border-white/10 text-white px-12 py-6 rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:bg-white/10 transition-all flex items-center gap-3">
            Explorar Tecnología <ArrowRight size={20} />
          </button>
        </div>

        {/* FOOTER TERMINAL */}
        <div className="w-full max-w-4xl bg-[#030a1c]/80 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/5 shadow-2xl text-left grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <div className="flex gap-2 mb-6 opacity-20">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">XChaCha20 Vault</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium mt-2">
                Cifrado simétrico de alto rendimiento con autenticación Poly1305.
              </p>
            </div>
            <div className="bg-black/40 p-6 rounded-3xl font-mono text-[11px] text-blue-400 border border-white/5 flex flex-col justify-center">
              <div>{">"} protocol: xchacha20_poly1305</div>
              <div className="text-emerald-500 mt-2 font-bold italic animate-pulse tracking-widest">STATUS: SECURE</div>
            </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex justify-between items-center relative z-10 text-slate-600">
        <span className="text-[9px] font-black tracking-[0.5em] uppercase italic">ZYPHRO SECURITY © 2026</span>
        <div className="flex gap-8 opacity-40">
          <Shield size={16} />
          <Lock size={16} />
          <Globe size={16} />
        </div>
      </footer>
    </div>
  );
};

export default Home;