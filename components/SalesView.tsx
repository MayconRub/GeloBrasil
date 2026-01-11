
import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Search, Pencil, TrendingUp, DollarSign, ArrowUpRight, LayoutList, Save, Check, X, User, ShoppingBag, Minus, Package, ArrowRight, Calendar, Clock
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

  const [description, setDescription] = useState('Venda Balcão');
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
    const numericValue = parseFloat(value);
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
    setEditingId(null); setDescription('Venda Balcão'); setValue(''); setDate(getTodayString()); setClientId(''); setItems([]); setIsMobileFormOpen(false);
  };

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const matchesDate = s.date >= startDate && s.date <= endDate;
      const clientName = clients.find(c => c.id === s.clientId)?.name || 'AVULSO';
      // Fixed: s.description or clientName might potentially be undefined if data is malformed
      return matchesDate && (!searchTerm || (s.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || (clientName || '').toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [sales, startDate, endDate, searchTerm, clients]);

  const getClientName = (id?: string) => clients.find(c => c.id === id)?.name || 'AVULSO';
  const getProductName = (id: string) => products.find(p => p.id === id)?.nome || 'PRODUTO';

  const renderForm = (isModal = false) => (
    <div className={`${isModal ? '' : 'bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm'}`}>
      <h3 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
        <DollarSign size={16} className="text-emerald-500" /> Registro de Venda
      </h3>
      <div className="space-y-6">
        <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Itens Vendidos</p>
           <div className="flex gap-2 mb-4">
              <select className="flex-1 h-11 px-4 bg-white dark:bg-slate-900 border rounded-xl text-[10px] font-black uppercase outline-none dark:text-white" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                <option value="">PRODUTO...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <input type="number" value={itemQuantity} onChange={e => setItemQuantity(e.target.value)} className="w-16 h-11 text-center bg-white dark:bg-slate-900 border rounded-xl font-black text-sm outline-none dark:text-white" />
              <button type="button" onClick={handleAddItem} className="h-11 w-11 bg-sky-500 text-white rounded-xl flex items-center justify-center shadow-lg"><Plus size={20}/></button>
           </div>
           <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase dark:text-white">
                  <span>{it.quantity}x {getProductName(it.productId)}</span>
                  <button type="button" onClick={() => setItems(items.filter((_,i)=>i!==idx))} className="text-rose-400"><Minus size={14}/></button>
                </div>
              ))}
           </div>
        </div>
        <form onSubmit={handleAdd} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 uppercase ml-2">Cliente</label><select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl text-[10px] font-black uppercase outline-none dark:text-white"><option value="">CONSUMIDOR AVULSO</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
             <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 uppercase ml-2">Data</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border rounded-2xl font-bold text-sm dark:text-white" required /></div>
          </div>
          <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 uppercase ml-2">Valor R$</label><div className="relative"><span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-lg">R$</span><input placeholder="0,00" value={value} onChange={e => setValue(e.target.value.replace(',','.'))} className="w-full h-16 pl-14 pr-6 bg-emerald-50/20 dark:bg-slate-950 border border-emerald-100 dark:border-emerald-800/30 rounded-[1.8rem] text-2xl font-black text-emerald-600 outline-none" required /></div></div>
          <button type="submit" className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">CONCLUIR VENDA</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto transition-colors uppercase">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-6"><div className="flex flex-col"><h2 className="text-4xl font-black text-slate-800 dark:text-white leading-none flex items-center gap-3"><TrendingUp className="text-sky-500" size={32} /> Vendas</h2></div><button onClick={() => setIsMobileFormOpen(true)} className="lg:hidden w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><Plus size={24} /></button></header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="hidden lg:block lg:col-span-1">{renderForm()}</div>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden min-h-[500px]">
            <div className="p-6 bg-slate-50/50 dark:bg-slate-950/50 flex items-center gap-4"><Search size={18} className="text-slate-300"/><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="PESQUISAR VENDAS..." className="w-full bg-transparent outline-none font-black text-[10px] uppercase dark:text-white" /></div>
            <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-slate-400 text-[9px] font-black uppercase border-b"><th className="px-6 py-4">DESCRIÇÃO</th><th className="px-6 py-4">VALOR</th><th className="px-6 py-4 text-center">AÇÕES</th></tr></thead><tbody className="divide-y">
              {filteredSales.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4"><p className="text-xs font-black dark:text-slate-200">{s.description}</p><p className="text-[7px] text-slate-400">{getClientName(s.clientId)}</p></td>
                  <td className="px-6 py-4 font-black text-emerald-600">R$ {s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 text-center"><button onClick={() => onDelete(s.id)} className="text-rose-400"><Trash2 size={16}/></button></td>
                </tr>
              ))}
            </tbody></table></div>
          </div>
        </div>
      </div>
      {isMobileFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/90 dark:bg-black/95 backdrop-blur-sm" onClick={resetForm} />
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-8 shadow-2xl relative border dark:border-slate-800 overflow-y-auto max-h-[90vh]">
              <button onClick={resetForm} className="absolute top-6 right-6 text-slate-300"><X size={24}/></button>
              {renderForm(true)}
           </div>
        </div>
      )}
    </div>
  );
};

export default SalesView;
