// Archivo: api/routes/cron.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { Resend } = require('resend');

const prisma = new PrismaClient();
// Asegúrate de que esta variable existe en tu .env
const resend = new Resend(process.env.RESEND_API_KEY);

// La ruta final será: /api/cron/process-dms
// (Porque en index.js ya definiste que este archivo empieza por /api/cron)
router.get('/process-dms', async (req, res) => {
  console.log("💀 CRON JOB: Iniciando comprobación de vida...");

  try {
    // 1. Buscamos usuarios con el Switch ACTIVADO
    const activeSwitches = await prisma.user.findMany({
      where: {
        switchEnabled: true
      }
    });

    let triggeredCount = 0;
    const now = new Date();

    console.log(`🔍 Usuarios activos encontrados: ${activeSwitches.length}`);

    // 2. Revisamos uno por uno
    for (const user of activeSwitches) {
      // Si no tiene fecha de último check-in, la creamos ahora y saltamos
      if (!user.lastCheckIn) {
        await prisma.user.update({
            where: { id: user.id },
            data: { lastCheckIn: new Date() }
        });
        continue;
      }

      // Calculamos la fecha límite (Check-in + Días configurados)
      const deadline = new Date(user.lastCheckIn);
      deadline.setDate(deadline.getDate() + user.checkInInterval);

      // 3. ¿Ha muerto? (Si HOY es mayor que la FECHA LÍMITE)
      if (now > deadline) {
        console.log(`⚠️ ALERTA: Usuario ${user.email} excedió el tiempo. Enviando legado...`);

        // A. Enviamos el email
        const { data, error } = await resend.emails.send({
          from: 'Zyphro Security <onboarding@resend.dev>', // Cambia esto cuando tengas dominio propio
          to: user.recipientEmail,
          subject: '🚨 URGENTE: Protocolo Dead Man Switch Activado',
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #333; border-radius: 10px;">
              <h1 style="color: #d32f2f;">Protocolo de Seguridad Activado</h1>
              <p>El usuario <strong>${user.email}</strong> no ha dado señales de vida en ${user.checkInInterval} días.</p>
              <hr />
              <h3>Mensaje Confidencial:</h3>
              <div style="background-color: #f5f5f5; padding: 15px; border-left: 5px solid #d32f2f;">
                ${user.note}
              </div>
              <hr />
              <p style="font-size: 12px; color: #666;">Este mensaje ha sido enviado automáticamente por el sistema de seguridad Zyphro.</p>
            </div>
          `
        });

        if (error) {
          console.error("❌ Error enviando email:", error);
          continue; 
        }

        console.log("✅ Email enviado correctamente.");

        // B. Desactivamos el switch para no spamear
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            switchEnabled: false,
            // Opcional: lastCheckIn: new Date() 
          }
        });

        triggeredCount++;
      }
    }

    // 4. Respuesta final para Vercel
    res.status(200).json({ 
      success: true, 
      processed: activeSwitches.length,
      triggered: triggeredCount 
    });

  } catch (error) {
    console.error("🔥 Error crítico en Cron:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;