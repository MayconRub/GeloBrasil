
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
  // Função para pegar a data local no formato YYYY-MM-DD
  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [activeTab, setActiveTab] = useState<'status' | 'history'>('status');
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [movementForm, setMovementForm] = useState<Partial<StockMovement>>({ 
    type: 'IN', 
    reason: 'AJUSTE', 
    date: getTodayString()
  });

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
      return {
        ...official,
        dbProduct,
        isActivated: !!dbProduct
      };
    }).filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleActivateProduct = async (name: string, unit: any) => {
    await onUpdateProduct({
      id: crypto.randomUUID(),
      name: name.toUpperCase(),
      unit: unit,
      current_quantity: 0,
      min_quantity: 0,
      category: 'GELO'
    } as Product);
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const qty = Math.floor(Number(movementForm.quantity));
    if (!movementForm.productId || isNaN(qty) || qty <= 0) {
      alert("QUANTIDADE INVÁLIDA (INSIRA UM NÚMERO INTEIRO POSITIVO)");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddMovement({
        ...movementForm,
        quantity: qty,
        id: crypto.randomUUID(),
      } as StockMovement);
      
      setIsMovementModalOpen(false);
      setMovementForm({ 
        type: 'IN', 
        reason: 'AJUSTE', 
        date: getTodayString()
      });
    } catch (err) {
      alert("ERRO AO PROCESSAR MOVIMENTAÇÃO. TENTE NOVAMENTE.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openMovementForProduct = (productId: string) => {
    setMovementForm(prev => ({ ...prev, productId }));
    setIsMovementModalOpen(true);
  };

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'PRODUTO NÃO ENCONTRADO';

  return (
    <div className="p-4 sm:p-8 space-y-8 pb-24 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3">
            <Boxes size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">CONTROLE DE <span className="text-sky-500">ESTOQUE</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
              <Package size={14} className="text-sky-500" /> Monitoramento de Saldos | Gelo Brasil
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsMovementModalOpen(true)}
          className="w-full sm:w-auto px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 hover:bg-emerald-600 active:scale-95 transition-all"
        >
          <ArrowRightLeft size={18} /> Lançar Movimentação
        </button>
      </header>

      <div className="flex gap-4 p-1 bg-slate-100 rounded-[1.5rem] border border-slate-200 w-full sm:w-max">
        <button 
          onClick={() => setActiveTab('status')}
          className={`flex-1 sm:px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'status' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Saldos Atuais
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 sm:px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Extrato Completo
        </button>
      </div>

      {activeTab === 'status' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-sky-100/20 overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
              <Search size={20} className="text-slate-300" />
              <input 
                type="text" 
                placeholder="FILTRAR NA LISTA OFICIAL..." 
                className="w-full bg-transparent outline-none font-black text-[10px] uppercase placeholder:text-slate-300"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="px-8 py-6">Item de Estoque</th>
                    <th className="px-8 py-6 text-center">Unidade</th>
                    <th className="px-8 py-6 text-center">Saldo em Mãos</th>
                    <th className="px-8 py-6 text-right no-print">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {inventoryData.map((item, idx) => (
                    <tr key={idx} className={`hover:bg-sky-50/20 transition-all group ${!item.isActivated ? 'opacity-60' : ''}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm transition-transform ${item.isActivated ? 'text-sky-500 group-hover:scale-110' : 'text-slate-300'}`}>
                             <ShoppingBag size={18} />
                          </div>
                          <div>
                             <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{item.name}</p>
                             <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                               {item.isActivated ? 'ITEM ATIVO NO SISTEMA' : 'ITEM PENDENTE DE ATIVAÇÃO'}
                             </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="px-4 py-1.5 bg-slate-100 rounded-full text-[8px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                          {item.unit}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex flex-col items-center">
                           <span className={`text-xl font-black ${!item.isActivated ? 'text-slate-200' : (Number(item.dbProduct?.current_quantity) || 0) > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                             {item.isActivated ? (Number(item.dbProduct?.current_quantity) || 0).toLocaleString('pt-BR') : '--'}
                           </span>
                           <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">VOLUMES</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right no-print">
                         {item.isActivated ? (
                            <button 
                              onClick={() => openMovementForProduct(item.dbProduct!.id)}
                              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-sky-500 transition-all shadow-lg active:scale-95"
                            >
                              Movimentar
                            </button>
                         ) : (
                            <button 
                              onClick={() => handleActivateProduct(item.name, item.unit)}
                              className="px-6 py-2.5 bg-sky-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                            >
                              <Plus size={14} /> Ativar Item
                            </button>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
               <Sparkles className="text-amber-500" size={16} />
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                 Os itens acima são os modelos padronizados da <span className="text-sky-500 font-black">GELO BRASIL</span>.
               </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-sky-100/20 overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm"><History size={24} /></div>
              <div>
                 <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Registro de Atividades</h4>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Histórico de todas as entradas e saídas</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-5">Data</th>
                  <th className="px-8 py-5">Produto</th>
                  <th className="px-8 py-5">Movimentação</th>
                  <th className="px-8 py-5 text-center">Quantidade</th>
                  <th className="px-8 py-5">Motivo</th>
                  <th className="px-8 py-5">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {movements.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-20 text-center text-[10px] font-black uppercase text-slate-300">Nenhuma movimentação registrada</td></tr>
                ) : (
                  movements.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 text-[10px] font-black text-slate-500">{new Date(m.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                      <td className="px-8 py-4 font-black text-slate-800 text-[11px] uppercase truncate max-w-[150px]">{getProductName(m.productId)}</td>
                      <td className="px-8 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${m.type === 'IN' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                          {m.type === 'IN' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {m.type === 'IN' ? 'ENTRADA' : 'SAÍDA'}
                        </span>
                      </td>
                      <td className="px-8 py-4 font-black text-slate-800 text-xs text-center">{m.quantity}</td>
                      <td className="px-8 py-4">
                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-[7px] font-black text-slate-500 uppercase tracking-widest">{m.reason}</span>
                      </td>
                      <td className="px-8 py-4 text-[9px] font-bold text-slate-400 uppercase truncate max-w-[200px]">{m.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Movimentação de Estoque */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => !isSubmitting && setIsMovementModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="flex items-center gap-4 mb-10">
               <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-xl">
                  <ArrowRightLeft size={28} />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Movimentação</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Lançamento de Entrada / Saída</p>
               </div>
               <button disabled={isSubmitting} onClick={() => setIsMovementModalOpen(false)} className="ml-auto w-12 h-12 bg-slate-50 text-slate-300 hover:text-rose-500 rounded-2xl flex items-center justify-center transition-all disabled:opacity-30"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleMovementSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Selecionar Produto</label>
                <select 
                  className="w-full h-16 px-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-xs uppercase outline-none focus:ring-4 focus:ring-sky-100/50 transition-all disabled:opacity-50" 
                  value={movementForm.productId || ''} 
                  onChange={e => setMovementForm({...movementForm, productId: e.target.value})}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">-- ESCOLHA O ITEM NA LISTA --</option>
                  {products
                    .filter(p => OFFICIAL_PRODUCTS.some(off => off.name === p.name.toUpperCase()))
                    .map(p => <option key={p.id} value={p.id}>{p.name} (ATUAL: {p.current_quantity})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Operação</label>
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button 
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setMovementForm({...movementForm, type: 'IN'})}
                      className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${movementForm.type === 'IN' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}
                    >
                      Entrada
                    </button>
                    <button 
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setMovementForm({...movementForm, type: 'OUT'})}
                      className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${movementForm.type === 'OUT' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400'}`}
                    >
                      Saída
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Qtd Volumes</label>
                  <input 
                    type="number"
                    step="1"
                    className="w-full h-16 px-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-xl outline-none focus:ring-4 focus:ring-sky-100/50 text-center disabled:opacity-50" 
                    value={movementForm.quantity || ''} 
                    onChange={e => setMovementForm({...movementForm, quantity: e.target.value})} 
                    required
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Motivo</label>
                  <select 
                    className="w-full h-16 px-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-[10px] uppercase outline-none disabled:opacity-50" 
                    value={movementForm.reason} 
                    disabled={isSubmitting}
                    onChange={e => setMovementForm({...movementForm, reason: e.target.value as any})}
                  >
                    <option value="AJUSTE">AJUSTE DE SALDO</option>
                    <option value="PRODUÇÃO">ENTRADA PRODUÇÃO</option>
                    <option value="VENDA">SAÍDA POR VENDA</option>
                    <option value="PERDA">PERDA / QUEBRA</option>
                    <option value="COMPRA">COMPRA FORNECEDOR</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Data do Registro</label>
                  <input 
                    type="date"
                    disabled={isSubmitting}
                    className="w-full h-16 px-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-xs disabled:opacity-50" 
                    value={movementForm.date} 
                    onChange={e => setMovementForm({...movementForm, date: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Observações (Opcional)</label>
                <input 
                  disabled={isSubmitting}
                  className="w-full h-16 px-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-xs uppercase outline-none disabled:opacity-50" 
                  value={movementForm.notes || ''} 
                  onChange={e => setMovementForm({...movementForm, notes: e.target.value.toUpperCase()})} 
                  placeholder="EX: ACERTO DE INVENTÁRIO MENSAL"
                />
              </div>

              <button 
                disabled={isSubmitting}
                className="w-full h-16 bg-slate-900 text-white rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.3em] mt-4 shadow-2xl hover:bg-emerald-600 transition-all active:scale-95 border-b-4 border-slate-950 hover:border-emerald-800 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 className="animate-spin" size={18} /> PROCESSANDO...</>
                ) : (
                  'CONFIRMAR LANÇAMENTO'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
