import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

const router = express.Router();
const prisma = new PrismaClient();

// OBTENER CONFIGURACIÓN
router.get('/config', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener configuración" });
  }
});

// ACTUALIZAR CONFIGURACIÓN
router.post('/update', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { switchEnabled, recipientEmail, checkInInterval, dmsNote } = req.body;
    
    // ESTO ES PARA DEPURAR: Mira la terminal de tu backend al dar a guardar
    console.log("📥 Datos recibidos en el servidor:", req.body);

    const updated = await prisma.user.update({
      where: { id: req.auth.userId },
      data: { 
        switchEnabled, 
        recipientEmail, 
        checkInInterval: parseInt(checkInInterval),
        dmsNote: dmsNote, // <--- Asegúrate de que esta línea esté así
        lastCheckIn: new Date(), 
        dmsStatus: "IDLE" 
      }
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("🔥 Error en el guardado:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// CHECK-IN MANUAL
router.post('/checkin', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.auth.userId },
      data: { lastCheckIn: new Date(), dmsStatus: "IDLE" }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;