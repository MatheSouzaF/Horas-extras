import { useEffect, useMemo, useState } from "react";
import { DayEntry } from "./DayEntry";
import type { CalculationModel, DayEntry as DayEntryType } from "../types";

type DaysListProps = {
  days: DayEntryType[];
  calculationModels: CalculationModel[];
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
  calculationModelId: "",
});

export function DaysList({
  days,
  calculationModels,
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

  useEffect(() => {
    if (!isModalOpen || calculationModels.length === 0) {
      return;
    }

    const validModelIds = new Set(calculationModels.map((model) => model.id));
    const fallbackModelId = calculationModels[0].id;

    setFormState((current) =>
      current.calculationModelId &&
      validModelIds.has(current.calculationModelId)
        ? current
        : { ...current, calculationModelId: fallbackModelId },
    );
  }, [calculationModels, isModalOpen]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormState({
      ...createEmptyForm(),
      calculationModelId: calculationModels[0]?.id ?? "",
    });
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
      calculationModelId:
        entry.calculationModelId || calculationModels[0]?.id || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = () => {
    const validModelIds = new Set(calculationModels.map((model) => model.id));
    const fallbackModelId = calculationModels[0]?.id ?? "";
    const resolvedModelId =
      formState.calculationModelId &&
      validModelIds.has(formState.calculationModelId)
        ? formState.calculationModelId
        : fallbackModelId;

    if (
      !formState.date ||
      !formState.startTime ||
      !formState.endTime ||
      !formState.projectWorked.trim() ||
      !resolvedModelId
    ) {
      return;
    }

    if (editingEntry) {
      onEditDay({
        ...editingEntry,
        ...formState,
        calculationModelId: resolvedModelId,
        projectWorked: formState.projectWorked.trim(),
      });
    } else {
      onAddDay({
        ...formState,
        calculationModelId: resolvedModelId,
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
            calculationModelName={
              calculationModels.find(
                (model) => model.id === entry.calculationModelId,
              )?.name ?? "-"
            }
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

            <label className="field">
              <span>Modelo de cálculo</span>
              <select
                value={formState.calculationModelId}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    calculationModelId: event.target.value,
                  }))
                }
              >
                {calculationModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.multiplier.toFixed(2)}x)
                  </option>
                ))}
              </select>
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
