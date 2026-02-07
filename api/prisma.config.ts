import { PrismaClient } from '@prisma/client'

// Evita crear múltiples conexiones en desarrollo (problema común en Vercel)
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma