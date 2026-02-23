import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import { rateLimit } from 'express-rate-limit';
import { prisma } from './db.js';

import apiKeyRoutes from "./_lib/routes/apiKeyRoutes.js";
import vortexRoutes from "./_lib/routes/vortexRoutes.js";
import secretRoutes from './_lib/routes/secrets.js'; 
import switchRoutes from './_lib/routes/switch.js';
import mailRoutes from './_lib/routes/mail.js';
import { checkDeadManSwitches } from './_lib/utils/deathClock.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. CONFIGURACIÓN INICIAL ---
app.set('trust proxy', 1); 
app.use(cors());
app.use(morgan('dev'));

// --- 2. RUTA CRÍTICA: ANON MAIL WEBHOOK ---
// La ponemos ANTES del Rate Limit para que Cloudflare/ngrok no sean bloqueados
app.use('/api/v1/mail', express.json(), mailRoutes); 

// --- 3. 🛡️ CONFIGURACIÓN DE SEGURIDAD (RATE LIMITING) ---
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: "Demasiadas peticiones. Inténtalo de nuevo en 15 minutos." }
});

const createVortexLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5, 
  message: { error: "Límite de creación alcanzado. Seguridad activada por 10 min." }
});

// Aplicamos el límite general a todo lo que viene después
app.use(generalLimiter);
app.use(express.json({ limit: '10mb' }));

// --- 4. 🛣️ RESTO DE RUTAS DE LA API ---
app.use("/api/v1/vortex/create", createVortexLimiter); 
app.use("/api/v1/vortex", vortexRoutes);
app.use("/api/keys", apiKeyRoutes);
app.use('/api/messages', secretRoutes); 
app.use('/api/switch', switchRoutes);

// --- 5. 🌍 CONFIGURACIÓN PARA PRODUCCIÓN ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;

// --- ⏰ TAREAS AUTOMATIZADAS (CRON JOBS) ---
if (process.env.NODE_ENV !== 'production') {
  cron.schedule('* * * * *', () => {
    checkDeadManSwitches();
  });

  cron.schedule('*/10 * * * *', async () => {
    console.log('🛰️ ZYPHRO_CORE: Iniciando purga de nodos expirados...');
    try {
      const ahora = new Date();
      await prisma.anon_aliases.deleteMany({
        where: { expires_at: { lt: ahora } }
      });
    } catch (error) {
      console.error('❌ ERROR_PURGA:', error);
    }
  });
}

app.listen(PORT, () => {
  console.log(`
  🚀 ZYPHRO CORE BLINDADO
  ---------------------------
  🛡️ Webhook Mail: PRIORITARIO
  📍 Puerto: ${PORT}
  🔐 Protocolo: XChaCha20-Poly1305
  ---------------------------
  `);
});