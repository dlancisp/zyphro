import express from "express";
import { prisma } from "../../db.js"; // IMPORTACIÓN CRÍTICA QUE FALTABA
import { hybridAuth } from "../middlewares/hybridAuth.js"; 
import { createVortex, heartbeat, getVortex, getUserVortices } from "../controllers/vortexController.js"; 
import { ClerkExpressRequireAuth, ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

const router = express.Router();

// 1. Dashboard: Solo para logueados
router.get("/user", ClerkExpressRequireAuth(), getUserVortices);

// 2. Creación: Captura al usuario si existe
router.post("/create", ClerkExpressWithAuth(), createVortex); 

// 3. Sistema
router.post("/heartbeat", hybridAuth, heartbeat);
router.get("/get/:id", getVortex);

// RUTA PARA BORRAR VÓRTICE (Arreglada)
router.delete("/delete/:id", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.auth;

    // Verificar si el secreto existe y pertenece al usuario
    const secret = await prisma.secret.findUnique({ where: { id } });

    if (!secret) return res.status(404).json({ error: "Vórtice no encontrado" });

    if (secret.userId !== userId) {
      return res.status(403).json({ error: "No autorizado para eliminar este secreto" });
    }

    await prisma.secret.delete({ where: { id } });
    
    res.json({ success: true, message: "Vórtice destruido permanentemente" });
  } catch (error) {
    console.error("Error al borrar:", error);
    res.status(500).json({ error: "Error interno al eliminar" });
  }
});

export default router;