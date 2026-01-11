
import React, { useMemo, useState } from 'react';
import { 
  Check, CheckCircle2, DollarSign, MapPin, Minus, PackageCheck, Plus, Search, 
  ShoppingBag, Trash2, Truck, X, ArrowRight, Pencil, Printer, Hash, 
  AlertTriangle, HandCoins, XCircle, UserCircle, BarChart3, PieChart, 
  FileText, FileEdit, Clock, ChevronRight
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
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`; 
  };
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<DeliveryStatus | 'TODOS'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<Partial<Delivery>>({ status: DeliveryStatus.PENDENTE, scheduledDate: getTodayString(), scheduledTime: getNowTimeString(), items: [], totalValue: 0, notes: '' });
  const [selectedProductId, setSelectedProductId] = useState('');
  const [localTotalValue, setLocalTotalValue] = useState('');
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
      // Fixed: client?.name.toLowerCase() could throw error if client is undefined
      const matchesSearch = !searchTerm || (client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || d.sequenceNumber?.toString().includes(searchTerm);
      return matchesStatus && matchesDate && matchesSearch;
    }).sort((a,b) => (a.scheduledDate + (a.scheduledTime || '')).localeCompare(b.scheduledDate + (b.scheduledTime || '')));
  }, [deliveries, activeFilter, startDate, endDate, searchTerm, clients]);

  const handleCloseModal = () => { 
    setIsOpen(false); 
    setForm({ status: DeliveryStatus.PENDENTE, scheduledDate: getTodayString(), scheduledTime: getNowTimeString(), items: [], totalValue: 0 }); 
    setClientSearch(''); 
    setLocalTotalValue(''); 
  };

  const handleEdit = (d: Delivery) => { 
    setForm(d); 
    setClientSearch(getClient(d.clientId)?.name || ''); 
    setLocalTotalValue(d.totalValue?.toString() || ''); 
    setIsOpen(true); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !form.clientId) return;
    setIsSubmitting(true);
    await onUpdate({ ...form, id: form.id || crypto.randomUUID(), totalValue: parseFloat(localTotalValue.replace(',','.')) || 0 } as Delivery);
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
          <button onClick={() => setIsOpen(true)} className="flex-1 sm:flex-none px-10 h-14 bg-sky-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-sky-600 active:scale-95 transition-all flex items-center justify-center gap-2">
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

      {/* Tabs de Filtro de Status */}
      <div className="flex flex-wrap gap-2 py-2">
        {['TODOS', DeliveryStatus.PENDENTE, DeliveryStatus.EM_ROTA, DeliveryStatus.ENTREGUE, DeliveryStatus.ENTREGUE_PENDENTE_PGTO, DeliveryStatus.CANCELADO].map((status) => (
          <button 
            key={status} 
            onClick={() => setActiveFilter(status as any)}
            className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeFilter === status ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400' : 'bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-600 hover:text-slate-500'}`}
          >
            {status === DeliveryStatus.ENTREGUE_PENDENTE_PGTO ? 'NÃO PAGO' : status}
          </button>
        ))}
      </div>

      {/* Grid de Entregas Estilo Imagem */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(d => {
          const client = getClient(d.clientId);
          const driver = getDriver(d.driverId);
          const color = getStatusColor(d.status);
          const isUnpaid = d.status === DeliveryStatus.ENTREGUE_PENDENTE_PGTO;
          
          return (
            <div key={d.id} className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-md ${isUnpaid ? 'border-rose-100' : 'border-slate-100 dark:border-slate-800'}`}>
              <div className="p-8 space-y-5">
                {/* Header do Card */}
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

                {/* Informações do Cliente */}
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

                {/* Lista de Produtos (Box Cinza) */}
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

                {/* Observação (Box Azul) */}
                {d.notes && (
                  <div className="bg-sky-50 dark:bg-sky-950/30 rounded-2xl p-5 border border-sky-100 dark:border-sky-900/30">
                    <p className="text-[8px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                      <FileText size={12} /> Observação:
                    </p>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase italic">"{d.notes}"</p>
                  </div>
                )}
              </div>

              {/* Rodapé do Card */}
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

      {/* Modal de Agendamento */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/90 dark:bg-black/95 backdrop-blur-md" onClick={handleCloseModal} />
           <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] p-10 shadow-2xl relative border dark:border-slate-800 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={handleCloseModal} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500"><X size={28} /></button>
              <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Agendamento de <span className="text-sky-500">Entrega</span></h3>
                       <div className="space-y-1.5 relative">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cliente</label>
                          <input 
                            placeholder="PESQUISAR CLIENTE..." 
                            className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xs uppercase outline-none dark:text-white" 
                            value={clientSearch} 
                            onChange={e => {setClientSearch(e.target.value); setIsClientDropdownOpen(true);}} 
                          />
                          {isClientDropdownOpen && (
                             <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-h-[250px] overflow-y-auto">
                                {clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).slice(0,6).map(c => (
                                  <button key={c.id} type="button" onClick={() => {setForm({...form, clientId: c.id}); setClientSearch(c.name); setIsClientDropdownOpen(false);}} className="w-full p-4 text-left border-b last:border-0 hover:bg-sky-50 dark:hover:bg-slate-800 uppercase text-[10px] font-black dark:text-white">{c.name}</button>
                                ))}
                             </div>
                          )}
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Motorista</label>
                            <select className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 uppercase text-[10px] font-black dark:text-white outline-none" value={form.driverId} onChange={e => setForm({...form, driverId: e.target.value})} required>
                              <option value="">MOTORISTA</option>
                              {activeDrivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Veículo</label>
                            <select className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 uppercase text-[10px] font-black dark:text-white outline-none" value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})} required>
                              <option value="">VEÍCULO</option>
                              {vehicles.map(v => <option key={v.id} value={v.id}>{v.placa}</option>)}
                            </select>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Data</label>
                            <input type="date" value={form.scheduledDate} onChange={e => setForm({...form, scheduledDate: e.target.value})} className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 font-bold text-xs dark:text-white outline-none" required />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Horário</label>
                            <input type="time" value={form.scheduledTime} onChange={e => setForm({...form, scheduledTime: e.target.value})} className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 font-bold text-xs dark:text-white outline-none" />
                          </div>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Observação</label>
                          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value.toUpperCase()})} placeholder="EX: CLIENTE JÁ PAGOU..." className="w-full h-24 p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-xs dark:text-white outline-none resize-none" />
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="bg-slate-50 dark:bg-slate-950/50 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between mb-6">
                             <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Itens da Entrega</p>
                             <ShoppingBag size={18} className="text-slate-300" />
                          </div>
                          <div className="flex gap-2">
                             <select className="flex-1 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 uppercase text-[10px] font-black outline-none dark:text-white" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                                <option value="">PRODUTO...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                             </select>
                             <button type="button" onClick={() => {if(!selectedProductId) return; const newItems = [...(form.items || [])]; newItems.push({productId: selectedProductId, quantity: 1}); setForm({...form, items: newItems}); setSelectedProductId('');}} className="h-12 w-12 bg-sky-500 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all"><Plus size={20}/></button>
                          </div>
                          <div className="mt-6 space-y-2 max-h-[200px] overflow-y-auto pr-1 no-scrollbar">
                             {(form.items || []).map((it, idx) => (
                               <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase group">
                                  <span>{getProductName(it.productId)}</span>
                                  <div className="flex items-center gap-4">
                                     <div className="flex items-center gap-2">
                                       <button type="button" onClick={() => {const ni = [...(form.items || [])]; ni[idx].quantity = Math.max(1, ni[idx].quantity - 1); setForm({...form, items: ni});}} className="p-1 text-slate-300 hover:text-sky-500"><Minus size={14}/></button>
                                       <span className="w-8 text-center">{it.quantity}</span>
                                       <button type="button" onClick={() => {const ni = [...(form.items || [])]; ni[idx].quantity += 1; setForm({...form, items: ni});}} className="p-1 text-slate-300 hover:text-sky-500"><Plus size={14}/></button>
                                     </div>
                                     <button type="button" onClick={() => setForm({...form, items: (form.items || []).filter((_,i)=>i!==idx)})} className="text-rose-200 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                                  </div>
                               </div>
                             ))}
                             {(!form.items || form.items.length === 0) && (
                               <div className="py-8 text-center text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest border border-dashed rounded-2xl">Cesta Vazia</div>
                             )}
                          </div>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Valor Total do Pedido R$</label>
                          <div className="relative">
                             <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-lg">R$</span>
                             <input placeholder="0,00" className="w-full h-16 bg-emerald-50/20 dark:bg-slate-950 border border-emerald-100 dark:border-emerald-800/30 rounded-[1.8rem] px-14 text-2xl font-black text-emerald-600 dark:text-emerald-400 outline-none" value={localTotalValue} onChange={e => setLocalTotalValue(e.target.value)} required />
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button type="button" onClick={handleCloseModal} className="h-16 px-8 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[1.5rem] font-black uppercase text-xs tracking-widest">Descartar</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
                       {isSubmitting ? <Clock size={20} className="animate-spin" /> : <PackageCheck size={20} />}
                       {form.id ? 'Salvar Alterações' : 'Confirmar Agendamento'}
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
