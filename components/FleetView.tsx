
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
    const oilAlerts = (vehicles || []).filter(v => (v.km_atual - v.km_ultima_troca) >= 1000).length;
    return { totalV, totalFuel, totalMaint, totalFines, oilAlerts };
  }, [vehicles, filteredFuel, filteredMaint, filteredFines]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 uppercase">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm no-print">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl">
            <Truck size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none uppercase">GESTÃO DE <span className="text-sky-500">FROTA</span></h2>
            <div className="flex items-center gap-2 mt-2">
               <div className="flex items-center bg-slate-100 p-1 rounded-xl h-10 no-print">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-lg text-slate-400 transition-all"><ChevronLeft size={16} /></button>
                  <div className="px-4 text-center min-w-[140px]">
                    <p className="text-[10px] font-black text-slate-800">{monthName}</p>
                  </div>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-lg text-slate-400 transition-all"><ChevronRight size={16} /></button>
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-[1.8rem]">
          {[
            { id: 'vehicles', label: 'FROTA', icon: Truck },
            { id: 'fuel', label: 'ABASTECER', icon: Fuel },
            { id: 'maintenance', label: 'OFICINA', icon: Wrench },
            { id: 'fines', label: 'MULTAS', icon: AlertOctagon },
            { id: 'reports', label: 'CUSTOS', icon: BarChart3 },
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-5 py-3 rounded-[1.4rem] text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon size={14} /> <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {activeTab !== 'reports' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 no-print">
          <SummaryCard label="VEÍCULOS" value={stats.totalV} icon={Truck} color="sky" />
          <SummaryCard label="GASOLINA" value={`R$ ${stats.totalFuel.toLocaleString()}`} icon={Fuel} color="emerald" />
          <SummaryCard label="OFICINA" value={`R$ ${stats.totalMaint.toLocaleString()}`} icon={Wrench} color="indigo" />
          <SummaryCard label="MULTAS" value={`R$ ${stats.totalFines.toLocaleString()}`} icon={AlertOctagon} color="rose" />
          <SummaryCard label="TROCA ÓLEO" value={stats.oilAlerts} icon={Droplets} color="amber" />
        </div>
      )}

      {activeTab === 'vehicles' && <VehiclesTab vehicles={vehicles} employees={employees} onUpdate={onUpdateVehicle} onUpdateMaintenance={onUpdateMaintenance} onDelete={onDeleteVehicle} />}
      {activeTab === 'fuel' && <FuelTab logs={filteredFuel} vehicles={vehicles} employees={employees} onUpdate={onUpdateFuel} onDelete={onDeleteFuel} />}
      {activeTab === 'maintenance' && <MaintenanceTab logs={filteredMaint} vehicles={vehicles} employees={employees} onUpdate={onUpdateMaintenance} onDelete={onDeleteMaintenance} />}
      {activeTab === 'fines' && <FinesTab logs={filteredFines} vehicles={vehicles} employees={employees} onUpdate={onUpdateFine} onDelete={onDeleteFine} />}
      {activeTab === 'reports' && <ReportsTab vehicles={vehicles} fuel={fuelLogs} maints={maintenanceLogs} fines={fineLogs} employees={employees} currentMonth={currentMonth} currentYear={currentYear} monthName={monthName} />}
    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 bg-${color}-50 text-${color}-500 rounded-2xl flex items-center justify-center`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-lg font-black text-slate-800">{value}</h4>
    </div>
  </div>
);

const ReportsTab = ({ vehicles, fuel, maints, fines, employees, currentMonth, currentYear, monthName }: any) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const reportData = useMemo(() => {
    return (vehicles || []).map((v: Vehicle) => {
      // Filtrar histórico completo para cálculos de KM
      const fullVFuel = (fuel || [])
        .filter((l: any) => l.veiculo_id === v.id)
        .sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime());
      
      const fullVMaint = (maints || []).filter((l: any) => l.veiculo_id === v.id);
      const fullVFines = (fines || []).filter((l: any) => l.veiculo_id === v.id);

      // Calcular Consumo Analítico sobre o histórico total para precisão de odômetro
      const fuelEfficiencyHistory = fullVFuel.map((current, index) => {
        if (index === 0) return { ...current, dist: 0, kml: 0 };
        const prev = fullVFuel[index - 1];
        const dist = current.km_registro - prev.km_registro;
        const kml = dist > 0 && current.litros > 0 ? dist / current.litros : 0;
        return { ...current, dist, kml };
      });

      // Aplicar filtro do navegador mensal para os resultados de exibição
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

      // Totais do Período Selecionado
      const totalSpentFuel = fuelEfficiency.reduce((sum: number, l: any) => sum + l.valor_total, 0);
      const totalSpentMaint = vMaint.reduce((sum: number, l: any) => sum + l.custo, 0);
      const totalSpentFines = vFines.reduce((sum: number, l: any) => sum + l.valor, 0);
      
      const totalKmPeriod = fuelEfficiency.reduce((sum: number, l: any) => sum + (l.dist || 0), 0);

      const logsWithKml = fuelEfficiency.filter(f => f.kml > 0);
      const avgKml = logsWithKml.length > 0 
        ? logsWithKml.reduce((acc, f) => acc + f.kml, 0) / logsWithKml.length 
        : 0;

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {selectedVehicle ? (
        <div className="animate-in slide-in-from-right duration-500 space-y-6 pb-10">
          <div className="flex items-center justify-between no-print">
            <button onClick={() => setSelectedVehicleId(null)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-sky-500 transition-all">
              <ChevronLeft size={16} /> VOLTAR PARA LISTAGEM MENSAL
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-sky-500 transition-all shadow-lg">
              <Printer size={16} /> Imprimir Relatório
            </button>
          </div>

          <header className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <span className="bg-sky-500 text-[8px] px-3 py-1 rounded-full font-black tracking-[0.2em]">{selectedVehicle.placa.toUpperCase()}</span>
                   <h3 className="text-4xl font-black tracking-tighter mt-2">{selectedVehicle.modelo.toUpperCase()}</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">RESUMO DE {monthName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                   <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                      <p className="text-[8px] font-black text-sky-400 uppercase tracking-widest">MÉDIA CONSUMO</p>
                      <p className="text-2xl font-black">{selectedVehicle.avgKml.toFixed(2)} <span className="text-xs">KM/L</span></p>
                   </div>
                   <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                      <p className="text-[8px] font-black text-sky-400 uppercase tracking-widest">DISTÂNCIA MÊS</p>
                      <p className="text-2xl font-black">{selectedVehicle.totalKmPeriod.toLocaleString()} <span className="text-xs">KM</span></p>
                   </div>
                </div>
             </div>
             <TrendingUp size={150} className="absolute -right-10 -bottom-10 text-white/5" />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Fuel size={20} className="text-emerald-500" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Abastecimentos do Período</h4>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{monthName}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400">
                      <tr>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">KM Registro</th>
                        <th className="px-6 py-4">Percorrido</th>
                        <th className="px-6 py-4">Litros</th>
                        <th className="px-6 py-4">Rendimento</th>
                        <th className="px-6 py-4 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-[10px] font-black text-slate-700">
                      {selectedVehicle.fuelEfficiency.map((l: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-mono">{l.km_registro.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            {l.dist > 0 ? (
                              <span className="flex items-center gap-1 text-sky-600">
                                <ArrowRight size={10} /> {l.dist} KM
                              </span>
                            ) : <span className="text-slate-300">---</span>}
                          </td>
                          <td className="px-6 py-4">{l.litros}L</td>
                          <td className="px-6 py-4">
                            {l.kml > 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden no-print">
                                  <div 
                                    className={`h-full ${l.kml > 8 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                    style={{ width: `${Math.min(100, l.kml * 10)}%` }}
                                  />
                                </div>
                                <span>{l.kml.toFixed(2)} KM/L</span>
                              </div>
                            ) : <span className="text-slate-300">CALC. ANTERIOR</span>}
                          </td>
                          <td className="px-6 py-4 text-right text-emerald-600 font-bold">R$ {l.valor_total.toLocaleString()}</td>
                        </tr>
                      ))}
                      {selectedVehicle.fuelEfficiency.length === 0 && (
                        <tr><td colSpan={6} className="p-10 text-center text-slate-300 italic">Sem abastecimentos neste mês.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wrench size={20} className="text-indigo-500" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Oficina no Período</h4>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400">
                      <tr>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Serviço</th>
                        <th className="px-6 py-4">Mecânico</th>
                        <th className="px-6 py-4 text-right">Custo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-[10px] font-black text-slate-700">
                      {selectedVehicle.vMaint.map((m: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">{new Date(m.data + 'T00:00:00').toLocaleDateString()}</td>
                          <td className="px-6 py-4 uppercase truncate max-w-[150px]">{m.servico}</td>
                          <td className="px-6 py-4 text-slate-400">{employees.find((e: any) => e.id === m.funcionario_id)?.name || 'N/I'}</td>
                          <td className="px-6 py-4 text-right text-rose-500 font-bold">R$ {m.custo.toLocaleString()}</td>
                        </tr>
                      ))}
                      {selectedVehicle.vMaint.length === 0 && (
                        <tr><td colSpan={4} className="p-10 text-center text-slate-300 italic">Nenhuma manutenção registrada no mês.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Custos do Período</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-[9px] font-black text-slate-500">COMBUSTÍVEL</p>
                    <p className="text-lg font-black text-emerald-600">R$ {selectedVehicle.totalSpentFuel.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-[9px] font-black text-slate-500">MANUTENÇÃO</p>
                    <p className="text-lg font-black text-indigo-600">R$ {selectedVehicle.totalSpentMaint.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-[9px] font-black text-slate-500">MULTAS</p>
                    <p className="text-lg font-black text-rose-500">R$ {selectedVehicle.totalSpentFines.toLocaleString()}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                    <p className="text-[10px] font-black text-slate-900">INVESTIMENTO MENSAL</p>
                    <p className="text-2xl font-black text-slate-900 underline decoration-sky-400 decoration-4">R$ {selectedVehicle.grandTotal.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-sky-50 p-8 rounded-[2.5rem] border border-sky-100">
                <div className="flex items-center gap-3 mb-4">
                  <Gauge size={20} className="text-sky-600" />
                  <h4 className="text-[11px] font-black uppercase text-sky-900">Eficiência Mês</h4>
                </div>
                <div className="space-y-3">
                   <div className="bg-white/50 p-4 rounded-2xl border border-sky-100">
                      <p className="text-[8px] font-black text-sky-400 uppercase tracking-widest mb-1">CUSTO POR KM (COMBUSTÍVEL)</p>
                      <p className="text-sm font-black text-sky-900">
                        {selectedVehicle.totalKmPeriod > 0 
                          ? `R$ ${(selectedVehicle.totalSpentFuel / selectedVehicle.totalKmPeriod).toFixed(2)} / KM` 
                          : 'KM NÃO REGISTRADO'}
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reportData.map((row: any) => (
            <div key={row.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8 group hover:border-sky-200 transition-all">
              <div className="flex items-center gap-4 min-w-[220px]">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black shadow-lg">
                  {row.placa.slice(-3).toUpperCase()}
                </div>
                <div>
                  <h5 className="font-black text-slate-800 uppercase tracking-tight">{row.modelo.toUpperCase()}</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-sky-500 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-100">{row.placa.toUpperCase()}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase">{row.avgKml.toFixed(1)} KM/L</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 flex-1">
                 <ReportStat label="COMBUSTÍVEL" value={row.totalSpentFuel} color="emerald" />
                 <ReportStat label="MANUTENÇÃO" value={row.totalSpentMaint} color="indigo" />
                 <ReportStat label="MULTAS" value={row.totalSpentFines} color="rose" />
                 <div className="text-right">
                    <button 
                      onClick={() => setSelectedVehicleId(row.id)}
                      className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-sky-500 transition-all shadow-xl group-hover:scale-105"
                    >
                      Analítico Mensal
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ReportStat = ({ label, value, color }: any) => (
  <div>
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-sm font-black text-${color}-600`}>R$ {value.toLocaleString()}</p>
  </div>
);

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
    if (!oilForm.funcionario_id) {
        alert("POR FAVOR, SELECIONE O FUNCIONÁRIO.");
        return;
    }

    onUpdateMaintenance({
        id: crypto.randomUUID(),
        veiculo_id: v.id,
        funcionario_id: oilForm.funcionario_id,
        tipo: 'Preventiva',
        servico: 'TROCA DE ÓLEO EFETUADA',
        data: oilForm.data,
        km_registro: v.km_atual, 
        custo: Number(oilForm.custo) || 0,
        pago: oilForm.pago
    } as MaintenanceLog);
    
    setIsOilModalOpen(false);
    setOilForm({ veiculo_id: '', custo: 0, pago: true, data: new Date().toISOString().split('T')[0], funcionario_id: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setIsOpen(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-sky-600 transition-all">
          <Plus size={16} /> NOVO VEÍCULO
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(vehicles || []).map((v: Vehicle) => {
          const kmSinceOil = v.km_atual - v.km_ultima_troca;
          const oilLifePercent = Math.max(0, 100 - (kmSinceOil / 10));

          return (
            <div key={v.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                  <div className={`w-16 h-16 ${kmSinceOil >= 1000 ? 'bg-amber-500 text-white animate-pulse' : 'bg-sky-50 text-sky-500'} rounded-2xl flex items-center justify-center transition-all`}>
                    {v.tipo === 'Caminhão' ? <Truck size={32} /> : v.tipo === 'Moto' ? <Bike size={32} /> : <Car size={32} />}
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => { setForm(v); setIsOpen(true); }} className="p-3 bg-slate-50 text-slate-300 hover:text-sky-500 rounded-xl transition-all"><Pencil size={18} /></button>
                     <button onClick={() => onDelete(v.id)} className="p-3 bg-slate-50 text-slate-300 hover:text-rose-500 rounded-xl transition-all"><Trash2 size={18} /></button>
                  </div>
               </div>
               <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{v.modelo.toUpperCase()}</h4>
               <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-block font-mono text-xs font-black text-sky-500 bg-sky-50 px-3 py-1 rounded-lg border border-sky-100 uppercase">{v.placa.toUpperCase()}</span>
                  <span className="inline-block text-[8px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 uppercase">{v.tipo_combustivel}</span>
               </div>
               
               <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">KM TROCA ({kmSinceOil} / 1000 KM)</p>
                    {kmSinceOil >= 1000 && <AlertTriangle size={12} className="text-amber-500 animate-bounce" />}
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${kmSinceOil >= 1000 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${oilLifePercent}%` }} />
                  </div>
                  <button 
                    onClick={() => { setOilForm({...oilForm, veiculo_id: v.id}); setIsOilModalOpen(true); }}
                    className={`mt-3 w-full py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${kmSinceOil >= 1000 ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:bg-sky-500 hover:text-white'}`}
                  >
                    <Droplets size={10} /> REALIZAR TROCA DE ÓLEO
                  </button>
               </div>

               <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-slate-50 p-4 rounded-2xl text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ANO</p>
                    <p className="text-sm font-black text-slate-700">{v.ano}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">HODÔMETRO</p>
                    <p className="text-sm font-black text-slate-700">{v.km_atual.toLocaleString()} KM</p>
                  </div>
               </div>
            </div>
          );
        })}
      </div>

      {isOilModalOpen && (
        <Modal title="CONFIRMAR TROCA DE ÓLEO" onClose={() => setIsOilModalOpen(false)}>
           <form onSubmit={handleOilChange} className="space-y-6">
              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex items-start gap-3">
                 <AlertCircle size={24} className="text-amber-500 shrink-0" />
                 <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight leading-relaxed">
                    A KM ÚLTIMA TROCA SERÁ ATUALIZADA PARA O VALOR ATUAL DO HODÔMETRO. 
                    O HISTÓRICO SERÁ SALVO NA OFICINA E NO FINANCEIRO AUTOMATICAMENTE.
                 </p>
              </div>
              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">FUNCIONÁRIO</label>
                    <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs outline-none" value={oilForm.funcionario_id} onChange={e => setOilForm({...oilForm, funcionario_id: e.target.value})} required>
                        <option value="">SELECIONAR...</option>
                        {employees.map((emp: any) => (
                          <option key={emp.id} value={emp.id}>{emp.name.toUpperCase()}</option>
                        ))}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">DATA DO SERVIÇO</label>
                        <input type="date" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={oilForm.data} onChange={e => setOilForm({...oilForm, data: e.target.value})} required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">CUSTO TOTAL R$</label>
                        <input type="number" step="0.01" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={oilForm.custo} onChange={e => setOilForm({...oilForm, custo: parseFloat(e.target.value) || 0})} required />
                    </div>
                 </div>
                 <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="flex-1 text-[9px] font-black uppercase text-slate-400 tracking-widest">STATUS DE PAGAMENTO</p>
                    <div className="flex gap-2">
                       <button type="button" onClick={() => setOilForm({...oilForm, pago: true})} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${oilForm.pago ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-400'}`}>PAGO</button>
                       <button type="button" onClick={() => setOilForm({...oilForm, pago: false})} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${!oilForm.pago ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-slate-400'}`}>A VENCER</button>
                    </div>
                 </div>
              </div>
              <button type="submit" className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> CONFIRMAR TROCA E GERAR DESPESA
              </button>
           </form>
        </Modal>
      )}

      {isOpen && (
        <Modal title={form.id ? "EDITAR VEÍCULO" : "CADASTRAR VEÍCULO"} onClose={() => setIsOpen(false)}>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-slate-400 ml-2">TIPO</label>
                 <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs outline-none" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value as any})}>
                    <option>Caminhão</option><option>Carro</option><option>Moto</option>
                 </select>
               </div>
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-slate-400 ml-2">PLACA</label>
                 <input className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs uppercase outline-none focus:ring-2 focus:ring-sky-200" value={form.placa} onChange={e => setForm({...form, placa: e.target.value.toUpperCase()})} required placeholder="ABC1D23" />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-slate-400 ml-2">MODELO</label>
                 <input className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs outline-none" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value.toUpperCase()})} required placeholder="EX: MERCEDES ACCELO" />
               </div>
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-slate-400 ml-2">ANO</label>
                 <input className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs outline-none" value={form.ano} onChange={e => setForm({...form, ano: e.target.value})} placeholder="2024" />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-slate-400 ml-2">HODÔMETRO ATUAL (KM)</label>
                 <input type="number" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs outline-none" value={form.km_atual || 0} onChange={e => setForm({...form, km_atual: parseInt(e.target.value) || 0})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-slate-400 ml-2">KM ÚLTIMA TROCA</label>
                 <input type="number" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs outline-none text-sky-600 font-black" value={form.km_ultima_troca || 0} onChange={e => setForm({...form, km_ultima_troca: parseInt(e.target.value) || 0})} />
               </div>
            </div>
            <div className="space-y-1">
               <label className="text-[9px] font-black uppercase text-slate-400 ml-2">COMBUSTÍVEL PADRÃO</label>
               <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs outline-none" value={form.tipo_combustivel} onChange={e => setForm({...form, tipo_combustivel: e.target.value as any})} required>
                  <option value="FLEX">FLEX (ÁLCOOL/GASOLINA)</option>
                  <option value="GASOLINA">GASOLINA</option>
                  <option value="ÁLCOOL">ÁLCOOL</option>
                  <option value="DIESEL">DIESEL</option>
                </select>
            </div>
            <button type="submit" className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
              <Save size={18} /> SALVAR VEÍCULO
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

const FuelTab = ({ logs, vehicles, employees, onUpdate, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<FuelLog>>({ 
    data: new Date().toISOString().split('T')[0], 
    tipo_combustivel: '',
    km_registro: 0,
    litros: 0,
    valor_litro: 0,
    funcionario_id: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tipo_combustivel) {
      alert("POR FAVOR, SELECIONE O COMBUSTÍVEL.");
      return;
    }
    if (!form.funcionario_id) {
        alert("POR FAVOR, SELECIONE O FUNCIONÁRIO.");
        return;
    }

    const l = parseFloat(String(form.litros || 0));
    const v = parseFloat(String(form.valor_litro || 0));
    onUpdate({ 
        ...form, 
        id: form.id || crypto.randomUUID(), 
        valor_total: l * v,
        km_registro: Number(form.km_registro) || 0,
        tipo_combustivel: form.tipo_combustivel.toUpperCase()
    } as FuelLog);
    setIsOpen(false);
    setForm({ data: new Date().toISOString().split('T')[0], tipo_combustivel: '', km_registro: 0, litros: 0, valor_litro: 0, funcionario_id: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => setIsOpen(true)} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-emerald-600 transition-all"><Plus size={16} /> NOVO ABASTECIMENTO</button></div>
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b">
            <tr><th className="px-6 py-5">DATA</th><th className="px-6 py-5">VEÍCULO / FUNC.</th><th className="px-6 py-5">COMBUSTÍVEL</th><th className="px-6 py-5">LITROS</th><th className="px-6 py-5">TOTAL</th><th className="px-6 py-5">HODÔMETRO</th><th className="px-6 py-5 text-center">AÇÃO</th></tr>
          </thead>
          <tbody className="divide-y text-xs font-black text-slate-700">
            {(logs || []).map((l: FuelLog) => (
              <tr key={l.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td>
                <td className="px-6 py-4">
                    <p className="text-sky-500 font-bold">{(vehicles || []).find((v:any) => v.id === l.veiculo_id)?.placa.toUpperCase()}</p>
                    <p className="text-[10px] text-slate-400 uppercase">{(employees || []).find((e:any) => e.id === l.funcionario_id)?.name || 'NÃO IDENTIFICADO'}</p>
                </td>
                <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] uppercase font-black">{l.tipo_combustivel.toUpperCase()}</span>
                </td>
                <td className="px-6 py-4">{l.litros}L</td>
                <td className="px-6 py-4 text-emerald-600 font-black">R$ {l.valor_total.toLocaleString()}</td>
                <td className="px-6 py-4 font-mono">{l.km_registro.toLocaleString()} KM</td>
                <td className="px-6 py-4 text-center"><button onClick={() => onDelete(l.id)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isOpen && (
        <Modal title="LANÇAR ABASTECIMENTO" onClose={() => setIsOpen(false)}>
           <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">VEÍCULO</label>
                    <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs outline-none appearance-none" value={form.veiculo_id} onChange={e => {
                        const v = (vehicles || []).find((v:any) => v.id === e.target.value);
                        const vFuelType = v?.tipo_combustivel?.toUpperCase();
                        setForm({
                        ...form, 
                        veiculo_id: e.target.value, 
                        km_registro: v?.km_atual || 0,
                        tipo_combustivel: vFuelType === 'FLEX' ? '' : vFuelType
                        });
                    }} required>
                    <option value="">SELECIONAR VEÍCULO...</option>
                    {(vehicles || []).map((v:any) => <option key={v.id} value={v.id}>{v.placa.toUpperCase()} - {v.modelo.toUpperCase()} ({v.tipo_combustivel})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">FUNCIONÁRIO</label>
                    <select className="w-full h-12 px-5 bg-indigo-50 border border-indigo-100 rounded-2xl font-black text-xs outline-none appearance-none" value={form.funcionario_id} onChange={e => setForm({...form, funcionario_id: e.target.value})} required>
                        <option value="">SELECIONAR...</option>
                        {(employees || []).map((e:any) => <option key={e.id} value={e.id}>{e.name.toUpperCase()}</option>)}
                    </select>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">DATA</label>
                  <input type="date" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs outline-none" value={form.data} onChange={e => setForm({...form, data: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">COMBUSTÍVEL</label>
                  <select className={`w-full h-12 px-5 border rounded-2xl font-black text-xs outline-none ${!form.tipo_combustivel ? 'bg-amber-50 border-amber-200 text-amber-600 animate-pulse' : 'bg-slate-50 border-slate-100 text-slate-900'}`} value={form.tipo_combustivel} onChange={e => setForm({...form, tipo_combustivel: e.target.value})} required>
                    <option value="">ESCOLHA...</option>
                    <option value="GASOLINA">GASOLINA</option>
                    <option value="ÁLCOOL">ÁLCOOL</option>
                    <option value="DIESEL">DIESEL</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">LITROS</label>
                  <input type="number" step="0.01" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs outline-none" value={form.litros} onChange={e => setForm({...form, litros: parseFloat(e.target.value) || 0})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">VALOR LITRO R$</label>
                  <input type="number" step="0.01" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs outline-none" value={form.valor_litro} onChange={e => setForm({...form, valor_litro: parseFloat(e.target.value) || 0})} required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-sky-500 uppercase ml-2 tracking-widest">HODÔMETRO ATUAL (KM)</label>
                <input type="number" className="w-full h-12 px-5 bg-sky-50 border-sky-100 rounded-2xl font-black text-xs outline-none" value={form.km_registro} onChange={e => setForm({...form, km_registro: parseInt(e.target.value) || 0})} required />
              </div>
              <button className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                 <CheckCircle2 size={18} /> CONFIRMAR ABASTECIMENTO
              </button>
           </form>
        </Modal>
      )}
    </div>
  );
};

const MaintenanceTab = ({ logs, vehicles, employees, onUpdate, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<MaintenanceLog>>({ tipo: 'Preventiva', data: new Date().toISOString().split('T')[0], pago: true, funcionario_id: '' });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.funcionario_id) {
        alert("POR FAVOR, SELECIONE O FUNCIONÁRIO.");
        return;
    }
    const v = vehicles.find((veh:any) => veh.id === form.veiculo_id);
    onUpdate({ 
        ...form, 
        id: form.id || crypto.randomUUID(),
        custo: Number(form.custo) || 0,
        km_registro: v?.km_atual || 0,
        servico: form.servico?.toUpperCase()
    } as MaintenanceLog);
    setIsOpen(false);
    setForm({ tipo: 'Preventiva', data: new Date().toISOString().split('T')[0], pago: true, funcionario_id: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => setIsOpen(true)} className="bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-indigo-600 transition-all"><Plus size={16} /> NOVA MANUTENÇÃO</button></div>
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b">
            <tr><th className="px-6 py-5">DATA</th><th className="px-6 py-5">VEÍCULO / FUNC.</th><th className="px-6 py-5">SERVIÇO</th><th className="px-6 py-5">CUSTO</th><th className="px-6 py-5">STATUS</th><th className="px-6 py-5 text-center">AÇÃO</th></tr>
          </thead>
          <tbody className="divide-y text-xs font-black text-slate-700">
            {(logs || []).map((l: MaintenanceLog) => (
              <tr key={l.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td>
                <td className="px-6 py-4">
                    <p className="text-sky-500 font-bold">{(vehicles || []).find((v:any) => v.id === l.veiculo_id)?.placa.toUpperCase()}</p>
                    <p className="text-[10px] text-slate-400 uppercase">{(employees || []).find((e:any) => e.id === l.funcionario_id)?.name || 'NÃO IDENTIFICADO'}</p>
                </td>
                <td className="px-6 py-4 uppercase truncate max-w-[150px] font-black">{l.servico.toUpperCase()}</td>
                <td className="px-6 py-4 text-rose-500 font-black">R$ {l.custo.toLocaleString()}</td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${l.pago ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                      {l.pago ? 'PAGO' : 'A VENCER'}
                   </span>
                </td>
                <td className="px-6 py-4 text-center"><button onClick={() => onDelete(l.id)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isOpen && (
        <Modal title="REGISTRAR MANUTENÇÃO" onClose={() => setIsOpen(false)}>
           <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">VEÍCULO</label>
                    <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.veiculo_id} onChange={e => setForm({...form, veiculo_id: e.target.value})} required>
                    <option value="">SELECIONAR VEÍCULO...</option>
                    {(vehicles || []).map((v:any) => <option key={v.id} value={v.id}>{v.placa.toUpperCase()} - {v.modelo.toUpperCase()}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">FUNCIONÁRIO</label>
                    <select className="w-full h-12 px-5 bg-indigo-50 border border-indigo-100 rounded-2xl font-black text-xs outline-none" value={form.funcionario_id} onChange={e => setForm({...form, funcionario_id: e.target.value})} required>
                        <option value="">SELECIONAR...</option>
                        {(employees || []).map((e:any) => <option key={e.id} value={e.id}>{e.name.toUpperCase()}</option>)}
                    </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">TIPO</label>
                  <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value as any})}>
                    <option>Preventiva</option><option>Corretiva</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">DATA</label>
                  <input type="date" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.data} onChange={e => setForm({...form, data: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">DESCRIÇÃO DO SERVIÇO</label>
                <input placeholder="EX: TROCA DE PASTILHAS" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.servico} onChange={e => setForm({...form, servico: e.target.value.toUpperCase()})} required />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">CUSTO TOTAL R$</label>
                <input type="number" step="0.01" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.custo || 0} onChange={e => setForm({...form, custo: parseFloat(e.target.value) || 0})} required />
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="flex-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">LANÇAR NO FINANCEIRO COMO</p>
                  <div className="flex gap-2">
                     <button type="button" onClick={() => setForm({...form, pago: true})} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${form.pago ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-400'}`}>PAGO</button>
                     <button type="button" onClick={() => setForm({...form, pago: false})} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${!form.pago ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-slate-400'}`}>A VENCER</button>
                  </div>
              </div>
              <button className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                 <Wrench size={18} /> CONFIRMAR MANUTENÇÃO
              </button>
           </form>
        </Modal>
      )}
    </div>
  );
};

const FinesTab = ({ logs, vehicles, employees, onUpdate, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<FineLog>>({ 
    situacao: 'Em aberto', 
    data: new Date().toISOString().split('T')[0],
    data_vencimento: new Date().toISOString().split('T')[0],
    funcionario_id: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.funcionario_id) {
        alert("POR FAVOR, SELECIONE O FUNCIONÁRIO.");
        return;
    }
    if (!form.data_vencimento) {
        alert("A DATA DE VENCIMENTO É OBRIGATÓRIA.");
        return;
    }
    onUpdate({ 
        ...form, 
        id: form.id || crypto.randomUUID(), 
        tipo_infracao: form.tipo_infracao?.toUpperCase() 
    } as FineLog);
    setIsOpen(false);
    setForm({ situacao: 'Em aberto', data: new Date().toISOString().split('T')[0], data_vencimento: new Date().toISOString().split('T')[0], funcionario_id: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => setIsOpen(true)} className="bg-rose-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-rose-600 transition-all"><Plus size={16} /> REGISTRAR MULTA</button></div>
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b">
            <tr><th className="px-6 py-5">INFRAÇÃO / VENC.</th><th className="px-6 py-5">VEÍCULO / FUNC.</th><th className="px-6 py-5">VALOR</th><th className="px-6 py-5">SITUAÇÃO</th><th className="px-6 py-5 text-center">AÇÃO</th></tr>
          </thead>
          <tbody className="divide-y text-xs font-black text-slate-700">
            {(logs || []).map((l: FineLog) => (
              <tr key={l.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                    <p className="uppercase truncate max-w-[180px] font-bold">{l.tipo_infracao.toUpperCase()}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black italic">VENC: {new Date(l.data_vencimento + 'T00:00:00').toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4">
                    <p className="text-sky-500 font-bold">{(vehicles || []).find((v:any) => v.id === l.veiculo_id)?.placa.toUpperCase()}</p>
                    <p className="text-[10px] text-slate-400 uppercase">{(employees || []).find((e:any) => e.id === l.funcionario_id)?.name || 'NÃO IDENTIFICADO'}</p>
                </td>
                <td className="px-6 py-4 text-rose-500 font-black">R$ {l.valor.toLocaleString()}</td>
                <td className="px-6 py-4">
                   <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${l.situacao === 'Paga' ? 'bg-emerald-500 text-white' : l.situacao === 'Em aberto' ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'}`}>
                     {l.situacao.toUpperCase()}
                   </span>
                </td>
                <td className="px-6 py-4 text-center"><button onClick={() => onDelete(l.id)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isOpen && (
        <Modal title="LANÇAR MULTA" onClose={() => setIsOpen(false)}>
           <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">VEÍCULO</label>
                    <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs outline-none appearance-none" value={form.veiculo_id} onChange={e => setForm({...form, veiculo_id: e.target.value})} required>
                    <option value="">SELECIONAR VEÍCULO...</option>
                    {(vehicles || []).map((v:any) => <option key={v.id} value={v.id}>{v.placa.toUpperCase()} - {v.modelo.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">FUNCIONÁRIO</label>
                    <select className="w-full h-12 px-5 bg-indigo-50 border border-indigo-100 rounded-2xl font-black text-xs outline-none appearance-none" value={form.funcionario_id} onChange={e => setForm({...form, funcionario_id: e.target.value})} required>
                        <option value="">SELECIONAR...</option>
                        {(employees || []).map((e:any) => <option key={e.id} value={e.id}>{e.name.toUpperCase()}</option>)}
                    </select>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">DATA DA INFRAÇÃO</label>
                  <input type="date" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs outline-none" value={form.data} onChange={e => setForm({...form, data: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-sky-500 uppercase ml-2 tracking-widest">DATA DE VENCIMENTO</label>
                  <input type="date" className="w-full h-12 px-5 bg-sky-50 border border-sky-100 rounded-2xl font-black text-xs outline-none" value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">NATUREZA DA INFRAÇÃO</label>
                <input placeholder="EX: EXCESSO DE VELOCIDADE" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs outline-none" value={form.tipo_infracao} onChange={e => setForm({...form, tipo_infracao: e.target.value.toUpperCase()})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">VALOR R$</label>
                  <input type="number" step="0.01" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs outline-none" value={form.valor || 0} onChange={e => setForm({...form, valor: parseFloat(e.target.value) || 0})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">STATUS</label>
                  <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs outline-none appearance-none" value={form.situacao} onChange={e => setForm({...form, situacao: e.target.value as any})}>
                    <option value="Em aberto">EM ABERTO</option>
                    <option value="Paga">PAGA</option>
                    <option value="Recurso">RECURSO</option>
                  </select>
                </div>
              </div>
              <button className="w-full h-14 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                 <AlertOctagon size={18} /> REGISTRAR INFRAÇÃO
              </button>
           </form>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ title, children, onClose }: any) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300 no-print">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{title}</h3>
        <button onClick={onClose} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><X size={24} /></button>
      </div>
      {children}
    </div>
  </div>
);

export default FleetView;
