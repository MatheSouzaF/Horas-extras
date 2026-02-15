import type { CalculationModel, Salary } from "../types";

export const STANDARD_MODEL_ID = "default-standard";
export const STANDARD_MODEL_NAME = "CLT Padrão";
export const STANDARD_MODEL_MULTIPLIER = 1.5;

type CalculationSettingsProps = {
  salary: Salary;
  onSalaryChange: (value: Salary) => void;
  models: CalculationModel[];
  onAddModel: () => void;
  onUpdateModel: (
    id: string,
    field: "name" | "multiplier",
    value: string,
  ) => void;
  onRemoveModel: (id: string) => void;
};

export function CalculationSettings({
  salary,
  onSalaryChange,
  models,
  onAddModel,
  onUpdateModel,
  onRemoveModel,
}: CalculationSettingsProps) {
  return (
    <section className="card">
      <h2>Configuração de Cálculo</h2>

      <label className="field">
        <span>Salário (R$)</span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={salary || ""}
          onChange={(event) => onSalaryChange(Number(event.target.value) || 0)}
          placeholder="Ex.: 3200"
        />
      </label>

      <p className="hint">Base fixa de cálculo: 160 horas/mês</p>

      <div className="section-header models-header">
        <h3>Modelos de cálculo</h3>
        <button type="button" onClick={onAddModel}>
          Adicionar Modelo
        </button>
      </div>

      <div className="models-grid">
        {models.map((model) => (
          <article key={model.id} className="model-item">
            <label className="field">
              <span>Nome do modelo</span>
              <input
                type="text"
                value={model.name}
                disabled={model.id === STANDARD_MODEL_ID}
                onChange={(event) =>
                  onUpdateModel(model.id, "name", event.target.value)
                }
                placeholder="Ex.: Hora Extra 75%"
              />
            </label>

            <label className="field">
              <span>Multiplicador</span>
              <input
                type="number"
                min={1}
                step="0.01"
                value={model.multiplier || ""}
                disabled={model.id === STANDARD_MODEL_ID}
                onChange={(event) =>
                  onUpdateModel(model.id, "multiplier", event.target.value)
                }
                placeholder="Ex.: 1.75"
              />
            </label>

            {model.id !== STANDARD_MODEL_ID ? (
              <button
                type="button"
                className="remove-button"
                onClick={() => onRemoveModel(model.id)}
                disabled={models.length <= 1}
              >
                Remover
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export const createDefaultModels = (): CalculationModel[] => [
  {
    id: STANDARD_MODEL_ID,
    name: STANDARD_MODEL_NAME,
    multiplier: STANDARD_MODEL_MULTIPLIER,
  },
  { id: "default-100", name: "Hora Extra 100%", multiplier: 2 },
];
