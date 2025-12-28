
import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Search, Pencil, ChevronLeft, ChevronRight, CheckCircle2,
  Receipt, Clock, X, User, Filter, ArrowDown, Wallet, Calendar,
  Save, RotateCcw
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
      
      if (window.innerWidth < 1024) {
        setIsMobileFormOpen(true);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
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
    setIsMobileFormOpen(false);
  };

  const getEmployeeName = (id?: string) => employees.find(e => e.id === id)?.name;

  const renderForm = (isModal = false) => (
    <form onSubmit={handleAdd} className={`${isModal ? '' : 'hidden lg:flex bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex-wrap items-end gap-4 no-print'}`}>
      <div className={`${isModal ? 'space-y-4' : 'flex flex-wrap items-end gap-4 w-full'}`}>
        <div className={`${isModal ? 'w-full' : 'w-full sm:flex-1 min-w-[140px]'} space-y-1.5`}>
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

        <div className={`${isModal ? 'w-full' : 'w-full sm:flex-[2] min-w-[200px]'} space-y-1.5`}>
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

        <div className={`${isModal ? 'w-full' : 'w-full sm:flex-1 min-w-[120px]'} space-y-1.5`}>
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

        <div className={`${isModal ? 'w-full' : 'w-full sm:flex-1 min-w-[140px]'} space-y-1.5`}>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">VENCIMENTO</label>
          <input 
            type="date" 
            value={dueDate} 
            onChange={e => setDueDate(e.target.value)} 
            className="w-full h-14 px-5 bg-[#f8fafc] border border-slate-100 rounded-2xl outline-none font-bold text-xs" 
            required
          />
        </div>

        {!isModal && (
          <div className="w-full sm:w-14">
            <button 
              type="submit" 
              className="w-full h-14 bg-[#0f172a] text-white rounded-2xl font-black shadow-lg hover:bg-sky-600 transition-all flex items-center justify-center active:scale-95"
            >
              {editingId ? <Pencil size={20} /> : <Plus size={24} />}
            </button>
          </div>
        )}

        <div className={`${isModal ? 'w-full' : 'w-full'} flex flex-col sm:flex-row gap-4 mt-2`}>
           <select 
             value={employeeId} 
             onChange={e => setEmployeeId(e.target.value)}
             className="flex-1 h-12 px-4 bg-[#f8fafc] border border-slate-100 rounded-xl outline-none text-[9px] font-black text-slate-400 uppercase"
           >
             <option value="">VINCULAR FUNCIONÁRIO (OPCIONAL)</option>
             {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
           </select>
           {editingId && !isModal && (
            <button type="button" onClick={resetForm} className="h-12 px-6 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase">Cancelar Edição</button>
           )}
        </div>

        {isModal && (
          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Save size={18} /> {editingId ? 'Atualizar' : 'Lançar'}
            </button>
            <button type="button" onClick={resetForm} className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center">
              <X size={20} />
            </button>
          </div>
        )}
      </div>
    </form>
  );

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      
      {/* Top Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-[#1e293b] tracking-tighter uppercase flex items-center gap-2 leading-none">
              FLUXO <span className="text-[#f43f5e]">DESPESAS</span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
              PLANILHA DE CONTAS {monthName.toUpperCase()}
            </p>
          </div>
          
          {/* Botão Ação Rápida Mobile */}
          <button 
            onClick={() => setIsMobileFormOpen(true)}
            className="md:hidden w-12 h-12 bg-[#0f172a] text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
              <ArrowDown size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">SAÍDA TOTAL</p>
              <h4 className="text-xl font-black text-slate-800 text-sm sm:text-xl leading-none">R$ {monthTotalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
            </div>
          </div>

          <div className="flex bg-white p-1 border border-slate-100 rounded-2xl shadow-sm no-print">
            <button onClick={() => setSelectedDate(new Date(currentYear, currentMonth - 1, 1))} className="p-2.5 text-slate-400 hover:text-sky-500"><ChevronLeft size={18} /></button>
            <div className="px-4 py-2 flex items-center font-black text-[10px] text-slate-700 uppercase min-w-[140px] justify-center text-center">
              {monthName}
            </div>
            <button onClick={() => setSelectedDate(new Date(currentYear, currentMonth + 1, 1))} className="p-2.5 text-slate-400 hover:text-sky-500"><ChevronRight size={18} /></button>
          </div>
        </div>
      </header>

      {/* Input de Lançamento Responsivo - Desktop Only */}
      {renderForm()}

      {/* Listagem Responsiva */}
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
        
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredExpenses.map(e => (
            <div key={e.id} className="p-5 space-y-4 group active:bg-sky-50/30 transition-all">
               <div className="flex justify-between items-start">
                  <div className="space-y-1">
                     <h4 className="font-black text-slate-800 text-xs uppercase">{e.description}</h4>
                     <div className="flex flex-wrap gap-2">
                        <span className="inline-block px-2 py-0.5 bg-sky-50 text-sky-600 rounded text-[7px] font-black uppercase border border-sky-100">
                          {e.category}
                        </span>
                        {e.employeeId && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded text-[7px] font-bold border border-indigo-100">
                            <User size={8} /> {getEmployeeName(e.employeeId)}
                          </div>
                        )}
                     </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(e)} className="p-2 text-slate-300"><Pencil size={18}/></button>
                    <button onClick={() => handleDelete(e)} className="p-2 text-rose-200"><Trash2 size={18}/></button>
                  </div>
               </div>
               
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                     <Calendar size={12} className="text-slate-300" /> {new Date(e.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="font-black text-slate-800 text-sm">
                       R$ {e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                     </span>
                     <button onClick={() => onUpdate({...e, status: ExpenseStatus.PAGO})} className={`p-2 rounded-lg transition-colors ${e.status === ExpenseStatus.PAGO ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                        <CheckCircle2 size={16} />
                     </button>
                  </div>
               </div>

               <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest ${e.status === ExpenseStatus.PAGO ? 'bg-emerald-50 text-emerald-600' : e.status === ExpenseStatus.VENCIDO ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                    {e.status}
                  </span>
               </div>
            </div>
          ))}
          {filteredExpenses.length === 0 && (
            <div className="py-20 text-center text-slate-300 italic text-[10px] uppercase font-black tracking-widest">
              Nenhum lançamento
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
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
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Mobile para Novo Lançamento */}
      {isMobileFormOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 md:hidden">
           <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setIsMobileFormOpen(false)}
                className="absolute top-6 right-6 text-slate-300 hover:text-rose-500 transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                  <Receipt size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase leading-none">Lançar Despesa</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Fluxo de Caixa Mobile</p>
                </div>
              </div>

              <div className="mt-4">
                {renderForm(true)}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesView;
