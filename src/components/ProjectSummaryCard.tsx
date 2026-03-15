import type { CalculationModel } from "../types";
import type { ProjectSummaryItem } from "../hooks/useTotals";
import { formatCurrency } from "../lib/formatters";

interface ProjectSummaryCardProps {
  projectSummary: ProjectSummaryItem[];
  calculationModels: CalculationModel[];
  pendingModelChange: { projectLabel: string; newModelId: string } | null;
  onOpenModelChange: (projectLabel: string, currentModelId: string) => void;
  onUpdatePendingModel: (newModelId: string) => void;
  onConfirmModelChange: () => void;
  onCancelModelChange: () => void;
  onDownloadPdf: (projectLabel: string) => void;
}

export function ProjectSummaryCard({
  projectSummary,
  calculationModels,
  pendingModelChange,
  onOpenModelChange,
  onUpdatePendingModel,
  onConfirmModelChange,
  onCancelModelChange,
  onDownloadPdf,
}: ProjectSummaryCardProps) {
  return (
    <section className="card inline-project-summary">
      <h2>Resumo por Projeto</h2>

      {projectSummary.length === 0 ? (
        <p className="hint">
          Adicione dias completos para ver os cálculos separados por freela.
        </p>
      ) : (
        <>
          <div className="inline-project-summary-list">
            {projectSummary.map((item) => (
              <article key={item.label} className="inline-project-summary-item">
                <div className="inline-project-summary-item-header">
                  <p>
                    <strong>{item.label}</strong>
                    <span>{item.hours.toFixed(2)} h</span>
                  </p>
                  <button
                    type="button"
                    className="project-download-button"
                    onClick={() => onDownloadPdf(item.label)}
                    aria-label={`Baixar PDF de ${item.label}`}
                    title="Baixar PDF"
                  >
                    ⬇
                  </button>
                </div>
                <p>
                  <span>Total calculado</span>
                  <strong>{formatCurrency(item.totalValue)}</strong>
                </p>
                <div className="project-model-row">
                  <span className="day-entry-model-tag">
                    {item.modelId === null
                      ? "Vários modelos"
                      : (calculationModels.find((m) => m.id === item.modelId)
                          ?.name ?? "—")}
                  </span>
                  <button
                    type="button"
                    className="project-model-edit-button"
                    title="Alterar modelo de cálculo"
                    onClick={() =>
                      onOpenModelChange(
                        item.label,
                        item.modelId ?? calculationModels[0]?.id ?? "",
                      )
                    }
                  >
                    ✎
                  </button>
                </div>
              </article>
            ))}
          </div>

          {pendingModelChange ? (
            <div className="modal-overlay">
              <div className="modal-card">
                <h3>Alterar modelo de cálculo</h3>
                <p className="modal-warning-text">
                  Isso vai sobrescrever o modelo de{" "}
                  <strong>todos os dias</strong> do projeto{" "}
                  <strong>{pendingModelChange.projectLabel}</strong>.
                </p>
                <label className="field">
                  <span>Novo modelo</span>
                  <select
                    value={pendingModelChange.newModelId}
                    onChange={(e) => onUpdatePendingModel(e.target.value)}
                  >
                    {calculationModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={onCancelModelChange}
                  >
                    Cancelar
                  </button>
                  <button type="button" onClick={onConfirmModelChange}>
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
