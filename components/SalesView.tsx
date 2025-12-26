
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Pencil, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp,
  Calendar,
  Zap,
  DollarSign,
  ArrowUpRight,
  Clock,
  LayoutList,
  Target,
  Save,
  Check,
  Trophy
} from 'lucide-react';
import { Sale, AppSettings, MonthlyGoal } from '../types';

interface Props {
  sales: Sale[];
  onUpdate: (sales: Sale[]) => void;
  settings?: AppSettings;
  monthlyGoals: MonthlyGoal[];
  onUpdateMonthlyGoal: (goal: MonthlyGoal) => void;
}

const SalesView: React.FC<Props> = ({ sales, onUpdate, settings, monthlyGoals, onUpdateMonthlyGoal }) => {
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [description, setDescription] = useState('Venda de Gelo');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const currentGoalValue = useMemo(() => {
    const goal = monthlyGoals.find(g => g.type === 'sales' && g.month === currentMonth && g.year === currentYear);
    return goal ? goal.value : settings?.salesGoalMonthly || 60000;
  }, [monthlyGoals, currentMonth, currentYear, settings?.salesGoalMonthly]);

  const [localMonthlyGoal, setLocalMonthlyGoal] = useState(currentGoalValue.toString());
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  useEffect(() => {
    setLocalMonthlyGoal(currentGoalValue.toString());
  }, [currentGoalValue, currentMonth, currentYear]);

  const handleValueChange = (val: string) => {
    const sanitized = val.replace(/[^0-9.,]/g, '').replace(',', '.');
    setValue(sanitized);
  };

  const handlePrevMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleResetMonth = () => setSelectedDate(new Date());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value);
    if (!description || isNaN(numericValue)) return;
    if (editingId) {
      onUpdate(sales.map(s => s.id === editingId ? { ...s, description, value: numericValue, date } : s));
    } else {
      onUpdate([{ id: crypto.randomUUID(), description, value: numericValue, date }, ...sales]);
    }
    resetForm();
  };

  const handleSaveGoal = async () => {
    setIsSavingGoal(true);
    const newValue = parseFloat(localMonthlyGoal);
    await onUpdateMonthlyGoal({
      type: 'sales',
      month: currentMonth,
      year: currentYear,
      value: isNaN(newValue) ? 0 : newValue
    });
    setTimeout(() => setIsSavingGoal(false), 800);
  };

  const handleEdit = (sale: Sale) => {
    setEditingId(sale.id);
    setDescription(sale.description);
    setValue(sale.value.toString());
    setDate(sale.date);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null); 
    setDescription('Venda de Gelo'); 
    setValue(''); 
    setDate(getTodayString());
  };

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const d = new Date(s.date + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && s.description.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [sales, currentMonth, currentYear, searchTerm]);

  const totalSalesMonth = useMemo(() => filteredSales.reduce((sum, s) => sum + s.value, 0), [filteredSales]);
  const progressPercent = Math.min(100, currentGoalValue > 0 ? (totalSalesMonth / currentGoalValue) * 100 : 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter leading-none">Fluxo <span className="text-sky-500">Vendas</span></h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <LayoutList size={14} className="text-sky-500" /> Lançamentos de Receita {monthName}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="glass-card px-5 sm:px-6 py-3 rounded-2xl flex items-center gap-4 border-white bg-white/50 backdrop-blur-md">
             <div className="bg-sky-50 p-2 rounded-xl text-sky-500">
               <TrendingUp size={20} />
             </div>
             <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Faturado no Mês</p>
               <p className="text-lg sm:text-xl font-black text-slate-800 leading-none">
                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalSalesMonth)}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Definir Meta para</p>
              <h4 className="font-black text-slate-900 leading-tight capitalize">{monthName}</h4>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
              <input 
                type="number" 
                value={localMonthlyGoal}
                onChange={(e) => setLocalMonthlyGoal(e.target.value)}
                placeholder="Ex: 60000"
                className="w-full h-12 pl-9 pr-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
              />
            </div>
            <button 
              onClick={handleSaveGoal}
              disabled={isSavingGoal}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all shadow-lg active:scale-90 ${isSavingGoal ? 'bg-emerald-500' : 'bg-slate-900 hover:bg-emerald-600'}`}
            >
              {isSavingGoal ? <Check size={20} className="animate-in zoom-in" /> : <Save size={20} />}
            </button>
          </div>
        </div>

        <div className={`lg:col-span-2 p-6 rounded-[2.5rem] border shadow-sm flex flex-col justify-between transition-all duration-500 ${progressPercent >= 100 ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center ${progressPercent >= 100 ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-500'}`}>
                 {progressPercent >= 100 ? <Trophy size={16} /> : <Target size={16} />}
               </div>
               <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${progressPercent >= 100 ? 'text-white/80' : 'text-slate-400'}`}>
                 {progressPercent >= 100 ? 'MÁXIMA PERFORMANCE' : `Objetivo ${monthName}`}
               </span>
             </div>
             <p className={`text-3xl font-black tracking-tighter ${progressPercent >= 100 ? 'text-white' : 'text-slate-900'}`}>{progressPercent.toFixed(1)}%</p>
          </div>
          <div className="space-y-3">
            <div className={`h-4 sm:h-5 w-full rounded-full overflow-hidden border p-1 ${progressPercent >= 100 ? 'bg-white/20 border-white/30' : 'bg-slate-100 border-slate-200'}`}>
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${progressPercent >= 100 ? 'bg-amber-400' : 'bg-gradient-to-r from-emerald-500 to-sky-500'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
               <span className={progressPercent >= 100 ? 'text-white/80' : 'text-slate-400'}>
                 {progressPercent >= 100 ? 'PARABÉNS! META ALCANÇADA! 🚀' : 'Total Faturado'}
               </span>
               <div className={`${progressPercent >= 100 ? 'bg-white text-emerald-600' : 'bg-slate-900 text-white'} px-3 py-1 rounded-lg`}>
                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalSalesMonth)} / {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(currentGoalValue)}
               </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleAdd} className="bg-white p-5 rounded-[2.5rem] shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-4 space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Descrição da Venda</label>
          <input 
            type="text" 
            placeholder="Ex: Faturamento Diário" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-sky-50 outline-none transition-all" 
            required 
          />
        </div>
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Valor Total</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 font-bold text-xs">R$</span>
            <input 
              type="text" 
              placeholder="0,00" 
              value={value} 
              onChange={e => handleValueChange(e.target.value)} 
              className="w-full h-12 pl-10 pr-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-sky-50 outline-none transition-all" 
              required 
            />
          </div>
        </div>
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Data da Venda</label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-sky-50 outline-none transition-all" 
            required 
          />
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="w-full h-12 bg-slate-900 text-white font-black rounded-2xl hover:bg-sky-600 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95">
            {editingId ? <Pencil size={16} /> : <Plus size={16} />} {editingId ? 'Atualizar' : 'Lançar'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-50 bg-slate-50/50">
           <Search className="text-slate-300" size={20} />
           <input 
            type="text" 
            placeholder="Buscar vendas..." 
            className="bg-transparent border-none outline-none text-xs w-full font-bold" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>

        {/* Mobile List View */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredSales.map((sale) => (
            <div key={sale.id} className="p-5 flex flex-col gap-4 active:bg-sky-50/20 transition-all">
              <div className="flex items-center justify-between">
                 <div>
                   <h4 className="text-sm font-black text-slate-800 leading-tight">{sale.description}</h4>
                   <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                     <Clock size={10} /> {new Date(sale.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                   </div>
                 </div>
                 <span className="text-lg font-black text-emerald-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.value)}
                 </span>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                 <button onClick={() => handleEdit(sale)} className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest">
                   <Pencil size={14} /> Editar
                 </button>
                 <button onClick={() => onUpdate(sales.filter(s => s.id !== sale.id))} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-400 rounded-xl text-[9px] font-black uppercase tracking-widest">
                   <Trash2 size={14} /> Excluir
                 </button>
              </div>
            </div>
          ))}
          {filteredSales.length === 0 && (
            <div className="py-12 px-6 text-center text-slate-400 italic text-xs">Nenhuma venda encontrada para este período.</div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4 w-1/3">Identificação</th>
                <th className="px-6 py-4 w-1/4">Valor Total</th>
                <th className="px-6 py-4 w-1/4">Data</th>
                <th className="px-6 py-4 w-24 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="group hover:bg-sky-50/20 transition-all">
                  <td className="px-6 py-3 truncate text-xs font-black text-slate-800">{sale.description}</td>
                  <td className="px-6 py-3">
                    <span className="text-sm font-black text-emerald-600 flex items-center gap-2">
                       <ArrowUpRight size={14} />
                       {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.value)}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <Clock size={12} /> {new Date(sale.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center gap-2 transition-all">
                      <button onClick={() => handleEdit(sale)} className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg"><Pencil size={14} /></button>
                      <button onClick={() => onUpdate(sales.filter(s => s.id !== sale.id))} className="p-1.5 text-rose-300 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
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

export default SalesView;
