
import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, Snowflake, Wallet, 
  CircleDollarSign, Receipt, Activity, 
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Sale, Expense, ViewType, Production, AppSettings, ExpenseStatus } from '../types';

interface Props {
  sales: Sale[];
  expenses: Expense[];
  production: Production[];
  onSwitchView: (view: ViewType) => void;
  settings: AppSettings;
  onAddSale: (sale: Sale) => void;
}

const DashboardView: React.FC<Props> = ({ 
  sales = [], expenses = [], production = [], onSwitchView
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
          if (parts.length < 2) return false;
          const y = parseInt(parts[0]);
          const m = parseInt(parts[1]);
          return y === now.getFullYear() && m === (now.getMonth() + 1);
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

    return {
      totalSales: totalSales || 0,
      totalExps: totalExps || 0,
      totalProd: totalProd || 0,
      profit: profit || 0,
      chartData,
      isHealthy: profit >= 0
    };
  }, [sales, expenses, production, period, todayStr]);

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-500 transition-colors">
      
      {/* Header Centralizado */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-sky-100/20 dark:shadow-none">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl dark:shadow-none rotate-2 shrink-0">
            <Activity size={28} className={metrics.isHealthy ? 'text-emerald-400' : 'text-rose-400'} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase leading-none">Dash<span className="text-sky-500">board</span></h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
               {period === 'daily' ? 'Resumo Diário' : 'Resumo Mensal'}
            </p>
          </div>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button onClick={() => setPeriod('daily')} className={`px-8 py-2.5 rounded-xl text-[9px] font-black transition-all ${period === 'daily' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md dark:shadow-none' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}>DIÁRIO</button>
          <button onClick={() => setPeriod('monthly')} className={`px-8 py-2.5 rounded-xl text-[9px] font-black transition-all ${period === 'monthly' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md dark:shadow-none' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}>MENSAL</button>
        </div>
      </div>

      {/* Grid de Métricas Limpa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <MetricCard label="Faturamento" value={`R$ ${metrics.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={CircleDollarSign} color="emerald" context={period === 'daily' ? 'Vendas de Hoje' : 'Vendas do Mês'} trend={<ArrowUpRight size={14} />} />
        <MetricCard label="Produção" value={`${metrics.totalProd.toLocaleString('pt-BR')} KG`} icon={Snowflake} color="sky" context={period === 'daily' ? 'Fabricado Hoje' : 'Total do Mês'} />
        <MetricCard label="Lucro Líquido" value={`R$ ${metrics.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={Wallet} color={metrics.profit >= 0 ? 'emerald' : 'rose'} context="Diferença de Caixa" isHighlight />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[3rem] border border-slate-50 dark:border-slate-800 shadow-sm dark:shadow-none relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <TrendingUp size={16} className="text-sky-500" /> Movimentação dos Últimos 7 Dias
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 no-print">
         <button onClick={() => onSwitchView('sales')} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-sky-50 dark:hover:bg-slate-800 transition-all shadow-sm dark:shadow-none group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-sky-50 dark:bg-sky-900/30 text-sky-500 rounded-xl flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all"><CircleDollarSign size={28} /></div>
              <div className="text-left"><p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase leading-none">Novo Lançamento</p><p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">Vendas e Receitas</p></div>
            </div>
            <ArrowUpRight size={24} className="text-slate-200 dark:text-slate-700 group-hover:text-sky-500 transition-all" />
         </button>
         <button onClick={() => onSwitchView('expenses')} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-rose-50 dark:hover:bg-slate-800 transition-all shadow-sm dark:shadow-none group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-xl flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all"><Receipt size={28} /></div>
              <div className="text-left"><p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase leading-none">Contas a Pagar</p><p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">Despesas Operacionais</p></div>
            </div>
            <ArrowDownRight size={24} className="text-slate-200 dark:text-slate-700 group-hover:text-rose-500 transition-all" />
         </button>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color, context, isHighlight, trend }: any) => {
  const themes: any = {
    emerald: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30",
    sky: "text-sky-500 bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800/30",
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
