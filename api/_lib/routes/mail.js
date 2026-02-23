// backend/_lib/routes/mail.js
import express from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { prisma } from '../../db.js'; // Importamos prisma con llaves porque es un export nombrado

const router = express.Router();

function generateRandomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generar con tiempo de vida
router.post('/generate', ClerkExpressRequireAuth(), async (req, res) => {
  const { durationMinutes } = req.body; // Recibimos 30, 60, etc.
  const userId = req.auth.userId;
  const alias = `${generateRandomString(8)}@tu-dominio.com`;
  
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + (durationMinutes || 60));

  try {
    const newAlias = await prisma.anon_aliases.create({
      data: {
        user_id: userId,
        alias_email: alias,
        expires_at: expiresAt
      }
    });
    res.json(newAlias);
  } catch (err) { res.status(500).send("Error"); }
});

// Obtener correos de un alias específico
router.get('/messages/:aliasId', ClerkExpressRequireAuth(), async (req, res) => {
  const { aliasId } = req.params;
  try {
    const messages = await prisma.received_emails.findMany({
      where: { alias_id: parseInt(aliasId) },
      orderBy: { received_at: 'desc' }
    });
    res.json(messages);
  } catch (err) { res.status(500).send("Error"); }
});

// RUTA: Webhook para recibir correos (Esta ruta NO lleva RequireAuth porque la llama un servidor externo)
router.post('/webhook', async (req, res) => {
  // Los campos dependen del proveedor, pero lo estándar es:
  const { recipient, sender, subject, 'body-html': bodyHtml, 'body-plain': bodyPlain } = req.body;

  try {
    // 1. Buscamos a quién pertenece ese alias
    const aliasNode = await prisma.anon_aliases.findUnique({
      where: { alias_email: recipient }
    });

    if (!aliasNode) {
      return res.status(404).send("Alias no encontrado o expirado");
    }

    // 2. Guardamos el mensaje en la tabla que creamos
    await prisma.received_emails.create({
      data: {
        alias_id: aliasNode.id,
        from_address: sender,
        subject: subject || '(Sin asunto)',
        body_html: bodyHtml || bodyPlain || 'Contenido vacío'
      }
    });

    res.status(200).send("Paquete interceptado");
  } catch (err) {
    console.error("Error en Webhook:", err);
    res.status(500).send("Fallo en la interceptación");
  }
});

export default router;