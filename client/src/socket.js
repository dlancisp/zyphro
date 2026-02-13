import { io } from 'socket.io-client';

const URL = import.meta.env.MODE === 'production' 
  ? window.location.origin  // Usa zyphro.com automáticamente
  : 'http://localhost:3000'; 

export const socket = io(URL, {
  transports: ['websocket'], // Forzamos websocket para evitar errores de polling
  autoConnect: true
});