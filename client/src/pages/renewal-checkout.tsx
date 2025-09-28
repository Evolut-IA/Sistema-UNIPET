import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { ArrowLeft } from 'lucide-react';

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
  const [address, setAddress] = useState({
    zipCode: '',
    city: '',
    state: '',
    district: '',
    address: '',
    cpf: ''
  });

  // Formatadores de entrada (reutilizar do checkout principal)
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  // Buscar dados do contrato
  useEffect(() => {
    const fetchContractData = async () => {
      if (!contractId) {
        setError('ID do contrato não encontrado');
        setIsLoading(false);
        return;
      }

      try {
        console.log('📋 [RENEWAL] Buscando dados do contrato:', contractId);
        
        // Buscar dados do contrato para renovação
        const response = await fetch(`/api/clients/contracts/${contractId}/renewal`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar dados do contrato');
        }

        const data = await response.json();
        console.log('✅ [RENEWAL] Dados do contrato recebidos:', data);
        
        setContractData(data);
        
        // Se tem billing period configurado, usar ele
        if (data.billingPeriod) {
          setBillingPeriod(data.billingPeriod);
        }

        // Se tem dados do cliente, preencher endereço
        if (data.client) {
          setAddress({
            zipCode: data.client.zipCode || '',
            city: data.client.city || '',
            state: data.client.state || '',
            district: data.client.district || '',
            address: data.client.address || '',
            cpf: data.client.cpf || ''
          });
        }

      } catch (err) {
        console.error('❌ [RENEWAL] Erro ao buscar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContractData();
  }, [contractId]);

  // Função de processamento do pagamento
  const processRenewalPayment = async () => {
    if (!contractData) return;

    // Validações básicas
    if (!address.cpf) {
      toast.error('Por favor, informe seu CPF');
      return;
    }

    if (!address.zipCode || !address.city || !address.state || !address.district || !address.address) {
      toast.error('Por favor, preencha todos os campos do endereço');
      return;
    }

    if (paymentMethod === 'credit') {
      if (!cardData.cardNumber || !cardData.cardHolder || !cardData.expirationDate || !cardData.securityCode) {
        toast.error('Por favor, preencha todos os dados do cartão');
        return;
      }
    }

    try {
      setIsProcessingPayment(true);
      console.log('💳 [RENEWAL] Processando renovação...');

      // Usar o valor baseado no período escolhido (que agora vem do contrato)
      const amount = billingPeriod === 'monthly' 
        ? parseFloat(contractData.monthlyAmount || contractData.plan.price)
        : parseFloat(contractData.annualAmount || contractData.plan.price);

      const payload = {
        contractId: contractData.id,
        paymentMethod,
        billingPeriod,
        amount,
        clientData: {
          ...address,
          name: contractData.client.name,
          email: contractData.client.email,
          phone: contractData.client.phone
        },
        ...(paymentMethod === 'credit' && { cardData })
      };

      console.log('📤 [RENEWAL] Enviando payload:', payload);

      const response = await fetch('/api/clients/contracts/renew', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('📥 [RENEWAL] Resposta do servidor:', result);

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
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--bg-beige)'}}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: 'var(--bg-teal-dark)'}}></div>
            <p style={{color: 'var(--text-dark-primary)'}}>Carregando dados da renovação...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Header />
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
        <Footer />
      </>
    );
  }

  // PIX Result view
  if (showPixResult && pixQrCode) {
    return (
      <>
        <Header />
        <div className="min-h-screen" style={{background: 'var(--bg-beige)'}}>
          <motion.div 
            className="container mx-auto px-4 py-12 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4" style={{color: 'var(--text-dark-primary)'}}>
                Pagamento via PIX
              </h2>
              <p style={{color: 'var(--text-dark-secondary)'}}>
                Escaneie o código QR ou copie o código PIX
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <img src={pixQrCode} alt="QR Code PIX" className="mx-auto w-64 h-64" />
              </div>

              <div>
                <p className="text-sm font-medium mb-2" style={{color: 'var(--text-dark-secondary)'}}>
                  Código PIX:
                </p>
                <div className="p-3 bg-gray-50 rounded break-all text-xs">
                  {pixCode}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pixCode || '');
                    toast.success('Código PIX copiado!');
                  }}
                  className="mt-4 w-full py-3 rounded-lg font-semibold"
                  style={{background: 'var(--btn-ver-planos-bg)', color: 'var(--text-light)'}}
                >
                  Copiar Código PIX
                </button>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate('/customer/financial')}
                className="text-sm underline"
                style={{color: 'var(--text-dark-secondary)'}}
              >
                Voltar para Área Financeira
              </button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  // Main checkout view
  if (!contractData) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen" style={{background: 'var(--bg-beige)'}}>
        <motion.div 
          className="container mx-auto px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate('/customer/financial')}
              className="flex items-center gap-2 mb-6 px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
              style={{color: 'var(--text-dark-primary)'}}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Área Financeira
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--text-dark-primary)'}}>
                Renovação de Contrato
              </h1>
              <p style={{color: 'var(--text-dark-secondary)'}}>
                Contrato #{contractData.contractNumber}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Resumo do Contrato */}
              <div>
                <h2 className="text-xl font-bold mb-4" style={{color: 'var(--text-dark-primary)'}}>
                  Resumo da Renovação
                </h2>

                {/* Card do Plano */}
                <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
                  <h3 className="font-semibold text-lg mb-2" style={{color: 'var(--text-dark-primary)'}}>
                    {contractData.plan.name}
                  </h3>
                  
                  {/* Pet Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium" style={{color: 'var(--text-dark-secondary)'}}>
                      Pet: {contractData.pet.name}
                    </p>
                    <p className="text-xs" style={{color: 'var(--text-dark-tertiary)'}}>
                      {contractData.pet.species} • {contractData.pet.breed}
                    </p>
                  </div>

                  {/* Billing Info - sem seletor, apenas mostra o configurado */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2" style={{color: 'var(--text-dark-secondary)'}}>
                      Período de Cobrança
                    </p>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="font-semibold" style={{color: 'var(--text-dark-primary)'}}>
                        {billingPeriod === 'monthly' ? 'Mensal' : 'Anual'}
                      </p>
                    </div>
                  </div>

                  {/* Valor Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold" style={{color: 'var(--text-dark-primary)'}}>
                        Total:
                      </span>
                      <span className="text-2xl font-bold" style={{color: '#FFFFFF'}}>
                        R$ {billingPeriod === 'monthly' 
                          ? contractData.monthlyAmount || contractData.plan.price
                          : contractData.annualAmount || contractData.plan.price}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{color: 'var(--text-dark-tertiary)'}}>
                      Cobrança {billingPeriod === 'monthly' ? 'mensal' : 'anual'}
                    </p>
                  </div>
                </div>

                {/* Features do Plano */}
                {contractData.plan.features && contractData.plan.features.length > 0 && (
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold mb-3" style={{color: 'var(--text-dark-primary)'}}>
                      Benefícios Inclusos
                    </h3>
                    <ul className="space-y-2">
                      {contractData.plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2" style={{color: 'var(--accent-teal)'}}>✓</span>
                          <span className="text-sm" style={{color: 'var(--text-dark-secondary)'}}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Formulário de Pagamento */}
              <div>
                <h2 className="text-xl font-bold mb-4" style={{color: 'var(--text-dark-primary)'}}>
                  Dados de Pagamento
                </h2>

                {/* Dados Pessoais */}
                <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
                  <h3 className="font-semibold mb-4" style={{color: 'var(--text-dark-primary)'}}>
                    Dados Pessoais
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{color: 'var(--text-dark-secondary)'}}>
                        CPF
                      </label>
                      <input
                        type="text"
                        value={address.cpf}
                        onChange={(e) => setAddress({...address, cpf: formatCPF(e.target.value)})}
                        placeholder="000.000.000-00"
                        className="w-full px-3 py-2 border rounded-lg"
                        maxLength={14}
                      />
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
                  <h3 className="font-semibold mb-4" style={{color: 'var(--text-dark-primary)'}}>
                    Endereço de Cobrança
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{color: 'var(--text-dark-secondary)'}}>
                          CEP
                        </label>
                        <input
                          type="text"
                          value={address.zipCode}
                          onChange={(e) => setAddress({...address, zipCode: formatCEP(e.target.value)})}
                          placeholder="00000-000"
                          className="w-full px-3 py-2 border rounded-lg"
                          maxLength={9}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{color: 'var(--text-dark-secondary)'}}>
                          Cidade
                        </label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({...address, city: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{color: 'var(--text-dark-secondary)'}}>
                          Estado
                        </label>
                        <select
                          value={address.state}
                          onChange={(e) => setAddress({...address, state: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="">Selecione</option>
                          <option value="SP">SP</option>
                          <option value="RJ">RJ</option>
                          <option value="MG">MG</option>
                          <option value="RS">RS</option>
                          <option value="PR">PR</option>
                          <option value="SC">SC</option>
                          {/* Adicionar mais estados conforme necessário */}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{color: 'var(--text-dark-secondary)'}}>
                          Bairro
                        </label>
                        <input
                          type="text"
                          value={address.district}
                          onChange={(e) => setAddress({...address, district: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1" style={{color: 'var(--text-dark-secondary)'}}>
                        Endereço
                      </label>
                      <input
                        type="text"
                        value={address.address}
                        onChange={(e) => setAddress({...address, address: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Método de Pagamento */}
                <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                  <h3 className="font-semibold mb-4" style={{color: 'var(--text-dark-primary)'}}>
                    Forma de Pagamento
                  </h3>

                  <div className="space-y-3 mb-4">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="credit"
                        checked={paymentMethod === 'credit'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'credit')}
                        className="mr-3"
                      />
                      <span style={{color: 'var(--text-dark-primary)'}}>Cartão de Crédito</span>
                    </label>
                    
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="pix"
                        checked={paymentMethod === 'pix'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'pix')}
                        className="mr-3"
                      />
                      <span style={{color: 'var(--text-dark-primary)'}}>PIX</span>
                    </label>
                  </div>

                  {/* Campos do Cartão */}
                  {paymentMethod === 'credit' && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{color: 'var(--text-dark-secondary)'}}>
                          Número do Cartão
                        </label>
                        <input
                          type="text"
                          value={cardData.cardNumber}
                          onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
                          placeholder="0000 0000 0000 0000"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1" style={{color: 'var(--text-dark-secondary)'}}>
                          Nome no Cartão
                        </label>
                        <input
                          type="text"
                          value={cardData.cardHolder}
                          onChange={(e) => setCardData({...cardData, cardHolder: e.target.value})}
                          placeholder="Nome como está no cartão"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{color: 'var(--text-dark-secondary)'}}>
                            Validade
                          </label>
                          <input
                            type="text"
                            value={cardData.expirationDate}
                            onChange={(e) => setCardData({...cardData, expirationDate: e.target.value})}
                            placeholder="MM/AA"
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{color: 'var(--text-dark-secondary)'}}>
                            CVV
                          </label>
                          <input
                            type="text"
                            value={cardData.securityCode}
                            onChange={(e) => setCardData({...cardData, securityCode: e.target.value})}
                            placeholder="000"
                            className="w-full px-3 py-2 border rounded-lg"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botão de Pagamento */}
                <button
                  onClick={processRenewalPayment}
                  disabled={isProcessingPayment}
                  className="w-full py-4 rounded-lg font-semibold transition-colors"
                  style={{
                    background: isProcessingPayment ? '#ccc' : 'var(--btn-ver-planos-bg)',
                    color: 'var(--text-light)'
                  }}
                >
                  {isProcessingPayment ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                      Processando...
                    </span>
                  ) : (
                    `Renovar Contrato - R$ ${billingPeriod === 'monthly' 
                      ? contractData.monthlyAmount || contractData.plan.price
                      : contractData.annualAmount || contractData.plan.price}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
