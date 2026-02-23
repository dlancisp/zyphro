// client/src/apiConfig.js

// Detectamos si estamos trabajando en tu PC o en el servidor real
const isLocal = window.location.hostname === 'localhost';

// IMPORTANTE: Sustituye la URL de abajo por la que te dio Vercel
export const API_URL = isLocal 
  ? 'http://localhost:3000' 
  : 'https://zyphro.com'; 

console.log(`[Zyphro System] Modo: ${isLocal ? 'LOCAL' : 'PRODUCCIÓN'}`);