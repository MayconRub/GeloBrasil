
import { 
  Boxes, Search, ArrowUpCircle, History, 
  Package, TrendingUp, TrendingDown, 
  X, AlertCircle, ShoppingBag, ArrowRightLeft,
  CheckCircle2, Sparkles, Plus, Loader2
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Product, StockMovement } from '../types';

interface Props {
  products: Product[];
  movements: StockMovement[];
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddMovement: (movement: StockMovement) => void;
}

const InventoryView: React.FC<Props> = ({ products, movements, onUpdateProduct, onAddMovement }) => {
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [activeTab, setActiveTab] = useState<'status' | 'history'>('status');
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [movementForm, setMovementForm] = useState<Partial<StockMovement>>({ type: 'IN', reason: 'AJUSTE', date: getTodayString() });

  const OFFICIAL_PRODUCTS = [
    { name: 'GELO EM CUBO 2KG', unit: 'SACO' },
    { name: 'GELO EM CUBO 4KG', unit: 'SACO' },
    { name: 'GELO EM CUBO 10KG', unit: 'SACO' },
    { name: 'GELO EM CUBO 20KG', unit: 'SACO' },
    { name: 'GELO BRITADO 10KG', unit: 'SACO' },
    { name: 'GELO BRITADO 20KG', unit: 'SACO' }
  ];

  const inventoryData = useMemo(() => {
    return OFFICIAL_PRODUCTS.map(official => {
      const dbProduct = products.find(p => p.name.toUpperCase() === official.name);
      return { ...official, dbProduct, isActivated: !!dbProduct };
    }).filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  const handleActivateProduct = async (name: string, unit: any) => {
    await onUpdateProduct({ id: crypto.randomUUID(), name: name.toUpperCase(), unit: unit, current_quantity: 0, min_quantity: 0, category: 'GELO' } as Product);
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const qty = Math.floor(Number(movementForm.quantity));
    if (!movementForm.productId || isNaN(qty) || qty <= 0) { alert("QUANTIDADE INVÁLIDA"); return; }
    setIsSubmitting(true);
    try {
      await onAddMovement({ ...movementForm, quantity: qty, id: crypto.randomUUID() } as StockMovement);
      setIsMovementModalOpen(false); setMovementForm({ type: 'IN', reason: 'AJUSTE', date: getTodayString() });
    } catch (err) { alert("ERRO AO PROCESSAR."); } finally { setIsSubmitting(false); }
  };

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'PRODUTO';

  return (
    <div className="p-4 sm:p-8 space-y-8 pb-24 max-w-[1400px] mx-auto animate-in fade-in duration-500 transition-colors">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-slate-900 dark:bg-slate-800 text-white rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3"><Boxes size={32} /></div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">CONTROLE DE <span className="text-sky-500">ESTOQUE</span></h2>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2 flex items-center gap-2"><Package size={14} className="text-sky-500" /> Saldos e Inventário</p>
          </div>
        </div>
        <button onClick={() => setIsMovementModalOpen(true)} className="w-full sm:w-auto px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl dark:shadow-none hover:bg-emerald-600 active:scale-95 transition-all"><ArrowRightLeft size={18} /> Movimentação</button>
      </header>

      <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-950 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 w-full sm:w-max">
        <button onClick={() => setActiveTab('status')} className={`flex-1 sm:px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'status' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md dark:shadow-none' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}>Saldos</button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 sm:px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md dark:shadow-none' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}>Extrato</button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-none overflow-hidden">
        {activeTab === 'status' ? (
           <div className="overflow-x-auto">
             <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 flex items-center gap-4"><Search size={20} className="text-slate-300 dark:text-slate-700" /><input type="text" placeholder="FILTRAR..." className="w-full bg-transparent outline-none font-black text-[10px] uppercase dark:text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
             <table className="w-full text-left">
               <thead><tr className="text-slate-400 dark:text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800"><th className="px-8 py-6">Item</th><th className="px-8 py-6 text-center">Unidade</th><th className="px-8 py-6 text-center">Saldo</th><th className="px-8 py-6 text-right">Ação</th></tr></thead>
               <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                 {inventoryData.map((item, idx) => (
                   <tr key={idx} className={`hover:bg-sky-50/20 dark:hover:bg-slate-800/40 transition-all ${!item.isActivated ? 'opacity-40' : ''}`}>
                     <td className="px-8 py-6 font-black text-slate-800 dark:text-slate-200 text-sm uppercase">{item.name}</td>
                     <td className="px-8 py-6 text-center"><span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-950 rounded-full text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase border border-slate-200 dark:border-slate-800">{item.unit}</span></td>
                     <td className="px-8 py-6 text-center"><span className={`text-xl font-black ${item.isActivated ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-200 dark:text-slate-800'}`}>{item.isActivated ? (item.dbProduct?.current_quantity || 0) : '--'}</span></td>
                     <td className="px-8 py-6 text-right no-print">{item.isActivated ? <button onClick={() => { setMovementForm(prev => ({ ...prev, productId: item.dbProduct!.id })); setIsMovementModalOpen(true); }} className="px-6 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Movimentar</button> : <button onClick={() => handleActivateProduct(item.name, item.unit)} className="px-6 py-2 bg-sky-500 text-white rounded-xl text-[9px] font-black uppercase">Ativar</button>}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead><tr className="text-slate-400 dark:text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800"><th className="px-8 py-5">Data</th><th className="px-8 py-5">Produto</th><th className="px-8 py-5">Tipo</th><th className="px-8 py-5 text-center">Qtd</th><th className="px-8 py-5">Motivo</th></tr></thead>
               <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                 {movements.map(m => (
                   <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-[10px] font-black dark:text-slate-300">
                     <td className="px-8 py-4">{new Date(m.date + 'T00:00:00').toLocaleDateString()}</td>
                     <td className="px-8 py-4 uppercase">{getProductName(m.productId)}</td>
                     <td className="px-8 py-4"><span className={`px-2 py-1 rounded ${m.type === 'IN' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'}`}>{m.type === 'IN' ? 'ENTRADA' : 'SAÍDA'}</span></td>
                     <td className="px-8 py-4 text-center text-slate-900 dark:text-white">{m.quantity}</td>
                     <td className="px-8 py-4 uppercase text-slate-400 dark:text-slate-600">{m.reason}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
      </div>

      {isMovementModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 dark:bg-black/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => !isSubmitting && setIsMovementModalOpen(false)} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl dark:shadow-none border border-transparent dark:border-slate-800 relative animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 mb-10">
               <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-[1.5rem] flex items-center justify-center"><ArrowRightLeft size={28} /></div>
               <div><h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">Movimentar</h3><p className="text-[10px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.2em] mt-2">Fluxo de Estoque</p></div>
               <button onClick={() => setIsMovementModalOpen(false)} className="ml-auto p-2 text-slate-300 dark:text-slate-700 hover:text-rose-500 transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleMovementSubmit} className="space-y-6">
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-700 ml-4">Produto</label><select className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] font-black text-xs uppercase dark:text-white outline-none" value={movementForm.productId || ''} onChange={e => setMovementForm({...movementForm, productId: e.target.value})} required><option value="">-- SELECIONE --</option>{products.filter(p => OFFICIAL_PRODUCTS.some(off => off.name === p.name.toUpperCase())).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-700 ml-4">Operação</label><div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800"><button type="button" onClick={() => setMovementForm({...movementForm, type: 'IN'})} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all ${movementForm.type === 'IN' ? 'bg-emerald-500 text-white' : 'text-slate-400 dark:text-slate-700'}`}>Entrada</button><button type="button" onClick={() => setMovementForm({...movementForm, type: 'OUT'})} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all ${movementForm.type === 'OUT' ? 'bg-rose-500 text-white' : 'text-slate-400 dark:text-slate-700'}`}>Saída</button></div></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-700 ml-4">Quantidade</label><input type="number" className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] font-black text-xl dark:text-white outline-none text-center" value={movementForm.quantity || ''} onChange={e => setMovementForm({...movementForm, quantity: e.target.value})} required /></div>
              </div>
              <button disabled={isSubmitting} className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.3em] mt-4 shadow-2xl dark:shadow-none hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all active:scale-95">{isSubmitting ? 'SALVANDO...' : 'CONFIRMAR'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
