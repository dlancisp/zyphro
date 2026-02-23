// backend/_lib/routes/mail.js
import express from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { prisma } from '../../db.js';
import { simpleParser } from 'mailparser';

const router = express.Router();

/**
 * Genera un string aleatorio para el alias
 */
function generateRandomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// --- 1. RUTA: LISTAR ALIAS CON TIEMPO RESTANTE ---
router.get('/aliases', ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  try {
    const aliases = await prisma.anon_aliases.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });

    const aliasesWithTime = aliases.map(alias => {
      const now = new Date();
      const expires = new Date(alias.expires_at);
      const diffMs = expires - now;
      const timeLeftMinutes = Math.max(0, Math.floor(diffMs / 60000));
      
      return {
        ...alias,
        timeLeftMinutes 
      };
    });

    res.json(aliasesWithTime);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener alias" });
  }
});

// --- 2. RUTA: GENERAR NUEVO ALIAS (CON LÍMITE DE 3) ---
router.post('/generate', ClerkExpressRequireAuth(), async (req, res) => {
  const { durationMinutes } = req.body;
  const userId = req.auth.userId;

  try {
    // Verificamos el límite de 3 para usuarios FREE
    const count = await prisma.anon_aliases.count({
      where: { user_id: userId }
    });

    if (count >= 3) {
      return res.status(403).json({ 
        error: "Límite alcanzado", 
        message: "Has alcanzado el límite de 3 alias activos. Elimina uno para crear otro." 
      });
    }

    const alias = `${generateRandomString(8)}@zyphro.com`;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (parseInt(durationMinutes) || 60));

    const newAlias = await prisma.anon_aliases.create({
      data: {
        user_id: userId,
        alias_email: alias,
        expires_at: expiresAt
      }
    });
    res.json(newAlias);
  } catch (err) {
    console.error("Error al generar:", err);
    res.status(500).json({ error: "No se pudo crear el alias" });
  }
});

// --- 3. RUTA: ELIMINAR UN ALIAS COMPLETO ---
router.delete('/aliases/:aliasId', ClerkExpressRequireAuth(), async (req, res) => {
  const { aliasId } = req.params;
  const userId = req.auth.userId;

  try {
    // 1. Borramos primero los mensajes de ese alias (Integridad referencial)
    await prisma.received_emails.deleteMany({
      where: { alias_id: parseInt(aliasId) }
    });

    // 2. Borramos el alias asegurándonos de que sea del usuario
    await prisma.anon_aliases.delete({
      where: { 
        id: parseInt(aliasId),
        user_id: userId 
      }
    });

    res.json({ success: true, message: "Nodo de identidad destruido" });
  } catch (err) {
    console.error("Error al eliminar alias:", err);
    res.status(500).json({ error: "No se pudo eliminar el alias" });
  }
});

// --- 4. RUTA: OBTENER MENSAJES ---
router.get('/messages/:aliasId', ClerkExpressRequireAuth(), async (req, res) => {
  const { aliasId } = req.params;
  try {
    const messages = await prisma.received_emails.findMany({
      where: { alias_id: parseInt(aliasId) },
      orderBy: { received_at: 'desc' }
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
});

// --- 5. RUTA: ELIMINAR CORREO INDIVIDUAL ---
router.delete('/messages/:messageId', ClerkExpressRequireAuth(), async (req, res) => {
  const { messageId } = req.params;
  try {
    await prisma.received_emails.delete({
      where: { id: parseInt(messageId) }
    });
    res.json({ success: true, message: "Correo eliminado" });
  } catch (err) {
    res.status(500).json({ error: "No se pudo eliminar el correo" });
  }
});

// --- 6. RUTA: WEBHOOK (RECEPCIÓN EXTERNA) ---
router.post('/webhook', async (req, res) => {
  const { recipient, sender, 'body-html': rawEmail } = req.body;
  try {
    const parsed = await simpleParser(rawEmail);
    const aliasNode = await prisma.anon_aliases.findFirst({
      where: { alias_email: recipient.toLowerCase().trim() }
    });

    if (!aliasNode) return res.status(404).send("Alias inexistente");

    // Bloqueo de recepción si ha expirado
    if (new Date() > new Date(aliasNode.expires_at)) {
      console.log("⏳ Entrega rechazada: Alias expirado:", recipient);
      return res.status(410).send("Alias expirado");
    }

    await prisma.received_emails.create({
      data: {
        alias_id: Number(aliasNode.id), 
        from_address: sender || parsed.from?.text || 'Desconocido',
        subject: parsed.subject || '(Sin asunto)',
        body_html: parsed.html || parsed.textAsHtml || parsed.text || 'Contenido vacío'
      }
    });

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;