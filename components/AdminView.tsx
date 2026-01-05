
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
  const [salesGoalDaily, setSalesGoalDaily] = useState(settings.salesGoalDaily || 2000);
  const [salesGoalMonthly, setSalesGoalMonthly] = useState(settings.salesGoalMonthly || 60000);
  
  const [renewDays, setRenewDays] = useState(30);
  const [isSaved, setIsSaved] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // ESSENCIAL: Sincroniza estados locais se as props mudarem
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
    setSalesGoalDaily(settings.salesGoalDaily || 2000);
    setSalesGoalMonthly(settings.salesGoalMonthly || 60000);
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
      companyName, cnpj, address, primaryColor, logoId, supportPhone, footerText, hiddenViews, dashboardNotice, salesGoalDaily, salesGoalMonthly
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
      companyName, cnpj, address, primaryColor, logoId, supportPhone, footerText, hiddenViews, dashboardNotice, salesGoalDaily, salesGoalMonthly
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
      <header className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 p-8 opacity-5 hidden sm:block">
           <Settings size={140} className="animate-spin-slow" />
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 relative z-10 w-full">
          <div className="w-12 h-12 sm:w-20 sm:h-20 bg-slate-900 text-white rounded-2xl sm:rounded-[2rem] flex items-center justify-center shadow-2xl shrink-0">
            <Shield className="size-6 sm:size-10" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tighter leading-none uppercase truncate">CENTRAL <span className="text-[#5ecce3]">ADMIN</span></h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1.5 text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 sm:px-3 py-1 rounded-full border border-slate-100">
                <Server size={10} className="text-[#5ecce3]" /> v5.0
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full lg:w-auto justify-end">
          {isUpdating && (
            <div className="flex items-center gap-2 bg-sky-50 text-sky-600 px-4 py-2 rounded-xl text-[9px] font-black animate-pulse border border-sky-100">
              <Loader2 size={14} className="animate-spin" /> SINCRONIZANDO...
            </div>
          )}
          {isSaved && !isUpdating && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[9px] font-black border border-emerald-100">
              <CheckCircle2 size={14} /> SALVO COM SUCESSO
            </div>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex items-center p-1 bg-slate-100/60 backdrop-blur-md rounded-[2rem] w-full border border-slate-200 shadow-inner overflow-x-auto no-scrollbar scrollbar-hide">
        {[
          { id: 'license', label: 'Licença', icon: ShieldCheck },
          { id: 'users', label: 'Usuários', icon: Users },
          { id: 'company', label: 'Regras', icon: Building2 },
          { id: 'visual', label: 'Visual', icon: Palette }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-3 sm:py-4 rounded-[1.6rem] text-[10px] sm:text-[11px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-lg border border-slate-100' : 'text-slate-400'}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        
        {/* USERS */}
        {activeTab === 'users' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-6 sm:p-10 border-b border-slate-50 flex flex-col sm:row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
                      <Users size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Perfis de Acesso</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Usuários autenticados no sistema</p>
                    </div>
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                        <th className="px-6 py-4">USUÁRIO</th>
                        <th className="px-6 py-4 hidden sm:table-cell text-center">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.length === 0 ? (
                        <tr><td colSpan={2} className="p-10 text-center text-slate-300 font-black text-[10px] uppercase">Nenhum perfil listado</td></tr>
                      ) : (
                        users.map(user => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 font-black text-slate-700 text-xs uppercase">{user.email}</td>
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

        {/* LICENSE */}
        {activeTab === 'license' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className={`p-8 rounded-[2.5rem] border-2 sm:border-4 flex flex-col lg:flex-row items-center justify-between gap-6 transition-all duration-700 ${isExpired() ? 'bg-rose-500 border-rose-600 text-white shadow-3xl shadow-rose-100' : 'bg-white border-slate-100 text-slate-900 shadow-xl'}`}>
              <div className="flex items-center gap-6 text-center lg:text-left flex-col lg:flex-row">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] flex items-center justify-center shadow-xl ${isExpired() ? 'bg-white/20' : 'bg-slate-900 text-white'}`}>
                  {isExpired() ? <Lock size={32} /> : <Unlock size={32} />}
                </div>
                <div>
                  <h4 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter leading-none mb-2">Licença de Uso</h4>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isExpired() ? 'text-rose-100' : 'text-slate-400'}`}>
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
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h5 className="font-black text-slate-900 text-lg uppercase tracking-tight flex items-center gap-2"><Zap size={20} className="text-sky-500" /> Renovar Plano</h5>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dias adicionais</p>
                </div>
                <div className="flex gap-3">
                  <input type="number" value={renewDays} onChange={e => setRenewDays(parseInt(e.target.value) || 0)} className="w-24 h-14 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl text-center" />
                  <button onClick={handleRenewCustomDays} className="flex-1 bg-sky-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-sky-700 shadow-lg">Ativar Renovação</button>
                </div>
              </div>

              <div className="bg-indigo-900 p-8 rounded-[2.5rem] border border-indigo-950 shadow-2xl text-white">
                <div className="flex items-center gap-4 mb-4">
                  <Fingerprint size={24} className="text-sky-400" />
                  <h5 className="font-black text-white text-lg uppercase tracking-tight">Console Root</h5>
                </div>
                <p className="text-[10px] font-medium text-indigo-100 uppercase tracking-tight mb-6 leading-relaxed">
                  Acesso de alta segurança para gerenciamento de permissões e infraestrutura.
                </p>
                <a href="https://supabase.com/dashboard" target="_blank" className="flex items-center justify-center gap-2 w-full py-4 bg-white text-indigo-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                  Abrir Supabase <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* BUSINESS RULES */}
        {activeTab === 'company' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 sm:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2"><Building2 size={14} className="text-[#5ecce3]" /> Nome da Empresa (Institucional)</label>
                  <input 
                    type="text" 
                    value={companyName} 
                    onChange={e => setCompanyName(e.target.value.toUpperCase())} 
                    placeholder="EX: GELO BRASIL LTDA" 
                    className="w-full h-16 px-6 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm outline-none focus:ring-4 focus:ring-sky-50 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2"><Fingerprint size={14} className="text-[#5ecce3]" /> CNPJ de Registro</label>
                  <input 
                    type="text" 
                    value={cnpj} 
                    onChange={e => setCnpj(e.target.value)} 
                    placeholder="00.000.000/0000-00" 
                    className="w-full h-16 px-6 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm outline-none focus:ring-4 focus:ring-sky-50 transition-all" 
                  />
                </div>
              </div>

              <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 space-y-6">
                <h5 className="text-[11px] font-black text-emerald-900 uppercase tracking-widest flex items-center gap-3"><DollarSign size={20} /> Metas Venda (R$)</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-emerald-400 ml-2">DIÁRIA</label>
                    <input type="number" value={salesGoalDaily} onChange={e => setSalesGoalDaily(parseInt(e.target.value) || 0)} className="w-full h-12 px-4 bg-white border border-emerald-100 rounded-xl font-black text-emerald-900" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-emerald-400 ml-2">MENSUAL</label>
                    <input type="number" value={salesGoalMonthly} onChange={e => setSalesGoalMonthly(parseInt(e.target.value) || 0)} className="w-full h-12 px-4 bg-white border border-emerald-100 rounded-xl font-black text-emerald-900" />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleSubmit()}
                disabled={isUpdating}
                className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl hover:bg-[#5ecce3] transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-4 uppercase text-xs tracking-[0.2em]"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Confirmar Configurações
              </button>
            </div>
          </div>
        )}

        {/* VISUAL */}
        {activeTab === 'visual' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center"><LayoutGrid size={24} /></div>
                <h5 className="font-black text-slate-900 text-lg uppercase tracking-tight">Visibilidade de Módulos</h5>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'sales', label: 'Vendas', icon: DollarSign },
                  { id: 'expenses', label: 'Despesas', icon: Receipt },
                  { id: 'production', label: 'Produção', icon: Snowflake },
                  { id: 'team', label: 'Equipe', icon: Users },
                  { id: 'fleet', label: 'Frota', icon: Truck }
                ].map(mod => (
                  <button 
                    key={mod.id}
                    onClick={() => toggleViewVisibility(mod.id)}
                    className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${hiddenViews.includes(mod.id) ? 'bg-slate-50 border-slate-100 text-slate-300' : 'bg-white border-slate-100 text-slate-800 hover:border-[#5ecce3]'}`}
                  >
                    <div className="flex items-center gap-3">
                        <mod.icon size={18} />
                        <span className="text-xs font-black uppercase">{mod.label}</span>
                    </div>
                    {hiddenViews.includes(mod.id) ? <EyeOff size={16} /> : <Eye size={16} className="text-[#5ecce3]" />}
                  </button>
                ))}
              </div>
              <div className="pt-8 border-t border-slate-50">
                 <button onClick={() => handleSubmit()} className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Salvar Alterações de Visibilidade</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;
