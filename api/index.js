const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Rutas
const authRoutes = require('./routes/auth');
const secretRoutes = require('./routes/secrets');

const app = express();

app.set('trust proxy', 1);

// Middlewares
app.use(helmet());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json({ limit: '50kb' }));

// CORS Permitido
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://zyphro.com",
    "https://www.zyphro.com"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Rate Limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// --- 🔴 AQUÍ ESTABA EL ERROR (CORREGIDO) ---
// Usamos .default por si viene empaquetado, o la variable directa si no.
app.use('/api', authRoutes.default || authRoutes);
app.use('/api', secretRoutes.default || secretRoutes);
// -------------------------------------------

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', env: process.env.NODE_ENV });
});

// Exportar para Vercel
module.exports = app;