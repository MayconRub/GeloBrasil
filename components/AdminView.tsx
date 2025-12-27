
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
  UserCircle
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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-32">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-xl">
            <Shield size={28} />
          </div>
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tighter leading-none">Painel Master</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Central de Controle de Licença</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           {isUpdating && (
            <div className="flex items-center gap-2 bg-sky-50 text-sky-600 px-5 py-2.5 rounded-full text-[10px] font-black animate-pulse border border-sky-100">
              <Loader2 size={14} className="animate-spin" /> SALVANDO...
            </div>
          )}
          {isSaved && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-full text-[10px] font-black border border-emerald-100">
              <CheckCircle2 size={14} /> DADOS SINCRONIZADOS
            </div>
          )}
        </div>
      </header>

      <div className="flex items-center p-1.5 bg-slate-200/40 rounded-[1.8rem] w-fit overflow-x-auto no-scrollbar border border-slate-200 shadow-inner backdrop-blur-sm">
        {[
          { id: 'license', label: 'Segurança & Licença', icon: ShieldCheck },
          { id: 'users', label: 'Usuários Registrados', icon: Users },
          { id: 'company', label: 'Institucional', icon: Building2 },
          { id: 'visual', label: 'Módulos & Visual', icon: Palette }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2.5 px-8 py-3.5 rounded-[1.4rem] text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-xl border border-slate-100' : 'text-slate-400 hover:text-slate-700'}`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 leading-none">Usuários do Sistema</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lista de e-mails autenticados</p>
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                        <th className="px-6 py-4">Usuário / E-mail</th>
                        <th className="px-6 py-4">Data de Cadastro</th>
                        <th className="px-6 py-4">Último Acesso</th>
                        <th className="px-6 py-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">Nenhum perfil de usuário encontrado.</td>
                        </tr>
                      ) : (
                        users.map(user => (
                          <tr key={user.id} className="hover:bg-sky-50/20 transition-all">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                                  <UserCircle size={18} />
                                </div>
                                <span className="text-xs font-black text-slate-800">{user.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[10px] font-bold text-slate-500">
                               {new Date(user.created_at).toLocaleString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 text-[10px] font-bold text-slate-400 italic">
                               {user.last_login ? new Date(user.last_login).toLocaleString('pt-BR') : 'Sem registro'}
                            </td>
                            <td className="px-6 py-4 text-center">
                               <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase border border-emerald-100">Ativo</span>
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

        {activeTab === 'license' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className={`p-10 rounded-[3rem] border-4 flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-700 ${isExpired() ? 'bg-rose-500 border-rose-600 text-white shadow-2xl shadow-rose-200' : isExpiringSoon ? 'bg-amber-400 border-amber-500 text-white shadow-2xl shadow-amber-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
              <div className="flex items-center gap-8 text-center md:text-left flex-col md:flex-row">
                <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-2xl backdrop-blur-md animate-in zoom-in duration-1000 ${isExpired() || isExpiringSoon ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                  {isExpired() ? <Lock size={48} /> : isExpiringSoon ? <AlertTriangle size={48} /> : <Unlock size={48} />}
                </div>
                <div>
                  <h4 className="text-3xl font-black uppercase tracking-tighter leading-none mb-3">Vigência da Licença</h4>
                  <p className={`text-sm font-black uppercase tracking-[0.2em] opacity-80 ${isExpired() || isExpiringSoon ? 'text-white' : 'text-emerald-600'}`}>
                    {isExpired() ? 'ACESSO SUSPENSO IMEDIATAMENTE' : isExpiringSoon ? `ATENÇÃO: EXPIRA EM ${daysUntilExpiration} DIAS` : `SISTEMA LIBERADO ATÉ ${new Date(expirationDate + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                 <button 
                   onClick={handleSetBlock}
                   disabled={isUpdating}
                   className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95 ${isExpired() ? 'bg-white/10 text-white border border-white/20 cursor-not-allowed opacity-50' : 'bg-rose-700 text-white hover:bg-rose-900'}`}
                 >
                   <UserX size={20} /> Bloquear agora
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-inner">
                    <Zap size={28} />
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 text-lg uppercase tracking-tight">Renovação</h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adicionar dias de acesso</p>
                  </div>
                </div>
                
                <div className="flex items-stretch gap-3">
                  <div className="relative flex-1">
                    <input 
                      type="number" 
                      value={renewDays} 
                      onChange={e => setRenewDays(parseInt(e.target.value) || 0)}
                      className="w-full h-16 px-8 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-black text-2xl text-slate-900 outline-none focus:ring-4 focus:ring-sky-100 transition-all"
                    />
                  </div>
                  <button 
                    onClick={handleRenewCustomDays}
                    disabled={isUpdating}
                    className="px-10 bg-sky-600 text-white font-black rounded-[1.5rem] hover:bg-sky-700 transition-all shadow-xl shadow-sky-100 active:scale-95 text-[11px] uppercase tracking-widest"
                  >
                    Renovar
                  </button>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-3xl bg-slate-50 text-slate-600 flex items-center justify-center shadow-inner">
                    <CalendarDays size={28} />
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 text-lg uppercase tracking-tight">Data de Corte</h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Definir vencimento fixo</p>
                  </div>
                </div>
                
                <div className="flex items-stretch gap-3">
                  <input 
                    type="date" 
                    value={expirationDate} 
                    onChange={e => setExpirationDate(e.target.value)}
                    className="flex-1 h-16 px-8 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-black text-sm outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase"
                  />
                  <button 
                    onClick={() => handleSubmit()}
                    disabled={isUpdating}
                    className="px-10 bg-slate-900 text-white font-black rounded-[1.5rem] hover:bg-slate-800 transition-all shadow-xl active:scale-95 text-[11px] uppercase tracking-widest"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              <div className="bg-indigo-900 p-10 rounded-[3rem] border border-indigo-950 shadow-2xl shadow-indigo-200/40 space-y-8 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-3xl bg-white/10 flex items-center justify-center text-white">
                    <Fingerprint size={28} />
                  </div>
                  <div>
                    <h5 className="font-black text-white text-lg uppercase tracking-tight">Auth Service</h5>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Gestão Supabase Identity</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-[11px] font-medium leading-relaxed text-indigo-100">
                    As senhas são gerenciadas pelo serviço do Supabase. Acesse o dashboard para gerenciar credenciais.
                  </p>
                  <a 
                    href="https://supabase.com/dashboard" 
                    target="_blank" 
                    className="flex items-center justify-center gap-3 w-full py-4 bg-white text-indigo-900 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-sky-400 transition-all"
                  >
                    Abrir Painel <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'company' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2"><Building2 size={14} /> Nome da Licença (Empresa)</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ex: Gelo Brasil LTDA" className="w-full h-14 px-8 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2"><Fingerprint size={14} /> Cadastro Nacional (CNPJ)</label>
                  <input type="text" value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" className="w-full h-14 px-8 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-sky-50 p-10 rounded-[2.5rem] border border-sky-100 space-y-8">
                  <h5 className="text-[11px] font-black text-sky-900 uppercase tracking-widest flex items-center gap-3 border-b border-sky-200/50 pb-5">
                    <Target size={20} className="text-sky-600" /> Metas Operacionais KG
                  </h5>
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-sky-400 uppercase tracking-widest ml-4">Meta Mensal Padrão</label>
                      <input type="number" value={productionGoalMonthly} onChange={e => setProductionGoalMonthly(parseInt(e.target.value) || 0)} className="w-full h-14 px-8 bg-white border border-sky-100 rounded-2xl font-black outline-none focus:ring-4 focus:ring-sky-200" />
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 p-10 rounded-[2.5rem] border border-emerald-100 space-y-8">
                  <h5 className="text-[11px] font-black text-emerald-900 uppercase tracking-widest flex items-center gap-3 border-b border-emerald-200/50 pb-5">
                    <DollarSign size={20} className="text-emerald-600" /> Metas Comerciais R$
                  </h5>
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-4">Meta de Venda Mensal</label>
                      <input type="number" value={salesGoalMonthly} onChange={e => setSalesGoalMonthly(parseInt(e.target.value) || 0)} className="w-full h-14 px-8 bg-white border border-emerald-100 rounded-2xl font-black outline-none focus:ring-4 focus:ring-emerald-200" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                 <button 
                  onClick={() => handleSubmit()}
                  disabled={isUpdating}
                  className="bg-slate-900 text-white font-black px-14 py-5 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-2xl flex items-center gap-4 uppercase text-[11px] tracking-[0.2em]"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Salvar Mudanças
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'visual' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-1 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-xl">
                    <Palette size={28} />
                  </div>
                  <h5 className="font-black text-slate-900 text-lg uppercase tracking-tight">Identidade</h5>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Cor Temática</label>
                    <div className="flex items-center gap-5 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                      <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-16 h-16 p-1 bg-white border border-slate-200 rounded-2xl cursor-pointer" />
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{primaryColor}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Paleta de Destaque</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-inner">
                      <LayoutGrid size={28} />
                    </div>
                    <div>
                      <h5 className="font-black text-slate-900 text-lg uppercase tracking-tight">Módulos Ativos</h5>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Controle de menus</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { id: 'sales', label: 'Vendas', icon: DollarSign },
                    { id: 'expenses', label: 'Despesas', icon: Receipt },
                    { id: 'production', label: 'Produção', icon: Snowflake },
                    { id: 'team', label: 'Equipe', icon: Users },
                    { id: 'fleet', label: 'Frota/Frota', icon: Truck }
                  ].map(mod => (
                    <button 
                      key={mod.id}
                      type="button"
                      onClick={() => toggleViewVisibility(mod.id)}
                      className={`flex items-center justify-between p-5 rounded-[1.8rem] border-2 transition-all active:scale-95 ${hiddenViews.includes(mod.id) ? 'bg-rose-50 border-rose-100 text-rose-400' : 'bg-slate-50 border-slate-100 text-slate-800 hover:bg-white hover:border-sky-200 shadow-sm'}`}
                    >
                       <div className="flex items-center gap-3">
                          <mod.icon size={18} className={hiddenViews.includes(mod.id) ? 'opacity-30' : 'text-slate-900'} />
                          <span className="text-[11px] font-black uppercase tracking-tight">{mod.label}</span>
                       </div>
                       {hiddenViews.includes(mod.id) ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex justify-end p-8 bg-white rounded-[2.5rem] border border-slate-200">
              <button 
                onClick={() => handleSubmit()}
                disabled={isUpdating}
                className="bg-slate-900 text-white font-black px-14 py-5 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-2xl flex items-center gap-4 uppercase text-[11px] tracking-[0.2em]"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Confirmar Mudanças
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;
