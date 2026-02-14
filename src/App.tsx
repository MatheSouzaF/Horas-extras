import { useEffect, useMemo, useState } from "react";
import { AuthPanel } from "./components/AuthPanel";
import { DaysList } from "./components/DaysList";
import { SalaryInput } from "./components/SalaryInput";
import { Summary } from "./components/Summary";
import { StatisticsPanel } from "./components/StatisticsPanel";
import { UserSession } from "./components/UserSession";
import { ApiError, apiRequest, refreshSession } from "./services/api";
import type { AuthUser, DayEntry, Salary, Totals } from "./types";
import "./App.css";

const SESSION_STORAGE_KEY = "controle-mensal-horas-extras:session";
const MONTH_STORAGE_KEY = "controle-mensal-horas-extras:selected-month";

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
  }>;
};

type AppTab = "days" | "stats";

const createEmptyDay = (): DayEntry => ({
  id: crypto.randomUUID(),
  date: "",
  startTime: "",
  endTime: "",
  projectWorked: "",
});

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

  if (end <= start) {
    return 0;
  }

  return (end - start) / 60;
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
    id: day.id ?? crypto.randomUUID(),
    date: day.date,
    startTime: day.startTime,
    endTime: day.endTime,
    projectWorked: day.projectWorked ?? "",
  }));
};

const isCompleteDay = (day: Pick<DayEntry, "date" | "startTime" | "endTime">) =>
  Boolean(day.date && day.startTime && day.endTime);

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

function App() {
  const [session, setSession] = useState<AuthSession | null>(() =>
    loadSession(),
  );
  const [authError, setAuthError] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSyncReady, setIsSyncReady] = useState(false);
  const [salary, setSalary] = useState<Salary>(() => loadInitialState().salary);
  const [days, setDays] = useState<DayEntry[]>(() => loadInitialState().days);
  const [activeTab, setActiveTab] = useState<AppTab>("days");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    loadSelectedMonth(),
  );

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
      setIsSyncReady(false);
      return;
    }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    localStorage.setItem(MONTH_STORAGE_KEY, selectedMonth);
  }, [selectedMonth]);

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

        setSalary(response.salary);
        setDays(normalizeDays(response.days));
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
  }, [session, selectedMonth]);

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
          }))
          .filter(isCompleteDay);

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
  }, [salary, days, session, selectedMonth, isSyncReady]);

  const totals = useMemo<Totals>(() => {
    const totalHours = days.reduce(
      (accumulator, day) =>
        accumulator + calculateWorkedHours(day.startTime, day.endTime),
      0,
    );

    const valorHora = salary / 160;
    const valorHora50 = valorHora * 1.5;
    const valorHora100 = valorHora * 2;

    return {
      totalHours,
      total50: totalHours * valorHora50,
      total100: totalHours * valorHora100,
    };
  }, [days, salary]);

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

  const handleDayEdit = (updatedEntry: DayEntry) => {
    setDays((currentDays) =>
      currentDays.map((day) =>
        day.id === updatedEntry.id ? updatedEntry : day,
      ),
    );
  };

  const handleAddDay = (entry: Omit<DayEntry, "id">) => {
    setDays((currentDays) => [
      ...currentDays,
      { ...entry, id: crypto.randomUUID() },
    ]);
  };

  const handleRemoveDay = (id: string) => {
    setDays((currentDays) => {
      if (currentDays.length === 1) {
        return currentDays;
      }

      return currentDays.filter((day) => day.id !== id);
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
          Registre os dias do mês e acompanhe os valores com adicional de 50% e
          100%.
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

          <section className="card month-selector">
            <label className="field">
              <span>Mês de referência</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
              />
            </label>
          </section>

          <div className="workspace-grid">
            <button
              type="button"
              className="menu-toggle"
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
              {activeTab === "days" ? (
                <>
                  <div className="top-row">
                    <SalaryInput salary={salary} onSalaryChange={setSalary} />
                    <Summary totals={totals} />
                  </div>

                  <DaysList
                    days={days}
                    onEditDay={handleDayEdit}
                    onRemoveDay={handleRemoveDay}
                    onAddDay={handleAddDay}
                  />
                </>
              ) : null}

              {activeTab === "stats" ? (
                <StatisticsPanel
                  dayHours={dayHoursChart}
                  projectHours={projectHoursChart}
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
