
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Pencil, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2,
  ArrowDownLeft,
  Filter,
  Receipt,
  Clock,
  LayoutList,
  Check,
  Settings,
  X,
  Tag,
  Truck,
  UserCircle,
  Gauge,
  GripVertical
} from 'lucide-react';
import { Expense, ExpenseStatus, Vehicle, Employee } from '../types';

interface Props {
  expenses: Expense[];
  categories: string[];
  vehicles: Vehicle[];
  employees: Employee[];
  onUpdate: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onUpdateCategories: (categoryName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
  onReorderCategories?: (orderedNames: string[]) => void;
}

const ExpensesView: React.FC<Props> = ({ expenses, categories, vehicles, employees, onUpdate, onDelete, onUpdateCategories, onDeleteCategory, onReorderCategories }) => {
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [dueDate, setDueDate] = useState(getTodayString());
  const [category, setCategory] = useState(categories[0] || 'Geral');
  const [vehicleId, setVehicleId] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [kmReading, setKmReading] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [localCategories, setLocalCategories] = useState<string[]>(categories);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const prevCategoryRef = useRef(category);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const isFuelCategory = category.toLowerCase().includes('combustível') || category.toLowerCase().includes('combustivel');
  const isMaintenanceCategory = category.toLowerCase().includes('manutenção') || category.toLowerCase().includes('manutencao');
  const showVehicleField = isFuelCategory || isMaintenanceCategory;
  const isPayrollCategory = category.toLowerCase().includes('vale') || category.toLowerCase().includes('adiantamento');

  // Lógica de visibilidade e automação de campos
  const shouldShowDescription = !isFuelCategory;
  const shouldShowEmployeeSelect = isFuelCategory || isPayrollCategory;

  useEffect(() => {
    if (!editingId) {
      if (prevCategoryRef.current !== category) {
        if (isFuelCategory) {
          setDescription('Abastecimento');
        } else if (isPayrollCategory) {
          setDescription('Vale/Adiantamento - ');
        } else {
          setDescription('');
        }
      }
    }
    prevCategoryRef.current = category;
  }, [category, isFuelCategory, isPayrollCategory, editingId]);

  const handleValueChange = (val: string) => {
    const sanitized = val.replace(/[^0-9.,]/g, '').replace(',', '.');
    setValue(sanitized);
  };

  const handlePrevMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleResetMonth = () => setSelectedDate(new Date());

  const handleMarkAsPaid = (expense: Expense) => {
    onUpdate({ ...expense, status: ExpenseStatus.PAGO });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value);
    const numericKm = kmReading ? parseFloat(kmReading) : undefined;

    if (!description && shouldShowDescription) {
      alert("Por favor, preencha a descrição.");
      return;
    }

    if (isNaN(numericValue) || !dueDate) {
      alert("Por favor, preencha valor e data.");
      return;
    }
    
    if (showVehicleField && !vehicleId) {
      alert("⚠️ Seleção de veículo é obrigatória para esta categoria.");
      return;
    }

    if (isFuelCategory && (numericKm === undefined || isNaN(numericKm))) {
      alert("⚠️ O KM atual é obrigatório para registros de abastecimento.");
      return;
    }

    if (isFuelCategory && !employeeId) {
      alert("⚠️ Informe quem realizou o abastecimento.");
      return;
    }

    const today = getTodayString();
    const status = editingId 
      ? expenses.find(x => x.id === editingId)?.status || (dueDate < today ? ExpenseStatus.VENCIDO : ExpenseStatus.A_VENCER)
      : (dueDate < today ? ExpenseStatus.VENCIDO : ExpenseStatus.A_VENCER);

    onUpdate({ 
      id: editingId || crypto.randomUUID(), 
      description: isFuelCategory ? 'Abastecimento' : description, 
      value: numericValue, 
      dueDate, 
      status, 
      category,
      vehicleId: vehicleId || undefined,
      employeeId: employeeId || undefined,
      kmReading: numericKm
    });
    
    resetForm();
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    onUpdateCategories(newCategoryName.trim());
    setNewCategoryName('');
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setDescription(expense.description);
    setValue(expense.value.toString());
    setDueDate(expense.dueDate);
    setCategory(expense.category);
    setVehicleId(expense.vehicleId || '');
    setEmployeeId(expense.employeeId || '');
    setKmReading(expense.kmReading?.toString() || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null); 
    setDescription(''); 
    setValue(''); 
    setDueDate(getTodayString()); 
    setCategory(categories[0] || 'Geral');
    setVehicleId('');
    setEmployeeId('');
    setKmReading('');
  };

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const newList = [...localCategories];
    const draggedItem = newList[draggedItemIndex];
    newList.splice(draggedItemIndex, 1);
    newList.splice(index, 0, draggedItem);
    setDraggedItemIndex(index);
    setLocalCategories(newList);
  };

  const onDragEnd = () => {
    if (onReorderCategories) {
      onReorderCategories(localCategories);
    }
    setDraggedItemIndex(null);
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
          <div className="glass-card px-5 sm:px-6 py-3 rounded-2xl flex items-center gap-4 border-white bg-white/50 shadow-sm border">
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

      {isManagingCategories && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsManagingCategories(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 p-8 border border-slate-100">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Tag size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 leading-none">Categorias</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gerenciar Ordem e Grupos</p>
                  </div>
                </div>
                <button onClick={() => setIsManagingCategories(false)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
             </div>

             <form onSubmit={handleCreateCategory} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nova categoria..."
                  className="flex-1 h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                />
                <button type="submit" className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all active:scale-90">
                  <Plus size={20} />
                </button>
             </form>

             <div className="space-y-2 max-h-80 overflow-y-auto pr-2 no-scrollbar">
                {localCategories.map((cat, index) => (
                  <div 
                    key={cat} 
                    draggable
                    onDragStart={(e) => onDragStart(e, index)}
                    onDragOver={(e) => onDragOver(e, index)}
                    onDragEnd={onDragEnd}
                    className={`flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 group transition-all cursor-grab active:cursor-grabbing ${draggedItemIndex === index ? 'opacity-30 scale-95 border-indigo-200 bg-indigo-50' : 'hover:border-indigo-100 hover:bg-indigo-50/10'}`}
                  >
                    <div className="flex items-center gap-3">
                       <GripVertical className="text-slate-300 group-hover:text-indigo-400 transition-colors" size={16} />
                       <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{cat}</span>
                    </div>
                    <button 
                      onClick={() => onDeleteCategory(cat)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
             </div>
             
             <div className="mt-6 flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <Settings size={14} className="text-amber-500 shrink-0" />
                <p className="text-[9px] font-bold text-amber-700 uppercase leading-relaxed tracking-tight">
                  Arraste as categorias para mudar a ordem em que aparecem nos formulários.
                </p>
             </div>
          </div>
        </div>
      )}

      <form onSubmit={handleAdd} className="bg-white p-5 rounded-[2.5rem] shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        
        <div className={`space-y-1.5 md:col-span-2`}>
          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center justify-between">
            Categoria
            <button type="button" onClick={() => setIsManagingCategories(true)} className="text-rose-400 hover:text-rose-600 transition-colors p-1">
              <Settings size={12} />
            </button>
          </label>
          <div className="relative">
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none appearance-none">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
               <Filter size={14} />
            </div>
          </div>
        </div>

        {shouldShowDescription && (
          <div className={`space-y-1.5 md:col-span-3`}>
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Descrição da Conta</label>
            <input 
              type="text" 
              placeholder="Ex: Conta de Luz" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 outline-none transition-all focus:ring-rose-50" 
              required={shouldShowDescription}
            />
          </div>
        )}
        
        {shouldShowEmployeeSelect && (
          <div className="md:col-span-3 space-y-1.5 animate-in slide-in-from-left-2 duration-300">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-1.5">
              <UserCircle size={10} className="text-indigo-500" /> {isFuelCategory ? 'Quem abasteceu?' : 'Funcionário'}
            </label>
            <div className="relative">
              <select 
                value={employeeId} 
                onChange={e => setEmployeeId(e.target.value)} 
                className="w-full h-12 px-5 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs font-black outline-none appearance-none text-indigo-900 shadow-sm"
                required={shouldShowEmployeeSelect}
              >
                <option value="">Selecionar Funcionário...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-300">
                 <UserCircle size={14} />
              </div>
            </div>
          </div>
        )}

        {showVehicleField && (
          <div className="md:col-span-2 space-y-1.5 animate-in slide-in-from-left-2 duration-300">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-1.5">
              <Truck size={10} className="text-sky-500" /> Veículo (Obrig.)
            </label>
            <div className="relative">
              <select 
                value={vehicleId} 
                onChange={e => setVehicleId(e.target.value)} 
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none appearance-none"
                required={showVehicleField}
              >
                <option value="">Selecionar...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                 <Truck size={14} />
              </div>
            </div>
          </div>
        )}

        {isFuelCategory && (
          <div className="md:col-span-2 space-y-1.5 animate-in slide-in-from-bottom-2 duration-300">
             <label className="text-[9px] font-black text-sky-500 uppercase ml-2 tracking-widest flex items-center gap-1.5">
               <Gauge size={10} /> KM Atual (Obrig.)
             </label>
             <input 
              type="number" 
              placeholder="0" 
              value={kmReading} 
              onChange={e => setKmReading(e.target.value)} 
              className="w-full h-12 px-5 bg-sky-50 border border-sky-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-sky-200 outline-none transition-all" 
              required={isFuelCategory}
             />
          </div>
        )}

        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Valor</label>
          <input type="text" placeholder="R$ 0,00" value={value} onChange={e => handleValueChange(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none" required />
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Vencimento</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none" required />
        </div>
        <div className="md:col-span-1">
          <button type="submit" className="w-full h-12 bg-slate-900 text-white font-black rounded-2xl hover:bg-rose-600 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95">
            {editingId ? <Pencil size={16} /> : <Plus size={16} />}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-50 bg-slate-50/50">
           <Search className="text-slate-300" size={20} />
           <input type="text" placeholder="Buscar na planilha..." className="bg-transparent border-none outline-none text-xs w-full font-bold" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4 w-1/4">Descrição</th>
                <th className="px-6 py-4 w-1/6">Categoria / Vínculo</th>
                <th className="px-6 py-4 w-1/6">Valor</th>
                <th className="px-6 py-4 w-1/6">Vencimento</th>
                <th className="px-6 py-4 w-1/6">Status</th>
                <th className="px-6 py-4 w-24 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredExpenses.map((e) => {
                const vehicle = e.vehicleId ? vehicles.find(v => v.id === e.vehicleId) : null;
                const employee = e.employeeId ? employees.find(emp => emp.id === e.employeeId) : null;
                return (
                  <tr key={e.id} className="group hover:bg-rose-50/20 transition-all">
                    <td className="px-6 py-3 truncate text-xs font-black text-slate-800">{e.description}</td>
                    <td className="px-6 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black bg-slate-100 px-2 py-1 rounded-md text-slate-500 uppercase w-fit">{e.category}</span>
                        {vehicle && (
                          <span className="text-[8px] font-black text-sky-600 flex items-center gap-1 uppercase">
                            <Truck size={10} /> {vehicle.plate}
                          </span>
                        )}
                        {employee && (
                          <span className="text-[8px] font-black text-indigo-600 flex items-center gap-1 uppercase">
                            <UserCircle size={10} /> {employee.name}
                          </span>
                        )}
                      </div>
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
                          <button onClick={() => handleMarkAsPaid(e)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg"><CheckCircle2 size={14} /></button>
                        )}
                        <button onClick={() => handleEdit(e)} className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg"><Pencil size={14} /></button>
                        <button onClick={() => onDelete(e.id)} className="p-1.5 text-rose-300 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpensesView;
