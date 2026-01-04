
import React, { useState, useMemo } from 'react';
import { 
  PackageCheck, Truck, Clock, User, CheckCircle2, 
  Plus, X, Trash2, Pencil, MapPin, ChevronRight,
  Filter, Calendar
} from 'lucide-react';
import { Delivery, DeliveryStatus, Client, Employee, Vehicle } from '../types';

interface Props {
  deliveries: Delivery[];
  clients: Client[];
  drivers: Employee[];
  vehicles: Vehicle[];
  onUpdate: (delivery: Delivery) => void;
  onDelete: (id: string) => void;
}

const DeliveriesView: React.FC<Props> = ({ deliveries, clients, drivers, vehicles, onUpdate, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<DeliveryStatus | 'TODOS'>('TODOS');
  const [form, setForm] = useState<Partial<Delivery>>({ status: DeliveryStatus.PENDENTE, scheduledDate: new Date().toISOString().split('T')[0] });

  const filtered = useMemo(() => {
    return deliveries.filter(d => activeFilter === 'TODOS' || d.status === activeFilter);
  }, [deliveries, activeFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.driverId || !form.vehicleId) return;
    onUpdate({
      ...form,
      id: form.id || crypto.randomUUID(),
    } as Delivery);
    setIsOpen(false);
    setForm({ status: DeliveryStatus.PENDENTE, scheduledDate: new Date().toISOString().split('T')[0] });
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

  return (
    <div className="p-4 sm:p-8 space-y-8 pb-20">
      <header className="flex flex-col sm:row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">CONTROLE DE <span className="text-[#5ecce3]">ENTREGAS</span></h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Logística e Distribuição</p>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto px-8 py-4 bg-[#0f172a] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
        >
          <Plus size={18} /> Agendar Entrega
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
        {['TODOS', ...Object.values(DeliveryStatus)].map(status => (
          <button 
            key={status}
            onClick={() => setActiveFilter(status as any)}
            className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeFilter === status ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(d => {
          const client = getClient(d.clientId);
          const driver = getDriver(d.driverId);
          const vehicle = getVehicle(d.vehicleId);
          
          return (
            <div key={d.id} className={`bg-white p-6 rounded-[2.5rem] border ${d.status === DeliveryStatus.ENTREGUE ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-100'} shadow-sm relative overflow-hidden group`}>
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${d.status === DeliveryStatus.ENTREGUE ? 'bg-emerald-500 text-white' : d.status === DeliveryStatus.EM_ROTA ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Truck size={20} />
                     </div>
                     <div>
                        <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded ${d.status === DeliveryStatus.ENTREGUE ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                           {d.status}
                        </span>
                        <p className="text-[9px] font-black text-slate-400 uppercase mt-1">Ref: {d.id.slice(0, 8)}</p>
                     </div>
                  </div>
                  <div className="flex gap-1 no-print">
                     {d.status !== DeliveryStatus.ENTREGUE && (
                       <button onClick={() => updateStatus(d, DeliveryStatus.ENTREGUE)} className="p-2 text-emerald-500 bg-emerald-50 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle2 size={16} /></button>
                     )}
                     <button onClick={() => onDelete(d.id)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-start gap-3">
                     <User size={16} className="text-sky-500 mt-0.5 shrink-0" />
                     <div>
                        <h4 className="font-black text-slate-800 text-sm uppercase leading-none">{client?.name || 'Cliente Removido'}</h4>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 mt-2 uppercase">
                           <MapPin size={10} /> {client?.address}
                        </div>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Motorista</p>
                        <p className="text-[10px] font-black text-slate-700 uppercase">{driver?.name.split(' ')[0]}</p>
                     </div>
                     <div>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Veículo</p>
                        <p className="text-[10px] font-black text-slate-700 uppercase">{vehicle?.placa}</p>
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                        <Calendar size={12} /> {new Date(d.scheduledDate + 'T00:00:00').toLocaleDateString()}
                     </div>
                     {d.status === DeliveryStatus.PENDENTE && (
                        <button onClick={() => updateStatus(d, DeliveryStatus.EM_ROTA)} className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl text-[9px] font-black uppercase shadow-lg shadow-sky-100 active:scale-95">
                           Sair para Rota <ChevronRight size={12} />
                        </button>
                     )}
                  </div>
               </div>
            </div>
          );
        })}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-8">Agendar Entrega</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Selecionar Cliente</label>
                <select 
                  className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[10px] uppercase"
                  value={form.clientId || ''}
                  onChange={e => setForm({...form, clientId: e.target.value})}
                  required
                >
                  <option value="">BUSCAR CLIENTE...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Motorista</label>
                  <select 
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[10px] uppercase"
                    value={form.driverId || ''}
                    onChange={e => setForm({...form, driverId: e.target.value})}
                    required
                  >
                    <option value="">MOTORISTA...</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Veículo</label>
                  <select 
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[10px] uppercase"
                    value={form.vehicleId || ''}
                    onChange={e => setForm({...form, vehicleId: e.target.value})}
                    required
                  >
                    <option value="">PLACA...</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.placa}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Data Programada</label>
                <input 
                  type="date"
                  className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs"
                  value={form.scheduledDate || ''}
                  onChange={e => setForm({...form, scheduledDate: e.target.value})}
                  required
                />
              </div>

              <button className="w-full h-14 bg-[#0f172a] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest mt-4">CONFIRMAR AGENDAMENTO</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveriesView;
