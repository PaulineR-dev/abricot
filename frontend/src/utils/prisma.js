import { PrismaClient } from "@prisma/client";

// Garde Prisma accessible partout pour réutiliser la même connexion en développement.
const globalForPrisma = global;

// Crée Prisma une seule fois, ou reprend l'instance déjà gardée.
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // Affiche les requêtes envoyées à la base de données.
  });

// En développement, conserve cette instance pour la prochaine utilisation.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;