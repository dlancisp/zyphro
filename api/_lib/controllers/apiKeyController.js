//import { PrismaClient } from "@prisma/client";
import { prisma } from "../../prisma.js";
import crypto from "crypto"; 

//const prisma = new PrismaClient();

// Generar una nueva API Key
export const createApiKey = async (req, res) => {
  try {
    const { userId } = req.auth; 
    // AHORA RECIBIMOS EL EMAIL TAMBIÉN
    const { name, email } = req.body;   

    if (!userId) return res.status(401).json({ error: "No autorizado" });

    // ---------------------------------------------------------
    // 🛠️ EL ARREGLO (LA MAGIA): Sincronizar Usuario
    // Antes de crear la llave, nos aseguramos de que el usuario existe en Neon.
    // Si no existe, lo creamos al vuelo.
    // ---------------------------------------------------------
    await prisma.user.upsert({
      where: { id: userId },
      update: {}, // Si ya existe, no hacemos nada (todo bien)
      create: {
        id: userId,
        email: email || `user_${userId}@zyphro.temp`, // Fallback por seguridad
        plan: "FREE"
      }
    });

    // 1. Generamos un hash seguro y único
    const rawKey = crypto.randomBytes(32).toString("hex");
    const apiKeyString = `sk_live_${rawKey}`;

    // 2. Guardamos en la DB (Ahora sí funcionará porque el usuario existe)
    const newKey = await prisma.apiKey.create({
      data: {
        key: apiKeyString,
        name: name || "Default Key",
        userId: userId,
        requestsLimit: 1000, 
      },
    });

    // 3. Devolvemos la key 
    res.status(201).json({ 
      success: true, 
      apiKey: newKey.key,
      id: newKey.id 
    });

  } catch (error) {
    console.error("Error creando API Key:", error);
    // Devolvemos el mensaje del error para verlo en el frontend si pasa algo
    res.status(500).json({ error: error.message || "Error interno de infraestructura" });
  }
};

// Listar las API Keys del usuario
export const listApiKeys = async (req, res) => {
  try {
    const { userId } = req.auth;
    
    const keys = await prisma.apiKey.findMany({
      where: { userId: userId },
      select: {
        id: true,
        name: true,
        key: true,
        isEnabled: true,
        requestsUsed: true,
        createdAt: true
      }
    });

    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo keys" });
  }
};

// Revocar API Key
export const revokeApiKey = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;

    await prisma.apiKey.deleteMany({
      where: { 
        id: id,
        userId: userId 
      }
    });

    res.json({ success: true, message: "Key revocada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error revocando key" });
  }
};