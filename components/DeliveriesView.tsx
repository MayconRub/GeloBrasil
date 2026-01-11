
import React, { useMemo, useState } from 'react';
import { 
  Check, CheckCircle2, DollarSign, MapPin, Minus, PackageCheck, Plus, Search, 
  ShoppingBag, Trash2, Truck, X, ArrowRight, Pencil, Printer, Hash, 
  AlertTriangle, HandCoins, XCircle, UserCircle, BarChart3, PieChart, 
  FileText, FileEdit, Clock, ChevronRight, Package, Calendar, CalendarDays, ShoppingBasket,
  UserPlus
} from 'lucide-react';
import { Client, Delivery, DeliveryStatus, Employee, Vehicle, AppSettings, Product } from '../types';

interface Props {
  deliveries: Delivery[];
  clients: Client[];
  drivers: Employee[];
  vehicles: Vehicle[];
  onUpdate: (delivery: Delivery) => void;
  onDelete: (id: string) => void;
  onAddClient: (client: Client) => Promise<any>;
  settings: AppSettings;
  products: Product[];
}

const DeliveriesView: React.FC<Props> = ({ deliveries, clients, drivers, vehicles, onUpdate, onDelete, onAddClient, settings, products }) => {
  const getTodayString = () => new Date().toISOString().split('T')[0];
  const getNowTimeString = () => { 
    const now = new Date(); 
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`; 
  };
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<DeliveryStatus | 'TODOS'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<Partial<Delivery>>({ status: DeliveryStatus.PENDENTE, scheduledDate: getTodayString(), scheduledTime: getNowTimeString(), items: [], totalValue: 0, notes: '' });
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [localTotalValue, setLocalTotalValue] = useState('0,00');
  const [clientSearch, setClientSearch] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  const getClient = (id: string) => clients.find(c => c.id === id);
  const getDriver = (id: string) => drivers.find(d => d.id === id);
  const getProductName = (id: string) => products.find(p => p.id === id)?.nome || 'PRODUTO';
  const activeDrivers = useMemo(() => drivers.filter(d => d.status === 'ATIVO'), [drivers]);

  const filtered = useMemo(() => {
    return deliveries.filter(d => {
      const client = getClient(d.clientId);
      const matchesStatus = activeFilter === 'TODOS' || d.status === activeFilter;
      const matchesDate = d.scheduledDate >= startDate && d.scheduledDate <= endDate;
      const matchesSearch = !searchTerm || (client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || d.sequenceNumber?.toString().includes(searchTerm);
      return matchesStatus && matchesDate && matchesSearch;
    }).sort((a,b) => (a.scheduledDate + (a.scheduledTime || '')).localeCompare(b.scheduledDate + (b.scheduledTime || '')));
  }, [deliveries, activeFilter, startDate, endDate, searchTerm, clients]);

  const handleCloseModal = () => { 
    setIsOpen(false); 
    setForm({ status: DeliveryStatus.PENDENTE, scheduledDate: getTodayString(), scheduledTime: getNowTimeString(), items: [], totalValue: 0, notes: '' }); 
    setClientSearch(''); 
    setLocalTotalValue('0,00'); 
    setItemQty(1);
  };

  const handleEdit = (d: Delivery) => { 
    setForm(d); 
    setClientSearch(getClient(d.clientId)?.name || ''); 
    setLocalTotalValue((d.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })); 
    setIsOpen(true); 
  };

  const addItemToLoad = () => {
    if (!selectedProductId) return;
    const currentItems = [...(form.items || [])];
    currentItems.push({ productId: selectedProductId, quantity: itemQty });
    setForm({ ...form, items: currentItems });
    setSelectedProductId('');
    setItemQty(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !form.clientId) return;
    setIsSubmitting(true);
    const numericValue = parseFloat(localTotalValue.replace('.', '').replace(',', '.')) || 0;
    await onUpdate({ ...form, id: form.id || crypto.randomUUID(), totalValue: numericValue } as Delivery);
    handleCloseModal();
    setIsSubmitting(false);
  };

  const getStatusColor = (status: DeliveryStatus) => {
    switch(status) {
      case DeliveryStatus.ENTREGUE: return 'emerald';
      case DeliveryStatus.ENTREGUE_PENDENTE_PGTO: return 'rose';
      case DeliveryStatus.CANCELADO: return 'slate';
      case DeliveryStatus.EM_ROTA: return 'sky';
      default: return 'amber';
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-[1600px] mx-auto transition-colors uppercase bg-[#f8fafc] dark:bg-slate-950 min-h-screen pb-32">
      {/* Header Estilo Imagem */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <Truck size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">ENTREGAS</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">{settings.companyName} • LOGÍSTICA</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-8 h-14 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-[10px] uppercase shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <BarChart3 size={18} className="text-slate-400" /> Fechamento
          </button>
          <button onClick={() => setIsOpen(true)} className="flex-1 sm:flex-none px-10 h-14 bg-sky-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-sky-600 active:scale-95 transition-all flex items-center justify-center gap-3">
            <Plus size={20} /> Novo Agendamento
          </button>
        </div>
      </header>

      {/* Barra de Filtros e Busca Estilo Imagem */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-2xl px-5 h-14 border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-black text-slate-400 mr-3">DE</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-[11px] font-bold dark:text-white outline-none w-full" />
            <ChevronRight size={16} className="text-slate-200 mx-2" />
            <span className="text-[9px] font-black text-slate-400 mr-3">ATÉ</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent text-[11px] font-bold dark:text-white outline-none w-full" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => {setStartDate(getTodayString()); setEndDate(getTodayString());}} className="h-14 px-5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[9px] font-black uppercase text-slate-400 hover:text-sky-500 transition-colors">Hoje</button>
            <button className="h-14 px-5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[9px] font-black uppercase text-slate-400 hover:text-sky-500 transition-colors">Mês</button>
          </div>
        </div>
        <div className="relative flex-1 lg:max-w-md">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            placeholder="BUSCAR PEDIDO OU CLIENTE..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full h-14 pl-14 pr-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-full text-[10px] font-black outline-none dark:text-white focus:ring-2 focus:ring-sky-500/10"
          />
        </div>
      </div>

      {/* Grid de Entregas e Tabs de Status permanecem como no layout base... */}
      <div className="flex flex-wrap gap-2 py-2">
        {['TODOS', DeliveryStatus.PENDENTE, DeliveryStatus.EM_ROTA, DeliveryStatus.ENTREGUE, DeliveryStatus.ENTREGUE_PENDENTE_PGTO, DeliveryStatus.CANCELADO].map((status) => (
          <button key={status} onClick={() => setActiveFilter(status as any)} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeFilter === status ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400' : 'bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-600 hover:text-slate-500'}`}>
            {status === DeliveryStatus.ENTREGUE_PENDENTE_PGTO ? 'NÃO PAGO' : status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(d => {
          const client = getClient(d.clientId);
          const driver = getDriver(d.driverId);
          const isUnpaid = d.status === DeliveryStatus.ENTREGUE_PENDENTE_PGTO;
          return (
            <div key={d.id} className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-md ${isUnpaid ? 'border-rose-100' : 'border-slate-100 dark:border-slate-800'}`}>
              <div className="p-8 space-y-5">
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isUnpaid ? 'bg-rose-500' : (d.status === DeliveryStatus.ENTREGUE ? 'bg-emerald-500' : 'bg-sky-500')} text-white shadow-lg`}>
                    <Truck size={22} />
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                       <span className={`px-3 py-1 rounded-md text-[8px] font-black uppercase ${isUnpaid ? 'bg-rose-50 text-rose-500' : (d.status === DeliveryStatus.ENTREGUE ? 'bg-emerald-50 text-emerald-500' : 'bg-sky-50 text-sky-500')}`}>
                         {d.status === DeliveryStatus.ENTREGUE_PENDENTE_PGTO ? 'NÃO PAGO' : d.status}
                       </span>
                       <span className="text-[9px] font-black text-sky-500">{d.scheduledTime}</span>
                       <span className="text-[9px] font-black text-slate-300"># {d.sequenceNumber || '---'}</span>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button className="text-slate-300 hover:text-slate-500"><Printer size={18} /></button>
                      <button onClick={() => handleEdit(d)} className="text-slate-300 hover:text-sky-500"><Pencil size={18} /></button>
                      <button onClick={() => onDelete(d.id)} className="text-slate-300 hover:text-rose-500"><X size={18} /></button>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight uppercase">{client?.name || 'CONSUMIDOR FINAL'}</h4>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={12} className="text-slate-300" />
                    <p className="text-[10px] font-bold uppercase">{client?.street}, {client?.number}</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <UserCircle size={12} className="text-slate-300" />
                    <p className="text-[10px] font-bold uppercase">ENTREGADOR: {driver?.name || 'NÃO DEFINIDO'}</p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-6 space-y-2 border border-slate-50 dark:border-slate-800">
                  {d.items && d.items.length > 0 ? d.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] font-black text-slate-800 dark:text-slate-300 uppercase">
                      <span>{getProductName(item.productId)}</span>
                      <span className="text-slate-900 dark:text-white">{item.quantity} UN</span>
                    </div>
                  )) : (
                    <div className="text-[10px] font-black text-slate-300 text-center uppercase py-2">PRODUTO NÃO ESPECIFICADO</div>
                  )}
                </div>
                {d.notes && (
                  <div className="bg-sky-50 dark:bg-sky-950/30 rounded-2xl p-5 border border-sky-100 dark:border-sky-900/30">
                    <p className="text-[8px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                      <FileText size={12} /> Observação:
                    </p>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase italic">"{d.notes}"</p>
                  </div>
                )}
              </div>
              <div className="mt-auto px-8 py-6 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400">{new Date(d.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                <span className={`text-base font-black ${isUnpaid ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                  R$ {(d.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Agendamento Estilo IMAGEM SOLICITADA */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#1e293b]/90 backdrop-blur-sm" onClick={handleCloseModal} />
           <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[3.5rem] shadow-2xl relative border-none overflow-hidden animate-in zoom-in-95 duration-300">
              
              {/* Header do Modal */}
              <div className="p-10 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-sky-50 dark:bg-sky-900/30 text-sky-500 rounded-2xl flex items-center justify-center shadow-sm">
                       <Package size={28} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">
                       AGENDAR <span className="text-sky-500">ENTREGA</span>
                    </h3>
                 </div>
                 <button onClick={handleCloseModal} className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-300 hover:text-rose-500 transition-all">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="px-10 pb-6 flex flex-col md:flex-row gap-12">
                 
                 {/* Coluna Esquerda: Dados do Cliente e Entrega */}
                 <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <Search size={14} className="text-sky-500" /> LOCALIZAR CLIENTE
                          </label>
                          <button type="button" className="px-4 py-1.5 border border-emerald-100 rounded-full text-[8px] font-black text-emerald-500 uppercase hover:bg-emerald-50 transition-colors">
                             NOVO CLIENTE?
                          </button>
                       </div>
                       <div className="relative">
                          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input 
                            placeholder="BUSQUE POR NOME OU ENDEREÇO..." 
                            className="w-full h-16 pl-16 pr-6 bg-slate-50 dark:bg-slate-950 border-none rounded-[1.8rem] font-black text-xs uppercase outline-none dark:text-white" 
                            value={clientSearch} 
                            onChange={e => {setClientSearch(e.target.value); setIsClientDropdownOpen(true);}} 
                          />
                          {isClientDropdownOpen && (
                             <div className="absolute top-full left-0 right-0 z-[210] mt-2 bg-white dark:bg-slate-900 border rounded-2xl shadow-2xl max-h-[200px] overflow-y-auto">
                                {clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).map(c => (
                                  <button key={c.id} type="button" onClick={() => {setForm({...form, clientId: c.id}); setClientSearch(c.name); setIsClientDropdownOpen(false);}} className="w-full p-4 text-left border-b hover:bg-sky-50 dark:hover:bg-slate-800 uppercase text-[10px] font-black dark:text-white">
                                    {c.name}
                                  </button>
                                ))}
                             </div>
                          )}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-2">MOTORISTA</label>
                          <select className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl font-black text-[10px] dark:text-white outline-none appearance-none" value={form.driverId} onChange={e => setForm({...form, driverId: e.target.value})} required>
                             <option value="">-- MOTORISTA --</option>
                             {activeDrivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-2">VEÍCULO</label>
                          <select className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl font-black text-[10px] dark:text-white outline-none appearance-none" value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})} required>
                             <option value="">-- VEÍCULO --</option>
                             {vehicles.map(v => <option key={v.id} value={v.id}>{v.placa}</option>)}
                          </select>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-2">DATA</label>
                          <div className="relative">
                             <input type="date" value={form.scheduledDate} onChange={e => setForm({...form, scheduledDate: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl font-black text-xs dark:text-white outline-none" required />
                             <CalendarDays className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-2">HORA</label>
                          <div className="relative">
                             <input type="time" value={form.scheduledTime} onChange={e => setForm({...form, scheduledTime: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl font-black text-xs dark:text-white outline-none" />
                             <Clock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase ml-2">OBSERVAÇÕES DA ENTREGA</label>
                       <textarea 
                          value={form.notes} 
                          onChange={e => setForm({...form, notes: e.target.value})} 
                          placeholder="EX: DEIXAR NA PORTARIA, CLIENTE PAGOU ANTECIPADO, ETC..." 
                          className="w-full h-32 p-6 bg-slate-50 dark:bg-slate-950 border-none rounded-[1.8rem] font-bold text-[10px] dark:text-white outline-none resize-none" 
                       />
                    </div>
                 </div>

                 {/* Linha Divisora */}
                 <div className="hidden md:block w-px bg-slate-100 dark:bg-slate-800" />

                 {/* Coluna Direita: Itens e Total */}
                 <div className="flex-1 flex flex-col">
                    <div className="bg-slate-50/50 dark:bg-slate-950/50 p-8 rounded-[2.5rem] border border-slate-50 dark:border-slate-800 space-y-6 flex-1">
                       <div className="flex items-center gap-3">
                          <ShoppingBag size={20} className="text-sky-500" />
                          <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">ITENS DA CARGA</h4>
                       </div>

                       <div className="space-y-4">
                          <div className="space-y-1.5">
                             <label className="text-[8px] font-black text-slate-400 uppercase ml-1">PRODUTO</label>
                             <select className="w-full h-12 px-5 bg-white dark:bg-slate-900 border rounded-xl font-black text-[10px] dark:text-white outline-none appearance-none" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                                <option value="">ESCOLHER...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                             </select>
                          </div>

                          <div className="space-y-1.5">
                             <label className="text-[8px] font-black text-slate-400 uppercase ml-1 text-center block">QUANTIDADE</label>
                             <div className="flex items-center justify-between gap-3">
                                <button type="button" onClick={() => setItemQty(Math.max(1, itemQty - 1))} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border rounded-xl text-slate-300 hover:text-sky-500"><Minus size={18} /></button>
                                <input type="number" value={itemQty} onChange={e => setItemQty(parseInt(e.target.value) || 1)} className="flex-1 h-12 text-center bg-white dark:bg-slate-900 border rounded-xl font-black text-base dark:text-white outline-none" />
                                <button type="button" onClick={() => setItemQty(itemQty + 1)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border rounded-xl text-slate-300 hover:text-sky-500"><Plus size={18} /></button>
                             </div>
                          </div>

                          <button 
                            type="button" 
                            onClick={addItemToLoad}
                            className="w-full h-14 bg-sky-200/50 hover:bg-sky-200 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-black text-[10px] uppercase rounded-xl transition-all"
                          >
                             ADICIONAR ITEM
                          </button>
                       </div>

                       <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6 space-y-2 overflow-y-auto max-h-[120px] no-scrollbar">
                          {form.items?.map((item, i) => (
                             <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500">
                                <span>{item.quantity}x {getProductName(item.productId)}</span>
                                <button type="button" onClick={() => setForm({...form, items: form.items?.filter((_,idx)=>idx!==i)})} className="text-rose-300 hover:text-rose-500"><Trash2 size={14} /></button>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="mt-8 space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <DollarSign size={14} className="text-emerald-500" /> VALOR TOTAL (R$)
                       </label>
                       <div className="h-20 bg-emerald-50/20 dark:bg-slate-950 border border-emerald-100 dark:border-emerald-800/30 rounded-[1.8rem] flex items-center px-8 relative">
                          <span className="text-emerald-500 font-black text-3xl mr-4">$</span>
                          <input 
                            value={localTotalValue} 
                            onChange={e => setLocalTotalValue(e.target.value.replace('.',','))} 
                            className="w-full bg-transparent border-none outline-none text-4xl font-black text-emerald-500 placeholder-emerald-100" 
                            placeholder="0,00" 
                          />
                       </div>
                    </div>
                 </div>
              </form>

              {/* Botão Confirmar Rodapé */}
              <button 
                type="submit" 
                onClick={handleSubmit}
                className="w-[92%] mx-auto mb-8 h-20 bg-[#f1f5f9] dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-slate-900 hover:text-white transition-all active:scale-[0.98]"
              >
                 <PackageCheck size={24} />
                 CONFIRMAR
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default DeliveriesView;
