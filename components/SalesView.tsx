
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
  Printer,
  Zap
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
  const [description, setDescription] = useState('Venda do Dia');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const handlePrint = () => {
    window.print();
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
    setDescription('Venda do Dia');
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
        <h1 className="text-2xl font-black text-slate-900">Relatório de Vendas</h1>
        <div className="flex justify-between items-end mt-2">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Período: {monthName}</p>
        </div>
      </div>

      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Lançamento de Vendas</h2>
          <p className="text-sm text-slate-500 font-medium">Informe o faturamento do dia para controle mensal.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 no-print">
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Printer size={18} />
            <span className="text-xs uppercase tracking-wider">Relatório</span>
          </button>

          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
             <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
               <TrendingUp size={20} />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Mensal</p>
               <p className="text-lg font-black text-slate-900">
                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
               </p>
             </div>
          </div>

          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-1 shadow-sm w-full sm:w-auto">
            <button onClick={handlePrevMonth} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500"><ChevronLeft size={18} /></button>
            <button onClick={handleResetMonth} className="flex-1 px-4 py-1 flex flex-col items-center min-w-[130px]">
              <span className="text-xs font-bold text-slate-800 capitalize">{monthName}</span>
            </button>
            <button onClick={handleNextMonth} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500"><ChevronRight size={18} /></button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1 no-print">
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm lg:sticky lg:top-8 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Zap size={80} className="text-indigo-600" />
            </div>
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
              {editingId ? <Pencil className="text-amber-500" size={16} /> : <Zap className="text-indigo-600" size={16} />}
              Lançamento Rápido
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Descrição</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Valor do Dia</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                    <input 
                      type="text" 
                      inputMode="decimal"
                      value={value}
                      onChange={(e) => handleValueChange(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-14 pl-12 pr-6 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-xl font-black text-slate-900"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Data</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-xl uppercase text-xs tracking-[0.2em]"
              >
                {editingId ? 'Salvar Edição' : 'Confirmar Valor'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50/50 no-print">
              <Search className="text-slate-400 mr-2" size={18} />
              <input 
                type="text"
                placeholder="Filtrar lançamentos..."
                className="bg-transparent border-none outline-none text-sm w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4">Valor</th>
                    <th className="px-6 py-4 text-center no-print">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">
                        {new Date(sale.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">{sale.description}</td>
                      <td className="px-6 py-4 text-sm font-black text-indigo-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.value)}
                      </td>
                      <td className="px-6 py-4 text-center no-print">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(sale)} className="p-2 text-slate-400 hover:text-indigo-600"><Pencil size={18} /></button>
                          <button onClick={() => handleDelete(sale.id)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={18} /></button>
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
    </div>
  );
};

export default SalesView;
