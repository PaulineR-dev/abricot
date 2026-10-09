import { PrismaClient } from "@prisma/client";

// Stockage global pour éviter plusieurs instances en développement
const globalForPrisma = global;

// Instance Prisma unique (évite les doublons)
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // Log des requêtes
  });

// En développement : réutilise l'instance existante
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;