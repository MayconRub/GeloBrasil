
import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, Snowflake, Wallet, 
  CircleDollarSign, Receipt, Box, 
  ArrowUpRight, ArrowDownRight,
  Clock,
  Truck,
  ChevronRight,
  CheckCircle2,
  ArrowDownCircle,
  Activity,
  Plus,
  Info
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Sale, Expense, ViewType, Production, AppSettings, ExpenseStatus, Delivery, Client, DeliveryStatus } from '../types';

interface Props {
  sales: Sale[];
  expenses: Expense[];
  production: Production[];
  deliveries: Delivery[];
  clients: Client[];
  onSwitchView: (view: ViewType) => void;
  settings: AppSettings;
  onAddSale: (sale: Sale) => void;
}

const DashboardView: React.FC<Props> = ({ 
  sales = [], expenses = [], production = [], deliveries = [], clients = [], onSwitchView
}) => {
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const getLocalDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = useMemo(() => getLocalDateKey(new Date()), []);

  const metrics = useMemo(() => {
    const filter = period === 'daily' 
      ? (d: any) => d === todayStr 
      : (d: any) => {
          if (!d || typeof d !== 'string') return false;
          const now = new Date();
          const parts = d.split('-');
          return parseInt(parts[0]) === now.getFullYear() && parseInt(parts[1]) === (now.getMonth() + 1);
        };

    const safeSales = sales || [];
    const safeExps = expenses || [];
    const safeProd = production || [];

    const currentSales = safeSales.filter(s => filter(s.date));
    const currentExps = safeExps.filter(e => filter(e.dueDate) && e.status === ExpenseStatus.PAGO);
    const currentProd = safeProd.filter(p => filter(p.date));

    const totalSales = currentSales.reduce((acc, s) => acc + (Number(s.value) || 0), 0);
    const totalExps = currentExps.reduce((acc, e) => acc + (Number(e.value) || 0), 0);
    const totalProd = currentProd.reduce((acc, p) => acc + (Number(p.quantityKg) || 0), 0);
    const profit = totalSales - totalExps;

    // Geração do ChartData (Últimos 7 dias)
    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      const dStr = getLocalDateKey(d);
      
      const daySales = safeSales.filter(s => s.date === dStr).reduce((sum, s) => sum + (Number(s.value) || 0), 0);
      const dayExps = safeExps.filter(e => e.dueDate === dStr && e.status === ExpenseStatus.PAGO).reduce((sum, e) => sum + (Number(e.value) || 0), 0);

      return {
        name: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        vendas: daySales || 0,
        despesas: dayExps || 0
      };
    });

    const totalWeeklySales = chartData.reduce((acc, curr) => acc + curr.vendas, 0);
    const totalWeeklyExps = chartData.reduce((acc, curr) => acc + curr.despesas, 0);

    const activeDeliveries = (deliveries || [])
      .filter(d => d.status === DeliveryStatus.PENDENTE || d.status === DeliveryStatus.EM_ROTA)
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
      .slice(0, 5);

    const pendingExpenses = (expenses || [])
      .filter(e => e.status !== ExpenseStatus.PAGO)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 6);

    return {
      totalSales, totalExps, totalProd, profit, chartData, totalWeeklySales, totalWeeklyExps,
      isHealthy: profit >= 0, activeDeliveries, pendingExpenses
    };
  }, [sales, expenses, production, deliveries, period, todayStr]);

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'CLIENTE';

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-500 transition-colors">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-sky-100/10 dark:shadow-none transition-all">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center w-14 h-14">
            <div className={`absolute inset-0 rounded-full blur-2xl opacity-40 animate-pulse ${metrics.isHealthy ? 'bg-[#5ecce3]' : 'bg-rose-400'}`}></div>
            <Box size={42} className={`relative z-10 drop-shadow-[0_0_12px_rgba(94,204,227,0.5)] ${metrics.isHealthy ? 'text-[#5ecce3]' : 'text-rose-400'}`} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase leading-none">Visão <span className="text-[#5ecce3]">Geral</span></h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
               <Activity size={12} className="text-[#5ecce3]" /> Monitoramento em Tempo Real
            </p>
          </div>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner w-full sm:w-auto">
          <button onClick={() => setPeriod('daily')} className={`flex-1 sm:px-8 py-2.5 rounded-xl text-[9px] font-black tracking-widest transition-all ${period === 'daily' ? 'bg-[#5ecce3] text-white shadow-lg' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600'}`}>HOJE</button>
          <button onClick={() => setPeriod('monthly')} className={`flex-1 sm:px-8 py-2.5 rounded-xl text-[9px] font-black tracking-widest transition-all ${period === 'monthly' ? 'bg-[#5ecce3] text-white shadow-lg' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600'}`}>ESTE MÊS</button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard label="Faturamento" value={`R$ ${metrics.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={CircleDollarSign} color="emerald" context={period === 'daily' ? 'Receita de Hoje' : 'Vendas do Mês'} trend={<ArrowUpRight size={14} />} />
        <MetricCard label="Despesas Pagas" value={`R$ ${metrics.totalExps.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={Receipt} color="rose" context={period === 'daily' ? 'Gastos de Hoje' : 'Custo Mensal'} trend={<ArrowDownCircle size={14} />} />
        <MetricCard label="Produção" value={`${metrics.totalProd.toLocaleString('pt-BR')} KG`} icon={Snowflake} color="sky" context={period === 'daily' ? 'Lote Produzido' : 'Volume Mensal'} />
        <MetricCard label="Saldo Líquido" value={`R$ ${metrics.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={Wallet} color={metrics.profit >= 0 ? 'emerald' : 'rose'} context="Saldo Disponível" isHighlight />
      </div>

      {/* Analytics Chart - Refined for "Saúde Financeira" */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[3rem] border border-slate-50 dark:border-slate-800 shadow-sm dark:shadow-none relative overflow-hidden flex flex-col min-h-[520px]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <TrendingUp size={16} className="text-[#5ecce3]" /> Saúde Financeira (7 dias)
            </h3>
            <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase mt-1">Análise comparativa de fluxo semanal</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
             <div className="flex flex-col items-end px-4 py-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
                <span className="text-[7px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Total Vendas (7d)</span>
                <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">R$ {metrics.totalWeeklySales.toLocaleString('pt-BR')}</span>
             </div>
             <div className="flex flex-col items-end px-4 py-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl">
                <span className="text-[7px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Total Despesas (7d)</span>
                <span className="text-sm font-black text-rose-700 dark:text-rose-300">R$ {metrics.totalWeeklyExps.toLocaleString('pt-BR')}</span>
             </div>
          </div>
        </div>
        
        <div className="w-full flex-1 min-h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5ecce3" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#5ecce3" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f8fafc"} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: isDark ? '#475569' : '#94a3b8', fontSize: 10, fontWeight: 800}} 
                dy={15} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: isDark ? '#475569' : '#94a3b8', fontSize: 9, fontWeight: 700}} 
                tickFormatter={(value) => `R$${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
              />
              <Tooltip 
                cursor={{stroke: isDark ? '#334155' : '#e2e8f0', strokeWidth: 2}}
                contentStyle={{
                  borderRadius: '24px', 
                  boxShadow: '0 20px 50px rgba(0,0,0,0.1)', 
                  fontSize: '11px',
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                  padding: '12px 16px'
                }}
                itemStyle={{ padding: '2px 0' }}
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]}
              />
              <Area 
                type="monotone" 
                dataKey="vendas" 
                name="Entradas (Vendas)" 
                stroke="#5ecce3" 
                strokeWidth={5} 
                fill="url(#colorSales)" 
                animationDuration={2000}
              />
              <Area 
                type="monotone" 
                dataKey="despesas" 
                name="Saídas (Despesas)" 
                stroke="#f43f5e" 
                strokeWidth={3} 
                strokeDasharray="8 5" 
                fill="url(#colorExps)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#5ecce3] shadow-[0_0_10px_rgba(94,204,227,0.5)]"></div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Vendas</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]"></div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Despesas Pagas</span>
           </div>
        </div>
      </div>

      {/* Operational Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Deliveries Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[3rem] border border-slate-50 dark:border-slate-800 shadow-sm flex flex-col min-h-[400px]">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Truck size={16} className="text-sky-500" /> Logística
                </h3>
                <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase mt-1">Agenda de Entregas</p>
              </div>
              <button onClick={() => onSwitchView('deliveries')} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-300 hover:text-sky-500 transition-all">
                <ChevronRight size={20} />
              </button>
           </div>

           <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pr-1">
              {metrics.activeDeliveries.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-10">
                   <Box size={40} className="mb-4 text-slate-200" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Sem entregas ativas</p>
                </div>
              ) : (
                metrics.activeDeliveries.map((delivery) => {
                  const isToday = delivery.scheduledDate === todayStr;
                  return (
                    <div key={delivery.id} className={`p-4 rounded-2xl border transition-all ${isToday ? 'bg-amber-50/20 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20' : 'bg-slate-50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800'}`}>
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase truncate pr-4">{getClientName(delivery.clientId)}</span>
                          {isToday ? (
                            <span className="flex items-center gap-1 text-[8px] font-black text-amber-600 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded">HOJE</span>
                          ) : (
                            <span className="text-[8px] font-black text-slate-400">{new Date(delivery.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                          )}
                       </div>
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase">
                             <Clock size={12} className="text-sky-500" /> {delivery.scheduledTime || '--:--'}
                          </div>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${delivery.status === DeliveryStatus.EM_ROTA ? 'bg-sky-500 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                            {delivery.status === DeliveryStatus.EM_ROTA ? 'EM ROTA' : 'PENDENTE'}
                          </span>
                       </div>
                    </div>
                  );
                })
              )}
           </div>
        </div>

        {/* Pending Expenses Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[3rem] border border-slate-50 dark:border-slate-800 shadow-sm flex flex-col min-h-[400px]">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Receipt size={16} className="text-rose-500" /> Financeiro Pendente
                </h3>
                <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase mt-1">Próximos Vencimentos</p>
              </div>
              <button onClick={() => onSwitchView('expenses')} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all">
                <ChevronRight size={20} />
              </button>
           </div>

           <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pr-1">
              {metrics.pendingExpenses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-10">
                   <CheckCircle2 size={40} className="mb-4 text-slate-200" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Sem contas a pagar</p>
                </div>
              ) : (
                metrics.pendingExpenses.map((expense) => {
                  const isToday = expense.dueDate === todayStr;
                  const isOverdue = expense.dueDate < todayStr;
                  
                  return (
                    <div key={expense.id} className={`p-4 rounded-2xl border transition-all ${
                      isOverdue 
                        ? 'bg-rose-50/30 border-rose-200 dark:bg-rose-900/10 dark:border-rose-900' 
                        : isToday 
                          ? 'bg-amber-50/20 dark:bg-amber-900/10 border-amber-200' 
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800'
                    }`}>
                       <div className="flex justify-between items-start mb-2">
                          <div className="flex flex-col min-w-0">
                             <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase truncate pr-4">{expense.description}</span>
                             <span className="text-[7px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter">{expense.category}</span>
                          </div>
                          {isOverdue ? (
                            <span className="text-[8px] font-black text-rose-600 bg-rose-100 dark:bg-rose-900/40 px-2 py-0.5 rounded">VENCIDA</span>
                          ) : isToday ? (
                            <span className="text-[8px] font-black text-amber-600 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded">HOJE</span>
                          ) : (
                            <span className="text-[8px] font-black text-slate-400">{new Date(expense.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                          )}
                       </div>
                       <div className="flex items-center justify-between mt-2">
                          <div className="text-[8px] font-bold text-slate-400 dark:text-slate-600 uppercase">Venc: {new Date(expense.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                          <div className={`text-sm font-black tracking-tight ${isOverdue ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                             R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                       </div>
                    </div>
                  );
                })
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color, context, isHighlight, trend }: any) => {
  const themes: any = {
    emerald: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30",
    sky: "text-[#5ecce3] bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800/30",
    rose: "text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30"
  };
  return (
    <div className={`p-6 sm:p-8 rounded-[2.5rem] border shadow-sm dark:shadow-none transition-all flex flex-col justify-between min-h-[160px] ${isHighlight ? 'bg-slate-900 dark:bg-slate-800 border-slate-800 dark:border-slate-700 text-white' : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 text-slate-900 dark:text-white'}`}>
      <div>
        <div className="flex items-center justify-between mb-5">
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isHighlight ? 'text-white/40' : 'text-slate-400 dark:text-slate-500'}`}>{label}</span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg dark:shadow-none ${isHighlight ? 'bg-white/10 text-white' : (themes[color] || 'bg-slate-100')}`}>
            <Icon size={18} />
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black tracking-tighter truncate">{value}</span>
            {trend && <div className={isHighlight ? 'text-emerald-400' : 'text-slate-300 dark:text-slate-600'}>{trend}</div>}
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-widest mt-2 ${isHighlight ? 'text-white/30' : 'text-slate-400 dark:text-slate-500'}`}>{context}</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
