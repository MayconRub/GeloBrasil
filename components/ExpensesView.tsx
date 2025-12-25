
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, CheckCircle2, Search, Settings2, X, Truck, AlertCircle, StickyNote, Tag, Pencil, Users, ChevronLeft, ChevronRight, FileDown } from 'lucide-react';
import { Expense, ExpenseStatus, Vehicle, Employee } from '../types';

interface Props {
  expenses: Expense[];
  categories: string[];
  vehicles: Vehicle[];
  employees: Employee[];
  onUpdate: (expenses: Expense[]) => void;
  onUpdateCategories: (categories: string[]) => void;
}

const ExpensesView: React.FC<Props> = ({ expenses, categories, vehicles, employees, onUpdate, onUpdateCategories }) => {
  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [dueDate, setDueDate] = useState(getTodayString());
  const [category, setCategory] = useState(categories[0] || 'Outros');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [observation, setObservation] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const handleValueChange = (val: string) => {
    const sanitized = val.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    setValue(sanitized);
  };

  const handlePrevMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleResetMonth = () => {
    setSelectedDate(new Date());
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value);
    if (!description || isNaN(numericValue) || !dueDate) return;
    
    let finalCategory = category;
    
    if (category === 'Outros' && newCategoryInput.trim()) {
      const trimmedName = newCategoryInput.trim();
      if (!categories.includes(trimmedName)) {
        onUpdateCategories([...categories, trimmedName]);
      }
      finalCategory = trimmedName;
    }

    const today = getTodayString();
    const categoriesWithVehicle = ['Manutenção', 'Combustível'];
    const categoriesWithEmployee = ['Folha de Pagamento', 'Adiantamento/Vales'];
    
    const hasVehicleLinked = categoriesWithVehicle.includes(finalCategory);
    const hasEmployeeLinked = categoriesWithEmployee.includes(finalCategory);

    if (editingId) {
      onUpdate(expenses.map(exp => {
        if (exp.id === editingId) {
          const status = dueDate < today && exp.status !== ExpenseStatus.PAGO ? ExpenseStatus.VENCIDO : 
                        dueDate >= today && exp.status !== ExpenseStatus.PAGO ? ExpenseStatus.A_VENCER : exp.status;
          return {
            ...exp,
            description,
            value: numericValue,
            dueDate,
            status,
            category: finalCategory,
            observation,
            vehicleId: (hasVehicleLinked && selectedVehicle) ? selectedVehicle : undefined,
            employeeId: (hasEmployeeLinked && selectedEmployee) ? selectedEmployee : undefined
          };
        }
        return exp;
      }));
      setEditingId(null);
    } else {
      const status = dueDate < today ? ExpenseStatus.VENCIDO : ExpenseStatus.A_VENCER;
      const newExpense: Expense = { 
        id: crypto.randomUUID(), 
        description, 
        value: numericValue, 
        dueDate, 
        status, 
        category: finalCategory,
        observation,
        vehicleId: (hasVehicleLinked && selectedVehicle) ? selectedVehicle : undefined,
        employeeId: (hasEmployeeLinked && selectedEmployee) ? selectedEmployee : undefined
      };
      onUpdate([newExpense, ...expenses]);
    }
    
    resetForm();
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setDescription(expense.description);
    setValue(expense.value.toString());
    setDueDate(expense.dueDate);
    setObservation(expense.observation || '');
    
    if (categories.includes(expense.category)) {
      setCategory(expense.category);
    } else {
      setCategory('Outros');
      setNewCategoryInput(expense.category);
    }
    
    setSelectedVehicle(expense.vehicleId || '');
    setSelectedEmployee(expense.employeeId || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setDescription(''); 
    setValue(''); 
    setDueDate(getTodayString());
    setObservation('');
    setSelectedVehicle('');
    setSelectedEmployee('');
    setNewCategoryInput('');
    setCategory(categories[0] || 'Outros');
  };

  const handleTogglePaid = (id: string) => {
    const today = getTodayString();
    onUpdate(expenses.map(e => {
      if (e.id === id) {
        if (e.status === ExpenseStatus.PAGO) {
          return { ...e, status: e.dueDate < today ? ExpenseStatus.VENCIDO : ExpenseStatus.A_VENCER };
        }
        return { ...e, status: ExpenseStatus.PAGO };
      }
      return e;
    }));
  };

  const addCategory = () => {
    if (newCategoryName && !categories.includes(newCategoryName)) {
      onUpdateCategories([...categories, newCategoryName]);
      setNewCategoryName('');
    }
  };

  const deleteCategory = (cat: string) => {
    onUpdateCategories(categories.filter(c => c !== cat));
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.dueDate + 'T00:00:00');
      const matchesMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (e.observation && e.observation.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesMonth && matchesSearch;
    });
  }, [expenses, currentMonth, currentYear, searchTerm]);

  const needsVehicleSelection = category === 'Manutenção' || category === 'Combustível';
  const needsEmployeeSelection = category === 'Folha de Pagamento' || category === 'Adiantamento/Vales';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="print-header">
        <h1 className="text-2xl font-black text-slate-900">Relatório de Despesas Mensais</h1>
        <div className="flex justify-between items-end mt-2">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Período: {monthName}</p>
          <p className="text-slate-400 font-medium text-[9px]">Emissão: {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Despesas</h2>
          <p className="text-sm text-slate-500 font-medium">Controle financeiro e agendamentos.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 no-print">
          <button 
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 group"
          >
            <FileDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
            <span className="text-xs uppercase tracking-wider">Exportar PDF</span>
          </button>

          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-1 shadow-sm w-full sm:w-auto">
            <button onClick={handlePrevMonth} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-all active:scale-90 shrink-0">
              <ChevronLeft size={18} />
            </button>
            <button onClick={handleResetMonth} className="flex-1 px-4 py-1 flex flex-col items-center justify-center hover:bg-slate-50 rounded-xl transition-all min-w-[120px]">
              <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest text-center">Período</span>
              <span className="text-xs font-bold text-slate-800 capitalize leading-tight text-center">{monthName}</span>
            </button>
            <button onClick={handleNextMonth} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-all active:scale-90 shrink-0">
              <ChevronRight size={18} />
            </button>
          </div>

          <button 
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-all bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm"
          >
            <Settings2 size={14} /> Categorias
          </button>
        </div>
      </header>

      {showCategoryManager && (
        <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 shadow-sm animate-in slide-in-from-top duration-300 no-print">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-indigo-900 flex items-center gap-2 text-sm">
              <Settings2 size={16} /> Gerenciar Categorias
            </h3>
            <button onClick={() => setShowCategoryManager(false)} className="text-indigo-400 hover:text-indigo-600"><X size={20} /></button>
          </div>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newCategoryName} 
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder="Digite o nome da nova categoria..."
              className="flex-1 h-11 px-4 bg-white border border-indigo-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button 
              onClick={addCategory}
              className="px-6 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
            >
              Adicionar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <span key={cat} className="flex items-center gap-2 bg-white border border-indigo-50 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 shadow-sm">
                {cat}
                <button onClick={() => deleteCategory(cat)} className="text-indigo-300 hover:text-rose-500 transition-colors"><X size={14} /></button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1 no-print">
          <form onSubmit={handleAdd} className={`bg-white p-6 rounded-3xl border ${editingId ? 'border-indigo-400 ring-2 ring-indigo-50' : 'border-slate-200'} shadow-sm sticky top-8 transition-all`}>
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                {editingId ? <Pencil className="text-indigo-600" size={18} /> : <Plus className="text-indigo-600" size={18} />}
                {editingId ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h3>
              {editingId && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 flex items-center gap-1"
                >
                  <X size={14} /> Cancelar
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Descrição</label>
                <input 
                  placeholder="Ex: Aluguel Comercial" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all" 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Categoria</label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)} 
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm transition-all cursor-pointer"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    {!categories.includes('Outros') && <option value="Outros">Outros</option>}
                  </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Valor (R$)</label>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    placeholder="0.00" 
                    value={value} 
                    onChange={e => handleValueChange(e.target.value)} 
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm transition-all font-mono font-bold" 
                    required 
                  />
                </div>
              </div>

              {category === 'Outros' && (
                <div className="animate-in slide-in-from-top-2 duration-300 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-2">
                  <label className="block text-[10px] font-black text-indigo-600 uppercase flex items-center gap-1">
                    <Tag size={12} /> {editingId ? 'Nome da Categoria' : 'Criar nova categoria?'}
                  </label>
                  <input 
                    placeholder="Digite o nome da categoria..." 
                    value={newCategoryInput} 
                    onChange={e => setNewCategoryInput(e.target.value)} 
                    className="w-full h-11 px-4 bg-white border border-indigo-200 rounded-xl outline-none text-sm transition-all focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              )}

              {needsVehicleSelection && (
                <div className="animate-in fade-in zoom-in-95 duration-200 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-2">
                  <label className="block text-[10px] font-black text-indigo-600 uppercase flex items-center gap-1">
                    <Truck size={12} /> Vincular Veículo (Opcional)
                  </label>
                  <select 
                    value={selectedVehicle} 
                    onChange={e => setSelectedVehicle(e.target.value)} 
                    className="w-full h-11 px-3 bg-white border border-indigo-200 rounded-xl outline-none text-sm transition-all cursor-pointer font-bold text-indigo-700"
                  >
                    <option value="">Não informar veículo</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} - {v.plate}</option>)}
                  </select>
                </div>
              )}

              {needsEmployeeSelection && (
                <div className="animate-in fade-in zoom-in-95 duration-200 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-2">
                  <label className="block text-[10px] font-black text-indigo-600 uppercase flex items-center gap-1">
                    <Users size={12} /> Vincular Funcionário (Opcional)
                  </label>
                  <select 
                    value={selectedEmployee} 
                    onChange={e => setSelectedEmployee(e.target.value)} 
                    className="w-full h-11 px-3 bg-white border border-indigo-200 rounded-xl outline-none text-sm transition-all cursor-pointer font-bold text-indigo-700"
                  >
                    <option value="">Não informar funcionário</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Data de Vencimento</label>
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm transition-all" 
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Observação (Opcional)</label>
                <input 
                  placeholder="Notas adicionais..." 
                  value={observation} 
                  onChange={e => setObservation(e.target.value)} 
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all" 
                />
              </div>

              <button 
                type="submit" 
                className={`w-full h-12 ${editingId ? 'bg-indigo-600' : 'bg-slate-900'} text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-indigo-100 active:scale-95 transition-all mt-2`}
              >
                {editingId ? 'Atualizar Despesa' : 'Salvar Despesa'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50/50 no-print">
              <Search className="text-slate-400 mr-2" size={18} />
              <input 
                type="text"
                placeholder="Pesquisar despesas por nome, categoria ou observação..."
                className="bg-transparent border-none outline-none text-sm w-full h-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-6 py-4">Vencimento</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4">Categoria / Recurso</th>
                    <th className="px-6 py-4 text-center">Obs</th>
                    <th className="px-6 py-4">Valor</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center no-print">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center opacity-30">
                          <AlertCircle size={40} className="mb-2" />
                          <p className="text-sm font-medium italic">Nenhum registro para {monthName}.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((e) => {
                      const vehicle = vehicles.find(v => v.id === e.vehicleId);
                      const employee = employees.find(emp => emp.id === e.employeeId);
                      return (
                        <tr key={e.id} className={`hover:bg-slate-50 transition-colors ${e.status === ExpenseStatus.PAGO ? 'bg-slate-50/30' : ''} ${editingId === e.id ? 'bg-indigo-50/50' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs font-bold text-slate-500">{new Date(e.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className={`text-sm font-bold ${e.status === ExpenseStatus.PAGO ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{e.description}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-md w-fit">{e.category}</span>
                              {vehicle && (
                                <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                                  <Truck size={10} /> {vehicle.name}
                                </span>
                              )}
                              {employee && (
                                <span className="text-[10px] font-bold text-teal-600 flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-md w-fit">
                                  <Users size={10} /> {employee.name}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {e.observation ? (
                              <div className="flex items-center justify-center group relative">
                                <StickyNote size={16} className="text-amber-400" />
                                <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-10 no-print">
                                  {e.observation}
                                </div>
                                <span className="hidden print:inline text-[8px] text-slate-500 italic ml-1">({e.observation})</span>
                              </div>
                            ) : (
                              <span className="text-slate-200">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className={`text-sm font-black ${e.status === ExpenseStatus.PAGO ? 'text-slate-400' : 'text-slate-900'}`}>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(e.value)}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                              e.status === ExpenseStatus.PAGO ? 'bg-emerald-100 text-emerald-700' : 
                              e.status === ExpenseStatus.VENCIDO ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {e.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 no-print">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => handleEdit(e)} 
                                className={`p-2 rounded-xl transition-all ${editingId === e.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 hover:text-indigo-600'}`}
                                title="Editar"
                              >
                                <Pencil size={18} />
                              </button>
                              <button 
                                onClick={() => handleTogglePaid(e.id)} 
                                className={`p-2 rounded-xl transition-all ${e.status === ExpenseStatus.PAGO ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 hover:text-emerald-600'}`}
                                title={e.status === ExpenseStatus.PAGO ? "Marcar como pendente" : "Marcar como pago"}
                              >
                                <CheckCircle2 size={18} />
                              </button>
                              <button 
                                onClick={() => onUpdate(expenses.filter(x => x.id !== e.id))} 
                                className="p-2 bg-slate-100 text-slate-400 hover:text-rose-500 rounded-xl transition-all"
                                title="Excluir"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="print-footer">
        Gerado automaticamente pelo sistema de gestão Ice Control.
      </div>
    </div>
  );
};

export default ExpensesView;
