import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

const router = express.Router();
const prisma = new PrismaClient();

// OBTENER CONFIGURACIÓN (El frontend la pide al cargar)
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

// ACTUALIZAR CONFIGURACIÓN (Cuando das a Guardar)
router.post('/update', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { switchEnabled, recipientEmail, checkInInterval } = req.body;
    
    const updated = await prisma.user.update({
      where: { id: req.auth.userId },
      data: { 
        switchEnabled, 
        recipientEmail, 
        checkInInterval: parseInt(checkInInterval),
        lastCheckIn: new Date(), // El guardado cuenta como señal de vida
        dmsStatus: "IDLE" // Reiniciamos estado si estaba en alerta
      }
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error en Update DMS:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CHECK-IN MANUAL (CONFIRMAR VIDA)
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