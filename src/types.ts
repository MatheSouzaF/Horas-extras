export type Salary = number;

export type DayEntry = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  projectWorked: string;
};

export type Totals = {
  totalHours: number;
  total50: number;
  total100: number;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};
