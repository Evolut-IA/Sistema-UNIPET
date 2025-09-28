import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, FileText, DollarSign, CheckCircle, XCircle, Clock, Download } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface Client {
  id: string;
  full_name: string;
  email: string;
}

interface Contract {
  id: string;
  contractNumber: string;
  status: string;
  originalStatus: string;
  startDate: string;
  endDate?: string;
  monthlyAmount: string;
  annualAmount?: string;
  planName: string;
  petName: string;
  planId?: string;
  petId?: string;
  billingPeriod?: string;
  // Enhanced payment status information
  isOverdue: boolean;
  daysPastDue: number;
  nextDueDate?: string | null;
  gracePeriodEnds?: string | null;
  statusReason: string;
  statusDescription: string;
  actionRequired?: string | null;
  // Time-based expiration fields
  expirationDate: string | null;
  daysRemaining: number;
  isExpired: boolean;
}

interface PaymentHistory {
  id: string;
  contractNumber: string;
  petName: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  status: string;
  paymentId?: string;
  proofOfSale?: string; // NSU
  authorizationCode?: string;
  tid?: string;
  receivedDate?: string;
  returnCode?: string;
  returnMessage?: string;
  pixQrCode?: string;
  pixCode?: string;
}

interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  paymentAmount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  petName?: string;
  planName?: string;
  proofOfSale?: string;
  authorizationCode?: string;
  tid?: string;
  createdAt: string;
}

export default function CustomerFinancial() {
  const [, navigate] = useLocation();
  const [client, setClient] = useState<Client | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [paymentReceipts, setPaymentReceipts] = useState<PaymentReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptsError, setReceiptsError] = useState<string | null>(null);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndLoadFinancialData = async () => {
      try {
        // Check authentication
        const authResponse = await fetch('/api/clients/me', {
          credentials: 'include'
        });

        if (!authResponse.ok) {
          if (authResponse.status === 401) {
            navigate('/customer/login');
            return;
          }
          throw new Error(`Authentication error: ${authResponse.status}`);
        }

        const authResult = await authResponse.json();
        setClient(authResult.client);

        // Load contracts with error handling
        const contractsResponse = await fetch('/api/clients/contracts', {
          credentials: 'include'
        });

        if (contractsResponse.ok) {
          const contractsResult = await contractsResponse.json();
          setContracts(contractsResult.contracts || []);
        } else if (contractsResponse.status === 401) {
          navigate('/customer/login');
          return;
        } else {
          console.error('Error loading contracts:', contractsResponse.status, contractsResponse.statusText);
          setError(`Erro ao carregar contratos: ${contractsResponse.statusText}`);
        }


        // Load payment receipts (official Cielo receipts)
        setIsLoadingReceipts(true);
        setReceiptsError(null);
        
        const receiptsResponse = await fetch('/api/customer/payment-receipts', {
          credentials: 'include'
        });

        if (receiptsResponse.ok) {
          const receiptsResult = await receiptsResponse.json();
          setPaymentReceipts(receiptsResult.receipts || []);
        } else {
          let errorMessage = 'Erro ao carregar comprovantes';
          
          if (receiptsResponse.status === 401) {
            navigate('/customer/login');
            return;
          } else if (receiptsResponse.status === 404) {
            errorMessage = 'Nenhum comprovante encontrado';
          } else if (receiptsResponse.status === 500) {
            errorMessage = 'Erro interno do servidor ao buscar comprovantes';
          } else {
            errorMessage = `Erro ao carregar comprovantes: ${receiptsResponse.statusText}`;
          }
          
          console.error('Payment receipts error:', receiptsResponse.status, receiptsResponse.statusText);
          setReceiptsError(errorMessage);
        }

      } catch (error) {
        console.error('Error loading financial data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        setError(`Erro ao carregar dados financeiros: ${errorMessage}`);
      } finally {
        setIsLoading(false);

        setIsLoadingReceipts(false);
      }
    };

    checkAuthAndLoadFinancialData();
  }, [navigate]);

  const formatCurrency = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPlanTypeLabel = (billingPeriod: string): string => {
    return billingPeriod === 'annual' ? 'Anual' : 'Mensal';
  };

  const getCurrentContractValue = (contract: Contract): string => {
    // Get the current value from database - use the billing period to determine the correct amount
    const isAnnual = contract.billingPeriod === 'annual';
    const amountStr = isAnnual 
      ? (contract.annualAmount || contract.monthlyAmount) 
      : contract.monthlyAmount;
    const amount = parseFloat(amountStr);
    return formatCurrency(amount);
  };

  const getCountdownDisplay = (daysRemaining: number, isExpired: boolean) => {
    if (isExpired) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: 'rgb(var(--error-background))', color: 'rgb(var(--error))' }}>
          ⚠️ Expirado
        </span>
      );
    }

    if (daysRemaining <= 5) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: 'rgb(var(--error-background))', color: 'rgb(var(--error))' }}>
          🔴 {daysRemaining} dias restantes
        </span>
      );
    }

    if (daysRemaining <= 15) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: 'rgb(var(--warning-background))', color: 'rgb(var(--warning))' }}>
          🟡 {daysRemaining} dias restantes
        </span>
      );
    }

    return (
      <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: 'rgb(var(--success-background))', color: 'rgb(var(--success))' }}>
        🟢 {daysRemaining} dias restantes
      </span>
    );
  };

  const handleRenewalCheckout = (contract: Contract) => {
    // Create a secure renewal URL - let server determine the amount based on contract
    const renewalParams = new URLSearchParams({
      mode: 'renewal',
      contractId: contract.id,
      // Remove amount from client - security issue to allow client to set price
      // Server will determine pricing based on contract and billing period
    });

    // Navigate to checkout with renewal parameters
    console.log('Contract sendo passado para renovação:', contract);
    console.log('Contract ID:', contract.id);
    
    if (!contract.id) {
      console.error('Erro: Contrato sem ID!', contract);
      alert('Erro: ID do contrato não encontrado. Por favor, recarregue a página.');
      return;
    }
    
    navigate(`/customer/renewal-checkout?contractId=${contract.id}`);
  };

  const handleDownloadReceipt = async (receiptId: string) => {
    setDownloadingReceiptId(receiptId);
    try {
      // Use fetch with same-origin policy to preserve session cookies
      const response = await fetch(`/api/customer/payment-receipts/${receiptId}/download`, {
        credentials: 'include',
        method: 'GET'
      });

      if (response.ok) {
        // Get the PDF blob and create a download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `comprovante_${receiptId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (response.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        navigate('/customer/login');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        alert(`Erro ao baixar comprovante: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao baixar comprovante:', error);
      alert('Erro ao tentar baixar o comprovante. Tente novamente.');
    }
      setDownloadingReceiptId(null);
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5" style={{ color: 'var(--text-teal)' }} />;
      case 'pending':
        return <Clock className="w-5 h-5" style={{ color: 'var(--star-active)' }} />;
      case 'cancelled':
      case 'declined':
        return <XCircle className="w-5 h-5" style={{ color: 'rgb(var(--error))' }} />;
      default:
        return <Clock className="w-5 h-5" style={{ color: 'var(--text-dark-secondary)' }} />;
    }
  };



  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovado';
      case 'declined':
        return 'Recusado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-16 flex items-center justify-center" style={{ background: 'var(--bg-cream-light)' }}>
          <div className="text-center">
            <div className="w-8 h-8 border-4 rounded-full animate-spin mx-auto mb-4" 
              style={{borderColor: 'var(--text-teal)', borderTopColor: 'transparent'}}></div>
            <p style={{ color: 'var(--text-dark-secondary)' }}>Carregando dados financeiros...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-16 flex items-center justify-center" style={{ background: 'var(--bg-cream-light)' }}>
          <div className="text-center">
            <p className="mb-4" style={{ color: 'var(--text-dark-primary)' }}>{error}</p>
            <button
              onClick={() => navigate('/customer/dashboard')}
              className="px-6 py-2 rounded-lg"
              style={{ background: 'var(--btn-ver-planos-bg)', color: 'var(--btn-ver-planos-text)' }}
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }


  return (
    <>
      <Header />
      <div className="min-h-screen pt-16" style={{ background: 'var(--bg-cream-light)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="mb-6">
              <button
                onClick={() => navigate('/customer/dashboard')}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg mb-4"
                style={{ background: 'var(--bg-beige)', color: 'var(--text-dark-secondary)' }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <div className="mb-4">
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-dark-primary)' }}>
                  Informações Financeiras
                </h1>
                <p style={{ color: 'var(--text-dark-secondary)' }}>
                  Olá, {client?.full_name}! Aqui estão suas informações financeiras
                </p>
              </div>
            </div>
          </motion.div>


          {/* Active Contracts Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-dark-primary)' }}>
              Contratos
            </h3>
            <div className="space-y-3">
              {contracts.length > 0 ? (
                contracts.map((contract) => {
                  const renewalDate = contract.expirationDate ? new Date(contract.expirationDate) : null;
                  const renewalDay = renewalDate && !isNaN(renewalDate.getTime()) ? renewalDate.getDate() : null;
                  const isRenewalNeeded = contract.daysRemaining <= 5 && !contract.isExpired;
                  const isExpired = contract.isExpired;
                  
                  return (
                    <div key={contract.id} className="p-3 rounded-lg border" style={{ borderColor: 'var(--border-gray)', background: 'var(--bg-cream-light)' }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(contract.status)}
                          <h4 className="font-medium" style={{ color: 'var(--text-dark-primary)' }}>
                            {contract.planName} - {contract.petName}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{ 
                              background: isRenewalNeeded ? '#dc2626' : (contract.status === 'active' ? 'var(--text-teal)' : 'var(--text-dark-secondary)'), 
                              color: 'white' 
                            }}>
                            {isRenewalNeeded ? 'Renovar' : getStatusLabel(contract.status)}
                          </span>
                          {(isRenewalNeeded || isExpired) && (
                            <button
                              onClick={() => handleRenewalCheckout(contract)}
                              className="px-4 py-1 bg-red-500 text-white text-sm font-medium rounded-full transition-colors"
                            >
                              Regularizar
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p style={{ color: 'var(--text-dark-secondary)' }}>Contrato: #{contract.contractNumber}</p>
                          <p style={{ color: 'var(--text-dark-secondary)' }}>Data de Início: {formatDate(contract.startDate)}</p>
                        </div>
                        <div>
                          <p style={{ color: 'var(--text-dark-secondary)' }}>
                            Tipo: <span className="font-medium" style={{ color: 'var(--text-dark-primary)' }}>
                              {getPlanTypeLabel(contract.billingPeriod || 'monthly')}
                            </span>
                          </p>
                          {renewalDay && (
                            <p style={{ color: 'var(--text-dark-secondary)' }}>
                              Dia da renovação: <span className="font-medium" style={{ color: 'var(--text-dark-primary)' }}>
                                {renewalDay}
                              </span>
                            </p>
                          )}
                        </div>
                        <div>
                          {renewalDate && !isNaN(renewalDate.getTime()) && (
                            <p style={{ color: 'var(--text-dark-secondary)' }}>
                              Próxima renovação: <span className="font-medium" style={{ color: 'var(--text-dark-primary)' }}>
                                {formatDate(renewalDate.toISOString())}
                              </span>
                            </p>
                          )}
                          <div className="mt-1">
                            {getCountdownDisplay(contract.daysRemaining, contract.isExpired)}
                          </div>
                        </div>
                        <div>
                          <p style={{ color: 'var(--text-dark-secondary)' }}>
                            Valor: <span className="font-medium text-lg" style={{ color: 'var(--text-teal)' }}>
                              {getCurrentContractValue(contract)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center" style={{ background: 'var(--bg-cream-light)' }}>
                  <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-dark-secondary)' }} />
                  <p style={{ color: 'var(--text-dark-secondary)' }}>Nenhum contrato encontrado.</p>
                </div>
              )}
            </div>
          </motion.div>


          {/* Official Payment Receipts Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-dark-primary)' }}>
              Comprovante UNIPET
              {isLoadingReceipts && (
                <div className="inline-flex items-center ml-3">
                  <div className="w-4 h-4 border-2 rounded-full animate-spin" 
                    style={{borderColor: 'var(--text-teal)', borderTopColor: 'transparent'}}></div>
                  <span className="ml-2 text-sm" style={{ color: 'var(--text-dark-secondary)' }}>
                    Carregando...
                  </span>
                </div>
              )}
            </h3>
            <div className="space-y-4">
              {receiptsError ? (
                <div className="p-6 text-center rounded-lg" style={{ background: 'rgb(var(--error-bg))', borderColor: 'rgb(var(--error-border))' }}>
                  <XCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgb(var(--error-red))' }} />
                  <p className="font-medium mb-2" style={{ color: 'rgb(var(--error-red))' }}>
                    Erro ao carregar comprovantes oficiais
                  </p>
                  <p className="text-sm mb-4" style={{ color: 'rgb(var(--error-red-dark))' }}>
                    {receiptsError}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ 
                      background: 'rgb(var(--error-red))', 
                      color: 'white',
                      transition: 'background-color 0.2s'
                    }}


                  >
                    Tentar Novamente
                  </button>
                </div>
              ) : paymentReceipts.length > 0 ? (
                paymentReceipts.map((receipt) => (
                  <div key={receipt.id} className="p-4 rounded-lg border" style={{ borderColor: 'var(--border-gray)' }}>
                    {/* Container responsivo */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      
                      {/* Lado esquerdo: Título e Subtítulo */}
                      <div className="flex-1 mb-4 md:mb-0">
                        {/* Título */}
                        <h4 className="font-medium mb-1" style={{ color: 'var(--text-dark-primary)' }}>
                          Comprovante #{receipt.receiptNumber}
                        </h4>
                        
                        {/* Subtítulo */}
                        {receipt.planName && receipt.petName && (
                          <p className="text-sm" style={{ color: 'var(--text-dark-secondary)' }}>
                            {receipt.planName} - {receipt.petName}
                          </p>
                        )}
                      </div>

                      {/* Lado direito: Botão e Data */}
                      <div className="flex flex-col items-center md:items-end md:text-right">
                        <button
                          onClick={() => handleDownloadReceipt(receipt.id)}
                          disabled={downloadingReceiptId === receipt.id}
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors mb-2"
                          style={{ 
                            background: downloadingReceiptId === receipt.id ? 'var(--text-dark-secondary)' : 'var(--text-teal)', 
                            color: 'white',
                            transition: 'background-color 0.2s',
                            cursor: downloadingReceiptId === receipt.id ? 'not-allowed' : 'pointer',
                            opacity: downloadingReceiptId === receipt.id ? 0.7 : 1
                          }}
                        >
                          {downloadingReceiptId === receipt.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Baixando...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              <span>Baixar Comprovante PDF</span>
                            </>
                          )}
                        </button>
                        
                        {/* Data do Pagamento */}
                        <p className="text-sm" style={{ color: 'var(--text-dark-secondary)' }}>
                          Data do Pagamento: {formatDate(receipt.paymentDate)}
                        </p>
                      </div>
                      
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center" style={{ background: 'var(--bg-cream-light)' }}>
                  <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-dark-secondary)' }} />
                  <p style={{ color: 'var(--text-dark-secondary)' }}>Nenhum comprovante oficial encontrado.</p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-dark-secondary)' }}>
                    Comprovantes são gerados automaticamente quando pagamentos são aprovados pela Cielo.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>

      <Footer />
    </>
  );
}