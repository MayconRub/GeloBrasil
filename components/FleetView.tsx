
import React, { useState, useMemo } from 'react';
import { 
  Truck, Car, Bike, Plus, Trash2, Fuel, Wrench, AlertOctagon, 
  BarChart3, X, CheckCircle2, AlertTriangle, Droplets, Pencil, Save, AlertCircle, User,
  ChevronLeft, ChevronRight, Calendar, Gauge, ArrowRight, TrendingUp, Search, Info, Printer
} from 'lucide-react';
import { Vehicle, Employee, FuelLog, MaintenanceLog, FineLog } from '../types';

interface Props {
  vehicles: Vehicle[];
  employees: Employee[];
  fuelLogs: FuelLog[];
  maintenanceLogs: MaintenanceLog[];
  fineLogs: FineLog[];
  onUpdateVehicle: (v: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  onUpdateFuel: (f: FuelLog) => void;
  onDeleteFuel: (id: string) => void;
  onUpdateMaintenance: (m: MaintenanceLog) => void;
  onDeleteMaintenance: (id: string) => void;
  onUpdateFine: (f: FineLog) => void;
  onDeleteFine: (id: string) => void;
}

type TabType = 'vehicles' | 'fuel' | 'maintenance' | 'fines' | 'reports';

const FleetView: React.FC<Props> = ({ 
  vehicles, employees, fuelLogs, maintenanceLogs, fineLogs,
  onUpdateVehicle, onDeleteVehicle, onUpdateFuel, onDeleteFuel, 
  onUpdateMaintenance, onDeleteMaintenance, onUpdateFine, onDeleteFine 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('vehicles');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();

  const handlePrevMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const filteredFuel = useMemo(() => fuelLogs.filter(l => {
    const d = new Date(l.data + 'T00:00:00');
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }), [fuelLogs, currentMonth, currentYear]);

  const filteredMaint = useMemo(() => maintenanceLogs.filter(l => {
    const d = new Date(l.data + 'T00:00:00');
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }), [maintenanceLogs, currentMonth, currentYear]);

  const filteredFines = useMemo(() => fineLogs.filter(l => {
    const d = new Date(l.data + 'T00:00:00');
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }), [fineLogs, currentMonth, currentYear]);

  const stats = useMemo(() => {
    const totalV = vehicles?.length || 0;
    const totalFuel = filteredFuel.reduce((sum, l) => sum + l.valor_total, 0);
    const totalMaint = filteredMaint.reduce((sum, l) => sum + l.custo, 0);
    const totalFines = filteredFines.reduce((sum, l) => sum + l.valor, 0);
    const oilAlerts = (vehicles || []).filter(v => ((v.km_atual || 0) - (v.km_ultima_troca || 0)) >= 1000).length;
    return { totalV, totalFuel, totalMaint, totalFines, oilAlerts };
  }, [vehicles, filteredFuel, filteredMaint, filteredFines]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-20 uppercase transition-colors">
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none no-print">
        <div className="flex items-center gap-3 sm:gap-5 w-full md:w-auto">
          <div className="w-10 h-10 sm:w-16 sm:h-16 bg-slate-900 dark:bg-slate-800 rounded-xl sm:rounded-[1.8rem] flex items-center justify-center text-white shadow-lg dark:shadow-none shrink-0">
            <Truck size={20} className="sm:size-8" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-3xl font-black text-slate-800 dark:text-white tracking-tighter leading-none uppercase truncate">FROTA <span className="text-sky-500">BRASIL</span></h2>
            <div className="flex items-center gap-1 mt-1">
               <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg h-7 no-print">
                  <button onClick={handlePrevMonth} className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-400 dark:text-slate-600 transition-all"><ChevronLeft size={12} /></button>
                  <div className="px-2 text-center min-w-[100px]"><p className="text-[8px] font-black text-slate-800 dark:text-slate-200">{monthName}</p></div>
                  <button onClick={handleNextMonth} className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-400 dark:text-slate-600 transition-all"><ChevronRight size={12} /></button>
               </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl sm:rounded-[1.8rem] w-full md:w-auto overflow-x-auto no-scrollbar border border-slate-200 dark:border-slate-800">
          {[
            { id: 'vehicles', label: 'FROTA', icon: Truck },
            { id: 'fuel', label: 'ABAST.', icon: Fuel },
            { id: 'maintenance', label: 'OFICINA', icon: Wrench },
            { id: 'fines', label: 'MULTAS', icon: AlertOctagon },
            { id: 'reports', label: 'CUSTOS', icon: BarChart3 },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)} className={`flex-1 flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-[1.4rem] text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm dark:shadow-none' : 'text-slate-400 dark:text-slate-600 hover:text-slate-700'}`}>
              <tab.icon size={12} className="sm:size-3.5" /> <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'vehicles' && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 no-print px-1 sm:px-0">
          <SummaryCard label="VEÍCULOS" value={stats.totalV} icon={Truck} color="sky" />
          <SummaryCard label="GASOLINA" value={`R$ ${stats.totalFuel.toLocaleString()}`} icon={Fuel} color="emerald" />
          <SummaryCard label="OFICINA" value={`R$ ${stats.totalMaint.toLocaleString()}`} icon={Wrench} color="indigo" />
          <SummaryCard label="MULTAS" value={`R$ ${stats.totalFines.toLocaleString()}`} icon={AlertOctagon} color="rose" />
          <SummaryCard label="TROCA ÓLEO" value={stats.oilAlerts} icon={Droplets} color="amber" isFullOnMobile />
        </div>
      )}

      <div className="px-1 sm:px-0">
        {activeTab === 'vehicles' && <VehiclesTab vehicles={vehicles} employees={employees} onUpdate={onUpdateVehicle} onUpdateMaintenance={onUpdateMaintenance} onDelete={onDeleteVehicle} />}
        {activeTab === 'fuel' && <FuelTab logs={filteredFuel} vehicles={vehicles} employees={employees} onUpdate={onUpdateFuel} onDelete={onDeleteFuel} />}
        {activeTab === 'maintenance' && <MaintenanceTab logs={filteredMaint} vehicles={vehicles} employees={employees} onUpdate={onUpdateMaintenance} onDelete={onDeleteMaintenance} />}
        {activeTab === 'fines' && <FinesTab logs={filteredFines} vehicles={vehicles} employees={employees} onUpdate={onUpdateFine} onDelete={onDeleteFine} />}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon, color, isFullOnMobile }: any) => {
  const colorMap: Record<string, string> = { sky: "bg-sky-50 dark:bg-sky-900/20 text-sky-500", emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500", indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500", rose: "bg-rose-50 dark:bg-rose-900/20 text-rose-500", amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-500" };
  return (
    <div className={`bg-white dark:bg-slate-900 p-3 sm:p-6 rounded-[1.2rem] sm:rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none flex items-center gap-2 sm:gap-4 ${isFullOnMobile ? 'col-span-2 sm:col-span-1' : ''}`}>
      <div className={`w-8 h-8 sm:w-12 sm:h-12 ${colorMap[color] || 'bg-slate-50 text-slate-500'} rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0`}><Icon size={16} className="sm:size-6" /></div>
      <div className="min-w-0"><p className="text-[7px] sm:text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-0.5 truncate">{label}</p><h4 className="text-xs sm:text-lg font-black text-slate-800 dark:text-slate-100 truncate">{value}</h4></div>
    </div>
  );
};

const VehiclesTab = ({ vehicles, employees, onUpdate, onDelete, onUpdateMaintenance }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOilModalOpen, setIsOilModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Vehicle>>({ tipo: 'Caminhão', km_atual: 0, km_ultima_troca: 0, tipo_combustivel: 'FLEX' });
  const [oilForm, setOilForm] = useState({ veiculo_id: '', custo: 0, pago: true, data: new Date().toISOString().split('T')[0], funcionario_id: '' });

  const sortedVehicles = useMemo(() => {
    return [...(vehicles || [])].sort((a, b) => {
      const diffA = (a.km_atual || 0) - (a.km_ultima_troca || 0);
      const diffB = (b.km_atual || 0) - (b.km_ultima_troca || 0);
      return (diffB >= 1000 ? 1 : 0) - (diffA >= 1000 ? 1 : 0);
    });
  }, [vehicles]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...form, id: form.id || crypto.randomUUID() } as Vehicle);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end no-print px-1"><button onClick={() => setIsOpen(true)} className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase shadow-xl dark:shadow-none">CADASTRAR VEÍCULO</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-1 sm:px-0">
        {sortedVehicles.map((v: Vehicle) => {
          const kmSinceOil = (v.km_atual || 0) - (v.km_ultima_troca || 0);
          const needsOilChange = kmSinceOil >= 1000;
          return (
            <div key={v.id} className={`bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border ${needsOilChange ? 'border-rose-200 dark:border-rose-900' : 'border-slate-100 dark:border-slate-800'} relative overflow-hidden group transition-all`}>
               <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 ${needsOilChange ? 'bg-rose-500 text-white shadow-xl dark:shadow-none animate-pulse' : 'bg-sky-50 dark:bg-sky-900/20 text-sky-500'} rounded-xl sm:rounded-2xl flex items-center justify-center transition-all`}>
                    {v.tipo === 'Caminhão' ? <Truck size={24} /> : v.tipo === 'Moto' ? <Bike size={24} /> : <Car size={24} />}
                  </div>
                  <div className="flex gap-2 no-print opacity-20 group-hover:opacity-100">
                     <button onClick={() => { setForm(v); setIsOpen(true); }} className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-950 text-slate-300 dark:text-slate-700 hover:text-sky-500 rounded-lg sm:rounded-xl transition-all"><Pencil size={16} /></button>
                     <button onClick={() => onDelete(v.id)} className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-950 text-slate-300 dark:text-slate-700 hover:text-rose-500 rounded-lg sm:rounded-xl transition-all"><Trash2 size={16} /></button>
                  </div>
               </div>
               <h4 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter truncate">{v.modelo.toUpperCase()}</h4>
               <span className="inline-block font-mono text-[10px] font-black text-sky-500 bg-sky-50 dark:bg-sky-950/30 px-2 sm:px-3 py-1 rounded-lg border border-sky-100 dark:border-sky-900/30 uppercase mt-2">{v.placa.toUpperCase()}</span>
               <div className={`mt-6 sm:mt-8 p-4 rounded-2xl border transition-all ${needsOilChange ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800'}`}>
                  <p className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest ${needsOilChange ? 'text-rose-600' : 'text-slate-400 dark:text-slate-600'}`}>KM ÓLEO ({kmSinceOil} / 1000)</p>
                  <button onClick={() => { setOilForm({...oilForm, veiculo_id: v.id}); setIsOilModalOpen(true); }} className={`mt-2 w-full py-2 border rounded-lg text-[7px] sm:text-[8px] font-black uppercase transition-all no-print ${needsOilChange ? 'bg-rose-600 text-white border-rose-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:text-sky-500'}`}>REGISTRAR TROCA</button>
               </div>
            </div>
          );
        })}
      </div>
      {isOilModalOpen && <Modal title="CONFIRMAR TROCA DE ÓLEO" onClose={() => setIsOilModalOpen(false)}>
        <form onSubmit={(e) => { e.preventDefault(); onUpdateMaintenance({ id: crypto.randomUUID(), veiculo_id: oilForm.veiculo_id, funcionario_id: oilForm.funcionario_id, tipo: 'Preventiva', servico: 'TROCA DE ÓLEO', data: oilForm.data, km_registro: vehicles.find((v:any)=>v.id===oilForm.veiculo_id)?.km_atual, custo: oilForm.custo, pago: oilForm.pago }); setIsOilModalOpen(false); }} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Responsável</label><select className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white" value={oilForm.funcionario_id} onChange={e => setOilForm({...oilForm, funcionario_id: e.target.value})} required><option value="">SELECIONAR...</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Data</label><input type="date" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white" value={oilForm.data} onChange={e => setOilForm({...oilForm, data: e.target.value})} required /></div>
              <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Custo R$</label><input type="number" step="0.01" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white" value={oilForm.custo} onChange={e => setOilForm({...oilForm, custo: parseFloat(e.target.value) || 0})} required /></div>
            </div>
          </div>
          <button type="submit" className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase">CONFIRMAR TROCA</button>
        </form>
      </Modal>}
      {isOpen && <Modal title="DADOS DO VEÍCULO" onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSave} className="space-y-5">
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Placa</label><input placeholder="PLACA" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs uppercase dark:text-white" value={form.placa} onChange={e => setForm({...form, placa: e.target.value.toUpperCase()})} required /></div>
             <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Ano</label><input placeholder="ANO" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white" value={form.ano} onChange={e => setForm({...form, ano: e.target.value})} required /></div>
           </div>
           <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Modelo</label><input placeholder="MODELO" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs uppercase dark:text-white" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value.toUpperCase()})} required /></div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">KM Atual</label><input type="number" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white" value={form.km_atual || 0} onChange={e => setForm({...form, km_atual: parseInt(e.target.value) || 0})} /></div>
              <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">KM Óleo</label><input type="number" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white" value={form.km_ultima_troca || 0} onChange={e => setForm({...form, km_ultima_troca: parseInt(e.target.value) || 0})} /></div>
           </div>
           <button className="w-full h-14 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black uppercase shadow-xl dark:shadow-none">SALVAR</button>
        </form>
      </Modal>}
    </div>
  );
};

const FuelTab = ({ logs, vehicles, employees, onUpdate, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<FuelLog>>({ data: new Date().toISOString().split('T')[0], tipo_combustivel: '', km_registro: 0, litros: 0, valor_litro: 0, funcionario_id: '' });
  const handleSave = (e: React.FormEvent) => { e.preventDefault(); const l = parseFloat(String(form.litros || 0)); const v = parseFloat(String(form.valor_litro || 0)); onUpdate({ ...form, id: form.id || crypto.randomUUID(), valor_total: l * v, km_registro: Number(form.km_registro) || 0, tipo_combustivel: form.tipo_combustivel.toUpperCase() } as FuelLog); setIsOpen(false); };
  return (
    <div className="space-y-4 px-1">
      <div className="flex justify-end no-print"><button onClick={() => setIsOpen(true)} className="bg-emerald-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase shadow-xl dark:shadow-none">ABASTECER</button></div>
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-none">
        <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-950 text-[8px] sm:text-[9px] font-black uppercase text-slate-400 dark:text-slate-600"><tr><th className="px-4 sm:px-6 py-4 sm:py-5">DATA</th><th className="px-4 sm:px-6 py-4 sm:py-5">VEÍCULO</th><th className="px-4 sm:px-6 py-4 sm:py-5">LITROS</th><th className="px-4 sm:px-6 py-4 sm:py-5">TOTAL</th><th className="px-4 sm:px-6 py-4 sm:py-5 no-print text-center">AÇÃO</th></tr></thead><tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-[10px] sm:text-xs font-black">
        {logs.map((l: FuelLog) => (<tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"><td className="px-4 sm:px-6 py-3 sm:py-4 dark:text-slate-300">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td><td className="px-4 sm:px-6 py-3 sm:py-4 dark:text-slate-300">{vehicles.find((v:any) => v.id === l.veiculo_id)?.placa.toUpperCase()}</td><td className="px-4 sm:px-6 py-3 sm:py-4 dark:text-slate-300">{l.litros}L</td><td className="px-4 sm:px-6 py-3 sm:py-4 text-emerald-600">R${l.valor_total.toLocaleString()}</td><td className="px-4 sm:px-6 py-3 sm:py-4 no-print text-center"><button onClick={() => onDelete(l.id)} className="text-slate-300 dark:text-slate-700 hover:text-rose-500 transition-all"><Trash2 size={16}/></button></td></tr>))}
        </tbody></table></div>
      </div>
      {isOpen && <Modal title="LANÇAR ABASTECIMENTO" onClose={() => setIsOpen(false)}><form onSubmit={handleSave} className="space-y-5">
        <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Veículo</label><select className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white" value={form.veiculo_id} onChange={e => setForm({...form, veiculo_id: e.target.value, km_registro: vehicles.find((v:any)=>v.id===e.target.value)?.km_atual || 0})} required><option value="">SELECIONAR...</option>{vehicles.map((v:any) => <option key={v.id} value={v.id}>{v.placa}</option>)}</select></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Litros</label><input type="number" step="0.01" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white" value={form.litros} onChange={e => setForm({...form, litros: parseFloat(e.target.value) || 0})} required /></div>
          <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Preço R$</label><input type="number" step="0.01" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white" value={form.valor_litro} onChange={e => setForm({...form, valor_litro: parseFloat(e.target.value) || 0})} required /></div>
        </div>
        <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">KM Atual</label><input type="number" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white" value={form.km_registro} onChange={e => setForm({...form, km_registro: parseInt(e.target.value) || 0})} required /></div>
        <button className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase">CONFIRMAR</button>
      </form></Modal>}
    </div>
  );
};

const MaintenanceTab = ({ logs, vehicles, employees, onUpdate, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<MaintenanceLog>>({ tipo: 'Preventiva', data: new Date().toISOString().split('T')[0], pago: true, funcionario_id: '' });
  const handleSave = (e: React.FormEvent) => { e.preventDefault(); onUpdate({ ...form, id: form.id || crypto.randomUUID(), custo: Number(form.custo) || 0, km_registro: vehicles.find((v:any)=>v.id===form.veiculo_id)?.km_atual || 0, servico: form.servico?.toUpperCase() } as MaintenanceLog); setIsOpen(false); };
  return (
    <div className="space-y-4 px-1">
      <div className="flex justify-end no-print"><button onClick={() => setIsOpen(true)} className="bg-indigo-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase shadow-xl dark:shadow-none">MANUTENÇÃO</button></div>
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-none">
        <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-950 text-[8px] sm:text-[9px] font-black uppercase text-slate-400 dark:text-slate-600"><tr><th className="px-4 sm:px-6 py-4 sm:py-5">DATA</th><th className="px-4 sm:px-6 py-4 sm:py-5">SERVIÇO</th><th className="px-4 sm:px-6 py-4 sm:py-5 text-right">VALOR</th><th className="px-4 sm:px-6 py-4 sm:py-5 no-print text-center">AÇÃO</th></tr></thead><tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-[10px] sm:text-xs font-black">
        {logs.map((l: MaintenanceLog) => (<tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"><td className="px-4 sm:px-6 py-3 sm:py-4 dark:text-slate-300">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td><td className="px-4 sm:px-6 py-3 sm:py-4 uppercase dark:text-slate-300">{l.servico}</td><td className="px-4 sm:px-6 py-3 sm:py-4 text-rose-500 text-right">R${l.custo.toLocaleString()}</td><td className="px-4 sm:px-6 py-3 sm:py-4 no-print text-center"><button onClick={() => onDelete(l.id)} className="text-slate-300 dark:text-slate-700 hover:text-rose-500 transition-all"><Trash2 size={16}/></button></td></tr>))}
        </tbody></table></div>
      </div>
      {isOpen && <Modal title="LANÇAR MANUTENÇÃO" onClose={() => setIsOpen(false)}><form onSubmit={handleSave} className="space-y-5">
        <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Veículo</label><select className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white" value={form.veiculo_id} onChange={e => setForm({...form, veiculo_id: e.target.value})} required><option value="">SELECIONAR...</option>{vehicles.map((v:any) => <option key={v.id} value={v.id}>{v.placa}</option>)}</select></div>
        <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Serviço</label><input className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs uppercase dark:text-white" value={form.servico} onChange={e => setForm({...form, servico: e.target.value.toUpperCase()})} required /></div>
        <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Valor R$</label><input type="number" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white" value={form.custo} onChange={e => setForm({...form, custo: parseFloat(e.target.value) || 0})} required /></div>
        <button className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase">SALVAR</button>
      </form></Modal>}
    </div>
  );
};

const FinesTab = ({ logs, vehicles, employees, onUpdate, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<FineLog>>({ situacao: 'Em aberto', data: new Date().toISOString().split('T')[0], data_vencimento: new Date().toISOString().split('T')[0], funcionario_id: '' });
  const handleSave = (e: React.FormEvent) => { e.preventDefault(); onUpdate({ ...form, id: form.id || crypto.randomUUID(), tipo_infracao: form.tipo_infracao?.toUpperCase() } as FineLog); setIsOpen(false); };
  return (
    <div className="space-y-4 px-1">
      <div className="flex justify-end no-print"><button onClick={() => setIsOpen(true)} className="bg-rose-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase shadow-xl dark:shadow-none">MULTA</button></div>
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-none">
        <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-950 text-[8px] sm:text-[9px] font-black uppercase text-slate-400 dark:text-slate-600"><tr><th className="px-4 sm:px-6 py-4 sm:py-5">DATA</th><th className="px-4 sm:px-6 py-4 sm:py-5">INFRAÇÃO</th><th className="px-4 sm:px-6 py-4 sm:py-5 text-right">VALOR</th><th className="px-4 sm:px-6 py-4 sm:py-5 no-print text-center">AÇÃO</th></tr></thead><tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-[10px] sm:text-xs font-black">
        {logs.map((l: FineLog) => (<tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"><td className="px-4 sm:px-6 py-3 sm:py-4 dark:text-slate-300">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td><td className="px-4 sm:px-6 py-3 sm:py-4 uppercase dark:text-slate-300">{l.tipo_infracao}</td><td className="px-4 sm:px-6 py-3 sm:py-4 text-rose-500 text-right">R${l.valor.toLocaleString()}</td><td className="px-4 sm:px-6 py-3 sm:py-4 no-print text-center"><button onClick={() => onDelete(l.id)} className="text-slate-300 dark:text-slate-700 hover:text-rose-500 transition-all"><Trash2 size={16}/></button></td></tr>))}
        </tbody></table></div>
      </div>
      {isOpen && <Modal title="LANÇAR MULTA" onClose={() => setIsOpen(false)}><form onSubmit={handleSave} className="space-y-5">
        <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Veículo</label><select className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white" value={form.veiculo_id} onChange={e => setForm({...form, veiculo_id: e.target.value})} required><option value="">SELECIONAR...</option>{vehicles.map((v:any) => <option key={v.id} value={v.id}>{v.placa}</option>)}</select></div>
        <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Infração</label><input className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs uppercase dark:text-white" value={form.tipo_infracao} onChange={e => setForm({...form, tipo_infracao: e.target.value.toUpperCase()})} required /></div>
        <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Valor R$</label><input type="number" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white" value={form.valor} onChange={e => setForm({...form, valor: parseFloat(e.target.value) || 0})} required /></div>
        <button className="w-full h-14 bg-rose-500 text-white rounded-2xl font-black uppercase">LANÇAR</button>
      </form></Modal>}
    </div>
  );
};

const Modal = ({ title, children, onClose }: any) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300 no-print transition-all">
    <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/95 backdrop-blur-sm" onClick={onClose} />
    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl dark:shadow-none border border-transparent dark:border-slate-800 relative overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-6 sm:mb-8 border-b border-slate-50 dark:border-slate-800 pb-4 sm:pb-6">
        <h3 className="text-base sm:text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{title}</h3>
        <button onClick={onClose} className="p-2 text-slate-300 dark:text-slate-700 hover:text-rose-500 transition-colors"><X size={20} className="sm:size-6" /></button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto pr-1 no-scrollbar">{children}</div>
    </div>
  </div>
);

export default FleetView;
