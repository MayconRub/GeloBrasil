
import React, { useState, useMemo } from 'react';
import { 
  Truck, Car, Bike, Plus, Trash2, Fuel, Wrench, AlertOctagon, 
  BarChart3, Gauge, Calendar, User, MapPin, DollarSign, 
  ChevronRight, Filter, Search, MoreVertical, CheckCircle2, 
  AlertTriangle, History, Pencil, Save, X, PlusCircle
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  // Stats
  const stats = useMemo(() => {
    const totalV = vehicles.length;
    const totalFuel = fuelLogs.reduce((sum, l) => sum + l.valor_total, 0);
    const totalMaint = maintenanceLogs.reduce((sum, l) => sum + l.custo, 0);
    const totalFines = fineLogs.reduce((sum, l) => sum + l.valor, 0);
    return { totalV, totalFuel, totalMaint, totalFines };
  }, [vehicles, fuelLogs, maintenanceLogs, fineLogs]);

  // Tab Rendering
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl">
            <Truck size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none uppercase">Gestão de <span className="text-sky-500">Frota</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Controle Operacional Completo</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-[1.8rem]">
          {[
            { id: 'vehicles', label: 'Frota', icon: Truck },
            { id: 'fuel', label: 'Abastecimento', icon: Fuel },
            { id: 'maintenance', label: 'Manutenção', icon: Wrench },
            { id: 'fines', label: 'Multas', icon: AlertOctagon },
            { id: 'reports', label: 'Relatórios', icon: BarChart3 },
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 rounded-[1.4rem] text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon size={14} /> <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Veículos Ativos" value={stats.totalV} icon={Truck} color="sky" />
        <SummaryCard label="Gasto Combustível" value={`R$ ${stats.totalFuel.toLocaleString()}`} icon={Fuel} color="emerald" />
        <SummaryCard label="Investido em Maint." value={`R$ ${stats.totalMaint.toLocaleString()}`} icon={Wrench} color="indigo" />
        <SummaryCard label="Total Multas" value={`R$ ${stats.totalFines.toLocaleString()}`} icon={AlertOctagon} color="rose" />
      </div>

      {activeTab === 'vehicles' && <VehiclesTab vehicles={vehicles} employees={employees} onUpdate={onUpdateVehicle} onDelete={onDeleteVehicle} />}
      {activeTab === 'fuel' && <FuelTab logs={fuelLogs} vehicles={vehicles} onUpdate={onUpdateFuel} onDelete={onDeleteFuel} />}
      {activeTab === 'maintenance' && <MaintenanceTab logs={maintenanceLogs} vehicles={vehicles} onUpdate={onUpdateMaintenance} onDelete={onDeleteMaintenance} />}
      {activeTab === 'fines' && <FinesTab logs={fineLogs} vehicles={vehicles} onUpdate={onUpdateFine} onDelete={onDeleteFine} />}
      {activeTab === 'reports' && <ReportsTab vehicles={vehicles} fuel={fuelLogs} maints={maintenanceLogs} fines={fineLogs} />}
    </div>
  );
};

// COMPONENTES AUXILIARES
const SummaryCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 bg-${color}-50 text-${color}-500 rounded-2xl flex items-center justify-center`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-xl font-black text-slate-800 tracking-tighter">{value}</h4>
    </div>
  </div>
);

// ABA: VEÍCULOS
const VehiclesTab = ({ vehicles, employees, onUpdate, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<Vehicle>>({ tipo: 'Caminhão', km_atual: 0 });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...form, id: form.id || crypto.randomUUID() } as Vehicle);
    setIsOpen(false);
    setForm({ tipo: 'Caminhão', km_atual: 0 });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setIsOpen(true)} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg">
          <Plus size={16} /> Novo Veículo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v: Vehicle) => (
          <div key={v.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
             <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center">
                  {v.tipo === 'Caminhão' ? <Truck size={28} /> : v.tipo === 'Moto' ? <Bike size={28} /> : <Car size={28} />}
                </div>
                <button onClick={() => onDelete(v.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
             </div>
             <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{v.modelo}</h4>
             <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-4">{v.placa}</p>
             <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ano</p>
                  <p className="text-xs font-black text-slate-700">{v.ano}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">KM Atual</p>
                  <p className="text-xs font-black text-slate-700">{v.km_atual.toLocaleString()}</p>
                </div>
             </div>
          </div>
        ))}
      </div>

      {isOpen && (
        <Modal title="Cadastro de Veículo" onClose={() => setIsOpen(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div><label className="text-[9px] font-black uppercase text-slate-400">Tipo</label>
               <select className="w-full h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value as any})}>
                  <option>Caminhão</option><option>Carro</option><option>Moto</option>
               </select></div>
               <div><label className="text-[9px] font-black uppercase text-slate-400">Placa</label>
               <input className="w-full h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.placa} onChange={e => setForm({...form, placa: e.target.value.toUpperCase()})} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div><label className="text-[9px] font-black uppercase text-slate-400">Modelo</label>
               <input className="w-full h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} required /></div>
               <div><label className="text-[9px] font-black uppercase text-slate-400">Ano</label>
               <input className="w-full h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.ano} onChange={e => setForm({...form, ano: e.target.value})} required /></div>
            </div>
            <div><label className="text-[9px] font-black uppercase text-slate-400">Quilometragem Inicial</label>
            <input type="number" className="w-full h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.km_atual} onChange={e => setForm({...form, km_atual: parseInt(e.target.value)})} /></div>
            <button type="submit" className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Salvar Veículo</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ABA: ABASTECIMENTO
const FuelTab = ({ logs, vehicles, onUpdate, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<FuelLog>>({ data: new Date().toISOString().split('T')[0] });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const lit = parseFloat(String(form.litros || 0));
    const val = parseFloat(String(form.valor_litro || 0));
    onUpdate({ ...form, id: form.id || crypto.randomUUID(), valor_total: lit * val } as FuelLog);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => setIsOpen(true)} className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg"><Plus size={16} /> Novo Abastecimento</button></div>
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b">
            <tr><th className="px-6 py-4">Data</th><th className="px-6 py-4">Veículo</th><th className="px-6 py-4">Litros</th><th className="px-6 py-4">Total</th><th className="px-6 py-4">KM Registro</th><th className="px-6 py-4">Ação</th></tr>
          </thead>
          <tbody className="divide-y text-xs font-bold text-slate-700">
            {logs.map((l: FuelLog) => (
              <tr key={l.id}>
                <td className="px-6 py-4">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td>
                <td className="px-6 py-4">{vehicles.find((v:any) => v.id === l.veiculo_id)?.placa}</td>
                <td className="px-6 py-4">{l.litros}L</td>
                <td className="px-6 py-4 text-emerald-600">R$ {l.valor_total.toLocaleString()}</td>
                <td className="px-6 py-4">{l.km_registro.toLocaleString()}</td>
                <td className="px-6 py-4"><button onClick={() => onDelete(l.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isOpen && (
        <Modal title="Lançar Abastecimento" onClose={() => setIsOpen(false)}>
           <form onSubmit={handleSave} className="space-y-4">
              <select className="w-full h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.veiculo_id} onChange={e => setForm({...form, veiculo_id: e.target.value})} required>
                <option value="">Selecionar Veículo...</option>
                {vehicles.map((v:any) => <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.data} onChange={e => setForm({...form, data: e.target.value})} required />
                <input placeholder="Tipo Combustível (Ex: Diesel)" className="h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.tipo_combustivel} onChange={e => setForm({...form, tipo_combustivel: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Litros" className="h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.litros} onChange={e => setForm({...form, litros: parseFloat(e.target.value)})} required />
                <input type="number" step="0.01" placeholder="Valor por Litro" className="h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.valor_litro} onChange={e => setForm({...form, valor_litro: parseFloat(e.target.value)})} required />
              </div>
              <input type="number" placeholder="Quilometragem no Ato" className="w-full h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.km_registro} onChange={e => setForm({...form, km_registro: parseInt(e.target.value)})} required />
              <button className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Confirmar Abastecimento</button>
           </form>
        </Modal>
      )}
    </div>
  );
};

// ABA: MANUTENÇÃO
const MaintenanceTab = ({ logs, vehicles, onUpdate, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<MaintenanceLog>>({ tipo: 'Preventiva', data: new Date().toISOString().split('T')[0] });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...form, id: form.id || crypto.randomUUID() } as MaintenanceLog);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => setIsOpen(true)} className="bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg"><Plus size={16} /> Nova Manutenção</button></div>
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b">
            <tr><th className="px-6 py-4">Data</th><th className="px-6 py-4">Veículo</th><th className="px-6 py-4">Serviço</th><th className="px-6 py-4">Custo</th><th className="px-6 py-4">Tipo</th><th className="px-6 py-4">Próxima</th><th className="px-6 py-4">Ação</th></tr>
          </thead>
          <tbody className="divide-y text-xs font-bold text-slate-700">
            {logs.map((l: MaintenanceLog) => (
              <tr key={l.id}>
                <td className="px-6 py-4">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td>
                <td className="px-6 py-4">{vehicles.find((v:any) => v.id === l.veiculo_id)?.placa}</td>
                <td className="px-6 py-4 uppercase">{l.servico}</td>
                <td className="px-6 py-4 text-rose-500">R$ {l.custo.toLocaleString()}</td>
                <td className="px-6 py-4">{l.tipo}</td>
                <td className="px-6 py-4 text-sky-500">{l.proxima_maint_km ? `${l.proxima_maint_km.toLocaleString()} KM` : 'N/D'}</td>
                <td className="px-6 py-4"><button onClick={() => onDelete(l.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isOpen && (
        <Modal title="Agendar Manutenção" onClose={() => setIsOpen(false)}>
           <form onSubmit={handleSave} className="space-y-4">
              <select className="w-full h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.veiculo_id} onChange={e => setForm({...form, veiculo_id: e.target.value})} required>
                <option value="">Selecionar Veículo...</option>
                {vehicles.map((v:any) => <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <select className="h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value as any})}>
                  <option>Preventiva</option><option>Corretiva</option>
                </select>
                <input type="date" className="h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.data} onChange={e => setForm({...form, data: e.target.value})} required />
              </div>
              <input placeholder="Serviço Realizado (Ex: Troca de Óleo)" className="w-full h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.servico} onChange={e => setForm({...form, servico: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="KM Registro" className="h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.km_registro} onChange={e => setForm({...form, km_registro: parseInt(e.target.value)})} required />
                <input type="number" step="0.01" placeholder="Custo Total R$" className="h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.custo} onChange={e => setForm({...form, custo: parseFloat(e.target.value)})} required />
              </div>
              <div className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-3">
                 <p className="text-[10px] font-black uppercase text-sky-500 tracking-widest">Previsão Próxima Manutenção</p>
                 <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Próxima KM" className="h-10 px-4 bg-white rounded-xl text-[10px] font-black" value={form.proxima_maint_km} onChange={e => setForm({...form, proxima_maint_km: parseInt(e.target.value)})} />
                    <input type="date" className="h-10 px-4 bg-white rounded-xl text-[10px] font-black" value={form.proxima_maint_data} onChange={e => setForm({...form, proxima_maint_data: e.target.value})} />
                 </div>
              </div>
              <button className="w-full h-14 bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Salvar Registro</button>
           </form>
        </Modal>
      )}
    </div>
  );
};

// ABA: MULTAS
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
      <div className="flex justify-end"><button onClick={() => setIsOpen(true)} className="bg-rose-500 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg"><Plus size={16} /> Registrar Multa</button></div>
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b">
            <tr><th className="px-6 py-4">Data</th><th className="px-6 py-4">Veículo</th><th className="px-6 py-4">Infração</th><th className="px-6 py-4">Valor</th><th className="px-6 py-4">Pontos</th><th className="px-6 py-4">Situação</th><th className="px-6 py-4">Ação</th></tr>
          </thead>
          <tbody className="divide-y text-xs font-bold text-slate-700">
            {logs.map((l: FineLog) => (
              <tr key={l.id}>
                <td className="px-6 py-4">{new Date(l.data + 'T00:00:00').toLocaleDateString()}</td>
                <td className="px-6 py-4">{vehicles.find((v:any) => v.id === l.veiculo_id)?.placa}</td>
                <td className="px-6 py-4 truncate max-w-[150px]">{l.tipo_infracao}</td>
                <td className="px-6 py-4">R$ {l.valor.toLocaleString()}</td>
                <td className="px-6 py-4">{l.pontos}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[8px] uppercase font-black ${l.situacao === 'Paga' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{l.situacao}</span>
                </td>
                <td className="px-6 py-4"><button onClick={() => onDelete(l.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isOpen && (
        <Modal title="Lançar Infração" onClose={() => setIsOpen(false)}>
           <form onSubmit={handleSave} className="space-y-4">
              <select className="w-full h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.veiculo_id} onChange={e => setForm({...form, veiculo_id: e.target.value})} required>
                <option value="">Selecionar Veículo...</option>
                {vehicles.map((v:any) => <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.data} onChange={e => setForm({...form, data: e.target.value})} required />
                <select className="h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.situacao} onChange={e => setForm({...form, situacao: e.target.value as any})}>
                  <option>Em aberto</option><option>Paga</option><option>Recurso</option>
                </select>
              </div>
              <input placeholder="Tipo de Infração" className="w-full h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.tipo_infracao} onChange={e => setForm({...form, tipo_infracao: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Valor R$" className="h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.valor} onChange={e => setForm({...form, valor: parseFloat(e.target.value)})} required />
                <input type="number" placeholder="Pontos" className="h-12 px-4 bg-slate-50 rounded-xl font-bold" value={form.pontos} onChange={e => setForm({...form, pontos: parseInt(e.target.value)})} />
              </div>
              <button className="w-full h-14 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Registrar Multa</button>
           </form>
        </Modal>
      )}
    </div>
  );
};

// ABA: RELATÓRIOS (INTELIGENTES)
const ReportsTab = ({ vehicles, fuel, maints, fines }: any) => {
  const reportData = useMemo(() => {
    return vehicles.map((v: Vehicle) => {
      const vFuel = fuel.filter((l:any) => l.veiculo_id === v.id);
      const vFuelTotal = vFuel.reduce((sum:number, l:any) => sum + l.valor_total, 0);
      const vMaintTotal = maints.filter((l:any) => l.veiculo_id === v.id).reduce((sum:number, l:any) => sum + l.custo, 0);
      const vFinesTotal = fines.filter((l:any) => l.veiculo_id === v.id).reduce((sum:number, l:any) => sum + l.valor, 0);
      
      const totalCost = vFuelTotal + vMaintTotal + vFinesTotal;
      
      // Média Consumo (Exemplo básico: KM percorridos / Litros)
      const sortedFuel = [...vFuel].sort((a,b) => b.km_registro - a.km_registro);
      let kmL = 0;
      if (sortedFuel.length > 1) {
          const totalKm = sortedFuel[0].km_registro - sortedFuel[sortedFuel.length - 1].km_registro;
          const totalLitros = sortedFuel.reduce((sum:number, l:any) => sum + l.litros, 0);
          kmL = totalKm / totalLitros;
      }

      return { ...v, vFuelTotal, vMaintTotal, vFinesTotal, totalCost, kmL };
    });
  }, [vehicles, fuel, maints, fines]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {reportData.map((row: any) => (
          <div key={row.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-4 min-w-[200px]">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black">
                {row.placa.slice(-3)}
              </div>
              <div>
                <h5 className="font-black text-slate-800 uppercase tracking-tight">{row.modelo}</h5>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.placa}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 flex-1">
               <ReportStat label="Combustível" value={row.vFuelTotal} color="emerald" />
               <ReportStat label="Manutenção" value={row.vMaintTotal} color="indigo" />
               <ReportStat label="Multas" value={row.vFinesTotal} color="rose" />
               <div className="bg-slate-50 p-4 rounded-3xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Média Consumo</p>
                  <p className="text-sm font-black text-slate-900">{row.kmL > 0 ? `${row.kmL.toFixed(2)} km/l` : 'N/D'}</p>
               </div>
            </div>

            <div className="text-right bg-slate-900 text-white px-8 py-4 rounded-[1.8rem] min-w-[180px]">
               <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">Custo Total</p>
               <h4 className="text-xl font-black">R$ {row.totalCost.toLocaleString()}</h4>
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

// MODAL REUTILIZÁVEL
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
