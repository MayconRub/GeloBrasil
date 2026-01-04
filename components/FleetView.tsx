
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
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-20 uppercase print:space-y-2 print:pb-0">
      
      {/* HEADER COMPACTO PARA MOBILE */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm no-print">
        <div className="flex items-center gap-3 sm:gap-5 w-full md:w-auto">
          <div className="w-10 h-10 sm:w-16 sm:h-16 bg-slate-900 rounded-xl sm:rounded-[1.8rem] flex items-center justify-center text-white shadow-lg shrink-0">
            <Truck size={20} className="sm:size-8" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-3xl font-black text-slate-800 tracking-tighter leading-none uppercase truncate">FROTA <span className="text-sky-500">BRASIL</span></h2>
            <div className="flex items-center gap-1 mt-1">
               <div className="flex items-center bg-slate-100 p-0.5 rounded-lg h-7 no-print">
                  <button onClick={handlePrevMonth} className="p-1 hover:bg-white rounded text-slate-400 transition-all"><ChevronLeft size={12} /></button>
                  <div className="px-2 text-center min-w-[100px]">
                    <p className="text-[8px] font-black text-slate-800">{monthName}</p>
                  </div>
                  <button onClick={handleNextMonth} className="p-1 hover:bg-white rounded text-slate-400 transition-all"><ChevronRight size={12} /></button>
               </div>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO INTERNA MOBILE OTIMIZADA */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl sm:rounded-[1.8rem] w-full md:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'vehicles', label: 'FROTA', icon: Truck },
            { id: 'fuel', label: 'ABAST.', icon: Fuel },
            { id: 'maintenance', label: 'OFICINA', icon: Wrench },
            { id: 'fines', label: 'MULTAS', icon: AlertOctagon },
            { id: 'reports', label: 'CUSTOS', icon: BarChart3 },
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-[1.4rem] text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
            >
              <tab.icon size={12} className="sm:size-3.5" /> <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Cartões de resumo - GRID 2 COLUNAS NO MOBILE E OCULTO NAS OUTRAS ABAS */}
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
        {activeTab === 'reports' && <ReportsTab vehicles={vehicles} fuel={fuelLogs} maints={maintenanceLogs} fines={fineLogs} employees={employees} currentMonth={currentMonth} currentYear={currentYear} monthName={monthName} />}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon, color, isFullOnMobile }: any) => {
  const colorMap: Record<string, string> = {
    sky: "bg-sky-50 text-sky-500",
    emerald: "bg-emerald-50 text-emerald-500",
    indigo: "bg-indigo-50 text-indigo-500",
    rose: "bg-rose-50 text-rose-500",
    amber: "bg-amber-50 text-amber-500"
  };

  return (
    <div className={`bg-white p-3 sm:p-6 rounded-[1.2rem] sm:rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-2 sm:gap-4 ${isFullOnMobile ? 'col-span-2 sm:col-span-1' : ''}`}>
      <div className={`w-8 h-8 sm:w-12 sm:h-12 ${colorMap[color] || 'bg-slate-50 text-slate-500'} rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0`}>
        <Icon size={16} className="sm:size-6" />
      </div>
      <div className="min-w-0">
        <p className="text-[7px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">{label}</p>
        <h4 className="text-xs sm:text-lg font-black text-slate-800 truncate">{value}</h4>
      </div>
    </div>
  );
};

const ReportsTab = ({ vehicles, fuel, maints, fines, employees, currentMonth, currentYear, monthName }: any) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const reportData = useMemo(() => {
    return (vehicles || []).map((v: Vehicle) => {
      const fullVFuel = (fuel || [])
        .filter((l: any) => l.veiculo_id === v.id)
        .sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime());
      
      const fullVMaint = (maints || []).filter((l: any) => l.veiculo_id === v.id);
      const fullVFines = (fines || []).filter((l: any) => l.veiculo_id === v.id);

      const fuelEfficiencyHistory = fullVFuel.map((current, index) => {
        if (index === 0) return { ...current, dist: 0, kml: 0 };
        const prev = fullVFuel[index - 1];
        const dist = current.km_registro - prev.km_registro;
        const kml = dist > 0 && current.litros > 0 ? dist / current.litros : 0;
        return { ...current, dist, kml };
      });

      const fuelEfficiency = fuelEfficiencyHistory.filter(l => {
        const d = new Date(l.data + 'T00:00:00');
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const vMaint = fullVMaint.filter(l => {
        const d = new Date(l.data + 'T00:00:00');
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const vFines = fullVFines.filter(l => {
        const d = new Date(l.data + 'T00:00:00');
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const totalSpentFuel = fuelEfficiency.reduce((sum: number, l: any) => sum + l.valor_total, 0);
      const totalSpentMaint = vMaint.reduce((sum: number, l: any) => sum + l.custo, 0);
      const totalSpentFines = vFines.reduce((sum: number, l: any) => sum + l.valor, 0);
      const totalKmPeriod = fuelEfficiency.reduce((sum: number, l: any) => sum + (l.dist || 0), 0);
      const logsWithKml = fuelEfficiency.filter(f => f.kml > 0);
      const avgKml = logsWithKml.length > 0 ? logsWithKml.reduce((acc, f) => acc + f.kml, 0) / logsWithKml.length : 0;

      return { 
        ...v, 
        fuelEfficiency, 
        vMaint, 
        vFines, 
        totalSpentFuel, 
        totalSpentMaint, 
        totalSpentFines, 
        totalKmPeriod,
        avgKml,
        grandTotal: totalSpentFuel + totalSpentMaint + totalSpentFines
      };
    });
  }, [vehicles, fuel, maints, fines, currentMonth, currentYear]);

  const selectedVehicle = reportData.find(v => v.id === selectedVehicleId);

  return (
    <div className="space-y-6 print:space-y-1">
      {selectedVehicle ? (
        <div className="animate-in slide-in-from-right duration-500 space-y-6 print:space-y-2 pb-10 print:pb-0">
          <div className="flex items-center justify-between no-print px-1">
            <button onClick={() => setSelectedVehicleId(null)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-sky-500 transition-all">
              <ChevronLeft size={16} /> VOLTAR
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase shadow-lg">
              <Printer size={16} /> Imprimir
            </button>
          </div>

          <header className="bg-slate-900 text-white p-6 sm:p-8 print:p-4 rounded-[1.5rem] sm:rounded-[3rem] print:rounded-lg shadow-xl print:shadow-none">
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 print:gap-1">
                <div>
                   <span className="bg-sky-500 text-[8px] px-3 py-1 rounded-full font-black tracking-[0.2em]">{selectedVehicle.placa.toUpperCase()}</span>
                   <h3 className="text-2xl sm:text-4xl print:text-xl font-black tracking-tighter mt-2 print:mt-0">{selectedVehicle.modelo.toUpperCase()}</h3>
                   <p className="text-[10px] print:text-[8px] font-bold text-slate-400 uppercase tracking-widest">RESUMO: {monthName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 print:gap-2 w-full md:w-auto">
                   <div className="bg-white/10 p-3 sm:p-4 print:p-2 rounded-2xl print:rounded-md border border-white/10">
                      <p className="text-[8px] font-black text-sky-400 uppercase tracking-widest">MÉDIA</p>
                      <p className="text-lg sm:text-2xl print:text-base font-black">{selectedVehicle.avgKml.toFixed(2)} KM/L</p>
                   </div>
                   <div className="bg-white/10 p-3 sm:p-4 print:p-2 rounded-2xl print:rounded-md border border-white/10">
                      <p className="text-[8px] font-black text-sky-400 uppercase tracking-widest">TOTAL KM</p>
                      <p className="text-lg sm:text-2xl print:text-base font-black">{selectedVehicle.totalKmPeriod.toLocaleString()} KM</p>
                   </div>
                </div>
             </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:gap-2">
            <div className="lg:col-span-2 space-y-6 print:space-y-2">
              <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] print:rounded-lg border border-slate-100 print:border-slate-300 overflow-hidden">
                <div className="p-4 sm:p-6 print:p-2 border-b border-slate-50 print:border-slate-300 flex items-center gap-2">
                    <Fuel size={18} className="text-emerald-500 print:w-4" />
                    <h4 className="text-[10px] sm:text-[11px] print:text-[8px] font-black uppercase text-slate-800">Abastecimentos</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 print:bg-slate-100 text-[8px] sm:text-[9px] font-black uppercase text-slate-400">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 print:px-2 print:py-1">Data</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 print:px-2 print:py-1">KM Reg.</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 print:px-2 print:py-1">Dist.</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 print:px-2 print:py-1">KML</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 print:px-2 print:py-1 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y print:divide-slate-200 text-[9px] sm:text-[10px] print:text-[7px] font-black text-slate-700">
                      {selectedVehicle.fuelEfficiency.map((l: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 print:px-2 print:py-1">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 print:px-2 print:py-1">{l.km_registro.toLocaleString()}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 print:px-2 print:py-1">{l.dist > 0 ? `${l.dist}` : '--'}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 print:px-2 print:py-1">{l.kml > 0 ? `${l.kml.toFixed(2)}` : '--'}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 print:px-2 print:py-1 text-right text-emerald-600">R$ {l.valor_total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedVehicle.vMaint.length > 0 && (
                <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] print:rounded-lg border border-slate-100 print:border-slate-300 overflow-hidden">
                  <div className="p-4 sm:p-6 print:p-2 border-b border-slate-50 print:border-slate-300 flex items-center gap-2">
                    <Wrench size={18} className="text-indigo-500 print:w-4" />
                    <h4 className="text-[10px] sm:text-[11px] print:text-[8px] font-black uppercase text-slate-800">Oficina</h4>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 print:bg-slate-100 text-[8px] sm:text-[9px] font-black text-slate-400">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 print:px-2 print:py-1">Data</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 print:px-2 print:py-1">Serviço</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 print:px-2 print:py-1 text-right">Custo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y print:divide-slate-200 text-[9px] sm:text-[10px] font-black">
                      {selectedVehicle.vMaint.map((m: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 print:px-2 print:py-1">{new Date(m.data + 'T00:00:00').toLocaleDateString()}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 print:px-2 print:py-1 uppercase truncate max-w-[150px]">{m.servico}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 print:px-2 print:py-1 text-right text-rose-500">R$ {m.custo.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="space-y-6 print:space-y-2">
              <div className="bg-white p-6 sm:p-8 print:p-3 rounded-[1.5rem] sm:rounded-[2.5rem] print:rounded-lg border border-slate-100 print:border-slate-300">
                <h4 className="text-[10px] sm:text-[11px] print:text-[8px] font-black uppercase text-slate-400 mb-4 sm:mb-6 print:mb-2 tracking-widest text-center sm:text-left">Resumo Financeiro</h4>
                <div className="space-y-3 sm:space-y-4 print:space-y-1">
                  <div className="flex justify-between items-end">
                    <p className="text-[8px] sm:text-[9px] print:text-[7px] font-black text-slate-500">ABASTECIMENTOS</p>
                    <p className="text-base sm:text-lg print:text-xs font-black text-emerald-600">R$ {selectedVehicle.totalSpentFuel.toLocaleString()}</p>
                  </div>
                  <div className={`flex justify-between items-end ${selectedVehicle.totalSpentMaint === 0 ? 'print:hidden' : ''}`}>
                    <p className="text-[8px] sm:text-[9px] print:text-[7px] font-black text-slate-500">OFICINA</p>
                    <p className="text-base sm:text-lg print:text-xs font-black text-indigo-600">R$ {selectedVehicle.totalSpentMaint.toLocaleString()}</p>
                  </div>
                  <div className="pt-3 sm:pt-4 print:pt-1 border-t border-slate-100 print:border-slate-300 flex justify-between items-end">
                    <p className="text-[9px] sm:text-[10px] print:text-[8px] font-black text-slate-900 uppercase">CUSTO TOTAL</p>
                    <p className="text-xl sm:text-2xl print:text-sm font-black text-slate-900">R$ {selectedVehicle.grandTotal.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {reportData.map((row: any) => (
            <div key={row.id} className="bg-white p-4 sm:p-8 rounded-[1.2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-8 group hover:border-sky-200 transition-all">
              <div className="flex items-center gap-3 sm:gap-4 min-w-[180px]">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-slate-900 text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-black shadow-lg text-sm sm:text-base">{row.placa.slice(-3).toUpperCase()}</div>
                <div className="min-w-0">
                  <h5 className="font-black text-slate-800 uppercase tracking-tight truncate text-xs sm:text-base">{row.modelo.toUpperCase()}</h5>
                  <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                    <span className="text-[7px] sm:text-[9px] font-black text-sky-500 bg-sky-50 px-1.5 py-0.5 rounded-lg border border-sky-100">{row.placa.toUpperCase()}</span>
                    <span className="text-[7px] sm:text-[9px] font-black text-slate-400 uppercase">{row.avgKml.toFixed(1)} KML</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-8 flex-1">
                 <ReportStat label="COMBUSTÍVEL" value={row.totalSpentFuel} color="emerald" />
                 <ReportStat label="MANUTENÇÃO" value={row.totalSpentMaint} color="indigo" />
                 <div className="text-right flex items-center justify-end">
                    <button onClick={() => setSelectedVehicleId(row.id)} className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-900 text-white rounded-lg sm:rounded-xl text-[7px] sm:text-[9px] font-black uppercase tracking-widest hover:bg-sky-500 transition-all shadow-xl">Analítico</button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ReportStat = ({ label, value, color }: any) => {
  const textColorMap: Record<string, string> = {
    emerald: "text-emerald-600",
    indigo: "text-indigo-600",
    rose: "text-rose-600"
  };
  
  return (
    <div className="min-w-0">
      <p className="text-[6px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">{label}</p>
      <p className={`text-[10px] sm:text-sm font-black truncate ${textColorMap[color] || 'text-slate-800'}`}>R$ {value.toLocaleString()}</p>
    </div>
  );
};

const VehiclesTab = ({ vehicles, employees, onUpdate, onDelete, onUpdateMaintenance }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOilModalOpen, setIsOilModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Vehicle>>({ tipo: 'Caminhão', km_atual: 0, km_ultima_troca: 0, tipo_combustivel: 'FLEX' });
  const [oilForm, setOilForm] = useState({ veiculo_id: '', custo: 0, pago: true, data: new Date().toISOString().split('T')[0], funcionario_id: '' });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...form, id: form.id || crypto.randomUUID() } as Vehicle);
    setIsOpen(false);
    setForm({ tipo: 'Caminhão', km_atual: 0, km_ultima_troca: 0, tipo_combustivel: 'FLEX' });
  };

  const handleOilChange = (e: React.FormEvent) => {
    e.preventDefault();
    const v = vehicles.find((veh:any) => veh.id === oilForm.veiculo_id);
    if (!v) return;
    onUpdateMaintenance({ id: crypto.randomUUID(), veiculo_id: v.id, funcionario_id: oilForm.funcionario_id, tipo: 'Preventiva', servico: 'TROCA DE ÓLEO EFETUADA', data: oilForm.data, km_registro: v.km_atual, custo: Number(oilForm.custo) || 0, pago: oilForm.pago } as MaintenanceLog);
    setIsOilModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end no-print px-1"><button onClick={() => setIsOpen(true)} className="bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase shadow-xl">CADASTRAR VEÍCULO</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-1 sm:px-0">
        {(vehicles || []).map((v: Vehicle) => {
          const kmSinceOil = (v.km_atual || 0) - (v.km_ultima_troca || 0);
          const needsOilChange = kmSinceOil >= 1000;
          return (
            <div key={v.id} className={`bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border ${needsOilChange ? 'border-rose-200 shadow-rose-50 shadow-2xl' : 'border-slate-100 shadow-sm'} relative overflow-hidden group transition-all`}>
               <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 ${needsOilChange ? 'bg-rose-500 text-white shadow-xl shadow-rose-200 animate-pulse' : 'bg-sky-50 text-sky-500'} rounded-xl sm:rounded-2xl flex items-center justify-center transition-all`}>
                    {v.tipo === 'Caminhão' ? <Truck size={24} className="sm:size-8" /> : v.tipo === 'Moto' ? <Bike size={24} className="sm:size-8" /> : <Car size={24} className="sm:size-8" />}
                  </div>
                  <div className="flex gap-2 no-print">
                     <button onClick={() => { setForm(v); setIsOpen(true); }} className="p-2 sm:p-3 bg-slate-50 text-slate-300 hover:text-sky-500 rounded-lg sm:rounded-xl transition-all"><Pencil size={16} /></button>
                     <button onClick={() => onDelete(v.id)} className="p-2 sm:p-3 bg-slate-50 text-slate-300 hover:text-rose-500 rounded-lg sm:rounded-xl transition-all"><Trash2 size={16} /></button>
                  </div>
               </div>
               <h4 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tighter truncate">{v.modelo.toUpperCase()}</h4>
               <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-block font-mono text-[10px] font-black text-sky-500 bg-sky-50 px-2 sm:px-3 py-1 rounded-lg border border-sky-100 uppercase">{v.placa.toUpperCase()}</span>
               </div>
               <div className={`mt-6 sm:mt-8 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${needsOilChange ? 'bg-rose-50 border-rose-100 animate-ice' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <p className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest ${needsOilChange ? 'text-rose-600' : 'text-slate-400'}`}>KM ÓLEO ({kmSinceOil} / 1000)</p>
                    {needsOilChange && (
                      <div className="flex items-center gap-1 bg-rose-600 text-white px-2 py-0.5 rounded-full text-[6px] font-black animate-bounce">
                        <AlertCircle size={8} /> URGENTE
                      </div>
                    )}
                  </div>
                  <button onClick={() => { setOilForm({...oilForm, veiculo_id: v.id}); setIsOilModalOpen(true); }} className={`mt-2 w-full py-2 border rounded-lg text-[7px] sm:text-[8px] font-black uppercase transition-all no-print ${needsOilChange ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700' : 'bg-white border-slate-200 hover:bg-sky-500 hover:text-white'}`}>REGISTRAR TROCA</button>
               </div>
               <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4">
                  <div className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center">
                    <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase">ANO</p>
                    <p className="text-xs sm:text-sm font-black">{v.ano}</p>
                  </div>
                  <div className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center">
                    <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase">KM ATUAL</p>
                    <p className="text-xs sm:text-sm font-black">{v.km_atual.toLocaleString()}</p>
                  </div>
               </div>
            </div>
          );
        })}
      </div>
      {isOilModalOpen && <Modal title="CONFIRMAR TROCA DE ÓLEO" onClose={() => setIsOilModalOpen(false)}>
        <form onSubmit={handleOilChange} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Responsável / Funcionário</label>
              <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={oilForm.funcionario_id} onChange={e => setOilForm({...oilForm, funcionario_id: e.target.value})} required>
                <option value="">SELECIONAR FUNCIONÁRIO...</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Data da Troca</label>
                <input type="date" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={oilForm.data} onChange={e => setOilForm({...oilForm, data: e.target.value})} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Custo R$</label>
                <input type="number" step="0.01" placeholder="Custo R$" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={oilForm.custo} onChange={e => setOilForm({...oilForm, custo: parseFloat(e.target.value) || 0})} required />
              </div>
            </div>
          </div>
          <button type="submit" className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase">CONFIRMAR TROCA</button>
        </form>
      </Modal>}
      {isOpen && <Modal title="DADOS DO VEÍCULO" onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSave} className="space-y-5">
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Placa</label>
               <input placeholder="PLACA" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs uppercase" value={form.placa} onChange={e => setForm({...form, placa: e.target.value.toUpperCase()})} required />
             </div>
             <div className="space-y-1.5">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Ano</label>
               <input placeholder="ANO" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.ano} onChange={e => setForm({...form, ano: e.target.value})} required />
             </div>
           </div>
           <div className="space-y-1.5">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Modelo do Veículo</label>
             <input placeholder="MODELO" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value.toUpperCase()})} required />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">KM Atual</label>
                <input type="number" placeholder="KM ATUAL" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.km_atual || 0} onChange={e => setForm({...form, km_atual: parseInt(e.target.value) || 0})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">KM Última Troca Óleo</label>
                <input type="number" placeholder="KM ÚLTIMA TROCA ÓLEO" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.km_ultima_troca || 0} onChange={e => setForm({...form, km_ultima_troca: parseInt(e.target.value) || 0})} />
              </div>
           </div>
           <button className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase">SALVAR</button>
        </form>
      </Modal>}
    </div>
  );
};

const FuelTab = ({ logs, vehicles, employees, onUpdate, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<FuelLog>>({ data: new Date().toISOString().split('T')[0], tipo_combustivel: '', km_registro: 0, litros: 0, valor_litro: 0, funcionario_id: '' });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const l = parseFloat(String(form.litros || 0));
    const v = parseFloat(String(form.valor_litro || 0));
    onUpdate({ ...form, id: form.id || crypto.randomUUID(), valor_total: l * v, km_registro: Number(form.km_registro) || 0, tipo_combustivel: form.tipo_combustivel.toUpperCase() } as FuelLog);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4 px-1">
      <div className="flex justify-end no-print"><button onClick={() => setIsOpen(true)} className="bg-emerald-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase shadow-xl">ABASTECER</button></div>
      <div className="bg-white rounded-xl sm:rounded-[2rem] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[8px] sm:text-[9px] font-black uppercase text-slate-400">
              <tr><th className="px-4 sm:px-6 py-4 sm:py-5">DATA</th><th className="px-4 sm:px-6 py-4 sm:py-5">VEÍCULO</th><th className="px-4 sm:px-6 py-4 sm:py-5">LITROS</th><th className="px-4 sm:px-6 py-4 sm:py-5">TOTAL</th><th className="px-4 sm:px-6 py-4 sm:py-5 no-print text-center">AÇÃO</th></tr>
            </thead>
            <tbody className="divide-y text-[10px] sm:text-xs font-black">
              {logs.map((l: FuelLog) => (
                <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 sm:px-6 py-3 sm:py-4">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 truncate max-w-[80px] sm:max-w-none">{vehicles.find((v:any) => v.id === l.veiculo_id)?.placa.toUpperCase()}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">{l.litros}L</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-emerald-600">R${l.valor_total.toLocaleString()}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 no-print text-center"><button onClick={() => onDelete(l.id)} className="text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isOpen && <Modal title="LANÇAR ABASTECIMENTO" onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSave} className="space-y-5">
           <div className="space-y-1.5">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Veículo</label>
             <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.veiculo_id} onChange={e => setForm({...form, veiculo_id: e.target.value, km_registro: vehicles.find((v:any)=>v.id===e.target.value)?.km_atual || 0})} required>
               <option value="">SELECIONAR VEÍCULO...</option>
               {vehicles.map((v:any) => <option key={v.id} value={v.id}>{v.placa}</option>)}
             </select>
           </div>
           <div className="space-y-1.5">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Funcionário / Motorista</label>
             <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.funcionario_id} onChange={e => setForm({...form, funcionario_id: e.target.value})} required>
               <option value="">SELECIONAR FUNCIONÁRIO...</option>
               {employees.map((e:any) => <option key={e.id} value={e.id}>{e.name}</option>)}
             </select>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Litros</label>
                <input type="number" step="0.01" placeholder="LITROS" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.litros} onChange={e => setForm({...form, litros: parseFloat(e.target.value) || 0})} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Valor Litro R$</label>
                <input type="number" step="0.01" placeholder="VLR LITRO" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.valor_litro} onChange={e => setForm({...form, valor_litro: parseFloat(e.target.value) || 0})} required />
              </div>
           </div>
           <div className="space-y-1.5">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Odômetro Atual (KM)</label>
             <input type="number" placeholder="KM ATUAL" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.km_registro} onChange={e => setForm({...form, km_registro: parseInt(e.target.value) || 0})} required />
           </div>
           <button className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase">CONFIRMAR ABASTECIMENTO</button>
        </form>
      </Modal>}
    </div>
  );
};

const MaintenanceTab = ({ logs, vehicles, employees, onUpdate, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<MaintenanceLog>>({ tipo: 'Preventiva', data: new Date().toISOString().split('T')[0], pago: true, funcionario_id: '' });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...form, id: form.id || crypto.randomUUID(), custo: Number(form.custo) || 0, km_registro: vehicles.find((v:any)=>v.id===form.veiculo_id)?.km_atual || 0, servico: form.servico?.toUpperCase() } as MaintenanceLog);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4 px-1">
      <div className="flex justify-end no-print"><button onClick={() => setIsOpen(true)} className="bg-indigo-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase shadow-xl">MANUTENÇÃO</button></div>
      <div className="bg-white rounded-xl sm:rounded-[2rem] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[8px] sm:text-[9px] font-black uppercase text-slate-400">
              <tr><th className="px-4 sm:px-6 py-4 sm:py-5">DATA</th><th className="px-4 sm:px-6 py-4 sm:py-5">SERVIÇO</th><th className="px-4 sm:px-6 py-4 sm:py-5 text-right">VALOR</th><th className="px-4 sm:px-6 py-4 sm:py-5 no-print text-center">AÇÃO</th></tr>
            </thead>
            <tbody className="divide-y text-[10px] sm:text-xs font-black">
              {logs.map((l: MaintenanceLog) => (
                <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 sm:px-6 py-3 sm:py-4">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 uppercase truncate max-w-[120px] sm:max-w-none">{l.servico}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-rose-500 text-right">R${l.custo.toLocaleString()}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 no-print text-center"><button onClick={() => onDelete(l.id)} className="text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isOpen && <Modal title="LANÇAR MANUTENÇÃO" onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSave} className="space-y-5">
           <div className="space-y-1.5">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Veículo</label>
             <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.veiculo_id} onChange={e => setForm({...form, veiculo_id: e.target.value})} required>
               <option value="">SELECIONAR VEÍCULO...</option>
               {vehicles.map((v:any) => <option key={v.id} value={v.id}>{v.placa}</option>)}
             </select>
           </div>
           <div className="space-y-1.5">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Descrição do Serviço</label>
             <input placeholder="DESCRIÇÃO DO SERVIÇO" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs uppercase" value={form.servico} onChange={e => setForm({...form, servico: e.target.value.toUpperCase()})} required />
           </div>
           <div className="space-y-1.5">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Valor Total R$</label>
             <input type="number" step="0.01" placeholder="VALOR TOTAL R$" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.custo} onChange={e => setForm({...form, custo: parseFloat(e.target.value) || 0})} required />
           </div>
           <button className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase">SALVAR REGISTRO</button>
        </form>
      </Modal>}
    </div>
  );
};

const FinesTab = ({ logs, vehicles, employees, onUpdate, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<FineLog>>({ situacao: 'Em aberto', data: new Date().toISOString().split('T')[0], data_vencimento: new Date().toISOString().split('T')[0], funcionario_id: '' });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...form, id: form.id || crypto.randomUUID(), tipo_infracao: form.tipo_infracao?.toUpperCase() } as FineLog);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4 px-1">
      <div className="flex justify-end no-print"><button onClick={() => setIsOpen(true)} className="bg-rose-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase shadow-xl">MULTA</button></div>
      <div className="bg-white rounded-xl sm:rounded-[2rem] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[8px] sm:text-[9px] font-black uppercase text-slate-400">
              <tr><th className="px-4 sm:px-6 py-4 sm:py-5">DATA</th><th className="px-4 sm:px-6 py-4 sm:py-5">INFRAÇÃO</th><th className="px-4 sm:px-6 py-4 sm:py-5 text-right">VALOR</th><th className="px-4 sm:px-6 py-4 sm:py-5 no-print text-center">AÇÃO</th></tr>
            </thead>
            <tbody className="divide-y text-[10px] sm:text-xs font-black">
              {logs.map((l: FineLog) => (
                <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 sm:px-6 py-3 sm:py-4">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 uppercase truncate max-w-[120px] sm:max-w-none">{l.tipo_infracao}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-rose-500 text-right">R${l.valor.toLocaleString()}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 no-print text-center"><button onClick={() => onDelete(l.id)} className="text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isOpen && <Modal title="LANÇAR MULTA" onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSave} className="space-y-5">
           <div className="space-y-1.5">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Veículo Multado</label>
             <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.veiculo_id} onChange={e => setForm({...form, veiculo_id: e.target.value})} required>
               <option value="">SELECIONAR VEÍCULO...</option>
               {vehicles.map((v:any) => <option key={v.id} value={v.id}>{v.placa}</option>)}
             </select>
           </div>
           <div className="space-y-1.5">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Natureza da Infração</label>
             <input placeholder="NATUREZA DA INFRAÇÃO" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs uppercase" value={form.tipo_infracao} onChange={e => setForm({...form, tipo_infracao: e.target.value.toUpperCase()})} required />
           </div>
           <div className="space-y-1.5">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Valor R$</label>
             <input type="number" step="0.01" placeholder="VALOR R$" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.valor} onChange={e => setForm({...form, valor: parseFloat(e.target.value) || 0})} required />
           </div>
           <button className="w-full h-14 bg-rose-500 text-white rounded-2xl font-black uppercase">LANÇAR NO FINANCEIRO</button>
        </form>
      </Modal>}
    </div>
  );
};

const Modal = ({ title, children, onClose }: any) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300 no-print">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
    <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-6 sm:mb-8 border-b border-slate-50 pb-4 sm:pb-6">
        <h3 className="text-base sm:text-xl font-black text-slate-800 uppercase tracking-tighter">{title}</h3>
        <button onClick={onClose} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><X size={20} className="sm:size-6" /></button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto pr-1 no-scrollbar">
        {children}
      </div>
    </div>
  </div>
);

export default FleetView;
