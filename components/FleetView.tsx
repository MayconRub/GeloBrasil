
import React, { useState, useMemo } from 'react';
import { 
  Truck, Car, Bike, Plus, Trash2, Fuel, Wrench, AlertOctagon, 
  BarChart3, X, CheckCircle2, AlertTriangle, Droplets, Pencil, Save, AlertCircle
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

  const stats = useMemo(() => {
    const totalV = vehicles?.length || 0;
    const totalFuel = (fuelLogs || []).reduce((sum, l) => sum + l.valor_total, 0);
    const totalMaint = (maintenanceLogs || []).reduce((sum, l) => sum + l.custo, 0);
    const totalFines = (fineLogs || []).reduce((sum, l) => sum + l.valor, 0);
    const oilAlerts = (vehicles || []).filter(v => (v.km_atual - v.km_ultima_troca) >= 1000).length;
    return { totalV, totalFuel, totalMaint, totalFines, oilAlerts };
  }, [vehicles, fuelLogs, maintenanceLogs, fineLogs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 uppercase">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl">
            <Truck size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none uppercase">GESTÃO DE <span className="text-sky-500">FROTA</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">CENTRAL OPERACIONAL ICE CONTROL</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-[1.8rem]">
          {[
            { id: 'vehicles', label: 'FROTA', icon: Truck },
            { id: 'fuel', label: 'COMBUSTÍVEL', icon: Fuel },
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

      {stats.oilAlerts > 0 && (
         <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl flex items-center gap-4 animate-bounce">
            <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
               <Droplets size={24} />
            </div>
            <div>
               <h4 className="text-sm font-black text-amber-900 uppercase">ATENÇÃO: TROCA DE ÓLEO NECESSÁRIA</h4>
               <p className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">EXISTEM {stats.oilAlerts} VEÍCULO(S) QUE ATINGIRAM O LIMITE DE 1.000KM.</p>
            </div>
         </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="VEÍCULOS" value={stats.totalV} icon={Truck} color="sky" />
        <SummaryCard label="COMBUSTÍVEL" value={`R$ ${stats.totalFuel.toLocaleString()}`} icon={Fuel} color="emerald" />
        <SummaryCard label="MANUTENÇÃO" value={`R$ ${stats.totalMaint.toLocaleString()}`} icon={Wrench} color="indigo" />
        <SummaryCard label="TROCA ÓLEO" value={stats.oilAlerts} icon={Droplets} color="amber" />
      </div>

      {activeTab === 'vehicles' && <VehiclesTab vehicles={vehicles} employees={employees} onUpdate={onUpdateVehicle} onUpdateMaintenance={onUpdateMaintenance} onDelete={onDeleteVehicle} />}
      {activeTab === 'fuel' && <FuelTab logs={fuelLogs} vehicles={vehicles} onUpdate={onUpdateFuel} onDelete={onDeleteFuel} />}
      {activeTab === 'maintenance' && <MaintenanceTab logs={maintenanceLogs} vehicles={vehicles} onUpdate={onUpdateMaintenance} onDelete={onDeleteMaintenance} />}
      {activeTab === 'fines' && <FinesTab logs={fineLogs} vehicles={vehicles} onUpdate={onUpdateFine} onDelete={onDeleteFine} />}
      {activeTab === 'reports' && <ReportsTab vehicles={vehicles} fuel={fuelLogs} maints={maintenanceLogs} fines={fineLogs} />}
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
      <h4 className="text-xl font-black text-slate-800">{value}</h4>
    </div>
  </div>
);

const VehiclesTab = ({ vehicles, onUpdate, onDelete, onUpdateMaintenance }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOilModalOpen, setIsOilModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Vehicle>>({ tipo: 'Caminhão', km_atual: 0, km_ultima_troca: 0 });
  const [oilForm, setOilForm] = useState({ veiculo_id: '', custo: 0, pago: true });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...form, id: form.id || crypto.randomUUID() } as Vehicle);
    setIsOpen(false);
    setForm({ tipo: 'Caminhão', km_atual: 0, km_ultima_troca: 0 });
  };

  const handleOilChange = (e: React.FormEvent) => {
    e.preventDefault();
    const v = vehicles.find((veh:any) => veh.id === oilForm.veiculo_id);
    if (!v) return;

    onUpdateMaintenance({
        id: crypto.randomUUID(),
        veiculo_id: v.id,
        tipo: 'Preventiva',
        servico: 'TROCA DE ÓLEO EFETUADA',
        data: new Date().toISOString().split('T')[0],
        km_registro: v.km_atual,
        custo: oilForm.custo,
        pago: oilForm.pago
    } as MaintenanceLog);
    
    setIsOilModalOpen(false);
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
                  <div className={`w-16 h-16 ${kmSinceOil >= 1000 ? 'bg-amber-500 text-white' : 'bg-sky-50 text-sky-500'} rounded-2xl flex items-center justify-center transition-all`}>
                    {v.tipo === 'Caminhão' ? <Truck size={32} /> : v.tipo === 'Moto' ? <Bike size={32} /> : <Car size={32} />}
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => { setForm(v); setIsOpen(true); }} className="p-3 bg-slate-50 text-slate-300 hover:text-sky-500 rounded-xl transition-all"><Pencil size={18} /></button>
                     <button onClick={() => onDelete(v.id)} className="p-3 bg-slate-50 text-slate-300 hover:text-rose-500 rounded-xl transition-all"><Trash2 size={18} /></button>
                  </div>
               </div>
               <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{v.modelo.toUpperCase()}</h4>
               <span className="inline-block font-mono text-xs font-black text-sky-500 bg-sky-50 px-3 py-1 rounded-lg border border-sky-100 uppercase mt-1">{v.placa.toUpperCase()}</span>
               
               <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">SAÚDE DO ÓLEO ({kmSinceOil} / 1000 KM)</p>
                    {kmSinceOil >= 1000 && <AlertTriangle size={12} className="text-amber-500 animate-pulse" />}
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${kmSinceOil >= 1000 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${oilLifePercent}%` }} />
                  </div>
                  <button 
                    onClick={() => { setOilForm({...oilForm, veiculo_id: v.id}); setIsOilModalOpen(true); }}
                    className="mt-3 w-full py-2 bg-white border border-slate-200 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-500 hover:bg-sky-500 hover:text-white transition-all flex items-center justify-center gap-2"
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
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">KM ATUAL</p>
                    <p className="text-sm font-black text-slate-700">{v.km_atual.toLocaleString()}</p>
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
                    A KM DO VEÍCULO SERÁ ATUALIZADA E O CONTADOR DE ÓLEO SERÁ RESETADO PARA 0KM RODADOS. 
                 </p>
              </div>
              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">CUSTO DA TROCA R$</label>
                    <input type="number" step="0.01" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={oilForm.custo} onChange={e => setOilForm({...oilForm, custo: parseFloat(e.target.value)})} required />
                 </div>
                 <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="flex-1 text-[9px] font-black uppercase text-slate-400 tracking-widest">A MANUTENÇÃO JÁ FOI PAGA?</p>
                    <div className="flex gap-2">
                       <button type="button" onClick={() => setOilForm({...oilForm, pago: true})} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${oilForm.pago ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-400'}`}>SIM</button>
                       <button type="button" onClick={() => setOilForm({...oilForm, pago: false})} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${!oilForm.pago ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-slate-400'}`}>NÃO</button>
                    </div>
                 </div>
              </div>
              <button type="submit" className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> FINALIZAR TROCA
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
                 <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value as any})}>
                    <option>Caminhão</option><option>Carro</option><option>Moto</option>
                 </select>
               </div>
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-slate-400 ml-2">PLACA</label>
                 <input className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs uppercase" value={form.placa} onChange={e => setForm({...form, placa: e.target.value.toUpperCase()})} required placeholder="ABC1D23" />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-slate-400 ml-2">MODELO</label>
                 <input className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value.toUpperCase()})} required placeholder="EX: MERCEDES ACCELO" />
               </div>
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-slate-400 ml-2">ANO</label>
                 <input className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.ano} onChange={e => setForm({...form, ano: e.target.value})} placeholder="2024" />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-slate-400 ml-2">ODÔMETRO ATUAL (KM)</label>
                 <input type="number" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.km_atual || 0} onChange={e => setForm({...form, km_atual: parseInt(e.target.value) || 0})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-slate-400 ml-2">KM ÚLTIMA TROCA</label>
                 <input type="number" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.km_ultima_troca || 0} onChange={e => setForm({...form, km_ultima_troca: parseInt(e.target.value) || 0})} />
               </div>
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

const FuelTab = ({ logs, vehicles, onUpdate, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<FuelLog>>({ data: new Date().toISOString().split('T')[0] });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const l = parseFloat(String(form.litros || 0));
    const v = parseFloat(String(form.valor_litro || 0));
    onUpdate({ ...form, id: form.id || crypto.randomUUID(), valor_total: l * v } as FuelLog);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => setIsOpen(true)} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-emerald-600 transition-all"><Plus size={16} /> NOVO ABASTECIMENTO</button></div>
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b">
            <tr><th className="px-6 py-5">DATA</th><th className="px-6 py-5">VEÍCULO</th><th className="px-6 py-5">LITROS</th><th className="px-6 py-5">CUSTO LITRO</th><th className="px-6 py-5">TOTAL</th><th className="px-6 py-5">KM</th><th className="px-6 py-5 text-center">AÇÃO</th></tr>
          </thead>
          <tbody className="divide-y text-xs font-black text-slate-700">
            {(logs || []).map((l: FuelLog) => (
              <tr key={l.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sky-500">{(vehicles || []).find((v:any) => v.id === l.veiculo_id)?.placa.toUpperCase()}</td>
                <td className="px-6 py-4">{l.litros}L</td>
                <td className="px-6 py-4">R$ {l.valor_litro.toFixed(2)}</td>
                <td className="px-6 py-4 text-emerald-600">R$ {l.valor_total.toLocaleString()}</td>
                <td className="px-6 py-4">{l.km_registro.toLocaleString()}</td>
                <td className="px-6 py-4 text-center"><button onClick={() => onDelete(l.id)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isOpen && (
        <Modal title="LANÇAR ABASTECIMENTO" onClose={() => setIsOpen(false)}>
           <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2">VEÍCULO</label>
                <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs outline-none" value={form.veiculo_id} onChange={e => setForm({...form, veiculo_id: e.target.value})} required>
                  <option value="">SELECIONAR...</option>
                  {(vehicles || []).map((v:any) => <option key={v.id} value={v.id}>{v.placa.toUpperCase()} - {v.modelo.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">DATA</label>
                  <input type="date" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.data} onChange={e => setForm({...form, data: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">COMBUSTÍVEL</label>
                  <input placeholder="EX: DIESEL S10" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.tipo_combustivel} onChange={e => setForm({...form, tipo_combustivel: e.target.value.toUpperCase()})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">QTD LITROS</label>
                  <input type="number" step="0.01" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.litros} onChange={e => setForm({...form, litros: parseFloat(e.target.value)})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">VALOR LITRO R$</label>
                  <input type="number" step="0.01" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.valor_litro} onChange={e => setForm({...form, valor_litro: parseFloat(e.target.value)})} required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2">ODÔMETRO (KM)</label>
                <input type="number" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.km_registro || 0} onChange={e => setForm({...form, km_registro: parseInt(e.target.value) || 0})} required />
              </div>
              <button className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                 <CheckCircle2 size={18} /> CONFIRMAR LANÇAMENTO
              </button>
           </form>
        </Modal>
      )}
    </div>
  );
};

const MaintenanceTab = ({ logs, vehicles, onUpdate, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<MaintenanceLog>>({ tipo: 'Preventiva', data: new Date().toISOString().split('T')[0], pago: true });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...form, id: form.id || crypto.randomUUID() } as MaintenanceLog);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => setIsOpen(true)} className="bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-indigo-600 transition-all"><Plus size={16} /> NOVA MANUTENÇÃO</button></div>
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b">
            <tr><th className="px-6 py-5">DATA</th><th className="px-6 py-5">VEÍCULO</th><th className="px-6 py-5">SERVIÇO</th><th className="px-6 py-5">KM</th><th className="px-6 py-5">CUSTO</th><th className="px-6 py-5">PAGO?</th><th className="px-6 py-5 text-center">AÇÃO</th></tr>
          </thead>
          <tbody className="divide-y text-xs font-black text-slate-700">
            {(logs || []).map((l: MaintenanceLog) => (
              <tr key={l.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sky-500">{(vehicles || []).find((v:any) => v.id === l.veiculo_id)?.placa.toUpperCase()}</td>
                <td className="px-6 py-4 uppercase truncate max-w-[150px]">{l.servico.toUpperCase()}</td>
                <td className="px-6 py-4">{l.km_registro.toLocaleString()}</td>
                <td className="px-6 py-4 text-rose-500">R$ {l.custo.toLocaleString()}</td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${l.pago ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                      {l.pago ? 'PAGO' : 'PENDENTE'}
                   </span>
                </td>
                <td className="px-6 py-4 text-center"><button onClick={() => onDelete(l.id)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isOpen && (
        <Modal title="AGENDAR MANUTENÇÃO" onClose={() => setIsOpen(false)}>
           <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2">VEÍCULO</label>
                <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.veiculo_id} onChange={e => setForm({...form, veiculo_id: e.target.value})} required>
                  <option value="">SELECIONAR...</option>
                  {(vehicles || []).map((v:any) => <option key={v.id} value={v.id}>{v.placa.toUpperCase()} - {v.modelo.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">TIPO</label>
                  <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value as any})}>
                    <option>Preventiva</option><option>Corretiva</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">DATA</label>
                  <input type="date" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.data} onChange={e => setForm({...form, data: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2">DESCRIÇÃO DO SERVIÇO</label>
                <input placeholder="EX: TROCA DE ÓLEO" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.servico} onChange={e => setForm({...form, servico: e.target.value.toUpperCase()})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">KM NO ATO</label>
                  <input type="number" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.km_registro || 0} onChange={e => setForm({...form, km_registro: parseInt(e.target.value) || 0})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">CUSTO TOTAL R$</label>
                  <input type="number" step="0.01" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.custo || 0} onChange={e => setForm({...form, custo: parseFloat(e.target.value) || 0})} required />
                </div>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="flex-1 text-[9px] font-black uppercase text-slate-400 tracking-widest">JÁ FOI PAGO?</p>
                  <div className="flex gap-2">
                     <button type="button" onClick={() => setForm({...form, pago: true})} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${form.pago ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-400'}`}>SIM</button>
                     <button type="button" onClick={() => setForm({...form, pago: false})} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${!form.pago ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-slate-400'}`}>NÃO</button>
                  </div>
              </div>
              <button className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                 <Wrench size={18} /> REGISTRAR MANUTENÇÃO
              </button>
           </form>
        </Modal>
      )}
    </div>
  );
};

const FinesTab = ({ logs, vehicles, onUpdate, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<FineLog>>({ situacao: 'Em aberto', data: new Date().toISOString().split('T')[0] });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...form, id: form.id || crypto.randomUUID() } as FineLog);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => setIsOpen(true)} className="bg-rose-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-rose-600 transition-all"><Plus size={16} /> REGISTRAR MULTA</button></div>
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b">
            <tr><th className="px-6 py-5">DATA</th><th className="px-6 py-5">VEÍCULO</th><th className="px-6 py-5">INFRAÇÃO</th><th className="px-6 py-5">VALOR</th><th className="px-6 py-5">SITUAÇÃO</th><th className="px-6 py-5 text-center">AÇÃO</th></tr>
          </thead>
          <tbody className="divide-y text-xs font-black text-slate-700">
            {(logs || []).map((l: FineLog) => (
              <tr key={l.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sky-500">{(vehicles || []).find((v:any) => v.id === l.veiculo_id)?.placa.toUpperCase()}</td>
                <td className="px-6 py-4 uppercase truncate max-w-[180px]">{l.tipo_infracao.toUpperCase()}</td>
                <td className="px-6 py-4 text-rose-500">R$ {l.valor.toLocaleString()}</td>
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
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2">VEÍCULO</label>
                <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.veiculo_id} onChange={e => setForm({...form, veiculo_id: e.target.value})} required>
                  <option value="">SELECIONAR...</option>
                  {(vehicles || []).map((v:any) => <option key={v.id} value={v.id}>{v.placa.toUpperCase()} - {v.modelo.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">DATA</label>
                  <input type="date" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.data} onChange={e => setForm({...form, data: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">STATUS</label>
                  <select className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.situacao} onChange={e => setForm({...form, situacao: e.target.value as any})}>
                    <option>Em aberto</option><option>Paga</option><option>Recurso</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2">NATUREZA DA INFRAÇÃO</label>
                <input placeholder="EX: EXCESSO DE VELOCIDADE" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.tipo_infracao} onChange={e => setForm({...form, tipo_infracao: e.target.value.toUpperCase()})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">VALOR R$</label>
                  <input type="number" step="0.01" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.valor || 0} onChange={e => setForm({...form, valor: parseFloat(e.target.value) || 0})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">PONTOS</label>
                  <input type="number" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs" value={form.pontos || 0} onChange={e => setForm({...form, pontos: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <button className="w-full h-14 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                 <AlertOctagon size={18} /> REGISTRAR INFRAÇÃO
              </button>
           </form>
        </Modal>
      )}
    </div>
  );
};

const ReportsTab = ({ vehicles, fuel, maints, fines }: any) => {
  const reportData = useMemo(() => {
    return (vehicles || []).map((v: Vehicle) => {
      const vFuel = (fuel || []).filter((l:any) => l.veiculo_id === v.id).reduce((sum:number, l:any) => sum + l.valor_total, 0);
      const vMaint = (maints || []).filter((l:any) => l.veiculo_id === v.id).reduce((sum:number, l:any) => sum + l.custo, 0);
      const vFines = (fines || []).filter((l:any) => l.veiculo_id === v.id).reduce((sum:number, l:any) => sum + l.valor, 0);
      const total = vFuel + vMaint + vFines;
      return { ...v, vFuel, vMaint, vFines, total };
    });
  }, [vehicles, fuel, maints, fines]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {reportData.map((row: any) => (
          <div key={row.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-4 min-w-[220px]">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black shadow-lg">
                {row.placa.slice(-3).toUpperCase()}
              </div>
              <div>
                <h5 className="font-black text-slate-800 uppercase tracking-tight">{row.modelo.toUpperCase()}</h5>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.placa.toUpperCase()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 flex-1">
               <ReportStat label="COMBUSTÍVEL" value={row.vFuel} color="emerald" />
               <ReportStat label="MANUTENÇÃO" value={row.vMaint} color="indigo" />
               <ReportStat label="MULTAS" value={row.vFines} color="rose" />
               <div className="text-right bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">CUSTO TOTAL</p>
                  <p className="text-lg font-black text-slate-900">R$ {row.total.toLocaleString()}</p>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReportStat = ({ label, value, color }: any) => (
  <div>
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-sm font-black text-${color}-600`}>R$ {value.toLocaleString()}</p>
  </div>
);

const Modal = ({ title, children, onClose }: any) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
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
