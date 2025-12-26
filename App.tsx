
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CircleDollarSign, 
  Receipt, 
  Users, 
  Truck, 
  Loader2,
  Snowflake,
  Shield,
  BarChartHorizontal,
  Menu,
  X
} from 'lucide-react';
import { 
  fetchAllData, syncSale, syncExpense, syncEmployee, syncVehicle, syncCategory, syncSettings, AppData, syncProduction, syncMonthlyGoal,
  deleteSale, deleteExpense, deleteProduction, deleteEmployee, deleteVehicle, deleteCategory
} from './store';
import { ViewType, Sale, Expense, Employee, Vehicle, Production, MonthlyGoal } from './types';
import DashboardView from './components/DashboardView';
import SalesView from './components/SalesView';
import ProductionView from './components/ProductionView';
import ExpensesView from './components/ExpensesView';
import TeamView from './components/TeamView';
import FleetView from './components/FleetView';
import AdminView from './components/AdminView';
import CashFlowView from './components/CashFlowView';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [data, setData] = useState<AppData>({
    sales: [], expenses: [], employees: [], vehicles: [], production: [], monthlyGoals: [], categories: [],
    settings: { 
      companyName: 'Ice Control', cnpj: '', address: '', primaryColor: '#0ea5e9', logoId: 'Snowflake', 
      loginHeader: '', supportPhone: '', footerText: '', expirationDate: '2099-12-31', 
      hiddenViews: [], dashboardNotice: '', productionGoalDaily: 1000, productionGoalMonthly: 30000,
      salesGoalDaily: 2000, salesGoalMonthly: 60000
    }
  });

  useEffect(() => {
    const init = async () => {
      try {
        const remoteData = await fetchAllData();
        setData(remoteData);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const wrap = (fn: any) => async (payload: any) => {
    await fn(payload);
    const remoteData = await fetchAllData();
    setData(remoteData);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'sales', label: 'Vendas', icon: CircleDollarSign },
    { id: 'expenses', label: 'Despesas', icon: Receipt },
    { id: 'production', label: 'Produção', icon: Snowflake },
    { id: 'cashflow', label: 'Caixa', icon: BarChartHorizontal },
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'fleet', label: 'Frota', icon: Truck },
    { id: 'admin', label: 'Admin', icon: Shield },
  ];

  if (isLoading) return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-sky-500 mb-4" size={40} />
      <p className="text-[10px] font-black text-sky-600 uppercase tracking-[0.3em]">Preparando Gelo...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fafc] text-slate-800">
      
      {/* Header Mobile */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-lg sticky top-0 z-[100] border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-100">
            <Snowflake size={16} />
          </div>
          <span className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">{data.settings.companyName}</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-400">
          <Menu size={24} />
        </button>
      </header>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-100 py-10 px-4 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-4 mb-12">
          <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-xl shadow-sky-100">
            <Snowflake size={20} />
          </div>
          <h1 className="text-xs font-black uppercase tracking-tight leading-none">{data.settings.companyName}</h1>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewType)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${view === item.id ? 'bg-sky-600 text-white shadow-xl shadow-sky-100' : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50'}`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-8 py-6 lg:py-10 max-w-7xl mx-auto w-full">
        {view === 'dashboard' && <DashboardView {...data} onSwitchView={setView} expirationDate={data.settings.expirationDate} onOpenPayment={() => {}} />}
        {view === 'sales' && <SalesView sales={data.sales} onUpdate={wrap(syncSale)} onDelete={wrap(deleteSale)} settings={data.settings} monthlyGoals={data.monthlyGoals} onUpdateMonthlyGoal={wrap(syncMonthlyGoal)} />}
        {view === 'expenses' && <ExpensesView expenses={data.expenses} categories={data.categories} vehicles={data.vehicles} employees={data.employees} onUpdate={wrap(syncExpense)} onDelete={wrap(deleteExpense)} onUpdateCategories={wrap(syncCategory)} onDeleteCategory={wrap(deleteCategory)} />}
        {view === 'production' && <ProductionView settings={data.settings} production={data.production} monthlyGoals={data.monthlyGoals} onUpdate={wrap(syncProduction)} onDelete={wrap(deleteProduction)} onUpdateMonthlyGoal={wrap(syncMonthlyGoal)} onUpdateSettings={wrap(syncSettings)} />}
        {view === 'cashflow' && <CashFlowView sales={data.sales} expenses={data.expenses} />}
        {view === 'team' && <TeamView employees={data.employees} onUpdate={wrap(syncEmployee)} onDelete={wrap(deleteEmployee)} companyName={data.settings.companyName} />}
        {view === 'fleet' && <FleetView vehicles={data.vehicles} onUpdate={wrap(syncVehicle)} onDelete={wrap(deleteVehicle)} />}
        {view === 'admin' && <AdminView settings={data.settings} onUpdateSettings={wrap(syncSettings)} />}
      </main>

      {/* Bottom Bar Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-3 flex items-center justify-around z-[100] shadow-[0_-8px_30px_rgba(0,0,0,0.04)] rounded-t-[2rem]">
        {menuItems.slice(0, 4).map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewType)}
            className={`flex flex-col items-center gap-1.5 transition-all ${view === item.id ? 'text-sky-600' : 'text-slate-300'}`}
          >
            <item.icon size={20} className={view === item.id ? 'stroke-[2.5px]' : ''} />
            <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
        <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-1.5 text-slate-300">
          <Menu size={20} />
          <span className="text-[8px] font-black uppercase tracking-tighter">Mais</span>
        </button>
      </nav>

      {/* Overlay Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[110] animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute bottom-6 left-4 right-4 bg-white rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex items-center justify-between mb-8 px-2">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Navegação Completa</h3>
               <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
               {menuItems.map(item => (
                 <button
                   key={item.id}
                   onClick={() => { setView(item.id as ViewType); setIsMobileMenuOpen(false); }}
                   className={`flex items-center gap-3 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${view === item.id ? 'bg-sky-50 border-sky-100 text-sky-600 shadow-sm' : 'bg-slate-50 border-transparent text-slate-500'}`}
                 >
                   <item.icon size={18} /> {item.label}
                 </button>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
