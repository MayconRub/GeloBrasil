
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
  AlertTriangle
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Sale, Expense, ExpenseStatus, ViewType } from '../types';

interface Props {
  sales: Sale[];
  expenses: Expense[];
  onSwitchView: (view: ViewType) => void;
}

const DashboardView: React.FC<Props> = ({ sales, expenses, onSwitchView }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const getTodayLocal = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const today = getTodayLocal();
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const handlePrevMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleResetMonth = () => {
    setSelectedDate(new Date());
  };

  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const stats = useMemo(() => {
    const todaySales = sales.filter(s => s.date === today).reduce((sum, s) => sum + s.value, 0);
    const monthSales = sales.filter(s => {
      const d = new Date(s.date + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, s) => sum + s.value, 0);

    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.dueDate + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, e) => sum + e.value, 0);

    const overdueCount = expenses.filter(e => e.status === ExpenseStatus.VENCIDO).length;
    const overdueValue = expenses.filter(e => e.status === ExpenseStatus.VENCIDO).reduce((sum, e) => sum + e.value, 0);
    const netProfit = monthSales - monthExpenses;

    return { todaySales, monthSales, monthExpenses, overdueValue, overdueCount, netProfit };
  }, [sales, expenses, today, currentMonth, currentYear]);

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
        name: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        vendas: daySales,
        despesas: dayExpenses
      });
    }
    return data;
  }, [sales, expenses, currentMonth, currentYear]);

  // Filtra e ordena as próximas contas (pendentes e vencidas)
  const nextBills = useMemo(() => {
    return expenses
      .filter(e => e.status !== ExpenseStatus.PAGO)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 10);
  }, [expenses]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight lg:text-4xl">Painel de Controle</h2>
          <p className="text-[15px] text-slate-500 font-medium mt-1">Visão estratégica do seu negócio em tempo real.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-1 shadow-sm w-full sm:w-auto">
            <button onClick={handlePrevMonth} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-all active:scale-90 shrink-0">
              <ChevronLeft size={20} />
            </button>
            <button onClick={handleResetMonth} className="flex-1 px-4 py-1.5 flex flex-col items-center justify-center hover:bg-slate-50 rounded-xl transition-all min-w-[120px]">
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-0.5 text-center">Mês de Análise</span>
              <span className="text-sm font-bold text-slate-800 capitalize leading-tight text-center">{monthName}</span>
            </button>
            <button onClick={handleNextMonth} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-all active:scale-90 shrink-0">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          title="VENDAS HOJE" 
          value={stats.todaySales} 
          icon={<ArrowUpRight size={24} className="text-emerald-500" />} 
          color="bg-emerald-50"
          subtitle="Entradas confirmadas"
        />
        <StatCard 
          title="DESPESAS (MÊS)" 
          value={stats.monthExpenses} 
          icon={<ArrowDownLeft size={24} className="text-rose-500" />} 
          color="bg-rose-50"
          subtitle="Total acumulado"
        />
        <StatCard 
          title="SALDO LÍQUIDO" 
          value={stats.netProfit} 
          icon={<Scale size={24} className={stats.netProfit >= 0 ? "text-indigo-500" : "text-rose-500"} />} 
          color={stats.netProfit >= 0 ? "bg-indigo-50" : "bg-rose-50"}
          subtitle="Resultado operacional"
          isProfit={true}
        />
        <StatCard 
          title="CONTAS VENCIDAS" 
          value={stats.overdueValue} 
          icon={<AlertCircle size={24} className="text-rose-500" />} 
          color="bg-rose-50"
          subtitle={`${stats.overdueCount} faturas em atraso`}
          isAlert={stats.overdueCount > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Desempenho Semanal */}
        <div className="lg:col-span-2 bg-white p-5 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.2em]">Desempenho Semanal</h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gastos</span>
              </div>
            </div>
          </div>
          
          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
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
                  cursor={{stroke: '#e2e8f0', strokeWidth: 2}}
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '12px 16px'}} 
                  itemStyle={{fontSize: '12px', fontWeight: '800'}}
                  labelStyle={{fontSize: '10px', fontWeight: '900', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase'}}
                  formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                />
                <Area type="monotone" dataKey="vendas" stroke="#10b981" strokeWidth={5} fill="#10b981" fillOpacity={0.08} />
                <Area type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={5} fill="#ef4444" fillOpacity={0.08} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Faturas Críticas */}
        <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.2em]">Próximas Contas</h3>
            <button onClick={() => onSwitchView('expenses')} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:text-indigo-800 transition-colors">Ver Todas</button>
          </div>
          
          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1 custom-scrollbar">
            {nextBills.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 py-12">
                <FileText size={56} className="mb-4 text-slate-300" strokeWidth={1} />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Tudo em dia!</p>
              </div>
            ) : (
              nextBills.map(expense => {
                const isOverdue = expense.dueDate < today;
                const isToday = expense.dueDate === today;
                
                // Estilos base para contas normais (a vencer) - Agora em Azul Claro (Sky)
                let itemClass = "bg-sky-50 border-sky-100 hover:border-sky-300 text-sky-600";
                let iconClass = "bg-sky-100 border-sky-200 text-sky-600";
                let badgeClass = "text-sky-500 font-bold";
                let Icon = Receipt;

                if (isOverdue) {
                  itemClass = "bg-rose-50 border-rose-100 hover:border-rose-300 text-rose-600";
                  iconClass = "bg-rose-100 border-rose-200 text-rose-600";
                  badgeClass = "text-rose-500 font-black";
                  Icon = AlertTriangle;
                } else if (isToday) {
                  itemClass = "bg-amber-50 border-amber-100 hover:border-amber-300 text-amber-600";
                  iconClass = "bg-amber-100 border-amber-200 text-amber-600";
                  badgeClass = "text-amber-500 font-black";
                  Icon = Clock;
                }

                return (
                  <div key={expense.id} className={`flex items-center justify-between p-4 rounded-3xl border transition-all cursor-default group ${itemClass}`}>
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className={`w-11 h-11 shrink-0 rounded-2xl border flex items-center justify-center transition-colors ${iconClass}`}>
                        <Icon size={20} />
                      </div>
                      <div className="truncate">
                        <p className={`text-sm font-bold truncate leading-snug ${isOverdue ? 'text-rose-900' : isToday ? 'text-amber-900' : 'text-sky-900'}`}>
                          {expense.description}
                        </p>
                        <p className={`text-[9px] font-black uppercase tracking-wider mt-0.5 ${badgeClass}`}>
                          {isOverdue ? 'Atrasado' : isToday ? 'Vence Hoje' : `Vence em ${new Date(expense.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <p className={`text-sm font-black whitespace-nowrap`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.value)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, subtitle, isAlert, isProfit }: any) => (
  <div className={`p-6 lg:p-7 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 shadow-inner ring-8 ring-white transition-transform group-hover:scale-110`}>
      {icon}
    </div>
    {isAlert && <div className="absolute top-8 right-8 w-3 h-3 bg-rose-500 rounded-full animate-ping"></div>}
    {isAlert && <div className="absolute top-8 right-8 w-3 h-3 bg-rose-500 rounded-full border-4 border-white"></div>}
    
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
    <h4 className={`text-2xl lg:text-3xl font-black leading-tight ${isProfit && value < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
    </h4>
    <p className="text-[11px] text-slate-400 font-bold mt-3 border-t border-slate-50 pt-3 flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
      {subtitle}
    </p>
  </div>
);

export default DashboardView;
