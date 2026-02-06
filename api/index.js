const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Importamos las rutas (Compatible con tus archivos actuales)
const authRoutes = require('./routes/auth');
const secretRoutes = require('./routes/secrets');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1);

// --- MIDDLEWARES ---
app.use(helmet());
app.use(cookieParser());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json({ limit: '50kb' }));

// Configuración CORS blindada
app.use(cors({
  origin: function (origin, callback) {
    const allowedDomains = [
      "http://localhost:5173",
      "https://zyph-v1.vercel.app",
      "https://zyphro.com",
      "https://www.zyphro.com"
    ];
    if (!origin || allowedDomains.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      console.log(`🚫 Bloqueado por CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Preflight para evitar errores 405 en OPTIONS
app.options('*', cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Demasiadas peticiones." }
});
app.use(limiter);

// --- RUTAS ---
app.use('/api', authRoutes);
app.use('/api', secretRoutes);

app.get('/api/health', (req, res) => res.status(200).json({ status: 'OK' }));

// --- ARRANQUE ---
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🛡️  Zyphro API corriendo en puerto ${PORT}`);
  });
}

// ✅ EXPORTACIÓN COMPATIBLE PARA VERCEL
module.exports = app;