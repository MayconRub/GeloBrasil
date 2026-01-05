
import { supabase } from './supabaseClient';
import { Sale, Expense, Employee, Vehicle, FuelLog, MaintenanceLog, FineLog, ExpenseStatus, AppSettings, Production, MonthlyGoal, UserProfile, Client, Delivery, DeliveryStatus, Product, StockMovement } from './types';

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
  stockMovements: StockMovement[];
}

export const fetchSettings = async (): Promise<AppSettings> => {
  const { data: settings } = await supabase.from('configuracoes').select('*').single();
  return {
    companyName: settings?.nome_empresa?.toUpperCase() || 'GELO BRASIL LTDA',
    cnpj: settings?.cnpj || '42.996.710/0001-63',
    address: settings?.endereco?.toUpperCase() || '',
    primaryColor: settings?.cor_primaria || '#5ecce3',
    logoId: settings?.logo_id || 'Snowflake',
    loginHeader: settings?.login_header?.toUpperCase() || 'ADMIN',
    supportPhone: settings?.support_phone || '',
    footerText: settings?.footer_text?.toUpperCase() || '',
    expirationDate: settings?.data_expiracao || '2099-12-31',
    hiddenViews: settings?.paginas_ocultas || [],
    dashboardNotice: settings?.aviso_dashboard?.toUpperCase() || '',
    salesGoalDaily: settings?.meta_vendas_diaria || 2000,
    salesGoalMonthly: settings?.meta_vendas_mensal || 60000,
    adminEmail: settings?.admin_email || 'root@adm.app',
    adminPassword: settings?.admin_password || '123456'
  };
};

export const fetchAllData = async (): Promise<AppData> => {
  const [sales, expenses, employees, vehicles, fuels, maints, fines, prod, cats, goals, clients, deliveries, products, movements, settings] = await Promise.all([
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
    supabase.from('clientes').select('*').order('name'),
    supabase.from('entregas').select('*').order('scheduled_date', { ascending: true }),
    supabase.from('estoque_produtos').select('*').order('name'),
    supabase.from('estoque_movimentacoes').select('*').order('date', { ascending: false }),
    fetchSettings(),
  ]);

  const today = new Date().toISOString().split('T')[0];
  
  return {
    sales: (sales.data || []).map(s => ({ id: s.id, value: s.valor, date: s.data, description: s.descricao?.toUpperCase() || '', clientId: s.cliente_id })),
    production: (prod.data || []).map(p => ({ id: p.id, quantityKg: p.quantityKg, date: p.data, observation: p.observacao?.toUpperCase() })),
    monthlyGoals: (goals.data || []).map(g => ({ type: g.tipo, month: g.mes, year: g.ano, value: g.valor })),
    expenses: (expenses.data || []).map(e => ({
      id: e.id, 
      description: e.descricao?.toUpperCase(), 
      value: e.valor, 
      dueDate: e.data_vencimento,
      status: e.status === 'Pago' ? ExpenseStatus.PAGO : (e.data_vencimento < today ? ExpenseStatus.VENCIDO : ExpenseStatus.A_VENCER),
      category: e.category?.toUpperCase() || 'GERAL', 
      vehicleId: e.veiculo_id, 
      employeeId: e.funcionario_id, 
      kmReading: e.km_reading, 
      observation: e.observacao?.toUpperCase()
    })),
    employees: (employees.data || []).map(emp => ({ id: emp.id, name: emp.nome.toUpperCase(), role: emp.cargo?.toUpperCase() || 'FUNCIONÁRIO', salary: emp.salario, joinedAt: emp.data_admissao })),
    vehicles: (vehicles.data || []).map(v => ({...v, modelo: v.modelo.toUpperCase(), placa: v.placa.toUpperCase(), tipo_combustivel: v.tipo_combustivel || 'FLEX'})),
    fuelLogs: (fuels.data || []).map(f => ({...f, tipo_combustivel: f.tipo_combustivel.toUpperCase()})),
    maintenanceLogs: (maints.data || []).map(m => ({...m, servico: m.servico.toUpperCase()})),
    fineLogs: (fines.data || []).map(f => ({...f, tipo_infracao: f.tipo_infracao.toUpperCase()})),
    categories: (cats.data || []).map(c => c.nome.toUpperCase()),
    clients: (clients.data || []).map(c => ({ 
      id: c.id, 
      name: c.name, 
      phone: c.phone, 
      street: c.street || '', 
      number: c.address_number || '', 
      neighborhood: c.neighborhood || '', 
      city: c.city || '', 
      type: c.type, 
      cnpj_cpf: c.cnpj_cpf, 
      created_at: c.created_at 
    })),
    deliveries: (deliveries.data || []).map(d => ({ 
      id: d.id, 
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
      totalValue: d.total_value
    })),
    products: (products.data || []).map(p => ({
      id: p.id,
      name: p.name.toUpperCase(),
      unit: p.unit,
      current_quantity: Number(p.current_quantity) || 0,
      min_quantity: Number(p.min_quantity) || 0,
      category: p.category.toUpperCase()
    })),
    stockMovements: (movements.data || []).map(m => ({
      id: m.id,
      productId: m.product_id,
      quantity: Number(m.quantity) || 0,
      type: m.type,
      reason: m.reason,
      date: m.date,
      notes: m.notes?.toUpperCase()
    })),
    settings,
    users: [] 
  };
};

export const syncProduct = (p: Product) => supabase.from('estoque_produtos').upsert({
  id: p.id,
  name: p.name.toUpperCase(),
  unit: p.unit,
  current_quantity: Number(p.current_quantity) || 0,
  min_quantity: Number(p.min_quantity) || 0,
  category: p.category.toUpperCase()
});

export const deleteProduct = (id: string) => supabase.from('estoque_produtos').delete().eq('id', id);

export const syncStockMovement = async (m: StockMovement) => {
  const movementQty = Math.abs(Number(m.quantity));
  
  const { data: product, error: fetchError } = await supabase
    .from('estoque_produtos')
    .select('current_quantity')
    .eq('id', m.productId)
    .single();

  if (fetchError || !product) return { error: fetchError || new Error("Produto não encontrado") };

  const currentQty = Number(product.current_quantity);
  const newQuantity = m.type === 'IN' 
    ? currentQty + movementQty 
    : currentQty - movementQty;

  const { error: insertError } = await supabase.from('estoque_movimentacoes').insert({
    id: m.id,
    product_id: m.productId,
    quantity: movementQty,
    type: m.type,
    reason: m.reason,
    date: m.date,
    notes: m.notes?.toUpperCase()
  });

  if (!insertError) {
    await supabase
      .from('estoque_produtos')
      .update({ current_quantity: newQuantity })
      .eq('id', m.productId);
  }
  
  return { error: insertError };
};

export const syncSale = (s: Sale) => supabase.from('vendas').upsert({ id: s.id, valor: Number(s.value), data: s.date, descricao: s.description.toUpperCase(), cliente_id: s.clientId });

export const syncExpense = (e: Expense) => supabase.from('despesas').upsert({ 
  id: e.id, 
  descricao: e.description.toUpperCase(), 
  valor: Number(e.value), 
  data_vencimento: e.dueDate, 
  status: e.status, 
  categoria: e.category.toUpperCase(), 
  veiculo_id: e.vehicleId, 
  funcionario_id: e.employeeId, 
  km_reading: e.kmReading 
});

export const syncProduction = (p: Production) => supabase.from('producao').upsert({ id: p.id, quantityKg: Number(p.quantityKg), data: p.date, observacao: p.observation?.toUpperCase() });
export const syncEmployee = (e: Employee) => supabase.from('funcionarios').upsert({ id: e.id, nome: e.name.toUpperCase(), cargo: e.role.toUpperCase(), salario: Number(e.salary), data_admissao: e.joinedAt });
export const syncCategory = (nome: string) => supabase.from('categorias').upsert({ nome: nome.toUpperCase() });
export const syncMonthlyGoal = (g: MonthlyGoal) => supabase.from('metas_mensais').upsert({ tipo: g.type, mes: g.month, ano: g.year, valor: Number(g.value) }, { onConflict: 'tipo,mes,ano' });

export const syncSettings = (s: AppSettings) => {
  return supabase.from('configuracoes').upsert({
    id: 1,
    nome_empresa: s.companyName.toUpperCase(),
    cnpj: s.cnpj,
    endereco: s.address?.toUpperCase(),
    cor_primaria: s.primaryColor,
    meta_vendas_mensal: s.salesGoalMonthly,
    data_expiracao: s.expirationDate,
    paginas_ocultas: s.hiddenViews,
    support_phone: s.supportPhone,
    footer_text: s.footerText?.toUpperCase(),
    aviso_dashboard: s.dashboardNotice?.toUpperCase(),
    meta_vendas_diaria: s.salesGoalDaily,
    admin_email: s.adminEmail,
    admin_password: s.adminPassword
  }, { onConflict: 'id' });
};

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

export const syncClient = (c: Client) => supabase.from('clientes').upsert({
  id: c.id,
  name: c.name.toUpperCase(),
  phone: c.phone,
  street: c.street.toUpperCase(),
  address_number: c.number,
  neighborhood: c.neighborhood.toUpperCase(),
  city: c.city.toUpperCase(),
  type: c.type,
  cnpj_cpf: c.cnpj_cpf
});

export const deleteClient = (id: string) => supabase.from('clientes').delete().eq('id', id);

export const syncDelivery = (d: Delivery) => supabase.from('entregas').upsert({
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
  total_value: d.totalValue
});

export const deleteDelivery = (id: string) => supabase.from('entregas').delete().eq('id', id);

export const syncVehicle = (v: Vehicle) => supabase.from('veiculos').upsert({
  ...v, 
  modelo: v.modelo.toUpperCase(), 
  placa: v.placa.toUpperCase(),
  tipo_combustivel: v.tipo_combustivel?.toUpperCase() || 'FLEX',
  km_atual: Number(v.km_atual) || 0,
  km_ultima_troca: Number(v.km_ultima_troca) || 0
});

export const deleteVehicle = (id: string) => supabase.from('veiculos').delete().eq('id', id);

export const syncFuel = async (f: FuelLog) => {
  const payload = {
    ...f,
    tipo_combustivel: f.tipo_combustivel.toUpperCase(),
    km_registro: Number(f.km_registro) || 0,
    litros: Number(f.litros) || 0,
    valor_litro: Number(f.valor_litro) || 0,
    valor_total: Number(f.valor_total) || 0
  };

  const { error } = await supabase.from('frota_abastecimentos').upsert(payload);
  
  if (!error) {
    await supabase.from('veiculos').update({ km_atual: payload.km_registro }).eq('id', f.veiculo_id);
    
    await supabase.from('despesas').insert({
        id: crypto.randomUUID(),
        descricao: `ABASTECIMENTO (${payload.litros}L)`.toUpperCase(),
        valor: payload.valor_total,
        data_vencimento: payload.data,
        status: 'Pago',
        categoria: 'COMBUSTÍVEL',
        veiculo_id: f.veiculo_id,
        funcionario_id: f.funcionario_id,
        km_reading: payload.km_registro
    });
  }
  return { error };
};

export const syncMaintenance = async (m: MaintenanceLog) => {
  const maintPayload = {
    ...m,
    servico: m.servico.toUpperCase(),
    custo: Number(m.custo) || 0,
    km_registro: Number(m.km_registro) || 0
  };

  const { error: maintError } = await supabase.from('frota_manutencoes').upsert(maintPayload);
  
  if (!maintError) {
    if (maintPayload.servico.includes('ÓLEO')) {
        await supabase.from('veiculos').update({ 
            km_ultima_troca: maintPayload.km_registro 
        }).eq('id', maintPayload.veiculo_id);
    }

    if (maintPayload.custo > 0) {
        await supabase.from('despesas').insert({
            id: crypto.randomUUID(),
            descricao: `OFICINA: ${maintPayload.servico}`.toUpperCase(),
            valor: maintPayload.custo,
            data_vencimento: maintPayload.data,
            status: m.pago ? 'Pago' : 'A Vencer',
            categoria: 'MANUTENÇÃO',
            veiculo_id: maintPayload.veiculo_id,
            funcionario_id: m.funcionario_id,
            km_reading: maintPayload.km_registro
        });
    }
  }
  return { error: maintError };
};

export const syncFine = async (f: FineLog) => {
    const { error } = await supabase.from('frota_multas').upsert({
        ...f, 
        tipo_infracao: f.tipo_infracao.toUpperCase()
    });
    
    if (!error && (f.situacao === 'Paga' || f.situacao === 'Em aberto')) {
        await supabase.from('despesas').insert({
            id: crypto.randomUUID(),
            descricao: `MULTA: ${f.tipo_infracao.toUpperCase()}`,
            valor: f.valor,
            data_vencimento: f.data_vencimento,
            status: f.situacao === 'Paga' ? 'Pago' : 'A Vencer',
            categoria: 'MULTAS',
            veiculo_id: f.veiculo_id,
            funcionario_id: f.funcionario_id
        });
    }
    return { error };
};
