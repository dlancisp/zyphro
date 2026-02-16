import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const hybridAuth = async (req, res, next) => {
  try {
    // 1. Miramos si trae una credencial de Máquina (API Key)
    const apiKeyHeader = req.headers['x-api-key'];

    if (apiKeyHeader) {
      // --- CAMINO B2B (MÁQUINA/SDK) ---

      // Buscamos la llave en la base de datos
      const keyRecord = await prisma.apiKey.findUnique({
        where: { key: apiKeyHeader },
        include: { user: true }
      });

      // Validaciones de seguridad
      if (!keyRecord) {
        return res.status(401).json({ error: "API Key inválida" });
      }
      if (!keyRecord.isEnabled) {
        return res.status(403).json({ error: "API Key revocada o desactivada" });
      }

      // Control de Cuotas (Billing)
      if (keyRecord.requestsUsed >= keyRecord.requestsLimit) {
        return res.status(429).json({ error: "Límite de cuota excedido" });
      }

      // Actualizamos el contador de uso (Fire & Forget)
      prisma.apiKey.update({
        where: { id: keyRecord.id },
        data: { 
          requestsUsed: { increment: 1 },
          lastUsedAt: new Date()
        }
      }).catch(err => console.error("Error métricas:", err));

      // Inyectamos la identidad
      req.auth = { userId: keyRecord.userId };
      req.isMachine = true; // Marca para saber que es una automatización
      
      return next(); // Pasa al siguiente paso
    }

    // 2. Si NO hay API Key, asumimos que es un Humano (Web)
    // Usamos Clerk para validar la sesión del navegador
    return ClerkExpressRequireAuth()(req, res, next);

  } catch (error) {
    console.error("Error en Hybrid Auth:", error);
    return res.status(500).json({ error: "Error de autenticación interna" });
  }
};