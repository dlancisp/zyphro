import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ACTIVAR / ACTUALIZAR SWITCH
router.post('/', async (req, res) => {
  try {
    const { userId, recipientEmail, note, interval } = req.body;

    if (!userId || !recipientEmail || !note) {
      return res.status(400).json({ success: false, error: 'Faltan datos críticos' });
    }

    const intervalDays = parseInt(interval);

    const result = await prisma.user.upsert({
      where: { id: userId },
      update: {
        recipientEmail,
        dmsNote: note, // Ajustado al nombre del campo en tu schema
        checkInInterval: intervalDays,
        switchEnabled: true,
        lastCheckIn: new Date(),
      },
      create: {
        id: userId,
        email: `user_${userId}@zyphro.com`,
        password: "CLERK_AUTH_EXTERNAL", // Placeholder para bypass de Prisma
        recipientEmail,
        dmsNote: note,
        checkInInterval: intervalDays,
        switchEnabled: true,
        lastCheckIn: new Date(),
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
router.get('/status/:userId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json(null);
  }
});

export default router; // 👈 Único export válido para tu configuración