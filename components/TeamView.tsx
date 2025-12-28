
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Briefcase, 
  Banknote, 
  CalendarDays, 
  Printer, 
  Pencil,
  X,
  Save,
  UserCircle2,
  TrendingUp,
  Wallet,
  Clock,
  IdCard
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

  // Estatísticas da Equipe
  const stats = useMemo(() => {
    const totalSalary = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    const avgSalary = employees.length > 0 ? totalSalary / employees.length : 0;
    return { totalSalary, avgSalary, count: employees.length };
  }, [employees]);

  const handleNumericChange = (val: string, setter: (v: string) => void) => {
    const sanitized = val.replace(/[^0-9.,]/g, '').replace(',', '.');
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
    const numericSalary = parseFloat(salary);
    if (!name || !role || isNaN(numericSalary)) return;

    onUpdate({ 
      id: editingId || crypto.randomUUID(), 
      name: name.toUpperCase(), 
      role: role.toUpperCase(), 
      salary: numericSalary, 
      joinedAt: new Date(joinedAt + 'T00:00:00').toISOString() 
    });
    
    resetForm();
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getReferenceMonth = () => {
    const months = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
    const now = new Date();
    return `${months[now.getMonth()]} / ${now.getFullYear()}`;
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      
      {/* Header Profissional com Stats */}
      <header className="flex flex-col lg:flex-row items-center justify-between gap-6 no-print">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center shadow-xl">
            <Users size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">GESTÃO DE <span className="text-sky-500">EQUIPE</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <IdCard size={14} className="text-sky-500" /> Colaboradores e Folha de Pagamento
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">TOTAL TIME</p>
              <h4 className="text-xl font-black text-slate-800">{stats.count}</h4>
            </div>
          </div>
          <div className="bg-white px-6 py-3 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">FOLHA MENSAL</p>
              <h4 className="text-xl font-black text-slate-800">{formatBRL(stats.totalSalary)}</h4>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
        
        {/* Formulário lateral */}
        <div className="lg:col-span-4">
          <form onSubmit={handleAddOrUpdate} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-8">
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-8 flex items-center gap-3 border-b border-slate-50 pb-4">
              {editingId ? <Pencil className="text-sky-500" size={18} /> : <UserPlus className="text-sky-500" size={18} />}
              {editingId ? 'Editar Cadastro' : 'Novo Colaborador'}
            </h3>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nome do Funcionário</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="NOME COMPLETO"
                  className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs uppercase focus:ring-4 focus:ring-sky-50 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Cargo / Função</label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="text" 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="EX: VENDEDOR"
                    className="w-full h-12 pl-10 pr-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Salário Base</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 font-bold text-xs">R$</span>
                    <input 
                      type="text" 
                      value={salary}
                      onChange={(e) => handleNumericChange(e.target.value, setSalary)}
                      placeholder="0,00"
                      className="w-full h-12 pl-10 pr-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Admissão</label>
                  <input 
                    type="date" 
                    value={joinedAt}
                    onChange={(e) => setJoinedAt(e.target.value)}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-sky-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {editingId ? <Save size={18} /> : <UserPlus size={18} />}
                  {editingId ? 'Atualizar' : 'Contratar'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Lista de Cards */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {employees.length === 0 ? (
              <div className="col-span-full py-32 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                <Users size={64} className="mb-4 opacity-20" />
                <p className="font-black text-[10px] uppercase tracking-widest">Nenhum colaborador registrado</p>
              </div>
            ) : (
              employees.map(emp => (
                <div key={emp.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  {/* Background Accents */}
                  <div className="absolute -right-4 -top-4 text-slate-50 group-hover:text-sky-50 transition-colors">
                    <UserCircle2 size={120} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 text-sm uppercase leading-tight">{emp.name}</h4>
                          <span className="inline-block px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[8px] font-black uppercase border border-sky-100 mt-1">
                            {emp.role}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(emp)} className="p-2 text-slate-400 hover:text-sky-500 rounded-xl transition-all"><Pencil size={16} /></button>
                        <button onClick={() => onDelete(emp.id)} className="p-2 text-slate-300 hover:text-rose-500 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Banknote size={10} /> Salário
                        </p>
                        <p className="text-sm font-black text-slate-800">{formatBRL(emp.salary || 0)}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Clock size={10} /> Admissão
                        </p>
                        <p className="text-sm font-black text-slate-800">{new Date(emp.joinedAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => { setSelectedForPrint(emp); setTimeout(() => { window.print(); setSelectedForPrint(null); }, 100); }}
                      className="w-full mt-4 h-12 border-2 border-slate-50 hover:bg-slate-900 hover:text-white hover:border-slate-900 rounded-2xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all text-slate-400"
                    >
                      <Printer size={16} /> Emitir Holerite
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Holerite Estilizado para Impressão */}
      {selectedForPrint && (
        <div className="hidden print:flex flex-row bg-white text-black font-sans text-[9px] leading-tight w-[18.5cm] mx-auto overflow-visible p-0 uppercase">
          <div className="flex-1 border-2 border-black flex flex-col">
            <div className="flex border-b-2 border-black min-h-[60px]">
              <div className="flex-1 p-3 border-r-2 border-black">
                <p className="text-[7px] font-bold uppercase mb-1">Empregador</p>
                <div className="flex flex-col">
                  <span className="font-black text-sm leading-tight">{settings.companyName}</span>
                  <span className="text-[8px] mt-1">{settings.address || 'ENDEREÇO NÃO CADASTRADO'}</span>
                  <span className="text-[8px]">CNPJ {settings.cnpj || '00.000.000/0000-00'}</span>
                </div>
              </div>
              <div className="w-[40%] flex flex-col items-center justify-center p-2 text-center">
                <h2 className="text-[11px] font-black uppercase tracking-tight leading-none mb-1">Recibo de Pagamento</h2>
                <p className="text-[9px] font-bold">Referente {getReferenceMonth()}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 border-b-2 border-black min-h-[50px]">
              <div className="col-span-3 p-2 border-r-2 border-black flex flex-col justify-between">
                <div>
                  <p className="text-[7px] font-bold mb-1">Nome do Funcionário</p>
                  <p className="font-black text-xs tracking-tight">{selectedForPrint.name}</p>
                </div>
              </div>
              <div className="flex flex-col p-2 justify-between">
                <div>
                  <p className="text-[7px] font-bold mb-1">FUNÇÃO</p>
                  <p className="font-black uppercase text-[9px]">{selectedForPrint.role}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col min-h-[400px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-black text-[9px] font-black bg-slate-100">
                    <th className="border-r-2 border-black p-2 text-center w-12">Cód.</th>
                    <th className="border-r-2 border-black p-2 text-left pl-4">Descrição</th>
                    <th className="border-r-2 border-black p-2 text-center w-24">Ref.</th>
                    <th className="border-r-2 border-black p-2 text-right w-28 pr-4">Proventos</th>
                    <th className="p-2 text-right w-28 pr-4">Descontos</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[10px]">
                  <tr className="h-6">
                    <td className="border-r-2 border-black text-center">001</td>
                    <td className="border-r-2 border-black pl-4 font-black">SALÁRIO BASE</td>
                    <td className="border-r-2 border-black text-center">30 DIAS</td>
                    <td className="border-r-2 border-black text-right pr-4 font-black">{formatBRL(selectedForPrint.salary || 0)}</td>
                    <td className="text-right pr-4"></td>
                  </tr>
                  {[...Array(15)].map((_, i) => (
                    <tr key={i} className="h-6">
                      <td className="border-r-2 border-black"></td>
                      <td className="border-r-2 border-black"></td>
                      <td className="border-r-2 border-black"></td>
                      <td className="border-r-2 border-black"></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex border-t-2 border-black min-h-[80px]">
              <div className="flex-1 border-r-2 border-black p-3 bg-slate-50">
                <p className="text-[7px] font-bold mb-1">Mensagens / Observações</p>
                <p className="text-[9px] italic">Declaro ter recebido a importância líquida discriminada neste recibo.</p>
              </div>
              <div className="w-[50%] flex flex-col">
                <div className="flex border-b-2 border-black h-12">
                  <div className="flex-1 p-2 border-r-2 border-black text-center flex flex-col justify-center">
                    <p className="text-[7px] font-bold">Total Vencimentos</p>
                    <p className="font-black text-xs">{formatBRL(selectedForPrint.salary || 0)}</p>
                  </div>
                  <div className="flex-1 p-2 text-center flex flex-col justify-center">
                    <p className="text-[7px] font-bold">Total Descontos</p>
                    <p className="font-black text-xs">{formatBRL(0)}</p>
                  </div>
                </div>
                <div className="flex items-center h-14 bg-slate-100">
                  <div className="flex-1 pl-4">
                    <p className="text-[10px] font-black uppercase tracking-tight">Valor Líquido</p>
                  </div>
                  <div className="w-[120px] pr-4 text-right">
                    <p className="font-black text-lg leading-none">
                      {formatBRL(selectedForPrint.salary || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 border-t-2 border-black text-center h-12">
              <div className="p-1 border-r-2 border-black flex flex-col justify-center">
                <p className="text-[6px] font-bold">Salário Base</p>
                <p className="font-black text-[9px]">{formatBRL(selectedForPrint.salary || 0)}</p>
              </div>
              <div className="p-1 border-r-2 border-black flex flex-col justify-center">
                <p className="text-[6px] font-bold">Contr. Previdenciária</p>
                <p className="font-black text-[9px]">{formatBRL(0)}</p>
              </div>
              <div className="p-1 border-r-2 border-black flex flex-col justify-center">
                <p className="text-[6px] font-bold">Base Cálc. FGTS</p>
                <p className="font-black text-[9px]">{formatBRL(selectedForPrint.salary || 0)}</p>
              </div>
              <div className="p-1 border-r-2 border-black flex flex-col justify-center">
                <p className="text-[6px] font-bold">FGTS do Mês</p>
                <p className="font-black text-[9px]">{formatBRL(0)}</p>
              </div>
              <div className="p-1 flex flex-col justify-center">
                <p className="text-[6px] font-bold">Base Cálc. IRRF</p>
                <p className="font-black text-[9px]">{formatBRL(0)}</p>
              </div>
            </div>
          </div>

          {/* Destacável de Assinatura Lateral */}
          <div className="w-[1.5cm] border-y-2 border-r-2 border-black flex flex-col items-center justify-between py-12 bg-white ml-[-2px]">
            <div className="font-black text-[8px] uppercase tracking-tighter w-full text-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
               COMPROVANTE DE RECEBIMENTO - {settings.companyName}
            </div>
            
            <div className="flex flex-col gap-12 items-center justify-end h-[60%] mb-8">
              <div className="flex flex-col items-center gap-2">
                <p className="text-[7px] font-black uppercase italic">Data</p>
                <p className="text-[9px] font-bold whitespace-nowrap">____/____/____</p>
              </div>
              <div className="border-t-2 border-black w-[150px] pt-2 text-center" style={{ transform: 'rotate(-90deg)', marginBottom: '60px' }}>
                <p className="text-[8px] font-black uppercase">Assinatura do Funcionário</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamView;
