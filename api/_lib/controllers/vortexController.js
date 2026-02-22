import { prisma } from "../../db.js";
// Importamos la utilidad del DMS para unificarla en un solo Cron Job
import { checkDeadManSwitches } from '../utils/deathClock.js';

// --- CREAR VÓRTICE ---
export const createVortex = async (req, res) => {
  try {
    const userId = req.auth?.userId || null;
    const { content, type, expirationHours, maxViews } = req.body;

    if (!content) return res.status(400).json({ error: "Contenido requerido" });

    if (userId) {
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { 
          id: userId,
          email: `${userId}@zyphro.local`,
          dmsStatus: "IDLE" 
        }
      });
    }

    const hours = Math.min(parseInt(expirationHours) || 24, 720); 
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);

    const views = Math.min(parseInt(maxViews) || 1, 100);

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

    res.status(200).json({ success: true, vortexId: newSecret.id });

  } catch (error) {
    console.error("Error createVortex:", error);
    res.status(500).json({ error: "Error en la creación del vórtice" });
  }
};

// --- LEER Y DESTRUIR (Blindado con Errores Ciegos) ---
export const getVortex = async (req, res) => {
  const GENERIC_ERROR = "Vórtice no disponible o inexistente";

  try {
    const { id } = req.params;

    const secret = await prisma.secret.findUnique({ where: { id } });

    if (!secret) return res.status(404).json({ error: GENERIC_ERROR });

    if (new Date() > new Date(secret.expiresAt)) {
      await prisma.secret.delete({ where: { id } }).catch(() => {});
      return res.status(404).json({ error: GENERIC_ERROR });
    }

    if (secret.viewCount >= secret.maxViews) {
      await prisma.secret.delete({ where: { id } }).catch(() => {});
      return res.status(404).json({ error: GENERIC_ERROR });
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
    res.status(500).json({ error: "Error interno" });
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
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error de sincronización" });
    }
};

// --- OBTENER VÓRTICES (Dashboard) ---
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
    res.status(500).json({ error: "Error de recuperación" });
  }
};

// --- MANTENIMIENTO UNIFICADO (CRON JOB) ---
export const cleanupVortices = async (req, res) => {
  const isVercelCron = req.headers['x-vercel-cron'] === '1';
  const isDev = process.env.NODE_ENV !== 'production';

  if (!isVercelCron && !isDev) {
    return res.status(401).json({ error: "Acceso denegado" });
  }

  try {
    const now = new Date();

    // 1. Limpieza de Vórtices caducados o agotados
    const deleted = await prisma.secret.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { viewCount: { gte: prisma.secret.fields.maxViews } }
        ]
      }
    });

    // 2. Ejecutar chequeo del Dead Man's Switch
    await checkDeadManSwitches();

    console.log(`[CRON] Mantenimiento completado: ${deleted.count} secretos eliminados y DMS procesado.`);
    res.status(200).json({ 
      success: true, 
      count: deleted.count,
      dms: "OK" 
    });
  } catch (error) {
    console.error("Error Cron Unificado:", error);
    res.status(500).json({ error: "Error interno en mantenimiento" });
  }
};