const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  try {
    // AÑADE 'userEmail' si puedes enviarlo desde el frontend, si no usaremos el placeholder
    const { userId, recipientEmail, note, interval } = req.body;

    if (!userId || !recipientEmail || !note) {
      return res.status(400).json({ success: false, error: 'Faltan datos' });
    }

    const intervalDays = parseInt(interval);

    const result = await prisma.user.upsert({
      where: { id: userId },
      
      // CASO 1: El usuario YA existía -> Solo actualizamos datos
      update: {
        recipientEmail,
        note,
        checkInInterval: intervalDays,
        switchEnabled: true,
        lastCheckIn: new Date(),
        nextTriggerDate: new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000)
      },

      // CASO 2: El usuario es NUEVO -> Lo creamos de cero
      create: {
        id: userId,
        email: `usuario_${userId}@zyphro.com`, // Email temporal para no fallar
        
        // 👇👇 AQUÍ ESTÁ EL ARREGLO 👇👇
        password: "CLERK_AUTH_DISABLED_NO_PASSWORD_NEEDED", 
        // 👆👆 Le damos una contraseña falsa para cumplir el requisito de la DB
        
        recipientEmail,
        note,
        checkInInterval: intervalDays,
        switchEnabled: true,
        lastCheckIn: new Date(),
        nextTriggerDate: new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000)
      }
    });

    return res.json({ success: true, data: result });

  } catch (error) {
    console.error("🔥 Error en DMS:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// CHECK-IN MANUAL (CONFIRMAR VIDA)
router.post('/checkin', async (req, res) => {
  try {
    const { userId } = req.body;
    // Actualizamos la fecha de lastCheckIn
    await prisma.user.update({
      where: { id: userId },
      data: { lastCheckIn: new Date() }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// OBTENER ESTADO
router.get('/status', async (req, res) => {
    // Aquí necesitaríamos saber quién es el usuario.
    // Como simplificación por ahora devolveremos null para que no falle.
    res.json(null); 
});

module.exports = router;