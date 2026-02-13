import { io } from 'socket.io-client';

// Detectamos el entorno automáticamente
const URL = import.meta.env.MODE === 'production' 
  ? window.location.origin // En la web, usa el dominio actual (ej: zyphro.com)
  : 'http://localhost:3000'; // En tu PC, usa el puerto 3000

export const socket = io(URL, {
  autoConnect: true,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling'] // Asegura compatibilidad en todos los navegadores
});