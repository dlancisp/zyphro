import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import { rateLimit } from 'express-rate-limit';

import apiKeyRoutes from "./_lib/routes/apiKeyRoutes.js";
import vortexRoutes from "./_lib/routes/vortexRoutes.js";
import secretRoutes from './_lib/routes/secrets.js'; 
import switchRoutes from './_lib/routes/switch.js';
import { checkDeadManSwitches } from './_lib/utils/deathClock.js';

const app = express();

// --- 🛡️ CONFIGURACIÓN DE SEGURIDAD (RATE LIMITING) ---

// 1. Limitador General: 100 peticiones cada 15 min por IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: "Demasiadas peticiones. Inténtalo de nuevo en 15 minutos." }
});

// 2. Limitador Crítico (Creación de Vórtices): 5 creaciones cada 10 min
// Esto evita que un bot llene tu base de datos Neon.
const createVortexLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5, 
  message: { error: "Límite de creación alcanzado. Seguridad activada por 10 min." }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares Globales
app.set('trust proxy', 1); // CRÍTICO para Vercel/Cloudflare
app.use(generalLimiter);   // Aplicamos el límite general a todo
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(morgan('dev'));

// --- 🛣️ RUTAS DE LA API ---

// Aplicamos el limitador estricto SOLO a la creación
app.use("/api/v1/vortex/create", createVortexLimiter); 
app.use("/api/v1/vortex", vortexRoutes);

app.use("/api/keys", apiKeyRoutes);
app.use('/api/messages', secretRoutes); 
app.use('/api/switch', switchRoutes);

// --- 🌍 CONFIGURACIÓN PARA PRODUCCIÓN ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;


if (process.env.NODE_ENV !== 'production') {
  cron.schedule('* * * * *', () => {
    checkDeadManSwitches();
  });
}

app.listen(PORT, () => {
  console.log(`
  🚀 ZYPHRO CORE BLINDADO
  ---------------------------
  🛡️ Rate Limiting: ACTIVO
  📍 Puerto: ${PORT}
  🔐 Protocolo: XChaCha20-Poly1305
  ---------------------------
  `);
});