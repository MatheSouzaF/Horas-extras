import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ensureAuth } from "../middlewares/ensure-auth.js";
import type { AuthRequest } from "../types/auth.js";

const hoursRoutes = Router();

const monthSchema = z.string().regex(/^\d{4}-\d{2}$/);

const saveHoursSchema = z.object({
  salary: z.number().min(0),
  calculationModels: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        name: z.string().trim().min(1),
        multiplier: z.number().positive(),
        hourlyRate: z.number().positive().optional(),
      }),
    )
    .default([]),
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

  if (end === start) {
    return 0;
  }

  const resolvedEnd = end < start ? end + 24 * 60 : end;

  return (resolvedEnd - start) / 60;
};

const STANDARD_MODEL_ID = "default-standard";
const STANDARD_MODEL_MULTIPLIER = 1.5;
const NIGHT_START_MINUTES = 22 * 60;
const NIGHT_END_MINUTES = 8 * 60;

const isNightMinute = (minuteOfDay: number): boolean =>
  minuteOfDay >= NIGHT_START_MINUTES || minuteOfDay < NIGHT_END_MINUTES;

const getDayOfWeek = (dateStr: string, offset = 0): number => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + offset)).getUTCDay();
};

const isWeekend = (dateStr: string, offset = 0): boolean => {
  const dayOfWeek = getDayOfWeek(dateStr, offset);
  return dayOfWeek === 0 || dayOfWeek === 6;
};

type StoredCalculationModel = {
  id: string;
  name: string;
  multiplier: number;
  hourlyRate?: number;
};

const calculateStandardModelValue = (
  dateStr: string,
  startTime: string,
  endTime: string,
  hourlyValue: number,
  baseMultiplier: number,
): number => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  if (start === end) return 0;

  let cursor = start;
  const resolvedEnd = end < start ? end + 24 * 60 : end;
  let total = 0;

  while (cursor < resolvedEnd) {
    const dayOffset = Math.floor(cursor / (24 * 60));
    const minuteOfDay = cursor % (24 * 60);
    const currentDayStart = cursor - minuteOfDay;

    const nextCutoff =
      minuteOfDay < NIGHT_END_MINUTES
        ? currentDayStart + NIGHT_END_MINUTES
        : minuteOfDay < NIGHT_START_MINUTES
          ? currentDayStart + NIGHT_START_MINUTES
          : currentDayStart + 24 * 60;

    const chunkEnd = Math.min(nextCutoff, resolvedEnd);
    const chunkHours = (chunkEnd - cursor) / 60;
    const multiplier =
      isWeekend(dateStr, dayOffset) || isNightMinute(minuteOfDay)
        ? 2
        : baseMultiplier;

    total += chunkHours * hourlyValue * multiplier;
    cursor = chunkEnd;
  }

  return total;
};

const getDayValue = (
  dateStr: string,
  startTime: string,
  endTime: string,
  calculationModelId: string,
  models: StoredCalculationModel[],
  hourlyValue: number,
): number => {
  const workedHours = calculateWorkedHours(startTime, endTime);
  if (workedHours <= 0) return 0;

  const model = models.find((m) => m.id === calculationModelId);
  const effectiveHourlyValue =
    model?.hourlyRate != null && model.hourlyRate > 0
      ? model.hourlyRate
      : hourlyValue;

  if (model?.id === STANDARD_MODEL_ID) {
    return calculateStandardModelValue(
      dateStr,
      startTime,
      endTime,
      effectiveHourlyValue,
      STANDARD_MODEL_MULTIPLIER,
    );
  }

  const multiplier = model?.multiplier ?? 1;
  return workedHours * effectiveHourlyValue * multiplier;
};

const parseStoredCalculationModels = (
  raw: string | null | undefined,
): StoredCalculationModel[] => {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const validated = z
      .array(
        z.object({
          id: z.string().trim().min(1),
          name: z.string().trim().min(1),
          multiplier: z.number().positive(),
          hourlyRate: z.number().positive().optional(),
        }),
      )
      .safeParse(parsed);

    if (!validated.success) {
      return [];
    }

    return validated.data;
  } catch {
    return [];
  }
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
    return response
      .status(200)
      .json({ salary: 0, month, days: [], calculationModels: [] });
  }

  const modelRows = await prisma.$queryRaw<
    Array<{ modelsJson: string | null }>
  >`
    SELECT "modelsJson"
    FROM "MonthlyRecord"
    WHERE "id" = ${record.id}
    LIMIT 1
  `;

  const storedModels = parseStoredCalculationModels(modelRows[0]?.modelsJson);

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
    calculationModels: storedModels,
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

  const { salary, days, calculationModels } = parsed.data;

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
    await transaction.$executeRaw`
      UPDATE "MonthlyRecord"
      SET "modelsJson" = ${JSON.stringify(calculationModels)}
      WHERE "id" = ${monthlyRecord.id}
    `;

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

const yearSchema = z.string().regex(/^\d{4}$/);

hoursRoutes.get(
  "/annual",
  ensureAuth,
  async (request: AuthRequest, response) => {
    const userId = request.user?.sub;

    if (!userId) {
      return response.status(401).json({ message: "Não autenticado." });
    }

    const yearParam = request.query.year;
    const year =
      typeof yearParam === "string" && yearSchema.safeParse(yearParam).success
        ? yearParam
        : String(new Date().getFullYear());

    const records = await prisma.monthlyRecord.findMany({
      where: {
        userId,
        month: {
          startsWith: year,
        },
      },
      include: {
        dayEntries: true,
      },
      orderBy: {
        month: "asc",
      },
    });

    if (records.length === 0) {
      return response.status(200).json({ year, months: [] });
    }

    const recordIds = records.map((r) => r.id);

    const modelRows = await prisma.$queryRaw<
      Array<{ id: string; modelsJson: string | null }>
    >`
      SELECT "id", "modelsJson"
      FROM "MonthlyRecord"
      WHERE "id" = ANY(${recordIds})
    `;

    const modelsById = new Map(
      modelRows.map((row) => [
        row.id,
        parseStoredCalculationModels(row.modelsJson),
      ]),
    );

    const months = records.map((record) => {
      const models = modelsById.get(record.id) ?? [];
      const valorHora =
        record.salary > 0 ? record.salary / 160 : 0;

      let totalHours = 0;
      let totalValue = 0;

      const projectMap = new Map<string, { hours: number; totalValue: number }>();

      record.dayEntries.forEach((entry) => {
        const hours = calculateWorkedHours(entry.startTime, entry.endTime);
        if (hours <= 0) return;

        const dateStr = entry.date.toISOString().slice(0, 10);
        const value = getDayValue(
          dateStr,
          entry.startTime,
          entry.endTime,
          entry.calculationModelId,
          models,
          valorHora,
        );

        totalHours += hours;
        totalValue += value;

        const label = entry.projectWorked.trim() || "Sem projeto";
        const current = projectMap.get(label) ?? { hours: 0, totalValue: 0 };
        projectMap.set(label, {
          hours: current.hours + hours,
          totalValue: current.totalValue + value,
        });
      });

      const projects = Array.from(projectMap.entries())
        .sort((a, b) => b[1].hours - a[1].hours)
        .map(([label, data]) => ({
          label,
          hours: data.hours,
          totalValue: data.totalValue,
        }));

      return {
        month: record.month,
        salary: record.salary,
        totalHours,
        totalValue,
        workedDaysCount: record.dayEntries.length,
        projects,
      };
    });

    return response.status(200).json({ year, months });
  },
);

export { hoursRoutes };
