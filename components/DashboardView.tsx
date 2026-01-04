
import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, Snowflake, Wallet, 
  CircleDollarSign, Receipt, Activity, Package
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Sale, Expense, ViewType, Production, AppSettings, Vehicle } from '../types';

interface Props {
  sales: Sale[];
  expenses: Expense[];
  production: Production[];
  vehicles: Vehicle[];
  onSwitchView: (view: ViewType) => void;
  settings: AppSettings;
  onAddSale: (sale: Sale) => void;
}

const DashboardView: React.FC<Props> = ({ 
  sales, expenses, production, onSwitchView
}) => {
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const metrics = useMemo(() => {
    const isToday = (d: string) => d === todayStr;
    const isThisMonth = (d: string) => {
      const now = new Date();
      const date = new Date(d + 'T00:00:00');
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    };

    const filter = period === 'daily' ? isToday : isThisMonth;

    const currentSales = sales.filter(s => filter(s.date));
    const currentExps = expenses.filter(e => filter(e.dueDate));
    const currentProd = production.filter(p => filter(p.date));

    const totalSales = currentSales.reduce((acc, s) => acc + s.value, 0);
    const totalExps = currentExps.reduce((acc, e) => acc + e.value, 0);
    const totalProd = currentProd.reduce((acc, p) => acc + p.quantityKg, 0);
    const profit = totalSales - totalExps;

    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dStr = d.toISOString().split('T')[0];
      const daySales = sales.filter(s => s.date === dStr).reduce((sum, s) => sum + s.value, 0);
      const dayExps = expenses.filter(e => e.dueDate === dStr).reduce((sum, e) => sum + e.value, 0);
      return {
        name: d.toLocaleDateString('pt-BR', { day: '2-digit' }),
        vendas: daySales,
        despesas: dayExps
      };
    });

    return {
      totalSales, totalExps, totalProd, profit,
      chartData,
      isHealthy: profit >= 0
    };
  }, [sales, expenses, production, period, todayStr]);

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto pb-12">
      
      {/* Header Simplificado */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-sky-100/20">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl rotate-2 shrink-0">
            <Activity size={28} className={metrics.isHealthy ? 'text-emerald-400' : 'text-rose-400'} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">Painel de <span className="text-sky-500">Gestão</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Visão Geral da Operação</p>
          </div>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button onClick={() => setPeriod('daily')} className={`px-6 py-2 rounded-xl text-[9px] font-black transition-all ${period === 'daily' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>HOJE</button>
          <button onClick={() => setPeriod('monthly')} className={`px-6 py-2 rounded-xl text-[9px] font-black transition-all ${period === 'monthly' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>ESTE MÊS</button>
        </div>
      </div>

      {/* Grid de Métricas Master */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard 
          label="Faturamento" 
          value={`R$ ${metrics.totalSales.toLocaleString('pt-BR')}`} 
          icon={CircleDollarSign} 
          color="emerald" 
          context={period === 'daily' ? 'Recebido hoje' : 'Total do mês'}
        />
        <MetricCard 
          label="Despesas" 
          value={`R$ ${metrics.totalExps.toLocaleString('pt-BR')}`} 
          icon={Receipt} 
          color="rose" 
          context={period === 'daily' ? 'Gastos hoje' : 'Total do mês'}
        />
        <MetricCard 
          label="Produção" 
          value={`${metrics.totalProd.toLocaleString('pt-BR')} KG`} 
          icon={Snowflake} 
          color="sky" 
          context={period === 'daily' ? 'Fabricado hoje' : 'Total do mês'}
        />
        <MetricCard 
          label="Resultado" 
          value={`R$ ${metrics.profit.toLocaleString('pt-BR')}`} 
          icon={Wallet} 
          color={metrics.profit >= 0 ? 'emerald' : 'rose'} 
          context="Saldo Líquido"
        />
      </div>

      {/* Gráfico Analítico Principal */}
      <div className="bg-white p-6 sm:p-10 rounded-[3rem] border border-slate-50 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
            <TrendingUp size={16} className="text-sky-500" /> Fluxo Analítico (Últimos 7 dias)
          </h3>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient>
                <linearGradient id="colorExps" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9}} />
              <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '11px'}} />
              <Area type="monotone" dataKey="vendas" name="Vendas" stroke="#0ea5e9" strokeWidth={4} fill="url(#colorSales)" />
              <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorExps)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 no-print">
         <button onClick={() => onSwitchView('sales')} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:bg-sky-50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center"><CircleDollarSign size={24} /></div>
              <div className="text-left"><p className="text-xs font-black text-slate-800 uppercase leading-none">Vendas</p><p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Lançar faturamento</p></div>
            </div>
            <TrendingUp size={18} className="text-slate-200" />
         </button>
         <button onClick={() => onSwitchView('expenses')} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:bg-rose-50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center"><Receipt size={24} /></div>
              <div className="text-left"><p className="text-xs font-black text-slate-800 uppercase leading-none">Despesas</p><p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Controle de saídas</p></div>
            </div>
            <TrendingUp size={18} className="text-slate-200" />
         </button>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color, context }: any) => {
  const themes: any = {
    emerald: "text-emerald-500 bg-emerald-50/60 border-emerald-100",
    sky: "text-sky-500 bg-sky-50/60 border-sky-100",
    rose: "text-rose-500 bg-rose-50/60 border-rose-100"
  };
  return (
    <div className="bg-white p-6 sm:p-7 rounded-[2.5rem] border border-slate-50 shadow-sm hover:scale-[1.02] transition-all flex flex-col justify-between min-h-[160px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${themes[color]}`}><Icon size={18} /></div>
        </div>
        <div className="flex flex-col">
          <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tighter truncate">{value}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">{context}</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
