
import React, { useState } from 'react';
import { Users, UserPlus, Trash2, Briefcase, Banknote, CalendarDays, Printer, FileText, X } from 'lucide-react';
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

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [joinedAt, setJoinedAt] = useState(getTodayString());
  const [selectedForPrint, setSelectedForPrint] = useState<Employee | null>(null);

  const handleSalaryChange = (val: string) => {
    const sanitized = val.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    setSalary(sanitized);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numericSalary = salary ? parseFloat(salary) : undefined;
    if (!name || !role || !joinedAt) return;

    const newEmp: Employee = {
      id: crypto.randomUUID(),
      name,
      role,
      salary: numericSalary,
      joinedAt: new Date(joinedAt + 'T00:00:00').toISOString()
    };

    onUpdate([...employees, newEmp]);
    setName('');
    setRole('');
    setSalary('');
    setJoinedAt(getTodayString());
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Deseja realmente excluir este colaborador?')) {
      onUpdate(employees.filter(e => e.id !== id));
    }
  };

  const handlePrintPaySlip = (emp: Employee) => {
    setSelectedForPrint(emp);
    setTimeout(() => {
      window.print();
      setSelectedForPrint(null);
    }, 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="no-print">
        <h2 className="text-2xl font-bold text-slate-800">Equipe</h2>
        <p className="text-slate-500">Gestão de colaboradores e cargos.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
        <div className="lg:col-span-1">
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-8">
            <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <UserPlus className="text-indigo-600" size={18} /> Cadastrar Funcionário
            </h3>
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
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Salário</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                    <input 
                      type="text" 
                      inputMode="decimal"
                      value={salary}
                      onChange={(e) => handleSalaryChange(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-11 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs transition-all font-mono font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Admissão</label>
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
                className="w-full h-12 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus size={18} /> Adicionar Funcionário
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {employees.length === 0 ? (
              <div className="col-span-full py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-center">
                <Users size={48} className="mb-4 opacity-20" />
                <p className="font-medium italic">Nenhum funcionário cadastrado ainda.</p>
              </div>
            ) : (
              employees.map(emp => (
                <div key={emp.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3 group hover:shadow-md transition-all">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base border border-indigo-100">
                    {emp.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate text-sm">{emp.name}</h4>
                    <div className="flex flex-col gap-1.5 mt-1.5">
                      <div className="flex items-center text-slate-500 text-[11px] font-semibold gap-1.5">
                        <Briefcase size={13} className="text-slate-400" /> {emp.role}
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        {emp.salary !== undefined && (
                          <div className="flex items-center text-emerald-600 text-[11px] font-bold gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-lg w-fit">
                            <Banknote size={13} /> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(emp.salary)}
                          </div>
                        )}
                        <div className="flex items-center text-slate-400 text-[9px] font-bold gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg w-fit">
                          <CalendarDays size={11} /> <span className="uppercase tracking-wider">Admissão:</span> {new Date(emp.joinedAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => handlePrintPaySlip(emp)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Imprimir Contra-cheque"
                    >
                      <Printer size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(emp.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      title="Excluir Colaborador"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PAY SLIP PRINT VIEW (HIDDEN ON SCREEN) */}
      {selectedForPrint && (
        <div className="hidden print:block p-8 bg-white text-black font-sans leading-relaxed">
          <div className="border-4 border-black p-6">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter">{companyName}</h1>
                <p className="text-xs font-bold uppercase">Recibo de Pagamento de Salário</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase">Referência</p>
                <p className="text-lg font-black">{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}</p>
              </div>
            </div>

            {/* Employee Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="border border-black p-2">
                <p className="text-[10px] font-bold uppercase mb-1">Nome do Funcionário</p>
                <p className="font-black">{selectedForPrint.name}</p>
              </div>
              <div className="border border-black p-2">
                <p className="text-[10px] font-bold uppercase mb-1">Cargo / Função</p>
                <p className="font-black">{selectedForPrint.role}</p>
              </div>
              <div className="border border-black p-2">
                <p className="text-[10px] font-bold uppercase mb-1">Data de Admissão</p>
                <p className="font-black">{new Date(selectedForPrint.joinedAt).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="border border-black p-2">
                <p className="text-[10px] font-bold uppercase mb-1">Data de Emissão</p>
                <p className="font-black">{new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            {/* Pay Table */}
            <table className="w-full border-collapse border border-black mb-8 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black px-4 py-2 text-left text-[10px] font-bold uppercase">Cód.</th>
                  <th className="border border-black px-4 py-2 text-left text-[10px] font-bold uppercase">Descrição</th>
                  <th className="border border-black px-4 py-2 text-right text-[10px] font-bold uppercase">Vencimentos</th>
                  <th className="border border-black px-4 py-2 text-right text-[10px] font-bold uppercase">Descontos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black px-4 py-2 font-mono">001</td>
                  <td className="border border-black px-4 py-2 font-bold">SALÁRIO BASE</td>
                  <td className="border border-black px-4 py-2 text-right font-black">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedForPrint.salary || 0)}
                  </td>
                  <td className="border border-black px-4 py-2 text-right">-</td>
                </tr>
                {/* Linhas vazias para preencher espaço */}
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="h-8">
                    <td className="border border-black px-4 py-2"></td>
                    <td className="border border-black px-4 py-2"></td>
                    <td className="border border-black px-4 py-2"></td>
                    <td className="border border-black px-4 py-2"></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-black">
                  <td colSpan={2} className="border border-black px-4 py-2 text-right uppercase text-[10px]">Totais</td>
                  <td className="border border-black px-4 py-2 text-right">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedForPrint.salary || 0)}
                  </td>
                  <td className="border border-black px-4 py-2 text-right">R$ 0,00</td>
                </tr>
                <tr className="bg-gray-200 font-black">
                  <td colSpan={2} className="border border-black px-4 py-4 text-right uppercase text-sm">Valor Líquido a Receber</td>
                  <td colSpan={2} className="border border-black px-4 py-4 text-right text-xl">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedForPrint.salary || 0)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Footer / Signatures */}
            <div className="grid grid-cols-2 gap-10 mt-12">
              <div className="text-center pt-4 border-t border-black">
                <p className="text-[10px] font-bold uppercase">Assinatura do Empregador</p>
              </div>
              <div className="text-center pt-4 border-t border-black">
                <p className="text-[10px] font-bold uppercase">Assinatura do Funcionário</p>
              </div>
            </div>
            
            <p className="text-[8px] mt-8 text-center text-gray-400 uppercase tracking-widest italic">
              Este documento é um recibo de pagamento simples gerado pelo sistema {companyName}
            </p>
          </div>
          
          {/* Linha de corte se quiser imprimir duas cópias */}
          <div className="mt-20 border-t-2 border-dashed border-gray-300 pt-20">
             <p className="text-[8px] text-gray-300 text-center uppercase mb-4">Segunda Via (Corte Aqui)</p>
             {/* Replicar o mesmo bloco aqui se necessário */}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamView;
