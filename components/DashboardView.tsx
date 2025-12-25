
import React, { useMemo, useState } from 'react';
import { 
  AlertCircle, 
  Receipt,
  FileText,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  Clock,
  AlertTriangle,
  Snowflake,
  TrendingUp,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Sale, Expense, ExpenseStatus, ViewType, Production } from '../types';

interface Props {
  sales: Sale[];
  expenses: Expense[];
  production: Production[];
  hiddenViews: string[];
  onSwitchView: (view: ViewType) => void;
}

const DashboardView: React.FC<Props> = ({ sales, expenses, production, hiddenViews, onSwitchView }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const getTodayLocal = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const today = getTodayLocal();
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const handlePrevMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleResetMonth = () => setSelectedDate(new Date());

  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const stats = useMemo(() => {
    const filteredSales = sales.filter(s => {
      const d = new Date(s.date + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    
    const todaySales = sales.filter(s => s.date === today).reduce((sum, s) => sum + s.value, 0);
    const monthSales = filteredSales.reduce((sum, s) => sum + s.value, 0);

    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.dueDate + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, e) => sum + e.value, 0);

    const todayProd = production.filter(p => p.date === today).reduce((sum, p) => sum + p.quantityKg, 0);
    const monthProd = production.filter(p => {
      const d = new Date(p.date + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, p) => sum + p.quantityKg, 0);

    const overdueCount = expenses.filter(e => e.status === ExpenseStatus.VENCIDO).length;
    const overdueValue = expenses.filter(e => e.status === ExpenseStatus.VENCIDO).reduce((sum, e) => sum + e.value, 0);
    const netProfit = monthSales - monthExpenses;

    return { todaySales, monthSales, monthExpenses, overdueValue, overdueCount, netProfit, todayProd, monthProd };
  }, [sales, expenses, production, today, currentMonth, currentYear]);

  const chartData = useMemo(() => {
    const data = [];
    const isCurrentMonth = new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
    const endDate = isCurrentMonth ? new Date() : new Date(currentYear, currentMonth + 1, 0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(endDate);
      d.setDate(endDate.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const daySales = sales.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.value, 0);
      const dayExpenses = expenses.filter(e => e.dueDate === dateStr).reduce((sum, e) => sum + e.value, 0);
      data.push({
        name: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
        vendas: daySales,
        despesas: dayExpenses
      });
    }
    return data;
  }, [sales, expenses, currentMonth, currentYear]);

  // Seção de visibilidade dinâmica
  const showSales = !hiddenViews.includes('sales');
  const showProduction = !hiddenViews.includes('production');
  const showExpenses = !hiddenViews.includes('expenses');

  return (
    <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Status Geral</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter">Performance</h2>
          <p className="text-slate-400 font-medium mt-1 text-base sm:text-lg">Resultados de <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-0.5 rounded-full">{monthName}</span></p>
        </div>
        
        <div className="flex items-center bg-white border border-slate-200 rounded-[1.5rem] sm:rounded-[2rem] p-1 shadow-xl shadow-slate-200/50 w-full sm:w-auto overflow-hidden">
          <button onClick={handlePrevMonth} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-all active:scale-90"><ChevronLeft size={18} /></button>
          <button onClick={handleResetMonth} className="flex-1 px-4 py-2 flex flex-col items-center hover:bg-slate-50 rounded-xl transition-all min-w-[120px]">
            <span className="text-[11px] sm:text-sm font-black text-slate-900 capitalize tracking-tight whitespace-nowrap">{monthName}</span>
          </button>
          <button onClick={handleNextMonth} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-all active:scale-90"><ChevronRight size={18} /></button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-8">
        {showSales && (
          <StatCard 
            title="Vendas Hoje" 
            value={stats.todaySales} 
            icon={<ArrowUpRight size={20} />} 
            variant="emerald"
            subtitle="Geral"
            isCurrency
          />
        )}
        {showProduction && (
          <StatCard 
            title="Produção" 
            value={stats.todayProd} 
            icon={<Snowflake size={20} />} 
            variant="sky"
            subtitle="KG Hoje"
            suffix=" KG"
          />
        )}
        {showExpenses && (
          <StatCard 
            title="Saídas Mês" 
            value={stats.monthExpenses} 
            icon={<ArrowDownLeft size={20} />} 
            variant="rose"
            subtitle="Registrado"
            isCurrency
          />
        )}
        {(showSales || showExpenses) && (
          <StatCard 
            title="Lucro" 
            value={stats.netProfit} 
            icon={<Scale size={20} />} 
            variant={stats.netProfit >= 0 ? "indigo" : "rose"}
            subtitle="Líquido"
            isCurrency
          />
        )}
        {showExpenses && (
          <StatCard 
            title="Vencido" 
            value={stats.overdueValue} 
            icon={<AlertCircle size={20} />} 
            variant="amber"
            subtitle="A pagar"
            isCurrency
            isAlert={stats.overdueCount > 0}
            className="col-span-2 xl:col-span-1"
          />
        )}
      </div>

      <div className={`grid grid-cols-1 ${showExpenses ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8 sm:gap-10`}>
        <div className={`${showExpenses ? 'lg:col-span-2' : ''} bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <div>
              <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Tendências</h3>
              <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Fluxo Diário</p>
            </div>
            <div className="flex items-center gap-4 sm:gap-8 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 self-start sm:self-auto">
              {showSales && <LegendItem color="bg-emerald-500" label="Vendas" />}
              {showExpenses && <LegendItem color="bg-rose-500" label="Custos" />}
            </div>
          </div>
          
          <div className="h-64 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                />
                <Tooltip 
                  cursor={{stroke: '#e2e8f0', strokeWidth: 1}}
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.1)', padding: '15px'}} 
                  itemStyle={{fontSize: '11px', fontWeight: '800'}}
                />
                {showSales && <Area type="monotone" dataKey="vendas" stroke="#10b981" strokeWidth={3} fill="url(#colorSales)" />}
                {showExpenses && <Area type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={3} fill="url(#colorExpenses)" />}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {showExpenses && (
          <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Próximas</h3>
                <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Pendências</p>
              </div>
              <button onClick={() => onSwitchView('expenses')} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                <Calendar size={18} />
              </button>
            </div>
            
            <div className="space-y-3 overflow-y-auto max-h-[400px] sm:max-h-[500px] pr-1 custom-scrollbar">
              {expenses.filter(e => e.status !== ExpenseStatus.PAGO).length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20 opacity-20">
                  <CheckCircle2 size={40} className="text-slate-400 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Fluxo Limpo</p>
                </div>
              ) : (
                expenses
                  .filter(e => e.status !== ExpenseStatus.PAGO)
                  .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                  .slice(0, 8)
                  .map(expense => (
                    <ExpenseItem key={expense.id} expense={expense} today={today} />
                  ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, variant, subtitle, isAlert, isCurrency, suffix, className }: any) => {
  const colors: any = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', shadow: 'shadow-emerald-200/20' },
    sky: { bg: 'bg-sky-50', text: 'text-sky-600', shadow: 'shadow-sky-200/20' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', shadow: 'shadow-rose-200/20' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', shadow: 'shadow-indigo-200/20' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', shadow: 'shadow-amber-200/20' },
  };
  const color = colors[variant] || colors.indigo;

  return (
    <div className={`p-4 sm:p-7 bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-50 shadow-lg ${color.shadow} hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden ${className || ''}`}>
      <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-2xl sm:rounded-[1.5rem] ${color.bg} flex items-center justify-center mb-4 sm:mb-6 transition-transform group-hover:scale-110 duration-500`}>
        <div className={`${color.text}`}>{icon}</div>
      </div>
      
      {isAlert && <div className="absolute top-6 right-6 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white"></span></div>}
      
      <p className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">{title}</p>
      <h4 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tighter leading-none mb-3 truncate">
        {isCurrency 
          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
          : `${value.toLocaleString('pt-BR')}${suffix || ''}`}
      </h4>
      <div className="pt-3 border-t border-slate-50 flex items-center gap-1.5 overflow-hidden">
        <TrendingUp size={12} className={value >= 0 ? "text-emerald-500" : "text-rose-500"} />
        <span className="text-[9px] font-bold text-slate-400 truncate tracking-tight">{subtitle}</span>
      </div>
    </div>
  );
};

const ExpenseItem = ({ expense, today }: any) => {
  const isOverdue = expense.dueDate < today;
  const isToday = expense.dueDate === today;
  
  let statusClass = "bg-sky-50 text-sky-600 border-sky-100";
  if (isOverdue) statusClass = "bg-rose-50 text-rose-600 border-rose-100";
  if (isToday) statusClass = "bg-amber-50 text-amber-600 border-amber-100";

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-50 rounded-[1.5rem] sm:rounded-[2rem] hover:border-indigo-100 transition-all duration-300 group">
      <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl sm:rounded-[1.2rem] flex items-center justify-center border transition-colors ${statusClass}`}>
          <Receipt size={18} />
        </div>
        <div className="truncate">
          <p className="text-xs sm:text-sm font-black text-slate-800 truncate leading-tight mb-1">{expense.description}</p>
          <div className="flex items-center gap-2">
            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${statusClass}`}>
              {isOverdue ? 'Vencido' : isToday ? 'Hoje' : `Vence ${new Date(expense.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}`}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right ml-2 shrink-0">
        <p className="text-xs sm:text-base font-black text-slate-900 tracking-tighter">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.value)}
        </p>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }: any) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${color}`}></div>
    <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
  </div>
);

export default DashboardView;
