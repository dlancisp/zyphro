// server/index.js
// 1. Bypass DNS (Vital para tu error de conexión)
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));

// 2. Tu Enlace (Asegúrate que la contraseña sea zyph1234 y no <password>)
const MONGO_URI = 'mongodb+srv://zyphadmin:zyph1234@zyph0.jclpy2u.mongodb.net/?appName=zyph0';

// Modelos
const Secret = mongoose.model('Secret', new mongoose.Schema({
  cipherText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 }
}));

const Switch = mongoose.model('Switch', new mongoose.Schema({
  userEmail: String,
  recipientEmail: String,
  encryptedContent: String,
  checkInFrequency: Number,
  lastCheckIn: { type: Date, default: Date.now },
  status: { type: String, default: 'active' }
}));

// Email Simulado
async function sendEmail(to, subject, text) {
  console.log(`📧 [EMAIL] A: ${to} | Asunto: ${subject}`);
}

// 3. CONEXIÓN SEGURA + INICIO DE CRON (Solo inicia si hay DB)
console.log('⏳ Conectando DB...');
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('🟢 [DB] CONEXIÓN EXITOSA');
    
    // El Cron Job solo arranca AHORA, no antes
    cron.schedule('* * * * *', async () => {
      try {
        const switches = await Switch.find({ status: 'active' });
        const now = new Date();
        switches.forEach(async (s) => {
          const deadline = new Date(s.lastCheckIn.getTime() + s.checkInFrequency * 60000);
          if (now > deadline) {
            console.log(`💀 Switch ${s._id} activado.`);
            await sendEmail(s.recipientEmail, 'ZYPH ALERT', s.encryptedContent);
            s.status = 'triggered';
            await s.save();
          }
        });
      } catch (e) { console.error('Error en Cron:', e.message); }
    });
  })
  .catch(err => console.error('🔴 [DB] Error:', err.message));

// Rutas
app.post('/api/secret', async (req, res) => {
  const newSecret = await Secret.create({ cipherText: req.body.cipherText });
  res.json({ id: newSecret._id });
});

app.get('/api/secret/:id', async (req, res) => {
  const secret = await Secret.findByIdAndDelete(req.params.id);
  if (!secret) return res.status(404).json({ error: 'No encontrado' });
  res.json({ cipherText: secret.cipherText });
});

app.post('/api/email', async (req, res) => {
  await sendEmail(req.body.to, req.body.subject, req.body.message);
  res.json({ success: true });
});

app.post('/api/switch/create', async (req, res) => {
  const newSwitch = await Switch.create(req.body);
  res.json({ id: newSwitch._id });
});

app.post('/api/switch/checkin', async (req, res) => {
  const s = await Switch.findById(req.body.id);
  if (s) { s.lastCheckIn = new Date(); await s.save(); }
  res.json({ success: true });
});

app.listen(4000, '0.0.0.0', () => console.log('🚀 ZYPH SUITE ONLINE'));