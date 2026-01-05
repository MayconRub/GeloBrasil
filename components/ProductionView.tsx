
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Snowflake, 
  Pencil, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  RotateCcw,
  Clock,
  X,
  Sparkles,
  Package,
  Check
} from 'lucide-react';
import { Production, AppSettings, Product } from '../types';

interface Props {
  production: Production[];
  onUpdate: (production: Production) => void;
  onDelete: (id: string) => void;
  settings: AppSettings;
  products?: Product[]; 
}

const ProductionView: React.FC<Props> = ({ production, onUpdate, onDelete, settings }) => {
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProductType, setSelectedProductType] = useState<'2KG' | '4KG' | '10KG' | '20KG' | 'BRITADO10' | 'BRITADO20' | 'CUSTOM'>('4KG');
  const [units, setUnits] = useState('');
  const [customWeight, setCustomWeight] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [observation, setObservation] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const calculatedTotalWeight = useMemo(() => {
    const u = parseFloat(units) || 0;
    switch(selectedProductType) {
      case '2KG': return u * 2;
      case '4KG': return u * 4;
      case '10KG': return u * 10;
      case '20KG': return u * 20;
      case 'BRITADO10': return u * 10;
      case 'BRITADO20': return u * 20;
      default: return parseFloat(customWeight) || 0;
    }
  }, [selectedProductType, units, customWeight]);

  const handlePrevMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleResetMonth = () => setSelectedDate(new Date());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedTotalWeight <= 0 || !date) return;
    const labels: Record<string, string> = { '2KG': 'CUBO 2KG', '4KG': 'CUBO 4KG', '10KG': 'CUBO 10KG', '20KG': 'CUBO 20KG', 'BRITADO10': 'BRITADO 10KG', 'BRITADO20': 'BRITADO 20KG', 'CUSTOM': 'PESO PERSONALIZADO' };
    const obsWithDetails = `${selectedProductType !== 'CUSTOM' ? `PROD: ${units} UN DE ${labels[selectedProductType]}` : ''} ${observation}`.trim();
    onUpdate({ id: editingId || crypto.randomUUID(), quantityKg: calculatedTotalWeight, date, observation: obsWithDetails.toUpperCase() });
    resetForm();
  };

  const handleEdit = (p: Production) => {
    if (confirm(`DESEJA EDITAR O REGISTRO DE PRODUÇÃO DE ${p.quantityKg} KG?`)) {
      setEditingId(p.id); setSelectedProductType('CUSTOM'); setCustomWeight(p.quantityKg.toString()); setDate(p.date); setObservation(p.observation || '');
      if (window.innerWidth < 1024) setIsMobileFormOpen(true);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Fix: Added missing handleDelete function to invoke onDelete with confirmation
  const handleDelete = (p: Production) => {
    if (confirm(`DESEJA EXCLUIR ESTE REGISTRO DE PRODUÇÃO DE ${p.quantityKg} KG?`)) {
      onDelete(p.id);
    }
  };

  const resetForm = () => {
    setEditingId(null); setUnits(''); setCustomWeight(''); setSelectedProductType('4KG'); setDate(getTodayString()); setObservation(''); setIsMobileFormOpen(false);
  };

  const filteredProduction = useMemo(() => {
    return production.filter(p => {
      const d = new Date(p.date + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [production, currentMonth, currentYear]);

  const totalProduced = useMemo(() => filteredProduction.reduce((sum, p) => sum + p.quantityKg, 0), [filteredProduction]);

  const renderForm = (isModal = false) => (
    <form onSubmit={handleAdd} className={`${isModal ? '' : 'bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none sticky top-24 lg:top-8'}`}>
      <h3 className="font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3 uppercase text-[10px] tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-4 leading-none">
        <Sparkles className="text-sky-500" size={18} /> {editingId ? 'Editar Registro' : 'Lançar Produção'}
      </h3>
      
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2 tracking-widest">Tipo de Pacote</label>
          <div className="grid grid-cols-2 gap-2">
            {['2KG', '4KG', '10KG', '20KG'].map(type => (
              <button key={type} type="button" onClick={() => setSelectedProductType(type as any)} className={`py-3 rounded-xl text-[9px] font-black border transition-all ${selectedProductType === type ? 'bg-sky-500 border-sky-600 text-white shadow-lg dark:shadow-none' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600'}`}>{type}</button>
            ))}
          </div>
        </div>

        {selectedProductType !== 'CUSTOM' ? (
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2 tracking-widest">Unidades</label>
            <div className="relative">
               <Package size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" />
               <input type="number" placeholder="Ex: 100" value={units} onChange={e => setUnits(e.target.value)} className="w-full h-14 pl-12 pr-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xl dark:text-white outline-none" required />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2 tracking-widest">Peso Total (KG)</label>
            <input type="number" value={customWeight} onChange={e => setCustomWeight(e.target.value)} className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xl dark:text-white outline-none" required />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2 tracking-widest">Data</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-sm dark:text-white" required />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black rounded-2xl transition-all shadow-xl dark:shadow-none uppercase text-[10px] tracking-widest active:scale-95">{editingId ? 'Atualizar' : 'Salvar Lote'}</button>
          {(editingId || isModal) && (
            <button type="button" onClick={resetForm} className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"><X size={24} /></button>
          )}
        </div>
      </div>
    </form>
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 transition-colors">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tighter leading-none flex items-center gap-3"><Snowflake className="text-sky-500" size={32} /> Produção</h2>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Gestão de Fabricação</p>
          </div>
          <button onClick={() => setIsMobileFormOpen(true)} className="lg:hidden w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg dark:shadow-none active:scale-95"><Plus size={24} /></button>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 no-print">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 shadow-sm dark:shadow-none overflow-hidden">
            <button onClick={handlePrevMonth} className="p-2.5 text-slate-500 dark:text-slate-600 active:scale-90"><ChevronLeft size={18} /></button>
            <div className="px-4 py-1 flex items-center justify-center min-w-[130px]"><span className="text-xs font-black text-slate-800 dark:text-slate-100 capitalize">{monthName}</span></div>
            <button onClick={handleNextMonth} className="p-2.5 text-slate-500 dark:text-slate-600 active:scale-90"><ChevronRight size={18} /></button>
          </div>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none flex items-center justify-between no-print">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-sky-50 dark:bg-sky-900/20 text-sky-500 rounded-2xl flex items-center justify-center shadow-inner dark:shadow-none"><Package size={32} /></div>
            <div>
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Total do Mês</p>
               <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{totalProduced.toLocaleString('pt-BR')} KG</h3>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="hidden lg:block lg:col-span-1 no-print">{renderForm()}</div>
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden">
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
               {filteredProduction.map((p) => (
                 <div key={p.id} className="p-5 flex flex-col gap-4 active:bg-sky-50/20 dark:active:bg-slate-800 transition-all">
                    <div className="flex items-center justify-between">
                       <div>
                          <div className="text-xl font-black text-slate-800 dark:text-slate-100">{p.quantityKg.toLocaleString('pt-BR')} <span className="text-[11px] font-black text-sky-400 uppercase tracking-widest">KG</span></div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-1"><Clock size={12} /> {new Date(p.date + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => handleEdit(p)} className="p-3 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-700 rounded-xl border border-slate-100 dark:border-slate-800"><Pencil size={18} /></button>
                         <button onClick={() => handleDelete(p)} className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-400 dark:text-rose-900 rounded-xl border border-rose-100 dark:border-rose-900/20"><Trash2 size={18} /></button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-400 dark:text-slate-600 text-[9px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-5">📅 Data</th>
                    <th className="px-8 py-5 text-sky-600">⚖️ Quantidade</th>
                    <th className="px-8 py-5">📝 Detalhes</th>
                    <th className="px-8 py-5 text-center no-print">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredProduction.map((p) => (
                    <tr key={p.id} className="hover:bg-sky-50/20 dark:hover:bg-slate-800/40 transition-all group">
                      <td className="px-8 py-5 text-xs font-black text-slate-500 dark:text-slate-400">{new Date(p.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                      <td className="px-8 py-5"><div className="text-sm font-black text-slate-800 dark:text-slate-200">{p.quantityKg.toLocaleString('pt-BR')} <span className="text-[9px] font-black text-sky-400 ml-1">KG</span></div></td>
                      <td className="px-8 py-5 text-[11px] font-bold text-slate-400 dark:text-slate-600 truncate max-w-[200px] uppercase">{p.observation || '-'}</td>
                      <td className="px-8 py-5 text-center no-print">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(p)} className="p-1.5 text-slate-400 dark:text-slate-700 hover:text-indigo-600"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(p)} className="p-1.5 text-rose-300 dark:text-rose-900 hover:text-rose-500"><Trash2 size={14} /></button>
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

      {isMobileFormOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/95 backdrop-blur-sm transition-all" onClick={() => setIsMobileFormOpen(false)} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-8 shadow-2xl dark:shadow-none border border-transparent dark:border-slate-800 relative animate-in zoom-in-95">
              <button onClick={() => setIsMobileFormOpen(false)} className="absolute top-6 right-6 text-slate-300 dark:text-slate-700 hover:text-rose-500"><X size={24} /></button>
              <div className="mt-4">{renderForm(true)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionView;
