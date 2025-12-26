
import React, { useState } from 'react';
import { Truck, Plus, Trash2 } from 'lucide-react';
import { Vehicle } from '../types';

interface Props {
  vehicles: Vehicle[];
  onUpdate: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
}

const FleetView: React.FC<Props> = ({ vehicles, onUpdate, onDelete }) => {
  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [year, setYear] = useState('');

  const handlePlateChange = (val: string) => {
    const sanitized = val.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (sanitized.length <= 8) {
      setPlate(sanitized);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !plate) return;

    onUpdate({
      id: crypto.randomUUID(),
      name,
      plate: plate.trim(),
      modelYear: year || 'N/A'
    });
    
    setName('');
    setPlate('');
    setYear('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-xl lg:text-2xl font-bold text-slate-800">Frota</h2>
        <p className="text-sm text-slate-500">Controle de veículos da empresa.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1">
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-8">
            <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Truck className="text-indigo-600" size={18} /> Cadastrar Veículo
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Nome/Modelo</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Fiat Fiorino"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Placa</label>
                  <input 
                    type="text" 
                    value={plate}
                    onChange={(e) => handlePlateChange(e.target.value)}
                    placeholder="AAA-1234 ou AAA1A23"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all uppercase font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Ano</label>
                  <input 
                    type="text" 
                    value={year}
                    onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="2024"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full h-12 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-2"
              >
                <Plus size={18} /> Salvar Veículo
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-6 py-4">Veículo</th>
                    <th className="px-6 py-4">Placa</th>
                    <th className="px-6 py-4">Ano</th>
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehicles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">Nenhum veículo cadastrado.</td>
                    </tr>
                  ) : (
                    vehicles.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{v.name}</td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-900 text-white px-3 py-1 rounded-md text-[10px] font-mono font-black border border-slate-800 shadow-sm">
                            {v.plate}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-500">{v.modelYear}</td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => onDelete(v.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 bg-slate-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
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

export default FleetView;
