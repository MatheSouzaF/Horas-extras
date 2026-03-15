import { useRef, useState } from "react";
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
import { UserSession } from "./components/UserSession";
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

  // Derive navigation state from URL
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
    handleFixBuckets,
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
      // silent — user will notice nothing happened
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
          onLogin={login}
          onRegister={register}
        />
      ) : null}

      {session ? (
        <div className="content">
          <UserSession
            name={session.user.name}
            syncStatus={syncStatus}
            theme={theme}
            onToggleTheme={toggleTheme}
            onLogout={logout}
          />

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
                className={activeTab === "days" ? "tab-button active" : "tab-button"}
                onClick={() => navigateToTab("days")}
              >
                Calcule
              </button>
              <button
                type="button"
                className={activeTab === "stats" ? "tab-button active" : "tab-button"}
                onClick={() => navigateToTab("stats")}
              >
                Estatísticas
              </button>
              <button
                type="button"
                className={activeTab === "config" ? "tab-button active" : "tab-button"}
                onClick={() => navigateToTab("config")}
              >
                Configuração
              </button>
              <button
                type="button"
                className={activeTab === "annual" ? "tab-button active" : "tab-button"}
                onClick={() => navigateToTab("annual")}
              >
                Resumo Anual
              </button>
            </aside>

            <section className="tab-content">
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
                          onClick={() => {
                            navigate("/geral");
                            setGeralPage(0);
                          }}
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
                          onClick={() => {
                            navigate("/geral");
                            setGeralPage(0);
                          }}
                        >
                          Resumo Geral
                        </button>
                      </div>

                      <MonthNavigator
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        totalHours={totals.totalHours}
                        totalValue={totals.totalValue}
                      />

                      <div className="fix-buckets-row">
                        <button
                          type="button"
                          className="fix-buckets-button"
                          onClick={handleFixBuckets}
                          title="Corrige registros salvos no mês errado, movendo cada dia para o mês correspondente à sua data"
                        >
                          Corrigir registros no mês errado
                        </button>
                      </div>

                      <div className="days-overview-grid">
                        <Summary
                          totals={totals}
                          dayCount={dayHoursChart.length}
                          selectedMonth={selectedMonth}
                          salary={salary}
                          goalHours={goalHours}
                        />

                        <ProjectSummaryCard
                          projectSummary={projectSummary}
                          calculationModels={calculationModels}
                          pendingModelChange={pendingModelChange}
                          onOpenModelChange={(label, modelId) =>
                            setPendingModelChange({
                              projectLabel: label,
                              newModelId: modelId,
                            })
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
                      </div>

                      <DaysList
                        days={
                          filterProject === null
                            ? days
                            : days.filter(
                                (d) =>
                                  (d.projectWorked.trim() || "Sem projeto") ===
                                  filterProject,
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
            </section>
          </div>
        </div>
      ) : null}

      {undoToast ? (
        <div className="undo-toast" role="status">
          <span>Entrada removida: <strong>{undoToast.label}</strong></span>
          <button type="button" className="undo-toast-button" onClick={handleUndoRemove}>
            Desfazer
          </button>
        </div>
      ) : null}
    </main>
  );
}

export default App;
