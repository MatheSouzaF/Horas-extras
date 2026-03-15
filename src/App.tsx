import { useRef, useState, type ReactNode } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AuthPanel } from "./components/AuthPanel";
import { CalculationSettings } from "./components/CalculationSettings";
import { DaysList } from "./components/DaysList";
import { MonthNavigator } from "./components/calcule/MonthNavigator";
import { Summary } from "./components/Summary";
import { StatisticsPanel } from "./components/StatisticsPanel";
import { AnnualSummary } from "./components/AnnualSummary";
import { ProjectSummaryCard } from "./components/ProjectSummaryCard";
import type { DayEntry } from "./types";
import { useAuth } from "./hooks/useAuth";
import { useMonthlyData } from "./hooks/useMonthlyData";
import { useGeralData } from "./hooks/useGeralData";
import { useAnnualData } from "./hooks/useAnnualData";
import { useTotals } from "./hooks/useTotals";
import { useTheme } from "./hooks/useTheme";
import {
  formatDateToBr,
  formatCurrency,
  sanitizeFileNamePart,
  formatUserName,
} from "./lib/formatters";
import { calculateWorkedHours } from "./lib/calculations";
import { getCurrentMonth } from "./lib/data";

import "./App.css";

type AppTab = "config" | "days" | "stats" | "annual";

const getTabFromPath = (pathname: string): AppTab => {
  if (pathname === "/config") return "config";
  if (pathname === "/stats") return "stats";
  if (pathname.startsWith("/anual")) return "annual";
  return "days";
};

function CalcIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="13" y2="16" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6"  y1="20" x2="6"  y2="14" />
      <line x1="2"  y1="20" x2="22" y2="20" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8"  y1="2" x2="8"  y2="6" />
      <line x1="3"  y1="10" x2="21" y2="10" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

const NAV_ITEMS: { tab: AppTab; icon: React.ReactNode; label: string }[] = [
  { tab: "days",   icon: <CalcIcon />,     label: "Calcule" },
  { tab: "stats",  icon: <ChartIcon />,    label: "Estatísticas" },
  { tab: "annual", icon: <CalendarIcon />, label: "Resumo Anual" },
  { tab: "config", icon: <SettingsIcon />, label: "Configuração" },
];

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"  x2="12" y2="3"  />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"  />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1"  y1="12" x2="3"  y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36" />
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const {
    session,
    authError,
    setAuthError,
    login,
    logout,
    register,
    requestWithRefresh,
  } = useAuth();

  const activeTab = getTabFromPath(location.pathname);
  const mensalMatch = /^\/mes\/(\d{4}-\d{2})/.exec(location.pathname);
  const selectedMonth = mensalMatch?.[1] ?? getCurrentMonth();
  const annualMatch = /^\/anual\/(\d{4})/.exec(location.pathname);
  const annualYear = annualMatch?.[1] ?? String(new Date().getFullYear());
  const viewMode = location.pathname === "/geral" ? "geral" : "mensal";

  const setSelectedMonth = (month: string) => navigate(`/mes/${month}`);
  const setAnnualYear = (year: string) => navigate(`/anual/${year}`);

  const {
    salary,
    setSalary,
    days,
    calculationModels,
    isLoadingData,
    syncStatus,
    pendingModelChange,
    setPendingModelChange,
    handleDayEdit,
    handleAddDay,
    handleRemoveDay,
    handleAddModel,
    handleUpdateModel,
    handleRemoveModel,
    handleConfirmProjectModelChange,
  } = useMonthlyData({
    session,
    requestWithRefresh,
    setAuthError,
    selectedMonth,
  });

  const { annualMonths, isLoadingAnnual } = useAnnualData({
    session,
    activeTab,
    annualYear,
    requestWithRefresh,
  });

  const {
    totals,
    dayHoursChart,
    averageDailyHours,
    projectHoursChart,
    projectSummary,
    dayValuesById,
    projectNames,
  } = useTotals({ days, salary, calculationModels });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterProject, setFilterProject] = useState<string | null>(null);

  const [goalHours, setGoalHours] = useState<number>(() => {
    const stored = localStorage.getItem("goalHours");
    return stored ? Number(stored) : 0;
  });
  const handleGoalHoursChange = (value: number) => {
    setGoalHours(value);
    if (value > 0) {
      localStorage.setItem("goalHours", String(value));
    } else {
      localStorage.removeItem("goalHours");
    }
  };

  type UndoToast = { id: string; entry: DayEntry; label: string };
  const [undoToast, setUndoToast] = useState<UndoToast | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  const handleRemoveDayWithUndo = (id: string) => {
    const entry = days.find((d) => d.id === id);
    if (!entry) return;

    const label = entry.projectWorked.trim() || entry.date || "Entrada";
    setUndoToast({ id, entry, label });

    if (undoTimerRef.current !== null) window.clearTimeout(undoTimerRef.current);
    undoTimerRef.current = window.setTimeout(() => {
      handleRemoveDay(id);
      setUndoToast(null);
    }, 5000);
  };

  const handleUndoRemove = () => {
    if (undoTimerRef.current !== null) window.clearTimeout(undoTimerRef.current);
    setUndoToast(null);
  };

  const {
    isLoadingGeral,
    geralError,
    geralPage,
    setGeralPage,
    geralTotals,
    geralDayValuesById,
    geralPagedDays,
    geralTotalPages,
  } = useGeralData({
    session,
    viewMode,
    requestWithRefresh,
    calculationModels,
  });

  const handleExportGeralCsv = async () => {
    if (!session) return;

    type ExportDay = {
      id?: string;
      date: string;
      startTime: string;
      endTime: string;
      projectWorked?: string;
      calculationModelId?: string;
      calculatedValue?: number;
    };

    try {
      const response = await requestWithRefresh<{ days: ExportDay[] }>(
        "/hours/all?page=0&limit=9999",
      );

      const modelNameById = new Map(
        calculationModels.map((m) => [m.id, m.name]),
      );

      const header = "Data,Entrada,Saída,Horas,Projeto,Modelo,Valor";
      const rows = response.days.map((day) => {
        const hours = calculateWorkedHours(day.startTime, day.endTime);
        const project = (day.projectWorked ?? "").trim() || "Sem projeto";
        const model = modelNameById.get(day.calculationModelId ?? "") ?? "";
        const value = day.calculatedValue ?? 0;
        return [
          formatDateToBr(day.date),
          day.startTime,
          day.endTime,
          hours.toFixed(2),
          `"${project.replace(/"/g, '""')}"`,
          `"${model.replace(/"/g, '""')}"`,
          `"${formatCurrency(value).replace(/"/g, '""')}"`,
        ].join(",");
      });

      const csvContent = [header, ...rows].join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `horas-extras-${new Date().getFullYear()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    }
  };

  const handleDownloadProjectPdf = (projectLabel: string) => {
    if (!session) return;

    const normalizedProject = projectLabel.trim() || "Sem projeto";
    const projectDays = days
      .filter((day) => day.date && day.startTime && day.endTime)
      .map((day) => ({
        ...day,
        workedHours: calculateWorkedHours(day.startTime, day.endTime),
        normalizedProject: day.projectWorked.trim() || "Sem projeto",
      }))
      .filter(
        (day) =>
          day.workedHours > 0 && day.normalizedProject === normalizedProject,
      )
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });

    if (projectDays.length === 0) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const userName = formatUserName(session.user.name);

    doc.setFontSize(17);
    doc.text(userName, 40, 48);
    doc.setFontSize(12);
    doc.text(`Horas trabalhadas no ${normalizedProject}`, 40, 70);

    autoTable(doc, {
      startY: 90,
      head: [["Data", "Início", "Fim", "Horas"]],
      body: projectDays.map((day) => [
        formatDateToBr(day.date),
        day.startTime,
        day.endTime,
        `${day.workedHours.toFixed(2)} h`,
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [31, 41, 55] },
    });

    const totalHours = projectDays.reduce((acc, day) => acc + day.workedHours, 0);
    const lastY = (doc as jsPDF & { lastAutoTable?: { finalY: number } })
      .lastAutoTable?.finalY;

    doc.setFontSize(11);
    doc.text(
      `Total de horas: ${totalHours.toFixed(2)} h`,
      40,
      (lastY ?? 90) + 24,
    );

    const safeProject = sanitizeFileNamePart(normalizedProject) || "projeto";
    doc.save(`horas-${safeProject}-${selectedMonth}.pdf`);
  };

  const navigateToTab = (tab: AppTab) => {
    setIsSidebarOpen(false);
    if (tab === "days") navigate(`/mes/${selectedMonth}`);
    else if (tab === "annual") navigate(`/anual/${annualYear}`);
    else navigate(`/${tab}`);
  };

  const syncBadge = {
    idle:   null,
    saving: { label: "⟳ Salvando...", cls: "sync-badge sync-badge--saving" },
    saved:  { label: "● Salvo",       cls: "sync-badge sync-badge--saved"  },
    error:  { label: "⚠ Erro",        cls: "sync-badge sync-badge--error"  },
  }[syncStatus] ?? null;

  const displayName = session
    ? (session.user.name.trim().charAt(0).toUpperCase() + session.user.name.trim().slice(1)) || "Usuário"
    : "";

  // ── Auth state ──────────────────────────────────────────────
  if (!session) {
    return (
      <div className="auth-shell">
        <div className="auth-shell-inner">
          <header className="auth-header">
            <div className="auth-brand">
              <div className="auth-brand-logo"><ClockIcon /></div>
              <div>
                <h1 className="auth-brand-name">Horas Extras</h1>
                <p className="auth-brand-sub">Controle mensal de horas</p>
              </div>
            </div>
          </header>
          <AuthPanel
            errorMessage={authError}
            onLogin={login}
            onRegister={register}
          />
        </div>
      </div>
    );
  }

  // ── App shell ───────────────────────────────────────────────
  return (
    <div className="app-shell">
      {/* Sidebar backdrop (mobile) */}
      {isSidebarOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Fechar menu"
        />
      ) : null}

      {/* Sidebar */}
      <aside className={isSidebarOpen ? "sidebar sidebar--open" : "sidebar"}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo"><ClockIcon /></div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">Horas Extras</span>
            <span className="sidebar-brand-sub">Controle mensal</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <span className="sidebar-nav-label">Menu</span>
          {NAV_ITEMS.map(({ tab, icon, label }) => (
            <button
              key={tab}
              type="button"
              className={activeTab === tab ? "sidebar-nav-item active" : "sidebar-nav-item"}
              onClick={() => navigateToTab(tab)}
            >
              <span className="sidebar-nav-icon">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Footer — user */}
        <div className="sidebar-footer">
          {syncBadge ? (
            <span className={syncBadge.cls} style={{ marginBottom: "0.5rem", display: "block" }}>
              {syncBadge.label}
            </span>
          ) : null}
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{displayName}</span>
            </div>
            <div className="sidebar-user-actions">
              <button
                type="button"
                className="sidebar-icon-btn"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Modo claro" : "Modo escuro"}
                title={theme === "dark" ? "Modo claro" : "Modo escuro"}
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>
              <button
                type="button"
                className="sidebar-icon-btn sidebar-icon-btn--logout"
                onClick={logout}
                title="Sair"
                aria-label="Sair"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-wrapper">
        {/* Mobile topbar */}
        <div className="topbar">
          <button
            type="button"
            className="topbar-menu-btn"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="topbar-title">Horas Extras</span>
          {syncBadge ? <span className={syncBadge.cls}>{syncBadge.label}</span> : null}
        </div>

        <main className="page-content">
          {authError ? <p className="error-message" style={{ marginBottom: "0.75rem" }}>{authError}</p> : null}
          {isLoadingData ? <p className="hint" style={{ marginBottom: "0.75rem" }}>Carregando dados do servidor...</p> : null}

          <Routes>
            <Route
              path="/"
              element={<Navigate to={`/mes/${getCurrentMonth()}`} replace />}
            />

            <Route
              path="/config"
              element={
                <CalculationSettings
                  salary={salary}
                  onSalaryChange={setSalary}
                  goalHours={goalHours}
                  onGoalHoursChange={handleGoalHoursChange}
                  models={calculationModels}
                  onAddModel={handleAddModel}
                  onUpdateModel={handleUpdateModel}
                  onRemoveModel={handleRemoveModel}
                />
              }
            />

            <Route
              path="/stats"
              element={
                <StatisticsPanel
                  dayHours={dayHoursChart}
                  projectHours={projectHoursChart}
                  projectSummary={projectSummary}
                  averageDailyHours={averageDailyHours}
                  workedDaysCount={dayHoursChart.length}
                />
              }
            />

            <Route
              path="/anual/:year"
              element={
                <AnnualSummary
                  year={annualYear}
                  months={annualMonths}
                  isLoading={isLoadingAnnual}
                  onYearChange={setAnnualYear}
                />
              }
            />

            <Route
              path="/geral"
              element={
                <div className="days-layout">
                  <div className="view-mode-toggle">
                    <button
                      type="button"
                      className="view-mode-button"
                      onClick={() => navigate(`/mes/${selectedMonth}`)}
                    >
                      Mensal
                    </button>
                    <button
                      type="button"
                      className="view-mode-button active"
                      onClick={() => { navigate("/geral"); setGeralPage(0); }}
                    >
                      Resumo Geral
                    </button>
                  </div>

                  {isLoadingGeral ? (
                    <p className="hint">Carregando todos os registros...</p>
                  ) : geralError ? (
                    <p className="error-message">{geralError}</p>
                  ) : geralPagedDays.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-state-icon" aria-hidden="true">📋</span>
                      <p className="empty-state-title">Nenhum registro encontrado</p>
                      <p className="empty-state-hint">Adicione dias no modo Mensal para ver o resumo geral.</p>
                    </div>
                  ) : (
                    <>
                      <div className="geral-toolbar">
                        <Summary totals={geralTotals} />
                        <button
                          type="button"
                          className="export-csv-button"
                          onClick={handleExportGeralCsv}
                        >
                          Exportar CSV
                        </button>
                      </div>

                      <DaysList
                        days={geralPagedDays}
                        calculationModels={calculationModels}
                        dayValuesById={geralDayValuesById}
                        projectNames={[]}
                        filterProject={null}
                        filterOptions={[]}
                        onFilterChange={() => {}}
                        onEditDay={handleDayEdit}
                        onRemoveDay={handleRemoveDayWithUndo}
                        onAddDay={handleAddDay}
                        readOnly
                        noReverse
                      />

                      {geralTotalPages > 1 ? (
                        <div className="pagination">
                          <button
                            type="button"
                            className="pagination-button"
                            disabled={geralPage === 0}
                            onClick={() => setGeralPage((p) => p - 1)}
                          >
                            ‹ Anterior
                          </button>
                          <span className="pagination-info">
                            {geralPage + 1} / {geralTotalPages}
                          </span>
                          <button
                            type="button"
                            className="pagination-button"
                            disabled={geralPage >= geralTotalPages - 1}
                            onClick={() => setGeralPage((p) => p + 1)}
                          >
                            Próximo ›
                          </button>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              }
            />

            <Route
              path="/mes/:month"
              element={
                <div className="days-layout">
                  <div className="view-mode-toggle">
                    <button
                      type="button"
                      className="view-mode-button active"
                      onClick={() => navigate(`/mes/${selectedMonth}`)}
                    >
                      Mensal
                    </button>
                    <button
                      type="button"
                      className="view-mode-button"
                      onClick={() => { navigate("/geral"); setGeralPage(0); }}
                    >
                      Resumo Geral
                    </button>
                  </div>

                  <MonthNavigator
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                    totalHours={totals.totalHours}
                    totalValue={totals.totalValue}
                    dayCount={dayHoursChart.length}
                    salary={salary}
                    goalHours={goalHours}
                  />

                  <ProjectSummaryCard
                    projectSummary={projectSummary}
                    calculationModels={calculationModels}
                    pendingModelChange={pendingModelChange}
                    onOpenModelChange={(label, modelId) =>
                      setPendingModelChange({ projectLabel: label, newModelId: modelId })
                    }
                    onUpdatePendingModel={(newModelId) =>
                      setPendingModelChange((prev) =>
                        prev ? { ...prev, newModelId } : prev,
                      )
                    }
                    onConfirmModelChange={handleConfirmProjectModelChange}
                    onCancelModelChange={() => setPendingModelChange(null)}
                    onDownloadPdf={handleDownloadProjectPdf}
                  />

                  <DaysList
                    days={
                      filterProject === null
                        ? days
                        : days.filter(
                            (d) =>
                              (d.projectWorked.trim() || "Sem projeto") === filterProject,
                          )
                    }
                    calculationModels={calculationModels}
                    dayValuesById={dayValuesById}
                    salary={salary}
                    projectNames={projectNames}
                    filterProject={filterProject}
                    filterOptions={projectSummary.map((item) => item.label)}
                    selectedMonth={selectedMonth}
                    onFilterChange={setFilterProject}
                    onEditDay={handleDayEdit}
                    onRemoveDay={handleRemoveDayWithUndo}
                    onAddDay={handleAddDay}
                    onMonthChange={setSelectedMonth}
                  />
                </div>
              }
            />
          </Routes>
        </main>
      </div>

      {undoToast ? (
        <div className="undo-toast" role="status">
          <span>Entrada removida: <strong>{undoToast.label}</strong></span>
          <button type="button" className="undo-toast-button" onClick={handleUndoRemove}>
            Desfazer
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default App;
