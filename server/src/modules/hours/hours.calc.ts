import type { StoredCalculationModel } from "./hours.schema.js";

export const STANDARD_MODEL_ID = "default-standard";
const STANDARD_MODEL_MULTIPLIER = 1.5;
const NIGHT_START_MINUTES = 22 * 60;
const NIGHT_END_MINUTES = 8 * 60;

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const calculateWorkedHours = (
  startTime: string,
  endTime: string,
): number => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (end === start) return 0;
  const resolvedEnd = end < start ? end + 24 * 60 : end;
  return (resolvedEnd - start) / 60;
};

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

export const getDayValue = (
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
