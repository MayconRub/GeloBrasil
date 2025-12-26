
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Pencil, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  ArrowDownLeft,
  Filter,
  Receipt,
  Clock,
  LayoutList,
  Check
} from 'lucide-react';
import { Expense, ExpenseStatus, Vehicle, Employee } from '../types';

interface Props {
  expenses: Expense[];
  categories: string[];
  vehicles: Vehicle[];
  employees: Employee[];
  onUpdate: (expenses: Expense[]) => void;
  onUpdateCategories: (categories: string[]) => void;
}

const ExpensesView: React.FC<Props> = ({ expenses, categories, onUpdate }) => {
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [dueDate, setDueDate] = useState(getTodayString());
  const [category, setCategory] = useState(categories[0] || 'Geral');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const handleValueChange = (val: string) => {
    const sanitized = val.replace(/[^0-9.,]/g, '').replace(',', '.');
    setValue(sanitized);
  };

  const handlePrevMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleResetMonth = () => setSelectedDate(new Date());

  const handleMarkAsPaid = (expense: Expense) => {
    onUpdate(expenses.map(exp => exp.id === expense.id ? { ...exp, status: ExpenseStatus.PAGO } : exp));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value);
    if (!description || isNaN(numericValue) || !dueDate) return;
    
    const today = getTodayString();
    if (editingId) {
      onUpdate(expenses.map(exp => exp.id === editingId ? { ...exp, description, value: numericValue, dueDate, category } : exp));
      setEditingId(null);
    } else {
      const status = dueDate < today ? ExpenseStatus.VENCIDO : ExpenseStatus.A_VENCER;
      onUpdate([{ id: crypto.randomUUID(), description, value: numericValue, dueDate, status, category }, ...expenses]);
    }
    resetForm();
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setDescription(expense.description);
    setValue(expense.value.toString());
    setDueDate(expense.dueDate);
    setCategory(expense.category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null); setDescription(''); setValue(''); setDueDate(getTodayString()); setCategory(categories[0] || 'Geral');
  };

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        const d = new Date(e.dueDate + 'T00:00:00');
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && 
               (e.description.toLowerCase().includes(searchTerm.toLowerCase()) || e.category.toLowerCase().includes(searchTerm.toLowerCase()));
      })
      .sort((a, b) => new Date(a.dueDate + 'T00:00:00').getTime() - new Date(b.dueDate + 'T00:00:00').getTime());
  }, [expenses, currentMonth, currentYear, searchTerm]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter leading-none">Fluxo <span className="text-rose-500">Despesas</span></h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <LayoutList size={14} className="text-rose-500" /> Planilha de Contas {monthName}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="glass-card px-5 sm:px-6 py-3 rounded-2xl flex items-center gap-4 border-white">
             <div className="bg-rose-50 p-2 rounded-xl text-rose-500">
               <ArrowDownLeft size={20} />
             </div>
             <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Saída Total</p>
               <p className="text-lg sm:text-xl font-black text-slate-800 leading-none">
                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(filteredExpenses.reduce((sum, e) => sum + e.value, 0))}
               </p>
             </div>
          </div>
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button onClick={handlePrevMonth} className="flex-1 sm:flex-none p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-all active:scale-90"><ChevronLeft size={18} /></button>
            <button onClick={handleResetMonth} className="flex-[3] sm:flex-none px-4 py-1 flex flex-col items-center justify-center hover:bg-slate-50 rounded-xl transition-all min-w-[130px]">
              <span className="text-xs font-black text-slate-800 capitalize text-center">{monthName}</span>
            </button>
            <button onClick={handleNextMonth} className="flex-1 sm:flex-none p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-all active:scale-90"><ChevronRight size={18} /></button>
          </div>
        </div>
      </header>

      <form onSubmit={handleAdd} className="bg-white p-5 rounded-[2.5rem] shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-4 space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Descrição da Conta</label>
          <input type="text" placeholder="Ex: Conta de Luz" value={description} onChange={e => setDescription(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-rose-50 outline-none" required />
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Categoria</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none">
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Valor</label>
          <input type="text" placeholder="R$ 0,00" value={value} onChange={e => handleValueChange(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none" required />
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Vencimento</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none" required />
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="w-full h-12 bg-slate-900 text-white font-black rounded-2xl hover:bg-rose-600 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95">
            {editingId ? <Pencil size={16} /> : <Plus size={16} />} {editingId ? 'Salvar' : 'Lançar'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-50 bg-slate-50/50">
           <Search className="text-slate-300" size={20} />
           <input type="text" placeholder="Buscar na planilha..." className="bg-transparent border-none outline-none text-xs w-full font-bold" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {/* Mobile List View */}
        <div className="block md:hidden divide-y divide-slate-100">
           {filteredExpenses.map((e) => (
             <div key={e.id} className="p-5 flex flex-col gap-4 active:bg-rose-50/20 transition-all">
                <div className="flex items-start justify-between">
                   <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          e.status === ExpenseStatus.PAGO ? 'bg-emerald-500 border-emerald-500 text-white' : 
                          e.status === ExpenseStatus.VENCIDO ? 'bg-rose-500 border-rose-500 text-white' : 
                          'bg-white border-amber-200 text-amber-600'
                        }`}>
                          {e.status}
                        </span>
                        <span className="text-[7px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-400 uppercase">{e.category}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-800 leading-tight">{e.description}</h4>
                      <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        <Clock size={10} /> Venc: {new Date(e.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </div>
                   </div>
                   <span className="text-lg font-black text-slate-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(e.value)}
                   </span>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                   {e.status !== ExpenseStatus.PAGO && (
                      <button onClick={() => handleMarkAsPaid(e)} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest">
                        <Check size={14} /> Pagar
                      </button>
                   )}
                   <button onClick={() => handleEdit(e)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                      <Pencil size={16} />
                   </button>
                   <button onClick={() => onUpdate(expenses.filter(x => x.id !== e.id))} className="p-2.5 bg-rose-50 text-rose-400 rounded-xl">
                      <Trash2 size={16} />
                   </button>
                </div>
             </div>
           ))}
           {filteredExpenses.length === 0 && (
             <div className="py-12 px-6 text-center text-slate-400 italic text-xs">Nenhuma despesa encontrada para este período.</div>
           )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4 w-1/4">Descrição</th>
                <th className="px-6 py-4 w-1/6">Categoria</th>
                <th className="px-6 py-4 w-1/6">Valor</th>
                <th className="px-6 py-4 w-1/6">Vencimento</th>
                <th className="px-6 py-4 w-1/6">Status</th>
                <th className="px-6 py-4 w-24 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="group hover:bg-rose-50/20 transition-all">
                  <td className="px-6 py-3 truncate text-xs font-black text-slate-800">{e.description}</td>
                  <td className="px-6 py-3">
                    <span className="text-[9px] font-black bg-slate-100 px-2 py-1 rounded-md text-slate-500 uppercase">{e.category}</span>
                  </td>
                  <td className="px-6 py-3 text-xs font-black text-slate-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(e.value)}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <Clock size={12} /> {new Date(e.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border ${
                      e.status === ExpenseStatus.PAGO ? 'bg-emerald-500 border-emerald-500 text-white' : 
                      e.status === ExpenseStatus.VENCIDO ? 'bg-rose-500 border-rose-500 text-white' : 
                      'bg-white border-amber-200 text-amber-600'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center gap-2 transition-all">
                      {e.status !== ExpenseStatus.PAGO && (
                        <button onClick={() => handleMarkAsPaid(e)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg"><CheckCircle size={14} /></button>
                      )}
                      <button onClick={() => handleEdit(e)} className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg"><Pencil size={14} /></button>
                      <button onClick={() => onUpdate(expenses.filter(x => x.id !== e.id))} className="p-1.5 text-rose-300 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpensesView;
