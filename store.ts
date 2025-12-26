
import { supabase } from './supabaseClient';
import { Sale, Expense, Employee, Vehicle, ExpenseStatus, AppSettings, Production, MonthlyGoal } from './types';

export interface AppData {
  sales: Sale[];
  expenses: Expense[];
  employees: Employee[];
  vehicles: Vehicle[];
  production: Production[];
  monthlyGoals: MonthlyGoal[];
  categories: string[];
  settings: AppSettings;
}

export const fetchSettings = async (): Promise<AppSettings> => {
  const { data: settings } = await supabase.from('configuracoes').select('*').single();
  
  return {
    companyName: settings?.nome_empresa || 'Ice Control',
    cnpj: settings?.cnpj || '',
    address: settings?.endereco || '',
    primaryColor: settings?.cor_primaria || '#0ea5e9',
    logoId: settings?.logo_id || 'Snowflake',
    loginHeader: settings?.login_header || 'Admin',
    supportPhone: settings?.support_phone || '',
    footerText: settings?.footer_text || '',
    expirationDate: settings?.data_expiracao || '2099-12-31',
    hiddenViews: settings?.paginas_ocultas || [],
    dashboardNotice: settings?.aviso_dashboard || '',
    productionGoalDaily: settings?.meta_producao_diaria || 1000,
    productionGoalMonthly: settings?.meta_producao_mensal || 30000,
    salesGoalDaily: settings?.meta_vendas_diaria || 2000,
    salesGoalMonthly: settings?.meta_vendas_mensal || 60000
  };
};

export const fetchAllData = async (): Promise<AppData> => {
  const [sales, expenses, employees, vehicles, prod, cats, goals, settings] = await Promise.all([
    supabase.from('vendas').select('*').order('data', { ascending: false }),
    supabase.from('despesas').select('*').order('data_vencimento', { ascending: false }),
    supabase.from('funcionarios').select('*').order('nome'),
    supabase.from('veiculos').select('*').order('nome'),
    supabase.from('producao').select('*').order('data', { ascending: false }),
    supabase.from('categorias').select('nome'),
    supabase.from('metas_mensais').select('*'),
    fetchSettings()
  ]);

  const today = new Date().toISOString().split('T')[0];
  
  return {
    sales: (sales.data || []).map(s => ({ id: s.id, value: s.valor, date: s.data, description: s.descricao })),
    production: (prod.data || []).map(p => ({ id: p.id, quantityKg: p.quantidade_kg, date: p.data, observation: p.observacao })),
    monthlyGoals: (goals.data || []).map(g => ({ id: g.id, type: g.tipo, month: g.mes, year: g.ano, value: g.valor })),
    expenses: (expenses.data || []).map(e => ({
      id: e.id, description: e.descricao, value: e.valor, dueDate: e.data_vencimento,
      status: e.status === 'Pago' ? ExpenseStatus.PAGO : (e.data_vencimento < today ? ExpenseStatus.VENCIDO : ExpenseStatus.A_VENCER),
      category: e.categoria || 'Geral', vehicleId: e.veiculo_id, employeeId: e.funcionario_id, observation: e.observacao
    })),
    employees: (employees.data || []).map(emp => ({
      id: emp.id, name: emp.nome, role: emp.cargo || 'Funcionário', salary: emp.salario,
      joinedAt: emp.data_admissao
    })),
    vehicles: (vehicles.data || []).map(v => ({ id: v.id, name: v.name, plate: v.placa, modelYear: v.ano_modelo })),
    categories: (cats.data || []).map(c => c.nome),
    settings
  };
};

// Funções de Sincronização (Upsert)
export const syncMonthlyGoal = (g: MonthlyGoal) => supabase.from('metas_mensais').upsert({ tipo: g.type, mes: g.month, ano: g.year, valor: g.value }, { onConflict: 'tipo,mes,ano' });
export const syncSettings = (s: AppSettings) => supabase.from('configuracoes').upsert({ id: 1, nome_empresa: s.companyName, cnpj: s.cnpj, endereco: s.address, cor_primaria: s.primaryColor, meta_vendas_mensal: s.salesGoalMonthly, meta_producao_mensal: s.productionGoalMonthly });
export const syncSale = (s: Sale) => supabase.from('vendas').upsert({ id: s.id, valor: s.value, data: s.date, descricao: s.description });
export const syncProduction = (p: Production) => supabase.from('producao').upsert({ id: p.id, quantityKg: p.quantityKg, data: p.date, observacao: p.observation });
export const syncExpense = (e: Expense) => supabase.from('despesas').upsert({ id: e.id, description: e.description, valor: e.value, data_vencimento: e.dueDate, status: e.status, categoria: e.category, veiculo_id: e.vehicleId, funcionario_id: e.employeeId });
export const syncEmployee = (e: Employee) => supabase.from('funcionarios').upsert({ id: e.id, nome: e.name, cargo: e.role, salario: e.salary, data_admissao: e.joinedAt });
export const syncVehicle = (v: Vehicle) => supabase.from('veiculos').upsert({ id: v.id, nome: v.name, placa: v.plate, ano_modelo: v.modelYear });
export const syncCategory = (nome: string) => supabase.from('categorias').upsert({ nome });

// Funções de Exclusão (Delete)
export const deleteSale = (id: string) => supabase.from('vendas').delete().eq('id', id);
export const deleteExpense = (id: string) => supabase.from('despesas').delete().eq('id', id);
export const deleteProduction = (id: string) => supabase.from('producao').delete().eq('id', id);
export const deleteEmployee = (id: string) => supabase.from('funcionarios').delete().eq('id', id);
export const deleteVehicle = (id: string) => supabase.from('veiculos').delete().eq('id', id);
export const deleteCategory = (nome: string) => supabase.from('categorias').delete().eq('nome', nome);
