import { useMemo, useState } from "react";
import { DayEntry } from "./DayEntry";
import type { DayEntry as DayEntryType } from "../types";

type DaysListProps = {
  days: DayEntryType[];
  onEditDay: (entry: DayEntryType) => void;
  onRemoveDay: (id: string) => void;
  onAddDay: (entry: Omit<DayEntryType, "id">) => void;
};

type DayFormState = Omit<DayEntryType, "id">;

const createEmptyForm = (): DayFormState => ({
  date: "",
  startTime: "",
  endTime: "",
  projectWorked: "",
});

export function DaysList({
  days,
  onEditDay,
  onRemoveDay,
  onAddDay,
}: DaysListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<DayFormState>(createEmptyForm());

  const editingEntry = useMemo(
    () => days.find((entry) => entry.id === editingId) ?? null,
    [days, editingId],
  );

  const openCreateModal = () => {
    setEditingId(null);
    setFormState(createEmptyForm());
    setIsModalOpen(true);
  };

  const openEditModal = (id: string) => {
    const entry = days.find((item) => item.id === id);

    if (!entry) {
      return;
    }

    setEditingId(entry.id);
    setFormState({
      date: entry.date,
      startTime: entry.startTime,
      endTime: entry.endTime,
      projectWorked: entry.projectWorked,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (
      !formState.date ||
      !formState.startTime ||
      !formState.endTime ||
      !formState.projectWorked.trim()
    ) {
      return;
    }

    if (editingEntry) {
      onEditDay({
        ...editingEntry,
        ...formState,
        projectWorked: formState.projectWorked.trim(),
      });
    } else {
      onAddDay({
        ...formState,
        projectWorked: formState.projectWorked.trim(),
      });
    }

    closeModal();
  };

  return (
    <section className="card">
      <div className="section-header">
        <h2>Dias Trabalhados</h2>
        <button type="button" onClick={openCreateModal}>
          Adicionar Dia
        </button>
      </div>

      <div className="days-grid">
        {days.map((entry) => (
          <DayEntry
            key={entry.id}
            entry={entry}
            onEdit={openEditModal}
            onRemove={onRemoveDay}
          />
        ))}
      </div>

      {isModalOpen ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>{editingEntry ? "Editar Dia" : "Novo Dia"}</h3>

            <label className="field">
              <span>Data</span>
              <input
                type="date"
                value={formState.date}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
              />
            </label>

            <label className="field">
              <span>Hora de entrada</span>
              <input
                type="time"
                value={formState.startTime}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    startTime: event.target.value,
                  }))
                }
              />
            </label>

            <label className="field">
              <span>Hora de saída</span>
              <input
                type="time"
                value={formState.endTime}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    endTime: event.target.value,
                  }))
                }
              />
            </label>

            <label className="field">
              <span>Projeto trabalhado</span>
              <input
                type="text"
                value={formState.projectWorked}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    projectWorked: event.target.value,
                  }))
                }
                placeholder="Ex.: Fechamento mensal"
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button type="button" onClick={handleSave}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
