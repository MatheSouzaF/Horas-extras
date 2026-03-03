type AnnualMonthProject = {
  label: string;
  hours: number;
  totalValue: number;
};

export type AnnualMonth = {
  month: string;
  salary: number;
  totalHours: number;
  totalValue: number;
  workedDaysCount: number;
  projects: AnnualMonthProject[];
};

type AnnualSummaryProps = {
  year: string;
  months: AnnualMonth[];
  isLoading: boolean;
  onYearChange: (year: string) => void;
};

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatCurrency = (value: number) => currencyFormatter.format(value);
const formatHours = (value: number) => `${value.toFixed(2)} h`;

const getMonthName = (month: string): string => {
  const parts = month.split("-");
  const monthIndex = parseInt(parts[1] ?? "1", 10) - 1;
  return MONTH_NAMES[monthIndex] ?? month;
};

const getColorFromLabel = (label: string) => {
  const hash = Array.from(label).reduce(
    (accumulator, char) => accumulator + char.charCodeAt(0),
    0,
  );
  const hue = hash % 360;
  return `hsl(${hue} 70% 45%)`;
};

export function AnnualSummary({
  year,
  months,
  isLoading,
  onYearChange,
}: AnnualSummaryProps) {
  const totalHours = months.reduce((acc, m) => acc + m.totalHours, 0);
  const totalValue = months.reduce((acc, m) => acc + m.totalValue, 0);
  const totalDays = months.reduce((acc, m) => acc + m.workedDaysCount, 0);

  const monthBarMax = Math.max(...months.map((m) => m.totalHours), 0);

  const annualProjectMap = new Map<string, { hours: number; totalValue: number }>();
  months.forEach((m) => {
    m.projects.forEach((p) => {
      const current = annualProjectMap.get(p.label) ?? {
        hours: 0,
        totalValue: 0,
      };
      annualProjectMap.set(p.label, {
        hours: current.hours + p.hours,
        totalValue: current.totalValue + p.totalValue,
      });
    });
  });

  const annualProjects = Array.from(annualProjectMap.entries())
    .sort((a, b) => b[1].hours - a[1].hours)
    .map(([label, data]) => ({ label, ...data }));

  const projectBarMax = Math.max(...annualProjects.map((p) => p.hours), 0);

  return (
    <div className="annual-summary">
      <div className="annual-header">
        <label className="field annual-year-field">
          <span>Ano de referência</span>
          <input
            type="number"
            min="2000"
            max="2099"
            value={year}
            onChange={(event) => {
              const val = event.target.value;
              if (/^\d{4}$/.test(val)) {
                onYearChange(val);
              }
            }}
          />
        </label>
      </div>

      {isLoading ? (
        <p className="hint">Carregando resumo anual...</p>
      ) : (
        <>
          <div className="annual-totals-grid">
            <section className="card annual-total-card">
              <h2>Total de Horas</h2>
              <strong className="annual-total-value">
                {formatHours(totalHours)}
              </strong>
              <p className="hint">
                {totalDays} dia{totalDays !== 1 ? "s" : ""} trabalhado
                {totalDays !== 1 ? "s" : ""}
              </p>
            </section>

            <section className="card annual-total-card">
              <h2>Total Calculado</h2>
              <strong className="annual-total-value">
                {formatCurrency(totalValue)}
              </strong>
              <p className="hint">
                {months.length} {months.length !== 1 ? "meses" : "mês"} com
                registros
              </p>
            </section>
          </div>

          {months.length === 0 ? (
            <section className="card">
              <p className="hint">
                Nenhum registro encontrado para {year}.
              </p>
            </section>
          ) : (
            <>
              <section className="card">
                <h2>Horas por Mês</h2>
                <div className="chart-vertical annual-month-chart">
                  {months.map((m) => {
                    const height =
                      monthBarMax > 0
                        ? (m.totalHours / monthBarMax) * 100
                        : 0;
                    return (
                      <div key={m.month} className="chart-column-item">
                        <strong className="chart-value">
                          {formatHours(m.totalHours)}
                        </strong>
                        <div className="chart-column-track">
                          <div
                            className="chart-column-fill"
                            style={{
                              height: `${height}%`,
                              backgroundColor: "#1f2937",
                            }}
                          />
                        </div>
                        <span className="chart-label">
                          {getMonthName(m.month).slice(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="card">
                <h2>Resumo por Mês</h2>
                <div className="annual-months-table">
                  <div className="annual-months-table-header">
                    <span>Mês</span>
                    <span>Dias</span>
                    <span>Horas</span>
                    <span>Total</span>
                  </div>
                  {months.map((m) => (
                    <div key={m.month} className="annual-months-table-row">
                      <span className="annual-month-name">
                        {getMonthName(m.month)}
                      </span>
                      <span>{m.workedDaysCount}</span>
                      <span>{formatHours(m.totalHours)}</span>
                      <span>{formatCurrency(m.totalValue)}</span>
                    </div>
                  ))}
                  <div className="annual-months-table-row annual-months-table-total">
                    <span>Total</span>
                    <span>{totalDays}</span>
                    <span>{formatHours(totalHours)}</span>
                    <span>{formatCurrency(totalValue)}</span>
                  </div>
                </div>
              </section>

              {annualProjects.length > 0 ? (
                <>
                  <section className="card">
                    <h2>Horas por Projeto (Ano)</h2>
                    <div className="chart-vertical">
                      {annualProjects.map((p) => {
                        const height =
                          projectBarMax > 0
                            ? (p.hours / projectBarMax) * 100
                            : 0;
                        return (
                          <div key={p.label} className="chart-column-item">
                            <strong className="chart-value">
                              {formatHours(p.hours)}
                            </strong>
                            <div className="chart-column-track">
                              <div
                                className="chart-column-fill"
                                style={{
                                  height: `${height}%`,
                                  backgroundColor: getColorFromLabel(p.label),
                                }}
                              />
                            </div>
                            <span className="chart-label">{p.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="card">
                    <h2>Resumo por Projeto (Ano)</h2>
                    <div className="project-summary-list">
                      {annualProjects.map((p, index) => (
                        <article
                          key={p.label}
                          className="project-summary-item"
                        >
                          <div className="project-summary-header">
                            <strong>
                              {index + 1}. {p.label}
                            </strong>
                            <span>{formatHours(p.hours)}</span>
                          </div>
                          <div className="project-summary-values">
                            <p>
                              <span>Total calculado</span>
                              <strong>{formatCurrency(p.totalValue)}</strong>
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                </>
              ) : null}
            </>
          )}
        </>
      )}
    </div>
  );
}
