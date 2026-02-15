export type Salary = number;

export type DayEntry = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  projectWorked: string;
  calculationModelId: string;
};

export type Totals = {
  totalHours: number;
  totalValue: number;
};

export type CalculationModel = {
  id: string;
  name: string;
  multiplier: number;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};
