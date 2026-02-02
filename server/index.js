require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

// --- 1. CONFIGURACIÓN INICIAL ---
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1); // Necesario para Render

// --- 2. MIDDLEWARES DE SEGURIDAD ---

// A. Protección de Cabeceras
app.use(helmet());

// B. Rate Limiting (Anti-DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máx peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas peticiones. Calma." }
});
app.use(limiter);

// C. CORS (La puerta de entrada)
app.use(cors({
  origin: function (origin, callback) {
    const allowedDomains = [
      "http://localhost:5173",          // Localhost
      "https://zyph-v1.vercel.app",     // Vercel antiguo
      "https://zyphro.com",             // ✅ TU NUEVO DOMINIO
      "https://www.zyphro.com"          // ✅ TU NUEVO DOMINIO (WWW)
    ];

    // Permitir dominios listados, previews de Vercel o peticiones sin origen (Postman)
    if (!origin || allowedDomains.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      console.log(`🚫 Bloqueado por CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Permitir cookies
}));

// D. Parsing
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());

// --- 3. RUTAS API ---

// ➤ AUTH: Registro
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Faltan datos' });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email ya registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
    });

    console.log(`👤 Nuevo usuario Zyphro: ${email}`);
    res.status(201).json({ message: 'Registro exitoso', user: { id: newUser.id, email } });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ➤ SECRETS: Crear
app.post('/api/secret', async (req, res) => {
  try {
    const { cipherText } = req.body;
    const newSecret = await prisma.secret.create({ data: { cipherText } });
    res.json({ id: newSecret.id });
  } catch (error) {
    res.status(500).json({ error: 'Error guardando secreto' });
  }
});

// ➤ SECRETS: Leer (Burn on Read)
app.get('/api/secret/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const secret = await prisma.secret.findUnique({ where: { id } });

    if (!secret) return res.status(404).json({ error: 'Secreto no existe' });

    await prisma.secret.delete({ where: { id } }); // Borrar tras leer
    res.json({ cipherText: secret.cipherText });
  } catch (error) {
    res.status(500).json({ error: 'Error recuperando secreto' });
  }
});

// ➤ DEAD MAN SWITCH
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
    res.status(500).json({ error: 'Error creando switch' });
  }
});

app.post('/api/switch/checkin', async (req, res) => {
  try {
    const { id } = req.body;
    await prisma.switch.update({
      where: { id },
      data: { lastCheckIn: new Date() }
    });
    res.json({ status: 'Vida confirmada' });
  } catch (error) {
    res.status(404).json({ error: 'Switch no encontrado' });
  }
});

// ➤ ANON MAIL (Simulado por ahora para que no falle el frontend)
app.post('/api/email', async (req, res) => {
    // AQUÍ CONECTAREMOS RESEND O NODEMAILER EN EL FUTURO
    console.log("📨 Email solicitado:", req.body);
    // Simulamos éxito
    res.json({ status: 'Enviado (Simulación)' });
});

// --- 4. TAREAS AUTOMÁTICAS ---

// Limpieza cada hora
cron.schedule('0 * * * *', async () => {
  console.log('🧹 Limpiando secretos caducados...');
  try {
    const twentyFourHoursAgo = new Date(new Date() - 24 * 60 * 60 * 1000);
    await prisma.secret.deleteMany({
      where: { createdAt: { lt: twentyFourHoursAgo } },
    });
  } catch (error) {
    console.error('❌ Error cron:', error);
  }
});

// --- 5. START ---
app.listen(PORT, () => console.log(`🚀 ZYPHRO Backend listo en puerto ${PORT}`));