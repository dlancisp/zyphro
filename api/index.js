import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiKeyRoutes from "./routes/apiKeyRoutes.js";
import vortexRoutes from "./routes/vortexRoutes.js";
import cron from 'node-cron';
import { checkDeadManSwitches } from './utils/deathClock.js';

// Importación de Rutas

import secretRoutes from './routes/secrets.js'; 
import switchRoutes from './routes/switch.js';

dotenv.config();

const app = express();

// Configuración de rutas para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares Globales
app.use(express.json({ limit: '10mb' })); // Optimizado para mensajes de texto cifrados
app.use(cors());
app.use(morgan('dev'));

// --- 🛣️ RUTAS DE LA API ---

app.use("/api/v1/vortex", vortexRoutes);

// Rutas de Infraestructura B2B
app.use("/api/keys", apiKeyRoutes);

// Ruta para Mensajes Efímeros (Secure Drop)
app.use('/api/messages', secretRoutes); 

// Ruta para el Dead Man Switch
app.use('/api/switch', switchRoutes);

// --- 🌍 CONFIGURACIÓN PARA PRODUCCIÓN ---
if (process.env.NODE_ENV === 'production') {
  // Servimos los archivos estáticos de la carpeta 'dist' del cliente
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Cualquier ruta que no sea de la API carga el index.html del Frontend
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;

cron.schedule('* * * * *', () => {
  checkDeadManSwitches();
});

app.listen(PORT, () => {
  console.log(`
  🚀 ZYPHRO CORE ACTIVO
  ---------------------------
  📍 Puerto: ${PORT}
  🔐 Modo: Mensajería Efímera (Drop)
  🐘 Database: Neon PostgreSQL
  ---------------------------
  `);
});