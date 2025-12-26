
import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Save, 
  Building2, 
  Palette, 
  CheckCircle2, 
  LayoutGrid, 
  Zap, 
  Rocket, 
  Target, 
  Award, 
  Briefcase, 
  Building, 
  Gem, 
  Globe, 
  Heart,
  Store,
  Wallet,
  Snowflake,
  Box,
  Phone,
  Clock,
  Unlock,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  CircleDollarSign,
  Receipt,
  Users,
  Truck,
  Megaphone,
  Key,
  MapPin,
  Fingerprint,
  Info,
  MessageCircle,
  AlertTriangle,
  QrCode
} from 'lucide-react';
import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onOpenPayment?: () => void;
}

const AVAILABLE_LOGOS = [
  { id: 'LayoutGrid', icon: LayoutGrid, label: 'Moderno' },
  { id: 'Zap', icon: Zap, label: 'Energia' },
  { id: 'Rocket', icon: Rocket, label: 'Crescimento' },
  { id: 'Target', icon: Target, label: 'Foco' },
  { id: 'Briefcase', icon: Briefcase, label: 'Negócios' },
  { id: 'Building', icon: Building, label: 'Estrutura' },
  { id: 'Store', icon: Store, label: 'Comércio' },
  { id: 'Wallet', icon: Wallet, label: 'Financeiro' },
  { id: 'Award', icon: Award, label: 'Premium' },
  { id: 'Gem', icon: Gem, label: 'Joia' },
  { id: 'Globe', icon: Globe, label: 'Global' },
  { id: 'Heart', icon: Heart, label: 'Social' },
  { id: 'Snowflake', icon: Snowflake, label: 'Gelo' },
  { id: 'Box', icon: Box, label: 'Cubo de Gelo' }
];

const MENU_PAGES = [
  { id: 'production', label: 'Produção', icon: Snowflake },
  { id: 'sales', label: 'Vendas', icon: CircleDollarSign },
  { id: 'expenses', label: 'Despesas', icon: Receipt },
  { id: 'team', label: 'Equipe', icon: Users },
  { id: 'fleet', label: 'Frota', icon: Truck },
];

const AdminView: React.FC<Props> = ({ settings, onUpdateSettings, onOpenPayment }) => {
  const [activeTab, setActiveTab] = useState<'license' | 'company' | 'visual'>('license');
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
  const [renewDays, setRenewDays] = useState(30);
  const [isSaved, setIsSaved] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleViewVisibility = (id: string) => {
    setHiddenViews(prev => 
      prev.includes(id) 
        ? prev.filter(v => v !== id) 
        : [...prev, id]
    );
  };

  const daysUntilExpiration = useMemo(() => {
    if (!expirationDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate + 'T00:00:00');
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [expirationDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      dashboardNotice 
    });
    setIsUpdating(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSetBlock = async () => {
    const pastDate = '2000-01-01';
    setExpirationDate(pastDate);
    setIsUpdating(true);
    await onUpdateSettings({ ...settings, expirationDate: pastDate });
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
    await onUpdateSettings({ ...settings, expirationDate: dateStr });
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
    <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Shield className="text-indigo-600" size={32} />
            Painel Master
          </h2>
          <p className="text-slate-500 font-medium">Controle administrativo do ecossistema.</p>
        </div>
        <div className="flex items-center gap-3">
           {isUpdating && (
            <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black animate-pulse border border-indigo-100">
              <Clock size={14} className="animate-spin" /> SINCRONIZANDO...
            </div>
          )}
          {isSaved && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black border border-emerald-100">
              <CheckCircle2 size={14} /> ALTERAÇÕES GRAVADAS
            </div>
          )}
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="flex items-center p-1.5 bg-slate-200/50 rounded-[2rem] w-fit overflow-x-auto no-scrollbar shadow-inner border border-slate-300/30">
        <button 
          onClick={() => setActiveTab('license')}
          className={`flex items-center gap-2.5 px-8 py-3.5 rounded-[1.5rem] text-xs font-black transition-all whitespace-nowrap uppercase tracking-widest relative ${activeTab === 'license' ? 'bg-white text-indigo-600 shadow-xl border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Key size={18} /> Licenciamento
          {isExpiringSoon && <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2.5 px-8 py-3.5 rounded-[1.5rem] text-xs font-black transition-all whitespace-nowrap uppercase tracking-widest ${activeTab === 'company' ? 'bg-white text-indigo-600 shadow-xl border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Building2 size={18} /> Dados da Empresa
        </button>
        <button 
          onClick={() => setActiveTab('visual')}
          className={`flex items-center gap-2.5 px-8 py-3.5 rounded-[1.5rem] text-xs font-black transition-all whitespace-nowrap uppercase tracking-widest ${activeTab === 'visual' ? 'bg-white text-indigo-600 shadow-xl border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Palette size={18} /> Identidade & Módulos
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-12 rounded-[3rem] border border-slate-200 shadow-sm space-y-10">
            
            {/* TAB: LICENCIAMENTO */}
            {activeTab === 'license' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-5">
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transition-colors ${isExpired() ? 'bg-rose-500 text-white' : isExpiringSoon ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-500 text-white'}`}>
                        {isExpired() ? <Lock size={32} /> : isExpiringSoon ? <AlertTriangle size={32} /> : <Unlock size={32} />}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Status do Acesso</h4>
                        <p className={`text-xs font-bold ${isExpired() ? 'text-rose-500' : isExpiringSoon ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {isExpired() ? 'Licença Expirada' : isExpiringSoon ? `Expira em ${daysUntilExpiration} dias!` : `Ativo até ${new Date(expirationDate + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button" 
                        onClick={() => onOpenPayment && onOpenPayment()}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black transition-all shadow-lg hover:bg-indigo-700 uppercase tracking-widest flex items-center gap-2"
                      >
                        <QrCode size={16} /> Renovar Assinatura
                      </button>
                      <button 
                        type="button" 
                        onClick={handleSetBlock}
                        className="text-rose-600 bg-rose-50 hover:bg-rose-100 px-6 py-3 rounded-2xl text-[10px] font-black transition-all border border-rose-100 uppercase tracking-widest"
                      >
                        Bloquear
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Zap size={14} className="text-amber-500" /> Renovação Rápida
                      </p>
                      <div className="flex flex-col gap-3">
                        <input 
                          type="number" 
                          value={renewDays}
                          onChange={(e) => setRenewDays(parseInt(e.target.value) || 0)}
                          placeholder="Dias"
                          className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-xl font-black outline-none focus:ring-4 focus:ring-indigo-50"
                        />
                        <button 
                          type="button"
                          onClick={handleRenewCustomDays}
                          className="h-14 w-full bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl uppercase text-xs tracking-widest"
                        >
                          Adicionar Dias <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Phone size={14} className="text-sky-500" /> Canal de Suporte
                      </p>
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          value={supportPhone} 
                          onChange={e => setSupportPhone(e.target.value)} 
                          placeholder="Ex: WhatsApp ou Link"
                          className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-50" 
                        />
                        <p className="text-[9px] text-slate-400 font-medium italic">Visível na tela de login.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DADOS DA EMPRESA */}
            {activeTab === 'company' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1.5"><Building2 size={12} /> Razão Social</label>
                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1.5"><Fingerprint size={12} /> CNPJ</label>
                    <input type="text" value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1.5"><MapPin size={12} /> Endereço Completo</label>
                  <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, Número, Bairro, Cidade - UF" className="w-full h-32 p-6 bg-slate-50 border border-slate-200 rounded-2xl font-semibold outline-none focus:ring-4 focus:ring-indigo-50 resize-none text-sm" />
                </div>
                <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                   <Info className="text-indigo-600 shrink-0" size={20} />
                   <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">Dados utilizados em cabeçalhos de relatórios e documentos internos do sistema.</p>
                </div>
              </div>
            )}

            {/* TAB: IDENTIDADE & MÓDULOS */}
            {activeTab === 'visual' && (
              <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1.5"><Palette size={12} /> Cor do Sistema</label>
                    <div className="flex gap-4">
                      <div className="w-14 h-14 shrink-0 rounded-2xl border-4 border-white shadow-xl relative overflow-hidden group">
                        <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer" />
                      </div>
                      <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1 h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-sm font-black uppercase" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1.5"><Gem size={12} /> Ícone da Marca</label>
                    <div className="grid grid-cols-7 gap-2">
                      {AVAILABLE_LOGOS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setLogoId(item.id)}
                          className={`aspect-square flex items-center justify-center rounded-xl border-2 transition-all ${logoId === item.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 bg-slate-50 text-slate-300 hover:border-slate-300'}`}
                        >
                          <item.icon size={18} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1.5"><Eye size={12} /> Visibilidade de Módulos</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {MENU_PAGES.map(page => (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => toggleViewVisibility(page.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${hiddenViews.includes(page.id) ? 'bg-slate-50 border-slate-200 text-slate-300' : 'bg-white border-indigo-100 text-slate-700 shadow-sm'}`}
                      >
                        <div className="flex items-center gap-3">
                          <page.icon size={18} className={hiddenViews.includes(page.id) ? 'text-slate-300' : 'text-indigo-500'} />
                          <span className="text-[11px] font-black uppercase tracking-tight">{page.label}</span>
                        </div>
                        {hiddenViews.includes(page.id) ? <EyeOff size={14} /> : <Eye size={14} className="text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1.5"><Megaphone size={12} /> Mural do Dashboard</label>
                    <textarea value={dashboardNotice} onChange={e => setDashboardNotice(e.target.value)} placeholder="Aviso global para os usuários..." className="w-full h-32 p-6 bg-slate-50 border border-slate-200 rounded-2xl font-semibold outline-none focus:ring-4 focus:ring-indigo-50 resize-none text-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* BOTÃO SALVAR GLOBAL */}
            <div className="pt-10 border-t border-slate-100 flex items-center justify-end">
              <button 
                type="submit"
                disabled={isUpdating}
                className="bg-slate-900 text-white font-black px-12 py-5 rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl flex items-center gap-3 disabled:opacity-50 uppercase text-xs tracking-[0.2em]"
              >
                <Save size={20} /> {isUpdating ? 'SINCRONIZANDO...' : 'Gravar Alterações'}
              </button>
            </div>
          </form>
        </div>

        {/* SIDEBAR DE PREVIEW */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-8 overflow-hidden">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4">Prévia em Tempo Real</h4>
            
            <div className="space-y-10">
               {/* Login Preview Card */}
               <div className="p-6 bg-slate-950 rounded-[2rem] border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                     <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20" style={{ backgroundColor: primaryColor }}>
                        {(() => {
                          const SelectedIcon = AVAILABLE_LOGOS.find(l => l.id === logoId)?.icon || LayoutGrid;
                          return <SelectedIcon size={24} />;
                        })()}
                     </div>
                     <div className="min-w-0">
                        <p className="text-white font-black text-sm truncate">{companyName || 'Sua Empresa'}</p>
                        <p className="text-indigo-400/60 font-black text-[8px] uppercase tracking-widest">Acesso ao Sistema</p>
                     </div>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-500 w-1/3"></div>
                  </div>
               </div>

               {/* Holerite Preview */}
               <div className="p-6 bg-white border-2 border-dashed border-slate-100 rounded-[2rem] space-y-4">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Visualização de Endereço</p>
                  <div className="text-[9px] font-bold text-slate-700 leading-tight space-y-1">
                    <p className="font-black uppercase text-indigo-600">{companyName || 'NOME DA EMPRESA'}</p>
                    <p className="uppercase">{address || 'RUA EXEMPLO, 123 - CIDADE'}</p>
                    <p className="text-slate-400">CNPJ: {cnpj || '00.000.000/0000-00'}</p>
                  </div>
               </div>

               {/* Notice Preview */}
               <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-[2rem] flex items-start gap-3">
                  <Megaphone className="text-amber-500 shrink-0" size={18} />
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Mural Dashboard</p>
                    <p className="text-[10px] font-bold text-slate-600 truncate">{dashboardNotice || 'Sem avisos.'}</p>
                  </div>
               </div>

               {/* Support Link Preview */}
               {supportPhone && (
                 <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl flex items-center gap-3">
                   <MessageCircle className="text-sky-500" size={18} />
                   <div className="min-w-0">
                     <p className="text-[9px] font-black text-sky-600 uppercase tracking-widest mb-0.5">Link de Suporte</p>
                     <p className="text-[10px] font-bold text-slate-600 truncate">{supportPhone}</p>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
