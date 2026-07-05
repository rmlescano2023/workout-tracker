import { PrismaClient } from "@prisma/client";

// Next.js reloads modules a lot in development, which would normally create
// a new database connection every time. This pattern reuses one connection
// across reloads. You don't need to understand this deeply yet - just know
// it's the standard way every Next.js + Prisma project does this.

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
