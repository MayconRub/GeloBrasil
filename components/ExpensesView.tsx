
import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Search, Pencil, CheckCircle2,
  Receipt, Clock, X, Wallet, Calendar,
  ArrowUpRight, ArrowDownRight, ArrowRight, TrendingUp,
  Filter, ChevronDown, DollarSign, Calculator, CalendarRange,
  AlertCircle, Info, CheckCircle, BarChart3, ChevronLeft,
  Check
} from 'lucide-react';
import { Expense, ExpenseStatus, Vehicle, Employee, Sale } from '../types';

interface Props {
  expenses: Expense[];
  categories: string[];
  vehicles: Vehicle[];
  employees: Employee[];
  sales: Sale[];
  onUpdate: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onUpdateCategories: (categoryName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
  onReorderCategories?: (orderedNames: string[]) => void;
}

const ExpensesView: React.FC<Props> = ({ expenses, vehicles, employees, sales, onUpdate, onDelete }) => {
  const FIXED_CATEGORIES = ['GERAL', 'LUZ', 'CEMIG', 'INTERNET', 'IMPOSTO', 'DESPESAS', 'OUTROS'];

  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const getFirstDayOfMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  };

  const getLastDayOfMonth = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  };

  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getLastDayOfMonth());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | ExpenseStatus>('TODOS');

  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [dueDate, setDueDate] = useState(getTodayString());
  const [category, setCategory] = useState('GERAL');
  const [formStatus, setFormStatus] = useState<ExpenseStatus>(ExpenseStatus.A_VENCER);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [isBiweeklyModalOpen, setIsBiweeklyModalOpen] = useState(false);
  
  const [selectedCycle, setSelectedCycle] = useState<1 | 2>(() => {
    const day = new Date().getDate();
    return day <= 15 ? 1 : 2;
  });

  const handleShortcutToday = () => {
    setStartDate(getTodayString());
    setEndDate(getTodayString());
  };

  const handleShortcutMonth = () => {
    setStartDate(getFirstDayOfMonth());
    setEndDate(getLastDayOfMonth());
  };

  const dreData = useMemo(() => {
    const isInRange = (d: string) => d >= startDate && d <= endDate;
    const rangeSales = sales.filter(s => isInRange(s.date)).reduce((sum, s) => sum + s.value, 0);
    const rangeExpenses = expenses.filter(e => isInRange(e.dueDate));
    const totalExpenses = rangeExpenses.reduce((sum, e) => sum + e.value, 0);
    const netProfit = rangeSales - totalExpenses;
    return { rangeSales, totalExpenses, netProfit };
  }, [sales, expenses, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        const matchesDate = e.dueDate >= startDate && e.dueDate <= endDate;
        const matchesSearch = (e.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (e.category || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'TODOS' || e.status === statusFilter;
        return matchesDate && matchesSearch && matchesStatus;
      })
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  }, [expenses, startDate, endDate, searchTerm, statusFilter]);

  const biweeklyCalculation = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    let qStart: string;
    let qEnd: string;

    if (selectedCycle === 1) {
      qStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      qEnd = `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`;
    } else {
      const lastDay = new Date(currentYear, currentMonth, 0).getDate();
      qStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-16`;
      qEnd = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    }

    const periodSales = sales
      .filter(s => s.date >= qStart && s.date <= qEnd)
      .reduce((sum, s) => sum + s.value, 0);

    const openExpenses = expenses
      .filter(e => e.dueDate >= qStart && e.dueDate <= qEnd && e.status !== ExpenseStatus.PAGO)
      .reduce((sum, e) => sum + e.value, 0);

    const diff = periodSales - openExpenses;

    return {
      qStart,
      qEnd,
      periodSales,
      openExpenses,
      diff,
      status: diff < 0 ? 'shortfall' : diff > 0 ? 'surplus' : 'exact'
    };
  }, [sales, expenses, selectedCycle]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numVal = parseFloat(value.replace(',', '.'));
    if (!description || isNaN(numVal)) return;
    onUpdate({ 
      id: editingId || crypto.randomUUID(), 
      description: description.toUpperCase(), 
      value: numVal, 
      dueDate, 
      status: formStatus, 
      category: category.toUpperCase()
    });
    resetForm();
  };

  const handleEdit = (exp: Expense) => {
    setEditingId(exp.id); 
    setDescription(exp.description); 
    setValue(exp.value.toString()); 
    setDueDate(exp.dueDate); 
    setCategory(exp.category); 
    setFormStatus(exp.status);
    setIsMobileFormOpen(true);
  };

  const resetForm = () => {
    setEditingId(null); setDescription(''); setValue(''); setDueDate(getTodayString()); setCategory('GERAL'); setFormStatus(ExpenseStatus.A_VENCER); setIsMobileFormOpen(false);
  };

  const toggleExpenseStatus = (e: Expense) => {
    const newStatus = e.status === ExpenseStatus.PAGO ? ExpenseStatus.A_VENCER : ExpenseStatus.PAGO;
    onUpdate({ ...e, status: newStatus });
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto transition-colors uppercase bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
      
      {/* Header Panel */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 w-full sm:w-auto">
          <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            <Receipt size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tight">BLOCO DE <span className="text-rose-500">DESPESAS</span></h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 uppercase tracking-widest">Controle de Fluxo e Vencimentos</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsBiweeklyModalOpen(true)}
            className="px-6 h-14 bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-[10px] uppercase shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
             <Calculator size={20} className="text-sky-500" /> Fechamento Quinzenal
          </button>
          <button onClick={() => setIsMobileFormOpen(true)} className="px-10 h-14 bg-sky-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-sky-600 active:scale-95 transition-all flex items-center justify-center gap-3">
             <Plus size={20} /> Novo Lançamento
          </button>
        </div>
      </header>

      {/* Modern Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm no-print">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-11 border border-slate-100 dark:border-slate-800">
            <span className="text-[8px] font-black text-slate-400 mr-2 uppercase">DE</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-700 dark:text-slate-200 w-full" />
          </div>
          <ArrowRight size={14} className="text-slate-300 shrink-0" />
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-11 border border-slate-100 dark:border-slate-800">
            <span className="text-[8px] font-black text-slate-400 mr-2 uppercase">ATÉ</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-700 dark:text-slate-200 w-full" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button onClick={handleShortcutToday} className="px-3 h-9 rounded-lg text-[8px] font-black uppercase hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-all">Hoje</button>
            <button onClick={handleShortcutMonth} className="px-3 h-9 rounded-lg text-[8px] font-black uppercase hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-all">Mês</button>
          </div>
          <div className="relative flex-1 lg:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="BUSCAR DESPESA OU CATEGORIA..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="w-full h-11 pl-9 pr-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-sky-50/20 dark:text-white" 
            />
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        <button 
          onClick={() => setStatusFilter('TODOS')} 
          className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${statusFilter === 'TODOS' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800 opacity-60'}`}
        >
          TODOS
        </button>
        {[
          { label: 'PAGO', value: ExpenseStatus.PAGO },
          { label: 'A VENCER', value: ExpenseStatus.A_VENCER },
          { label: 'ATRASADO', value: ExpenseStatus.VENCIDO },
        ].map(status => (
          <button 
            key={status.label} 
            onClick={() => setStatusFilter(status.value)} 
            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${statusFilter === status.value ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800 opacity-60'}`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard label="FATURAMENTO" value={dreData.rangeSales} icon={ArrowUpRight} color="emerald" />
        <SummaryCard label="DESPESAS" value={dreData.totalExpenses} icon={ArrowDownRight} color="rose" />
        <SummaryCard label="SALDO LÍQUIDO" value={dreData.netProfit} icon={Wallet} color="sky" />
      </div>

      {/* Table Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 dark:text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-50 dark:border-slate-800">
                <th className="px-8 py-6">VENCIMENTO</th>
                <th className="px-8 py-6">CATEGORIA</th>
                <th className="px-8 py-6">DESCRIÇÃO</th>
                <th className="px-8 py-6 text-right">VALOR</th>
                <th className="px-8 py-6 text-center">SITUAÇÃO</th>
                <th className="px-8 py-6 text-right no-print">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 group transition-colors">
                  <td className="px-8 py-5 text-[10px] font-bold text-slate-500">{new Date(e.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-8 py-5">
                    <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[8px] font-black text-slate-500 uppercase tracking-widest">
                      {e.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-black text-xs text-slate-800 dark:text-slate-200">{e.description}</td>
                  <td className="px-8 py-5 text-right font-black text-sm text-rose-500">
                    R$ {e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      onClick={() => toggleExpenseStatus(e)} 
                      className={`group/btn px-6 py-2 rounded-full text-[8px] font-black uppercase transition-all shadow-sm flex items-center justify-center gap-2 mx-auto min-w-[120px] ${
                        e.status === ExpenseStatus.PAGO 
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                        : e.status === ExpenseStatus.VENCIDO 
                        ? 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse' 
                        : 'bg-slate-50 dark:bg-slate-800 text-amber-500 border border-amber-200 dark:border-amber-900/40 hover:border-emerald-500 hover:text-emerald-500'
                      }`}
                    >
                      {e.status === ExpenseStatus.PAGO ? (
                        <Check size={12} strokeWidth={3} />
                      ) : (
                        <div className="w-3 h-3 group-hover/btn:hidden flex items-center justify-center">
                          <div className={`w-1.5 h-1.5 rounded-full ${e.status === ExpenseStatus.VENCIDO ? 'bg-white' : 'bg-amber-500'}`} />
                        </div>
                      )}
                      <span className="group-hover/btn:hidden">{e.status === ExpenseStatus.VENCIDO ? 'ATRASADO' : e.status}</span>
                      <span className="hidden group-hover/btn:inline">{e.status === ExpenseStatus.PAGO ? 'ESTORNAR' : 'PAGAR CONTA'}</span>
                    </button>
                  </td>
                  <td className="px-8 py-5 text-right no-print">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleEdit(e)} className="p-2 text-slate-300 hover:text-sky-500 transition-colors"><Pencil size={18} /></button>
                      <button onClick={() => onDelete(e.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <Receipt size={48} className="mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nenhuma despesa localizada</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Biweekly Calculation Modal */}
      {isBiweeklyModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 dark:bg-black/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsBiweeklyModalOpen(false)} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] p-8 sm:p-12 shadow-3xl relative border dark:border-slate-800 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[95vh] custom-scrollbar">
             <button onClick={() => setIsBiweeklyModalOpen(false)} className="absolute top-8 right-8 p-3 text-slate-300 hover:text-rose-500 transition-colors"><X size={28}/></button>
             
             <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 bg-sky-50 dark:bg-sky-900/30 text-sky-500 rounded-2xl flex items-center justify-center shadow-inner">
                   <CalendarRange size={32} />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">Fechamento <span className="text-sky-500">Quinzenal</span></h3>
                   <div className="flex items-center gap-2 mt-2">
                      <Clock size={12} className="text-slate-400" />
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        Análise de Ciclo Curto
                      </p>
                   </div>
                </div>
             </div>

             <div className="flex p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8">
               <button 
                 onClick={() => setSelectedCycle(1)}
                 className={`flex-1 py-3.5 rounded-xl text-[9px] font-black tracking-widest transition-all ${selectedCycle === 1 ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600'}`}
               >
                 1º CICLO (01-15)
               </button>
               <button 
                 onClick={() => setSelectedCycle(2)}
                 className={`flex-1 py-3.5 rounded-xl text-[9px] font-black tracking-widest transition-all ${selectedCycle === 2 ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600'}`}
               >
                 2º CICLO (16-FIM)
               </button>
             </div>

             <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-8 flex items-center justify-center gap-3">
               <Calendar size={14} className="text-sky-500" />
               <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                 Período Analisado: {new Date(biweeklyCalculation.qStart + 'T00:00:00').toLocaleDateString()} — {new Date(biweeklyCalculation.qEnd + 'T00:00:00').toLocaleDateString()}
               </span>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem]">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Vendido no Ciclo</p>
                   <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">R$ {biweeklyCalculation.periodSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem]">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Débitos Pendentes</p>
                   <p className="text-lg font-black text-rose-500">R$ {biweeklyCalculation.openExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
             </div>

             <div className={`p-8 rounded-[2.5rem] border-2 mb-8 text-center transition-all ${
               biweeklyCalculation.status === 'shortfall' 
               ? 'bg-rose-50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30 text-rose-600' 
               : biweeklyCalculation.status === 'surplus'
               ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30 text-emerald-600'
               : 'bg-sky-50 border-sky-100 dark:bg-sky-900/10 dark:border-sky-900/30 text-sky-600'
             }`}>
                <div className="flex items-center justify-center gap-3 mb-4">
                   {biweeklyCalculation.status === 'shortfall' && <AlertCircle size={28} />}
                   {biweeklyCalculation.status === 'surplus' && <CheckCircle size={28} />}
                   {biweeklyCalculation.status === 'exact' && <BarChart3 size={28} />}
                   <span className="text-xs font-black uppercase tracking-[0.3em]">Status do Período</span>
                </div>
                
                <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                   {biweeklyCalculation.status === 'shortfall' && `Faltam R$ ${Math.abs(biweeklyCalculation.diff).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para quitar as despesas`}
                   {biweeklyCalculation.status === 'surplus' && `Sobra R$ ${biweeklyCalculation.diff.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} após quitar as despesas`}
                   {biweeklyCalculation.status === 'exact' && `Meta alcançada – despesas quitadas`}
                </h4>
             </div>

             <button 
                onClick={() => setIsBiweeklyModalOpen(false)}
                className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] mt-8 active:scale-95 shadow-2xl transition-all"
             >
                Entendido
             </button>
          </div>
        </div>
      )}

      {/* Fast Entry Modal */}
      {isMobileFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-sm" onClick={resetForm} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl relative border dark:border-slate-800 animate-in zoom-in-95">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">Lançar <span className="text-rose-500">Despesa</span></h3>
                <button onClick={resetForm} className="p-3 text-slate-300 dark:text-slate-700 hover:text-rose-500 transition-colors"><X size={28}/></button>
             </div>
             <form onSubmit={handleAdd} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-3">Categoria</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-[10px] dark:text-white uppercase outline-none">
                         {FIXED_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-3">Vencimento</label>
                      <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-xs dark:text-white outline-none" required />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-3">Descrição</label>
                      <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="NOME DA CONTA" className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-xs uppercase dark:text-white outline-none" required />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-3">Situação Atual</label>
                      <select value={formStatus} onChange={e => setFormStatus(e.target.value as ExpenseStatus)} className={`w-full h-14 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-[10px] uppercase outline-none ${formStatus === ExpenseStatus.PAGO ? 'text-emerald-500' : 'text-amber-500'}`}>
                         <option value={ExpenseStatus.A_VENCER}>A VENCER</option>
                         <option value={ExpenseStatus.PAGO}>JÁ FOI PAGO</option>
                      </select>
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-3">Valor Total R$</label>
                   <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-500 font-black text-lg">R$</span>
                      <input 
                        type="text" 
                        value={value} 
                        onChange={e => setValue(e.target.value)} 
                        placeholder="0,00" 
                        className="w-full h-16 pl-16 pr-6 bg-rose-50/20 dark:bg-slate-950 border border-rose-100 dark:border-rose-800/30 rounded-[1.8rem] text-2xl font-black text-rose-600 dark:text-rose-400 outline-none" 
                        required 
                      />
                   </div>
                </div>
                <button type="submit" className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.2em] mt-6 shadow-2xl active:scale-95 transition-all">SALVAR LANÇAMENTO</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon, color }: any) => {
  const themes: any = {
    sky: { 
      bg: "bg-sky-50 dark:bg-sky-950/30", 
      text: "text-sky-600 dark:text-sky-400", 
      iconBg: "bg-sky-100 dark:bg-sky-900/30",
      border: "border-sky-50 dark:border-sky-900/10"
    },
    emerald: { 
      bg: "bg-emerald-50 dark:bg-emerald-950/30", 
      text: "text-emerald-600 dark:text-emerald-400", 
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      border: "border-emerald-50 dark:border-emerald-900/10"
    },
    rose: { 
      bg: "bg-rose-50 dark:bg-sky-950/30", 
      text: "text-rose-600 dark:text-rose-400", 
      iconBg: "bg-rose-100 dark:bg-rose-900/30",
      border: "border-rose-50 dark:border-rose-900/10"
    }
  };
  const theme = themes[color] || themes.sky;

  return (
    <div className={`p-8 rounded-[2.5rem] border ${theme.border} bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between min-h-[160px]`}>
      <div className="flex items-center justify-between mb-6">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.iconBg} ${theme.text}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className={`text-2xl font-black tracking-tighter ${theme.text}`}>
        R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
};

export default ExpensesView;
