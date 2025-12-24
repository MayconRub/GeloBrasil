
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
  Scale
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

// Mapeamento de ícones para renderização dinâmica
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
      companyName: '', // Inicialmente vazio para evitar flash do nome padrão
      primaryColor: '#4f46e5', 
      logoId: 'LayoutGrid',
      loginHeader: 'Carregando...',
      supportPhone: '',
      footerText: ''
    }
  });

  const ADMIN_EMAIL = 'mayconrubemx@gmail.com';

  useEffect(() => {
    // Carregar configurações iniciais (identidade visual) imediatamente
    const loadInitialSettings = async () => {
      try {
        const settings = await fetchSettings();
        setData(prev => ({ ...prev, settings }));
        document.title = settings.companyName;
        setIsSettingsLoaded(true);
      } catch (e) {
        console.error("Erro ao carregar configurações:", e);
        // Fallback caso falhe
        setData(prev => ({ 
          ...prev, 
          settings: { ...prev.settings, companyName: 'Gestor Pro' } 
        }));
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
        document.title = remoteData.settings.companyName;
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
        <div className="text-center animate-in fade-in duration-500">
          <LogoComponent 
            className="animate-bounce mx-auto mb-6" 
            size={56} 
            style={{ color: data.settings.primaryColor || '#4f46e5' }} 
          />
          <div className="space-y-2">
            {data.settings.companyName ? (
              <p className="text-slate-800 font-black text-xl tracking-tight animate-pulse">
                {data.settings.companyName}
              </p>
            ) : (
              <div className="h-6 w-32 bg-slate-200 rounded-full mx-auto animate-pulse"></div>
            )}
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Carregando Sistema</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-between p-6 overflow-y-auto">
        {/* Espaçador superior para centralizar o formulário verticalmente se houver espaço */}
        <div className="flex-1 hidden md:block"></div>
        
        <div className="max-w-md w-full animate-in zoom-in-95 duration-500 z-10 py-8">
          <div className="text-center mb-10">
            <div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 mb-6 transition-colors duration-500"
              style={{ backgroundColor: data.settings.primaryColor }}
            >
              <LogoComponent size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{data.settings.companyName}</h1>
            <p className="text-slate-500 font-medium mt-2">{data.settings.loginHeader || 'Login Corporativo'}</p>
          </div>
          
          <form onSubmit={handleLogin} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Mail size={12} /> E-mail</label>
                <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all font-semibold" placeholder="seu@email.com" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Lock size={12} /> Senha</label>
                <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all font-semibold" placeholder="••••••••" required />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={authLoading} 
              className="w-full h-14 text-white font-black rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              style={{ backgroundColor: data.settings.primaryColor }}
            >
              {authLoading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />} Acessar
            </button>
          </form>

          {data.settings.supportPhone && (
            <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Precisa de ajuda?</p>
              <a 
                href={`tel:${data.settings.supportPhone.replace(/\D/g,'')}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm group"
              >
                <Phone size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <span>Suporte: {data.settings.supportPhone}</span>
              </a>
            </div>
          )}
        </div>

        {/* Espaçador inferior para empurrar o rodapé */}
        <div className="flex-1"></div>

        {/* Rodapé de Créditos - Agora posicionado naturalmente no fim do container flex */}
        {data.settings.footerText && (
          <div className="w-full text-center py-8 animate-in fade-in duration-1000 delay-500 mt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
              {data.settings.footerText}
            </p>
          </div>
        )}
      </div>
    );
  }

  const isUserAdmin = session?.user?.email === ADMIN_EMAIL;

  return (
    <div className="min-h-screen flex bg-slate-50 flex-col lg:flex-row font-sans selection:bg-indigo-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigate('dashboard')}>
          <div className="p-1.5 rounded-lg text-white shadow-md" style={{ backgroundColor: data.settings.primaryColor }}>
            <LogoComponent size={20} />
          </div>
          <h1 className="font-bold text-slate-800 tracking-tight">{data.settings.companyName}</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors">
          {isSidebarOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {isSidebarOpen && window.innerWidth < 1024 && (
        <div className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-all duration-300 lg:static lg:block ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-10 cursor-pointer group" onClick={() => handleNavigate('dashboard')}>
            <div className="p-2.5 rounded-2xl text-white shadow-xl shadow-indigo-100 group-hover:scale-105 transition-transform" style={{ backgroundColor: data.settings.primaryColor }}>
              <LogoComponent size={24} />
            </div>
            <h1 className="font-extrabold text-slate-900 text-2xl tracking-tighter truncate max-w-[180px]">{data.settings.companyName}</h1>
          </div>

          <nav className="space-y-1.5 flex-1 overflow-y-auto">
            {navItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => handleNavigate(item.id as ViewType)} 
                className={`w-full flex items-center p-3.5 rounded-2xl transition-all ${view === item.id ? 'text-white shadow-xl font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                style={view === item.id ? { backgroundColor: data.settings.primaryColor } : {}}
              >
                <item.icon size={22} className={view === item.id ? 'text-white' : 'text-slate-400'} />
                <span className="ml-3.5 text-[15px]">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100 space-y-3">
            {isUserAdmin && (
              <button onClick={() => handleNavigate('admin')} className={`w-full flex items-center p-3.5 rounded-2xl transition-all ${view === 'admin' ? 'bg-slate-900 text-white shadow-xl font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                <ShieldAlert size={22} className={view === 'admin' ? 'text-white' : 'text-slate-400'} />
                <span className="ml-3.5 text-[15px]">Administrador</span>
              </button>
            )}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 shrink-0 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                  {session.user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden text-[11px] font-black text-slate-800 truncate">{session.user.email}</div>
              </div>
              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Sair"><LogOut size={18} /></button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 lg:p-10 overflow-x-hidden overflow-y-auto">
        <div className="max-w-7xl mx-auto pb-10">
          {view === 'dashboard' && <DashboardView sales={data.sales} expenses={data.expenses} production={data.production} onSwitchView={handleNavigate} />}
          {view === 'production' && <ProductionView production={data.production} onUpdate={handleUpdateProduction} />}
          {view === 'sales' && <SalesView sales={data.sales} onUpdate={handleUpdateSales} />}
          {view === 'expenses' && <ExpensesView expenses={data.expenses} categories={data.categories} vehicles={data.vehicles} employees={data.employees} onUpdate={handleUpdateExpenses} onUpdateCategories={handleUpdateCategories} />}
          {view === 'team' && <TeamView employees={data.employees} onUpdate={handleUpdateEmployees} />}
          {view === 'fleet' && <FleetView vehicles={data.vehicles} onUpdate={handleUpdateVehicles} />}
          {view === 'admin' && isUserAdmin && <AdminView settings={data.settings} onUpdateSettings={handleUpdateSettings} />}
        </div>
      </main>
    </div>
  );
};

export default App;
