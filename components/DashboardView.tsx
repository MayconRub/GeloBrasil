
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

    return {
      totalSales, totalExps, totalProd, profit, chartData, totalWeeklySales, totalWeeklyExps,
      isHealthy: profit >= 0
    };
  }, [sales, expenses, production, period, todayStr]);

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto pb-24 lg:pb-12 animate-in fade-in duration-500 transition-colors uppercase">
      
      {/* Header Panel Otimizado Mobile */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-sky-100/10 dark:shadow-none transition-all">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
            <div className={`absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse ${metrics.isHealthy ? 'bg-[#5ecce3]' : 'bg-rose-400'}`}></div>
            <Box size={32} className={`relative z-10 ${metrics.isHealthy ? 'text-[#5ecce3]' : 'text-rose-400'}`} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase leading-none truncate">Painel <span className="text-[#5ecce3]">Gestão</span></h1>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-2">
               <Activity size={10} className="text-[#5ecce3]" /> Atualizado Agora
            </p>
          </div>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner w-full sm:w-auto">
          <button onClick={() => setPeriod('daily')} className={`flex-1 sm:px-8 py-2.5 rounded-xl text-[8px] sm:text-[9px] font-black tracking-widest transition-all ${period === 'daily' ? 'bg-[#5ecce3] text-white shadow-lg' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600'}`}>HOJE</button>
          <button onClick={() => setPeriod('monthly')} className={`flex-1 sm:px-8 py-2.5 rounded-xl text-[8px] sm:text-[9px] font-black tracking-widest transition-all ${period === 'monthly' ? 'bg-[#5ecce3] text-white shadow-lg' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600'}`}>MENSAL</button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard label="Vendas" value={`R$ ${metrics.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={CircleDollarSign} color="emerald" context={period === 'daily' ? 'Faturamento Hoje' : 'Faturamento Mês'} trend={<ArrowUpRight size={14} />} />
        <MetricCard label="Custos" value={`R$ ${metrics.totalExps.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={Receipt} color="rose" context={period === 'daily' ? 'Gasto Pago Hoje' : 'Total Pago no Mês'} trend={<ArrowDownCircle size={14} />} />
        <MetricCard label="Volume" value={`${metrics.totalProd.toLocaleString('pt-BR')} KG`} icon={Snowflake} color="sky" context={period === 'daily' ? 'Produção Hoje' : 'Produção no Mês'} />
        <MetricCard label="Líquido" value={`R$ ${metrics.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={Wallet} color={metrics.profit >= 0 ? 'emerald' : 'rose'} context="Saldo Disponível" isHighlight />
      </div>

      {/* Analytics Chart - Altura reduzida no Mobile */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border border-slate-50 dark:border-slate-800 shadow-sm dark:shadow-none relative overflow-hidden flex flex-col min-h-[350px] sm:min-h-[520px]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 sm:mb-10">
          <div>
            <h3 className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <TrendingUp size={16} className="text-[#5ecce3]" /> Fluxo Semanal
            </h3>
            <p className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase mt-1">Comparativo de entradas e saídas</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex-1 lg:flex-none flex flex-col items-start lg:items-end px-4 py-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
                <span className="text-[7px] font-black text-emerald-600 dark:text-emerald-400 uppercase">Entradas</span>
                <span className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-300">R$ {metrics.totalWeeklySales.toLocaleString('pt-BR')}</span>
             </div>
             <div className="flex-1 lg:flex-none flex flex-col items-start lg:items-end px-4 py-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl">
                <span className="text-[7px] font-black text-rose-600 dark:text-rose-400 uppercase">Saídas</span>
                <span className="text-xs sm:text-sm font-black text-rose-700 dark:text-rose-300">R$ {metrics.totalWeeklyExps.toLocaleString('pt-BR')}</span>
             </div>
          </div>
        </div>
        
        <div className="w-full flex-1 min-h-[220px] sm:min-h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5ecce3" stopOpacity={0.3}/><stop offset="95%" stopColor="#5ecce3" stopOpacity={0}/></linearGradient>
                <linearGradient id="colorExps" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f8fafc"} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDark ? '#475569' : '#94a3b8', fontSize: 8, fontWeight: 800}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: isDark ? '#475569' : '#94a3b8', fontSize: 8, fontWeight: 700}} tickFormatter={(v) => `R$${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '10px', backgroundColor: isDark ? '#0f172a' : '#ffffff' }}
              />
              <Area type="monotone" dataKey="vendas" stroke="#5ecce3" strokeWidth={4} fill="url(#colorSales)" animationDuration={1000} />
              <Area type="monotone" dataKey="despesas" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorExps)" animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
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
    <div className={`p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border shadow-sm dark:shadow-none transition-all flex flex-col justify-between min-h-[140px] sm:min-h-[160px] ${isHighlight ? 'bg-slate-900 dark:bg-slate-800 border-slate-800 dark:border-slate-700 text-white' : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 text-slate-900 dark:text-white'}`}>
      <div>
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] ${isHighlight ? 'text-white/40' : 'text-slate-400 dark:text-slate-500'}`}>{label}</span>
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg dark:shadow-none ${isHighlight ? 'bg-white/10 text-white' : (themes[color] || 'bg-slate-100')}`}>
            <Icon size={16} className="sm:size-[18px]" />
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-2xl font-black tracking-tighter truncate">{value}</span>
            {trend && <div className={isHighlight ? 'text-emerald-400' : 'text-slate-300 dark:text-slate-600'}>{trend}</div>}
          </div>
          <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widest mt-1 sm:mt-2 ${isHighlight ? 'text-white/30' : 'text-slate-400 dark:text-slate-500'}`}>{context}</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
