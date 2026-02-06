import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración limpia y estándar
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext' // Solo esto es necesario para criptografía moderna
  }
});