
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CircleDollarSign, 
  Receipt, 
  Users, 
  Truck, 
  Loader2,
  LogOut,
  Snowflake,
  Shield,
  BarChartHorizontal,
  Menu,
  MoreHorizontal,
  X
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { fetchAllData, fetchSettings, syncSale, syncExpense, syncEmployee, syncVehicle, syncCategory, syncSettings, AppData, syncProduction, syncMonthlyGoal } from './store';
import { ViewType, Sale, Expense, Employee, Vehicle, AppSettings, Production, MonthlyGoal } from './types';
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
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [session, setSession] = useState<any>({ user: { email: 'dev@test.com' }, access: 'granted' });
  
  const [data, setData] = useState<AppData>({
    sales: [], expenses: [], employees: [], vehicles: [], production: [], monthlyGoals: [], categories: [],
    settings: { 
      companyName: '', cnpj: '', address: '', primaryColor: '#0ea5e9', logoId: 'Snowflake', 
      loginHeader: '', supportPhone: '', footerText: '', expirationDate: '2099-12-31', 
      hiddenViews: [], dashboardNotice: '', productionGoalDaily: 1000, productionGoalMonthly: 30000,
      salesGoalDaily: 2000, salesGoalMonthly: 60000
    }
  });

  useEffect(() => {
    const loadInitialSettings = async () => {
      try {
        const settings = await fetchSettings();
        setData(prev => ({ ...prev, settings }));
        setIsSettingsLoaded(true);
      } catch (e) {
        setIsSettingsLoaded(true);
      }
    };
    loadInitialSettings();
    
    supabase.auth.getSession().then(({ data: { session: s } }) => {
        if (s) setSession(s);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
        if (s) setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const remoteData = await fetchAllData();
        setData(remoteData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isSettingsLoaded) {
      initData();
    }
  }, [isSettingsLoaded]);

  const handleUpdateSales = async (newSales: Sale[]) => {
    setData(prev => ({ ...prev, sales: newSales }));
    const lastSale = newSales[0];
    if (lastSale) await syncSale(lastSale);
  };

  const handleUpdateExpenses = async (newExpenses: Expense[]) => {
    setData(prev => ({ ...prev, expenses: newExpenses }));
    const lastExp = newExpenses[0];
    if (lastExp) await syncExpense(lastExp);
  };

  const handleUpdateProduction = async (newProd: Production[]) => {
    setData(prev => ({ ...prev, production: newProd }));
    const lastProd = newProd[0];
    if (lastProd) await syncProduction(lastProd);
  };

  const handleUpdateMonthlyGoal = async (newGoal: MonthlyGoal) => {
    setData(prev => {
      const existing = prev.monthlyGoals.findIndex(g => g.type === newGoal.type && g.month === newGoal.month && g.year === newGoal.year);
      const updatedGoals = [...prev.monthlyGoals];
      if (existing >= 0) {
        updatedGoals[existing] = newGoal;
      } else {
        updatedGoals.push(newGoal);
      }
      return { ...prev, monthlyGoals: updatedGoals };
    });
    await syncMonthlyGoal(newGoal);
  };

  const handleUpdateEmployees = async (newEmployees: Employee[]) => {
    setData(prev => ({ ...prev, employees: newEmployees }));
  };

  const handleUpdateVehicles = async (newVehicles: Vehicle[]) => {
    setData(prev => ({ ...prev, vehicles: newVehicles }));
  };

  const handleUpdateCategories = async (newCategories: string[]) => {
    setData(prev => ({ ...prev, categories: newCategories }));
  };

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setData(prev => ({ ...prev, settings: newSettings }));
    await syncSettings(newSettings);
  };

  const handleLogout = async () => {
    window.location.reload();
  };

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'production', label: 'PRODUÇÃO', icon: Snowflake },
    { id: 'sales', label: 'VENDAS', icon: CircleDollarSign },
    { id: 'expenses', label: 'DESPESAS', icon: Receipt },
    { id: 'cashflow', label: 'FLUXO CAIXA', icon: BarChartHorizontal },
    { id: 'team', label: 'EQUIPE', icon: Users },
    { id: 'fleet', label: 'FROTA', icon: Truck },
    { id: 'admin', label: 'ADMIN', icon: Shield },
  ];

  // Filtra itens ocultos
  const filteredNavItems = navItems.filter(item => !data.settings.hiddenViews.includes(item.id));

  // Principais para a Bottom Bar Mobile
  const mainMobileItems = filteredNavItems.slice(0, 4);
  const extraMobileItems = filteredNavItems.slice(4);

  if (isLoading || !isSettingsLoaded) {
    return (
      <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-sky-500 mb-6" size={48} />
        <p className="text-sky-600 font-bold uppercase tracking-widest text-xs">Resfriando ambiente...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row text-slate-700 bg-[#f8fafc]">
      
      {/* Header Mobile */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-lg">
            <Snowflake size={18} />
          </div>
          <span className="text-[10px] font-black text-sky-900 uppercase tracking-tighter">{data.settings.companyName || 'Ice Control'}</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-[8px] font-black text-emerald-600 uppercase">On</span>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <aside className="w-72 ice-glass border-r-0 hidden lg:flex flex-col py-10 px-6 m-4 mr-0 rounded-[3rem] sticky top-4 h-[calc(100vh-2rem)]">
        <div className="px-4 mb-16 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-100">
            <Snowflake size={24} />
          </div>
          <div>
            <h1 className="text-xs font-black text-sky-900 leading-tight uppercase tracking-tight">{data.settings.companyName || 'Ice Control'}</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[8px] font-black text-emerald-600 uppercase">Sistema Ativo</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewType)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${view === item.id ? 'bg-sky-600 text-white shadow-xl shadow-sky-100' : 'text-sky-900/40 hover:text-sky-600 hover:bg-sky-50'}`}
            >
              <item.icon size={20} className={view === item.id ? 'text-white' : 'text-sky-300'} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-8">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 font-black text-[10px] uppercase tracking-widest transition-all">
            <LogOut size={20} /> RECARREGAR
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 pb-24 lg:pb-10">
        <div className="max-w-[1400px] mx-auto">
          {view === 'dashboard' && <DashboardView settings={data.settings} sales={data.sales} expenses={data.expenses} production={data.production} monthlyGoals={data.monthlyGoals} onSwitchView={setView} expirationDate={data.settings.expirationDate} onOpenPayment={() => {}} />}
          {view === 'sales' && <SalesView sales={data.sales} onUpdate={handleUpdateSales} settings={data.settings} monthlyGoals={data.monthlyGoals} onUpdateMonthlyGoal={handleUpdateMonthlyGoal} />}
          {view === 'expenses' && <ExpensesView expenses={data.expenses} categories={data.categories} vehicles={data.vehicles} employees={data.employees} onUpdate={handleUpdateExpenses} onUpdateCategories={handleUpdateCategories} />}
          {view === 'production' && <ProductionView settings={data.settings} production={data.production} monthlyGoals={data.monthlyGoals} onUpdate={handleUpdateProduction} onUpdateMonthlyGoal={handleUpdateMonthlyGoal} onUpdateSettings={handleUpdateSettings} />}
          {view === 'cashflow' && <CashFlowView sales={data.sales} expenses={data.expenses} />}
          {view === 'team' && <TeamView employees={data.employees} onUpdate={handleUpdateEmployees} companyName={data.settings.companyName} />}
          {view === 'fleet' && <FleetView vehicles={data.vehicles} onUpdate={handleUpdateVehicles} />}
          {view === 'admin' && <AdminView settings={data.settings} onUpdateSettings={handleUpdateSettings} />}
        </div>
      </main>

      {/* Bottom Bar Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-2 flex items-center justify-around z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {mainMobileItems.map(item => (
          <button
            key={item.id}
            onClick={() => { setView(item.id as ViewType); setIsMobileMenuOpen(false); }}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${view === item.id ? 'text-sky-600' : 'text-slate-300'}`}
          >
            <item.icon size={22} className={view === item.id ? 'stroke-[3px]' : ''} />
            <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
        {extraMobileItems.length > 0 && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${isMobileMenuOpen ? 'text-sky-600' : 'text-slate-300'}`}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            <span className="text-[8px] font-black uppercase tracking-tighter">{isMobileMenuOpen ? 'Fechar' : 'Menu'}</span>
          </button>
        )}
      </nav>

      {/* Menu Extra Mobile (Overlay) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[90] animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute bottom-20 left-4 right-4 bg-white rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-4">Recursos Adicionais</h3>
            <div className="grid grid-cols-2 gap-3">
               {extraMobileItems.map(item => (
                 <button
                   key={item.id}
                   onClick={() => { setView(item.id as ViewType); setIsMobileMenuOpen(false); }}
                   className={`flex items-center gap-3 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${view === item.id ? 'bg-sky-50 border-sky-100 text-sky-600' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                 >
                   <item.icon size={18} />
                   {item.label}
                 </button>
               ))}
               <button onClick={handleLogout} className="flex items-center gap-3 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-rose-50 border border-rose-100 text-rose-500 col-span-2">
                 <LogOut size={18} /> Recarregar Sistema
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
