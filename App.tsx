
import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, CircleDollarSign, Receipt, Users, Truck, Loader2, Snowflake, Shield, X, LogOut, MoreHorizontal, ChevronRight, User, Key, Eye, EyeOff, MessageCircle, AlertCircle, Mail, Lock, LogIn, Phone, Box, Sparkles, ShieldAlert, Calendar, QrCode, Copy, Check } from 'lucide-react';
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
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  
  const [data, setData] = useState<AppData>({
    sales: [], expenses: [], employees: [], vehicles: [], fuelLogs: [], maintenanceLogs: [], fineLogs: [], production: [], monthlyGoals: [], categories: [], users: [],
    settings: { companyName: 'GELO BRASIL LTDA', cnpj: '42.996.710/0001-63', primaryColor: '#5ecce3', logoId: 'Snowflake', loginHeader: 'ADMIN', supportPhone: '', footerText: '', expirationDate: '2099-12-31', hiddenViews: [], adminEmail: 'root@adm.app' }
  });

  const PIX_CODE = "00020126590014BR.GOV.BCB.PIX0111135244986200222Mensalidade do Sistema5204000053039865406100.005802BR5925MAYCON RUBEM DOS SANTOS P6013MONTES CLAROS622605226rZoYS25kQugjDLBWRKJVs63045E25";

  useEffect(() => { 
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        setCurrentUserEmail(session.user.email || null);
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
        setCurrentUserEmail(authData.user.email || null);
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
    navigator.clipboard.writeText(PIX_CODE);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const wrap = (fn: any) => async (payload: any) => {
    const result = await fn(payload);
    if (result?.error) { alert("ERRO: " + result.error.message.toUpperCase()); return; }
    loadAppData();
  };

  // Verifica se o usuário atual é o administrador
  const isAdmin = useMemo(() => currentUserEmail?.toLowerCase() === (data.settings.adminEmail?.toLowerCase() || 'root@adm.app'), [currentUserEmail, data.settings.adminEmail]);

  // Lógica de Expiração de Sistema
  const isSystemExpired = useMemo(() => {
    if (!data.settings.expirationDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(data.settings.expirationDate + 'T00:00:00');
    return today > expDate;
  }, [data.settings.expirationDate]);

  const menuItems = [
    { id: 'dashboard', label: 'INÍCIO', icon: LayoutDashboard },
    { id: 'sales', label: 'VENDAS', icon: CircleDollarSign },
    { id: 'expenses', label: 'DESPESAS', icon: Receipt },
    { id: 'production', label: 'PRODUÇÃO', icon: Snowflake },
    { id: 'team', label: 'EQUIPE', icon: Users },
    { id: 'fleet', label: 'FROTA', icon: Truck },
    { id: 'admin', label: 'ADMIN', icon: Shield },
  ].filter(item => {
    // Esconde itens marcados como ocultos nas configurações
    if (data.settings.hiddenViews.includes(item.id)) return false;
    // Esconde a aba ADMIN se o usuário não for o root@adm.app
    if (item.id === 'admin' && !isAdmin) return false;
    return true;
  });

  const mobileFixedItems = menuItems.slice(0, 4);
  const mobileExtraItems = menuItems.slice(4);

  const handleMobileNav = (viewId: string) => {
    setView(viewId as ViewType);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading && !isAuthenticated) return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-[#5ecce3] mb-4" size={48} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">CARREGANDO...</p>
    </div>
  );

  // TELA DE BLOQUEIO POR EXPIRAÇÃO
  if (isAuthenticated && isSystemExpired && !isAdmin) return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center p-6 text-center font-['Plus_Jakarta_Sans'] overflow-y-auto pb-12">
      <div className="w-20 h-20 bg-rose-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-rose-200 mb-6 mt-8 animate-bounce shrink-0">
        <ShieldAlert size={36} />
      </div>
      
      <h1 className="text-2xl font-black text-rose-900 tracking-tighter uppercase mb-2">Acesso Suspenso</h1>
      <p className="text-xs font-bold text-rose-700/60 max-w-sm mb-8 uppercase tracking-widest leading-relaxed">
        O prazo de utilização expirou em <span className="text-rose-600 underline">{new Date(data.settings.expirationDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>. Realize o pagamento abaixo para reativar.
      </p>

      {/* Card PIX */}
      <div className="w-full max-w-md bg-white p-8 rounded-[3rem] shadow-xl border border-rose-100 mb-8 flex flex-col items-center">
        <div className="bg-sky-50 p-4 rounded-3xl mb-6">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(PIX_CODE)}`} 
            alt="PIX QR Code" 
            className="w-48 h-48 rounded-xl"
          />
        </div>
        
        <div className="w-full space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <QrCode size={18} className="text-[#5ecce3]" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escaneie ou copie o código</span>
          </div>

          <button 
            onClick={handleCopyPix}
            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all active:scale-95 group ${copiedPix ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}
          >
            <div className="flex flex-col items-start overflow-hidden mr-4">
              <span className={`text-[8px] font-black uppercase tracking-widest ${copiedPix ? 'text-emerald-500' : 'text-slate-400'}`}>
                {copiedPix ? 'Copiado!' : 'PIX Copia e Cola'}
              </span>
              <span className="text-[10px] font-black text-slate-700 truncate w-full text-left">
                {PIX_CODE}
              </span>
            </div>
            {copiedPix ? <Check size={20} className="text-emerald-500 shrink-0" /> : <Copy size={20} className="text-slate-300 group-hover:text-sky-500 shrink-0" />}
          </button>

          <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100 text-center">
             <p className="text-[9px] font-black text-sky-700 uppercase leading-relaxed">
                Após o pagamento, envie o comprovante para o suporte para liberação imediata.
             </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 w-full max-w-xs">
        <a 
          href={`https://wa.me/${data.settings.supportPhone?.replace(/\D/g, '') || '5538998289668'}`} 
          target="_blank"
          className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 hover:scale-105 transition-all"
        >
          <MessageCircle size={18} /> Enviar Comprovante
        </a>
        <button 
          onClick={handleLogout}
          className="w-full py-4 text-rose-400 font-black text-[10px] uppercase tracking-widest hover:text-rose-600 transition-colors"
        >
          Sair do Sistema
        </button>
      </div>

      <div className="mt-12">
         <p className="text-[10px] font-black text-rose-300 uppercase tracking-[0.3em]">Desenvolvido por Maycon Rubem</p>
      </div>
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center p-6 font-['Plus_Jakarta_Sans'] overflow-y-auto">
      
      {/* Logo e Nome da Empresa */}
      <div className="flex flex-col items-center mb-10 mt-8">
        <div className="w-24 h-24 bg-[#5ecce3] rounded-full flex items-center justify-center text-white shadow-[0_15px_30px_-5px_rgba(94,204,227,0.4)] mb-8">
          <Box size={44} strokeWidth={2.5} />
        </div>
        
        <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight text-center px-4">
          {data.settings.companyName || 'GELO BRASIL LTDA'}
        </h1>
        
        <p className="text-sm font-bold text-slate-400 mt-2">
          CNPJ: {data.settings.cnpj || '42.996.710/0001-63'}
        </p>
      </div>

      {/* Card de Login */}
      <div className="w-full max-w-md bg-white p-10 sm:p-12 rounded-[3.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.04)] border border-slate-50 mb-10">
        <form onSubmit={handleLogin} className="space-y-8">
          {/* E-MAIL */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              <Mail size={14} className="text-slate-300" />
              E-MAIL
            </div>
            <input 
              type="email" 
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full h-16 px-6 bg-[#f1f5f9] border border-transparent rounded-[1.2rem] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#5ecce3]/20 focus:bg-white focus:border-[#5ecce3]/30 transition-all"
              required
            />
          </div>

          {/* SENHA */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              <Lock size={14} className="text-slate-300" />
              SENHA
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-16 px-6 bg-[#f1f5f9] border border-transparent rounded-[1.2rem] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#5ecce3]/20 focus:bg-white focus:border-[#5ecce3]/30 transition-all"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#5ecce3] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {loginError && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
              <AlertCircle className="text-rose-500" size={18} />
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-tight">{loginError}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoggingIn}
            className="w-full h-16 bg-[#5ecce3] text-white rounded-[1.2rem] font-extrabold text-lg flex items-center justify-center gap-3 shadow-lg shadow-[#5ecce3]/30 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoggingIn ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <LogIn size={22} strokeWidth={2.5} />
                Acessar
              </>
            )}
          </button>
        </form>
      </div>

      {/* Ajuda e Suporte */}
      <div className="flex flex-col items-center gap-4 mb-12">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Precisa de Ajuda?</p>
        <a 
          href={`https://wa.me/${data.settings.supportPhone?.replace(/\D/g, '') || '5538998289668'}`} 
          target="_blank"
          className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 group"
        >
          <Phone size={18} className="text-[#5ecce3]" />
          <span className="text-sm font-extrabold text-slate-700">
            Suporte: {data.settings.supportPhone || '(38) 99828-9668'}
          </span>
        </a>
      </div>

      {/* Créditos Finais - SUPER DESTACADO PARA MOBILE E DESKTOP */}
      <div className="mt-auto mb-10 animate-in slide-in-from-bottom-4 duration-1000">
         <div className="px-6 py-3 bg-white border border-sky-100 rounded-full flex items-center gap-3 shadow-[0_10px_20px_-5px_rgba(94,204,227,0.15)] hover:shadow-lg transition-all group cursor-default border-b-2 border-b-[#5ecce3]/20">
            <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center">
              <Sparkles size={16} className="text-[#5ecce3] animate-pulse" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">
              Desenvolvido por <span className="text-[#5ecce3] font-black group-hover:text-sky-600 transition-colors">Maycon Rubem</span>
            </p>
         </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row bg-[#f0f9ff] uppercase transition-colors duration-500 pb-20 lg:pb-0`}>
      
      {/* Aviso de Licença Expirada (Apenas para Admin se expirado) */}
      {isSystemExpired && isAdmin && (
        <div className="fixed top-0 left-0 right-0 bg-rose-600 text-white p-3 z-[100] text-center flex items-center justify-center gap-4 shadow-xl no-print animate-in slide-in-from-top duration-500">
           <ShieldAlert size={18} className="animate-pulse" />
           <p className="text-[9px] font-black uppercase tracking-[0.2em]">SISTEMA EXPIRADO! RENOVE O ACESSO NA ABA "ADMIN" IMEDIATAMENTE.</p>
           <button onClick={() => setView('admin')} className="bg-white text-rose-600 px-4 py-1.5 rounded-lg text-[8px] font-black uppercase shadow-sm">Renovar</button>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className={`hidden lg:flex w-64 flex-col bg-white border-r border-sky-100 py-10 px-4 sticky top-0 h-screen z-50 ${isSystemExpired && isAdmin ? 'pt-24' : ''}`}>
        <div className="flex items-center gap-3 px-4 mb-12">
          <div className="w-10 h-10 rounded-2xl bg-[#5ecce3] flex items-center justify-center text-white shadow-lg shadow-[#5ecce3]/20">
            <Snowflake size={20} />
          </div>
          <h1 className="text-sm font-black uppercase tracking-tighter text-slate-800 truncate">{data.settings.companyName}</h1>
        </div>
        <nav className="flex-1 space-y-1">
          {menuItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setView(item.id as ViewType)} 
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${view === item.id ? 'bg-[#5ecce3] text-white shadow-xl shadow-[#5ecce3]/20' : 'text-slate-400 hover:bg-sky-50 hover:text-sky-600'}`}
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
      <div className={`lg:hidden flex items-center justify-between p-4 bg-white border-b border-sky-100 sticky top-0 z-[60] shadow-sm ${isSystemExpired && isAdmin ? 'mt-12' : ''}`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-[#5ecce3] flex items-center justify-center text-white shadow-md shadow-[#5ecce3]/10 shrink-0">
            <Snowflake size={16} />
          </div>
          <h1 className="text-[10px] font-black uppercase tracking-tighter text-slate-800 truncate">{data.settings.companyName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black text-[#5ecce3] px-2 py-1 bg-sky-50 rounded-full border border-sky-100 uppercase">Online</span>
        </div>
      </div>

      {/* Main Content */}
      <main className={`flex-1 max-w-7xl mx-auto w-full relative ${isSystemExpired && isAdmin && view !== 'admin' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
        {view === 'dashboard' && <DashboardView {...data} onSwitchView={setView} settings={data.settings} />}
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
        {view === 'admin' && isAdmin && <AdminView settings={data.settings} onUpdateSettings={wrap(syncSettings)} users={[]} />}
        {view === 'admin' && !isAdmin && <div className="p-10 text-center font-black text-slate-400">ACESSO RESTRITO AO ADMINISTRADOR</div>}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-sky-100 px-2 py-3 flex items-center justify-around z-[70] shadow-[0_-10px_30px_rgba(14,165,233,0.05)] rounded-t-[2rem]">
        {mobileFixedItems.map(item => (
          <button 
            key={item.id} 
            onClick={() => handleMobileNav(item.id)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${view === item.id && !isMobileMenuOpen ? 'text-[#5ecce3] bg-sky-50/50' : 'text-slate-400'}`}
          >
            <item.icon size={22} strokeWidth={view === item.id && !isMobileMenuOpen ? 3 : 2} />
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
        
        {/* Botão "MAIS" */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${isMobileMenuOpen ? 'text-[#5ecce3] bg-sky-50/50 scale-110' : 'text-slate-400'}`}
        >
          <div className={`transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}>
            {isMobileMenuOpen ? <X size={22} strokeWidth={3} /> : <MoreHorizontal size={22} strokeWidth={2} />}
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest">{isMobileMenuOpen ? 'FECHAR' : 'MAIS'}</span>
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute bottom-24 left-4 right-4 bg-white rounded-[2.5rem] p-6 shadow-2xl border border-sky-100 animate-in slide-in-from-bottom-10 duration-500">
             <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menu Expandido</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-400"><X size={16} /></button>
             </div>
             <div className="grid grid-cols-1 gap-3">
                {mobileExtraItems.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => handleMobileNav(item.id)}
                    className={`flex items-center justify-between w-full p-5 rounded-2xl transition-all ${view === item.id ? 'bg-[#5ecce3] text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-sky-50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${view === item.id ? 'bg-white/20' : 'bg-white shadow-sm text-[#5ecce3]'}`}>
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
    </div>
  );
};

export default App;
