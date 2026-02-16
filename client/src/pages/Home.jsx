import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, FileKey, Send, Check, Github } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-hidden"> 
      <div className="max-w-7xl mx-auto px-6 pt-24 lg:pt-32 pb-20 relative">
        
        {/* FONDO LIMPIO: Se han eliminado los elementos flotantes */}

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* CONTENIDO IZQUIERDA */}
          <div className="lg:col-span-6 z-10">
            <div className="flex gap-2 mb-6">
              <span className="bg-accent-light text-accent px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-accent/10">
                <Shield size={14} /> ZERO-KNOWLEDGE
              </span>
              <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                <Zap size={14} /> P2P LIMITLESS
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold text-text-primary mb-6 leading-[1.1] tracking-tight">
              Tu internet más <br />
              <span className="text-accent">ético y privado.</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-text-secondary mb-8 max-w-lg leading-relaxed">
              Zyphro es la alternativa europea segura. Envía archivos sin límites de tamaño con cifrado post-cuántico real.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link to="/drop" className="bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-corporate-lg hover:-translate-y-1">
                <Send size={20} /> Enviar Archivo Ahora
              </Link>
              <button className="bg-white border border-border-light text-text-primary px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all">
                Saber más
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-text-secondary font-medium text-sm">
                <div className="bg-green-100 p-1 rounded-full"><Check className="text-success" size={14} /></div>
                Cifrado XChaCha20-Poly1305.
              </div>
              <div className="flex items-center gap-3 text-text-secondary font-medium text-sm">
                <div className="bg-green-100 p-1 rounded-full"><Check className="text-success" size={14} /></div>
                Código 100% abierto y auditable.
              </div>
            </div>
          </div>

          {/* DASHBOARD DERECHA: El cuadrado grande ahora es el único protagonista */}
          <div className="lg:col-span-6 relative mt-12 lg:mt-0">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-corporate-lg border border-border-light relative z-20 overflow-hidden transition-transform hover:scale-[1.02] duration-500">
               <div className="flex items-center justify-between mb-10">
                 <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-slate-100"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-100"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-100"></div>
                 </div>
                 <div className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase">Secure Transfer Protocol</div>
               </div>

               <div className="space-y-8">
                 <div className="flex items-center gap-5">
                    <div className="bg-accent-light p-4 rounded-2xl">
                        <FileKey className="text-accent" size={32} />
                    </div>
                    <div className="flex-1 space-y-3">
                        <div className="h-2.5 bg-slate-100 rounded-full w-full overflow-hidden relative">
                            <div className="absolute inset-0 bg-accent w-2/3 animate-shimmer"></div>
                        </div>
                        <div className="h-2 bg-slate-50 rounded-full w-1/2"></div>
                    </div>
                 </div>

                 <div className="bg-slate-900 p-6 rounded-2xl font-mono text-xs leading-relaxed shadow-inner">
                    <div className="text-accent flex gap-2"><span>{">"}</span> <span className="text-white opacity-80">sharding_file...</span> <span className="text-success">OK</span></div>
                    <div className="text-accent flex gap-2"><span>{">"}</span> <span className="text-white opacity-80">generating_ephemeral_keys...</span></div>
                    <div className="text-accent flex gap-2"><span>{">"}</span> <span className="text-white opacity-80">cipher:</span> <span className="text-cyan-400">XChaCha20</span></div>
                 </div>

                 <div className="w-full py-4 bg-accent text-white text-center rounded-2xl font-bold tracking-wide shadow-lg shadow-accent/20 animate-pulse">
                    TRANSFERENCIA LISTA
                 </div>
               </div>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-border-light pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20 text-sm">
                <div className="col-span-2">
                    <h2 className="text-3xl font-black text-accent mb-6 tracking-tighter italic">ZYPHRO</h2>
                    <p className="text-text-secondary max-w-xs leading-relaxed font-medium">
                        Construyendo el transporte de datos más seguro del planeta mediante arquitectura de conocimiento cero.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-text-primary mb-6">Producto</h4>
                    <ul className="space-y-4 text-slate-500 font-medium">
                        <li className="hover:text-accent transition-colors"><Link to="/drop">Secure Drop</Link></li>
                        <li className="hover:text-accent transition-colors"><Link to="/switch">Dead Man Switch</Link></li>
                        <li className="hover:text-accent transition-colors">Anon Mail</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-text-primary mb-6">Recursos</h4>
                    <ul className="space-y-4 text-slate-500 font-medium">
                        <li className="hover:text-accent transition-colors">Criptografía</li>
                        <li className="hover:text-accent transition-colors">Auditoría</li>
                        <li className="hover:text-accent transition-colors">Whitepaper</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-text-primary mb-6">Legal</h4>
                    <ul className="space-y-4 text-slate-500 font-medium">
                        <li className="hover:text-accent transition-colors">Privacidad</li>
                        <li className="hover:text-accent transition-colors">Seguridad</li>
                    </ul>
                </div>
            </div>
            
            <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-slate-400 text-xs font-bold">
                    ZYPHRO © 2026. PROTECTED BY XCHACHA20.
                </div>
                <div className="flex gap-6 items-center grayscale opacity-60">
                    <Github size={18} className="cursor-pointer hover:grayscale-0 transition-all" />
                    <div className="font-black italic text-xl text-slate-900 tracking-tighter">reddit</div>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;