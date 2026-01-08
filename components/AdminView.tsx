
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, 
  Save, 
  Building2, 
  Palette, 
  CheckCircle2, 
  Zap, 
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
  Pencil,
  ChevronUp,
  ChevronDown,
  CircleDollarSign,
  UserPlus,
  PackageCheck,
  Boxes,
  Database,
  Terminal
} from 'lucide-react';
import { AppSettings, UserProfile, ViewType } from '../types';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onOpenPayment?: () => void;
  users: UserProfile[];
}

const AdminView: React.FC<Props> = ({ settings, onUpdateSettings, users }) => {
  const [activeTab, setActiveTab] = useState<'license' | 'company' | 'visual' | 'users'>('license');
  
  // Estados Locais
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
  const [menuOrder, setMenuOrder] = useState<string[]>(settings.menuOrder || []);
  const [salesGoalDaily, setSalesGoalDaily] = useState(settings.salesGoalDaily || 2000);
  const [salesGoalMonthly, setSalesGoalMonthly] = useState(settings.salesGoalMonthly || 60000);
  
  const [renewDays, setRenewDays] = useState(30);
  const [isSaved, setIsSaved] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setCompanyName(settings.companyName);
    setCnpj(settings.cnpj || '');
    setAddress(settings.address || '');
    setPrimaryColor(settings.primaryColor);
    setLogoId(settings.logoId);
    setSupportPhone(settings.supportPhone);
    setFooterText(settings.footerText);
    setExpirationDate(settings.expirationDate);
    setDashboardNotice(settings.dashboardNotice || '');
    setHiddenViews(settings.hiddenViews || []);
    setMenuOrder(settings.menuOrder || []);
    setSalesGoalDaily(settings.salesGoalDaily || 2000);
    setSalesGoalMonthly(settings.salesGoalMonthly || 60000);
  }, [settings]);

  const toggleViewVisibility = (id: string) => {
    const newHidden = hiddenViews.includes(id) 
      ? hiddenViews.filter(v => v !== id) 
      : [...hiddenViews, id];
    setHiddenViews(newHidden);
  };

  const moveMenuItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...menuOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setMenuOrder(newOrder);
  };

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
      menuOrder,
      dashboardNotice,
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
    setIsUpdating(true);
    await onUpdateSettings({ 
      ...settings, 
      expirationDate: pastDate,
      companyName, cnpj, address, primaryColor, logoId, supportPhone, footerText, hiddenViews, menuOrder, dashboardNotice, salesGoalDaily, salesGoalMonthly
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
    await onUpdateSettings({ 
      ...settings, 
      expirationDate: dateStr,
      companyName, cnpj, address, primaryColor, logoId, supportPhone, footerText, hiddenViews, menuOrder, dashboardNotice, salesGoalDaily, salesGoalMonthly
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

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-32">
      
      {/* Executive Header */}
      <header className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 p-8 opacity-5 hidden sm:block">
           <Settings size={140} className="animate-spin-slow dark:text-white" />
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 relative z-10 w-full">
          <div className="w-12 h-12 sm:w-20 sm:h-20 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl sm:rounded-[2rem] flex items-center justify-center shadow-2xl shrink-0">
            <Shield className="size-6 sm:size-10" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase truncate">CENTRAL <span className="text-[#5ecce3]">ADMIN</span></h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1.5 text-[8px] sm:text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest bg-slate-50 dark:bg-slate-950 p-1.5 rounded-full border border-slate-100 dark:border-slate-800 leading-none">
                <Server size={10} className="text-[#5ecce3]" /> v6.1
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full lg:w-auto justify-end">
          {isUpdating && (
            <div className="flex items-center gap-2 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 px-4 py-2 rounded-xl text-[9px] font-black animate-pulse border border-sky-100 dark:border-sky-900/30">
              <Loader2 size={14} className="animate-spin" /> SINCRONIZANDO...
            </div>
          )}
          {isSaved && !isUpdating && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-[9px] font-black border border-emerald-100 dark:border-emerald-900/30">
              <CheckCircle2 size={14} /> SALVO COM SUCESSO
            </div>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex items-center p-1 bg-slate-100/60 dark:bg-slate-950/60 backdrop-blur-md rounded-[2rem] w-full border border-slate-200 dark:border-slate-800 shadow-inner overflow-x-auto no-scrollbar scrollbar-hide">
        {[
          { id: 'license', label: 'Licença', icon: ShieldCheck },
          { id: 'users', label: 'Usuários', icon: Users },
          { id: 'company', label: 'Regras', icon: Building2 },
          { id: 'visual', label: 'Menu', icon: Palette }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-3 sm:py-4 rounded-[1.6rem] text-[10px] sm:text-[11px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg border border-slate-100 dark:border-slate-700' : 'text-slate-400 dark:text-slate-600'}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {/* VISUAL & MENU ORDERING */}
        {activeTab === 'visual' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center"><LayoutGrid size={24} /></div>
                  <h5 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight">Ordenação e Visibilidade</h5>
                </div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-16">Organize seu menu e oculte o que não for necessário</p>
              </div>

              <div className="space-y-3">
                {menuOrder.map((moduleId, index) => {
                  const modInfo = ALL_MODULES.find(m => m.id === moduleId);
                  if (!modInfo) return null;
                  const isHidden = hiddenViews.includes(moduleId);
                  
                  return (
                    <div 
                      key={moduleId}
                      className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${isHidden ? 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 opacity-50' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-sky-100 dark:hover:border-sky-900 shadow-sm'}`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                         <div className="flex flex-col gap-1">
                            <button onClick={() => moveMenuItem(index, 'up')} disabled={index === 0} className="text-slate-300 hover:text-sky-500 disabled:opacity-10"><ChevronUp size={16}/></button>
                            <button onClick={() => moveMenuItem(index, 'down')} disabled={index === menuOrder.length - 1} className="text-slate-300 hover:text-sky-500 disabled:opacity-10"><ChevronDown size={16}/></button>
                         </div>
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isHidden ? 'bg-slate-100 dark:bg-slate-900 text-slate-400' : 'bg-sky-50 dark:bg-sky-900/20 text-sky-500'}`}>
                            <modInfo.icon size={18} />
                         </div>
                         <span className={`text-[11px] font-black uppercase tracking-tight truncate ${isHidden ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{modInfo.label}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {moduleId !== 'admin' && (
                          <button 
                            onClick={() => toggleViewVisibility(moduleId)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isHidden ? 'text-slate-400 bg-slate-100 dark:bg-slate-800' : 'text-sky-500 bg-sky-50 dark:bg-sky-900/30'}`}
                          >
                            {isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        )}
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400">
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-8 border-t border-slate-50 dark:border-slate-800">
                 <button 
                  onClick={() => handleSubmit()} 
                  className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black py-6 rounded-3xl uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all"
                 >
                   Salvar Organização do Menu
                 </button>
              </div>
            </div>
          </div>
        )}

        {/* LICENSE */}
        {activeTab === 'license' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className={`p-8 rounded-[2.5rem] border-2 sm:border-4 flex flex-col lg:flex-row items-center justify-between gap-6 transition-all duration-700 ${isExpired() ? 'bg-rose-500 border-rose-600 text-white shadow-3xl shadow-rose-100' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white shadow-xl dark:shadow-none'}`}>
              <div className="flex items-center gap-6 text-center lg:text-left flex-col lg:flex-row">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] flex items-center justify-center shadow-xl ${isExpired() ? 'bg-white/20' : 'bg-slate-900 dark:bg-slate-800 text-white'}`}>
                  {isExpired() ? <Lock size={32} /> : <Unlock size={32} />}
                </div>
                <div>
                  <h4 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter leading-none mb-2">Licença de Uso</h4>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isExpired() ? 'text-rose-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    Expira em: {new Date(expirationDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleSetBlock}
                className="w-full lg:w-auto px-10 py-4 bg-rose-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95"
              >
                Bloquear Agora
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                  <h5 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight flex items-center gap-2"><Zap size={20} className="text-sky-500" /> Renovar Plano</h5>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Dias adicionais</p>
                </div>
                <div className="flex gap-3">
                  <input type="number" value={renewDays} onChange={e => setRenewDays(parseInt(e.target.value) || 0)} className="w-24 h-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xl text-center dark:text-white" />
                  <button onClick={handleRenewCustomDays} className="flex-1 bg-sky-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-sky-700 shadow-lg active:scale-95 transition-all">Ativar Renovação</button>
                </div>
              </div>

              <div className="bg-indigo-900 p-8 rounded-[2.5rem] border border-indigo-950 shadow-2xl text-white">
                <div className="flex items-center gap-4 mb-4">
                  <Fingerprint size={24} className="text-sky-400" />
                  <h5 className="font-black text-white text-lg uppercase tracking-tight">Console Root</h5>
                </div>
                <p className="text-[10px] font-medium text-indigo-100 uppercase tracking-tight mb-6 leading-relaxed">
                  Acesso de alta segurança para gerenciamento de permissões e infraestrutura do banco de dados.
                </p>
                <a href="https://supabase.com/dashboard" target="_blank" className="flex items-center justify-center gap-2 w-full py-4 bg-white text-indigo-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                  Abrir Supabase <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
               <div className="p-6 sm:p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center">
                      <Users size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Perfis de Acesso</h3>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Usuários autenticados no sistema</p>
                    </div>
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-950/50 text-slate-400 dark:text-slate-600 text-[9px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                        <th className="px-6 py-4">USUÁRIO</th>
                        <th className="px-6 py-4 hidden sm:table-cell text-center">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {users.length === 0 ? (
                        <tr><td colSpan={2} className="p-10 text-center text-slate-300 dark:text-slate-700 font-black text-[10px] uppercase">Nenhum perfil listado</td></tr>
                      ) : (
                        users.map(user => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 font-black text-slate-700 dark:text-slate-200 text-xs uppercase">{user.email}</td>
                            <td className="px-6 py-4 hidden sm:table-cell text-center"><span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[8px] font-black">ATIVO</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        )}

        {/* BUSINESS RULES */}
        {activeTab === 'company' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-4 flex items-center gap-2"><Building2 size={14} className="text-[#5ecce3]" /> Nome da Empresa (Institucional)</label>
                  <input 
                    type="text" 
                    value={companyName} 
                    onChange={e => setCompanyName(e.target.value.toUpperCase())} 
                    placeholder="EX: GELO BRASIL LTDA" 
                    className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-sm outline-none focus:ring-4 focus:ring-sky-50 dark:focus:ring-sky-900/20 dark:text-white transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-4 flex items-center gap-2"><Fingerprint size={14} className="text-[#5ecce3]" /> CNPJ de Registro</label>
                  <input 
                    type="text" 
                    value={cnpj} 
                    onChange={e => setCnpj(e.target.value)} 
                    placeholder="00.000.000/0000-00" 
                    className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-sm outline-none focus:ring-4 focus:ring-sky-50 dark:focus:ring-sky-900/20 dark:text-white transition-all" 
                  />
                </div>
              </div>

              <button 
                onClick={() => handleSubmit()}
                disabled={isUpdating}
                className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black py-6 rounded-3xl hover:bg-[#5ecce3] dark:hover:bg-sky-400 transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-4 uppercase text-xs tracking-[0.2em]"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Confirmar Configurações
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;
