import { useEffect, useState } from "react";
import {
  createDefaultModels,
  STANDARD_MODEL_ID,
  STANDARD_MODEL_MULTIPLIER,
  STANDARD_MODEL_NAME,
} from "../components/CalculationSettings";
import type { CalculationModel, DayEntry, Salary } from "../types";
import { generateId } from "../utils/uuid";
import { ApiError } from "../services/api";
import type { AuthSession } from "./useAuth";
import {
  createEmptyDay,
  isSyncableDay,
  normalizeDays,
  normalizeCalculationModels,
} from "../lib/data";

type RequestWithRefresh = <T>(
  path: string,
  options?: { method?: "GET" | "POST" | "PUT"; body?: unknown },
) => Promise<T>;

interface UseMonthlyDataParams {
  session: AuthSession | null;
  requestWithRefresh: RequestWithRefresh;
  setAuthError: (msg: string) => void;
  selectedMonth: string;
}

export function useMonthlyData({
  session,
  requestWithRefresh,
  setAuthError,
  selectedMonth,
}: UseMonthlyDataParams) {
  const [salary, setSalary] = useState<Salary>(0);
  const [days, setDays] = useState<DayEntry[]>(() => [createEmptyDay()]);
  const [calculationModels, setCalculationModels] = useState<
    CalculationModel[]
  >(() => createDefaultModels());
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSyncReady, setIsSyncReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingModelChange, setPendingModelChange] = useState<{
    projectLabel: string;
    newModelId: string;
  } | null>(null);

  // Reset state on logout
  useEffect(() => {
    if (!session) {
      setSalary(0);
      setDays([createEmptyDay()]);
      setCalculationModels(createDefaultModels());
      setIsSyncReady(false);
    }
  }, [session]);

  // Sync fallback model when calculationModels changes
  useEffect(() => {
    const fallbackModelId = calculationModels[0]?.id;
    if (!fallbackModelId) return;

    const validModelIds = new Set(calculationModels.map((m) => m.id));
    setDays((currentDays) =>
      currentDays.map((day) =>
        day.calculationModelId && validModelIds.has(day.calculationModelId)
          ? day
          : { ...day, calculationModelId: fallbackModelId },
      ),
    );
  }, [calculationModels]);

  // Load monthly data
  useEffect(() => {
    const loadHours = async () => {
      if (!session) return;

      try {
        setIsLoadingData(true);
        setIsSyncReady(false);
        const response = await requestWithRefresh<{
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
          }>;
        }>(`/hours?month=${selectedMonth}`);

        const normalizedDays = normalizeDays(response.days);
        const normalizedModels = normalizeCalculationModels(
          response.calculationModels,
        );
        const fallbackModelId = normalizedModels[0]?.id ?? "";

        setCalculationModels(normalizedModels);
        setSalary(response.salary);
        setDays(
          normalizedDays.map((day) => ({
            ...day,
            calculationModelId: day.calculationModelId || fallbackModelId,
          })),
        );
        setIsSyncReady(true);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return;
        setAuthError("Não foi possível carregar suas horas salvas.");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadHours();
  }, [session, selectedMonth, reloadKey]);

  // Auto-save with debounce
  useEffect(() => {
    if (!session || !isSyncReady) return;

    // If any day in state belongs to a different month, the state is stale
    // (month just changed but load hasn't completed yet) — skip this save cycle.
    const hasStaleData = days.some(
      (d) => d.date && !d.date.startsWith(selectedMonth),
    );
    if (hasStaleData) return;

    setSyncStatus('saving');
    const timeoutId = window.setTimeout(async () => {
      try {
        const completeDays = days
          .map((day) => ({
            date: day.date,
            startTime: day.startTime,
            endTime: day.endTime,
            projectWorked: day.projectWorked,
            calculationModelId:
              day.calculationModelId || calculationModels[0]?.id || "",
          }))
          .filter(isSyncableDay);

        await requestWithRefresh<{ message: string }>(
          `/hours?month=${selectedMonth}`,
          {
            method: "PUT",
            body: { salary, calculationModels, days: completeDays },
          },
        );
        setAuthError("");
        setSyncStatus('saved');
        window.setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return;
        setAuthError("Falha ao sincronizar os dados no servidor.");
        setSyncStatus('error');
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [salary, days, session, selectedMonth, isSyncReady, calculationModels]);

  const handleDayEdit = (updatedEntry: DayEntry) => {
    setDays((currentDays) =>
      currentDays.map((day) =>
        day.id === updatedEntry.id ? updatedEntry : day,
      ),
    );
  };

  const handleAddDay = (entry: Omit<DayEntry, "id">) => {
    setDays((currentDays) => [...currentDays, { ...entry, id: generateId() }]);
  };

  const handleRemoveDay = (id: string) => {
    setDays((currentDays) => {
      if (currentDays.length === 1) return currentDays;
      return currentDays.filter((day) => day.id !== id);
    });
  };

  const handleFixBuckets = async () => {
    try {
      const result = await requestWithRefresh<{ moved: number }>(
        "/hours/fix-buckets",
        { method: "POST" },
      );
      if (result.moved === 0) {
        alert("Nenhum registro fora do mês correto foi encontrado.");
      } else {
        alert(`${result.moved} registro(s) movido(s) para o mês correto.`);
        setIsSyncReady(false);
        setReloadKey((k) => k + 1);
      }
    } catch {
      setAuthError("Falha ao corrigir os registros.");
    }
  };

  const handleAddModel = () => {
    setCalculationModels((current) => [
      ...current,
      {
        id: generateId(),
        name: `Modelo ${current.length + 1}`,
        multiplier: 1.5,
      },
    ]);
  };

  const handleUpdateModel = (
    id: string,
    field: "name" | "multiplier" | "hourlyRate",
    value: string,
  ) => {
    setCalculationModels((current) =>
      current.map((model) => {
        if (model.id !== id) return model;

        if (id === STANDARD_MODEL_ID) {
          return {
            ...model,
            name: STANDARD_MODEL_NAME,
            multiplier: STANDARD_MODEL_MULTIPLIER,
          };
        }

        if (field === "name") return { ...model, name: value };

        if (field === "hourlyRate") {
          const parsed = Number(value);
          return {
            ...model,
            hourlyRate: value === "" || parsed <= 0 ? undefined : parsed,
          };
        }

        return {
          ...model,
          multiplier: Number(value) > 0 ? Number(value) : model.multiplier,
        };
      }),
    );
  };

  const handleRemoveModel = (id: string) => {
    if (id === STANDARD_MODEL_ID) return;

    setCalculationModels((current) => {
      if (current.length <= 1) return current;

      const fallbackModelId =
        current.find((model) => model.id !== id)?.id ?? "";

      setDays((currentDays) =>
        currentDays.map((day) =>
          day.calculationModelId === id
            ? { ...day, calculationModelId: fallbackModelId }
            : day,
        ),
      );

      return current.filter((model) => model.id !== id);
    });
  };

  const handleConfirmProjectModelChange = () => {
    if (!pendingModelChange) return;
    const { projectLabel, newModelId } = pendingModelChange;

    setDays((currentDays) =>
      currentDays.map((day) => {
        const label = day.projectWorked.trim() || "Sem projeto";
        return label === projectLabel
          ? { ...day, calculationModelId: newModelId }
          : day;
      }),
    );

    setPendingModelChange(null);
  };

  return {
    salary,
    setSalary,
    days,
    setDays,
    syncStatus,
    calculationModels,
    setCalculationModels,
    isLoadingData,
    isSyncReady,
    pendingModelChange,
    setPendingModelChange,
    handleDayEdit,
    handleAddDay,
    handleRemoveDay,
    handleFixBuckets,
    handleAddModel,
    handleUpdateModel,
    handleRemoveModel,
    handleConfirmProjectModelChange,
  };
}
