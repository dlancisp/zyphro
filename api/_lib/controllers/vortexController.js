//import { PrismaClient } from "@prisma/client";
import { prisma } from "../../prisma.js";
import { encryptSecret } from "../utils/crypto.js";
import sodium from 'libsodium-wrappers';

//const prisma = new PrismaClient();

export const createVortex = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { title, content, type } = req.body;

    if (!content) return res.status(400).json({ error: "El contenido es obligatorio" });

    await sodium.ready;
    // Generamos una clave de 32 bytes para este secreto concreto
    const secretKey = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES);

    // Ciframos con XChaCha20
    const { ciphertext, nonce } = await encryptSecret(content, secretKey);

    // Guardamos en Neon
    const newSecret = await prisma.secret.create({
      data: {
        userId,
        title: title || "Nuevo Secreto",
        content: ciphertext,
        nonce: nonce,
        type: type || "note"
      }
    });

    // IMPORTANTE: Devolvemos la clave al usuario. 
    // Nosotros NO guardamos la clave del secreto, solo el candado cifrado.
    res.json({
      success: true,
      vortexId: newSecret.id,
      secretKey: sodium.to_hex(secretKey), 
      message: "Vórtice sellado matemáticamente con XChaCha20"
    });

  } catch (error) {
    console.error("Vortex Error:", error);
    res.status(500).json({ error: "Error al cifrar el vórtice" });
  }
};

// Mantén aquí también la función heartbeat que actualiza el lastCheckIn
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