
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Snowflake, 
  Pencil, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  X,
  Sparkles,
  Package,
  Check,
  ShoppingBag,
  Minus,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { Production, AppSettings, Product } from '../types';

interface Props {
  production: Production[];
  onUpdate: (production: Production) => void;
  onDelete: (id: string) => void;
  settings: AppSettings;
  products?: Product[]; 
}

interface ProductionItem {
  type: '2KG' | '4KG' | '10KG' | '20KG' | 'BRITADO10' | 'BRITADO20' | 'BARRA10';
  units: number;
}

const ProductionView: React.FC<Props> = ({ production, onUpdate, onDelete, settings }) => {
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const getFirstDayOfMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  };

  const getLastDayOfMonth = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  };

  // Estados de Filtro por Intervalo
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getLastDayOfMonth());

  // Estados de Formulário
  const [date, setDate] = useState(getTodayString());
  const [observation, setObservation] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  
  const [items, setItems] = useState<ProductionItem[]>([]);
  const [currentType, setCurrentType] = useState<ProductionItem['type']>('4KG');
  const [currentUnits, setCurrentUnits] = useState('');

  const typeWeights: Record<ProductionItem['type'], number> = {
    '2KG': 2, '4KG': 4, '10KG': 10, '20KG': 20, 'BRITADO10': 10, 'BRITADO20': 20, 'BARRA10': 10
  };

  const typeLabels: Record<ProductionItem['type'], string> = {
    '2KG': 'CUBO 2KG', '4KG': 'CUBO 4KG', '10KG': 'CUBO 10KG', '20KG': 'CUBO 20KG', 
    'BRITADO10': 'BRITADO 10KG', 'BRITADO20': 'BRITADO 20KG', 'BARRA10': 'BARRA 10KG'
  };

  const handleShortcutToday = () => {
    setStartDate(getTodayString());
    setEndDate(getTodayString());
  };

  const handleShortcutMonth = () => {
    setStartDate(getFirstDayOfMonth());
    setEndDate(getLastDayOfMonth());
  };

  const totalBatchWeight = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.units * typeWeights[item.type]), 0);
  }, [items]);

  const handleAddItem = () => {
    const u = parseInt(currentUnits);
    if (isNaN(u) || u <= 0) return;

    const existingIdx = items.findIndex(i => i.type === currentType);
    if (existingIdx > -1) {
      const newItems = [...items];
      newItems[existingIdx].units += u;
      setItems(newItems);
    } else {
      setItems([...items, { type: currentType, units: u }]);
    }
    setCurrentUnits('');
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !date) return;

    const detailedObs = items.map(i => `${i.units}un ${typeLabels[i.type]}`).join(' | ');
    const finalObs = `${detailedObs}${observation ? ` - ${observation}` : ''}`.toUpperCase();

    onUpdate({ 
      id: editingId || crypto.randomUUID(), 
      quantityKg: totalBatchWeight, 
      date, 
      observation: finalObs 
    });
    resetForm();
  };

  const handleEdit = (p: Production) => {
    if (confirm(`DESEJA EDITAR O REGISTRO DE PRODUÇÃO DE ${p.quantityKg} KG?`)) {
      setEditingId(p.id);
      setDate(p.date);
      setObservation(p.observation || '');
      if (window.innerWidth < 1024) setIsMobileFormOpen(true);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = (p: Production) => {
    if (confirm(`DESEJA EXCLUIR ESTE REGISTRO DE PRODUÇÃO DE ${p.quantityKg} KG?`)) {
      onDelete(p.id);
    }
  };

  const resetForm = () => {
    setEditingId(null); 
    setItems([]);
    setCurrentUnits(''); 
    setDate(getTodayString()); 
    setObservation(''); 
    setIsMobileFormOpen(false);
  };

  const filteredProduction = useMemo(() => {
    return (production || [])
      .filter(p => p.date >= startDate && p.date <= endDate)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [production, startDate, endDate]);

  const totalProduced = useMemo(() => filteredProduction.reduce((sum, p) => sum + p.quantityKg, 0), [filteredProduction]);

  const renderForm = (isModal = false) => (
    <div className={`${isModal ? '' : 'bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none sticky top-24 lg:top-8'}`}>
      <h3 className="font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3 uppercase text-[10px] tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-4 leading-none">
        <Sparkles className="text-sky-500" size={18} /> {editingId ? 'Editar Registro' : 'Novo Lote de Produção'}
      </h3>
      
      <div className="space-y-6">
        <div className="space-y-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
           <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2">Produto</label>
              <select 
                value={currentType} 
                onChange={e => setCurrentType(e.target.value as any)}
                className="w-full h-11 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-[10px] uppercase dark:text-white outline-none"
              >
                {Object.keys(typeLabels).map(type => (
                  <option key={type} value={type}>{typeLabels[type as ProductionItem['type']]}</option>
                ))}
              </select>
           </div>
           <div className="flex gap-2">
              <div className="flex-1 space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2">Unidades</label>
                <input 
                  type="number" 
                  value={currentUnits} 
                  onChange={e => setCurrentUnits(e.target.value)}
                  placeholder="0"
                  className="w-full h-11 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-sm dark:text-white outline-none"
                />
              </div>
              <button 
                type="button" 
                onClick={handleAddItem}
                className="self-end h-11 px-4 bg-sky-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-90 transition-all"
              >
                <Plus size={20} />
              </button>
           </div>
        </div>

        {items.length > 0 && (
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2 tracking-widest">Composição do Lote</label>
            <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-sky-50 dark:bg-sky-900/30 text-sky-500 rounded-lg flex items-center justify-center text-[10px] font-black">{item.units}</span>
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase">{typeLabels[item.type]}</span>
                  </div>
                  <button onClick={() => handleRemoveItem(idx)} className="text-slate-300 hover:text-rose-500 transition-colors"><Minus size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2">Data</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-sm dark:text-white outline-none" required />
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-4 bg-sky-50 dark:bg-sky-900/20 px-6 py-4 rounded-2xl border border-sky-100 dark:border-sky-800/30">
             <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase">Carga Total:</span>
             <span className="text-xl font-black text-sky-700 dark:text-white">{totalBatchWeight.toLocaleString('pt-BR')} KG</span>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleAdd}
              disabled={items.length === 0}
              className="flex-1 h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black rounded-2xl transition-all shadow-xl uppercase text-[10px] tracking-widest active:scale-95 disabled:opacity-30"
            >
              {editingId ? 'Atualizar Lote' : 'Registrar Produção'}
            </button>
            {(editingId || isModal) && (
              <button type="button" onClick={resetForm} className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-950 transition-all"><X size={24} /></button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 transition-colors">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tighter leading-none flex items-center gap-3"><Snowflake className="text-sky-500" size={32} /> Produção</h2>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Fabricação e Lotes</p>
          </div>
          <button onClick={() => setIsMobileFormOpen(true)} className="lg:hidden w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95"><Plus size={24} /></button>
        </div>
        
        <div className="bg-white dark:bg-slate-900 px-8 py-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6 no-print w-full lg:w-auto">
           <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/20 text-sky-500 rounded-xl flex items-center justify-center shadow-inner shrink-0"><Package size={24} /></div>
           <div>
              <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Fabricado no Período</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{totalProduced.toLocaleString('pt-BR')} KG</h3>
           </div>
        </div>
      </header>

      {/* Modern Compact Range Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 bg-white dark:bg-slate-900 p-2 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 shadow-sm no-print">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-11 border border-slate-100 dark:border-slate-800">
            <span className="text-[8px] font-black text-slate-400 mr-2 uppercase">DE</span>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-700 dark:text-slate-200 w-full" 
            />
          </div>
          <ArrowRight size={14} className="text-slate-300 shrink-0" />
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-11 border border-slate-100 dark:border-slate-800">
            <span className="text-[8px] font-black text-slate-400 mr-2 uppercase">ATÉ</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-700 dark:text-slate-200 w-full" 
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button onClick={handleShortcutToday} className="px-5 h-9 rounded-lg text-[8px] font-black uppercase hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-all">Hoje</button>
            <button onClick={handleShortcutMonth} className="px-5 h-9 rounded-lg text-[8px] font-black uppercase hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-all">Mês</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="hidden lg:block lg:col-span-1 no-print">{renderForm()}</div>
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
               {filteredProduction.map((p) => (
                 <div key={p.id} className="p-5 flex flex-col gap-4 active:bg-sky-50/20 dark:active:bg-slate-800 transition-all">
                    <div className="flex items-center justify-between">
                       <div>
                          <div className="text-xl font-black text-slate-800 dark:text-slate-100">{p.quantityKg.toLocaleString('pt-BR')} <span className="text-[11px] font-black text-sky-400 uppercase tracking-widest">KG</span></div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-1"><Clock size={12} /> {new Date(p.date + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                          <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{p.observation || '-'}</p>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => handleEdit(p)} className="p-3 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-700 rounded-xl border border-slate-100 dark:border-slate-800"><Pencil size={18} /></button>
                         <button onClick={() => handleDelete(p)} className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-400 dark:text-rose-900 rounded-xl border border-rose-100 dark:border-rose-900/20"><Trash2 size={18} /></button>
                       </div>
                    </div>
                 </div>
               ))}
               {filteredProduction.length === 0 && (
                 <div className="py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhuma produção no período</div>
               )}
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
                      <td className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase">{p.observation || '-'}</td>
                      <td className="px-8 py-5 text-center no-print">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(p)} className="p-1.5 text-slate-400 dark:text-slate-700 hover:text-indigo-600"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(p)} className="p-1.5 text-rose-300 dark:text-rose-900 hover:text-rose-500"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProduction.length === 0 && (
                    <tr><td colSpan={4} className="py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum registro de produção encontrado no intervalo</td></tr>
                  )}
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
