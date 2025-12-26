
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
  kmReading?: number;
  observation?: string;
}

export interface KmLog {
  id: string;
  veiculo_id: string;
  km_reading: number;
  data: string;
  funcionario_id?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  salary?: number;
  joinedAt: string;
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  modelYear: string;
  kmAtual?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  last_login?: string;
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
  adminEmail?: string;
  adminPassword?: string;
}

export type ViewType = 'dashboard' | 'sales' | 'production' | 'expenses' | 'team' | 'fleet' | 'admin' | 'cashflow';
