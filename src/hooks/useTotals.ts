import { useMemo } from "react";
import type { CalculationModel, DayEntry, Totals } from "../types";
import { calculateWorkedHours, getDayValue } from "../lib/calculations";

export type ProjectSummaryItem = {
  label: string;
  hours: number;
  totalValue: number;
  modelId: string | null;
};

interface UseTotalsParams {
  days: DayEntry[];
  salary: number;
  calculationModels: CalculationModel[];
}

export function useTotals({ days, salary, calculationModels }: UseTotalsParams) {
  const totals = useMemo<Totals>(() => {
    const totalHours = days.reduce(
      (acc, day) => acc + calculateWorkedHours(day.startTime, day.endTime),
      0,
    );
    const valorHora = salary / 160;
    const modelMap = new Map(
      calculationModels.map((model) => [model.id, model]),
    );
    const totalValue = days.reduce(
      (acc, day) =>
        acc +
        getDayValue(day, modelMap, Number.isFinite(valorHora) ? valorHora : 0),
      0,
    );
    return { totalHours, totalValue };
  }, [days, salary, calculationModels]);

  const dayHoursChart = useMemo(() => {
    const dateTotals = new Map<string, number>();
    days.forEach((day) => {
      if (!day.date || !day.startTime || !day.endTime) return;
      const workedHours = calculateWorkedHours(day.startTime, day.endTime);
      if (workedHours <= 0) return;
      dateTotals.set(day.date, (dateTotals.get(day.date) ?? 0) + workedHours);
    });
    return Array.from(dateTotals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, hours]) => ({ label, hours }));
  }, [days]);

  const averageDailyHours = useMemo(() => {
    if (dayHoursChart.length === 0) return 0;
    return (
      dayHoursChart.reduce((acc, d) => acc + d.hours, 0) / dayHoursChart.length
    );
  }, [dayHoursChart]);

  const projectHoursChart = useMemo(() => {
    const map = new Map<string, number>();
    days.forEach((day) => {
      if (!day.startTime || !day.endTime) return;
      const workedHours = calculateWorkedHours(day.startTime, day.endTime);
      if (workedHours <= 0) return;
      const label = day.projectWorked.trim() || "Sem projeto";
      map.set(label, (map.get(label) ?? 0) + workedHours);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, hours]) => ({ label, hours }));
  }, [days]);

  const projectSummary = useMemo<ProjectSummaryItem[]>(() => {
    const projectMap = new Map<
      string,
      { hours: number; totalValue: number; modelIds: Set<string> }
    >();
    const modelMap = new Map(
      calculationModels.map((model) => [model.id, model]),
    );
    const valorHora = salary / 160;

    days.forEach((day) => {
      if (!day.startTime || !day.endTime) return;
      const workedHours = calculateWorkedHours(day.startTime, day.endTime);
      if (workedHours <= 0) return;

      const label = day.projectWorked.trim() || "Sem projeto";
      const current = projectMap.get(label) ?? {
        hours: 0,
        totalValue: 0,
        modelIds: new Set<string>(),
      };
      const value = getDayValue(
        day,
        modelMap,
        Number.isFinite(valorHora) ? valorHora : 0,
      );
      const dayModelId =
        day.calculationModelId || calculationModels[0]?.id || "";
      current.modelIds.add(dayModelId);

      projectMap.set(label, {
        hours: current.hours + workedHours,
        totalValue: current.totalValue + value,
        modelIds: current.modelIds,
      });
    });

    return Array.from(projectMap.entries())
      .sort((a, b) => b[1].hours - a[1].hours)
      .map(([label, data]) => ({
        label,
        hours: data.hours,
        totalValue: data.totalValue,
        modelId: data.modelIds.size === 1 ? [...data.modelIds][0] : null,
      }));
  }, [days, salary, calculationModels]);

  const dayValuesById = useMemo<Record<string, number>>(() => {
    const modelMap = new Map(
      calculationModels.map((model) => [model.id, model]),
    );
    const valorHora = salary / 160;
    const hourlyValue = Number.isFinite(valorHora) ? valorHora : 0;

    return days.reduce<Record<string, number>>((acc, day) => {
      acc[day.id] = getDayValue(day, modelMap, hourlyValue);
      return acc;
    }, {});
  }, [days, salary, calculationModels]);

  const projectNames = useMemo<string[]>(() => {
    const names = new Set<string>();
    days.forEach((day) => {
      const name = day.projectWorked.trim();
      if (name) names.add(name);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [days]);

  return {
    totals,
    dayHoursChart,
    averageDailyHours,
    projectHoursChart,
    projectSummary,
    dayValuesById,
    projectNames,
  };
}
