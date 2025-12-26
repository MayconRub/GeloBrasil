
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
  try {
    const { data: settings, error } = await supabase.from('configuracoes').select('*').single();
    if (error || !settings) throw new Error('Settings not found');
    
    return {
      companyName: settings.nome_empresa || 'Gestor Pro',
      cnpj: settings.cnpj || '',
      address: settings.endereco || '',
      primaryColor: settings.cor_primaria || '#4f46e5',
      logoId: settings.logo_id || 'LayoutGrid',
      loginHeader: settings.login_header || 'Acesso Restrito',
      supportPhone: settings.support_phone || '',
      footerText: settings.footer_text || '',
      expirationDate: settings.data_expiracao || '2099-12-31',
      hiddenViews: settings.paginas_ocultas || [],
      dashboardNotice: settings.aviso_dashboard || '',
      productionGoalDaily: settings.meta_producao_diaria || 1000,
      productionGoalMonthly: settings.meta_producao_mensal || 30000,
      salesGoalDaily: settings.meta_vendas_diaria || 2000,
      salesGoalMonthly: settings.meta_vendas_mensal || 60000
    };
  } catch (e) {
    return {
      companyName: 'Gestor Pro',
      primaryColor: '#4f46e5',
      logoId: 'LayoutGrid',
      loginHeader: 'Acesso Restrito',
      supportPhone: '',
      footerText: '',
      expirationDate: '2099-12-31',
      hiddenViews: [],
      dashboardNotice: '',
      productionGoalDaily: 1000,
      productionGoalMonthly: 30000,
      salesGoalDaily: 2000,
      salesGoalMonthly: 60000
    };
  }
};

export const fetchAllData = async (): Promise<AppData> => {
  const [
    { data: sales },
    { data: expenses },
    { data: employees },
    { data: vehicles },
    { data: production },
    { data: categories },
    { data: monthlyGoals },
    settings
  ] = await Promise.all([
    supabase.from('vendas').select('*').order('data', { ascending: false }),
    supabase.from('despesas').select('*').order('data_vencimento', { ascending: false }),
    supabase.from('funcionarios').select('*').order('nome'),
    supabase.from('veiculos').select('*').order('nome'),
    supabase.from('producao').select('*').order('data', { ascending: false }),
    supabase.from('categorias').select('nome').order('nome'),
    supabase.from('metas_mensais').select('*'),
    fetchSettings()
  ]);

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const processedSales = (sales || []).map((s: any) => ({
    id: s.id,
    value: s.valor,
    date: s.data,
    description: s.descricao
  }));

  const processedProduction = (production || []).map((p: any) => ({
    id: p.id,
    quantityKg: p.quantidade_kg,
    date: p.data,
    observation: p.observacao
  }));

  const processedGoals = (monthlyGoals || []).map((g: any) => ({
    id: g.id,
    type: g.tipo,
    month: g.mes,
    year: g.ano,
    value: g.valor
  }));

  const processedExpenses = (expenses || []).map((e: any) => {
    const expense: Expense = {
      id: e.id,
      description: e.descricao,
      value: e.valor,
      dueDate: e.data_vencimento,
      status: e.status as ExpenseStatus,
      category: e.categoria,
      vehicleId: e.veiculo_id,
      employeeId: e.funcionario_id,
      observation: e.observation
    };

    if (expense.status !== ExpenseStatus.PAGO) {
      expense.status = expense.dueDate < today ? ExpenseStatus.VENCIDO : ExpenseStatus.A_VENCER;
    }
    return expense;
  });

  const processedEmployees = (employees || []).map((emp: any) => ({
    id: emp.id,
    name: emp.nome,
    role: emp.cargo,
    salary: emp.salario,
    inss: emp.inss,
    irrf: emp.irrf,
    isDangerous: !!emp.periculosidade,
    joinedAt: emp.data_admissao
  }));

  const processedVehicles = (vehicles || []).map((v: any) => ({
    id: v.id,
    name: v.nome,
    plate: v.placa,
    modelYear: v.ano_modelo
  }));

  return {
    sales: processedSales,
    expenses: processedExpenses,
    employees: processedEmployees,
    vehicles: processedVehicles,
    production: processedProduction,
    monthlyGoals: processedGoals,
    categories: (categories || []).map(c => c.nome),
    settings
  };
};

export const syncMonthlyGoal = async (goal: MonthlyGoal) => {
  return supabase.from('metas_mensais').upsert({
    tipo: goal.type,
    mes: goal.month,
    ano: goal.year,
    valor: goal.value
  }, { onConflict: 'tipo,mes,ano' });
};

export const syncSettings = async (settings: AppSettings) => {
  return supabase.from('configuracoes').upsert({
    id: 1,
    nome_empresa: settings.companyName,
    cnpj: settings.cnpj,
    endereco: settings.address,
    cor_primaria: settings.primaryColor,
    logo_id: settings.logoId,
    login_header: settings.loginHeader,
    support_phone: settings.supportPhone,
    footer_text: settings.footerText || '',
    data_expiracao: settings.expirationDate,
    paginas_ocultas: settings.hiddenViews,
    aviso_dashboard: settings.dashboardNotice,
    meta_producao_diaria: settings.productionGoalDaily,
    meta_producao_mensal: settings.productionGoalMonthly,
    meta_vendas_diaria: settings.salesGoalDaily,
    meta_vendas_mensal: settings.salesGoalMonthly
  });
};

export const syncSale = async (sale: Sale, isDelete = false) => {
  if (isDelete) return supabase.from('vendas').delete().eq('id', sale.id);
  return supabase.from('vendas').upsert({
    id: sale.id,
    valor: sale.value,
    data: sale.date,
    descricao: sale.description
  });
};

export const syncProduction = async (prod: Production, isDelete = false) => {
  if (isDelete) return supabase.from('producao').delete().eq('id', prod.id);
  return supabase.from('producao').upsert({
    id: prod.id,
    quantidade_kg: prod.quantityKg,
    data: prod.date,
    observacao: prod.observation
  });
};

export const syncExpense = async (expense: Expense, isDelete = false) => {
  if (isDelete) return supabase.from('despesas').delete().eq('id', expense.id);
  return supabase.from('despesas').upsert({
    id: expense.id,
    descricao: expense.description,
    valor: expense.value,
    data_vencimento: expense.dueDate,
    status: expense.status,
    category: expense.category,
    veiculo_id: expense.vehicleId,
    funcionario_id: expense.employeeId,
    observacao: expense.observation
  });
};

export const syncEmployee = async (employee: Employee, isDelete = false) => {
  if (isDelete) return supabase.from('funcionarios').delete().eq('id', employee.id);
  return supabase.from('funcionarios').upsert({
    id: employee.id,
    nome: employee.name,
    cargo: employee.role,
    salario: employee.salary,
    inss: employee.inss,
    fgts: employee.irrf,
    periculosidade: !!employee.isDangerous,
    data_admissao: employee.joinedAt
  });
};

export const syncVehicle = async (vehicle: Vehicle, isDelete = false) => {
  if (isDelete) return supabase.from('veiculos').delete().eq('id', vehicle.id);
  return supabase.from('veiculos').upsert({
    id: vehicle.id,
    nome: vehicle.name,
    placa: vehicle.plate,
    ano_modelo: vehicle.modelYear
  });
};

export const syncCategory = async (categoryName: string) => {
  return supabase.from('categorias').upsert({ nome: categoryName });
};
