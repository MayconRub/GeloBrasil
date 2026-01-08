
import React, { useState, useMemo } from 'react';
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
  User,
  ShoppingBag,
  Minus,
  Sparkles,
  Package,
  ArrowRight
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
}

const SalesView: React.FC<Props> = ({ sales, onUpdate, onDelete, settings, monthlyGoals, onUpdateMonthlyGoal, clients }) => {
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

  // Estados de Filtro
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de Formulário
  const [description, setDescription] = useState('Venda de Gelo');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [clientId, setClientId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);

  // Estados para a Cesta de Itens
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [showItemForm, setShowItemForm] = useState(false);

  const OFFICIAL_PRODUCTS = [
    { id: '1', name: 'GELO EM CUBO 2KG' },
    { id: '2', name: 'GELO EM CUBO 4KG' },
    { id: '3', name: 'GELO EM CUBO 10KG' },
    { id: '4', name: 'GELO EM CUBO 20KG' },
    { id: '5', name: 'GELO BRITADO 10KG' },
    { id: '6', name: 'GELO BRITADO 20KG' },
    { id: '7', name: 'GELO EM BARRA 10KG' }
  ];

  const handleValueChange = (val: string) => {
    const sanitized = val.replace(/[^0-9.,]/g, '').replace(',', '.');
    setValue(sanitized);
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

    const prodNames = [...items, { productId: selectedProductId, quantity: qty }].map(item => {
      const p = OFFICIAL_PRODUCTS.find(op => op.id === item.productId);
      return `${item.quantity}un ${p?.name.split(' ').pop()}`;
    });
    if (description === 'Venda de Gelo' || description === '') {
      setDescription(`VENDA: ${prodNames.join(' | ')}`);
    }
    setSelectedProductId('');
    setItemQuantity('1');
  };

  const handleRemoveItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value);
    if (!description || isNaN(numericValue)) return;
    onUpdate({ 
      id: editingId || crypto.randomUUID(), 
      description: description.toUpperCase(), 
      value: numericValue, 
      date, 
      clientId: clientId || undefined,
      items: items.length > 0 ? items : undefined
    });
    resetForm();
  };

  const handleEdit = (sale: Sale) => {
    if (confirm(`DESEJA ALTERAR O LANÇAMENTO DE VENDA?`)) {
      setEditingId(sale.id);
      setDescription(sale.description);
      setValue(sale.value.toString());
      setDate(sale.date);
      setClientId(sale.clientId || '');
      setItems(sale.items || []);
      setShowItemForm((sale.items?.length || 0) > 0);
      if (window.innerWidth < 1024) setIsMobileFormOpen(true);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = (sale: Sale) => {
    if (confirm(`DESEJA EXCLUIR ESTE LANÇAMENTO?`)) onDelete(sale.id);
  };

  const resetForm = () => {
    setEditingId(null); 
    setDescription('Venda de Gelo'); 
    setValue(''); 
    setDate(getTodayString()); 
    setClientId(''); 
    setItems([]);
    setShowItemForm(false);
    setIsMobileFormOpen(false);
  };

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const matchesDate = s.date >= startDate && s.date <= endDate;
      const clientName = clients.find(c => c.id === s.clientId)?.name || 'AVULSO';
      const matchesSearch = !searchTerm || 
        s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [sales, startDate, endDate, searchTerm, clients]);

  const handleShortcutToday = () => {
    setStartDate(getTodayString());
    setEndDate(getTodayString());
  };

  const handleShortcutMonth = () => {
    setStartDate(getFirstDayOfMonth());
    setEndDate(getLastDayOfMonth());
  };

  const getClientName = (id?: string) => clients.find(c => c.id === id)?.name || 'AVULSO';
  const getProductName = (id: string) => OFFICIAL_PRODUCTS.find(p => p.id === id)?.name || 'PRODUTO';

  const renderForm = (isModal = false) => (
    <div className={`${isModal ? '' : 'bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none no-print'}`}>
      <div className="flex items-center justify-between mb-6">
         <h3 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
           <DollarSign size={16} className="text-emerald-500" /> {editingId ? 'Editar Lançamento' : 'Novo Lançamento'}
         </h3>
         {!showItemForm && (
           <button type="button" onClick={() => setShowItemForm(true)} className="text-[9px] font-black text-sky-500 hover:text-sky-600 uppercase flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/30 px-3 py-1.5 rounded-lg border border-sky-100 dark:border-sky-900/30 transition-all">
             <Plus size={12}/> Detalhar Itens
           </button>
         )}
      </div>
      <div className="space-y-6">
        {showItemForm && (
          <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2"><ShoppingBag size={12}/> Cesta de Itens</span>
                <button type="button" onClick={() => { setShowItemForm(false); setItems([]); }} className="text-slate-300 hover:text-rose-500"><X size={16}/></button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
                <div className="sm:col-span-7">
                  <select 
                    value={selectedProductId} 
                    onChange={e => setSelectedProductId(e.target.value)}
                    className="w-full h-11 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-[10px] uppercase dark:text-white outline-none"
                  >
                    <option value="">SELECIONE O PRODUTO</option>
                    {OFFICIAL_PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-3 flex items-center gap-2">
                  <input 
                    type="number" 
                    value={itemQuantity} 
                    onChange={e => setItemQuantity(e.target.value)}
                    className="w-full h-11 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-center text-sm dark:text-white"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={handleAddItem}
                  className="sm:col-span-2 h-11 bg-sky-500 text-white rounded-xl flex items-center justify-center hover:bg-sky-600 transition-all active:scale-95 shadow-lg shadow-sky-500/10"
                >
                  <Plus size={20} />
                </button>
             </div>
             {items.length > 0 && (
               <div className="space-y-1 mt-4 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                       <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-sky-50 dark:bg-sky-900/30 text-sky-500 rounded-lg flex items-center justify-center text-[10px] font-black">{item.quantity}</span>
                          <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase truncate">{getProductName(item.productId)}</span>
                       </div>
                       <button type="button" onClick={() => handleRemoveItem(idx)} className="text-slate-200 hover:text-rose-500 transition-colors"><Minus size={16}/></button>
                    </div>
                  ))}
               </div>
             )}
          </div>
        )}
        <form onSubmit={handleAdd} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2">Cliente</label>
                <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase outline-none dark:text-white">
                  <option value="">CONSUMIDOR AVULSO</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             </div>
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2">Data</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-sm dark:text-white" required />
             </div>
          </div>
          <div className="space-y-1.5">
             <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2">Descrição / Resumo</label>
             <input type="text" placeholder="Ex: Venda Balcão" value={description} onChange={e => setDescription(e.target.value)} className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-black uppercase dark:text-white" required />
          </div>
          <div className="space-y-1.5">
             <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2 tracking-widest">Valor Total Recebido</label>
             <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-lg">R$</span>
                <input type="text" placeholder="0,00" value={value} onChange={e => handleValueChange(e.target.value)} className="w-full h-16 pl-14 pr-6 bg-emerald-50/20 dark:bg-slate-950 border border-emerald-100 dark:border-slate-800 rounded-[1.8rem] text-2xl font-black text-emerald-600 dark:text-emerald-400 focus:ring-4 focus:ring-emerald-50 dark:focus:ring-emerald-950 outline-none transition-all" required />
             </div>
          </div>
          <div className="flex gap-3 pt-4">
             <button type="submit" className="flex-1 h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black rounded-3xl hover:bg-sky-600 dark:hover:bg-sky-400 transition-all text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl dark:shadow-none active:scale-95">
                {editingId ? <Save size={20} /> : <Check size={20} strokeWidth={3} />} {editingId ? 'ATUALIZAR VENDA' : 'FINALIZAR LANÇAMENTO'}
             </button>
             {(editingId || isModal) && (
               <button type="button" onClick={resetForm} className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-3xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"><X size={24} /></button>
             )}
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="flex flex-col">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tighter leading-none flex items-center gap-3"><TrendingUp className="text-sky-500" size={32} /> Vendas</h2>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
              <LayoutList size={14} className="text-sky-500" /> Registro de Faturamento e Fluxo
            </p>
          </div>
          <button onClick={() => setIsMobileFormOpen(true)} className="lg:hidden w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95"><Plus size={24} /></button>
        </div>
      </header>

      {/* Unified Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 bg-white dark:bg-slate-900 p-2 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 shadow-sm no-print">
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
          <div className="relative flex-1 lg:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input type="text" placeholder="PESQUISAR CLIENTE OU VENDA..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-11 pl-9 pr-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-sky-500/20 dark:text-white" />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500"><X size={14} /></button>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="hidden lg:block lg:col-span-1 no-print">{renderForm()}</div>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
               {filteredSales.length === 0 ? (
                 <div className="p-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhuma venda encontrada</div>
               ) : (
                 filteredSales.map((sale) => (
                   <div key={sale.id} className="p-5 space-y-3 group active:bg-sky-50/50 dark:active:bg-slate-800 transition-all">
                      <div className="flex justify-between items-start">
                         <div className="flex flex-col">
                            <span className="text-[13px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-tight">{sale.description}</span>
                            <span className="text-[8px] font-black text-sky-500 mt-1 uppercase flex items-center gap-1"><User size={10} /> {getClientName(sale.clientId)}</span>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => handleEdit(sale)} className="p-3 text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-950 rounded-xl"><Pencil size={18} /></button>
                            <button onClick={() => handleDelete(sale)} className="p-3 text-rose-300 dark:text-rose-900 bg-rose-50 dark:bg-rose-950/30 rounded-xl"><Trash2 size={18} /></button>
                         </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800">
                         <span className="text-xl font-black text-emerald-600 dark:text-emerald-500">R$ {sale.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                         <div className="flex flex-col items-end">
                           <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase">{new Date(sale.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                           {sale.items && <span className="text-[7px] font-black text-sky-400 uppercase mt-1">Itemizado ✓</span>}
                         </div>
                      </div>
                   </div>
                 ))
               )}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="text-slate-400 dark:text-slate-600 text-[9px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 w-1/3">Descrição</th>
                    <th className="px-6 py-4 w-1/4">Cliente</th>
                    <th className="px-6 py-4 w-1/6">Valor</th>
                    <th className="px-6 py-4 w-1/6">Data</th>
                    <th className="px-6 py-4 w-24 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="group hover:bg-sky-50/20 dark:hover:bg-slate-800/40 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="truncate text-xs font-black text-slate-800 dark:text-slate-200 uppercase">{sale.description}</span>
                           {sale.items && <span className="text-[7px] font-black text-sky-400 uppercase mt-1 flex items-center gap-1"><Package size={8}/> Detalhado</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[9px] font-black text-sky-500 bg-sky-50 dark:bg-sky-900/20 px-2 py-1 rounded-lg uppercase">{getClientName(sale.clientId)}</span>
                      </td>
                      <td className="px-6 py-4 font-black text-emerald-600 dark:text-emerald-500">R$ {sale.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-600">{new Date(sale.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(sale)} className="p-1.5 text-slate-400 dark:text-slate-600 hover:text-sky-500"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(sale)} className="p-1.5 text-rose-300 dark:text-rose-900 hover:text-rose-500"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSales.length === 0 && (
                    <tr><td colSpan={5} className="py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhuma venda registrada no período</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isMobileFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/95 backdrop-blur-sm animate-in fade-in duration-300 lg:hidden">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-8 shadow-2xl dark:shadow-none border border-transparent dark:border-slate-800 relative animate-in zoom-in-95 overflow-y-auto max-h-[90vh] custom-scrollbar">
              <button onClick={() => setIsMobileFormOpen(false)} className="absolute top-6 right-6 text-slate-300 dark:text-slate-700 hover:text-rose-500"><X size={24} /></button>
              {renderForm(true)}
           </div>
        </div>
      )}
    </div>
  );
};

export default SalesView;
