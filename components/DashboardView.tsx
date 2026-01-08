
import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, Snowflake, Wallet, 
  CircleDollarSign, Receipt, Box, 
  ArrowUpRight, ArrowDownRight,
  CalendarDays,
  Clock,
  Truck,
  MapPin,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2
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

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

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

    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dStr = d.toISOString().split('T')[0];
      const daySales = safeSales.filter(s => s.date === dStr).reduce((sum, s) => sum + (Number(s.value) || 0), 0);
      const dayExps = safeExps.filter(e => e.dueDate === dStr && e.status === ExpenseStatus.PAGO).reduce((sum, e) => sum + (Number(e.value) || 0), 0);
      return {
        name: d.toLocaleDateString('pt-BR', { day: '2-digit' }),
        vendas: daySales || 0,
        despesas: dayExps || 0
      };
    });

    const activeDeliveries = (deliveries || [])
      .filter(d => d.status === DeliveryStatus.PENDENTE || d.status === DeliveryStatus.EM_ROTA)
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate) || (a.scheduledTime || '').localeCompare(b.scheduledTime || ''))
      .slice(0, 5);

    // Filtro de despesas pendentes: Vencidas (atrasadas) primeiro, depois as de hoje, depois futuras
    const pendingExpenses = (expenses || [])
      .filter(e => e.status !== ExpenseStatus.PAGO)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 6);

    return {
      totalSales: totalSales || 0,
      totalExps: totalExps || 0,
      totalProd: totalProd || 0,
      profit: profit || 0,
      chartData,
      isHealthy: profit >= 0,
      activeDeliveries,
      pendingExpenses
    };
  }, [sales, expenses, production, deliveries, period, todayStr]);

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'CLIENTE';

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-500 transition-colors">
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-sky-100/20 dark:shadow-none transition-all">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center w-14 h-14">
            <div className={`absolute inset-0 rounded-full blur-2xl opacity-40 animate-pulse ${metrics.isHealthy ? 'bg-[#5ecce3]' : 'bg-rose-400'}`}></div>
            <Box 
              size={42} 
              className={`relative z-10 transition-all duration-700 animate-pulse drop-shadow-[0_0_12px_rgba(94,204,227,0.9)] ${metrics.isHealthy ? 'text-[#5ecce3]' : 'text-rose-400'}`} 
              strokeWidth={2}
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase leading-none">Dash<span className="text-[#5ecce3]">board</span></h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
               <Clock size={12} className="text-[#5ecce3]" /> {period === 'daily' ? 'Monitoramento Hoje' : 'Performance Mensal'}
            </p>
          </div>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <button 
            onClick={() => setPeriod('daily')} 
            className={`px-8 py-2.5 rounded-xl text-[9px] font-black tracking-widest transition-all ${period === 'daily' ? 'bg-[#5ecce3] text-white shadow-lg' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600'}`}
          >
            DIÁRIO
          </button>
          <button 
            onClick={() => setPeriod('monthly')} 
            className={`px-8 py-2.5 rounded-xl text-[9px] font-black tracking-widest transition-all ${period === 'monthly' ? 'bg-[#5ecce3] text-white shadow-lg' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600'}`}
          >
            MENSAL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <MetricCard label="Faturamento" value={`R$ ${metrics.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={CircleDollarSign} color="emerald" context={period === 'daily' ? 'Receita de Hoje' : 'Faturamento Mensal'} trend={<ArrowUpRight size={14} />} />
        <MetricCard label="Produção" value={`${metrics.totalProd.toLocaleString('pt-BR')} KG`} icon={Snowflake} color="sky" context={period === 'daily' ? 'Lotes de Hoje' : 'Volume do Mês'} />
        <MetricCard label="Saldo Líquido" value={`R$ ${metrics.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={Wallet} color={metrics.profit >= 0 ? 'emerald' : 'rose'} context="Dinheiro em Caixa" isHighlight />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[3rem] border border-slate-50 dark:border-slate-800 shadow-sm dark:shadow-none relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <TrendingUp size={16} className="text-[#5ecce3]" /> Fluxo de Movimentação (7 dias)
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5ecce3" stopOpacity={0.2}/><stop offset="95%" stopColor="#5ecce3" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorExps" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 800}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 9}} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '20px', 
                    boxShadow: isDark ? 'none' : '0 10px 30px rgba(0,0,0,0.1)', 
                    fontSize: '11px',
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    color: isDark ? '#f8fafc' : '#000000',
                    border: isDark ? '1px solid #1e293b' : 'none'
                  }} 
                />
                <Area type="monotone" dataKey="vendas" name="Vendas" stroke="#5ecce3" strokeWidth={4} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorExps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card de Painel de Entregas Ativas */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[3rem] border border-slate-50 dark:border-slate-800 shadow-sm flex flex-col h-full">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Truck size={16} className="text-sky-500" /> Logística Ativa
                </h3>
                <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase mt-1">Status de Entrega</p>
              </div>
              <button onClick={() => onSwitchView('deliveries')} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-300 hover:text-sky-500 transition-all">
                <ChevronRight size={20} />
              </button>
           </div>

           <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pr-1">
              {metrics.activeDeliveries.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-10">
                   <Box size={48} className="mb-4 text-slate-200" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Sem entregas pendentes</p>
                </div>
              ) : (
                metrics.activeDeliveries.map((delivery) => {
                  const isToday = delivery.scheduledDate === todayStr;
                  return (
                    <div key={delivery.id} className={`p-4 rounded-2xl border transition-all ${isToday ? 'bg-amber-50/30 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30' : 'bg-slate-50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800'}`}>
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase truncate pr-4">{getClientName(delivery.clientId)}</span>
                          {isToday ? (
                            <span className="flex items-center gap-1 text-[8px] font-black text-amber-600 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded animate-pulse">
                              <AlertCircle size={10} /> HOJE
                            </span>
                          ) : (
                            <span className="text-[8px] font-black text-slate-400">{new Date(delivery.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                          )}
                       </div>
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase">
                             <Clock size={12} className="text-sky-500" /> {delivery.scheduledTime || '--:--'}
                          </div>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${delivery.status === DeliveryStatus.EM_ROTA ? 'bg-sky-500 text-white shadow-lg shadow-sky-100 dark:shadow-none' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                            {delivery.status === DeliveryStatus.EM_ROTA ? 'EM ROTA' : 'AGENDADA'}
                          </span>
                       </div>
                    </div>
                  );
                })
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Painel de Despesas com Efeito Pulsante para Vencidas/Hoje */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[3rem] border border-slate-50 dark:border-slate-800 shadow-sm flex flex-col h-full">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Receipt size={16} className="text-rose-500" /> Painel de Despesas
                </h3>
                <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase mt-1">Contas Pendentes</p>
              </div>
              <button onClick={() => onSwitchView('expenses')} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all">
                <ChevronRight size={20} />
              </button>
           </div>

           <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pr-1">
              {metrics.pendingExpenses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-10">
                   <CheckCircle2 size={48} className="mb-4 text-slate-200" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Contas em Dia</p>
                </div>
              ) : (
                metrics.pendingExpenses.map((expense) => {
                  const isToday = expense.dueDate === todayStr;
                  const isOverdue = expense.dueDate < todayStr;
                  
                  return (
                    <div key={expense.id} className={`p-4 rounded-2xl border transition-all ${
                      isOverdue 
                        ? 'bg-rose-500/10 border-rose-500 dark:border-rose-900 ring-2 ring-rose-500 animate-pulse' 
                        : isToday 
                          ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-400 animate-pulse ring-1 ring-amber-400' 
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800'
                    }`}>
                       <div className="flex justify-between items-start mb-2">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase truncate pr-4">{expense.description}</span>
                             <span className="text-[7px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter">{expense.category}</span>
                          </div>
                          {isOverdue ? (
                            <span className="flex items-center gap-1 text-[8px] font-black text-white bg-rose-600 px-2 py-0.5 rounded shadow-lg">
                              <AlertTriangle size={10} /> VENCIDA
                            </span>
                          ) : isToday ? (
                            <span className="flex items-center gap-1 text-[8px] font-black text-amber-700 bg-amber-200 px-2 py-0.5 rounded">
                              <Clock size={10} /> VENCE HOJE
                            </span>
                          ) : (
                            <span className="text-[8px] font-black text-slate-400">{new Date(expense.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                          )}
                       </div>
                       <div className="flex items-center justify-between mt-3">
                          <div className="text-[8px] font-bold text-slate-400 dark:text-slate-600">
                             VENCIMENTO: {new Date(expense.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </div>
                          <div className={`text-sm font-black tracking-tight ${isOverdue ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                             R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                       </div>
                    </div>
                  );
                })
              )}
           </div>

           <button onClick={() => onSwitchView('expenses')} className="mt-6 w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center justify-center gap-2">
             Ver Planilha Completa <ChevronRight size={14} />
           </button>
        </div>

        <div className="grid grid-cols-1 gap-6 no-print">
           <button onClick={() => onSwitchView('sales')} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-sky-50 dark:hover:bg-slate-800 transition-all shadow-sm dark:shadow-none group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-sky-50 dark:bg-sky-900/30 text-[#5ecce3] rounded-xl flex items-center justify-center group-hover:bg-[#5ecce3] group-hover:text-white transition-all shadow-inner"><CircleDollarSign size={28} /></div>
                <div className="text-left"><p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase leading-none">Lançar Faturamento</p><p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">Registro de Vendas</p></div>
              </div>
              <ArrowUpRight size={24} className="text-slate-200 dark:text-slate-700 group-hover:text-[#5ecce3] transition-all" />
           </button>
           
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
              <div className="flex flex-col gap-4">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-xl flex items-center justify-center shadow-inner"><Info size={24} /></div>
                    <div><h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase leading-none">Resumo do Mês</h4><p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">Consolidação Financeira</p></div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Vendas Mês</p>
                       <p className="text-lg font-black text-emerald-600 tracking-tighter">R$ {sales.filter(s => s.date.startsWith(todayStr.substring(0, 7))).reduce((a, b) => a + b.value, 0).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Custo Mês</p>
                       <p className="text-lg font-black text-rose-500 tracking-tighter">R$ {expenses.filter(e => e.dueDate.startsWith(todayStr.substring(0, 7)) && e.status === ExpenseStatus.PAGO).reduce((a, b) => a + b.value, 0).toLocaleString('pt-BR')}</p>
                    </div>
                 </div>
              </div>
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
        <div className="flex flex-col">
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
