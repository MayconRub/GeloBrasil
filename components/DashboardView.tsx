
import React, { useMemo, useState } from 'react';
import { 
  TrendingUp,
  Snowflake,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Receipt,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  Plus,
  DollarSign,
  ArrowUpRight,
  Calculator,
  Bell,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
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
  onUpdateSale?: (sale: Sale) => void;
}

type PeriodType = 'daily' | 'monthly';

const DashboardView: React.FC<Props> = ({ sales, expenses, production, monthlyGoals, onSwitchView, settings, onUpdateSale }) => {
  const [period, setPeriod] = useState<PeriodType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const stats = useMemo(() => {
    // Totais de Hoje (Diário)
    const dSales = sales.filter(s => s.date === todayStr).reduce((sum, s) => sum + (s.value || 0), 0);
    const dProd = production.filter(p => p.date === todayStr).reduce((sum, p) => sum + (p.quantityKg || 0), 0);
    const dExp = expenses.filter(e => e.dueDate === todayStr).reduce((sum, e) => sum + (e.value || 0), 0);

    // Totais do Mês Selecionado (Mensal)
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

    // Totais Ativos com base no Period selecionado
    const activeSales = period === 'daily' ? dSales : mSalesTotal;
    const activeProd = period === 'daily' ? dProd : mProdTotal;
    const activeExp = period === 'daily' ? dExp : mExpTotal;

    // Dados para o Gráfico Semanal (Últimos 7 dias)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const daySales = sales.filter(s => s.date === dStr).reduce((sum, s) => sum + (s.value || 0), 0);
      const dayExp = expenses.filter(e => e.dueDate === dStr).reduce((sum, e) => sum + (e.value || 0), 0);
      
      chartData.push({
        name: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase(),
        vendas: daySales,
        custos: dayExp
      });
    }

    // Status de Contas (Pendentes/Vencidas)
    const pendingExpenses = expenses
      .filter(e => e.status !== ExpenseStatus.PAGO)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);

    return { 
      activeSales, activeProd, activeExp, 
      mSalesTotal, mProdTotal, 
      mGoalSales, mGoalProd,
      chartData,
      pendingExpenses
    };
  }, [sales, expenses, production, todayStr, currentMonth, currentYear, monthlyGoals, settings, period]);

  const salesProgress = Math.min(100, (stats.mSalesTotal / stats.mGoalSales) * 100);
  const prodProgress = Math.min(100, (stats.mProdTotal / stats.mGoalProd) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none flex items-center gap-2">
            Minha <span className="text-sky-500">Operação</span>
          </h2>
          <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em] mt-2">Visão Estratégica {period === 'daily' ? 'Diária' : 'Mensal'}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center bg-white p-1 rounded-2xl shadow-sm border border-slate-100 h-14">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><ChevronLeft size={20} /></button>
            <div className="px-4 text-center min-w-[160px]">
              <p className="text-[8px] font-black text-sky-400 uppercase tracking-widest">Mês de Referência</p>
              <p className="text-xs font-black text-slate-800 capitalize">{monthName}</p>
            </div>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><ChevronRight size={20} /></button>
          </div>

          <div className="flex p-1 bg-white border border-slate-100 rounded-2xl shadow-sm h-14">
            <button onClick={() => setPeriod('daily')} className={`px-8 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest flex items-center gap-2 ${period === 'daily' ? 'bg-sky-600 text-white shadow-lg shadow-sky-100' : 'text-slate-300 hover:text-sky-500'}`}>
              <Clock size={16} /> HOJE
            </button>
            <button onClick={() => setPeriod('monthly')} className={`px-8 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest flex items-center gap-2 ${period === 'monthly' ? 'bg-sky-600 text-white shadow-lg shadow-sky-100' : 'text-slate-300 hover:text-sky-500'}`}>
              <Calendar size={16} /> MENSAL
            </button>
          </div>
        </div>
      </header>

      {/* ROW DE CARDS COLORIDOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* VENDAS (TEAL) */}
        <div className="ice-card-teal p-8 rounded-[2.5rem] text-white relative overflow-hidden h-64 flex flex-col justify-between">
           <TrendingUp className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10" />
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Vendas {period === 'daily' ? 'Hoje' : 'no Mês'}</p>
              <h3 className="text-5xl font-black tracking-tighter">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.activeSales)}
              </h3>
           </div>
           
           <div className="space-y-3">
              <div className="h-8 bg-black/10 rounded-xl flex items-center px-4 justify-between border border-white/10">
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center"><CheckCircle2 size={10} /></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">{salesProgress.toFixed(0)}% da meta</span>
                 </div>
                 <span className="text-[9px] font-black uppercase opacity-60">Meta: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.mGoalSales)}</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                 <div className="h-full bg-white transition-all duration-1000" style={{ width: `${salesProgress}%` }}></div>
              </div>
           </div>
        </div>

        {/* PRODUÇÃO (BLUE) */}
        <div className="ice-card-blue p-8 rounded-[2.5rem] text-white relative overflow-hidden h-64 flex flex-col justify-between">
           <Snowflake className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10" />
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Produção {period === 'daily' ? 'Hoje' : 'no Mês'}</p>
              <h3 className="text-5xl font-black tracking-tighter">
                {stats.activeProd.toLocaleString()} <span className="text-2xl opacity-50">KG</span>
              </h3>
           </div>
           
           <div className="space-y-3">
              <div className="h-8 bg-black/10 rounded-xl flex items-center px-4 justify-between border border-white/10">
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center"><CheckCircle2 size={10} /></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">{prodProgress.toFixed(0)}% da meta</span>
                 </div>
                 <span className="text-[9px] font-black uppercase opacity-60">Meta: {stats.mGoalProd.toLocaleString()} KG</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                 <div className="h-full bg-white transition-all duration-1000" style={{ width: `${prodProgress}%` }}></div>
              </div>
           </div>
        </div>

        {/* DESPESAS (RED) */}
        <div className="bg-[#f43f5e] p-8 rounded-[2.5rem] text-white relative overflow-hidden h-64 flex flex-col justify-between shadow-xl shadow-rose-100">
           <Receipt className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10" />
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Custos {period === 'daily' ? 'Hoje' : 'no Mês'}</p>
              <h3 className="text-5xl font-black tracking-tighter">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.activeExp)}
              </h3>
           </div>
           
           <button 
             onClick={() => onSwitchView('expenses')}
             className="w-fit h-12 px-6 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all"
           >
              <Receipt size={16} /> Ver Fluxo
           </button>
        </div>
      </div>

      {/* GRÁFICO E STATUS DE CONTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-h-[450px]">
           <div className="flex items-center justify-between mb-10">
              <div>
                 <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Fluxo Semanal</h3>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Comparativo de 7 dias</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Vendas</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Custos</span>
                 </div>
              </div>
           </div>

           <div className="h-[300px] w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={stats.chartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#cbd5e1'}} />
                    <YAxis hide />
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="vendas" stroke="#0ea5e9" strokeWidth={4} fill="url(#colorSales)" />
                    <Area type="monotone" dataKey="custos" stroke="#f43f5e" strokeWidth={4} fill="transparent" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-4 bg-[#1e3a8a] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
           <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                 Contas <span className="text-sky-400">Vincendas</span>
              </h3>
              <button onClick={() => onSwitchView('expenses')} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                 <ArrowRight size={20} />
              </button>
           </div>
           
           <div className="space-y-4 flex-1 relative z-10">
              {stats.pendingExpenses.length > 0 ? (stats.pendingExpenses.map(exp => (
                 <div key={exp.id} className="p-5 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 flex items-center justify-between group hover:bg-white/20 transition-all">
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${exp.status === ExpenseStatus.VENCIDO ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          <Bell size={18} />
                       </div>
                       <div>
                          <p className="text-xs font-black uppercase tracking-tight truncate max-w-[120px]">{exp.description}</p>
                          <div className={`mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[7px] font-black uppercase ${exp.status === ExpenseStatus.VENCIDO ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
                             {exp.status}
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black text-sky-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(exp.value)}</p>
                    </div>
                 </div>
              ))) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center py-10">
                   <CheckCircle2 size={40} className="mb-2 mx-auto" />
                   <p className="text-xs font-black uppercase">Tudo em dia!</p>
                </div>
              )}
           </div>

           <button 
             onClick={() => onSwitchView('expenses')}
             className="mt-10 w-full py-4 text-[9px] font-black uppercase tracking-[0.2em] border-t border-white/10 hover:text-sky-400 transition-colors relative z-10"
           >
              Ver Todas as Despesas
           </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
