import { Router } from "express";
import { z } from "zod";
import { ensureAuth } from "../../middlewares/ensure-auth.js";
import type { AuthRequest } from "../../types/auth.js";
import {
  monthSchema,
  yearSchema,
  saveHoursSchema,
} from "./hours.schema.js";
import {
  getMonthlyRecord,
  saveMonthlyRecord,
  getAllDays,
  getAnnualSummary,
  fixBuckets,
} from "./hours.service.js";

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const pageSchema = z.coerce.number().int().min(0).default(0);
const limitSchema = z.coerce.number().int().min(1).max(100).default(20);
const limitExportSchema = z.coerce.number().int().min(1).max(10000).default(20);

export const hoursRoutes = Router();

hoursRoutes.get("/", ensureAuth, async (request: AuthRequest, response) => {
  const userId = request.user?.sub;
  if (!userId) return response.status(401).json({ message: "Não autenticado." });

  const monthParam = request.query.month;
  const month =
    typeof monthParam === "string" && monthSchema.safeParse(monthParam).success
      ? monthParam
      : getCurrentMonth();

  const data = await getMonthlyRecord(userId, month);
  return response.status(200).json(data);
});

hoursRoutes.put("/", ensureAuth, async (request: AuthRequest, response) => {
  const userId = request.user?.sub;
  if (!userId) return response.status(401).json({ message: "Não autenticado." });

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

  const result = await saveMonthlyRecord(userId, monthParam, parsed.data);

  if (result.error) {
    return response.status(result.error.status).json({
      message: result.error.message,
      dates: result.error.dates,
    });
  }

  return response.status(200).json({ message: "Horas salvas com sucesso." });
});

hoursRoutes.get(
  "/all",
  ensureAuth,
  async (request: AuthRequest, response) => {
    const userId = request.user?.sub;
    if (!userId)
      return response.status(401).json({ message: "Não autenticado." });

    const page = pageSchema.parse(request.query.page);
    const limit = limitExportSchema.parse(request.query.limit);

    const data = await getAllDays(userId, page, limit);
    return response.status(200).json(data);
  },
);

hoursRoutes.get(
  "/annual",
  ensureAuth,
  async (request: AuthRequest, response) => {
    const userId = request.user?.sub;
    if (!userId)
      return response.status(401).json({ message: "Não autenticado." });

    const yearParam = request.query.year;
    const year =
      typeof yearParam === "string" && yearSchema.safeParse(yearParam).success
        ? yearParam
        : String(new Date().getFullYear());

    const data = await getAnnualSummary(userId, year);
    return response.status(200).json(data);
  },
);

hoursRoutes.post(
  "/fix-buckets",
  ensureAuth,
  async (request: AuthRequest, response) => {
    const userId = request.user?.sub;
    if (!userId)
      return response.status(401).json({ message: "Não autenticado." });

    const result = await fixBuckets(userId);
    return response.status(200).json(result);
  },
);
