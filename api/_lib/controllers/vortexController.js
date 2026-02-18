// api/_lib/controllers/vortexController.js
import { prisma } from "../../prisma.js";
import { encryptSecret } from "../utils/crypto.js";
import sodium from 'libsodium-wrappers';

// api/_lib/controllers/vortexController.js

export const createVortex = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { title, content, type, expirationHours, maxViews } = req.body;

    if (!content) return res.status(400).json({ error: "Contenido vacío" });

    await sodium.ready;
    const secretKey = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES);
    const { ciphertext, nonce } = await encryptSecret(content, secretKey);

    // LÓGICA ADRI: 30 días max o 24h por defecto
    const hours = Math.min(parseInt(expirationHours) || 24, 720); 
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);

    // LÓGICA ADRI: 10 visitas max o 1 por defecto
    const views = Math.min(parseInt(maxViews) || 1, 100);

    const newSecret = await prisma.secret.create({
      data: {
        userId,
        title: title || "Mensaje Cifrado",
        content: ciphertext,
        nonce: nonce,
        type: type || "note",
        expiresAt: expiresAt,
        maxViews: views,
        viewCount: 0
      }
    });

    res.json({
      success: true,
      vortexId: newSecret.id,
      secretKey: sodium.to_hex(secretKey)
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Fallo al crear vórtice" });
  }
};

// --- NUEVA FUNCIÓN PARA ADRI: Leer y Destruir ---
export const getVortex = async (req, res) => {
  try {
    const { id } = req.params;

    const secret = await prisma.secret.findUnique({
      where: { id }
    });

    if (!secret) return res.status(404).json({ error: "Vórtice no encontrado o ya destruido" });

    // 1. Validar Expiración por Tiempo
    if (new Date() > secret.expiresAt) {
      await prisma.secret.delete({ where: { id } });
      return res.status(410).json({ error: "Este secreto ha caducado por tiempo" });
    }

    // 2. Validar Límite de Visitas (Caso Adri: 10 visitas)
    if (secret.viewCount >= secret.maxViews) {
      await prisma.secret.delete({ where: { id } });
      return res.status(410).json({ error: "Límite de visualizaciones alcanzado" });
    }

    // 3. Incrementar contador de visitas de forma atómica
    await prisma.secret.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    // Devolvemos el ciphertext y el nonce. 
    // El frontend usará la clave que tiene el empleado para descifrar.
    res.json({
      title: secret.title,
      content: secret.content,
      nonce: secret.nonce,
      expiresAt: secret.expiresAt,
      remainingViews: secret.maxViews - (secret.viewCount + 1)
    });

  } catch (error) {
    res.status(500).json({ error: "Error al recuperar el vórtice" });
  }
};

export const heartbeat = async (req, res) => {
    try {
      const { userId } = req.auth;
      await prisma.user.update({
        where: { id: userId },
        data: { lastCheckIn: new Date(), dmsStatus: "IDLE" }
      });
      res.json({ success: true, message: "Latido registrado" });
    } catch (error) {
      res.status(500).json({ error: "Error en el latido" });
    }
};