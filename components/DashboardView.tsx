
import React, { useMemo, useState } from 'react';
import { 
  TrendingUp,
  Snowflake,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Scale,
  Coins,
  Target,
  ArrowRight,
  Star,
  Activity,
  Receipt,
  Calendar,
  Clock,
  ArrowDownLeft,
  Trophy,
  PartyPopper,
  AlertCircle,
  AlertTriangle,
  BellRing
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
import { Sale, Expense, ExpenseStatus, ViewType, Production, AppSettings, MonthlyGoal } from '../types';

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

const DashboardView: React.FC<Props> = ({ sales, expenses, production, monthlyGoals, onSwitchView, expirationDate, onOpenPayment, settings }) => {
  const [period, setPeriod] = useState<PeriodType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getTodayLocal = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const today = getTodayLocal();
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleResetMonth = () => setSelectedDate(new Date());

  // Estatísticas computadas
  const stats = useMemo(() => {
    const dailySales = sales.filter(s => s.date === today).reduce((sum, s) => sum + s.value, 0);
    const dailyProd = production.filter(p => p.date === today).reduce((sum, p) => sum + p.quantityKg, 0);
    const dailyExpenses = expenses.filter(e => e.dueDate === today).reduce((sum, e) => sum + e.value, 0);

    const filteredSales = sales.filter(s => {
      const d = new Date(s.date + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const mSalesTotal = filteredSales.reduce((sum, s) => sum + s.value, 0);

    const filteredExpenses = expenses.filter(e => {
      const d = new Date(e.dueDate + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const mExpensesTotal = filteredExpenses.reduce((sum, e) => sum + e.value, 0);

    const mProdTotal = production.filter(p => {
      const d = new Date(p.date + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, p) => sum + p.quantityKg, 0);

    const mProfit = mSalesTotal - mExpensesTotal;
    const dProfit = dailySales - dailyExpenses;

    const upcoming = expenses
      .filter(e => e.status !== ExpenseStatus.PAGO)
      .sort((a, b) => {
        // Ordenação inteligente: Vencidos primeiro, depois por data
        const dateA = new Date(a.dueDate + 'T00:00:00').getTime();
        const dateB = new Date(b.dueDate + 'T00:00:00').getTime();
        return dateA - dateB;
      })
      .slice(0, 5);

    const chartData = [];
    if (period === 'daily') {
      const realNow = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(realNow.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const daySales = sales.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.value, 0);
        const dayExpenses = expenses.filter(e => e.dueDate === dateStr).reduce((sum, e) => sum + e.value, 0);
        const label = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
        chartData.push({
          name: label.charAt(0).toUpperCase() + label.slice(1),
          vendas: daySales,
          custos: dayExpenses
        });
      }
    } else {
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      for (let i = 1; i <= lastDayOfMonth; i++) {
        const d = new Date(currentYear, currentMonth, i);
        const dateStr = d.toISOString().split('T')[0];
        const daySales = sales.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.value, 0);
        const dayExpenses = expenses.filter(e => e.dueDate === dateStr).reduce((sum, e) => sum + e.value, 0);
        chartData.push({
          name: i.toString(),
          vendas: daySales,
          custos: dayExpenses
        });
      }
    }

    return { 
      dailySales, dailyProd, dailyExpenses, dProfit,
      mSalesTotal, mExpensesTotal, mProfit, mProdTotal, 
      upcoming, chartData 
    };
  }, [sales, expenses, production, today, currentMonth, currentYear, period]);

  // Metas Mensais
  const currentMonthlyGoals = useMemo(() => {
    const salesGoal = monthlyGoals.find(g => g.type === 'sales' && g.month === currentMonth && g.year === currentYear)?.value || settings.salesGoalMonthly || 60000;
    const prodGoal = monthlyGoals.find(g => g.type === 'production' && g.month === currentMonth && g.year === currentYear)?.value || settings.productionGoalMonthly || 30000;
    return {
      sales: salesGoal,
      prod: prodGoal
    };
  }, [monthlyGoals, currentMonth, currentYear, settings]);

  const activeStats = period === 'daily' ? {
    sales: stats.dailySales,
    prod: stats.dailyProd,
    expenses: stats.dailyExpenses,
    profit: stats.dProfit,
    labelSuffix: 'HOJE'
  } : {
    sales: stats.mSalesTotal,
    prod: stats.mProdTotal,
    expenses: stats.mExpensesTotal,
    profit: stats.mProfit,
    labelSuffix: `EM ${monthName.toUpperCase()}`
  };

  const salesProgress = Math.min(100, (stats.mSalesTotal / (currentMonthlyGoals.sales || 1)) * 100) || 0;
  const prodProgress = Math.min(100, (stats.mProdTotal / (currentMonthlyGoals.prod || 1)) * 100) || 0;
  const anyGoalMet = salesProgress >= 100 || prodProgress >= 100;

  const getDueDateLabel = (dueDate: string) => {
    if (dueDate < today) return { text: 'VENCIDO', color: 'bg-rose-600 text-white shadow-lg shadow-rose-900/50', icon: true };
    if (dueDate === today) return { text: 'HOJE', color: 'bg-amber-500 text-white', icon: false };
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    if (dueDate === tomorrowStr) return { text: 'AMANHÃ', color: 'bg-sky-400 text-white', icon: false };
    return { text: new Date(dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), color: 'bg-white/10 text-white/60', icon: false };
  };

  const showRenewalBanner = useMemo(() => {
    if (!expirationDate) return false;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate + 'T00:00:00');
    const diffTime = expDate.getTime() - todayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }, [expirationDate]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      
      {/* Banner de Parabéns */}
      {anyGoalMet && (
        <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 p-5 sm:p-6 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl shadow-amber-100 animate-in zoom-in-95 duration-500">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md animate-bounce">
              <Trophy size={28} className="text-white sm:w-8 sm:h-8" />
            </div>
            <div>
              <h4 className="font-black text-sm sm:text-xl uppercase tracking-tighter leading-none">
                PARABÉNS! META ALCANÇADA! 🚀
              </h4>
              <p className="text-white/80 text-[10px] sm:text-xs font-bold mt-1">
                Sua operação atingiu os objetivos mensais em {monthName}. Continue o excelente trabalho! 🏆
              </p>
            </div>
          </div>
          <div className="hidden sm:block">
            <PartyPopper size={48} className="opacity-40 -rotate-12" />
          </div>
        </div>
      )}

      {showRenewalBanner && !anyGoalMet && (
        <div className="bg-sky-50 p-4 rounded-[2.5rem] border border-sky-100 flex items-center justify-between shadow-inner animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sky-500 shadow-sm">
              <Star size={20} className="fill-sky-500" />
            </div>
            <div>
              <h4 className="font-black text-sky-900 text-[9px] uppercase tracking-[0.2em]">SISTEMA EM PERÍODO DE RENOVAÇÃO</h4>
              <p className="text-sky-600/70 text-[10px] font-bold">Vencimento em: <span className="text-sky-900 font-black">{new Date(expirationDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span></p>
            </div>
          </div>
          <button 
            onClick={onOpenPayment}
            className="bg-sky-600 text-white px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-sky-700 transition-all shadow-md active:scale-95"
          >
            <Activity size={14} /> RENOVAR AGORA
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-sky-900 tracking-tighter leading-none">Minha <span className="text-sky-500">Operação</span></h2>
          <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mt-2">Controle de Vendas & Produção</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
            <button onClick={handlePrevMonth} className="flex-1 sm:flex-none p-2.5 hover:bg-sky-50 rounded-xl text-slate-400 transition-all active:scale-90"><ChevronLeft size={18} /></button>
            <button onClick={handleResetMonth} className="flex-[3] sm:flex-none px-4 py-1 flex flex-col items-center justify-center hover:bg-sky-50 rounded-xl transition-all min-w-[130px]">
              <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest mb-0.5">Mês de Referência</span>
              <span className="text-xs font-black text-sky-900 capitalize text-center">{monthName}</span>
            </button>
            <button onClick={handleNextMonth} className="flex-1 sm:flex-none p-2.5 hover:bg-sky-50 rounded-xl text-slate-400 transition-all active:scale-90"><ChevronRight size={18} /></button>
          </div>

          <div className="flex p-1 bg-white border border-sky-100 rounded-2xl shadow-sm">
            <button 
              onClick={() => { setPeriod('daily'); }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${period === 'daily' ? 'bg-sky-600 text-white shadow-lg' : 'text-sky-300 hover:bg-sky-50'}`}
            >
              <Clock size={14} /> Hoje
            </button>
            <button 
              onClick={() => setPeriod('monthly')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${period === 'monthly' ? 'bg-sky-600 text-white shadow-lg' : 'text-sky-300 hover:bg-sky-50'}`}
            >
              <Calendar size={14} /> Mensal
            </button>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${period === 'daily' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 sm:gap-6`}>
        {/* Card Vendas */}
        <div className={`${salesProgress >= 100 ? 'bg-gradient-to-br from-teal-500 to-teal-700 shadow-teal-100' : 'ice-card-teal shadow-teal-100'} p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3.5rem] text-white relative overflow-hidden group transition-all duration-500 shadow-xl`}>
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <TrendingUp size={120} className="absolute bottom-[-20px] right-[-20px] opacity-10 rotate-12" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-1 opacity-60">
              <TrendingUp size={16} />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">VENDAS {activeStats.labelSuffix}</span>
            </div>
            
            <h3 className="text-4xl sm:text-5xl font-black tracking-tighter">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(activeStats.sales)}
            </h3>

            <div className="mt-6 space-y-3">
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${salesProgress >= 100 ? 'bg-amber-400' : 'bg-white'} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)]`}
                  style={{ width: `${salesProgress}%` }}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className={`inline-flex items-center self-start gap-2 px-3 py-1 ${salesProgress >= 100 ? 'bg-amber-400 text-teal-900' : 'bg-white/20 text-white'} rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest backdrop-blur-md`}>
                  <Target size={12} /> {salesProgress >= 100 ? `META MENSAL ALCANÇADA` : `${salesProgress.toFixed(0)}% da meta mensal`}
                </div>
                <span className="text-[8px] sm:text-[9px] font-black opacity-60 uppercase">Meta Mensal: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(currentMonthlyGoals.sales)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Produção */}
        <div className={`${prodProgress >= 100 ? 'bg-gradient-to-br from-sky-600 to-indigo-800 shadow-sky-100' : 'ice-card-blue shadow-sky-100'} p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3.5rem] text-white relative overflow-hidden group transition-all duration-500 shadow-xl`}>
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <Snowflake size={120} className="absolute bottom-[-20px] right-[-20px] opacity-10 -rotate-12" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-1 opacity-60">
              <Snowflake size={16} />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">PRODUÇÃO {activeStats.labelSuffix}</span>
            </div>
            
            <h3 className="text-4xl sm:text-5xl font-black tracking-tighter">
              {activeStats.prod.toLocaleString('pt-BR')} <span className="text-xl sm:text-2xl opacity-60">KG</span>
            </h3>

            <div className="mt-6 space-y-3">
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${prodProgress >= 100 ? 'bg-amber-400' : 'bg-white'} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)]`}
                  style={{ width: `${prodProgress}%` }}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className={`inline-flex items-center self-start gap-2 px-3 py-1 ${prodProgress >= 100 ? 'bg-amber-400 text-sky-900' : 'bg-white/20 text-white'} rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest backdrop-blur-md`}>
                  <Target size={12} /> {prodProgress >= 100 ? 'META MENSAL ALCANÇADA' : `${prodProgress.toFixed(0)}% da meta mensal`}
                </div>
                <span className="text-[8px] sm:text-[9px] font-black opacity-60 uppercase">Meta Mensal: {currentMonthlyGoals.prod.toLocaleString('pt-BR')} KG</span>
              </div>
            </div>
          </div>
        </div>

        {period === 'daily' && (
          <div className="bg-rose-500 p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3.5rem] text-white relative overflow-hidden group shadow-xl shadow-rose-100/50 animate-in zoom-in-95 duration-300">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            <ArrowDownLeft size={120} className="absolute bottom-[-20px] right-[-20px] opacity-10 rotate-45" />
            <div className="flex items-center gap-3 mb-1 opacity-60">
               <Receipt size={16} />
               <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">DESPESAS {activeStats.labelSuffix}</span>
            </div>
            <h3 className="text-4xl sm:text-5xl font-black tracking-tighter">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(activeStats.expenses)}
            </h3>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md cursor-pointer hover:bg-white/30 transition-all active:scale-95" onClick={() => onSwitchView('expenses')}>
              <Clock size={14} /> Ver Lançamentos
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        <div className="lg:col-span-2 ice-glass p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h4 className="text-xl sm:text-2xl font-black text-sky-900 tracking-tighter">Fluxo {period === 'daily' ? 'Semanal' : 'Mensal'}</h4>
              <p className="text-[9px] font-black text-sky-300 uppercase tracking-widest">{period === 'daily' ? 'Últimos 7 dias' : `Performance de ${monthName}`}</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                  <span className="text-[8px] font-black text-sky-400 uppercase">Vendas</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <span className="text-[8px] font-black text-rose-300 uppercase">Custos</span>
               </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0f2fe" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#bae6fd', fontSize: 9, fontWeight: 900}} 
                  dy={10} 
                  interval={period === 'monthly' ? 5 : 0}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#bae6fd', fontSize: 9, fontWeight: 900}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontWeight: '900', fontSize: '10px' }}
                  formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                />
                <Area type="monotone" dataKey="vendas" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorVendas)" />
                <Area type="monotone" dataKey="custos" stroke="#f43f5e" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* UPGRADED: Card de Próximas Contas com Alertas de Vencimento */}
        <div className="bg-gradient-to-br from-[#0c1b3d] to-[#1e3a8a] p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] text-white shadow-2xl flex flex-col relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-sky-500/10 rounded-full blur-3xl transition-all duration-700 group-hover:bg-sky-500/20"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h4 className="text-xl sm:text-2xl font-black tracking-tighter leading-none">Status de <span className="text-sky-400">Contas</span></h4>
              <p className="text-[9px] font-black text-sky-400/60 uppercase tracking-[0.2em] mt-2">Visão de Vencimentos</p>
            </div>
            <button 
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 shadow-lg border border-white/5" 
              onClick={() => onSwitchView('expenses')}
            >
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="space-y-3.5 flex-1 relative z-10 overflow-y-auto no-scrollbar pr-1">
            {stats.upcoming.length === 0 ? (
              <div className="h-full py-12 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-sky-400/30">
                    <AlertCircle size={32} />
                 </div>
                 <p className="text-[10px] font-black uppercase text-sky-400/40 tracking-widest">Fluxo Limpo!</p>
                 <p className="text-[9px] text-white/30 mt-1 font-bold">Nenhuma conta pendente.</p>
              </div>
            ) : (
              stats.upcoming.map(item => {
                const label = getDueDateLabel(item.dueDate);
                const isOverdue = item.dueDate < today;
                
                return (
                  <div key={item.id} className={`p-4 rounded-[1.8rem] border transition-all cursor-pointer group/item flex items-center justify-between ${isOverdue ? 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-transform group-hover/item:scale-110 ${isOverdue ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-white/5 text-sky-400 border-white/10'}`}>
                        {isOverdue ? <BellRing size={20} className="animate-pulse" /> : <Receipt size={20} />}
                      </div>
                      <div className="min-w-0">
                        <h5 className={`text-[11px] font-black tracking-tight uppercase truncate max-w-[120px] leading-none mb-2 ${isOverdue ? 'text-rose-100' : 'text-white'}`}>{item.description}</h5>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest ${label.color}`}>
                           {label.icon && <AlertTriangle size={8} />}
                           {label.text}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-black text-xs sm:text-sm block leading-none ${isOverdue ? 'text-rose-400' : 'text-sky-300'}`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(item.value)}
                      </span>
                      <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter mt-1 block">{item.category}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {stats.upcoming.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10 text-center relative z-10">
               <button 
                onClick={() => onSwitchView('expenses')}
                className="text-[9px] font-black text-sky-400/60 uppercase tracking-[0.2em] hover:text-sky-400 transition-colors"
               >
                 Ver todas as despesas
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
