import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ensureAuth } from "../middlewares/ensure-auth.js";
import type { AuthRequest } from "../types/auth.js";

const hoursRoutes = Router();

const monthSchema = z.string().regex(/^\d{4}-\d{2}$/);

const saveHoursSchema = z.object({
  salary: z.number().min(0),
  days: z.array(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      projectWorked: z.string().trim().default(""),
      calculationModelId: z.string().trim().default(""),
    }),
  ),
});

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const calculateWorkedHours = (startTime: string, endTime: string): number => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  if (end <= start) {
    return 0;
  }

  return (end - start) / 60;
};

hoursRoutes.get("/", ensureAuth, async (request: AuthRequest, response) => {
  const userId = request.user?.sub;

  if (!userId) {
    return response.status(401).json({ message: "Não autenticado." });
  }

  const monthParam = request.query.month;
  const month =
    typeof monthParam === "string" && monthSchema.safeParse(monthParam).success
      ? monthParam
      : getCurrentMonth();

  const record = await prisma.monthlyRecord.findUnique({
    where: {
      userId_month: {
        userId,
        month,
      },
    },
    include: {
      dayEntries: {
        orderBy: {
          date: "asc",
        },
      },
    },
  });

  if (!record) {
    return response.status(200).json({ salary: 0, month, days: [] });
  }

  return response.status(200).json({
    salary: record.salary,
    month,
    days: record.dayEntries.map((entry) => ({
      id: entry.id,
      date: entry.date.toISOString().slice(0, 10),
      startTime: entry.startTime,
      endTime: entry.endTime,
      projectWorked: entry.projectWorked,
      calculationModelId: entry.calculationModelId,
    })),
  });
});

hoursRoutes.put("/", ensureAuth, async (request: AuthRequest, response) => {
  const userId = request.user?.sub;

  if (!userId) {
    return response.status(401).json({ message: "Não autenticado." });
  }

  const monthParam = request.query.month;

  if (
    typeof monthParam !== "string" ||
    !monthSchema.safeParse(monthParam).success
  ) {
    return response.status(400).json({ message: "Mês inválido. Use YYYY-MM." });
  }

  const parsed = saveHoursSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({ message: parsed.error.flatten() });
  }

  const { salary, days } = parsed.data;

  const monthlyRecord = await prisma.monthlyRecord.upsert({
    where: {
      userId_month: {
        userId,
        month: monthParam,
      },
    },
    create: {
      userId,
      month: monthParam,
      salary,
    },
    update: {
      salary,
    },
  });

  await prisma.$transaction(async (transaction) => {
    await transaction.dayEntry.deleteMany({
      where: {
        monthlyRecordId: monthlyRecord.id,
      },
    });

    if (days.length > 0) {
      await transaction.dayEntry.createMany({
        data: days.map((entry) => ({
          monthlyRecordId: monthlyRecord.id,
          date: new Date(`${entry.date}T00:00:00.000Z`),
          startTime: entry.startTime,
          endTime: entry.endTime,
          projectWorked: entry.projectWorked,
          calculationModelId: entry.calculationModelId,
          workedHours: calculateWorkedHours(entry.startTime, entry.endTime),
        })),
      });
    }
  });

  return response.status(200).json({ message: "Horas salvas com sucesso." });
});

export { hoursRoutes };
