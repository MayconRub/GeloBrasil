
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
    companyName: settings?.nome_empresa?.toUpperCase() || 'ICE CONTROL',
    cnpj: settings?.cnpj || '',
    address: settings?.endereco?.toUpperCase() || '',
    primaryColor: settings?.cor_primaria || '#0ea5e9',
    logoId: settings?.logo_id || 'Snowflake',
    loginHeader: settings?.login_header?.toUpperCase() || 'ADMIN',
    supportPhone: settings?.support_phone || '',
    footerText: settings?.footer_text?.toUpperCase() || '',
    expirationDate: settings?.data_expiracao || '2099-12-31',
    hiddenViews: settings?.paginas_ocultas || [],
    dashboardNotice: settings?.aviso_dashboard?.toUpperCase() || '',
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
    sales: (sales.data || []).map(s => ({ id: s.id, value: s.valor, date: s.data, description: s.descricao?.toUpperCase() || '' })),
    production: (prod.data || []).map(p => ({ id: p.id, quantityKg: p.quantityKg, date: p.data, observation: p.observacao?.toUpperCase() })),
    monthlyGoals: (goals.data || []).map(g => ({ type: g.tipo, month: g.mes, year: g.ano, value: g.valor })),
    expenses: (expenses.data || []).map(e => ({
      id: e.id, 
      description: e.descricao?.toUpperCase(), 
      value: e.valor, 
      dueDate: e.data_vencimento,
      status: e.status === 'Pago' ? ExpenseStatus.PAGO : (e.data_vencimento < today ? ExpenseStatus.VENCIDO : ExpenseStatus.A_VENCER),
      category: e.categoria?.toUpperCase() || 'GERAL', 
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
    settings,
    users: [] 
  };
};

export const syncVehicle = (v: Vehicle) => supabase.from('veiculos').upsert({
  ...v, 
  modelo: v.modelo.toUpperCase(), 
  placa: v.placa.toUpperCase(),
  tipo_combustivel: v.tipo_combustivel?.toUpperCase() || 'FLEX',
  km_atual: Number(v.km_atual) || 0,
  km_ultima_troca: Number(v.km_ultima_troca) || 0
}, { onConflict: 'id' });

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
    // Busca info complementar para a descrição
    const { data: vData } = await supabase.from('veiculos').select('placa').eq('id', f.veiculo_id).single();
    const { data: eData } = await supabase.from('funcionarios').select('nome').eq('id', f.funcionario_id).single();

    await supabase.from('veiculos').update({ km_atual: payload.km_registro }).eq('id', f.veiculo_id);
    
    await supabase.from('despesas').insert({
        id: crypto.randomUUID(),
        descricao: `ABASTECIMENTO: ${vData?.placa || ''} - ${eData?.nome || ''} - ${payload.tipo_combustivel} (${payload.litros}L)`.toUpperCase(),
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
    // Busca info complementar para a descrição
    const { data: vData } = await supabase.from('veiculos').select('placa').eq('id', m.veiculo_id).single();
    const { data: eData } = await supabase.from('funcionarios').select('nome').eq('id', m.funcionario_id).single();

    if (maintPayload.servico.includes('ÓLEO')) {
        await supabase.from('veiculos').update({ 
            km_ultima_troca: maintPayload.km_registro 
        }).eq('id', maintPayload.veiculo_id);
    }

    if (maintPayload.custo > 0) {
        await supabase.from('despesas').insert({
            id: crypto.randomUUID(),
            descricao: `OFICINA: ${vData?.placa || ''} - ${eData?.nome || ''} - ${maintPayload.servico}`.toUpperCase(),
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
    const { error } = await supabase.from('frota_multas').upsert({...f, tipo_infracao: f.tipo_infracao.toUpperCase()});
    if (!error && f.situacao === 'Paga') {
        const { data: vData } = await supabase.from('veiculos').select('placa').eq('id', f.veiculo_id).single();
        await supabase.from('despesas').insert({
            id: crypto.randomUUID(),
            descricao: `MULTA: ${vData?.placa || ''} - ${f.tipo_infracao.toUpperCase()}`,
            valor: f.valor,
            data_vencimento: f.data,
            status: 'Pago',
            categoria: 'MULTAS',
            veiculo_id: f.veiculo_id
        });
    }
    return { error };
};

export const syncSale = (s: Sale) => supabase.from('vendas').upsert({ id: s.id, valor: s.value, data: s.date, descricao: s.description.toUpperCase() });
export const syncExpense = (e: Expense) => supabase.from('despesas').upsert({ id: e.id, descricao: e.description.toUpperCase(), valor: e.value, data_vencimento: e.dueDate, status: e.status, categoria: e.category.toUpperCase(), veiculo_id: e.vehicleId, funcionario_id: e.employeeId, km_reading: e.kmReading });
export const syncProduction = (p: Production) => supabase.from('producao').upsert({ id: p.id, quantityKg: p.quantityKg, data: p.date, observacao: p.observation?.toUpperCase() });
export const syncEmployee = (e: Employee) => supabase.from('funcionarios').upsert({ id: e.id, nome: e.name.toUpperCase(), cargo: e.role.toUpperCase(), salario: e.salary, data_admissao: e.joinedAt });
export const syncCategory = (nome: string) => supabase.from('categorias').upsert({ nome: nome.toUpperCase() });
export const syncMonthlyGoal = (g: MonthlyGoal) => supabase.from('metas_mensais').upsert({ tipo: g.type, mes: g.month, ano: g.year, valor: g.value }, { onConflict: 'tipo,mes,ano' });
export const syncSettings = (s: AppSettings) => supabase.from('configuracoes').upsert({ id: 1, nome_empresa: s.companyName.toUpperCase(), cnpj: s.cnpj, endereco: s.address?.toUpperCase(), cor_primaria: s.primaryColor, meta_vendas_mensal: s.salesGoalMonthly, meta_producao_mensal: s.productionGoalMonthly, data_expiracao: s.expirationDate, paginas_ocultas: s.hiddenViews, support_phone: s.supportPhone, footer_text: s.footerText?.toUpperCase(), aviso_dashboard: s.dashboardNotice?.toUpperCase(), meta_producao_diaria: s.productionGoalDaily, meta_vendas_diaria: s.salesGoalDaily }, { onConflict: 'id' });

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
