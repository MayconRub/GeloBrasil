
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
  AlertOctagon,
  Shield,
  Copy,
  CheckCircle2,
  QrCode,
  Plus,
  BarChartHorizontal
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
import CashFlowView from './components/CashFlowView';

const LOGO_COMPONENTS: Record<string, any> = {
  LayoutGrid, Zap, Rocket, Target, Award, Briefcase, Building, Gem, Globe, Smile, Heart, Store, Wallet, Snowflake, Box
};

const PIX_CODE = "00020126330014BR.GOV.BCB.PIX0111135244986205204000053039865406100.005802BR5925MAYCON RUBEM DOS SANTOS P6013MONTES CLAROS622605227BMNa87KrNFOdAnlPuWMaY6304CECE";

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
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
      companyName: '', 
      cnpj: '',
      primaryColor: '#4f46e5', 
      logoId: 'LayoutGrid',
      loginHeader: '',
      supportPhone: '',
      footerText: '',
      expirationDate: '2099-12-31',
      hiddenViews: [],
      dashboardNotice: ''
    }
  });

  const ADMIN_EMAIL = 'mayconrubemx@gmail.com';

  const isExpired = () => {
    if (!data.settings.expirationDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(data.settings.expirationDate + 'T00:00:00');
    return today.getTime() > expDate.getTime();
  };

  const isUserAdmin = session?.user?.email === ADMIN_EMAIL;
  const systemLocked = isExpired() && !isUserAdmin;

  useEffect(() => {
    const loadInitialSettings = async () => {
      try {
        const settings = await fetchSettings();
        setData(prev => ({ ...prev, settings }));
        document.title = settings.companyName;
        setIsSettingsLoaded(true);
      } catch (e) {
        console.error("Erro ao carregar configurações iniciais", e);
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
    setIsPaymentModalOpen(false);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_CODE);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
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
    { id: 'cashflow', label: 'Fluxo Caixa', icon: BarChartHorizontal },
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'fleet', label: 'Frota', icon: Truck },
  ].filter(item => !data.settings.hiddenViews.includes(item.id));

  const handleNavigate = (id: ViewType) => {
    if (id === 'admin' && session?.user?.email !== ADMIN_EMAIL) return;
    setView(id);
    setIsFabOpen(false);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const LogoComponent = LOGO_COMPONENTS[data.settings.logoId] || LayoutGrid;

  if (isLoading || !isSettingsLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-sky-500 mb-4" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Iniciando Módulos...</p>
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

        <div className="w-full max-w-[420px] backdrop-blur-2xl bg-white/5 p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] relative z-10 overflow-hidden group">
          <div className="text-center mb-10 relative">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 rounded-[2rem] sm:rounded-[3rem] text-white shadow-2xl mb-6 transform hover:scale-110 transition-all duration-700 bg-gradient-to-br from-sky-400 to-indigo-600 border border-white/20">
              <LogoComponent size={window.innerWidth < 640 ? 40 : 56} className="drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tighter mb-1 truncate whitespace-nowrap w-full px-2">
              {data.settings.companyName || 'Carregando...'}
            </h1>
            <p className="text-sky-300/60 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em] truncate px-4">
              {data.settings.loginHeader || 'Painel Administrativo'}
            </p>
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
              <span>{authLoading ? 'AUTENTICANDO...' : 'ACESSAR AGORA'}</span>
            </button>
          </form>

          {data.settings.supportPhone && (
            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <a href={`https://wa.me/55${data.settings.supportPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white/30 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all">
                <MessageCircle size={14} className="text-sky-500" /> Suporte: {data.settings.supportPhone}
              </a>
            </div>
          )}
        </div>

        {data.settings.footerText && (
          <div className="mt-10 flex flex-col items-center relative z-10">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10 backdrop-blur-md shadow-2xl">
              <Code2 size={14} className="text-sky-400 animate-pulse" />
              <span className="text-sky-300 font-black text-[10px] uppercase tracking-widest">
                {data.settings.footerText}
              </span>
            </div>
          </div>
        )}
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
          O prazo de uso deste sistema terminou. Para liberar seu acesso, clique no botão abaixo para ver os dados de pagamento.
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
           <button 
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:brightness-110 active:scale-95 transition-all"
          >
            <QrCode size={20} /> Ver Opções de Pagamento
          </button>
          {data.settings.supportPhone && (
            <a 
              href={`tel:${data.settings.supportPhone.replace(/\D/g, '')}`}
              className="w-full py-4 bg-sky-50 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:brightness-110 active:scale-95 transition-all"
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
        
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setIsPaymentModalOpen(false)}></div>
             <div className="bg-white rounded-[3rem] p-8 sm:p-12 w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in duration-300">
                <button onClick={() => setIsPaymentModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={24} />
                </button>
                <div className="text-center space-y-6">
                   <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 mb-2">
                      <QrCode size={32} />
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Renovação via PIX</h3>
                   <div className="bg-white p-4 rounded-3xl border-2 border-slate-100 flex items-center justify-center overflow-hidden">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(PIX_CODE)}`} 
                        alt="PIX QR Code" 
                        className="w-full h-auto max-w-[240px] rounded-xl shadow-inner" 
                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300?text=QR+CODE+INDISPONIVEL')}
                      />
                   </div>
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escaneie o QR Code acima ou</p>
                      <button 
                        onClick={handleCopyPix}
                        className={`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border-2 ${pixCopied ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-900 hover:border-indigo-600 hover:text-indigo-600'}`}
                      >
                        {pixCopied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                        {pixCopied ? 'CÓDIGO COPIADO!' : 'PIX COPIA E COLA'}
                      </button>
                   </div>
                   <p className="text-[9px] text-slate-400 font-bold leading-relaxed px-4">
                      Após o pagamento, envie o comprovante para o suporte para liberação imediata do seu acesso.
                   </p>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 flex-col lg:flex-row font-medium overflow-x-hidden relative">
      <div className="lg:hidden bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0" style={{ backgroundColor: data.settings.primaryColor }}>
            <LogoComponent size={20} />
          </div>
          <h1 className="font-black text-slate-900 tracking-tighter text-lg truncate">
            {data.settings.companyName}
          </h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 bg-slate-100 rounded-xl text-slate-600 active:scale-90 transition-all shrink-0">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 bg-white
      `}>
        <div className="flex flex-col h-full">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-10">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 text-white"
                style={{ backgroundColor: data.settings.primaryColor }}
              >
                <LogoComponent size={24} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none truncate w-40">{data.settings.companyName}</h1>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500"></span> Painel Ativo
                </p>
              </div>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id as ViewType)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-tight transition-all group ${view === item.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                >
                  <item.icon size={20} className={view === item.id ? 'text-indigo-400' : 'group-hover:scale-110 transition-transform'} />
                  {item.label}
                </button>
              ))}

              {isUserAdmin && (
                <button
                  onClick={() => handleNavigate('admin')}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-tight transition-all mt-6 ${view === 'admin' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-indigo-400 hover:bg-indigo-50'}`}
                >
                  <Shield size={20} />
                  ADMINISTRAÇÃO
                </button>
              )}
            </nav>
          </div>

          <div className="mt-auto p-8 border-t border-slate-50">
            <div className="bg-slate-50 rounded-3xl p-5 mb-4 border border-slate-100">
               <div className="flex items-center gap-3 mb-3">
                 <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                    <Users size={16} />
                 </div>
                 <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-800 truncate">{session?.user?.email}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Sessão Ativa</p>
                 </div>
               </div>
               <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
              >
                <LogOut size={14} /> Sair do Sistema
              </button>
            </div>
            <p className="text-[9px] font-bold text-slate-300 text-center uppercase tracking-widest">Versão Pro 3.2.0</p>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Quick Action FAB Component */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3 no-print lg:hidden">
        {isFabOpen && (
          <div className="flex flex-col items-end gap-3 animate-in slide-in-from-bottom-5 duration-300">
             <button onClick={() => handleNavigate('sales')} className="flex items-center gap-3 group">
                <span className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">Venda</span>
                <div className="w-14 h-14 rounded-[1.2rem] bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-200 border border-white/20 active:scale-90 transition-all">
                   <CircleDollarSign size={24} />
                </div>
             </button>
             <button onClick={() => handleNavigate('production')} className="flex items-center gap-3 group">
                <span className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">Produção</span>
                <div className="w-14 h-14 rounded-[1.2rem] bg-sky-500 text-white flex items-center justify-center shadow-xl shadow-sky-200 border border-white/20 active:scale-90 transition-all">
                   <Snowflake size={24} />
                </div>
             </button>
             <button onClick={() => handleNavigate('expenses')} className="flex items-center gap-3 group">
                <span className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">Despesa</span>
                <div className="w-14 h-14 rounded-[1.2rem] bg-rose-500 text-white flex items-center justify-center shadow-xl shadow-rose-200 border border-white/20 active:scale-90 transition-all">
                   <Receipt size={24} />
                </div>
             </button>
          </div>
        )}
        <button 
          onClick={() => setIsFabOpen(!isFabOpen)}
          className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-300 active:scale-95 transition-all border border-white/20 hover:brightness-110"
        >
          {isFabOpen ? <X size={28} /> : <Plus size={32} />}
        </button>
      </div>

      <main className="flex-1 transition-all duration-500 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-5 sm:p-10 lg:p-14">
          <div className="no-print">
            {view === 'dashboard' && <DashboardView sales={data.sales} expenses={data.expenses} production={data.production} hiddenViews={data.settings.hiddenViews} dashboardNotice={data.settings.dashboardNotice} expirationDate={data.settings.expirationDate} onSwitchView={setView} onOpenPayment={() => setIsPaymentModalOpen(true)} />}
            {view === 'production' && <ProductionView production={data.production} onUpdate={handleUpdateProduction} />}
            {view === 'sales' && <SalesView sales={data.sales} onUpdate={handleUpdateSales} />}
            {view === 'expenses' && <ExpensesView expenses={data.expenses} categories={data.categories} vehicles={data.vehicles} employees={data.employees} onUpdate={handleUpdateExpenses} onUpdateCategories={handleUpdateCategories} />}
            {view === 'cashflow' && <CashFlowView sales={data.sales} expenses={data.expenses} />}
            {view === 'team' && <TeamView employees={data.employees} onUpdate={handleUpdateEmployees} companyName={data.settings.companyName} />}
            {view === 'fleet' && <FleetView vehicles={data.vehicles} onUpdate={handleUpdateVehicles} />}
            {view === 'admin' && isUserAdmin && <AdminView settings={data.settings} onUpdateSettings={handleUpdateSettings} onOpenPayment={() => setIsPaymentModalOpen(true)} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
