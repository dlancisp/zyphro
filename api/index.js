const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// ✅ NUEVO: Importamos el SDK de Clerk
const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');

const cronRoutes = require('./routes/cron');
const dmsRoutes = require('./routes/dms');
const vaultRoutes = require('./routes/vault');
const authRoutes = require('./routes/auth');
const secretRoutes = require('./routes/secrets');

const app = express();

app.set('trust proxy', 1);

// --- MIDDLEWARES (El orden es CRÍTICO) ---

// 1. Seguridad básica
app.use(helmet());

// 2. ✅ MOVIDO: CORS debe ir ANTES de las rutas
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://zyphro.vercel.app", // Añade tu dominio de Vercel si es distinto
    "https://zyphro.com",
    "https://www.zyphro.com"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// 3. Parsers y Logs
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json({ limit: '50kb' }));

// 4. Rate Limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// 5. ✅ NUEVO: Autenticación Global de Clerk
// Esto lee el token del usuario y lo pone en req.auth (si existe)
// No bloquea la ruta, pero permite saber quién es el usuario.
app.use(ClerkExpressWithAuth());


// --- RUTAS ---
app.use('/api/cron', cronRoutes);
app.use('/api/dms', dmsRoutes);
app.use('/api/vault', vaultRoutes); 

// Rutas antiguas / públicas
app.use('/api', authRoutes.default || authRoutes);
app.use('/api', secretRoutes.default || secretRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', env: process.env.NODE_ENV });
});

// Server Listen (Solo local, Vercel no usa esto)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;