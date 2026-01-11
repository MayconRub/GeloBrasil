
import React, { useState, useMemo } from 'react';
import { 
  UserPlus, Search, Phone, MapPin, 
  Trash2, Pencil, X, MessageCircle,
  Building2, User, Tag, DollarSign, Save,
  Package, ChevronRight, Calculator
} from 'lucide-react';
import { Client, Product } from '../types';

interface Props {
  clients: Client[];
  products: Product[];
  onUpdate: (client: Client) => void;
  onDelete: (id: string) => void;
}

const ClientsView: React.FC<Props> = ({ clients, products, onUpdate, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [priceForm, setPriceForm] = useState<Record<string, string>>({});
  
  const [form, setForm] = useState<Partial<Client>>({ type: 'PARTICULAR', street: '', number: '', neighborhood: '', city: 'MONTES CLAROS' });

  const filtered = useMemo(() => {
    return clients.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [clients, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...form, id: form.id || crypto.randomUUID(), created_at: form.created_at || new Date().toISOString() } as Client);
    setIsOpen(false);
  };

  const handleSavePrices = () => {
    if (!selectedClient) return;
    const finalPrices: Record<string, number> = {};
    // Fix: Explicitly cast 'val' as string to resolve 'Property replace does not exist on type unknown' error
    Object.entries(priceForm).forEach(([id, val]) => { 
      if (val) finalPrices[id] = parseFloat((val as string).replace(',', '.')); 
    });
    onUpdate({ ...selectedClient, product_prices: finalPrices });
    setIsPriceModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 pb-24 lg:pb-20 transition-colors uppercase bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-auto">
          <h2 className="text-xl sm:text-3xl font-black text-slate-800 dark:text-white uppercase leading-none">Clientes</h2>
          <p className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest">Base de Dados CRM</p>
        </div>
        <button onClick={() => setIsOpen(true)} className="w-full sm:w-auto px-6 h-12 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-black text-[9px] uppercase flex items-center justify-center gap-2 shadow-xl">
          <UserPlus size={18} /> NOVO CLIENTE
        </button>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-[1.8rem] border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50 dark:bg-slate-950/20 flex items-center gap-3">
          <Search size={18} className="text-slate-300" />
          <input type="text" placeholder="BUSCAR NOME..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-transparent outline-none font-black text-[10px] uppercase dark:text-white" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filtered.map(c => (
            <div key={c.id} className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all active:scale-[0.98]">
               <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${c.type === 'REVENDEDOR' ? 'bg-indigo-500' : 'bg-sky-500'}`}>
                    {c.type === 'REVENDEDOR' ? <Building2 size={20} /> : <User size={20} />}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => {setSelectedClient(c); setIsPriceModalOpen(true);}} className="p-2 text-slate-300 hover:text-emerald-500"><Tag size={16} /></button>
                    <button onClick={() => {setForm(c); setIsOpen(true);}} className="p-2 text-slate-300 hover:text-sky-500"><Pencil size={16} /></button>
                    <button onClick={() => onDelete(c.id)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button>
                  </div>
               </div>
               <h4 className="font-black text-slate-800 dark:text-slate-100 text-xs uppercase leading-tight truncate">{c.name}</h4>
               <p className="text-[7px] font-black text-slate-400 mt-1 uppercase tracking-widest">{c.phone} | {c.city}</p>
               
               <div className="mt-4 flex gap-2">
                 <button onClick={() => {setSelectedClient(c); setIsPriceModalOpen(true);}} className="flex-1 h-9 bg-white dark:bg-slate-800 border rounded-lg text-[7px] font-black uppercase flex items-center justify-center gap-2">Preços</button>
                 <a href={`https://wa.me/55${String(c.phone || '').replace(/\D/g, '')}`} target="_blank" className="w-10 h-9 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-lg flex items-center justify-center"><MessageCircle size={14} /></a>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals are already optimized to "Bottom Sheet" in App design patterns */}
      {isPriceModalOpen && selectedClient && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={() => setIsPriceModalOpen(false)} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2rem] p-6 shadow-2xl relative animate-in slide-in-from-bottom duration-500 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-black uppercase mb-6 flex items-center gap-3"><DollarSign className="text-emerald-500"/> Tabela: {selectedClient.name}</h3>
            <div className="space-y-3 mb-6">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl">
                   <div className="min-w-0"><p className="text-[9px] font-black uppercase truncate dark:text-white">{p.nome}</p></div>
                   <input type="text" placeholder="R$ 0,00" className="w-24 h-9 px-3 bg-white dark:bg-slate-950 border rounded-lg font-black text-[10px] dark:text-white text-right" value={priceForm[p.id] || ''} onChange={e => setPriceForm({...priceForm, [p.id]: e.target.value})} />
                </div>
              ))}
            </div>
            <button onClick={handleSavePrices} className="w-full h-14 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase shadow-xl">SALVAR PREÇOS</button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom duration-500">
            <h3 className="text-lg font-black uppercase mb-6">{form.id ? 'Editar' : 'Novo'} Cliente</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
               <input className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border rounded-xl font-bold text-xs uppercase dark:text-white" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="NOME" required />
               <div className="grid grid-cols-2 gap-3">
                  <input className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border rounded-xl font-bold text-xs dark:text-white" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} placeholder="TELEFONE" required />
                  <select className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border rounded-xl font-black text-[10px] uppercase dark:text-white" value={form.type} onChange={e => setForm({...form, type: e.target.value as any})}>
                    <option value="PARTICULAR">PARTICULAR</option>
                    <option value="REVENDEDOR">REVENDEDOR</option>
                  </select>
               </div>
               <div className="grid grid-cols-3 gap-3">
                  <input className="col-span-2 w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border rounded-xl font-bold text-xs uppercase dark:text-white" value={form.street || ''} onChange={e => setForm({...form, street: e.target.value})} placeholder="RUA" required />
                  <input className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border rounded-xl font-bold text-xs dark:text-white" value={form.number || ''} onChange={e => setForm({...form, number: e.target.value})} placeholder="Nº" required />
               </div>
               <button className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase shadow-xl mt-4">SALVAR CADASTRO</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsView;
