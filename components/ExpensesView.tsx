
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Search, 
  Settings2, 
  X, 
  Truck, 
  AlertCircle, 
  StickyNote, 
  Tag, 
  Pencil, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  Calendar,
  Share2,
  Loader2,
  BellRing
} from 'lucide-react';
import { Expense, ExpenseStatus, Vehicle, Employee } from '../types';

interface Props {
  expenses: Expense[];
  categories: string[];
  vehicles: Vehicle[];
  employees: Employee[];
  onUpdate: (expenses: Expense[]) => void;
  onUpdateCategories: (categories: string[]) => void;
}

const CLIENT_ID = '656844677630-1f5erne75a5svu8js73dn4bqteoomgbp.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

const ExpensesView: React.FC<Props> = ({ expenses, categories, vehicles, employees, onUpdate, onUpdateCategories }) => {
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [dueDate, setDueDate] = useState(getTodayString());
  const [category, setCategory] = useState(categories[0] || 'Outros');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [observation, setObservation] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [isGoogleAuthorized, setIsGoogleAuthorized] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isTestingAlarm, setIsTestingAlarm] = useState(false);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const initGapi = () => {
      if (!(window as any).gapi) return;
      (window as any).gapi.load('client', async () => {
        try {
          await (window as any).gapi.client.init({
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          });
        } catch (err) { console.error(err); }
      });
    };

    const initGis = () => {
      if (!(window as any).google) return;
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response: any) => {
          if (response.error !== undefined) {
            alert('Erro de permissão: Cadastre seu e-mail como Usuário de Teste no Google Cloud.');
            return;
          }
          setIsGoogleAuthorized(true);
        },
      });
      setTokenClient(client);
    };

    if (typeof (window as any).gapi !== 'undefined') initGapi();
    if (typeof (window as any).google !== 'undefined') initGis();
  }, []);

  const handleGoogleAuth = () => {
    if (tokenClient) tokenClient.requestAccessToken({ prompt: 'consent' });
  };

  // FUNÇÃO PARA TESTAR O ALARME AGORA (EM 1 MINUTO)
  const testAlarmNow = async () => {
    if (!isGoogleAuthorized) {
      handleGoogleAuth();
      return;
    }

    setIsTestingAlarm(true);
    try {
      const now = new Date();
      // Define o evento para daqui a 5 minutos
      const startTime = new Date(now.getTime() + 5 * 60000); 
      const endTime = new Date(now.getTime() + 35 * 60000);

      const event = {
        'summary': '🚀 TESTE DE ALARME GESTOR PRO',
        'description': 'Se você está vendo isso, a sincronização está funcionando!',
        'start': { 'dateTime': startTime.toISOString() },
        'end': { 'dateTime': endTime.toISOString() },
        'reminders': {
          'useDefault': false,
          'overrides': [
            { 'method': 'popup', 'minutes': 4 } // Notifica em 1 minuto (faltando 4 para o evento)
          ]
        }
      };

      const request = (window as any).gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event
      });

      request.execute((event: any) => {
        if (event.id) {
          alert('SUCESSO! Evento criado para daqui a 5 min. O alarme deve tocar em 1 MINUTO no seu celular. Verifique se as notificações do Google Agenda estão ligadas no Android/iPhone.');
        }
        setIsTestingAlarm(false);
      });
    } catch (error) {
      alert('Erro no teste.');
      setIsTestingAlarm(false);
    }
  };

  const syncToGoogleCalendar = async (expense: Expense) => {
    if (!isGoogleAuthorized) {
      handleGoogleAuth();
      return;
    }

    setSyncingId(expense.id);
    try {
      const event = {
        'summary': `💰 Pagar: ${expense.description}`,
        'description': `Valor: R$ ${expense.value.toFixed(2)} - Categoria: ${expense.category}`,
        'start': { 'date': expense.dueDate },
        'end': { 'date': expense.dueDate },
        'reminders': {
          'useDefault': false,
          'overrides': [{ 'method': 'popup', 'minutes': 1440 }]
        }
      };

      const request = (window as any).gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event
      });

      request.execute((event: any) => {
        if (event.id) alert('Sincronizado!');
        setSyncingId(null);
      });
    } catch (error) {
      setSyncingId(null);
    }
  };

  const handlePrint = () => window.print();

  const handleValueChange = (val: string) => {
    const sanitized = val.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    setValue(sanitized);
  };

  const handlePrevMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleResetMonth = () => setSelectedDate(new Date());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value);
    if (!description || isNaN(numericValue) || !dueDate) return;
    
    let finalCategory = category;
    if (category === 'Outros' && newCategoryInput.trim()) {
      finalCategory = newCategoryInput.trim();
      if (!categories.includes(finalCategory)) onUpdateCategories([...categories, finalCategory]);
    }

    const today = getTodayString();
    if (editingId) {
      onUpdate(expenses.map(exp => {
        if (exp.id === editingId) {
          const status = dueDate < today && exp.status !== ExpenseStatus.PAGO ? ExpenseStatus.VENCIDO : 
                        dueDate >= today && exp.status !== ExpenseStatus.PAGO ? ExpenseStatus.A_VENCER : exp.status;
          return { ...exp, description, value: numericValue, dueDate, status, category: finalCategory, observation, vehicleId: selectedVehicle || undefined, employeeId: selectedEmployee || undefined };
        }
        return exp;
      }));
      setEditingId(null);
    } else {
      const status = dueDate < today ? ExpenseStatus.VENCIDO : ExpenseStatus.A_VENCER;
      onUpdate([{ id: crypto.randomUUID(), description, value: numericValue, dueDate, status, category: finalCategory, observation, vehicleId: selectedVehicle || undefined, employeeId: selectedEmployee || undefined }, ...expenses]);
    }
    resetForm();
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setDescription(expense.description);
    setValue(expense.value.toString());
    setDueDate(expense.dueDate);
    setObservation(expense.observation || '');
    setCategory(categories.includes(expense.category) ? expense.category : 'Outros');
    setSelectedVehicle(expense.vehicleId || '');
    setSelectedEmployee(expense.employeeId || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null); setDescription(''); setValue(''); setDueDate(getTodayString()); setObservation(''); setSelectedVehicle(''); setSelectedEmployee(''); setCategory(categories[0] || 'Outros');
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.dueDate + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && (e.description.toLowerCase().includes(searchTerm.toLowerCase()) || e.category.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [expenses, currentMonth, currentYear, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="print-header">
        <h1 className="text-2xl font-black text-slate-900">Relatório de Despesas Mensais</h1>
      </div>

      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Despesas</h2>
          <p className="text-sm text-slate-500 font-medium">Controle financeiro mensal.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 no-print">
          {/* BOTÃO DE TESTE RÁPIDO */}
          <button 
            onClick={testAlarmNow}
            disabled={isTestingAlarm}
            className="flex items-center justify-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-5 py-2.5 rounded-xl font-bold hover:bg-rose-100 transition-all shadow-sm active:scale-95"
          >
            {isTestingAlarm ? <Loader2 className="animate-spin" size={18} /> : <BellRing size={18} />}
            <span className="text-xs uppercase tracking-wider">Testar Alarme Agora</span>
          </button>

          <button 
            onClick={handleGoogleAuth}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${isGoogleAuthorized ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            <Calendar size={18} className={isGoogleAuthorized ? 'text-emerald-500' : 'text-slate-400'} />
            <span className="text-xs uppercase tracking-wider">{isGoogleAuthorized ? 'Google Conectado' : 'Conectar Google'}</span>
          </button>

          <button onClick={handlePrint} className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
            <Printer size={18} />
            <span className="text-xs uppercase tracking-wider">Imprimir</span>
          </button>

          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-1 shadow-sm w-full sm:w-auto">
            <button onClick={handlePrevMonth} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500"><ChevronLeft size={18} /></button>
            <button onClick={handleResetMonth} className="flex-1 px-4 py-1 flex flex-col items-center hover:bg-slate-50 rounded-xl min-w-[120px]">
              <span className="text-xs font-bold text-slate-800 capitalize">{monthName}</span>
            </button>
            <button onClick={handleNextMonth} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500"><ChevronRight size={18} /></button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1 no-print">
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-8">
            <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
              {editingId ? <Pencil className="text-indigo-600" size={18} /> : <Plus className="text-indigo-600" size={18} />}
              {editingId ? 'Editar Despesa' : 'Nova Despesa'}
            </h3>
            <div className="space-y-4">
              <input placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" required />
              <div className="grid grid-cols-2 gap-3">
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input placeholder="Valor" value={value} onChange={e => handleValueChange(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" required />
              </div>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm" required />
              <button type="submit" className="w-full h-12 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-lg mt-2">
                {editingId ? 'Atualizar' : 'Salvar Despesa'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-6 py-4">Vencimento</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4">Valor</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center no-print">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((e) => (
                    <tr key={e.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-500">{new Date(e.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">{e.description}</td>
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">{e.category}</td>
                      <td className="px-6 py-4 text-sm font-black text-slate-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(e.value)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${e.status === ExpenseStatus.PAGO ? 'bg-emerald-100 text-emerald-700' : e.status === ExpenseStatus.VENCIDO ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center no-print">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => syncToGoogleCalendar(e)} className={`p-2 transition-all ${isGoogleAuthorized ? 'text-indigo-400 hover:text-indigo-600' : 'text-slate-200 hover:text-slate-400'}`} title="Sincronizar" disabled={syncingId === e.id}>
                            {syncingId === e.id ? <Loader2 className="animate-spin" size={18} /> : <Share2 size={18} />}
                          </button>
                          <button onClick={() => handleEdit(e)} className="p-2 text-slate-400 hover:text-indigo-600"><Pencil size={18} /></button>
                          <button onClick={() => onUpdate(expenses.filter(x => x.id !== e.id))} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesView;
