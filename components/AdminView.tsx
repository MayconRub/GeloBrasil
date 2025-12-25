
import React, { useState } from 'react';
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
  TextCursor,
  Phone,
  CalendarDays,
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
  Code2,
  Settings2,
  Key
} from 'lucide-react';
import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
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

const AdminView: React.FC<Props> = ({ settings, onUpdateSettings }) => {
  const [activeTab, setActiveTab] = useState<'licensing' | 'branding' | 'system'>('licensing');
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [logoId, setLogoId] = useState(settings.logoId);
  const [loginHeader, setLoginHeader] = useState(settings.loginHeader);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    await onUpdateSettings({ companyName, primaryColor, logoId, loginHeader, supportPhone, footerText, expirationDate, hiddenViews, dashboardNotice });
    setIsUpdating(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSetBlock = async () => {
    const pastDate = '2000-01-01';
    setExpirationDate(pastDate);
    setIsUpdating(true);
    await onUpdateSettings({ 
      companyName, 
      primaryColor, 
      logoId, 
      loginHeader, 
      supportPhone, 
      footerText, 
      expirationDate: pastDate,
      hiddenViews,
      dashboardNotice
    });
    setIsUpdating(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleRenewCustomDays = async () => {
    setIsUpdating(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let newExp: Date;
    if (renewDays === 0) {
      newExp = new Date(today.getTime() - (24 * 60 * 60 * 1000));
    } else {
      newExp = new Date(today.getTime() + (renewDays * 24 * 60 * 60 * 1000));
    }
    
    const dateStr = `${newExp.getFullYear()}-${String(newExp.getMonth() + 1).padStart(2, '0')}-${String(newExp.getDate()).padStart(2, '0')}`;
    setExpirationDate(dateStr);
    
    await onUpdateSettings({ 
      companyName, 
      primaryColor, 
      logoId, 
      loginHeader, 
      supportPhone, 
      footerText, 
      expirationDate: dateStr,
      hiddenViews,
      dashboardNotice
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
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Painel Master</h2>
          <p className="text-slate-500 font-medium">Controle total de licença e visual.</p>
        </div>
        {isUpdating && (
          <div className="flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-xs font-black animate-pulse">
            <Clock size={14} className="animate-spin" /> SINCRONIZANDO...
          </div>
        )}
      </header>

      {/* Internal Navigation Tabs */}
      <div className="flex items-center p-1 bg-slate-200/50 rounded-2xl w-fit overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('licensing')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === 'licensing' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Key size={18} /> Licenciamento
        </button>
        <button 
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === 'branding' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Palette size={18} /> Identidade & Visual
        </button>
        <button 
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === 'system' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Settings2 size={18} /> Sistema & Suporte
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            
            {/* TAB CONTENT: LICENSING */}
            {activeTab === 'licensing' && (
              <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 shadow-inner">
                    <Shield size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Status da Licença</h3>
                    <p className="text-sm text-slate-400 font-medium">Controle de validade e bloqueios.</p>
                  </div>
                </div>

                <div className={`p-8 rounded-[2rem] border-2 transition-all duration-500 ${isExpired() ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isExpired() ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'}`}>
                        {isExpired() ? <Lock size={28} /> : <Unlock size={28} />}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 uppercase tracking-tight">Sistema {isExpired() ? 'Bloqueado' : 'Liberado'}</h4>
                        <p className="text-xs font-bold text-slate-500">Expira em: {new Date(expirationDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={handleSetBlock}
                      className="text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-xl text-xs font-black transition-all border border-rose-200"
                    >
                      FORÇAR BLOQUEIO
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4 bg-white/50 p-6 rounded-2xl border border-white">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dias para Adicionar</label>
                      <input 
                        type="number" 
                        value={renewDays}
                        onChange={(e) => setRenewDays(parseInt(e.target.value) || 0)}
                        className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl text-2xl font-black outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={handleRenewCustomDays}
                      className="h-14 px-8 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl"
                    >
                      Renovar Acesso <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: BRANDING */}
            {activeTab === 'branding' && (
              <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="bg-amber-50 p-4 rounded-2xl text-amber-600 shadow-inner">
                    <Palette size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Marca e Cores</h3>
                    <p className="text-sm text-slate-400 font-medium">Personalize a identidade visual.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Building2 size={12} /> Nome da Empresa</label>
                      <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl font-semibold outline-none focus:ring-4 focus:ring-indigo-50" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Palette size={12} /> Cor Primária</label>
                      <div className="flex gap-4">
                        <div className="w-14 h-14 shrink-0 rounded-2xl border-2 border-slate-100 relative overflow-hidden">
                          <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer" />
                        </div>
                        <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1 h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-sm font-black uppercase" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Gem size={12} /> Logotipo do Sistema</label>
                    <div className="grid grid-cols-4 gap-2.5">
                      {AVAILABLE_LOGOS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setLogoId(item.id)}
                          className={`aspect-square flex items-center justify-center rounded-2xl border-2 transition-all ${logoId === item.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-50 bg-slate-50 text-slate-300 hover:border-slate-200'}`}
                          title={item.label}
                        >
                          <item.icon size={22} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Eye size={12} /> Páginas Visíveis</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {MENU_PAGES.map(page => (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => toggleViewVisibility(page.id)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${hiddenViews.includes(page.id) ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-indigo-100 text-slate-700 shadow-sm'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <page.icon size={16} />
                          <span className="text-[11px] font-black tracking-tight">{page.label}</span>
                        </div>
                        {hiddenViews.includes(page.id) ? <EyeOff size={14} /> : <Eye size={14} className="text-indigo-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SYSTEM & SUPPORT */}
            {activeTab === 'system' && (
              <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="bg-sky-50 p-4 rounded-2xl text-sky-600 shadow-inner">
                    <Megaphone size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Comunicação e Suporte</h3>
                    <p className="text-sm text-slate-400 font-medium">Informações de apoio e rodapé.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><TextCursor size={12} /> Texto de Login</label>
                      <input type="text" value={loginHeader} onChange={e => setLoginHeader(e.target.value)} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl font-semibold outline-none focus:ring-4 focus:ring-indigo-50" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Phone size={12} /> Telefone Suporte</label>
                      <input type="text" value={supportPhone} onChange={e => setSupportPhone(e.target.value)} placeholder="(00) 00000-0000" className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl font-semibold outline-none focus:ring-4 focus:ring-indigo-50" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Code2 size={12} /> Créditos / Rodapé</label>
                      <input 
                        type="text" 
                        value={footerText} 
                        onChange={e => setFooterText(e.target.value)} 
                        placeholder="Desenvolvido por Sua Empresa"
                        className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl font-semibold outline-none focus:ring-4 focus:ring-indigo-50" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Megaphone size={12} /> Aviso do Dashboard</label>
                    <textarea 
                      value={dashboardNotice} 
                      onChange={e => setDashboardNotice(e.target.value)} 
                      placeholder="Deixe um recado para os usuários..."
                      className="w-full h-[228px] p-6 bg-slate-50 border border-slate-200 rounded-2xl font-semibold outline-none focus:ring-4 focus:ring-indigo-50 resize-none text-sm" 
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className={`flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest transition-all ${isSaved ? 'opacity-100' : 'opacity-0'}`}>
                <CheckCircle2 size={18} /> Configurações Salvas!
              </div>
              <button 
                type="submit"
                disabled={isUpdating}
                className="bg-slate-900 text-white font-black px-12 py-4 rounded-[1.5rem] hover:bg-indigo-600 transition-all active:scale-95 shadow-xl flex items-center gap-3 disabled:opacity-50"
              >
                <Save size={20} /> {isUpdating ? 'Salvando...' : 'Salvar Tudo'}
              </button>
            </div>
          </form>
        </div>

        {/* PREVIEW PANEL */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-8">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Prévia Instantânea</h4>
            
            <div className="space-y-8">
              <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="p-4 rounded-2xl text-white shadow-xl flex items-center justify-center shrink-0" style={{ backgroundColor: primaryColor }}>
                  {(() => {
                    const SelectedIcon = AVAILABLE_LOGOS.find(l => l.id === logoId)?.icon || LayoutGrid;
                    return <SelectedIcon size={32} />;
                  })()}
                </div>
                <div className="min-w-0">
                  <h5 className="text-xl font-black text-slate-800 truncate leading-none">{companyName || 'Sua Empresa'}</h5>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Painel Ativo</p>
                </div>
              </div>

              {footerText && (
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Rodapé do Sistema:</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                    <Code2 size={14} className="text-indigo-400" />
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider truncate max-w-[150px]">{footerText}</span>
                  </div>
                </div>
              )}

              {dashboardNotice && (activeTab === 'system') && (
                <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-3xl relative overflow-hidden group">
                  <Megaphone size={40} className="absolute -right-2 -bottom-2 text-indigo-100 -rotate-12 group-hover:rotate-0 transition-transform" />
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Preview do Aviso:</p>
                  <p className="text-indigo-900 text-xs font-bold leading-relaxed relative z-10">{dashboardNotice}</p>
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
