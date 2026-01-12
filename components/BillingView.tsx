
import React, { useMemo, useState } from 'react';
import { 
  HandCoins, 
  Search, 
  User, 
  Hash, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  DollarSign, 
  Phone,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { Delivery, Client, DeliveryStatus } from '../types';

interface Props {
  deliveries: Delivery[];
  clients: Client[];
  onMarkAsPaid: (delivery: Delivery) => Promise<void>;
}

const BillingView: React.FC<Props> = ({ deliveries, clients, onMarkAsPaid }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const pendingDeliveries = useMemo(() => {
    return deliveries
      .filter(d => d.status === DeliveryStatus.ENTREGUE_PENDENTE_PGTO)
      .filter(d => {
        const client = clients.find(c => c.id === d.clientId);
        const searchLower = searchTerm.toLowerCase();
        return !searchTerm || 
          client?.name.toLowerCase().includes(searchLower) ||
          d.sequenceNumber?.toString().includes(searchTerm);
      })
      .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
  }, [deliveries, clients, searchTerm]);

  const totalPending = useMemo(() => {
    return pendingDeliveries.reduce((acc, d) => acc + (d.totalValue || 0), 0);
  }, [pendingDeliveries]);

  const handleConfirmPayment = async (delivery: Delivery) => {
    const client = clients.find(c => c.id === delivery.clientId);
    if (confirm(`CONFIRMAR RECEBIMENTO DE R$ ${delivery.totalValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} DO CLIENTE ${client?.name || '---'}?`)) {
      setIsProcessing(delivery.id);
      try {
        await onMarkAsPaid(delivery);
      } catch (error) {
        console.error(error);
        alert("ERRO AO PROCESSAR PAGAMENTO.");
      } finally {
        setIsProcessing(null);
      }
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 animate-in fade-in duration-500 pb-24 max-w-[1600px] mx-auto uppercase transition-colors min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            <HandCoins size={28} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white leading-none tracking-tighter">COBRANÇA <span className="text-emerald-500">PENDENTE</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Gestão de Recebíveis</p>
          </div>
        </div>
        
        <div className="w-full sm:w-auto flex flex-col items-end">
           <div className="px-6 py-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-right">
              <span className="text-[8px] font-black text-rose-400 uppercase tracking-[0.2em] block mb-1">Total a Receber</span>
              <span className="text-xl font-black text-rose-600 dark:text-rose-400">R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
           </div>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            placeholder="PESQUISAR CLIENTE OU PEDIDO Nº..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-6 bg-transparent outline-none font-black text-[11px] text-slate-700 dark:text-white uppercase placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingDeliveries.map(d => {
          const client = clients.find(c => c.id === d.clientId);
          return (
            <div key={d.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 -mr-12 -mt-12 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
              
              <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
                       <AlertCircle size={24} />
                    </div>
                    <div>
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-800 dark:text-white truncate max-w-[120px]">{client?.name || '---'}</span>
                          <span className="bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded text-[8px] font-black text-slate-400"><Hash size={8} className="inline mr-0.5" />{d.sequenceNumber}</span>
                       </div>
                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Venda em Aberto</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-lg font-black text-rose-600 dark:text-rose-400 leading-none">R$ {d.totalValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <span className="text-[7px] font-black text-slate-300 uppercase tracking-tighter">{new Date(d.scheduledDate + 'T00:00:00').toLocaleDateString()}</span>
                 </div>
              </div>

              <div className="flex-1 space-y-4">
                 <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase">
                       <span className="text-slate-400">Itens do Pedido:</span>
                       <span className="text-slate-800 dark:text-white">{(d.items || []).length} TIPO(S)</span>
                    </div>
                    <div className="max-h-[80px] overflow-y-auto no-scrollbar">
                       {(d.items || []).map((item, idx) => (
                         <div key={idx} className="flex justify-between text-[8px] font-bold uppercase text-slate-500 dark:text-slate-400">
                           <span className="truncate mr-2">PRODUTO EM SINCRONIA...</span>
                           <span className="shrink-0">{item.quantity} UN</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="mt-6 flex gap-2">
                 <a 
                   href={`https://wa.me/55${client?.phone.replace(/\D/g, '')}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm"
                 >
                    <MessageCircle size={24} />
                 </a>
                 <button 
                   onClick={() => handleConfirmPayment(d)}
                   disabled={isProcessing === d.id}
                   className="flex-1 h-14 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
                 >
                    {isProcessing === d.id ? <Clock className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                    BAIXAR RECEBIMENTO
                 </button>
              </div>
            </div>
          );
        })}

        {pendingDeliveries.length === 0 && (
          <div className="col-span-full py-32 text-center opacity-20">
            <HandCoins size={64} className="mx-auto mb-4" />
            <p className="text-[11px] font-black uppercase tracking-[0.3em]">Nenhuma cobrança pendente no momento</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingView;
