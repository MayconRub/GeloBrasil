
import { 
  Check, CheckCircle2, DollarSign, MapPin, Minus, PackageCheck, Plus, Search, ShoppingBag, Trash2, Truck, X, ArrowRight, Pencil, Printer, Hash, AlertTriangle, HandCoins, XCircle, UserCircle, BarChart3, PieChart, FileText, FileEdit
} from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
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
  const getNowTimeString = () => { const now = new Date(); return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`; };
  
  const [isOpen, setIsOpen] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<DeliveryStatus | 'TODOS'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [deliveryToConfirm, setDeliveryToConfirm] = useState<Delivery | null>(null);

  const [form, setForm] = useState<Partial<Delivery>>({ status: DeliveryStatus.PENDENTE, scheduledDate: getTodayString(), scheduledTime: getNowTimeString(), items: [], totalValue: 0, notes: '' });
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
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
      const matchesSearch = !searchTerm || client?.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.sequenceNumber?.toString().includes(searchTerm);
      return matchesStatus && matchesDate && matchesSearch;
    }).sort((a,b) => (a.scheduledDate + a.scheduledTime!).localeCompare(b.scheduledDate + b.scheduledTime!));
  }, [deliveries, activeFilter, startDate, endDate, searchTerm, clients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !form.clientId || !form.driverId || !form.vehicleId) return;
    setIsSubmitting(true);
    try {
      await onUpdate({ ...form, id: form.id || crypto.randomUUID(), totalValue: parseFloat(localTotalValue.replace(',','.')) || 0 } as Delivery);
      handleCloseModal();
    } catch (error) { alert("ERRO AO SALVAR."); } finally { setIsSubmitting(false); }
  };

  const handleCloseModal = () => { setIsOpen(false); setForm({ status: DeliveryStatus.PENDENTE, scheduledDate: getTodayString(), scheduledTime: getNowTimeString(), items: [], totalValue: 0 }); setClientSearch(''); setLocalTotalValue(''); };
  const handleEdit = (d: Delivery) => { setForm(d); setClientSearch(getClient(d.clientId)?.name || ''); setLocalTotalValue(d.totalValue?.toString() || ''); setIsOpen(true); };
  const openStatusConfirmation = (d: Delivery) => { setDeliveryToConfirm(d); setShowPaymentConfirm(true); };

  return (
    <div className="p-4 sm:p-8 space-y-4 pb-24 max-w-[1600px] mx-auto transition-colors uppercase">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto"><div className="w-12 h-12 bg-slate-900 dark:bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-lg"><Truck size={24} /></div><div><h2 className="text-2xl font-black text-slate-800 dark:text-white leading-none">LOGÍSTICA</h2><p className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest">Controle de Entregas</p></div></div>
        <button onClick={() => setIsOpen(true)} className="w-full sm:w-auto px-10 h-14 bg-sky-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl active:scale-95 transition-all">NOVO AGENDAMENTO</button>
      </header>

      <div className="flex flex-col md:flex-row gap-3 bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 flex-1"><div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-11 border"><span className="text-[8px] font-black text-slate-400 mr-2 uppercase">DE</span><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-[10px] font-bold dark:text-white w-full" /></div><ArrowRight size={14} className="text-slate-300" /><div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-11 border"><span className="text-[8px] font-black text-slate-400 mr-2 uppercase">ATÉ</span><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent text-[10px] font-bold dark:text-white w-full" /></div></div>
        <div className="relative flex-1 md:w-64"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" /><input type="text" placeholder="PESQUISAR CLIENTE..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-11 pl-9 pr-8 bg-slate-50 dark:bg-slate-950 border rounded-xl text-[10px] font-black outline-none dark:text-white" /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(d => (
          <div key={d.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm group">
            <div className="flex justify-between items-start mb-6">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${d.status === DeliveryStatus.ENTREGUE ? 'bg-emerald-500' : 'bg-slate-900 dark:bg-slate-800'} text-white shadow-lg`}>
                  <Truck size={20} />
               </div>
               <div className="flex gap-2">
                  <button onClick={() => handleEdit(d)} className="p-2 text-slate-300 hover:text-sky-500"><Pencil size={18} /></button>
                  <button onClick={() => openStatusConfirmation(d)} className="p-2 text-emerald-500"><CheckCircle2 size={18} /></button>
               </div>
            </div>
            <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase truncate mb-1">{getClient(d.clientId)?.name}</h4>
            <p className="text-[8px] font-black text-slate-400 mb-6 flex items-center gap-1.5"><UserCircle size={10} className="text-sky-500" /> {getDriver(d.driverId)?.name}</p>
            <div className="flex justify-between items-end pt-4 border-t border-slate-50 dark:border-slate-800">
               <div><p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Valor do Pedido</p><p className="text-sm font-black dark:text-white">R$ {(d.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
               <span className="text-[8px] font-black uppercase bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">{d.status}</span>
            </div>
          </div>
        ))}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/90 dark:bg-black/95 backdrop-blur-md" onClick={handleCloseModal} />
           <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] p-10 shadow-2xl relative border dark:border-slate-800 animate-in zoom-in-95">
              <button onClick={handleCloseModal} className="absolute top-8 right-8 text-slate-300"><X size={24} /></button>
              <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">AGENDAMENTO DE <span className="text-sky-500">ENTREGA</span></h3>
                       <div className="relative">
                          <input placeholder="DIGITE O NOME DO CLIENTE..." className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xs uppercase outline-none dark:text-white" value={clientSearch} onChange={e => {setClientSearch(e.target.value); setIsClientDropdownOpen(true);}} />
                          {isClientDropdownOpen && (
                             <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-h-[250px] overflow-y-auto">
                                {clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).slice(0,6).map(c => <button key={c.id} type="button" onClick={() => {setForm({...form, clientId: c.id}); setClientSearch(c.name); setIsClientDropdownOpen(false);}} className="w-full p-4 text-left border-b last:border-0 hover:bg-sky-50 dark:hover:bg-slate-800 uppercase text-[10px] font-black dark:text-white">{c.name}</button>)}
                             </div>
                          )}
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <select className="h-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 uppercase text-[10px] font-black dark:text-white outline-none" value={form.driverId} onChange={e => setForm({...form, driverId: e.target.value})} required><option value="">MOTORISTA</option>{activeDrivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
                          <select className="h-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 uppercase text-[10px] font-black dark:text-white outline-none" value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})} required><option value="">VEÍCULO</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.placa}</option>)}</select>
                       </div>
                    </div>
                    <div className="space-y-6">
                       <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                          <p className="text-[10px] font-black text-slate-400 mb-4 tracking-widest uppercase">Cesta de Itens do Pedido</p>
                          <div className="flex gap-2">
                             <select className="flex-1 h-12 bg-white dark:bg-slate-900 border rounded-xl px-4 uppercase text-[10px] font-black outline-none dark:text-white" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                                <option value="">ESCOLHER PRODUTO...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                             </select>
                             <button type="button" onClick={() => {if(!selectedProductId) return; const newItems = [...(form.items || [])]; newItems.push({productId: selectedProductId, quantity: 1}); setForm({...form, items: newItems}); setSelectedProductId('');}} className="h-12 w-12 bg-sky-500 text-white rounded-xl flex items-center justify-center shadow-lg"><Plus/></button>
                          </div>
                          <div className="mt-4 space-y-2">
                             {(form.items || []).map((it, idx) => (
                               <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border text-[9px] font-black uppercase">
                                  <span>{getProductName(it.productId)}</span>
                                  <button type="button" onClick={() => setForm({...form, items: (form.items || []).filter((_,i)=>i!==idx)})} className="text-rose-400"><Trash2 size={12}/></button>
                               </div>
                             ))}
                          </div>
                       </div>
                       <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Total a Receber R$</label><input placeholder="0,00" className="w-full h-16 bg-emerald-50/20 dark:bg-slate-950 border border-emerald-100 dark:border-emerald-800/30 rounded-[1.5rem] px-6 text-2xl font-black text-emerald-600 dark:text-emerald-400 outline-none" value={localTotalValue} onChange={e => setLocalTotalValue(e.target.value)} required /></div>
                    </div>
                 </div>
                 <button type="submit" className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">FINALIZAR AGENDAMENTO</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default DeliveriesView;
