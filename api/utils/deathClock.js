import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const checkDeadManSwitches = async () => {
  console.log("⏱️  [VIGÍA] Iniciando ronda de vigilancia...");
  
  try {
    const now = new Date();
    
    // Buscamos usuarios con sistema activo que no estén ya disparados
    const users = await prisma.user.findMany({
      where: {
        switchEnabled: true,
        dmsStatus: { in: ["IDLE", "WARNING"] },
      }
    });

    for (const user of users) {
      if (!user.lastCheckIn) continue;

      // Calculamos la fecha de expiración: lastCheckIn + (días * ms en un día)
      const daysInMs = user.checkInInterval * 24 * 60 * 60 * 1000;
      const expirationTime = new Date(user.lastCheckIn.getTime() + daysInMs);
      
      if (now > expirationTime) {
        console.log(`🚨 ALERT: El DMS de ${user.email} ha expirado.`);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { dmsStatus: "TRIGGERED" }
        });

        // Aquí irá la lógica de envío de emails con Resend/Nodemailer
      }
    }
    
    console.log("✅ [VIGÍA] Ronda finalizada.");
  } catch (error) {
    console.error("❌ Error en el Reloj de la Muerte:", error);
  }
};