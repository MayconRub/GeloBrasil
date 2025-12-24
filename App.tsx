import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CircleDollarSign, 
  Receipt, 
  Users, 
  Truck, 
  Menu, 
  X,
  LayoutGrid,
  Loader2,
  ShieldAlert,
  LogOut,
  LogIn,
  Mail,
  Lock,
  Zap,
  Rocket,
  Target,
  Award,
  Briefcase,
  Building,
  Gem,
  Globe,
  Smile,
  Heart,
  Store,
  Wallet,
  Snowflake,
  Box,
  Phone,
  Sparkles
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { fetchAllData, fetchSettings, syncSale, syncExpense, syncEmployee, syncVehicle, syncCategory, syncSettings, AppData, syncProduction } from './store';
import { ViewType, Sale, Expense, Employee, Vehicle, AppSettings, Production } from './types';
import DashboardView from './components/DashboardView';
import SalesView from './components/SalesView';
import ProductionView from './components/ProductionView';
import ExpensesView from './components/ExpensesView';
import TeamView from './components/TeamView';
import FleetView from './components/FleetView';
import AdminView from './components/AdminView';
import AIInsightsView from './components/AIInsightsView';

const LOGO_COMPONENTS: Record<string, any> = {
  LayoutGrid, Zap, Rocket, Target, Award, Briefcase, Building, Gem, Globe, Smile, Heart, Store, Wallet, Snowflake, Box
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [data, setData] = useState<AppData>({
    sales: [],
    expenses: [],
    employees: [],
    vehicles: [],
    production: [],
    categories: [],
    settings: { 
      companyName: 'Gestor Pro', 
      primaryColor: '#4f46e5', 
      logoId: 'LayoutGrid',
      loginHeader: 'Login Corporativo',
      supportPhone: '',
      footerText: ''
    }
  });

  const ADMIN_EMAIL = 'mayconrubemx@gmail.com';

  useEffect(() => {
    const loadInitialSettings = async () => {
      try {
        const settings = await fetchSettings();
        setData(prev => ({ ...prev, settings }));
        document.title = settings.companyName;
        setIsSettingsLoaded(true);
      } catch (e) {
        setIsSettingsLoaded(true);
      }
    };
    loadInitialSettings();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      if (isSettingsLoaded) setIsLoading(false);
      return;
    }

    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
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
    initData();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [session, isSettingsLoaded]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });
    if (error) alert('Erro: ' + error.message);
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setView('dashboard');
  };

  const handleUpdateSales = async (updatedSales: Sale[]) => {
    const prevSales = data.sales;
    setData(prev => ({ ...prev, sales: updatedSales }));
    if (updatedSales.length < prevSales.length) {
      const deleted = prevSales.find(ps => !updatedSales.find(us => us.id === ps.id));
      if (deleted) await syncSale(deleted, true);
    } else {
      const changed = updatedSales.find(us => {
        const ps = prevSales.find(p => p.id === us.id);
        return !ps || JSON.stringify(ps) !== JSON.stringify(us);
      });
      if (changed) await syncSale(changed);
    }
  };

  const handleUpdateProduction = async (updatedProduction: Production[]) => {
    const prevProduction = data.production;
    setData(prev => ({ ...prev, production: updatedProduction }));
    if (updatedProduction.length < prevProduction.length) {
      const deleted = prevProduction.find(pp => !updatedProduction.find(up => up.id === pp.id));
      if (deleted) await syncProduction(deleted, true);
    } else {
      const changed = updatedProduction.find(up => {
        const pp = prevProduction.find(p => p.id === up.id);
        return !pp || JSON.stringify(pp) !== JSON.stringify(up);
      });
      if (changed) await syncProduction(changed);
    }
  };

  const handleUpdateExpenses = async (updatedExpenses: Expense[]) => {
    const prevExpenses = data.expenses;
    setData(prev => ({ ...prev, expenses: updatedExpenses }));
    if (updatedExpenses.length < prevExpenses.length) {
      const deleted = prevExpenses.find(pe => !updatedExpenses.find(ue => ue.id === pe.id));
      if (deleted) await syncExpense(deleted, true);
    } else {
      const changed = updatedExpenses.find(ue => {
        const pe = prevExpenses.find(p => p.id === ue.id);
        return !pe || JSON.stringify(pe) !== JSON.stringify(ue);
      });
      if (changed) await syncExpense(changed);
    }
  };

  const handleUpdateEmployees = async (updatedEmployees: Employee[]) => {
    const prevEmployees = data.employees;
    setData(prev => ({ ...prev, employees: updatedEmployees }));
    if (updatedEmployees.length < prevEmployees.length) {
      const deleted = prevEmployees.find(pe => !updatedEmployees.find(ue => ue.id === pe.id));
      if (deleted) await syncEmployee(deleted, true);
    } else {
      const changed = updatedEmployees.find(ue => {
        const pe = prevEmployees.find(p => p.id === ue.id);
        return !pe || JSON.stringify(pe) !== JSON.stringify(ue);
      });
      if (changed) await syncEmployee(changed);
    }
  };

  const handleUpdateVehicles = async (updatedVehicles: Vehicle[]) => {
    const prevVehicles = data.vehicles;
    setData(prev => ({ ...prev, vehicles: updatedVehicles }));
    if (updatedVehicles.length < prevVehicles.length) {
      const deleted = prevVehicles.find(pv => !updatedVehicles.find(uv => uv.id === pv.id));
      if (deleted) await syncVehicle(deleted, true);
    } else {
      const changed = updatedVehicles.find(uv => {
        const pv = prevVehicles.find(p => p.id === uv.id);
        return !pv || JSON.stringify(pv) !== JSON.stringify(uv);
      });
      if (changed) await syncVehicle(changed);
    }
  };

  const handleUpdateCategories = async (updatedCategories: string[]) => {
    const newCat = updatedCategories.find(c => !data.categories.includes(c));
    setData(prev => ({ ...prev, categories: updatedCategories }));
    if (newCat) await syncCategory(newCat);
  };

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    if (session?.user?.email !== ADMIN_EMAIL) return;
    setData(prev => ({ ...prev, settings: newSettings }));
    await syncSettings(newSettings);
    document.title = newSettings.companyName;
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'production', label: 'Produção', icon: Snowflake },
    { id: 'sales', label: 'Vendas', icon: CircleDollarSign },
    { id: 'expenses', label: 'Despesas', icon: Receipt },
    { id: 'insights', label: 'Consultoria AI', icon: Sparkles },
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'fleet', label: 'Frota', icon: Truck },
  ];

  const handleNavigate = (id: ViewType) => {
    if (id === 'admin' && session?.user?.email !== ADMIN_EMAIL) {
      setView('dashboard');
      return;
    }
    setView(id);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const LogoComponent = LOGO_COMPONENTS[data.settings.logoId] || LayoutGrid;

  if (isLoading || !isSettingsLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] text-white shadow-2xl mb-6" style={{ backgroundColor: data.settings.primaryColor }}>
              <LogoComponent size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{data.settings.companyName}</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="E-mail" required />
            <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Senha" required />
            <button type="submit" disabled={authLoading} className="w-full h-14 text-white font-black rounded-2xl transition-all" style={{ backgroundColor: data.settings.primaryColor }}>
              {authLoading ? 'Carregando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isUserAdmin = session?.user?.email === ADMIN_EMAIL;

  return (
    <div className="min-h-screen flex bg-slate-50 flex-col lg:flex-row">
      <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="font-bold text-slate-800">{data.settings.companyName}</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu size={26} /></button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 lg:static lg:block ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 rounded-2xl text-white shadow-xl" style={{ backgroundColor: data.settings.primaryColor }}>
              <LogoComponent size={24} />
            </div>
            <h1 className="font-extrabold text-slate-900 text-xl truncate">{data.settings.companyName}</h1>
          </div>

          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => handleNavigate(item.id as ViewType)} 
                className={`w-full flex items-center p-3.5 rounded-2xl transition-all ${view === item.id ? 'text-white font-bold shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
                style={view === item.id ? { backgroundColor: data.settings.primaryColor } : {}}
              >
                <item.icon size={22} />
                <span className="ml-3.5">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100 space-y-3">
            {isUserAdmin && (
              <button onClick={() => handleNavigate('admin')} className={`w-full flex items-center p-3.5 rounded-2xl ${view === 'admin' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>
                <ShieldAlert size={22} /><span className="ml-3.5">Administrador</span>
              </button>
            )}
            <button onClick={handleLogout} className="w-full flex items-center p-3.5 text-rose-500 font-bold"><LogOut size={22} /><span className="ml-3.5">Sair</span></button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {view === 'dashboard' && <DashboardView sales={data.sales} expenses={data.expenses} production={data.production} onSwitchView={handleNavigate} />}
          {view === 'production' && <ProductionView production={data.production} onUpdate={handleUpdateProduction} />}
          {view === 'sales' && <SalesView sales={data.sales} onUpdate={handleUpdateSales} />}
          {view === 'expenses' && <ExpensesView expenses={data.expenses} categories={data.categories} vehicles={data.vehicles} employees={data.employees} onUpdate={handleUpdateExpenses} onUpdateCategories={handleUpdateCategories} />}
          {view === 'team' && <TeamView employees={data.employees} onUpdate={handleUpdateEmployees} />}
          {view === 'fleet' && <FleetView vehicles={data.vehicles} onUpdate={handleUpdateVehicles} />}
          {view === 'insights' && <AIInsightsView data={{ sales: data.sales, expenses: data.expenses }} />}
          {view === 'admin' && isUserAdmin && <AdminView settings={data.settings} onUpdateSettings={handleUpdateSettings} />}
        </div>
      </main>
    </div>
  );
};

export default App;