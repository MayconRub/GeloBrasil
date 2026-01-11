
import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Search, Pencil, CheckCircle2,
  Receipt, Clock, X, Wallet, Calendar,
  ArrowUpRight, ArrowDownRight, ArrowRight, TrendingUp,
  Filter, ChevronDown, DollarSign, Calculator, CalendarRange,
  AlertCircle, Info, CheckCircle, BarChart3, ChevronLeft,
  Check, MoreVertical, LayoutList, List
} from 'lucide-react';
import { Expense, ExpenseStatus, Vehicle, Employee, Sale } from '../types';

interface Props {
  expenses: Expense[];
  categories: string[];
  vehicles: Vehicle[];
  employees: Employee[];
  sales: Sale[];
  onUpdate: (expense: Expense) => void;
  onUpdateStatus: (id: string, status: ExpenseStatus) => void;
  onDelete: (id: string) => void;
  onUpdateCategories: (categoryName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
  onReorderCategories?: (orderedNames: string[]) => void;
}

const ExpensesView: React.FC<Props> = ({ expenses, vehicles, employees, sales, onUpdate, onUpdateStatus, onDelete }) => {
  const FIXED_CATEGORIES = ['GERAL', 'LUZ', 'CEMIG', 'INTERNET', 'IMPOSTO', 'DESPESAS', 'MANUTENÇÃO', 'COMBUSTÍVEL', 'EQUIPE', 'OUTROS'];

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
    const paidExpenses = rangeExpenses.filter(e => e.status === ExpenseStatus.PAGO).reduce((sum, e) => sum + e.value, 0);
    const netProfit = rangeSales - paidExpenses;
    return { rangeSales, totalExpenses, paidExpenses, netProfit };
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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanValue = value.replace(/\./g, '').replace(',', '.');
    const numVal = parseFloat(cleanValue);
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
    setValue(exp.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })); 
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
    onUpdateStatus(e.id, newStatus);
  };

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

    const periodSales = sales.filter(s => s.date >= qStart && s.date <= qEnd).reduce((sum, s) => sum + s.value, 0);
    const openExpenses = expenses.filter(e => e.dueDate >= qStart && e.dueDate <= qEnd && e.status !== ExpenseStatus.PAGO).reduce((sum, e) => sum + e.value, 0);
    const diff = periodSales - openExpenses;

    return { qStart, qEnd, periodSales, openExpenses, diff, status: diff < 0 ? 'shortfall' : diff > 0 ? 'surplus' : 'exact' };
  }, [sales, expenses, selectedCycle]);

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-24 lg:pb-20 max-w-[1600px] mx-auto transition-colors uppercase bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
      
      {/* Header Panel */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-12 h-12 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            <Receipt size={24} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tight truncate">Gestão <span className="text-rose-500">Planilha</span></h1>
            <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Controle Financeiro de Despesas</p>
          </div>
        </div>
        <div className="flex flex-row gap-2 w-full sm:w-auto">
          <button onClick={() => setIsBiweeklyModalOpen(true)} className="flex-1 sm:flex-none px-4 h-12 bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl font-black text-[9px] uppercase shadow-sm flex items-center justify-center gap-2 active:scale-95">
             <Calculator size={16} className="text-sky-500" /> <span className="hidden sm:inline">ANÁLISE QUINZENA</span>
          </button>
          <button onClick={() => { resetForm(); setIsMobileFormOpen(true); }} className="flex-1 sm:flex-none px-6 h-12 bg-rose-500 text-white rounded-xl font-black text-[9px] uppercase shadow-xl flex items-center justify-center gap-2 active:scale-95">
             <Plus size={16} /> LANÇAR CONTA
          </button>
        </div>
      </header>

      {/* Modern Compact Filter Bar Padronizada */}
      <div className="flex flex-col md:flex-row gap-3 bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm no-print">
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
          <div className="flex flex-col sm:flex-row gap-2">
             <div className="relative flex-1 md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="text" placeholder="FILTRAR DESCRIÇÃO..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-11 pl-9 pr-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-sky-50/20 dark:text-white" />
             </div>
             <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="h-11 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl font-black text-[9px] uppercase outline-none dark:text-white">
                <option value="TODOS">TODAS SITUAÇÕES</option>
                <option value={ExpenseStatus.PAGO}>PAGO</option>
                <option value={ExpenseStatus.A_VENCER}>A VENCER</option>
                <option value={ExpenseStatus.VENCIDO}>VENCIDO</option>
             </select>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 no-print">
        <SummaryCard label="ENTRADAS (Faturamento)" value={dreData.rangeSales} color="sky" />
        <SummaryCard label="CONTAS TOTAIS" value={dreData.totalExpenses} color="slate" />
        <SummaryCard label="DESPESAS PAGAS" value={dreData.paidExpenses} color="rose" />
        <SummaryCard label="LUCRO PROJETADO" value={dreData.netProfit} color="emerald" />
      </div>

      {/* Spreadsheet Table View */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 text-[8px] font-black uppercase tracking-widest border-b">
              <tr>
                <th className="px-6 py-4">VENCIMENTO</th>
                <th className="px-6 py-4">CATEGORIA</th>
                <th className="px-6 py-4">DESCRIÇÃO</th>
                <th className="px-6 py-4 text-right">VALOR R$</th>
                <th className="px-6 py-4 text-center">STATUS</th>
                <th className="px-6 py-4 text-center no-print">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{new Date(e.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[7px] font-black text-slate-500 uppercase">{e.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-[11px] text-slate-800 dark:text-slate-200 uppercase">{e.description}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-black text-xs text-rose-500">R$ {e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => toggleExpenseStatus(e)} 
                      className={`min-w-[80px] px-3 py-1.5 rounded-lg text-[7px] font-black uppercase transition-all flex items-center justify-center gap-1.5 mx-auto ${
                        e.status === ExpenseStatus.PAGO 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-none' 
                          : e.status === ExpenseStatus.VENCIDO 
                            ? 'bg-rose-50 text-rose-500 border border-rose-200 animate-pulse' 
                            : 'bg-amber-50 text-amber-500 border border-amber-200'
                      }`}
                    >
                      {e.status === ExpenseStatus.PAGO ? <Check size={10} strokeWidth={4} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                      {e.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center no-print">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => handleEdit(e)} className="p-1.5 text-slate-300 hover:text-sky-500"><Pencil size={16}/></button>
                       <button onClick={() => { if(confirm('EXCLUIR ESTA DESPESA?')) onDelete(e.id); }} className="p-1.5 text-slate-200 hover:text-rose-500"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-24 text-center opacity-20">
                    <div className="flex flex-col items-center">
                      <Receipt size={48} className="mb-4 text-slate-300" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nenhum lançamento no filtro aplicado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Entry Form (Mobile Sheet or Center Modal) */}
      {isMobileFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/70 dark:bg-black/90 backdrop-blur-sm" onClick={resetForm} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[3rem] p-8 sm:p-10 shadow-2xl relative border-t sm:border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom duration-500">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{editingId ? 'Editar' : 'Lançar'} Despesa</h3>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sincronização imediata</p>
                </div>
                <button onClick={resetForm} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400"><X size={20}/></button>
             </div>
             <form onSubmit={handleAdd} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Categoria</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 rounded-xl font-black text-[10px] dark:text-white uppercase outline-none shadow-inner">
                         {FIXED_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Vencimento</label>
                      <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 rounded-xl font-bold text-[11px] dark:text-white outline-none shadow-inner" required />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Descrição da Despesa</label>
                   <input type="text" value={description} onChange={e => setDescription(e.target.value.toUpperCase())} placeholder="EX: CEMIG SETEMBRO" className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 rounded-xl font-bold text-xs uppercase dark:text-white outline-none shadow-inner" required />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Valor da Conta (R$)</label>
                   <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-500 font-black text-xs">R$</span>
                      <input type="text" value={value} onChange={e => setValue(e.target.value.replace(/[^0-9,]/g, ''))} placeholder="0,00" className="w-full h-16 pl-12 pr-6 bg-rose-50/20 dark:bg-slate-950 border-2 border-rose-100 rounded-2xl text-2xl font-black text-rose-600 outline-none shadow-inner" required />
                   </div>
                </div>
                <div className="pt-4 flex gap-3">
                   <button type="button" onClick={resetForm} className="flex-1 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 font-black text-[10px] uppercase rounded-2xl">Cancelar</button>
                   <button type="submit" className="flex-[2] h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">CONCLUIR LANÇAMENTO</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Biweekly Closing Analysis */}
      {isBiweeklyModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/80 dark:bg-black/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsBiweeklyModalOpen(false)} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[3rem] p-8 sm:p-10 shadow-3xl relative border-t sm:border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Fluxo Quinzenal</h3>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Projeção de Fechamento</p>
                </div>
                <button onClick={() => setIsBiweeklyModalOpen(false)} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400"><X size={24}/></button>
             </div>
             
             <div className="flex p-1 bg-slate-100 dark:bg-slate-950 border rounded-2xl mb-8">
               <button onClick={() => setSelectedCycle(1)} className={`flex-1 py-4 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${selectedCycle === 1 ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400'}`}>1ª Quinzena (01-15)</button>
               <button onClick={() => setSelectedCycle(2)} className={`flex-1 py-4 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${selectedCycle === 2 ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400'}`}>2ª Quinzena (16-31)</button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-[1.5rem]">
                   <p className="text-[7px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Vendas Ciclo</p>
                   <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">R$ {biweeklyCalculation.periodSales.toLocaleString('pt-BR')}</p>
                </div>
                <div className="p-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-[1.5rem]">
                   <p className="text-[7px] font-black text-rose-600 uppercase tracking-[0.2em] mb-2">Dívidas Ciclo</p>
                   <p className="text-lg font-black text-rose-700 dark:text-rose-400">R$ {biweeklyCalculation.openExpenses.toLocaleString('pt-BR')}</p>
                </div>
             </div>

             <div className={`p-8 rounded-[2rem] border-2 text-center shadow-inner ${
               biweeklyCalculation.status === 'shortfall' ? 'bg-rose-50/50 border-rose-100 text-rose-600' : 'bg-emerald-50/50 border-emerald-100 text-emerald-600'
             }`}>
                <div className="flex justify-center mb-3">
                   {biweeklyCalculation.status === 'shortfall' ? <AlertCircle size={32} /> : <CheckCircle size={32} />}
                </div>
                <h4 className="text-[11px] font-black uppercase leading-relaxed tracking-tight">
                   {biweeklyCalculation.status === 'shortfall' 
                     ? `O faturamento do ciclo não cobre as despesas agendadas. \nFaltam R$ ${Math.abs(biweeklyCalculation.diff).toLocaleString('pt-BR')} para equilibrar.`
                     : `Fluxo de caixa saudável para este ciclo. \nSobram R$ ${biweeklyCalculation.diff.toLocaleString('pt-BR')} após quitar todas as contas.`}
                </h4>
             </div>
             <button onClick={() => setIsBiweeklyModalOpen(false)} className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] mt-8 active:scale-95 shadow-2xl">Fechar Análise</button>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, color }: any) => {
  const themes: any = {
    sky: "text-sky-600 bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800/30",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30",
    rose: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30",
    slate: "text-slate-600 bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/30"
  };
  return (
    <div className={`p-5 rounded-[1.8rem] border flex flex-col justify-center transition-all hover:scale-[1.02] shadow-sm ${themes[color]}`}>
      <span className="text-[7px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</span>
      <p className="text-xs sm:text-sm font-black tracking-tight whitespace-nowrap">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
    </div>
  );
};

export default ExpensesView;
