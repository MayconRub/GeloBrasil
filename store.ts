
import { supabase } from './supabaseClient';
import { Sale, Expense, Employee, Vehicle, ExpenseStatus, AppSettings, Production, MonthlyGoal, UserProfile, KmLog } from './types';

export interface AppData {
  sales: Sale[];
  expenses: Expense[];
  employees: Employee[];
  vehicles: Vehicle[];
  production: Production[];
  monthlyGoals: MonthlyGoal[];
  categories: string[];
  settings: AppSettings;
  users: UserProfile[];
  kmLogs: KmLog[];
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
    salesGoalMonthly: settings?.meta_vendas_mensal || 60000,
    adminEmail: settings?.admin_email || 'admin@icecontrol.com',
    adminPassword: settings?.admin_password || '1234'
  };
};

export const fetchUsers = async (): Promise<UserProfile[]> => {
  const { data } = await supabase.from('usuarios').select('*').order('created_at', { ascending: false });
  return (data || []).map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_login: u.ultimo_login
  }));
};

export const fetchAllData = async (): Promise<AppData> => {
  const [sales, expenses, employees, vehicles, prod, cats, goals, settings, users, kmLogs] = await Promise.all([
    supabase.from('vendas').select('*').order('data', { ascending: false }),
    supabase.from('despesas').select('*').order('data_vencimento', { ascending: false }),
    supabase.from('funcionarios').select('*').order('nome'),
    supabase.from('veiculos').select('*').order('nome'),
    supabase.from('producao').select('*').order('data', { ascending: false }),
    supabase.from('categorias').select('nome').order('ordem', { ascending: true }),
    supabase.from('metas_mensais').select('*'),
    fetchSettings(),
    fetchUsers(),
    supabase.from('historico_km').select('*').order('data', { ascending: false })
  ]);

  const today = new Date().toISOString().split('T')[0];
  
  return {
    sales: (sales.data || []).map(s => ({ id: s.id, value: s.valor, date: s.data, description: s.descricao })),
    production: (prod.data || []).map(p => ({ id: p.id, quantityKg: p.quantityKg, date: p.date, observation: p.observation })),
    monthlyGoals: (goals.data || []).map(g => ({ id: g.id, type: g.tipo, month: g.mes, year: g.ano, value: g.valor })),
    expenses: (expenses.data || []).map(e => ({
      id: e.id, 
      description: e.descricao, 
      value: e.valor, 
      dueDate: e.data_vencimento,
      status: e.status === 'Pago' ? ExpenseStatus.PAGO : (e.data_vencimento < today ? ExpenseStatus.VENCIDO : ExpenseStatus.A_VENCER),
      category: e.categoria || 'Geral', 
      vehicleId: e.veiculo_id, 
      employeeId: e.funcionario_id, 
      kmReading: e.km_reading, 
      observation: e.observacao
    })),
    employees: (employees.data || []).map(emp => ({
      id: emp.id, name: emp.nome, role: emp.cargo || 'Funcionário', salary: emp.salario,
      joinedAt: emp.data_admissao
    })),
    vehicles: (vehicles.data || []).map(v => ({ 
      id: v.id, 
      name: v.nome, 
      plate: v.placa, 
      modelYear: v.ano_modelo,
      kmAtual: v.km_atual,
      iconType: v.icon_type
    })),
    categories: (cats.data || []).map(c => c.nome),
    settings,
    users,
    kmLogs: (kmLogs.data || []).map(k => ({ 
      id: k.id, 
      veiculo_id: k.veiculo_id, 
      km_reading: k.km_reading, 
      data: k.data,
      funcionario_id: k.funcionario_id
    }))
  };
};

export const syncKmLog = async (log: Omit<KmLog, 'id'>) => {
  const { data, error } = await supabase.from('historico_km').insert([log]);
  if (!error) {
    await supabase.from('veiculos').update({ km_atual: log.km_reading }).eq('id', log.veiculo_id);
  }
  return { data, error };
};

export const syncRefuel = async (payload: { vehicleId: string, employeeId: string, km: number, value: number, date: string, plate: string }) => {
  const { error: kmError } = await supabase.from('historico_km').insert([{
    veiculo_id: payload.vehicleId,
    km_reading: payload.km,
    data: payload.date,
    funcionario_id: payload.employeeId
  }]);

  if (kmError) return { error: kmError };
  await supabase.from('veiculos').update({ km_atual: payload.km }).eq('id', payload.vehicleId);

  const { error: expError } = await supabase.from('despesas').insert([{
    descricao: `Abastecimento - ${payload.plate}`,
    valor: payload.value,
    data_vencimento: payload.date,
    status: 'Pago',
    categoria: 'Combustível',
    veiculo_id: payload.vehicleId,
    funcionario_id: payload.employeeId,
    km_reading: payload.km
  }]);

  return { error: expError };
};

export const syncExpense = async (e: Expense) => {
  const { error: expenseError } = await supabase.from('despesas').upsert({ 
    id: e.id, 
    descricao: e.description, 
    valor: e.value, 
    data_vencimento: e.dueDate, 
    status: e.status, 
    categoria: e.category, 
    veiculo_id: e.vehicleId, 
    funcionario_id: e.employeeId,
    km_reading: e.kmReading,
    observacao: e.observation
  });

  if (!expenseError && e.kmReading && e.vehicleId) {
    await supabase.from('historico_km').insert([{
      veiculo_id: e.vehicleId,
      km_reading: e.kmReading,
      data: e.dueDate,
      funcionario_id: e.employeeId
    }]);
    await supabase.from('veiculos').update({ km_atual: e.kmReading }).eq('id', e.vehicleId);
  }
  
  return { error: expenseError };
};

export const syncCategoriesOrder = async (orderedNames: string[]) => {
  const updates = orderedNames.map((nome, index) => 
    supabase.from('categorias').update({ ordem: index }).eq('nome', nome)
  );
  return Promise.all(updates);
};

export const syncMonthlyGoal = (g: MonthlyGoal) => supabase.from('metas_mensais').upsert({ tipo: g.type, mes: g.month, ano: g.year, valor: g.value }, { onConflict: 'tipo,mes,ano' });
export const syncSettings = (s: AppSettings) => supabase.from('configuracoes').upsert({ id: 1, nome_empresa: s.companyName, cnpj: s.cnpj, endereco: s.address, cor_primaria: s.primaryColor, meta_vendas_mensal: s.salesGoalMonthly, meta_producao_mensal: s.productionGoalMonthly, data_expiracao: s.expirationDate, paginas_ocultas: s.hiddenViews, support_phone: s.supportPhone, footer_text: s.footerText, aviso_dashboard: s.dashboardNotice, meta_producao_diaria: s.productionGoalDaily, meta_vendas_diaria: s.salesGoalDaily }, { onConflict: 'id' });
export const syncSale = (s: Sale) => supabase.from('vendas').upsert({ id: s.id, valor: s.value, data: s.date, descricao: s.description });
export const syncProduction = (p: Production) => supabase.from('producao').upsert({ id: p.id, quantityKg: p.quantityKg, data: p.date, observacao: p.observation });
export const syncEmployee = (e: Employee) => supabase.from('funcionarios').upsert({ id: e.id, nome: e.name, cargo: e.role, salario: e.salary, data_admissao: e.joinedAt });
export const syncVehicle = (v: Vehicle) => supabase.from('veiculos').upsert({ 
  id: v.id, 
  nome: v.name, 
  placa: v.plate, 
  ano_modelo: v.modelYear, 
  km_atual: v.kmAtual || 0, 
  icon_type: v.iconType 
}, { onConflict: 'id' });
export const syncCategory = (nome: string) => supabase.from('categorias').upsert({ nome });
export const deleteSale = (id: string) => supabase.from('vendas').delete().eq('id', id);
export const deleteExpense = (id: string) => supabase.from('despesas').delete().eq('id', id);
export const deleteProduction = (id: string) => supabase.from('producao').delete().eq('id', id);
export const deleteEmployee = (id: string) => supabase.from('funcionarios').delete().eq('id', id);
export const deleteVehicle = (id: string) => supabase.from('veiculos').delete().eq('id', id);
export const deleteCategory = (nome: string) => supabase.from('categorias').delete().eq('nome', nome);
