
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CircleDollarSign, 
  Receipt, 
  Users, 
  Truck, 
  Loader2,
  Snowflake,
  Shield,
  BarChartHorizontal,
  Menu,
  X,
  Lock,
  Unlock,
  PhoneCall,
  ChevronRight,
  Eye,
  EyeOff,
  LogOut,
  Mail,
  AlertCircle
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { 
  fetchAllData, syncSale, syncExpense, syncEmployee, syncVehicle, syncCategory, syncSettings, AppData, syncProduction, syncMonthlyGoal, syncKmLog, syncCategoriesOrder,
  deleteSale, deleteExpense, deleteProduction, deleteEmployee, deleteVehicle, deleteCategory
} from './store';
import { ViewType, Sale, Expense, Employee, Vehicle, Production, MonthlyGoal, KmLog } from './types';
import DashboardView from './components/DashboardView';
import SalesView from './components/SalesView';
import ProductionView from './components/ProductionView';
import ExpensesView from './components/ExpensesView';
import TeamView from './components/TeamView';
import FleetView from './components/FleetView';
import AdminView from './components/AdminView';
import CashFlowView from './components/CashFlowView';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [data, setData] = useState<AppData>({
    sales: [], expenses: [], employees: [], vehicles: [], production: [], monthlyGoals: [], categories: [], users: [], kmLogs: [],
    settings: { 
      companyName: 'Ice Control', cnpj: '', address: '', primaryColor: '#0ea5e9', logoId: 'Snowflake', 
      loginHeader: 'Acesso Restrito', supportPhone: '', footerText: '', expirationDate: '2099-12-31', 
      hiddenViews: [], dashboardNotice: '', productionGoalDaily: 1000, productionGoalMonthly: 30000,
      salesGoalDaily: 2000, salesGoalMonthly: 60000
    }
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const hasSession = !!session;
      setIsAuthenticated(hasSession);
      setUserEmail(session?.user?.email || null);
      if (hasSession) await loadAppData();
      else setIsLoading(false);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const hasSession = !!session;
      setIsAuthenticated(hasSession);
      setUserEmail(session?.user?.email || null);
      if (hasSession) loadAppData();
      else { setIsLoading(false); setView('dashboard'); }
    });
    checkSession();
    return () => subscription.unsubscribe();
  }, []);

  const loadAppData = async () => {
    try {
      setIsLoading(true);
      const remoteData = await fetchAllData();
      setData(remoteData);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setErrorMessage(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message); setIsLoggingIn(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setView('dashboard');
    setEmail('');
    setPassword('');
  };

  const wrap = (fn: any) => async (payload: any) => {
    await fn(payload);
    const remoteData = await fetchAllData();
    setData(remoteData);
  };

  const isLicenseExpired = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(data.settings.expirationDate + 'T00:00:00');
    return today > expDate;
  };

  const isAdminUser = userEmail === 'root@adm.app';

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'sales', label: 'Vendas', icon: CircleDollarSign },
    { id: 'expenses', label: 'Despesas', icon: Receipt },
    { id: 'production', label: 'Produção', icon: Snowflake },
    { id: 'cashflow', label: 'Caixa', icon: BarChartHorizontal },
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'fleet', label: 'Frota', icon: Truck },
    { id: 'admin', label: 'Admin', icon: Shield },
  ].filter(item => {
    if (data.settings.hiddenViews.includes(item.id)) return false;
    if (item.id === 'admin' && !isAdminUser) return false;
    return true;
  });

  if (isLoading) return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-sky-500 mb-4" size={40} />
      <p className="text-[10px] font-black text-sky-600 uppercase tracking-[0.3em]">Autenticando sessão...</p>
    </div>
  );

  if (isLicenseExpired()) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
      <div className="w-24 h-24 bg-rose-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-rose-900/40 mb-8 animate-bounce">
        <Lock size={48} />
      </div>
      <h1 className="text-3xl font-black text-white mb-2 tracking-tighter text-balance">SISTEMA BLOQUEADO</h1>
      <p className="text-slate-400 max-w-xs mb-8 font-medium">O acesso foi suspenso ou a licença expirou. Entre em contato com o suporte para renovação.</p>
      <a href={`tel:${data.settings.supportPhone || ''}`} className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-sky-400 transition-all active:scale-95 shadow-xl">
        <PhoneCall size={18} /> Contatar Suporte
      </a>
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#f0f9ff] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-200/20 rounded-full blur-[100px]"></div>
      <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl p-10 rounded-[3rem] border border-white shadow-2xl shadow-sky-200/50 relative z-10 animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-sky-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-sky-200 mb-6">
            <Snowflake size={40} className="animate-pulse" />
          </div>
          <h2 className="text-[10px] font-black text-sky-600 uppercase tracking-[0.3em] mb-2">{data.settings.loginHeader || 'Controle de Acesso'}</h2>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{data.settings.companyName}</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">E-mail Administrativo</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="adm@icecontrol.com" className={`w-full h-14 pl-14 pr-8 bg-white/50 border-2 rounded-2xl font-bold outline-none transition-all ${errorMessage ? 'border-rose-200 ring-rose-50' : 'border-slate-100 focus:border-sky-400 focus:ring-sky-100'}`} required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`w-full h-14 pl-14 pr-14 bg-white/50 border-2 rounded-2xl font-bold outline-none transition-all ${errorMessage ? 'border-rose-200 ring-rose-50' : 'border-slate-100 focus:border-sky-400 focus:ring-sky-100'}`} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-sky-500 transition-colors">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errorMessage && <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-xl mt-2 animate-in slide-in-from-top-2"><AlertCircle size={14} /><p className="text-[9px] font-black uppercase tracking-widest">{errorMessage}</p></div>}
          </div>
          <button type="submit" disabled={isLoggingIn} className="w-full h-16 bg-slate-900 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-sky-600 transition-all active:scale-95 shadow-2xl shadow-slate-200 mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoggingIn ? <Loader2 className="animate-spin" size={18} /> : <>Acessar Sistema <ChevronRight size={18} /></>}
          </button>
        </form>
        <p className="text-center text-[9px] font-bold text-slate-400 mt-10 uppercase tracking-widest">Sistema Ice Control © {new Date().getFullYear()}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fafc] text-slate-800">
      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-lg sticky top-0 z-[100] border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-100"><Snowflake size={16} /></div>
          <span className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">{data.settings.companyName}</span>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleLogout} className="p-2 text-rose-500"><LogOut size={20} /></button>
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-400"><Menu size={24} /></button>
        </div>
      </header>
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-100 py-10 px-4 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-4 mb-12">
          <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-xl shadow-sky-100"><Snowflake size={20} /></div>
          <h1 className="text-xs font-black uppercase tracking-tight leading-none truncate">{data.settings.companyName}</h1>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id as ViewType)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${view === item.id ? 'bg-sky-600 text-white shadow-xl shadow-sky-100' : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50'}`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 px-4 border-t border-slate-50">
           <div className="mb-4 px-5"><p className="text-[8px] font-black text-slate-300 uppercase tracking-widest truncate">{userEmail}</p></div>
           <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-rose-400 hover:bg-rose-50 transition-all">
             <LogOut size={18} /> Sair do Sistema
           </button>
        </div>
      </aside>
      <main className="flex-1 px-4 sm:px-8 py-6 lg:py-10 max-w-7xl mx-auto w-full">
        {view === 'dashboard' && <DashboardView {...data} onSwitchView={setView} expirationDate={data.settings.expirationDate} onOpenPayment={() => {}} />}
        {view === 'sales' && <SalesView sales={data.sales} onUpdate={wrap(syncSale)} onDelete={wrap(deleteSale)} settings={data.settings} monthlyGoals={data.monthlyGoals} onUpdateMonthlyGoal={wrap(syncMonthlyGoal)} />}
        {view === 'expenses' && <ExpensesView expenses={data.expenses} categories={data.categories} vehicles={data.vehicles} employees={data.employees} onUpdate={wrap(syncExpense)} onDelete={wrap(deleteExpense)} onUpdateCategories={wrap(syncCategory)} onDeleteCategory={wrap(deleteCategory)} onReorderCategories={wrap(syncCategoriesOrder)} />}
        {view === 'production' && <ProductionView settings={data.settings} production={data.production} monthlyGoals={data.monthlyGoals} onUpdate={wrap(syncProduction)} onDelete={wrap(deleteProduction)} onUpdateMonthlyGoal={wrap(syncMonthlyGoal)} onUpdateSettings={wrap(syncSettings)} />}
        {view === 'cashflow' && <CashFlowView sales={data.sales} expenses={data.expenses} />}
        {view === 'team' && <TeamView employees={data.employees} onUpdate={wrap(syncEmployee)} onDelete={wrap(deleteEmployee)} companyName={data.settings.companyName} />}
        {view === 'fleet' && <FleetView vehicles={data.vehicles} kmLogs={data.kmLogs} employees={data.employees} onUpdate={wrap(syncVehicle)} onDelete={wrap(deleteVehicle)} onLogKm={wrap(syncKmLog)} />}
        {view === 'admin' && isAdminUser && <AdminView settings={data.settings} onUpdateSettings={wrap(syncSettings)} users={data.users} />}
        {view === 'admin' && !isAdminUser && (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center">
             <Lock size={48} className="text-slate-200 mb-4" />
             <h3 className="text-xl font-black text-slate-800">Acesso Restrito</h3>
             <p className="text-sm text-slate-400 mt-2">Você não tem permissão para acessar esta área.</p>
          </div>
        )}
      </main>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-3 flex items-center justify-around z-[100] shadow-[0_-8px_30px_rgba(0,0,0,0.04)] rounded-t-[2rem]">
        {menuItems.slice(0, 4).map(item => (
          <button key={item.id} onClick={() => setView(item.id as ViewType)} className={`flex flex-col items-center gap-1.5 transition-all ${view === item.id ? 'text-sky-600' : 'text-slate-300'}`}>
            <item.icon size={20} className={view === item.id ? 'stroke-[2.5px]' : ''} />
            <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
        <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-1.5 text-slate-300">
          <Menu size={20} />
          <span className="text-[8px] font-black uppercase tracking-tighter">Menu</span>
        </button>
      </nav>
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[110] animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute bottom-6 left-4 right-4 bg-white rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex items-center justify-between mb-8 px-2">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opções</h3>
               <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
               {menuItems.map(item => (
                 <button key={item.id} onClick={() => { setView(item.id as ViewType); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${view === item.id ? 'bg-sky-50 border-sky-100 text-sky-600 shadow-sm' : 'bg-slate-50 border-transparent text-slate-500'}`}>
                   <item.icon size={18} /> {item.label}
                 </button>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
