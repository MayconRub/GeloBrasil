
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Trash2, Search, Pencil, TrendingUp, DollarSign, ArrowUpRight, LayoutList, Save, Check, X, User, ShoppingBag, Minus, Package, ArrowRight, Calendar, Clock, Loader2, ChevronDown, ChevronUp, Lock, Info, Truck, UserCircle, Calculator, Printer, FileText
} from 'lucide-react';
import { Sale, AppSettings, MonthlyGoal, Client, SaleItem, Product, Delivery, Employee } from '../types';

interface Props {
  sales: Sale[];
  onUpdate: (sale: Sale) => void;
  onDelete: (id: string) => void;
  settings?: AppSettings;
  monthlyGoals: MonthlyGoal[];
  onUpdateMonthlyGoal: (goal: MonthlyGoal) => void;
  clients: Client[];
  products: Product[];
  deliveries: Delivery[];
  employees: Employee[];
}

const SalesView: React.FC<Props> = ({ sales, onUpdate, onDelete, settings, clients, products, deliveries, employees }) => {
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const getFirstDayOfMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  };

  const getLastDayOfMonth = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  };

  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [searchTerm, setSearchTerm] = useState('');

  const [description, setDescription] = useState('VENDA BALCÃO');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [clientId, setClientId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemUnitPrice, setItemUnitPrice] = useState('');

  const handleShortcutToday = () => { setStartDate(getTodayString()); setEndDate(getTodayString()); };
  const handleShortcutMonth = () => { setStartDate(getFirstDayOfMonth()); setEndDate(getLastDayOfMonth()); };

  const maskCurrency = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (!digits) return "";
    const amount = parseFloat(digits) / 100;
    return new Intl.NumberFormat('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(amount);
  };

  useEffect(() => {
    if (items.length > 0) {
      const total = items.reduce((acc, item) => acc + (item.quantity * (item.unitPrice || 0)), 0);
      if (total > 0) {
        setValue(total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
      }
    }
  }, [items]);

  useEffect(() => {
    if (selectedProductId && clientId) {
      const client = clients.find(c => c.id === clientId);
      const customPrice = client?.product_prices?.[selectedProductId];
      if (customPrice) {
        setItemUnitPrice(customPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
      } else {
        setItemUnitPrice('');
      }
    } else {
      setItemUnitPrice('');
    }
  }, [selectedProductId, clientId, clients]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
    if (isNaN(numericValue)) return;
    onUpdate({ 
      id: editingId || crypto.randomUUID(), 
      description: description.toUpperCase(), 
      value: numericValue, 
      date, 
      clientId: clientId || undefined, 
      items: items.length > 0 ? items : undefined 
    });
    resetForm();
  };

  const handleEdit = (sale: Sale) => {
    if (sale.description.includes('ENTREGA CONCLUÍDA')) {
        alert("ESTA VENDA FOI GERADA PELA LOGÍSTICA. PARA ALTERAR, VÁ AO MÓDULO DE ENTREGAS.");
        return;
    }
    setEditingId(sale.id);
    setDescription(sale.description);
    setValue(sale.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    setDate(sale.date);
    setClientId(sale.clientId || '');
    const savedItems = sale.items || [];
    setItems([...savedItems]);
    setShowCatalog(savedItems.length > 0);
    setIsMobileFormOpen(true);
  };

  const resetForm = () => {
    setEditingId(null); setDescription('VENDA BALCÃO'); setValue(''); setDate(getTodayString()); setClientId(''); setItems([]); setIsMobileFormOpen(false); setShowCatalog(false);
  };

  const filteredSales = useMemo(() => {
    return sales
      .filter(s => {
        const matchesDate = s.date >= startDate && s.date <= endDate;
        const clientName = clients.find(c => c.id === s.clientId)?.name || 'AVULSO';
        return matchesDate && (!searchTerm || (s.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || (clientName || '').toLowerCase().includes(searchTerm.toLowerCase()));
      })
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return (a.created_at || '').localeCompare(b.created_at || '');
      });
  }, [sales, startDate, endDate, searchTerm, clients]);

  const getClientName = (id?: string) => clients.find(c => c.id === id)?.name || 'AVULSO';
  const getProductName = (id: string) => products.find(p => p.id === id)?.nome || 'PRODUTO';

  const handleAddItem = () => {
    const qty = parseInt(itemQuantity);
    const uPrice = parseFloat(itemUnitPrice.replace(/\./g, '').replace(',', '.'));
    if (!selectedProductId || isNaN(qty) || qty <= 0) return;
    const newItems = [...items];
    const existingIdx = newItems.findIndex(i => i.productId === selectedProductId);
    if (existingIdx > -1) {
      newItems[existingIdx].quantity += qty;
      if (!isNaN(uPrice)) newItems[existingIdx].unitPrice = uPrice;
    } else {
      newItems.push({ productId: selectedProductId, quantity: qty, unitPrice: isNaN(uPrice) ? undefined : uPrice });
    }
    setItems(newItems);
    setSelectedProductId('');
    setItemQuantity('1');
    setItemUnitPrice('');
  };

  const handlePrintSaleReceipt = async (s: Sale) => {
    const client = clients.find(c => c.id === s.clientId);
    const saleItemsList = (s.items || []).map(item => {
      const p = products.find(prod => prod.id === item.productId);
      return `${String(item.quantity).padStart(3, ' ')} UN - ${p?.nome || 'PRODUTO'}`;
    }).join('\n');
    const qrUrl = settings?.pixKey ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(settings.pixKey)}` : '';
    if (qrUrl) await new Promise((resolve) => { const img = new Image(); img.src = qrUrl; img.onload = resolve; img.onerror = resolve; });
    const timeStr = s.created_at ? new Date(s.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';
    const receiptText = `\n========================================\n             ${settings?.companyName || 'GELO BRASIL'}\n========================================\n         COMPROVANTE DE VENDA\n----------------------------------------\nCLIENTE: ${client?.name || 'CONSUMIDOR AVULSO'}\n${client ? `ENDERECO: ${client.street || ''}, ${client.number || ''}\nBAIRRO: ${client.neighborhood || ''}\n` : ''}\n----------------------------------------\nDATA: ${new Date(s.date + 'T00:00:00').toLocaleDateString('pt-BR')}\nHORA: ${timeStr}\n----------------------------------------\nDESCRIÇÃO: ${s.description}\n----------------------------------------\n${saleItemsList ? `ITENS:\n${saleItemsList}\n----------------------------------------` : ''}\nVALOR TOTAL: R$ ${s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n----------------------------------------\n\n________________________________________\n           ASSINATURA / VISTO\n\n`.trim();
    const printWindow = window.open('', '_blank', 'width=400,height=800');
    if (printWindow) {
      const pixContent = settings?.pixKey ? `<div class="qrcode-container"><img src="${qrUrl}" /></div>` : '';
      printWindow.document.write(`<html><head><title>VENDA - ${settings?.companyName}</title><style>@font-face { font-family: 'ReceiptFont'; src: local('Courier New'), local('Courier'); } body { font-family: 'ReceiptFont', monospace; font-size: 13px; width: 80mm; margin: 0; padding: 5px; white-space: pre-wrap; text-transform: uppercase; color: black; background: white; } .centered { text-align: center; display: block; width: 100%; } .qrcode-container { width: 100%; text-align: center; margin: 15px 0; } .qrcode-container img { width: 150px; height: 150px; image-rendering: pixelated; } .disclaimer { text-align: center; font-weight: bold; font-size: 10px; margin-top: 15px; padding: 5px; border-top: 1px dashed #ccc; white-space: nowrap; } @media print { body { margin: 0; padding: 0; width: 80mm; } @page { margin: 0; size: 80mm auto; } }</style></head><body>${receiptText}${pixContent}<div class="centered">========================================<br/>OBRIGADO PELA PREFERENCIA</div><div class="disclaimer">ESTE DOCUMENTO NÃO É UM COMPROVANTE FISCAL</div><script>window.onload = function() { setTimeout(function() { window.focus(); window.print(); window.close(); }, 300); };</script></body></html>`);
      printWindow.document.close();
    }
  };

  const handlePrintReport = () => {
    const totalValue = filteredSales.reduce((acc, sale) => acc + sale.value, 0);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const rows = filteredSales.map(s => `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(s.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 800;">${s.description}</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${getClientName(s.clientId)}</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">R$ ${s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>`).join('');
    printWindow.document.write(`<html><head><title>RELATÓRIO DE VENDAS - ${settings?.companyName}</title><style>body { font-family: 'Plus Jakarta Sans', sans-serif; text-transform: uppercase; padding: 40px; color: #1e293b; } .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; } h1 { margin: 0; font-size: 24px; font-weight: 900; } .period { font-size: 12px; color: #64748b; margin-top: 5px; } table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; } th { text-align: left; padding: 10px; border-bottom: 2px solid #eee; color: #64748b; font-size: 10px; } .total-container { margin-top: 40px; text-align: right; border-top: 2px solid #000; padding-top: 20px; } .total-label { font-size: 12px; font-weight: 800; color: #64748b; } .total-value { font-size: 24px; font-weight: 900; color: #10b981; margin-top: 5px; } @media print { .no-print { display: none; } }</style></head><body><div class="header"><h1>RELATÓRIO DE VENDAS</h1><div class="period">${settings?.companyName}</div><div class="period">PERÍODO: ${new Date(startDate + 'T00:00:00').toLocaleDateString()} ATÉ ${new Date(endDate + 'T00:00:00').toLocaleDateString()}</div></div><table><thead><tr><th>DATA</th><th>DESCRIÇÃO</th><th>CLIENTE</th><th style="text-align: right;">VALOR</th></tr></thead><tbody>${rows}</tbody></table><div class="total-container"><div class="total-label">VALOR TOTAL DO PERÍODO</div><div class="total-value">R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div><div class="no-print" style="margin-top: 40px; text-align: center;"><button onclick="window.print()" style="padding: 12px 30px; background: #000; color: #fff; border: none; border-radius: 8px; font-weight: 900; cursor: pointer;">IMPRIMIR RELATÓRIO</button></div></body></html>`);
    printWindow.document.close();
  };

  const renderFormContent = () => (
    <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all h-fit">
      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0">
          <DollarSign size={20} />
        </div>
        <div className="min-w-0">
           <h3 className="text-lg lg:text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none truncate">
             {editingId ? 'EDITAR' : 'LANÇAR'} <span className="text-emerald-500">VENDA</span>
           </h3>
           <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Registro de Faturamento</p>
        </div>
      </div>
      
      <form onSubmit={handleAdd} className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="space-y-1.5">
              <label className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase ml-2">Cliente</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full h-12 lg:h-14 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase outline-none dark:text-white">
                <option value="">BALCÃO (AVULSO)</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
           </div>
           <div className="space-y-1.5">
              <label className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase ml-2">Data</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-12 lg:h-14 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl lg:rounded-2xl font-bold text-xs dark:text-white" required />
           </div>
        </div>

        <div className="space-y-1.5">
           <label className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Valor R$</label>
           <div className="relative">
              <input placeholder="R$ 0,00" value={value ? `R$ ${value}` : ''} onChange={e => setValue(maskCurrency(e.target.value))} className="w-full h-16 lg:h-20 px-6 lg:px-8 bg-emerald-50/20 dark:bg-slate-950 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-2xl lg:rounded-[2rem] text-2xl lg:text-3xl font-black text-emerald-600 outline-none" required />
           </div>
        </div>

        <button type="button" onClick={() => setShowCatalog(!showCatalog)} className={`w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all ${showCatalog ? 'bg-sky-50 border-sky-200 text-sky-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          <Package size={16} /><span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest">{showCatalog ? 'RECOLHER' : 'DETALHAR ITENS'}</span>
        </button>

        {showCatalog && (
          <div className="bg-slate-50 dark:bg-slate-950/80 p-4 lg:p-6 rounded-2xl lg:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-3">
             <select className="w-full h-10 px-3 bg-white dark:bg-slate-900 border rounded-lg font-black text-[9px] uppercase dark:text-white" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                <option value="">PRODUTO...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="QTD" className="w-full h-10 bg-white dark:bg-slate-900 border rounded-lg text-center font-black text-xs dark:text-white" value={itemQuantity} onChange={e => setItemQuantity(e.target.value)} min="1"/>
                  <input placeholder="PREÇO" value={itemUnitPrice} onChange={e => setItemUnitPrice(maskCurrency(e.target.value))} className="w-full h-10 px-3 bg-white dark:bg-slate-900 border rounded-lg font-black text-xs text-emerald-600" />
              </div>
              <button type="button" onClick={handleAddItem} className="w-full h-10 bg-sky-500 text-white rounded-lg font-black text-[9px] uppercase">Adicionar</button>
              <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                {items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-900 p-2 rounded-lg border text-[9px] uppercase">
                    <span className="truncate flex-1 font-black mr-2">{getProductName(it.productId)}</span>
                    <button type="button" onClick={() => setItems(items.filter((_,i)=>i!==idx))} className="text-rose-400 p-1"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
          </div>
        )}

        <button type="submit" className="w-full h-16 lg:h-20 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl lg:rounded-[2.2rem] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">
          {editingId ? 'SALVAR ALTERAÇÕES' : 'CONCLUIR VENDA'}
        </button>
      </form>
    </div>
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto transition-colors uppercase bg-[#f8fafc] dark:bg-slate-950 min-h-screen overflow-x-hidden">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <div className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-900 dark:bg-slate-800 text-white rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shrink-0"><TrendingUp size={24} /></div>
           <h2 className="text-xl lg:text-3xl font-black text-slate-800 dark:text-white leading-none uppercase tracking-tighter">VENDAS <span className="text-sky-500">DIÁRIAS</span></h2>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button onClick={handlePrintReport} className="flex-1 sm:flex-none px-4 lg:px-6 h-12 lg:h-14 bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl lg:rounded-2xl font-black text-[9px] lg:text-[10px] uppercase shadow-sm flex items-center justify-center gap-2 active:scale-95">
            <FileText size={16} className="text-sky-500" /> <span>RELATÓRIO</span>
          </button>
          <button onClick={() => { resetForm(); setIsMobileFormOpen(true); }} className="lg:hidden flex-1 h-12 bg-sky-500 text-white rounded-xl flex items-center justify-center gap-2 font-black text-[9px] shadow-xl active:scale-90"><Plus size={16} /> NOVA VENDA</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
        <div className="hidden lg:block">
           {renderFormContent()}
        </div>

        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {/* Filtros Padronizados para Mobile */}
          <div className="flex flex-col gap-2 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm no-print">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-lg px-2 h-10 border border-slate-100 dark:border-slate-800">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none outline-none text-[9px] font-bold text-slate-700 dark:text-slate-200 w-full" />
              </div>
              <ArrowRight size={12} className="text-slate-300 shrink-0" />
              <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-lg px-2 h-10 border border-slate-100 dark:border-slate-800">
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none outline-none text-[9px] font-bold text-slate-700 dark:text-slate-200 w-full" />
              </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="text" placeholder="PESQUISAR..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-10 pl-9 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg text-[9px] font-black uppercase outline-none dark:text-white" />
                </div>
                <div className="flex gap-1">
                   <button onClick={handleShortcutToday} className="px-3 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg text-[8px] font-black uppercase text-slate-500">Hoje</button>
                   <button onClick={handleShortcutMonth} className="px-3 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg text-[8px] font-black uppercase text-slate-500">Mês</button>
                </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] lg:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Versão Desktop - Tabela Original */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-300 text-[8px] lg:text-[9px] font-black uppercase tracking-widest border-b border-slate-50 dark:border-slate-800">
                    <th className="px-10 py-6">DETALHES</th>
                    <th className="px-10 py-6 text-right">VALOR</th>
                    <th className="px-10 py-6 text-center">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredSales.map(s => {
                    const isFromDelivery = s.description.includes('ENTREGA CONCLUÍDA');
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-10 py-6">
                           <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase leading-none mb-1">{s.description}</p>
                           <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                              <span>{getClientName(s.clientId)}</span>
                              <span className="text-slate-200">|</span>
                              <span>{new Date(s.date + 'T00:00:00').toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</span>
                           </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <span className="text-sm font-black text-emerald-500 whitespace-nowrap">R$ {s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </td>
                        <td className="px-10 py-6 text-center">
                           <div className="flex justify-center gap-3">
                              {!isFromDelivery && (
                                <>
                                  <button onClick={() => handlePrintSaleReceipt(s)} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 rounded-xl active:scale-95"><Printer size={14}/></button>
                                  <button onClick={() => handleEdit(s)} className="p-2.5 bg-sky-500 text-white rounded-xl active:scale-95"><Pencil size={14}/></button>
                                  <button onClick={() => { if(confirm('EXCLUIR?')) onDelete(s.id); }} className="p-2.5 bg-rose-500 text-white rounded-xl active:scale-95"><Trash2 size={14}/></button>
                                </>
                              )}
                              {isFromDelivery && <Lock size={14} className="text-slate-200" />}
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Versão Mobile - Cards Verticais */}
            <div className="lg:hidden divide-y divide-slate-50 dark:divide-slate-800">
               {filteredSales.map(s => {
                 const isFromDelivery = s.description.includes('ENTREGA CONCLUÍDA');
                 return (
                   <div key={s.id} className="p-4 bg-white dark:bg-slate-900">
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0 flex-1 pr-2">
                          <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-100 uppercase leading-tight truncate">{s.description}</h4>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[120px]">{getClientName(s.clientId)}</span>
                             <span className="text-slate-200 text-[8px]">•</span>
                             <span className="text-[7px] font-bold text-slate-400 uppercase">{new Date(s.date + 'T00:00:00').toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-emerald-500 whitespace-nowrap">R$ {s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-3">
                        {!isFromDelivery ? (
                          <>
                            <button onClick={() => handlePrintSaleReceipt(s)} className="w-9 h-9 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center active:scale-95 border border-slate-100 dark:border-slate-700"><Printer size={14}/></button>
                            <button onClick={() => handleEdit(s)} className="w-9 h-9 bg-sky-50 dark:bg-sky-900/30 text-sky-500 rounded-lg flex items-center justify-center active:scale-95 border border-sky-100 dark:border-sky-900/50"><Pencil size={14}/></button>
                            <button onClick={() => { if(confirm('EXCLUIR?')) onDelete(s.id); }} className="w-9 h-9 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-lg flex items-center justify-center active:scale-95 border border-rose-100 dark:border-rose-900/50"><Trash2 size={14}/></button>
                          </>
                        ) : (
                          <div className="flex items-center gap-1 text-[7px] font-black text-slate-300 uppercase"><Lock size={10}/> GERADA POR LOGÍSTICA</div>
                        )}
                      </div>
                   </div>
                 );
               })}
            </div>

            {filteredSales.length === 0 && (
               <div className="py-20 text-center opacity-20 uppercase font-black text-[8px] tracking-[0.3em]">Sem vendas no período</div>
            )}
          </div>
        </div>
      </div>

      {isMobileFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4">
           <div className="absolute inset-0 bg-slate-900/90 dark:bg-black/98 backdrop-blur-xl" onClick={resetForm} />
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] sm:rounded-[3.5rem] p-5 sm:p-8 shadow-2xl relative border dark:border-slate-800 overflow-y-auto max-h-[90vh] custom-scrollbar">
              <button onClick={resetForm} className="absolute top-6 right-6 text-slate-300 hover:text-rose-500"><X size={28}/></button>
              {renderFormContent()}
           </div>
        </div>
      )}
    </div>
  );
};

export default SalesView;
