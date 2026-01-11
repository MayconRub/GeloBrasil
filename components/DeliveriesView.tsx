
import { 
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  User,
  X,
  Clock,
  ArrowRight,
  Pencil,
  Printer,
  Hash,
  UserPlus,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  HandCoins,
  XCircle,
  Ban,
  UserCircle,
  BarChart3,
  PieChart,
  FileText,
  Building2,
  FileEdit,
  AlignLeft,
  Filter,
  ListFilter
} from 'lucide-react';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Client, Delivery, DeliveryStatus, Employee, Product, Vehicle, AppSettings, DeliveryItem } from '../types';

interface Props {
  deliveries: Delivery[];
  clients: Client[];
  drivers: Employee[];
  vehicles: Vehicle[];
  products: Product[];
  onUpdate: (delivery: Delivery) => void;
  onDelete: (id: string) => void;
  onAddClient: (client: Client) => Promise<any>;
  settings: AppSettings;
}

const DeliveriesView: React.FC<Props> = ({ deliveries, clients, drivers, vehicles, products, onUpdate, onDelete, onAddClient, settings }) => {
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [activeFilter, setActiveFilter] = useState<DeliveryStatus | 'TODOS'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [deliveryToConfirm, setDeliveryToConfirm] = useState<Delivery | null>(null);

  const [form, setForm] = useState<Partial<Delivery>>({ 
    status: DeliveryStatus.PENDENTE, 
    scheduledDate: getTodayString(),
    scheduledTime: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
    items: [],
    totalValue: 0,
    notes: ''
  });
  
  const [isExpressMode, setIsExpressMode] = useState(false);
  const [expressClient, setExpressClient] = useState({ name: '', phone: '', street: '', number: '', neighborhood: '', city: 'MONTES CLAROS', type: 'PARTICULAR' as const });
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemUnitPrice, setItemUnitPrice] = useState('');
  const [localTotalValue, setLocalTotalValue] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  const getClient = (id: string) => clients.find(c => c.id === id);
  const getDriver = (id: string) => drivers.find(d => d.id === id);
  const getProduct = (id: string) => products.find(p => p.id === id);

  useEffect(() => {
    if (selectedProductId && form.clientId) {
      const client = clients.find(c => c.id === form.clientId);
      const customPrice = client?.product_prices?.[selectedProductId];
      if (customPrice) setItemUnitPrice(customPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
      else setItemUnitPrice('');
    }
  }, [selectedProductId, form.clientId, clients]);

  const filtered = useMemo(() => {
    return deliveries.filter(d => {
      const client = getClient(d.clientId);
      const matchesStatus = activeFilter === 'TODOS' || d.status === activeFilter;
      const matchesDate = d.scheduledDate >= startDate && d.scheduledDate <= endDate;
      const searchLower = searchTerm.toLowerCase();
      return matchesStatus && matchesDate && (!searchTerm || 
        client?.name.toLowerCase().includes(searchLower) ||
        d.sequenceNumber?.toString().includes(searchTerm));
    }).sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
  }, [deliveries, activeFilter, startDate, endDate, searchTerm, clients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const totalVal = parseFloat(localTotalValue.replace(/\./g, '').replace(',', '.'));
    if (isNaN(totalVal) || totalVal <= 0) return alert("VALOR INVÁLIDO");

    setIsSubmitting(true);
    try {
      let finalClientId = form.clientId;
      if (isExpressMode) {
        const newId = crypto.randomUUID();
        await onAddClient({ ...expressClient, id: newId, created_at: new Date().toISOString() } as Client);
        finalClientId = newId;
      }
      await onUpdate({ ...form, id: form.id || crypto.randomUUID(), clientId: finalClientId, totalValue: totalVal } as Delivery);
      handleCloseModal();
    } catch (error) { console.error(error); }
    finally { setIsSubmitting(false); }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setForm({ status: DeliveryStatus.PENDENTE, scheduledDate: getTodayString(), items: [], totalValue: 0 });
    setLocalTotalValue('');
    setClientSearch('');
    setIsExpressMode(false);
  };

  const handleAddItem = () => {
    const qty = parseInt(itemQuantity);
    const uPrice = parseFloat(itemUnitPrice.replace(/\./g, '').replace(',', '.'));
    if (!selectedProductId || isNaN(qty) || qty <= 0) return;
    
    const newItems = [...(form.items || [])];
    const idx = newItems.findIndex(i => i.productId === selectedProductId);
    if (idx > -1) {
      newItems[idx].quantity += qty;
      if (!isNaN(uPrice)) newItems[idx].unitPrice = uPrice;
    } else {
      newItems.push({ productId: selectedProductId, quantity: qty, unitPrice: isNaN(uPrice) ? undefined : uPrice });
    }
    
    const newTotal = newItems.reduce((acc, curr) => acc + (curr.quantity * (curr.unitPrice || 0)), 0);
    setForm({ ...form, items: newItems });
    if (newTotal > 0) setLocalTotalValue(newTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    setSelectedProductId(''); setItemQuantity('1'); setItemUnitPrice('');
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 pb-24 lg:pb-20 max-w-[1600px] mx-auto transition-colors uppercase bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-12 h-12 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0"><Truck size={24} /></div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-none uppercase">Logística</h2>
            <p className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest">Painel de Entregas</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(true)} className="w-full sm:w-auto px-6 h-12 bg-sky-500 text-white rounded-xl font-black text-[9px] uppercase shadow-xl flex items-center justify-center gap-2">
           <Plus size={18} /> LANÇAR ROTA
        </button>
      </header>

      {/* Filters Mobile Stacked */}
      <div className="flex flex-col gap-3 bg-white dark:bg-slate-900 p-3 rounded-[1.8rem] border shadow-sm no-print">
        <div className="flex items-center gap-2">
           <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-10 border flex items-center">
             <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none outline-none text-[9px] font-bold dark:text-white w-full" />
           </div>
           <ArrowRight size={14} className="text-slate-300 shrink-0" />
           <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-10 border flex items-center">
             <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none outline-none text-[9px] font-bold dark:text-white w-full" />
           </div>
        </div>
        <div className="relative">
           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
           <input type="text" placeholder="BUSCAR PEDIDO..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-10 pl-9 bg-slate-50 dark:bg-slate-950 border rounded-xl text-[9px] font-black uppercase outline-none dark:text-white" />
        </div>
      </div>

      {/* Horizontal Status Filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {['TODOS', ...Object.values(DeliveryStatus)].map(status => (
          <button 
            key={status} 
            onClick={() => setActiveFilter(status as any)} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[8px] font-black transition-all whitespace-nowrap border-2 ${activeFilter === status ? 'bg-sky-500 text-white border-sky-600 shadow-md scale-105' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'}`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(d => {
          const client = getClient(d.clientId);
          const driver = getDriver(d.driverId);
          return (
            <div key={d.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border shadow-sm flex flex-col transition-all active:scale-[0.98]">
              <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${d.status === DeliveryStatus.ENTREGUE ? 'bg-emerald-500' : 'bg-amber-500'}`}><Truck size={18} /></div>
                    <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-500">{d.status}</span>
                          <span className="text-[8px] font-black text-sky-500 uppercase">#{d.sequenceNumber || '---'}</span>
                        </div>
                        <h4 className="font-black text-slate-800 dark:text-slate-100 text-xs uppercase mt-1 truncate max-w-[150px]">{client?.name || 'Carregando...'}</h4>
                    </div>
                  </div>
                  <div className="flex gap-1 no-print">
                    <button onClick={() => d.status === DeliveryStatus.PENDENTE ? onUpdate({...d, status: DeliveryStatus.EM_ROTA}) : setDeliveryToConfirm(d)} className="p-2 bg-sky-50 dark:bg-sky-900/20 text-sky-500 rounded-lg"><ChevronRight size={16}/></button>
                  </div>
              </div>

              <div className="space-y-2 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border">
                 <div className="flex items-start gap-2 text-[7px] font-black text-slate-400 uppercase">
                    <MapPin size={10} className="shrink-0" />
                    <span className="truncate">{client?.street || '---'}, {client?.number}</span>
                 </div>
                 <div className="flex items-center gap-2 text-[7px] font-black text-slate-400 uppercase">
                    <UserCircle size={10} className="shrink-0 text-sky-500" />
                    <span className="truncate">{driver?.name || 'SEM MOTORISTA'}</span>
                 </div>
              </div>

              <div className="mt-4 pt-3 border-t flex items-center justify-between">
                  <span className="text-[8px] font-black text-slate-400 uppercase">{d.scheduledTime || '--:--'}</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">R$ {(d.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delivery Form Modal / Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/90 dark:bg-black/95 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-t-[2.5rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl relative animate-in slide-in-from-bottom duration-500 sm:zoom-in-95 overflow-y-auto max-h-[95vh] custom-scrollbar">
            <header className="flex justify-between items-center mb-8 sticky top-0 bg-white dark:bg-slate-900 z-10 pb-2">
               <h3 className="text-xl font-black uppercase text-slate-800 dark:text-white">Nova Entrega</h3>
               <button onClick={handleCloseModal} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center"><X/></button>
            </header>
            <form onSubmit={handleSubmit} className="space-y-6 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="space-y-5">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Localizar Cliente</label>
                       <div className="relative">
                          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input type="text" placeholder="NOME DO CLIENTE..." className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-950 border rounded-xl font-bold text-xs dark:text-white uppercase outline-none" value={clientSearch} onChange={e => {setClientSearch(e.target.value); setIsClientDropdownOpen(true);}} onFocus={() => setIsClientDropdownOpen(true)} />
                          {isClientDropdownOpen && clientSearch && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border rounded-xl shadow-2xl z-50 overflow-hidden">
                               {clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).slice(0, 5).map(c => (
                                 <button key={c.id} type="button" onClick={() => {setForm({...form, clientId: c.id}); setClientSearch(c.name); setIsClientDropdownOpen(false);}} className="w-full p-4 text-left hover:bg-sky-50 dark:hover:bg-slate-700 border-b last:border-none flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-500"><MapPin size={14}/></div>
                                    <span className="text-[10px] font-black uppercase dark:text-white">{c.name}</span>
                                 </button>
                               ))}
                            </div>
                          )}
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Entregador</label>
                          <select className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border rounded-xl text-[10px] font-black dark:text-white" value={form.driverId || ''} onChange={e => setForm({...form, driverId: e.target.value})} required>
                             <option value="">SELECIONAR...</option>
                             {drivers.filter(d => d.status === 'ATIVO').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Veículo</label>
                          <select className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border rounded-xl text-[10px] font-black dark:text-white" value={form.vehicleId || ''} onChange={e => setForm({...form, vehicleId: e.target.value})} required>
                             <option value="">SELECIONAR...</option>
                             {vehicles.map(v => <option key={v.id} value={v.id}>{v.placa}</option>)}
                          </select>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-5">
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-6 rounded-[2rem] border">
                       <h5 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2"><ShoppingBag size={14}/> Cesta de Carga</h5>
                       <div className="space-y-3">
                          <select className="w-full h-10 px-4 bg-white dark:bg-slate-900 border rounded-xl text-[9px] font-black dark:text-white" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                             <option value="">ESCOLHER PRODUTO...</option>
                             {products.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                          </select>
                          <div className="grid grid-cols-2 gap-2">
                             <div className="flex items-center gap-2">
                                <button type="button" onClick={() => setItemQuantity(q => Math.max(1, parseInt(q)-1).toString())} className="w-10 h-10 bg-white border rounded-lg flex items-center justify-center active:scale-90"><Minus size={14}/></button>
                                <input type="number" className="flex-1 h-10 text-center font-black bg-white border rounded-lg text-xs" value={itemQuantity} onChange={e => setItemQuantity(e.target.value)} />
                                <button type="button" onClick={() => setItemQuantity(q => (parseInt(q)+1).toString())} className="w-10 h-10 bg-white border rounded-lg flex items-center justify-center active:scale-90"><Plus size={14}/></button>
                             </div>
                             <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-emerald-500">R$</span><input placeholder="PREÇO" value={itemUnitPrice} onChange={e => setItemUnitPrice(e.target.value)} className="w-full h-10 pl-8 bg-white border rounded-lg font-black text-[11px]" /></div>
                          </div>
                          <button type="button" onClick={handleAddItem} className="w-full h-10 bg-sky-500 text-white rounded-xl text-[9px] font-black uppercase shadow-lg">ADICIONAR ITEM</button>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Total do Pedido</label>
                       <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={24}/>
                          <input type="text" value={localTotalValue} onChange={e => setLocalTotalValue(e.target.value)} className="w-full h-16 pl-12 pr-6 bg-emerald-50/10 border-2 border-emerald-100 rounded-[1.5rem] text-3xl font-black text-emerald-600 outline-none" required />
                       </div>
                    </div>
                 </div>
              </div>
              <button type="submit" className="w-full h-20 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all">CONCLUIR AGENDAMENTO</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveriesView;
