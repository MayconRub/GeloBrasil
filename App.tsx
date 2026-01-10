
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  CircleDollarSign, Receipt, Users, Truck, Loader2, Snowflake, 
  X, LogOut, MoreHorizontal, ChevronRight, Mail, Lock, LogIn, Phone, 
  ShieldCheck, UserPlus, PackageCheck, Boxes, Moon, Sun, LayoutGrid, ShieldAlert,
  QrCode, Copy, Check, MessageCircle, EyeOff, Eye, Activity, TrendingUp, ArrowDownRight,
  ArrowUpRight, Target, AlertCircle, Bell, AlertTriangle, Clock, RefreshCw
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { fetchAllData, syncSale, syncExpense, syncEmployee, syncVehicle, syncCategory, syncSettings, AppData, syncProduction, syncMonthlyGoal, syncCategoriesOrder, syncFuel, syncMaintenance, syncFine, deleteSale, deleteExpense, deleteProduction, deleteEmployee, deleteVehicle, deleteCategory, deleteFuel, deleteMaintenance, deleteFine, syncClient, deleteClient, syncDelivery, deleteDelivery, syncProduct, deleteProduct, syncStockMovement } from './store';
import { ViewType, Sale, Expense, Employee, Vehicle, Production, MonthlyGoal, FuelLog, MaintenanceLog, FineLog, Client, Delivery, Product, StockMovement, ExpenseStatus, DeliveryStatus } from './types';
import DashboardView from './components/DashboardView';
import SalesView from './components/SalesView';
import ProductionView from './components/ProductionView';
import ExpensesView from './components/ExpensesView';
import TeamView from './components/TeamView';
import FleetView from './components/FleetView';
import AdminView from './components/AdminView';
import ClientsView from './components/ClientsView';
import DeliveriesView from './components/DeliveriesView';
import InventoryView from './components/InventoryView';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return typeof localStorage !== 'undefined' && localStorage.getItem('theme') === 'dark';
  });
  
  // Pull to Refresh State (Top & Bottom)
  const [pullDistance, setPullDistance] = useState(0);
  const [bottomPullDistance, setBottomPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartPos = useRef(0);

  const [data, setData] = useState<AppData>({
    sales: [], expenses: [], employees: [], vehicles: [], fuelLogs: [], maintenanceLogs: [], fineLogs: [], production: [], monthlyGoals: [], categories: [], users: [], clients: [], deliveries: [], products: [], stockMovements: [],
    settings: { companyName: 'GELO BRASIL LTDA', cnpj: '42.996.710/0001-63', pixKey: '', primaryColor: '#5ecce3', logoId: 'Snowflake', loginHeader: 'ADMIN', supportPhone: '', footerText: '', expirationDate: '2099-12-31', hiddenViews: [], menuOrder: [], adminEmail: 'root@adm.app' }
  });

  const SYSTEM_EXPIRATION_PIX = "00020126590014BR.GOV.BCB.PIX0111135244986200222Mensalidade do Sistema5204000053039865406100.005802BR5925MAYCON RUBEM DOS SANTOS P6013MONTES CLAROS622605226rZoYS25kQugjDLBWRKJVs63045E25";

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const loadAppData = async () => {
    try { 
      if (!isRefreshing) setIsLoading(true); 
      const remoteData = await fetchAllData(); 
      if (remoteData) setData(remoteData); 
    } 
    catch (e) { 
      console.error("ERRO AO CARREGAR DADOS:", e); 
    } finally { 
      setIsLoading(false); 
      setIsRefreshing(false);
      setPullDistance(0);
      setBottomPullDistance(0);
    }
  };

  useEffect(() => { 
    const initApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        setCurrentUserEmail(session.user.email?.toLowerCase().trim() || null);
        await loadAppData();
      } else {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  // Enhanced Pull to Refresh Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartPos.current = e.touches[0].pageY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current || isRefreshing) return;
    
    const currentPos = e.touches[0].pageY;
    const distance = currentPos - touchStartPos.current;
    
    // Check boundaries
    const isAtTop = window.scrollY <= 0;
    const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5;

    if (isAtTop && distance > 0) {
      setPullDistance(Math.min(distance * 0.4, 100));
    } else if (isAtBottom && distance < 0) {
      setBottomPullDistance(Math.min(Math.abs(distance) * 0.4, 100));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 70 && !isRefreshing) {
      setIsRefreshing(true);
      loadAppData();
    } else if (bottomPullDistance > 70 && !isRefreshing) {
      setIsRefreshing(true);
      // Voltar para o topo instantaneamente ao puxar no final da página
      window.scrollTo({ top: 0, behavior: 'smooth' });
      loadAppData();
    } else {
      setPullDistance(0);
      setBottomPullDistance(0);
    }
    touchStartPos.current = 0;
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Lógica de despesas críticas para notificações mobile
  const criticalExpenses = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayStr = today.toISOString().split('T')[0];
    
    const limit = new Date(today);
    limit.setDate(limit.getDate() + 2);
    const limitStr = limit.toISOString().split('T')[0];

    return data.expenses.filter(e => 
      e.status !== ExpenseStatus.PAGO && 
      e.dueDate <= limitStr
    ).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [data.expenses]);

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
        setCurrentUserEmail(authData.user.email?.toLowerCase().trim() || null);
        await loadAppData();
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
      setCurrentUserEmail(null);
      setView('dashboard');
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(SYSTEM_EXPIRATION_PIX);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const wrap = (fn: any) => async (payload: any) => {
    const result = await fn(payload);
    if (result?.error) { alert("ERRO: " + result.error.message.toUpperCase()); return result; }
    loadAppData();
    return result;
  };

  // Handler customizado para entregas para lidar com a criação de vendas automáticas
  const handleUpdateDeliveryWithSync = async (delivery: Delivery) => {
    // Se a entrega foi marcada como paga (ENTREGUE) e ainda não tem uma venda associada
    if (delivery.status === DeliveryStatus.ENTREGUE && !delivery.saleId) {
      const newSaleId = crypto.randomUUID();
      const newSale: Sale = {
        id: newSaleId,
        value: delivery.totalValue || 0,
        date: new Date().toISOString().split('T')[0], // Data do dia do pagamento
        description: `ENTREGA CONCLUÍDA - PEDIDO #${delivery.sequenceNumber || ''}`.toUpperCase(),
        clientId: delivery.clientId
      };
      
      // Salva a venda primeiro
      const saleResult = await syncSale(newSale);
      if (saleResult.error) {
        alert("ERRO AO GERAR VENDA DA ENTREGA: " + saleResult.error.message.toUpperCase());
        return;
      }
      
      // Vincula o ID da venda à entrega
      delivery.saleId = newSaleId;
    }

    // Procede com a atualização da entrega
    const result = await syncDelivery(delivery);
    if (result.error) {
      alert("ERRO AO ATUALIZAR ENTREGA: " + result.error.message.toUpperCase());
    } else {
      loadAppData();
    }
  };

  const userName = useMemo(() => {
    if (!currentUserEmail) return 'CONECTADO';
    return currentUserEmail.split('@')[0].toUpperCase();
  }, [currentUserEmail]);

  const isAdmin = useMemo(() => {
    if (!currentUserEmail || !data.settings) return false;
    const adminFromSettings = (data.settings.adminEmail || 'root@adm.app').toLowerCase().trim();
    const currentEmail = currentUserEmail.toLowerCase().trim();
    return currentEmail === 'root@adm.app' || currentEmail === adminFromSettings;
  }, [currentUserEmail, data.settings.adminEmail]);

  const isSystemExpired = useMemo(() => {
    if (!data.settings?.expirationDate || data.settings.expirationDate === '2099-12-31') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(data.settings.expirationDate + 'T00:00:00');
    return today > expDate;
  }, [data.settings?.expirationDate]);

  const menuItems = useMemo(() => {
    const ALL_MODULES = [
      { id: 'dashboard', label: 'DASHBOARD', icon: LayoutGrid },
      { id: 'inventory', label: 'ESTOQUE', icon: Boxes },
      { id: 'sales', label: 'VENDAS', icon: CircleDollarSign },
      { id: 'clients', label: 'CLIENTES', icon: UserPlus },
      { id: 'deliveries', label: 'ENTREGAS', icon: PackageCheck },
      { id: 'expenses', label: 'DESPESAS', icon: Receipt },
      { id: 'production', label: 'PRODUÇÃO', icon: Snowflake },
      { id: 'team', label: 'EQUIPE', icon: Users },
      { id: 'fleet', label: 'FROTA', icon: Truck },
      { id: 'admin', label: 'ADMIN', icon: ShieldCheck },
    ];
    
    const order = data.settings?.menuOrder?.length > 0 
      ? data.settings.menuOrder 
      : ALL_MODULES.map(m => m.id);

    return order
      .map(id => ALL_MODULES.find(m => m.id === id))
      .filter((item): item is typeof ALL_MODULES[0] => {
        if (!item) return false;
        const hidden = data.settings?.hiddenViews || [];
        if (hidden.includes(item.id)) return false;
        if (item.id === 'admin' && !isAdmin) return false;
        return true;
      });
  }, [data.settings?.hiddenViews, data.settings?.menuOrder, isAdmin]);

  const mobileFixedItems = menuItems.slice(0, 4);
  const mobileExtraItems = menuItems.slice(4);

  const handleMobileNav = (viewId: string) => {
    setView(viewId as ViewType);
    setIsMobileMenuOpen(false);
    setIsNotificationsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-[#5ecce3] mb-4" size={48} />
      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">SINCRONIZANDO DADOS...</p>
    </div>
  );

  if (isAuthenticated && isSystemExpired && !isAdmin) return (
     <div className="min-h-screen glacial-bg flex flex-col items-center p-6 text-center font-['Plus_Jakarta_Sans'] overflow-y-auto pb-12">
      <div className="w-20 h-20 bg-rose-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-rose-200 mb-6 mt-8 animate-bounce shrink-0">
        <ShieldAlert size={36} />
      </div>
      <h1 className="text-2xl font-black text-rose-900 dark:text-rose-100 tracking-tighter uppercase mb-2">Acesso Suspenso</h1>
      <p className="text-xs font-bold text-rose-700/60 dark:text-rose-300/60 max-w-sm mb-8 uppercase tracking-widest leading-relaxed">
        O prazo de utilização expirou em <span className="text-rose-600 dark:text-rose-400 underline">{new Date(data.settings.expirationDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>. Realize o pagamento abaixo para reativar.
      </p>
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-xl border border-rose-100 dark:border-rose-900/30 mb-8 flex flex-col items-center">
        <div className="bg-sky-50 dark:bg-slate-800 p-4 rounded-3xl mb-6">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(SYSTEM_EXPIRATION_PIX)}`} 
            alt="PIX QR Code" 
            className="w-48 h-48 rounded-xl"
          />
        </div>
        <div className="w-full space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <QrCode size={18} className="text-[#5ecce3]" />
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Escaneie ou copie o código</span>
          </div>
          <button onClick={handleCopyPix} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all active:scale-95 group ${copiedPix ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
            <div className="flex flex-col items-start overflow-hidden mr-4">
              <span className={`text-[8px] font-black uppercase tracking-widest ${copiedPix ? 'text-emerald-500' : 'text-slate-400'}`}>{copiedPix ? 'Copiado!' : 'PIX Copia e Cola'}</span>
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 truncate w-full text-left">{SYSTEM_EXPIRATION_PIX}</span>
            </div>
            {copiedPix ? <Check size={20} className="text-emerald-500 shrink-0" /> : <Copy size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-sky-50 shrink-0" />}
          </button>
        </div>
      </div>
      <div className="space-y-4 w-full max-w-xs">
        <a href={`https://wa.me/${data.settings.supportPhone?.replace(/\D/g, '') || '5538998289668'}`} target="_blank" className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 hover:scale-105 transition-all"><MessageCircle size={18} /> Enviar Comprovante</a>
        <button onClick={handleLogout} className="w-full py-4 text-rose-400 font-black text-[10px] uppercase tracking-widest hover:text-rose-600 transition-colors">Sair do Sistema</button>
      </div>
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen glacial-bg flex flex-col items-center justify-center p-4 sm:p-6 font-['Plus_Jakarta_Sans'] relative overflow-hidden">
      <button onClick={toggleDarkMode} className="absolute top-6 right-6 w-12 h-12 glass-panel rounded-2xl flex items-center justify-center text-slate-400 hover:text-sky-500 transition-all z-[100]">
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#5ecce3]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 glass-panel rounded-[2rem] flex items-center justify-center text-[#5ecce3] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
            <Snowflake size={48} strokeWidth={1.5} className="relative z-10 animate-spin-slow group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div className="text-center mt-6">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-tight">GELO <span className="text-[#5ecce3]">BRASIL</span></h1>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1 opacity-70">SISTEMA DE GESTÃO INTELIGENTE</p>
          </div>
        </div>
        <div className="glass-panel p-8 sm:p-12 rounded-[2.5rem] border border-white/60 dark:border-white/5 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-10">
             <div className="w-12 h-12 bg-slate-900 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg"><ShieldCheck size={24} /></div>
             <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none uppercase tracking-tight">Bem-vindo</h2>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Acesso Corporativo</p>
             </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">E-mail Corporativo</label>
              <div className="relative group">
                <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-[#5ecce3] transition-colors" />
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="seu@email.com" className="w-full h-14 pl-14 pr-6 bg-white/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-600 dark:text-slate-200 outline-none focus:ring-4 focus:ring-[#5ecce3]/10 focus:border-[#5ecce3]/30 focus:bg-white dark:focus:bg-slate-900 transition-all" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Chave de Acesso</label>
              <div className="relative group">
                <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-[#5ecce3] transition-colors" />
                <input type={showPassword ? "text" : "password"} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" className="w-full h-14 pl-14 pr-14 bg-white/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-600 dark:text-slate-200 outline-none focus:ring-4 focus:ring-[#5ecce3]/10 focus:border-[#5ecce3]/30 focus:bg-white dark:focus:bg-slate-900 transition-all" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#5ecce3] transition-colors">{showPassword ? <EyeOff size={22} /> : <Eye size={22} />}</button>
              </div>
            </div>
            {loginError && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 animate-in shake duration-300">
                <AlertCircle className="text-rose-500" size={20} />
                <p className="text-[11px] font-black text-rose-600 uppercase tracking-tight leading-snug">{loginError}</p>
              </div>
            )}
            <button type="submit" disabled={isLoggingIn} className="w-full h-16 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:bg-slate-800 dark:hover:bg-white active:scale-[0.98] transition-all disabled:opacity-50">
              {isLoggingIn ? <Loader2 className="animate-spin" size={22} /> : <><LogIn size={20} strokeWidth={2.5} />Entrar no Sistema</>}
            </button>
          </form>
          <div className="mt-2 pt-4 border-t border-slate-100/50 dark:border-white/5 flex flex-col items-center">
             <a href={`https://wa.me/${data.settings.supportPhone?.replace(/\D/g, '') || '5538998289668'}`} target="_blank" className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-[#5ecce3] transition-all group">
               <Phone size={16} className="group-hover:animate-bounce" /><span className="text-[10px] font-black uppercase tracking-widest">Suporte Técnico</span>
             </a>
             <div className="mt-3 flex flex-col items-center">
                <p className="text-[7px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Desenvolvido por</p>
                <p className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mt-0.5">Maycon Rubem</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className={`min-h-screen flex flex-col lg:flex-row bg-[#f0f9ff] dark:bg-slate-950 uppercase transition-colors duration-500 pb-28 lg:pb-0 relative`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* Pull to Refresh Indicators (Top & Bottom) */}
      {(pullDistance > 0 || (isRefreshing && pullDistance > 0)) && (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-[200] flex justify-center pointer-events-none transition-all" style={{ transform: `translateY(${pullDistance}px)`, opacity: Math.min(pullDistance / 60, 1) }}>
          <div className="mt-4 w-12 h-12 rounded-full glass-panel dark:bg-slate-900 border border-white/20 dark:border-slate-800 shadow-2xl flex items-center justify-center text-sky-500">
            <RefreshCw size={24} className={`${isRefreshing ? 'animate-spin' : ''}`} style={{ transform: !isRefreshing ? `rotate(${pullDistance * 4}deg)` : undefined }} />
          </div>
        </div>
      )}

      {(bottomPullDistance > 0 || (isRefreshing && bottomPullDistance > 0)) && (
        <div className="lg:hidden fixed bottom-24 left-0 right-0 z-[200] flex justify-center pointer-events-none transition-all" style={{ transform: `translateY(-${bottomPullDistance}px)`, opacity: Math.min(bottomPullDistance / 60, 1) }}>
          <div className="w-12 h-12 rounded-full glass-panel dark:bg-slate-900 border border-white/20 dark:border-slate-800 shadow-2xl flex items-center justify-center text-sky-500">
            <RefreshCw size={24} className={`${isRefreshing ? 'animate-spin' : ''}`} style={{ transform: !isRefreshing ? `rotate(${bottomPullDistance * 4}deg)` : undefined }} />
          </div>
        </div>
      )}

      {isSystemExpired && isAdmin && (
        <div className="fixed top-0 left-0 right-0 bg-rose-600 text-white p-3 z-[100] text-center flex items-center justify-center gap-4 shadow-xl no-print animate-in slide-in-from-top duration-500">
           <ShieldAlert size={18} className="animate-pulse" />
           <p className="text-[9px] font-black uppercase tracking-[0.2em]">SISTEMA EXPIRADO! RENOVE O ACESSO NA ABA "ADMIN" IMEDIATAMENTE.</p>
           <button onClick={() => setView('admin')} className="bg-white text-rose-600 px-4 py-1.5 rounded-lg text-[8px] font-black uppercase shadow-sm">Renovar</button>
        </div>
      )}

      <aside className={`hidden lg:flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-sky-100 dark:border-slate-800 py-10 px-4 sticky top-0 h-screen z-50 transition-colors ${isSystemExpired && isAdmin ? 'pt-24' : ''}`}>
        <div className="flex items-center gap-3 px-4 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-[#5ecce3] flex items-center justify-center text-white shadow-lg shadow-[#5ecce3]/20"><Snowflake size={20} /></div>
          <h1 className="text-sm font-black uppercase tracking-tighter text-slate-800 dark:text-white truncate">{data.settings.companyName}</h1>
        </div>

        <div className="px-4 mb-8">
          <button onClick={toggleDarkMode} className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-sky-500 transition-all">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-[9px] font-black tracking-widest">{isDarkMode ? 'MODO CLARO' : 'MODO ESCURO'}</span>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar pr-1 custom-scrollbar">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id as ViewType)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${view === item.id ? 'bg-[#5ecce3] text-white shadow-xl shadow-[#5ecce3]/20' : 'text-slate-400 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600'}`}><item.icon size={18} /> {item.label}</button>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-slate-50 dark:border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 transition-all"><LogOut size={18} /> Sair</button>
        </div>
      </aside>

      <div className={`lg:hidden flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-sky-50 dark:border-slate-800 sticky top-0 z-[60] transition-colors ${isSystemExpired && isAdmin ? 'mt-12' : ''}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white shadow-lg shrink-0"><Snowflake size={18} /></div>
          <h1 className="text-[11px] font-black uppercase tracking-tighter text-slate-800 dark:text-white truncate leading-none">{data.settings.companyName}</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Botão de Notificação Mobile */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
              className={`p-2 rounded-xl transition-all ${isNotificationsOpen ? 'text-sky-500 bg-sky-50 dark:bg-sky-900/30' : 'text-slate-400 dark:text-slate-500 hover:text-sky-500'}`}
            >
              <Bell size={20} className={criticalExpenses.length > 0 ? 'animate-bounce' : ''} />
              {criticalExpenses.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border border-white dark:border-slate-900 shadow-sm animate-pulse">
                  {criticalExpenses.length}
                </span>
              )}
            </button>
          </div>

          <button onClick={toggleDarkMode} className="p-2 text-slate-400 dark:text-slate-500">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <span className="text-[8px] font-black text-sky-500 px-3 py-1.5 bg-sky-50 dark:bg-sky-950/30 rounded-full border border-sky-100 dark:border-sky-900/30 uppercase tracking-widest">{userName}</span>
        </div>
      </div>

      {/* Painel de Notificações Mobile (Dropdown/Modal) */}
      {isNotificationsOpen && (
        <div className="lg:hidden fixed inset-0 z-[120] animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsNotificationsOpen(false)} />
          <div className="absolute top-20 right-4 left-4 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-4 duration-500 max-h-[60vh] flex flex-col">
             <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-sky-500" />
                  <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Centro de Alertas</span>
                </div>
                <button onClick={() => setIsNotificationsOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-full text-slate-300"><X size={16} /></button>
             </div>
             
             <div className="overflow-y-auto space-y-3 no-scrollbar flex-1">
                {criticalExpenses.length === 0 ? (
                  <div className="py-12 text-center opacity-40">
                     <Check size={40} className="mx-auto text-emerald-500 mb-2" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Nenhum alerta pendente</p>
                  </div>
                ) : (
                  criticalExpenses.map((exp) => {
                    const today = new Date().toISOString().split('T')[0];
                    const isOverdue = exp.dueDate < today;
                    return (
                      <div 
                        key={exp.id} 
                        onClick={() => { setView('expenses'); setIsNotificationsOpen(false); }}
                        className={`p-4 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.98] ${isOverdue ? 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/40' : 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/40'}`}
                      >
                         <div className="flex items-start gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOverdue ? 'bg-rose-500 text-white shadow-lg' : 'bg-amber-500 text-white'}`}>
                               {isOverdue ? <AlertCircle size={20} /> : <Clock size={20} />}
                            </div>
                            <div className="min-w-0">
                               <p className="text-[10px] font-black text-slate-800 dark:text-slate-100 uppercase truncate leading-tight">{exp.description}</p>
                               <div className="flex items-center gap-1.5 mt-1">
                                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${isOverdue ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/40'}`}>
                                    {isOverdue ? 'VENCIDA' : 'VENCE EM BREVE'}
                                  </span>
                                  <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500">{new Date(exp.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                               </div>
                            </div>
                         </div>
                         <div className="text-right ml-4">
                            <p className={`text-xs font-black tracking-tight ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                               R$ {exp.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                         </div>
                      </div>
                    );
                  })
                )}
             </div>
             
             {criticalExpenses.length > 0 && (
               <button 
                onClick={() => handleMobileNav('expenses')}
                className="mt-6 w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl"
               >
                 Ver todas as despesas <ChevronRight size={14} />
               </button>
             )}
          </div>
        </div>
      )}

      <main className={`flex-1 max-w-7xl mx-auto w-full relative pt-2 lg:pt-0 ${isSystemExpired && isAdmin && view !== 'admin' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
        {view === 'dashboard' && <DashboardView sales={data.sales} expenses={data.expenses} production={data.production} deliveries={data.deliveries} clients={data.clients} onSwitchView={setView} settings={data.settings} onAddSale={wrap(syncSale)} />}
        {view === 'inventory' && <InventoryView products={data.products} movements={data.stockMovements} onUpdateProduct={wrap(syncProduct)} onDeleteProduct={wrap(deleteProduct)} onAddMovement={wrap(syncStockMovement)} />}
        {view === 'sales' && <SalesView sales={data.sales} onUpdate={wrap(syncSale)} onDelete={wrap(deleteSale)} settings={data.settings} monthlyGoals={data.monthlyGoals} onUpdateMonthlyGoal={wrap(syncMonthlyGoal)} clients={data.clients} />}
        {view === 'clients' && <ClientsView clients={data.clients} onUpdate={wrap(syncClient)} onDelete={wrap(deleteClient)} />}
        {view === 'deliveries' && <DeliveriesView deliveries={data.deliveries} clients={data.clients} drivers={data.employees} vehicles={data.vehicles} products={data.products} onUpdate={handleUpdateDeliveryWithSync} onDelete={wrap(deleteDelivery)} onAddClient={wrap(syncClient)} settings={data.settings} />}
        {view === 'production' && <ProductionView settings={data.settings} production={data.production} onUpdate={wrap(syncProduction)} onDelete={wrap(deleteProduction)} products={data.products} />}
        {view === 'expenses' && <ExpensesView expenses={data.expenses} categories={data.categories} vehicles={data.vehicles} employees={data.employees} onUpdate={wrap(syncExpense)} onDelete={wrap(deleteExpense)} onUpdateCategories={wrap(syncCategory)} onDeleteCategory={wrap(deleteCategory)} onReorderCategories={wrap(syncCategoriesOrder)} sales={data.sales} />}
        {view === 'team' && <TeamView employees={data.employees} onUpdate={wrap(syncEmployee)} onDelete={wrap(deleteEmployee)} onAddExpense={wrap(syncExpense)} companyName={data.settings.companyName} />}
        {view === 'fleet' && <FleetView vehicles={data.vehicles} employees={data.employees} fuelLogs={data.fuelLogs} maintenanceLogs={data.maintenanceLogs} fineLogs={data.fineLogs} onUpdateVehicle={wrap(syncVehicle)} onDeleteVehicle={wrap(deleteVehicle)} onUpdateFuel={wrap(syncFuel)} onDeleteFuel={wrap(deleteFuel)} onUpdateMaintenance={wrap(syncMaintenance)} onDeleteMaintenance={wrap(deleteMaintenance)} onUpdateFine={wrap(syncFine)} onDeleteFine={wrap(deleteFine)} />}
        {view === 'admin' && isAdmin && <AdminView settings={data.settings} onUpdateSettings={wrap(syncSettings)} users={[]} />}
        {view === 'admin' && !isAdmin && <div className="p-10 text-center font-black text-slate-400 uppercase tracking-widest">Acesso Restrito</div>}
      </main>

      <div className="lg:hidden fixed bottom-6 left-3 right-3 z-[80] no-print">
        <nav className="glass-nav dark:bg-slate-900/95 flex items-center justify-between px-2 py-3 rounded-[2.2rem] shadow-2xl border border-white/40 dark:border-white/5">
          {mobileFixedItems.map(item => (
            <button key={item.id} onClick={() => handleMobileNav(item.id)} className={`flex-1 flex flex-col items-center gap-1 transition-all duration-300 min-w-0 ${view === item.id && !isMobileMenuOpen ? 'text-sky-500 scale-105' : 'text-slate-400 active:scale-90'}`}>
              <item.icon size={18} strokeWidth={view === item.id && !isMobileMenuOpen ? 3 : 2} className="shrink-0" />
              <span className="text-[7px] font-black uppercase tracking-tight truncate w-full text-center px-0.5">{item.label}</span>
            </button>
          ))}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`flex-1 flex flex-col items-center gap-1 transition-all duration-300 min-w-0 ${isMobileMenuOpen ? 'text-sky-500 scale-105' : 'text-slate-400 active:scale-90'}`}>
            <div className={`transition-transform duration-500 shrink-0 ${isMobileMenuOpen ? 'rotate-90' : ''}`}>{isMobileMenuOpen ? <X size={18} strokeWidth={3} /> : <MoreHorizontal size={18} strokeWidth={2} />}</div>
            <span className="text-[7px] font-black uppercase tracking-tight truncate w-full text-center px-0.5">{isMobileMenuOpen ? 'FECHAR' : 'MAIS'}</span>
          </button>
        </nav>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-950 mobile-bottom-sheet p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[85vh] overflow-y-auto rounded-t-[3rem]">
             <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-8"></div>
             <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50 dark:border-white/5">
                <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Menu Expandido</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="w-9 h-9 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-full text-slate-300"><X size={18} /></button>
             </div>
             <div className="grid grid-cols-1 gap-3">
                {mobileExtraItems.map(item => (
                  <button key={item.id} onClick={() => handleMobileNav(item.id)} className={`flex items-center justify-between w-full p-5 rounded-2xl transition-all duration-300 ${view === item.id ? 'bg-sky-500 text-white shadow-xl shadow-sky-100' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 active:bg-sky-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${view === item.id ? 'bg-white/20' : 'bg-white dark:bg-slate-800 text-sky-500'}`}><item.icon size={22} /></div>
                      <span className="text-sm font-black uppercase tracking-tight">{item.label}</span>
                    </div>
                    <ChevronRight size={18} className={view === item.id ? 'opacity-50' : 'text-slate-300 dark:text-slate-700'} />
                  </button>
                ))}
                <button onClick={handleLogout} className="flex items-center justify-between w-full p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 transition-all mt-4 border border-rose-100/50 dark:border-rose-900/30 shadow-sm active:scale-95">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-rose-500"><LogOut size={22} /></div>
                    <span className="text-sm font-black uppercase tracking-tight">Sair</span>
                  </div>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
