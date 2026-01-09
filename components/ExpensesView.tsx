
import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Search, Pencil, CheckCircle2,
  Receipt, Clock, X, Wallet, Calendar,
  ArrowUpRight, ArrowDownRight, ArrowRight, TrendingUp
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
  // Categorias Fixas solicitadas pelo usuário
  const FIXED_CATEGORIES = ['LUZ', 'CEMIG', 'INTERNET', 'IMPOSTO', 'DESPESAS', 'OUTROS'];

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
  const [category, setCategory] = useState('DESPESAS');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);

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
        const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             e.category.toLowerCase().includes(searchTerm.toLowerCase());
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
      status: editingId ? (expenses.find(x => x.id === editingId)?.status || ExpenseStatus.A_VENCER) : ExpenseStatus.A_VENCER, 
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
    setIsMobileFormOpen(true);
  };

  const resetForm = () => {
    setEditingId(null); setDescription(''); setValue(''); setDueDate(getTodayString()); setCategory('DESPESAS'); setIsMobileFormOpen(false);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto transition-colors uppercase">
      <header className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-5 w-full lg:w-auto">
          <div className="w-14 h-14 bg-rose-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl rotate-2 shrink-0">
            <Receipt size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">Bloco de <span className="text-rose-500">Despesas</span></h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
              <Plus size={12} className="text-sky-500" /> Lançamento Rápido (Pad)
            </p>
          </div>
        </div>
        <button onClick={() => setIsMobileFormOpen(true)} className="w-full lg:w-auto h-12 px-8 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95">
           <Plus size={18} /> Novo Lançamento
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-3 bg-white dark:bg-slate-900 p-2 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 shadow-sm no-print">
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
          <div className="relative flex-1 lg:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input type="text" placeholder="FILTRAR..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-11 pl-9 pr-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-sky-50/20 dark:text-white" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="h-11 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-[9px] font-black uppercase outline-none dark:text-white">
            <option value="TODOS">STATUS</option>
            <option value={ExpenseStatus.PAGO}>PAGOS</option>
            <option value={ExpenseStatus.A_VENCER}>A VENCER</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DRECard label="Faturamento" value={dreData.rangeSales} icon={ArrowUpRight} color="emerald" />
        <DRECard label="Despesas" value={dreData.totalExpenses} icon={ArrowDownRight} color="rose" />
        <DRECard label="Saldo Líquido" value={dreData.netProfit} icon={Wallet} color={dreData.netProfit >= 0 ? 'sky' : 'rose'} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 dark:text-slate-600 text-[9px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">DATA</th>
                <th className="px-6 py-4">CATEGORIA</th>
                <th className="px-6 py-4">DESCRIÇÃO</th>
                <th className="px-6 py-4 text-right">VALOR</th>
                <th className="px-6 py-4 text-center">STATUS</th>
                <th className="px-6 py-4 text-right no-print">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 group transition-colors">
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-500">{new Date(e.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[8px] font-black text-slate-500 uppercase">{e.category}</span></td>
                  <td className="px-6 py-4 font-black text-xs text-slate-800 dark:text-slate-200">{e.description}</td>
                  <td className="px-6 py-4 text-right font-black text-rose-600 dark:text-rose-400">R$ {e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => onUpdate({...e, status: e.status === ExpenseStatus.PAGO ? ExpenseStatus.A_VENCER : ExpenseStatus.PAGO})} className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase transition-all ${e.status === ExpenseStatus.PAGO ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-amber-600 border border-amber-100 dark:border-amber-900/30'}`}>{e.status}</button>
                  </td>
                  <td className="px-6 py-4 text-right no-print">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleEdit(e)} className="p-2 text-slate-300 hover:text-sky-500 transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => onDelete(e.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isMobileFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-sm" onClick={resetForm} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl dark:shadow-none border border-transparent dark:border-slate-800 relative animate-in zoom-in-95">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">Lançar <span className="text-rose-500">Despesa</span></h3>
                <button onClick={resetForm} className="p-2 text-slate-300 dark:text-slate-700"><X size={24}/></button>
             </div>
             <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2">Categoria</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl font-black text-[10px] dark:text-white uppercase outline-none">
                         {FIXED_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2">Data</label>
                      <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs dark:text-white outline-none" required />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2">Descrição</label>
                   <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="EX: CONTA DE LUZ" className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs uppercase dark:text-white outline-none" required />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2">Valor R$</label>
                   <input type="text" value={value} onChange={e => setValue(e.target.value)} placeholder="0,00" className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl font-black text-base dark:text-white outline-none" required />
                </div>
                <button type="submit" className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-6 shadow-xl active:scale-95 transition-all">SALVAR DESPESA</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DRECard = ({ label, value, icon: Icon, color }: any) => {
  const themes: any = {
    sky: "bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    rose: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
  };
  return (
    <div className={`p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${themes[color]}`}><Icon size={16} /></div>
      </div>
      <p className={`text-xl font-black ${themes[color].split(' ')[2]}`}>R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
    </div>
  );
};

export default ExpensesView;
