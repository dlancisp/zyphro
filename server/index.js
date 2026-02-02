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

// --- 1. VALIDACIÓN DE ENTORNO (CRÍTICO #3) ---
// Si faltan estas variables, el servidor se apaga para evitar catástrofes.
const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`❌ ERROR FATAL: Faltan variables de entorno: ${missingEnv.join(', ')}`);
  process.exit(1);
}

// --- 2. CONFIGURACIÓN INICIAL ---
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1); // Necesario para Render

// --- 3. MIDDLEWARES DE SEGURIDAD ---

// A. Protección de Cabeceras
app.use(helmet());

// B. Rate Limiting (Anti-DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas peticiones. Calma." }
});
app.use(limiter);

// C. CORS (Lista de Invitados)
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

// D. Parsing
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());

// --- 4. MIDDLEWARE DE AUTENTICACIÓN (CRÍTICO #2) ---
// Este es el "Portero" que verifica si tienes entrada (Token)
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Acceso denegado. Debes iniciar sesión.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado.' });
    req.user = user;
    next();
  });
};

// --- 5. RUTAS API ---

// ➤ AUTH: Registro (Público)
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

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

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

// ➤ SECRETS: Crear (Público - para uso anónimo)
app.post('/api/secret', async (req, res) => {
  try {
    const { cipherText } = req.body;
    // Ahora sí usa 'cipherText' que coincide con el schema.prisma corregido
    const newSecret = await prisma.secret.create({ data: { cipherText } });
    res.json({ id: newSecret.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error guardando secreto' });
  }
});

// ➤ SECRETS: Leer (Público - Burn on Read)
app.get('/api/secret/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const secret = await prisma.secret.findUnique({ where: { id } });

    if (!secret) return res.status(404).json({ error: 'Secreto no existe' });

    await prisma.secret.delete({ where: { id } }); 
    res.json({ cipherText: secret.cipherText });
  } catch (error) {
    res.status(500).json({ error: 'Error recuperando secreto' });
  }
});

// ➤ DEAD MAN SWITCH (🔒 PROTEGIDO - Solo usuarios registrados)
// Aquí añadimos 'authenticateToken'
app.post('/api/switch/create', authenticateToken, async (req, res) => {
  try {
    const { recipientEmail, encryptedContent, checkInFrequency } = req.body;
    const newSwitch = await prisma.switch.create({
      data: {
        recipientEmail,
        encryptedContent,
        checkInFrequency: parseInt(checkInFrequency),
        // Podríamos guardar req.user.id aquí si actualizamos el schema luego
      }
    });
    res.json({ id: newSwitch.id });
  } catch (error) {
    res.status(500).json({ error: 'Error creando switch' });
  }
});

app.post('/api/switch/checkin', authenticateToken, async (req, res) => {
  try {
    const { id } = req.body;
    // Opcional: Verificar que el switch pertenece al usuario logueado (req.user.id)
    await prisma.switch.update({
      where: { id },
      data: { lastCheckIn: new Date() }
    });
    res.json({ status: 'Vida confirmada' });
  } catch (error) {
    res.status(404).json({ error: 'Switch no encontrado' });
  }
});

// ➤ ANON MAIL (Simulado)
app.post('/api/email', async (req, res) => {
    res.json({ status: 'Enviado (Simulación)' });
});

// --- 6. TAREAS AUTOMÁTICAS ---
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

// --- 7. START ---
app.listen(PORT, () => console.log(`🚀 ZYPHRO Backend listo en puerto ${PORT}`));