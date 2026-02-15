import type { DayEntry as DayEntryType } from "../types";

type DayEntryProps = {
  entry: DayEntryType;
  calculationModelName: string;
  dayValue: number;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
};

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function DayEntry({
  entry,
  calculationModelName,
  dayValue,
  onEdit,
  onRemove,
}: DayEntryProps) {
  return (
    <article className="day-entry">
      <div className="day-entry-content day-entry-meta-grid">
        <p className="day-meta-item">
          <span>Data</span>
          <strong>{entry.date || "-"}</strong>
        </p>
        <p className="day-meta-item">
          <span>Valor ganho</span>
          <strong>{brlFormatter.format(dayValue || 0)}</strong>
        </p>
        <p className="day-meta-item">
          <span>Entrada</span>
          <strong>{entry.startTime || "-"}</strong>
        </p>
        <p className="day-meta-item">
          <span>Saída</span>
          <strong>{entry.endTime || "-"}</strong>
        </p>
        <p className="day-meta-item day-meta-project">
          <span>Projeto</span>
          <strong>{entry.projectWorked || "-"}</strong>
        </p>
      </div>

      <div className="day-entry-footer">
        <p className="day-meta-item day-meta-model">
          <span>Modelo</span>
          <strong>{calculationModelName}</strong>
        </p>

        <div className="day-entry-actions">
          <button
            type="button"
            className="edit-button"
            aria-label="Editar"
            title="Editar"
            onClick={() => onEdit(entry.id)}
          >
            ✏️
          </button>
          <button
            type="button"
            className="remove-button"
            aria-label="Remover"
            title="Remover"
            onClick={() => onRemove(entry.id)}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="18"
              height="18"
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
      </div>
    </article>
  );
}
