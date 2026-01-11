
export enum ExpenseStatus {
  VENCIDO = 'Vencido',
  A_VENCER = 'A Vencer',
  PAGO = 'Pago'
}

export enum DeliveryStatus {
  PENDENTE = 'Pendente',
  EM_ROTA = 'Em Rota',
  ENTREGUE = 'Entregue',
  ENTREGUE_PENDENTE_PGTO = 'Não Pago',
  CANCELADO = 'Cancelado'
}

export interface Product {
  id: string;
  nome: string;
  unidade: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  type: 'REVENDEDOR' | 'PARTICULAR';
  cnpj_cpf?: string;
  created_at: string;
  product_prices?: Record<string, number>;
}

export interface DeliveryItem {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface Delivery {
  id: string;
  sequenceNumber?: number;
  saleId?: string;
  clientId: string;
  driverId: string;
  vehicleId: string;
  status: DeliveryStatus;
  scheduledDate: string;
  scheduledTime?: string;
  deliveredAt?: string;
  notes?: string;
  items?: DeliveryItem[];
  totalValue?: number;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface Sale {
  id: string;
  value: number;
  date: string;
  description: string;
  clientId?: string;
  items?: SaleItem[];
  created_at?: string;
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

export interface Vehicle {
  id: string;
  tipo: 'Caminhão' | 'Carro' | 'Moto';
  modelo: string;
  ano: string;
  placa: string;
  km_atual: number;
  km_ultima_troca: number;
  tipo_combustivel: 'GASOLINA' | 'ÁLCOOL' | 'DIESEL' | 'FLEX';
  motorista_id?: string;
  icon_type?: string;
}

export interface FuelLog {
  id: string;
  veiculo_id: string;
  funcionario_id: string;
  data: string;
  tipo_combustivel: string;
  litros: number;
  valor_litro: number;
  valor_total: number;
  km_registro: number;
}

export interface MaintenanceLog {
  id: string;
  veiculo_id: string;
  funcionario_id: string;
  tipo: 'Preventiva' | 'Corretiva';
  servico: string;
  data: string;
  km_registro: number;
  custo: number;
  oficina?: string;
  pago?: boolean;
  proxima_maint_km?: number;
  proxima_maint_data?: string;
  observacao?: string;
}

export interface FineLog {
  id: string;
  veiculo_id: string;
  funcionario_id: string;
  data: string;
  data_vencimento: string;
  tipo_infracao: string;
  local?: string;
  valor: number;
  pontos: number;
  situacao: 'Paga' | 'Em aberto' | 'Recurso';
  observacao?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  salary?: number;
  joinedAt: string;
  status: 'ATIVO' | 'INATIVO';
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
  pixKey?: string;
  primaryColor: string;
  logoId: string;
  loginHeader: string;
  supportPhone: string;
  footerText: string;
  expirationDate: string;
  hiddenViews: string[]; 
  menuOrder: string[]; 
  dashboardNotice?: string;
  salesGoalDaily?: number;
  salesGoalMonthly?: number;
  adminEmail?: string;
  adminPassword?: string;
}

export type ViewType = 'dashboard' | 'sales' | 'production' | 'expenses' | 'team' | 'fleet' | 'admin' | 'clients' | 'deliveries';
