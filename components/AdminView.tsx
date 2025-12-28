
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, 
  Save, 
  Building2, 
  Palette, 
  CheckCircle2, 
  Zap, 
  Target, 
  Snowflake,
  Clock,
  Unlock,
  Lock,
  Eye,
  EyeOff,
  Key,
  MapPin,
  Fingerprint,
  AlertTriangle,
  DollarSign,
  CalendarDays,
  UserX,
  Phone,
  LayoutGrid,
  Info,
  Loader2,
  Users,
  Truck,
  Receipt,
  Mail,
  ExternalLink,
  ShieldCheck,
  UserCircle,
  ArrowRight,
  Settings,
  Activity,
  Server,
  // Fix: Added missing Pencil icon import
  Pencil
} from 'lucide-react';
import { AppSettings, UserProfile } from '../types';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onOpenPayment?: () => void;
  users: UserProfile[];
}

const AdminView: React.FC<Props> = ({ settings, onUpdateSettings, onOpenPayment, users }) => {
  const [activeTab, setActiveTab] = useState<'license' | 'company' | 'visual' | 'users'>('license');
  
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [cnpj, setCnpj] = useState(settings.cnpj || '');
  const [address, setAddress] = useState(settings.address || '');
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [logoId, setLogoId] = useState(settings.logoId);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [footerText, setFooterText] = useState(settings.footerText);
  const [expirationDate, setExpirationDate] = useState(settings.expirationDate);
  const [dashboardNotice, setDashboardNotice] = useState(settings.dashboardNotice || '');
  const [hiddenViews, setHiddenViews] = useState<string[]>(settings.hiddenViews || []);
  const [productionGoalDaily, setProductionGoalDaily] = useState(settings.productionGoalDaily || 1000);
  const [productionGoalMonthly, setProductionGoalMonthly] = useState(settings.productionGoalMonthly || 30000);
  const [salesGoalDaily, setSalesGoalDaily] = useState(settings.salesGoalDaily || 2000);
  const [salesGoalMonthly, setSalesGoalMonthly] = useState(settings.salesGoalMonthly || 60000);
  
  const [renewDays, setRenewDays] = useState(30);
  const [isSaved, setIsSaved] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setExpirationDate(settings.expirationDate);
    setHiddenViews(settings.hiddenViews || []);
  }, [settings]);

  const toggleViewVisibility = (id: string) => {
    const newHidden = hiddenViews.includes(id) 
      ? hiddenViews.filter(v => v !== id) 
      : [...hiddenViews, id];
    setHiddenViews(newHidden);
  };

  const daysUntilExpiration = useMemo(() => {
    if (!expirationDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate + 'T00:00:00');
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [expirationDate]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsUpdating(true);
    await onUpdateSettings({ 
      ...settings,
      companyName, 
      cnpj,
      address,
      primaryColor, 
      logoId, 
      supportPhone, 
      footerText, 
      expirationDate, 
      hiddenViews, 
      dashboardNotice,
      productionGoalDaily,
      productionGoalMonthly,
      salesGoalDaily,
      salesGoalMonthly
    });
    setIsUpdating(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSetBlock = async () => {
    if (!confirm('Deseja realmente BLOQUEAR o sistema AGORA? Isso impedirá o acesso de todos os usuários imediatamente.')) return;
    const pastDate = '2000-01-01';
    setExpirationDate(pastDate);
    setIsUpdating(true);
    await onUpdateSettings({ 
      ...settings, 
      expirationDate: pastDate,
      companyName, cnpj, address, primaryColor, logoId, supportPhone, footerText, hiddenViews, dashboardNotice, productionGoalDaily, productionGoalMonthly, salesGoalDaily, salesGoalMonthly
    });
    setIsUpdating(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleRenewCustomDays = async () => {
    setIsUpdating(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newExp = new Date(today.getTime() + (renewDays * 24 * 60 * 60 * 1000));
    const dateStr = `${newExp.getFullYear()}-${String(newExp.getMonth() + 1).padStart(2, '0')}-${String(newExp.getDate()).padStart(2, '0')}`;
    setExpirationDate(dateStr);
    await onUpdateSettings({ 
      ...settings, 
      expirationDate: dateStr,
      companyName, cnpj, address, primaryColor, logoId, supportPhone, footerText, hiddenViews, dashboardNotice, productionGoalDaily, productionGoalMonthly, salesGoalDaily, salesGoalMonthly
    });
    setIsUpdating(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const isExpired = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate + 'T00:00:00');
    return today > expDate;
  };

  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration >= 0 && daysUntilExpiration <= 7;

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-32">
      
      {/* Executive Header */}
      <header className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 p-8 opacity-5">
           <Settings size={140} className="animate-spin-slow" />
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center shadow-2xl">
            <Shield size={40} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">CENTRAL <span className="text-sky-500">ADMIN</span></h2>
            <div className="flex items-center gap-3 mt-3">
              <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <Server size={12} className="text-sky-500" /> System Governance v5.0
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                <Activity size={12} /> Live Security
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          {isUpdating && (
            <div className="flex items-center gap-2 bg-sky-50 text-sky-600 px-6 py-3 rounded-2xl text-[10px] font-black animate-pulse border border-sky-100">
              <Loader2 size={16} className="animate-spin" /> SINCRONIZANDO...
            </div>
          )}
          {isSaved && !isUpdating && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl text-[10px] font-black border border-emerald-100">
              <CheckCircle2 size={16} /> DADOS PROTEGIDOS
            </div>
          )}
        </div>
      </header>

      {/* Modern Navigation Tabs */}
      <nav className="flex items-center p-2 bg-slate-100/60 backdrop-blur-md rounded-[2rem] w-fit border border-slate-200 shadow-inner">
        {[
          { id: 'license', label: 'Segurança & Licença', icon: ShieldCheck },
          { id: 'users', label: 'Usuários Registrados', icon: Users },
          { id: 'company', label: 'Regras de Negócio', icon: Building2 },
          { id: 'visual', label: 'Identidade & Módulos', icon: Palette }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.6rem] text-[11px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-xl border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-8">
        
        {/* USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
                      <Users size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Perfis de Acesso</h3>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de identidades autenticadas via Supabase</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-5 py-2.5 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-100">
                    {users.length} USUÁRIOS ATIVOS
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                        <th className="px-10 py-6">CREDENCIAIS / ID</th>
                        <th className="px-10 py-6">REGISTRO INICIAL</th>
                        <th className="px-10 py-6">ÚLTIMA ATIVIDADE</th>
                        <th className="px-10 py-6 text-center">GOVERNANÇA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-10 py-20 text-center">
                             <UserCircle size={60} className="mx-auto text-slate-100 mb-4" />
                             <p className="text-slate-400 italic text-sm">Nenhum perfil remoto vinculado a esta instância.</p>
                          </td>
                        </tr>
                      ) : (
                        users.map(user => (
                          <tr key={user.id} className="hover:bg-sky-50/10 transition-all group">
                            <td className="px-10 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg">
                                  {user.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="text-sm font-black text-slate-800 block uppercase tracking-tight">{user.email}</span>
                                  <span className="text-[9px] font-bold text-slate-300 font-mono tracking-tighter">UID: {user.id.slice(0, 16)}...</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-6">
                               <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                  <CalendarDays size={14} className="text-slate-300" />
                                  {new Date(user.created_at).toLocaleString('pt-BR')}
                               </div>
                            </td>
                            <td className="px-10 py-6">
                               <div className="flex items-center gap-2 text-[11px] font-bold text-sky-500 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100 w-fit">
                                  <Clock size={14} />
                                  {user.last_login ? new Date(user.last_login).toLocaleString('pt-BR') : 'SEM LOG ATIVO'}
                               </div>
                            </td>
                            <td className="px-10 py-6 text-center">
                               <span className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase shadow-sm">CONFIÁVEL</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        )}

        {/* LICENSE & SECURITY */}
        {activeTab === 'license' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Main License Status Card */}
            <div className={`p-12 rounded-[3.5rem] border-4 flex flex-col lg:flex-row items-center justify-between gap-10 transition-all duration-700 relative overflow-hidden ${isExpired() ? 'bg-rose-500 border-rose-600 text-white shadow-3xl shadow-rose-200' : isExpiringSoon ? 'bg-amber-400 border-amber-500 text-white shadow-3xl shadow-amber-100' : 'bg-white border-slate-100 text-slate-900 shadow-xl'}`}>
              
              <div className="absolute left-0 bottom-0 opacity-10">
                 <Shield size={200} />
              </div>

              <div className="flex items-center gap-10 text-center lg:text-left flex-col lg:flex-row relative z-10">
                <div className={`w-32 h-32 rounded-[3rem] flex items-center justify-center shadow-2xl backdrop-blur-xl animate-in zoom-in duration-1000 ${isExpired() || isExpiringSoon ? 'bg-white/20' : 'bg-slate-900 text-white'}`}>
                  {isExpired() ? <Lock size={60} /> : isExpiringSoon ? <AlertTriangle size={60} /> : <Unlock size={60} />}
                </div>
                <div>
                  <h4 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">Vigência Ativa</h4>
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    <span className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border ${isExpired() || isExpiringSoon ? 'bg-white/20 border-white/30' : 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-100'}`}>
                      {isExpired() ? 'CONTRATO ENCERRADO' : 'LICENÇA VÁLIDA'}
                    </span>
                    <span className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border ${isExpired() || isExpiringSoon ? 'bg-white/20 border-white/30' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                      ATÉ {new Date(expirationDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 relative z-10 w-full lg:w-auto">
                 <button 
                   onClick={handleSetBlock}
                   disabled={isUpdating}
                   className={`flex items-center justify-center gap-3 px-10 py-5 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95 ${isExpired() ? 'bg-white/10 text-white border border-white/20 cursor-not-allowed opacity-50' : 'bg-rose-700 text-white hover:bg-rose-900 border-b-4 border-rose-900'}`}
                 >
                   <UserX size={20} /> Bloquear Acesso Agora
                 </button>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-inner">
                      <Zap size={28} />
                    </div>
                    <h5 className="font-black text-slate-900 text-lg uppercase tracking-tight leading-none">Renovação Expressa</h5>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-[72px]">Incremento de dias de operação</p>
                </div>
                
                <div className="flex items-stretch gap-3">
                  <div className="relative flex-1">
                    <input 
                      type="number" 
                      value={renewDays} 
                      onChange={e => setRenewDays(parseInt(e.target.value) || 0)}
                      className="w-full h-16 px-8 bg-slate-50 border border-slate-200 rounded-3xl font-black text-3xl text-slate-900 outline-none focus:ring-4 focus:ring-sky-100 transition-all text-center"
                    />
                  </div>
                  <button 
                    onClick={handleRenewCustomDays}
                    disabled={isUpdating}
                    className="px-10 bg-sky-600 text-white font-black rounded-3xl hover:bg-sky-700 transition-all shadow-xl shadow-sky-100 active:scale-95 text-[11px] uppercase tracking-widest border-b-4 border-sky-800"
                  >
                    Renovar
                  </button>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 rounded-3xl bg-slate-50 text-slate-600 flex items-center justify-center shadow-inner">
                      <CalendarDays size={28} />
                    </div>
                    <h5 className="font-black text-slate-900 text-lg uppercase tracking-tight leading-none">Deadline Final</h5>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-[72px]">Configuração manual de corte</p>
                </div>
                
                <div className="flex items-stretch gap-3">
                  <input 
                    type="date" 
                    value={expirationDate} 
                    onChange={e => setExpirationDate(e.target.value)}
                    className="flex-1 h-16 px-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-sm outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase"
                  />
                  <button 
                    onClick={() => handleSubmit()}
                    disabled={isUpdating}
                    className="px-8 bg-slate-900 text-white font-black rounded-3xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 text-[11px] uppercase tracking-widest border-b-4 border-slate-950"
                  >
                    Setar
                  </button>
                </div>
              </div>

              <div className="bg-indigo-900 p-10 rounded-[3rem] border border-indigo-950 shadow-2xl shadow-indigo-100/40 space-y-8 text-white relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                   <Key size={160} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-3xl bg-white/10 flex items-center justify-center text-white">
                      <Fingerprint size={28} />
                    </div>
                    <div>
                      <h5 className="font-black text-white text-lg uppercase tracking-tight">Identity Hub</h5>
                      <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Painel de Credenciais</p>
                    </div>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed text-indigo-100 mb-8 uppercase tracking-tight">
                    A gestão de senhas e autenticação multifator é processada de forma criptografada pelo Supabase Vault.
                  </p>
                  <a 
                    href="https://supabase.com/dashboard" 
                    target="_blank" 
                    className="flex items-center justify-center gap-3 w-full py-5 bg-white text-indigo-900 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-sky-400 hover:text-white transition-all shadow-xl"
                  >
                    Console Supabase <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BUSINESS RULES */}
        {activeTab === 'company' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6 flex items-center gap-2"><Building2 size={16} className="text-sky-500" /> Nome Institucional da Licença</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ex: Gelo Brasil LTDA" className="w-full h-16 px-8 bg-slate-50 border border-slate-200 rounded-3xl font-black text-sm outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase" />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6 flex items-center gap-2"><Fingerprint size={16} className="text-sky-500" /> Registro Tributário (CNPJ)</label>
                  <input type="text" value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" className="w-full h-16 px-8 bg-slate-50 border border-slate-200 rounded-3xl font-black text-sm outline-none focus:ring-4 focus:ring-slate-100 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-sky-50/50 p-10 rounded-[3rem] border border-sky-100 space-y-8">
                  <div className="flex items-center justify-between border-b border-sky-200/50 pb-6">
                    <h5 className="text-sm font-black text-sky-900 uppercase tracking-widest flex items-center gap-3">
                      <Target size={24} className="text-sky-600" /> Metas de Fabricação
                    </h5>
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest bg-white px-3 py-1 rounded-lg">Unidade: KG</span>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div className="space-y-3">
                        <label className="text-[10px] font-black text-sky-400 uppercase tracking-widest ml-4">Meta Diária</label>
                        <input type="number" value={productionGoalDaily} onChange={e => setProductionGoalDaily(parseInt(e.target.value) || 0)} className="w-full h-14 px-6 bg-white border border-sky-100 rounded-2xl font-black text-sky-900 outline-none focus:ring-4 focus:ring-sky-200" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-sky-400 uppercase tracking-widest ml-4">Meta Mensal</label>
                        <input type="number" value={productionGoalMonthly} onChange={e => setProductionGoalMonthly(parseInt(e.target.value) || 0)} className="w-full h-14 px-6 bg-white border border-sky-100 rounded-2xl font-black text-sky-900 outline-none focus:ring-4 focus:ring-sky-200" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/50 p-10 rounded-[3rem] border border-emerald-100 space-y-8">
                  <div className="flex items-center justify-between border-b border-emerald-200/50 pb-6">
                    <h5 className="text-sm font-black text-emerald-900 uppercase tracking-widest flex items-center gap-3">
                      <DollarSign size={24} className="text-emerald-600" /> Metas de Faturamento
                    </h5>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-white px-3 py-1 rounded-lg">Unidade: BRL</span>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div className="space-y-3">
                        <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-4">Venda Diária</label>
                        <input type="number" value={salesGoalDaily} onChange={e => setSalesGoalDaily(parseInt(e.target.value) || 0)} className="w-full h-14 px-6 bg-white border border-emerald-100 rounded-2xl font-black text-emerald-900 outline-none focus:ring-4 focus:ring-emerald-200" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-4">Venda Mensal</label>
                        <input type="number" value={salesGoalMonthly} onChange={e => setSalesGoalMonthly(parseInt(e.target.value) || 0)} className="w-full h-14 px-6 bg-white border border-emerald-100 rounded-2xl font-black text-emerald-900 outline-none focus:ring-4 focus:ring-emerald-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                 <button 
                  onClick={() => handleSubmit()}
                  disabled={isUpdating}
                  className="bg-slate-900 text-white font-black px-16 py-6 rounded-3xl hover:bg-sky-600 transition-all active:scale-95 shadow-2xl flex items-center gap-4 uppercase text-[12px] tracking-[0.2em] border-b-4 border-slate-950 hover:border-sky-800"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                  Salvar Configurações Master
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VISUAL & MODULES */}
        {activeTab === 'visual' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-1 bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-12">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[2rem] bg-slate-900 text-white flex items-center justify-center shadow-xl">
                    <Palette size={32} />
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 text-xl uppercase tracking-tight leading-none">Global Brand</h5>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Identidade do sistema</p>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="space-y-5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">Cor Primária Interativa</label>
                    <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                      <div className="relative group cursor-pointer">
                        <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-20 h-20 p-1 bg-white border border-slate-200 rounded-2xl cursor-pointer" />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center pointer-events-none">
                           <Pencil size={20} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{primaryColor}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">HEX CODE ATIVO</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-12">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[2rem] bg-sky-50 text-sky-600 flex items-center justify-center shadow-inner">
                      <LayoutGrid size={32} />
                    </div>
                    <div>
                      <h5 className="font-black text-slate-900 text-xl uppercase tracking-tight leading-none">Módulos do Sistema</h5>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Visibilidade de Navegação</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { id: 'sales', label: 'Gestão de Vendas', icon: DollarSign, color: 'text-emerald-500' },
                    { id: 'expenses', label: 'Fluxo de Despesas', icon: Receipt, color: 'text-rose-500' },
                    { id: 'production', label: 'Produção de Gelo', icon: Snowflake, color: 'text-sky-500' },
                    { id: 'team', label: 'Gestão de Equipe', icon: Users, color: 'text-indigo-500' },
                    { id: 'fleet', label: 'Logística de Frota', icon: Truck, color: 'text-slate-900' }
                  ].map(mod => (
                    <button 
                      key={mod.id}
                      type="button"
                      onClick={() => toggleViewVisibility(mod.id)}
                      className={`flex items-center justify-between p-7 rounded-[2.2rem] border-2 transition-all active:scale-95 group relative overflow-hidden ${hiddenViews.includes(mod.id) ? 'bg-slate-50 border-slate-100 text-slate-300' : 'bg-white border-slate-100 text-slate-800 hover:border-sky-500 hover:shadow-2xl shadow-sm'}`}
                    >
                       <div className="flex items-center gap-5 relative z-10">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${hiddenViews.includes(mod.id) ? 'bg-slate-200' : 'bg-slate-50 group-hover:bg-sky-500 group-hover:text-white'}`}>
                            <mod.icon size={22} className={hiddenViews.includes(mod.id) ? 'opacity-20' : ''} />
                          </div>
                          <div className="text-left">
                            <span className="text-[13px] font-black uppercase tracking-tight block">{mod.label}</span>
                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${hiddenViews.includes(mod.id) ? 'text-rose-400' : 'text-emerald-500'}`}>
                              {hiddenViews.includes(mod.id) ? 'INATIVO' : 'HABILITADO'}
                            </span>
                          </div>
                       </div>
                       <div className="relative z-10">
                          {hiddenViews.includes(mod.id) ? <EyeOff size={24} /> : <Eye size={24} className="text-sky-500" />}
                       </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
              <button 
                onClick={() => handleSubmit()}
                disabled={isUpdating}
                className="bg-slate-900 text-white font-black px-16 py-6 rounded-3xl hover:bg-sky-600 transition-all active:scale-95 shadow-2xl flex items-center gap-4 uppercase text-[12px] tracking-[0.2em] border-b-4 border-slate-950 hover:border-sky-800"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                Confirmar Customização Visual
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;
