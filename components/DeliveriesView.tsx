
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
  Pencil
} from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { Client, Delivery, DeliveryStatus, Employee, Product, Vehicle } from '../types';

interface Props {
  deliveries: Delivery[];
  clients: Client[];
  drivers: Employee[];
  vehicles: Vehicle[];
  products: Product[];
  onUpdate: (delivery: Delivery) => void;
  onDelete: (id: string) => void;
}

const DeliveriesView: React.FC<Props> = ({ deliveries, clients, drivers, vehicles, products, onUpdate, onDelete }) => {
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

  const getNowTimeString = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<DeliveryStatus | 'TODOS'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de Filtro por Intervalo
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());

  const [form, setForm] = useState<Partial<Delivery>>({ 
    status: DeliveryStatus.PENDENTE, 
    scheduledDate: getTodayString(),
    scheduledTime: getNowTimeString(),
    items: [],
    totalValue: 0
  });
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [localTotalValue, setLocalTotalValue] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getClient = (id: string) => clients.find(c => c.id === id);

  const filtered = useMemo(() => {
    return deliveries.filter(d => {
      const client = getClient(d.clientId);
      const matchesStatus = activeFilter === 'TODOS' || d.status === activeFilter;
      
      // Lógica de Intervalo de Datas
      const deliveryDate = d.scheduledDate;
      const matchesDate = deliveryDate >= startDate && deliveryDate <= endDate;
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        client?.name.toLowerCase().includes(searchLower) ||
        client?.street.toLowerCase().includes(searchLower) ||
        client?.neighborhood.toLowerCase().includes(searchLower) ||
        d.notes?.toLowerCase().includes(searchLower);

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [deliveries, activeFilter, startDate, endDate, searchTerm, clients]);

  const handleShortcutToday = () => {
    setStartDate(getTodayString());
    setEndDate(getTodayString());
  };

  const handleShortcutMonth = () => {
    setStartDate(getFirstDayOfMonth());
    setEndDate(getLastDayOfMonth());
  };

  const searchedClients = useMemo(() => {
    if (!clientSearch) return [];
    const term = clientSearch.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(term) || c.street.toLowerCase().includes(term)).slice(0, 5);
  }, [clients, clientSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.driverId || !form.vehicleId) return;
    onUpdate({ ...form, id: form.id || crypto.randomUUID(), totalValue: parseFloat(localTotalValue.replace(',', '.')) || 0 } as Delivery);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setForm({ status: DeliveryStatus.PENDENTE, scheduledDate: getTodayString(), scheduledTime: getNowTimeString(), items: [], totalValue: 0 });
    setClientSearch(''); setLocalTotalValue(''); setIsClientDropdownOpen(false);
  };

  const handleEdit = (delivery: Delivery) => {
    const client = clients.find(c => c.id === delivery.clientId);
    setForm(delivery);
    setClientSearch(client?.name || '');
    setLocalTotalValue(delivery.totalValue?.toString().replace('.', ',') || '');
    setIsOpen(true);
  };

  const selectClient = (client: Client) => {
    setForm({ ...form, clientId: client.id });
    setClientSearch(client.name);
    setIsClientDropdownOpen(false);
  };

  const updateStatus = (delivery: Delivery, status: DeliveryStatus) => {
    onUpdate({ ...delivery, status, deliveredAt: status === DeliveryStatus.ENTREGUE ? new Date().toISOString() : undefined });
  };

  const getDriver = (id: string) => drivers.find(d => d.id === id);
  const getVehicle = (id: string) => vehicles.find(v => v.id === id);
  const getProduct = (id: string) => products.find(p => p.id === id);

  return (
    <div className="p-4 sm:p-8 space-y-4 pb-24 max-w-[1600px] mx-auto overflow-x-hidden transition-colors">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-lg"><Truck size={20} /></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">ENTREGAS</h2>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">GELO BRASIL • LOGÍSTICA</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(true)} className="px-5 h-10 bg-sky-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
          <Plus size={16} /> <span className="hidden sm:inline">NOVO AGENDAMENTO</span>
        </button>
      </header>

      {/* Modern Compact Range Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        {/* Date Inputs Group */}
        <div className="flex items-center gap-2 flex-1">
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-11 border border-slate-100 dark:border-slate-800">
            <span className="text-[8px] font-black text-slate-400 mr-2 uppercase">DE</span>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-700 dark:text-slate-200 w-full"
            />
          </div>
          <ArrowRight size={14} className="text-slate-300 shrink-0" />
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-11 border border-slate-100 dark:border-slate-800">
            <span className="text-[8px] font-black text-slate-400 mr-2 uppercase">ATÉ</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-700 dark:text-slate-200 w-full"
            />
          </div>
        </div>

        {/* Search & Shortcuts Group */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button onClick={handleShortcutToday} className="px-3 h-9 rounded-lg text-[8px] font-black uppercase hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-all">Hoje</button>
            <button onClick={handleShortcutMonth} className="px-3 h-9 rounded-lg text-[8px] font-black uppercase hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-all">Mês</button>
          </div>
          
          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="BUSCAR CLIENTE..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-9 pr-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-sky-50/20 dark:text-white"
            />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500"><X size={14} /></button>}
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {['TODOS', ...Object.values(DeliveryStatus)].map(status => (
          <button 
            key={status} 
            onClick={() => setActiveFilter(status as any)} 
            className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeFilter === status ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-700 border-slate-100 dark:border-slate-800 opacity-60'}`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Results Content */}
      {filtered.length === 0 ? (
        <div className="py-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center px-6">
           <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center text-slate-100 dark:text-slate-800 mb-4">
              <Truck size={32} />
           </div>
           <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-relaxed">
             {searchTerm ? 'Nenhum resultado para sua busca' : 'Nenhuma entrega encontrada no período'}
           </h3>
           <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase">Ajuste o intervalo de datas ou limpe os filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(d => {
            const client = getClient(d.clientId);
            return (
              <div key={d.id} className={`bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] border flex flex-col h-full ${d.status === DeliveryStatus.ENTREGUE ? 'border-emerald-100 dark:border-emerald-900/30' : 'border-slate-100 dark:border-slate-800'} shadow-sm transition-all group`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${d.status === DeliveryStatus.ENTREGUE ? 'bg-emerald-500 text-white' : d.status === DeliveryStatus.EM_ROTA ? 'bg-sky-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}><Truck size={18} /></div>
                      <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${d.status === DeliveryStatus.ENTREGUE ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>{d.status}</span>
                            {d.scheduledTime && <span className="text-[7px] font-black text-sky-500 uppercase tracking-tighter">{d.scheduledTime}</span>}
                          </div>
                      </div>
                    </div>
                    <div className="flex gap-0.5 transition-opacity">
                      {d.status !== DeliveryStatus.ENTREGUE && <button onClick={() => updateStatus(d, DeliveryStatus.ENTREGUE)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900 rounded-lg"><CheckCircle2 size={16} /></button>}
                      <button onClick={() => handleEdit(d)} className="p-1.5 text-slate-300 hover:text-sky-500 transition-colors"><Pencil size={16} /></button>
                      <button onClick={() => onDelete(d.id)} className="p-1.5 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                </div>

                <div className="flex-1 space-y-3">
                    <div className="min-w-0">
                        <h4 className="font-black text-slate-800 dark:text-slate-100 text-[11px] uppercase truncate leading-tight">{client?.name || 'Cliente Removido'}</h4>
                        <div className="flex items-start gap-1.5 text-[8px] font-bold text-slate-400 mt-1 uppercase truncate"><MapPin size={10} className="shrink-0" /> <span>{client?.street}, {client?.number}</span></div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="space-y-1">
                        {d.items && d.items.length > 0 ? d.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[8px] font-black uppercase">
                            <span className="text-slate-500 dark:text-slate-400 truncate mr-2">{getProduct(item.productId)?.name || 'Produto'}</span>
                            <span className="text-slate-900 dark:text-white shrink-0">{item.quantity} un</span>
                          </div>
                        )) : <p className="text-[8px] text-slate-300 uppercase italic">Carga Vazia</p>}
                      </div>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-[8px] font-black text-slate-400 uppercase">{new Date(d.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                    {d.status === DeliveryStatus.PENDENTE && <button onClick={() => updateStatus(d, DeliveryStatus.EM_ROTA)} className="px-3 py-1.5 bg-sky-50 dark:bg-sky-900/30 text-sky-500 rounded-lg text-[8px] font-black uppercase hover:bg-sky-500 hover:text-white transition-all">INICIAR ROTA</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4 md:p-6">
          <div className="absolute inset-0 bg-slate-900/90 dark:bg-black/95 backdrop-blur-md animate-in fade-in duration-300" onClick={handleCloseModal} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl dark:shadow-none relative animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden border border-transparent dark:border-slate-800">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 sm:top-8 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-700 hover:text-rose-500 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all z-[210] active:scale-90"><X size={20} className="sm:size-6" strokeWidth={3} /></button>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-6 sm:mb-10 flex items-center gap-3 shrink-0"><div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-50 dark:bg-sky-900/30 text-sky-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner"><PackageCheck size={24} className="sm:size-7" /></div>{form.id ? 'Editar' : 'Agendar'} <span className="text-sky-500">Entrega</span></h3>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-8 sm:space-y-10 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                 <div className="space-y-6 sm:space-y-8">
                    <div className="space-y-2 relative" ref={dropdownRef}><label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest flex items-center gap-2"><Search size={12} className="text-sky-500" /> Localizar Cliente</label><div className="relative"><Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" /><input type="text" placeholder="BUSQUE POR NOME OU ENDEREÇO..." className="w-full h-14 sm:h-16 pl-14 pr-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-[11px] uppercase outline-none focus:ring-4 focus:ring-sky-50 dark:focus:ring-sky-900/20 dark:text-white transition-all shadow-inner dark:shadow-none" value={clientSearch} onChange={(e) => { setClientSearch(e.target.value); setIsClientDropdownOpen(true); if (form.clientId) setForm({ ...form, clientId: undefined }); }} onFocus={() => setIsClientDropdownOpen(true)} />{form.clientId && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg"><Check size={18} strokeWidth={3} /></div>}</div>
                    {isClientDropdownOpen && searchedClients.length > 0 && <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl dark:shadow-none z-[220] overflow-hidden animate-in fade-in slide-in-from-top-2">{searchedClients.map(c => <button key={c.id} type="button" onClick={() => selectClient(c)} className="w-full p-4 hover:bg-sky-50 dark:hover:bg-slate-700 text-left border-b border-slate-50 dark:border-slate-950 last:border-0 transition-all flex items-start gap-3"><div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900 text-sky-500 flex items-center justify-center shrink-0"><MapPin size={16} /></div><div className="min-w-0"><p className="text-[11px] font-black text-slate-800 dark:text-white uppercase leading-none mb-1">{c.name}</p><p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase truncate">{c.street}, {c.number}</p></div></button>)}</div>}</div>
                    <div className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2">Motorista</label><select className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-[10px] uppercase outline-none px-4 dark:text-white" value={form.driverId || ''} onChange={e => setForm({...form, driverId: e.target.value})} required><option value="">-- MOTORISTA --</option>{drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2">Veículo</label><select className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-[10px] uppercase outline-none px-4 dark:text-white" value={form.vehicleId || ''} onChange={e => setForm({...form, vehicleId: e.target.value})} required><option value="">-- VEÍCULO --</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.placa}</option>)}</select></div></div><div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Data</label><input type="date" className="w-full h-14 sm:h-16 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-sky-50 dark:focus:ring-sky-900/20 dark:text-white" value={form.scheduledDate || ''} onChange={e => setForm({...form, scheduledDate: e.target.value})} required /></div><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Hora</label><input type="time" className="w-full h-14 sm:h-16 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-sky-50 dark:focus:ring-sky-900/20 dark:text-white" value={form.scheduledTime || ''} onChange={e => setForm({...form, scheduledTime: e.target.value})} required /></div></div></div>
                 </div>
                 <div className="space-y-8"><div className="bg-slate-50 dark:bg-slate-950/80 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-inner dark:shadow-none relative overflow-hidden"><h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10"><ShoppingBag size={18} className="text-sky-500" /> Itens da Carga</h4><div className="space-y-4 relative z-10"><div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-700 uppercase ml-2">Produto</label><select className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-[10px] uppercase outline-none dark:text-white" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}><option value="">ESCOLHER...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div><div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-700 uppercase ml-2">Quantidade</label><div className="flex items-center gap-3"><button type="button" onClick={() => setItemQuantity(q => Math.max(1, parseInt(q) - 1).toString())} className="w-12 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-700 transition-all active:scale-90"><Minus size={20} /></button><input type="number" className="flex-1 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center font-black text-lg outline-none dark:text-white" value={itemQuantity} onChange={e => setItemQuantity(e.target.value)} min="1"/><button type="button" onClick={() => setItemQuantity(q => (parseInt(q || '0') + 1).toString())} className="w-12 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-700 transition-all active:scale-90"><Plus size={20} /></button></div></div><button type="button" onClick={() => { const qty = parseInt(itemQuantity); if (!selectedProductId || isNaN(qty) || qty <= 0) return; const newItems = [...(form.items || [])]; const idx = newItems.findIndex(i => i.productId === selectedProductId); if (idx > -1) newItems[idx].quantity += qty; else newItems.push({ productId: selectedProductId, quantity: qty }); setForm({ ...form, items: newItems }); setSelectedProductId(''); setItemQuantity('1'); }} disabled={!selectedProductId} className="w-full h-12 bg-sky-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg dark:shadow-none active:scale-95 disabled:opacity-30">Adicionar Item</button></div><div className="mt-8 space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar border-t border-slate-200 dark:border-slate-800 pt-6 relative z-10">{form.items?.map((item, idx) => <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none"><div className="min-w-0 flex-1"><p className="text-[10px] font-black text-slate-800 dark:text-white uppercase leading-none truncate mb-1">{getProduct(item.productId)?.name}</p><p className="text-[9px] font-bold text-slate-400 dark:text-slate-700 uppercase">{item.quantity} un</p></div><button type="button" onClick={() => setForm({ ...form, items: (form.items || []).filter(i => i.productId !== item.productId) })} className="w-8 h-8 flex items-center justify-center bg-rose-50 dark:bg-rose-950/30 text-rose-300 dark:text-rose-900 hover:text-rose-500 rounded-lg transition-all"><Trash2 size={14}/></button></div>)}</div></div><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 dark:text-slate-700 uppercase ml-2 flex items-center gap-2"><DollarSign size={12} className="text-emerald-500" /> Valor Total (R$)</label><div className="relative"><DollarSign size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" /><input type="text" placeholder="0,00" className="w-full h-16 sm:h-20 pl-16 pr-8 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-[1.5rem] sm:rounded-[2rem] font-black text-2xl sm:text-3xl text-emerald-600 dark:text-emerald-400 outline-none focus:ring-4 focus:ring-emerald-50 dark:focus:ring-emerald-900/30 transition-all placeholder:text-emerald-200 dark:placeholder:text-emerald-950" value={localTotalValue} onChange={e => setLocalTotalValue(e.target.value.replace(/[^0-9,]/g, ''))} /></div></div></div>
              </div>
              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 shrink-0"><button type="submit" disabled={!form.clientId || (form.items?.length || 0) === 0} className={`w-full h-16 sm:h-20 rounded-[1.5rem] sm:rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] transition-all active:scale-95 flex items-center justify-center gap-4 ${!form.clientId || (form.items?.length || 0) === 0 ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-700' : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-400 shadow-2xl dark:shadow-none'}`}><PackageCheck size={24} className="sm:size-8" /> {form.id ? 'ATUALIZAR' : 'CONFIRMAR'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveriesView;
