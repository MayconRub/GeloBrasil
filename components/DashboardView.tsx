
import React, { useMemo, useState, useEffect } from 'react';
import { 
  TrendingUp, Snowflake, ArrowUpRight, ArrowDownRight,
  Plus, Users, Truck, Wallet, ChevronRight,
  Droplets, AlertCircle, Sun, ThermometerSun,
  MapPin, ChevronLeft, Target, ShieldAlert, Timer,
  CircleDollarSign, Receipt, X, QrCode, Copy, Check, MessageCircle, BellOff,
  Save,
  DollarSign
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Sale, Expense, ViewType, Production, AppSettings, ExpenseStatus, Vehicle } from '../types';
import { GoogleGenAI } from '@google/genai';

interface Props {
  sales: Sale[];
  expenses: Expense[];
  production: Production[];
  vehicles: Vehicle[];
  onSwitchView: (view: ViewType) => void;
  settings: AppSettings;
  onAddSale: (sale: Sale) => void;
}

const DashboardView: React.FC<Props> = ({ 
  sales, expenses, production, vehicles, onSwitchView, settings, onAddSale 
}) => {
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');
  const [navDate, setNavDate] = useState(new Date());
  const [weatherData, setWeatherData] = useState<{ tempAtual: string, tempMax: string, impact: string, advice: string, sources: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickSale, setShowQuickSale] = useState(false);
  const [quickSaleValue, setQuickSaleValue] = useState('');
  
  const [shouldShowAlert, setShouldShowAlert] = useState(false);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);
  
  const currentMonth = navDate.getMonth();
  const currentYear = navDate.getFullYear();

  const handleQuickSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(quickSaleValue.replace(',', '.'));
    if (isNaN(val)) return;
    onAddSale({
      id: crypto.randomUUID(),
      value: val,
      date: todayStr,
      description: 'VENDA DIÁRIA (LANÇAMENTO RÁPIDO)'
    });
    setQuickSaleValue('');
    setShowQuickSale(false);
  };

  const metrics = useMemo(() => {
    const isToday = (d: string) => d === todayStr;
    const isSelectedMonth = (d: string) => {
      const [year, month] = d.split('-').map(Number);
      return (month - 1) === currentMonth && year === currentYear;
    };

    const periodFilter = period === 'daily' ? isToday : isSelectedMonth;

    const filteredSales = sales.filter(s => periodFilter(s.date));
    const filteredExps = expenses.filter(e => periodFilter(e.dueDate));
    const filteredProd = production.filter(p => periodFilter(p.date));

    const totalSales = filteredSales.reduce((acc, s) => acc + s.value, 0);
    const totalExps = filteredExps.reduce((acc, e) => acc + e.value, 0);
    const totalProd = filteredProd.reduce((acc, p) => acc + p.quantityKg, 0);
    const profit = totalSales - totalExps;
    const margin = totalSales > 0 ? (profit / totalSales) * 100 : 0;

    const salesGoal = period === 'daily' ? (settings.salesGoalDaily || 2000) : (settings.salesGoalMonthly || 60000);
    const prodGoal = period === 'daily' ? (settings.productionGoalDaily || 1000) : (settings.productionGoalMonthly || 30000);

    const allUniqueDates = Array.from(new Set([
      ...sales.map(s => s.date),
      ...expenses.map(e => e.dueDate)
    ])).sort().slice(-7);

    const chartData = allUniqueDates.map(date => {
      const daySales = sales.filter(s => s.date === date).reduce((sum, s) => sum + s.value, 0);
      const dayExpenses = expenses.filter(e => e.dueDate === date).reduce((sum, e) => sum + e.value, 0);
      return {
        name: new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        vendas: daySales,
        despesas: dayExpenses
      };
    });

    const urgentExps = expenses
      .filter(e => e.status !== ExpenseStatus.PAGO)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 4);

    return {
      totalSales, totalExps, totalProd, profit, margin,
      salesGoal, prodGoal, chartData, urgentExps
    };
  }, [sales, expenses, production, period, settings, todayStr, currentMonth, currentYear]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const weatherPrompt = `Busque via Google Search o clima EXATO neste momento em Montes Claros, Minas Gerais. Retorne a temperatura ATUAL e a MÁXIMA prevista para hoje. Retorne APENAS um JSON: { "tempAtual": "XX°C", "tempMax": "YY°C", "impact": "+X%", "advice": "frase curta" }.`;
        const weatherResp = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: weatherPrompt,
          config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const parsedWeather = JSON.parse(weatherResp.text || "{}");
        setWeatherData({
          tempAtual: parsedWeather.tempAtual || "23°C",
          tempMax: parsedWeather.tempMax || "32°C",
          impact: parsedWeather.impact || "+15%",
          advice: parsedWeather.advice || "Ajuste a produção ao calor local.",
          sources: []
        });
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };
    fetchWeatherData();
  }, []);

  return (
    <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto pb-12">
      
      {/* Header View */}
      <div className="flex flex-col gap-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/80 backdrop-blur-xl p-5 sm:p-6 rounded-[2.5rem] border border-white shadow-2xl shadow-sky-100/30">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl rotate-3 shrink-0"><Snowflake size={28} className="animate-pulse" /></div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">Visão <span className="text-sky-500">{period === 'daily' ? 'Diária' : 'Mensal'}</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">{period === 'daily' ? 'Operação em Tempo Real' : 'Consolidado do Período'}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
              <button onClick={() => setPeriod('daily')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all duration-300 ${period === 'daily' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>HOJE</button>
              <button onClick={() => setPeriod('monthly')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all duration-300 ${period === 'monthly' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>MÊS</button>
            </div>
            <button onClick={() => setShowQuickSale(true)} className="h-12 px-6 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-emerald-100 active:scale-95">
               <DollarSign size={18} /> LANÇAR VENDA
            </button>
          </div>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-0">
        <SeniorMetric label="Receita" value={metrics.totalSales} color="emerald" icon={ArrowUpRight} goal={metrics.salesGoal} showGoalBar periodLabel={period === 'daily' ? 'DIA' : 'MÊS'} />
        <SeniorMetric label="Saídas" value={metrics.totalExps} color="rose" icon={ArrowDownRight} trend="Status Financeiro" />
        <SeniorMetric label="Líquido" value={metrics.profit} color="sky" icon={Wallet} isProfit margin={metrics.margin} />
        <SeniorMetric label="Volume" value={metrics.totalProd} color="indigo" icon={Droplets} unit="KG" goal={metrics.prodGoal} showGoalBar periodLabel={period === 'daily' ? 'DIA' : 'MÊS'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Gráfico Analítico */}
          <div className="bg-white p-6 sm:p-10 rounded-[3rem] border border-slate-50 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3"><TrendingUp size={16} className="text-sky-500" /> Histórico de Caixa</h3>
              <div className="flex items-center gap-5 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-sky-500" /><span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Vendas</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Gastos</span></div>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorExps" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9}} tickFormatter={(val) => `R$${val/1000}k`} />
                  <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: '900'}} formatter={(val: any) => [`R$ ${val.toLocaleString()}`, '']} />
                  <Area type="monotone" dataKey="vendas" name="Vendas" stroke="#0ea5e9" strokeWidth={5} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#f43f5e" strokeWidth={5} fill="url(#colorExps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Listagem de Vencimentos (P&L rápido) */}
          <div className="bg-white rounded-[3rem] border border-slate-50 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/40">
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">Contas Pendentes</h3>
              <button onClick={() => onSwitchView('expenses')} className="text-[10px] font-black text-sky-500 uppercase tracking-widest bg-sky-50 px-5 py-2.5 rounded-xl hover:bg-sky-500 hover:text-white transition-all">Ver Financeiro</button>
            </div>
            <div className="divide-y divide-slate-50">
              {metrics.urgentExps.length === 0 ? (
                <div className="p-10 text-center text-[10px] font-black text-slate-300 uppercase italic tracking-widest">Tudo em dia!</div>
              ) : (
                metrics.urgentExps.map(exp => (
                  <div key={exp.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl shadow-sm ${exp.status === ExpenseStatus.VENCIDO ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-100 text-amber-600'}`}>
                        {exp.status === ExpenseStatus.VENCIDO ? <ShieldAlert size={22} /> : <Timer size={22} />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase leading-none">{exp.description}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Vence {new Date(exp.dueDate + 'T00:00:00').toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-slate-800">R$ {exp.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><MapPin size={14} className="text-sky-500" /><p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Clima Local</p></div>
                <Sun className="text-amber-400 animate-spin-slow" size={24} />
             </div>
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-amber-50 rounded-[1.8rem] flex items-center justify-center text-amber-600 shrink-0"><ThermometerSun size={32} /></div>
                <div>
                   <div className="flex items-baseline gap-3"><p className="text-3xl font-black text-slate-800 leading-none">{isLoading ? "--" : weatherData?.tempAtual}</p><span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Atual</span></div>
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-tight mt-2">Máxima: <span className="text-slate-700">{weatherData?.tempMax}</span></p>
                </div>
             </div>
             <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100"><p className="text-[10px] font-bold text-slate-600 leading-relaxed uppercase">{isLoading ? "Consultando..." : weatherData?.advice}</p></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onSwitchView('fleet')} className="bg-white p-6 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 hover:scale-105 transition-all shadow-sm border border-slate-50">
              <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center"><Truck size={24} /></div>
              <span className="text-[9px] font-black tracking-widest uppercase text-slate-400">FROTA</span>
            </button>
            <button onClick={() => onSwitchView('team')} className="bg-white p-6 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 hover:scale-105 transition-all shadow-sm border border-slate-50">
              <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center"><Users size={24} /></div>
              <span className="text-[9px] font-black tracking-widest uppercase text-slate-400">EQUIPE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Lançamento Rápido de Venda */}
      {showQuickSale && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowQuickSale(false)} />
           <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setShowQuickSale(false)} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500"><X size={24} /></button>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><DollarSign size={28} /></div>
                <div><h3 className="text-xl font-black text-slate-800 uppercase leading-none">Lançar Venda</h3><p className="text-[9px] font-black text-slate-400 mt-2 uppercase">Receita de Hoje</p></div>
              </div>
              <form onSubmit={handleQuickSaleSubmit} className="space-y-6">
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-xl">R$</span>
                  <input autoFocus type="text" value={quickSaleValue} onChange={e => setQuickSaleValue(e.target.value)} placeholder="0,00" className="w-full h-20 pl-16 pr-6 bg-slate-50 border border-slate-100 rounded-3xl font-black text-2xl outline-none focus:ring-4 focus:ring-emerald-50 transition-all" />
                </div>
                <button type="submit" className="w-full h-16 bg-emerald-500 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-100 active:scale-95">Confirmar Recebimento</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const SeniorMetric = ({ label, value, icon: Icon, color, isProfit, margin, unit, goal, showGoalBar, periodLabel }: any) => {
  const themes: any = {
    emerald: "text-emerald-500 bg-emerald-50/60 border-emerald-100 shadow-emerald-50/50",
    rose: "text-rose-500 bg-rose-50/60 border-rose-100 shadow-rose-50/50",
    sky: "text-sky-500 bg-sky-50/60 border-sky-100 shadow-sky-50/50",
    indigo: "text-indigo-500 bg-indigo-50/60 border-indigo-100 shadow-indigo-50/50"
  };
  const progress = goal > 0 ? (value / goal) * 100 : 0;
  return (
    <div className="bg-white p-6 sm:p-7 rounded-[2.5rem] border border-slate-50 shadow-sm hover:scale-[1.03] transition-all flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{label}</span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${themes[color]}`}><Icon size={18} /></div>
        </div>
        <div className="flex flex-col"><span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tighter truncate">{unit ? `${value.toLocaleString()}${unit}` : `R$ ${value.toLocaleString()}`}</span></div>
      </div>
      {isProfit && (
        <div className="mt-5 space-y-2.5"><div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, margin)}%` }} /></div><span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic text-center block">Margem: {margin.toFixed(1)}%</span></div>
      )}
      {showGoalBar && goal && (
        <div className="mt-5 space-y-3"><div className="flex items-center justify-center"><span className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-tight ${themes[color]}`}>{progress.toFixed(0)}% Meta {periodLabel}</span></div><div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ${color === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(100, progress)}%` }} /></div></div>
      )}
    </div>
  );
};

export default DashboardView;
