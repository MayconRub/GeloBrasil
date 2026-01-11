
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
  const [itemUnitPrice, setItemUnitPrice] = useState('');

  const handleShortcutToday = () => { setStartDate(getTodayString()); setEndDate(getTodayString()); };
  const handleShortcutMonth = () => { setStartDate(getFirstDayOfMonth()); setEndDate(getLastDayOfMonth()); };

  // Máscara de Moeda Brasileira
  const maskCurrency = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (!digits) return "";
    const amount = parseFloat(digits) / 100;
    return new Intl.NumberFormat('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(amount);
  };

  // Ao selecionar um produto, busca o preço personalizado do cliente
  useEffect(() => {
    if (selectedProductId && clientId) {
      const client = clients.find(c => c.id === clientId);
      const customPrice = client?.product_prices?.[selectedProductId];
      if (customPrice) {
        setItemUnitPrice(customPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
      } else {
        setItemUnitPrice('');
      }
    } else {
      setItemUnitPrice('');
    }
  }, [selectedProductId, clientId, clients]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
    if (isNaN(numericValue)) return;
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
    if (sale.description.includes('ENTREGA CONCLUÍDA')) return;
    setEditingId(sale.id);
    setDescription(sale.description);
    setValue(sale.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
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
    return sales
      .filter(s => {
        const matchesDate = s.date >= startDate && s.date <= endDate;
        const clientName = clients.find(c => c.id === s.clientId)?.name || 'AVULSO';
        return matchesDate && (!searchTerm || (s.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || (clientName || '').toLowerCase().includes(searchTerm.toLowerCase()));
      })
      .sort((a, b) => {
        // Primeiro ordena pela data informada no lançamento (mais recente primeiro)
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        
        // Se a data for a mesma, ordena pela data/hora de criação no sistema (created_at)
        if (a.created_at && b.created_at) {
          return b.created_at.localeCompare(a.created_at);
        }
        
        // Fallback: usar o ID para manter uma ordem estável caso created_at não esteja disponível
        return b.id.localeCompare(a.id);
      });
  }, [sales, startDate, endDate, searchTerm, clients]);

  const getClientName = (id?: string) => clients.find(c => c.id === id)?.name || 'AVULSO';
  const getProductName = (id: string) => products.find(p => p.id === id)?.nome || 'PRODUTO';

  const handleAddItem = () => {
    const qty = parseInt(itemQuantity);
    const uPrice = parseFloat(itemUnitPrice.replace(/\./g, '').replace(',', '.'));
    
    if (!selectedProductId || isNaN(qty) || qty <= 0) return;
    
    const newItems = [...items];
    const existingIdx = newItems.findIndex(i => i.productId === selectedProductId);
    
    if (existingIdx > -1) {
      newItems[existingIdx].quantity += qty;
      if (!isNaN(uPrice)) newItems[existingIdx].unitPrice = uPrice;
    } else {
      newItems.push({ 
        productId: selectedProductId, 
        quantity: qty, 
        unitPrice: isNaN(uPrice) ? undefined : uPrice 
      });
    }
    
    setItems(newItems);
    setSelectedProductId('');
    setItemQuantity('1');
    setItemUnitPrice('');

    const newTotal = newItems.reduce((acc, curr) => acc + (curr.quantity * (curr.unitPrice || 0)), 0);
    if (newTotal > 0) {
      setValue(newTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    }
  };

  const renderFormContent = () => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all h-fit">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner">
          <DollarSign size={24} />
        </div>
        <div>
           <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none flex items-center gap-2">
             LANÇAR <span className="text-emerald-500">VENDA</span>
           </h3>
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Registro de Faturamento</p>
        </div>
      </div>
      
      <form onSubmit={handleAdd} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Cliente</label>
              <select 
                value={clientId} 
                onChange={e => setClientId(e.target.value)} 
                className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl text-[10px] font-black uppercase outline-none dark:text-white shadow-inner"
              >
                <option value="">BALCÃO (AVULSO)</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
           </div>
           <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Data</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl font-bold text-xs dark:text-white shadow-inner" 
                required 
              />
           </div>
        </div>

        <div className="space-y-1.5">
           <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Valor do Faturamento R$</label>
           <div className="relative">
              <input 
                placeholder="R$ 0,00" 
                value={value ? `R$ ${value}` : ''} 
                onChange={e => setValue(maskCurrency(e.target.value))} 
                className="w-full h-20 px-8 bg-emerald-50/20 dark:bg-slate-950 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-[2rem] text-3xl font-black text-emerald-600 outline-none placeholder:text-emerald-100" 
                required 
              />
           </div>
        </div>

        <button 
          type="button"
          onClick={() => setShowCatalog(!showCatalog)}
          className={`w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all ${showCatalog ? 'bg-sky-50 border-sky-200 text-sky-600 dark:bg-sky-900/20 dark:border-sky-800' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-sky-200 hover:text-sky-500 dark:bg-slate-950 dark:border-slate-800'}`}
        >
          <Package size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {showCatalog ? 'RECOLHER DETALHES' : 'DETALHAR PRODUTOS (OPCIONAL)'}
          </span>
          {showCatalog ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showCatalog && (
          <div className="bg-slate-50 dark:bg-slate-950/80 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-inner space-y-4 animate-in slide-in-from-top-2 duration-300">
             <select 
                className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-[10px] uppercase dark:text-white outline-none" 
                value={selectedProductId} 
                onChange={e => setSelectedProductId(e.target.value)}
              >
                <option value="">PRODUTO...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    placeholder="QTD"
                    className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center font-black text-sm dark:text-white outline-none" 
                    value={itemQuantity} 
                    onChange={e => setItemQuantity(e.target.value)} 
                    min="1"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-[8px]">R$</span>
                  <input 
                    placeholder="PREÇO UN." 
                    value={itemUnitPrice} 
                    onChange={e => setItemUnitPrice(maskCurrency(e.target.value))}
                    className="w-full h-12 pl-8 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-xs text-emerald-600 outline-none"
                  />
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleAddItem} 
                disabled={!selectedProductId} 
                className="w-full h-12 bg-sky-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 disabled:opacity-30 transition-all"
              >
                ADICIONAR ITEM
              </button>

              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar border-t border-slate-200 dark:border-slate-800 pt-4">
                {items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase truncate">{getProductName(it.productId)}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{it.quantity} un x R$ {it.unitPrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <button type="button" onClick={() => setItems(items.filter((_,i)=>i!==idx))} className="text-rose-300 hover:text-rose-500"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
          </div>
        )}

        <button 
          type="submit" 
          className="w-full h-20 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[2.2rem] font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all"
        >
          CONCLUIR LANÇAMENTO
        </button>
      </form>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto transition-colors uppercase bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl flex items-center justify-center shadow-lg"><TrendingUp size={28} /></div>
           <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-none uppercase tracking-tighter flex items-center gap-2">VENDAS <span className="text-sky-500">DIÁRIAS</span></h2>
        </div>
        <button onClick={() => setIsMobileFormOpen(true)} className="lg:hidden w-14 h-14 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-90"><Plus size={24} /></button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Formulário à Esquerda */}
        <div className="hidden lg:block">
           {renderFormContent()}
        </div>

        {/* Listagem à Direita */}
        <div className="lg:col-span-2 space-y-6">
          {/* Barra de Filtro Padronizada */}
          <div className="flex flex-col md:flex-row gap-3 bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm no-print">
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
              <div className="relative flex-1 md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="text" placeholder="PESQUISAR VENDAS..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-11 pl-9 pr-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-sky-50/20 dark:text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-300 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-50 dark:border-slate-800">
                    <th className="px-10 py-6">DETALHES</th>
                    <th className="px-10 py-6 text-right">VALOR</th>
                    <th className="px-10 py-6 text-center">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredSales.map(s => {
                    const isFromDelivery = s.description.includes('ENTREGA CONCLUÍDA');
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-10 py-6">
                           <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase leading-none mb-1">{s.description}</p>
                           <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                              <span><User size={8} className="inline mr-1"/> {getClientName(s.clientId)}</span>
                              <span className="text-slate-200">|</span>
                              <span>{new Date(s.date + 'T00:00:00').toLocaleDateString()}</span>
                           </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <span className="text-sm font-black text-emerald-500">R$ {s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </td>
                        <td className="px-10 py-6 text-center">
                           <div className="flex justify-center gap-3 transition-all">
                              {!isFromDelivery && (
                                <>
                                  <button onClick={() => handleEdit(s)} title="Editar Venda" className="p-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors shadow-lg active:scale-95"><Pencil size={18}/></button>
                                  <button onClick={() => onDelete(s.id)} title="Excluir Venda" className="p-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors shadow-lg active:scale-95"><Trash2 size={18}/></button>
                                </>
                              )}
                              {isFromDelivery && (
                                <button 
                                  onClick={() => alert('ESTA VENDA FOI GERADA AUTOMATICAMENTE PELO PAINEL DE ENTREGAS. PARA ALTERAR OU CANCELAR, UTILIZE O MÓDULO DE ENTREGAS.')} 
                                  title="VENDA GERADA NO PAINEL DE ENTREGAS. PARA EDITAR OU CANCELAR, VÁ ATÉ O MÓDULO DE ENTREGAS." 
                                  className="p-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl text-slate-400 hover:text-sky-500 transition-colors cursor-help"
                                >
                                  <Lock size={18} />
                                </button>
                              )}
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-24 text-center opacity-20">
                        <div className="flex flex-col items-center">
                          <DollarSign size={48} className="mb-4 text-slate-300" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nenhuma venda encontrada no intervalo</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isMobileFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/90 dark:bg-black/98 backdrop-blur-xl" onClick={resetForm} />
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] p-8 shadow-2xl relative border dark:border-slate-800 overflow-y-auto max-h-[90vh]">
              <button onClick={resetForm} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500"><X size={32}/></button>
              {renderFormContent()}
           </div>
        </div>
      )}
    </div>
  );
};

export default SalesView;
