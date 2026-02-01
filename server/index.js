require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client'); // Importamos Prisma
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
app.use(helmet());


app.set('trust proxy', 1);


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP
  standardHeaders: true, // Devuelve info de límites en las cabeceras `RateLimit-*`
  legacyHeaders: false, // Desactiva las cabeceras viejas
  message: {
    error: "Demasiadas peticiones desde esta IP. Inténtalo de nuevo en 15 minutos."
  }
});

// Aplicar el límite a TODAS las rutas
app.use(limiter);
const prisma = new PrismaClient(); // Iniciamos la conexión

// --- MIDDLEWARES DE SEGURIDAD ---
app.use(helmet());
app.use(express.json({ limit: '50kb' }));
app.use(cors({
  origin: [
    "http://localhost:5173",             // Tu PC
    "https://zyph-v1.vercel.app",        // Tu Web en Vercel (Pega AQUÍ tu dominio exacto)
    "https://zyph-suite.vercel.app"      // (Si tienes otro dominio, ponlo también)
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

const limiter = rateLimit({ windowMs: 15*60*1000, max: 100 });
app.use('/api', limiter);

// --- RUTAS DE SECURE DROP ---

// 1. Crear Secreto
app.post('/api/secret', async (req, res) => {
  try {
    const { cipherText } = req.body;
    // Prisma crea el registro en la tabla Secret
    const newSecret = await prisma.secret.create({
      data: { cipherText }
    });
    res.json({ id: newSecret.id });
  } catch (error) {
    res.status(500).json({ error: 'Error guardando secreto' });
  }
});

// 2. Leer Secreto (Y borrarlo al instante - Burn on Read)
app.get('/api/secret/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar el secreto
    const secret = await prisma.secret.findUnique({ where: { id } });

    if (!secret) return res.status(404).json({ error: 'Secreto no encontrado o ya leído' });

    // Borrarlo inmediatamente (Transacción segura)
    await prisma.secret.delete({ where: { id } });

    res.json({ cipherText: secret.cipherText });
  } catch (error) {
    res.status(500).json({ error: 'Error recuperando secreto' });
  }
});

// --- RUTAS DE DEAD MAN'S SWITCH ---

app.post('/api/switch/create', async (req, res) => {
  try {
    const { recipientEmail, encryptedContent, checkInFrequency } = req.body;
    const newSwitch = await prisma.switch.create({
      data: {
        recipientEmail,
        encryptedContent,
        checkInFrequency: parseInt(checkInFrequency)
      }
    });
    res.json({ id: newSwitch.id });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Error creando switch' });
  }
});

app.post('/api/switch/checkin', async (req, res) => {
  try {
    const { id } = req.body;
    // Actualizar lastCheckIn
    await prisma.switch.update({
      where: { id },
      data: { lastCheckIn: new Date() } // Hora actual
    });
    res.json({ status: 'Vida confirmada' });
  } catch (error) {
    res.status(404).json({ error: 'Switch no encontrado' });
  }
});

// --- CRON JOB (Simulado con setInterval para Postgres) ---
// En SQL los datos no caducan solos (TTL). Lo hacemos manual:
setInterval(async () => {
  console.log('⏳ Revisando Dead Man Switches...');
  
  // 1. Buscar Switches caducados
  // Nota: Esto requeriría lógica de fechas más compleja, 
  // por ahora solo imprimimos para no complicar la migración.
  // En producción usaríamos una librería como 'node-cron'.
  
}, 60 * 1000); // Cada minuto


const PORT = process.env.PORT || 4000;
// --- GARBAGE COLLECTOR (LIMPIEZA AUTOMÁTICA) ---

// Cron Job: Se ejecuta una vez cada hora ('0 * * * *')
// Explicación: Borra secretos creados hace más de 24 horas que no han sido leídos.
cron.schedule('0 * * * *', async () => {
  console.log('🧹 Ejecutando limpieza automática de secretos caducados...');

  try {
    // Calculamos la fecha de ayer (hace 24h)
    const twentyFourHoursAgo = new Date(new Date() - 24 * 60 * 60 * 1000);

    // Ordenamos a Prisma borrar todo lo viejo
    const deleted = await prisma.secret.deleteMany({
      where: {
        createdAt: {
          lt: twentyFourHoursAgo, // "lt" significa "Less Than" (Menor que / Antes de)
        },
      },
    });

    if (deleted.count > 0) {
      console.log(`✅ Se han eliminado ${deleted.count} secretos caducados.`);
    } else {
      console.log('✨ No había basura que limpiar.');
    }
  } catch (error) {
    console.error('❌ Error en el Garbage Collector:', error);
  }
});
app.listen(PORT, () => console.log(`🚀 Server PostgreSQL running on port ${PORT}`));