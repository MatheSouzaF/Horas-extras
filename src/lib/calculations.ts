import { STANDARD_MODEL_ID } from "../components/CalculationSettings";
import type { CalculationModel, DayEntry } from "../types";

export const NIGHT_START_MINUTES = 22 * 60;
export const NIGHT_END_MINUTES = 8 * 60;

export const toMinutes = (time: string): number => {
  if (!time) {
    return 0;
  }

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const calculateWorkedHours = (
  startTime: string,
  endTime: string,
): number => {
  if (!startTime || !endTime) {
    return 0;
  }

  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  if (end === start) {
    return 0;
  }

  const resolvedEnd = end < start ? end + 24 * 60 : end;

  return (resolvedEnd - start) / 60;
};

export const getDayOfWeek = (date: string, offset = 0): number => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + offset)).getUTCDay();
};

export const isWeekend = (date: string, offset = 0): boolean => {
  const dayOfWeek = getDayOfWeek(date, offset);
  return dayOfWeek === 0 || dayOfWeek === 6;
};

export const isNightMinute = (minuteOfDay: number): boolean =>
  minuteOfDay >= NIGHT_START_MINUTES || minuteOfDay < NIGHT_END_MINUTES;

export const calculateStandardModelValue = (
  day: DayEntry,
  hourlyValue: number,
  baseMultiplier: number,
): number => {
  if (!day.date || !day.startTime || !day.endTime) {
    return 0;
  }

  const start = toMinutes(day.startTime);
  const end = toMinutes(day.endTime);

  if (start === end) {
    return 0;
  }

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
      isWeekend(day.date, dayOffset) || isNightMinute(minuteOfDay)
        ? 2
        : baseMultiplier;

    total += chunkHours * hourlyValue * multiplier;
    cursor = chunkEnd;
  }

  return total;
};

export const getDayValue = (
  day: DayEntry,
  modelMap: Map<string, CalculationModel>,
  hourlyValue: number,
): number => {
  const workedHours = calculateWorkedHours(day.startTime, day.endTime);

  if (workedHours <= 0) {
    return 0;
  }

  const model = modelMap.get(day.calculationModelId);
  const effectiveHourlyValue =
    model?.hourlyRate != null && model.hourlyRate > 0
      ? model.hourlyRate
      : hourlyValue;

  if (model?.id === STANDARD_MODEL_ID) {
    return calculateStandardModelValue(
      day,
      effectiveHourlyValue,
      model.multiplier,
    );
  }

  const multiplier = model?.multiplier ?? 1;
  return workedHours * effectiveHourlyValue * multiplier;
};
