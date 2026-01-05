
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
  X
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<DeliveryStatus | 'TODOS'>('TODOS');
  const [form, setForm] = useState<Partial<Delivery>>({ 
    status: DeliveryStatus.PENDENTE, 
    scheduledDate: getTodayString(),
    items: [],
    totalValue: 0
  });
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [localTotalValue, setLocalTotalValue] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return deliveries.filter(d => activeFilter === 'TODOS' || d.status === activeFilter);
  }, [deliveries, activeFilter]);

  const searchedClients = useMemo(() => {
    if (!clientSearch) return [];
    const term = clientSearch.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.street.toLowerCase().includes(term) ||
      c.neighborhood.toLowerCase().includes(term)
    ).slice(0, 5);
  }, [clients, clientSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddItem = () => {
    const qty = parseInt(itemQuantity);
    if (!selectedProductId || isNaN(qty) || qty <= 0) return;
    
    const existingIndex = (form.items || []).findIndex(i => i.productId === selectedProductId);
    const newItems = [...(form.items || [])];

    if (existingIndex > -1) {
      newItems[existingIndex].quantity += qty;
    } else {
      newItems.push({ productId: selectedProductId, quantity: qty });
    }

    setForm({ ...form, items: newItems });
    setSelectedProductId('');
    setItemQuantity('1');
  };

  const handleRemoveItem = (productId: string) => {
    setForm({ ...form, items: (form.items || []).filter(i => i.productId !== productId) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.driverId || !form.vehicleId) return;
    
    onUpdate({
      ...form,
      id: form.id || crypto.randomUUID(),
      totalValue: parseFloat(localTotalValue.replace(',', '.')) || 0
    } as Delivery);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setForm({ 
      status: DeliveryStatus.PENDENTE, 
      scheduledDate: getTodayString(),
      items: [],
      totalValue: 0
    });
    setClientSearch('');
    setLocalTotalValue('');
    setIsClientDropdownOpen(false);
  };

  const selectClient = (client: Client) => {
    setForm({ ...form, clientId: client.id });
    setClientSearch(client.name);
    setIsClientDropdownOpen(false);
  };

  const updateStatus = (delivery: Delivery, status: DeliveryStatus) => {
    onUpdate({ 
      ...delivery, 
      status, 
      deliveredAt: status === DeliveryStatus.ENTREGUE ? new Date().toISOString() : undefined 
    });
  };

  const getClient = (id: string) => clients.find(c => c.id === id);
  const getDriver = (id: string) => drivers.find(d => d.id === id);
  const getVehicle = (id: string) => vehicles.find(v => v.id === id);
  const getProduct = (id: string) => products.find(p => p.id === id);

  return (
    <div className="p-4 sm:p-8 space-y-8 pb-24 max-w-[1600px] mx-auto overflow-x-hidden">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">CONTROLE DE <span className="text-sky-500">ENTREGAS</span></h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <PackageCheck size={14} className="text-sky-500" /> Logística e Gestão de Carga
          </p>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
        >
          <Plus size={18} /> Agendar Entrega
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {['TODOS', ...Object.values(DeliveryStatus)].map(status => (
          <button 
            key={status}
            onClick={() => setActiveFilter(status as any)}
            className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeFilter === status ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100'}`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filtered.map(d => {
          const client = getClient(d.clientId);
          const driver = getDriver(d.driverId);
          const vehicle = getVehicle(d.vehicleId);
          
          return (
            <div key={d.id} className={`bg-white p-5 sm:p-6 rounded-[2rem] border flex flex-col h-full ${d.status === DeliveryStatus.ENTREGUE ? 'border-emerald-100 bg-emerald-50/5' : 'border-slate-100'} shadow-sm relative overflow-hidden group transition-all hover:shadow-md`}>
               <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center ${d.status === DeliveryStatus.ENTREGUE ? 'bg-emerald-500 text-white shadow-lg' : d.status === DeliveryStatus.EM_ROTA ? 'bg-sky-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                        <Truck size={20} className="sm:size-24" />
                     </div>
                     <div className="min-w-0">
                        <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded ${d.status === DeliveryStatus.ENTREGUE ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                           {d.status}
                        </span>
                        <p className="text-[9px] font-black text-slate-400 mt-0.5 uppercase">ID: {d.id.slice(0, 8)}</p>
                     </div>
                  </div>
                  <div className="flex gap-1">
                     {d.status !== DeliveryStatus.ENTREGUE && (
                       <button onClick={() => updateStatus(d, DeliveryStatus.ENTREGUE)} className="p-2 text-emerald-500 bg-emerald-50 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle2 size={16} /></button>
                     )}
                     <button onClick={() => onDelete(d.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                  </div>
               </div>

               <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-3">
                     <User size={16} className="text-sky-500 mt-0.5 shrink-0" />
                     <div className="min-w-0">
                        <h4 className="font-black text-slate-800 text-xs sm:text-sm uppercase leading-tight truncate">{client?.name || 'Cliente Removido'}</h4>
                        <div className="flex items-start gap-1.5 text-[9px] font-bold text-slate-400 mt-1.5 uppercase leading-snug">
                           <MapPin size={10} className="shrink-0 mt-0.5" /> 
                           <div className="truncate">
                             <p className="truncate">{client?.street}, {client?.number}</p>
                             <p className="truncate opacity-70">{client?.neighborhood} - {client?.city}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl sm:rounded-2xl border border-slate-100">
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                       <ShoppingBag size={10} /> Carga
                    </p>
                    <div className="space-y-1 max-h-[100px] overflow-y-auto pr-1 custom-scrollbar">
                      {d.items && d.items.length > 0 ? d.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white/60 px-2 py-1.5 rounded-lg border border-slate-200/50">
                          <span className="text-[8px] font-black text-slate-600 uppercase truncate mr-2">{getProduct(item.productId)?.name || 'Produto'}</span>
                          <span className="text-[9px] font-black text-slate-900 bg-white px-2 py-0.5 rounded shadow-sm">{item.quantity}</span>
                        </div>
                      )) : <p className="text-[8px] text-slate-300 font-bold uppercase italic text-center py-2">Vazia</p>}
                    </div>
                    {d.totalValue && d.totalValue > 0 ? (
                       <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center">
                          <span className="text-[8px] font-black text-slate-400 uppercase">Total</span>
                          <span className="text-xs sm:text-sm font-black text-emerald-600">R$ {d.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                       </div>
                    ) : null}
                  </div>
               </div>

               <div className="mt-4 pt-3 border-t border-slate-50">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                     <div className="min-w-0">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Motorista</p>
                        <p className="text-[9px] font-black text-slate-800 uppercase truncate">{driver?.name.split(' ')[0]}</p>
                     </div>
                     <div className="min-w-0">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Placa</p>
                        <p className="text-[9px] font-black text-slate-800 uppercase truncate">{vehicle?.placa}</p>
                     </div>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        <Calendar size={12} /> {new Date(d.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                     </div>
                     {d.status === DeliveryStatus.PENDENTE && (
                        <button onClick={() => updateStatus(d, DeliveryStatus.EM_ROTA)} className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 text-white rounded-lg text-[8px] font-black uppercase shadow-lg shadow-sky-100 active:scale-95 transition-all">
                           Liberar <ChevronRight size={12} />
                        </button>
                     )}
                  </div>
               </div>
            </div>
          );
        })}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4 md:p-6">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300" onClick={handleCloseModal} />
          
          <div className="bg-white w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
            
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 sm:top-8 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all z-[210] shadow-sm active:scale-90"
            >
              <X size={20} sm:size={24} strokeWidth={3} />
            </button>

            <h3 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tighter mb-6 sm:mb-10 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-50 text-sky-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner">
                <PackageCheck size={24} sm:size={28} />
              </div>
              Agendar <span className="text-sky-500">Entrega</span>
            </h3>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-8 sm:space-y-10 pb-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                 <div className="space-y-6 sm:space-y-8">
                    <div className="space-y-2 relative" ref={dropdownRef}>
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-2">
                        <Search size={12} className="text-sky-500" /> Localizar Cliente
                      </label>
                      <div className="relative">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                          type="text"
                          placeholder="BUSQUE POR NOME OU ENDEREÇO..."
                          className="w-full h-14 sm:h-16 pl-14 pr-14 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[11px] uppercase outline-none focus:ring-4 focus:ring-sky-50 focus:bg-white transition-all shadow-inner"
                          value={clientSearch}
                          onChange={(e) => {
                            setClientSearch(e.target.value);
                            setIsClientDropdownOpen(true);
                            if (form.clientId) setForm({ ...form, clientId: undefined });
                          }}
                          onFocus={() => setIsClientDropdownOpen(true)}
                        />
                        {form.clientId && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                            <Check size={18} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      {isClientDropdownOpen && searchedClients.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-[220] overflow-hidden animate-in fade-in slide-in-from-top-2">
                          {searchedClients.map(c => (
                            <button key={c.id} type="button" onClick={() => selectClient(c)} className="w-full p-4 hover:bg-sky-50 text-left border-b border-slate-50 last:border-0 transition-all flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-500 flex items-center justify-center shrink-0"><MapPin size={16} /></div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-black text-slate-800 uppercase leading-none mb-1">{c.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase truncate">{c.street}, {c.number}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Motorista</label>
                            <select className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[10px] uppercase outline-none px-4" value={form.driverId || ''} onChange={e => setForm({...form, driverId: e.target.value})} required>
                              <option value="">-- MOTORISTA --</option>
                              {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Veículo</label>
                            <select className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[10px] uppercase outline-none px-4" value={form.vehicleId || ''} onChange={e => setForm({...form, vehicleId: e.target.value})} required>
                              <option value="">-- VEÍCULO --</option>
                              {vehicles.map(v => <option key={v.id} value={v.id}>{v.placa}</option>)}
                            </select>
                          </div>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Data Programada</label>
                          <input type="date" className="w-full h-14 sm:h-16 px-6 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-sky-50 transition-all" value={form.scheduledDate || ''} onChange={e => setForm({...form, scheduledDate: e.target.value})} required />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="bg-slate-50 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-inner relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 text-sky-500 opacity-5 pointer-events-none">
                          <ShoppingBag size={120} />
                       </div>
                       
                       <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                          <ShoppingBag size={18} className="text-sky-500" /> Itens da Carga
                       </h4>
                       
                       <div className="space-y-4 relative z-10">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Produto</label>
                            <select 
                              className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl font-black text-[10px] uppercase outline-none" 
                              value={selectedProductId} 
                              onChange={e => setSelectedProductId(e.target.value)}
                            >
                               <option value="">ESCOLHER...</option>
                               {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                             <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Quantidade</label>
                             <div className="flex items-center gap-3">
                                <button 
                                  type="button" 
                                  onClick={() => setItemQuantity(q => Math.max(1, parseInt(q) - 1).toString())} 
                                  className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all active:scale-90 shadow-sm"
                                >
                                  <Minus size={20} strokeWidth={3} />
                                </button>
                                <input 
                                  type="number" 
                                  className="flex-1 h-12 bg-white border border-slate-200 rounded-xl text-center font-black text-lg outline-none focus:ring-4 focus:ring-sky-100 transition-all" 
                                  value={itemQuantity} 
                                  onChange={e => setItemQuantity(e.target.value)} 
                                  min="1"
                                />
                                <button 
                                  type="button" 
                                  onClick={() => setItemQuantity(q => (parseInt(q || '0') + 1).toString())} 
                                  className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all active:scale-90 shadow-sm"
                                >
                                  <Plus size={20} strokeWidth={3} />
                                </button>
                             </div>
                          </div>

                          <button 
                            type="button" 
                            onClick={handleAddItem} 
                            disabled={!selectedProductId}
                            className="w-full h-12 bg-sky-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
                          >
                            <Plus size={16} strokeWidth={3} /> Adicionar
                          </button>
                       </div>

                       <div className="mt-8 space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar border-t border-slate-200/50 pt-6 relative z-10">
                          {form.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                               <div className="min-w-0 flex-1">
                                  <p className="text-[10px] font-black text-slate-800 uppercase leading-none truncate mb-1">{getProduct(item.productId)?.name}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase">{item.quantity} un</p>
                               </div>
                               <button type="button" onClick={() => handleRemoveItem(item.productId)} className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-300 hover:text-rose-500 rounded-lg transition-all"><Trash2 size={14}/></button>
                            </div>
                          ))}
                          {(!form.items || form.items.length === 0) && (
                             <p className="text-center py-6 text-[9px] font-bold text-slate-300 uppercase tracking-widest">Carga Vazia</p>
                          )}
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2">
                         <DollarSign size={12} className="text-emerald-500" /> Valor Total (R$)
                       </label>
                       <div className="relative">
                          <DollarSign size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" />
                          <input 
                            type="text" 
                            placeholder="0,00" 
                            className="w-full h-16 sm:h-20 pl-16 pr-8 bg-emerald-50/20 border border-emerald-100 rounded-[1.5rem] sm:rounded-[2rem] font-black text-2xl sm:text-3xl text-emerald-600 outline-none focus:ring-4 focus:ring-emerald-50 transition-all shadow-inner" 
                            value={localTotalValue}
                            onChange={e => setLocalTotalValue(e.target.value.replace(/[^0-9,]/g, ''))}
                          />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-8 border-t border-slate-100 shrink-0">
                <button 
                  type="submit"
                  disabled={!form.clientId || (form.items?.length || 0) === 0}
                  className={`w-full h-16 sm:h-20 rounded-[1.5rem] sm:rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] sm:tracking-[0.4em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${!form.clientId || (form.items?.length || 0) === 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-emerald-100'}`}
                >
                  <PackageCheck size={24} sm:size={32} /> CONFIRMAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveriesView;
