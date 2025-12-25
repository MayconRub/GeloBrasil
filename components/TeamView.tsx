
import React, { useState } from 'react';
import { Users, UserPlus, Trash2, Briefcase, Banknote, CalendarDays } from 'lucide-react';
import { Employee } from '../types';

interface Props {
  employees: Employee[];
  onUpdate: (employees: Employee[]) => void;
}

const TeamView: React.FC<Props> = ({ employees, onUpdate }) => {
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [joinedAt, setJoinedAt] = useState(getTodayString());

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
    onUpdate(employees.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Equipe</h2>
        <p className="text-slate-500">Gestão de colaboradores e cargos.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  <button 
                    onClick={() => handleDelete(emp.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Excluir Colaborador"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamView;
