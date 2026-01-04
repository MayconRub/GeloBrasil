
import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Search, Pencil, ChevronLeft, ChevronRight, CheckCircle2,
  Receipt, Clock, X, User, Filter, ArrowDown, Wallet, Calendar,
  Save, RotateCcw, ArrowUpRight, ArrowDownRight, Printer, Download
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

const ExpensesView: React.FC<Props> = ({ expenses, categories, vehicles, employees, sales, onUpdate, onDelete }) => {
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [dueDate, setDueDate] = useState(getTodayString());
  const [category, setCategory] = useState('GERAL');
  const [employeeId, setEmployeeId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'TODOS' | ExpenseStatus>('TODOS');

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Estatísticas Rápidas (P&L Mode)
  const stats = useMemo(() => {
    const filtered = expenses.filter(e => {
      const d = new Date(e.dueDate + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const total = filtered.reduce((sum, e) => sum + e.value, 0);
    const paid = filtered.filter(e => e.status === ExpenseStatus.PAGO).reduce((sum, e) => sum + e.value, 0);
    const pending = total - paid;
    const overDue = filtered.filter(e => e.status === ExpenseStatus.VENCIDO).reduce((sum, e) => sum + e.value, 0);

    return { total, paid, pending, overDue };
  }, [expenses, currentMonth, currentYear]);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        const d = new Date(e.dueDate + 'T00:00:00');
        const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || e.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'TODOS' || e.status === statusFilter;
        const matchesMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        return matchesSearch && matchesStatus && matchesMonth;
      })
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [expenses, currentMonth, currentYear, searchTerm, statusFilter]);

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
      category: category.toUpperCase(),
      employeeId: employeeId || undefined
    });
    resetForm();
  };

  const handleEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setDescription(exp.description);
    setValue(exp.value.toString());
    setDueDate(exp.dueDate);
    setCategory(exp.category);
    setEmployeeId(exp.employeeId || '');
    if (window.innerWidth < 1024) setIsMobileFormOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setDescription('');
    setValue('');
    setDueDate(getTodayString());
    setCategory('GERAL');
    setEmployeeId('');
    setIsMobileFormOpen(false);
  };

  const getEmployeeName = (id?: string) => employees.find(e => e.id === id)?.name;

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      
      {/* Header Estilo P&L */}
      <header className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5 w-full lg:w-auto">
          <div className="w-14 h-14 bg-rose-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl rotate-2 shrink-0">
            <Receipt size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">Gestão <span className="text-rose-500">Financeira</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <Calendar size={12} /> Planilha {monthName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
           <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button onClick={() => setSelectedDate(new Date(currentYear, currentMonth - 1, 1))} className="p-2 text-slate-400 hover:text-slate-700 transition-all"><ChevronLeft size={18} /></button>
              <div className="px-4 py-2 text-[10px] font-black text-slate-700 uppercase min-w-[120px] text-center">{monthName}</div>
              <button onClick={() => setSelectedDate(new Date(currentYear, currentMonth + 1, 1))} className="p-2 text-slate-400 hover:text-slate-700 transition-all"><ChevronRight size={18} /></button>
           </div>
           <button onClick={() => setIsMobileFormOpen(true)} className="flex-1 lg:flex-none h-12 px-6 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95">
              <Plus size={18} /> Novo Lançamento
           </button>
        </div>
      </header>

      {/* Cards de Resumo Estilo Dashboard Financeiro */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total do Mês" value={stats.total} icon={ArrowDown} color="slate" />
        <StatCard label="Total Pago" value={stats.paid} icon={CheckCircle2} color="emerald" />
        <StatCard label="Pendente" value={stats.pending} icon={Clock} color="amber" />
        <StatCard label="Vencido" value={stats.overDue} icon={X} color="rose" />
      </div>

      {/* Planilha de Despesas (Modo Planilha P&L) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Barra de Filtros da Planilha */}
        <div className="p-4 sm:p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="PROCURAR NA PLANILHA..." 
                className="w-full h-11 pl-12 pr-4 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-sky-50"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value as any)}
              className="h-11 px-4 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase outline-none"
            >
              <option value="TODOS">TODOS STATUS</option>
              <option value={ExpenseStatus.PAGO}>PAGO</option>
              <option value={ExpenseStatus.A_VENCER}>A VENCER</option>
              <option value={ExpenseStatus.VENCIDO}>VENCIDO</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
             <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-sky-500"><Printer size={16} /></button>
             <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-500"><Download size={16} /></button>
          </div>
        </div>

        {/* Corpo da Planilha */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4 w-12">#</th>
                <th className="px-6 py-4">Descrição da Conta</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredExpenses.map((e, idx) => (
                <tr key={e.id} className="hover:bg-slate-50/50 group transition-colors">
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-300">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700 uppercase">{e.description}</span>
                      {e.employeeId && <span className="text-[8px] font-bold text-sky-400 uppercase flex items-center gap-1 mt-1"><User size={8}/> {getEmployeeName(e.employeeId)}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-[8px] font-black text-slate-500 uppercase">{e.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-500">{new Date(e.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-black text-slate-800">R$ {e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onUpdate({...e, status: e.status === ExpenseStatus.PAGO ? ExpenseStatus.A_VENCER : ExpenseStatus.PAGO})}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${e.status === ExpenseStatus.PAGO ? 'bg-emerald-50 text-emerald-600' : e.status === ExpenseStatus.VENCIDO ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-amber-50 text-amber-600'}`}
                    >
                      {e.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(e)} className="p-2 text-slate-400 hover:text-sky-500"><Pencil size={14} /></button>
                      <button onClick={() => onDelete(e.id)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredExpenses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
               <Receipt size={64} className="mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest">Nenhum lançamento encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal (Mobile & Desktop) */}
      {isMobileFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={resetForm} />
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{editingId ? 'Editar Conta' : 'Nova Despesa'}</h3>
                <button onClick={resetForm} className="p-2 text-slate-300"><X size={24}/></button>
             </div>
             <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Categoria</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-[10px] uppercase">
                         {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Vencimento</label>
                      <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs" required />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Descrição / Fornecedor</label>
                   <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="EX: CEMIG" className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs uppercase" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Valor R$</label>
                      <input type="text" value={value} onChange={e => setValue(e.target.value)} placeholder="0,00" className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-xs" required />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Funcionário</label>
                      <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase">
                         <option value="">NENHUM</option>
                         {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                      </select>
                   </div>
                </div>
                <button type="submit" className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest mt-4">SALVAR NA PLANILHA</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const themes: any = {
    slate: "bg-white border-slate-100 text-slate-600",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
    amber: "bg-amber-50 border-amber-100 text-amber-600",
    rose: "bg-rose-50 border-rose-100 text-rose-600"
  };

  return (
    <div className={`p-5 rounded-[2rem] border shadow-sm flex items-center gap-4 ${themes[color]}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-white`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[8px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">{label}</p>
        <p className="text-sm sm:text-lg font-black leading-none truncate">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </div>
    </div>
  );
};

export default ExpensesView;
