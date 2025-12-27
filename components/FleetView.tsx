
import React, { useState, useMemo } from 'react';
import { 
  Truck as TruckIcon, 
  Plus as PlusIcon, 
  Trash2 as TrashIcon, 
  Gauge as GaugeIcon, 
  History as HistoryIcon, 
  Fuel as FuelIcon, 
  Pencil as PencilIcon, 
  X as XIcon, 
  Car as CarIcon, 
  Bike as BikeIcon, 
  Save as SaveIcon, 
  Loader2 as LoaderIcon, 
  UserCircle as UserIcon, 
  BarChart3 as ChartIcon, 
  ArrowRight as ArrowIcon, 
  Filter as FilterIcon,
  AlertTriangle as AlertIcon,
  Zap as ZapIcon,
  Droplets as DropletsIcon,
  CheckCircle2 as CheckIcon,
  PlusCircle as PlusCircleIcon,
  Wrench as MaintenanceIcon,
  Check as ResetIcon
} from 'lucide-react';
import { Vehicle, KmLog, Employee, Expense, ExpenseStatus } from '../types';

interface Props {
  vehicles: Vehicle[];
  kmLogs: KmLog[];
  employees?: Employee[]; 
  expenses?: Expense[]; 
  onUpdate: (vehicle: Vehicle) => Promise<void> | void;
  onDelete: (id: string) => void;
  onLogKm: (log: Omit<KmLog, 'id'>) => void;
  onRefuel: (payload: { vehicleId: string, employeeId: string, km: number, value: number, liters?: number, date: string, plate: string }) => Promise<any>;
  onUpdateExpense?: (expense: Expense) => Promise<void> | void;
}

const FleetView: React.FC<Props> = ({ 
  vehicles = [], 
  kmLogs = [], 
  employees = [], 
  expenses = [], 
  onUpdate, 
  onDelete, 
  onLogKm, 
  onRefuel,
  onUpdateExpense
}) => {
  const [viewMode, setViewMode] = useState<'fleet' | 'performance' | 'history'>('fleet');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRefuelOpen, setIsRefuelOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [filterVehicleId, setFilterVehicleId] = useState<string>('all');

  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [year, setYear] = useState('');
  const [initialKm, setInitialKm] = useState(''); 
  const [iconType, setIconType] = useState('truck');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [kmReading, setKmReading] = useState('');
  const [fuelValue, setFuelValue] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingFuel, setIsSubmittingFuel] = useState(false);

  const [maintType, setMaintType] = useState('Troca de Óleo');
  const [maintValue, setMaintValue] = useState('');
  const [maintDate, setMaintDate] = useState(new Date().toISOString().split('T')[0]);
  const [maintPaid, setMaintPaid] = useState(true);
  const [maintDueDate, setMaintDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingMaint, setIsSubmittingMaint] = useState(false);

  const resetVehicleForm = () => {
    setName(''); setPlate(''); setYear(''); setInitialKm(''); setIconType('truck');
    setEditingId(null); setIsFormOpen(false);
  };

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !plate) return;
    setIsSavingVehicle(true);
    try {
      const v = vehicles.find(veh => veh.id === editingId);
      await onUpdate({ 
        id: editingId || crypto.randomUUID(), 
        name, 
        plate: plate.toUpperCase().trim(), 
        modelYear: year || 'N/A', 
        kmAtual: parseFloat(initialKm) || 0,
        iconType,
        lastOilChangeKm: editingId ? (v?.lastOilChangeKm || 0) : (parseFloat(initialKm) || 0)
      });
      resetVehicleForm();
    } catch (error) { console.error(error); } 
    finally { setIsSavingVehicle(false); }
  };

  const handleEditVehicle = (v: Vehicle) => {
    setEditingId(v.id); setName(v.name); setPlate(v.plate);
    setInitialKm(v.kmAtual?.toString() || '0'); setIconType(v.iconType || 'truck');
    setYear(v.modelYear || ''); setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefuelAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !selectedEmployeeId || !kmReading || !fuelValue) return;
    setIsSubmittingFuel(true);
    try {
      const v = vehicles.find(v => v.id === selectedVehicleId);
      await onRefuel({ 
        vehicleId: selectedVehicleId, employeeId: selectedEmployeeId, 
        km: parseFloat(kmReading), value: parseFloat(fuelValue), 
        liters: fuelLiters ? parseFloat(fuelLiters) : undefined,
        date: logDate, plate: v?.plate || '' 
      });
      setKmReading(''); setFuelValue(''); setFuelLiters(''); setIsRefuelOpen(false);
    } catch (err) { console.error(err); } 
    finally { setIsSubmittingFuel(false); }
  };

  const handleMaintenanceAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !maintValue || !maintDate) return;
    setIsSubmittingMaint(true);
    try {
      const v = vehicles.find(v => v.id === selectedVehicleId);
      if (!onUpdateExpense) throw new Error("Função de atualização de despesas não configurada.");

      const isOilChange = maintType === 'Troca de Óleo';

      const expenseData: Expense = {
        id: crypto.randomUUID(),
        description: `${maintType} - ${v?.plate}`,
        value: parseFloat(maintValue),
        dueDate: maintPaid ? maintDate : maintDueDate,
        status: maintPaid ? ExpenseStatus.PAGO : ExpenseStatus.A_VENCER,
        category: 'Manutenção',
        vehicleId: selectedVehicleId,
        kmReading: v?.kmAtual,
        observation: `Manutenção do tipo ${maintType}.`
      };

      await onUpdateExpense(expenseData);
      
      if (isOilChange && v) {
        await onUpdate({ ...v, lastOilChangeKm: v.kmAtual });
      }

      setMaintValue(''); setIsMaintenanceOpen(false);
      alert("Manutenção registrada e sincronizada!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar manutenção.");
    } finally {
      setIsSubmittingMaint(false);
    }
  };

  const handleResetOil = async (v: Vehicle) => {
    if (!confirm(`Confirmar troca de óleo para ${v.name}? O KM de referência será atualizado para ${v.kmAtual}km.`)) return;
    try {
      await onUpdate({ ...v, lastOilChangeKm: v.kmAtual });
      alert("Contagem reiniciada com sucesso!");
    } catch (err) {
      alert("Erro ao reiniciar contagem.");
    }
  };

  const performanceData = useMemo(() => {
    const report: any[] = [];
    if (!vehicles || !kmLogs) return report;
    
    vehicles.forEach(vehicle => {
      const vehicleLogs = (kmLogs || [])
        .filter(log => log && log.veiculo_id === vehicle.id)
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

      const refuelsPerWeek: Record<string, number> = {};
      
      for (let i = 1; i < vehicleLogs.length; i++) {
        const current = vehicleLogs[i];
        const previous = vehicleLogs[i - 1];
        const traveled = (current?.km_reading || 0) - (previous?.km_reading || 0);
        const dateObj = new Date(current.data + 'T00:00:00');
        const weekKey = `${dateObj.getFullYear()}-W${getWeekNumber(dateObj)}`;
        
        const fuelExpense = (expenses || []).find(e => 
          e && e.vehicleId === vehicle.id && e.kmReading === current.km_reading &&
          e.category?.toLowerCase().includes('combustível')
        );

        if (fuelExpense) refuelsPerWeek[weekKey] = (refuelsPerWeek[weekKey] || 0) + 1;

        if (traveled > 0) {
          report.push({
            id: current.id, vehicleId: vehicle.id, vehicleName: vehicle.name, plate: vehicle.plate,
            date: current.data, weekKey, kmInitial: previous.km_reading, kmFinal: current.km_reading,
            distance: traveled, driver: (employees || []).find(e => e.id === current.funcionario_id)?.name || 'N/A',
            isRefuel: !!fuelExpense, liters: current.liters
          });
        }
      }

      report.forEach(item => {
        if (item.vehicleId === vehicle.id) {
          item.refuelsInWeek = refuelsPerWeek[item.weekKey] || 0;
          item.highConsumption = item.refuelsInWeek >= 2;
        }
      });
    });

    return report.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [vehicles, kmLogs, expenses, employees]);

  const fleetStats = useMemo(() => {
    const totalKm = vehicles.reduce((sum, v) => sum + (v.kmAtual || 0), 0);
    const maintenanceAlerts = vehicles.filter(v => {
      const kmSinceOil = (v.kmAtual || 0) - (v.lastOilChangeKm || 0);
      return kmSinceOil >= 1000;
    }).length;

    return { totalKm, maintenanceAlerts, activeVehicles: vehicles.length };
  }, [vehicles]);

  const getVehicleIcon = (type: string | undefined) => {
    switch (type) {
      case 'car': return CarIcon;
      case 'bike': return BikeIcon;
      default: return TruckIcon;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-32">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm no-print">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-sky-500 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl shadow-sky-100">
            <TruckIcon size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">Minha <span className="text-sky-500">Frota</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Logística e Manutenção</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setIsMaintenanceOpen(true)} className="h-14 px-8 bg-indigo-500 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg hover:bg-indigo-600 transition-all active:scale-95 flex items-center gap-2">
            <MaintenanceIcon size={18} /> Manutenção
          </button>
          <button onClick={() => setIsRefuelOpen(true)} className="h-14 px-8 bg-emerald-500 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg hover:bg-emerald-600 transition-all active:scale-95 flex items-center gap-2">
            <FuelIcon size={18} /> Abastecer
          </button>
          <button onClick={() => setIsFormOpen(true)} className="h-14 px-8 bg-slate-900 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2">
            <PlusCircleIcon size={18} /> Novo Veículo
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center">
            <GaugeIcon size={24} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ativos</p>
            <h4 className="text-xl font-black text-slate-800">{fleetStats.activeVehicles}</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${fleetStats.maintenanceAlerts > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-50 text-slate-300'}`}>
            <AlertIcon size={24} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alertas de Óleo</p>
            <h4 className={`text-xl font-black ${fleetStats.maintenanceAlerts > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{fleetStats.maintenanceAlerts}</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
            <ZapIcon size={24} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rodagem Total</p>
            <h4 className="text-xl font-black text-slate-800">{fleetStats.totalKm.toLocaleString()} KM</h4>
          </div>
        </div>
      </div>

      <div className="flex p-1.5 bg-slate-200/40 rounded-[1.8rem] w-fit border border-slate-200 no-print">
        <button onClick={() => setViewMode('fleet')} className={`px-8 py-3 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'fleet' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Listagem</button>
        <button onClick={() => setViewMode('performance')} className={`px-8 py-3 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'performance' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Desempenho</button>
        <button onClick={() => setViewMode('history')} className={`px-8 py-3 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'history' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Log</button>
      </div>

      {viewMode === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {vehicles.map(v => {
            const kmSinceOil = (v.kmAtual || 0) - (v.lastOilChangeKm || 0);
            const needsOil = kmSinceOil >= 1000;
            const VehicleIcon = getVehicleIcon(v.iconType);

            return (
              <div key={v.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                {needsOil && (
                  <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-rose-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse shadow-lg">
                    <DropletsIcon size={12} /> TROCAR ÓLEO
                  </div>
                )}

                <div className="flex justify-between items-start mb-8">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all ${needsOil ? 'bg-rose-50 text-rose-500' : 'bg-sky-50 text-sky-500 group-hover:bg-sky-500 group-hover:text-white shadow-inner'}`}>
                    <VehicleIcon size={32} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditVehicle(v)} className="p-3 bg-slate-50 text-slate-400 hover:bg-sky-100 hover:text-sky-600 rounded-xl transition-all"><PencilIcon size={18} /></button>
                    <button onClick={() => { if(confirm('Excluir veículo?')) onDelete(v.id) }} className="p-3 bg-slate-50 text-slate-300 hover:bg-rose-100 hover:text-rose-600 rounded-xl transition-all"><TrashIcon size={18} /></button>
                  </div>
                </div>

                <h4 className="text-2xl font-black text-slate-800 tracking-tighter mb-1">{v.name}</h4>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] font-black text-sky-500 bg-sky-50 px-3 py-1 rounded-lg border border-sky-100 uppercase">{v.plate}</span>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{v.modelYear}</span>
                </div>

                <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between group-hover:bg-white transition-all">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Odômetro Atual</p>
                    <span className="text-2xl font-black text-slate-800">{(v.kmAtual || 0).toLocaleString()} <span className="text-xs text-slate-400">KM</span></span>
                  </div>
                  {needsOil && (
                    <button 
                      onClick={() => handleResetOil(v)}
                      className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-rose-600 transition-all active:scale-90"
                      title="Confirmar Troca e Resetar"
                    >
                      <ResetIcon size={24} />
                    </button>
                  )}
                </div>

                <div className="mt-4 px-2">
                  <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest mb-1.5">
                    <span className="text-slate-400">Desgaste do Óleo</span>
                    <span className={needsOil ? 'text-rose-500' : 'text-sky-500'}>{kmSinceOil} / 1.000 KM</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${needsOil ? 'bg-rose-500' : 'bg-sky-500'}`} style={{ width: `${Math.min(100, (kmSinceOil / 1000) * 100)}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL LANÇAR MANUTENÇÃO */}
      {isMaintenanceOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMaintenanceOpen(false)}></div>
          <form onSubmit={handleMaintenanceAction} className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <MaintenanceIcon size={24} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Manutenção</h3>
                </div>
                <button type="button" onClick={() => setIsMaintenanceOpen(false)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><XIcon size={24} /></button>
             </div>

             <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Veículo</label>
                  <select value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-indigo-50 transition-all" required>
                    <option value="">Selecionar...</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Tipo</label>
                    <select value={maintType} onChange={e => setMaintType(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none" required>
                      <option value="Troca de Óleo">Troca de Óleo</option>
                      <option value="Pneus">Pneus</option>
                      <option value="Freios">Freios</option>
                      <option value="Motor">Motor</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Valor (R$)</label>
                    <input type="number" step="0.01" value={maintValue} onChange={e => setMaintValue(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Data</label>
                  <input type="date" value={maintDate} onChange={e => setMaintDate(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs" required />
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor já pago?</span>
                      <div className="flex p-1 bg-white border border-slate-100 rounded-xl">
                        <button type="button" onClick={() => setMaintPaid(true)} className={`px-4 py-2 rounded-lg text-[9px] font-black transition-all ${maintPaid ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-300'}`}>SIM</button>
                        <button type="button" onClick={() => setMaintPaid(false)} className={`px-4 py-2 rounded-lg text-[9px] font-black transition-all ${!maintPaid ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-300'}`}>NÃO</button>
                      </div>
                   </div>
                   {!maintPaid && (
                     <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                        <label className="text-[9px] font-black text-amber-600 uppercase ml-2 tracking-widest">Vencimento</label>
                        <input type="date" value={maintDueDate} onChange={e => setMaintDueDate(e.target.value)} className="w-full h-10 px-5 bg-white border border-amber-100 rounded-xl font-bold text-[10px]" required={!maintPaid} />
                     </div>
                   )}
                </div>

                <button type="submit" disabled={isSubmittingMaint} className="w-full h-14 bg-indigo-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-[0.2em] shadow-xl mt-4 hover:bg-indigo-700 active:scale-95 transition-all">
                  {isSubmittingMaint ? <LoaderIcon className="animate-spin" size={20} /> : <SaveIcon size={20} />}
                  Salvar Manutenção
                </button>
             </div>
          </form>
        </div>
      )}

      {/* MODAL ABASTECIMENTO */}
      {isRefuelOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsRefuelOpen(false)}></div>
          <form onSubmit={handleRefuelAction} className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <FuelIcon size={24} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Abastecimento</h3>
                </div>
                <button type="button" onClick={() => setIsRefuelOpen(false)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><XIcon size={24} /></button>
             </div>

             <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Veículo</label>
                    <select value={selectedVehicleId} onChange={e => {
                        setSelectedVehicleId(e.target.value);
                        const v = vehicles.find(v => v.id === e.target.value);
                        if(v) setKmReading(v.kmAtual?.toString() || '');
                      }} className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none" required>
                      <option value="">Selecionar...</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Motorista</label>
                    <select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none" required>
                      <option value="">Selecionar...</option>
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">KM Atual</label>
                    <input type="number" value={kmReading} onChange={e => setKmReading(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Valor (R$)</label>
                    <input type="number" step="0.01" value={fuelValue} onChange={e => setFuelValue(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Litros</label>
                    <input type="number" step="0.1" value={fuelLiters} onChange={e => setFuelLiters(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Data</label>
                  <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs" required />
                </div>

                <button type="submit" disabled={isSubmittingFuel} className="w-full h-14 bg-emerald-500 text-white font-black rounded-2xl uppercase text-[10px] tracking-[0.2em] shadow-xl mt-4 hover:bg-emerald-600 active:scale-95 transition-all">
                  {isSubmittingFuel ? <LoaderIcon className="animate-spin" size={20} /> : <CheckIcon size={20} />}
                  Lançar Abastecimento
                </button>
             </div>
          </form>
        </div>
      )}

      {/* MODAL CADASTRO VEICULO */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={resetVehicleForm}></div>
          <form onSubmit={handleSaveVehicle} className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
                  {editingId ? <PencilIcon size={24} /> : <PlusIcon size={24} />}
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{editingId ? 'Editar Veículo' : 'Novo Veículo'}</h3>
              </div>
              <button type="button" onClick={resetVehicleForm} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><XIcon size={24} /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nome do Veículo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Caminhão Baú" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Placa</label>
                <input type="text" value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} placeholder="ABC1D23" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-mono font-black text-sm uppercase" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">KM Inicial</label>
                <input type="number" value={initialKm} onChange={e => setInitialKm(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Categoria</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ id: 'truck', icon: TruckIcon, label: 'Pesado' }, { id: 'car', icon: CarIcon, label: 'Leve' }, { id: 'bike', icon: BikeIcon, label: 'Moto' }].map(type => (
                    <button key={type.id} type="button" onClick={() => setIconType(type.id)} className={`flex flex-col items-center justify-center p-4 rounded-[1.8rem] border-2 transition-all ${iconType === type.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                      <type.icon size={24} className="mb-1" />
                      <span className="text-[8px] font-black uppercase">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" disabled={isSavingVehicle} className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl uppercase text-[10px] tracking-[0.2em] shadow-xl mt-10 hover:bg-sky-600 transition-all">
              {isSavingVehicle ? <LoaderIcon className="animate-spin" size={20} /> : <SaveIcon size={20} />}
              Salvar Veículo
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FleetView;
