
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Snowflake, Pencil, X, Sparkles, Minus, ArrowRight, Clock, Calendar, Search } from 'lucide-react';
import { Production, AppSettings, Product } from '../types';

interface Props {
  production: Production[];
  onUpdate: (production: Production) => void;
  onDelete: (id: string) => void;
  settings: AppSettings;
  products: Product[];
}

interface ProductionItem {
  productId: string;
  units: number;
}

const ProductionView: React.FC<Props> = ({ production, onUpdate, onDelete, settings, products }) => {
  const getTodayString = () => new Date().toISOString().split('T')[0];
  
  const getFirstDayOfMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  };

  const getLastDayOfMonth = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  };

  const [date, setDate] = useState(getTodayString());
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [observation, setObservation] = useState('');
  const [items, setItems] = useState<ProductionItem[]>([]);
  const [selectedProdId, setSelectedProdId] = useState('');
  const [currentUnits, setCurrentUnits] = useState('');
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);

  const getProductName = (id: string) => products.find(p => p.id === id)?.nome || 'PRODUTO';

  const handleShortcutToday = () => { setStartDate(getTodayString()); setEndDate(getTodayString()); };
  const handleShortcutMonth = () => { setStartDate(getFirstDayOfMonth()); setEndDate(getLastDayOfMonth()); };

  const filteredProduction = useMemo(() => {
    return production.filter(p => p.date >= startDate && p.date <= endDate);
  }, [production, startDate, endDate]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    const finalObs = `${items.map(i => `${i.units}un ${getProductName(i.productId)}`).join(' | ')} ${observation}`.toUpperCase();
    onUpdate({ id: crypto.randomUUID(), quantityKg: 0, date, observation: finalObs });
    setItems([]); setObservation(''); setIsMobileFormOpen(false);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 pb-24 transition-colors uppercase">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase leading-none flex items-center gap-3">
              <Snowflake className="text-sky-500" size={32} /> Produção
            </h2>
          </div>
        </div>
        <button onClick={() => setIsMobileFormOpen(true)} className="px-10 py-4 bg-sky-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl active:scale-95 transition-all">NOVA PRODUÇÃO</button>
      </header>
      
      {/* Filtro de Intervalo de Datas Padronizado */}
      <div className="flex flex-col md:flex-row gap-3 bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm no-print">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-11 border border-slate-100 dark:border-slate-800">
            <span className="text-[8px] font-black text-slate-400 mr-2 uppercase">DE</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-700 dark:text-slate-200 w-full" />
          </div>
          <ArrowRight size={14} className="text-slate-300 shrink-0" />
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-11 border border-slate-100 dark:border-slate-800">
            <span className="text-[8px] font-black text-slate-400 mr-2 uppercase">ATÉ</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-700 dark:text-slate-200 w-full" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button onClick={handleShortcutToday} className="px-4 h-9 rounded-lg text-[8px] font-black uppercase hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-all">Hoje</button>
            <button onClick={handleShortcutMonth} className="px-4 h-9 rounded-lg text-[8px] font-black uppercase hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-all">Mês</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border shadow-sm h-max">
           <h3 className="text-[10px] font-black uppercase mb-6 flex items-center gap-2"><Sparkles className="text-sky-500" size={18}/> Novo Lote</h3>
           <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 uppercase ml-2">Data do Lote</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-12 bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 font-bold text-xs dark:text-white" />
              </div>
              <select value={selectedProdId} onChange={e => setSelectedProdId(e.target.value)} className="w-full h-12 bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 uppercase text-[10px] font-black dark:text-white outline-none">
                 <option value="">PRODUTO...</option>
                 {products.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <div className="flex gap-2"><input type="number" value={currentUnits} onChange={e => setCurrentUnits(e.target.value)} placeholder="UNIDADES" className="flex-1 h-12 bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 text-sm font-black dark:text-white" /><button type="button" onClick={() => {if(!selectedProdId || !currentUnits) return; setItems([...items, {productId: selectedProdId, units: parseInt(currentUnits)}]); setCurrentUnits(''); setSelectedProdId('');}} className="h-12 px-4 bg-sky-500 text-white rounded-xl shadow-lg"><Plus/></button></div>
           </div>
           <div className="mt-6 space-y-2">
              {items.map((it, idx) => <div key={idx} className="flex justify-between items-center text-[9px] font-black dark:text-white bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border"><span>{it.units}un {getProductName(it.productId)}</span><button onClick={() => setItems(items.filter((_,i)=>i!==idx))} className="text-rose-400"><Trash2 size={12}/></button></div>)}
           </div>
           <button onClick={handleAdd} className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase shadow-lg mt-8 active:scale-95 transition-all">FINALIZAR LOTE</button>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border shadow-sm overflow-hidden min-h-[400px]">
           <table className="w-full text-left"><thead><tr className="text-slate-400 text-[9px] font-black uppercase border-b"><th className="p-6">DATA</th><th className="p-6">RESUMO DA PRODUÇÃO</th><th className="p-6 text-center">AÇÕES</th></tr></thead><tbody className="divide-y">
             {filteredProduction.map(p => <tr key={p.id} className="text-[10px] font-black dark:text-slate-200">
               <td className="p-6 whitespace-nowrap">{new Date(p.date + 'T00:00:00').toLocaleDateString()}</td>
               <td className="p-6 text-slate-400 dark:text-slate-500">{p.observation}</td>
               <td className="p-6 text-center"><button onClick={() => onDelete(p.id)} className="text-rose-400"><Trash2 size={16}/></button></td>
             </tr>)}
             {filteredProduction.length === 0 && (
               <tr>
                 <td colSpan={3} className="py-20 text-center opacity-30">
                    <Snowflake size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Sem produção registrada para este período</p>
                 </td>
               </tr>
             )}
           </tbody></table>
        </div>
      </div>

      {isMobileFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 dark:bg-black/98 backdrop-blur-md" onClick={() => setIsMobileFormOpen(false)} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative border dark:border-slate-800 animate-in zoom-in-95">
             <button onClick={() => setIsMobileFormOpen(false)} className="absolute top-6 right-6 text-slate-300"><X size={24}/></button>
             <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-3"><div className="w-10 h-10 bg-sky-50 dark:bg-sky-900/30 text-sky-500 rounded-xl flex items-center justify-center"><Plus size={20} /></div>Novo Lote</h3>
             <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Data do Lote</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-slate-950 border rounded-2xl px-5 font-bold text-sm dark:text-white outline-none" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl space-y-4">
                  <select value={selectedProdId} onChange={e => setSelectedProdId(e.target.value)} className="w-full h-12 bg-white dark:bg-slate-900 border rounded-xl px-4 uppercase text-[10px] font-black dark:text-white outline-none">
                    <option value="">PRODUTO...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <input type="number" value={currentUnits} onChange={e => setCurrentUnits(e.target.value)} placeholder="UNIDADES" className="flex-1 h-12 bg-white dark:bg-slate-900 border rounded-xl px-4 text-sm font-black dark:text-white outline-none" />
                    <button type="button" onClick={() => {if(!selectedProdId || !currentUnits) return; setItems([...items, {productId: selectedProdId, units: parseInt(currentUnits)}]); setCurrentUnits(''); setSelectedProdId('');}} className="h-12 px-6 bg-sky-500 text-white rounded-xl shadow-lg font-black text-xs">ADD</button>
                  </div>
                </div>
                <div className="space-y-2 max-h-[120px] overflow-y-auto">
                   {items.map((it, idx) => <div key={idx} className="flex justify-between items-center text-[10px] font-black dark:text-white bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border"><span>{it.units}un {getProductName(it.productId)}</span><button onClick={() => setItems(items.filter((_,i)=>i!==idx))} className="text-rose-400"><Trash2 size={16}/></button></div>)}
                </div>
                <button onClick={handleAdd} className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">CONCLUIR PRODUÇÃO</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionView;
