
import React, { useState } from 'react';
import { Plus, Trash2, Search, CircleDollarSign, Pencil, X } from 'lucide-react';
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

  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !value) return;

    if (editingId) {
      const updatedSales = sales.map(s => 
        s.id === editingId 
          ? { ...s, description, value: parseFloat(value), date } 
          : s
      );
      onUpdate(updatedSales);
      setEditingId(null);
    } else {
      const newSale: Sale = {
        id: crypto.randomUUID(),
        description,
        value: parseFloat(value),
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

  const filteredSales = sales.filter(s => 
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-xl lg:text-2xl font-bold text-slate-800">Lançamento de Vendas</h2>
        <p className="text-sm text-slate-500">Registre suas entradas diárias.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1">
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
                    type="number" 
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0,00"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
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
            <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50/50">
              <Search className="text-slate-400 mr-2" size={18} />
              <input 
                type="text"
                placeholder="Filtrar por nome..."
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
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                        Nenhuma venda encontrada.
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
                        <td className="px-6 py-4 text-center">
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
    </div>
  );
};

export default SalesView;
