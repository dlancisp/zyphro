// api/_lib/controllers/vortexController.js
import { prisma } from "../../db.js";

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
  // Definimos un error genérico para no dar pistas al atacante
  const GENERIC_ERROR = "Vórtice no disponible o inexistente";

  try {
    const { id } = req.params;

    const secret = await prisma.secret.findUnique({ where: { id } });

    // 1. Si no existe, error ciego
    if (!secret) return res.status(404).json({ error: GENERIC_ERROR });

    // 2. Si expiró por tiempo
    if (new Date() > new Date(secret.expiresAt)) {
      await prisma.secret.delete({ where: { id } }).catch(() => {});
      return res.status(404).json({ error: GENERIC_ERROR }); // Usamos 404 en lugar de 410 para ser ciegos
    }

    // 3. Si ya alcanzó el límite de vistas antes de esta petición
    if (secret.viewCount >= secret.maxViews) {
      await prisma.secret.delete({ where: { id } }).catch(() => {});
      return res.status(404).json({ error: GENERIC_ERROR });
    }

    // 4. Procesar la lectura
    const updatedSecret = await prisma.secret.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });
    
    // Auto-quema si es la última visita permitida
    if (updatedSecret.viewCount >= secret.maxViews) {
      await prisma.secret.delete({ where: { id } }).catch(() => {});
    }

    // Devolvemos solo lo necesario
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

// --- LIMPIEZA AUTOMÁTICA (CRON JOB) ---
export const cleanupVortices = async (req, res) => {
  // SEGURIDAD: Solo permitimos que Vercel ejecute esto
  const isVercelCron = req.headers['x-vercel-cron'] === '1';
  const isDev = process.env.NODE_ENV !== 'production';

  if (!isVercelCron && !isDev) {
    return res.status(401).json({ error: "Acceso denegado al sistema de limpieza" });
  }

  try {
    const now = new Date();

    // Borramos lo que caducó por tiempo O lo que ya se leyó el máximo de veces
    const deleted = await prisma.secret.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          // Si viewCount es igual o mayor al máximo permitido, fuera.
          { viewCount: { gte: prisma.secret.fields.maxViews } }
        ]
      }
    });

    console.log(`[CRON] Limpieza completada: ${deleted.count} eliminados.`);
    res.status(200).json({ success: true, count: deleted.count });
  } catch (error) {
    console.error("Error Cron:", error);
    res.status(500).json({ error: "Error interno en limpieza" });
  }
};