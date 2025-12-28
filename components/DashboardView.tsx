
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
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* Top Header - Claro */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 ice-card flex items-center justify-center text-sky-500">
            <Snowflake size={30} className="animate-ice" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-800 leading-none">
              VISÃO GERAL <span className="text-sky-500 uppercase tracking-widest text-xs ml-2">Fábrica de Gelo</span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Controle Cristalino v4.2</p>
          </div>
        </div>

        {/* Switcher de Período */}
        <div className="flex p-1 bg-white border border-sky-100 rounded-2xl shadow-sm">
          <button 
            onClick={() => setPeriod('daily')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black transition-all ${period === 'daily' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-sky-500'}`}
          >
            HOJE
          </button>
          <button 
            onClick={() => setPeriod('monthly')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black transition-all ${period === 'monthly' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-sky-500'}`}
          >
            MENSAL
          </button>
        </div>
      </header>

      {/* Grid de Métricas de Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Card Principal - Faturamento/Lucro */}
        <div className="lg:col-span-8 ice-card p-10 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute -right-10 -top-10 opacity-5 text-sky-500">
            <DollarSign size={240} />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-[10px] font-black tracking-[0.3em] text-slate-400 mb-2">RECEITA BRUTA ({period.toUpperCase()})</h2>
            <div className="flex items-baseline gap-4">
               <h3 className="text-6xl font-black text-slate-800 tracking-tighter">
                R$ {mainValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
               </h3>
               <span className={`flex items-center gap-1 text-sm font-black ${profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                 {profit >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                 {profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} LUCRO
               </span>
            </div>
          </div>

          <div className="h-64 mt-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="iceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={15} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontWeight: 900 }} />
                <Area type="monotone" dataKey="vendas" stroke="#0ea5e9" strokeWidth={4} fill="url(#iceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar de Métricas Diárias Rápidas */}
        <div className="lg:col-span-4 space-y-6">
           <QuickStat label="PRODUÇÃO HOJE" value={`${stats.dProd.toLocaleString()} KG`} icon={<Box size={24} />} color="sky" />
           <QuickStat label="DESPESAS HOJE" value={`R$ ${stats.dExp.toLocaleString()}`} icon={<Receipt size={24} />} color="rose" />
           
           <div className="ice-card p-8 flex flex-col items-center justify-center">
              <h4 className="text-[9px] font-black text-slate-400 tracking-widest mb-6">SISTEMA OPERACIONAL</h4>
              <div className="relative w-32 h-32">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                    <circle cx="64" cy="64" r="58" stroke="#0ea5e9" strokeWidth="8" fill="transparent" strokeDasharray="364" strokeDashoffset="18" strokeLinecap="round" />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-black text-slate-800">95%</span>
                 </div>
              </div>
              <p className="text-[8px] font-black text-emerald-500 mt-6 tracking-widest">SISTEMAS OTIMIZADOS</p>
           </div>
        </div>

        {/* Rodapé de Ações Rápidas */}
        <div className="lg:col-span-12 ice-card p-8 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-6">
              <h2 className="text-[10px] font-black tracking-[0.3em] text-slate-400">PAINEL DE FÁBRICA</h2>
              <div className="flex gap-4">
                 <button className="flex items-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-xl font-black text-[10px] tracking-widest hover:bg-sky-600 transition-all shadow-lg shadow-sky-100 uppercase">
                    <Play size={16} fill="currentColor" /> Iniciar Produção
                 </button>
                 <button onClick={() => onSwitchView('sales')} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 uppercase">
                    <DollarSign size={16} /> Lançar Venda
                 </button>
              </div>
           </div>
           
           <div className="flex gap-6 text-[9px] font-black text-slate-500">
              <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-sky-500" /> PROTEÇÃO ATIVA</div>
              <div className="flex items-center gap-2"><Zap size={16} className="text-amber-500" /> ALTA EFICIÊNCIA</div>
           </div>
        </div>

      </div>
    </div>
  );
};

const QuickStat = ({ label, value, icon, color }: any) => {
  const colorMap: any = {
    sky: 'bg-sky-50 text-sky-500 border-sky-100',
    rose: 'bg-rose-50 text-rose-500 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-500 border-emerald-100'
  };

  return (
    <div className="ice-card p-6 flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 tracking-widest mb-1 uppercase">{label}</p>
        <h4 className="text-xl font-black text-slate-800 tracking-tight">{value}</h4>
      </div>
    </div>
  );
};

export default DashboardView;
