import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// ✅ RUTAS CORREGIDAS SEGÚN TU FOTO (./routes porque están al lado)
import authRoutes from './routes/auth.js';
import secretRoutes from './routes/secrets.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1);

// --- MIDDLEWARES ---
app.use(helmet());
app.use(cookieParser());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json({ limit: '50kb' }));

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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas peticiones." }
});
app.use(limiter);

// --- RUTAS ---
app.use('/api', authRoutes);
app.use('/api', secretRoutes);

app.get('/api/health', (req, res) => res.status(200).json({ status: 'OK' }));

// --- ARRANQUE ---
// Solo escuchamos el puerto si NO estamos en Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🛡️  Zyphro API corriendo en puerto ${PORT}`);
  });
}

// ✅ EXPORTACIÓN VITAL PARA VERCEL
export default app;