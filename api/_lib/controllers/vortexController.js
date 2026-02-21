// api/_lib/controllers/vortexController.js
import { prisma } from "../../db.js";

// --- CREAR VÓRTICE (Público y Anónimo) ---
export const createVortex = async (req, res) => {

  if (userId) {
  await prisma.user.upsert({
    where: { id: userId },
    update: {}, 
    create: { 
      id: userId,
      // Creamos un email técnico para cumplir con la validación de Prisma
      email: `${userId}@zyphro.local`, 
      dmsStatus: "IDLE"
    }
  });
}


  try {
    const userId = req.auth?.userId || null;
    const { content, type, expirationHours, maxViews } = req.body;

    if (!content) return res.status(400).json({ error: "El contenido no puede estar vacío" });

    // --- SOLUCIÓN AL ERROR P2003: Asegurar que el usuario existe en Postgres ---
    if (userId) {
      await prisma.user.upsert({
        where: { id: userId },
        update: {}, // Si existe no hace nada
        create: { 
          id: userId,
          dmsStatus: "IDLE" // Ajusta según los campos de tu modelo User
        }
      });
    }

    // 1. Calcular Fecha de Expiración
    const hours = Math.min(parseInt(expirationHours) || 24, 720); 
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);

    // 2. Calcular Límite de Visitas
    const views = Math.min(parseInt(maxViews) || 1, 100);

    // 3. Guardar en Base de Datos
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

    if (new Date() > new Date(secret.expiresAt)) {
      await prisma.secret.delete({ where: { id } }).catch(() => {});
      return res.status(410).json({ error: "Caducado y destruido" });
    }

    if (secret.viewCount >= secret.maxViews) {
      await prisma.secret.delete({ where: { id } }).catch(() => {});
      return res.status(410).json({ error: "Límite alcanzado" });
    }

    const updatedSecret = await prisma.secret.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });
    
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
      if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ error: "No autorizado" });
      }

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

// --- OBTENER VÓRTICES DEL USUARIO ---
export const getUserVortices = async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: "No autorizado" });
    }

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