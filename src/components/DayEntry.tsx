import type { DayEntry as DayEntryType } from "../types";

type DayEntryProps = {
  entry: DayEntryType;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
};

export function DayEntry({ entry, onEdit, onRemove }: DayEntryProps) {
  return (
    <article className="day-entry">
      <div className="day-entry-content">
        <p>
          <strong>Data:</strong> {entry.date || "-"}
        </p>
        <p>
          <strong>Entrada:</strong> {entry.startTime || "-"}
        </p>
        <p>
          <strong>Saída:</strong> {entry.endTime || "-"}
        </p>
        <p>
          <strong>Projeto:</strong> {entry.projectWorked || "-"}
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
