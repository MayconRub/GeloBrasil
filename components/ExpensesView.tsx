
import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Search, Pencil, ChevronLeft, ChevronRight, CheckCircle2,
  Receipt, Clock, X, User, ArrowDown, Wallet, Calendar,
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Printer, Download
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

  // Cálculo DRE (P&L)
  const drelData = useMemo(() => {
    const isThisMonth = (d: string) => {
      const date = new Date(d + 'T00:00:00');
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    };

    const monthlySales = sales.filter(s => isThisMonth(s.date)).reduce((sum, s) => sum + s.value, 0);
    const monthlyExpenses = expenses.filter(e => isThisMonth(e.dueDate));
    
    const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.value, 0);
    const paidExpenses = monthlyExpenses.filter(e => e.status === ExpenseStatus.PAGO).reduce((sum, e) => sum + e.value, 0);
    const pendingExpenses = totalExpenses - paidExpenses;
    
    const netProfit = monthlySales - paidExpenses;
    const breakEvenProgress = totalExpenses > 0 ? (monthlySales / totalExpenses) * 100 : 0;

    return { monthlySales, totalExpenses, paidExpenses, pendingExpenses, netProfit, breakEvenProgress };
  }, [sales, expenses, currentMonth, currentYear]);

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
      
      <header className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5 w-full lg:w-auto">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl rotate-2 shrink-0">
            <DollarSign size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">DRE <span className="text-rose-500">Express</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <Calendar size={12} /> Demonstrativo {monthName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
           <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button onClick={() => setSelectedDate(new Date(currentYear, currentMonth - 1, 1))} className="p-2 text-slate-400 hover:text-slate-700 transition-all"><ChevronLeft size={18} /></button>
              <div className="px-4 py-2 text-[10px] font-black text-slate-700 uppercase min-w-[120px] text-center">{monthName}</div>
              <button onClick={() => setSelectedDate(new Date(currentYear, currentMonth + 1, 1))} className="p-2 text-slate-400 hover:text-slate-700 transition-all"><ChevronRight size={18} /></button>
           </div>
           <button onClick={() => setIsMobileFormOpen(true)} className="flex-1 lg:flex-none h-12 px-6 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
              <Plus size={18} /> Novo Lançamento
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DRECard label="Faturamento Bruto" value={drelData.monthlySales} icon={ArrowUpRight} color="emerald" />
        <DRECard label="Custos de Operação" value={drelData.totalExpenses} icon={ArrowDownRight} color="rose" />
        <DRECard label="Saldo Líquido (Pago)" value={drelData.netProfit} icon={Wallet} color={drelData.netProfit >= 0 ? 'sky' : 'rose'} />
        
        <div className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ponto de Equilíbrio</span>
            <span className="text-[10px] font-black text-slate-800">{drelData.breakEvenProgress.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
            <div 
              className={`h-full transition-all duration-1000 ${drelData.breakEvenProgress >= 100 ? 'bg-emerald-500' : 'bg-sky-500'}`}
              style={{ width: `${Math.min(100, drelData.breakEvenProgress)}%` }}
            ></div>
          </div>
          <p className="text-[8px] font-bold text-slate-400 mt-2 uppercase text-center">
            {drelData.breakEvenProgress >= 100 ? 'Operação no Lucro' : `Faltam R$ ${(drelData.totalExpenses - drelData.monthlySales).toLocaleString('pt-BR')} para cobrir as contas`}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 sm:p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="BUSCAR CONTA NA PLANILHA..." 
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
              <option value="TODOS">FILTRAR STATUS</option>
              <option value={ExpenseStatus.PAGO}>APENAS PAGOS</option>
              <option value={ExpenseStatus.A_VENCER}>A VENCER</option>
              <option value={ExpenseStatus.VENCIDO}>VENCIDOS</option>
            </select>
          </div>
          <div className="flex items-center gap-2 no-print">
             <button onClick={() => window.print()} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-sky-500"><Printer size={16} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Fornecedor / Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4 text-right">Valor Bruto</th>
                <th className="px-6 py-4 text-center">Status Pagto</th>
                <th className="px-6 py-4 text-right no-print">Gerenciar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredExpenses.map((e, idx) => (
                <tr key={e.id} className="hover:bg-slate-50/50 group transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-800 uppercase leading-none">{e.description}</span>
                      {e.employeeId && <span className="text-[7px] font-bold text-sky-400 uppercase flex items-center gap-1 mt-1.5"><User size={8}/> {getEmployeeName(e.employeeId)}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-[8px] font-black text-slate-500 uppercase">{e.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold ${e.status === ExpenseStatus.VENCIDO ? 'text-rose-500 underline' : 'text-slate-500'}`}>{new Date(e.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-black text-slate-900">R$ {e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onUpdate({...e, status: e.status === ExpenseStatus.PAGO ? ExpenseStatus.A_VENCER : ExpenseStatus.PAGO})}
                      className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase transition-all shadow-sm ${e.status === ExpenseStatus.PAGO ? 'bg-emerald-500 text-white' : e.status === ExpenseStatus.VENCIDO ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-amber-600 border border-amber-100'}`}
                    >
                      {e.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right no-print">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(e)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-sky-500 rounded-xl"><Pencil size={14} /></button>
                      <button onClick={() => onDelete(e.id)} className="p-2.5 bg-rose-50 text-rose-300 hover:text-rose-500 rounded-xl"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredExpenses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 opacity-20">
               <Receipt size={64} className="mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma movimentação para o período</p>
            </div>
          )}
        </div>
      </div>

      {isMobileFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={resetForm} />
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">Lançamento de <span className="text-rose-500">Gasto</span></h3>
                <button onClick={resetForm} className="p-2 text-slate-300 hover:text-rose-500 transition-all"><X size={24}/></button>
             </div>
             <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Categoria DRE</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-[10px] uppercase outline-none focus:ring-4 focus:ring-sky-50">
                         {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Vencimento</label>
                      <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none" required />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Descrição / Favorecido</label>
                   <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="EX: ENERGIA ELÉTRICA - CEMIG" className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs uppercase outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Valor da Conta</label>
                      <input type="text" value={value} onChange={e => setValue(e.target.value)} placeholder="0,00" className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-base outline-none" required />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Responsável</label>
                      <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase outline-none">
                         <option value="">NÃO INFORMADO</option>
                         {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                      </select>
                   </div>
                </div>
                <button type="submit" className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest mt-6 shadow-xl hover:bg-rose-600 transition-all active:scale-95">SALVAR NA PLANILHA</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DRECard = ({ label, value, icon: Icon, color }: any) => {
  const themes: any = {
    sky: "bg-sky-50 border-sky-100 text-sky-600",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
    rose: "bg-rose-50 border-rose-100 text-rose-600"
  };

  return (
    <div className={`p-6 rounded-[2rem] border shadow-sm flex flex-col justify-between min-h-[140px] bg-white`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${themes[color]}`}>
          <Icon size={16} />
        </div>
      </div>
      <div>
        <p className={`text-xl font-black leading-none ${themes[color].split(' ')[2]}`}>R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </div>
    </div>
  );
};

export default ExpensesView;
