
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
  IdCard,
  HandCoins,
  Receipt,
  CheckCircle2,
  Plus,
  UserX,
  UserCheck
} from 'lucide-react';
import { Employee, AppSettings, Expense, ExpenseStatus } from '../types';
import { fetchSettings } from '../store';

interface Props {
  employees: Employee[];
  onUpdate: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onAddExpense?: (expense: Expense) => void;
  companyName?: string;
}

const TeamView: React.FC<Props> = ({ employees, onUpdate, onDelete, onAddExpense, companyName: initialCompanyName }) => {
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
  const [status, setStatus] = useState<'ATIVO' | 'INATIVO'>('ATIVO');
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentEmployeeId, setPaymentEmployeeId] = useState('');
  const [paymentType, setPaymentType] = useState<'SALÁRIO' | 'VALE' | 'ADIANTAMENTO' | 'BÔNUS'>('VALE');
  const [paymentValue, setPaymentValue] = useState('');
  const [paymentDate, setPaymentDate] = useState(getTodayString());

  // Ordenação: Ativos primeiro, depois Inativos
  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      if (a.status === b.status) return a.name.localeCompare(b.name);
      return a.status === 'ATIVO' ? -1 : 1;
    });
  }, [employees]);

  const stats = useMemo(() => {
    const activeEmps = employees.filter(e => e.status === 'ATIVO');
    const totalSalary = activeEmps.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    return { totalSalary, count: activeEmps.length, inactiveCount: employees.length - activeEmps.length };
  }, [employees]);

  const handleNumericChange = (val: string, setter: (v: string) => void) => {
    const sanitized = val.replace(/[^0-9.,]/g, '').replace(',', '.');
    setter(sanitized);
  };

  const resetForm = () => {
    setEditingId(null); setName(''); setRole(''); setSalary(''); setJoinedAt(getTodayString()); setStatus('ATIVO'); setIsMobileFormOpen(false);
  };

  const handleEdit = (emp: Employee) => {
    if (confirm(`DESEJA EDITAR OS DADOS DE ${emp.name.toUpperCase()}?`)) {
      setEditingId(emp.id); setName(emp.name); setRole(emp.role); setSalary(emp.salary?.toString() || ''); setJoinedAt(new Date(emp.joinedAt).toISOString().split('T')[0]);
      setStatus(emp.status || 'ATIVO');
      if (window.innerWidth < 1024) setIsMobileFormOpen(true);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
      joinedAt: new Date(joinedAt + 'T00:00:00').toISOString(),
      status: status
    });
    resetForm();
  };

  const handleToggleStatus = (emp: Employee) => {
    const newStatus = emp.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    const action = newStatus === 'INATIVO' ? 'DESATIVAR' : 'REATIVAR';
    if (confirm(`DESEJA REALMENTE ${action} O COLABORADOR ${emp.name}? ELE NÃO PODERÁ MAIS SER SELECIONADO EM NOVAS ENTREGAS.`)) {
      onUpdate({ ...emp, status: newStatus });
    }
  };

  const handleLaunchPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(paymentValue.replace(',', '.'));
    const employee = employees.find(emp => emp.id === paymentEmployeeId);
    if (!employee || isNaN(val) || !onAddExpense) return;
    onAddExpense({ id: crypto.randomUUID(), description: `PAGAMENTO: ${employee.name} - ${paymentType}`.toUpperCase(), value: val, dueDate: paymentDate, status: ExpenseStatus.PAGO, category: 'FOLHA DE PAGAMENTO', employeeId: employee.id, observation: `LANÇAMENTO VIA MÓDULO DE EQUIPE` });
    setIsPaymentModalOpen(false); setPaymentValue(''); setPaymentEmployeeId(''); setPaymentType('VALE');
  };

  const openPaymentForEmployee = (emp: Employee) => {
    if (emp.status === 'INATIVO') {
      if (!confirm('ESTE COLABORADOR ESTÁ INATIVO. DESEJA LANÇAR UM PAGAMENTO MESMO ASSIM?')) return;
    }
    setPaymentEmployeeId(emp.id); setPaymentType('VALE'); setPaymentValue(''); setIsPaymentModalOpen(true);
  };

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const renderForm = (isModal = false) => (
    <form onSubmit={handleAddOrUpdate} className={`${isModal ? '' : 'bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none sticky top-8'}`}>
      <h3 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-4">
        {editingId ? <Pencil className="text-sky-500" size={18} /> : <UserPlus className="text-sky-500" size={18} />}
        {editingId ? 'Editar Cadastro' : 'Novo Colaborador'}
      </h3>
      <div className="space-y-5">
        <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2 tracking-widest">Nome do Funcionário</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="NOME COMPLETO" className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-xs uppercase dark:text-white" required /></div>
        <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2 tracking-widest">Cargo / Função</label><div className="relative"><Briefcase size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" /><input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="EX: VENDEDOR" className="w-full h-12 pl-10 pr-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-xs uppercase dark:text-white" required /></div></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2 tracking-widest">Salário Base</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 font-bold text-xs">R$</span><input type="text" value={salary} onChange={(e) => handleNumericChange(e.target.value, setSalary)} placeholder="0,00" className="w-full h-12 pl-10 pr-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-black text-xs dark:text-white" required /></div></div>
          <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2 tracking-widest">Admissão</label><input type="date" value={joinedAt} onChange={(e) => setJoinedAt(e.target.value)} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-xs dark:text-white" required /></div>
        </div>
        {editingId && (
           <div className="space-y-1.5">
             <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2 tracking-widest">Situação de Acesso</label>
             <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-black text-[10px] uppercase dark:text-white">
               <option value="ATIVO">ATIVO (LIBERADO PARA LOGÍSTICA)</option>
               <option value="INATIVO">INATIVO (APENAS HISTÓRICO)</option>
             </select>
           </div>
        )}
        <div className="flex gap-3 pt-4">
          <button type="submit" className="flex-1 h-14 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl dark:shadow-none active:scale-95 flex items-center justify-center gap-2">{editingId ? <Save size={18} /> : <UserPlus size={18} />}{editingId ? 'Atualizar' : 'Contratar'}</button>
          {(editingId || isModal) && ( <button type="button" onClick={resetForm} className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-950 transition-all"><X size={20} /></button> )}
        </div>
      </div>
    </form>
  );

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-24 lg:pb-8 transition-colors">
      <header className="flex flex-col lg:flex-row items-center justify-between gap-6 no-print">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-slate-900 dark:bg-slate-800 text-white rounded-[2rem] flex items-center justify-center shadow-xl dark:shadow-none"><Users size={32} /></div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter leading-none uppercase">GESTÃO DE <span className="text-sky-500">EQUIPE</span></h2>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2"><IdCard size={14} className="text-sky-500" /> Colaboradores e Proventos</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <div className="hidden md:flex gap-4 mr-4">
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase">Ativos</p>
              <p className="text-sm font-black text-emerald-500">{stats.count}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase">Inativos</p>
              <p className="text-sm font-black text-slate-300">{stats.inactiveCount}</p>
            </div>
          </div>
          <button onClick={() => setIsMobileFormOpen(true)} className="lg:hidden bg-sky-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg dark:shadow-none active:scale-95 flex items-center gap-2"><Plus size={18} /> Contratar</button>
          <button onClick={() => setIsPaymentModalOpen(true)} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg dark:shadow-none active:scale-95 flex items-center gap-2"><HandCoins size={18} /> Lançar Pagamento</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
        <div className="hidden lg:block lg:col-span-4">{renderForm()}</div>
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {employees.length === 0 ? (
              <div className="col-span-full py-32 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700"><Users size={64} className="mb-4 opacity-20" /><p className="font-black text-[10px] uppercase tracking-widest">Nenhum colaborador registrado</p></div>
            ) : (
              sortedEmployees.map(emp => (
                <div key={emp.id} className={`bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none hover:shadow-md transition-all group relative overflow-hidden ${emp.status === 'INATIVO' ? 'opacity-60 grayscale-[0.8]' : ''}`}>
                  <div className="absolute -right-4 -top-4 text-slate-50 dark:text-slate-950 transition-colors"><UserCircle2 size={120} /></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg dark:shadow-none ${emp.status === 'INATIVO' ? 'bg-slate-200 text-slate-500 dark:bg-slate-800' : 'bg-slate-900 dark:bg-slate-800 text-white'}`}>{emp.name.charAt(0)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                             <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase leading-tight truncate max-w-[120px]">{emp.name}</h4>
                             {emp.status === 'INATIVO' && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[6px] font-black rounded uppercase">Inativo</span>}
                          </div>
                          <span className={`inline-block px-3 py-1 rounded-lg text-[8px] font-black uppercase border mt-1 ${emp.status === 'INATIVO' ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 border-sky-100 dark:border-sky-900/30'}`}>{emp.role}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 transition-opacity">
                        <button onClick={() => handleToggleStatus(emp)} title={emp.status === 'ATIVO' ? 'Desativar Colaborador' : 'Reativar Colaborador'} className={`p-2 transition-all rounded-lg ${emp.status === 'ATIVO' ? 'text-slate-300 hover:text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
                           {emp.status === 'ATIVO' ? <UserX size={18} /> : <UserCheck size={18} />}
                        </button>
                        <button onClick={() => openPaymentForEmployee(emp)} className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-all"><HandCoins size={16} /></button>
                        <button onClick={() => handleEdit(emp)} className="p-2 text-slate-400 dark:text-slate-600 hover:text-sky-500 transition-all"><Pencil size={16} /></button>
                        <button onClick={() => onDelete(emp.id)} className="p-2 text-slate-300 dark:text-slate-700 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-8">
                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[7px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Salário Base</p>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200">{formatBRL(emp.salary || 0)}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[7px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Admissão</p>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200">{new Date(emp.joinedAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isMobileFormOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/95 backdrop-blur-sm transition-all" onClick={() => setIsMobileFormOpen(false)} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-8 shadow-2xl dark:shadow-none border border-transparent dark:border-slate-800 relative animate-in zoom-in-95">
              <button onClick={() => setIsMobileFormOpen(false)} className="absolute top-6 right-6 text-slate-300 dark:text-slate-700 hover:text-rose-500"><X size={24} /></button>
              <div className="mt-4">{renderForm(true)}</div>
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/95 backdrop-blur-sm transition-all" onClick={() => setIsPaymentModalOpen(false)} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl dark:shadow-none border border-transparent dark:border-slate-800 relative animate-in zoom-in-95">
              <button onClick={() => setIsPaymentModalOpen(false)} className="absolute top-8 right-8 text-slate-300 dark:text-slate-700 hover:text-rose-500"><X size={24} /></button>
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center"><HandCoins size={28} /></div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">Provento</h3>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase mt-2 tracking-widest">Financeiro & Equipe</p>
                </div>
              </div>
              <form onSubmit={handleLaunchPayment} className="space-y-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Colaborador</label><select value={paymentEmployeeId} onChange={(e) => setPaymentEmployeeId(e.target.value)} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs uppercase dark:text-white" required><option value="">SELECIONE...</option>{employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} {emp.status === 'INATIVO' ? '(INATIVO)' : ''}</option>)}</select></div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Tipo</label><select value={paymentType} onChange={(e) => setPaymentType(e.target.value as any)} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-[10px] uppercase text-sky-600 dark:text-sky-400"><option value="VALE">VALE</option><option value="ADIANTAMENTO">ADIANTAMENTO</option><option value="SALÁRIO">SALÁRIO</option><option value="BÔNUS">BÔNUS</option></select></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Valor</label><div className="relative"><span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-xs">R$</span><input type="text" value={paymentValue} onChange={(e) => handleNumericChange(e.target.value, setPaymentValue)} placeholder="0,00" className="w-full h-14 pl-12 pr-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs dark:text-white" required /></div></div>
                </div>
                <button type="submit" className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl dark:shadow-none active:scale-95 transition-all">CONFIRMAR LANÇAMENTO</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default TeamView;
