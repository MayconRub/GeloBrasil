
import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Briefcase, 
  Banknote, 
  CalendarDays, 
  Printer, 
  ShieldCheck, 
  PiggyBank,
  Pencil,
  AlertTriangle,
  X,
  Save
} from 'lucide-react';
import { Employee } from '../types';

interface Props {
  employees: Employee[];
  onUpdate: (employees: Employee[]) => void;
  companyName?: string;
}

const TeamView: React.FC<Props> = ({ employees, onUpdate, companyName = "Gelo Brasil" }) => {
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [inss, setInss] = useState('');
  const [fgts, setFgts] = useState('');
  const [isDangerous, setIsDangerous] = useState(false);
  const [joinedAt, setJoinedAt] = useState(getTodayString());
  const [selectedForPrint, setSelectedForPrint] = useState<Employee | null>(null);

  const handleCurrencyChange = (val: string, setter: (v: string) => void) => {
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
    setInss('');
    setFgts('');
    setIsDangerous(false);
    setJoinedAt(getTodayString());
  };

  const handleEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setName(emp.name);
    setRole(emp.role);
    setSalary(emp.salary?.toString() || '');
    setInss(emp.inss?.toString() || '');
    setFgts(emp.fgts?.toString() || '');
    setIsDangerous(emp.isDangerous || false);
    setJoinedAt(new Date(emp.joinedAt).toISOString().split('T')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const numericSalary = salary ? parseFloat(salary) : undefined;
    const numericInss = inss ? parseFloat(inss) : 0;
    const numericFgts = fgts ? parseFloat(fgts) : 0;
    
    if (!name || !role || !joinedAt) return;

    if (editingId) {
      const updatedEmployees = employees.map(emp => 
        emp.id === editingId 
          ? { ...emp, name, role, salary: numericSalary, inss: numericInss, fgts: numericFgts, isDangerous, joinedAt: new Date(joinedAt + 'T00:00:00').toISOString() }
          : emp
      );
      onUpdate(updatedEmployees);
    } else {
      const newEmp: Employee = {
        id: crypto.randomUUID(),
        name,
        role,
        salary: numericSalary,
        inss: numericInss,
        fgts: numericFgts,
        isDangerous,
        joinedAt: new Date(joinedAt + 'T00:00:00').toISOString()
      };
      onUpdate([...employees, newEmp]);
    }
    
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Deseja realmente excluir este colaborador?')) {
      onUpdate(employees.filter(e => e.id !== id));
      if (editingId === id) resetForm();
    }
  };

  const handlePrintPaySlip = (emp: Employee) => {
    setSelectedForPrint(emp);
    setTimeout(() => {
      window.print();
      setSelectedForPrint(null);
    }, 100);
  };

  const calculateDangerousnessValue = (baseSalary?: number) => {
    if (!baseSalary) return 0;
    return baseSalary * 0.3;
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="no-print">
        <h2 className="text-2xl font-bold text-slate-800">Equipe</h2>
        <p className="text-slate-500">Gestão de colaboradores, cargos e encargos.</p>
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
              
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Salário Base</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                    <input 
                      type="text" 
                      inputMode="decimal"
                      value={salary}
                      onChange={(e) => handleCurrencyChange(e.target.value, setSalary)}
                      placeholder="0.00"
                      className="w-full h-11 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs transition-all font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                    <input 
                      type="checkbox" 
                      checked={isDangerous}
                      onChange={(e) => setIsDangerous(e.target.checked)}
                      className="w-5 h-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 transition-all"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-700">Periculosidade (30%)</p>
                      <p className="text-[10px] text-slate-400 font-medium">Adicional sobre o salário base</p>
                    </div>
                    <AlertTriangle size={16} className={isDangerous ? "text-amber-500" : "text-slate-200"} />
                  </label>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Desconto INSS</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                    <input 
                      type="text" 
                      inputMode="decimal"
                      value={inss}
                      onChange={(e) => handleCurrencyChange(e.target.value, setInss)}
                      placeholder="0.00"
                      className="w-full h-11 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Base FGTS</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                    <input 
                      type="text" 
                      inputMode="decimal"
                      value={fgts}
                      onChange={(e) => handleCurrencyChange(e.target.value, setFgts)}
                      placeholder="0.00"
                      className="w-full h-11 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="col-span-2">
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
                      <button 
                        onClick={() => handleEdit(emp)}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handlePrintPaySlip(emp)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Imprimir Contra-cheque"
                      >
                        <Printer size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(emp.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 relative z-10">
                    <div className="col-span-2 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-tight">
                        <Banknote size={14} /> Salário Base
                      </div>
                      <span className="text-slate-900 font-black text-sm">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(emp.salary || 0)}
                      </span>
                    </div>
                    
                    {emp.isDangerous && (
                      <div className="col-span-2 flex items-center justify-between bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                        <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-tight">
                          <AlertTriangle size={14} /> Periculosidade (30%)
                        </div>
                        <span className="text-amber-900 font-black text-sm">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateDangerousnessValue(emp.salary))}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1 bg-rose-50/50 p-2 rounded-xl border border-rose-100">
                      <div className="flex items-center gap-1.5 text-rose-600 font-bold text-[9px] uppercase tracking-widest">
                        <ShieldCheck size={12} /> INSS
                      </div>
                      <span className="text-rose-900 font-bold text-xs">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(emp.inss || 0)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 bg-sky-50/50 p-2 rounded-xl border border-sky-100">
                      <div className="flex items-center gap-1.5 text-sky-600 font-bold text-[9px] uppercase tracking-widest">
                        <PiggyBank size={12} /> FGTS
                      </div>
                      <span className="text-sky-900 font-bold text-xs">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(emp.fgts || 0)}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center gap-2 text-slate-400 text-[9px] font-bold bg-slate-50 px-3 py-1.5 rounded-lg w-full">
                      <CalendarDays size={12} /> <span className="uppercase tracking-widest">Admissão:</span> {new Date(emp.joinedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PAY SLIP PRINT VIEW (MODAL HOLERITE PROFISSIONAL) */}
      {selectedForPrint && (
        <div className="hidden print:block p-0 bg-white text-black font-sans text-[10px] leading-tight w-full">
          <div className="border border-black flex flex-col w-full relative">
            
            {/* Header Empregador */}
            <div className="flex border-b border-black">
              <div className="flex-1 p-2 border-r border-black">
                <p className="text-[8px] font-bold uppercase mb-0.5">Empregador</p>
                <p className="font-black text-sm uppercase">{companyName}</p>
                <p className="text-[9px]">Endereço da Empresa - CNPJ: 00.000.000/0001-00</p>
              </div>
              <div className="w-[30%] p-2 flex flex-col items-center justify-center">
                <p className="text-sm font-black uppercase text-center">Recibo de Pagamento de Salário</p>
                <p className="text-[9px] font-bold mt-1">Referente {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}</p>
              </div>
            </div>

            {/* Employee Data */}
            <div className="grid grid-cols-4 border-b border-black">
              <div className="col-span-3 p-2 border-r border-black">
                <p className="text-[8px] font-bold uppercase mb-1">Nome do Funcionário</p>
                <p className="font-black text-sm">{selectedForPrint.name}</p>
              </div>
              <div className="p-2">
                <p className="text-[8px] font-bold uppercase mb-1">Código / CBO</p>
                <p className="font-black">000000 / ADMIN</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 border-b border-black bg-gray-50/30">
              <div className="p-2 border-r border-black">
                <p className="text-[8px] font-bold uppercase mb-0.5">Função</p>
                <p className="font-black uppercase">{selectedForPrint.role}</p>
              </div>
              <div className="p-2 border-r border-black">
                <p className="text-[8px] font-bold uppercase mb-0.5">Departamento</p>
                <p className="font-black uppercase">OPERACIONAL</p>
              </div>
              <div className="p-2">
                <p className="text-[8px] font-bold uppercase mb-0.5">Data Admissão</p>
                <p className="font-black">{new Date(selectedForPrint.joinedAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            {/* Table Lançamentos */}
            <div className="flex-1 min-h-[350px] flex flex-col">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-black">
                    <th className="border-r border-black p-1 text-left w-12 font-black">Cód.</th>
                    <th className="border-r border-black p-1 text-left font-black">Descrição</th>
                    <th className="border-r border-black p-1 text-center w-20 font-black">Referência</th>
                    <th className="border-r border-black p-1 text-right w-24 font-black">Proventos</th>
                    <th className="p-1 text-right w-24 font-black">Descontos</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr>
                    <td className="border-r border-black p-1">001</td>
                    <td className="border-r border-black p-1 font-bold">SALARIO BASE</td>
                    <td className="border-r border-black p-1 text-center">220:00</td>
                    <td className="border-r border-black p-1 text-right">{formatBRL(selectedForPrint.salary || 0)}</td>
                    <td className="p-1 text-right"></td>
                  </tr>
                  {selectedForPrint.isDangerous && (
                    <tr>
                      <td className="border-r border-black p-1">050</td>
                      <td className="border-r border-black p-1 font-bold">ADIC. PERICULOSIDADE</td>
                      <td className="border-r border-black p-1 text-center">30.00%</td>
                      <td className="border-r border-black p-1 text-right">{formatBRL(calculateDangerousnessValue(selectedForPrint.salary))}</td>
                      <td className="p-1 text-right"></td>
                    </tr>
                  )}
                  {selectedForPrint.inss && (
                    <tr>
                      <td className="border-r border-black p-1">201</td>
                      <td className="border-r border-black p-1 font-bold">INSS</td>
                      <td className="border-r border-black p-1 text-center">9.00</td>
                      <td className="border-r border-black p-1 text-right"></td>
                      <td className="p-1 text-right">{formatBRL(selectedForPrint.inss)}</td>
                    </tr>
                  )}
                  {/* Linhas vazias para preencher o formulário */}
                  {[...Array(12 - (selectedForPrint.isDangerous ? 1 : 0))].map((_, i) => (
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

            {/* Totals Section */}
            <div className="flex border-t border-black">
              <div className="flex-1 p-2 border-r border-black bg-gray-50/50">
                <p className="text-[8px] font-bold uppercase mb-1">Mensagens</p>
                <p className="italic text-[9px]">Agradecemos pelo seu trabalho!</p>
              </div>
              <div className="w-[48%] flex flex-col">
                <div className="flex border-b border-black">
                  <div className="flex-1 p-2 border-r border-black">
                    <p className="text-[8px] font-bold uppercase">Total Vencimentos</p>
                    <p className="text-right font-black text-sm">{formatBRL((selectedForPrint.salary || 0) + calculateDangerousnessValue(selectedForPrint.salary))}</p>
                  </div>
                  <div className="flex-1 p-2">
                    <p className="text-[8px] font-bold uppercase">Total Descontos</p>
                    <p className="text-right font-black text-sm">{formatBRL(selectedForPrint.inss || 0)}</p>
                  </div>
                </div>
                <div className="flex p-2 bg-gray-100">
                  <p className="flex-1 text-[9px] font-black uppercase self-center">Valor Líquido a Receber ---&gt;</p>
                  <p className="font-black text-lg text-right">
                    R$ {formatBRL((selectedForPrint.salary || 0) + calculateDangerousnessValue(selectedForPrint.salary) - (selectedForPrint.inss || 0))}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Bases */}
            <div className="grid grid-cols-6 border-t border-black bg-gray-50/50 text-center">
              <div className="p-1 border-r border-black">
                <p className="text-[7px] font-bold uppercase">Salário Base</p>
                <p className="font-black text-[9px]">{formatBRL(selectedForPrint.salary || 0)}</p>
              </div>
              <div className="p-1 border-r border-black">
                <p className="text-[7px] font-bold uppercase">Base Cálc. INSS</p>
                <p className="font-black text-[9px]">{formatBRL(selectedForPrint.salary || 0)}</p>
              </div>
              <div className="p-1 border-r border-black">
                <p className="text-[7px] font-bold uppercase">Base Cálc. FGTS</p>
                <p className="font-black text-[9px]">{formatBRL(selectedForPrint.salary || 0)}</p>
              </div>
              <div className="p-1 border-r border-black">
                <p className="text-[7px] font-bold uppercase">FGTS do Mês</p>
                <p className="font-black text-[9px]">{formatBRL(selectedForPrint.fgts || 0)}</p>
              </div>
              <div className="p-1 border-r border-black">
                <p className="text-[7px] font-bold uppercase">Base Cálc. IRRF</p>
                <p className="font-black text-[9px]">{formatBRL((selectedForPrint.salary || 0) - (selectedForPrint.inss || 0))}</p>
              </div>
              <div className="p-1">
                <p className="text-[7px] font-bold uppercase">Faixa IRRF</p>
                <p className="font-black text-[9px]">0</p>
              </div>
            </div>

            {/* Assinatura Lateral (Canhoto) */}
            <div className="absolute right-[-2.5cm] top-0 bottom-0 w-8 flex flex-col items-center justify-between py-8 text-[7px] font-bold whitespace-nowrap overflow-visible no-print">
              <div className="rotate-90 origin-center translate-y-20 border-b border-black w-[300px] text-center pb-1">
                 ASSINATURA DO FUNCIONÁRIO
              </div>
              <div className="rotate-90 origin-center -translate-y-20">
                 DATA: ____/____/____
              </div>
            </div>

            {/* Painel de Assinatura Vertical Integrado (para print real) */}
            <div className="hidden print:flex absolute right-0 top-0 bottom-0 border-l border-black w-10 flex-col items-center justify-around py-4">
               <div className="rotate-[-90deg] whitespace-nowrap text-[8px] font-bold translate-y-24">
                  DECLARO TER RECEBIDO A IMPORTÂNCIA LÍQUIDA DISCRIMINADA NESTE RECIBO.
               </div>
               <div className="rotate-[-90deg] whitespace-nowrap text-[8px] font-bold mt-20">
                  DATA: ____/____/____
               </div>
               <div className="rotate-[-90deg] whitespace-nowrap text-[8px] font-bold mt-20 border-t border-black pt-1 px-8">
                  ASSINATURA DO FUNCIONÁRIO
               </div>
            </div>

          </div>

          <p className="mt-4 text-[7px] text-center text-gray-400 font-bold uppercase tracking-widest">
            1ª VIA - EMPREGADOR | Gerado pelo Sistema de Gestão Gelo Brasil
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamView;
