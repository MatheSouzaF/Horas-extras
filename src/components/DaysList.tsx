import { useEffect, useMemo, useRef, useState } from "react";
import { DayEntry } from "./DayEntry";
import type { CalculationModel, DayEntry as DayEntryType } from "../types";
import { STANDARD_MODEL_ID } from "./CalculationSettings";

type DaysListProps = {
  days: DayEntryType[];
  calculationModels: CalculationModel[];
  dayValuesById: Record<string, number>;
  projectNames: string[];
  filterProject: string | null;
  filterOptions: string[];
  readOnly?: boolean;
  noReverse?: boolean;
  selectedMonth?: string;
  onFilterChange: (value: string | null) => void;
  onEditDay: (entry: DayEntryType) => void;
  onRemoveDay: (id: string) => void;
  onAddDay: (entry: Omit<DayEntryType, "id">) => void;
  onMonthChange?: (month: string) => void;
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
  dayValuesById,
  projectNames,
  filterProject,
  filterOptions,
  readOnly,
  noReverse,
  selectedMonth,
  onFilterChange,
  onEditDay,
  onRemoveDay,
  onAddDay,
  onMonthChange,
}: DaysListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<DayFormState>(createEmptyForm());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<number | null>(null);

  const editingEntry = useMemo(
    () => days.find((entry) => entry.id === editingId) ?? null,
    [days, editingId],
  );

  const filteredSuggestions = useMemo(() => {
    const query = formState.projectWorked.trim().toLowerCase();
    if (!query) {
      return projectNames;
    }
    return projectNames.filter((name) =>
      name.toLowerCase().includes(query),
    );
  }, [projectNames, formState.projectWorked]);

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

  // Clean up blur timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormState({
      ...createEmptyForm(),
      calculationModelId: calculationModels[0]?.id ?? "",
    });
    setShowSuggestions(false);
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
    setShowSuggestions(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setShowSuggestions(false);
  };

  const dateMonth = formState.date ? formState.date.slice(0, 7) : "";
  const isOutsideMonth =
    Boolean(selectedMonth) &&
    formState.date !== "" &&
    dateMonth !== selectedMonth;

  const outsideMonthLabel = isOutsideMonth
    ? new Date(`${dateMonth}-01T12:00:00`).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : "";

  const selectedMonthLabel =
    selectedMonth
      ? new Date(`${selectedMonth}-01T12:00:00`).toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        })
      : "";

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

  const handleSelectSuggestion = (name: string) => {
    setFormState((current) => ({ ...current, projectWorked: name }));
    setShowSuggestions(false);
    projectInputRef.current?.focus();
  };

  const handleProjectInputBlur = () => {
    blurTimeoutRef.current = window.setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  const handleProjectInputFocus = () => {
    if (blurTimeoutRef.current !== null) {
      window.clearTimeout(blurTimeoutRef.current);
    }
    if (filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <section className="card">
      <div className="section-header">
        <h2>Dias Trabalhados</h2>
        {!readOnly && filterOptions.length > 0 ? (
          <label className="days-header-filter">
            <span>Filtrar</span>
            <select
              value={filterProject ?? ""}
              onChange={(e) => onFilterChange(e.target.value || null)}
            >
              <option value="">Todos</option>
              {filterOptions.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {!readOnly ? (
          <button type="button" onClick={openCreateModal}>
            Adicionar Dia
          </button>
        ) : null}
      </div>

      <div className="days-grid">
        {(noReverse ? days : [...days].reverse()).map((entry) => (
          <DayEntry
            key={entry.id}
            entry={entry}
            calculationModelName={
              calculationModels.find(
                (model) => model.id === entry.calculationModelId,
              )?.name ?? "-"
            }
            dayValue={dayValuesById[entry.id] ?? 0}
            readOnly={readOnly}
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

            {isOutsideMonth ? (
              <div className="modal-month-warning">
                <p className="modal-month-warning-text">
                  ⚠ Esta data pertence a <strong>{outsideMonthLabel}</strong>,
                  mas o mês de referência é <strong>{selectedMonthLabel}</strong>.
                  O registro será salvo em {selectedMonthLabel}.
                </p>
                <div className="modal-month-warning-actions">
                  {onMonthChange ? (
                    <button
                      type="button"
                      className="modal-month-warning-switch"
                      onClick={() => {
                        onMonthChange(dateMonth);
                        closeModal();
                      }}
                    >
                      Trocar para {outsideMonthLabel}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="modal-month-warning-ignore"
                    onClick={handleSave}
                  >
                    Salvar assim mesmo
                  </button>
                </div>
              </div>
            ) : null}

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

            <div className="field project-autocomplete-field">
              <span>Projeto trabalhado</span>
              <div className="project-autocomplete-wrapper">
                <input
                  ref={projectInputRef}
                  type="text"
                  value={formState.projectWorked}
                  onChange={(event) => {
                    setFormState((current) => ({
                      ...current,
                      projectWorked: event.target.value,
                    }));
                    setShowSuggestions(true);
                  }}
                  onFocus={handleProjectInputFocus}
                  onBlur={handleProjectInputBlur}
                  placeholder="Ex.: Fechamento mensal"
                  autoComplete="off"
                />
                {showSuggestions && filteredSuggestions.length > 0 ? (
                  <ul className="project-suggestions" role="listbox">
                    {filteredSuggestions.map((name) => (
                      <li
                        key={name}
                        role="option"
                        aria-selected={formState.projectWorked === name}
                        className={
                          formState.projectWorked === name
                            ? "project-suggestion-item active"
                            : "project-suggestion-item"
                        }
                        onMouseDown={() => handleSelectSuggestion(name)}
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>

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
                    {model.id === STANDARD_MODEL_ID
                      ? `${model.name} (regra automática)`
                      : `${model.name} (${model.multiplier.toFixed(2)}x)`}
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
