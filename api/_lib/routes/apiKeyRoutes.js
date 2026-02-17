// api/routes/apiKeyRoutes.js

import express from "express";
import { createApiKey, listApiKeys, revokeApiKey } from "../controllers/apiKeyController.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const router = express.Router();

// Middleware de seguridad: Solo usuarios logueados con Clerk pueden gestionar sus keys
router.post("/create", ClerkExpressRequireAuth(), createApiKey);
router.get("/list", ClerkExpressRequireAuth(), listApiKeys);
router.delete("/revoke/:id", ClerkExpressRequireAuth(), revokeApiKey);

export default router;