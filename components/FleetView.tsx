
import React, { useState, useMemo } from 'react';
import { Truck, Plus, Trash2, Gauge, History, Fuel, Pencil, X, Car, Bike, Save, Loader2, UserCircle, CreditCard, ChevronDown, ChevronUp, BarChart3, ArrowRight, Printer, Calculator } from 'lucide-react';
import { Vehicle, KmLog, Employee, Expense } from '../types';

interface Props {
  vehicles: Vehicle[];
  kmLogs: KmLog[];
  employees?: Employee[]; 
  expenses?: Expense[]; 
  onUpdate: (vehicle: Vehicle) => Promise<void> | void;
  onDelete: (id: string) => void;
  onLogKm: (log: Omit<KmLog, 'id'>) => void;
  onRefuel: (payload: { vehicleId: string, employeeId: string, km: number, value: number, date: string, plate: string }) => Promise<any>;
}

const FleetView: React.FC<Props> = ({ vehicles = [], kmLogs = [], employees = [], expenses = [], onUpdate, onDelete, onLogKm, onRefuel }) => {
  // Estados para Cadastro/Edição de Veículo
  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [year, setYear] = useState('');
  const [initialKm, setInitialKm] = useState(''); 
  const [iconType, setIconType] = useState('truck');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  
  // Estados para Abastecimento
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [kmReading, setKmReading] = useState('');
  const [fuelValue, setFuelValue] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingFuel, setIsSubmittingFuel] = useState(false);

  // Modos de Visualização
  const [viewMode, setViewMode] = useState<'fleet' | 'history' | 'performance'>('fleet');

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
      console.error(error);
    } finally {
      setIsSavingVehicle(false);
    }
  };

  const handleEditVehicle = (v: Vehicle) => {
    setEditingId(v.id);
    setName(v.name);
    setPlate(v.plate);
    setInitialKm(v.kmAtual?.toString() || '0');
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
      console.error(err);
    } finally {
      setIsSubmittingFuel(false);
    }
  };

  // Lógica do Relatório de Desempenho (KM Rodados)
  const performanceData = useMemo(() => {
    const report: any[] = [];
    if (!vehicles || !kmLogs) return report;
    
    vehicles.forEach(vehicle => {
      // Pega todos os logs deste veículo ordenados por data e KM
      const vehicleLogs = kmLogs
        .filter(log => log && log.veiculo_id === vehicle.id)
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

      for (let i = 1; i < vehicleLogs.length; i++) {
        const current = vehicleLogs[i];
        const previous = vehicleLogs[i - 1];
        const traveled = current.km_reading - previous.km_reading;

        // Tenta achar a despesa de abastecimento vinculada a este registro de KM
        const fuelExpense = (expenses || []).find(e => 
          e && e.vehicleId === vehicle.id && 
          e.kmReading === current.km_reading &&
          e.category?.toLowerCase().includes('combustível')
        );

        if (traveled > 0) {
          report.push({
            id: current.id,
            vehicleName: vehicle.name,
            plate: vehicle.plate,
            date: current.data,
            kmInitial: previous.km_reading,
            kmFinal: current.km_reading,
            distance: traveled,
            cost: fuelExpense?.value || 0,
            driver: employees?.find(e => e.id === current.funcionario_id)?.name || 'N/A'
          });
        }
      }
    });

    return report.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [vehicles, kmLogs, expenses, employees]);

  const getVehicleIcon = (type: string | undefined) => {
    switch (type) {
      case 'car': return Car;
      case 'bike': return Bike;
      default: return Truck;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">Gestão de <span className="text-sky-500">Frota</span></h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Logística, Manutenção e Desempenho</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <button 
             onClick={() => isFormOpen ? resetVehicleForm() : setIsFormOpen(true)} 
             className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${isFormOpen ? 'bg-rose-500 text-white shadow-rose-100' : 'bg-sky-500 text-white shadow-sky-100'}`}
           >
             {isFormOpen ? <X size={18} /> : (editingId ? <Pencil size={18} /> : <Plus size={18} />)} 
             {isFormOpen ? 'Cancelar' : (editingId ? 'Editando...' : 'Novo Veículo')}
           </button>
           
           <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
              <button 
                onClick={() => setViewMode('fleet')} 
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${viewMode === 'fleet' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
              >
                Frota
              </button>
              <button 
                onClick={() => setViewMode('performance')} 
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${viewMode === 'performance' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                Desempenho
              </button>
              <button 
                onClick={() => setViewMode('history')} 
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${viewMode === 'history' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
              >
                Histórico
              </button>
           </div>
        </div>
      </header>

      {viewMode === 'fleet' && !isFormOpen && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           {/* FORMULÁRIO DE ABASTECIMENTO (FIXO/LATERAL) */}
           <aside className="lg:col-span-4 space-y-6 no-print">
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
                        {(employees || []).map(emp => (
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

           <main className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicles.map(v => {
                const Icon = getVehicleIcon(v.iconType);
                return (
                  <div key={v.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-16 h-16 bg-sky-50 text-sky-500 rounded-3xl flex items-center justify-center shadow-inner group-hover:bg-sky-500 group-hover:text-white transition-all">
                          <Icon size={32} />
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => handleEditVehicle(v)} className="p-3 bg-slate-50 text-slate-400 hover:text-sky-600 hover:bg-sky-100 rounded-2xl transition-all"><Pencil size={18} /></button>
                           <button onClick={() => { if(confirm('Excluir este veículo?')) onDelete(v.id) }} className="p-3 bg-slate-50 text-slate-300 hover:text-rose-600 hover:bg-rose-100 rounded-2xl transition-all"><Trash2 size={18} /></button>
                        </div>
                     </div>
                     <h4 className="text-2xl font-black text-slate-800 tracking-tighter">{v.name}</h4>
                     <p className="text-sky-500 font-mono font-black text-xs uppercase bg-sky-50 px-4 py-1.5 rounded-xl border border-sky-100 w-fit mt-2">{v.plate}</p>
                     
                     <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center group-hover:bg-white group-hover:border-sky-100 transition-all">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Odômetro Atual</p>
                          <span className="font-black text-slate-800 text-xl tracking-tight">{(v.kmAtual || 0).toLocaleString()} <span className="text-[10px] text-sky-400">KM</span></span>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-200 border border-slate-100 shadow-sm group-hover:text-sky-300">
                           <Gauge size={24} />
                        </div>
                     </div>
                  </div>
                );
              })}
           </main>
        </div>
      )}

      {isFormOpen && (
        <div className="animate-in slide-in-from-top-4 duration-500 no-print">
          <form onSubmit={handleSaveVehicle} className="bg-white p-8 rounded-[3rem] border-2 border-sky-100 shadow-2xl relative overflow-hidden max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
                {editingId ? 'Editando Veículo' : 'Cadastrar Veículo'}
              </h3>
              <button type="button" onClick={resetVehicleForm} className="p-2 text-slate-300 hover:text-rose-500"><X size={24} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nome</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: VW Delivery" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Placa</label>
                <input type="text" value={plate} onChange={e => setPlate(e.target.value)} placeholder="ABC-1234" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-mono uppercase font-black" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">KM Inicial / Atual</label>
                <input type="number" value={initialKm} onChange={e => setInitialKm(e.target.value)} placeholder="0" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Tipo</label>
                <div className="grid grid-cols-3 gap-2">
                  {['truck', 'car', 'bike'].map(type => (
                    <button key={type} type="button" onClick={() => setIconType(type)} className={`h-12 flex items-center justify-center rounded-2xl border-2 transition-all ${iconType === type ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                      {type === 'truck' ? <Truck size={18} /> : type === 'car' ? <Car size={18} /> : <Bike size={18} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button type="submit" disabled={isSavingVehicle} className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl uppercase text-[10px] tracking-[0.2em] shadow-xl mt-8 flex items-center justify-center gap-3 active:scale-95 transition-all">
              {isSavingVehicle ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {editingId ? 'Salvar Alterações' : 'Finalizar Cadastro'}
            </button>
          </form>
        </div>
      )}

      {viewMode === 'performance' && (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between mb-10 px-4 flex-wrap gap-4">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                       <BarChart3 size={24} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Relatório de Rodagem</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cálculo de KM rodados entre abastecimentos</p>
                    </div>
                 </div>
                 <button onClick={() => window.print()} className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all no-print flex items-center gap-2">
                    <Printer size={16} /> Imprimir
                 </button>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <th className="px-6 py-5">📅 Data</th>
                          <th className="px-6 py-5">🚛 Veículo</th>
                          <th className="px-6 py-5">📏 Percurso (KM)</th>
                          <th className="px-6 py-5">💰 Custo</th>
                          <th className="px-6 py-5 text-right">📊 Eficiência</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {(performanceData || []).map((row, idx) => (
                          <tr key={idx} className="hover:bg-indigo-50/20 transition-all group">
                             <td className="px-6 py-5 text-xs font-bold text-slate-500">
                                {new Date(row.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                             </td>
                             <td className="px-6 py-5">
                                <div className="flex items-center gap-2">
                                   <span className="text-xs font-black text-slate-800">{row.vehicleName}</span>
                                   <span className="text-[9px] font-bold text-sky-500 uppercase tracking-tighter bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">{row.plate}</span>
                                </div>
                             </td>
                             <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="text-[10px] text-slate-300 font-mono">
                                      {(row.kmInitial || 0).toLocaleString()} <ArrowRight size={10} className="inline mx-1" /> {(row.kmFinal || 0).toLocaleString()}
                                   </div>
                                   <span className="text-sm font-black text-indigo-600">+{(row.distance || 0).toLocaleString()} KM</span>
                                </div>
                             </td>
                             <td className="px-6 py-5">
                                <span className={`text-xs font-black ${row.cost > 0 ? 'text-slate-800' : 'text-slate-300 italic'}`}>
                                   {row.cost > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.cost) : 'N/D'}
                                </span>
                             </td>
                             <td className="px-6 py-5 text-right">
                                {row.cost > 0 && row.distance > 0 ? (
                                   <div className="flex flex-col items-end">
                                      <span className="text-[10px] font-black text-emerald-600">
                                         {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.cost / row.distance)} / KM
                                      </span>
                                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Custo por KM</span>
                                   </div>
                                ) : (
                                   <span className="text-[9px] text-slate-300 font-bold uppercase">Sem dado financeiro</span>
                                )}
                             </td>
                          </tr>
                       ))}
                       {performanceData.length === 0 && (
                          <tr>
                             <td colSpan={5} className="py-20 text-center">
                                <Calculator size={48} className="mx-auto text-slate-100 mb-4" />
                                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">
                                   Aguardando o segundo registro de KM para calcular rodagem...
                                </p>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {viewMode === 'history' && (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden p-8 animate-in zoom-in-95">
           <div className="flex items-center justify-between mb-10 px-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <History size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Histórico Geral</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lista completa de medições e eventos</p>
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
                   {(kmLogs || []).slice(0, 100).map(log => {
                     if (!log) return null;
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
                            <span className="text-sm font-black text-slate-800">{(log.km_reading || 0).toLocaleString()} <span className="text-[9px] text-slate-300">KM</span></span>
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
