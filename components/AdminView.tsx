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
  Copyright
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

const AdminView: React.FC<Props> = ({ settings, onUpdateSettings }) => {
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [logoId, setLogoId] = useState(settings.logoId);
  const [loginHeader, setLoginHeader] = useState(settings.loginHeader);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [footerText, setFooterText] = useState(settings.footerText);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({ companyName, primaryColor, logoId, loginHeader, supportPhone, footerText });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Configurações do Sistema</h2>
        <p className="text-slate-500 font-medium">Gerencie as preferências globais e identidade visual da sua conta.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
              <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Identidade Visual</h3>
                <p className="text-sm text-slate-400 font-medium">Personalize a aparência do seu sistema.</p>
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
                    placeholder="Ex: Minha Empresa LTDA"
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-semibold"
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
                    placeholder="Ex: Portal do Colaborador"
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Phone size={12} /> Telefone de Suporte
                  </label>
                  <input 
                    type="text" 
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    placeholder="Ex: (00) 00000-0000"
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Copyright size={12} /> Créditos do Rodapé
                  </label>
                  <input 
                    type="text" 
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="Ex: Desenvolvido por Minha Empresa"
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 ml-1">Aparece na parte inferior da tela de login.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Palette size={12} /> Cor Primária
                  </label>
                  <div className="flex gap-3">
                    <input 
                      type="color" 
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-12 rounded-xl border-none p-0 cursor-pointer overflow-hidden"
                    />
                    <input 
                      type="text" 
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-mono text-sm uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Gem size={12} /> Logotipo do App
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {AVAILABLE_LOGOS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLogoId(item.id)}
                      className={`
                        aspect-square flex flex-col items-center justify-center rounded-2xl transition-all border-2
                        ${logoId === item.id 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md' 
                          : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}
                      `}
                      title={item.label}
                    >
                      <item.icon size={20} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className={`flex items-center gap-2 text-emerald-600 font-bold text-sm transition-all ${isSaved ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <CheckCircle2 size={18} /> Configurações atualizadas!
              </div>
              <button 
                type="submit"
                className="bg-slate-900 text-white font-black px-8 py-3.5 rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-100 flex items-center gap-2"
              >
                <Save size={20} /> Salvar Alterações
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group" style={{ backgroundColor: primaryColor }}>
            <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Shield size={200} />
            </div>
            <h4 className="text-xl font-black mb-2">Visualização</h4>
            <div className="flex items-center gap-4 bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/20 mb-6">
              <div className="bg-white p-3 rounded-2xl text-indigo-600 shadow-lg" style={{ color: primaryColor }}>
                {(() => {
                  const SelectedIcon = AVAILABLE_LOGOS.find(l => l.id === logoId)?.icon || LayoutGrid;
                  return <SelectedIcon size={28} />;
                })()}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-200">Exemplo:</p>
                <h5 className="text-lg font-bold truncate max-w-[140px]">{companyName}</h5>
              </div>
            </div>
            <p className="text-indigo-100 text-sm font-medium leading-relaxed">
              As alterações no logotipo, cores, cabeçalhos, telefone e créditos serão aplicadas instantaneamente.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info size={12} /> Status da Marca
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs font-bold text-slate-500">Desenvolvedor</span>
                <span className="text-xs font-black text-slate-800 truncate ml-4" title={footerText}>{footerText || 'Não informado'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs font-bold text-slate-500">Suporte</span>
                <span className="text-xs font-black text-slate-800">{supportPhone || 'Não informado'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;