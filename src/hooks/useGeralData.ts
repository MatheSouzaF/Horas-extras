import { useEffect, useState, useMemo } from "react";
import type { CalculationModel, DayEntry } from "../types";
import { ApiError } from "../services/api";
import { normalizeDays } from "../lib/data";
import type { AuthSession } from "./useAuth";

const GERAL_PAGE_SIZE = 20;

type ViewMode = "mensal" | "geral";

type RequestWithRefresh = <T>(
  path: string,
  options?: { method?: "GET" | "POST" | "PUT"; body?: unknown },
) => Promise<T>;

type GeralResponse = {
  salary: number;
  calculationModels: CalculationModel[];
  days: Array<{
    id?: string;
    date: string;
    startTime: string;
    endTime: string;
    projectWorked?: string;
    calculationModelId?: string;
    calculatedValue?: number;
  }>;
  total: number;
  page: number;
  hasMore: boolean;
};

interface UseGeralDataParams {
  session: AuthSession | null;
  viewMode: ViewMode;
  requestWithRefresh: RequestWithRefresh;
  calculationModels: CalculationModel[];
}

export function useGeralData({
  session,
  viewMode,
  requestWithRefresh,
  calculationModels,
}: UseGeralDataParams) {
  const [geralDays, setGeralDays] = useState<DayEntry[]>([]);
  const [geralPreCalculatedValues, setGeralPreCalculatedValues] = useState<
    Record<string, number>
  >({});
  const [isLoadingGeral, setIsLoadingGeral] = useState(false);
  const [geralPage, setGeralPage] = useState(0);
  const [geralError, setGeralError] = useState("");
  const [geralTotal, setGeralTotal] = useState(0);

  useEffect(() => {
    const loadGeral = async () => {
      if (!session || viewMode !== "geral") return;

      try {
        setIsLoadingGeral(true);
        setGeralError("");
        const response = await requestWithRefresh<GeralResponse>(
          `/hours/all?page=${geralPage}&limit=${GERAL_PAGE_SIZE}`,
        );

        const fallbackModelId = calculationModels[0]?.id ?? "";
        const normalizedDays = normalizeDays(response.days).map((day) => ({
          ...day,
          calculationModelId: day.calculationModelId || fallbackModelId,
        }));

        const preCalc: Record<string, number> = {};
        response.days.forEach((day) => {
          if (day.id && day.calculatedValue != null) {
            preCalc[day.id] = day.calculatedValue;
          }
        });

        setGeralDays(normalizedDays);
        setGeralPreCalculatedValues(preCalc);
        setGeralTotal(response.total);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return;
        setGeralError("Não foi possível carregar todos os registros.");
        setGeralDays([]);
      } finally {
        setIsLoadingGeral(false);
      }
    };

    loadGeral();
  }, [session, viewMode, geralPage]);

  const geralTotals = useMemo(() => {
    const totalHours = geralDays.reduce((acc, day) => {
      const [sh, sm] = day.startTime.split(":").map(Number);
      const [eh, em] = day.endTime.split(":").map(Number);
      const start = sh * 60 + sm;
      const end = eh * 60 + em;
      if (start === end) return acc;
      const resolvedEnd = end < start ? end + 24 * 60 : end;
      return acc + (resolvedEnd - start) / 60;
    }, 0);
    const totalValue = geralDays.reduce(
      (acc, day) => acc + (geralPreCalculatedValues[day.id] ?? 0),
      0,
    );
    return { totalHours, totalValue };
  }, [geralDays, geralPreCalculatedValues]);

  const geralDayValuesById = useMemo<Record<string, number>>(() => {
    return geralDays.reduce<Record<string, number>>((acc, day) => {
      acc[day.id] = geralPreCalculatedValues[day.id] ?? 0;
      return acc;
    }, {});
  }, [geralDays, geralPreCalculatedValues]);

  const geralTotalPages = Math.ceil(geralTotal / GERAL_PAGE_SIZE);

  return {
    geralDays,
    isLoadingGeral,
    geralError,
    geralPage,
    setGeralPage,
    geralTotals,
    geralDayValuesById,
    geralPagedDays: geralDays, // already server-paginated
    geralTotalPages,
  };
}
