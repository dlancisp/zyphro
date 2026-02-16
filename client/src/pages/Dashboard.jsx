import { useUser, SignOutButton } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';
import { Icons } from "../components/Icons";
import ApiKeyManager from '../components/ApiKeyManager';
import DmsConfig from '../components/DmsConfig';

function Dashboard() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-20">
      
      <div className="feature-wrapper" style={{maxWidth: '1200px', margin: '40px auto', padding: '0 20px'}}>
        
        {/* CABECERA: Logo limpio sin PULSE */}
        <div className="flex justify-between items-center mb-12">
        <div className="cursor-pointer" onClick={() => window.location.href = '/'}>
          <h2 className="text-4xl font-black italic tracking-tighter text-blue-600 m-0 leading-none uppercase">
            ZYPHRO
          </h2>
          {/* Aquí NO hay PULSE ni otros elementos */}
        </div>

          <SignOutButton>
            <button className="btn-hero" style={{padding:'10px 20px', fontSize:'0.8rem', background:'#f1f5f9', border:'1px solid #e2e8f0', color:'#0f172a', borderRadius: '8px', fontWeight: 'bold'}}>
              Cerrar Sesión
            </button>
          </SignOutButton>
        </div>

        {/* Perfil: Texto corregido para fondo blanco */}
        <div className="flex items-center gap-4 mb-10 pb-8 border-b border-slate-100">
        <img src={user?.imageUrl} alt="Profile" className="w-16 h-16 rounded-full border-2 border-blue-600" />
        <div>
          <h2 className="text-3xl font-black text-slate-900 m-0 leading-tight">Hola, {user?.firstName || "Usuario"}! 👋</h2>
          <p className="text-slate-500 font-medium m-0">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

        {/* Aquí sigue el resto de tu Grid de Herramientas, DmsConfig y ApiKeyManager */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DmsConfig />
            <ApiKeyManager />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;