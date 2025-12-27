
import React, { useState } from 'react';
import { Truck, Plus, Trash2, Gauge, History, Fuel, Pencil, X, Car, Bike, Save, Loader2, UserCircle, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { Vehicle, KmLog, Employee } from '../types';

interface Props {
  vehicles: Vehicle[];
  kmLogs: KmLog[];
  employees?: Employee[]; 
  onUpdate: (vehicle: Vehicle) => Promise<void> | void;
  onDelete: (id: string) => void;
  onLogKm: (log: Omit<KmLog, 'id'>) => void;
  onRefuel: (payload: { vehicleId: string, employeeId: string, km: number, value: number, date: string, plate: string }) => Promise<any>;
}

const FleetView: React.FC<Props> = ({ vehicles, kmLogs, employees = [], onUpdate, onDelete, onLogKm, onRefuel }) => {
  // Estados para Cadastro/Edição de Veículo
  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [year, setYear] = useState('');
  const [initialKm, setInitialKm] = useState(''); 
  const [iconType, setIconType] = useState('truck');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  
  // Estados para Abastecimento (FIXO)
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [kmReading, setKmReading] = useState('');
  const [fuelValue, setFuelValue] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingFuel, setIsSubmittingFuel] = useState(false);

  // Histórico
  const [showHistory, setShowHistory] = useState(false);

  const resetVehicleForm = () => {
    setName(''); 
    setPlate(''); 
    setYear('');
    setInitialKm('');
    setIconType('truck');
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !plate) return;
    
    setIsSavingVehicle(true);
    try {
      // Usar UUID apenas se não houver editingId
      await onUpdate({ 
        id: editingId || crypto.randomUUID(), 
        name, 
        plate: plate.toUpperCase().trim(), 
        modelYear: year || 'N/A', 
        kmAtual: parseFloat(initialKm) || 0,
        iconType: iconType
      });
      resetVehicleForm();
    } catch (error) {
      alert("Erro ao salvar veículo.");
    } finally {
      setIsSavingVehicle(false);
    }
  };

  const handleEditVehicle = (v: Vehicle) => {
    setEditingId(v.id);
    setName(v.name);
    setPlate(v.plate);
    setInitialKm(v.kmAtual?.toString() || '');
    setIconType(v.iconType || 'truck');
    setYear(v.modelYear || '');
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefuelAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !selectedEmployeeId || !kmReading || !fuelValue) return;
    setIsSubmittingFuel(true);
    try {
      const v = vehicles.find(v => v.id === selectedVehicleId);
      await onRefuel({ 
        vehicleId: selectedVehicleId, 
        employeeId: selectedEmployeeId, 
        km: parseFloat(kmReading), 
        value: parseFloat(fuelValue), 
        date: logDate, 
        plate: v?.plate || '' 
      });
      setKmReading(''); 
      setFuelValue('');
      alert("Abastecimento registrado com sucesso!");
    } catch (err) {
      alert("Erro ao salvar abastecimento.");
    } finally {
      setIsSubmittingFuel(false);
    }
  };

  const getVehicleIcon = (type: string | undefined) => {
    switch (type) {
      case 'car': return Car;
      case 'bike': return Bike;
      default: return Truck;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">Minha <span className="text-sky-500">Frota</span></h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Logística e Controle de Abastecimento</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <button 
             onClick={() => isFormOpen ? resetVehicleForm() : setIsFormOpen(true)} 
             className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${isFormOpen ? 'bg-rose-500 text-white shadow-rose-100' : 'bg-sky-500 text-white shadow-sky-100'}`}
           >
             {isFormOpen ? <X size={18} /> : (editingId ? <Pencil size={18} /> : <Plus size={18} />)} 
             {isFormOpen ? 'Cancelar' : (editingId ? 'Editando...' : 'Novo Veículo')}
           </button>
           <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">
             {showHistory ? <Truck size={18} /> : <History size={18} />} {showHistory ? 'Ver Frota' : 'Ver Histórico'}
           </button>
        </div>
      </header>

      {!showHistory ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           {/* FORMULÁRIO DE ABASTECIMENTO (FIXO/LATERAL) */}
           <aside className="lg:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden sticky top-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-600 mb-8 flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 bg-sky-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-sky-100">
                    <Fuel size={20} />
                  </div>
                  Lançar Abastecimento
                </h3>

                <form onSubmit={handleRefuelAction} className="space-y-5 relative z-10">
                   <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Veículo</label>
                     <select value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none appearance-none focus:ring-4 focus:ring-sky-50" required>
                        <option value="">Selecione...</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}
                     </select>
                   </div>

                   <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Quem abasteceu?</label>
                     <select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none appearance-none focus:ring-4 focus:ring-sky-50" required>
                        <option value="">Selecione...</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                     </select>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase ml-2">KM Atual</label>
                       <input type="number" value={kmReading} onChange={e => setKmReading(e.target.value)} placeholder="0" className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" required />
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Valor Total</label>
                       <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">R$</span>
                         <input type="number" step="0.01" value={fuelValue} onChange={e => setFuelValue(e.target.value)} placeholder="0.00" className="w-full h-12 pl-8 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" required />
                       </div>
                     </div>
                   </div>

                   <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Data</label>
                     <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs" required />
                   </div>

                   <button type="submit" disabled={isSubmittingFuel} className="w-full h-14 bg-sky-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-sky-100 active:scale-95 transition-all flex items-center justify-center gap-3">
                     {isSubmittingFuel ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                     Confirmar Lançamento
                   </button>
                </form>
              </div>
           </aside>

           {/* COLUNA PRINCIPAL: LISTA E CADASTRO (TOGGLE) */}
           <main className="lg:col-span-8 space-y-8">
              
              {/* FORMULÁRIO DE CADASTRO OCULTÁVEL */}
              {isFormOpen && (
                <div className="animate-in slide-in-from-top-4 duration-500">
                  <form onSubmit={handleSaveVehicle} className="bg-white p-8 rounded-[3rem] border-2 border-sky-100 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-sky-50 rounded-full -mr-24 -mt-24 opacity-50"></div>
                    
                    <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4 relative z-10">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                            {editingId ? <Pencil size={18} /> : <Plus size={18} />}
                         </div>
                         <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
                           {editingId ? 'Editando Dados do Veículo' : 'Cadastrar Novo Veículo'}
                         </h3>
                      </div>
                      <button type="button" onClick={resetVehicleForm} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><X size={24} /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Modelo / Nome</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: VW Delivery" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-sky-50 transition-all" required />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Placa</label>
                        <input type="text" value={plate} onChange={e => setPlate(e.target.value)} placeholder="ABC-1234" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-mono uppercase font-black outline-none focus:ring-4 focus:ring-sky-50 transition-all" required />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">KM Inicial</label>
                        <input type="number" value={initialKm} onChange={e => setInitialKm(e.target.value)} placeholder="0" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Ícone do Veículo</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'truck', icon: Truck, label: 'Caminhão' },
                            { id: 'car', icon: Car, label: 'Carro' },
                            { id: 'bike', icon: Bike, label: 'Moto' }
                          ].map(item => (
                            <button 
                              key={item.id}
                              type="button" 
                              onClick={() => setIconType(item.id)}
                              className={`h-12 flex items-center justify-center rounded-2xl border-2 transition-all gap-2 px-4 ${iconType === item.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                            >
                              <item.icon size={18} />
                              <span className="text-[8px] font-black uppercase hidden md:inline">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-8 relative z-10">
                      <button 
                        type="submit" 
                        disabled={isSavingVehicle}
                        className="flex-1 h-14 bg-slate-900 text-white font-black rounded-2xl uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-sky-600 transition-all active:scale-95 flex items-center justify-center gap-3"
                      >
                        {isSavingVehicle ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {editingId ? 'Salvar Alterações' : 'Cadastrar Veículo'}
                      </button>
                      {editingId && (
                        <button type="button" onClick={resetVehicleForm} className="h-14 px-6 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-200 transition-all">
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* LISTAGEM DE CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vehicles.map(v => {
                  const Icon = getVehicleIcon(v.iconType);
                  return (
                    <div key={v.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                       
                       <div className="flex justify-between items-start mb-6 relative z-10">
                          <div className="w-16 h-16 bg-sky-50 text-sky-500 rounded-3xl flex items-center justify-center shadow-inner group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                            <Icon size={32} />
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => handleEditVehicle(v)} className="p-3 bg-slate-50 text-slate-400 hover:text-sky-600 hover:bg-sky-100 rounded-2xl transition-all"><Pencil size={18} /></button>
                             <button onClick={() => { if(confirm('Excluir este veículo?')) onDelete(v.id) }} className="p-3 bg-slate-50 text-slate-300 hover:text-rose-600 hover:bg-rose-100 rounded-2xl transition-all"><Trash2 size={18} /></button>
                          </div>
                       </div>
                       
                       <div className="relative z-10">
                         <h4 className="text-2xl font-black text-slate-800 tracking-tighter">{v.name}</h4>
                         <p className="text-sky-500 font-mono font-black text-xs uppercase bg-sky-50 px-4 py-1.5 rounded-xl border border-sky-100 w-fit mt-2">
                            {v.plate}
                         </p>
                       </div>
                       
                       <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center relative z-10 group-hover:bg-white group-hover:border-sky-100 transition-all">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Odômetro Atual</p>
                            <span className="font-black text-slate-800 text-xl tracking-tight">{(v.kmAtual || 0).toLocaleString()} <span className="text-[10px] text-sky-400">KM</span></span>
                          </div>
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-200 border border-slate-100 shadow-sm group-hover:text-sky-300">
                             <Gauge size={24} />
                          </div>
                       </div>

                       <div className="mt-6 flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">
                          <History size={12} className="text-sky-500" /> Última Atualização: {kmLogs.find(l => l.veiculo_id === v.id) ? new Date(kmLogs.find(l => l.veiculo_id === v.id)!.data + 'T00:00:00').toLocaleDateString('pt-BR') : 'Sem histórico'}
                       </div>
                    </div>
                  );
                })}
                
                {vehicles.length === 0 && (
                  <div className="col-span-full py-24 text-center text-slate-300 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
                     <Truck size={48} className="opacity-10 mb-4" />
                     <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Frota Vazia</h3>
                     <button onClick={() => setIsFormOpen(true)} className="mt-6 px-8 py-4 bg-sky-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-sky-100">
                        Cadastrar Veículo
                     </button>
                  </div>
                )}
              </div>
           </main>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden p-8 animate-in zoom-in-95">
           <div className="flex items-center justify-between mb-10 px-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <History size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Histórico de Rodagem</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Eventos de KM e Abastecimentos</p>
                </div>
              </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-5">📅 Data</th>
                    <th className="px-6 py-5">🚛 Veículo</th>
                    <th className="px-6 py-5">📏 Kilometragem</th>
                    <th className="px-6 py-5">👤 Motorista</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {kmLogs.slice(0, 50).map(log => {
                     const v = vehicles.find(veh => veh.id === log.veiculo_id);
                     const emp = employees.find(e => e.id === log.funcionario_id);
                     return (
                       <tr key={log.id} className="hover:bg-sky-50/20 transition-all group">
                         <td className="px-6 py-5 text-xs font-bold text-slate-500">{new Date(log.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                         <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-sky-500 transition-colors">
                                  {v ? getVehicleIcon(v.iconType)({size: 16}) : <Truck size={16} />}
                               </div>
                               <div>
                                  <span className="text-xs font-black text-slate-800 block leading-none">{v?.name || 'Excluído'}</span>
                                  <span className="text-[9px] font-bold text-sky-500 uppercase tracking-tighter">{v?.plate}</span>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-5">
                            <span className="text-sm font-black text-slate-800">{log.km_reading.toLocaleString()} <span className="text-[9px] text-slate-300">KM</span></span>
                         </td>
                         <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                               <UserCircle size={14} className="text-slate-200" />
                               <span className="text-xs font-bold text-slate-500">{emp?.name || 'Sistema'}</span>
                            </div>
                         </td>
                       </tr>
                     );
                   })}
                </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default FleetView;
