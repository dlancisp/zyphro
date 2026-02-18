// api/_lib/controllers/vortexController.js
import { prisma } from "../../db.js";

// --- CREAR VÓRTICE (Público y Anónimo) ---
export const createVortex = async (req, res) => {
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
export const getVortex = async (req, res) => {
  try {
    const { id } = req.params;

    const secret = await prisma.secret.findUnique({
      where: { id }
    });

    // Validar existencia
    if (!secret) {
      return res.status(404).json({ error: "Vórtice no encontrado o ya destruido" });
    }

    // 1. Validar Expiración por Tiempo
    if (new Date() > new Date(secret.expiresAt)) {
      await prisma.secret.delete({ where: { id } }); // Borrado diferido (lazy delete)
      return res.status(410).json({ error: "Este mensaje ha caducado por tiempo" });
    }

    // 2. Validar Límite de Visitas
    if (secret.viewCount >= secret.maxViews) {
      await prisma.secret.delete({ where: { id } });
      return res.status(410).json({ error: "Este mensaje ya ha superado el límite de lecturas" });
    }

    // 3. Incrementar contador (Atómico)
    // Incrementamos ANTES de devolver para asegurar que cuenta esta visita
    const updatedSecret = await prisma.secret.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    // 4. Comprobación post-lectura (Auto-quema inmediata si era la última)
    // Si era de 1 solo uso, o si acabamos de llegar al límite, 
    // podríamos borrarlo ya, o dejar que el próximo intento lo borre.
    // Para mayor seguridad (y liberar espacio), si ya llegó al tope, borramos:
    if (updatedSecret.viewCount >= secret.maxViews) {
       // Opcional: Borrar inmediatamente tras enviar la respuesta, 
       // o dejarlo para el próximo intento (actualmente se borra al próximo intento).
    }

    // 5. Devolver datos
    res.json({
      title: secret.title,
      content: secret.content,
      expiresAt: secret.expiresAt,
      remainingViews: Math.max(0, secret.maxViews - updatedSecret.viewCount)
    });

  } catch (error) {
    console.error("Error getVortex:", error);
    res.status(500).json({ error: "Error al recuperar el mensaje" });
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