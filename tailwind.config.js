/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Azul Corporativo (Se mantiene el azul vibrante como acento)
        accent: {
          DEFAULT: '#2563EB', // Azul intenso (Blue 600)
          dark: '#1D4ED8',    // Azul más oscuro para hovers (Blue 700)
          light: '#DBEAFE'    // Azul muy claro para fondos de iconos (Blue 100)
        },
        // Fondos Claros y Profesionales
        bg: {
          main: '#F8FAFC',    // Slate 50 (Fondo principal, casi blanco)
          card: '#FFFFFF',    // Blanco puro para tarjetas
          hover: '#F1F5F9',   // Slate 100 para hovers
          sidebar: '#FFFFFF'  // Sidebar blanca para limpieza total
        },
        // Textos (Para alto contraste sobre fondo claro)
        text: {
          primary: '#0F172A',   // Slate 900 (Casi negro, para títulos)
          secondary: '#475569'  // Slate 600 (Gris medio, para párrafos)
        },
        // Bordes
        border: {
            light: '#E2E8F0' // Slate 200 (Bordes sutiles)
        },
        // Estados
        success: '#059669',   // Verde esmeralda un poco más oscuro
        warning: '#D97706',   // Naranja quemado
        danger: '#DC2626'     // Rojo fuerte
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        'corporate': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', // Sombra suave y elegante
        'corporate-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
      }
    },
  },
  plugins: [],
}