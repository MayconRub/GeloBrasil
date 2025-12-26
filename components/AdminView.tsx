
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
  QrCode,
  TrendingUp,
  DollarSign
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
  const [productionGoalDaily, setProductionGoalDaily] = useState(settings.productionGoalDaily || 1000);
  const [productionGoalMonthly, setProductionGoalMonthly] = useState(settings.productionGoalMonthly || 30000);
  const [salesGoalDaily, setSalesGoalDaily] = useState(settings.salesGoalDaily || 2000);
  const [salesGoalMonthly, setSalesGoalMonthly] = useState(settings.salesGoalMonthly || 60000);
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
                  </div>
                </div>
              </div>
            )}

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-sky-50 p-6 rounded-3xl border border-sky-100 space-y-6">
                    <h5 className="text-[11px] font-black text-sky-900 uppercase tracking-widest flex items-center gap-2 border-b border-sky-200 pb-3">
                      <Target size={16} className="text-sky-600" /> Meta de Produção (KG)
                    </h5>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-sky-400 uppercase tracking-widest ml-2">Meta Padrão Mensal</label>
                        <input type="number" value={productionGoalMonthly} onChange={e => setProductionGoalMonthly(parseInt(e.target.value) || 0)} className="w-full h-12 px-6 bg-white border border-sky-100 rounded-2xl font-black outline-none" />
                        <p className="text-[8px] text-slate-400 mt-1 font-bold">* Usada se não houver meta específica para o mês.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 space-y-6">
                    <h5 className="text-[11px] font-black text-emerald-900 uppercase tracking-widest flex items-center gap-2 border-b border-emerald-200 pb-3">
                      <DollarSign size={16} className="text-emerald-600" /> Metas de Vendas (R$)
                    </h5>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-2">Meta Diária</label>
                        <input type="number" value={salesGoalDaily} onChange={e => setSalesGoalDaily(parseInt(e.target.value) || 0)} className="w-full h-12 px-6 bg-white border border-emerald-100 rounded-2xl font-black outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-2">Meta Padrão Mensal</label>
                        <input type="number" value={salesGoalMonthly} onChange={e => setSalesGoalMonthly(parseInt(e.target.value) || 0)} className="w-full h-12 px-6 bg-white border border-emerald-100 rounded-2xl font-black outline-none" />
                        <p className="text-[8px] text-slate-400 mt-1 font-bold">* Usada se não houver meta específica para o mês.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1.5"><MapPin size={12} /> Endereço</label>
                  <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full h-24 p-6 bg-slate-50 border border-slate-200 rounded-2xl font-semibold outline-none resize-none text-sm" />
                </div>
              </div>
            )}

            {activeTab === 'visual' && (
              <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1.5"><Palette size={12} /> Cor Primária</label>
                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-full h-14 p-1 bg-white border border-slate-200 rounded-2xl cursor-pointer" />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-10 border-t border-slate-100 flex items-center justify-end">
              <button 
                type="submit"
                disabled={isUpdating}
                className="bg-slate-900 text-white font-black px-12 py-5 rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl flex items-center gap-3 disabled:opacity-50 uppercase text-xs tracking-[0.2em]"
              >
                <Save size={20} /> {isUpdating ? 'Salvando...' : 'Gravar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
