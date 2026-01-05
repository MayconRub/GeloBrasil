
import React, { useState, useMemo } from 'react';
import { 
  UserPlus, Search, Phone, MapPin, 
  Trash2, Pencil, X, MessageCircle,
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
  const [form, setForm] = useState<Partial<Client>>({ 
    type: 'PARTICULAR', 
    street: '', 
    number: '', 
    neighborhood: '', 
    city: 'MONTES CLAROS' 
  });

  const filtered = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const formatPhone = (value: string) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.substring(0, 11);
    if (value.length > 10) return value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    else if (value.length > 6) return value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    else if (value.length > 2) return value.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
    else if (value.length > 0) return value.replace(/^(\d{0,2}).*/, "($1");
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = formatPhone(e.target.value);
    setForm({ ...form, phone: maskedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.street) return;
    onUpdate({
      ...form,
      id: form.id || crypto.randomUUID(),
      created_at: form.created_at || new Date().toISOString()
    } as Client);
    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (c: Client) => {
    setForm(c);
    setIsOpen(true);
  };

  const resetForm = () => {
    setForm({ 
      type: 'PARTICULAR', 
      street: '', 
      number: '', 
      neighborhood: '', 
      city: 'MONTES CLAROS' 
    });
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 pb-20 transition-colors">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">CADASTRO DE <span className="text-sky-500">CLIENTES</span></h2>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Base de Dados e CRM</p>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl dark:shadow-none active:scale-95 transition-all"
        >
          <UserPlus size={18} /> Novo Cliente
        </button>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 flex items-center gap-4">
          <Search size={20} className="text-slate-300 dark:text-slate-600" />
          <input 
            type="text" 
            placeholder="BUSCAR NOME, RUA, BAIRRO OU CIDADE..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none font-black text-[10px] uppercase dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filtered.map(c => (
            <div key={c.id} className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 group hover:border-sky-200 dark:hover:border-sky-900 transition-all">
               <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.type === 'REVENDEDOR' ? 'bg-indigo-500 text-white' : 'bg-sky-500 text-white shadow-lg dark:shadow-none'}`}>
                    {c.type === 'REVENDEDOR' ? <Building2 size={24} /> : <User size={24} />}
                  </div>
                  <div className="flex gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(c)} className="p-2 text-slate-300 dark:text-slate-600 hover:text-sky-500 transition-all"><Pencil size={18} /></button>
                    <button onClick={() => onDelete(c.id)} className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-all"><Trash2 size={18} /></button>
                  </div>
               </div>
               <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase leading-tight truncate">{c.name}</h4>
               <span className={`inline-block px-2 py-0.5 rounded text-[7px] font-black mt-1 ${c.type === 'REVENDEDOR' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500' : 'bg-sky-50 dark:bg-sky-900/30 text-sky-500'}`}>
                 {c.type}
               </span>

               <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3 text-slate-500 dark:text-slate-400">
                    <MapPin size={14} className="shrink-0 text-slate-300 dark:text-slate-700 mt-0.5" />
                    <div className="text-[9px] font-bold uppercase leading-relaxed">
                      <p>{c.street}, {c.number}</p>
                      <p>{c.neighborhood} - {c.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <Phone size={14} className="shrink-0 text-slate-300 dark:text-slate-700" />
                      <p className="text-[9px] font-bold uppercase">{c.phone}</p>
                    </div>
                    <a 
                      href={`https://wa.me/55${c.phone.replace(/\D/g, '')}`} 
                      target="_blank"
                      className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
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
          <div className="absolute inset-0 bg-slate-900/90 dark:bg-black/95 backdrop-blur-sm transition-all" onClick={() => { setIsOpen(false); resetForm(); }} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl dark:shadow-none border border-transparent dark:border-slate-800 relative animate-in zoom-in-95">
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-8">{form.id ? 'Editar Cliente' : 'Cadastrar Cliente'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2">Nome Completo / Fantasia</label>
                <input 
                  className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-xs uppercase dark:text-white" 
                  value={form.name || ''} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2">Telefone (WhatsApp)</label>
                  <input 
                    type="tel"
                    placeholder="(00) 00000-0000"
                    className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-xs dark:text-white" 
                    value={form.phone || ''} 
                    onChange={handlePhoneChange} 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2">Tipo de Cliente</label>
                  <select 
                    className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-[10px] uppercase dark:text-white" 
                    value={form.type} 
                    onChange={e => setForm({...form, type: e.target.value as any})}
                  >
                    <option value="PARTICULAR">PARTICULAR</option>
                    <option value="REVENDEDOR">REVENDEDOR</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4">Endereço de Entrega</p>
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-3 space-y-1.5">
                    <label className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2">Rua / Logradouro</label>
                    <input className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs uppercase dark:text-white" value={form.street || ''} onChange={e => setForm({...form, street: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2">Nº</label>
                    <input className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs dark:text-white" value={form.number || ''} onChange={e => setForm({...form, number: e.target.value})} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2">Bairro</label>
                    <input className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs uppercase dark:text-white" value={form.neighborhood || ''} onChange={e => setForm({...form, neighborhood: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2">Cidade</label>
                    <input className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs uppercase dark:text-white" value={form.city || ''} onChange={e => setForm({...form, city: e.target.value})} required />
                  </div>
                </div>
              </div>

              <button className="w-full h-14 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-6 shadow-xl dark:shadow-none">SALVAR CADASTRO</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsView;
