
import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, Snowflake, ChevronLeft, ChevronRight, Receipt, Calendar, Clock, BarChart3, 
  ShieldCheck, Zap, Factory, Box, AlertCircle, ArrowUpRight, ArrowDownRight,
  Play, Search, Settings, DollarSign
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Sale, Expense, ViewType, Production, AppSettings, MonthlyGoal, ExpenseStatus } from '../types';

interface Props {
  sales: Sale[];
  expenses: Expense[];
  production: Production[];
  monthlyGoals: MonthlyGoal[];
  onSwitchView: (view: ViewType) => void;
  expirationDate: string;
  onOpenPayment: () => void;
  settings: AppSettings;
}

const DashboardView: React.FC<Props> = ({ sales, expenses, production, monthlyGoals, onSwitchView, settings }) => {
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const stats = useMemo(() => {
    // Dados Diários
    const dSales = sales.filter(s => s.date === todayStr).reduce((sum, s) => sum + (s.value || 0), 0);
    const dProd = production.filter(p => p.date === todayStr).reduce((sum, p) => sum + (p.quantityKg || 0), 0);
    const dExp = expenses.filter(e => e.dueDate === todayStr).reduce((sum, e) => sum + (e.value || 0), 0);

    // Dados Mensais
    const mSalesTotal = sales.filter(s => {
      const d = new Date(s.date + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, s) => sum + (s.value || 0), 0);

    const mExpTotal = expenses.filter(e => {
        const d = new Date(e.dueDate + 'T00:00:00');
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, e) => sum + (e.value || 0), 0);

    const chartData = [];
    for (let i = 14; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      chartData.push({
        name: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        vendas: sales.filter(s => s.date === dStr).reduce((sum, s) => sum + (s.value || 0), 0)
      });
    }

    return { dSales, dProd, dExp, mSalesTotal, mExpTotal, chartData };
  }, [sales, expenses, production, todayStr, currentMonth, currentYear]);

  const mainValue = period === 'daily' ? stats.dSales : stats.mSalesTotal;
  const secondaryValue = period === 'daily' ? stats.dExp : stats.mExpTotal;
  const profit = mainValue - secondaryValue;

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      
      {/* Top Header - Claro */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 ice-card flex items-center justify-center text-sky-500">
            <Snowflake size={26} className="animate-ice" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-slate-800 leading-none">
              VISÃO GERAL <span className="text-sky-500 uppercase tracking-widest text-[8px] sm:text-xs ml-2">Fábrica de Gelo</span>
            </h1>
            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Controle Cristalino v4.2</p>
          </div>
        </div>

        {/* Switcher de Período */}
        <div className="flex p-1 bg-white border border-sky-100 rounded-2xl shadow-sm w-full sm:w-auto">
          <button 
            onClick={() => setPeriod('daily')}
            className={`flex-1 sm:flex-none px-6 sm:px-8 py-3 rounded-xl text-[9px] sm:text-[10px] font-black transition-all ${period === 'daily' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-sky-500'}`}
          >
            HOJE
          </button>
          <button 
            onClick={() => setPeriod('monthly')}
            className={`flex-1 sm:flex-none px-6 sm:px-8 py-3 rounded-xl text-[9px] sm:text-[10px] font-black transition-all ${period === 'monthly' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-sky-500'}`}
          >
            MENSAL
          </button>
        </div>
      </header>

      {/* Grid de Métricas de Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Card Principal - Faturamento/Lucro */}
        <div className="lg:col-span-8 ice-card p-6 sm:p-10 flex flex-col justify-between overflow-hidden relative min-h-[400px]">
          <div className="absolute -right-10 -top-10 opacity-5 text-sky-500 pointer-events-none">
            <DollarSign size={200} className="sm:size-[240px]" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-[9px] sm:text-[10px] font-black tracking-[0.3em] text-slate-400 mb-2 uppercase">RECEITA BRUTA ({period.toUpperCase()})</h2>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
               <h3 className="text-4xl sm:text-6xl font-black text-slate-800 tracking-tighter">
                R$ {mainValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
               </h3>
               <span className={`flex items-center gap-1 text-[10px] sm:text-sm font-black uppercase ${profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                 {profit >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                 {profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} LUCRO
               </span>
            </div>
          </div>

          <div className="h-48 sm:h-64 mt-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="iceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 8, fontWeight: 800}} dy={15} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontWeight: 900, fontSize: 10 }}
                  formatter={(value: any) => [`R$ ${value.toLocaleString()}`, 'Vendas']}
                />
                <Area type="monotone" dataKey="vendas" stroke="#0ea5e9" strokeWidth={3} fill="url(#iceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar de Métricas Diárias Rápidas */}
        <div className="lg:col-span-4 space-y-6">
           <QuickStat label="PRODUÇÃO HOJE" value={`${stats.dProd.toLocaleString()} KG`} icon={<Box size={22} />} color="sky" />
           <QuickStat label="DESPESAS HOJE" value={`R$ ${stats.dExp.toLocaleString()}`} icon={<Receipt size={22} />} color="rose" />
           
           <div className="ice-card p-6 sm:p-8 flex flex-col items-center justify-center">
              <h4 className="text-[8px] sm:text-[9px] font-black text-slate-400 tracking-widest mb-4 sm:mb-6 uppercase">SISTEMA OPERACIONAL</h4>
              <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="42%" stroke="#f1f5f9" strokeWidth="6" fill="transparent" className="sm:stroke-[8]" />
                    <circle cx="50%" cy="50%" r="42%" stroke="#0ea5e9" strokeWidth="6" fill="transparent" strokeDasharray="264" strokeDashoffset="13" strokeLinecap="round" className="sm:stroke-[8] sm:stroke-dasharray-[364] sm:stroke-dashoffset-[18]" />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-black text-slate-800">95%</span>
                 </div>
              </div>
              <p className="text-[7px] sm:text-[8px] font-black text-emerald-500 mt-4 sm:mt-6 tracking-widest uppercase">SISTEMAS OTIMIZADOS</p>
           </div>
        </div>

        {/* Rodapé de Ações Rápidas - Responsivo */}
        <div className="lg:col-span-12 ice-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
              <h2 className="hidden sm:block text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase leading-none">PAINEL DE FÁBRICA</h2>
              <div className="flex gap-4 w-full sm:w-auto">
                 <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 sm:py-3 bg-sky-500 text-white rounded-xl font-black text-[9px] sm:text-[10px] tracking-widest hover:bg-sky-600 transition-all shadow-lg shadow-sky-100 uppercase active:scale-95">
                    <Play size={14} fill="currentColor" /> Produção
                 </button>
                 <button onClick={() => onSwitchView('sales')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 sm:py-3 bg-emerald-500 text-white rounded-xl font-black text-[9px] sm:text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 uppercase active:scale-95">
                    <DollarSign size={14} /> Vender
                 </button>
              </div>
           </div>
           
           <div className="flex gap-4 sm:gap-6 text-[8px] sm:text-[9px] font-black text-slate-500 uppercase">
              <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-sky-500" /> PROTEÇÃO</div>
              <div className="flex items-center gap-2"><Zap size={14} className="text-amber-500" /> EFICIÊNCIA</div>
           </div>
        </div>

      </div>
    </div>
  );
};

const QuickStat = ({ label, value, icon: Icon, color }: any) => {
  const colorMap: any = {
    sky: 'bg-sky-50 text-sky-500 border-sky-100',
    rose: 'bg-rose-50 text-rose-500 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-500 border-emerald-100'
  };

  return (
    <div className="ice-card p-5 sm:p-6 flex items-center gap-4 sm:gap-5">
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border ${colorMap[color]}`}>
        {Icon}
      </div>
      <div>
        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 tracking-widest mb-1 uppercase">{label}</p>
        <h4 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">{value}</h4>
      </div>
    </div>
  );
};

export default DashboardView;
