import { prisma } from "../../lib/prisma.js";
import {
  parseStoredCalculationModels,
  type SaveHoursInput,
} from "./hours.schema.js";
import { calculateWorkedHours, getDayValue } from "./hours.calc.js";

export async function getMonthlyRecord(userId: string, month: string) {
  const record = await prisma.monthlyRecord.findUnique({
    where: { userId_month: { userId, month } },
    include: { dayEntries: { orderBy: { date: "asc" } } },
  });

  if (!record) {
    return { salary: 0, month, days: [], calculationModels: [] };
  }

  const storedModels = parseStoredCalculationModels(record.modelsJson);

  return {
    salary: record.salary,
    month,
    calculationModels: storedModels,
    days: record.dayEntries.map((entry) => ({
      id: entry.id,
      date: entry.date.toISOString().slice(0, 10),
      startTime: entry.startTime,
      endTime: entry.endTime,
      projectWorked: entry.projectWorked,
      calculationModelId: entry.calculationModelId,
    })),
  };
}

export async function saveMonthlyRecord(
  userId: string,
  monthParam: string,
  data: SaveHoursInput,
) {
  const { salary, days, calculationModels } = data;

  const outsideMonth = days.filter((day) => !day.date.startsWith(monthParam));
  if (outsideMonth.length > 0) {
    return {
      error: {
        status: 422,
        message: `${outsideMonth.length} dia(s) fora do mês ${monthParam}.`,
        dates: outsideMonth.map((d) => d.date),
      },
    };
  }

  const monthlyRecord = await prisma.monthlyRecord.upsert({
    where: { userId_month: { userId, month: monthParam } },
    create: { userId, month: monthParam, salary, modelsJson: calculationModels },
    update: { salary },
  });

  await prisma.$transaction(async (tx) => {
    await tx.monthlyRecord.update({
      where: { id: monthlyRecord.id },
      data: { modelsJson: calculationModels },
    });

    await tx.dayEntry.deleteMany({
      where: { monthlyRecordId: monthlyRecord.id },
    });

    if (days.length > 0) {
      await tx.dayEntry.createMany({
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

  return { error: null };
}

export async function getAllDays(userId: string, page: number, limit: number) {
  const [total, entries, allEntries] = await Promise.all([
    prisma.dayEntry.count({
      where: { monthlyRecord: { userId } },
    }),
    prisma.dayEntry.findMany({
      where: { monthlyRecord: { userId } },
      include: { monthlyRecord: true },
      orderBy: { date: "desc" },
      skip: page * limit,
      take: limit,
    }),
    prisma.dayEntry.findMany({
      where: { monthlyRecord: { userId } },
      include: { monthlyRecord: true },
    }),
  ]);

  const days = entries.map((entry) => {
    const models = parseStoredCalculationModels(entry.monthlyRecord.modelsJson);
    const valorHora =
      entry.monthlyRecord.salary > 0 ? entry.monthlyRecord.salary / 160 : 0;
    const dateStr = entry.date.toISOString().slice(0, 10);
    const calculatedValue = getDayValue(
      dateStr,
      entry.startTime,
      entry.endTime,
      entry.calculationModelId,
      models,
      valorHora,
    );

    return {
      id: entry.id,
      date: dateStr,
      startTime: entry.startTime,
      endTime: entry.endTime,
      projectWorked: entry.projectWorked,
      calculationModelId: entry.calculationModelId,
      calculatedValue,
    };
  });

  const mostRecentRecord = await prisma.monthlyRecord.findFirst({
    where: { userId },
    orderBy: { month: "desc" },
  });

  const storedModels = parseStoredCalculationModels(
    mostRecentRecord?.modelsJson,
  );

  let globalTotalHours = 0;
  let globalTotalValue = 0;
  for (const entry of allEntries) {
    const models = parseStoredCalculationModels(entry.monthlyRecord.modelsJson);
    const valorHora =
      entry.monthlyRecord.salary > 0 ? entry.monthlyRecord.salary / 160 : 0;
    const dateStr = entry.date.toISOString().slice(0, 10);
    const hours = calculateWorkedHours(entry.startTime, entry.endTime);
    if (hours > 0) {
      globalTotalHours += hours;
      globalTotalValue += getDayValue(
        dateStr,
        entry.startTime,
        entry.endTime,
        entry.calculationModelId,
        models,
        valorHora,
      );
    }
  }

  return {
    salary: mostRecentRecord?.salary ?? 0,
    calculationModels: storedModels,
    days,
    total,
    page,
    hasMore: page * limit + days.length < total,
    totalHours: globalTotalHours,
    totalValue: globalTotalValue,
  };
}

export async function getAnnualSummary(userId: string, year: string) {
  const records = await prisma.monthlyRecord.findMany({
    where: { userId, month: { startsWith: year } },
    include: { dayEntries: true },
    orderBy: { month: "asc" },
  });

  if (records.length === 0) return { year, months: [] };

  const months = records.map((record) => {
    const models = parseStoredCalculationModels(record.modelsJson);
    const valorHora = record.salary > 0 ? record.salary / 160 : 0;

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
      .map(([label, data]) => ({ label, ...data }));

    return {
      month: record.month,
      salary: record.salary,
      totalHours,
      totalValue,
      workedDaysCount: record.dayEntries.length,
      projects,
    };
  });

  return { year, months };
}

export async function fixBuckets(userId: string) {
  const records = await prisma.monthlyRecord.findMany({
    where: { userId },
    include: { dayEntries: true },
  });

  let movedCount = 0;
  const log: Array<{
    entryId: string;
    from: string;
    to: string;
    date: string;
  }> = [];

  await prisma.$transaction(async (tx) => {
    for (const record of records) {
      for (const entry of record.dayEntries) {
        const dateStr = entry.date.toISOString().slice(0, 10);
        const correctMonth = dateStr.slice(0, 7);

        if (correctMonth === record.month) continue;

        let targetRecord = await tx.monthlyRecord.findUnique({
          where: { userId_month: { userId, month: correctMonth } },
        });

        if (!targetRecord) {
          targetRecord = await tx.monthlyRecord.create({
            data: {
              userId,
              month: correctMonth,
              salary: record.salary,
              modelsJson: record.modelsJson ?? undefined,
            },
          });
        }

        await tx.dayEntry.update({
          where: { id: entry.id },
          data: { monthlyRecordId: targetRecord.id },
        });

        log.push({
          entryId: entry.id,
          from: record.month,
          to: correctMonth,
          date: dateStr,
        });
        movedCount++;
      }
    }
  });

  if (movedCount > 0) {
    console.log(
      `[fix-buckets] userId=${userId} moveu ${movedCount} dia(s):`,
      log,
    );
  }

  return { moved: movedCount, details: log };
}

