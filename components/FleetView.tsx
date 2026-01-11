
import React, { useState, useMemo } from 'react';
import { 
  Truck, Car, Bike, Plus, Trash2, Fuel, Wrench, AlertOctagon, 
  BarChart3, X, CheckCircle2, AlertTriangle, Droplets, Pencil, Save, AlertCircle, User,
  ChevronLeft, ChevronRight, Calendar, Gauge, ArrowRight, TrendingUp, Search, Info, Printer,
  DollarSign, Activity, History, PieChart, ArrowUpRight, Navigation, UserCircle
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
  vehicles = [], employees = [], fuelLogs = [], maintenanceLogs = [], fineLogs = [],
  onUpdateVehicle, onDeleteVehicle, onUpdateFuel, onDeleteFuel, 
  onUpdateMaintenance, onDeleteMaintenance, onUpdateFine, onDeleteFine 
}) => {
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

  const [activeTab, setActiveTab] = useState<TabType>('vehicles');
  
  // Estados de Filtro por Intervalo
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getLastDayOfMonth());
  const [searchTerm, setSearchTerm] = useState('');

  const handleShortcutToday = () => {
    setStartDate(getTodayString());
    setEndDate(getTodayString());
  };

  const handleShortcutMonth = () => {
    setStartDate(getFirstDayOfMonth());
    setEndDate(getLastDayOfMonth());
  };

  // Lógica de Filtro baseada no Intervalo
  const filteredFuel = useMemo(() => (fuelLogs || []).filter(l => {
    const matchesDate = l.data >= startDate && l.data <= endDate;
    const vehicle = vehicles.find(v => v.id === l.veiculo_id);
    const matchesSearch = !searchTerm || vehicle?.placa.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDate && matchesSearch;
  }), [fuelLogs, startDate, endDate, searchTerm, vehicles]);

  const filteredMaint = useMemo(() => (maintenanceLogs || []).filter(l => {
    const matchesDate = l.data >= startDate && l.data <= endDate;
    const vehicle = vehicles.find(v => v.id === l.veiculo_id);
    const matchesSearch = !searchTerm || 
      vehicle?.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.servico.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDate && matchesSearch;
  }), [maintenanceLogs, startDate, endDate, searchTerm, vehicles]);

  const filteredFines = useMemo(() => (fineLogs || []).filter(l => {
    const matchesDate = l.data >= startDate && l.data <= endDate;
    const vehicle = vehicles.find(v => v.id === l.veiculo_id);
    const matchesSearch = !searchTerm || vehicle?.placa.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDate && matchesSearch;
  }), [fineLogs, startDate, endDate, searchTerm, vehicles]);

  const stats = useMemo(() => {
    const totalV = vehicles?.length || 0;
    const totalFuel = filteredFuel.reduce((sum, l) => sum + (l.valor_total || 0), 0);
    const totalMaint = filteredMaint.reduce((sum, l) => sum + (l.custo || 0), 0);
    const totalFines = filteredFines.reduce((sum, l) => sum + (l.valor || 0), 0);
    const oilAlerts = (vehicles || []).filter(v => ((v.km_atual || 0) - (v.km_ultima_troca || 0)) >= 1000).length;

    // Cálculo de KM total rodado pela frota no período
    let totalKmPeriod = 0;
    vehicles.forEach(v => {
      const vFuelKms = filteredFuel.filter(l => l.veiculo_id === v.id).map(l => l.km_registro);
      const vMaintKms = filteredMaint.filter(l => l.veiculo_id === v.id).map(l => l.km_registro);
      const allKms = [...vFuelKms, ...vMaintKms].filter(km => km > 0);
      if (allKms.length > 1) {
        totalKmPeriod += (Math.max(...allKms) - Math.min(...allKms));
      }
    });

    return { 
      totalV, 
      totalFuel, 
      totalMaint, 
      totalFines, 
      oilAlerts, 
      totalPeriod: totalFuel + totalMaint + totalFines,
      totalKmPeriod
    };
  }, [vehicles, filteredFuel, filteredMaint, filteredFines]);

  const showFilterBar = ['fuel', 'maintenance', 'fines', 'reports'].includes(activeTab);

  return (
    <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-20 uppercase transition-colors">
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none no-print">
        <div className="flex items-center gap-3 sm:gap-5 w-full md:w-auto">
          <div className="w-10 h-10 sm:w-16 sm:h-16 bg-slate-900 dark:bg-slate-800 rounded-xl sm:rounded-[1.8rem] flex items-center justify-center text-white shadow-lg dark:shadow-none shrink-0">
            <Truck size={20} className="sm:size-8" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-3xl font-black text-slate-800 dark:text-white tracking-normal leading-none uppercase truncate">
              CONTROLE <span className="mx-1">DE</span> <span className="text-[#5ecce3]">FROTA</span>
            </h2>
            <p className="text-[8px] font-black text-slate-400 mt-1 tracking-widest">LOGÍSTICA E MANUTENÇÃO</p>
          </div>
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl sm:rounded-[1.8rem] w-full md:w-auto overflow-x-auto no-scrollbar border border-slate-200 dark:border-slate-800">
          {[
            { id: 'vehicles', label: 'VEÍCULOS', icon: Truck },
            { id: 'fuel', label: 'ABASTEC.', icon: Fuel },
            { id: 'maintenance', label: 'OFICINA', icon: Wrench },
            { id: 'fines', label: 'MULTAS', icon: AlertOctagon },
            { id: 'reports', label: 'RESUMO', icon: BarChart3 },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)} className={`flex-1 flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-[1.4rem] text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[#5ecce3] text-white shadow-sm' : 'text-slate-400 dark:text-slate-600 hover:text-slate-700'}`}>
              <tab.icon size={12} className="sm:size-3.5" /> <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Modern Compact Range Filter Bar */}
      {showFilterBar && (
        <div className="flex flex-col lg:flex-row gap-3 bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm no-print animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-11 border border-slate-100 dark:border-slate-800">
              <span className="text-[8px] font-black text-slate-400 mr-2 uppercase">DE</span>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-700 dark:text-slate-200 w-full" />
            </div>
            <ArrowRight size={14} className="text-slate-300 shrink-0" />
            <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-11 border border-slate-100 dark:border-slate-800">
              <span className="text-[8px] font-black text-slate-400 mr-2 uppercase">ATÉ</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-700 dark:text-slate-200 w-full" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button onClick={handleShortcutToday} className="px-3 h-9 rounded-lg text-[8px] font-black uppercase hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-all">Hoje</button>
              <button onClick={handleShortcutMonth} className="px-3 h-9 rounded-lg text-[8px] font-black uppercase hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-all">Mês</button>
            </div>
            <div className="relative flex-1 lg:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input type="text" placeholder="FILTRAR PLACA..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-11 pl-9 pr-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-sky-50/20 dark:text-white" />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500"><X size={14} /></button>}
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'reports' && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 no-print px-1 sm:px-0">
          <SummaryCard label="VEÍCULOS" value={stats.totalV} icon={Truck} color="sky" />
          <SummaryCard label="GASOLINA" value={`R$ ${stats.totalFuel.toLocaleString('pt-BR')}`} icon={Fuel} color="emerald" />
          <SummaryCard label="OFICINA" value={`R$ ${stats.totalMaint.toLocaleString('pt-BR')}`} icon={Wrench} color="indigo" />
          <SummaryCard label="MULTAS" value={`R$ ${stats.totalFines.toLocaleString('pt-BR')}`} icon={AlertOctagon} color="rose" />
          <SummaryCard label="ÓLEO CRÍTICO" value={stats.oilAlerts} icon={Droplets} color="amber" isFullOnMobile />
        </div>
      )}

      <div className="px-1 sm:px-0">
        {activeTab === 'vehicles' && <VehiclesTab vehicles={vehicles} employees={employees} onUpdate={onUpdateVehicle} onUpdateMaintenance={onUpdateMaintenance} onDelete={onDeleteVehicle} />}
        {activeTab === 'fuel' && <FuelTab logs={filteredFuel} vehicles={vehicles} employees={employees} onUpdate={onUpdateFuel} onDelete={onDeleteFuel} />}
        {activeTab === 'maintenance' && <MaintenanceTab logs={filteredMaint} vehicles={vehicles} employees={employees} onUpdate={onUpdateMaintenance} onDelete={onDeleteMaintenance} />}
        {activeTab === 'fines' && <FinesTab logs={filteredFines} vehicles={vehicles} employees={employees} onUpdate={onUpdateFine} onDelete={onDeleteFine} />}
        {activeTab === 'reports' && <ReportsTab 
          vehicles={vehicles} 
          fuelLogs={filteredFuel} 
          maintenanceLogs={filteredMaint} 
          fineLogs={filteredFines} 
          stats={stats}
          startDate={startDate}
          endDate={endDate}
        />}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon, color, isFullOnMobile }: any) => {
  const colorMap: Record<string, string> = { sky: "bg-sky-50 dark:bg-sky-900/20 text-sky-500", emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500", indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500", rose: "bg-rose-50 dark:bg-rose-900/20 text-rose-500", amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-500" };
  return (
    <div className={`bg-white dark:bg-slate-900 p-3 sm:p-6 rounded-[1.2rem] sm:rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none flex items-center gap-2 sm:gap-4 ${isFullOnMobile ? 'col-span-2 sm:col-span-1' : ''}`}>
      <div className={`w-8 h-8 sm:w-12 sm:h-12 ${colorMap[color] || 'bg-slate-50 text-slate-500'} rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0`}><Icon size={16} className="sm:size-6" /></div>
      <div className="min-w-0"><p className="text-[7px] sm:text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-0.5 truncate">{label}</p><h4 className="text-xs sm:lg font-black text-slate-800 dark:text-slate-100 truncate">{value}</h4></div>
    </div>
  );
};

const VehiclesTab = ({ vehicles, employees, onUpdate, onDelete, onUpdateMaintenance }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOilModalOpen, setIsOilModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Vehicle>>({ tipo: 'Caminhão', km_atual: 0, km_ultima_troca: 0, tipo_combustivel: 'FLEX', motorista_id: '' });
  const [oilForm, setOilForm] = useState({ veiculo_id: '', custo: 0, pago: true, data: new Date().toISOString().split('T')[0], funcionario_id: '' });

  // Somente motoristas ativos para o formulário de veículo
  const activeEmployees = useMemo(() => employees.filter((e: Employee) => e.status === 'ATIVO'), [employees]);

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

  const getDriverName = (id?: string) => employees.find((e: Employee) => e.id === id)?.name || 'NÃO ATRIBUÍDO';

  return (
    <div className="space-y-4">
      <div className="flex justify-end no-print px-1"><button onClick={() => { setForm({ tipo: 'Caminhão', km_atual: 0, km_ultima_troca: 0, tipo_combustivel: 'FLEX', motorista_id: '' }); setIsOpen(true); }} className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase shadow-xl dark:shadow-none">NOVO VEÍCULO</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-1 sm:px-0">
        {sortedVehicles.map((v: Vehicle) => {
          const kmSinceOil = (v.km_atual || 0) - (v.km_ultima_troca || 0);
          const needsOilChange = kmSinceOil >= 1000;
          const assignedDriver = employees.find((e: Employee) => e.id === v.motorista_id);
          
          return (
            <div key={v.id} className={`bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border ${needsOilChange ? 'border-rose-200 dark:border-rose-900' : 'border-slate-100 dark:border-slate-800'} relative overflow-hidden group transition-all`}>
               <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 ${needsOilChange ? 'bg-rose-500 text-white shadow-xl dark:shadow-none animate-pulse' : 'bg-sky-50 dark:bg-sky-900/20 text-sky-500'} rounded-xl sm:rounded-2xl flex items-center justify-center transition-all`}>
                    {v.tipo === 'Caminhão' ? <Truck size={24} /> : v.tipo === 'Moto' ? <Bike size={24} /> : <Car size={24} />}
                  </div>
                  <div className="flex gap-2 no-print transition-opacity">
                     <button onClick={() => { setForm(v); setIsOpen(true); }} className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-950 text-slate-300 dark:text-slate-700 hover:text-sky-500 rounded-lg sm:rounded-xl transition-all"><Pencil size={16} /></button>
                     <button onClick={() => onDelete(v.id)} className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-950 text-slate-300 dark:text-slate-700 hover:text-rose-500 rounded-lg sm:rounded-xl transition-all"><Trash2 size={16} /></button>
                  </div>
               </div>
               <h4 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter truncate">{v.modelo.toUpperCase()}</h4>
               <div className="flex flex-wrap items-center gap-2 mt-2">
                 <span className="inline-block font-mono text-[10px] font-black text-[#5ecce3] bg-sky-50 dark:bg-sky-950/30 px-2 sm:px-3 py-1 rounded-lg border border-sky-100 dark:border-sky-900/30 uppercase">{v.placa.toUpperCase()}</span>
                 {assignedDriver && (
                   <span className={`flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 text-[8px] font-black uppercase ${assignedDriver.status === 'INATIVO' ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                     <UserCircle size={12} className={assignedDriver.status === 'INATIVO' ? 'text-slate-200' : 'text-[#5ecce3]'} /> {assignedDriver.name} {assignedDriver.status === 'INATIVO' ? '(INATIVO)' : ''}
                   </span>
                 )}
               </div>
               <div className={`mt-6 sm:mt-8 p-4 rounded-2xl border transition-all ${needsOilChange ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800'}`}>
                  <p className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest ${needsOilChange ? 'text-rose-600' : 'text-slate-400 dark:text-slate-600'}`}>KM ÓLEO ({kmSinceOil} / 1000)</p>
                  <button onClick={() => { setOilForm({...oilForm, veiculo_id: v.id}); setIsOilModalOpen(true); }} className={`mt-2 w-full py-2 border rounded-lg text-[7px] sm:text-[8px] font-black uppercase transition-all no-print ${needsOilChange ? 'bg-rose-600 text-white border-rose-700' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:text-[#5ecce3]'}`}>REGISTRAR TROCA</button>
               </div>
            </div>
          );
        })}
      </div>
      {isOilModalOpen && <Modal title="CONFIRMAR TROCA DE ÓLEO" onClose={() => setIsOilModalOpen(false)}>
        <form onSubmit={(e) => { e.preventDefault(); onUpdateMaintenance({ id: crypto.randomUUID(), veiculo_id: oilForm.veiculo_id, funcionario_id: oilForm.funcionario_id, tipo: 'Preventiva', servico: 'TROCA DE ÓLEO', data: oilForm.data, km_registro: vehicles.find((v:any)=>v.id===oilForm.veiculo_id)?.km_atual, custo: oilForm.custo, pago: oilForm.pago }); setIsOilModalOpen(false); }} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Responsável</label><select className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white outline-none" value={oilForm.funcionario_id} onChange={e => setOilForm({...oilForm, funcionario_id: e.target.value})} required><option value="">SELECIONAR...</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name} {e.status === 'INATIVO' ? '(INATIVO)' : ''}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Data</label><input type="date" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white outline-none" value={oilForm.data} onChange={e => setOilForm({...oilForm, data: e.target.value})} required /></div>
              <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Custo R$</label><input type="number" step="0.01" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white outline-none" value={oilForm.custo} onChange={e => setOilForm({...oilForm, custo: parseFloat(e.target.value) || 0})} required /></div>
            </div>
          </div>
          <button type="submit" className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase shadow-lg active:scale-95 transition-all">CONFIRMAR TROCA</button>
        </form>
      </Modal>}
      {isOpen && <Modal title="DADOS DO VEÍCULO" onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSave} className="space-y-5">
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Placa</label><input placeholder="PLACA" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs uppercase dark:text-white outline-none" value={form.placa} onChange={e => setForm({...form, placa: e.target.value.toUpperCase()})} required /></div>
             <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Ano</label><input placeholder="ANO" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white outline-none" value={form.ano} onChange={e => setForm({...form, ano: e.target.value})} required /></div>
           </div>
           <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Modelo</label><input placeholder="MODELO" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs uppercase dark:text-white outline-none" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value.toUpperCase()})} required /></div>
           <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Motorista Padrão</label><select className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs uppercase dark:text-white outline-none" value={form.motorista_id || ''} onChange={e => setForm({...form, motorista_id: e.target.value})}><option value="">NÃO ATRIBUÍDO</option>{activeEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">KM Atual</label><input type="number" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white outline-none" value={form.km_atual || 0} onChange={e => setForm({...form, km_atual: parseInt(e.target.value) || 0})} /></div>
              <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">KM Óleo</label><input type="number" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white outline-none" value={form.km_ultima_troca || 0} onChange={e => setForm({...form, km_ultima_troca: parseInt(e.target.value) || 0})} /></div>
           </div>
           <button className="w-full h-14 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black uppercase shadow-xl active:scale-95 transition-all">SALVAR DADOS</button>
        </form>
      </Modal>}
    </div>
  );
};

const FuelTab = ({ logs = [], vehicles = [], employees = [], onUpdate, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<FuelLog>>({ data: new Date().toISOString().split('T')[0], tipo_combustivel: '', km_registro: 0, litros: 0, valor_litro: 0, funcionario_id: '' });
  const handleSave = (e: React.FormEvent) => { e.preventDefault(); const l = parseFloat(String(form.litros || 0)); const v = parseFloat(String(form.valor_litro || 0)); onUpdate({ ...form, id: form.id || crypto.randomUUID(), valor_total: l * v, km_registro: Number(form.km_registro) || 0, tipo_combustivel: (form.tipo_combustivel || '').toUpperCase() } as FuelLog); setIsOpen(false); };
  return (
    <div className="space-y-4 px-1">
      <div className="flex justify-end no-print"><button onClick={() => setIsOpen(true)} className="bg-emerald-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase shadow-xl">NOVA ABASTECIMENTO</button></div>
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-950 text-[8px] sm:text-[9px] font-black uppercase text-slate-400 dark:text-slate-600"><tr><th className="px-4 sm:px-6 py-4 sm:py-5">DATA</th><th className="px-4 sm:px-6 py-4 sm:py-5">VEÍCULO</th><th className="px-4 sm:px-6 py-4 sm:py-5">KM</th><th className="px-4 sm:px-6 py-4 sm:py-5">LITROS</th><th className="px-4 sm:px-6 py-4 sm:py-5">TOTAL</th><th className="px-4 sm:px-6 py-4 sm:py-5 no-print text-center">AÇÃO</th></tr></thead><tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-[10px] sm:text-xs font-black">
        {logs.length === 0 ? (
          <tr><td colSpan={6} className="py-20 text-center text-slate-300 dark:text-slate-700 uppercase tracking-widest font-black text-[10px]">Nenhum registro no intervalo</td></tr>
        ) : logs.map((l: FuelLog) => (<tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"><td className="px-4 sm:px-6 py-3 sm:py-4 dark:text-slate-300">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td><td className="px-4 sm:px-6 py-3 sm:py-4 dark:text-slate-300">{vehicles.find((v:any) => v.id === l.veiculo_id)?.placa.toUpperCase() || '---'}</td><td className="px-4 sm:px-6 py-3 sm:py-4 dark:text-slate-400 text-[9px]">{l.km_registro} km</td><td className="px-4 sm:px-6 py-3 sm:py-4 dark:text-slate-300">{l.litros}L</td><td className="px-4 sm:px-6 py-3 sm:py-4 text-emerald-600">R${(l.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td className="px-4 sm:px-6 py-3 sm:py-4 no-print text-center"><button onClick={() => onDelete(l.id)} className="text-slate-300 dark:text-slate-700 hover:text-rose-500 transition-all"><Trash2 size={16}/></button></td></tr>))}
        </tbody></table></div>
      </div>
      {isOpen && <Modal title="LANÇAR ABASTECIMENTO" onClose={() => setIsOpen(false)}><form onSubmit={handleSave} className="space-y-5">
        <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Veículo</label><select className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white outline-none" value={form.veiculo_id} onChange={e => setForm({...form, veiculo_id: e.target.value, km_registro: vehicles.find((v:any)=>v.id===e.target.value)?.km_atual || 0})} required><option value="">SELECIONAR...</option>{vehicles.map((v:any) => <option key={v.id} value={v.id}>{v.placa}</option>)}</select></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Litros</label><input type="number" step="0.01" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white outline-none" value={form.litros} onChange={e => setForm({...form, litros: parseFloat(e.target.value) || 0})} required /></div>
          <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Preço R$</label><input type="number" step="0.01" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white outline-none" value={form.valor_litro} onChange={e => setForm({...form, valor_litro: parseFloat(e.target.value) || 0})} required /></div>
        </div>
        <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">KM Atual</label><input type="number" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white outline-none" value={form.km_registro} onChange={e => setForm({...form, km_registro: parseInt(e.target.value) || 0})} required /></div>
        <button className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase shadow-lg active:scale-95">CONFIRMAR LANÇAMENTO</button>
      </form></Modal>}
    </div>
  );
};

const MaintenanceTab = ({ logs = [], vehicles = [], employees = [], onUpdate, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  // Fixed toISOString() on array error
  const [form, setForm] = useState<Partial<MaintenanceLog>>({ tipo: 'Preventiva', data: new Date().toISOString().split('T')[0], pago: true, funcionario_id: '' });
  const handleSave = (e: React.FormEvent) => { e.preventDefault(); onUpdate({ ...form, id: form.id || crypto.randomUUID(), custo: Number(form.custo) || 0, km_registro: vehicles.find((v:any)=>v.id===form.veiculo_id)?.km_atual || 0, servico: (form.servico || '').toUpperCase() } as MaintenanceLog); setIsOpen(false); };
  return (
    <div className="space-y-4 px-1">
      <div className="flex justify-end no-print"><button onClick={() => setIsOpen(true)} className="bg-indigo-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase shadow-xl">NOVA MANUTENÇÃO</button></div>
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-950 text-[8px] sm:text-[9px] font-black uppercase text-slate-400 dark:text-slate-600"><tr><th className="px-4 sm:px-6 py-4 sm:py-5">DATA</th><th className="px-4 sm:px-6 py-4 sm:py-5">SERVIÇO</th><th className="px-4 sm:px-6 py-4 sm:py-5">KM</th><th className="px-4 sm:px-6 py-4 sm:py-5 text-right">VALOR</th><th className="px-4 sm:px-6 py-4 sm:py-5 no-print text-center">AÇÃO</th></tr></thead><tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-[10px] sm:text-xs font-black">
        {logs.length === 0 ? (
          <tr><td colSpan={5} className="py-20 text-center text-slate-300 dark:text-slate-700 uppercase tracking-widest font-black text-[10px]">Nenhum registro no intervalo</td></tr>
        ) : logs.map((l: MaintenanceLog) => (<tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"><td className="px-4 sm:px-6 py-3 sm:py-4 dark:text-slate-300">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td><td className="px-4 sm:px-6 py-3 sm:py-4 uppercase dark:text-slate-300">{l.servico}</td><td className="px-4 sm:px-6 py-3 sm:py-4 dark:text-slate-400 text-[9px]">{l.km_registro} km</td><td className="px-4 sm:px-6 py-3 sm:py-4 text-rose-500 text-right">R${(l.custo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td className="px-4 sm:px-6 py-3 sm:py-4 no-print text-center"><button onClick={() => onDelete(l.id)} className="text-slate-300 dark:text-slate-700 hover:text-rose-500 transition-all"><Trash2 size={16}/></button></td></tr>))}
        </tbody></table></div>
      </div>
      {isOpen && <Modal title="LANÇAR MANUTENÇÃO" onClose={() => setIsOpen(false)}><form onSubmit={handleSave} className="space-y-5">
        <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Veículo</label><select className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white outline-none" value={form.veiculo_id} onChange={e => setForm({...form, veiculo_id: e.target.value})} required><option value="">SELECIONAR...</option>{vehicles.map((v:any) => <option key={v.id} value={v.id}>{v.placa}</option>)}</select></div>
        <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Serviço</label><input className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs uppercase dark:text-white outline-none" value={form.servico} onChange={e => setForm({...form, servico: e.target.value.toUpperCase()})} required /></div>
        <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Valor R$</label><input type="number" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white outline-none" value={form.custo} onChange={e => setForm({...form, custo: parseFloat(e.target.value) || 0})} required /></div>
        <button className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase shadow-lg active:scale-95">SALVAR MANUTENÇÃO</button>
      </form></Modal>}
    </div>
  );
};

const FinesTab = ({ logs = [], vehicles = [], employees = [], onUpdate, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  // Fixed toISOString() on array error
  const [form, setForm] = useState<Partial<FineLog>>({ situacao: 'Em aberto', data: new Date().toISOString().split('T')[0], data_vencimento: new Date().toISOString().split('T')[0], funcionario_id: '' });
  const handleSave = (e: React.FormEvent) => { e.preventDefault(); onUpdate({ ...form, id: form.id || crypto.randomUUID(), tipo_infracao: (form.tipo_infracao || '').toUpperCase() } as FineLog); setIsOpen(false); };
  return (
    <div className="space-y-4 px-1">
      <div className="flex justify-end no-print"><button onClick={() => setIsOpen(true)} className="bg-rose-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase shadow-xl">REGISTRAR MULTA</button></div>
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-950 text-[8px] sm:text-[9px] font-black uppercase text-slate-400 dark:text-slate-600"><tr><th className="px-4 sm:px-6 py-4 sm:py-5">DATA</th><th className="px-4 sm:px-6 py-4 sm:py-5">INFRAÇÃO</th><th className="px-4 sm:px-6 py-4 sm:py-5 text-right">VALOR</th><th className="px-4 sm:px-6 py-4 sm:py-5 no-print text-center">AÇÃO</th></tr></thead><tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-[10px] sm:text-xs font-black">
        {logs.length === 0 ? (
          <tr><td colSpan={5} className="py-20 text-center text-slate-300 dark:text-slate-700 uppercase tracking-widest font-black text-[10px]">Nenhum registro no intervalo</td></tr>
        ) : logs.map((l: FineLog) => (<tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"><td className="px-4 sm:px-6 py-3 sm:py-4 dark:text-slate-300">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td><td className="px-4 sm:px-6 py-3 sm:py-4 uppercase dark:text-slate-300">{l.tipo_infracao}</td><td className="px-4 sm:px-6 py-3 sm:py-4 text-rose-500 text-right">R${(l.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td className="px-4 sm:px-6 py-3 sm:py-4 no-print text-center"><button onClick={() => onDelete(l.id)} className="text-slate-300 dark:text-slate-700 hover:text-rose-500 transition-all"><Trash2 size={16}/></button></td></tr>))}
        </tbody></table></div>
      </div>
      {isOpen && <Modal title="LANÇAR MULTA" onClose={() => setIsOpen(false)}><form onSubmit={handleSave} className="space-y-5">
        <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Veículo</label><select className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white outline-none" value={form.veiculo_id} onChange={e => setForm({...form, veiculo_id: e.target.value})} required><option value="">SELECIONAR...</option>{vehicles.map((v:any) => <option key={v.id} value={v.id}>{v.placa}</option>)}</select></div>
        <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Infração</label><input className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs uppercase dark:text-white outline-none" value={form.tipo_infracao} onChange={e => setForm({...form, tipo_infracao: e.target.value.toUpperCase()})} required /></div>
        <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Valor R$</label><input type="number" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white outline-none" value={form.valor} onChange={e => setForm({...form, valor: parseFloat(e.target.value) || 0})} required /></div>
        <button className="w-full h-14 bg-rose-500 text-white rounded-2xl font-black uppercase shadow-lg active:scale-95 transition-all">CONFIRMAR MULTA</button>
      </form></Modal>}
    </div>
  );
};

const ReportsTab = ({ vehicles, fuelLogs, maintenanceLogs, fineLogs, stats, startDate, endDate }: any) => {
  const vehicleCosts = useMemo(() => {
    return vehicles.map((v: Vehicle) => {
      const fuel = fuelLogs.filter((l: FuelLog) => l.veiculo_id === v.id).reduce((sum: number, l: FuelLog) => sum + (l.valor_total || 0), 0);
      const maint = maintenanceLogs.filter((l: MaintenanceLog) => l.veiculo_id === v.id).reduce((sum: number, l: MaintenanceLog) => sum + (l.custo || 0), 0);
      const fines = fineLogs.filter((l: FineLog) => l.veiculo_id === v.id).reduce((sum: number, l: FineLog) => sum + (l.valor || 0), 0);
      const total = fuel + maint + fines;

      // Cálculo de KM rodado pelo veículo no período
      const vFuelKms = fuelLogs.filter((l: FuelLog) => l.veiculo_id === v.id).map((l: FuelLog) => l.km_registro);
      const vMaintKms = maintenanceLogs.filter((l: MaintenanceLog) => l.veiculo_id === v.id).map((l: MaintenanceLog) => l.km_registro);
      const allKms = [...vFuelKms, ...vMaintKms].filter(km => km > 0);
      const kmRodado = allKms.length > 1 ? (Math.max(...allKms) - Math.min(...allKms)) : 0;

      return { ...v, fuel, maint, fines, total, kmRodado };
    }).sort((a: any, b: any) => b.total - a.total);
  }, [vehicles, fuelLogs, maintenanceLogs, fineLogs]);

  const timelineEvents = useMemo(() => {
    const events = [
      ...fuelLogs.map((l: FuelLog) => ({ ...l, eventType: 'combustivel', icon: Fuel, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', label: 'Abastecimento', value: l.valor_total, km: l.km_registro })),
      ...maintenanceLogs.map((l: MaintenanceLog) => ({ ...l, eventType: 'manutencao', icon: Wrench, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30', label: l.servico, value: l.custo, km: l.km_registro })),
      ...fineLogs.map((l: FineLog) => ({ ...l, eventType: 'multa', icon: AlertOctagon, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30', label: 'Infração', value: l.valor, km: null }))
    ].sort((a: any, b: any) => b.data.localeCompare(a.data));
    return events;
  }, [fuelLogs, maintenanceLogs, fineLogs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Resumo Financeiro Superior */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
           <div className="w-full lg:w-1/3 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-center">
              <div className="w-14 h-14 bg-sky-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-sky-200/50 dark:shadow-none"><DollarSign size={28} /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Custo Total da Frota</p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">R$ {stats.totalPeriod.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
              <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-sky-100 dark:bg-sky-900/30 rounded-full">
                 <Navigation size={12} className="text-sky-600 dark:text-sky-400" />
                 <span className="text-[9px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest">{stats.totalKmPeriod.toLocaleString('pt-BR')} KM RODADOS NO PERÍODO</span>
              </div>
              <p className="text-[8px] font-bold text-slate-300 dark:text-slate-600 mt-4 uppercase tracking-[0.2em]">{new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR')} — {new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
           </div>
           <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
              <CostIndicator label="Combustível" value={stats.totalFuel} total={stats.totalPeriod} color="bg-emerald-500" icon={Fuel} />
              <CostIndicator label="Manutenção" value={stats.totalMaint} total={stats.totalPeriod} color="bg-indigo-500" icon={Wrench} />
              <CostIndicator label="Infrações" value={stats.totalFines} total={stats.totalPeriod} color="bg-rose-500" icon={AlertOctagon} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ranking por Veículo */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
           <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center text-slate-400"><PieChart size={20} /></div>
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Ranking de Despesas</h4>
           </div>
           <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar max-h-[500px] pr-2">
              {vehicleCosts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20"><Truck size={48} /><p className="text-[10px] font-black uppercase mt-2">Sem dados</p></div>
              ) : vehicleCosts.map((v: any, idx: number) => {
                const percentage = stats.totalPeriod > 0 ? (v.total / stats.totalPeriod) * 100 : 0;
                return (
                  <div key={v.id} className="group">
                    <div className="flex justify-between items-end mb-2">
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-300">#{idx + 1}</span>
                          <div>
                            <p className="text-xs font-black text-slate-800 dark:text-slate-200 leading-none mb-1">{v.modelo}</p>
                            <div className="flex items-center gap-2">
                               <p className="text-[8px] font-black text-sky-500 bg-sky-50 dark:bg-sky-950 px-1.5 rounded uppercase tracking-widest">{v.placa}</p>
                               {v.kmRodado > 0 && (
                                 <span className="flex items-center gap-1 text-[7px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 rounded uppercase">
                                   <Navigation size={8} /> {v.kmRodado} KM
                                 </span>
                               )}
                            </div>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-slate-900 dark:text-white leading-none">R$ {v.total.toLocaleString('pt-BR')}</p>
                          <p className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-tighter">{percentage.toFixed(1)}% do total</p>
                       </div>
                    </div>
                    <div className="h-2 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-[#5ecce3] rounded-full transition-all duration-1000 group-hover:bg-sky-400" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Histórico Consolidado */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
           <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center text-slate-400"><History size={20} /></div>
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Últimas Atividades</h4>
           </div>
           <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar max-h-[500px] pr-2">
              {timelineEvents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20"><Activity size={48} /><p className="text-[10px] font-black uppercase mt-2">Sem atividade no período</p></div>
              ) : timelineEvents.map((e: any) => (
                <div key={e.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 hover:border-sky-100 dark:hover:border-sky-900/30 transition-all">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${e.bg} ${e.color}`}><e.icon size={18} /></div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                         <h5 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase truncate pr-2">{e.label}</h5>
                         <span className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter whitespace-nowrap">{new Date(e.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                         <div className="flex items-center gap-2">
                            <p className="text-[9px] font-bold text-slate-400 truncate">{vehicles.find(v => v.id === e.veiculo_id)?.placa || '---'}</p>
                            {e.km && <span className="text-[7px] font-black text-slate-300 dark:text-slate-700">• {e.km} KM</span>}
                         </div>
                         <p className="text-[11px] font-black text-slate-700 dark:text-slate-300">R$ {e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const CostIndicator = ({ label, value, total, color, icon: Icon }: any) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${color} text-white flex items-center justify-center shadow-lg dark:shadow-none`}><Icon size={14} /></div>
        <div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">R$ {value.toLocaleString('pt-BR')}</p>
        </div>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
         <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
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
