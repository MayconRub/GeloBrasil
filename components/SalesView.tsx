
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Pencil, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp,
  Calendar,
  Zap,
  DollarSign,
  ArrowUpRight,
  Clock,
  LayoutList,
  Target,
  Save,
  Check,
  Trophy,
  BarChart3,
  Printer,
  History,
  Award
} from 'lucide-react';
import { Sale, AppSettings, MonthlyGoal } from '../types';

interface Props {
  sales: Sale[];
  onUpdate: (sale: Sale) => void;
  onDelete: (id: string) => void;
  settings?: AppSettings;
  monthlyGoals: MonthlyGoal[];
  onUpdateMonthlyGoal: (goal: MonthlyGoal) => void;
}

const SalesView: React.FC<Props> = ({ sales, onUpdate, onDelete, settings, monthlyGoals, onUpdateMonthlyGoal }) => {
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [description, setDescription] = useState('Venda de Gelo');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const getWeekNumber = (d: Date) => {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const currentGoalValue = useMemo(() => {
    const goal = monthlyGoals.find(g => g.type === 'sales' && g.month === currentMonth && g.year === currentYear);
    return goal ? goal.value : settings?.salesGoalMonthly || 60000;
  }, [monthlyGoals, currentMonth, currentYear, settings?.salesGoalMonthly]);

  const [localMonthlyGoal, setLocalMonthlyGoal] = useState(currentGoalValue.toString());
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  useEffect(() => {
    setLocalMonthlyGoal(currentGoalValue.toString());
  }, [currentGoalValue, currentMonth, currentYear]);

  const handleValueChange = (val: string) => {
    const sanitized = val.replace(/[^0-9.,]/g, '').replace(',', '.');
    setValue(sanitized);
  };

  const handlePrevMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleResetMonth = () => setSelectedDate(new Date());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value);
    if (!description || isNaN(numericValue)) return;
    
    const saleData = { 
      id: editingId || crypto.randomUUID(), 
      description, 
      value: numericValue, 
      date 
    };
    
    onUpdate(saleData);
    resetForm();
  };

  const handleSaveGoal = async () => {
    setIsSavingGoal(true);
    const newValue = parseFloat(localMonthlyGoal);
    await onUpdateMonthlyGoal({
      type: 'sales',
      month: currentMonth,
      year: currentYear,
      value: isNaN(newValue) ? 0 : newValue
    });
    setTimeout(() => setIsSavingGoal(false), 800);
  };

  const handleEdit = (sale: Sale) => {
    if (confirm(`DESEJA ALTERAR O LANÇAMENTO DE VENDA "${sale.description}" NO VALOR DE R$ ${sale.value.toLocaleString('pt-BR')}?`)) {
      setEditingId(sale.id);
      setDescription(sale.description);
      setValue(sale.value.toString());
      setDate(sale.date);
      setShowReport(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = (sale: Sale) => {
    if (confirm(`ATENÇÃO: DESEJA REALMENTE EXCLUIR ESTE LANÇAMENTO DE VENDA ("${sale.description}")? ISSO AFETARÁ O SALDO E AS METAS DO MÊS.`)) {
      onDelete(sale.id);
    }
  };

  const resetForm = () => {
    setEditingId(null); 
    setDescription('Venda de Gelo'); 
    setValue(''); 
    setDate(getTodayString());
  };

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const d = new Date(s.date + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && s.description.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [sales, currentMonth, currentYear, searchTerm]);

  const totalSalesMonth = useMemo(() => filteredSales.reduce((sum, s) => sum + s.value, 0), [filteredSales]);
  const progressPercent = Math.min(100, currentGoalValue > 0 ? (totalSalesMonth / currentGoalValue) * 100 : 0);

  const weeklyReport = useMemo(() => {
    const weeks: Record<string, { total: number; count: number }> = {};
    
    filteredSales.forEach(s => {
      const d = new Date(s.date + 'T00:00:00');
      const weekKey = `W${getWeekNumber(d)}`;
      if (!weeks[weekKey]) weeks[weekKey] = { total: 0, count: 0 };
      weeks[weekKey].total += s.value;
      weeks[weekKey].count += 1;
    });

    const report = Object.entries(weeks).map(([week, data]) => ({
      week,
      total: data.total,
      avg: data.total / data.count,
      isPeak: false
    }));

    if (report.length > 0) {
      const maxTotal = Math.max(...report.map(r => r.total));
      report.forEach(r => {
        if (r.total === maxTotal && maxTotal > 0) r.isPeak = true;
      });
    }

    return report.sort((a, b) => a.week.localeCompare(b.week));
  }, [filteredSales]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20">
      
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter leading-none">Fluxo <span className="text-sky-500">Vendas</span></h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <LayoutList size={14} className="text-sky-500" /> {showReport ? 'Relatório Analítico Semanal' : 'Lançamentos de Receita'} {monthName}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 no-print">
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button onClick={handlePrevMonth} className="flex-1 sm:flex-none p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-all active:scale-90"><ChevronLeft size={18} /></button>
            <button onClick={handleResetMonth} className="flex-[3] sm:flex-none px-4 py-1 flex flex-col items-center justify-center hover:bg-slate-50 rounded-xl transition-all min-w-[130px]">
              <span className="text-xs font-black text-slate-800 capitalize text-center">{monthName}</span>
            </button>
            <button onClick={handleNextMonth} className="flex-1 sm:flex-none p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-all active:scale-90"><ChevronRight size={18} /></button>
          </div>
          
          <button 
            onClick={() => setShowReport(!showReport)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 h-12 ${showReport ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-sky-500 text-white hover:bg-sky-600'}`}
          >
            {showReport ? <LayoutList size={18} /> : <BarChart3 size={18} />}
            {showReport ? 'Ver Planilha' : 'Ver Relatório'}
          </button>
        </div>
      </header>

      {!showReport ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Definir Meta para</p>
                  <h4 className="font-black text-slate-900 leading-tight capitalize">{monthName}</h4>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                  <input 
                    type="number" 
                    value={localMonthlyGoal}
                    onChange={(e) => setLocalMonthlyGoal(e.target.value)}
                    placeholder="Ex: 60000"
                    className="w-full h-12 pl-9 pr-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={handleSaveGoal}
                  disabled={isSavingGoal}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all shadow-lg active:scale-90 ${isSavingGoal ? 'bg-emerald-500' : 'bg-slate-900 hover:bg-emerald-600'}`}
                >
                  {isSavingGoal ? <Check size={20} className="animate-in zoom-in" /> : <Save size={20} />}
                </button>
              </div>
            </div>

            <div className={`lg:col-span-2 p-6 rounded-[2.5rem] border shadow-sm flex flex-col justify-between transition-all duration-500 ${progressPercent >= 100 ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center ${progressPercent >= 100 ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-500'}`}>
                     {progressPercent >= 100 ? <Trophy size={16} /> : <Target size={16} />}
                   </div>
                   <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${progressPercent >= 100 ? 'text-white/80' : 'text-slate-400'}`}>
                     {progressPercent >= 100 ? 'MÁXIMA PERFORMANCE' : `Objetivo ${monthName}`}
                   </span>
                 </div>
                 <p className={`text-3xl font-black tracking-tighter ${progressPercent >= 100 ? 'text-white' : 'text-slate-900'}`}>{progressPercent.toFixed(1)}%</p>
              </div>
              <div className="space-y-3">
                <div className={`h-4 sm:h-5 w-full rounded-full overflow-hidden border p-1 ${progressPercent >= 100 ? 'bg-white/20 border-white/30' : 'bg-slate-100 border-slate-200'}`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${progressPercent >= 100 ? 'bg-amber-400' : 'bg-gradient-to-r from-emerald-500 to-sky-500'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                   <span className={progressPercent >= 100 ? 'text-white/80' : 'text-slate-400'}>
                     {progressPercent >= 100 ? 'PARABÉNS! META ALCANÇADA! 🚀' : 'Total Faturado'}
                   </span>
                   <div className={`${progressPercent >= 100 ? 'bg-white text-emerald-600' : 'bg-slate-900 text-white'} px-3 py-1 rounded-lg`}>
                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalSalesMonth)} / {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(currentGoalValue)}
                   </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleAdd} className="bg-white p-5 rounded-[2.5rem] shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end no-print">
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Descrição da Venda</label>
              <input 
                type="text" 
                placeholder="Ex: Faturamento Diário" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-sky-50 outline-none transition-all" 
                required 
              />
            </div>
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Valor Total</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 font-bold text-xs">R$</span>
                <input 
                  type="text" 
                  placeholder="0,00" 
                  value={value} 
                  onChange={e => handleValueChange(e.target.value)} 
                  className="w-full h-12 pl-10 pr-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-sky-50 outline-none transition-all" 
                  required 
                />
              </div>
            </div>
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Data da Venda</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-sky-50 outline-none transition-all" 
                required 
              />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full h-12 bg-slate-900 text-white font-black rounded-2xl hover:bg-sky-600 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95">
                {editingId ? <Pencil size={16} /> : <Plus size={16} />} {editingId ? 'Atualizar' : 'Lançar'}
              </button>
            </div>
          </form>

          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden no-print">
            <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-50 bg-slate-50/50">
               <Search className="text-slate-300" size={20} />
               <input 
                type="text" 
                placeholder="Buscar vendas..." 
                className="bg-transparent border-none outline-none text-xs w-full font-bold" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4 w-1/3">Identificação</th>
                    <th className="px-6 py-4 w-1/4">Valor Total</th>
                    <th className="px-6 py-4 w-1/4">Data</th>
                    <th className="px-6 py-4 w-24 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="group hover:bg-sky-50/20 transition-all">
                      <td className="px-6 py-3 truncate text-xs font-black text-slate-800">{sale.description}</td>
                      <td className="px-6 py-3">
                        <span className="text-sm font-black text-emerald-600 flex items-center gap-2">
                           <ArrowUpRight size={14} />
                           {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.value)}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <Clock size={12} /> {new Date(sale.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex justify-center gap-2 transition-all">
                          <button onClick={() => handleEdit(sale)} title="Editar" className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(sale)} title="Excluir" className="p-1.5 text-rose-300 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredSales.length === 0 && (
              <div className="py-20 text-center text-slate-300 italic flex flex-col items-center">
                 <History size={48} className="opacity-20 mb-4" />
                 <p className="text-sm">Nenhum lançamento para este período.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between no-print">
            <div>
              <h3 className="font-black text-slate-800 uppercase text-[11px] tracking-widest">Relatório Analítico Semanal</h3>
              <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Faturamento distribuído por semanas do mês</p>
            </div>
            <button onClick={() => window.print()} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-sky-500 transition-all shadow-sm">
              <Printer size={20} />
            </button>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
             <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Média Semanal</p>
                <p className="text-2xl font-black text-slate-800">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(weeklyReport.length > 0 ? totalSalesMonth / weeklyReport.length : 0)}
                </p>
             </div>
             <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Pico de Faturamento</p>
                <p className="text-2xl font-black text-emerald-700">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Math.max(...weeklyReport.map(r => r.total), 0))}
                </p>
             </div>
             <div className="bg-sky-50 p-6 rounded-3xl border border-sky-100">
                <p className="text-[9px] font-black text-sky-600 uppercase tracking-widest mb-1">Total do Período</p>
                <p className="text-2xl font-black text-sky-700">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalSalesMonth)}
                </p>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">
                  <th className="px-8 py-5">Período</th>
                  <th className="px-8 py-5">Volume de Vendas</th>
                  <th className="px-8 py-5">Ticket Médio</th>
                  <th className="px-8 py-5 text-emerald-400 text-right">Faturamento Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {weeklyReport.map((row, idx) => (
                  <tr key={idx} className={`hover:bg-emerald-50/30 transition-colors group ${row.isPeak ? 'bg-emerald-50/40' : ''}`}>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Semana {row.week.replace('W', '')}</span>
                        {row.isPeak && (
                          <span className="text-[7px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-md mt-1 w-fit flex items-center gap-1 uppercase">
                            <Award size={8} /> Melhor Desempenho
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <Zap size={12} className="text-amber-400" />
                          {row.total / row.avg} lançamentos no período
                       </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.avg)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className={`flex items-center justify-end gap-3 font-black text-lg tracking-tighter ${row.isPeak ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {row.isPeak && <TrendingUp size={18} className="text-emerald-400" />}
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.total)}
                      </div>
                    </td>
                  </tr>
                ))}
                {weeklyReport.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic text-sm">
                       Não há dados suficientes para gerar o relatório semanal.<br/>
                       <span className="text-[10px] uppercase font-black opacity-40 mt-2 block">Realize lançamentos para ver a análise.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-start gap-4 no-print">
             <Trophy size={20} className="text-emerald-500 shrink-0" />
             <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
               Este relatório semanal é atualizado em tempo real. O ícone <Award size={10} className="inline inline-block text-emerald-500" /> destaca a semana com o maior faturamento bruto do mês selecionado. Use estes dados para identificar sazonalidades e períodos de maior demanda em sua operação.
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesView;
