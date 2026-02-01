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

// --- 1. INICIALIZACIÓN ---
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// Confianza en Proxy (Necesario para Render/Vercel)
app.set('trust proxy', 1);

// --- 2. MIDDLEWARES DE SEGURIDAD (EL ESCUDO) ---

// A. Helmet: Protege cabeceras HTTP y oculta tecnología
app.use(helmet());

// B. Rate Limiting: Evita ataques de fuerza bruta (DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas peticiones. Inténtalo en 15 minutos." }
});
app.use(limiter); // Aplicar a todo el servidor

// C. CORS: Permite que Vercel hable con este servidor
app.use(cors({
  origin: [
    "http://localhost:5173",             // Tu PC
    "https://zyph-v1.vercel.app",        // Tu Web 1
    "https://zyph-suite.vercel.app"      // Tu Web 2
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true // Permite envío de Cookies seguras
}));

// D. Procesamiento de datos
app.use(express.json({ limit: '50kb' })); // Limita tamaño de paquetes a 50kb
app.use(cookieParser()); // Permite leer cookies

// --- 3. RUTAS (ENDPOINTS) ---

// A. REGISTRO DE USUARIOS (Auth)
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: 'Faltan datos' });

    // Verificar duplicados
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email ya registrado' });

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    // Crear Token JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Enviar Cookie Segura
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
    });

    console.log(`👤 Nuevo usuario: ${email}`);
    res.status(201).json({ message: 'Registro exitoso', user: { id: newUser.id, email } });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Error interno al registrar' });
  }
});

// B. CREAR SECRETO
app.post('/api/secret', async (req, res) => {
  try {
    const { cipherText } = req.body;
    const newSecret = await prisma.secret.create({ data: { cipherText } });
    res.json({ id: newSecret.id });
  } catch (error) {
    res.status(500).json({ error: 'Error guardando secreto' });
  }
});

// C. LEER SECRETO (Burn on Read)
app.get('/api/secret/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const secret = await prisma.secret.findUnique({ where: { id } });

    if (!secret) return res.status(404).json({ error: 'Secreto no encontrado o ya leído' });

    // Borrado atómico (Transacción)
    await prisma.secret.delete({ where: { id } });

    res.json({ cipherText: secret.cipherText });
  } catch (error) {
    res.status(500).json({ error: 'Error recuperando secreto' });
  }
});

// D. DEAD MAN'S SWITCH
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

// --- 4. TAREAS AUTOMÁTICAS (CRON JOBS) ---

// Limpieza de secretos viejos (>24h)
cron.schedule('0 * * * *', async () => {
  console.log('🧹 Ejecutando limpieza de secretos caducados...');
  try {
    const twentyFourHoursAgo = new Date(new Date() - 24 * 60 * 60 * 1000);
    const deleted = await prisma.secret.deleteMany({
      where: { createdAt: { lt: twentyFourHoursAgo } },
    });
    if (deleted.count > 0) console.log(`✅ Eliminados ${deleted.count} secretos viejos.`);
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
  }
});

// --- 5. ARRANQUE DEL SERVIDOR ---
app.listen(PORT, () => console.log(`🚀 ZYPH Backend running on port ${PORT}`));