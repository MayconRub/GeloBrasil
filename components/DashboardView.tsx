
import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, Snowflake, Wallet, 
  CircleDollarSign, Receipt, Activity, 
  ArrowUpRight, ArrowDownRight, Target,
  PackageCheck, Truck, Clock, CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Sale, Expense, ViewType, Production, AppSettings, Vehicle, ExpenseStatus, Delivery, DeliveryStatus } from '../types';

interface Props {
  sales: Sale[];
  expenses: Expense[];
  production: Production[];
  vehicles: Vehicle[];
  deliveries?: Delivery[];
  onSwitchView: (view: ViewType) => void;
  settings: AppSettings;
  onAddSale: (sale: Sale) => void;
}

const DashboardView: React.FC<Props> = ({ 
  sales, expenses, production, deliveries = [], onSwitchView
}) => {
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');
  const isDark = document.documentElement.classList.contains('dark');

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const metrics = useMemo(() => {
    const filter = period === 'daily' 
      ? (d: string) => d === todayStr 
      : (d: string) => {
          const now = new Date();
          const date = new Date(d + 'T00:00:00');
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        };

    const currentSales = sales.filter(s => filter(s.date));
    const currentExps = expenses.filter(e => filter(e.dueDate) && e.status === ExpenseStatus.PAGO);
    const currentProd = production.filter(p => filter(p.date));
    const currentDeliveries = deliveries.filter(d => filter(d.scheduledDate));

    const totalSales = currentSales.reduce((acc, s) => acc + s.value, 0);
    const totalExps = currentExps.reduce((acc, e) => acc + e.value, 0);
    const totalProd = currentProd.reduce((acc, p) => acc + p.quantityKg, 0);
    const profit = totalSales - totalExps;

    const totalDels = currentDeliveries.length;
    const completedDels = currentDeliveries.filter(d => d.status === DeliveryStatus.ENTREGUE).length;
    const pendingDels = totalDels - completedDels;
    const deliveryProgress = totalDels > 0 ? (completedDels / totalDels) * 100 : 0;

    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dStr = d.toISOString().split('T')[0];
      const daySales = sales.filter(s => s.date === dStr).reduce((sum, s) => sum + s.value, 0);
      const dayExps = expenses.filter(e => e.dueDate === dStr && e.status === ExpenseStatus.PAGO).reduce((sum, e) => sum + e.value, 0);
      return {
        name: d.toLocaleDateString('pt-BR', { day: '2-digit' }),
        vendas: daySales,
        despesas: dayExps
      };
    });

    return {
      totalSales, totalExps, totalProd, profit, totalDels, completedDels, pendingDels, deliveryProgress,
      chartData,
      isHealthy: profit >= 0
    };
  }, [sales, expenses, production, deliveries, period, todayStr]);

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-sky-100/20 dark:shadow-none">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl dark:shadow-none rotate-2 shrink-0">
            <Activity size={28} className={metrics.isHealthy ? 'text-emerald-400' : 'text-rose-400'} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase leading-none">Dash<span className="text-sky-500">board</span></h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
               {period === 'daily' ? 'Monitoramento do Dia' : 'Monitoramento Mensal'}
            </p>
          </div>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button onClick={() => setPeriod('daily')} className={`px-8 py-2.5 rounded-xl text-[9px] font-black transition-all ${period === 'daily' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md dark:shadow-none' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}>DIÁRIO</button>
          <button onClick={() => setPeriod('monthly')} className={`px-8 py-2.5 rounded-xl text-[9px] font-black transition-all ${period === 'monthly' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md dark:shadow-none' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}>MENSAL</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard label="Faturamento" value={`R$ ${metrics.totalSales.toLocaleString('pt-BR')}`} icon={CircleDollarSign} color="emerald" context={period === 'daily' ? 'Vendas de Hoje' : 'Vendas do Mês'} trend={<ArrowUpRight size={14} />} />
        <MetricCard 
          label="Logística" 
          value={`${metrics.completedDels}/${metrics.totalDels}`} 
          icon={PackageCheck} 
          color="sky" 
          context={period === 'daily' ? 'Entregas Hoje' : 'Entregas no Mês'}
          extra={
            <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-sky-500 transition-all duration-1000" style={{ width: `${metrics.deliveryProgress}%` }}></div>
            </div>
          }
        />
        <MetricCard label="Fabricação" value={`${metrics.totalProd.toLocaleString('pt-BR')} KG`} icon={Snowflake} color="indigo" context={period === 'daily' ? 'Produzido Hoje' : 'Produzido no Mês'} />
        <MetricCard label="Lucro Líquido" value={`R$ ${metrics.profit.toLocaleString('pt-BR')}`} icon={Wallet} color={metrics.profit >= 0 ? 'emerald' : 'rose'} context="Diferença Real" isHighlight />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[3rem] border border-slate-50 dark:border-slate-800 shadow-sm dark:shadow-none relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <TrendingUp size={16} className="text-sky-500" /> Fluxo de Caixa (7 Dias)
            </h3>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-sky-500"></div><span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase">Vendas</span></div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase">Saídas</span></div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient>
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
                <Area type="monotone" dataKey="vendas" name="Vendas" stroke="#0ea5e9" strokeWidth={4} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorExps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-50 dark:border-slate-800 shadow-sm dark:shadow-none flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <Truck size={18} className="text-sky-500" /> Logística Hoje
              </h3>
              <button onClick={() => onSwitchView('deliveries')} className="text-[9px] font-black text-sky-500 hover:underline uppercase">Ver Todas</button>
           </div>

           <div className="space-y-4 flex-1">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-xl flex items-center justify-center shadow-sm"><Clock size={20}/></div>
                    <div><p className="text-[10px] font-black text-slate-800 dark:text-slate-100 uppercase">Pendentes</p><p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Aguardando Saída</p></div>
                 </div>
                 <span className="text-xl font-black text-slate-800 dark:text-slate-100">{metrics.pendingDels}</span>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg dark:shadow-none"><CheckCircle2 size={20}/></div>
                    <div><p className="text-[10px] font-black text-emerald-800 dark:text-emerald-100 uppercase">Concluídas</p><p className="text-[9px] font-bold text-emerald-400 dark:text-emerald-500 uppercase">Entregues</p></div>
                 </div>
                 <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{metrics.completedDels}</span>
              </div>
           </div>

           <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Eficiência de Rota</span>
                 <span className="text-[10px] font-black text-sky-600">{Math.round(metrics.deliveryProgress)}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-sky-500" style={{ width: `${metrics.deliveryProgress}%` }}></div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
         <button onClick={() => onSwitchView('sales')} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-sky-50 dark:hover:bg-slate-800 transition-all shadow-sm dark:shadow-none group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/30 text-sky-500 rounded-xl flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all"><CircleDollarSign size={24} /></div>
              <div className="text-left"><p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase leading-none">Lançar Venda</p><p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">Faturamento</p></div>
            </div>
            <ArrowUpRight size={18} className="text-slate-200 dark:text-slate-700 group-hover:text-sky-500 transition-all" />
         </button>
         <button onClick={() => onSwitchView('expenses')} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-rose-50 dark:hover:bg-slate-800 transition-all shadow-sm dark:shadow-none group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-xl flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all"><Receipt size={24} /></div>
              <div className="text-left"><p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase leading-none">Lançar Despesa</p><p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">Custos</p></div>
            </div>
            <ArrowDownRight size={18} className="text-slate-200 dark:text-slate-700 group-hover:text-rose-500 transition-all" />
         </button>
         <button onClick={() => onSwitchView('deliveries')} className="bg-slate-900 dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-800 flex items-center justify-between hover:bg-slate-800 dark:hover:bg-slate-900 transition-all shadow-lg dark:shadow-none group sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 dark:bg-slate-800 text-white rounded-xl flex items-center justify-center"><Truck size={24} /></div>
              <div className="text-left"><p className="text-xs font-black text-white uppercase leading-none">Painel de Entregas</p><p className="text-[9px] font-bold text-white/40 uppercase mt-1">Logística</p></div>
            </div>
            <TrendingUp size={18} className="text-white/20 group-hover:text-white transition-all" />
         </button>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color, context, isHighlight, trend, extra }: any) => {
  const themes: any = {
    emerald: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30",
    sky: "text-sky-500 bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800/30",
    rose: "text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30",
    indigo: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/30"
  };
  return (
    <div className={`p-6 sm:p-8 rounded-[2.5rem] border shadow-sm dark:shadow-none transition-all flex flex-col justify-between min-h-[160px] ${isHighlight ? 'bg-slate-900 dark:bg-slate-800 border-slate-800 dark:border-slate-700 text-white' : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 text-slate-900 dark:text-white'}`}>
      <div>
        <div className="flex items-center justify-between mb-5">
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isHighlight ? 'text-white/40' : 'text-slate-400 dark:text-slate-500'}`}>{label}</span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg dark:shadow-none ${isHighlight ? 'bg-white/10 text-white' : themes[color]}`}>
            <Icon size={18} />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black tracking-tighter truncate">{value}</span>
            {trend && <div className={isHighlight ? 'text-emerald-400' : 'text-slate-300 dark:text-slate-600'}>{trend}</div>}
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-widest mt-2 ${isHighlight ? 'text-white/30' : 'text-slate-400 dark:text-slate-500'}`}>{context}</span>
          {extra}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
