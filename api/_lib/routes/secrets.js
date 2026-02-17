import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/secrets/create -> Crear mensaje con XChaCha20
router.post('/create', async (req, res) => {
  try {
    const { content, nonce, viewOnce } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Contenido cifrado obligatorio' });
    }

    // Configuración de caducidad (24 horas por defecto)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newSecret = await prisma.secret.create({
      data: {
        title: "Mensaje Efímero",
        type: "note", // Lo marcamos como nota para diferenciarlo de archivos
        content: content,
        nonce: nonce || null,
        expiresAt: expiresAt,
        // Usamos fileName como metadato temporal para saber si es "Burn on Read"
        fileName: viewOnce ? "view-once" : "standard", 
        userId: null // Los mensajes de Drop son anónimos por defecto
      }
    });

    res.json({ id: newSecret.id });
  } catch (error) {
    console.error("🔥 Error en Neon:", error);
    res.status(500).json({ error: 'Fallo en la infraestructura de seguridad', details: error.message });
  }
});

// GET /api/secrets/:id -> Lectura y Autodestrucción
router.get('/:id', async (req, res) => {
  try {
    const secret = await prisma.secret.findUnique({ where: { id: req.params.id } });

    if (!secret) return res.status(404).json({ error: 'No encontrado' });

    // IMPORTANTE: Envía expiresAt y fileName (para saber si es view-once o 24h)
    res.json({ 
      content: secret.content,
      nonce: secret.nonce,
      expiresAt: secret.expiresAt, // 👈 Esto activa el contador
      fileName: secret.fileName    // 👈 Esto quita el mensaje de "borrado" erróneo
    });

    // Si es de un solo uso, lo borramos DESPUÉS de enviar la respuesta
    if (secret.fileName === "view-once") {
      await prisma.secret.delete({ where: { id: secret.id } });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error' });
  }
});

export default router;