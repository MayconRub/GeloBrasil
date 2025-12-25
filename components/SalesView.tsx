
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  CircleDollarSign, 
  Pencil, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp,
  Calendar,
  FileDown
} from 'lucide-react';
import { Sale } from '../types';

interface Props {
  sales: Sale[];
  onUpdate: (sales: Sale[]) => void;
}

const SalesView: React.FC<Props> = ({ sales, onUpdate }) => {
  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const handlePrint = () => {
    // Timeout pequeno ajuda a limpar a fila de eventos do React antes de abrir o diálogo do sistema
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleValueChange = (val: string) => {
    const sanitized = val.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    setValue(sanitized);
  };

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
    const numericValue = parseFloat(value);
    if (!description || isNaN(numericValue)) return;

    if (editingId) {
      const updatedSales = sales.map(s => 
        s.id === editingId 
          ? { ...s, description, value: numericValue, date } 
          : s
      );
      onUpdate(updatedSales);
      setEditingId(null);
    } else {
      const newSale: Sale = {
        id: crypto.randomUUID(),
        description,
        value: numericValue,
        date
      };
      onUpdate([newSale, ...sales]);
    }

    resetForm();
  };

  const handleEdit = (sale: Sale) => {
    setEditingId(sale.id);
    setDescription(sale.description);
    setValue(sale.value.toString());
    setDate(sale.date);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setDescription('');
    setValue('');
    setDate(getTodayString());
  };

  const handleDelete = (id: string) => {
    if (editingId === id) resetForm();
    onUpdate(sales.filter(s => s.id !== id));
  };

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const d = new Date(s.date + 'T00:00:00');
      const matchesMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      const matchesSearch = s.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesMonth && matchesSearch;
    });
  }, [sales, currentMonth, currentYear, searchTerm]);

  const totalValue = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.value, 0);
  }, [filteredSales]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="print-header">
        <h1 className="text-2xl font-black text-slate-900">Relatório de Faturamento</h1>
        <div className="flex justify-between items-end mt-2">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Período: {monthName}</p>
          <p className="text-slate-400 font-medium text-[9px]">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Lançamento de Vendas</h2>
          <p className="text-sm text-slate-500 font-medium">Gestão de entradas e faturamento.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 no-print">
          {/* Botão de Impressão / PDF */}
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 group"
          >
            <FileDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
            <span className="text-xs uppercase tracking-wider">Exportar PDF</span>
          </button>

          {/* Card de Total Mensal */}
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
             <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
               <TrendingUp size={20} />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendido no Período</p>
               <p className="text-lg font-black text-slate-900">
                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
               </p>
             </div>
          </div>

          {/* Navegador de Meses */}
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-1 shadow-sm w-full sm:w-auto overflow-hidden">
            <button onClick={handlePrevMonth} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-all active:scale-90 shrink-0">
              <ChevronLeft size={18} />
            </button>
            <button onClick={handleResetMonth} className="flex-1 px-4 py-1 flex flex-col items-center justify-center hover:bg-slate-50 rounded-xl transition-all min-w-[130px]">
              <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest text-center">Consultar Mês</span>
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
          <form onSubmit={handleAdd} className={`bg-white p-6 rounded-2xl border ${editingId ? 'border-indigo-400 ring-2 ring-indigo-50' : 'border-slate-200'} shadow-sm lg:sticky lg:top-8 transition-all`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                {editingId ? <Pencil className="text-indigo-600" size={18} /> : <Plus className="text-indigo-600" size={18} />}
                {editingId ? 'Editar Registro' : 'Novo Registro'}
              </h3>
              {editingId && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 flex items-center gap-1"
                >
                  <X size={14} /> Cancelar
                </button>
              )}
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Descrição</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Venda Balcão"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Valor (R$)</label>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => handleValueChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Data</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className={`w-full h-12 ${editingId ? 'bg-indigo-600' : 'bg-slate-900'} text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95`}
              >
                <CircleDollarSign size={20} /> {editingId ? 'Atualizar Venda' : 'Salvar Venda'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50/50 no-print">
              <Search className="text-slate-400 mr-2" size={18} />
              <input 
                type="text"
                placeholder="Pesquisar neste mês..."
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
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4">Valor</th>
                    <th className="px-6 py-4 text-center no-print">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                        Nenhuma venda encontrada para {monthName}.
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map((sale) => (
                      <tr key={sale.id} className={`hover:bg-slate-50 transition-colors ${editingId === sale.id ? 'bg-indigo-50/50' : ''}`}>
                        <td className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                          {new Date(sale.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">{sale.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-indigo-600 whitespace-nowrap">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.value)}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center no-print">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleEdit(sale)}
                              className={`p-2 rounded-xl transition-all ${editingId === sale.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'}`}
                              title="Editar"
                            >
                              <Pencil size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(sale.id)}
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
        Relatório gerado pelo sistema Ice Control Pro - Todos os direitos reservados.
      </div>
    </div>
  );
};

export default SalesView;
