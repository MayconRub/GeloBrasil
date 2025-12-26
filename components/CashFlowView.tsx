
import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  BarChart3,
  Clock,
  ShieldCheck,
  Zap
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
import { Sale, Expense, ExpenseStatus } from '../types';

interface Props {
  sales: Sale[];
  expenses: Expense[];
}

const CashFlowView: React.FC<Props> = ({ sales, expenses }) => {
  const projectionData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Calcular Saldo Inicial (Todas as vendas - Todas as despesas pagas)
    const totalSales = sales.reduce((sum, s) => sum + s.value, 0);
    const paidExpenses = expenses
      .filter(e => e.status === ExpenseStatus.PAGO)
      .reduce((sum, e) => sum + e.value, 0);
    
    let currentBalance = totalSales - paidExpenses;

    // 2. Calcular Média de Vendas Diárias (Últimos 30 dias)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const recentSales = sales.filter(s => new Date(s.date + 'T00:00:00') >= thirtyDaysAgo);
    const avgDailyRevenue = recentSales.length > 0 
      ? recentSales.reduce((sum, s) => sum + s.value, 0) / 30 
      : 0;

    // 3. Gerar Projeção para os próximos 30 dias
    const data = [];
    let projectedBalance = currentBalance;
    let isRedZone = false;

    for (let i = 0; i <= 30; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      const dateStr = futureDate.toISOString().split('T')[0];

      // Entradas projetadas (exceto hoje que já pode ter venda real)
      if (i > 0) projectedBalance += avgDailyRevenue;

      // Saídas Reais (Contas a pagar agendadas para este dia)
      const dayExpenses = expenses
        .filter(e => e.dueDate === dateStr && e.status !== ExpenseStatus.PAGO)
        .reduce((sum, e) => sum + e.value, 0);
      
      projectedBalance -= dayExpenses;

      if (projectedBalance < 0) isRedZone = true;

      data.push({
        name: futureDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        saldo: Math.round(projectedBalance),
        rawDate: futureDate
      });
    }

    return { 
      chartData: data, 
      currentBalance, 
      projectedEndBalance: projectedBalance, 
      isRedZone,
      avgDailyRevenue 
    };
  }, [sales, expenses]);

  const criticalExpenses = useMemo(() => {
    return expenses
      .filter(e => e.status !== ExpenseStatus.PAGO)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [expenses]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full mb-2">
          <Zap size={12} className="text-indigo-600 fill-indigo-600" />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Previsibilidade Financeira</span>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Fluxo de Caixa <span className="text-indigo-600">Projetado</span></h2>
        <p className="text-slate-500 font-medium">Análise preditiva para os próximos 30 dias baseada em seu histórico.</p>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 text-slate-50 group-hover:scale-110 transition-transform duration-500">
            <Wallet size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Saldo Atual Disponível</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projectionData.currentBalance)}
            </h3>
            <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <CheckCircle2 size={14} /> Dinheiro em Caixa
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 text-white/5 group-hover:scale-110 transition-transform duration-500">
            <Calendar size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Expectativa em 30 Dias</p>
            <h3 className={`text-3xl font-black tracking-tighter ${projectionData.projectedEndBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projectionData.projectedEndBalance)}
            </h3>
            <div className={`mt-4 flex items-center gap-2 font-bold text-xs ${projectionData.projectedEndBalance >= projectionData.currentBalance ? 'text-emerald-400' : 'text-amber-400'}`}>
              {projectionData.projectedEndBalance >= projectionData.currentBalance ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              Variação de {Math.round((projectionData.projectedEndBalance / (projectionData.currentBalance || 1) - 1) * 100)}%
            </div>
          </div>
        </div>

        <div className={`p-8 rounded-[2rem] border shadow-sm flex flex-col justify-center ${projectionData.isRedZone ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
           <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${projectionData.isRedZone ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                {projectionData.isRedZone ? <AlertCircle size={28} /> : <ShieldCheck size={28} />}
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${projectionData.isRedZone ? 'text-rose-600' : 'text-emerald-600'}`}>Saúde Financeira</p>
                <h4 className={`text-xl font-black ${projectionData.isRedZone ? 'text-rose-900' : 'text-emerald-900'}`}>
                  {projectionData.isRedZone ? 'Atenção ao Caixa' : 'Operação Estável'}
                </h4>
              </div>
           </div>
           <p className={`mt-4 text-[11px] font-medium leading-relaxed ${projectionData.isRedZone ? 'text-rose-700' : 'text-emerald-700'}`}>
             {projectionData.isRedZone 
               ? 'Existem datas nos próximos 30 dias onde as despesas superam o saldo disponível. Revise seus prazos.' 
               : 'Com base na média de vendas, sua operação se manterá positiva durante todo o próximo mês.'}
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Projeção */}
        <div className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Visualização de Tendência</p>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Curva de Disponibilidade</h3>
            </div>
            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
               <span className="text-[9px] font-black text-slate-400 uppercase mr-2">Faturamento Médio:</span>
               <span className="text-xs font-black text-emerald-600">+{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projectionData.avgDailyRevenue)}/dia</span>
            </div>
          </div>

          <div className="h-72 sm:h-96 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData.chartData}>
                <defs>
                  <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
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
                  tickFormatter={(value) => `R$${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  formatter={(value: any) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Saldo Projetado']}
                />
                <Area 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorSaldo)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maiores Impactos */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Impactos no Caixa</h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Maiores contas a pagar</p>
          </div>

          <div className="space-y-4 flex-1">
            {criticalExpenses.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                 <CheckCircle2 size={48} className="mb-2" />
                 <p className="text-xs font-black uppercase tracking-widest">Tudo Pago!</p>
              </div>
            ) : (
              criticalExpenses.map(expense => (
                <div key={expense.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase truncate pr-4">{expense.description}</span>
                    <span className="text-xs font-black text-rose-500">
                      -{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.value)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-500">Vence {new Date(expense.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{expense.category}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Agendado</span>
               <span className="text-lg font-black text-slate-900">
                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(criticalExpenses.reduce((sum, e) => sum + e.value, 0))}
               </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowView;
