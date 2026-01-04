
import React, { useMemo, useState, useEffect } from 'react';
import { 
  TrendingUp, Snowflake, ArrowUpRight, ArrowDownRight,
  Plus, Users, Truck, Wallet, ChevronRight,
  Droplets, AlertCircle, Sun, ThermometerSun,
  MapPin, ChevronLeft, Target, ShieldAlert, Timer,
  CircleDollarSign, Receipt, X, QrCode, Copy, Check, MessageCircle, BellOff
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
}

const DashboardView: React.FC<Props> = ({ 
  sales, expenses, production, vehicles, onSwitchView, settings 
}) => {
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');
  const [navDate, setNavDate] = useState(new Date());
  const [weatherData, setWeatherData] = useState<{ tempAtual: string, tempMax: string, impact: string, advice: string, sources: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  
  // Estado para controlar se o alerta deve ser exibido baseado no tempo de pausa
  const [shouldShowAlert, setShouldShowAlert] = useState(false);

  const PIX_CODE = "00020126590014BR.GOV.BCB.PIX0111135244986200222Mensalidade do Sistema5204000053039865406100.005802BR5925MAYCON RUBEM DOS SANTOS P6013MONTES CLAROS622605226rZoYS25kQugjDLBWRKJVs63045E25";
  const DISMISS_KEY = 'renewal_alert_dismissed_at';
  const PAUSE_DURATION = 6 * 60 * 60 * 1000; // 6 Horas em milissegundos
  
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);
  
  const currentMonth = navDate.getMonth();
  const currentYear = navDate.getFullYear();
  const monthName = navDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Verifica se o alerta deve ser exibido ao montar o componente
  useEffect(() => {
    const checkAlertVisibility = () => {
      if (!settings.expirationDate || settings.expirationDate === '2099-12-31') {
        setShouldShowAlert(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expDate = new Date(settings.expirationDate + 'T00:00:00');
      const diffTime = expDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Se não estiver no período de 3 dias, não mostra
      if (daysLeft < 0 || daysLeft > 3) {
        setShouldShowAlert(false);
        return;
      }

      // Verifica se houve um "avisar depois" recente
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (dismissedAt) {
        const lastTime = parseInt(dismissedAt, 10);
        const now = Date.now();
        if (now - lastTime < PAUSE_DURATION) {
          setShouldShowAlert(false);
          return;
        }
      }

      setShouldShowAlert(true);
    };

    checkAlertVisibility();
  }, [settings.expirationDate]);

  const handleDismissAlert = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShouldShowAlert(false);
  };

  const daysUntilExpiration = useMemo(() => {
    if (!settings.expirationDate || settings.expirationDate === '2099-12-31') return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(settings.expirationDate + 'T00:00:00');
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [settings.expirationDate]);

  const hasOilAlert = useMemo(() => {
    return (vehicles || []).some(v => ((v.km_atual || 0) - (v.km_ultima_troca || 0)) >= 1000);
  }, [vehicles]);

  const handlePrevMonth = () => {
    setNavDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setPeriod('monthly');
  };
  
  const handleNextMonth = () => {
    setNavDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setPeriod('monthly');
  };

  const handleResetMonth = () => {
    setNavDate(new Date());
    setPeriod('daily');
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_CODE);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
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

    const topExpense = filteredExps.length > 0 
      ? filteredExps.reduce((prev, curr) => (prev.value > curr.value) ? prev : curr)
      : null;

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
      totalSales, totalExps, totalProd, profit, margin, topExpense,
      salesGoal, prodGoal, chartData, urgentExps
    };
  }, [sales, expenses, production, period, settings, todayStr, currentMonth, currentYear]);

  const fetchWeatherData = async () => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const weatherPrompt = `Busque via Google Search o clima EXATO neste momento em Montes Claros, Minas Gerais. Retorne a temperatura ATUAL e a MÁXIMA prevista para hoje. Baseado nisso, aja como consultor de uma fábrica de gelo e retorne APENAS um JSON com: { "tempAtual": "XX°C", "tempMax": "YY°C", "impact": "+X%", "advice": "frase curta de ação técnica" }.`;
      const weatherResp = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: weatherPrompt,
        config: { 
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });
      
      const parsedWeather = JSON.parse(weatherResp.text || "{}");
      setWeatherData({
        tempAtual: parsedWeather.tempAtual || "23°C",
        tempMax: parsedWeather.tempMax || "32°C",
        impact: parsedWeather.impact || "+15%",
        advice: parsedWeather.advice || "Ajuste a produção ao calor local.",
        sources: weatherResp.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      });
    } catch (e) {
      console.error("Weather Sync Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1500px] mx-auto pb-10">
      
      {/* ALERTA DE VENCIMENTO DE LICENÇA - COM PERSISTÊNCIA DE 6 HORAS */}
      {shouldShowAlert && daysUntilExpiration !== null && (
        <div className="bg-rose-50 border border-rose-100 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-lg shadow-rose-100/20 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 animate-in slide-in-from-top duration-700 relative overflow-hidden">
          {/* Botão de fechar discreto no canto */}
          <button 
            onClick={handleDismissAlert}
            className="absolute top-3 right-3 text-rose-300 hover:text-rose-500 transition-colors p-1"
            title="Lembrar daqui a 6 horas"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3 sm:gap-5 text-center md:text-left flex-col md:flex-row w-full md:w-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-rose-500 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200 shrink-0 animate-bounce">
              <ShieldAlert size={24} className="sm:size-[32px]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-xl font-black text-rose-900 tracking-tighter uppercase leading-none">Renovação Necessária</h3>
              <p className="text-[9px] sm:text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1.5 leading-tight">
                O acesso expira em <span className="text-rose-600 underline font-black">{daysUntilExpiration <= 0 ? 'HOJE' : `${daysUntilExpiration} DIAS`}</span>.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <button 
              onClick={() => setShowPixModal(true)}
              className="w-full md:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-rose-600 text-white rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <QrCode size={16} className="sm:size-[18px]" /> Pagar Agora
            </button>
            <button 
              onClick={handleDismissAlert}
              className="w-full md:w-auto px-4 py-2 text-[8px] sm:text-[9px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-all flex items-center justify-center gap-1"
            >
              <BellOff size={14} /> Avise-me depois (6h)
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className={`flex flex-col gap-4 relative ${showQuickMenu ? 'z-[100]' : 'z-10'}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70 backdrop-blur-xl p-4 rounded-3xl border border-white shadow-xl shadow-sky-100/20 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3 shrink-0">
              <Snowflake size={24} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase leading-none truncate">Minha <span className="text-sky-500">Operação</span></h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">Gelo Brasil • Montes Claros, MG</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {period === 'monthly' && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-300">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-sky-500 transition-all active:scale-90">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={handleResetMonth} className="px-4 py-1 flex flex-col items-center justify-center hover:bg-white rounded-lg transition-all min-w-[100px]">
                  <span className="text-[9px] font-black text-slate-800 uppercase tracking-tight text-center truncate">{monthName}</span>
                </button>
                <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-sky-500 transition-all active:scale-90">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-sm">
              <button 
                onClick={() => setPeriod('daily')} 
                className={`px-4 sm:px-5 py-2 rounded-lg text-[10px] font-black transition-all ${period === 'daily' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
              >
                HOJE
              </button>
              <button 
                onClick={() => setPeriod('monthly')} 
                className={`px-4 sm:px-5 py-2 rounded-lg text-[10px] font-black transition-all ${period === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
              >
                MÊS
              </button>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowQuickMenu(!showQuickMenu)} 
                className="h-10 px-5 bg-sky-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-sky-100"
              >
                <Plus size={16} className={`transition-transform duration-300 ${showQuickMenu ? 'rotate-45' : ''}`} /> LANÇAR
              </button>

              {showQuickMenu && (
                <>
                  <div className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[1px]" onClick={() => setShowQuickMenu(false)} />
                  <div className="fixed sm:absolute top-[180px] sm:top-12 left-1/2 sm:left-auto sm:right-0 -translate-x-1/2 sm:translate-x-0 w-[90%] sm:w-48 bg-white rounded-3xl sm:rounded-2xl shadow-2xl border border-slate-100 p-3 sm:p-2 z-[101] animate-in zoom-in-95 duration-200 origin-top sm:origin-top-right">
                    <div className="sm:hidden text-center mb-3 pb-2 border-b border-slate-50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Selecione uma ação</p>
                    </div>
                    <button 
                      onClick={() => { onSwitchView('sales'); setShowQuickMenu(false); }}
                      className="w-full flex items-center gap-4 sm:gap-3 p-4 sm:p-3 hover:bg-emerald-50 rounded-2xl sm:rounded-xl transition-all group"
                    >
                      <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-xl sm:rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
                        <CircleDollarSign size={20} className="sm:size-[18px]" />
                      </div>
                      <span className="text-xs sm:text-[10px] font-black text-slate-600 uppercase tracking-widest">Lançar Venda</span>
                    </button>
                    <button 
                      onClick={() => { onSwitchView('expenses'); setShowQuickMenu(false); }}
                      className="w-full flex items-center gap-4 sm:gap-3 p-4 sm:p-3 hover:bg-rose-50 rounded-2xl sm:rounded-xl transition-all group mt-1"
                    >
                      <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-xl sm:rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all shrink-0">
                        <Receipt size={20} className="sm:size-[18px]" />
                      </div>
                      <span className="text-xs sm:text-[10px] font-black text-slate-600 uppercase tracking-widest">Lançar Despesa</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-0">
        <SeniorMetric 
          label="Vendas" 
          value={metrics.totalSales} 
          color="emerald" 
          icon={ArrowUpRight} 
          trend={period === 'daily' ? "FECHAMENTO HOJE" : `EM ${monthName.split(' ')[0]}`} 
          goal={metrics.salesGoal}
          showGoalBar
          periodLabel={period === 'daily' ? 'DIÁRIA' : 'MENSUAL'}
        />
        <SeniorMetric 
          label="Despesas" 
          value={metrics.totalExps} 
          color="rose" 
          icon={ArrowDownRight} 
          trend={metrics.topExpense ? `MAIOR: ${metrics.topExpense.description}` : 'SEM SAÍDAS HOJE'}
        />
        <SeniorMetric 
          label="Lucro" 
          value={metrics.profit} 
          color="sky" 
          icon={Wallet} 
          trend={`MARGEM: ${metrics.margin.toFixed(1)}%`}
          isProfit
          margin={metrics.margin}
        />
        <SeniorMetric 
          label="Produção" 
          value={metrics.totalProd} 
          color="indigo" 
          icon={Droplets} 
          unit="KG" 
          trend={period === 'daily' ? "TOTAL PRODUZIDO HOJE" : `EM ${monthName.split(' ')[0]}`} 
          goal={metrics.prodGoal}
          showGoalBar
          periodLabel={period === 'daily' ? 'DIÁRIA' : 'MENSUAL'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-0">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <TrendingUp size={14} className="text-sky-500" /> Fluxo de Caixa (Últimos 7 Lançamentos)
                </h3>
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1">Comparativo Vendas vs Despesas</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-sky-500" />
                  <span className="text-[8px] font-black text-slate-400 uppercase">Vendas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-[8px] font-black text-slate-400 uppercase">Despesas</span>
                </div>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9}} tickFormatter={(val) => `R$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: '900'}}
                    formatter={(value: any) => [`R$ ${value.toLocaleString()}`, '']}
                  />
                  <Area type="monotone" dataKey="vendas" name="Vendas" stroke="#0ea5e9" strokeWidth={4} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#f43f5e" strokeWidth={4} fill="url(#colorExps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex flex-col">
                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.15em] flex items-center gap-2">
                   STATUS FINANCEIRO <span className="text-slate-400 font-bold hidden sm:inline">( VISÃO DE VENCIMENTOS )</span>
                </h3>
              </div>
              <button onClick={() => onSwitchView('expenses')} className="text-[9px] font-black text-sky-500 uppercase tracking-widest bg-sky-50 px-3 py-1.5 rounded-xl hover:bg-sky-500 hover:text-white transition-all shrink-0">Ver Tudo</button>
            </div>
            <div className="divide-y divide-slate-100">
              {metrics.urgentExps.map(exp => (
                <div key={exp.id} className={`p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group ${exp.status === ExpenseStatus.VENCIDO ? 'bg-rose-50/30' : 'bg-white'}`}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`p-3 rounded-2xl shadow-sm transition-transform group-hover:scale-110 shrink-0 ${exp.status === ExpenseStatus.VENCIDO ? 'bg-rose-500 text-white' : 'bg-amber-100 text-amber-600'}`}>
                      {exp.status === ExpenseStatus.VENCIDO ? <ShieldAlert size={20} className="animate-pulse" /> : <Timer size={20} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-black uppercase leading-none truncate max-w-[120px] sm:max-w-none ${exp.status === ExpenseStatus.VENCIDO ? 'text-rose-700' : 'text-slate-700'}`}>{exp.description}</p>
                        <span className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0 ${exp.status === ExpenseStatus.VENCIDO ? 'bg-rose-600 text-white' : 'bg-amber-400 text-white'}`}>
                          {exp.status}
                        </span>
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase flex items-center gap-1.5 truncate">
                         <MapPin size={10} className="text-slate-300 shrink-0" /> Venc. {new Date(exp.dueDate + 'T00:00:00').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-black tracking-tight ${exp.status === ExpenseStatus.VENCIDO ? 'text-rose-600' : 'text-amber-600'}`}>R$ {exp.value.toLocaleString()}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                       <span className={`w-1.5 h-1.5 rounded-full ${exp.status === ExpenseStatus.VENCIDO ? 'bg-rose-500 animate-ping' : 'bg-amber-400'}`} />
                       <p className="text-[7px] font-black text-slate-300 uppercase tracking-tighter italic">Pendente</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 relative z-0">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 relative overflow-hidden group">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <MapPin size={12} className="text-sky-500" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Agora em Montes Claros</p>
                </div>
                <Sun className="text-amber-400 animate-spin-slow" size={20} />
             </div>
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                   <ThermometerSun size={28} />
                </div>
                <div>
                   <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-black text-slate-800 leading-none">{isLoading ? "--" : weatherData?.tempAtual}</p>
                      <span className="text-[9px] font-black text-slate-300 uppercase">Agora</span>
                   </div>
                   <p className={`text-[9px] font-black uppercase tracking-tight mt-1 ${weatherData?.impact.includes('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
                     Máxima hoje: <span className="text-slate-700">{weatherData?.tempMax}</span> • Impacto: {weatherData?.impact}
                   </p>
                </div>
             </div>
             <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase">
                {isLoading ? "Consultando clima do Norte de Minas..." : weatherData?.advice}
             </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CompactAction 
              label="FROTA" 
              icon={Truck} 
              color={hasOilAlert ? "bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-200" : "bg-slate-100 text-slate-600"} 
              onClick={() => onSwitchView('fleet')} 
            />
            <CompactAction label="EQUIPE" icon={Users} color="bg-slate-100 text-slate-600" onClick={() => onSwitchView('team')} />
          </div>
        </div>
      </div>

      {/* MODAL DE PAGAMENTO PIX - OTIMIZADO PARA NÃO ESTOURAR EM MOBILE */}
      {showPixModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-[3.5rem] p-6 sm:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col items-center max-h-[95vh] overflow-y-auto">
              <button 
                onClick={() => setShowPixModal(false)}
                className="absolute top-4 right-4 sm:top-8 sm:right-8 text-slate-300 hover:text-rose-500 transition-colors z-20"
              >
                <X size={24} className="sm:size-[28px]" />
              </button>

              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-500 text-white rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-sky-100 mb-4 sm:mb-6 shrink-0 mt-4 sm:mt-0">
                <QrCode size={32} className="sm:size-[36px]" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tighter uppercase mb-2 text-center">Renovação de Acesso</h3>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 text-center max-w-xs mb-6 sm:mb-8 uppercase tracking-widest leading-relaxed">
                Escaneie o código abaixo ou copie a chave para realizar o pagamento.
              </p>

              <div className="bg-sky-50 p-4 sm:p-6 rounded-3xl mb-6 sm:mb-8 border border-sky-100 shrink-0">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(PIX_CODE)}`} 
                  alt="PIX QR Code" 
                  className="w-40 h-40 sm:w-48 sm:h-48 rounded-xl"
                />
              </div>

              <div className="w-full space-y-4 pb-4">
                <button 
                  onClick={handleCopyPix}
                  className={`w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 rounded-xl sm:rounded-2xl border transition-all active:scale-95 group ${copiedPix ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100 hover:border-sky-200'}`}
                >
                  <div className="flex flex-col items-start overflow-hidden mr-4">
                    <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest ${copiedPix ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {copiedPix ? 'Copiado!' : 'PIX Copia e Cola'}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-700 truncate w-full text-left">
                      {PIX_CODE}
                    </span>
                  </div>
                  {copiedPix ? <Check size={18} className="text-emerald-500 shrink-0" /> : <Copy size={18} className="text-slate-300 group-hover:text-sky-500 shrink-0" />}
                </button>

                <div className="bg-emerald-50/50 p-4 rounded-xl sm:rounded-2xl border border-emerald-100 text-center">
                   <p className="text-[8px] sm:text-[9px] font-black text-emerald-700 uppercase leading-relaxed">
                      Após o pagamento, envie o comprovante para o suporte para liberação imediata.
                   </p>
                </div>

                <a 
                  href={`https://wa.me/${settings.supportPhone?.replace(/\D/g, '') || '5538998289668'}`} 
                  target="_blank"
                  className="w-full flex items-center justify-center gap-3 py-4 sm:py-5 bg-emerald-500 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 hover:brightness-105 transition-all"
                >
                  <MessageCircle size={18} /> Enviar Comprovante
                </a>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

/* COMPONENTES INTERNOS AUXILIARES */

const SeniorMetric = ({ label, value, icon: Icon, color, isProfit, margin, unit, trend, goal, showGoalBar, periodLabel }: any) => {
  const themes: any = {
    emerald: "text-emerald-500 bg-emerald-50/70 border-emerald-100/50 fill-emerald-500",
    rose: "text-rose-500 bg-rose-50/70 border-rose-100/50 fill-rose-500",
    sky: "text-sky-500 bg-sky-50/70 border-sky-100/50 fill-sky-500",
    indigo: "text-indigo-500 bg-indigo-50/70 border-indigo-100/50 fill-indigo-500"
  };

  const progress = goal > 0 ? (value / goal) * 100 : 0;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-[2.2rem] border border-slate-100 shadow-sm hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between min-h-[140px] overflow-hidden relative">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${themes[color]}`}>
             <Icon size={16} />
          </div>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-lg sm:text-xl font-black text-slate-800 tracking-tighter leading-none truncate w-full">
            {unit ? `${value.toLocaleString()}${unit}` : `R$ ${value.toLocaleString()}`}
          </span>
          {trend && !showGoalBar && (
            <div className={`mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border shadow-sm w-fit max-w-full mx-auto ${themes[color]}`}>
               <AlertCircle size={10} className="animate-pulse shrink-0" />
               <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tight truncate">
                  {trend}
               </span>
            </div>
          )}
        </div>
      </div>

      {isProfit && (
        <div className="mt-4 flex flex-col items-center gap-1.5">
           <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, margin)}%` }} />
           </div>
           <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter italic">MARGEM DO PERÍODO</span>
        </div>
      )}

      {showGoalBar && goal && (
        <div className="mt-4 sm:mt-5 space-y-2.5">
          <div className="flex items-center justify-center gap-2">
             <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full ${themes[color]} border shadow-sm max-w-full`}>
                <Target size={10} className="animate-pulse shrink-0" />
                <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tight truncate">
                   {progress.toFixed(0)}% META {periodLabel}
                </span>
             </div>
          </div>
          <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
             <div 
               className={`h-full transition-all duration-1000 ${color === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
               style={{ width: `${Math.min(100, progress)}%` }} 
             />
          </div>
        </div>
      )}
    </div>
  );
};

const CompactAction = ({ label, icon: Icon, color, onClick }: any) => (
  <button onClick={onClick} className={`${color} p-5 sm:p-6 rounded-[2.2rem] flex flex-col items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-sm border border-white/50 group w-full`}>
    <Icon size={24} className="group-hover:text-sky-500 transition-colors shrink-0" />
    <span className="text-[9px] font-black tracking-widest uppercase truncate w-full text-center">{label}</span>
  </button>
);

export default DashboardView;
