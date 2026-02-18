import express from "express";
import { hybridAuth } from "../middlewares/hybridAuth.js"; 
// Importamos también 'getVortex' que acabamos de crear
import { createVortex, heartbeat, getVortex } from "../controllers/vortexController.js"; 

const router = express.Router();

// --- RUTAS PROTEGIDAS (Requieren Login o API Key) ---

// 1. Crear un Vórtice (Adri usa esta para generar el secreto)
router.post("/create", hybridAuth, createVortex);

// 2. Registrar Latido (Para el Dead Man Switch)
router.post("/heartbeat", hybridAuth, heartbeat);

// --- RUTAS PÚBLICAS (Cualquiera con el enlace/ID) ---

// 3. Obtener el Vórtice (El empleado usa esta para ver el secreto)
// El ID viene en la URL: /api/v1/vortex/get/ID_DEL_SECRETO
router.get("/get/:id", getVortex);

export default router;