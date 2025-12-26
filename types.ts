
export enum ExpenseStatus {
  VENCIDO = 'Vencido',
  A_VENCER = 'A Vencer',
  PAGO = 'Pago'
}

export interface Sale {
  id: string;
  value: number;
  date: string;
  description: string;
}

export interface Production {
  id: string;
  quantityKg: number;
  date: string;
  observation?: string;
}

export interface MonthlyGoal {
  id?: string;
  type: 'production' | 'sales';
  month: number;
  year: number;
  value: number;
}

export interface Expense {
  id: string;
  description: string;
  value: number;
  dueDate: string;
  status: ExpenseStatus;
  category: string;
  vehicleId?: string;
  employeeId?: string;
  observation?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  salary?: number;
  inss?: number;
  irrf?: number;
  isDangerous?: boolean;
  joinedAt: string;
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  modelYear: string;
}

export interface AppSettings {
  companyName: string;
  cnpj?: string;
  address?: string;
  primaryColor: string;
  logoId: string;
  loginHeader: string;
  supportPhone: string;
  footerText: string;
  expirationDate: string;
  hiddenViews: string[]; 
  dashboardNotice?: string;
  productionGoalDaily?: number;
  productionGoalMonthly?: number;
  salesGoalDaily?: number;
  salesGoalMonthly?: number;
}

export type ViewType = 'dashboard' | 'sales' | 'production' | 'expenses' | 'team' | 'fleet' | 'admin' | 'cashflow';
