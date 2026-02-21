// api/_lib/controllers/vortexController.js
import { prisma } from "../../db.js";

// --- CREAR VÓRTICE (Público y Anónimo) ---
export const createVortex = async (req, res) => {
  console.log("¿Token presente?:", req.headers.authorization ? "SÍ" : "NO");
  console.log("ID de Usuario Clerk:", req.auth?.userId || "NULL");
  try {
    // CORRECCIÓN CRÍTICA: Manejo seguro de usuario anónimo
    // Si req.auth no existe, userId será null en lugar de lanzar error
    const userId = req.auth?.userId || null;
    
    const { content, type, expirationHours, maxViews } = req.body;

    if (!content) return res.status(400).json({ error: "El contenido no puede estar vacío" });

    // 1. Calcular Fecha de Expiración (Lógica Adri: Máx 30 días)
    // Si no envían nada, por defecto 24h. Máximo 720h (30 días).
    const hours = Math.min(parseInt(expirationHours) || 24, 720); 
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);

    // 2. Calcular Límite de Visitas (Lógica Adri: Máx 100 visitas)
    // Por defecto 1 visita.
    const views = Math.min(parseInt(maxViews) || 1, 100);

    // 3. Guardar en Base de Datos
    // Nota: Guardamos el 'content' tal cual llega (ya viene cifrado del frontend)
    const newSecret = await prisma.secret.create({
      data: {
        userId: userId,
        title: "Secure Drop",
        type: type || "text",
        content: content,     // Texto cifrado en el cliente
        expiresAt: expiresAt,
        maxViews: views,
        viewCount: 0
      }
    });

    // 4. Responder con el ID
    res.status(200).json({
      success: true,
      vortexId: newSecret.id
    });

  } catch (error) {
    console.error("Error createVortex:", error);
    res.status(500).json({ error: "Fallo al crear el vórtice en el servidor" });
  }
};

// --- LEER Y DESTRUIR (Lógica de acceso) ---
// --- LEER Y DESTRUIR (Versión Blindada) ---
export const getVortex = async (req, res) => {
  try {
    const { id } = req.params;

    const secret = await prisma.secret.findUnique({
      where: { id }
    });

    if (!secret) return res.status(404).json({ error: "Vórtice no encontrado" });

    // 1. Validar Expiración
    if (new Date() > new Date(secret.expiresAt)) {
      await prisma.secret.delete({ where: { id } });
      return res.status(410).json({ error: "Caducado y destruido" });
    }

    // 2. Validar Límite antes de procesar
    if (secret.viewCount >= secret.maxViews) {
      await prisma.secret.delete({ where: { id } });
      return res.status(410).json({ error: "Límite alcanzado" });
    }

    // 3. Incrementar visita
    const updatedSecret = await prisma.secret.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    
    // 4. Auto-quema inmediata si es la última visita
    if (updatedSecret.viewCount >= secret.maxViews) {
      await prisma.secret.delete({ where: { id } });
      // El mensaje se borra de la DB justo ANTES de enviarlo al usuario
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

// --- HEARTBEAT (Solo autenticados) ---
export const heartbeat = async (req, res) => {
    try {
      // Aquí SÍ requerimos autenticación, así que verificamos que exista userId
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

// --- OBTENER VÓRTICES DEL USUARIO (Para el Dashboard) ---
export const getUserVortices = async (req, res) => {
  try {
    // 1. Verificamos que el usuario esté logueado
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const { userId } = req.auth;

    // 2. Buscamos sus secretos en la DB
    const vortices = await prisma.secret.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }, // Los más nuevos primero
      select: {
        id: true,
        title: true,
        expiresAt: true,
        maxViews: true,
        viewCount: true,
        createdAt: true,
        // NO enviamos el content aquí para aligerar la carga del Dashboard
      }
    });

    res.json(vortices);
  } catch (error) {
    console.error("Error getUserVortices:", error);
    res.status(500).json({ error: "Error al recuperar tus vórtices" });
  }
};