import {
  createDefaultModels,
  STANDARD_MODEL_ID,
  STANDARD_MODEL_MULTIPLIER,
  STANDARD_MODEL_NAME,
} from "../components/CalculationSettings";
import type { CalculationModel, DayEntry, Salary } from "../types";
import { generateId } from "../utils/uuid";

export type HoursResponse = {
  salary: Salary;
  month: string;
  calculationModels?: CalculationModel[];
  days: Array<{
    id?: string;
    date: string;
    startTime: string;
    endTime: string;
    projectWorked?: string;
    calculationModelId?: string;
    calculatedValue?: number;
  }>;
};

export const createEmptyDay = (): DayEntry => ({
  id: generateId(),
  date: "",
  startTime: "",
  endTime: "",
  projectWorked: "",
  calculationModelId: "",
});

export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const isSyncableDay = (
  day: Pick<DayEntry, "date" | "startTime" | "endTime" | "calculationModelId">,
) =>
  Boolean(day.date && day.startTime && day.endTime && day.calculationModelId);

export const normalizeDays = (days: HoursResponse["days"]): DayEntry[] => {
  if (!days.length) {
    return [createEmptyDay()];
  }

  return days.map((day) => ({
    id: day.id ?? generateId(),
    date: day.date,
    startTime: day.startTime,
    endTime: day.endTime,
    projectWorked: day.projectWorked ?? "",
    calculationModelId: day.calculationModelId ?? "",
  }));
};

export const ensureStandardModel = (
  models: CalculationModel[],
): CalculationModel[] => {
  const normalizedStandard: CalculationModel = {
    id: STANDARD_MODEL_ID,
    name: STANDARD_MODEL_NAME,
    multiplier: STANDARD_MODEL_MULTIPLIER,
  };

  if (models.find((model) => model.id === STANDARD_MODEL_ID)) {
    return [
      normalizedStandard,
      ...models.filter((model) => model.id !== STANDARD_MODEL_ID),
    ];
  }

  return [normalizedStandard, ...models];
};

export const normalizeCalculationModels = (
  models: HoursResponse["calculationModels"],
): CalculationModel[] => {
  if (!models?.length) {
    return createDefaultModels();
  }

  const normalized = models
    .filter((model) => model.id && model.name.trim())
    .map((model) => ({
      ...model,
      name: model.name.trim(),
      multiplier: Number(model.multiplier) > 0 ? Number(model.multiplier) : 1,
      hourlyRate:
        model.hourlyRate != null && Number(model.hourlyRate) > 0
          ? Number(model.hourlyRate)
          : undefined,
    }));

  return normalized.length > 0
    ? ensureStandardModel(normalized)
    : createDefaultModels();
};
