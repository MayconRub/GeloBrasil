
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CircleDollarSign, Receipt, Users, Truck, Loader2, Snowflake, Shield, Menu, X, Lock, PhoneCall, LogOut } from 'lucide-react';
import { supabase } from './supabaseClient';
import { fetchAllData, syncSale, syncExpense, syncEmployee, syncVehicle, syncCategory, syncSettings, AppData, syncProduction, syncMonthlyGoal, syncCategoriesOrder, syncFuel, syncMaintenance, syncFine, deleteSale, deleteExpense, deleteProduction, deleteEmployee, deleteVehicle, deleteCategory, deleteFuel, deleteMaintenance, deleteFine } from './store';
import { ViewType, Sale, Expense, Employee, Vehicle, Production, MonthlyGoal, FuelLog, MaintenanceLog, FineLog } from './types';
import DashboardView from './components/DashboardView';
import SalesView from './components/SalesView';
import ProductionView from './components/ProductionView';
import ExpensesView from './components/ExpensesView';
import TeamView from './components/TeamView';
import FleetView from './components/FleetView';
import AdminView from './components/AdminView';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AppData>({
    sales: [], expenses: [], employees: [], vehicles: [], fuelLogs: [], maintenanceLogs: [], fineLogs: [], production: [], monthlyGoals: [], categories: [], users: [],
    settings: { companyName: 'ICE CONTROL', primaryColor: '#0ea5e9', logoId: 'Snowflake', loginHeader: 'ADMIN', supportPhone: '', footerText: '', expirationDate: '2099-12-31', hiddenViews: [] }
  });

  useEffect(() => { loadAppData(); }, []);

  const loadAppData = async () => {
    try { setIsLoading(true); const remoteData = await fetchAllData(); setData(remoteData); } 
    catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const wrap = (fn: any) => async (payload: any) => {
    const result = await fn(payload);
    if (result?.error) { alert("ERRO: " + result.error.message.toUpperCase()); return; }
    loadAppData();
  };

  const menuItems = [
    { id: 'dashboard', label: 'INÍCIO', icon: LayoutDashboard },
    { id: 'sales', label: 'VENDAS', icon: CircleDollarSign },
    { id: 'expenses', label: 'DESPESAS', icon: Receipt },
    { id: 'production', label: 'PRODUÇÃO', icon: Snowflake },
    { id: 'team', label: 'EQUIPE', icon: Users },
    { id: 'fleet', label: 'FROTA', icon: Truck },
    { id: 'admin', label: 'ADMIN', icon: Shield },
  ].filter(item => !data.settings.hiddenViews.includes(item.id));

  if (isLoading) return <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center"><Loader2 className="animate-spin text-sky-500 mb-4" size={40} /><p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">CARREGANDO...</p></div>;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fafc] uppercase">
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r py-10 px-4 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-4 mb-12">
          <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-xl"><Snowflake size={20} /></div>
          <h1 className="text-xs font-black uppercase tracking-tight truncate">{data.settings.companyName.toUpperCase()}</h1>
        </div>
        <nav className="flex-1 space-y-1">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id as ViewType)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${view === item.id ? 'bg-sky-600 text-white shadow-xl' : 'text-slate-400 hover:bg-sky-50'}`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 px-4 sm:px-8 py-6 lg:py-10 max-w-7xl mx-auto w-full">
        {view === 'dashboard' && <DashboardView {...data} onSwitchView={setView} expirationDate={data.settings.expirationDate} onOpenPayment={() => {}} settings={data.settings} />}
        {view === 'sales' && <SalesView sales={data.sales} onUpdate={wrap(syncSale)} onDelete={wrap(deleteSale)} settings={data.settings} monthlyGoals={data.monthlyGoals} onUpdateMonthlyGoal={wrap(syncMonthlyGoal)} />}
        {view === 'production' && <ProductionView settings={data.settings} production={data.production} monthlyGoals={data.monthlyGoals} onUpdate={wrap(syncProduction)} onDelete={wrap(deleteProduction)} onUpdateMonthlyGoal={wrap(syncMonthlyGoal)} onUpdateSettings={wrap(syncSettings)} />}
        {view === 'expenses' && <ExpensesView expenses={data.expenses} categories={data.categories} vehicles={data.vehicles} employees={data.employees} onUpdate={wrap(syncExpense)} onDelete={wrap(deleteExpense)} onUpdateCategories={wrap(syncCategory)} onDeleteCategory={wrap(deleteCategory)} onReorderCategories={wrap(syncCategoriesOrder)} />}
        {view === 'team' && <TeamView employees={data.employees} onUpdate={wrap(syncEmployee)} onDelete={wrap(deleteEmployee)} companyName={data.settings.companyName} />}
        {view === 'fleet' && <FleetView 
            vehicles={data.vehicles} 
            employees={data.employees} 
            fuelLogs={data.fuelLogs} 
            maintenanceLogs={data.maintenanceLogs} 
            fineLogs={data.fineLogs} 
            onUpdateVehicle={wrap(syncVehicle)} 
            onDeleteVehicle={wrap(deleteVehicle)} 
            onUpdateFuel={wrap(syncFuel)} 
            onDeleteFuel={wrap(deleteFuel)} 
            onUpdateMaintenance={wrap(syncMaintenance)} 
            onDeleteMaintenance={wrap(deleteMaintenance)} 
            onUpdateFine={wrap(syncFine)} 
            onDeleteFine={wrap(deleteFine)} 
        />}
        {view === 'admin' && <AdminView settings={data.settings} onUpdateSettings={wrap(syncSettings)} users={[]} />}
      </main>
    </div>
  );
};

export default App;
