import express from "express";
import { prisma } from "../../db.js";
import { hybridAuth } from "../middlewares/hybridAuth.js"; 
import { 
  createVortex, 
  heartbeat, 
  getVortex, 
  getUserVortices, 
  cleanupVortices 
} from "../controllers/vortexController.js"; 
import { ClerkExpressRequireAuth, ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

const router = express.Router();

// --- 1. RUTAS DE USUARIO (DASHBOARD) ---
router.get("/user", ClerkExpressRequireAuth(), getUserVortices);

// --- 2. RUTAS DE SISTEMA Y CRON (AUTOMATIZACIÓN) ---
// Esta es la ruta que llamará Vercel cada hora
router.get("/cleanup", cleanupVortices);

// --- 3. CREACIÓN Y LECTURA ---
router.post("/create", ClerkExpressWithAuth(), createVortex); 
router.get("/get/:id", getVortex);

// --- 4. UTILIDADES Y SEGURIDAD ---
router.post("/heartbeat", hybridAuth, heartbeat);

// RUTA PARA BORRAR VÓRTICE (Manual)
router.delete("/delete/:id", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.auth;

    const secret = await prisma.secret.findUnique({ where: { id } });

    if (!secret) return res.status(404).json({ error: "Vórtice no encontrado" });

    if (secret.userId !== userId) {
      return res.status(403).json({ error: "No autorizado" });
    }

    await prisma.secret.delete({ where: { id } });
    res.json({ success: true, message: "Vórtice destruido" });
  } catch (error) {
    console.error("Error al borrar:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;