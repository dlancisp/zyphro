import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';

// Componente para las tarjetas del equipo (Arquetipos)
const TeamCard = ({ icon: Icon, title, role, description }) => (
  <div className="bg-gray-900/40 backdrop-blur-lg border border-gray-800 p-6 rounded-2xl hover:bg-gray-800/60 transition-all duration-300 group">
    <div className="h-12 w-12 bg-blue-900/30 text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      <Icon style={{ height: '24px', width: '24px' }} />
    </div>
    <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
    <p className="text-blue-500 text-sm font-mono mb-3 uppercase tracking-wider">{role}</p>
    <p className="text-gray-400 text-sm leading-relaxed">
      {description}
    </p>
  </div>
);

// Componente para los principios (Lista)
const PrincipleItem = ({ title, text }) => (
  <div className="flex gap-4 items-start">
    <div className="mt-1 bg-blue-500/20 p-2 rounded-lg text-blue-400">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
    </div>
    <div>
      <h4 className="text-white font-bold mb-1">{title}</h4>
      <p className="text-gray-400 text-sm">{text}</p>
    </div>
  </div>
);

export default function About() {
  return (
    <div className="relative min-h-screen pt-24 pb-12 overflow-hidden bg-[#0f172a]">
      
      {/* 🌌 FONDO CON LUCES (Consistente con el resto de la web) */}
      <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        
        {/* 1. HÉROE: TITULAR E HISTORIA */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-400 mb-6 leading-tight">
            En las sombras digitales, <br/> nosotros somos el escudo.
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Nacimos de una necesidad simple: la privacidad no debería ser un lujo, sino un derecho fundamental en la era de la vigilancia masiva.
          </p>
        </div>

        {/* 2. TARJETA GRANDE: EL ORIGEN */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 md:p-12 mb-24 flex flex-col md:flex-row gap-12 items-center">
           <div className="md:w-1/2">
             <h2 className="text-3xl font-bold text-white mb-6">El Manifiesto Zyphro</h2>
             <div className="space-y-4 text-gray-300 leading-relaxed">
               <p>
                 Vivimos en una era donde cada clic, cada mensaje y cada archivo es rastreado, analizado y vendido. La privacidad ha muerto para la mayoría, pero no para nosotros.
               </p>
               <p>
                 Zyphro no es solo una empresa; es una respuesta. Somos ingenieros, criptógrafos y activistas que creemos que tus datos te pertenecen solo a ti.
               </p>
               <p className="text-white font-semibold">
                 Construimos herramientas de grado militar con una regla inquebrantable: nosotros no podemos ver lo que tú guardas. Zero-Knowledge no es una función, es nuestra base.
               </p>
             </div>
           </div>
           <div className="md:w-1/2 flex justify-center">
             {/* Ilustración abstracta con iconos */}
             <div className="relative w-64 h-64 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-full flex items-center justify-center border border-blue-500/30 animate-pulse-slow">
                <Icons.Shield style={{width: '80px', height: '80px', color: '#60a5fa'}} />
                <div className="absolute top-0 right-0 animate-bounce-slow"><Icons.Lock style={{color: '#a78bfa'}} /></div>
                <div className="absolute bottom-4 left-4"><Icons.Database style={{color: '#60a5fa'}} /></div>
             </div>
           </div>
        </div>

        {/* 3. GRID: LOS CREADORES (ARQUETIPOS) */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Los Arquitectos del Silencio</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <TeamCard 
              icon={Icons.Code}
              title="Zero"
              role="Criptografía & Core"
              description="El cerebro matemático. Diseña los protocolos de cifrado AES-256 y la arquitectura Zero-Knowledge que asegura que ni nosotros tengamos la llave."
            />
            <TeamCard 
              icon={Icons.Shield}
              title="Cipher"
              role="Seguridad Ofensiva"
              description="Ex-hacker de sombrero blanco. Su trabajo es intentar romper nuestra propia seguridad cada día antes de que nadie más pueda intentarlo."
            />
            <TeamCard 
              icon={Icons.Globe}
              title="Echo"
              role="Infraestructura & Red"
              description="Maestro de la descentralización y la disponibilidad. Se asegura de que, pase lo que pase en el mundo, Zyphro siga operando."
            />
          </div>
        </div>

        {/* 4. NUESTROS PRINCIPIOS */}
        <div className="max-w-4xl mx-auto bg-gray-900/30 border border-gray-800/50 rounded-2xl p-10 mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Nuestros Principios Inquebrantables</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <PrincipleItem title="Privacidad por Diseño" text="No añadimos seguridad al final. La construimos desde la primera línea de código." />
            <PrincipleItem title="Transparencia Radical" text="Nuestro código no oculta puertas traseras. Pronto será Open Source para auditoría pública." />
            <PrincipleItem title="Sin Rastreadores" text="No usamos Google Analytics ni cookies de terceros en nuestra plataforma." />
            <PrincipleItem title="Independencia" text="No tenemos inversores de capital riesgo que exijan vender tus datos para crecer." />
          </div>
        </div>

        {/* CTA FINAL */}
        <div className="text-center">
          <h3 className="text-2xl text-white font-bold mb-6">Únete a la resistencia digital</h3>
          <Link to="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
            Crear Cuenta Segura <Icons.ChevronRight />
          </Link>
        </div>

      </div>
    </div>
  );
}