
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
  // Added missing Check icon
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
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  const handlePrint = () => window.print();

  const handlePrevMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleResetMonth = () => setSelectedDate(new Date());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedTotalWeight <= 0 || !date) return;

    const labels: Record<string, string> = {
      '2KG': 'CUBO 2KG',
      '4KG': 'CUBO 4KG',
      '10KG': 'CUBO 10KG',
      '20KG': 'CUBO 20KG',
      'BRITADO10': 'BRITADO 10KG',
      'BRITADO20': 'BRITADO 20KG',
      'CUSTOM': 'PESO PERSONALIZADO'
    };

    const obsWithDetails = `${selectedProductType !== 'CUSTOM' ? `PROD: ${units} UN DE ${labels[selectedProductType]}` : ''} ${observation}`.trim();

    onUpdate({ 
      id: editingId || crypto.randomUUID(), 
      quantityKg: calculatedTotalWeight, 
      date, 
      observation: obsWithDetails.toUpperCase()
    });
    
    resetForm();
  };

  const handleEdit = (p: Production) => {
    if (confirm(`DESEJA EDITAR O REGISTRO DE PRODUÇÃO DE ${p.quantityKg} KG?`)) {
      setEditingId(p.id);
      setSelectedProductType('CUSTOM');
      setCustomWeight(p.quantityKg.toString());
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
    setUnits('');
    setCustomWeight('');
    setSelectedProductType('4KG');
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

  const renderForm = (isModal = false) => (
    <form onSubmit={handleAdd} className={`${isModal ? '' : 'bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-24 lg:top-8'}`}>
      <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3 uppercase text-[10px] tracking-[0.2em] border-b border-slate-100 pb-4 leading-none">
        <Sparkles className="text-sky-500" size={18} /> {editingId ? 'Editar Registro' : 'Lançar Produção'}
      </h3>
      
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Tipo de Pacote (Cubo)</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: '2KG', label: '2 KG' },
              { id: '4KG', label: '4 KG' },
              { id: '10KG', label: '10 KG' },
              { id: '20KG', label: '20 KG' }
            ].map(type => (
              <button 
                key={type.id}
                type="button"
                onClick={() => setSelectedProductType(type.id as any)}
                className={`py-3 rounded-xl text-[9px] font-black border transition-all ${selectedProductType === type.id ? 'bg-sky-500 border-sky-600 text-white shadow-lg shadow-sky-100' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-sky-50'}`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Tipo de Pacote (Britado)</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'BRITADO10', label: 'BRITADO 10KG' },
              { id: 'BRITADO20', label: 'BRITADO 20KG' }
            ].map(type => (
              <button 
                key={type.id}
                type="button"
                onClick={() => setSelectedProductType(type.id as any)}
                className={`py-3 rounded-xl text-[9px] font-black border transition-all ${selectedProductType === type.id ? 'bg-indigo-500 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-indigo-50'}`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {selectedProductType !== 'CUSTOM' ? (
          <div className="space-y-1.5 animate-in slide-in-from-top-2">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Qtd de Pacotes / Unidades</label>
            <div className="relative">
               <Package size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
               <input 
                type="number" 
                placeholder="Ex: 100"
                value={units} 
                onChange={e => setUnits(e.target.value)} 
                className="w-full h-14 pl-12 pr-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl focus:ring-4 focus:ring-sky-50 outline-none transition-all" 
                required 
              />
            </div>
            {calculatedTotalWeight > 0 && (
              <p className="text-[9px] font-black text-emerald-500 uppercase ml-2 mt-2">Cálculo: {calculatedTotalWeight} KG Totais</p>
            )}
          </div>
        ) : (
          <div className="space-y-1.5 animate-in slide-in-from-top-2">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Peso Total (KG)</label>
            <input 
              type="number" 
              value={customWeight} 
              onChange={e => setCustomWeight(e.target.value)} 
              className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl focus:ring-4 focus:ring-sky-50 outline-none transition-all" 
              required 
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Data do Lote</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" 
              required 
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Notas Extras</label>
          <input 
            value={observation} 
            onChange={e => setObservation(e.target.value)} 
            placeholder="Turno, observação..."
            className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold uppercase"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            type="submit" 
            className="flex-1 h-16 bg-slate-900 text-white font-black rounded-2xl hover:bg-sky-600 transition-all shadow-xl uppercase text-[10px] tracking-widest active:scale-95"
          >
            {editingId ? 'Atualizar' : 'Salvar Lote'}
          </button>
          {(editingId || isModal) && (
            <button type="button" onClick={resetForm} className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all">
              {isModal ? <X size={24} /> : <RotateCcw size={20} />}
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Gestão de Fabricação</p>
          </div>
          
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

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between no-print">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center shadow-inner">
               <Package size={32} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Fabricação Total do Mês</p>
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{totalProduced.toLocaleString('pt-BR')} KG</h3>
            </div>
         </div>
         <div className="hidden sm:flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <Check size={18} />
            <span className="text-[9px] font-black uppercase tracking-widest">Registros Atualizados</span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="hidden lg:block lg:col-span-1 no-print">
          {renderForm()}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            
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
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5">📅 Data</th>
                    <th className="px-8 py-5 text-sky-600">⚖️ Quantidade</th>
                    <th className="px-8 py-5">📝 Detalhes</th>
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
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(p)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(p)} className="p-2.5 text-rose-300 hover:text-rose-600 hover:bg-white rounded-xl transition-all shadow-sm">
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
