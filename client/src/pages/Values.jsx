import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';

// Componente para las tarjetas de valores (CON GLASSMORPHISM)
const ValueCard = ({ icon: Icon, title, text, color }) => (
  <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:bg-white/5 transition-all duration-500 group">
    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-6 ${color} group-hover:scale-110 transition-transform`}>
      <Icon style={{ height: '32px', width: '32px' }} className="text-white" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{title}</h3>
    <p className="text-gray-400 leading-relaxed">
      {text}
    </p>
  </div>
);

// Componente para la lista de "Lo que NO hacemos"
const AntiFeature = ({ text }) => (
  <div className="flex items-center gap-4 text-gray-300 py-4 border-b border-white/10 last:border-0 hover:bg-white/5 px-4 rounded-lg transition-colors">
    <div className="text-red-500 bg-red-500/10 p-2 rounded-full">
      <Icons.Close style={{ width: '20px', height: '20px' }} />
    </div>
    <span className="text-lg font-medium">{text}</span>
  </div>
);

export default function Values() {
  return (
    <div className="relative min-h-screen pt-24 pb-12 overflow-hidden bg-[#050505]">
      
      {/* 🌌 FONDO CON LUCES (Auras flotantes) */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* TITULAR IMPONENTE */}
        <div className="text-center mb-24 relative">
          {/* Pequeño brillo detrás del título */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 blur-3xl rounded-full -z-10"></div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 mb-8 tracking-tight">
            Nuestra Lealtad es <br/> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">con el Usuario.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            En un mundo donde los datos son la nueva moneda, nosotros elegimos la bancarrota moral de las grandes tecnológicas. <span className="text-white font-semibold">Zyphro no es un negocio de datos, es un negocio de confianza.</span>
          </p>
        </div>

        {/* GRID DE VALORES PRINCIPALES */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          <ValueCard 
            icon={Icons.Lock}
            color="bg-blue-600/20 text-blue-400"
            title="Zero Knowledge"
            text="No podemos leer tus secretos ni aunque queramos. La encriptación ocurre en tu dispositivo antes de salir. Para nosotros, tus datos son solo ruido aleatorio."
          />
          <ValueCard 
            icon={Icons.Code}
            color="bg-purple-600/20 text-purple-400"
            title="Código Abierto"
            text="La seguridad por oscuridad no existe. Creemos en la auditoría pública. Nuestro código será siempre transparente para que la comunidad pueda verificarlo."
          />
          <ValueCard 
            icon={Icons.Shield}
            color="bg-emerald-600/20 text-emerald-400"
            title="Independencia"
            text="Sin inversores de capital riesgo que exijan crecimiento a costa de tu privacidad. Zyphro se mantiene gracias a sus usuarios, no a la venta de sus perfiles."
          />
        </div>

        {/* SECCIÓN "LO QUE NO HACEMOS" (LA LISTA NEGRA) */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 md:p-16 mb-24 shadow-2xl relative overflow-hidden">
          
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-red-900/10 via-transparent to-transparent pointer-events-none"></div>

          <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
            
            {/* Columna Texto */}
            <div>
              <h2 className="text-4xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-red-600 rounded-full"></span>
                La Lista Negra
              </h2>
              <p className="text-gray-400 mb-10 text-lg">
                Muchas empresas definen sus valores por lo que aspiran a ser. Nosotros nos definimos por las líneas rojas que prometemos <strong className="text-white">no cruzar jamás.</strong>
              </p>
              
              <div className="flex flex-col gap-2">
                <AntiFeature text="No usamos cookies de rastreo de terceros." />
                <AntiFeature text="No guardamos logs de IP ni actividad." />
                <AntiFeature text="No pedimos datos personales innecesarios." />
                <AntiFeature text="No tenemos puertas traseras para gobiernos." />
                <AntiFeature text="No vendemos metadatos a anunciantes." />
              </div>
            </div>

            {/* Columna Visual (Base de datos cerrada y animada) */}
            <div className="relative flex justify-center items-center h-full">
              {/* Círculos concéntricos decorativos */}
              <div className="absolute w-96 h-96 border border-white/5 rounded-full animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute w-72 h-72 border border-red-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>

              {/* El núcleo seguro */}
              <div className="relative w-64 h-64 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_50px_rgba(220,38,38,0.2)] animate-float-slow">
                
                {/* Icono central */}
                <Icons.Database style={{ width: '80px', height: '80px', color: '#ef4444' }} className="drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                
                {/* Candado flotante */}
                <div className="absolute -top-6 -right-6 bg-black p-5 rounded-2xl border border-white/10 shadow-xl animate-bounce">
                  <Icons.Lock style={{ width: '32px', height: '32px', color: '#ffffff' }} />
                </div>

                {/* Efecto de "Cerrado/Prohibido" */}
                <div className="absolute inset-0 border-2 border-red-500/20 rounded-full animate-pulse"></div>
              </div>
            </div>

          </div>
        </div>

        {/* CTA FINAL */}
        <div className="text-center py-12 bg-gradient-to-b from-transparent to-blue-900/10 rounded-3xl border border-white/5">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">¿Compartes nuestra filosofía?</h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link to="/register" className="bg-white text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-transform hover:scale-105 shadow-lg shadow-white/10">
              Únete a Zyphro
            </Link>
            <Link to="/about" className="group border border-white/30 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
              Conoce al Equipo 
              <Icons.ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}