
import React, { useState } from 'react';
import { 
  Shield, 
  Save, 
  Building2, 
  Palette, 
  Info, 
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
  Smile, 
  Heart,
  Store,
  Wallet,
  Snowflake,
  Box,
  TextCursor,
  Phone,
  Copyright,
  CalendarDays,
  Clock,
  Unlock,
  Plus,
  TestTube2,
  AlertTriangle,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  CircleDollarSign,
  Receipt,
  Users,
  Truck
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
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [logoId, setLogoId] = useState(settings.logoId);
  const [loginHeader, setLoginHeader] = useState(settings.loginHeader);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [footerText, setFooterText] = useState(settings.footerText);
  const [expirationDate, setExpirationDate] = useState(settings.expirationDate);
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
    await onUpdateSettings({ companyName, primaryColor, logoId, loginHeader, supportPhone, footerText, expirationDate, hiddenViews });
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
      hiddenViews
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
      hiddenViews
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Painel Master</h2>
          <p className="text-slate-500 font-medium">Controle de licenciamento e visibilidade.</p>
        </div>
        {isUpdating && (
          <div className="flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-xs font-black animate-pulse">
            <Clock size={14} className="animate-spin" /> SINCRONIZANDO...
          </div>
        )}
      </header>

      {/* Subscription Control Card */}
      <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
          <Shield size={180} />
        </div>
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isExpired() ? 'bg-rose-500/20 text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)]' : 'bg-emerald-500/20 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]'} border border-current transition-all duration-500`}>
                {isExpired() ? <Lock size={32} /> : <Unlock size={32} />}
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  {isExpired() ? 'Acesso Bloqueado' : 'Acesso Liberado'}
                </h3>
                <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg w-fit mt-1">
                  <CalendarDays size={14} />
                  Banco: {new Date(expirationDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleSetBlock}
                className="bg-rose-600/20 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-600/30 px-6 py-4 rounded-2xl transition-all flex flex-col items-center justify-center gap-1 group/block"
              >
                <Lock size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Bloquear Agora</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md">
            <div className="flex flex-col gap-2 w-full sm:w-36">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Dias de Acesso</label>
              <input 
                type="number" 
                min="0"
                value={renewDays}
                onChange={(e) => setRenewDays(parseInt(e.target.value) || 0)}
                className="w-full h-16 bg-slate-900 border border-white/20 rounded-2xl text-center text-3xl font-black outline-none focus:ring-2 focus:ring-sky-500 transition-all text-white"
              />
            </div>

            <button 
              onClick={handleRenewCustomDays}
              className="w-full sm:w-auto h-20 px-10 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-3xl shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-4 group/btn overflow-hidden"
            >
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] opacity-70 uppercase tracking-[0.2em] leading-none mb-1">Confirmar Dias</span>
                <span className="text-xl leading-none">Liberar Sistema</span>
              </div>
              <ArrowRight size={24} className="group-hover/btn:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 shadow-inner">
                <Shield size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Identidade e Visibilidade</h3>
                <p className="text-sm text-slate-400 font-medium tracking-tight">Personalize o que o usuário vê.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Building2 size={12} /> Nome da Empresa
                  </label>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <TextCursor size={12} /> Cabeçalho de Login
                  </label>
                  <input 
                    type="text" 
                    value={loginHeader}
                    onChange={(e) => setLoginHeader(e.target.value)}
                    className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-semibold"
                  />
                </div>

                {/* VISIBILIDADE DE PÁGINAS */}
                <div className="pt-4 space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Eye size={12} /> Visibilidade das Páginas
                  </label>
                  <div className="space-y-2">
                    {MENU_PAGES.map(page => (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => toggleViewVisibility(page.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${hiddenViews.includes(page.id) ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-indigo-100 text-slate-700 shadow-sm'}`}
                      >
                        <div className="flex items-center gap-3">
                          <page.icon size={16} />
                          <span className="text-sm font-bold tracking-tight">{page.label}</span>
                        </div>
                        {hiddenViews.includes(page.id) ? <EyeOff size={16} /> : <Eye size={16} className="text-indigo-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Palette size={12} /> Cor Primária
                  </label>
                  <div className="flex gap-4">
                    <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-100">
                      <input 
                        type="color" 
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="absolute inset-0 w-[150%] h-[150%] translate-x-[-25%] translate-y-[-25%] cursor-pointer"
                      />
                    </div>
                    <input 
                      type="text" 
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-sm uppercase font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Gem size={12} /> Logotipo
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {AVAILABLE_LOGOS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setLogoId(item.id)}
                        className={`aspect-square flex items-center justify-center rounded-2xl border-2 transition-all ${logoId === item.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-50 bg-slate-50/50 text-slate-300 hover:border-slate-200'}`}
                      >
                        <item.icon size={24} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className={`flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest transition-all ${isSaved ? 'opacity-100' : 'opacity-0'}`}>
                <CheckCircle2 size={18} /> Salvo!
              </div>
              <button 
                type="submit"
                disabled={isUpdating}
                className="bg-slate-900 text-white font-black px-10 py-4 rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 shadow-xl flex items-center gap-3 disabled:opacity-50"
              >
                <Save size={20} /> {isUpdating ? 'Salvando...' : 'Salvar Tudo'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Prévia do App</h4>
            <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <div className="bg-white p-4 rounded-2xl text-white shadow-xl" style={{ backgroundColor: primaryColor }}>
                {(() => {
                  const SelectedIcon = AVAILABLE_LOGOS.find(l => l.id === logoId)?.icon || LayoutGrid;
                  return <SelectedIcon size={32} />;
                })()}
              </div>
              <div className="min-w-0">
                <h5 className="text-xl font-black text-slate-800 truncate leading-none">{companyName}</h5>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ativo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
