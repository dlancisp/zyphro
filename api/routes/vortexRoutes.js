import express from "express";
import { hybridAuth } from "../middlewares/hybridAuth.js"; // Importamos nuestro portero
// Aquí importarías tus controladores (createVortex, getVortex, etc.)
// import { createVortex, getVortex } from "../controllers/vortexController.js";

const router = express.Router();

// --- RUTAS PROTEGIDAS CON SISTEMA HÍBRIDO ---

// 1. Crear un Vórtice (Subir archivo/secreto)
// Funciona para: Tu Web (Clerk) Y para Scripts Python de clientes (API Key)
router.post("/create", hybridAuth, (req, res) => {
    // Aquí iría la lógica del controlador (createVortex)
    // De momento ponemos un placeholder para probar
    res.json({ 
        success: true, 
        message: "Vórtice creado", 
        user: req.auth.userId,
        mode: req.isMachine ? "B2B API" : "Web Interface"
    });
});

// 2. Consultar estado (Heartbeat para DMS)
router.post("/heartbeat", hybridAuth, (req, res) => {
    // Lógica futura del Dead Man Switch
    res.json({ status: "alive", checked_at: new Date() });
});

export default router;