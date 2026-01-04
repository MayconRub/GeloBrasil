
import React, { useState, useMemo } from 'react';
import { 
  UserPlus, Search, Phone, MapPin, 
  Trash2, Pencil, X, Save, MessageCircle,
  Building2, User
} from 'lucide-react';
import { Client } from '../types';

interface Props {
  clients: Client[];
  onUpdate: (client: Client) => void;
  onDelete: (id: string) => void;
}

const ClientsView: React.FC<Props> = ({ clients, onUpdate, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState<Partial<Client>>({ type: 'PARTICULAR' });

  const filtered = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    onUpdate({
      ...form,
      id: form.id || crypto.randomUUID(),
      created_at: form.created_at || new Date().toISOString()
    } as Client);
    setIsOpen(false);
    setForm({ type: 'PARTICULAR' });
  };

  const handleEdit = (c: Client) => {
    setForm(c);
    setIsOpen(true);
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 pb-20">
      <header className="flex flex-col sm:row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">CADASTRO DE <span className="text-sky-500">CLIENTES</span></h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Base de Dados e CRM</p>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
        >
          <UserPlus size={18} /> Novo Cliente
        </button>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
          <Search size={20} className="text-slate-300" />
          <input 
            type="text" 
            placeholder="BUSCAR NOME OU ENDEREÇO..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none font-black text-[10px] uppercase"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filtered.map(c => (
            <div key={c.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group hover:border-sky-200 transition-all">
               <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.type === 'REVENDEDOR' ? 'bg-indigo-500 text-white' : 'bg-sky-500 text-white shadow-lg'}`}>
                    {c.type === 'REVENDEDOR' ? <Building2 size={24} /> : <User size={24} />}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(c)} className="p-2 text-slate-300 hover:text-sky-500"><Pencil size={18} /></button>
                    <button onClick={() => onDelete(c.id)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={18} /></button>
                  </div>
               </div>
               <h4 className="font-black text-slate-800 text-sm uppercase leading-tight truncate">{c.name}</h4>
               <span className={`inline-block px-2 py-0.5 rounded text-[7px] font-black mt-1 ${c.type === 'REVENDEDOR' ? 'bg-indigo-50 text-indigo-500' : 'bg-sky-50 text-sky-500'}`}>
                 {c.type}
               </span>

               <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-slate-500">
                    <MapPin size={14} className="shrink-0 text-slate-300" />
                    <p className="text-[9px] font-bold uppercase truncate">{c.address}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Phone size={14} className="shrink-0 text-slate-300" />
                      <p className="text-[9px] font-bold uppercase">{c.phone}</p>
                    </div>
                    <a 
                      href={`https://wa.me/55${c.phone.replace(/\D/g, '')}`} 
                      target="_blank"
                      className="p-2 bg-emerald-50 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      <MessageCircle size={14} />
                    </a>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-8">{form.id ? 'Editar Cliente' : 'Cadastrar Cliente'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Nome Completo / Fantasia</label>
                <input 
                  className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs uppercase" 
                  value={form.name || ''} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Telefone (WhatsApp)</label>
                  <input 
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs" 
                    value={form.phone || ''} 
                    onChange={e => setForm({...form, phone: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Tipo</label>
                  <select 
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[10px] uppercase" 
                    value={form.type} 
                    onChange={e => setForm({...form, type: e.target.value as any})}
                  >
                    <option value="PARTICULAR">PARTICULAR</option>
                    <option value="REVENDEDOR">REVENDEDOR</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Endereço de Entrega</label>
                <input 
                  className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs uppercase" 
                  value={form.address || ''} 
                  onChange={e => setForm({...form, address: e.target.value})} 
                  required 
                />
              </div>
              <button className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest mt-4">SALVAR CLIENTE</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsView;
