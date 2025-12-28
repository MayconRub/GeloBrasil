
import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Search, Pencil, ChevronLeft, ChevronRight, CheckCircle2,
  Receipt, Clock, X, User, Filter, ArrowDown, Wallet
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

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const monthTotalExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.dueDate + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, e) => sum + e.value, 0);
  }, [expenses, currentMonth, currentYear]);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        const d = new Date(e.dueDate + 'T00:00:00');
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && 
               (e.description.toLowerCase().includes(searchTerm.toLowerCase()) || e.category.toLowerCase().includes(searchTerm.toLowerCase()));
      })
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [expenses, currentMonth, currentYear, searchTerm]);

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
    if (confirm(`DESEJA EDITAR A DESPESA "${exp.description}" NO VALOR DE R$ ${exp.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}?`)) {
      setEditingId(exp.id);
      setDescription(exp.description);
      setValue(exp.value.toString());
      setDueDate(exp.dueDate);
      setCategory(exp.category);
      setEmployeeId(exp.employeeId || '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = (exp: Expense) => {
    if (confirm(`ATENÇÃO: DESEJA REALMENTE EXCLUIR A DESPESA "${exp.description}"? ESTA AÇÃO É IRREVERSÍVEL.`)) {
      onDelete(exp.id);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setDescription('');
    setValue('');
    setDueDate(getTodayString());
    setCategory('GERAL');
    setEmployeeId('');
  };

  const getEmployeeName = (id?: string) => employees.find(e => e.id === id)?.name;

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black text-[#1e293b] tracking-tighter uppercase flex items-center gap-2">
            FLUXO <span className="text-[#f43f5e]">DESPESAS</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            PLANILHA DE CONTAS {monthName.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
              <ArrowDown size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">SAÍDA TOTAL</p>
              <h4 className="text-xl font-black text-slate-800">R$ {monthTotalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
            </div>
          </div>

          <div className="flex bg-white p-1 border border-slate-100 rounded-2xl shadow-sm">
            <button onClick={() => setSelectedDate(new Date(currentYear, currentMonth - 1, 1))} className="p-2.5 text-slate-400 hover:text-sky-500"><ChevronLeft size={18} /></button>
            <div className="px-4 py-2 flex items-center font-black text-[10px] text-slate-700 uppercase min-w-[140px] justify-center">
              {monthName}
            </div>
            <button onClick={() => setSelectedDate(new Date(currentYear, currentMonth + 1, 1))} className="p-2.5 text-slate-400 hover:text-sky-500"><ChevronRight size={18} /></button>
          </div>
        </div>
      </header>

      {/* Input de Lançamento Horizontal */}
      <form onSubmit={handleAdd} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-wrap items-end gap-4 no-print">
        <div className="flex-1 min-w-[140px] space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1">
             CATEGORIA <Filter size={10} className="text-sky-400" />
          </label>
          <select 
            value={category} 
            onChange={e => setCategory(e.target.value)}
            className="w-full h-14 px-5 bg-[#f8fafc] border border-slate-100 rounded-2xl outline-none font-black text-[10px] text-sky-600 uppercase"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex-[2] min-w-[200px] space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">DESCRIÇÃO DA CONTA</label>
          <input 
            type="text" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="EX: CONTA DE LUZ" 
            className="w-full h-14 px-5 bg-[#f8fafc] border border-slate-100 rounded-2xl outline-none font-bold text-xs uppercase" 
            required
          />
        </div>

        <div className="flex-1 min-w-[120px] space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">VALOR</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
            <input 
              type="text" 
              value={value} 
              onChange={e => setValue(e.target.value)} 
              placeholder="0,00" 
              className="w-full h-14 pl-10 pr-5 bg-[#f8fafc] border border-slate-100 rounded-2xl outline-none font-black text-xs" 
              required
            />
          </div>
        </div>

        <div className="flex-1 min-w-[140px] space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">VENCIMENTO</label>
          <input 
            type="date" 
            value={dueDate} 
            onChange={e => setDueDate(e.target.value)} 
            className="w-full h-14 px-5 bg-[#f8fafc] border border-slate-100 rounded-2xl outline-none font-bold text-xs" 
            required
          />
        </div>

        <div className="w-14">
          <button 
            type="submit" 
            className="w-full h-14 bg-[#0f172a] text-white rounded-2xl font-black shadow-lg hover:bg-sky-600 transition-all flex items-center justify-center active:scale-95"
          >
            {editingId ? <Pencil size={20} /> : <Plus size={24} />}
          </button>
        </div>

        {/* Vínculo de Funcionário Opcional */}
        <div className="w-full flex gap-4 mt-2">
           <select 
             value={employeeId} 
             onChange={e => setEmployeeId(e.target.value)}
             className="flex-1 h-10 px-4 bg-[#f8fafc] border border-slate-100 rounded-xl outline-none text-[9px] font-black text-slate-400 uppercase"
           >
             <option value="">VINCULAR FUNCIONÁRIO RESPONSÁVEL (OPCIONAL)</option>
             {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
           </select>
           {editingId && (
            <button type="button" onClick={resetForm} className="h-10 px-6 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase">Cancelar Edição</button>
           )}
        </div>
      </form>

      {/* Listagem */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
           <Search size={20} className="text-slate-300" />
           <input 
             type="text" 
             placeholder="FILTRAR LANÇAMENTOS..." 
             value={searchTerm} 
             onChange={e => setSearchTerm(e.target.value)} 
             className="bg-transparent border-none outline-none text-[10px] font-black uppercase w-full placeholder:text-slate-300" 
           />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">DESCRIÇÃO</th>
                <th className="px-8 py-5">CATEGORIA / RESPONSÁVEL</th>
                <th className="px-8 py-5">VALOR</th>
                <th className="px-8 py-5">VENCIMENTO</th>
                <th className="px-8 py-5">STATUS</th>
                <th className="px-8 py-5 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(e => (
                <tr key={e.id} className="group hover:bg-sky-50/20 transition-all">
                  <td className="px-8 py-5">
                    <span className="font-black text-[#1e293b] text-xs uppercase">{e.description}</span>
                  </td>
                  <td className="px-8 py-5 space-y-1">
                    <span className="inline-block px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[8px] font-black uppercase border border-sky-100">
                      {e.category}
                    </span>
                    {e.employeeId && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded text-[7px] font-bold border border-indigo-100 w-fit">
                        <User size={10} /> {getEmployeeName(e.employeeId)}
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-black text-[#1e293b] text-sm">
                      R$ {e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <Clock size={14} className="text-slate-300" /> {new Date(e.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-[8px] font-black uppercase border ${e.status === ExpenseStatus.PAGO ? 'bg-[#10b981] border-[#10b981] text-white shadow-sm shadow-emerald-100' : e.status === ExpenseStatus.VENCIDO ? 'bg-rose-500 border-rose-500 text-white' : 'bg-amber-400 border-amber-400 text-white'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(e)} title="Editar" className="p-2 text-slate-400 hover:text-sky-500 transition-colors"><Pencil size={16}/></button>
                      <button onClick={() => onUpdate({...e, status: ExpenseStatus.PAGO})} title="Marcar como Pago" className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"><CheckCircle2 size={16}/></button>
                      <button onClick={() => handleDelete(e)} title="Excluir" className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-300 italic text-xs uppercase font-black tracking-widest">
                    Nenhum lançamento encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpensesView;
