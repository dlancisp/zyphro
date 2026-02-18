import express from "express";
import { hybridAuth } from "../middlewares/hybridAuth.js"; 
import { createVortex, heartbeat, getVortex } from "../controllers/vortexController.js"; 

const router = express.Router();

// --- RUTA PÚBLICA (Sin registro) ---
// Quitamos hybridAuth para que cualquiera pueda crear un drop
router.post("/create", createVortex); 

// --- RUTAS PROTEGIDAS (Solo usuarios registrados/TI) ---
// El heartbeat sí debe ser privado porque afecta al perfil del usuario
router.post("/heartbeat", hybridAuth, heartbeat);

// --- RUTAS DE CONSULTA ---
router.get("/get/:id", getVortex);

export default router;