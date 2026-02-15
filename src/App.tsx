import { useEffect, useMemo, useState } from "react";
import { AuthPanel } from "./components/AuthPanel";
import {
  CalculationSettings,
  createDefaultModels,
  STANDARD_MODEL_ID,
  STANDARD_MODEL_MULTIPLIER,
  STANDARD_MODEL_NAME,
} from "./components/CalculationSettings";
import { DaysList } from "./components/DaysList";
import { Summary } from "./components/Summary";
import { StatisticsPanel } from "./components/StatisticsPanel";
import { UserSession } from "./components/UserSession";
import { ApiError, apiRequest, refreshSession } from "./services/api";
import type {
  AuthUser,
  CalculationModel,
  DayEntry,
  Salary,
  Totals,
} from "./types";
import { generateId } from "./utils/uuid";

import "./App.css";

const SESSION_STORAGE_KEY = "controle-mensal-horas-extras:session";
const MONTH_STORAGE_KEY = "controle-mensal-horas-extras:selected-month";
const MODELS_STORAGE_KEY = "controle-mensal-horas-extras:models";
const DAY_MODEL_STORAGE_KEY = "controle-mensal-horas-extras:day-model-map";

type StoredState = {
  salary: Salary;
  days: DayEntry[];
};

type AuthSession = {
  token: string;
  refreshToken: string;
  user: AuthUser;
};

type LoginResponse = {
  token: string;
  refreshToken: string;
  user: AuthUser;
};

type HoursResponse = {
  salary: Salary;
  month: string;
  days: Array<{
    id?: string;
    date: string;
    startTime: string;
    endTime: string;
    projectWorked?: string;
    calculationModelId?: string;
  }>;
};

type AppTab = "config" | "days" | "stats";

type ProjectSummaryItem = {
  label: string;
  hours: number;
  totalValue: number;
};

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatCurrency = (value: number) => brlFormatter.format(value);

const getDayIdentity = (
  day: Pick<DayEntry, "date" | "startTime" | "endTime" | "projectWorked">,
) => `${day.date}|${day.startTime}|${day.endTime}|${day.projectWorked.trim()}`;

const createEmptyDay = (): DayEntry => ({
  id: generateId(),
  date: "",
  startTime: "",
  endTime: "",
  projectWorked: "",
  calculationModelId: "",
});

const NIGHT_START_MINUTES = 22 * 60;
const NIGHT_END_MINUTES = 8 * 60;

const toMinutes = (time: string): number => {
  if (!time) {
    return 0;
  }

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const calculateWorkedHours = (startTime: string, endTime: string): number => {
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

const getDayOfWeek = (date: string, offset = 0): number => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + offset)).getUTCDay();
};

const isWeekend = (date: string, offset = 0): boolean => {
  const dayOfWeek = getDayOfWeek(date, offset);
  return dayOfWeek === 0 || dayOfWeek === 6;
};

const isNightMinute = (minuteOfDay: number): boolean =>
  minuteOfDay >= NIGHT_START_MINUTES || minuteOfDay < NIGHT_END_MINUTES;

const calculateStandardModelValue = (
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

const getDayValue = (
  day: DayEntry,
  modelMap: Map<string, CalculationModel>,
  hourlyValue: number,
): number => {
  const workedHours = calculateWorkedHours(day.startTime, day.endTime);

  if (workedHours <= 0) {
    return 0;
  }

  const model = modelMap.get(day.calculationModelId);

  if (model?.id === STANDARD_MODEL_ID) {
    return calculateStandardModelValue(day, hourlyValue, model.multiplier);
  }

  const multiplier = model?.multiplier ?? 1;
  return workedHours * hourlyValue * multiplier;
};

const loadInitialState = (): StoredState => {
  return {
    salary: 0,
    days: [createEmptyDay()],
  };
};

const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const loadSelectedMonth = (): string => {
  const savedMonth = localStorage.getItem(MONTH_STORAGE_KEY);

  if (savedMonth && /^\d{4}-\d{2}$/.test(savedMonth)) {
    return savedMonth;
  }

  return getCurrentMonth();
};

const normalizeDays = (days: HoursResponse["days"]): DayEntry[] => {
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

const isSyncableDay = (
  day: Pick<DayEntry, "date" | "startTime" | "endTime" | "calculationModelId">,
) =>
  Boolean(day.date && day.startTime && day.endTime && day.calculationModelId);

const loadSession = (): AuthSession | null => {
  const saved = localStorage.getItem(SESSION_STORAGE_KEY);

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved) as AuthSession;
  } catch {
    return null;
  }
};

const ensureStandardModel = (
  models: CalculationModel[],
): CalculationModel[] => {
  const standard = models.find((model) => model.id === STANDARD_MODEL_ID);
  const normalizedStandard: CalculationModel = {
    id: STANDARD_MODEL_ID,
    name: STANDARD_MODEL_NAME,
    multiplier: STANDARD_MODEL_MULTIPLIER,
  };

  if (standard) {
    return [
      normalizedStandard,
      ...models.filter((model) => model.id !== STANDARD_MODEL_ID),
    ];
  }

  return [normalizedStandard, ...models];
};

function App() {
  const [session, setSession] = useState<AuthSession | null>(() =>
    loadSession(),
  );
  const [authError, setAuthError] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSyncReady, setIsSyncReady] = useState(false);
  const [salary, setSalary] = useState<Salary>(() => loadInitialState().salary);
  const [days, setDays] = useState<DayEntry[]>(() => loadInitialState().days);
  const [activeTab, setActiveTab] = useState<AppTab>("config");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    loadSelectedMonth(),
  );
  const [calculationModels, setCalculationModels] = useState<
    CalculationModel[]
  >(() => createDefaultModels());

  const modelStorageKey = useMemo(() => {
    if (!session) {
      return "";
    }

    return `${MODELS_STORAGE_KEY}:${session.user.id}:${selectedMonth}`;
  }, [selectedMonth, session]);

  const dayModelStorageKey = useMemo(() => {
    if (!session) {
      return "";
    }

    return `${DAY_MODEL_STORAGE_KEY}:${session.user.id}:${selectedMonth}`;
  }, [selectedMonth, session]);

  const requestWithRefresh = async <T,>(
    path: string,
    options: { method?: "GET" | "POST" | "PUT"; body?: unknown } = {},
  ): Promise<T> => {
    if (!session) {
      throw new ApiError("Sessão inválida.", 401);
    }

    try {
      return await apiRequest<T>(path, {
        method: options.method,
        body: options.body,
        token: session.token,
      });
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }

      const refreshed = await refreshSession<AuthUser>(session.refreshToken);
      const newSession: AuthSession = {
        token: refreshed.token,
        refreshToken: refreshed.refreshToken,
        user: refreshed.user,
      };

      setSession(newSession);

      return apiRequest<T>(path, {
        method: options.method,
        body: options.body,
        token: newSession.token,
      });
    }
  };

  useEffect(() => {
    if (!session) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      setSalary(0);
      setDays([createEmptyDay()]);
      setCalculationModels(createDefaultModels());
      setIsSyncReady(false);
      return;
    }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    localStorage.setItem(MONTH_STORAGE_KEY, selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    if (!modelStorageKey) {
      return;
    }

    const saved = localStorage.getItem(modelStorageKey);

    if (!saved) {
      setCalculationModels(createDefaultModels());
      return;
    }

    try {
      const parsed = JSON.parse(saved) as CalculationModel[];
      const normalized = parsed
        .filter((model) => model.id && model.name.trim())
        .map((model) => ({
          ...model,
          name: model.name.trim(),
          multiplier:
            Number(model.multiplier) > 0 ? Number(model.multiplier) : 1,
        }));

      setCalculationModels(
        normalized.length > 0
          ? ensureStandardModel(normalized)
          : createDefaultModels(),
      );
    } catch {
      setCalculationModels(createDefaultModels());
    }
  }, [modelStorageKey]);

  useEffect(() => {
    if (!modelStorageKey) {
      return;
    }

    localStorage.setItem(modelStorageKey, JSON.stringify(calculationModels));
  }, [calculationModels, modelStorageKey]);

  useEffect(() => {
    const fallbackModelId = calculationModels[0]?.id;

    if (!fallbackModelId) {
      return;
    }

    const validModelIds = new Set(calculationModels.map((model) => model.id));

    setDays((currentDays) =>
      currentDays.map((day) =>
        day.calculationModelId && validModelIds.has(day.calculationModelId)
          ? day
          : { ...day, calculationModelId: fallbackModelId },
      ),
    );
  }, [calculationModels]);

  useEffect(() => {
    if (!dayModelStorageKey) {
      return;
    }

    const dayModelMap = days.reduce<Record<string, string>>((acc, day) => {
      if (
        !day.date ||
        !day.startTime ||
        !day.endTime ||
        !day.calculationModelId
      ) {
        return acc;
      }

      acc[getDayIdentity(day)] = day.calculationModelId;
      return acc;
    }, {});

    localStorage.setItem(dayModelStorageKey, JSON.stringify(dayModelMap));
  }, [days, dayModelStorageKey]);

  useEffect(() => {
    const loadHours = async () => {
      if (!session) {
        return;
      }

      try {
        setIsLoadingData(true);
        const response = await requestWithRefresh<HoursResponse>(
          `/hours?month=${selectedMonth}`,
        );

        const normalizedDays = normalizeDays(response.days);
        const savedMapRaw = dayModelStorageKey
          ? localStorage.getItem(dayModelStorageKey)
          : null;
        let savedMap: Record<string, string> = {};

        if (savedMapRaw) {
          try {
            savedMap = JSON.parse(savedMapRaw) as Record<string, string>;
          } catch {
            savedMap = {};
          }
        }

        const mergedDays = normalizedDays.map((day) => {
          const mappedModelId = savedMap[getDayIdentity(day)];
          const fallbackModelId = calculationModels[0]?.id ?? "";

          return {
            ...day,
            calculationModelId:
              day.calculationModelId || mappedModelId || fallbackModelId,
          };
        });

        setSalary(response.salary);
        setDays(mergedDays);
        setIsSyncReady(true);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          setSession(null);
          setAuthError("Sessão expirada. Faça login novamente.");
          return;
        }
        setAuthError("Não foi possível carregar suas horas salvas.");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadHours();
  }, [session, selectedMonth, dayModelStorageKey]);

  useEffect(() => {
    if (!session || !isSyncReady) {
      return;
    }

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
            body: {
              salary,
              days: completeDays,
            },
          },
        );
        if (authError === "Falha ao sincronizar os dados no servidor.") {
          setAuthError("");
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          setSession(null);
          setAuthError("Sessão expirada. Faça login novamente.");
          return;
        }

        setAuthError("Falha ao sincronizar os dados no servidor.");
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [salary, days, session, selectedMonth, isSyncReady, calculationModels]);

  const totals = useMemo<Totals>(() => {
    const totalHours = days.reduce(
      (accumulator, day) =>
        accumulator + calculateWorkedHours(day.startTime, day.endTime),
      0,
    );

    const valorHora = salary / 160;
    const modelMap = new Map(
      calculationModels.map((model) => [model.id, model]),
    );

    const totalValue = days.reduce(
      (accumulator, day) =>
        accumulator +
        getDayValue(day, modelMap, Number.isFinite(valorHora) ? valorHora : 0),
      0,
    );

    return {
      totalHours,
      totalValue,
    };
  }, [days, salary, calculationModels]);

  const dayHoursChart = useMemo(() => {
    const dateTotals = new Map<string, number>();

    days.forEach((day) => {
      if (!day.date || !day.startTime || !day.endTime) {
        return;
      }

      const workedHours = calculateWorkedHours(day.startTime, day.endTime);

      if (workedHours <= 0) {
        return;
      }

      dateTotals.set(day.date, (dateTotals.get(day.date) ?? 0) + workedHours);
    });

    return Array.from(dateTotals.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([label, hours]) => ({ label, hours }));
  }, [days]);

  const projectHoursChart = useMemo(() => {
    const map = new Map<string, number>();

    days.forEach((day) => {
      if (!day.startTime || !day.endTime) {
        return;
      }

      const workedHours = calculateWorkedHours(day.startTime, day.endTime);

      if (workedHours <= 0) {
        return;
      }

      const label = day.projectWorked.trim() || "Sem projeto";
      map.set(label, (map.get(label) ?? 0) + workedHours);
    });

    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, hours]) => ({ label, hours }));
  }, [days]);

  const projectSummary = useMemo<ProjectSummaryItem[]>(() => {
    const projectMap = new Map<string, { hours: number; totalValue: number }>();
    const modelMap = new Map(
      calculationModels.map((model) => [model.id, model]),
    );
    const valorHora = salary / 160;

    days.forEach((day) => {
      if (!day.startTime || !day.endTime) {
        return;
      }

      const workedHours = calculateWorkedHours(day.startTime, day.endTime);

      if (workedHours <= 0) {
        return;
      }

      const label = day.projectWorked.trim() || "Sem projeto";
      const current = projectMap.get(label) ?? { hours: 0, totalValue: 0 };
      const value = getDayValue(
        day,
        modelMap,
        Number.isFinite(valorHora) ? valorHora : 0,
      );

      projectMap.set(label, {
        hours: current.hours + workedHours,
        totalValue: current.totalValue + value,
      });
    });

    return Array.from(projectMap.entries())
      .sort((a, b) => b[1].hours - a[1].hours)
      .map(([label, data]) => ({
        label,
        hours: data.hours,
        totalValue: data.totalValue,
      }));
  }, [days, salary, calculationModels]);

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
      if (currentDays.length === 1) {
        return currentDays;
      }

      return currentDays.filter((day) => day.id !== id);
    });
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
    field: "name" | "multiplier",
    value: string,
  ) => {
    setCalculationModels((current) =>
      current.map((model) => {
        if (model.id !== id) {
          return model;
        }

        if (id === STANDARD_MODEL_ID) {
          return {
            ...model,
            name: STANDARD_MODEL_NAME,
            multiplier: STANDARD_MODEL_MULTIPLIER,
          };
        }

        if (field === "name") {
          return { ...model, name: value };
        }

        return {
          ...model,
          multiplier: Number(value) > 0 ? Number(value) : model.multiplier,
        };
      }),
    );
  };

  const handleRemoveModel = (id: string) => {
    if (id === STANDARD_MODEL_ID) {
      return;
    }

    setCalculationModels((current) => {
      if (current.length <= 1) {
        return current;
      }

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

  const handleRegister = async (
    name: string,
    email: string,
    password: string,
  ) => {
    if (!name || !email || !password) {
      setAuthError("Preencha nome, email e senha.");
      return;
    }

    if (password.length < 6) {
      setAuthError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      await apiRequest<{ user: AuthUser }>("/auth/register", {
        method: "POST",
        body: {
          name,
          email,
          password,
        },
      });

      const loginResponse = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: {
          email,
          password,
        },
      });

      setSession(loginResponse);
      setAuthError("");
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Erro ao cadastrar.",
      );
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: {
          email,
          password,
          deviceName: `Web-${navigator.platform || "unknown"}`,
        },
      });

      setSession(response);
      setAuthError("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Erro ao entrar.");
    }
  };

  const handleLogout = async () => {
    if (session) {
      try {
        await apiRequest<{ message: string }>("/auth/logout", {
          method: "POST",
          body: {
            refreshToken: session.refreshToken,
          },
        });
      } catch {
        setAuthError("Falha ao encerrar sessão no servidor.");
      }
    }

    setSession(null);
  };

  return (
    <main className="container">
      <header className="header">
        <h1>Controle Mensal de Horas Extras</h1>
        <p>
          Configure seus modelos de cálculo e registre os dias por projeto para
          acompanhar os valores do mês.
        </p>
      </header>

      {!session ? (
        <AuthPanel
          errorMessage={authError}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      ) : null}

      {session ? (
        <div className="content">
          <UserSession name={session.user.name} onLogout={handleLogout} />

          {authError ? <p className="error-message">{authError}</p> : null}

          {isLoadingData ? (
            <p className="hint">Carregando dados do servidor...</p>
          ) : null}

          <div className="workspace-grid">
            <button
              type="button"
              className={isSidebarOpen ? "menu-toggle open" : "menu-toggle"}
              onClick={() => setIsSidebarOpen(true)}
            >
              ☰ Menu
            </button>

            {isSidebarOpen ? (
              <button
                type="button"
                className="sidebar-backdrop"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Fechar menu"
              />
            ) : null}

            <aside
              className={
                isSidebarOpen ? "tabs-sidebar card open" : "tabs-sidebar card"
              }
            >
              <button
                type="button"
                className={
                  activeTab === "config" ? "tab-button active" : "tab-button"
                }
                onClick={() => {
                  setActiveTab("config");
                  setIsSidebarOpen(false);
                }}
              >
                Configuração
              </button>
              <button
                type="button"
                className={
                  activeTab === "days" ? "tab-button active" : "tab-button"
                }
                onClick={() => {
                  setActiveTab("days");
                  setIsSidebarOpen(false);
                }}
              >
                Dias
              </button>
              <button
                type="button"
                className={
                  activeTab === "stats" ? "tab-button active" : "tab-button"
                }
                onClick={() => {
                  setActiveTab("stats");
                  setIsSidebarOpen(false);
                }}
              >
                Estatísticas
              </button>
            </aside>

            <section className="tab-content">
              {activeTab === "config" ? (
                <CalculationSettings
                  salary={salary}
                  onSalaryChange={setSalary}
                  models={calculationModels}
                  onAddModel={handleAddModel}
                  onUpdateModel={handleUpdateModel}
                  onRemoveModel={handleRemoveModel}
                />
              ) : null}

              {activeTab === "days" ? (
                <div className="days-layout">
                  <div className="days-overview-grid">
                    <section className="card month-selector">
                      <label className="field">
                        <span>Mês de referência</span>
                        <input
                          type="month"
                          value={selectedMonth}
                          onChange={(event) =>
                            setSelectedMonth(event.target.value)
                          }
                        />
                      </label>
                    </section>

                    <Summary totals={totals} />

                    <section className="card inline-project-summary">
                      <h2>Resumo por Projeto</h2>

                      {projectSummary.length === 0 ? (
                        <p className="hint">
                          Adicione dias completos para ver os cálculos separados
                          por freela.
                        </p>
                      ) : (
                        <div className="inline-project-summary-list">
                          {projectSummary.map((item) => (
                            <article
                              key={item.label}
                              className="inline-project-summary-item"
                            >
                              <p>
                                <strong>{item.label}</strong>
                                <span>{item.hours.toFixed(2)} h</span>
                              </p>
                              <p>
                                <span>Total calculado</span>
                                <strong>
                                  {formatCurrency(item.totalValue)}
                                </strong>
                              </p>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>
                  </div>

                  <DaysList
                    days={days}
                    calculationModels={calculationModels}
                    onEditDay={handleDayEdit}
                    onRemoveDay={handleRemoveDay}
                    onAddDay={handleAddDay}
                  />
                </div>
              ) : null}

              {activeTab === "stats" ? (
                <StatisticsPanel
                  dayHours={dayHoursChart}
                  projectHours={projectHoursChart}
                  projectSummary={projectSummary}
                />
              ) : null}
            </section>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default App;
