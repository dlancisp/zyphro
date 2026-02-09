// api/routes/vault.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware de seguridad manual (por si Clerk no lo inyectó globalmente)
const requireAuth = (req, res, next) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ error: 'Acceso denegado: No autenticado' });
  }
  next();
};

// ➤ 1. OBTENER MI BÓVEDA (GET /api/vault)
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;

    const items = await prisma.secret.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      // Solo devolvemos info básica para la lista, no el contenido cifrado
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true
      }
    });

    res.json(items);
  } catch (error) {
    console.error("Error al obtener la bóveda:", error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ➤ 2. GUARDAR EN LA BÓVEDA (POST /api/vault)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, type, content, nonce } = req.body;
    const userId = req.auth.userId;

    if (!title || !content || !type) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const newItem = await prisma.secret.create({
      data: {
        userId,
        title,
        type,      // 'password', 'note', 'crypto'
        content,   // Ciphertext
        nonce      // Nonce de XChaCha20
      }
    });

    res.json(newItem);
  } catch (error) {
    console.error("Error al guardar en bóveda:", error);
    res.status(500).json({ error: 'Error al guardar el secreto' });
  }
});

module.exports = router;