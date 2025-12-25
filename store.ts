
import { supabase } from './supabaseClient';
import { Sale, Expense, Employee, Vehicle, ExpenseStatus, AppSettings, Production } from './types';

export interface AppData {
  sales: Sale[];
  expenses: Expense[];
  employees: Employee[];
  vehicles: Vehicle[];
  production: Production[];
  categories: string[];
  settings: AppSettings;
}

export const fetchSettings = async (): Promise<AppSettings> => {
  try {
    const { data: settings } = await supabase.from('configuracoes').select('*').single();
    return {
      companyName: settings?.nome_empresa || 'Gestor Pro',
      primaryColor: settings?.cor_primaria || '#4f46e5',
      logoId: settings?.logo_id || 'LayoutGrid',
      loginHeader: settings?.login_header || 'Login Corporativo',
      supportPhone: settings?.support_phone || '',
      footerText: settings?.footer_text || '',
      expirationDate: settings?.data_expiracao || '2099-12-31',
      hiddenViews: settings?.paginas_ocultas || [],
      dashboardNotice: settings?.aviso_dashboard || ''
    };
  } catch (e) {
    return {
      companyName: 'Gestor Pro',
      primaryColor: '#4f46e5',
      logoId: 'LayoutGrid',
      loginHeader: 'Login Corporativo',
      supportPhone: '',
      footerText: '',
      expirationDate: '2099-12-31',
      hiddenViews: [],
      dashboardNotice: ''
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
    settings
  ] = await Promise.all([
    supabase.from('vendas').select('*').order('data', { ascending: false }),
    supabase.from('despesas').select('*').order('data_vencimento', { ascending: false }),
    supabase.from('funcionarios').select('*').order('nome'),
    supabase.from('veiculos').select('*').order('nome'),
    supabase.from('producao').select('*').order('data', { ascending: false }),
    supabase.from('categorias').select('nome').order('nome'),
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
    fgts: emp.fgts,
    isDangerous: emp.periculosidade,
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
    categories: (categories || []).map(c => c.nome),
    settings
  };
};

export const syncSettings = async (settings: AppSettings) => {
  return supabase.from('configuracoes').upsert({
    id: 1,
    nome_empresa: settings.companyName,
    cor_primaria: settings.primaryColor,
    logo_id: settings.logoId,
    login_header: settings.loginHeader,
    support_phone: settings.supportPhone,
    footer_text: settings.footerText,
    data_expiracao: settings.expirationDate,
    paginas_ocultas: settings.hiddenViews,
    aviso_dashboard: settings.dashboardNotice
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
    categoria: expense.category,
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
    fgts: employee.fgts,
    periculosidade: employee.isDangerous,
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
