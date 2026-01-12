
import { supabase } from './supabaseClient';
import { Sale, Expense, Employee, Vehicle, FuelLog, MaintenanceLog, FineLog, ExpenseStatus, AppSettings, Production, MonthlyGoal, UserProfile, Client, Delivery, DeliveryStatus, Product } from './types';

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
  clients: Client[];
  deliveries: Delivery[];
  products: Product[];
}

const CUSTOM_PRODUCT_ORDER = [
  'GELO BRITADO 20KG',
  'GELO BRITADO 10KG',
  'GELO EM BARRA 10KG',
  'GELO EM CUBO 20KG',
  'GELO EM CUBO 10KG',
  'GELO EM CUBO 4KG',
  'GELO EM CUBO 2KG'
];

export const fetchSettings = async (): Promise<AppSettings> => {
  const { data: settings } = await supabase.from('configuracoes').select('*').single();
  const defaultOrder = ['dashboard', 'sales', 'clients', 'deliveries', 'billing', 'expenses', 'production', 'team', 'fleet', 'admin'];
  return {
    companyName: settings?.nome_empresa?.toUpperCase() || 'GELO BRASIL LTDA',
    cnpj: settings?.cnpj || '42.996.710/0001-63',
    address: settings?.endereco?.toUpperCase() || '',
    pixKey: settings?.pix_key || '',
    primaryColor: settings?.cor_primaria || '#5ecce3',
    logoId: settings?.logo_id || 'Snowflake',
    loginHeader: settings?.login_header?.toUpperCase() || 'ADMIN',
    supportPhone: settings?.support_phone || '',
    footerText: settings?.footer_text?.toUpperCase() || '',
    expirationDate: settings?.data_expiracao || '2099-12-31',
    hiddenViews: settings?.paginas_ocultas || [],
    menuOrder: settings?.menu_order || defaultOrder,
    dashboardNotice: settings?.aviso_dashboard?.toUpperCase() || '',
    salesGoalDaily: Number(settings?.meta_vendas_diaria) || 2000,
    salesGoalMonthly: Number(settings?.meta_vendas_mensal) || 60000,
    adminEmail: settings?.admin_email || 'root@adm.app',
    adminPassword: settings?.admin_password || '123456'
  };
};

export const fetchAllData = async (): Promise<AppData> => {
  const [sales, expenses, employees, vehicles, fuels, maints, fines, prod, cats, goals, clients, deliveries, prods, settings] = await Promise.all([
    supabase.from('vendas').select('*').order('data', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('despesas').select('*').order('data_vencimento', { ascending: false }),
    supabase.from('funcionarios').select('*').order('nome'),
    supabase.from('veiculos').select('*').order('modelo'),
    supabase.from('frota_abastecimentos').select('*').order('data', { ascending: false }),
    supabase.from('frota_manutencoes').select('*').order('data', { ascending: false }),
    supabase.from('frota_multas').select('*').order('data', { ascending: false }),
    supabase.from('producao').select('*').order('data', { ascending: false }),
    supabase.from('categorias').select('nome').order('ordem', { ascending: true }),
    supabase.from('metas_mensais').select('*'),
    supabase.from('clientes').select('*').order('name'),
    supabase.from('entregas').select('*').order('scheduled_date', { ascending: true }),
    supabase.from('produtos_base').select('*'),
    fetchSettings(),
  ]);

  const today = new Date().toISOString().split('T')[0];
  
  const sortedProducts = (prods.data || [])
    .map(p => ({ id: p.id, nome: (p.nome || '').toUpperCase(), unidade: p.unidade || 'UN' }))
    .sort((a, b) => {
      const indexA = CUSTOM_PRODUCT_ORDER.indexOf(a.nome);
      const indexB = CUSTOM_PRODUCT_ORDER.indexOf(b.nome);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.nome.localeCompare(b.nome);
    });

  return {
    sales: (sales.data || []).map(s => ({ 
      id: s.id, 
      value: Number(s.valor), 
      date: s.data, 
      description: (s.descricao || '').toUpperCase(), 
      clientId: s.cliente_id,
      items: s.itens || [],
      created_at: s.created_at
    })),
    production: (prod.data || []).map(p => ({ id: p.id, quantityKg: Number(p.quantityKg), date: p.data, observation: (p.observacao || '').toUpperCase() })),
    monthlyGoals: (goals.data || []).map(g => ({ type: g.type, month: g.mes, year: g.ano, value: Number(g.valor) })),
    expenses: (expenses.data || []).map(e => ({
      id: e.id, 
      description: (e.descricao || e.description || '').toUpperCase(), 
      value: Number(e.valor), 
      dueDate: e.data_vencimento,
      status: (e.status || '').toUpperCase() === 'PAGO' ? ExpenseStatus.PAGO : (e.data_vencimento < today ? ExpenseStatus.VENCIDO : ExpenseStatus.A_VENCER),
      category: (e.categoria || e.category || 'GERAL').toUpperCase(), 
      vehicleId: e.veiculo_id, 
      employeeId: e.funcionario_id, 
      kmReading: Number(e.km_reading)
    })),
    employees: (employees.data || []).map(emp => ({ 
      id: emp.id, name: (emp.nome || '').toUpperCase(), role: (emp.cargo || 'FUNCIONÁRIO').toUpperCase(), salary: Number(emp.salario), joinedAt: emp.data_admissao, status: (emp.status || 'ATIVO') as 'ATIVO' | 'INATIVO'
    })),
    vehicles: (vehicles.data || []).map(v => ({...v, modelo: (v.modelo || '').toUpperCase(), placa: (v.placa || '').toUpperCase(), tipo_combustivel: v.tipo_combustivel || 'FLEX', km_atual: Number(v.km_atual) || 0, km_ultima_troca: Number(v.km_ultima_troca) || 0})),
    fuelLogs: (fuels.data || []).map(f => ({...f, tipo_combustivel: (f.tipo_combustivel || '').toUpperCase(), valor_total: Number(f.valor_total) || 0, litros: Number(f.litros) || 0})),
    maintenanceLogs: (maints.data || []).map(m => ({...m, servico: (m.servico || '').toUpperCase(), custo: Number(m.custo) || 0})),
    fineLogs: (fines.data || []).map(f => ({...f, tipo_infracao: (f.tipo_infracao || '').toUpperCase(), valor: Number(f.valor) || 0})),
    categories: (cats.data || []).map(c => (c.nome || '').toUpperCase()),
    clients: (clients.data || []).map(c => ({ id: c.id, name: c.name, phone: c.phone, street: c.street || '', number: c.address_number || '', neighborhood: c.neighborhood || '', city: c.city || '', type: c.type, cnpj_cpf: c.cnpj_cpf, created_at: c.created_at, product_prices: c.product_prices })),
    deliveries: (deliveries.data || []).map(d => ({ 
      id: d.id, 
      sequenceNumber: d.numero_sequencial, 
      saleId: d.sale_id, 
      clientId: d.cliente_id, 
      driverId: d.funcionario_id, 
      vehicleId: d.veiculo_id, 
      status: d.status as DeliveryStatus, 
      scheduledDate: d.scheduled_date, 
      scheduledTime: d.scheduled_time, 
      deliveredAt: d.delivered_at, 
      notes: d.notes, 
      items: d.items, 
      totalValue: Number(d.total_value) || 0 
    })),
    products: sortedProducts,
    settings,
    users: [] 
  };
};

export const syncProductBase = (p: Product) => supabase.from('produtos_base').upsert({ id: p.id, nome: (p.nome || '').toUpperCase(), unidade: p.unidade });
export const deleteProductBase = (id: string) => supabase.from('produtos_base').delete().eq('id', id);

export const syncEmployee = (e: Employee) => supabase.from('funcionarios').upsert({ id: e.id, nome: (e.name || '').toUpperCase(), cargo: (e.role || '').toUpperCase(), salario: Number(e.salary), data_admissao: e.joinedAt, status: e.status });

export const syncSettings = async (s: AppSettings) => {
  const payload: any = { id: 1, nome_empresa: (s.companyName || '').toUpperCase(), cnpj: s.cnpj, endereco: s.address?.toUpperCase(), pix_key: s.pixKey, cor_primaria: s.primaryColor, meta_vendas_mensal: s.salesGoalMonthly, data_expiracao: s.expirationDate, paginas_ocultas: s.hiddenViews, support_phone: s.supportPhone, footer_text: s.footerText?.toUpperCase(), aviso_dashboard: s.dashboardNotice?.toUpperCase(), meta_vendas_diaria: s.salesGoalDaily, admin_email: s.adminEmail, admin_password: s.adminPassword };
  const { error } = await supabase.from('configuracoes').upsert({ ...payload, menu_order: s.menuOrder }, { onConflict: 'id' });
  if (error && (error.message.includes('menu_order') || error.code === '42703')) { return supabase.from('configuracoes').upsert(payload, { onConflict: 'id' }); }
  return { error };
};

export const syncSale = (s: Sale) => supabase.from('vendas').upsert({ 
  id: s.id, 
  valor: Number(s.value), 
  data: s.date, 
  descricao: (s.description || '').toUpperCase(), 
  cliente_id: s.clientId,
  itens: s.items || []
});

export const syncExpense = (e: Expense) => supabase.from('despesas').upsert({ 
  id: e.id, 
  descricao: (e.description || '').toUpperCase(), 
  valor: Number(e.value), 
  data_vencimento: e.dueDate, 
  status: e.status, 
  categoria: (e.category || 'GERAL').toUpperCase(), 
  veiculo_id: e.vehicleId, 
  funcionario_id: e.employeeId, 
  km_reading: e.kmReading
});

export const updateExpenseStatus = (id: string, status: ExpenseStatus) => supabase.from('despesas').update({ status }).eq('id', id);

export const syncProduction = (p: Production) => supabase.from('producao').upsert({ id: p.id, quantityKg: Number(p.quantityKg), data: p.date, observacao: (p.observation || '').toUpperCase() });
export const syncCategory = (nome: string) => supabase.from('categorias').upsert({ nome: (nome || '').toUpperCase() });
export const syncMonthlyGoal = (g: MonthlyGoal) => supabase.from('metas_mensais').upsert({ tipo: g.type, mes: g.month, ano: g.year, valor: Number(g.value) }, { onConflict: 'tipo,mes,ano' });

export const deleteSale = (id: string) => supabase.from('vendas').delete().eq('id', id);
export const deleteExpense = (id: string) => supabase.from('despesas').delete().eq('id', id);
export const deleteProduction = (id: string) => supabase.from('producao').delete().eq('id', id);
export const deleteEmployee = (id: string) => supabase.from('funcionarios').delete().eq('id', id);
export const deleteCategory = (nome: string) => supabase.from('categorias').delete().eq('nome', nome);
export const deleteFuel = (id: string) => supabase.from('frota_abastecimentos').delete().eq('id', id);
export const deleteMaintenance = (id: string) => supabase.from('frota_manutencoes').delete().eq('id', id);
export const deleteFine = (id: string) => supabase.from('frota_multas').delete().eq('id', id);
export const syncCategoriesOrder = async (orderedNames: string[]) => {
  const updates = orderedNames.map((nome, index) => supabase.from('categorias').update({ ordem: index }).eq('nome', nome));
  return Promise.all(updates);
};

export const syncClient = (c: Client) => supabase.from('clientes').upsert({ id: c.id, name: (c.name || '').toUpperCase(), phone: c.phone, street: (c.street || '').toUpperCase(), address_number: c.number, neighborhood: (c.neighborhood || '').toUpperCase(), city: (c.city || '').toUpperCase(), type: c.type, cnpj_cpf: c.cnpj_cpf, product_prices: c.product_prices });

export const deleteClient = (id: string) => supabase.from('clientes').delete().eq('id', id);

export const syncDelivery = (d: Delivery) => {
  const payload: any = { 
    id: d.id, 
    sale_id: d.saleId, 
    cliente_id: d.clientId, 
    funcionario_id: d.driverId, 
    veiculo_id: d.vehicleId, 
    status: d.status, 
    scheduled_date: d.scheduledDate, 
    scheduled_time: d.scheduledTime, 
    delivered_at: d.deliveredAt, 
    notes: d.notes?.toUpperCase(), 
    items: d.items, 
    total_value: Number(d.totalValue) || 0 
  };
  if (d.sequenceNumber) { payload.numero_sequencial = d.sequenceNumber; }
  return supabase.from('entregas').upsert(payload);
};

export const deleteDelivery = (id: string) => supabase.from('entregas').delete().eq('id', id);

export const syncVehicle = (v: Vehicle) => supabase.from('veiculos').upsert({ ...v, modelo: (v.modelo || '').toUpperCase(), placa: (v.placa || '').toUpperCase(), tipo_combustivel: v.tipo_combustivel?.toUpperCase() || 'FLEX', km_atual: Number(v.km_atual) || 0, km_ultima_troca: Number(v.km_ultima_troca) || 0 });

export const deleteVehicle = (id: string) => supabase.from('veiculos').delete().eq('id', id);

export const syncFuel = async (f: FuelLog) => {
  const payload = { ...f, tipo_combustivel: (f.tipo_combustivel || '').toUpperCase(), km_registro: Number(f.km_registro) || 0, litros: Number(f.litros) || 0, valor_litro: Number(f.valor_litro) || 0, valor_total: Number(f.valor_total) || 0 };
  const { error } = await supabase.from('frota_abastecimentos').upsert(payload);
  if (!error) {
    await supabase.from('veiculos').update({ km_atual: payload.km_registro }).eq('id', f.veiculo_id);
    await supabase.from('despesas').insert({ id: crypto.randomUUID(), description: `ABASTECIMENTO (${payload.litros}L)`.toUpperCase(), valor: payload.valor_total, data_vencimento: payload.data, status: 'Pago', categoria: 'COMBUSTÍVEL', veiculo_id: f.veiculo_id, funcionario_id: f.funcionario_id, km_reading: payload.km_registro });
  }
  return { error };
};

export const syncMaintenance = async (m: MaintenanceLog) => {
  const maintPayload = { ...m, servico: (m.servico || '').toUpperCase(), custo: Number(m.custo) || 0, km_registro: Number(m.km_registro) || 0 };
  const { error: maintError } = await supabase.from('frota_manutencoes').upsert(maintPayload);
  if (!maintError) {
    if (maintPayload.servico.includes('ÓLEO')) { await supabase.from('veiculos').update({ km_ultima_troca: maintPayload.km_registro }).eq('id', maintPayload.veiculo_id); }
    if (maintPayload.custo > 0) { await supabase.from('despesas').insert({ id: crypto.randomUUID(), description: `OFICINA: ${maintPayload.servico}`.toUpperCase(), valor: maintPayload.custo, data_vencimento: maintPayload.data, status: m.pago ? 'Pago' : 'A Vencer', categoria: 'MANUTENÇÃO', veiculo_id: maintPayload.veiculo_id, funcionario_id: m.funcionario_id, km_reading: maintPayload.km_registro }); }
  }
  return { error: maintError };
};

export const syncFine = async (f: FineLog) => {
    const { error } = await supabase.from('frota_multas').upsert({ ...f, tipo_infracao: (f.tipo_infracao || '').toUpperCase(), valor: Number(f.valor) || 0 });
    if (!error && (f.situacao === 'Paga' || f.situacao === 'Em aberto')) {
        await supabase.from('despesas').insert({ id: crypto.randomUUID(), description: `MULTA: ${(f.tipo_infracao || '').toUpperCase()}`, valor: Number(f.valor), data_vencimento: f.data_vencimento, status: f.situacao === 'Paga' ? 'Pago' : 'A Vencer', categoria: 'MULTAS', veiculo_id: f.veiculo_id, funcionario_id: f.funcionario_id });
    }
    return { error };
};
