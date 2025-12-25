
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Search, Snowflake, Pencil, X, ChevronLeft, ChevronRight, Scale, FileDown } from 'lucide-react';
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

  const handleQuantityChange = (val: string) => {
    const sanitized = val.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    setQuantity(sanitized);
  };

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleResetMonth = () => {
    setSelectedDate(new Date());
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numericQuantity = parseFloat(quantity);
    if (isNaN(numericQuantity) || !date) return;

    if (editingId) {
      const updatedProduction = production.map(p => 
        p.id === editingId 
          ? { ...p, quantityKg: numericQuantity, date, observation } 
          : p
      );
      onUpdate(updatedProduction);
      setEditingId(null);
    } else {
      const newEntry: Production = {
        id: crypto.randomUUID(),
        quantityKg: numericQuantity,
        date,
        observation
      };
      onUpdate([newEntry, ...production]);
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

  const handleDelete = (id: string) => {
    if (editingId === id) resetForm();
    onUpdate(production.filter(p => p.id !== id));
  };

  const filteredProduction = useMemo(() => {
    return production.filter(p => {
      const d = new Date(p.date + 'T00:00:00');
      const matchesMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      const matchesSearch = p.observation?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.quantityKg.toString().includes(searchTerm);
      return matchesMonth && matchesSearch;
    });
  }, [production, currentMonth, currentYear, searchTerm]);

  const totalProduced = useMemo(() => {
    return filteredProduction.reduce((sum, p) => sum + p.quantityKg, 0);
  }, [filteredProduction]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="print-header">
        <h1 className="text-2xl font-black text-slate-900">Relatório de Fabricação de Gelo</h1>
        <div className="flex justify-between items-end mt-2">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Período: {monthName}</p>
          <p className="text-slate-400 font-medium text-[9px]">Geração: {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Snowflake className="text-sky-500" /> Produção de Gelo
          </h2>
          <p className="text-sm text-slate-500 font-medium">Controle diário de fabricação em KG.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 no-print">
          <button 
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 group"
          >
            <FileDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
            <span className="text-xs uppercase tracking-wider">Exportar PDF</span>
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

          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-1 shadow-sm w-full sm:w-auto">
            <button onClick={handlePrevMonth} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-all active:scale-90 shrink-0">
              <ChevronLeft size={18} />
            </button>
            <button onClick={handleResetMonth} className="flex-1 px-4 py-1 flex flex-col items-center justify-center hover:bg-slate-50 rounded-xl transition-all min-w-[120px]">
              <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest text-center">Mês Base</span>
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
          <form onSubmit={handleAdd} className={`bg-white p-6 rounded-3xl border ${editingId ? 'border-indigo-400 ring-2 ring-indigo-50' : 'border-slate-200'} shadow-sm lg:sticky lg:top-8 transition-all`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                {editingId ? <Pencil className="text-indigo-600" size={18} /> : <Plus className="text-indigo-600" size={18} />}
                {editingId ? 'Editar Produção' : 'Novo Lançamento'}
              </h3>
              {editingId && (
                <button type="button" onClick={resetForm} className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 flex items-center gap-1">
                  <X size={14} /> Cancelar
                </button>
              )}
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Quantidade (KG)</label>
                <div className="relative">
                   <input 
                    type="text" 
                    inputMode="decimal"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all font-mono font-bold"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">KG</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Data da Produção</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Observação (Opcional)</label>
                <textarea 
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Ex: Turno da manhã, máquina 02..."
                  className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all resize-none"
                />
              </div>

              <button 
                type="submit"
                className={`w-full h-12 ${editingId ? 'bg-indigo-600' : 'bg-slate-900'} text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95`}
              >
                <Snowflake size={20} /> {editingId ? 'Atualizar Registro' : 'Salvar Produção'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50/50 no-print">
              <Search className="text-slate-400 mr-2" size={18} />
              <input 
                type="text"
                placeholder="Filtrar por observação ou quantidade..."
                className="bg-transparent border-none outline-none text-sm w-full h-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Quantidade</th>
                    <th className="px-6 py-4">Observação</th>
                    <th className="px-6 py-4 text-center no-print">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProduction.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                        Nenhum registro de produção encontrado para este mês.
                      </td>
                    </tr>
                  ) : (
                    filteredProduction.map((p) => (
                      <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${editingId === p.id ? 'bg-indigo-50/50' : ''}`}>
                        <td className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                          {new Date(p.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-sky-600 whitespace-nowrap">
                            {p.quantityKg.toLocaleString('pt-BR')} KG
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-medium text-slate-500 truncate max-w-[200px]" title={p.observation}>
                            {p.observation || '-'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center no-print">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleEdit(p)}
                              className={`p-2 rounded-xl transition-all ${editingId === p.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'}`}
                              title="Editar"
                            >
                              <Pencil size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(p.id)}
                              className="p-2 text-slate-300 hover:text-rose-500 bg-slate-50 rounded-xl transition-all"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="print-footer">
        Gestão de Produção - Relatório Formal A4.
      </div>
    </div>
  );
};

export default ProductionView;
