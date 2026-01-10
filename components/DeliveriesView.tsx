
import { 
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  User,
  X,
  Clock,
  ArrowRight,
  Pencil,
  Printer,
  Hash,
  UserPlus,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  HandCoins,
  XCircle,
  Ban,
  UserCircle,
  BarChart3,
  PieChart,
  FileText
} from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { Client, Delivery, DeliveryStatus, Employee, Product, Vehicle, AppSettings } from '../types';

interface Props {
  deliveries: Delivery[];
  clients: Client[];
  drivers: Employee[];
  vehicles: Vehicle[];
  products: Product[];
  onUpdate: (delivery: Delivery) => void;
  onDelete: (id: string) => void;
  onAddClient: (client: Client) => Promise<any>;
  settings: AppSettings;
}

const DeliveriesView: React.FC<Props> = ({ deliveries, clients, drivers, vehicles, products, onUpdate, onDelete, onAddClient, settings }) => {
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

  const getNowTimeString = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<DeliveryStatus | 'TODOS'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para Modal de Confirmação de Pagamento
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [deliveryToConfirm, setDeliveryToConfirm] = useState<Delivery | null>(null);

  const [form, setForm] = useState<Partial<Delivery>>({ 
    status: DeliveryStatus.PENDENTE, 
    scheduledDate: getTodayString(),
    scheduledTime: getNowTimeString(),
    items: [],
    totalValue: 0
  });
  
  // Estados para Modo Express (Cadastro Rápido)
  const [isExpressMode, setIsExpressMode] = useState(false);
  const [expressClient, setExpressClient] = useState({
    name: '',
    phone: '',
    street: '',
    number: '',
    neighborhood: '',
    city: 'MONTES CLAROS'
  });

  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [localTotalValue, setLocalTotalValue] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getClient = (id: string) => clients.find(c => c.id === id);
  const getDriver = (id: string) => drivers.find(d => d.id === id);
  const getVehicle = (id: string) => vehicles.find(v => v.id === id);
  const getProduct = (id: string) => products.find(p => p.id === id);

  const handlePrintReceipt = (d: Delivery) => {
    const client = getClient(d.clientId);
    const driver = getDriver(d.driverId);
    const vehicle = getVehicle(d.vehicleId);
    const itemsList = (d.items || []).map(item => {
      const p = getProduct(item.productId);
      return `${String(item.quantity).padStart(3, ' ')} UN - ${p?.name || 'PRODUTO'}`;
    }).join('\n');

    const receiptText = `
========================================
             ${settings.companyName || 'GELO BRASIL'}
========================================
         COMPROVANTE DE ENTREGA
----------------------------------------
PEDIDO Nº: ${d.sequenceNumber || 'PROCESSANDO...'}
----------------------------------------
CLIENTE: ${client?.name || 'NAO INFORMADO'}
ENDERECO: ${client?.street || ''}, ${client?.number || ''}
BAIRRO: ${client?.neighborhood || ''}
CIDADE: ${client?.city || ''}
----------------------------------------
DATA: ${new Date(d.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR')}
HORA: ${d.scheduledTime || '--:--'}
----------------------------------------
MOTORISTA: ${driver?.name || 'NAO INFORMADO'}
VEICULO: ${vehicle?.modelo || ''} (${vehicle?.placa || ''})
----------------------------------------
ITENS DA CARGA:
${itemsList}
----------------------------------------
VALOR TOTAL: R$ ${(d.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
----------------------------------------

ASSINATURA DO CLIENTE:


________________________________________

           PAGAMENTO VIA PIX

`.trim();

    const printWindow = window.open('', '_blank', 'width=400,height=800');
    if (printWindow) {
      const pixContent = settings.pixKey ? `
            <div class="qrcode-container">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(settings.pixKey)}" />
            </div>` : `
            <div class="centered">
              CHAVE PIX NAO CONFIGURADA
            </div>`;

      printWindow.document.write(`
        <html>
          <head>
            <title>PEDIDO ${d.sequenceNumber || ''} - ${settings.companyName}</title>
            <style>
              @font-face {
                font-family: 'ReceiptFont';
                src: local('Courier New'), local('Courier');
              }
              body { 
                font-family: 'ReceiptFont', monospace; 
                font-size: 13px; 
                width: 80mm; 
                margin: 0; 
                padding: 5px;
                white-space: pre-wrap;
                text-transform: uppercase;
                color: black;
                background: white;
              }
              .centered { text-align: center; display: block; width: 100%; }
              .qrcode-container { 
                width: 100%; 
                text-align: center; 
                margin: 15px 0;
              }
              .qrcode-container img {
                width: 150px;
                height: 150px;
                image-rendering: pixelated;
              }
              @media print {
                body { margin: 0; padding: 0; width: 80mm; }
                @page { margin: 0; size: 80mm auto; }
              }
            </style>
          </head>
          <body>
            ${receiptText}
            ${pixContent}
            <div class="centered">
========================================
        OBRIGADO PELA PREFERENCIA
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const filtered = useMemo(() => {
    return deliveries.filter(d => {
      const client = getClient(d.clientId);
      const matchesStatus = activeFilter === 'TODOS' || d.status === activeFilter;
      const deliveryDate = d.scheduledDate;
      const matchesDate = deliveryDate >= startDate && deliveryDate <= endDate;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        client?.name.toLowerCase().includes(searchLower) ||
        client?.street.toLowerCase().includes(searchLower) ||
        d.sequenceNumber?.toString().includes(searchTerm) ||
        d.notes?.toLowerCase().includes(searchLower);
      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [deliveries, activeFilter, startDate, endDate, searchTerm, clients]);

  // Cálculo das estatísticas para o Fechamento
  const closingStats = useMemo(() => {
    const rangeDeliveries = deliveries.filter(d => d.scheduledDate >= startDate && d.scheduledDate <= endDate);
    
    const completed = rangeDeliveries.filter(d => d.status === DeliveryStatus.ENTREGUE);
    const notPaid = rangeDeliveries.filter(d => d.status === DeliveryStatus.ENTREGUE_PENDENTE_PGTO);
    const cancelled = rangeDeliveries.filter(d => d.status === DeliveryStatus.CANCELADO);

    const totalValueCompleted = completed.reduce((acc, d) => acc + (d.totalValue || 0), 0);
    const totalValueNotPaid = notPaid.reduce((acc, d) => acc + (d.totalValue || 0), 0);

    const driverStats = drivers.map(driver => {
      const driverDeliveries = completed.filter(d => d.driverId === driver.id);
      return {
        name: driver.name,
        count: driverDeliveries.length,
        value: driverDeliveries.reduce((acc, d) => acc + (d.totalValue || 0), 0)
      };
    }).filter(s => s.count > 0);

    return {
      completedCount: completed.length,
      completedValue: totalValueCompleted,
      notPaidCount: notPaid.length,
      notPaidValue: totalValueNotPaid,
      cancelledCount: cancelled.length,
      driverStats
    };
  }, [deliveries, startDate, endDate, drivers]);

  const handleShortcutToday = () => { setStartDate(getTodayString()); setEndDate(getTodayString()); };
  const handleShortcutMonth = () => { setStartDate(getFirstDayOfMonth()); setEndDate(getLastDayOfMonth()); };

  const searchedClients = useMemo(() => {
    if (!clientSearch) return [];
    const term = clientSearch.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(term) || c.street.toLowerCase().includes(term)).slice(0, 5);
  }, [clients, clientSearch]);

  const parseCurrency = (val: string): number => {
    if (!val) return 0;
    const sanitized = val.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(sanitized);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let finalClientId = form.clientId;

      if (isExpressMode) {
        if (!expressClient.name || !expressClient.phone || !expressClient.street) {
          alert("PREENCHA OS DADOS DO CLIENTE (NOME, WHATSAPP E RUA)");
          setIsSubmitting(false);
          return;
        }
        
        const newClientId = crypto.randomUUID();
        const newClient: Client = {
          ...expressClient,
          id: newClientId,
          type: 'PARTICULAR',
          created_at: new Date().toISOString()
        };
        
        await onAddClient(newClient);
        finalClientId = newClientId;
      }

      if (!finalClientId || !form.driverId || !form.vehicleId) {
        setIsSubmitting(false);
        return;
      }

      const totalVal = parseCurrency(localTotalValue);

      await onUpdate({ 
        ...form, 
        id: form.id || crypto.randomUUID(), 
        clientId: finalClientId,
        totalValue: totalVal
      } as Delivery);
      
      handleCloseModal();
    } catch (error) {
      console.error(error);
      alert("ERRO AO SALVAR AGENDAMENTO.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setForm({ status: DeliveryStatus.PENDENTE, scheduledDate: getTodayString(), scheduledTime: getNowTimeString(), items: [], totalValue: 0 });
    setClientSearch(''); 
    setLocalTotalValue(''); 
    setIsClientDropdownOpen(false);
    setIsExpressMode(false);
    setIsSubmitting(false);
    setExpressClient({
      name: '',
      phone: '',
      street: '',
      number: '',
      neighborhood: '',
      city: 'MONTES CLAROS'
    });
  };

  const handleEdit = (delivery: Delivery) => {
    const client = clients.find(c => c.id === delivery.clientId);
    setForm(delivery);
    setClientSearch(client?.name || '');
    setLocalTotalValue(delivery.totalValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '');
    setIsOpen(true);
  };

  const selectClient = (client: Client) => {
    setForm({ ...form, clientId: client.id });
    setClientSearch(client.name);
    setIsClientDropdownOpen(false);
  };

  const openStatusConfirmation = (delivery: Delivery) => {
    setDeliveryToConfirm(delivery);
    setShowPaymentConfirm(true);
  };

  const handleConfirmDeliveryWithPayment = async (paid: boolean) => {
    if (!deliveryToConfirm) return;
    
    const newStatus = paid ? DeliveryStatus.ENTREGUE : DeliveryStatus.ENTREGUE_PENDENTE_PGTO;
    
    await onUpdate({ 
      ...deliveryToConfirm, 
      status: newStatus, 
      deliveredAt: new Date().toISOString() 
    });
    
    setShowPaymentConfirm(false);
    setDeliveryToConfirm(null);
  };

  const handleCancelDelivery = async (delivery: Delivery) => {
    if (confirm(`DESEJA CANCELAR O PEDIDO Nº ${delivery.sequenceNumber || ''} DE ${getClient(delivery.clientId)?.name}?`)) {
      await onUpdate({ ...delivery, status: DeliveryStatus.CANCELADO });
    }
  };

  const updateStatus = async (delivery: Delivery, status: DeliveryStatus) => {
    await onUpdate({ ...delivery, status });
  };

  const handlePrintSummary = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=1000');
    if (printWindow) {
      const driverContent = closingStats.driverStats.map(s => `
        <div class="item">
          <span>${s.name}</span>
          <strong>${s.count} Entregas - R$ ${s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
        </div>
      `).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>FECHAMENTO DE ENTREGAS - ${settings.companyName}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #1e293b; }
              .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { margin: 0; text-transform: uppercase; letter-spacing: 2px; }
              .period { color: #64748b; font-size: 14px; margin-top: 5px; font-weight: bold; }
              .section { margin-bottom: 30px; }
              .section h2 { font-size: 14px; text-transform: uppercase; color: #94a3b8; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; margin-bottom: 15px; }
              .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
              .card { background: #f8fafc; padding: 20px; rounded: 15px; border: 1px solid #e2e8f0; }
              .card p { margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 800; }
              .card h3 { margin: 5px 0 0 0; font-size: 24px; font-weight: 900; }
              .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
              .item:last-child { border: none; }
              .item strong { color: #0f172a; }
              .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #cbd5e1; text-transform: uppercase; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>FECHAMENTO DE LOGÍSTICA</h1>
              <div class="period">${new Date(startDate + 'T00:00:00').toLocaleDateString()} ATÉ ${new Date(endDate + 'T00:00:00').toLocaleDateString()}</div>
              <div class="period">${settings.companyName}</div>
            </div>
            
            <div class="section">
              <h2>RESUMO GERAL</h2>
              <div class="grid">
                <div class="card">
                  <p>Entregas Concluídas</p>
                  <h3>${closingStats.completedCount}</h3>
                </div>
                <div class="card">
                  <p>Total Recebido</p>
                  <h3 style="color: #10b981">R$ ${closingStats.completedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                </div>
                <div class="card">
                  <p>Pendentes de Pagamento</p>
                  <h3>${closingStats.notPaidCount} (R$ ${closingStats.notPaidValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</h3>
                </div>
                <div class="card">
                  <p>Pedidos Cancelados</p>
                  <h3>${closingStats.cancelledCount}</h3>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>DESEMPENHO POR MOTORISTA</h2>
              ${driverContent}
            </div>

            <div class="footer">Relatório gerado em ${new Date().toLocaleString()}</div>
            <div class="no-print" style="margin-top: 30px; text-align: center;">
              <button onclick="window.print()" style="padding: 10px 30px; background: #0f172a; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">IMPRIMIR AGORA</button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-4 pb-24 max-w-[1600px] mx-auto overflow-x-hidden transition-colors">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-lg"><Truck size={20} /></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">ENTREGAS</h2>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{settings.companyName} • LOGÍSTICA</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button onClick={() => setShowSummaryModal(true)} className="flex-1 sm:flex-none px-5 h-10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all">
            <BarChart3 size={16} className="text-sky-500" /> <span className="hidden sm:inline">FECHAMENTO</span>
          </button>
          <button onClick={() => setIsOpen(true)} className="flex-1 sm:flex-none px-5 h-10 bg-sky-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
            <Plus size={16} /> <span className="hidden sm:inline">NOVO AGENDAMENTO</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-3 bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm no-print">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-11 border border-slate-100 dark:border-slate-800">
            <span className="text-[8px] font-black text-slate-400 mr-2 uppercase">DE</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-700 dark:text-slate-200 w-full" />
          </div>
          <ArrowRight size={14} className="text-slate-300 shrink-0" />
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 h-11 border border-slate-100 dark:border-slate-800">
            <span className="text-[8px] font-black text-slate-400 mr-2 uppercase">ATÉ</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-700 dark:text-slate-200 w-full" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button onClick={handleShortcutToday} className="px-3 h-9 rounded-lg text-[8px] font-black uppercase hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-all">Hoje</button>
            <button onClick={handleShortcutMonth} className="px-3 h-9 rounded-lg text-[8px] font-black uppercase hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-all">Mês</button>
          </div>
          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input type="text" placeholder="BUSCAR PEDIDO OU CLIENTE..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-11 pl-9 pr-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-sky-50/20 dark:text-white" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {['TODOS', ...Object.values(DeliveryStatus)].map(status => (
          <button 
            key={status} 
            onClick={() => setActiveFilter(status as any)} 
            className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeFilter === status ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-700 border-slate-100 dark:border-slate-800 opacity-60'}`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(d => {
          const client = getClient(d.clientId);
          const driver = getDriver(d.driverId);
          const isOverdue = d.status === DeliveryStatus.ENTREGUE_PENDENTE_PGTO;
          const isCancelled = d.status === DeliveryStatus.CANCELADO;
          const isInRoute = d.status === DeliveryStatus.EM_ROTA;
          
          return (
            <div key={d.id} className={`bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] border flex flex-col h-full transition-all group ${isCancelled ? 'opacity-60 grayscale border-slate-200 dark:border-slate-800 bg-slate-50/30' : d.status === DeliveryStatus.ENTREGUE ? 'border-emerald-100 dark:border-emerald-900/30 shadow-sm' : isOverdue ? 'border-rose-200 dark:border-rose-900/50 shadow-sm' : 'border-slate-100 dark:border-slate-800 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCancelled ? 'bg-slate-200 text-slate-500' : d.status === DeliveryStatus.ENTREGUE ? 'bg-emerald-500 text-white' : isOverdue ? 'bg-rose-500 text-white' : d.status === DeliveryStatus.EM_ROTA ? 'bg-sky-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}><Truck size={18} /></div>
                    <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${isCancelled ? 'bg-slate-100 text-slate-500' : d.status === DeliveryStatus.ENTREGUE ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : isOverdue ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/40' : 'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>{d.status}</span>
                          {d.scheduledTime && !isCancelled && <span className="text-[7px] font-black text-sky-500 uppercase tracking-tighter">{d.scheduledTime}</span>}
                          {d.sequenceNumber && <span className="flex items-center gap-0.5 text-[7px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-1 py-0.5 rounded uppercase tracking-tighter"><Hash size={8}/> {d.sequenceNumber}</span>}
                        </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 no-print">
                    {!isCancelled && <button onClick={() => handlePrintReceipt(d)} title="Imprimir Comprovante" className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"><Printer size={16} /></button>}
                    
                    {/* Função de Confirmar Entrega restrita apenas à aba EM ROTA */}
                    {activeFilter === DeliveryStatus.EM_ROTA && d.status === DeliveryStatus.EM_ROTA && (
                      <button onClick={() => openStatusConfirmation(d)} title="Confirmar Entrega" className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900 rounded-lg"><CheckCircle2 size={16} /></button>
                    )}
                    
                    {/* Função de Confirmar Recebimento restrita apenas à aba NÃO PAGO */}
                    {activeFilter === DeliveryStatus.ENTREGUE_PENDENTE_PGTO && d.status === DeliveryStatus.ENTREGUE_PENDENTE_PGTO && (
                      <button onClick={() => openStatusConfirmation(d)} title="Confirmar Recebimento" className="p-1.5 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900 rounded-lg"><HandCoins size={16} /></button>
                    )}
                    
                    {!isCancelled && (
                      <>
                        <button onClick={() => handleEdit(d)} className="p-1.5 text-slate-300 hover:text-sky-500 transition-colors"><Pencil size={16} /></button>
                        <button onClick={() => handleCancelDelivery(d)} title="Cancelar Entrega" className="p-1.5 text-slate-200 hover:text-rose-500 transition-colors"><XCircle size={16} /></button>
                      </>
                    )}
                  </div>
              </div>

              <div className="flex-1 space-y-3">
                  <div className="min-w-0">
                      <h4 className="font-black text-slate-800 dark:text-slate-100 text-[11px] uppercase truncate leading-tight">{client?.name || 'Cliente Removido'}</h4>
                      <div className="flex items-start gap-1.5 text-[8px] font-bold text-slate-400 mt-1 uppercase truncate"><MapPin size={10} className="shrink-0" /> <span>{client?.street}, {client?.number}</span></div>
                      
                      {/* Informação do Motorista */}
                      <div className={`flex items-center gap-1.5 text-[8px] font-black mt-1.5 uppercase transition-all ${isInRoute ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-600'}`}>
                        <UserCircle size={11} className={`${isInRoute ? 'text-sky-500' : 'text-slate-300'}`} />
                        <span>ENTREGADOR: {driver?.name || 'NÃO ATRIBUÍDO'}</span>
                      </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="space-y-1">
                      {d.items && d.items.length > 0 ? d.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[8px] font-black uppercase">
                          <span className="text-slate-500 dark:text-slate-400 truncate mr-2">{getProduct(item.productId)?.name || 'Produto'}</span>
                          <span className="text-slate-900 dark:text-white shrink-0">{item.quantity} un</span>
                        </div>
                      )) : <p className="text-[8px] text-slate-300 uppercase italic">Carga Vazia</p>}
                    </div>
                  </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-[8px] font-black text-slate-400 uppercase">{new Date(d.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                  <div className={`text-[10px] font-black ${isOverdue ? 'text-rose-600 dark:text-rose-400 animate-pulse' : isCancelled ? 'text-slate-300' : 'text-slate-800 dark:text-white'}`}>R$ {(d.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  {d.status === DeliveryStatus.PENDENTE && !isCancelled && <button onClick={() => updateStatus(d, DeliveryStatus.EM_ROTA)} className="px-3 py-1.5 bg-sky-50 dark:bg-sky-900/30 text-sky-500 rounded-lg text-[8px] font-black uppercase hover:bg-sky-500 hover:text-white transition-all">INICIAR ROTA</button>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Fechamento de Entregas */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/95 dark:bg-black/98 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowSummaryModal(false)} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-3xl relative animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 shrink-0">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl flex items-center justify-center shadow-lg"><FileText size={28} /></div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Fechamento de Logística</h3>
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Período: {new Date(startDate + 'T00:00:00').toLocaleDateString()} — {new Date(endDate + 'T00:00:00').toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowSummaryModal(false)} className="p-2 text-slate-300 dark:text-slate-700 hover:text-rose-500 transition-colors"><X size={24}/></button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50 dark:shadow-none"><CheckCircle2 size={20} /></div>
                      <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Entregue & Pago</span>
                    </div>
                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 leading-none">R$ {closingStats.completedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-[8px] font-black text-emerald-600/50 uppercase mt-2">{closingStats.completedCount} PEDIDOS CONCLUÍDOS</p>
                 </div>
                 <div className="p-6 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-3xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-rose-200/50 dark:shadow-none"><HandCoins size={20} /></div>
                      <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Entregue / Pendente</span>
                    </div>
                    <p className="text-2xl font-black text-rose-700 dark:text-rose-300 leading-none">R$ {closingStats.notPaidValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-[8px] font-black text-rose-600/50 uppercase mt-2">{closingStats.notPaidCount} CLIENTES EM DÉBITO</p>
                 </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                 <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><PieChart size={14} className="text-sky-500" /> Desempenho por Motorista</h4>
                 <div className="space-y-4">
                    {closingStats.driverStats.length === 0 ? (
                      <p className="text-[10px] font-black text-slate-300 uppercase text-center py-4">Sem entregas concluídas no período</p>
                    ) : closingStats.driverStats.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-black text-slate-400 group-hover:text-sky-500 transition-colors">{s.name.charAt(0)}</div>
                           <div>
                              <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase leading-none mb-1">{s.name}</p>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.count} Entregas Realizadas</p>
                           </div>
                        </div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">R$ {s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-slate-100/50 dark:bg-slate-800/20 rounded-2xl">
                 <div className="flex items-center gap-3">
                    <Ban size={18} className="text-slate-300 dark:text-slate-600" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Pedidos Cancelados</span>
                 </div>
                 <span className="text-lg font-black text-slate-400">{closingStats.cancelledCount}</span>
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 dark:border-slate-800 shrink-0">
               <button 
                onClick={handlePrintSummary}
                className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
               >
                 <Printer size={20} /> Imprimir Fechamento
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Pagamento ao Entregar */}
      {showPaymentConfirm && deliveryToConfirm && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/95 dark:bg-black/98 backdrop-blur-xl animate-in fade-in duration-300" />
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 sm:p-10 shadow-3xl relative animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800 text-center">
            <div className="w-20 h-20 bg-sky-50 dark:bg-sky-900/30 text-sky-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
               <DollarSign size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">Confirmação de Recebimento</h3>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed mb-8">
              Você recebeu o pagamento de <span className="text-emerald-600 dark:text-emerald-400">R$ {deliveryToConfirm.totalValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> deste cliente?
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleConfirmDeliveryWithPayment(true)}
                className="w-full h-16 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <CheckCircle2 size={20} /> SIM, RECEBI O VALOR
              </button>
              <button 
                onClick={() => handleConfirmDeliveryWithPayment(false)}
                className="w-full h-16 bg-white dark:bg-slate-950 text-rose-500 border-2 border-rose-100 dark:border-rose-900/30 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <AlertTriangle size={20} /> NÃO, DEIXAR PENDENTE
              </button>
              <button 
                onClick={() => { setShowPaymentConfirm(false); setDeliveryToConfirm(null); }}
                className="w-full h-12 text-slate-300 dark:text-slate-600 font-black text-[8px] uppercase tracking-widest mt-2"
              >
                VOLTAR
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4 md:p-6">
          <div className="absolute inset-0 bg-slate-900/90 dark:bg-black/95 backdrop-blur-md animate-in fade-in duration-300" onClick={handleCloseModal} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl dark:shadow-none relative animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden border border-transparent dark:border-slate-800">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 sm:top-8 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-700 hover:text-rose-500 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all z-[210] active:scale-90"><X size={20} strokeWidth={3} /></button>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-6 sm:mb-10 flex items-center gap-3 shrink-0"><div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-50 dark:bg-sky-900/30 text-sky-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner"><PackageCheck size={24} /></div>{form.id ? 'Editar' : 'Agendar'} <span className="text-sky-500">Entrega</span></h3>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-8 sm:space-y-10 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                 <div className="space-y-6 sm:space-y-8">
                    <div className="flex items-center justify-between px-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest flex items-center gap-2">
                         {isExpressMode ? <UserPlus size={14} className="text-emerald-500" /> : <Search size={14} className="text-sky-500" />}
                         {isExpressMode ? 'Cadastro Rápido' : 'Localizar Cliente'}
                       </label>
                       <button 
                        type="button" 
                        onClick={() => { setIsExpressMode(!isExpressMode); if (!isExpressMode) setForm({...form, clientId: undefined}); }}
                        className={`text-[8px] font-black px-3 py-1 rounded-full border transition-all ${isExpressMode ? 'bg-sky-50 border-sky-200 text-sky-500' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}
                       >
                         {isExpressMode ? 'BUSCAR CADASTRADO' : 'NOVO CLIENTE?'}
                       </button>
                    </div>

                    {!isExpressMode ? (
                      <div className="space-y-2 relative" ref={dropdownRef}>
                        <div className="relative">
                          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" />
                          <input type="text" placeholder="BUSQUE POR NOME OU ENDEREÇO..." className="w-full h-14 sm:h-16 pl-14 pr-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-[11px] uppercase outline-none focus:ring-4 focus:ring-sky-50 dark:focus:ring-sky-900/20 dark:text-white transition-all shadow-inner dark:shadow-none" value={clientSearch} onChange={(e) => { setClientSearch(e.target.value); setIsClientDropdownOpen(true); if (form.clientId) setForm({ ...form, clientId: undefined }); }} onFocus={() => setIsClientDropdownOpen(true)} />
                          {form.clientId && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg"><Check size={18} strokeWidth={3} /></div>}
                        </div>
                        {isClientDropdownOpen && searchedClients.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl dark:shadow-none z-[220] overflow-hidden animate-in fade-in slide-in-from-top-2">
                            {searchedClients.map(c => (
                              <button key={c.id} type="button" onClick={() => selectClient(c)} className="w-full p-4 hover:bg-sky-50 dark:hover:bg-slate-700 text-left border-b border-slate-50 dark:border-slate-950 last:border-0 transition-all flex items-start gap-3">
                                <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900 text-sky-500 flex items-center justify-center shrink-0"><MapPin size={16} /></div>
                                <div className="min-w-0">
                                  <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase leading-none mb-1">{c.name}</p>
                                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase truncate">{c.street}, {c.number}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="space-y-1.5">
                           <input type="text" placeholder="NOME DO CLIENTE" className="w-full h-12 px-5 bg-emerald-50/10 dark:bg-slate-950 border border-emerald-100 dark:border-slate-800 rounded-xl font-bold text-xs uppercase dark:text-white outline-none focus:border-emerald-300" value={expressClient.name} onChange={e => setExpressClient({...expressClient, name: e.target.value.toUpperCase()})} />
                        </div>
                        <div className="space-y-1.5">
                           <input type="text" placeholder="WHATSAPP / CELULAR" className="w-full h-12 px-5 bg-emerald-50/10 dark:bg-slate-950 border border-emerald-100 dark:border-slate-800 rounded-xl font-bold text-xs dark:text-white outline-none focus:border-emerald-300" value={expressClient.phone} onChange={e => setExpressClient({...expressClient, phone: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                           <input type="text" placeholder="RUA" className="col-span-2 h-12 px-5 bg-emerald-50/10 dark:bg-slate-950 border border-emerald-100 dark:border-slate-800 rounded-xl font-bold text-xs uppercase dark:text-white outline-none focus:border-emerald-300" value={expressClient.street} onChange={e => setExpressClient({...expressClient, street: e.target.value.toUpperCase()})} />
                           <input type="text" placeholder="Nº" className="h-12 px-5 bg-emerald-50/10 dark:bg-slate-950 border border-emerald-100 dark:border-slate-800 rounded-xl font-bold text-xs dark:text-white outline-none focus:border-emerald-300" value={expressClient.number} onChange={e => setExpressClient({...expressClient, number: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                           <input type="text" placeholder="BAIRRO" className="w-full h-12 px-5 bg-emerald-50/10 dark:bg-slate-950 border border-emerald-100 dark:border-slate-800 rounded-xl font-bold text-xs uppercase dark:text-white outline-none focus:border-emerald-300" value={expressClient.neighborhood} onChange={e => setExpressClient({...expressClient, neighborhood: e.target.value.toUpperCase()})} />
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2">Motorista</label>
                          <select className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-[10px] uppercase outline-none px-4 dark:text-white" value={form.driverId || ''} onChange={e => setForm({...form, driverId: e.target.value})} required>
                            <option value="">-- MOTORISTA --</option>
                            {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2">Veículo</label>
                          <select className="w-full h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-[10px] uppercase outline-none px-4 dark:text-white" value={form.vehicleId || ''} onChange={e => setForm({...form, vehicleId: e.target.value})} required>
                            <option value="">-- VEÍCULO --</option>
                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.placa}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Data</label>
                          <input type="date" className="w-full h-14 sm:h-16 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-sky-50 dark:focus:ring-sky-900/20 dark:text-white" value={form.scheduledDate || ''} onChange={e => setForm({...form, scheduledDate: e.target.value})} required />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase ml-2 tracking-widest">Hora</label>
                          <input type="time" className="w-full h-14 sm:h-16 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-sky-50 dark:focus:ring-sky-900/20 dark:text-white" value={form.scheduledTime || ''} onChange={e => setForm({...form, scheduledTime: e.target.value})} required />
                        </div>
                      </div>
                    </div>
                 </div>

                 <div className="space-y-8">
                   <div className="bg-slate-50 dark:bg-slate-950/80 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-inner dark:shadow-none relative overflow-hidden">
                     <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10"><ShoppingBag size={18} className="text-sky-500" /> Itens da Carga</h4>
                     <div className="space-y-4 relative z-10">
                       <div className="space-y-1.5">
                         <label className="text-[9px] font-black text-slate-400 dark:text-slate-700 uppercase ml-2">Produto</label>
                         <select className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-[10px] uppercase outline-none dark:text-white" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                           <option value="">ESCOLHER...</option>
                           {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                         </select>
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-[9px] font-black text-slate-400 dark:text-slate-700 uppercase ml-2">Quantidade</label>
                         <div className="flex items-center gap-3">
                           <button type="button" onClick={() => setItemQuantity(q => Math.max(1, parseInt(q) - 1).toString())} className="w-12 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-700 transition-all active:scale-90"><Minus size={20} /></button>
                           <input type="number" className="flex-1 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center font-black text-lg outline-none dark:text-white" value={itemQuantity} onChange={e => setItemQuantity(e.target.value)} min="1"/><button type="button" onClick={() => setItemQuantity(q => (parseInt(q || '0') + 1).toString())} className="w-12 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-700 transition-all active:scale-90"><Plus size={20} /></button>
                         </div>
                       </div>
                       <button type="button" onClick={() => { const qty = parseInt(itemQuantity); if (!selectedProductId || isNaN(qty) || qty <= 0) return; const newItems = [...(form.items || [])]; const idx = newItems.findIndex(i => i.productId === selectedProductId); if (idx > -1) newItems[idx].quantity += qty; else newItems.push({ productId: selectedProductId, quantity: qty }); setForm({ ...form, items: newItems }); setSelectedProductId(''); setItemQuantity('1'); }} disabled={!selectedProductId} className="w-full h-12 bg-sky-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg dark:shadow-none active:scale-95 disabled:opacity-30">Adicionar Item</button>
                     </div>
                     <div className="mt-8 space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar border-t border-slate-200 dark:border-slate-800 pt-6 relative z-10">{form.items?.map((item, idx) => <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none"><div className="min-w-0 flex-1"><p className="text-[10px] font-black text-slate-800 dark:text-white uppercase leading-none truncate mb-1">{getProduct(item.productId)?.name}</p><p className="text-[9px] font-bold text-slate-400 dark:text-slate-700 uppercase">{item.quantity} un</p></div><button type="button" onClick={() => setForm({ ...form, items: (form.items || []).filter(i => i.productId !== item.productId) })} className="w-8 h-8 flex items-center justify-center bg-rose-50 dark:bg-rose-950/30 text-rose-300 dark:text-rose-900 hover:text-rose-500 rounded-lg transition-all"><Trash2 size={14}/></button></div>)}</div>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 dark:text-slate-700 uppercase ml-2 flex items-center gap-2"><DollarSign size={12} className="text-emerald-500" /> Valor Total (R$)</label>
                     <div className="relative">
                       <DollarSign size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" />
                       <input type="text" placeholder="0,00" className="w-full h-16 sm:h-20 pl-16 pr-8 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-[1.5rem] sm:rounded-[2rem] font-black text-2xl sm:text-3xl text-emerald-600 dark:text-emerald-400 outline-none focus:ring-4 focus:ring-emerald-50 dark:focus:ring-emerald-900/30 transition-all placeholder:text-emerald-200 dark:placeholder:text-emerald-950" value={localTotalValue} onChange={e => {
                         const val = e.target.value.replace(/[^0-9,.]/g, '');
                         setLocalTotalValue(val);
                       }} />
                     </div>
                   </div>
                 </div>
              </div>
              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <button 
                  type="submit" 
                  disabled={isSubmitting || (!isExpressMode && !form.clientId) || (isExpressMode && !expressClient.name) || (form.items?.length || 0) === 0} 
                  className={`w-full h-16 sm:h-20 rounded-[1.5rem] sm:rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] transition-all active:scale-95 flex items-center justify-center gap-4 ${(isSubmitting || (!isExpressMode && !form.clientId) || (isExpressMode && !expressClient.name) || (form.items?.length || 0) === 0) ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-700' : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-400 shadow-2xl dark:shadow-none'}`}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <PackageCheck size={24} />}
                  {form.id ? 'ATUALIZAR' : 'CONFIRMAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveriesView;
