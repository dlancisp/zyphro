// api/_lib/controllers/vortexController.js
import { prisma } from "../../db.js";

// --- CREAR VÓRTICE (Público y Anónimo) ---
export const createVortex = async (req, res) => {
  try {
    // 1. Definimos primero el userId
    const userId = req.auth?.userId || null;
    const { content, type, expirationHours, maxViews } = req.body;

    if (!content) return res.status(400).json({ error: "El contenido no puede estar vacío" });

    // 2. SOLUCIÓN AL ERROR P2003 & EMAIL MISSING
    // Aseguramos que el usuario existe antes de crear el secreto
    if (userId) {
      await prisma.user.upsert({
        where: { id: userId },
        update: {}, // Si ya existe, no tocamos nada
        create: { 
          id: userId,
          email: `${userId}@zyphro.local`, // Email técnico para validar el esquema
          dmsStatus: "IDLE" 
        }
      });
    }

    // 3. Calcular Fecha de Expiración
    const hours = Math.min(parseInt(expirationHours) || 24, 720); 
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);

    // 4. Calcular Límite de Visitas
    const views = Math.min(parseInt(maxViews) || 1, 100);

    // 5. Guardar el Secreto
    const newSecret = await prisma.secret.create({
      data: {
        userId: userId,
        title: "Secure Drop",
        type: type || "text",
        content: content,
        expiresAt: expiresAt,
        maxViews: views,
        viewCount: 0
      }
    });

    res.status(200).json({
      success: true,
      vortexId: newSecret.id
    });

  } catch (error) {
    console.error("Error createVortex:", error);
    res.status(500).json({ error: "Fallo al crear el vórtice en el servidor" });
  }
};

// --- LEER Y DESTRUIR ---
export const getVortex = async (req, res) => {
  try {
    const { id } = req.params;

    const secret = await prisma.secret.findUnique({
      where: { id }
    });

    if (!secret) return res.status(404).json({ error: "Vórtice no encontrado" });

    // Validar Expiración
    if (new Date() > new Date(secret.expiresAt)) {
      await prisma.secret.delete({ where: { id } }).catch(() => {});
      return res.status(410).json({ error: "Caducado y destruido" });
    }

    // Validar Límite
    if (secret.viewCount >= secret.maxViews) {
      await prisma.secret.delete({ where: { id } }).catch(() => {});
      return res.status(410).json({ error: "Límite alcanzado" });
    }

    // Incrementar visita
    const updatedSecret = await prisma.secret.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });
    
    // Auto-quema si es la última
    if (updatedSecret.viewCount >= secret.maxViews) {
      await prisma.secret.delete({ where: { id } }).catch(() => {});
    }

    res.json({
      title: secret.title,
      content: secret.content,
      expiresAt: secret.expiresAt,
      remainingViews: Math.max(0, secret.maxViews - updatedSecret.viewCount)
    });

  } catch (error) {
    console.error("Error getVortex:", error);
    res.status(500).json({ error: "Error de servidor" });
  }
};

// --- HEARTBEAT ---
export const heartbeat = async (req, res) => {
    try {
      if (!req.auth?.userId) return res.status(401).json({ error: "No autorizado" });
      const { userId } = req.auth;
      
      await prisma.user.update({
        where: { id: userId },
        data: { lastCheckIn: new Date(), dmsStatus: "IDLE" }
      });
      
      res.json({ success: true, message: "Latido registrado" });
    } catch (error) {
      console.error("Error heartbeat:", error);
      res.status(500).json({ error: "Error en el latido" });
    }
};

// --- OBTENER VÓRTICES DEL USUARIO (Dashboard) ---
export const getUserVortices = async (req, res) => {
  try {
    if (!req.auth?.userId) return res.status(401).json({ error: "No autorizado" });
    const { userId } = req.auth;

    const vortices = await prisma.secret.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        expiresAt: true,
        maxViews: true,
        viewCount: true,
        createdAt: true,
      }
    });

    res.json(vortices);
  } catch (error) {
    console.error("Error getUserVortices:", error);
    res.status(500).json({ error: "Error al recuperar tus vórtices" });
  }
};