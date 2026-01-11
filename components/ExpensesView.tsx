
import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Search, Pencil, CheckCircle2,
  Receipt, Clock, X, Wallet, Calendar,
  ArrowUpRight, ArrowDownRight, ArrowRight, TrendingUp,
  Filter, ChevronDown, DollarSign
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

  const getTodayString = () => new Date().toISOString().split('T')[0];
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);

  const dreData = useMemo(() => {
    const isInRange = (d: string) => d >= startDate && d <= endDate;
    const rangeSales = sales.filter(s => isInRange(s.date)).reduce((sum, s) => sum + s.value, 0);
    const rangeExpenses = expenses.filter(e => isInRange(e.dueDate));
    const totalExpenses = rangeExpenses.reduce((sum, e) => sum + e.value, 0);
    const paidExpenses = rangeExpenses.filter(e => e.status === ExpenseStatus.PAGO).reduce((sum, e) => sum + e.value, 0);
    const netProfit = rangeSales - totalExpenses;
    return { rangeSales, totalExpenses, paidExpenses, netProfit };
  }, [sales, expenses, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        const matchesDate = e.dueDate >= startDate && e.dueDate <= endDate;
        // Fixed: e.description or e.category might potentially be undefined
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
    setEditingId(null); setDescription(''); setValue(''); setDueDate(getTodayString()); setCategory('GERAL'); setIsMobileFormOpen(false);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto transition-colors uppercase bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
      
      {/* Header Estilo Imagem */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-5 w-full sm:w-auto">
          <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg rotate-2 shrink-0">
            <Receipt size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tight">BLOCO DE <span className="text-rose-500">DESPESAS</span></h1>
            <p className="text-[10px] font-bold text-sky-500 mt-1.5 uppercase tracking-widest flex items-center gap-2">
              <Plus size={12} strokeWidth={3} /> LANÇAMENTO RÁPIDO (PAD)
            </p>
          </div>
        </div>
        <button onClick={() => setIsMobileFormOpen(true)} className="w-full sm:w-auto px-10 h-14 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3">
           <Plus size={20} /> Novo Lançamento
        </button>
      </header>

      {/* Filtros Consolidados Estilo Imagem */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4 no-print">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-2xl px-5 h-14 border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-black text-slate-400 mr-3">DE</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-[11px] font-bold dark:text-white outline-none w-full" />
            <ArrowRight size={16} className="text-slate-200 mx-2" />
            <span className="text-[9px] font-black text-slate-400 mr-3">ATÉ</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent text-[11px] font-bold dark:text-white outline-none w-full" />
          </div>
        </div>
        
        <div className="relative flex-1 lg:max-w-md">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            placeholder="FILTRAR..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full h-14 pl-14 pr-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-full text-[10px] font-black outline-none dark:text-white focus:ring-2 focus:ring-sky-500/10 uppercase"
          />
        </div>

        <div className="lg:w-48">
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value as any)} 
            className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-full text-[10px] font-black uppercase outline-none dark:text-white appearance-none text-center"
          >
            <option value="TODOS">STATUS</option>
            <option value={ExpenseStatus.PAGO}>PAGOS</option>
            <option value={ExpenseStatus.A_VENCER}>A VENCER</option>
          </select>
        </div>
      </div>

      {/* Cards de Métricas Estilo Imagem */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard label="FATURAMENTO" value={dreData.rangeSales} icon={ArrowUpRight} color="emerald" />
        <SummaryCard label="DESPESAS" value={dreData.totalExpenses} icon={ArrowDownRight} color="rose" />
        <SummaryCard label="SALDO LÍQUIDO" value={dreData.netProfit} icon={Wallet} color="sky" />
      </div>

      {/* Tabela Estilo Imagem */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 dark:text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-50 dark:border-slate-800">
                <th className="px-8 py-6">DATA</th>
                <th className="px-8 py-6">CATEGORIA</th>
                <th className="px-8 py-6">DESCRIÇÃO</th>
                <th className="px-8 py-6 text-right">VALOR</th>
                <th className="px-8 py-6 text-center">STATUS</th>
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
                      onClick={() => onUpdate({...e, status: e.status === ExpenseStatus.PAGO ? ExpenseStatus.A_VENCER : ExpenseStatus.PAGO})} 
                      className={`px-5 py-2 rounded-full text-[8px] font-black uppercase transition-all shadow-sm ${e.status === ExpenseStatus.PAGO ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-amber-500 border border-amber-100 dark:border-amber-900/30'}`}
                    >
                      {e.status}
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
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nenhuma despesa no período</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Estilizado */}
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
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-3">Data</label>
                      <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-xs dark:text-white outline-none" required />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-3">Descrição</label>
                   <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="EX: CONTA DE LUZ" className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-xs uppercase dark:text-white outline-none" required />
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
      bg: "bg-rose-50 dark:bg-rose-950/30", 
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
