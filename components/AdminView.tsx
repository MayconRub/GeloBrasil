
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
  Terminal,
  QrCode,
  Trash2,
  Plus,
  ShoppingBasket,
  HandCoins,
  MessageCircle
} from 'lucide-react';
import { AppSettings, UserProfile, Product } from '../types';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  users: UserProfile[];
  products: Product[];
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const AdminView: React.FC<Props> = ({ settings, onUpdateSettings, users, products, onUpdateProduct, onDeleteProduct }) => {
  const [activeTab, setActiveTab] = useState<'license' | 'company' | 'visual' | 'users' | 'products'>('license');
  
  const ALL_MODULES = useMemo(() => [
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
  ], []);

  // Estados de Configuração
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [cnpj, setCnpj] = useState(settings.cnpj || '');
  const [pixKey, setPixKey] = useState(settings.pixKey || '');
  const [systemPixKey, setSystemPixKey] = useState(settings.systemPixKey || '');
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone || '');
  const [expirationDate, setExpirationDate] = useState(settings.expirationDate);
  const [hiddenViews, setHiddenViews] = useState<string[]>(settings.hiddenViews || []);
  const [menuOrder, setMenuOrder] = useState<string[]>([]);

  const [newProdName, setNewProdName] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('UN');
  
  const [isSaved, setIsSaved] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setCompanyName(settings.companyName);
    setCnpj(settings.cnpj || '');
    setPixKey(settings.pixKey || '');
    setSystemPixKey(settings.systemPixKey || '');
    setSupportPhone(settings.supportPhone || '');
    setExpirationDate(settings.expirationDate);
    setHiddenViews(settings.hiddenViews || []);
    
    const savedOrder = settings.menuOrder || [];
    const fullOrder = [...savedOrder];
    
    ALL_MODULES.forEach(mod => {
      if (!fullOrder.includes(mod.id)) {
        const adminIdx = fullOrder.indexOf('admin');
        if (adminIdx !== -1) {
          fullOrder.splice(adminIdx, 0, mod.id);
        } else {
          fullOrder.push(mod.id);
        }
      }
    });
    
    setMenuOrder(fullOrder);
  }, [settings, ALL_MODULES]);

  const toggleViewVisibility = (id: string) => {
    const newHidden = hiddenViews.includes(id) ? hiddenViews.filter(v => v !== id) : [...hiddenViews, id];
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsUpdating(true);
    await onUpdateSettings({ ...settings, companyName, cnpj, pixKey, systemPixKey, supportPhone, expirationDate, hiddenViews, menuOrder });
    setIsUpdating(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const formatPhone = (value: string) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.substring(0, 11);
    if (value.length > 10) return value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    else if (value.length > 6) return value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    else if (value.length > 2) return value.replace(/^(\d{2})(\d{0,5}).*/, "($1 $2");
    else if (value.length > 0) return value.replace(/^(\d{0,2}).*/, "($1");
    return value;
  };

  const handleAddProduct = () => {
    if (!newProdName) return;
    onUpdateProduct({ id: crypto.randomUUID(), nome: newProdName.toUpperCase(), unidade: newProdUnit });
    setNewProdName('');
  };

  const isExpired = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate + 'T00:00:00');
    return today > expDate;
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-32 uppercase transition-colors">
      <header className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10 w-full">
          <div className="w-20 h-20 bg-slate-900 dark:bg-slate-800 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shrink-0"><Shield size={40} /></div>
          <div className="min-w-0">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">CENTRAL <span className="text-[#5ecce3]">ADMIN</span></h2>
            <div className="flex items-center gap-2 mt-2"><span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-950 p-1.5 rounded-full border border-slate-100 dark:border-slate-800 leading-none"><Server size={10} className="text-[#5ecce3]" /> v6.5 CLOUD</span></div>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          {isUpdating && <div className="flex items-center gap-2 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 px-4 py-2 rounded-xl text-[9px] font-black animate-pulse border border-sky-100"><Loader2 size={14} className="animate-spin" /> SALVANDO...</div>}
          {isSaved && <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[9px] font-black border border-emerald-100"><CheckCircle2 size={14} /> SUCESSO</div>}
        </div>
      </header>

      <nav className="flex items-center p-1 bg-slate-100/60 dark:bg-slate-950/60 backdrop-blur-md rounded-[2rem] w-full border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: 'license', label: 'Licença', icon: ShieldCheck },
          { id: 'products', label: 'Catálogo', icon: ShoppingBasket },
          { id: 'company', label: 'Empresa', icon: Building2 },
          { id: 'visual', label: 'Navegação', icon: LayoutGrid }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-6 py-4 rounded-[1.6rem] text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg' : 'text-slate-400 dark:text-slate-600'}`}><tab.icon size={16} /> {tab.label}</button>
        ))}
      </nav>

      {activeTab === 'products' && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h5 className="font-black text-slate-900 dark:text-white text-lg uppercase mb-8 flex items-center gap-3"><ShoppingBasket className="text-sky-500" /> Itens Oferecidos</h5>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-10">
                 <div className="md:col-span-7"><input value={newProdName} onChange={e => setNewProdName(e.target.value)} placeholder="NOME DO ITEM (EX: GELO 5KG)" className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-950 border rounded-2xl font-black text-xs outline-none dark:text-white uppercase" /></div>
                 <div className="md:col-span-3"><select value={newProdUnit} onChange={e => setNewProdUnit(e.target.value)} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-950 border rounded-2xl font-black text-[10px] outline-none dark:text-white"><option value="UN">UNIDADE</option><option value="SACO">SACO</option><option value="KG">KG</option><option value="BARRA">BARRA</option></select></div>
                 <button onClick={handleAddProduct} className="md:col-span-2 bg-sky-500 text-white rounded-2xl font-black uppercase shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"><Plus size={20}/> Add</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {products.map(p => (
                   <div key={p.id} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-[1.5rem] border flex items-center justify-between group">
                      <div className="min-w-0"><p className="text-[10px] font-black text-slate-800 dark:text-slate-100 uppercase truncate">{p.nome}</p><p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{p.unidade}</p></div>
                      <button onClick={() => onDeleteProduct(p.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'visual' && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-3">
            {menuOrder.map((moduleId, index) => {
              const modInfo = ALL_MODULES.find(m => m.id === moduleId);
              if (!modInfo) return null;
              const isHidden = hiddenViews.includes(moduleId);
              return (
                <div key={moduleId} className={`flex items-center justify-between p-4 rounded-2xl border ${isHidden ? 'bg-slate-50 dark:bg-slate-950 opacity-50' : 'bg-white dark:bg-slate-900 shadow-sm'}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveMenuItem(index, 'up')} disabled={index === 0} className="text-slate-300 hover:text-sky-500 disabled:opacity-20"><ChevronUp size={16}/></button>
                      <button onClick={() => moveMenuItem(index, 'down')} disabled={index === menuOrder.length - 1} className="text-slate-300 hover:text-sky-500 disabled:opacity-20"><ChevronDown size={16}/></button>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isHidden ? 'bg-slate-100 dark:bg-slate-900' : 'bg-sky-50 dark:bg-sky-900/20 text-sky-500'}`}><modInfo.icon size={18} /></div>
                    <span className="text-[11px] font-black uppercase tracking-tight">{modInfo.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {moduleId !== 'admin' && <button onClick={() => toggleViewVisibility(moduleId)} className={`p-2 rounded-lg transition-all ${isHidden ? 'text-slate-400 bg-slate-100' : 'text-sky-500 bg-sky-50'}`}>{isHidden ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => handleSubmit()} className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black py-6 rounded-3xl uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all mt-10">Salvar Configurações de Menu</button>
        </div>
      )}

      {activeTab === 'license' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className={`p-8 rounded-[2.5rem] border-4 flex flex-col lg:flex-row items-center justify-between gap-6 transition-all duration-700 ${isExpired() ? 'bg-rose-500 border-rose-600 text-white shadow-2xl shadow-rose-200' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-slate-900 dark:bg-slate-800 text-white rounded-[2rem] flex items-center justify-center shadow-xl">
                 {isExpired() ? <Lock size={32} /> : <Unlock size={32} />}
              </div>
              <div>
                <h4 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">Contrato de Uso</h4>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isExpired() ? 'text-rose-100' : 'text-slate-400'}`}>
                  Situação Atual: {isExpired() ? 'LICENÇA EXPIRADA' : 'SISTEMA LIBERADO'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/20 text-sky-500 rounded-2xl flex items-center justify-center">
                    <CalendarDays size={24} />
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Parâmetros de Licença</h5>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Controle de acesso do cliente</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase ml-4">Próximo Vencimento</label>
                  <div className="relative">
                    <CalendarDays size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="date" 
                      value={expirationDate} 
                      onChange={e => setExpirationDate(e.target.value)}
                      className="w-full h-16 pl-14 pr-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-sm outline-none focus:ring-4 focus:ring-sky-50 dark:focus:ring-sky-900/20 dark:text-white transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase ml-4">WhatsApp do Suporte</label>
                  <div className="relative">
                    <MessageCircle size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text" 
                      value={supportPhone} 
                      onChange={e => setSupportPhone(formatPhone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      className="w-full h-16 pl-14 pr-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-sm outline-none focus:ring-4 focus:ring-sky-50 dark:focus:ring-sky-900/20 dark:text-white transition-all shadow-inner"
                    />
                  </div>
                  <p className="text-[7px] font-black text-slate-400 uppercase ml-4 italic">Este número aparecerá no botão da tela de bloqueio.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl flex items-center justify-center">
                    <QrCode size={24} />
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Cópia e Cola PIX</h5>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Para pagamento da licença</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase ml-4">Chave PIX Mensalidade</label>
                  <div className="relative">
                    <QrCode size={20} className="absolute left-5 top-5 text-slate-300" />
                    <textarea 
                      value={systemPixKey} 
                      onChange={e => setSystemPixKey(e.target.value)}
                      placeholder="Cole aqui o código PIX Copia e Cola para ser usado no vencimento..."
                      className="w-full h-40 pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-[9px] outline-none focus:ring-4 focus:ring-sky-50 dark:focus:ring-sky-900/20 dark:text-white transition-all shadow-inner resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => handleSubmit()}
              className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black rounded-2xl shadow-xl flex items-center justify-center gap-4 uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all mt-4"
            >
              <Save size={20} /> Salvar Parâmetros de Licenciamento
            </button>
          </div>
        </div>
      )}

      {activeTab === 'company' && (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase ml-4 flex items-center gap-2"><Building2 size={14} /> Razão Social</label><input type="text" value={companyName} onChange={e => setCompanyName(e.target.value.toUpperCase())} className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-950 border rounded-2xl font-black text-sm outline-none dark:text-white" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase ml-4 flex items-center gap-2"><Fingerprint size={14} /> CNPJ da Unidade</label><input type="text" value={cnpj} onChange={e => setCnpj(e.target.value)} className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-950 border rounded-2xl font-black text-sm outline-none dark:text-white" /></div>
          </div>
          <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase ml-4 flex items-center gap-2"><QrCode size={14} /> Chave PIX Financeiro</label><input type="text" value={pixKey} onChange={e => setPixKey(e.target.value)} className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-950 border rounded-2xl font-bold text-xs outline-none dark:text-white" /></div>
          <button onClick={() => handleSubmit()} className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black py-6 rounded-3xl shadow-xl flex items-center justify-center gap-4 uppercase text-xs tracking-[0.2em] active:scale-95 transition-all">SALVAR DADOS DA EMPRESA</button>
        </div>
      )}
    </div>
  );
};

export default AdminView;
