
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Snowflake, Pencil, X, Sparkles, Minus, ArrowRight, Clock } from 'lucide-react';
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
  const [date, setDate] = useState(getTodayString());
  const [observation, setObservation] = useState('');
  const [items, setItems] = useState<ProductionItem[]>([]);
  const [selectedProdId, setSelectedProdId] = useState('');
  const [currentUnits, setCurrentUnits] = useState('');
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);

  const getProductName = (id: string) => products.find(p => p.id === id)?.nome || 'PRODUTO';

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    const finalObs = `${items.map(i => `${i.units}un ${getProductName(i.productId)}`).join(' | ')} ${observation}`.toUpperCase();
    onUpdate({ id: crypto.randomUUID(), quantityKg: 0, date, observation: finalObs });
    setItems([]); setObservation(''); setIsMobileFormOpen(false);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 pb-20 transition-colors uppercase">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-6"><div className="flex items-center gap-3"><div><h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase leading-none flex items-center gap-3"><Snowflake className="text-sky-500" size={32} /> Produção</h2></div></div><button onClick={() => setIsMobileFormOpen(true)} className="px-10 py-4 bg-sky-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl active:scale-95 transition-all">NOVA PRODUÇÃO</button></header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border shadow-sm h-max">
           <h3 className="text-[10px] font-black uppercase mb-6 flex items-center gap-2"><Sparkles className="text-sky-500" size={18}/> Novo Lote</h3>
           <div className="space-y-4">
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
             {production.map(p => <tr key={p.id} className="text-[10px] font-black dark:text-slate-200">
               <td className="p-6">{new Date(p.date + 'T00:00:00').toLocaleDateString()}</td>
               <td className="p-6 text-slate-400 dark:text-slate-500">{p.observation}</td>
               <td className="p-6 text-center"><button onClick={() => onDelete(p.id)} className="text-rose-400"><Trash2 size={16}/></button></td>
             </tr>)}
           </tbody></table>
        </div>
      </div>
    </div>
  );
};

export default ProductionView;
