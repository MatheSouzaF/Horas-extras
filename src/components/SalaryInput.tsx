import type { Salary } from "../types";

type SalaryInputProps = {
  salary: Salary;
  onSalaryChange: (value: Salary) => void;
};

export function SalaryInput({ salary, onSalaryChange }: SalaryInputProps) {
  return (
    <section className="card">
      <h2>Salário Mensal</h2>
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
    </section>
  );
}
