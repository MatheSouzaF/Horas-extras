import { useState, useEffect } from "react";
import { ApiError } from "../services/api";
import type { AnnualMonth } from "../components/AnnualSummary";
import type { AuthSession } from "./useAuth";

type RequestWithRefresh = <T>(
  path: string,
  options?: { method?: "GET" | "POST" | "PUT"; body?: unknown },
) => Promise<T>;

interface UseAnnualDataParams {
  session: AuthSession | null;
  activeTab: string;
  annualYear: string;
  requestWithRefresh: RequestWithRefresh;
}

export function useAnnualData({
  session,
  activeTab,
  annualYear,
  requestWithRefresh,
}: UseAnnualDataParams) {
  const [annualMonths, setAnnualMonths] = useState<AnnualMonth[]>([]);
  const [isLoadingAnnual, setIsLoadingAnnual] = useState(false);

  useEffect(() => {
    if (!session || activeTab !== "annual") return;

    const loadAnnual = async () => {
      try {
        setIsLoadingAnnual(true);
        const response = await requestWithRefresh<{
          year: string;
          months: AnnualMonth[];
        }>(`/hours/annual?year=${annualYear}`);
        setAnnualMonths(response.months);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return;
        setAnnualMonths([]);
      } finally {
        setIsLoadingAnnual(false);
      }
    };

    loadAnnual();
  }, [session, annualYear, activeTab]);

  return { annualMonths, isLoadingAnnual };
}
