import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { SecretSchema, CheckInSchema } from '../utils/schemas.js';

const router = express.Router();
const prisma = new PrismaClient();

// ➤ CREAR SECRETO
router.post('/secret', async (req, res) => {
  try {
    const { cipherText } = SecretSchema.parse(req.body);
    const newSecret = await prisma.secret.create({
      data: {
        cipherText, 
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });
    res.json({ id: newSecret.id });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Datos inválidos' });
    res.status(500).json({ error: 'Error servidor' });
  }
});

// ➤ LEER SECRETO (Burn on read)
router.get('/secret/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const secret = await prisma.secret.findUnique({ where: { id } });
    if (!secret) return res.status(404).json({ error: 'No existe o expiró' });
    
    await prisma.secret.delete({ where: { id } }); 
    res.json({ cipherText: secret.cipherText });
  } catch (error) {
    res.status(500).json({ error: 'Error lectura' });
  }
});

// ➤ DEAD MAN SWITCH (Básico)
router.post('/switch/create', async (req, res) => {
  try {
    const { recipientEmail, encryptedContent, checkInFrequency } = req.body;
    if(!recipientEmail || !encryptedContent) return res.status(400).json({error: "Faltan datos"});
    const newSwitch = await prisma.switch.create({
      data: {
        recipientEmail,
        encryptedContent,
        checkInFrequency: parseInt(checkInFrequency),
        lastCheckIn: new Date(),
        isActive: true
      }
    });
    res.json({ id: newSwitch.id });
  } catch (e) { res.status(500).json({ error: 'Error creando switch' }); }
});

router.post('/switch/checkin', async (req, res) => {
  try {
    const { id } = CheckInSchema.parse(req.body);
    await prisma.switch.update({ where: { id }, data: { lastCheckIn: new Date() } });
    res.json({ success: true });
  } catch (e) { res.status(400).json({ error: 'Error check-in' }); }
});

export default router;