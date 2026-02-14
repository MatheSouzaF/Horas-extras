import type { Totals } from "../types";

type SummaryProps = {
  totals: Totals;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function Summary({ totals }: SummaryProps) {
  return (
    <section className="card">
      <h2>Resumo Mensal</h2>
      <div className="summary-grid">
        <p>
          <strong>Total de horas:</strong> {totals.totalHours.toFixed(2)} h
        </p>
        <p>
          <strong>Total com 50%:</strong>{" "}
          {currencyFormatter.format(totals.total50)}
        </p>
        <p>
          <strong>Total com 100%:</strong>{" "}
          {currencyFormatter.format(totals.total100)}
        </p>
      </div>
    </section>
  );
}
