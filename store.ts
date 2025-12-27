
import { supabase } from './supabaseClient';
import { Sale, Expense, Employee, Vehicle, FuelLog, MaintenanceLog, FineLog, ExpenseStatus, AppSettings, Production, MonthlyGoal, UserProfile } from './types';

export interface AppData {
  sales: Sale[];
  expenses: Expense[];
  employees: Employee[];
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  maintenanceLogs: MaintenanceLog[];
  fineLogs: FineLog[];
  production: Production[];
  monthlyGoals: MonthlyGoal[];
  categories: string[];
  settings: AppSettings;
  users: UserProfile[];
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

export const fetchAllData = async (): Promise<AppData> => {
  const [sales, expenses, employees, vehicles, fuels, maints, fines, prod, cats, goals, settings] = await Promise.all([
    supabase.from('vendas').select('*').order('data', { ascending: false }),
    supabase.from('despesas').select('*').order('data_vencimento', { ascending: false }),
    supabase.from('funcionarios').select('*').order('nome'),
    supabase.from('veiculos').select('*').order('modelo'),
    supabase.from('frota_abastecimentos').select('*').order('data', { ascending: false }),
    supabase.from('frota_manutencoes').select('*').order('data', { ascending: false }),
    supabase.from('frota_multas').select('*').order('data', { ascending: false }),
    supabase.from('producao').select('*').order('data', { ascending: false }),
    supabase.from('categorias').select('nome').order('ordem', { ascending: true }),
    supabase.from('metas_mensais').select('*'),
    fetchSettings(),
  ]);

  const today = new Date().toISOString().split('T')[0];
  
  return {
    // Mapeamento corrigido: usa s.descricao e p.data conforme SQL
    sales: (sales.data || []).map(s => ({ id: s.id, value: s.valor, date: s.data, description: s.descricao || '' })),
    production: (prod.data || []).map(p => ({ id: p.id, quantityKg: p.quantityKg, date: p.data, observation: p.observacao })),
    monthlyGoals: (goals.data || []).map(g => ({ type: g.tipo, month: g.mes, year: g.ano, value: g.valor })),
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
    employees: (employees.data || []).map(emp => ({ id: emp.id, name: emp.nome, role: emp.cargo || 'Funcionário', salary: emp.salario, joinedAt: emp.data_admissao })),
    vehicles: (vehicles.data || []),
    fuelLogs: (fuels.data || []),
    maintenanceLogs: (maints.data || []),
    fineLogs: (fines.data || []),
    categories: (cats.data || []).map(c => c.nome),
    settings,
    users: [] 
  };
};

export const syncVehicle = (v: Vehicle) => supabase.from('veiculos').upsert(v, { onConflict: 'id' });
export const deleteVehicle = (id: string) => supabase.from('veiculos').delete().eq('id', id);

export const syncFuel = async (f: FuelLog) => {
  const { error } = await supabase.from('frota_abastecimentos').upsert(f);
  if (!error) {
    await supabase.from('veiculos').update({ km_atual: f.km_registro }).eq('id', f.veiculo_id);
    await supabase.from('despesas').insert({
        id: crypto.randomUUID(),
        descricao: `Abastecimento: ${f.tipo_combustivel}`,
        valor: f.valor_total,
        data_vencimento: f.data,
        status: 'Pago',
        categoria: 'Combustível',
        veiculo_id: f.veiculo_id,
        km_reading: f.km_registro
    });
  }
  return { error };
};

export const syncMaintenance = async (m: MaintenanceLog) => {
  const { error } = await supabase.from('frota_manutencoes').upsert(m);
  if (!error) {
    await supabase.from('veiculos').update({ km_atual: m.km_registro }).eq('id', m.veiculo_id);
    await supabase.from('despesas').insert({
        id: crypto.randomUUID(),
        descricao: `Manutenção: ${m.servico}`,
        valor: m.custo,
        data_vencimento: m.data,
        status: 'Pago',
        categoria: 'Manutenção',
        veiculo_id: m.veiculo_id,
        km_reading: m.km_registro
    });
  }
  return { error };
};

export const syncFine = async (f: FineLog) => {
    const { error } = await supabase.from('frota_multas').upsert(f);
    if (!error && f.situacao === 'Paga') {
        await supabase.from('despesas').insert({
            id: crypto.randomUUID(),
            descricao: `Multa: ${f.tipo_infracao}`,
            valor: f.valor,
            data_vencimento: f.data,
            status: 'Pago',
            categoria: 'Multas',
            veiculo_id: f.veiculo_id
        });
    }
    return { error };
};

// Sincronização de Vendas: usa 'descricao'
export const syncSale = (s: Sale) => supabase.from('vendas').upsert({ id: s.id, valor: s.value, data: s.date, descricao: s.description });

export const syncExpense = (e: Expense) => supabase.from('despesas').upsert({ id: e.id, descricao: e.description, valor: e.value, data_vencimento: e.dueDate, status: e.status, categoria: e.category, veiculo_id: e.vehicleId, funcionario_id: e.employeeId, km_reading: e.kmReading, observacao: e.observation });

// Sincronização de Produção: usa 'data' para combinar com 'fetch'
export const syncProduction = (p: Production) => supabase.from('producao').upsert({ id: p.id, quantityKg: p.quantityKg, data: p.date, observacao: p.observation });

export const syncEmployee = (e: Employee) => supabase.from('funcionarios').upsert({ id: e.id, nome: e.name, cargo: e.role, salario: e.salary, data_admissao: e.joinedAt });
export const syncCategory = (nome: string) => supabase.from('categorias').upsert({ nome });
export const syncCategoriesOrder = async (orderedNames: string[]) => {
  const updates = orderedNames.map((nome, index) => supabase.from('categorias').update({ ordem: index }).eq('nome', nome));
  return Promise.all(updates);
};
export const syncMonthlyGoal = (g: MonthlyGoal) => supabase.from('metas_mensais').upsert({ tipo: g.type, mes: g.month, ano: g.year, valor: g.value });
export const syncSettings = (s: AppSettings) => supabase.from('configuracoes').upsert({ id: 1, nome_empresa: s.companyName, cnpj: s.cnpj, endereco: s.address, cor_primaria: s.primaryColor, meta_vendas_mensal: s.salesGoalMonthly, meta_producao_mensal: s.productionGoalMonthly, data_expiracao: s.expirationDate, paginas_ocultas: s.hiddenViews, support_phone: s.supportPhone, footer_text: s.footerText, aviso_dashboard: s.dashboardNotice, meta_producao_diaria: s.productionGoalDaily, meta_vendas_diaria: s.salesGoalDaily }, { onConflict: 'id' });

export const deleteSale = (id: string) => supabase.from('vendas').delete().eq('id', id);
export const deleteExpense = (id: string) => supabase.from('despesas').delete().eq('id', id);
export const deleteProduction = (id: string) => supabase.from('producao').delete().eq('id', id);
export const deleteEmployee = (id: string) => supabase.from('funcionarios').delete().eq('id', id);
export const deleteCategory = (nome: string) => supabase.from('categorias').delete().eq('nome', nome);
export const deleteFuel = (id: string) => supabase.from('frota_abastecimentos').delete().eq('id', id);
export const deleteMaintenance = (id: string) => supabase.from('frota_manutencoes').delete().eq('id', id);
export const deleteFine = (id: string) => supabase.from('frota_multas').delete().eq('id', id);
