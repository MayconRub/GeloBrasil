
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
  Trophy,
  BarChart3,
  Printer,
  History,
  Award,
  X,
  User
} from 'lucide-react';
import { Sale, AppSettings, MonthlyGoal, Client } from '../types';

interface Props {
  sales: Sale[];
  onUpdate: (sale: Sale) => void;
  onDelete: (id: string) => void;
  settings?: AppSettings;
  monthlyGoals: MonthlyGoal[];
  onUpdateMonthlyGoal: (goal: MonthlyGoal) => void;
  clients: Client[];
}

const SalesView: React.FC<Props> = ({ sales, onUpdate, onDelete, settings, monthlyGoals, onUpdateMonthlyGoal, clients }) => {
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [description, setDescription] = useState('Venda de Gelo');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [clientId, setClientId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // ... (Memoized stats and goal logic remains same) ...
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
    
    const saleData = { 
      id: editingId || crypto.randomUUID(), 
      description, 
      value: numericValue, 
      date,
      clientId: clientId || undefined
    };
    
    onUpdate(saleData);
    resetForm();
  };

  // ... (Rest of handlers remain same) ...
  const handleSaveGoal = async () => {
    setIsSavingGoal(true);
    const newValue = parseFloat(localMonthlyGoal);
    await onUpdateMonthlyGoal({
      type: 'sales', month: currentMonth, year: currentYear, value: isNaN(newValue) ? 0 : newValue
    });
    setTimeout(() => setIsSavingGoal(false), 800);
  };

  const handleEdit = (sale: Sale) => {
    if (confirm(`DESEJA ALTERAR O LANÇAMENTO DE VENDA?`)) {
      setEditingId(sale.id);
      setDescription(sale.description);
      setValue(sale.value.toString());
      setDate(sale.date);
      setClientId(sale.clientId || '');
      setShowReport(false);
      if (window.innerWidth < 768) setIsMobileFormOpen(true);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = (sale: Sale) => {
    if (confirm(`DESEJA EXCLUIR ESTE LANÇAMENTO?`)) onDelete(sale.id);
  };

  const resetForm = () => {
    setEditingId(null); setDescription('Venda de Gelo'); setValue(''); setDate(getTodayString()); setClientId(''); setIsMobileFormOpen(false);
  };

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const d = new Date(s.date + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && s.description.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [sales, currentMonth, currentYear, searchTerm]);

  const totalSalesMonth = useMemo(() => filteredSales.reduce((sum, s) => sum + s.value, 0), [filteredSales]);
  const progressPercent = Math.min(100, currentGoalValue > 0 ? (totalSalesMonth / currentGoalValue) * 100 : 0);

  const getClientName = (id?: string) => clients.find(c => c.id === id)?.name || 'AVULSO';

  const renderForm = (isModal = false) => (
    <form onSubmit={handleAdd} className={`${isModal ? 'space-y-6' : 'hidden md:grid bg-white p-5 rounded-[2.5rem] shadow-xl border border-slate-100 grid-cols-12 gap-4 items-end no-print'}`}>
      <div className={`${isModal ? 'space-y-4' : 'md:col-span-3'} space-y-1.5`}>
        <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Descrição</label>
        <input type="text" placeholder="Ex: Venda Balcão" value={description} onChange={e => setDescription(e.target.value)} className="w-full h-14 sm:h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-sky-50 outline-none uppercase" required />
      </div>
      <div className={`${isModal ? 'space-y-4' : 'md:col-span-3'} space-y-1.5`}>
        <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Vincular Cliente</label>
        <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full h-14 sm:h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none">
           <option value="">CONSUMIDOR AVULSO</option>
           {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className={`${isModal ? 'space-y-4' : 'md:col-span-2'} space-y-1.5`}>
        <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Valor</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 font-bold text-xs">R$</span>
          <input type="text" placeholder="0,00" value={value} onChange={e => handleValueChange(e.target.value)} className="w-full h-14 sm:h-12 pl-10 pr-5 bg-slate-50 border border-slate-100 rounded-2xl text-base sm:text-sm font-black focus:ring-4 focus:ring-sky-50 outline-none transition-all" required />
        </div>
      </div>
      <div className={`${isModal ? 'space-y-4' : 'md:col-span-2'} space-y-1.5`}>
        <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Data</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-14 sm:h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm sm:text-xs font-bold" required />
      </div>
      <div className={`${isModal ? 'pt-4' : 'md:col-span-2'}`}>
        <button type="submit" className="w-full h-14 sm:h-12 bg-slate-900 text-white font-black rounded-2xl hover:bg-sky-600 transition-all text-[11px] sm:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95">
          {editingId ? <Pencil size={18} /> : <Plus size={18} />} {editingId ? 'Atualizar' : 'Lançar'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="flex flex-col">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter leading-none">Fluxo <span className="text-sky-500">Vendas</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <LayoutList size={14} className="text-sky-500" /> Registro de Faturamento {monthName}
            </p>
          </div>
          <button onClick={() => setIsMobileFormOpen(true)} className="md:hidden w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95"><Plus size={24} /></button>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 no-print">
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button onClick={handlePrevMonth} className="p-2.5 text-slate-400"><ChevronLeft size={18} /></button>
            <div className="px-4 py-1 flex items-center justify-center min-w-[130px]"><span className="text-[10px] font-black text-slate-800 capitalize">{monthName}</span></div>
            <button onClick={handleNextMonth} className="p-2.5 text-slate-400"><ChevronRight size={18} /></button>
          </div>
        </div>
      </header>

      {renderForm()}

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden no-print">
        <div className="p-6 border-b border-slate-50 flex items-center gap-4 bg-slate-50/50">
           <Search className="text-slate-300" size={20} />
           <input type="text" placeholder="BUSCAR VENDAS..." className="bg-transparent border-none outline-none text-[10px] font-black uppercase w-full placeholder:text-slate-300" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        <div className="md:hidden divide-y divide-slate-100">
           {filteredSales.map((sale) => (
             <div key={sale.id} className="p-5 space-y-3 group active:bg-sky-50/50 transition-all">
                <div className="flex justify-between items-start">
                   <div className="flex flex-col">
                      <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{sale.description}</span>
                      <span className="text-[8px] font-black text-sky-500 mt-1 uppercase flex items-center gap-1"><User size={10} /> {getClientName(sale.clientId)}</span>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => handleEdit(sale)} className="p-3 text-slate-400 bg-slate-50 rounded-xl"><Pencil size={18} /></button>
                      <button onClick={() => handleDelete(sale)} className="p-3 text-rose-300 bg-rose-50 rounded-xl"><Trash2 size={18} /></button>
                   </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                   <span className="text-xl font-black text-emerald-600">R$ {sale.value.toLocaleString('pt-BR')}</span>
                   <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(sale.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                </div>
             </div>
           ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4 w-1/4">Descrição</th>
                <th className="px-6 py-4 w-1/4">Cliente</th>
                <th className="px-6 py-4 w-1/6">Valor</th>
                <th className="px-6 py-4 w-1/6">Data</th>
                <th className="px-6 py-4 w-24 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="group hover:bg-sky-50/20 transition-all">
                  <td className="px-6 py-3 truncate text-xs font-black text-slate-800 uppercase">{sale.description}</td>
                  <td className="px-6 py-3">
                    <span className="text-[9px] font-black text-sky-500 bg-sky-50 px-2 py-1 rounded-lg uppercase">{getClientName(sale.clientId)}</span>
                  </td>
                  <td className="px-6 py-3 font-black text-emerald-600">R$ {sale.value.toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-3 text-[10px] font-bold text-slate-400">{new Date(sale.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(sale)} className="p-1.5 text-slate-400 hover:text-sky-500"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(sale)} className="p-1.5 text-rose-300 hover:text-rose-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isMobileFormOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 md:hidden">
           <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setIsMobileFormOpen(false)} className="absolute top-6 right-6 text-slate-300"><X size={24} /></button>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-8">Lançar Venda</h3>
              {renderForm(true)}
           </div>
        </div>
      )}
    </div>
  );
};

export default SalesView;
