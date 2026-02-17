import { PrismaClient } from "@prisma/client";
import { Resend } from 'resend';

const prisma = new PrismaClient();

export const checkDeadManSwitches = async () => {
  const now = new Date();
  
  // VERIFICACIÓN DE SEGURIDAD: Si no hay API Key, avisamos pero no matamos el servidor
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ ERROR: RESEND_API_KEY no encontrada en las variables de entorno.");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  
  console.log(`⏱️  [VIGÍA] Escaneando sistemas... (${now.toLocaleTimeString()})`);
  
  try {
    // --- 1. LIMPIEZA DE SEGURIDAD ---
    const deleted = await prisma.secret.deleteMany({
      where: {
        type: 'drop',
        expiresAt: { lt: now }
      }
    });
    if (deleted.count > 0) console.log(`🧹 Limpieza: ${deleted.count} secretos eliminados.`);

    // --- 2. VIGILANCIA DEL DEAD MAN SWITCH ---
    const users = await prisma.user.findMany({
      where: {
        switchEnabled: true,
        dmsStatus: { in: ["IDLE", "WARNING"] },
      }
    });

    for (const user of users) {
      if (!user.lastCheckIn || !user.recipientEmail) continue;

      const daysInMs = user.checkInInterval * 24 * 60 * 60 * 1000;
      const expirationTime = new Date(user.lastCheckIn.getTime() + daysInMs);
      
      if (now > expirationTime) {
        console.log(`🚨 DISPARO: Activando protocolo para ${user.email}`);

        const { error } = await resend.emails.send({
          from: 'Zyphro Security <onboarding@resend.dev>',
          to: user.recipientEmail,
          subject: '🚨 URGENTE: Protocolo Dead Man Switch Activado',
          html: `
            <div style="font-family: sans-serif; padding: 40px; background-color: #ffffff; color: #0f172a;">
              <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 24px;">
                <h1 style="color: #2563eb; font-size: 32px; font-weight: 900; font-style: italic; letter-spacing: -0.05em; margin-bottom: 20px;">ZYPHRO</h1>
                <p style="font-size: 16px; line-height: 1.6;">Se ha activado un protocolo de seguridad debido a la inactividad prolongada de <strong>${user.email}</strong>.</p>
                <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 25px; border-radius: 16px; margin: 30px 0; font-family: monospace; font-size: 14px; white-space: pre-wrap;">
                  ${user.dmsNote || 'El usuario no dejó una nota de texto.'}
                </div>
              </div>
            </div>
          `
        });

        if (!error) {
          await prisma.user.update({
            where: { id: user.id },
            data: { dmsStatus: "TRIGGERED", switchEnabled: false }
          });
          console.log(`✅ Legado entregado a ${user.recipientEmail}`);
        } else {
          console.error(`❌ Fallo Resend:`, error);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error en Vigía:", error);
  }
};