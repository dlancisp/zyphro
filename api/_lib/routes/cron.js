import express from 'express';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const router = express.Router();
const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

router.get('/process-all', async (req, res) => {
  console.log("🛠️ CRON: Iniciando mantenimiento global...");
  const now = new Date();
  let results = { deletedDrops: 0, triggeredDMS: 0 };

  try {
    // --- 1. LIMPIEZA DE CLOUD DROPS (24H) ---
    const deleted = await prisma.secret.deleteMany({
      where: {
        type: 'drop',
        expiresAt: { lt: now }
      }
    });
    results.deletedDrops = deleted.count;
    if (deleted.count > 0) console.log(`🧹 Borrados ${deleted.count} drops caducados.`);

    // --- 2. PROCESAMIENTO DEAD MAN SWITCH ---
    const activeSwitches = await prisma.user.findMany({
      where: { switchEnabled: true }
    });

    for (const user of activeSwitches) {
      if (!user.lastCheckIn || !user.recipientEmail) continue;

      // Calculamos la fecha límite
      const deadline = new Date(user.lastCheckIn);
      deadline.setDate(deadline.getDate() + user.checkInInterval);

      if (now > deadline) {
        console.log(`⚠️ TRIGGER: Enviando legado de ${user.email}`);

        // Usamos dmsNote que es el campo de tu schema actual
        const { error } = await resend.emails.send({
          from: 'Zyphro Security <onboarding@resend.dev>',
          to: user.recipientEmail,
          subject: '🚨 URGENTE: Protocolo Dead Man Switch Activado',
          html: `
            <div style="font-family: sans-serif; padding: 40px; background-color: #f8fafc;">
              <div style="max-width: 600px; margin: 0 auto; bg-color: #ffffff; padding: 30px; border-radius: 20px; border: 1px solid #e2e8f0;">
                <h1 style="color: #2563eb; font-size: 24px;">Protocolo de Seguridad Zyphro</h1>
                <p>Se ha detectado inactividad prolongada por parte de <strong>${user.email}</strong>.</p>
                <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin: 20px 0; font-family: monospace;">
                  ${user.dmsNote || 'No se incluyó una nota de texto.'}
                </div>
                <p style="font-size: 12px; color: #94a3b8;">Este es un mensaje automático del sistema de herencia digital Zyphro.</p>
              </div>
            </div>
          `
        });

        if (!error) {
          // Desactivamos para no repetir el envío
          await prisma.user.update({
            where: { id: user.id },
            data: { switchEnabled: false }
          });
          results.triggeredDMS++;
        }
      }
    }

    res.json({ success: true, results });

  } catch (error) {
    console.error("🔥 Error en Cron:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;