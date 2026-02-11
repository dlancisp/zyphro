const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/secret
router.post('/secret', async (req, res) => {
  try {
    console.log("📥 Recibiendo petición Secure Drop:", req.body);

    const { cipherText, nonce, ttl } = req.body;

    // Validación básica: Solo necesitamos el texto cifrado
    if (!cipherText) {
      console.error("❌ Falta cipherText");
      return res.status(400).json({ error: 'No se recibió el contenido cifrado' });
    }

    // Calcular caducidad (Default 24h)
    const timeToLive = ttl ? parseInt(ttl) : 86400;
    const expiresAt = new Date(Date.now() + timeToLive * 1000);

    // Guardar en DB
    const newSecret = await prisma.secret.create({
      data: {
        title: "Secure Drop",
        type: "drop",
        content: cipherText,
        // Si no hay nonce, guardamos null (la DB ahora lo permite gracias al paso 1)
        nonce: nonce || null, 
        expiresAt: expiresAt,
        userId: null
      }
    });

    console.log("✅ Drop creado con ID:", newSecret.id);
    res.json({ id: newSecret.id });

  } catch (error) {
    console.error("🔥 Error CRÍTICO en Drop:", error);
    // Devolvemos JSON siempre, nunca HTML, con detalles del error
    res.status(500).json({ 
      error: 'Error interno del servidor', 
      details: error.message 
    });
  }
});

// GET /api/secret/:id
router.get('/secret/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const secret = await prisma.secret.findUnique({ where: { id } });

    if (!secret) return res.status(404).json({ error: 'Secreto no encontrado' });

    // Burn on read
    await prisma.secret.delete({ where: { id } });

    res.json({ 
      cipherText: secret.content,
      nonce: secret.nonce 
    });

  } catch (error) {
    console.error("Error Lectura:", error);
    res.status(500).json({ error: 'Error al leer' });
  }
});

module.exports = router;