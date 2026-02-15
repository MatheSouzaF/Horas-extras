import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";
import { env } from "../config/env.js";

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
});

export const ensureHoursSchema = async () => {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "DayEntry"
    ADD COLUMN IF NOT EXISTS "calculationModelId" TEXT NOT NULL DEFAULT '';
  `);
};
