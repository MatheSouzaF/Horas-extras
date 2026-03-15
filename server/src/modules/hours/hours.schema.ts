import { z } from "zod";

export const monthSchema = z.string().regex(/^\d{4}-\d{2}$/);
export const yearSchema = z.string().regex(/^\d{4}$/);

export const calculationModelSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  multiplier: z.number().positive(),
  hourlyRate: z.number().positive().optional(),
});

export const saveHoursSchema = z.object({
  salary: z.number().min(0),
  calculationModels: z.array(calculationModelSchema).default([]),
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

export type StoredCalculationModel = z.infer<typeof calculationModelSchema>;
export type SaveHoursInput = z.infer<typeof saveHoursSchema>;

export const parseStoredCalculationModels = (
  raw: unknown,
): StoredCalculationModel[] => {
  if (raw == null) return [];
  const value = typeof raw === "string" ? JSON.parse(raw) : raw;
  const result = z.array(calculationModelSchema).safeParse(value);
  return result.success ? result.data : [];
};
