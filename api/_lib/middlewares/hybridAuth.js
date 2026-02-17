import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { prisma } from "../../prisma.js";


export const hybridAuth = async (req, res, next) => {
  try {
    const apiKeyHeader = req.headers['x-api-key'];

    if (apiKeyHeader) {
      const keyRecord = await prisma.apiKey.findUnique({
        where: { key: apiKeyHeader },
        include: { user: true }
      });

      if (!keyRecord) {
        return res.status(401).json({ error: "API Key inválida" });
      }
      if (!keyRecord.isEnabled) {
        return res.status(403).json({ error: "API Key revocada o desactivada" });
      }

      if (keyRecord.requestsUsed >= keyRecord.requestsLimit) {
        return res.status(429).json({ error: "Límite de cuota excedido" });
      }

      // Actualizamos métricas de forma asíncrona
      prisma.apiKey.update({
        where: { id: keyRecord.id },
        data: { 
          requestsUsed: { increment: 1 },
          lastUsedAt: new Date()
        }
      }).catch(err => console.error("Error métricas:", err));

      req.auth = { userId: keyRecord.userId };
      req.isMachine = true; 
      
      return next();
    }

    // Si es un humano, Clerk hace el resto
    return ClerkExpressRequireAuth()(req, res, next);

  } catch (error) {
    console.error("Error en Hybrid Auth:", error);
    return res.status(500).json({ error: "Error de autenticación interna" });
  }
};