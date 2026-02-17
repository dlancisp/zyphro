import express from "express";
import { hybridAuth } from "../middlewares/hybridAuth.js"; 
import { createVortex, heartbeat } from "../controllers/vortexController.js"; 

const router = express.Router();

router.post("/create", hybridAuth, createVortex);

router.post("/heartbeat", hybridAuth, heartbeat);

export default router;