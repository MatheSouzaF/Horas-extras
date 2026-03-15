import type { DayEntry as DayEntryType } from "../types";
import { formatCurrency, formatDateToBr } from "../lib/formatters";

type DayEntryProps = {
  entry: DayEntryType;
  calculationModelName: string;
  dayValue: number;
  readOnly?: boolean;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
};

const getProjectColor = (label: string): string => {
  const hash = Array.from(label).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  );
  return `hsl(${hash % 360} 65% 38%)`;
};

const getWeekday = (date: string): { label: string; isWeekend: boolean } => {
  const d = new Date(`${date}T12:00:00`);
  const label = d.toLocaleDateString("pt-BR", { weekday: "long" });
  const day = d.getDay();
  return {
    label: label.charAt(0).toUpperCase() + label.slice(1),
    isWeekend: day === 0 || day === 6,
  };
};

export function DayEntry({
  entry,
  calculationModelName,
  dayValue,
  readOnly,
  onEdit,
  onRemove,
}: DayEntryProps) {
  const weekday = entry.date ? getWeekday(entry.date) : null;

  return (
    <article className="day-entry">
      <div className="day-entry-top">
        <div className="day-entry-date-row">
          <span className="day-entry-date">{formatDateToBr(entry.date)}</span>
          {weekday ? (
            <span
              className={
                weekday.isWeekend
                  ? "day-entry-weekday day-entry-weekday--weekend"
                  : "day-entry-weekday"
              }
            >
              {weekday.label}
            </span>
          ) : null}
          {entry.projectWorked ? (
            <span
              className="day-entry-project"
              style={{ background: getProjectColor(entry.projectWorked) }}
            >
              {entry.projectWorked}
            </span>
          ) : null}
        </div>

        {readOnly ? null : (
          <div className="day-entry-actions">
            <button
              type="button"
              className="day-icon-button edit-button"
              aria-label="Editar"
              title="Editar"
              onClick={() => onEdit(entry.id)}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              type="button"
              className="day-icon-button remove-button"
              aria-label="Remover"
              title="Remover"
              onClick={() => onRemove(entry.id)}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="day-entry-body">
        <div className="day-entry-time-row">
          <div className="day-entry-time-block">
            <span>Entrada</span>
            <strong>{entry.startTime || "-"}</strong>
          </div>
          <div className="day-entry-time-sep" aria-hidden="true">→</div>
          <div className="day-entry-time-block">
            <span>Saída</span>
            <strong>{entry.endTime || "-"}</strong>
          </div>
        </div>

        <div className="day-entry-value-row">
          <div className="day-entry-value-block">
            <span>Valor ganho</span>
            <strong className="day-entry-value">
              {formatCurrency(dayValue || 0)}
            </strong>
          </div>
          <div className="day-entry-model-tag">{calculationModelName}</div>
        </div>
      </div>
    </article>
  );
}
