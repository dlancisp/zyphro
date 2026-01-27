import { useState } from 'react';
import { 
    Shield, Send, Lock, LayoutDashboard, 
    Copy, ChevronRight, CheckCircle2, 
    Activity, Search, Bell, Key, FileText, AlertTriangle, User, Settings, LogOut, Menu
} from 'lucide-react';

// --- PANTALLA 1: DASHBOARD (Resumen) ---
const DashboardHome = ({ changeTab }) => {
    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex justify-between items-end border-b border-border-light pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">Panel de Control</h2>
                    <p className="text-text-secondary mt-1 flex items-center gap-2 font-medium">
                        Estado del sistema: 
                        <span className="text-success bg-success/10 px-2.5 py-0.5 rounded-full text-xs font-bold border border-success/20 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>OPTIMAL
                        </span>
                    </p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-sm text-text-secondary font-medium">Última sincronización</p>
                    <p className="text-text-primary font-mono text-sm font-bold">Hoy, 14:30 PM</p>
                </div>
            </div>

            {/* Las 3 Tarjetas Maestras */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. IDENTITY CARD */}
                <div onClick={() => changeTab('identity')} className="card-panel p-6 relative overflow-hidden group cursor-pointer hover:border-accent/30">
                    <div className="absolute top-0 right-0 p-4 text-accent opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500">
                        <Shield size={120} />
                    </div>
                    <div className="flex items-center gap-4 mb-6 relative">
                        <div className="p-3 bg-accent-light rounded-xl text-accent group-hover:bg-accent group-hover:text-white transition-colors shadow-sm"><Shield size={24}/></div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary">Identity Mask</h3>
                            <p className="text-xs text-text-secondary font-medium">Protección de Email</p>
                        </div>
                    </div>
                    <div className="space-y-3 relative">
                        <div className="flex justify-between text-sm py-2 border-b border-border-light">
                            <span className="text-text-secondary font-medium">Máscaras Activas</span>
                            <span className="text-text-primary font-mono font-bold text-base">2</span>
                        </div>
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-text-secondary font-medium">Spam Bloqueado</span>
                            <span className="text-success font-mono font-bold text-base">142</span>
                        </div>
                    </div>
                </div>

                {/* 2. DROP CARD */}
                <div onClick={() => changeTab('drop')} className="card-panel p-6 relative overflow-hidden group cursor-pointer hover:border-text-primary/30">
                    <div className="absolute top-0 right-0 p-4 text-text-primary opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500">
                        <Send size={120} />
                    </div>
                    <div className="flex items-center gap-4 mb-6 relative">
                        <div className="p-3 bg-gray-100 rounded-xl text-text-primary group-hover:bg-text-primary group-hover:text-white transition-colors shadow-sm"><Send size={24}/></div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary">Secure Drop</h3>
                            <p className="text-xs text-text-secondary font-medium">Transferencia Efímera</p>
                        </div>
                    </div>
                     <div className="space-y-3 relative">
                        <div className="flex justify-between text-sm py-2 border-b border-border-light">
                            <span className="text-text-secondary font-medium">Enlaces Activos</span>
                            <span className="text-text-primary font-mono font-bold text-base">0</span>
                        </div>
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-text-secondary font-medium">Expirados Hoy</span>
                            <span className="text-text-secondary font-mono font-bold text-base">3</span>
                        </div>
                    </div>
                </div>

                {/* 3. VAULT CARD */}
                <div onClick={() => changeTab('vault')} className="card-panel p-6 relative overflow-hidden group cursor-pointer hover:border-warning/30">
                    <div className="absolute top-0 right-0 p-4 text-warning opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500">
                        <Lock size={120} />
                    </div>
                    <div className="flex items-center gap-4 mb-6 relative">
                        <div className="p-3 bg-warning/10 rounded-xl text-warning group-hover:bg-warning group-hover:text-white transition-colors shadow-sm"><Lock size={24}/></div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary">Digital Vault</h3>
                            <p className="text-xs text-text-secondary font-medium">Herencia Digital</p>
                        </div>
                    </div>
                     <div className="space-y-3 relative">
                        <div className="flex justify-between text-sm py-2 border-b border-border-light">
                            <span className="text-text-secondary font-medium">Activos Protegidos</span>
                            <span className="text-text-primary font-mono font-bold text-base">4</span>
                        </div>
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-text-secondary font-medium">Dead Man Switch</span>
                            <span className="text-success font-bold text-[10px] bg-success/10 px-2 py-0.5 rounded-full border border-success/20 uppercase tracking-wide">ARMED</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs de Actividad */}
            <div className="card-panel p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                        <Activity size={16} className="text-accent"/> Actividad Reciente
                    </h3>
                    <button className="text-sm font-medium text-accent hover:text-accent-dark transition-colors">Ver historial completo</button>
                </div>
                <div className="space-y-2">
                    {[
                        { text: 'Activo en Vault "Semilla Ledger" actualizado', time: '10:42 AM', icon: Lock, color: 'text-warning', bg: 'bg-warning/10' },
                        { text: 'Nueva Identidad "Amazon Compras" creada', time: 'Ayer, 18:20', icon: Shield, color: 'text-accent', bg: 'bg-accent-light' },
                        { text: 'Enlace Secure Drop expirado (Auto-destrucción)', time: 'Ayer, 14:15', icon: Send, color: 'text-text-secondary', bg: 'bg-gray-100' },
                        { text: 'Intento de acceso bloqueado (IP: Rusia)', time: 'Ayer, 03:00', icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 py-3 border-b border-border-light last:border-0 hover:bg-bg-hover px-4 -mx-4 transition-colors rounded-lg group">
                            <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                                <item.icon size={16} />
                            </div>
                            <div className="flex-1 text-sm text-text-primary font-medium">{item.text}</div>
                            <div className="text-xs text-text-secondary font-mono">{item.time}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- MODULO 1: IDENTITY ---
const IdentityScreen = () => {
    return (
        <div className="p-8 h-full flex flex-col items-center justify-start animate-in slide-in-from-right duration-300 max-w-5xl mx-auto">
            <div className="w-full">
                 <div className="mb-8 flex justify-between items-end border-b border-border-light pb-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-text-primary">Identity Masking</h2>
                        <p className="text-text-secondary mt-1 font-medium">Utiliza alias para mantener tu email real privado.</p>
                    </div>
                    <button className="bg-accent hover:bg-accent-dark text-white px-6 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-lg">
                        <Shield size={18} /> Crear Nuevo Alias
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Active Card */}
                    <div className="card-panel p-6 border-l-[6px] border-l-accent flex items-center gap-6 group hover:shadow-md transition-all">
                        <div className="bg-accent-light p-4 rounded-full text-accent group-hover:scale-105 transition-transform shadow-sm">
                            <Shield size={28} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-text-primary text-xl">Compras Online</h3>
                                <span className="bg-success/10 text-success text-xs px-2.5 py-0.5 rounded-full border border-success/20 font-bold tracking-wide flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-success"></div>ACTIVO
                                </span>
                            </div>
                            <div className="font-mono text-text-primary text-sm flex items-center gap-3 bg-bg-hover w-fit px-3 py-1.5 rounded-md border border-border-light">
                                compras.k29@zyph.es <Copy size={14} className="cursor-pointer text-text-secondary hover:text-accent transition-colors"/>
                            </div>
                        </div>
                        <div className="text-right border-l border-border-light pl-8">
                            <div className="text-3xl font-extrabold text-text-primary">12</div>
                            <div className="text-xs text-text-secondary font-bold uppercase">Reenviados</div>
                        </div>
                    </div>

                    {/* Blocked Card */}
                    <div className="card-panel p-6 border-l-[6px] border-l-danger bg-danger/5 flex items-center gap-6 opacity-80 hover:opacity-100 transition-all hover:shadow-md">
                        <div className="bg-danger/10 p-4 rounded-full text-danger shadow-sm">
                            <AlertTriangle size={28} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-text-primary text-xl">Newsletter Antigua</h3>
                                <span className="bg-danger/10 text-danger text-xs px-2.5 py-0.5 rounded-full border border-danger/20 font-bold tracking-wide">BLOQUEADO</span>
                            </div>
                            <div className="font-mono text-text-secondary text-sm decoration-slate-400 line-through bg-white/50 w-fit px-3 py-1.5 rounded-md border border-border-light">
                                news.x99@zyph.es
                            </div>
                        </div>
                        <div className="text-right border-l border-border-light pl-8">
                            <div className="text-3xl font-extrabold text-danger">99+</div>
                            <div className="text-xs text-text-secondary font-bold uppercase">Bloqueados</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MODULO 2: DROP ---
const DropScreen = () => {
    const [status, setStatus] = useState('idle');

    const handleEncrypt = () => {
        setStatus('processing');
        setTimeout(() => setStatus('done'), 1500);
    };

    return (
        <div className="p-8 h-full flex flex-col justify-center items-center animate-in slide-in-from-right duration-300">
            <div className="w-full max-w-2xl text-center">
                
                {status === 'idle' && (
                    <div className="card-panel overflow-hidden shadow-xl">
                        <div className="bg-white p-8 border-b border-border-light">
                            <div className="w-16 h-16 bg-accent-light text-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <Send size={32} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-text-primary">Secure Transfer</h2>
                            <p className="text-text-secondary font-medium mt-2">Cifrado punto a punto. Los datos se destruyen tras su lectura.</p>
                        </div>
                        
                        <div className="p-6 bg-bg-main">
                            <textarea 
                                className="w-full h-48 bg-white border border-border-light rounded-xl p-6 text-text-primary outline-none resize-none font-mono text-sm placeholder-text-secondary focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
                                placeholder="Pega aquí contraseñas, claves privadas o mensajes confidenciales..."
                                autoFocus
                            ></textarea>
                        </div>

                        <div className="p-6 bg-white border-t border-border-light flex justify-between items-center">
                            <div className="flex gap-4 text-xs text-text-secondary font-bold uppercase tracking-wider">
                                <span className="flex items-center gap-1.5"><Activity size={14} className="text-accent"/> Quema al leer</span>
                                <span className="flex items-center gap-1.5"><Activity size={14} className="text-accent"/> Expira: 1 Hora</span>
                            </div>
                            <button onClick={handleEncrypt} className="bg-text-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-md flex items-center gap-2">
                                <Lock size={16}/> Encriptar y Generar Link
                            </button>
                        </div>
                    </div>
                )}

                {status === 'processing' && (
                     <div className="flex flex-col items-center p-12 card-panel">
                        <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-6"></div>
                        <p className="text-text-primary font-bold font-mono animate-pulse">GENERANDO LLAVES AES-256...</p>
                     </div>
                )}

                {status === 'done' && (
                    <div className="card-panel p-10 text-center max-w-lg mx-auto border-accent/30 shadow-xl">
                        <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-md">
                            <CheckCircle2 size={40} strokeWidth={3} />
                        </div>
                        <h3 className="text-2xl font-extrabold text-text-primary mb-2">Enlace Seguro Listo</h3>
                        <p className="text-text-secondary font-medium mb-8">Copia este enlace. Solo funcionará una única vez.</p>
                        
                        <div className="bg-bg-hover border border-border-light p-4 rounded-xl flex items-center gap-4 mb-8 shadow-inner">
                            <code className="flex-1 text-left text-accent font-mono text-sm font-bold truncate">
                                https://zyph.es/s/k8j2-x9...
                            </code>
                            <button className="p-2 bg-white rounded-md text-text-secondary hover:text-accent border border-border-light shadow-sm transition-all hover:scale-105 active:scale-95">
                                <Copy size={18} />
                            </button>
                        </div>
                        <button onClick={() => setStatus('idle')} className="text-sm text-text-secondary font-bold hover:text-accent underline decoration-2 underline-offset-4 transition-colors">
                            Enviar otro secreto
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

// --- MODULO 3: VAULT ---
const VaultScreen = () => {
    return (
        <div className="p-8 h-full flex flex-col items-center justify-start animate-in slide-in-from-right duration-300 max-w-6xl mx-auto">
             <div className="w-full">
                <div className="mb-8 flex justify-between items-end border-b border-border-light pb-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-text-primary">Digital Vault</h2>
                        <p className="text-text-secondary mt-1 font-medium">Almacenamiento permanente con protocolo de herencia.</p>
                    </div>
                     <button className="bg-warning text-white hover:bg-warning/90 px-6 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-lg">
                        <Lock size={18} /> Añadir Activo
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Lista de Activos */}
                    <div className="card-panel overflow-hidden h-fit">
                        <div className="p-4 border-b border-border-light bg-bg-main/50 font-bold text-xs text-text-secondary uppercase tracking-wider">Activos Protegidos</div>
                        <div className="divide-y divide-border-light">
                            {[
                                { name: 'Frase Semilla Ledger (24 palabras)', type: 'Text', date: 'Actualizado hace 2 meses' },
                                { name: 'Escrituras Casa Madrid', type: 'PDF', date: 'Actualizado hace 1 año' },
                                { name: 'Backup Contraseña Maestra', type: 'Key', date: 'Actualizado ayer' },
                                { name: 'Testamento Digital', type: 'PDF', date: 'Actualizado hace 6 meses' },
                            ].map((item, i) => (
                                <div key={i} className="p-4 flex items-center gap-4 hover:bg-bg-hover cursor-pointer transition-colors group">
                                    <div className="bg-white p-3 rounded-lg text-text-secondary group-hover:text-accent border border-border-light shadow-sm">
                                        {item.type === 'Text' && <FileText size={20}/>}
                                        {item.type === 'PDF' && <FileText size={20}/>}
                                        {item.type === 'Key' && <Key size={20}/>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-text-primary font-bold group-hover:text-accent transition-colors">{item.name}</div>
                                        <div className="text-xs text-text-secondary font-medium mt-0.5">{item.date}</div>
                                    </div>
                                    <ChevronRight size={16} className="text-text-secondary group-hover:text-accent" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dead Man Switch Status */}
                    <div className="space-y-6">
                        <div className="card-panel p-8 border-warning/30 bg-gradient-to-br from-white to-warning/5 relative overflow-hidden shadow-lg">
                            <div className="absolute -top-6 -right-6 p-8 text-warning opacity-[0.05] pointer-events-none">
                                <Activity size={180} />
                            </div>
                            
                            <h3 className="text-warning font-extrabold mb-3 flex items-center gap-2 text-xl">
                                <Activity size={24}/> Dead Man's Switch
                            </h3>
                            <p className="text-sm text-text-secondary mb-8 leading-relaxed font-medium">
                                Protocolo de Herencia Activo. Si no detectamos actividad durante <span className="text-text-primary font-extrabold">30 días</span>, se enviará el acceso a tu beneficiario.
                            </p>
                            
                            <div className="space-y-6 relative bg-white/60 p-6 rounded-xl border border-warning/10 backdrop-blur-sm">
                                <div>
                                    <div className="flex justify-between text-xs text-text-secondary mb-2 font-bold uppercase tracking-wider">
                                        <span>Estado del Pulso (Heartbeat)</span>
                                        <span className="text-success flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-success animate-pulse"></div> VIVO</span>
                                    </div>
                                    <div className="h-3 w-full bg-bg-main rounded-full overflow-hidden border border-border-light shadow-inner">
                                        <div className="h-full bg-success w-[95%] shadow-[0_0_10px_rgba(16,185,129,0.3)] relative">
                                            <div className="absolute right-0 top-0 h-full w-1 bg-white/30 animate-ping"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-2 text-[10px] text-text-secondary font-mono font-bold">
                                        <span>Último login: Hoy, 14:30</span>
                                        <span>Trigger: 30 días</span>
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-white rounded-lg border border-border-light flex items-center gap-4 shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-text-secondary font-bold text-sm border-2 border-white shadow-sm">JD</div>
                                    <div className="flex-1">
                                        <div className="text-xs text-text-secondary uppercase font-bold tracking-wider">Beneficiario</div>
                                        <div className="text-sm text-text-primary font-bold">juan.doe@gmail.com</div>
                                    </div>
                                    <button className="text-xs text-accent font-bold hover:underline px-3 py-1.5 bg-accent-light/50 rounded-md transition-colors">Editar</button>
                                </div>

                                <button className="w-full py-3 bg-text-primary text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-all shadow-md flex justify-center items-center gap-2">
                                    <Settings size={16}/> Configurar Tiempos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
};

// --- APP PRINCIPAL (LAYOUT) ---
export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard'); 
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-bg-main text-text-primary overflow-hidden font-sans selection:bg-accent/20 selection:text-accent-dark">
            
            {/* SIDEBAR (Responsive) */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-72 bg-bg-sidebar border-r border-border-light flex flex-col transition-transform transform md:relative md:translate-x-0 shadow-corporate-lg ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                {/* LOGO CORPORATIVO AZUL/BLANCO */}
                <div className="p-6 flex items-center gap-3 mb-4 border-b border-border-light/50">
                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center overflow-hidden relative shadow-md">
                        {/* Z blanca sobre fondo azul */}
                        <span className="font-black text-3xl text-white leading-none relative z-10">Z</span>
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-text-primary">ZYPH<span className="text-accent">.es</span></span>
                </div>

                <nav className="flex-1 px-3 space-y-1.5 py-4">
                    <button 
                        onClick={() => {setActiveTab('dashboard'); setSidebarOpen(false);}}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all group ${activeTab === 'dashboard' ? 'bg-accent text-white shadow-md' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
                    >
                        <LayoutDashboard size={20} className={activeTab === 'dashboard' ? 'text-white' : 'text-text-secondary group-hover:text-accent transition-colors'} /> 
                        Dashboard
                    </button>
                    
                    <div className="pt-6 pb-3 px-4 text-[11px] font-extrabold text-text-secondary uppercase tracking-widest">Servicios</div>

                    <button 
                        onClick={() => {setActiveTab('identity'); setSidebarOpen(false);}}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all group ${activeTab === 'identity' ? 'bg-accent-light text-accent' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
                    >
                        <Shield size={20} className={activeTab === 'identity' ? 'text-accent' : 'text-text-secondary group-hover:text-accent transition-colors'} /> 
                        Identity Mask
                    </button>
                    <button 
                        onClick={() => {setActiveTab('drop'); setSidebarOpen(false);}}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all group ${activeTab === 'drop' ? 'bg-gray-200 text-text-primary' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
                    >
                        <Send size={20} className={activeTab === 'drop' ? 'text-text-primary' : 'text-text-secondary group-hover:text-accent transition-colors'} /> 
                        Secure Drop
                    </button>
                    <button 
                        onClick={() => {setActiveTab('vault'); setSidebarOpen(false);}}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all group ${activeTab === 'vault' ? 'bg-warning/20 text-warning' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
                    >
                        <Lock size={20} className={activeTab === 'vault' ? 'text-warning' : 'text-text-secondary group-hover:text-accent transition-colors'} /> 
                        Digital Vault
                    </button>
                </nav>

                <div className="p-4 border-t border-border-light bg-bg-main/50">
                    <button className="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-white cursor-pointer transition-all group text-left border border-transparent hover:border-border-light hover:shadow-sm">
                        <div className="w-9 h-9 rounded-full bg-white border-2 border-accent flex items-center justify-center text-accent font-bold text-xs shadow-sm">JD</div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-bold text-text-primary truncate group-hover:text-accent transition-colors">John Doe</div>
                            <div className="text-xs text-text-secondary truncate font-medium">Plan PRO Empresa</div>
                        </div>
                        <Settings size={18} className="text-text-secondary group-hover:text-accent transition-colors"/>
                    </button>
                </div>
            </aside>

            {/* Overlay para móvil */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-20 bg-text-primary/50 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
            )}

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-bg-main">
                
                {/* Header Superior Limpio */}
                <header className="h-16 border-b border-border-light flex justify-between items-center px-4 md:px-8 bg-white/80 backdrop-blur-md z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-text-secondary hover:text-text-primary" onClick={() => setSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        {/* Buscador Global */}
                        <div className="hidden md:flex items-center gap-3 text-text-secondary bg-bg-main px-4 py-2 rounded-lg border border-border-light w-96 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all shadow-sm">
                            <Search size={16} />
                            <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-sm text-text-primary w-full placeholder-text-secondary font-medium"/>
                            <span className="text-xs bg-white px-1.5 py-0.5 rounded text-text-secondary border border-border-light font-bold shadow-sm">⌘K</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="text-text-secondary hover:text-accent relative p-2 rounded-full hover:bg-bg-hover transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-6 w-[1px] bg-border-light hidden md:block"></div>
                        <button className="text-text-secondary hover:text-danger flex items-center gap-2 text-sm font-bold transition-colors">
                            <LogOut size={18} /> <span className="hidden md:inline">Salir</span>
                        </button>
                    </div>
                </header>

                {/* Área de Contenido */}
                <div className="flex-1 overflow-y-auto scroll-smooth bg-bg-main">
                    {activeTab === 'dashboard' && <DashboardHome changeTab={setActiveTab} />}
                    {activeTab === 'identity' && <IdentityScreen />}
                    {activeTab === 'drop' && <DropScreen />}
                    {activeTab === 'vault' && <VaultScreen />}
                </div>
            </main>
        </div>
    );
}