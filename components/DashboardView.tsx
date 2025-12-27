
import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, Snowflake, ChevronLeft, ChevronRight, Receipt, Calendar, Clock, BarChart3, CheckCircle2, Bell
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

type PeriodType = 'daily' | 'monthly';

const DashboardView: React.FC<Props> = ({ sales, expenses, production, monthlyGoals, onSwitchView, settings }) => {
  const [period, setPeriod] = useState<PeriodType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();

  const handlePrevMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const stats = useMemo(() => {
    const dSales = sales.filter(s => s.date === todayStr).reduce((sum, s) => sum + (s.value || 0), 0);
    const dProd = production.filter(p => p.date === todayStr).reduce((sum, p) => sum + (p.quantityKg || 0), 0);
    const dExp = expenses.filter(e => e.dueDate === todayStr).reduce((sum, e) => sum + (e.value || 0), 0);

    const mSalesTotal = sales.filter(s => {
      const d = new Date(s.date + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, s) => sum + (s.value || 0), 0);

    const mProdTotal = production.filter(p => {
      const d = new Date(p.date + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, p) => sum + (p.quantityKg || 0), 0);

    const mExpTotal = expenses.filter(e => {
        const d = new Date(e.dueDate + 'T00:00:00');
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, e) => sum + (e.value || 0), 0);

    const mGoalSales = monthlyGoals.find(g => g.type === 'sales' && g.month === currentMonth && g.year === currentYear)?.value || settings.salesGoalMonthly || 60000;
    const mGoalProd = monthlyGoals.find(g => g.type === 'production' && g.month === currentMonth && g.year === currentYear)?.value || settings.productionGoalMonthly || 30000;

    const activeSales = period === 'daily' ? dSales : mSalesTotal;
    const activeProd = period === 'daily' ? dProd : mProdTotal;
    const activeExp = period === 'daily' ? dExp : mExpTotal;

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      chartData.push({
        name: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase(),
        vendas: sales.filter(s => s.date === dStr).reduce((sum, s) => sum + (s.value || 0), 0),
        custos: expenses.filter(e => e.dueDate === dStr).reduce((sum, e) => sum + (e.value || 0), 0)
      });
    }

    const pendingExpenses = expenses
      .filter(e => e.status !== ExpenseStatus.PAGO)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);

    return { activeSales, activeProd, activeExp, mSalesTotal, mProdTotal, mGoalSales, mGoalProd, chartData, pendingExpenses };
  }, [sales, expenses, production, todayStr, currentMonth, currentYear, monthlyGoals, settings, period]);

  const salesProgress = Math.min(100, (stats.mSalesTotal / stats.mGoalSales) * 100);
  const prodProgress = Math.min(100, (stats.mProdTotal / stats.mGoalProd) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 uppercase">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none flex items-center gap-2">
            MINHA <span className="text-sky-500">OPERAÇÃO</span>
          </h2>
          <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em] mt-2">VISÃO ESTRATÉGICA {period === 'daily' ? 'DIÁRIA' : 'MENSAL'}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center bg-white p-1 rounded-2xl shadow-sm border border-slate-100 h-14">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><ChevronLeft size={20} /></button>
            <div className="px-4 text-center min-w-[160px]">
              <p className="text-[8px] font-black text-sky-400 uppercase tracking-widest">MÊS DE REFERÊNCIA</p>
              <p className="text-xs font-black text-slate-800 capitalize">{monthName}</p>
            </div>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><ChevronRight size={20} /></button>
          </div>
          <div className="flex p-1 bg-white border border-slate-100 rounded-2xl shadow-sm h-14">
            <button onClick={() => setPeriod('daily')} className={`px-8 rounded-xl text-[10px] font-black uppercase transition-all ${period === 'daily' ? 'bg-sky-600 text-white shadow-lg shadow-sky-100' : 'text-slate-300 hover:text-sky-500'}`}>HOJE</button>
            <button onClick={() => setPeriod('monthly')} className={`px-8 rounded-xl text-[10px] font-black uppercase transition-all ${period === 'monthly' ? 'bg-sky-600 text-white shadow-lg shadow-sky-100' : 'text-slate-300 hover:text-sky-500'}`}>MENSAL</button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title={`VENDAS ${period === 'daily' ? 'HOJE' : 'MÊS'}`} value={stats.activeSales} type="currency" progress={salesProgress} goal={stats.mGoalSales} color="teal" />
        <DashboardCard title={`PRODUÇÃO ${period === 'daily' ? 'HOJE' : 'MÊS'}`} value={stats.activeProd} unit="KG" progress={prodProgress} goal={stats.mGoalProd} color="blue" />
        <div className="bg-[#f43f5e] p-8 rounded-[2.5rem] text-white flex flex-col justify-between shadow-xl">
           <Receipt size={32} className="opacity-20 self-end" />
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">CUSTOS {period === 'daily' ? 'HOJE' : 'MÊS'}</p>
              <h3 className="text-5xl font-black tracking-tighter">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.activeExp)}</h3>
           </div>
           <button onClick={() => onSwitchView('expenses')} className="mt-4 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-2xl text-[10px] font-black transition-all">VER FLUXO</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-h-[450px]">
           <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-10">FLUXO SEMANAL</h3>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={stats.chartData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#cbd5e1'}} />
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none'}} />
                    <Area type="monotone" dataKey="vendas" stroke="#0ea5e9" strokeWidth={4} fill="#0ea5e922" />
                    <Area type="monotone" dataKey="custos" stroke="#f43f5e" strokeWidth={4} fill="transparent" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
        <div className="lg:col-span-4 bg-[#1e3a8a] p-10 rounded-[3rem] text-white shadow-2xl flex flex-col justify-between">
           <h3 className="text-2xl font-black tracking-tighter mb-8">CONTAS <span className="text-sky-400">VINCENDAS</span></h3>
           <div className="space-y-4 flex-1">
              {stats.pendingExpenses.map(exp => (
                 <div key={exp.id} className="p-5 bg-white/10 rounded-3xl border border-white/10 flex items-center justify-between">
                    <div>
                       <p className="text-xs font-black truncate max-w-[120px]">{exp.description.toUpperCase()}</p>
                       <span className={`text-[7px] font-black px-2 py-0.5 rounded-lg ${exp.status === ExpenseStatus.VENCIDO ? 'bg-rose-500' : 'bg-amber-500'}`}>{exp.status.toUpperCase()}</span>
                    </div>
                    <p className="text-xs font-black text-sky-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(exp.value)}</p>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, type, progress, goal, color, unit }: any) => (
  <div className={`ice-card-${color} p-8 rounded-[2.5rem] text-white flex flex-col justify-between h-64 shadow-xl`}>
     <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">{title}</p>
        <h3 className="text-5xl font-black tracking-tighter">
          {type === 'currency' ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value) : value.toLocaleString() + (unit ? ` ${unit}` : '')}
        </h3>
     </div>
     <div className="space-y-3">
        <div className="flex justify-between text-[9px] font-black uppercase opacity-60">
           <span>{progress.toFixed(0)}% DA META</span>
           <span>META: {type === 'currency' ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(goal) : goal.toLocaleString() + ` ${unit}`}</span>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white transition-all duration-1000" style={{ width: `${progress}%` }}></div></div>
     </div>
  </div>
);

export default DashboardView;
