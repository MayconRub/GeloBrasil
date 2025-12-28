
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Snowflake, 
  Pencil, 
  ChevronLeft, 
  ChevronRight, 
  Scale, 
  Printer, 
  Target,
  Save,
  Check,
  TrendingUp,
  RotateCcw,
  Calendar,
  Trophy,
  Clock,
  X
} from 'lucide-react';
import { Production, AppSettings, MonthlyGoal } from '../types';

interface Props {
  production: Production[];
  onUpdate: (production: Production) => void;
  onDelete: (id: string) => void;
  monthlyGoals: MonthlyGoal[];
  onUpdateMonthlyGoal: (goal: MonthlyGoal) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

const ProductionView: React.FC<Props> = ({ production, onUpdate, onDelete, monthlyGoals, onUpdateMonthlyGoal, settings, onUpdateSettings }) => {
  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [observation, setObservation] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const currentGoalValue = useMemo(() => {
    const goal = monthlyGoals.find(g => g.type === 'production' && g.month === currentMonth && g.year === currentYear);
    return goal ? goal.value : settings.productionGoalMonthly || 30000;
  }, [monthlyGoals, currentMonth, currentYear, settings.productionGoalMonthly]);

  const [localMonthlyGoal, setLocalMonthlyGoal] = useState(currentGoalValue.toString());
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  useEffect(() => {
    setLocalMonthlyGoal(currentGoalValue.toString());
  }, [currentGoalValue, currentMonth, currentYear]);

  const handlePrint = () => window.print();

  const handlePrevMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleResetMonth = () => setSelectedDate(new Date());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numericQuantity = parseFloat(quantity);
    if (isNaN(numericQuantity) || !date) return;

    onUpdate({ 
      id: editingId || crypto.randomUUID(), 
      quantityKg: numericQuantity, 
      date, 
      observation 
    });
    
    resetForm();
  };

  const handleSaveGoal = async () => {
    setIsSavingGoal(true);
    const newValue = parseFloat(localMonthlyGoal);
    await onUpdateMonthlyGoal({
      type: 'production',
      month: currentMonth,
      year: currentYear,
      value: isNaN(newValue) ? 0 : newValue
    });
    setTimeout(() => setIsSavingGoal(false), 800);
  };

  const handleEdit = (p: Production) => {
    if (confirm(`DESEJA EDITAR O REGISTRO DE PRODUÇÃO DE ${p.quantityKg} KG?`)) {
      setEditingId(p.id);
      setQuantity(p.quantityKg.toString());
      setDate(p.date);
      setObservation(p.observation || '');
      
      if (window.innerWidth < 1024) {
        setIsMobileFormOpen(true);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleDelete = (p: Production) => {
    if (confirm(`ATENÇÃO: DESEJA EXCLUIR ESTE REGISTRO DE PRODUÇÃO?`)) {
      onDelete(p.id);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setQuantity('');
    setDate(getTodayString());
    setObservation('');
    setIsMobileFormOpen(false);
  };

  const filteredProduction = useMemo(() => {
    return production.filter(p => {
      const d = new Date(p.date + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [production, currentMonth, currentYear]);

  const totalProduced = useMemo(() => filteredProduction.reduce((sum, p) => sum + p.quantityKg, 0), [filteredProduction]);
  const progressPercent = Math.min(100, currentGoalValue > 0 ? (totalProduced / currentGoalValue) * 100 : 0);

  const renderForm = (isModal = false) => (
    <form onSubmit={handleAdd} className={`${isModal ? '' : 'bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-24 lg:top-8'}`}>
      <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3 uppercase text-[10px] tracking-[0.2em] border-b border-slate-100 pb-4 leading-none">
        <Plus className="text-sky-500" size={18} /> {editingId ? 'Editar Registro' : 'Lançar Produção'}
      </h3>
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Quantidade (KG)</label>
          <input 
            type="number" 
            value={quantity} 
            onChange={e => setQuantity(e.target.value)} 
            className="w-full h-14 sm:h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-2xl sm:text-xl focus:ring-4 focus:ring-sky-50 outline-none transition-all" 
            required 
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Data do Lote</label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="w-full h-14 sm:h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm sm:text-xs" 
            required 
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Notas/Lote</label>
          <textarea 
            value={observation} 
            onChange={e => setObservation(e.target.value)} 
            placeholder="Ex: Turno da manhã..."
            className="w-full h-24 sm:h-20 p-5 bg-slate-50 border border-slate-200 rounded-2xl resize-none text-sm font-bold placeholder:text-slate-300 uppercase"
          />
        </div>
        <div className="flex gap-3">
          <button 
            type="submit" 
            className="flex-1 h-14 sm:h-12 bg-slate-900 text-white font-black rounded-2xl hover:bg-sky-600 transition-all shadow-xl uppercase text-[10px] tracking-widest active:scale-95"
          >
            {editingId ? 'Atualizar' : 'Salvar'}
          </button>
          {(editingId || isModal) && (
            <button type="button" onClick={resetForm} className="w-14 sm:w-12 h-14 sm:h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all">
              {isModal ? <X size={20} /> : <RotateCcw size={18} />}
            </button>
          )}
        </div>
      </div>
    </form>
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20">
      
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter leading-none flex items-center gap-3">
              <Snowflake className="text-sky-500" size={32} /> Produção
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Gestão de Fabricação e Metas</p>
          </div>
          
          {/* Botão de Ação Rápida Mobile */}
          <button 
            onClick={() => setIsMobileFormOpen(true)}
            className="lg:hidden w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 no-print">
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-1 shadow-sm w-full sm:w-auto overflow-hidden">
            <button onClick={handlePrevMonth} className="flex-1 sm:flex-none p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-all active:scale-90">
              <ChevronLeft size={18} />
            </button>
            <button onClick={handleResetMonth} className="flex-[3] sm:flex-none px-4 py-1 flex flex-col items-center justify-center hover:bg-slate-50 rounded-xl transition-all min-w-[130px]">
              <span className="text-xs font-black text-slate-800 capitalize text-center">{monthName}</span>
            </button>
            <button onClick={handleNextMonth} className="flex-1 sm:flex-none p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-all active:scale-90">
              <ChevronRight size={18} />
            </button>
          </div>
          
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl active:scale-95 text-[10px] uppercase tracking-widest h-12"
          >
            <Printer size={18} /> Imprimir
          </button>
        </div>
      </header>

      {/* Grid de Metas Oculta no Mobile */}
      <div className="hidden lg:grid grid-cols-3 gap-6 no-print">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Definir Meta para</p>
              <h4 className="font-black text-slate-900 leading-tight capitalize">{monthName}</h4>
            </div>
          </div>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={localMonthlyGoal}
              onChange={(e) => setLocalMonthlyGoal(e.target.value)}
              placeholder="Ex: 30000"
              className="flex-1 h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
            />
            <button 
              onClick={handleSaveGoal}
              disabled={isSavingGoal}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all shadow-lg active:scale-90 ${isSavingGoal ? 'bg-emerald-500' : 'bg-slate-900 hover:bg-indigo-600'}`}
            >
              {isSavingGoal ? <Check size={20} className="animate-in zoom-in" /> : <Save size={20} />}
            </button>
          </div>
        </div>

        <div className={`lg:col-span-2 p-6 rounded-[2.5rem] border shadow-sm flex flex-col justify-between transition-all duration-500 ${progressPercent >= 100 ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center ${progressPercent >= 100 ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-500'}`}>
                 {progressPercent >= 100 ? <Trophy size={16} /> : <Target size={16} />}
               </div>
               <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${progressPercent >= 100 ? 'text-white/80' : 'text-slate-400'}`}>
                 {progressPercent >= 100 ? 'META ALCANÇADA' : `Desempenho ${monthName}`}
               </span>
             </div>
             <p className={`text-3xl font-black tracking-tighter ${progressPercent >= 100 ? 'text-white' : 'text-slate-900'}`}>{progressPercent.toFixed(1)}%</p>
          </div>
          <div className="space-y-3">
            <div className={`h-4 sm:h-5 w-full rounded-full overflow-hidden border p-1 ${progressPercent >= 100 ? 'bg-white/20 border-white/30' : 'bg-slate-100 border-slate-200'}`}>
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${progressPercent >= 100 ? 'bg-amber-400' : 'bg-gradient-to-r from-sky-500 to-indigo-600'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
               <span className={progressPercent >= 100 ? 'text-white/80' : 'text-slate-400'}>
                 {progressPercent >= 100 ? 'PARABÉNS! OBJETIVO CONCLUÍDO! 🏆' : 'Total Produzido'}
               </span>
               <div className={`${progressPercent >= 100 ? 'bg-white text-indigo-600' : 'bg-slate-900 text-white'} px-3 py-1 rounded-lg`}>
                 {totalProduced.toLocaleString('pt-BR')} / {currentGoalValue.toLocaleString('pt-BR')} KG
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário lateral oculto no Mobile */}
        <div className="hidden lg:block lg:col-span-1 no-print">
          {renderForm()}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Mobile List View */}
            <div className="block md:hidden divide-y divide-slate-100">
               {filteredProduction.map((p) => (
                 <div key={p.id} className="p-5 flex flex-col gap-4 active:bg-sky-50/20 transition-all">
                    <div className="flex items-center justify-between">
                       <div>
                          <div className="text-xl font-black text-slate-800">
                            {p.quantityKg.toLocaleString('pt-BR')} <span className="text-[11px] font-black text-sky-400 uppercase tracking-widest">KG</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                             <Clock size={12} /> {new Date(p.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </div>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => handleEdit(p)} className="p-3 bg-slate-50 text-slate-400 rounded-xl border border-slate-100">
                            <Pencil size={18} />
                         </button>
                         <button onClick={() => handleDelete(p)} className="p-3 bg-rose-50 text-rose-400 rounded-xl border border-rose-100">
                            <Trash2 size={18} />
                         </button>
                       </div>
                    </div>
                    {p.observation && (
                      <p className="text-[11px] font-bold text-slate-400 italic px-4 py-3 bg-slate-50 rounded-2xl uppercase">
                        {p.observation}
                      </p>
                    )}
                 </div>
               ))}
               {filteredProduction.length === 0 && (
                 <div className="py-24 text-center opacity-20 flex flex-col items-center">
                    <Snowflake size={48} className="mb-4" />
                    <p className="text-[11px] font-black uppercase tracking-widest">Sem registros no período</p>
                 </div>
               )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5">📅 Data</th>
                    <th className="px-8 py-5 text-sky-600">⚖️ Quantidade</th>
                    <th className="px-8 py-5">📝 Notas</th>
                    <th className="px-8 py-5 text-center no-print">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProduction.map((p) => (
                    <tr key={p.id} className="hover:bg-sky-50/20 transition-all group">
                      <td className="px-8 py-5 text-xs font-black text-slate-500">
                        {new Date(p.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-black text-slate-800">
                          {p.quantityKg.toLocaleString('pt-BR')} <span className="text-[9px] font-black text-sky-400 ml-1">KG</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-[11px] font-bold text-slate-400 truncate max-w-[200px]">
                        {p.observation || '-'}
                      </td>
                      <td className="px-8 py-5 text-center no-print">
                        <div className="flex justify-center gap-2 transition-all">
                          <button onClick={() => handleEdit(p)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(p)} className="p-2.5 text-rose-300 hover:text-rose-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Mobile para Novo Lançamento */}
      {isMobileFormOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 lg:hidden">
           <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
              <button 
                onClick={() => setIsMobileFormOpen(false)}
                className="absolute top-6 right-6 text-slate-300 hover:text-rose-500 transition-colors"
              >
                <X size={24} />
              </button>
              <div className="mt-4">
                {renderForm(true)}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProductionView;
