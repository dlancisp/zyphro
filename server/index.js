require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');

const app = express();

// 1. SEGURIDAD DE CABECERAS (Helmet)
// Oculta "X-Powered-By: Express" y protege contra ataques comunes
app.use(helmet());

// 2. RATE LIMITING (Anti-Spam / Anti-DDoS)
// Solo permite 100 peticiones cada 15 minutos por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: '⛔ Demasiadas peticiones desde esta IP, intenta de nuevo en 15 min.'
});
app.use('/api', limiter); // Aplicar solo a las rutas de la API

// 3. CORS ESTRICTO (Solo tu Frontend puede entrar)
// En desarrollo usa '*', pero en producción SOLO tu dominio de Vercel
const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: clientURL,
  methods: ['GET', 'POST'], // Solo permitimos leer y crear
  allowedHeaders: ['Content-Type']
}));

// 4. LIMPIEZA DE DATOS (Sanitization)
app.use(express.json({ limit: '10kb' })); // Evita que te manden archivos gigantes para colgar el server
app.use(xss()); // Limpia código HTML malicioso
app.use(hpp()); // Previene contaminación de parámetros HTTP

// --- TUS RUTAS ---
// app.use('/api/secret', require('./routes/secret'));
// ... resto de tu código ...

// --- ARRANQUE ---
const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`🛡️ ZYPH Secure Server running on port ${PORT}`));
    console.log(`🔒 Accepting connections only from: ${clientURL}`);
  })
  .catch(err => console.log(err));