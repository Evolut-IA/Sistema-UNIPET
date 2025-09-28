import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Reutilizar tipos e utilitários do checkout principal
interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  image?: string;
  buttonText?: string;
  planType?: string;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
}

interface ContractData {
  id: string;
  contractNumber: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    cpf?: string;
    address?: string;
    zipCode?: string;
    city?: string;
    state?: string;
    district?: string;
  };
  plan: Plan;
  pet: Pet;
  billingPeriod: 'monthly' | 'annual';
  monthlyAmount: string;
  annualAmount: string;
  status: string;
}

export default function RenewalCheckout() {
  const [location, navigate] = useLocation();
  // Usar window.location.search para capturar os query parameters corretamente
  const urlParams = new URLSearchParams(window.location.search);
  const contractId = urlParams.get('contractId');

  // Estados principais
  const [isLoading, setIsLoading] = useState(true);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estados de pagamento
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix'>('credit');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Estados do cartão
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expirationDate: '',
    securityCode: ''
  });

  // Estados PIX
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [showPixResult, setShowPixResult] = useState(false);

  // Estados de endereço (obrigatório para pagamento)
  const [addressData, setAddressData] = useState({
    cpf: '',
    zipCode: '',
    address: '',
    district: '',
    city: '',
    state: ''
  });

  // Carregar dados do contrato
  useEffect(() => {
    if (!contractId) {
      setError('ID do contrato não fornecido');
      setIsLoading(false);
      return;
    }

    const loadContractData = async () => {
      try {
        console.log('🔄 [RENEWAL] Carregando dados do contrato:', contractId);
        
        const response = await fetch(`/api/contracts/${contractId}/renewal`, {
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Você precisa estar logado para renovar um contrato');
          }
          if (response.status === 404) {
            throw new Error('Contrato não encontrado ou não pertence a você');
          }
          throw new Error(`Erro ao carregar dados: ${response.status}`);
        }

        const result = await response.json();
        const renewalData = result.renewalData;
        
        console.log('✅ [RENEWAL] Dados carregados:', renewalData);
        
        setContractData(renewalData);
        setBillingPeriod(renewalData.billingPeriod || 'monthly');
        
        // Pré-preencher dados de endereço se disponíveis
        setAddressData({
          cpf: renewalData.client.cpf || '',
          zipCode: renewalData.client.zipCode || '',
          address: renewalData.client.address || '',
          district: renewalData.client.district || '',
          city: renewalData.client.city || '',
          state: renewalData.client.state || ''
        });

      } catch (error) {
        console.error('❌ [RENEWAL] Erro ao carregar dados:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    loadContractData();
  }, [contractId]);

  // Formatação de valores
  const formatCurrency = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatCPF = (value: string): string => {
    const numbers = value.replace(/\\D/g, '');
    return numbers
      .replace(/(\\d{3})(\\d)/, '$1.$2')
      .replace(/(\\d{3})(\\d)/, '$1.$2')
      .replace(/(\\d{3})(\\d{1,2})$/, '$1-$2');
  };

  const formatCEP = (value: string): string => {
    const numbers = value.replace(/\\D/g, '');
    return numbers.replace(/(\\d{5})(\\d)/, '$1-$2');
  };

  // Validação de campos obrigatórios
  const validatePaymentData = (): boolean => {
    if (!addressData.cpf || !addressData.zipCode) {
      toast.error('Por favor, preencha CPF e CEP');
      return false;
    }

    if (paymentMethod === 'credit') {
      if (!cardData.cardNumber || !cardData.cardHolder || !cardData.expirationDate || !cardData.securityCode) {
        toast.error('Por favor, preencha todos os dados do cartão');
        return false;
      }
    }

    return true;
  };

  // Processar pagamento
  const processRenewalPayment = async () => {
    if (!validatePaymentData() || !contractData) return;

    setIsProcessingPayment(true);
    
    try {
      const paymentData = {
        contractId: contractData.id,
        paymentMethod,
        billingPeriod,
        amount: billingPeriod === 'annual' ? contractData.annualAmount : contractData.monthlyAmount,
        isRenewal: true,
        clientData: {
          ...addressData,
          name: contractData.client.name,
          email: contractData.client.email,
          phone: contractData.client.phone
        },
        ...(paymentMethod === 'credit' && { cardData })
      };

      const response = await fetch('/api/checkout/renewal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro no processamento do pagamento');
      }

      if (paymentMethod === 'pix') {
        setPixQrCode(result.qrCode);
        setPixCode(result.pixCode);
        setShowPixResult(true);
        toast.success('QR Code PIX gerado! Escaneie para pagar.');
      } else {
        // Pagamento com cartão aprovado
        // Redirecionar imediatamente para customer/login com parâmetro para mostrar popup
        navigate('/customer/login?payment_success=true');


      }

    } catch (error) {
      console.error('❌ [RENEWAL] Erro no pagamento:', error);
      toast.error(error instanceof Error ? error.message : 'Erro no processamento');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--bg-beige)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: 'var(--bg-teal-dark)'}}></div>
          <p style={{color: 'var(--text-dark-primary)'}}>Carregando dados da renovação...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--bg-beige)'}}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-dark-primary)'}}>Ops! Algo deu errado</h2>
          <p className="mb-6" style={{color: 'var(--text-dark-secondary)'}}>{error}</p>
          <button
            onClick={() => navigate('/customer/financial')}
            className="px-6 py-3 rounded-lg font-semibold"
            style={{background: 'var(--btn-ver-planos-bg)', color: 'var(--text-light)'}}
          >
            Voltar para Área Financeira
          </button>
        </div>
      </div>
    );
  }

  // PIX Result view
  if (showPixResult && pixQrCode) {
    return (
      <div className="min-h-screen" style={{background: 'var(--bg-beige)'}}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6" style={{color: 'var(--text-dark-primary)'}}>
                Pagamento PIX - Renovação
              </h2>
              
              <div className="mb-6">
                <img 
                  src={pixQrCode} 
                  alt="QR Code PIX" 
                  className="mx-auto w-72 h-72 object-contain"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              </div>
              
              <div className="space-y-4">
                <p className="text-lg font-semibold" style={{color: 'var(--text-dark-primary)'}}>
                  Valor: {formatCurrency(billingPeriod === 'annual' ? contractData?.annualAmount || '0' : contractData?.monthlyAmount || '0')}
                </p>
                
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm mb-2" style={{color: 'var(--text-dark-secondary)'}}>Código PIX:</p>
                  <p className="font-mono text-sm break-all" style={{color: 'var(--text-dark-primary)'}}>{pixCode}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(pixCode || '')}
                    className="mt-2 text-sm px-4 py-2 rounded"
                    style={{background: 'var(--btn-ver-planos-bg)', color: 'var(--text-light)'}}
                  >
                    Copiar Código
                  </button>
                </div>
                
                <p className="text-sm" style={{color: 'var(--text-dark-secondary)'}}>
                  Após o pagamento, seu plano será reativado automaticamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main renewal checkout interface
  return (
    <div className="min-h-screen" style={{background: 'var(--bg-beige)'}}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4" style={{color: 'var(--text-dark-primary)'}}>
              Renovação do Plano
            </h1>
            <div className="inline-flex items-center px-4 py-2 rounded-full" style={{background: 'var(--bg-teal-light)', color: 'var(--text-teal)'}}>
              <span className="font-semibold" style={{color: '#FFFFFF'}}>Contrato: {contractData?.contractNumber}</span>
            </div>
          </div>

          {/* Contract Summary */}
          {contractData && (
            <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
              <h3 className="text-lg font-semibold mb-4" style={{color: 'var(--text-dark-primary)'}}>
                Resumo do Contrato
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm" style={{color: 'var(--text-dark-secondary)'}}>Pet:</p>
                  <p className="font-semibold" style={{color: 'var(--text-dark-primary)'}}>{contractData.pet.name}</p>
                  <p className="text-sm" style={{color: 'var(--text-dark-secondary)'}}>{contractData.pet.species} - {contractData.pet.breed}</p>
                </div>
                <div>
                  <p className="text-sm" style={{color: 'var(--text-dark-secondary)'}}>Plano:</p>
                  <p className="font-semibold" style={{color: 'var(--text-dark-primary)'}}>{contractData.plan.name}</p>
                </div>
                <div>
                  <p className="text-sm" style={{color: 'var(--text-dark-secondary)'}}>Valor:</p>
                  <p className="font-semibold text-lg" style={{color: 'var(--text-teal)'}}>
                    {formatCurrency(billingPeriod === 'annual' ? contractData.annualAmount : contractData.monthlyAmount)}
                    <span className="text-sm"> /{billingPeriod === 'annual' ? 'ano' : 'mês'}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Form */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-6" style={{color: 'var(--text-dark-primary)'}}>
              Dados para Pagamento
            </h3>

            {/* Billing Period Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium" style={{color: 'var(--text-dark-secondary)'}}>
                Período de Cobrança: 
                <span className="ml-2 font-semibold" style={{color: 'var(--text-dark-primary)'}}>
                  {billingPeriod === 'annual' ? 'Anual' : 'Mensal'}
                </span>
                <span className="ml-2" style={{color: 'var(--text-teal)'}}>
                  {formatCurrency(billingPeriod === 'annual' ? contractData?.annualAmount || '0' : contractData?.monthlyAmount || '0')}
                  {billingPeriod === 'annual' ? '/ano' : '/mês'}
                </span>
              </p>
            </div>

            {/* Address Data */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4" style={{color: 'var(--text-dark-primary)'}}>
                Confirme seus dados
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-dark-primary)'}}>
                    CPF *
                  </label>
                  <input
                    type="text"
                    value={addressData.cpf}
                    onChange={(e) => setAddressData({...addressData, cpf: formatCPF(e.target.value)})}
                    className="w-full p-3 rounded-lg border"
                    style={{borderColor: 'var(--border-gray)', background: 'white'}}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-dark-primary)'}}>
                    CEP *
                  </label>
                  <input
                    type="text"
                    value={addressData.zipCode}
                    onChange={(e) => setAddressData({...addressData, zipCode: formatCEP(e.target.value)})}
                    className="w-full p-3 rounded-lg border"
                    style={{borderColor: 'var(--border-gray)', background: 'white'}}
                    placeholder="00000-000"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3" style={{color: 'var(--text-dark-primary)'}}>
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('credit')}
                  className={`p-4 rounded-lg border-2 transition-all ${paymentMethod === 'credit' ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}
                >
                  <div className="text-center">
                    <p className="font-semibold" style={{color: 'var(--text-dark-primary)'}}>💳 Cartão de Crédito</p>
                    <p className="text-sm" style={{color: 'var(--text-dark-secondary)'}}>Aprovação imediata</p>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-4 rounded-lg border-2 transition-all ${paymentMethod === 'pix' ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}
                >
                  <div className="text-center">
                    <p className="font-semibold" style={{color: 'var(--text-dark-primary)'}}>🔄 PIX</p>
                    <p className="text-sm" style={{color: 'var(--text-dark-secondary)'}}>Pagamento instantâneo</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Credit Card Form */}
            {paymentMethod === 'credit' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <h4 className="text-lg font-semibold mb-4" style={{color: 'var(--text-dark-primary)'}}>
                  Dados do Cartão
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-dark-primary)'}}>
                      Número do Cartão *
                    </label>
                    <input
                      type="text"
                      value={cardData.cardNumber}
                      onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
                      className="w-full p-3 rounded-lg border"
                      style={{borderColor: 'var(--border-gray)', background: 'white'}}
                      placeholder="0000 0000 0000 0000"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-dark-primary)'}}>
                      Nome do Titular *
                    </label>
                    <input
                      type="text"
                      value={cardData.cardHolder}
                      onChange={(e) => setCardData({...cardData, cardHolder: e.target.value})}
                      className="w-full p-3 rounded-lg border"
                      style={{borderColor: 'var(--border-gray)', background: 'white'}}
                      placeholder="Nome como está no cartão"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-dark-primary)'}}>
                      Validade *
                    </label>
                    <input
                      type="text"
                      value={cardData.expirationDate}
                      onChange={(e) => setCardData({...cardData, expirationDate: e.target.value})}
                      className="w-full p-3 rounded-lg border"
                      style={{borderColor: 'var(--border-gray)', background: 'white'}}
                      placeholder="MM/AA"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-dark-primary)'}}>
                      CVV *
                    </label>
                    <input
                      type="text"
                      value={cardData.securityCode}
                      onChange={(e) => setCardData({...cardData, securityCode: e.target.value})}
                      className="w-full p-3 rounded-lg border"
                      style={{borderColor: 'var(--border-gray)', background: 'white'}}
                      placeholder="000"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 pt-6 border-t" style={{borderColor: 'var(--border-gray)'}}>
              <button
                onClick={() => navigate('/customer/financial')}
                className="px-6 py-3 rounded-lg font-semibold border"
                style={{
                  borderColor: 'var(--border-gray)',
                  color: 'var(--text-dark-secondary)',
                  background: 'white'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={processRenewalPayment}
                disabled={isProcessingPayment}
                className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                style={{
                  background: 'var(--btn-ver-planos-bg)',
                  color: 'var(--text-light)'
                }}
              >
                {isProcessingPayment ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processando...
                  </span>
                ) : (
                  `Renovar por ${contractData && formatCurrency(billingPeriod === 'annual' ? contractData.annualAmount : contractData.monthlyAmount)}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}