import type { DayEntry as DayEntryType } from "../types";

type DayEntryProps = {
  entry: DayEntryType;
  calculationModelName: string;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
};

export function DayEntry({
  entry,
  calculationModelName,
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
        <p className="day-meta-item">
          <span>Modelo</span>
          <strong>{calculationModelName}</strong>
        </p>
      </div>

      <div className="day-entry-actions">
        <button
          type="button"
          className="edit-button"
          onClick={() => onEdit(entry.id)}
        >
          ✏️ Editar
        </button>
        <button
          type="button"
          className="remove-button"
          onClick={() => onRemove(entry.id)}
        >
          Remover
        </button>
      </div>
    </article>
  );
}
