
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Search, Snowflake, Pencil, X, ChevronLeft, ChevronRight, Scale, Printer } from 'lucide-react';
import { Production } from '../types';

interface Props {
  production: Production[];
  onUpdate: (production: Production[]) => void;
}

const ProductionView: React.FC<Props> = ({ production, onUpdate }) => {
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
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleResetMonth = () => setSelectedDate(new Date());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numericQuantity = parseFloat(quantity);
    if (isNaN(numericQuantity) || !date) return;

    if (editingId) {
      onUpdate(production.map(p => p.id === editingId ? { ...p, quantityKg: numericQuantity, date, observation } : p));
      setEditingId(null);
    } else {
      onUpdate([{ id: crypto.randomUUID(), quantityKg: numericQuantity, date, observation }, ...production]);
    }
    resetForm();
  };

  const handleEdit = (p: Production) => {
    setEditingId(p.id);
    setQuantity(p.quantityKg.toString());
    setDate(p.date);
    setObservation(p.observation || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setQuantity('');
    setDate(getTodayString());
    setObservation('');
  };

  const filteredProduction = useMemo(() => {
    return production.filter(p => {
      const d = new Date(p.date + 'T00:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [production, currentMonth, currentYear]);

  const totalProduced = useMemo(() => filteredProduction.reduce((sum, p) => sum + p.quantityKg, 0), [filteredProduction]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="print-header">
        <h1 className="text-2xl font-black text-slate-900">Relatório de Produção de Gelo</h1>
        <div className="flex justify-between items-end mt-2">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Período: {monthName}</p>
          <p className="text-slate-400 font-medium text-[9px]">Total Fabricado: {totalProduced.toLocaleString('pt-BR')} KG</p>
        </div>
      </div>

      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Snowflake className="text-sky-500" /> Produção de Gelo
          </h2>
          <p className="text-sm text-slate-500 font-medium">Controle de fabricação em KG.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 no-print">
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
          >
            <Printer size={18} />
            <span className="text-xs uppercase tracking-wider">Imprimir</span>
          </button>

          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
             <div className="bg-sky-50 p-2 rounded-xl text-sky-600">
               <Scale size={20} />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total no Período</p>
               <p className="text-lg font-black text-slate-900">{totalProduced.toLocaleString('pt-BR')} <span className="text-xs font-bold text-slate-400 uppercase">KG</span></p>
             </div>
          </div>

          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-1 shadow-sm w-full sm:w-auto overflow-hidden">
            <button onClick={handlePrevMonth} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-all active:scale-90 shrink-0">
              <ChevronLeft size={18} />
            </button>
            <button onClick={handleResetMonth} className="flex-1 px-4 py-1 flex flex-col items-center justify-center hover:bg-slate-50 rounded-xl transition-all min-w-[130px]">
              <span className="text-xs font-bold text-slate-800 capitalize leading-tight text-center">{monthName}</span>
            </button>
            <button onClick={handleNextMonth} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-all active:scale-90 shrink-0">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1 no-print">
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-8">
            <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
              {editingId ? <Pencil className="text-indigo-600" size={18} /> : <Plus className="text-indigo-600" size={18} />}
              {editingId ? 'Editar Produção' : 'Novo Lançamento'}
            </h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Quantidade (KG)" 
                value={quantity} 
                onChange={e => setQuantity(e.target.value)} 
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" 
                required 
              />
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl" 
                required 
              />
              <textarea 
                placeholder="Observação" 
                value={observation} 
                onChange={e => setObservation(e.target.value)} 
                className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none"
              />
              <button 
                type="submit" 
                className="w-full h-12 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-lg"
              >
                {editingId ? 'Atualizar' : 'Salvar Registro'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Quantidade</th>
                    <th className="px-6 py-4">Observação</th>
                    <th className="px-6 py-4 text-center no-print">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProduction.map((p) => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">{new Date(p.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 text-sm font-black text-sky-600">{p.quantityKg.toLocaleString('pt-BR')} KG</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{p.observation || '-'}</td>
                      <td className="px-6 py-4 text-center no-print">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-indigo-600"><Pencil size={18} /></button>
                          <button onClick={() => onUpdate(production.filter(x => x.id !== p.id))} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={18} /></button>
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
      <div className="print-footer">
        Gerado pelo Ice Control em {new Date().toLocaleString('pt-BR')}
      </div>
    </div>
  );
};

export default ProductionView;
