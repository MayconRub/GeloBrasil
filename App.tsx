
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  CircleDollarSign, Receipt, Users, Truck, Loader2, Snowflake, 
  X, LogOut, MoreHorizontal, ChevronRight, Mail, Lock, LogIn, Phone, 
  ShieldCheck, UserPlus, PackageCheck, Moon, Sun, LayoutGrid, ShieldAlert,
  QrCode, Copy, Check, MessageCircle, EyeOff, Eye, Activity, RefreshCw,
  Bell, AlertCircle, HandCoins
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { fetchAllData, syncSale, syncExpense, updateExpenseStatus, syncEmployee, syncVehicle, syncCategory, syncSettings, AppData, syncProduction, syncMonthlyGoal, syncCategoriesOrder, syncFuel, syncMaintenance, syncFine, deleteSale, deleteExpense, deleteProduction, deleteEmployee, deleteVehicle, deleteCategory, deleteFuel, deleteMaintenance, deleteFine, syncClient, deleteClient, syncDelivery, deleteDelivery, syncProductBase, deleteProductBase } from './store';
import { ViewType, Sale, Expense, Employee, Vehicle, Production, MonthlyGoal, FuelLog, MaintenanceLog, FineLog, Client, Delivery, ExpenseStatus, DeliveryStatus, Product } from './types';
import DashboardView from './components/DashboardView';
import SalesView from './components/SalesView';
import ProductionView from './components/ProductionView';
import ExpensesView from './components/ExpensesView';
import TeamView from './components/TeamView';
import FleetView from './components/FleetView';
import AdminView from './components/AdminView';
import ClientsView from './components/ClientsView';
import DeliveriesView from './components/DeliveriesView';
import BillingView from './components/BillingView';

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
  
  const [pullDistance, setPullDistance] = useState(0);
  const [bottomPullDistance, setBottomPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartPos = useRef(0);

  const [data, setData] = useState<AppData>({
    sales: [], expenses: [], employees: [], vehicles: [], fuelLogs: [], maintenanceLogs: [], fineLogs: [], production: [], monthlyGoals: [], categories: [], users: [], clients: [], deliveries: [], products: [],
    settings: { companyName: 'GELO BRASIL LTDA', cnpj: '42.996.710/0001-63', pixKey: '', primaryColor: '#5ecce3', logoId: 'Snowflake', loginHeader: 'ADMIN', supportPhone: '', footerText: '', expirationDate: '2099-12-31', hiddenViews: [], menuOrder: [], adminEmail: 'root@adm.app' }
  });

  const SYSTEM_EXPIRATION_PIX = "00020126590014BR.GOV.BCB.PIX0111135244986200222Mensalidade do Sistema5204000053039865406100.005802BR5925MAYCON RUBEM DOS SANTOS P6013MONTES CLAROS622605226rZoYS25kQugjDLBWRKJVs63045E25";

  const getLocalISODate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

  const handleTouchStart = (e: React.TouchEvent) => { touchStartPos.current = e.touches[0].pageY; };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current || isRefreshing) return;
    const currentPos = e.touches[0].pageY;
    const distance = currentPos - touchStartPos.current;
    const isAtTop = window.scrollY <= 0;
    const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5;
    if (isAtTop && distance > 0) setPullDistance(Math.min(distance * 0.4, 100));
    else if (isAtBottom && distance < 0) setBottomPullDistance(Math.min(Math.abs(distance) * 0.4, 100));
  };

  const handleTouchEnd = () => {
    if (pullDistance > 70 && !isRefreshing) { setIsRefreshing(true); loadAppData(); }
    else if (bottomPullDistance > 70 && !isRefreshing) { setIsRefreshing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); loadAppData(); }
    else { setPullDistance(0); setBottomPullDistance(0); }
    touchStartPos.current = 0;
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) { setLoginError(error.message.toUpperCase() === 'INVALID LOGIN CREDENTIALS' ? 'USUÁRIO OU SENHA INCORRETOS.' : error.message.toUpperCase()); }
      else if (authData.user) { setIsAuthenticated(true); setCurrentUserEmail(authData.user.email?.toLowerCase().trim() || null); await loadAppData(); }
    } catch (err) { setLoginError('ERRO AO CONECTAR COM O SERVIDOR.'); }
    finally { setIsLoggingIn(false); }
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

  const wrap = (fn: any) => async (payload: any, ...args: any[]) => {
    const result = await fn(payload, ...args);
    if (result?.error) { alert("ERRO: " + result.error.message.toUpperCase()); return result; }
    loadAppData();
    return result;
  };

  const handleUpdateDeliveryWithSync = async (delivery: Delivery) => {
    const deliveryToSave = { ...delivery };
    if (deliveryToSave.status === DeliveryStatus.ENTREGUE && !deliveryToSave.saleId) {
      const newSaleId = crypto.randomUUID();
      const newSale: Sale = { 
        id: newSaleId, 
        value: deliveryToSave.totalValue || 0, 
        date: getLocalISODate(), 
        description: `ENTREGA CONCLUÍDA - PEDIDO #${deliveryToSave.sequenceNumber || ''}`.toUpperCase(), 
        clientId: deliveryToSave.clientId 
      };
      const saleResult = await syncSale(newSale);
      if (saleResult.error) { alert("ERRO AO GERAR VENDA DA ENTREGA: " + saleResult.error.message.toUpperCase()); return; }
      deliveryToSave.saleId = newSaleId;
    }
    if (deliveryToSave.status === DeliveryStatus.CANCELADO && deliveryToSave.saleId) {
      await deleteSale(deliveryToSave.saleId);
      deliveryToSave.saleId = undefined;
    }
    const result = await syncDelivery(deliveryToSave);
    if (result.error) alert("ERRO AO ATUALIZAR ENTREGA: " + result.error.message.toUpperCase());
    else loadAppData();
  };

  const handleBillingPayment = async (delivery: Delivery) => {
    const deliveryToSave = { ...delivery, status: DeliveryStatus.ENTREGUE, deliveredAt: new Date().toISOString() };
    const newSaleId = crypto.randomUUID();
    const newSale: Sale = { 
      id: newSaleId, 
      value: deliveryToSave.totalValue || 0, 
      date: getLocalISODate(), 
      description: `COBRANÇA ENTREGA #${deliveryToSave.sequenceNumber || ''}`.toUpperCase(), 
      clientId: deliveryToSave.clientId 
    };
    const saleResult = await syncSale(newSale);
    if (saleResult.error) { alert("ERRO AO LANÇAR VENDA DE COBRANÇA: " + saleResult.error.message.toUpperCase()); return; }
    deliveryToSave.saleId = newSaleId;
    const deliveryResult = await syncDelivery(deliveryToSave);
    if (deliveryResult.error) { alert("ERRO AO ATUALIZAR ENTREGA: " + deliveryResult.error.message.toUpperCase()); } 
    else { loadAppData(); }
  };

  const userName = useMemo(() => currentUserEmail ? currentUserEmail.split('@')[0].toUpperCase() : 'CONECTADO', [currentUserEmail]);

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
      { id: 'sales', label: 'VENDAS', icon: CircleDollarSign },
      { id: 'clients', label: 'CLIENTES', icon: UserPlus },
      { id: 'deliveries', label: 'ENTREGAS', icon: PackageCheck },
      { id: 'billing', label: 'COBRANÇA', icon: HandCoins },
      { id: 'expenses', label: 'DESPESAS', icon: Receipt },
      { id: 'production', label: 'PRODUÇÃO', icon: Snowflake },
      { id: 'team', label: 'EQUIPE', icon: Users },
      { id: 'fleet', label: 'FROTA', icon: Truck },
      { id: 'admin', label: 'ADMIN', icon: ShieldCheck },
    ];
    let order = data.settings?.menuOrder?.length > 0 ? [...data.settings.menuOrder] : ALL_MODULES.map(m => m.id);
    const missingIds = ALL_MODULES.map(m => m.id).filter(id => !order.includes(id));
    if (missingIds.length > 0) {
      const adminIdx = order.indexOf('admin');
      if (adminIdx !== -1) order.splice(adminIdx, 0, ...missingIds);
      else order.push(...missingIds);
    }
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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="animate-spin text-[#5ecce3] mb-4" size={40} />
      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">SINCRONIZANDO DADOS...</p>
    </div>
  );

  if (isAuthenticated && isSystemExpired && !isAdmin) return (
     <div className="min-h-screen glacial-bg flex flex-col items-center p-6 text-center overflow-y-auto pb-12 overflow-x-hidden">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-500 text-white rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center shadow-2xl mb-6 mt-8 animate-bounce shrink-0"><ShieldAlert size={32} /></div>
      <h1 className="text-xl sm:text-2xl font-black text-rose-900 dark:text-rose-100 uppercase mb-2 leading-tight">Acesso Suspenso</h1>
      <p className="text-[9px] font-bold text-rose-700/60 dark:text-rose-300/60 max-w-sm mb-8 uppercase tracking-widest leading-relaxed">Expirou em: <span className="text-rose-600 dark:text-rose-400 underline">{new Date(data.settings.expirationDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>.</p>
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-rose-100 dark:border-rose-900/30 mb-8 flex flex-col items-center">
        <div className="bg-sky-50 dark:bg-slate-800 p-3 sm:p-4 rounded-2xl mb-6">
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(SYSTEM_EXPIRATION_PIX)}`} alt="PIX" className="w-40 h-40 sm:w-48 sm:h-48 rounded-xl" />
        </div>
        <div className="w-full space-y-4">
          <button onClick={handleCopyPix} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all active:scale-95 ${copiedPix ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex flex-col items-start overflow-hidden mr-4"><span className={`text-[7px] font-black uppercase tracking-widest ${copiedPix ? 'text-emerald-500' : 'text-slate-400'}`}>{copiedPix ? 'Copiado!' : 'PIX Copia e Cola'}</span><span className="text-[9px] font-black text-slate-700 dark:text-slate-200 truncate w-full text-left">{SYSTEM_EXPIRATION_PIX}</span></div>
            {copiedPix ? <Check size={18} className="text-emerald-500 shrink-0" /> : <Copy size={18} className="text-slate-300 shrink-0" />}
          </button>
        </div>
      </div>
      <div className="space-y-3 w-full max-w-xs"><a href={`https://wa.me/${data.settings.supportPhone?.replace(/\D/g, '') || '5538998289668'}`} target="_blank" className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg"><MessageCircle size={18} /> Comprovante</a><button onClick={handleLogout} className="w-full py-4 text-rose-400 font-black text-[8px] uppercase tracking-widest">Sair do Sistema</button></div>
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen glacial-bg flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <button onClick={toggleDarkMode} className="absolute top-6 right-6 w-10 h-10 sm:w-12 sm:h-12 glass-panel rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-400 hover:text-sky-500 transition-all z-[100]">{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center mb-8"><div className="w-16 h-16 sm:w-24 sm:h-24 glass-panel rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-[#5ecce3] shadow-2xl relative overflow-hidden group"><Snowflake size={36} className="relative z-10 animate-spin-slow" /></div><div className="text-center mt-5"><h1 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-tight">GELO <span className="text-[#5ecce3]">BRASIL</span></h1><p className="text-[7px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 opacity-70">GESTÃO INTELIGENTE</p></div></div>
        <div className="glass-panel p-6 sm:p-12 rounded-[2rem] sm:rounded-[2.5rem] border border-white/60 dark:border-white/5 relative overflow-hidden"><div className="flex items-center gap-3 mb-8"><div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 rounded-xl flex items-center justify-center text-white shrink-0"><ShieldCheck size={20} /></div><div><h2 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-none uppercase tracking-tight">Bem-vindo</h2><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Acesso Corporativo</p></div></div><form onSubmit={handleLogin} className="space-y-5"><div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 uppercase ml-1">E-mail</label><div className="relative group"><Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" /><input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="seu@email.com" className="w-full h-12 pl-12 pr-4 bg-white/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs outline-none focus:bg-white transition-all" required /></div></div><div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 uppercase ml-1">Chave</label><div className="relative group"><Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" /><input type={showPassword ? "text" : "password"} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" className="w-full h-12 pl-12 pr-12 bg-white/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs outline-none focus:bg-white transition-all" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>{loginError && (<div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-2"><AlertCircle className="text-rose-500 shrink-0" size={16} /><p className="text-[9px] font-black text-rose-600 uppercase leading-snug">{loginError}</p></div>)}<button type="submit" disabled={isLoggingIn} className="w-full h-14 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all disabled:opacity-50">{isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : 'Entrar no Sistema'}</button></form></div></div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f0f9ff] dark:bg-slate-950 transition-colors duration-500 pb-20 lg:pb-0 relative overflow-x-hidden" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {(pullDistance > 0 || (isRefreshing && pullDistance > 0)) && (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-[200] flex justify-center pointer-events-none transition-all" style={{ transform: `translateY(${pullDistance}px)`, opacity: Math.min(pullDistance / 60, 1) }}>
          <div className="mt-4 w-10 h-10 rounded-full glass-panel dark:bg-slate-900 border border-white/20 dark:border-slate-800 shadow-2xl flex items-center justify-center text-sky-500">
            <RefreshCw size={20} className={`${isRefreshing ? 'animate-spin' : ''}`} style={{ transform: !isRefreshing ? `rotate(${pullDistance * 4}deg)` : undefined }} />
          </div>
        </div>
      )}
      
      {isSystemExpired && isAdmin && (
        <div className="fixed top-0 left-0 right-0 bg-rose-600 text-white p-2 z-[100] text-center flex items-center justify-center gap-3 shadow-xl no-print">
          <ShieldAlert size={14} className="animate-pulse" />
          <p className="text-[8px] font-black uppercase tracking-[0.1em]">SISTEMA EXPIRADO!</p>
          <button onClick={() => setView('admin')} className="bg-white text-rose-600 px-3 py-1 rounded-md text-[7px] font-black uppercase">Renovar</button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-sky-100 dark:border-slate-800 py-10 px-4 sticky top-0 h-screen z-50 transition-colors ${isSystemExpired && isAdmin ? 'pt-24' : ''}`}>
        <div className="flex items-center gap-3 px-4 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-[#5ecce3] flex items-center justify-center text-white shadow-lg"><Snowflake size={20} /></div>
          <h1 className="text-sm font-black uppercase tracking-tighter text-slate-800 dark:text-white truncate">{data.settings.companyName}</h1>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar pr-1">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id as ViewType)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${view === item.id ? 'bg-[#5ecce3] text-white shadow-xl' : 'text-slate-400 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600'}`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-slate-50 dark:border-white/5">
           <button onClick={toggleDarkMode} className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-sky-500 transition-all mb-4">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-[9px] font-black tracking-widest">{isDarkMode ? 'MODO CLARO' : 'MODO ESCURO'}</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 transition-all"><LogOut size={18} /> Sair</button>
        </div>
      </aside>

      {/* Mobile Top Header - Fixed Padding */}
      <div className={`lg:hidden flex items-center justify-between px-5 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-sky-50 dark:border-slate-800 sticky top-0 z-[60] transition-colors ${isSystemExpired && isAdmin ? 'mt-10' : ''}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white shadow-lg shrink-0"><Snowflake size={16} /></div>
          <h1 className="text-[10px] font-black uppercase tracking-tighter text-slate-800 dark:text-white truncate leading-none">{data.settings.companyName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleDarkMode} className="p-2 text-slate-400"><Moon size={18} /></button>
          <span className="text-[7px] font-black text-sky-500 px-2.5 py-1.5 bg-sky-50 dark:bg-sky-950/30 rounded-full border border-sky-100 uppercase tracking-widest">{userName}</span>
        </div>
      </div>

      {/* Main Content Area - Responsive Max Width */}
      <main className={`flex-1 w-full relative pt-2 lg:pt-0 ${isSystemExpired && isAdmin && view !== 'admin' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
        <div className="w-full max-w-[100vw] overflow-x-hidden">
          {view === 'dashboard' && <DashboardView sales={data.sales} expenses={data.expenses} production={data.production} deliveries={data.deliveries} clients={data.clients} onSwitchView={setView} settings={data.settings} onAddSale={wrap(syncSale)} vehicles={data.vehicles} />}
          {view === 'sales' && <SalesView sales={data.sales} onUpdate={wrap(syncSale)} onDelete={wrap(deleteSale)} settings={data.settings} monthlyGoals={data.monthlyGoals} onUpdateMonthlyGoal={wrap(syncMonthlyGoal)} clients={data.clients} products={data.products} deliveries={data.deliveries} employees={data.employees} />}
          {view === 'clients' && <ClientsView clients={data.clients} products={data.products} onUpdate={wrap(syncClient)} onDelete={wrap(deleteClient)} />}
          {view === 'deliveries' && <DeliveriesView deliveries={data.deliveries} clients={data.clients} drivers={data.employees} vehicles={data.vehicles} products={data.products} onUpdate={handleUpdateDeliveryWithSync} onDelete={wrap(deleteDelivery)} onAddClient={wrap(syncClient)} settings={data.settings} />}
          {view === 'billing' && <BillingView deliveries={data.deliveries} clients={data.clients} onMarkAsPaid={handleBillingPayment} />}
          {view === 'production' && <ProductionView settings={data.settings} production={data.production} onUpdate={wrap(syncProduction)} onDelete={wrap(deleteProduction)} products={data.products} />}
          {view === 'expenses' && <ExpensesView expenses={data.expenses} categories={data.categories} vehicles={data.vehicles} employees={data.employees} onUpdate={wrap(syncExpense)} onUpdateStatus={wrap(updateExpenseStatus)} onDelete={wrap(deleteExpense)} onUpdateCategories={wrap(syncCategory)} onDeleteCategory={wrap(deleteCategory)} onReorderCategories={wrap(syncCategoriesOrder)} sales={data.sales} />}
          {view === 'team' && <TeamView employees={data.employees} onUpdate={wrap(syncEmployee)} onDelete={wrap(deleteEmployee)} onAddExpense={wrap(syncExpense)} companyName={data.settings.companyName} />}
          {view === 'fleet' && <FleetView vehicles={data.vehicles} employees={data.employees} fuelLogs={data.fuelLogs} maintenanceLogs={data.maintenanceLogs} fineLogs={data.fineLogs} onUpdateVehicle={wrap(syncVehicle)} onDeleteVehicle={wrap(deleteVehicle)} onUpdateFuel={wrap(syncFuel)} onDeleteFuel={wrap(deleteFuel)} onUpdateMaintenance={wrap(syncMaintenance)} onDeleteMaintenance={wrap(deleteMaintenance)} onUpdateFine={wrap(syncFine)} onDeleteFine={wrap(deleteFine)} />}
          {view === 'admin' && isAdmin && <AdminView settings={data.settings} onUpdateSettings={wrap(syncSettings)} users={[]} products={data.products} onUpdateProduct={wrap(syncProductBase)} onDeleteProduct={wrap(deleteProductBase)} />}
        </div>
      </main>

      {/* Mobile Navigation Bar - Compact Width */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-[80] no-print">
        <nav className="glass-nav dark:bg-slate-900/95 flex items-center justify-between px-2 py-2.5 rounded-[1.8rem] shadow-2xl border border-white/40 dark:border-white/5">
          {mobileFixedItems.map(item => (
            <button key={item.id} onClick={() => handleMobileNav(item.id)} className={`flex-1 flex flex-col items-center gap-1 transition-all min-w-0 ${view === item.id && !isMobileMenuOpen ? 'text-sky-500 scale-105' : 'text-slate-400 active:scale-90'}`}>
              <item.icon size={18} strokeWidth={view === item.id && !isMobileMenuOpen ? 3 : 2} className="shrink-0" />
              <span className="text-[7px] font-black uppercase tracking-tight truncate w-full text-center">{item.label}</span>
            </button>
          ))}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`flex-1 flex flex-col items-center gap-1 transition-all min-w-0 ${isMobileMenuOpen ? 'text-sky-500 scale-105' : 'text-slate-400 active:scale-90'}`}>
            <div className={`transition-transform duration-500 ${isMobileMenuOpen ? 'rotate-90' : ''}`}>{isMobileMenuOpen ? <X size={18} strokeWidth={3} /> : <MoreHorizontal size={18} strokeWidth={2} />}</div>
            <span className="text-[7px] font-black uppercase tracking-tight truncate w-full text-center">{isMobileMenuOpen ? 'FECHAR' : 'MAIS'}</span>
          </button>
        </nav>
      </div>

      {/* Mobile Expandable Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-950 p-6 shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[80vh] overflow-y-auto rounded-t-[2.5rem]">
            <div className="w-10 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-6"></div>
            <div className="grid grid-cols-1 gap-2.5">
              {mobileExtraItems.map(item => (
                <button key={item.id} onClick={() => handleMobileNav(item.id)} className={`flex items-center justify-between w-full p-4 rounded-xl transition-all ${view === item.id ? 'bg-sky-500 text-white shadow-xl' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 active:bg-sky-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-sm ${view === item.id ? 'bg-white/20' : 'bg-white dark:bg-slate-800 text-sky-500'}`}><item.icon size={20} /></div>
                    <span className="text-xs font-black uppercase tracking-tight">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className={view === item.id ? 'opacity-50' : 'text-slate-300'} />
                </button>
              ))}
              <button onClick={handleLogout} className="flex items-center justify-between w-full p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 transition-all mt-2 active:scale-95">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-rose-500"><LogOut size={20} /></div>
                  <span className="text-xs font-black uppercase tracking-tight">Sair</span>
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
