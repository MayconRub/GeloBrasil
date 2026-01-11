
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Trash2, Search, Pencil, TrendingUp, DollarSign, ArrowUpRight, LayoutList, Save, Check, X, User, ShoppingBag, Minus, Package, ArrowRight, Calendar, Clock, Loader2, ChevronDown, ChevronUp, Lock, Info, Truck, UserCircle, Calculator
} from 'lucide-react';
import { Sale, AppSettings, MonthlyGoal, Client, SaleItem, Product, Delivery, Employee } from '../types';

interface Props {
  sales: Sale[];
  onUpdate: (sale: Sale) => void;
  onDelete: (id: string) => void;
  settings?: AppSettings;
  monthlyGoals: MonthlyGoal[];
  onUpdateMonthlyGoal: (goal: MonthlyGoal) => void;
  clients: Client[];
  products: Product[];
  deliveries: Delivery[];
  employees: Employee[];
}

const SalesView: React.FC<Props> = ({ sales, onUpdate, onDelete, settings, clients, products, deliveries, employees }) => {
  const getTodayString = () => new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);

  const [description, setDescription] = useState('VENDA BALCÃO');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [clientId, setClientId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const clientName = clients.find(c => c.id === s.clientId)?.name || 'AVULSO';
      return s.date >= startDate && s.date <= endDate && (!searchTerm || clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [sales, startDate, endDate, searchTerm, clients]);

  const resetForm = () => {
    setEditingId(null); setDescription('VENDA BALCÃO'); setValue(''); setDate(getTodayString()); setClientId(''); setIsMobileFormOpen(false);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
    if (isNaN(numericValue)) return;
    onUpdate({ id: editingId || crypto.randomUUID(), description: description.toUpperCase(), value: numericValue, date, clientId: clientId || undefined });
    resetForm();
  };

  const renderForm = () => (
    <div className="space-y-6">
       <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner"><DollarSign size={24} /></div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase leading-none">Lançar Venda</h3>
       </div>
       <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-1">
             <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Cliente</label>
             <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border rounded-xl text-[10px] font-black uppercase dark:text-white">
               <option value="">BALCÃO (AVULSO)</option>
               {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Data</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border rounded-xl font-bold text-xs dark:text-white" required />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Valor R$</label>
                <input placeholder="0,00" value={value} onChange={e => setValue(e.target.value)} className="w-full h-12 px-4 bg-emerald-50/10 border-2 border-emerald-100 rounded-xl font-black text-lg text-emerald-600 outline-none" required />
             </div>
          </div>
          <button type="submit" className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl mt-4">SALVAR VENDA</button>
       </form>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-24 lg:pb-20 max-w-[1600px] mx-auto transition-colors uppercase bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
           <div className="w-12 h-12 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0"><TrendingUp size={24} /></div>
           <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-none uppercase tracking-tighter">Histórico Vendas</h2>
        </div>
        <button onClick={() => setIsMobileFormOpen(true)} className="w-full sm:w-auto h-12 bg-sky-500 text-white rounded-xl font-black text-[9px] uppercase shadow-lg flex items-center justify-center gap-2"><Plus size={18} /> LANÇAR</button>
      </header>

      {/* Modern Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] border shadow-sm no-print">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-10 border flex items-center">
            <span className="text-[7px] font-black text-slate-400 mr-2 uppercase">DE</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none outline-none text-[9px] font-bold dark:text-white w-full" />
          </div>
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-10 border flex items-center">
            <span className="text-[7px] font-black text-slate-400 mr-2 uppercase">ATÉ</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none outline-none text-[9px] font-bold dark:text-white w-full" />
          </div>
        </div>
        <div className="relative flex-1 lg:w-64">
           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
           <input type="text" placeholder="FILTRAR CLIENTE..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-10 pl-9 pr-8 bg-slate-50 dark:bg-slate-950 border rounded-xl text-[9px] font-black uppercase outline-none dark:text-white" />
        </div>
      </div>
      
      {/* Content List - Mobile Optimized */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border shadow-sm overflow-hidden divide-y divide-slate-50 dark:divide-slate-800">
        {filteredSales.map(s => (
          <div key={s.id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors flex justify-between items-center group">
             <div className="min-w-0 flex-1">
                <h4 className="font-black text-[11px] text-slate-800 dark:text-slate-200 uppercase truncate mb-1">{s.description}</h4>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                   <p className="text-[8px] text-slate-400 font-bold uppercase flex items-center gap-1"><User size={8}/> {clients.find(c=>c.id===s.clientId)?.name || 'AVULSO'}</p>
                   <span className="text-slate-200 text-[8px]">|</span>
                   <p className="text-[8px] text-slate-400 font-bold">{new Date(s.date + 'T00:00:00').toLocaleDateString()}</p>
                </div>
             </div>
             <div className="text-right ml-4">
                <p className="font-black text-sm text-emerald-600">R$ {s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <div className="flex justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity lg:static lg:opacity-100">
                   {!s.description.includes('ENTREGA') && (
                     <>
                        <button onClick={() => { setEditingId(s.id); setClientId(s.clientId || ''); setValue(s.value.toString()); setDate(s.date); setIsMobileFormOpen(true); }} className="p-1.5 text-slate-300 hover:text-sky-500"><Pencil size={14}/></button>
                        <button onClick={() => onDelete(s.id)} className="p-1.5 text-slate-200 hover:text-rose-500"><Trash2 size={14}/></button>
                     </>
                   )}
                </div>
             </div>
          </div>
        ))}
        {filteredSales.length === 0 && (
          <div className="py-20 text-center opacity-20">
             <DollarSign size={40} className="mx-auto mb-2" />
             <p className="text-[9px] font-black uppercase">Nenhuma venda encontrada</p>
          </div>
        )}
      </div>

      {/* Mobile Form Overlay */}
      {isMobileFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4">
           <div className="absolute inset-0 bg-slate-900/90 dark:bg-black/98 backdrop-blur-xl" onClick={resetForm} />
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[3rem] p-8 sm:p-10 shadow-2xl relative border-t sm:border animate-in slide-in-from-bottom duration-500">
              <button onClick={resetForm} className="absolute top-6 right-6 text-slate-300"><X size={28}/></button>
              {renderForm()}
           </div>
        </div>
      )}
    </div>
  );
};

export default SalesView;
