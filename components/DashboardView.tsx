
import React, { useMemo, useState } from 'react';
import { 
  AlertCircle, 
  Receipt,
  ChevronLeft,
  ChevronRight,
  Scale,
  Clock,
  Snowflake,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Megaphone,
  Bell,
  BarChart3,
  Zap,
  QrCode,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Activity,
  Target,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  CircleDollarSign,
  Coins
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
  dashboardNotice?: string;
  expirationDate?: string;
  onSwitchView: (view: ViewType) => void;
  onOpenPayment?: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 backdrop-blur-xl border border-white/10 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 ring-1 ring-white/5">
        <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 sm:mb-4 border-b border-white/5 pb-2">{label}</p>
        <div className="space-y-3 sm:space-y-4">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6 sm:gap-10">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ backgroundColor: entry.color }}></div>
                <span className="text-[9px] sm:text-[10px] font-black text-white/80 uppercase tracking-tight">{entry.name}</span>
              </div>
              <span className="text-[10px] sm:text-xs font-black text-white font-mono">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const DashboardView: React.FC<Props> = ({ sales, expenses, production, hiddenViews, dashboardNotice, expirationDate, onSwitchView, onOpenPayment }) => {
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

  const daysUntilExpiration = useMemo(() => {
    if (!expirationDate) return null;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate + 'T00:00:00');
    const diffTime = expDate.getTime() - todayDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [expirationDate]);

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

  const showSales = !hiddenViews.includes('sales');
  const showProduction = !hiddenViews.includes('production');
  const showExpenses = !hiddenViews.includes('expenses');

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-10 sm:pb-20 relative">
      
      {/* Background Decorativo */}
      <div className="absolute top-0 left-1/4 w-40 h-40 sm:w-[500px] sm:h-[500px] bg-indigo-500/5 rounded-full blur-[60px] sm:blur-[120px] pointer-events-none -z-10"></div>

      {/* Alerta de Expiração */}
      {daysUntilExpiration !== null && daysUntilExpiration >= 0 && daysUntilExpiration <= 7 && (
        <div className="relative group no-print">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-[1.5rem] sm:rounded-[2rem] blur opacity-20 transition duration-1000"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl border border-white/50 px-5 py-5 sm:px-8 sm:py-6 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-8 overflow-hidden">
            <div className="flex items-center gap-4 sm:gap-6 relative z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl sm:rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
                <Sparkles size={24} className="sm:w-6 sm:h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-[9px] sm:text-xs mb-0.5">Renovação Pendente</h4>
                <p className="text-slate-500 text-[10px] sm:text-sm font-medium leading-tight">
                  Expira em <span className="text-amber-600 font-black">{daysUntilExpiration === 0 ? 'horas' : `${daysUntilExpiration}d`}</span>. 
                  Regularize seu acesso.
                </p>
              </div>
            </div>
            <button 
              onClick={() => onOpenPayment ? onOpenPayment() : onSwitchView('admin')}
              className="w-full md:w-auto bg-slate-900 text-white px-6 h-12 sm:h-14 rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <QrCode size={16} /> Renovar
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-8">
        <div className="space-y-1 sm:space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
             <span className="text-[8px] sm:text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Visão Geral</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-none">Minha <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">Operação</span></h2>
        </div>
        
        <div className="flex items-center bg-white/80 backdrop-blur-md border border-slate-200 rounded-[1.5rem] sm:rounded-[2rem] p-1 shadow-lg shadow-slate-200/30 w-full sm:w-auto">
          <button onClick={handlePrevMonth} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 active:scale-90"><ChevronLeft size={18} /></button>
          <button onClick={handleResetMonth} className="flex-1 px-4 py-1 flex flex-col items-center">
            <span className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-widest truncate">{monthName}</span>
          </button>
          <button onClick={handleNextMonth} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 active:scale-90"><ChevronRight size={18} /></button>
        </div>
      </header>

      {/* Grid de Métricas Hero */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {showSales && (
          <HeroStatCard 
            title="Vendas Hoje"
            value={stats.todaySales}
            icon={<TrendingUp />}
            gradient="from-emerald-500 to-teal-600"
            isCurrency
          />
        )}
        {showProduction && (
          <HeroStatCard 
            title="Produção"
            value={stats.todayProd}
            icon={<Snowflake />}
            gradient="from-sky-500 to-indigo-600"
            suffix=" KG"
          />
        )}
        {showExpenses && stats.overdueCount > 0 && (
          <HeroStatCard 
            title="Pendências"
            value={stats.overdueValue}
            icon={<AlertCircle />}
            gradient="from-rose-500 to-pink-600"
            isCurrency
            isAlert
            onClick={() => onSwitchView('expenses')}
          />
        )}
      </section>

      {/* Grid Secundário */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {showSales && (
          <GlassStatCard 
            title="Total Vendas" 
            value={stats.monthSales} 
            icon={<Coins className="text-indigo-500" />} 
            isCurrency
          />
        )}
        {showExpenses && (
          <GlassStatCard 
            title="Total Custos" 
            value={stats.monthExpenses} 
            icon={<ArrowDownLeft className="text-rose-500" />} 
            isCurrency
          />
        )}
        {(showSales || showExpenses) && (
          <GlassStatCard 
            title="Lucro" 
            value={stats.netProfit} 
            icon={<Scale className={stats.netProfit >= 0 ? "text-emerald-500" : "text-rose-500"} />} 
            isCurrency
          />
        )}
        {showProduction && (
          <GlassStatCard 
            title="Mês (KG)" 
            value={stats.monthProd} 
            icon={<Target className="text-sky-500" />} 
            suffix=" KG"
          />
        )}
      </div>

      {/* Analytics Center */}
      <div className={`grid grid-cols-1 ${showExpenses ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6 sm:gap-8`}>
        <div className={`${showExpenses ? 'lg:col-span-2' : ''} bg-white/60 backdrop-blur-3xl p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-white shadow-xl relative overflow-hidden group`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-10 relative z-10">
            <div>
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">Analytics</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter">Fluxo Operacional</h3>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white/80 rounded-2xl border border-slate-100 self-start sm:self-auto">
              {showSales && <ChartLegend color="#6366f1" label="Vendas" />}
              {showExpenses && <ChartLegend color="#f43f5e" label="Custos" />}
            </div>
          </div>
          
          <div className="h-56 sm:h-[350px] w-full relative z-10 -ml-4 sm:ml-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="premiumSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="premiumExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 800}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 800}} />
                <Tooltip content={<CustomTooltip />} cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}} />
                {showSales && <Area type="monotone" dataKey="vendas" stroke="#6366f1" strokeWidth={4} fill="url(#premiumSales)" activeDot={{ r: 6 }} />}
                {showExpenses && <Area type="monotone" dataKey="despesas" stroke="#f43f5e" strokeWidth={4} fill="url(#premiumExpenses)" activeDot={{ r: 6 }} />}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {showExpenses && (
          <div className="bg-slate-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6 sm:mb-8 relative z-10">
              <div>
                <p className="text-[8px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-0.5">Financial</p>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tighter">Próximos</h3>
              </div>
              <button onClick={() => onSwitchView('expenses')} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90">
                <ArrowRight size={18} />
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[300px] sm:max-h-none pr-1 custom-scrollbar relative z-10 flex-1">
              {expenses.filter(e => e.status !== ExpenseStatus.PAGO).length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center opacity-30 text-white">
                  <CheckCircle2 size={32} className="mb-2" />
                  <p className="text-[9px] font-black uppercase tracking-widest">Sem Pendências</p>
                </div>
              ) : (
                expenses
                  .filter(e => e.status !== ExpenseStatus.PAGO)
                  .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                  .slice(0, 6)
                  .map(expense => (
                    <DarkExpenseItem key={expense.id} expense={expense} today={today} />
                  ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de Card Hero
const HeroStatCard = ({ title, value, icon, gradient, isCurrency, suffix, isAlert, onClick }: any) => {
  return (
    <div 
      onClick={onClick}
      className={`relative group overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 sm:h-44 flex flex-col justify-center shadow-xl transition-all duration-500 ${onClick ? 'cursor-pointer hover:-translate-y-2 active:scale-95' : 'hover:-translate-y-1'}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-95`}></div>
      <div className="absolute top-0 right-0 p-4 sm:p-6 text-white/10 group-hover:scale-110 transition-transform duration-700">
        {React.cloneElement(icon, { size: window.innerWidth < 640 ? 60 : 80 })}
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[8px] sm:text-[10px] font-black text-white/70 uppercase tracking-[0.3em]">{title}</p>
          {isAlert && <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></div>}
        </div>
        <h4 className="text-xl sm:text-4xl font-black text-white tracking-tighter leading-none">
          {isCurrency 
            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
            : `${value.toLocaleString('pt-BR')}${suffix || ''}`}
        </h4>
        {onClick && (
          <p className="text-[7px] sm:text-[9px] font-black text-white/50 uppercase tracking-widest mt-2 sm:mt-4 hidden sm:block">
            Ver detalhes <ArrowRight size={10} className="inline ml-1" />
          </p>
        )}
      </div>
    </div>
  );
};

// Componente de Card Glass Slim
const GlassStatCard = ({ title, value, icon, isCurrency, suffix }: any) => {
  return (
    <div className="bg-white/70 backdrop-blur-xl p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[2rem] border border-white shadow-md hover:shadow-lg transition-all duration-500 group">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
           {React.cloneElement(icon, { size: window.innerWidth < 640 ? 16 : 18 })}
        </div>
        <div className="min-w-0">
          <p className="text-[7px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{title}</p>
        </div>
      </div>
      
      <h4 className="text-xs sm:text-xl font-black text-slate-900 tracking-tighter truncate">
        {isCurrency 
          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
          : `${value.toLocaleString('pt-BR')}${suffix || ''}`}
      </h4>
    </div>
  );
};

const DarkExpenseItem = ({ expense, today }: any) => {
  const isOverdue = expense.dueDate < today;
  const isToday = expense.dueDate === today;
  
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-white/5 border border-white/5 rounded-2xl sm:rounded-2xl hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-xl flex items-center justify-center shrink-0 border border-white/10 ${isOverdue ? 'bg-rose-500/10 text-rose-500' : isToday ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
          <Receipt size={window.innerWidth < 640 ? 16 : 18} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] font-black text-white/90 truncate mb-0.5">{expense.description}</p>
          <p className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest ${isOverdue ? 'text-rose-400' : 'text-slate-500'}`}>
             {isOverdue ? 'Vencido' : `Vence ${new Date(expense.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}`}
          </p>
        </div>
      </div>
      <div className="text-right ml-2 shrink-0">
        <p className="text-[10px] sm:text-xs font-black text-white tracking-tighter">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.value)}
        </p>
      </div>
    </div>
  );
};

const ChartLegend = ({ color, label }: any) => (
  <div className="flex items-center gap-1.5 sm:gap-2">
    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
    <span className="text-[7px] sm:text-[10px] font-black text-slate-500 uppercase tracking-tight">{label}</span>
  </div>
);

export default DashboardView;
