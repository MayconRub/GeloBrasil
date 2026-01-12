
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
  Info,
  Calendar,
  AlertTriangle,
  Target,
  Droplets,
  HandCoins,
  Gauge,
  ShoppingBag,
  ArrowRight,
  Timer
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Sale, Expense, ViewType, Production, AppSettings, ExpenseStatus, Delivery, Client, DeliveryStatus, Vehicle } from '../types';

interface Props {
  sales: Sale[];
  expenses: Expense[];
  production: Production[];
  deliveries: Delivery[];
  clients: Client[];
  onSwitchView: (view: ViewType) => void;
  settings: AppSettings;
  onAddSale: (sale: Sale) => void;
  vehicles?: Vehicle[];
}

const DashboardView: React.FC<Props> = ({ 
  sales = [], expenses = [], production = [], deliveries = [], clients = [], onSwitchView, settings, vehicles = []
}) => {
  const [viewTab, setViewTab] = useState<'finance' | 'operation'>('finance');
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getLocalDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = useMemo(() => getLocalDateKey(new Date()), []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getLocalDateKey(d);
  }, []);

  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const isToday = (d: string) => d === todayStr;
    const isThisMonth = (d: string) => {
      if (!d) return false;
      const parts = d.split('-');
      return parseInt(parts[0]) === currentYear && parseInt(parts[1]) === currentMonth;
    };

    const salesToday = sales.filter(s => isToday(s.date)).reduce((acc, s) => acc + s.value, 0);
    const salesMonth = sales.filter(s => isThisMonth(s.date)).reduce((acc, s) => acc + s.value, 0);
    const expensesToday = expenses.filter(e => isToday(e.dueDate) && e.status === ExpenseStatus.PAGO).reduce((acc, e) => acc + e.value, 0);
    const expensesMonthPaid = expenses.filter(e => isThisMonth(e.dueDate) && e.status === ExpenseStatus.PAGO).reduce((acc, e) => acc + e.value, 0);
    const totalExpensesMonth = expenses.filter(e => isThisMonth(e.dueDate)).reduce((acc, e) => acc + e.value, 0);
    const pendingExpenses = expenses.filter(e => e.status !== ExpenseStatus.PAGO && e.dueDate < todayStr);
    const pendingExpensesTotal = pendingExpenses.reduce((acc, e) => acc + e.value, 0);
    const pendingBilling = deliveries.filter(d => d.status === DeliveryStatus.ENTREGUE_PENDENTE_PGTO);
    const pendingBillingTotal = pendingBilling.reduce((acc, d) => acc + (d.totalValue || 0), 0);
    const prodToday = production.filter(p => isToday(p.date)).reduce((acc, p) => acc + p.quantityKg, 0);
    const prodYesterday = production.filter(p => p.date === yesterdayStr).reduce((acc, p) => acc + p.quantityKg, 0);
    const fleetAlerts = vehicles.filter(v => (v.km_atual - v.km_ultima_troca) >= 1000).length;
    const goalValue = totalExpensesMonth > 0 ? totalExpensesMonth : (settings.salesGoalMonthly || 1);
    const goalPercent = Math.min(Math.round((salesMonth / goalValue) * 100), 100);
    const restamParaMeta = Math.max(0, goalValue - salesMonth);
    const salesTodayCount = sales.filter(s => isToday(s.date)).length || 1;
    const ticketMedioHoje = salesToday / salesTodayCount;

    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      const dStr = getLocalDateKey(d);
      return {
        name: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        vendas: sales.filter(s => s.date === dStr).reduce((sum, s) => sum + s.value, 0),
        despesas: expenses.filter(e => e.dueDate === dStr && e.status === ExpenseStatus.PAGO).reduce((sum, e) => sum + e.value, 0)
      };
    });

    return {
      salesToday, salesMonth, expensesToday, expensesMonthPaid,
      totalExpensesMonth, restamParaMeta, ticketMedioHoje,
      pendingExpensesTotal, pendingExpensesCount: pendingExpenses.length,
      pendingBillingTotal, pendingBillingCount: pendingBilling.length,
      prodToday, prodYesterday, fleetAlerts,
      goalPercent, chartData
    };
  }, [sales, expenses, production, deliveries, settings, todayStr, yesterdayStr, vehicles]);

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 max-w-[1600px] mx-auto pb-24 lg:pb-12 animate-in fade-in duration-700 transition-colors uppercase overflow-x-hidden">
      
      {/* Camada 1: Alertas Críticos - Ajustados para Mobile */}
      {(metrics.pendingExpensesCount > 0 || metrics.pendingBillingCount > 0 || metrics.fleetAlerts > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {metrics.pendingExpensesCount > 0 && (
            <AlertCard icon={AlertTriangle} color="rose" title="Contas Vencidas" value={formatBRL(metrics.pendingExpensesTotal)} desc={`${metrics.pendingExpensesCount} pendências`} onClick={() => onSwitchView('expenses')} />
          )}
          {metrics.pendingBillingCount > 0 && (
            <AlertCard icon={HandCoins} color="amber" title="Cobranças" value={formatBRL(metrics.pendingBillingTotal)} desc={`${metrics.pendingBillingCount} não pagas`} onClick={() => onSwitchView('billing')} />
          )}
          {metrics.fleetAlerts > 0 && (
            <AlertCard icon={Droplets} color="sky" title="Frota" value={`${metrics.fleetAlerts} Alertas`} desc="Manutenção necessária" onClick={() => onSwitchView('fleet')} />
          )}
        </div>
      )}

      {/* Seletor de Visão Principal - Reduzido no Mobile */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-sky-100/10 dark:shadow-none">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-900 dark:bg-slate-800 rounded-xl lg:rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <Activity size={20} className="animate-pulse" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg lg:text-2xl font-black text-slate-800 dark:text-white tracking-tighter truncate uppercase">CENTRAL DE <span className="text-sky-500">COMANDO</span></h1>
            <p className="text-[7px] lg:text-[9px] font-black text-slate-400 tracking-widest mt-0.5 truncate">Gelo Brasil • Gestão em Tempo Real</p>
          </div>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl lg:rounded-2xl border border-slate-200 dark:border-slate-800 w-full lg:w-auto">
          <button onClick={() => setViewTab('finance')} className={`flex-1 lg:px-8 py-2.5 lg:py-3 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black tracking-widest transition-all flex items-center justify-center gap-2 ${viewTab === 'finance' ? 'bg-white dark:bg-slate-800 text-sky-500 shadow-sm' : 'text-slate-400'}`}>
            <Wallet size={12}/> GERENCIAL
          </button>
          <button onClick={() => setViewTab('operation')} className={`flex-1 lg:px-8 py-2.5 lg:py-3 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black tracking-widest transition-all flex items-center justify-center gap-2 ${viewTab === 'operation' ? 'bg-white dark:bg-slate-800 text-sky-500 shadow-sm' : 'text-slate-400'}`}>
            <Truck size={12}/> OPERACIONAL
          </button>
        </div>
      </div>

      {viewTab === 'finance' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Velocímetro de Meta - Ajustado Altura Mobile */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2rem] lg:rounded-[3rem] border border-slate-50 dark:border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden group">
               <div className="absolute top-4 left-6 flex items-center gap-2">
                 <Target size={12} className="text-sky-500" />
                 <span className="text-[8px] font-black text-slate-400 tracking-widest">Ponto de Equilíbrio</span>
               </div>
               
               <div className="w-full h-32 lg:h-48 relative flex items-center justify-center mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{ value: metrics.goalPercent }, { value: 100 - metrics.goalPercent }]} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius="65%" outerRadius="100%" paddingAngle={0} dataKey="value">
                        <Cell fill="#5ecce3" stroke="none" />
                        <Cell fill={isDark ? "#1e293b" : "#f1f5f9"} stroke="none" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute bottom-1 lg:bottom-4 flex flex-col items-center">
                    <span className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white leading-none">{metrics.goalPercent}%</span>
                    <span className="text-[7px] lg:text-[8px] font-black text-slate-400 uppercase mt-1">Coberto</span>
                  </div>
               </div>
               
               <div className="mt-3 lg:mt-4">
                  <p className={`text-[10px] lg:text-xs font-black ${metrics.restamParaMeta > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {metrics.restamParaMeta > 0 ? `FALTAM ${formatBRL(metrics.restamParaMeta)}` : 'LUCRO ATINGIDO!'}
                  </p>
                  <p className="text-[7px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 mt-1 uppercase">Meta (Custos): {formatBRL(metrics.totalExpensesMonth)}</p>
               </div>
            </div>

            {/* Cards Financeiros - Ajustados Grid no Mobile */}
            <div className="lg:col-span-8 grid grid-cols-2 gap-3 lg:gap-6">
              <FinanceCard label="Venda Hoje" value={formatBRL(metrics.salesToday)} icon={TrendingUp} color="emerald" subValue={`Mês: ${formatBRL(metrics.salesMonth)}`} />
              <FinanceCard label="Custos Hoje" value={formatBRL(metrics.expensesToday)} icon={ArrowDownCircle} color="rose" subValue={`Mês: ${formatBRL(metrics.expensesMonthPaid)}`} />
              <FinanceCard label="Ticket Médio" value={formatBRL(metrics.ticketMedioHoje)} icon={ShoppingBag} color="sky" subValue="Valor por pedido" />
              <FinanceCard label="Saldo Real" value={formatBRL(metrics.salesToday - metrics.expensesToday)} icon={Wallet} color="indigo" subValue="Entrada - Saída" />
            </div>
          </div>

          {/* Gráfico de Tendência - Altura Otimizada */}
          <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2rem] lg:rounded-[3rem] border border-slate-50 dark:border-slate-800 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 lg:mb-10">
               <div className="min-w-0">
                  <h3 className="text-[10px] lg:text-sm font-black text-slate-800 dark:text-white tracking-widest uppercase">Fluxo <span className="text-sky-500">7 Dias</span></h3>
                  <p className="text-[7px] lg:text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-[0.1em] truncate">Desempenho semanal de vendas e despesas</p>
               </div>
               <div className="flex gap-4">
                 <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-sky-500" /><span className="text-[7px] lg:text-[8px] font-black text-slate-400 uppercase">VENDAS</span></div>
                 <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-rose-500" /><span className="text-[7px] lg:text-[8px] font-black text-slate-400 uppercase">DESPESAS</span></div>
               </div>
            </div>
            <div className="h-[200px] lg:h-[300px] w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5ecce3" stopOpacity={0.1}/><stop offset="95%" stopColor="#5ecce3" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorExps" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.05}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 8, fontWeight: 700}} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 8, fontWeight: 700}} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '8px' }} />
                  <Area type="monotone" dataKey="vendas" stroke="#5ecce3" strokeWidth={3} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="despesas" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" fill="url(#colorExps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Camada Operacional - Cards Compactos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
            <OperationalCard title="Em Rota" icon={Truck} color="sky" mainValue={deliveries.filter(d => d.status === DeliveryStatus.EM_ROTA).length} unit="Pedidos" detail={`${deliveries.filter(d => d.status === DeliveryStatus.PENDENTE).length} Aguardando`} />
            <OperationalCard title="Produção" icon={Snowflake} color="indigo" mainValue={metrics.prodToday} unit="KG" detail={`Ontem: ${metrics.prodYesterday} KG`} trend={metrics.prodToday >= metrics.prodYesterday ? 'up' : 'down'} />
            <OperationalCard title="Concluídas" icon={CheckCircle2} color="emerald" mainValue={deliveries.filter(d => d.status === DeliveryStatus.ENTREGUE && d.scheduledDate === todayStr).length} unit="Hoje" detail="Pedidos entregues" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
             <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2rem] border border-slate-50 dark:border-slate-800">
               <h3 className="text-[10px] lg:text-sm font-black text-slate-800 dark:text-white tracking-widest mb-6 lg:mb-8 flex items-center gap-2 uppercase">
                 <Timer size={14} className="text-sky-500" /> Entregas Hoje
               </h3>
               <div className="space-y-4">
                 <StatusProgress label="Aguardando" count={deliveries.filter(d => d.status === DeliveryStatus.PENDENTE && d.scheduledDate === todayStr).length} total={deliveries.filter(d => d.scheduledDate === todayStr).length} color="bg-amber-400" />
                 <StatusProgress label="Em Trânsito" count={deliveries.filter(d => d.status === DeliveryStatus.EM_ROTA && d.scheduledDate === todayStr).length} total={deliveries.filter(d => d.scheduledDate === todayStr).length} color="bg-sky-500" />
                 <StatusProgress label="Finalizadas" count={deliveries.filter(d => (d.status === DeliveryStatus.ENTREGUE || d.status === DeliveryStatus.ENTREGUE_PENDENTE_PGTO) && d.scheduledDate === todayStr).length} total={deliveries.filter(d => d.scheduledDate === todayStr).length} color="bg-emerald-500" />
               </div>
             </div>

             <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2rem] border border-slate-50 dark:border-slate-800 overflow-hidden">
               <h3 className="text-[10px] lg:text-sm font-black text-slate-800 dark:text-white tracking-widest mb-6 lg:mb-8 flex items-center gap-2 uppercase">
                 <ArrowUpRight size={14} className="text-sky-500" /> Logística
               </h3>
               <div className="space-y-2.5">
                  {deliveries.slice(0, 4).map(d => (
                    <div key={d.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl lg:rounded-2xl border border-slate-100 dark:border-slate-800 transition-all">
                       <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${d.status === DeliveryStatus.ENTREGUE ? 'bg-emerald-50 text-emerald-500' : 'bg-sky-50 text-sky-500'}`}>
                             <Truck size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] lg:text-[10px] font-black text-slate-800 dark:text-slate-200 truncate">{clients.find(c => c.id === d.clientId)?.name || 'Cliente'}</p>
                            <p className="text-[7px] font-black text-slate-400 uppercase truncate">{d.status} • {d.scheduledTime}</p>
                          </div>
                       </div>
                       <ChevronRight size={14} className="text-slate-300 shrink-0" />
                    </div>
                  ))}
               </div>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

const AlertCard = ({ icon: Icon, color, title, value, desc, onClick }: any) => {
  const themes: any = {
    rose: "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-900/10 dark:border-rose-900/30",
    amber: "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-900/10 dark:border-amber-900/30",
    sky: "bg-sky-50 border-sky-100 text-sky-600 dark:bg-sky-900/10 dark:border-sky-900/30"
  };
  return (
    <div onClick={onClick} className={`p-4 lg:p-5 rounded-[1.5rem] lg:rounded-[2rem] border flex items-center gap-3 lg:gap-4 cursor-pointer hover:scale-[1.02] transition-all ${themes[color]}`}>
      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-white/80 dark:bg-slate-900/80 flex items-center justify-center shadow-sm shrink-0">
        <Icon size={20} className="lg:size-24" />
      </div>
      <div className="min-w-0">
        <h4 className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest truncate">{title}</h4>
        <p className="text-sm lg:text-lg font-black leading-none my-0.5 truncate">{value}</p>
        <p className="text-[7px] lg:text-[8px] font-bold opacity-60 uppercase truncate">{desc}</p>
      </div>
    </div>
  );
};

const FinanceCard = ({ label, value, icon: Icon, color, subValue }: any) => {
  const themes: any = {
    emerald: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
    rose: "text-rose-500 bg-rose-50 dark:bg-rose-950/30",
    sky: "text-sky-500 bg-sky-50 dark:bg-sky-950/30",
    indigo: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-50 dark:border-slate-800 shadow-sm flex flex-col justify-between group overflow-hidden">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <span className="text-[7px] lg:text-[9px] font-black text-slate-400 tracking-widest uppercase truncate mr-1">{label}</span>
        <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl flex items-center justify-center shrink-0 ${themes[color]} group-hover:scale-110 transition-transform`}>
          <Icon size={16} className="lg:size-18" />
        </div>
      </div>
      <div className="min-w-0">
        <h3 className="text-xs lg:text-2xl font-black text-slate-900 dark:text-white tracking-tighter truncate">{value}</h3>
        <p className="text-[6px] lg:text-[8px] font-black text-slate-400 tracking-widest mt-1 uppercase truncate">{subValue}</p>
      </div>
    </div>
  );
};

const OperationalCard = ({ title, icon: Icon, color, mainValue, unit, detail, trend }: any) => {
  const themes: any = {
    sky: "bg-sky-500 shadow-sky-100 dark:shadow-none",
    indigo: "bg-indigo-500 shadow-indigo-100 dark:shadow-none",
    emerald: "bg-emerald-500 shadow-emerald-100 dark:shadow-none"
  };
  return (
    <div className={`p-6 lg:p-8 rounded-[1.8rem] lg:rounded-[3rem] ${themes[color]} text-white shadow-xl relative overflow-hidden group`}>
      <Icon size={80} className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
           <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0"><Icon size={16} /></div>
           <span className="text-[8px] lg:text-[10px] font-black tracking-widest uppercase truncate">{title}</span>
        </div>
        <div className="flex items-end gap-1.5">
           <h3 className="text-3xl lg:text-5xl font-black tracking-tighter leading-none">{mainValue}</h3>
           <span className="text-[9px] lg:text-xs font-black opacity-60 mb-1 uppercase">{unit}</span>
        </div>
        <div className="mt-4 flex items-center gap-2">
           {trend === 'up' && <ArrowUpRight size={12} className="text-emerald-300" />}
           {trend === 'down' && <ArrowDownCircle size={12} className="text-rose-300" />}
           <span className="text-[7px] lg:text-[9px] font-black tracking-widest uppercase opacity-80 truncate">{detail}</span>
        </div>
      </div>
    </div>
  );
};

const StatusProgress = ({ label, count, total, color }: any) => {
  const percent = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1.5 lg:space-y-2">
       <div className="flex justify-between text-[8px] lg:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">
          <span className="truncate mr-2">{label}</span>
          <span className="shrink-0">{count} / {total}</span>
       </div>
       <div className="h-1.5 lg:h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percent}%` }} />
       </div>
    </div>
  );
};

export default DashboardView;
