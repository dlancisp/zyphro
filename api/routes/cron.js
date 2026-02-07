const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer');

// 📧 Configuración del Correo (Gmail, Outlook, Resend, etc.)
// Necesitas añadir EMAIL_USER y EMAIL_PASS en tus variables de entorno (.env y Vercel)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Cambia esto si usas otro servicio (ej: 'SendGrid', 'Outlook')
  auth: {
    user: process.env.EMAIL_USER, // Tu email (ej: zyphro.security@gmail.com)
    pass: process.env.EMAIL_PASS, // Tu contraseña de aplicación (NO la normal)
  },
});

router.get('/process-dms', async (req, res) => {
  console.log('🕒 Ejecutando Cron Job: Dead Man Switch Check...');

  // (Opcional) Seguridad: Verificar que sea Vercel quien llama
  // const authHeader = req.headers['authorization'];
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  try {
    const now = new Date();

    // 1. Buscar interruptores ACTIVOS que ya CADUCARON (fecha límite < ahora)
    const expiredSwitches = await prisma.deadManSwitch.findMany({
      where: {
        isActive: true,
        nextTriggerDate: { lt: now }, // 'lt' significa 'less than' (menor que)
      },
    });

    console.log(`💀 Encontrados ${expiredSwitches.length} interruptores caducados.`);

    if (expiredSwitches.length === 0) {
      return res.json({ message: 'Todo en orden. Nadie ha desaparecido hoy.' });
    }

    // 2. Procesar cada uno (Enviar el secreto)
    for (const dms of expiredSwitches) {
      console.log(`🚀 Liberando secreto de ID: ${dms.id} hacia ${dms.recipientEmail}`);

      try {
        await transporter.sendMail({
          from: '"Zyphro Security" <no-reply@zyphro.com>',
          to: dms.recipientEmail,
          subject: '🚨 URGENTE: Protocolo Dead Man Switch Activado',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h1 style="color: #dc2626;">⚠️ Protocolo Activado</h1>
              <p>Este es un mensaje automático del sistema de seguridad Zyphro.</p>
              <p>El usuario propietario de esta cuenta no ha realizado su "Check-in" de vida en el tiempo establecido (${dms.checkInInterval} días).</p>
              <hr />
              <h3>📦 CONTENIDO DESCIFRADO:</h3>
              <div style="background: #f4f4f5; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
                <p style="font-family: monospace; font-size: 16px;">${dms.encryptedNote}</p>
              </div>
              <hr />
              <p style="font-size: 12px; color: #666;">Si crees que esto es un error, contacta con el remitente inmediatamente. Zyphro no tiene acceso a este contenido, solo lo entregamos automáticamente.</p>
            </div>
          `,
        });

        // 3. Desactivar el switch para que no se envíe mañana otra vez
        await prisma.deadManSwitch.update({
          where: { id: dms.id },
          data: { isActive: false },
        });

      } catch (emailError) {
        console.error(`❌ Error enviando email a ${dms.recipientEmail}:`, emailError);
      }
    }

    res.json({ success: true, processed: expiredSwitches.length });

  } catch (error) {
    console.error('🔥 Error CRITICO en Cron:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;