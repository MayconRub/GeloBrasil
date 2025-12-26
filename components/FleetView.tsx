
import React, { useState, useMemo } from 'react';
import { Truck, Plus, Trash2, Gauge, History, Download, TrendingUp, Calendar, ChevronLeft, ChevronRight, Save, UserCircle, Award } from 'lucide-react';
import { Vehicle, KmLog, Employee } from '../types';

interface Props {
  vehicles: Vehicle[];
  kmLogs: KmLog[];
  employees?: Employee[]; 
  onUpdate: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  onLogKm: (log: Omit<KmLog, 'id'>) => void;
}

const FleetView: React.FC<Props> = ({ vehicles, kmLogs, employees = [], onUpdate, onDelete, onLogKm }) => {
  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [year, setYear] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [kmReading, setKmReading] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);

  const getWeekNumber = (d: Date) => {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const handlePlateChange = (val: string) => {
    const sanitized = val.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (sanitized.length <= 8) setPlate(sanitized);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !plate) return;
    onUpdate({ id: crypto.randomUUID(), name, plate: plate.trim(), modelYear: year || 'N/A', kmAtual: 0 });
    setName(''); setPlate(''); setYear('');
  };

  const handleLogKm = (e: React.FormEvent) => {
    e.preventDefault();
    const km = parseFloat(kmReading);
    if (!selectedVehicleId || isNaN(km)) return;
    onLogKm({ veiculo_id: selectedVehicleId, km_reading: km, data: logDate });
    setKmReading(''); setSelectedVehicleId('');
  };

  const weeklyMileageReport = useMemo(() => {
    const report: Array<{ week: number; year: number; vehicleId: string; vehicle: string; plate: string; initialKm: number; finalKm: number; diff: number; lastDriver?: string; isPeak?: boolean }> = [];
    
    vehicles.forEach(v => {
      const logs = kmLogs.filter(k => k.veiculo_id === v.id);
      const weeks: Record<string, KmLog[]> = {};
      
      logs.forEach(log => {
        const d = new Date(log.data + 'T00:00:00');
        const weekKey = `${d.getFullYear()}-W${getWeekNumber(d)}`;
        if (!weeks[weekKey]) weeks[weekKey] = [];
        weeks[weekKey].push(log);
      });

      const vehicleWeeklyEntries: typeof report = [];

      Object.entries(weeks).forEach(([key, entries]) => {
        const sorted = entries.sort((a, b) => a.km_reading - b.km_reading);
        const [yearStr, weekStr] = key.split('-W');
        if (sorted.length >= 2) {
          const first = sorted[0].km_reading;
          const lastEntry = sorted[sorted.length - 1];
          const last = lastEntry.km_reading;
          
          const driver = employees.find(e => e.id === lastEntry.funcionario_id)?.name;

          vehicleWeeklyEntries.push({
            week: parseInt(weekStr),
            year: parseInt(yearStr),
            vehicleId: v.id,
            vehicle: v.name,
            plate: v.plate,
            initialKm: first,
            finalKm: last,
            diff: last - first,
            lastDriver: driver
          });
        }
      });

      // Identificar a semana de maior rodagem para ESTE veículo
      if (vehicleWeeklyEntries.length > 0) {
        const maxDiff = Math.max(...vehicleWeeklyEntries.map(entry => entry.diff));
        vehicleWeeklyEntries.forEach(entry => {
          if (entry.diff === maxDiff && maxDiff > 0) {
            entry.isPeak = true;
          }
        });
      }

      report.push(...vehicleWeeklyEntries);
    });

    return report.sort((a, b) => (b.year * 100 + b.week) - (a.year * 100 + a.week));
  }, [vehicles, kmLogs, employees]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">Controle de <span className="text-sky-500">Frota</span></h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <Gauge size={14} className="text-sky-500" /> Histórico de Quilometragem Semanal
          </p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-600 transition-all shadow-xl active:scale-95"
          >
            {showHistory ? <Truck size={18} /> : <History size={18} />}
            {showHistory ? 'Lista de Veículos' : 'Relatório de Rodagem'}
          </button>
        </div>
      </header>

      {!showHistory ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <form onSubmit={handleAdd} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">Novo Veículo</h3>
              <div className="space-y-4">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Modelo do Veículo" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" required />
                <input type="text" value={plate} onChange={e => handlePlateChange(e.target.value)} placeholder="Placa" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-mono font-black uppercase" required />
                <input type="text" value={year} onChange={e => setYear(e.target.value)} placeholder="Ano/Modelo" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" />
                <button type="submit" className="w-full h-12 bg-slate-900 text-white font-black rounded-2xl hover:bg-sky-600 transition-all uppercase text-[10px] tracking-widest">Adicionar</button>
              </div>
            </form>

            <form onSubmit={handleLogKm} className="bg-white p-8 rounded-[2.5rem] border border-sky-100 shadow-xl shadow-sky-50/50">
              <h3 className="font-black text-sky-600 text-[10px] uppercase tracking-widest mb-6 border-b border-sky-50 pb-4">Lançar Quilometragem</h3>
              <div className="space-y-4">
                <select value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)} className="w-full h-12 px-5 bg-sky-50 border border-sky-100 rounded-2xl font-bold text-xs outline-none appearance-none" required>
                  <option value="">Selecionar Veículo...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}
                </select>
                <div className="relative">
                  <Gauge className="absolute left-5 top-1/2 -translate-y-1/2 text-sky-300" size={18} />
                  <input type="number" value={kmReading} onChange={e => setKmReading(e.target.value)} placeholder="KM Atual" className="w-full h-12 pl-14 pr-5 bg-sky-50 border border-sky-100 rounded-2xl font-black text-lg outline-none" required />
                </div>
                <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} className="w-full h-12 px-5 bg-sky-50 border border-sky-100 rounded-2xl font-bold text-xs outline-none" required />
                <button type="submit" className="w-full h-12 bg-sky-500 text-white font-black rounded-2xl hover:bg-sky-600 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                  <Save size={16} /> Salvar KM
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map(v => (
              <div key={v.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center shadow-inner">
                    <Truck size={24} />
                  </div>
                  <button onClick={() => onDelete(v.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                </div>
                <h4 className="text-xl font-black text-slate-800 leading-tight">{v.name}</h4>
                <div className="text-sky-500 font-mono font-black text-xs uppercase mt-1 mb-6 flex items-center gap-2">
                   <span className="px-2 py-0.5 bg-sky-50 rounded-lg">{v.plate}</span>
                   <span className="text-slate-300">•</span>
                   <span className="text-slate-400">{v.modelYear}</span>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-[1.8rem] flex items-center justify-between border border-slate-100">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Quilometragem Atual</p>
                    <p className="text-xl font-black text-slate-800">{(v.kmAtual || 0).toLocaleString()} <span className="text-[10px] opacity-40 uppercase ml-1">KM</span></p>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-200 border border-slate-100">
                    <Gauge size={20} />
                  </div>
                </div>
              </div>
            ))}
            {vehicles.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-300 italic flex flex-col items-center">
                 <Truck size={48} className="opacity-20 mb-4" />
                 <p className="text-sm">Nenhum veículo cadastrado para gestão.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between no-print">
            <div>
              <h3 className="font-black text-slate-800 uppercase text-[11px] tracking-widest">Relatório Semanal de Rodagem</h3>
              <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Diferença entre o primeiro e o último KM da semana</p>
            </div>
            <button onClick={() => window.print()} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-sky-500 transition-all shadow-sm">
              <Download size={20} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">
                  <th className="px-8 py-5">Ano/Semana</th>
                  <th className="px-8 py-5">Veículo</th>
                  <th className="px-8 py-5">KM Inicial</th>
                  <th className="px-8 py-5">KM Final</th>
                  <th className="px-8 py-5 text-sky-400">Total Rodado</th>
                  <th className="px-8 py-5">Motorista Resp.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {weeklyMileageReport.map((row, idx) => (
                  <tr key={idx} className={`hover:bg-sky-50/30 transition-colors group ${row.isPeak ? 'bg-amber-50/50' : ''}`}>
                    <td className="px-8 py-5 text-xs font-black text-slate-400">
                      <div className="flex flex-col">
                        <span>{row.year} • Semana {row.week}</span>
                        {row.isPeak && (
                          <span className="text-[7px] font-black text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-md mt-1 w-fit flex items-center gap-1 uppercase">
                            <Award size={8} /> Pico de Rodagem
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-xs font-black text-slate-800 uppercase">{row.vehicle}</div>
                      <div className="text-[10px] font-mono font-black text-sky-400 uppercase">{row.plate}</div>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">{row.initialKm.toLocaleString()} KM</td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">{row.finalKm.toLocaleString()} KM</td>
                    <td className="px-8 py-5">
                      <div className={`flex items-center gap-3 font-black text-lg tracking-tighter ${row.isPeak ? 'text-amber-600' : 'text-sky-600'}`}>
                        <TrendingUp size={18} className={row.isPeak ? 'text-amber-400' : 'text-sky-300'} />
                        {row.diff.toLocaleString()} KM
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {row.lastDriver ? (
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                          <UserCircle size={14} className="text-indigo-400" /> {row.lastDriver}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-bold uppercase italic">Não informado</span>
                      )}
                    </td>
                  </tr>
                ))}
                {weeklyMileageReport.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic text-sm">
                       Aguardando registros históricos para gerar médias semanais.<br/>
                       <span className="text-[10px] uppercase font-black opacity-40 mt-2 block">Mínimo de 2 lançamentos por semana.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-start gap-4 no-print">
             <Calendar size={20} className="text-sky-500 shrink-0" />
             <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
               Este relatório considera todos os dados informados (abastecimentos e lançamentos manuais). 
               A rodagem semanal é a diferença entre a menor e a maior quilometragem registrada em cada período de 7 dias (Segunda a Domingo). O selo <Award size={10} className="inline inline-block text-amber-500" /> indica a semana de maior atividade de cada veículo.
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetView;
