
import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Search, Pencil, TrendingUp, DollarSign, ArrowUpRight, LayoutList, Save, Check, X, User, ShoppingBag, Minus, Package, ArrowRight, Calendar, Clock, Loader2
} from 'lucide-react';
import { Sale, AppSettings, MonthlyGoal, Client, SaleItem, Product } from '../types';

interface Props {
  sales: Sale[];
  onUpdate: (sale: Sale) => void;
  onDelete: (id: string) => void;
  settings?: AppSettings;
  monthlyGoals: MonthlyGoal[];
  onUpdateMonthlyGoal: (goal: MonthlyGoal) => void;
  clients: Client[];
  products: Product[];
}

const SalesView: React.FC<Props> = ({ sales, onUpdate, onDelete, settings, clients, products }) => {
  const getTodayString = () => new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [searchTerm, setSearchTerm] = useState('');

  const [description, setDescription] = useState('VENDA BALCÃO');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [clientId, setClientId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);

  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');

  const handleAddItem = () => {
    const qty = parseInt(itemQuantity);
    if (!selectedProductId || isNaN(qty) || qty <= 0) return;
    const existingIdx = items.findIndex(i => i.productId === selectedProductId);
    if (existingIdx > -1) {
      const newItems = [...items];
      newItems[existingIdx].quantity += qty;
      setItems(newItems);
    } else {
      setItems([...items, { productId: selectedProductId, quantity: qty }]);
    }
    setSelectedProductId('');
    setItemQuantity('1');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value.replace(',', '.'));
    if (!description || isNaN(numericValue)) return;
    onUpdate({ id: editingId || crypto.randomUUID(), description: description.toUpperCase(), value: numericValue, date, clientId: clientId || undefined, items: items.length > 0 ? items : undefined });
    resetForm();
  };

  const handleEdit = (sale: Sale) => {
    setEditingId(sale.id);
    setDescription(sale.description);
    setValue(sale.value.toString());
    setDate(sale.date);
    setClientId(sale.clientId || '');
    setItems(sale.items || []);
    setIsMobileFormOpen(true);
  };

  const resetForm = () => {
    setEditingId(null); setDescription('VENDA BALCÃO'); setValue(''); setDate(getTodayString()); setClientId(''); setItems([]); setIsMobileFormOpen(false);
  };

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const matchesDate = s.date >= startDate && s.date <= endDate;
      const clientName = clients.find(c => c.id === s.clientId)?.name || 'AVULSO';
      return matchesDate && (!searchTerm || (s.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || (clientName || '').toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [sales, startDate, endDate, searchTerm, clients]);

  const getClientName = (id?: string) => clients.find(c => c.id === id)?.name || 'AVULSO';
  const getProductName = (id: string) => products.find(p => p.id === id)?.nome || 'PRODUTO';

  const renderForm = (isModal = false) => (
    <div className={`${isModal ? '' : 'bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm'}`}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner"><DollarSign size={24} /></div>
        <div>
           <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">Lançar <span className="text-emerald-500">Venda</span></h3>
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Registro de Faturamento</p>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Catálogo de Itens</p>
           <div className="flex gap-2 mb-4">
              <select className="flex-1 h-12 px-4 bg-white dark:bg-slate-900 border rounded-xl text-[10px] font-black uppercase outline-none dark:text-white" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                <option value="">PRODUTO...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <input type="number" value={itemQuantity} onChange={e => setItemQuantity(e.target.value)} className="w-16 h-12 text-center bg-white dark:bg-slate-900 border rounded-xl font-black text-sm outline-none dark:text-white" />
              <button type="button" onClick={handleAddItem} className="h-12 w-12 bg-sky-500 text-white rounded-xl flex items-center justify-center shadow-lg"><Plus size={20}/></button>
           </div>
           <div className="space-y-2 max-h-[120px] overflow-y-auto no-scrollbar">
              {items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase dark:text-white">
                  <span>{it.quantity}x {getProductName(it.productId)}</span>
                  <button type="button" onClick={() => setItems(items.filter((_,i)=>i!==idx))} className="text-rose-400"><Trash2 size={14}/></button>
                </div>
              ))}
           </div>
        </div>
        <form onSubmit={handleAdd} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Cliente</label>
                <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl text-[10px] font-black uppercase outline-none dark:text-white shadow-inner">
                  <option value="">BALCÃO (AVULSO)</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             </div>
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Data</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl font-bold text-xs dark:text-white shadow-inner" required />
             </div>
          </div>
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Valor do Faturamento R$</label>
             <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-2xl">R$</span>
                <input placeholder="0,00" value={value} onChange={e => setValue(e.target.value)} className="w-full h-20 pl-16 pr-6 bg-emerald-50/20 dark:bg-slate-950 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-[2rem] text-3xl font-black text-emerald-600 outline-none placeholder:text-emerald-100" required />
             </div>
          </div>
          <button type="submit" className="w-full h-20 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[2.2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl active:scale-95 transition-all">CONCLUIR LANÇAMENTO</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto transition-colors uppercase bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl flex items-center justify-center shadow-lg"><TrendingUp size={28} /></div>
           <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-none">VENDAS <span className="text-sky-500">DIÁRIAS</span></h2>
        </div>
        <button onClick={() => setIsMobileFormOpen(true)} className="lg:hidden w-14 h-14 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-90"><Plus size={24} /></button>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="hidden lg:block lg:col-span-1">{renderForm()}</div>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px]">
            <div className="p-8 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-50 flex flex-col md:flex-row gap-4">
               <div className="flex-1 relative">
                  <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"/>
                  <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="PESQUISAR VENDAS..." className="w-full h-14 pl-14 pr-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full outline-none font-black text-[10px] uppercase dark:text-white" />
               </div>
               <div className="flex gap-2 items-center bg-white dark:bg-slate-900 px-4 rounded-full border border-slate-100">
                  <span className="text-[8px] font-black text-slate-400">FILTRAR:</span>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-[9px] font-bold dark:text-white" />
               </div>
            </div>
            <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-50 dark:border-slate-800"><th className="px-8 py-6">DETALHES</th><th className="px-8 py-6 text-right">VALOR</th><th className="px-8 py-6 text-center">AÇÕES</th></tr></thead><tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredSales.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 leading-none mb-1">{s.description}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase flex items-center gap-1"><User size={8}/> {getClientName(s.clientId)} <span className="text-slate-200 ml-2">|</span> {new Date(s.date + 'T00:00:00').toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-sm text-emerald-600">R$ {s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => handleEdit(s)} className="p-2 text-slate-300 hover:text-sky-500"><Pencil size={16}/></button>
                       <button onClick={() => onDelete(s.id)} className="p-2 text-slate-200 hover:text-rose-500"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody></table></div>
          </div>
        </div>
      </div>

      {isMobileFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/90 dark:bg-black/98 backdrop-blur-xl" onClick={resetForm} />
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl relative border dark:border-slate-800 overflow-y-auto max-h-[90vh]">
              <button onClick={resetForm} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500"><X size={32}/></button>
              {renderForm(true)}
           </div>
        </div>
      )}
    </div>
  );
};

export default SalesView;
