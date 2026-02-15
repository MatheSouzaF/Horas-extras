type ChartItem = {
  label: string;
  hours: number;
};

type ProjectSummaryItem = {
  label: string;
  hours: number;
  totalValue: number;
};

type StatisticsPanelProps = {
  dayHours: ChartItem[];
  projectHours: ChartItem[];
  projectSummary: ProjectSummaryItem[];
  averageDailyHours: number;
  workedDaysCount: number;
};

const formatHours = (value: number) => `${value.toFixed(2)} h`;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

type ChartCardProps = {
  title: string;
  items: ChartItem[];
  emptyText: string;
  colorfulBars?: boolean;
};

const getColorFromLabel = (label: string) => {
  const hash = Array.from(label).reduce(
    (accumulator, char) => accumulator + char.charCodeAt(0),
    0,
  );
  const hue = hash % 360;

  return `hsl(${hue} 70% 45%)`;
};

function ChartCard({
  title,
  items,
  emptyText,
  colorfulBars = false,
}: ChartCardProps) {
  const maxHours = Math.max(...items.map((item) => item.hours), 0);

  return (
    <section className="card">
      <h2>{title}</h2>

      {items.length === 0 ? (
        <p className="hint">{emptyText}</p>
      ) : (
        <div className="chart-vertical">
          {items.map((item) => {
            const height = maxHours > 0 ? (item.hours / maxHours) * 100 : 0;
            const fillColor = colorfulBars
              ? getColorFromLabel(item.label)
              : "#1f2937";

            return (
              <div key={item.label} className="chart-column-item">
                <strong className="chart-value">
                  {formatHours(item.hours)}
                </strong>
                <div className="chart-column-track">
                  <div
                    className="chart-column-fill"
                    style={{ height: `${height}%`, backgroundColor: fillColor }}
                  />
                </div>
                <span className="chart-label">{item.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function StatisticsPanel({
  dayHours,
  projectHours,
  projectSummary,
  averageDailyHours,
  workedDaysCount,
}: StatisticsPanelProps) {
  return (
    <div className="stats-grid">
      <section className="card daily-average-board">
        <h2>Média Diária de Horas</h2>

        {workedDaysCount === 0 ? (
          <p className="hint">Sem dias completos para calcular a média.</p>
        ) : (
          <>
            <strong className="daily-average-value">
              {formatHours(averageDailyHours)}
            </strong>
            <p className="hint">
              Baseado em {workedDaysCount} dia{workedDaysCount > 1 ? "s" : ""}{" "}
              completo{workedDaysCount > 1 ? "s" : ""}.
            </p>
          </>
        )}
      </section>

      <ChartCard
        title="Gráfico de Dias"
        items={dayHours}
        emptyText="Sem dias completos para exibir."
      />
      <ChartCard
        title="Gráfico de Projetos"
        items={projectHours}
        emptyText="Sem projetos completos para exibir."
        colorfulBars
      />

      <section className="card">
        <h2>Resumo por Projeto</h2>

        {projectSummary.length === 0 ? (
          <p className="hint">
            Preencha dias completos para comparar os freelas.
          </p>
        ) : (
          <div className="project-summary-list">
            {projectSummary.map((item, index) => (
              <article key={item.label} className="project-summary-item">
                <div className="project-summary-header">
                  <strong>
                    {index + 1}. {item.label}
                  </strong>
                  <span>{formatHours(item.hours)}</span>
                </div>

                <div className="project-summary-values">
                  <p>
                    <span>Total calculado</span>
                    <strong>{formatCurrency(item.totalValue)}</strong>
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
