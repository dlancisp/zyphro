import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';

// Componente para las tarjetas de valores
const ValueCard = ({ icon: Icon, title, text, color }) => (
  <div className="bg-gray-900/40 backdrop-blur-lg border border-gray-800 p-8 rounded-2xl hover:bg-gray-800/60 transition-all duration-300 hover:-translate-y-1">
    <div className={`h-14 w-14 rounded-xl flex items-center justify-center mb-6 bg-opacity-20 ${color}`}>
      <Icon style={{ height: '30px', width: '30px' }} className={color.replace('bg-', 'text-').replace('/20', '')} />
    </div>
    <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">
      {text}
    </p>
  </div>
);

// Componente para la lista de "Lo que NO hacemos"
const AntiFeature = ({ text }) => (
  <div className="flex items-center gap-4 text-gray-400 py-3 border-b border-gray-800 last:border-0">
    <div className="text-red-500">
      <Icons.Close style={{ width: '24px', height: '24px' }} />
    </div>
    <span className="text-lg">{text}</span>
  </div>
);

export default function Values() {
  return (
    <div className="relative min-h-screen pt-24 pb-12 overflow-hidden bg-[#0f172a]">
      
      {/* 🌌 FONDO CON LUCES */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* TITULAR */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-gray-500 mb-6">
            Nuestra Lealtad es <br/> con el Usuario.
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            En un mundo donde los datos son la nueva moneda, nosotros elegimos la bancarrota moral de las grandes tecnológicas. Zyphro no es un negocio de datos, es un negocio de confianza.
          </p>
        </div>

        {/* GRID DE VALORES PRINCIPALES */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <ValueCard 
            icon={Icons.Lock}
            color="bg-blue-500/20"
            title="Zero Knowledge"
            text="No podemos leer tus secretos ni aunque queramos. La encriptación ocurre en tu dispositivo antes de salir. Para nosotros, tus datos son solo ruido aleatorio."
          />
          <ValueCard 
            icon={Icons.Code}
            color="bg-purple-500/20"
            title="Código Abierto"
            text="La seguridad por oscuridad no existe. Creemos en la auditoría pública. Nuestro código será siempre transparente para que la comunidad pueda verificarlo."
          />
          <ValueCard 
            icon={Icons.Shield}
            color="bg-green-500/20"
            title="Independencia"
            text="Sin inversores que exijan crecimiento a costa de tu privacidad. Zyphro se mantiene gracias a sus usuarios, no a la venta de sus perfiles."
          />
        </div>

        {/* SECCIÓN "LO QUE NO HACEMOS" (CONTRASTE) */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700 rounded-3xl p-8 md:p-12 mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Columna Texto */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">La Lista Negra de Zyphro</h2>
              <p className="text-gray-400 mb-8">
                Muchas empresas definen sus valores por lo que aspiran a ser. Nosotros nos definimos por las líneas rojas que prometemos no cruzar jamás.
              </p>
              <div className="flex flex-col">
                <AntiFeature text="No usamos cookies de rastreo de terceros." />
                <AntiFeature text="No guardamos logs de IP ni actividad." />
                <AntiFeature text="No pedimos datos personales innecesarios." />
                <AntiFeature text="No tenemos puertas traseras para gobiernos." />
                <AntiFeature text="No vendemos metadatos a anunciantes." />
              </div>
            </div>

            {/* Columna Visual (Base de datos cerrada) */}
            <div className="relative flex justify-center items-center">
              <div className="w-64 h-64 bg-gray-800 rounded-full flex items-center justify-center relative shadow-2xl shadow-black">
                {/* Icono central */}
                <Icons.Database style={{ width: '80px', height: '80px', color: '#ef4444' }} />
                
                {/* Candado flotante */}
                <div className="absolute -top-4 -right-4 bg-gray-900 p-4 rounded-2xl border border-gray-700 shadow-xl">
                  <Icons.Lock style={{ width: '40px', height: '40px', color: '#ffffff' }} />
                </div>

                {/* Efecto de "Cerrado" */}
                <div className="absolute inset-0 border-4 border-red-500/20 rounded-full animate-pulse"></div>
              </div>
            </div>

          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-10">
          <h2 className="text-3xl font-bold text-white mb-6">¿Compartes nuestros valores?</h2>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
              Únete a Zyphro
            </Link>
            <Link to="/nosotros" className="border border-gray-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
              Conoce al Equipo
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}