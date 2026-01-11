
import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Search, Pencil, TrendingUp, DollarSign, ArrowUpRight, LayoutList, Save, Check, X, User, ShoppingBag, Minus, Package, ArrowRight, Calendar, Clock, Loader2, ChevronDown, ChevronUp, Lock, Info, Truck
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
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const getFirstDayOfMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  };

  const getLastDayOfMonth = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  };

  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [searchTerm, setSearchTerm] = useState('');

  const [description, setDescription] = useState('VENDA BALCÃO');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [clientId, setClientId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');

  const handleShortcutToday = () => {
    setStartDate(getTodayString());
    setEndDate(getTodayString());
  };

  const handleShortcutMonth = () => {
    setStartDate(getFirstDayOfMonth());
    setEndDate(getLastDayOfMonth());
  };

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
    if (sale.description.includes('ENTREGA CONCLUÍDA')) return;
    setEditingId(sale.id);
    setDescription(sale.description);
    setValue(sale.value.toString());
    setDate(sale.date);
    setClientId(sale.clientId || '');
    setItems(sale.items || []);
    setShowCatalog((sale.items?.length || 0) > 0);
    setIsMobileFormOpen(true);
  };

  const resetForm = () => {
    setEditingId(null); setDescription('VENDA BALCÃO'); setValue(''); setDate(getTodayString()); setClientId(''); setItems([]); setIsMobileFormOpen(false); setShowCatalog(false);
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

          {/* Botão Sugestivo para Catálogo */}
          <button 
            type="button"
            onClick={() => setShowCatalog(!showCatalog)}
            className={`w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all ${showCatalog ? 'bg-sky-50 border-sky-200 text-sky-600 dark:bg-sky-900/20 dark:border-sky-800' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-sky-200 hover:text-sky-500 dark:bg-slate-950 dark:border-slate-800'}`}
          >
            <Package size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {showCatalog ? 'Recolher Catálogo' : 'Detalhar Produtos (Opcional)'}
            </span>
            {items.length > 0 && (
              <span className="bg-emerald-500 text-white text-[8px] px-2 py-0.5 rounded-full">
                {items.length} ITENS
              </span>
            )}
            {showCatalog ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showCatalog && (
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Selecione os Itens Vendidos</p>
               <div className="flex gap-2 mb-4">
                  <select className="flex-1 h-12 px-4 bg-white dark:bg-slate-900 border rounded-xl text-[10px] font-black uppercase outline-none dark:text-white" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                    <option value="">PRODUTO...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                  <input type="number" value={itemQuantity} onChange={e => setItemQuantity(e.target.value)} className="w-16 h-12 text-center bg-white dark:bg-slate-900 border rounded-xl font-black text-sm outline-none dark:text-white" />
                  <button type="button" onClick={handleAddItem} className="h-12 w-12 bg-sky-500 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all"><Plus size={20}/></button>
               </div>
               <div className="space-y-2 max-h-[120px] overflow-y-auto no-scrollbar">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase dark:text-white">
                      <span>{it.quantity}x {getProductName(it.productId)}</span>
                      <button type="button" onClick={() => setItems(items.filter((_,i)=>i!==idx))} className="text-rose-400 p-1 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                    </div>
                  ))}
                  {items.length === 0 && <p className="text-[8px] text-slate-300 uppercase text-center py-4 italic">Nenhum item detalhado ainda</p>}
               </div>
            </div>
          )}

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
           <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-none uppercase tracking-tighter">VENDAS <span className="text-sky-500">DIÁRIAS</span></h2>
        </div>
        <button onClick={() => setIsMobileFormOpen(true)} className="lg:hidden w-14 h-14 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-90"><Plus size={24} /></button>
      </header>

      {/* Modern Compact Range Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm no-print">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-11 border border-slate-100 dark:border-slate-800">
            <span className="text-[8px] font-black text-slate-400 mr-2 uppercase">DE</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-700 dark:text-slate-200 w-full" />
          </div>
          <ArrowRight size={14} className="text-slate-300 shrink-0" />
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-11 border border-slate-100 dark:border-slate-800">
            <span className="text-[8px] font-black text-slate-400 mr-2 uppercase">ATÉ</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-700 dark:text-slate-200 w-full" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button onClick={handleShortcutToday} className="px-3 h-9 rounded-lg text-[8px] font-black uppercase hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-all">Hoje</button>
            <button onClick={handleShortcutMonth} className="px-3 h-9 rounded-lg text-[8px] font-black uppercase hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-all">Mês</button>
          </div>
          <div className="relative flex-1 lg:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="BUSCAR CLIENTE OU DESCRIÇÃO..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="w-full h-11 pl-9 pr-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-sky-50/20 dark:text-white" 
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="hidden lg:block lg:col-span-1">{renderForm()}</div>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px]">
            <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-50 dark:border-slate-800"><th className="px-8 py-6">DETALHES</th><th className="px-8 py-6 text-right">VALOR</th><th className="px-8 py-6 text-center">AÇÕES</th></tr></thead><tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredSales.map(s => {
                const isFromDelivery = s.description.includes('ENTREGA CONCLUÍDA');
                return (
                  <tr key={s.id} className={`hover:bg-slate-50/30 dark:hover:bg-slate-800/40 transition-colors group ${isFromDelivery ? 'bg-slate-50/10' : ''}`}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        {isFromDelivery && <Truck size={12} className="text-sky-500 shrink-0" />}
                        <p className={`text-[11px] font-black leading-none ${isFromDelivery ? 'text-sky-700 dark:text-sky-400' : 'text-slate-800 dark:text-slate-200'} mb-1`}>{s.description}</p>
                      </div>
                      <p className="text-[8px] text-slate-400 font-bold uppercase flex items-center gap-1"><User size={8}/> {getClientName(s.clientId)} <span className="text-slate-200 ml-2">|</span> {new Date(s.date + 'T00:00:00').toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-sm text-emerald-600">R$ {s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-8 py-5 text-center">
                      <div className={`flex justify-center gap-2 ${isFromDelivery ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                         {!isFromDelivery ? (
                           <>
                             <button onClick={() => handleEdit(s)} className="p-2 text-slate-300 hover:text-sky-500" title="Editar"><Pencil size={16}/></button>
                             <button onClick={() => onDelete(s.id)} className="p-2 text-slate-200 hover:text-rose-500" title="Excluir"><Trash2 size={16}/></button>
                           </>
                         ) : (
                           <div className="group/lock relative">
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-lg text-sky-600 dark:text-sky-400 cursor-help">
                                <Lock size={12} strokeWidth={3} />
                                <span className="text-[8px] font-black uppercase tracking-tight">LOGÍSTICA</span>
                              </div>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 text-white text-[7px] font-black uppercase tracking-widest rounded-xl shadow-2xl opacity-0 group-hover/lock:opacity-100 transition-all pointer-events-none z-50 text-center leading-relaxed">
                                <Info size={12} className="mx-auto mb-1 text-sky-400" />
                                ESTA VENDA FOI GERADA PELA ENTREGA. PARA EXCLUIR OU ALTERAR, CANCELE A ENTREGA NO PAINEL DE LOGÍSTICA.
                              </div>
                           </div>
                         )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-24 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <DollarSign size={48} className="mb-4 text-slate-400" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nenhuma venda no intervalo</p>
                    </div>
                  </td>
                </tr>
              )}
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
