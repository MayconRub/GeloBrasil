
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CircleDollarSign, Receipt, Users, Truck, Loader2, Snowflake, Shield, Menu, X, Lock, PhoneCall, LogOut, MoreHorizontal, ChevronRight, User, Key, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { supabase } from './supabaseClient';
import { fetchAllData, syncSale, syncExpense, syncEmployee, syncVehicle, syncCategory, syncSettings, AppData, syncProduction, syncMonthlyGoal, syncCategoriesOrder, syncFuel, syncMaintenance, syncFine, deleteSale, deleteExpense, deleteProduction, deleteEmployee, deleteVehicle, deleteCategory, deleteFuel, deleteMaintenance, deleteFine } from './store';
import { ViewType, Sale, Expense, Employee, Vehicle, Production, MonthlyGoal, FuelLog, MaintenanceLog, FineLog } from './types';
import DashboardView from './components/DashboardView';
import SalesView from './components/SalesView';
import ProductionView from './components/ProductionView';
import ExpensesView from './components/ExpensesView';
import TeamView from './components/TeamView';
import FleetView from './components/FleetView';
import AdminView from './components/AdminView';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const [data, setData] = useState<AppData>({
    sales: [], expenses: [], employees: [], vehicles: [], fuelLogs: [], maintenanceLogs: [], fineLogs: [], production: [], monthlyGoals: [], categories: [], users: [],
    settings: { companyName: 'ICE CONTROL', primaryColor: '#0ea5e9', logoId: 'Snowflake', loginHeader: 'ADMIN', supportPhone: '', footerText: '', expirationDate: '2099-12-31', hiddenViews: [] }
  });

  useEffect(() => { 
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
      }
      await loadAppData(); 
    };
    checkUser();
  }, []);

  const loadAppData = async () => {
    try { 
      setIsLoading(true); 
      const remoteData = await fetchAllData(); 
      setData(remoteData); 
    } 
    catch (e) { 
      console.error(e); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        setLoginError(error.message.toUpperCase() === 'INVALID LOGIN CREDENTIALS' 
          ? 'USUÁRIO OU SENHA INCORRETOS.' 
          : error.message.toUpperCase());
      } else if (authData.user) {
        setIsAuthenticated(true);
      }
    } catch (err) {
      setLoginError('ERRO AO CONECTAR COM O SERVIDOR.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('DESEJA REALMENTE ENCERRAR A SESSÃO?')) {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setView('dashboard');
    }
  };

  const wrap = (fn: any) => async (payload: any) => {
    const result = await fn(payload);
    if (result?.error) { alert("ERRO: " + result.error.message.toUpperCase()); return; }
    loadAppData();
  };

  const menuItems = [
    { id: 'dashboard', label: 'INÍCIO', icon: LayoutDashboard },
    { id: 'sales', label: 'VENDAS', icon: CircleDollarSign },
    { id: 'expenses', label: 'DESPESAS', icon: Receipt },
    { id: 'production', label: 'PRODUÇÃO', icon: Snowflake },
    { id: 'team', label: 'EQUIPE', icon: Users },
    { id: 'fleet', label: 'FROTA', icon: Truck },
    { id: 'admin', label: 'ADMIN', icon: Shield },
  ].filter(item => !data.settings.hiddenViews.includes(item.id));

  const mobileFixedItems = menuItems.slice(0, 4);
  const mobileExtraItems = menuItems.slice(4);

  const handleMobileNav = (viewId: string) => {
    setView(viewId as ViewType);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading && !isAuthenticated) return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-sky-500 mb-4" size={48} />
      <p className="text-[10px] font-black text-sky-600 uppercase tracking-[0.3em]">Conectando à Rede Glacial...</p>
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Premium Aurora */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-sky-100/50 rounded-full blur-[160px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[140px]" />
      
      {/* Container Principal */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/40 backdrop-blur-[40px] p-10 sm:p-14 rounded-[4rem] border border-white/80 shadow-[0_32px_64px_-16px_rgba(14,165,233,0.15)] animate-in fade-in zoom-in duration-1000">
          
          <div className="flex flex-col items-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-sky-400 to-sky-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-sky-200 mb-8 animate-ice relative group overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <Snowflake size={48} className="relative z-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none text-center">
              {data.settings.companyName}
            </h1>
            <div className="flex items-center gap-3 mt-4">
              <div className="h-[1px] w-8 bg-slate-200" />
              <p className="text-[9px] font-black text-sky-500 uppercase tracking-[0.4em]">
                System Core
              </p>
              <div className="h-[1px] w-8 bg-slate-200" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Usuário Autorizado</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors">
                  <User size={20} />
                </div>
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="email@empresa.com"
                  className="w-full h-16 pl-16 pr-6 bg-white/60 border border-white/50 rounded-3xl font-bold text-sm outline-none focus:ring-4 focus:ring-sky-100/50 focus:border-white transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Token de Acesso</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors">
                  <Key size={20} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-16 pl-16 pr-16 bg-white/60 border border-white/50 rounded-3xl font-bold text-sm outline-none focus:ring-4 focus:ring-sky-100/50 focus:border-white transition-all shadow-sm"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-sky-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-rose-50/80 backdrop-blur-md border border-rose-100 p-5 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-2 duration-300">
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <Lock size={16} />
                </div>
                <p className="text-[10px] font-black text-rose-600 uppercase leading-tight tracking-tight">{loginError}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-20 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.25em] shadow-2xl hover:bg-sky-500 transition-all active:scale-95 flex items-center justify-center gap-4 group disabled:opacity-50"
            >
              {isLoggingIn ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Acessar Painel 
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center space-y-4">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] leading-relaxed">
              Segurança Criptografada <br/> 
              <span className="text-sky-400/60 font-bold italic">Ice Control Systems v5.0</span>
            </p>
          </div>
        </div>

        {/* Botão de Suporte Premium */}
        <div className="mt-8 flex justify-center animate-in slide-in-from-bottom-4 duration-1000 delay-300">
          <a 
            href={`https://wa.me/${data.settings.supportPhone?.replace(/\D/g, '')}`} 
            target="_blank"
            className="flex items-center gap-3 px-8 py-4 bg-white/50 backdrop-blur-md border border-white rounded-full shadow-lg hover:bg-sky-500 hover:text-white hover:shadow-sky-200 transition-all group"
          >
            <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 group-hover:bg-white/20 group-hover:text-white transition-all">
              <MessageCircle size={18} />
            </div>
            <div className="text-left">
              <p className="text-[8px] font-black uppercase tracking-widest leading-none opacity-50 group-hover:opacity-100">Suporte Técnico</p>
              <p className="text-[11px] font-black uppercase tracking-tighter mt-0.5">{data.settings.supportPhone || '(38) 99881-2856'}</p>
            </div>
          </a>
        </div>
      </div>

      {/* Footer Design */}
      <div className="absolute bottom-8 text-center w-full">
         <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">© Gelo Brasil • Todos os direitos reservados</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row bg-[#f0f9ff] uppercase transition-colors duration-500 pb-20 lg:pb-0`}>
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-sky-100 py-10 px-4 sticky top-0 h-screen z-50">
        <div className="flex items-center gap-3 px-4 mb-12">
          <div className="w-10 h-10 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-200">
            <Snowflake size={20} />
          </div>
          <h1 className="text-sm font-black uppercase tracking-tighter text-slate-800">{data.settings.companyName}</h1>
        </div>
        <nav className="flex-1 space-y-1">
          {menuItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setView(item.id as ViewType)} 
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${view === item.id ? 'bg-sky-500 text-white shadow-xl shadow-sky-100' : 'text-slate-400 hover:bg-sky-50 hover:text-sky-600'}`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto pt-4 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <LogOut size={18} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-sky-100 sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-100">
            <Snowflake size={16} />
          </div>
          <h1 className="text-[10px] font-black uppercase tracking-tighter text-slate-800">{data.settings.companyName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black text-sky-500 px-2 py-1 bg-sky-50 rounded-full border border-sky-100 uppercase">Sessão Ativa</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full relative">
        {view === 'dashboard' && <DashboardView {...data} onSwitchView={setView} expirationDate={data.settings.expirationDate} onOpenPayment={() => {}} settings={data.settings} vehicles={data.vehicles} fuelLogs={data.fuelLogs} maintenanceLogs={data.maintenanceLogs} />}
        {view === 'sales' && <SalesView sales={data.sales} onUpdate={wrap(syncSale)} onDelete={wrap(deleteSale)} settings={data.settings} monthlyGoals={data.monthlyGoals} onUpdateMonthlyGoal={wrap(syncMonthlyGoal)} />}
        {view === 'production' && <ProductionView settings={data.settings} production={data.production} monthlyGoals={data.monthlyGoals} onUpdate={wrap(syncProduction)} onDelete={wrap(deleteProduction)} onUpdateMonthlyGoal={wrap(syncMonthlyGoal)} onUpdateSettings={wrap(syncSettings)} />}
        {view === 'expenses' && <ExpensesView expenses={data.expenses} categories={data.categories} vehicles={data.vehicles} employees={data.employees} onUpdate={wrap(syncExpense)} onDelete={wrap(deleteExpense)} onUpdateCategories={wrap(syncCategory)} onDeleteCategory={wrap(deleteCategory)} onReorderCategories={wrap(syncCategoriesOrder)} sales={data.sales} />}
        {view === 'team' && <TeamView employees={data.employees} onUpdate={wrap(syncEmployee)} onDelete={wrap(deleteEmployee)} onAddExpense={wrap(syncExpense)} companyName={data.settings.companyName} />}
        {view === 'fleet' && <FleetView 
            vehicles={data.vehicles} 
            employees={data.employees} 
            fuelLogs={data.fuelLogs} 
            maintenanceLogs={data.maintenanceLogs} 
            fineLogs={data.fineLogs} 
            onUpdateVehicle={wrap(syncVehicle)} 
            onDeleteVehicle={wrap(deleteVehicle)} 
            onUpdateFuel={wrap(syncFuel)} 
            onDeleteFuel={wrap(deleteFuel)} 
            onUpdateMaintenance={wrap(syncMaintenance)} 
            onDeleteMaintenance={wrap(deleteMaintenance)} 
            onUpdateFine={wrap(syncFine)} 
            onDeleteFine={wrap(deleteFine)} 
        />}
        {view === 'admin' && <AdminView settings={data.settings} onUpdateSettings={wrap(syncSettings)} users={[]} />}
      </main>

      {/* Mobile "More" Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute bottom-24 left-4 right-4 bg-white rounded-[2.5rem] p-6 shadow-2xl border border-sky-100 animate-in slide-in-from-bottom-10 duration-500">
             <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opções Adicionais</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-400"><X size={16} /></button>
             </div>
             <div className="grid grid-cols-1 gap-3">
                {mobileExtraItems.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => handleMobileNav(item.id)}
                    className={`flex items-center justify-between w-full p-5 rounded-2xl transition-all ${view === item.id ? 'bg-sky-500 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-sky-50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${view === item.id ? 'bg-white/20' : 'bg-white shadow-sm text-sky-500'}`}>
                        <item.icon size={20} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-tight">{item.label}</span>
                    </div>
                    <ChevronRight size={16} className={view === item.id ? 'opacity-50' : 'text-slate-300'} />
                  </button>
                ))}
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-between w-full p-5 rounded-2xl bg-rose-50 text-rose-500 transition-all mt-2"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-rose-500">
                      <LogOut size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-tight">Sair do Sistema</span>
                  </div>
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-sky-100 px-2 py-3 flex items-center justify-around z-[70] shadow-[0_-10px_30px_rgba(14,165,233,0.05)] rounded-t-[2rem]">
        {mobileFixedItems.map(item => (
          <button 
            key={item.id} 
            onClick={() => handleMobileNav(item.id)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${view === item.id && !isMobileMenuOpen ? 'text-sky-500 bg-sky-50/50' : 'text-slate-400'}`}
          >
            <item.icon size={22} strokeWidth={view === item.id && !isMobileMenuOpen ? 3 : 2} />
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
        
        {/* Botão "MAIS" */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${isMobileMenuOpen ? 'text-sky-500 bg-sky-50/50 scale-110' : 'text-slate-400'}`}
        >
          <div className={`transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}>
            {isMobileMenuOpen ? <X size={22} strokeWidth={3} /> : <MoreHorizontal size={22} strokeWidth={2} />}
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest">{isMobileMenuOpen ? 'FECHAR' : 'MAIS'}</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
