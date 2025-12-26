
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Briefcase, 
  Banknote, 
  CalendarDays, 
  Printer, 
  Pencil,
  AlertTriangle,
  X,
  Save,
  Percent
} from 'lucide-react';
import { Employee, AppSettings } from '../types';
import { fetchSettings } from '../store';

interface Props {
  employees: Employee[];
  onUpdate: (employee: Employee) => void;
  onDelete: (id: string) => void;
  companyName?: string;
}

const TeamView: React.FC<Props> = ({ employees, onUpdate, onDelete, companyName: initialCompanyName }) => {
  const [settings, setSettings] = useState<Partial<AppSettings>>({
    companyName: initialCompanyName || 'Gelo Brasil',
    cnpj: '',
    address: ''
  });

  useEffect(() => {
    fetchSettings().then(setSettings);
  }, []);

  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [joinedAt, setJoinedAt] = useState(getTodayString());
  const [selectedForPrint, setSelectedForPrint] = useState<Employee | null>(null);

  const handleNumericChange = (val: string, setter: (v: string) => void) => {
    const sanitized = val.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    setter(sanitized);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setRole('');
    setSalary('');
    setJoinedAt(getTodayString());
  };

  const handleEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setName(emp.name);
    setRole(emp.role);
    setSalary(emp.salary?.toString() || '');
    setJoinedAt(new Date(emp.joinedAt).toISOString().split('T')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const numericSalary = salary ? parseFloat(salary) : 0;
    
    if (!name || !role || !joinedAt) return;

    onUpdate({ 
      id: editingId || crypto.randomUUID(), 
      name, 
      role, 
      salary: numericSalary, 
      joinedAt: new Date(joinedAt + 'T00:00:00').toISOString() 
    });
    
    resetForm();
  };

  const handlePrintPaySlip = (emp: Employee) => {
    setSelectedForPrint(emp);
    setTimeout(() => {
      window.print();
      setSelectedForPrint(null);
    }, 100);
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  const getReferenceMonth = () => {
    const months = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
    const now = new Date();
    return `${months[now.getMonth()]} / ${now.getFullYear()}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="no-print">
        <h2 className="text-2xl font-bold text-slate-800">Equipe</h2>
        <p className="text-slate-500">Gestão de colaboradores e impressão de holerites.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
        <div className="lg:col-span-1">
          <form onSubmit={handleAddOrUpdate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-8">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                {editingId ? <Pencil className="text-amber-500" size={18} /> : <UserPlus className="text-indigo-600" size={18} />}
                {editingId ? 'Editar Funcionário' : 'Cadastrar Funcionário'}
              </h3>
              {editingId && (
                <button type="button" onClick={resetForm} className="text-slate-400 hover:text-rose-500 transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do colaborador"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Cargo / Função</label>
                <input 
                  type="text" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Ex: Vendedor"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Salário</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                    <input 
                      type="text" 
                      inputMode="decimal"
                      value={salary}
                      onChange={(e) => handleNumericChange(e.target.value, setSalary)}
                      placeholder="0.00"
                      className="w-full h-11 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs transition-all font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Data de Admissão</label>
                  <input 
                    type="date" 
                    value={joinedAt}
                    onChange={(e) => setJoinedAt(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs transition-all"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className={`w-full h-12 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-2 ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
              >
                {editingId ? <Save size={18} /> : <UserPlus size={18} />}
                {editingId ? 'Salvar Alterações' : 'Adicionar Funcionário'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employees.length === 0 ? (
              <div className="col-span-full py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-center">
                <Users size={48} className="mb-4 opacity-20" />
                <p className="font-medium italic">Nenhum funcionário cadastrado ainda.</p>
              </div>
            ) : (
              employees.map(emp => (
                <div key={emp.id} className={`bg-white p-4 rounded-2xl border transition-all relative overflow-hidden group ${editingId === emp.id ? 'border-indigo-400 ring-2 ring-indigo-50 shadow-lg' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 truncate text-base">{emp.name}</h4>
                      <p className="flex items-center text-slate-500 text-xs font-semibold gap-1.5">
                        <Briefcase size={14} className="text-slate-400" /> {emp.role}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(emp)} className="p-2 text-slate-400 hover:text-amber-600 rounded-xl transition-all"><Pencil size={18} /></button>
                      <button onClick={() => handlePrintPaySlip(emp)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"><Printer size={18} /></button>
                      <button onClick={() => onDelete(emp.id)} className="p-2 text-slate-300 hover:text-rose-500 rounded-xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 mt-4 relative z-10">
                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-tight">
                        <Banknote size={14} /> Salário
                      </div>
                      <span className="text-slate-900 font-black text-sm">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(emp.salary || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedForPrint && (
        <div className="hidden print:flex flex-row bg-white text-black font-sans text-[9px] leading-tight w-[18.5cm] mx-auto overflow-visible p-0">
          
          <div className="flex-1 border border-black flex flex-col">
            
            <div className="flex border-b border-black min-h-[55px]">
              <div className="flex-1 p-2 border-r border-black">
                <p className="text-[7px] font-bold uppercase mb-0.5 leading-none">Empregador</p>
                <div className="flex flex-col">
                  <span className="font-black text-xs uppercase leading-tight">{settings.companyName}</span>
                  <span className="text-[7px] mt-0.5">{settings.address || 'ENDEREÇO NÃO CADASTRADO'}</span>
                  <span className="text-[7px]">CNPJ {settings.cnpj || '00.000.000/0000-00'}</span>
                </div>
              </div>
              <div className="w-[42%] flex flex-col items-center justify-center p-1 text-center">
                <h2 className="text-[10px] font-black uppercase tracking-tight leading-none mb-1">Recibo de Pagamento de Salário</h2>
                <p className="text-[8px] font-bold">Referente {getReferenceMonth()}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 border-b border-black min-h-[45px]">
              <div className="col-span-3 p-1.5 border-r border-black flex flex-col justify-between">
                <div>
                  <p className="text-[7px] font-bold uppercase leading-none mb-0.5">Nome do Funcionário</p>
                  <p className="font-black text-xs uppercase tracking-tight">{selectedForPrint.name}</p>
                </div>
                <div className="flex justify-between items-end border-t border-black/10 mt-1 pt-0.5">
                   <span className="text-[7px] font-bold uppercase italic">PERÍODO: 01 A 30</span>
                   <span className="text-[7px] font-black uppercase">ADMINISTRATIVO</span>
                </div>
              </div>
              <div className="flex flex-col p-1.5 justify-between">
                <div>
                  <p className="text-[7px] font-bold uppercase leading-none mb-0.5">FUNÇÃO</p>
                  <p className="font-black uppercase truncate text-[8px]">{selectedForPrint.role}</p>
                </div>
                <div>
                  <p className="text-[7px] font-bold uppercase leading-none mb-0.5">DATA ADMISSÃO</p>
                  <p className="font-black text-[8px]">{new Date(selectedForPrint.joinedAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col min-h-[380px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-black text-[8px] font-black bg-slate-50">
                    <th className="border-r border-black p-1 text-center w-8">Cód.</th>
                    <th className="border-r border-black p-1 text-left pl-3">Descrição</th>
                    <th className="border-r border-black p-1 text-center w-20">Referência</th>
                    <th className="border-r border-black p-1 text-right w-24 pr-3">Proventos</th>
                    <th className="p-1 text-right w-24 pr-3">Descontos</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[9px]">
                  <tr className="h-5">
                    <td className="border-r border-black text-center text-[8px]">001</td>
                    <td className="border-r border-black pl-3 font-bold uppercase">SALÁRIO</td>
                    <td className="border-r border-black text-center">220:00</td>
                    <td className="border-r border-black text-right pr-3 font-bold">{formatBRL(selectedForPrint.salary || 0)}</td>
                    <td className="text-right pr-3 font-bold"></td>
                  </tr>
                  {[...Array(16)].map((_, i) => (
                    <tr key={i} className="h-5">
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex border-t border-black min-h-[70px]">
              <div className="flex-1 border-r border-black p-2 bg-slate-50/20">
                <p className="text-[7px] font-bold uppercase mb-1 leading-none">Mensagens</p>
                <p className="text-[8px] italic"></p>
              </div>
              <div className="w-[48%] flex flex-col">
                <div className="flex border-b border-black h-10">
                  <div className="flex-1 p-1 border-r border-black text-center flex flex-col justify-center">
                    <p className="text-[7px] font-bold uppercase mb-0.5 leading-none text-[6px]">Total Vencimentos</p>
                    <p className="font-black text-[10px]">{formatBRL(selectedForPrint.salary || 0)}</p>
                  </div>
                  <div className="flex-1 p-1 text-center flex flex-col justify-center">
                    <p className="text-[7px] font-bold uppercase mb-0.5 leading-none text-[6px]">Total Descontos</p>
                    <p className="font-black text-[10px]">{formatBRL(0)}</p>
                  </div>
                </div>
                <div className="flex items-center h-12 bg-slate-50">
                  <div className="flex-1 pl-2">
                    <p className="text-[8px] font-black uppercase tracking-tight">Valor Líquido a Receber --&gt;</p>
                  </div>
                  <div className="w-[100px] pr-2 text-right">
                    <p className="font-black text-[14px] leading-none">
                      {formatBRL(selectedForPrint.salary || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-6 border-t border-black bg-white text-center h-11">
              <div className="p-1 border-r border-black flex flex-col justify-center gap-0.5">
                <p className="text-[6px] font-bold uppercase leading-none">Salário</p>
                <p className="font-black text-[8px]">{formatBRL(selectedForPrint.salary || 0)}</p>
              </div>
              <div className="p-1 border-r border-black flex flex-col justify-center gap-0.5">
                <p className="text-[6px] font-bold uppercase leading-none">Base INSS</p>
                <p className="font-black text-[8px]">{formatBRL(selectedForPrint.salary || 0)}</p>
              </div>
              <div className="p-1 border-r border-black flex flex-col justify-center gap-0.5">
                <p className="text-[6px] font-bold uppercase leading-none">Base Peric.</p>
                <p className="font-black text-[8px]">{formatBRL(0)}</p>
              </div>
              <div className="p-1 border-r border-black flex flex-col justify-center gap-0.5">
                <p className="text-[6px] font-bold uppercase leading-none">Base IRRF</p>
                <p className="font-black text-[8px]">{formatBRL(selectedForPrint.salary || 0)}</p>
              </div>
              <div className="p-1 border-r border-black flex flex-col justify-center gap-0.5">
                <p className="text-[6px] font-bold uppercase leading-none">Vlr IRRF</p>
                <p className="font-black text-[8px]">{formatBRL(0)}</p>
              </div>
              <div className="p-1 flex flex-col justify-center gap-0.5">
                <p className="text-[6px] font-bold uppercase leading-none">Faixa IRRF</p>
                <p className="font-black text-[8px]">ISENTO</p>
              </div>
            </div>
          </div>

          <div className="w-[1.4cm] border-y border-r border-black flex flex-col items-center justify-between py-10 px-0 bg-white ml-[-1px]">
            <div className="font-black text-[7px] uppercase tracking-tighter w-full text-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
               Declaro ter recebido a importância líquida deste recibo.
            </div>
            
            <div className="flex flex-col gap-10 items-center justify-end h-[50%] mb-4">
              <div className="flex flex-col items-center gap-1">
                <p className="text-[6px] font-black uppercase italic">Data</p>
                <p className="text-[8px] font-bold whitespace-nowrap">____ / ____ / ____</p>
              </div>
              <div className="border-t border-black w-[130px] pt-1 text-center" style={{ transform: 'rotate(-90deg)', marginBottom: '50px' }}>
                <p className="text-[7px] font-black uppercase">Assinatura</p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default TeamView;
