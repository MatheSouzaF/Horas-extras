import type { Totals } from "../types";

type SummaryProps = {
  totals: Totals;
  dayCount?: number;
  selectedMonth?: string;
  salary?: number;
  goalHours?: number;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatMonthLabel = (month: string): string => {
  const date = new Date(`${month}-01T12:00:00`);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};

export function Summary({ totals, dayCount, selectedMonth, salary, goalHours }: SummaryProps) {
  const monthLabel = selectedMonth ? formatMonthLabel(selectedMonth) : null;
  const goalProgress =
    goalHours && goalHours > 0
      ? Math.min(totals.totalHours / goalHours, 1)
      : null;

  return (
    <section className="card">
      <h2>Resumo Mensal</h2>
      <div className="summary-kpi-grid">
        <div className="summary-kpi-card">
          <span className="summary-kpi-label">Total de Horas</span>
          <strong className="summary-kpi-value">{totals.totalHours.toFixed(2)} h</strong>
          {dayCount !== undefined || monthLabel ? (
            <span className="summary-kpi-sub">
              {dayCount !== undefined ? `${dayCount} dia${dayCount !== 1 ? "s" : ""}` : null}
              {dayCount !== undefined && monthLabel ? " • " : null}
              {monthLabel}
            </span>
          ) : null}
          {goalProgress !== null && goalHours ? (
            <div className="goal-progress">
              <div className="goal-progress-track">
                <div
                  className="goal-progress-fill"
                  style={{ width: `${goalProgress * 100}%` }}
                />
              </div>
              <span className="goal-progress-label">
                {Math.round(goalProgress * 100)}% da meta de {goalHours} h
              </span>
            </div>
          ) : null}
        </div>
        <div className="summary-kpi-card">
          <span className="summary-kpi-label">Total Calculado</span>
          <strong className="summary-kpi-value">{currencyFormatter.format(totals.totalValue)}</strong>
          {salary !== undefined && salary > 0 ? (
            <span className="summary-kpi-sub">
              {currencyFormatter.format(salary)} ÷ 160h
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
