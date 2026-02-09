import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';

// Componente para los items de la lista (Check verde)
const CheckItem = ({ text }) => (
  <div className="flex items-start gap-3 text-gray-300 mb-3">
    <div className="mt-1 text-green-400">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    <span className="text-sm">{text}</span>
  </div>
);

// Componente para items que NO incluye (X gris)
const XItem = ({ text }) => (
  <div className="flex items-start gap-3 text-gray-500 mb-3 opacity-60">
    <div className="mt-1">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </div>
    <span className="text-sm line-through">{text}</span>
  </div>
);

export default function Pricing() {
  return (
    <div className="relative min-h-screen pt-24 pb-12 overflow-hidden bg-[#0f172a]">
      
      {/* 🌌 FONDO CON LUCES (Igual que el Home) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* TITULAR */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-6">
            Seguridad Militar. <br/> Precio Civil.
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Protege tus secretos con la tecnología Zero-Knowledge más avanzada. 
            Empieza gratis, escala cuando lo necesites.
          </p>
        </div>

        {/* 📦 GRID DE TARJETAS */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          
          {/* --- PLAN GRATIS (Start) --- */}
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/5 transition-all">
            <h3 className="text-xl font-bold text-gray-300 mb-2">Agente (Gratis)</h3>
            <div className="text-4xl font-bold text-white mb-6">0€ <span className="text-lg text-gray-500 font-normal">/mes</span></div>
            <p className="text-gray-400 text-sm mb-8">Para uso personal y envío ocasional de secretos.</p>
            
            <Link to="/register" className="block w-full py-3 rounded-xl border border-gray-600 text-white font-bold text-center hover:bg-gray-800 transition-colors mb-8">
              Empezar Gratis
            </Link>

            <div className="space-y-2">
              <CheckItem text="Secure Drop (Enlaces de un solo uso)" />
              <CheckItem text="Cifrado AES-256 GCM" />
              <CheckItem text="Hasta 10 secretos activos" />
              <CheckItem text="Caducidad máx. 7 días" />
              <XItem text="Dead Man Switch" />
              <XItem text="Anonymous Mail" />
            </div>
          </div>

          {/* --- PLAN PRO (Recomendado) --- */}
          <div className="glass-panel rounded-3xl p-8 relative transform scale-105 z-10 animate-float-slow border-red-500/30">
           <div className="absolute -top-4 inset-x-0 flex justify-center">
             <span className="bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Más Popular</span>
           </div>

            <h3 className="text-xl font-bold text-white mb-2">Operativo (Pro)</h3>
            <div className="text-4xl font-bold text-white mb-6">9€ <span className="text-lg text-gray-500 font-normal">/mes</span></div>
            <p className="text-gray-300 text-sm mb-8">Seguridad completa con Dead Man Switch y herramientas avanzadas.</p>
            
            <Link to="/register" className="block w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-center hover:shadow-lg hover:shadow-blue-500/30 transition-all mb-8">
              Mejorar a Pro
            </Link>

            <div className="space-y-2">
              <CheckItem text="Todo lo del plan Agente" />
              <CheckItem text="💀 Dead Man Switch (Ilimitados)" />
              <CheckItem text="✉️ Anonymous Mail (5/día)" />
              <CheckItem text="Archivos de hasta 1GB" />
              <CheckItem text="Sin caducidad de tiempo" />
              <CheckItem text="Protección por contraseña" />
            </div>
          </div>

          {/* --- PLAN ENTERPRISE --- */}
          <div className="bg-black/40 backdrop-blur-xl border border-red-500/50 rounded-2xl p-8 relative shadow-[0_0_30px_rgba(220,38,38,0.2)]">
            <h3 className="text-xl font-bold text-gray-300 mb-2">Agencia (Corp)</h3>
            <div className="text-4xl font-bold text-white mb-6">Custom</div>
            <p className="text-gray-400 text-sm mb-8">Para organizaciones que requieren control total y auditoría.</p>
            
            <a href="mailto:ventas@zyphro.com" className="block w-full py-3 rounded-xl border border-gray-600 text-white font-bold text-center hover:bg-gray-800 transition-colors mb-8">
              Contactar Ventas
            </a>

            <div className="space-y-2">
              <CheckItem text="Todo lo del plan Operativo" />
              <CheckItem text="API Dedicada" />
              <CheckItem text="Panel de Administración" />
              <CheckItem text="Logs de Auditoría" />
              <CheckItem text="SSO (Single Sign-On)" />
              <CheckItem text="Soporte 24/7 Prioritario" />
            </div>
          </div>

        </div>

        {/* FAQ RÁPIDO */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-10">Preguntas Frecuentes</h2>
          
          <div className="grid gap-6">
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700">
              <h4 className="font-bold text-white mb-2">¿Puedo cancelar cuando quiera?</h4>
              <p className="text-gray-400 text-sm">Sí, no hay permanencia. Puedes cancelar tu suscripción desde el dashboard en cualquier momento.</p>
            </div>
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700">
              <h4 className="font-bold text-white mb-2">¿Cómo funciona el pago anónimo?</h4>
              <p className="text-gray-400 text-sm">Aceptamos criptomonedas (BTC, ETH, XMR) para el plan Pro, garantizando que no haya rastro bancario si así lo deseas.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}