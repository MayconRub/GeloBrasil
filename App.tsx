
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
  MessageCircle,
  Code2,
  AlertOctagon
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
      footerText: '',
      expirationDate: '2099-12-31',
      hiddenViews: []
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
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
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

  const isExpired = () => {
    if (!data.settings.expirationDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(data.settings.expirationDate + 'T00:00:00');
    return today.getTime() > expDate.getTime();
  };

  const isUserAdmin = session?.user?.email === ADMIN_EMAIL;
  const systemLocked = isExpired() && !isUserAdmin;

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
    const { error } = await syncSettings(newSettings);
    if (error) {
      alert('Erro ao salvar no banco: ' + error.message);
    }
    document.title = newSettings.companyName;
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'production', label: 'Produção', icon: Snowflake },
    { id: 'sales', label: 'Vendas', icon: CircleDollarSign },
    { id: 'expenses', label: 'Despesas', icon: Receipt },
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'fleet', label: 'Frota', icon: Truck },
  ].filter(item => !data.settings.hiddenViews.includes(item.id));

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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-sky-500 mb-4" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Carregando Sistema...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full blur-[140px] opacity-20 animate-pulse bg-sky-400"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[90%] h-[90%] rounded-full blur-[180px] opacity-10 bg-indigo-500"></div>
        </div>

        <div className="absolute inset-0 pointer-events-none z-1 overflow-hidden">
          {[...Array(window.innerWidth < 640 ? 20 : 40)].map((_, i) => (
            <div 
              key={`snow-${i}`}
              className="absolute bg-white rounded-full opacity-40 animate-[snow_linear_infinite]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 10}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                animationDuration: `${Math.random() * 8 + 4}s`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        <div className="w-full max-w-[420px] backdrop-blur-2xl bg-white/5 p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] relative z-10 overflow-hidden group">
          <div className="text-center mb-10 relative">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 rounded-[2rem] sm:rounded-[3rem] text-white shadow-2xl mb-6 transform hover:scale-110 transition-all duration-700 bg-gradient-to-br from-sky-400 to-indigo-600 border border-white/20">
              <LogoComponent size={window.innerWidth < 640 ? 40 : 56} className="drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mb-2">{data.settings.companyName}</h1>
            <p className="text-sky-300/60 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em]">{data.settings.loginHeader}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-sky-200/30 group-focus-within:text-sky-400 transition-colors" size={20} />
              <input 
                type="email" 
                value={authEmail} 
                onChange={(e) => setAuthEmail(e.target.value)} 
                className="w-full h-14 sm:h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-[2rem] outline-none focus:ring-2 focus:ring-sky-500/30 focus:bg-white/10 transition-all font-semibold text-white placeholder:text-white/20" 
                placeholder="E-mail" 
                required 
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-sky-200/30 group-focus-within:text-sky-400 transition-colors" size={20} />
              <input 
                type="password" 
                value={authPassword} 
                onChange={(e) => setAuthPassword(e.target.value)} 
                className="w-full h-14 sm:h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-[2rem] outline-none focus:ring-2 focus:ring-sky-500/30 focus:bg-white/10 transition-all font-semibold text-white placeholder:text-white/20" 
                placeholder="Senha" 
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={authLoading} 
              className="w-full h-14 sm:h-16 text-white font-black text-base sm:text-lg rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 mt-8 relative overflow-hidden border border-white/10"
              style={{ backgroundColor: data.settings.primaryColor }}
            >
              {authLoading ? <Loader2 className="animate-spin" size={24} /> : <LogIn size={24} />}
              <span>{authLoading ? 'Gelando...' : 'Entrar no Sistema'}</span>
            </button>
          </form>

          {data.settings.supportPhone && (
            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <a href={`tel:${data.settings.supportPhone}`} className="inline-flex items-center gap-2 text-white/30 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all">
                <Phone size={14} className="text-sky-500" /> Suporte: {data.settings.supportPhone}
              </a>
            </div>
          )}
        </div>

        {data.settings.footerText && (
          <div className="mt-10 flex flex-col items-center relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-1000 max-w-[90vw]">
            <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/5 rounded-full border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(125,211,252,0.1)] group hover:border-sky-400/30 transition-all duration-500 flex-nowrap overflow-hidden">
              <Code2 size={14} className="text-sky-400 animate-pulse shrink-0" />
              <span className="text-sky-300 font-black text-[10px] sm:text-[12px] uppercase tracking-[0.15em] sm:tracking-[0.2em] drop-shadow-[0_0_10px_rgba(125,211,252,0.5)] group-hover:text-white transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
                {data.settings.footerText}
              </span>
            </div>
          </div>
        )}

        <style>{`
          @keyframes snow {
            from { transform: translateY(-10vh) rotate(0deg); }
            to { transform: translateY(110vh) rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (systemLocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-rose-500/10 rounded-[2rem] flex items-center justify-center text-rose-500 mb-8 animate-bounce border border-rose-500/20">
          <AlertOctagon size={48} />
        </div>
        <h2 className="text-3xl font-black text-white mb-4">Assinatura Expirada</h2>
        <p className="text-slate-400 max-w-md mb-10 leading-relaxed font-medium">
          O prazo de uso deste sistema terminou. Para liberar seu acesso, entre em contato com o suporte.
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          {data.settings.supportPhone && (
            <a 
              href={`tel:${data.settings.supportPhone}`}
              className="w-full py-4 bg-sky-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:brightness-110 active:scale-95 transition-all"
            >
              <Phone size={20} /> Ligar Suporte
            </a>
          )}
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-white/5 text-slate-400 font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
          >
            Sair do Sistema
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 flex-col lg:flex-row font-medium overflow-x-hidden">
      <div className="lg:hidden bg-white/90 backdrop-blur-2xl border-b border-slate-200 px-5 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: data.settings.primaryColor }}>
            <LogoComponent size={20} />
          </div>
          <h1 className="font-black text-slate-900 tracking-tighter text-lg">{data.settings.companyName}</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 bg-slate-100 rounded-xl text-slate-600 active:scale-90 transition-all">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside className={`
        fixed inset-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 lg:w-80 bg-white border-r border-slate-200
      `}>
        <div 
          className={`lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
          onClick={() => setIsSidebarOpen(false)}
        />

        <div className="relative z-10 p-8 h-full flex flex-col bg-white">
          <div className="flex items-center gap-4 mb-14 px-2">
            <div className="p-4 rounded-[1.5rem] text-white shadow-2xl shadow-indigo-100 transform hover:rotate-6 transition-all duration-500" style={{ backgroundColor: data.settings.primaryColor }}>
              <LogoComponent size={28} />
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-slate-900 text-xl truncate tracking-tighter leading-none">{data.settings.companyName}</h1>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Ice Control System</p>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => handleNavigate(item.id as ViewType)} 
                className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 group ${view === item.id ? 'text-white font-bold shadow-xl' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
                style={view === item.id ? { backgroundColor: data.settings.primaryColor } : {}}
              >
                <item.icon size={20} className={`transition-transform duration-500 ${view === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="ml-4 tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-slate-100 space-y-3 px-2">
            {isUserAdmin && (
              <button onClick={() => handleNavigate('admin')} className={`w-full flex items-center p-4 rounded-2xl transition-all ${view === 'admin' ? 'bg-slate-900 text-white font-bold' : 'text-slate-400 hover:text-slate-900'}`}>
                <ShieldAlert size={20} /><span className="ml-4">Gestão Admin</span>
              </button>
            )}
            <button onClick={handleLogout} className="w-full flex items-center p-4 text-rose-500 font-bold hover:bg-rose-50 rounded-2xl transition-all">
              <LogOut size={20} />
              <span className="ml-4">Desconectar</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-5 sm:p-10 lg:p-14 overflow-y-auto bg-[#fafbfc]">
        <div className="max-w-[1600px] mx-auto">
          {view === 'dashboard' && <DashboardView sales={data.sales} expenses={data.expenses} production={data.production} hiddenViews={data.settings.hiddenViews} onSwitchView={handleNavigate} />}
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
