
import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Search, Pencil, CheckCircle2,
  Receipt, Clock, X, Wallet, Calendar,
  ArrowUpRight, ArrowDownRight, ArrowRight, TrendingUp,
  Filter, ChevronDown, DollarSign, Calculator, CalendarRange,
  AlertCircle, Info, CheckCircle, BarChart3, ChevronLeft,
  Check, MoreVertical
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
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tight truncate">Controle <span className="text-rose-500">Despesas</span></h1>
            <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Planilha Digital de Gastos</p>
          </div>
        </div>
        <div className="flex flex-row gap-2 w-full sm:w-auto">
          <button onClick={() => setIsBiweeklyModalOpen(true)} className="flex-1 sm:flex-none px-4 h-12 bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl font-black text-[9px] uppercase shadow-sm flex items-center justify-center gap-2">
             <Calculator size={16} className="text-sky-500" /> <span className="hidden sm:inline">QUINZENA</span>
          </button>
          <button onClick={() => setIsMobileFormOpen(true)} className="flex-1 sm:flex-none px-6 h-12 bg-sky-500 text-white rounded-xl font-black text-[9px] uppercase shadow-xl flex items-center justify-center gap-2">
             <Plus size={16} /> NOVO LANÇAMENTO
          </button>
        </div>
      </header>

      {/* Modern Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm no-print">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-10 border border-slate-100 dark:border-slate-800">
            <span className="text-[7px] font-black text-slate-400 mr-2 uppercase">DE</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none outline-none text-[9px] font-bold text-slate-700 dark:text-slate-200 w-full" />
          </div>
          <ArrowRight size={12} className="text-slate-300 shrink-0" />
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-10 border border-slate-100 dark:border-slate-800">
            <span className="text-[7px] font-black text-slate-400 mr-2 uppercase">ATÉ</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none outline-none text-[9px] font-bold text-slate-700 dark:text-slate-200 w-full" />
          </div>
        </div>
        <div className="relative flex-1 lg:w-64">
           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
           <input type="text" placeholder="BUSCAR..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-10 pl-9 pr-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-[9px] font-black uppercase outline-none focus:ring-2 focus:ring-sky-50/20 dark:text-white" />
        </div>
      </div>

      {/* Summary Metrics - Rolagem horizontal no mobile */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
        <SummaryCard label="RECEITA" value={dreData.rangeSales} color="emerald" minWidth="min-w-[140px]" />
        <SummaryCard label="SAÍDA" value={dreData.totalExpenses} color="rose" minWidth="min-w-[140px]" />
        <SummaryCard label="SALDO" value={dreData.netProfit} color="sky" minWidth="min-w-[140px]" />
      </div>

      {/* Desktop Table View / Mobile Card List */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
        {/* Desktop Header */}
        <div className="hidden lg:grid grid-cols-6 text-slate-400 dark:text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-50 dark:border-slate-800 px-8 py-5">
           <span>VENCIMENTO</span>
           <span>CATEGORIA</span>
           <span>DESCRIÇÃO</span>
           <span className="text-right">VALOR</span>
           <span className="text-center">SITUAÇÃO</span>
           <span className="text-right">AÇÕES</span>
        </div>

        {/* Content List */}
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {filteredExpenses.map((e) => (
            <div key={e.id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              {/* Mobile Card Design */}
              <div className="lg:hidden p-5 space-y-4">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[7px] font-black text-slate-500 uppercase">{e.category}</span>
                       <h4 className="font-black text-xs text-slate-800 dark:text-slate-200 uppercase">{e.description}</h4>
                       <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase">
                          <Calendar size={10} /> {new Date(e.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                       </div>
                    </div>
                    <div className="text-right space-y-2">
                       <p className="font-black text-sm text-rose-500">R$ {e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                       <button 
                         onClick={() => toggleExpenseStatus(e)} 
                         className={`px-3 py-1 rounded-full text-[7px] font-black uppercase flex items-center gap-1 ml-auto ${
                           e.status === ExpenseStatus.PAGO ? 'bg-emerald-500 text-white' : 'bg-amber-50 text-amber-500 border border-amber-200'
                         }`}
                       >
                         {e.status === ExpenseStatus.PAGO ? <Check size={8} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                         {e.status}
                       </button>
                    </div>
                 </div>
                 <div className="flex justify-end gap-3 pt-2 border-t border-slate-50 dark:border-slate-800">
                    <button onClick={() => handleEdit(e)} className="p-2 text-slate-300 hover:text-sky-500"><Pencil size={14}/></button>
                    <button onClick={() => onDelete(e.id)} className="p-2 text-slate-200 hover:text-rose-500"><Trash2 size={14}/></button>
                 </div>
              </div>

              {/* Desktop Row Design */}
              <div className="hidden lg:grid grid-cols-6 items-center px-8 py-4">
                 <span className="text-[10px] font-bold text-slate-500">{new Date(e.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                 <span className="text-[8px] font-black text-slate-500 uppercase">{e.category}</span>
                 <span className="font-black text-xs text-slate-800 dark:text-slate-200">{e.description}</span>
                 <span className="text-right font-black text-sm text-rose-500">R$ {e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                 <div className="flex justify-center">
                    <button onClick={() => toggleExpenseStatus(e)} className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase transition-all ${e.status === ExpenseStatus.PAGO ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-amber-500 border'}`}>
                       {e.status}
                    </button>
                 </div>
                 <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(e)} className="p-1.5 text-slate-300 hover:text-sky-500"><Pencil size={16}/></button>
                    <button onClick={() => onDelete(e.id)} className="p-1.5 text-slate-200 hover:text-rose-500"><Trash2 size={16}/></button>
                 </div>
              </div>
            </div>
          ))}
          {filteredExpenses.length === 0 && (
            <div className="py-20 text-center opacity-20">
               <Receipt size={40} className="mx-auto mb-2" />
               <p className="text-[9px] font-black uppercase">Nenhuma conta no intervalo</p>
            </div>
          )}
        </div>
      </div>

      {/* Fast Entry Modal / Bottom Sheet Mobile */}
      {isMobileFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-sm" onClick={resetForm} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[3rem] p-8 sm:p-10 shadow-2xl relative border-t sm:border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom duration-500 sm:zoom-in-95">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Lançar Despesa</h3>
                <button onClick={resetForm} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400"><X size={20}/></button>
             </div>
             <form onSubmit={handleAdd} className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase ml-2">Categoria</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border rounded-xl font-black text-[9px] dark:text-white uppercase outline-none">
                         {FIXED_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase ml-2">Vencimento</label>
                      <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border rounded-xl font-bold text-[11px] dark:text-white outline-none" required />
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-[8px] font-black text-slate-400 uppercase ml-2">Descrição da Conta</label>
                   <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="EX: CEMIG SETEMBRO" className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border rounded-xl font-bold text-xs uppercase dark:text-white outline-none" required />
                </div>
                <div className="space-y-1">
                   <label className="text-[8px] font-black text-slate-400 uppercase ml-2">Valor R$</label>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 font-black text-xs">R$</span>
                      <input type="text" value={value} onChange={e => setValue(e.target.value)} placeholder="0,00" className="w-full h-14 pl-10 pr-4 bg-rose-50/10 dark:bg-slate-950 border border-rose-100 rounded-xl text-xl font-black text-rose-600 outline-none" required />
                   </div>
                </div>
                <button type="submit" className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl mt-4">SALVAR NO BLOCO</button>
             </form>
          </div>
        </div>
      )}

      {/* Fechamento Quinzenal Modal */}
      {isBiweeklyModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/80 dark:bg-black/95 backdrop-blur-sm" onClick={() => setIsBiweeklyModalOpen(false)} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[3rem] p-8 sm:p-10 shadow-3xl relative border-t sm:border dark:border-slate-800 animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Status da Quinzena</h3>
                <button onClick={() => setIsBiweeklyModalOpen(false)} className="text-slate-300"><X size={24}/></button>
             </div>
             
             <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl mb-6">
               <button onClick={() => setSelectedCycle(1)} className={`flex-1 py-3 rounded-lg text-[8px] font-black transition-all ${selectedCycle === 1 ? 'bg-sky-500 text-white shadow' : 'text-slate-400'}`}>1ª QUINZENA (01-15)</button>
               <button onClick={() => setSelectedCycle(2)} className={`flex-1 py-3 rounded-lg text-[8px] font-black transition-all ${selectedCycle === 2 ? 'bg-sky-500 text-white shadow' : 'text-slate-400'}`}>2ª QUINZENA (16-FIM)</button>
             </div>

             <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-5 bg-slate-50 dark:bg-slate-950 border rounded-2xl">
                   <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Faturamento</p>
                   <p className="text-sm font-black text-emerald-600">R$ {biweeklyCalculation.periodSales.toLocaleString('pt-BR')}</p>
                </div>
                <div className="p-5 bg-slate-50 dark:bg-slate-950 border rounded-2xl">
                   <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Dívidas Ciclo</p>
                   <p className="text-sm font-black text-rose-500">R$ {biweeklyCalculation.openExpenses.toLocaleString('pt-BR')}</p>
                </div>
             </div>

             <div className={`p-6 rounded-[2rem] border-2 text-center ${
               biweeklyCalculation.status === 'shortfall' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
             }`}>
                <h4 className="text-sm font-black uppercase leading-tight">
                   {biweeklyCalculation.status === 'shortfall' 
                     ? `Necessário vender R$ ${Math.abs(biweeklyCalculation.diff).toLocaleString('pt-BR')} para fechar as contas do período`
                     : `Sobram R$ ${biweeklyCalculation.diff.toLocaleString('pt-BR')} após quitar as contas do período`}
                </h4>
             </div>
             <button onClick={() => setIsBiweeklyModalOpen(false)} className="w-full h-14 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase mt-6">ENTENDIDO</button>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, color, minWidth }: any) => {
  const themes: any = {
    sky: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800/30",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30",
    rose: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30"
  };
  return (
    <div className={`p-5 rounded-[1.8rem] border flex flex-col justify-center ${themes[color]} ${minWidth}`}>
      <span className="text-[7px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</span>
      <p className="text-xs sm:text-sm font-black tracking-tight whitespace-nowrap">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
    </div>
  );
};

export default ExpensesView;
