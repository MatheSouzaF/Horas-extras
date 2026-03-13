import { useRef } from "react";

type MonthNavigatorProps = {
  value: string;
  onChange: (month: string) => void;
  totalHours: number;
  totalValue: number;
};

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatMonthLabel = (value: string): { month: string; year: string } => {
  const date = new Date(`${value}-01T12:00:00`);
  const month = date.toLocaleDateString("pt-BR", { month: "long" });
  const year = date.toLocaleDateString("pt-BR", { year: "numeric" });
  return {
    month: month.charAt(0).toUpperCase() + month.slice(1),
    year,
  };
};

export function MonthNavigator({
  value,
  onChange,
  totalHours,
  totalValue,
}: MonthNavigatorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [year, month] = value.split("-").map(Number);

  const prev =
    month === 1
      ? `${year - 1}-12`
      : `${year}-${String(month - 1).padStart(2, "0")}`;

  const next =
    month === 12
      ? `${year + 1}-01`
      : `${year}-${String(month + 1).padStart(2, "0")}`;

  const { month: monthLabel, year: yearLabel } = formatMonthLabel(value);

  return (
    <div className="month-navigator">
      <div className="month-navigator-controls">
        <button
          type="button"
          className="month-navigator-arrow"
          aria-label="Mês anterior"
          onClick={() => onChange(prev)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          type="button"
          className="month-navigator-label"
          onClick={() => inputRef.current?.showPicker?.() ?? inputRef.current?.click()}
          aria-label="Selecionar mês"
          title="Clique para selecionar um mês"
        >
          <span className="month-navigator-month">{monthLabel}</span>
          <span className="month-navigator-year">{yearLabel}</span>
        </button>

        <input
          ref={inputRef}
          type="month"
          value={value}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
          tabIndex={-1}
          aria-hidden="true"
        />

        <button
          type="button"
          className="month-navigator-arrow"
          aria-label="Próximo mês"
          onClick={() => onChange(next)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {(totalHours > 0 || totalValue > 0) ? (
        <div className="month-navigator-totals">
          <span className="month-navigator-stat">
            <span className="month-navigator-stat-value">{totalHours.toFixed(1)}h</span>
            <span className="month-navigator-stat-label">trabalhadas</span>
          </span>
          <span className="month-navigator-totals-sep" aria-hidden="true" />
          <span className="month-navigator-stat">
            <span className="month-navigator-stat-value">{brlFormatter.format(totalValue)}</span>
            <span className="month-navigator-stat-label">calculado</span>
          </span>
        </div>
      ) : (
        <div className="month-navigator-totals month-navigator-totals--empty">
          <span>Nenhum registro neste mês</span>
        </div>
      )}
    </div>
  );
}
