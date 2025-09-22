import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/layout/header';
import Footer from '../components/layout/footer';
import { Check, CreditCard, User } from 'lucide-react';
import { smoothScrollTo } from '../lib/scroll-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// PIX Icon component
const PixIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  buttonText?: string;
  planType?: string;
  isActive?: boolean;
  displayOrder?: number;
  availableBillingOptions?: string[];
  availablePaymentMethods?: string[];
}

interface Species {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
}

interface PetData {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  planId?: string;
  planName?: string;
  collapsed?: boolean;
}

interface CustomerData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address: string;
  number: string;
  complement: string;
  city: string;
  state: string;
  zipCode: string;
  district: string;
}

// Mapeamento de índices numéricos para IDs de planos (baseado em displayOrder)
const PLAN_MAPPINGS: Record<string, string> = {
  '1': '87aee1ab-774f-45bb-b43f-a4ca46ab21e5',  // Plano Básico (displayOrder: 1)
  '2': '8e5dba0c-1ae1-44f6-a341-5f0139c1ec16',  // Plano Intermediário (displayOrder: 2)
  '3': '734da3d8-a66f-4b44-ae63-befc6a3307fd',  // Plano Premium (displayOrder: 3)
  '4': 'b48fabf4-1644-46e1-99c8-f8187de286ad'   // Plano Emergência (displayOrder: 4)
};

export default function Checkout() {
  const [location, navigate] = useLocation();
  const [, params] = useRoute('/checkout/:planId?');
  
  // Extract planId from query parameters as well
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const planFromQuery = urlParams.get('plan');
  
  // Renewal mode detection
  const isRenewalMode = urlParams.get('mode') === 'renewal';
  const renewalContractId = urlParams.get('contractId');
  
  // Debug log para renovação
  if (isRenewalMode) {
    console.log('🔄 [RENOVAÇÃO] Modo de renovação detectado!', {
      contractId: renewalContractId,
      currentStep: isRenewalMode ? 3 : 1
    });
  }
  
  // Determinar planId a partir da URL numérica ou parâmetros
  const getPlanIdFromUrl = () => {
    // Não buscar plano se estivermos na página de sucesso
    const pathname = location.split('?')[0];
    if (pathname?.includes('/success')) {
      return null;
    }
    
    // Verificar se é uma rota numérica
    const pathParts = pathname?.split('/') || [];
    const planIndex = pathParts[pathParts.length - 1];
    
    if (planIndex && PLAN_MAPPINGS[planIndex]) {
      return PLAN_MAPPINGS[planIndex];
    }
    
    // Fallback para parâmetros normais
    return params?.planId || planFromQuery;
  };
  
  const resolvedPlanId = getPlanIdFromUrl();
  
  // Para renovações, sempre começar na etapa de pagamento (step 3)
  const [currentStep, setCurrentStep] = useState(isRenewalMode ? 3 : 1);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [pets, setPets] = useState<PetData[]>([]);
  const [currentPetIndex, setCurrentPetIndex] = useState<number | null>(null);
  const [isEditingPet, setIsEditingPet] = useState(false);
  const [currentPetData, setCurrentPetData] = useState<PetData>({
    id: '',
    name: '',
    species: '',
    breed: '',
    age: 1,
    weight: 1,
    collapsed: false
  });
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    address: '',
    number: '',
    complement: '',
    city: '',
    state: '',
    zipCode: '',
    district: ''
  });
  
  // NEW: Store clientId from step 2 for step 3
  const [savedClientId, setSavedClientId] = useState<string | null>(null);
  
  // Renewal mode states  
  // const [isLoadingRenewal, setIsLoadingRenewal] = useState(false); // Removed unused variable
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expirationDate: '',
    securityCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix'>('credit');
  const [installments, setInstallments] = useState(1);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  

  // ============================================
  // FUNÇÕES DE FORMATAÇÃO PARA CAMPOS
  // ============================================
  
  // Formatação de CPF: 000.000.000-00
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
    return value;
  };

  // Formatação de CEP: 00000-000
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  // Estados para busca de CEP
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  // Função para buscar dados do CEP
  const lookupCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    
    // Só busca se tiver 8 dígitos
    if (cleanCep.length !== 8) return;

    setIsLoadingCep(true);
    setCepError(null);

    try {
      console.log('🔍 [CEP FRONTEND] Buscando CEP:', cleanCep);
      
      const response = await fetch(`/api/cep/${cleanCep}`);
      const result = await response.json();

      if (result.success && result.data) {
        console.log('✅ [CEP FRONTEND] Dados recebidos:', result.data);
        
        // Preencher campos automaticamente
        setCustomerData(prev => ({
          ...prev,
          address: result.data.street || prev.address,
          district: result.data.neighborhood || prev.district,
          city: result.data.city || prev.city,
          state: result.data.state || prev.state
        }));

        // Mostrar mensagem de sucesso
        // Endereço preenchido automaticamente (sem notificação)
        setTimeout(() => setSuccessMessage(''), 3000);
        
      } else {
        setCepError('CEP não encontrado');
        console.log('❌ [CEP FRONTEND] CEP não encontrado:', cleanCep);
      }
    } catch (error) {
      console.error('❌ [CEP FRONTEND] Erro ao buscar CEP:', error);
      setCepError('Erro ao buscar CEP');
    } finally {
      setIsLoadingCep(false);
    }
  };

  // Formatação de telefone: (00) 00000-0000
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      if (numbers.length <= 2) return numbers;
      if (numbers.length <= 7) return numbers.replace(/(\d{2})(\d)/, '($1) $2');
      return numbers
        .replace(/(\d{2})(\d{5})(\d)/, '($1) $2-$3');
    }
    return value;
  };

  // Formatação de cartão de crédito: 0000 0000 0000 0000
  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 16) {
      return numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    return value;
  };

  // Formatação de data de expiração: MM/YY (formato padrão)
  const formatExpirationDate = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limitar a 4 dígitos (MMYY)
    const limited = numbers.substring(0, 4);
    
    if (limited.length >= 2) {
      return limited.replace(/(\d{2})(\d)/, '$1/$2');
    }
    return limited;
  };

  // FUNÇÕES PARA LIMPAR DADOS ANTES DE ENVIAR PARA API
  const cleanDataForAPI = (data: any) => {
    return {
      ...data,
      cpf: data.cpf.replace(/\D/g, ''),
      phone: data.phone.replace(/\D/g, ''),
      zipCode: data.zipCode.replace(/\D/g, ''),
      cardNumber: data.cardNumber ? data.cardNumber.replace(/\D/g, '') : '',
      expirationDate: data.expirationDate ? convertToFullYear(data.expirationDate) : ''
    };
  };

  // Converter MM/YY para MM/YYYY para a API Cielo
  const convertToFullYear = (dateString: string) => {
    if (!dateString) return '';
    
    // Se já está no formato MM/YYYY, retornar como está
    if (dateString.includes('/') && dateString.split('/')[1]?.length === 4) {
      return dateString;
    }
    
    const cleanDate = dateString.replace(/\D/g, '');
    
    if (cleanDate.length >= 4) {
      const month = cleanDate.substring(0, 2);
      const year = cleanDate.substring(2, 4);
      
      // Converter YY para YYYY
      const yearNum = parseInt(year);
      const fullYear = yearNum < 50 ? `20${year}` : `19${year}`;
      
      return `${month}/${fullYear}`;
    }
    return dateString;
  };
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showMonthlyBreakdown, setShowMonthlyBreakdown] = useState(false);
  const [pixPaymentResult, setPixPaymentResult] = useState<any>(null);
  const [showPixResult, setShowPixResult] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [pixPaymentStatus, setPixPaymentStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  
  
  // Estados para Cartão de Crédito
  const [creditCardPaymentResult, setCreditCardPaymentResult] = useState<any>(null);
  const [showCreditCardResult, setShowCreditCardResult] = useState(false);
  const [creditCardPaymentStatus, setCreditCardPaymentStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [showCreditCardSuccessPopup, setShowCreditCardSuccessPopup] = useState(false);
  
  // ============================================
  // BUSINESS RULES FOR PAYMENT RESTRICTIONS
  // ============================================
  
  // Plan ID mappings for business rules
  const PLAN_BUSINESS_RULES = {
    BASIC: '87aee1ab-774f-45bb-b43f-a4ca46ab21e5',
    COMFORT: '8e5dba0c-1ae1-44f6-a341-5f0139c1ec16', 
    PLATINUM: '734da3d8-a66f-4b44-ae63-befc6a3307fd',
    INFINITY: 'b48fabf4-1644-46e1-99c8-f8187de286ad'
  };

  // Function to determine plan type based on business rules
  const getPlanType = (planId: string | undefined): 'BASIC_INFINITY' | 'COMFORT_PLATINUM' | 'UNKNOWN' => {
    if (!planId) return 'UNKNOWN';
    
    if (planId === PLAN_BUSINESS_RULES.BASIC || planId === PLAN_BUSINESS_RULES.INFINITY) {
      return 'BASIC_INFINITY';
    }
    
    if (planId === PLAN_BUSINESS_RULES.COMFORT || planId === PLAN_BUSINESS_RULES.PLATINUM) {
      return 'COMFORT_PLATINUM';
    }
    
    return 'UNKNOWN';
  };

  // Get available billing periods based on plan type
  const getAvailableBillingPeriods = (planId: string | undefined): ('monthly' | 'annual')[] => {
    const planType = getPlanType(planId);
    
    switch (planType) {
      case 'BASIC_INFINITY':
        // BASIC and INFINITY: Accept monthly OR annual
        return ['monthly', 'annual'];
      case 'COMFORT_PLATINUM':
        // COMFORT and PLATINUM: ONLY annual
        return ['annual'];
      default:
        // Default fallback
        return ['monthly', 'annual'];
    }
  };

  // Get maximum installments based on plan type
  const getMaxInstallments = (planId: string | undefined): number => {
    const planType = getPlanType(planId);
    
    switch (planType) {
      case 'BASIC_INFINITY':
        // BASIC and INFINITY: Credit card ONLY 1x (no installments)
        return 1;
      case 'COMFORT_PLATINUM':
        // COMFORT and PLATINUM: Credit card up to 12x
        return 12;
      default:
        // Default fallback
        return 6;
    }
  };
  
  // Função para scroll suave até a div de resultado
  const scrollToPaymentResult = () => {
    // Aguarda um pouco para a div ser renderizada
    setTimeout(() => {
      const pixElement = document.querySelector('[data-testid="pix-payment-result"]');
      const creditCardElement = document.querySelector('[data-testid="credit-card-payment-result"]');
      
      let targetElement = null;
      if (showPixResult && pixElement) {
        targetElement = pixElement as HTMLElement;
      } else if (showCreditCardResult && creditCardElement) {
        targetElement = creditCardElement as HTMLElement;
      }
      
      if (targetElement) {
        smoothScrollTo(targetElement, 100, 800); // 100px offset, 800ms duration
      }
    }, 100); // Aguarda 100ms para a div ser renderizada
  };

  // Load renewal data for renewal mode
  const loadRenewalData = async () => {
    if (!isRenewalMode || !renewalContractId) return;
    
    // setIsLoadingRenewal(true); // Removed unused variable
    setGeneralError(null);
    
    try {
      console.log('🔄 [RENEWAL] Carregando dados de renovação para contrato:', renewalContractId);
      
      const response = await fetch(`/api/contracts/${renewalContractId}/renewal`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/customer/login');
          return;
        }
        throw new Error(`Erro ao carregar dados de renovação: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ [RENEWAL] Dados de renovação carregados:', result.renewalData);
      
      // Remove unused variable renewalData
      // const renewalData = result.renewalData;
      
      // Pre-fill customer data
      setCustomerData({
        name: result.renewalData.client.name || '',
        email: result.renewalData.client.email || '',
        cpf: result.renewalData.client.cpf || '',
        phone: result.renewalData.client.phone || '',
        address: result.renewalData.client.address || '',
        number: result.renewalData.client.number || '',
        complement: result.renewalData.client.complement || '',
        city: result.renewalData.client.city || '',
        state: result.renewalData.client.state || '',
        zipCode: result.renewalData.client.zipCode || '',
        district: result.renewalData.client.district || ''
      });
      
      // Set saved client ID
      setSavedClientId(result.renewalData.client.id);
      
      // Set billing period
      setBillingPeriod(result.renewalData.billingPeriod);
      
      // Create a plan object for the renewal
      const renewalPlan: Plan = {
        id: result.renewalData.plan.id,
        name: result.renewalData.plan.name,
        price: result.renewalData.amount,
        description: `Renovação do plano ${result.renewalData.plan.name}`,
        features: [],
        buttonText: 'Renovar',
        planType: 'renewal',
        isActive: true
      };
      
      setSelectedPlan(renewalPlan);
      
      // Add pet data
      if (result.renewalData.pet) {
        const petData: PetData = {
          id: result.renewalData.pet.id,
          name: result.renewalData.pet.name,
          species: result.renewalData.pet.species,
          breed: result.renewalData.pet.breed,
          age: result.renewalData.pet.age,
          weight: result.renewalData.pet.weight,
          planId: result.renewalData.plan.id,
          planName: result.renewalData.plan.name,
          collapsed: true
        };
        setPets([petData]);
      }
      
      // Go directly to step 3 (payment) for renewal
      setCurrentStep(3);
      
    } catch (error) {
      console.error('❌ [RENEWAL] Erro ao carregar dados de renovação:', error);
      setGeneralError('Erro ao carregar dados de renovação. Tente novamente.');
    } finally {
      // setIsLoadingRenewal(false); // Removed unused variable
    }
  };

  // Load plans and species
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await fetch('/api/plans');
        if (response.ok) {
          const data = await response.json();
          setPlans(data);
          
          // Auto-select plan from URL (rotas amigáveis, route params e query params)
          if (resolvedPlanId && !isRenewalMode) {
            const plan = data.find((p: Plan) => p.id === resolvedPlanId);
            if (plan) {
              setSelectedPlan(plan);
              console.log('Plano selecionado automaticamente:', plan);
            } else {
              console.error('Plano não encontrado com ID:', resolvedPlanId);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
      }
    };

    const loadSpecies = async () => {
      try {
        const response = await fetch('/api/species');
        if (response.ok) {
          const data = await response.json();
          setSpecies(data);
          console.log('Espécies carregadas:', data);
        }
      } catch (error) {
        console.error('Erro ao carregar espécies:', error);
      }
    };
    
    // Load renewal data if in renewal mode
    if (isRenewalMode) {
      loadRenewalData();
    } else {
      loadPlans();
      loadSpecies();
    }
  }, [resolvedPlanId, isRenewalMode, renewalContractId]);

  // Initialize valid payment method and billing period based on selected plan configuration
  useEffect(() => {
    if (selectedPlan && !isRenewalMode) {
      // Skip complex plan validation for renewal mode - use defaults
      const mapDbToUi = { cartao: 'credit', pix: 'pix' } as const;
      
      // For regular plans, check available options if they exist
      const planHasOptions = selectedPlan && typeof selectedPlan === 'object' && 'availableBillingOptions' in selectedPlan;
      
      if (planHasOptions) {
        const availableBillingOptions = (selectedPlan as any).availableBillingOptions || ['monthly'];
        if (Array.isArray(availableBillingOptions) && !availableBillingOptions.includes(billingPeriod)) {
          setBillingPeriod(availableBillingOptions[0] as 'monthly' | 'annual');
        }
        
        const availablePaymentMethods = (selectedPlan as any).availablePaymentMethods || ['cartao', 'pix'];
        if (Array.isArray(availablePaymentMethods)) {
          const allowedUiMethods = availablePaymentMethods
            .map((method: string) => mapDbToUi[method as keyof typeof mapDbToUi])
            .filter(Boolean);
          
          const methodsForCurrentPeriod = allowedUiMethods.filter((method: any) => {
            const methodConfig = [
              { value: 'credit', availableFor: ['monthly', 'annual'] },
              { value: 'pix', availableFor: ['monthly', 'annual'] }
            ].find(m => m.value === method);
            return methodConfig?.availableFor.includes(billingPeriod);
          });
          
          if (methodsForCurrentPeriod.length > 0 && !methodsForCurrentPeriod.includes(paymentMethod)) {
            setPaymentMethod(methodsForCurrentPeriod[0] as 'credit' | 'pix');
          }
        }
      }
    }
  }, [selectedPlan, billingPeriod, isRenewalMode]);

  // PIX Payment Status Polling
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;
    
    const pollPaymentStatus = async () => {
      if (!pixPaymentResult?.orderId || pixPaymentStatus === 'approved') {
        return;
      }
      
      try {
        console.log('🔄 [PIX-POLLING] Verificando status do pagamento:', pixPaymentResult.orderId);
        
        const response = await fetch(`/api/checkout/orders/${pixPaymentResult.orderId}`);
        const data = await response.json();
        
        if (response.ok && data.paymentDetails) {
          const newStatus = data.paymentDetails.status;
          console.log('📊 [PIX-POLLING] Status atual:', newStatus);
          
          if (newStatus === 'approved') {
            setPixPaymentStatus('approved');
            setSuccessMessage('🎉 Pagamento PIX confirmado! Seu plano foi ativado com sucesso.');
            console.log('✅ [PIX-POLLING] Pagamento aprovado!');
            
            // Para o polling
            if (pollingInterval) {
              clearInterval(pollingInterval);
              pollingInterval = null;
            }
          } else if (newStatus === 'rejected') {
            setPixPaymentStatus('rejected');
            setGeneralError('❌ Pagamento PIX rejeitado. Tente novamente.');
            
            // Para o polling
            if (pollingInterval) {
              clearInterval(pollingInterval);
              pollingInterval = null;
            }
          }
        }
      } catch (error) {
        console.error('❌ [PIX-POLLING] Erro ao verificar status:', error);
      }
    };
    
    // Inicia polling quando PIX é exibido
    if (showPixResult && pixPaymentResult && pixPaymentStatus === 'pending') {
      console.log('🚀 [PIX-POLLING] Iniciando polling de status PIX');
      
      // Verifica imediatamente
      pollPaymentStatus();
      
      // Configura polling a cada 3 segundos
      pollingInterval = setInterval(pollPaymentStatus, 3000);
    }
    
    // Cleanup
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        console.log('🛑 [PIX-POLLING] Polling interrompido');
      }
    };
  }, [showPixResult, pixPaymentResult, pixPaymentStatus]);

  // Hook para scroll automático quando PIX result aparece
  useEffect(() => {
    if (showPixResult && pixPaymentResult) {
      scrollToPaymentResult();
    }
  }, [showPixResult]);


  // Hook para scroll automático quando Credit Card result aparece
  useEffect(() => {
    if (showCreditCardResult && creditCardPaymentResult) {
      scrollToPaymentResult();
    }
  }, [showCreditCardResult]);

  // Initialize first pet form when plan is selected
  useEffect(() => {
    if (selectedPlan && pets.length === 0) {
      addNewPet();
    }
  }, [selectedPlan]);

  // No auto-redirect - user must click button to navigate

  // Helper functions for error management
  const setFieldError = (fieldName: string, errorMessage: string) => {
    setFieldErrors(prev => ({ ...prev, [fieldName]: errorMessage }));
    setGeneralError(null); // Clear general error when setting field-specific error
  };

  const clearFieldError = (fieldName: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setFieldErrors({});
    setGeneralError(null);
    setSuccessMessage(null);
  };

  // Função para mapear erros da API para campos específicos (suporta novo formato de erro)
  const mapApiErrorToField = (errorOrResponse: any) => {
    // Suportar novo formato: { field: 'email', error: 'Mensagem' }
    if (typeof errorOrResponse === 'object' && errorOrResponse.field) {
      console.log('🎯 [ERROR-MAPPING] Erro específico por campo:', errorOrResponse);
      const { field, error, details } = errorOrResponse;
      
      // Mapear campos do backend para campos do frontend
      const fieldMapping: { [key: string]: string } = {
        'clientId': 'name', // Se erro de clientId, mostrar no nome (primeiro campo visível)
        'email': 'email',
        'cpf': 'cpf', 
        'cardNumber': 'cardNumber',
        'cardHolder': 'cardHolder',
        'expirationDate': 'expirationDate',
        'securityCode': 'securityCode',
        'zipCode': 'zipCode',
        'address': 'address',
        'phone': 'phone',
        'name': 'name'
      };
      
      const targetField = fieldMapping[field] || 'name';
      const message = details ? `${error}. ${details}` : error;
      setFieldError(targetField, message);
      return;
    }
    
    // Formato antigo: string de erro
    const errorMessage = typeof errorOrResponse === 'string' ? errorOrResponse : errorOrResponse.error || 'Erro desconhecido';
    const message = errorMessage.toLowerCase();
    
    // Cliente não encontrado - problema comum do checkout
    if (message.includes('cliente não encontrado') || message.includes('cliente inválido')) {
      setFieldError('name', 'Problema na validação do cliente. Por favor, refaça o checkout.');
      return;
    }
    
    // Email já vinculado - erro específico
    if (message.includes('email já está vinculado') || message.includes('email já cadastrado')) {
      setFieldError('email', 'Este email já está vinculado a outra conta.');
      return;
    }
    
    // CPF
    if (message.includes('cpf') || message.includes('documento inválido')) {
      setFieldError('cpf', 'Informe um CPF válido.');
      return;
    }
    
    // Cartão de crédito
    if (message.includes('cartão') || message.includes('card')) {
      if (message.includes('número') || message.includes('number')) {
        setFieldError('cardNumber', 'Número do cartão inválido.');
      } else if (message.includes('expira') || message.includes('validade')) {
        setFieldError('expirationDate', 'Data de vencimento inválida.');
      } else if (message.includes('cvv') || message.includes('segurança')) {
        setFieldError('securityCode', 'Código de segurança inválido.');
      } else if (message.includes('titular') || message.includes('holder')) {
        setFieldError('cardHolder', 'Nome do titular inválido.');
      } else {
        setFieldError('cardNumber', 'Dados do cartão inválidos.');
      }
      return;
    }
    
    // Email
    if (message.includes('email')) {
      setFieldError('email', 'Email inválido.');
      return;
    }
    
    // Telefone
    if (message.includes('telefone') || message.includes('phone')) {
      setFieldError('phone', 'Telefone inválido.');
      return;
    }
    
    // CEP/Endereço
    if (message.includes('cep') || message.includes('endereço')) {
      setFieldError('zipCode', 'CEP inválido.');
      return;
    }
    
    // Nome
    if (message.includes('nome') || message.includes('name')) {
      setFieldError('name', 'Nome inválido.');
      return;
    }
    
    // Se não conseguir mapear para campo específico, exibir erro genérico no primeiro campo visível
    setFieldError('name', errorMessage || 'Verifique os dados informados e tente novamente.');
  };


  // Pet management functions
  const addNewPet = () => {
    const newPet: PetData = {
      id: `pet_${Date.now()}`,
      name: '',
      species: 'Cão', // Valor padrão válido para evitar erro de validação
      breed: '',
      age: 1,
      weight: 1,
      planId: selectedPlan?.id.toString(),
      planName: selectedPlan?.name,
      collapsed: false
    };
    setPets([...pets, newPet]);
    setCurrentPetIndex(pets.length);
    setCurrentPetData(newPet);
    setIsEditingPet(true);
  };

  const updatePet = () => {
    // Validar campos obrigatórios antes de atualizar
    if (!currentPetData.name.trim()) {
      setFieldError('petName', 'Por favor, digite o nome do seu pet.');
      return;
    }
    if (!currentPetData.species.trim()) {
      setFieldError('petSpecies', 'Por favor, selecione a espécie do seu pet.');
      return;
    }
    if (!currentPetData.breed.trim()) {
      setFieldError('petBreed', 'Por favor, digite a raça do seu pet.');
      return;
    }
    if (currentPetData.age < 1 || currentPetData.age > 30) {
      setFieldError('petAge', 'Por favor, digite uma idade válida para seu pet (1-30 anos).');
      return;
    }
    
    if (currentPetIndex !== null) {
      const updatedPets = [...pets];
      updatedPets[currentPetIndex] = {
        ...currentPetData,
        collapsed: true
      };
      setPets(updatedPets);
      setIsEditingPet(false);
      setCurrentPetIndex(null);
      clearAllErrors(); // Limpar erros em caso de sucesso
    }
  };

  const editPet = (index: number) => {
    setCurrentPetIndex(index);
    setCurrentPetData(pets[index]);
    setIsEditingPet(true);
    const updatedPets = [...pets];
    updatedPets[index].collapsed = false;
    setPets(updatedPets);
  };

  const deletePet = (index: number) => {
    const updatedPets = pets.filter((_, i) => i !== index);
    setPets(updatedPets);
    if (currentPetIndex === index) {
      setCurrentPetIndex(null);
      setIsEditingPet(false);
    }
  };


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  // Função para validar email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email.trim());
  };

  // Função para validar telefone brasileiro
  const isValidPhone = (phone: string) => {
    const numbersOnly = phone.replace(/\D/g, '');
    // Deve ter 10 ou 11 dígitos (DDD + número)
    // 11 dígitos: celular com 9 na frente (ex: 11 99999-9999)
    // 10 dígitos: telefone fixo ou celular antigo (ex: 11 9999-9999)
    return numbersOnly.length === 10 || numbersOnly.length === 11;
  };

  // Função para validar CPF
  // Removed unused function
  /*
  const isValidCPF = (cpf: string) => {
    const numbersOnly = cpf.replace(/\D/g, '');
    
    // CPF deve ter exatamente 11 dígitos
    if (numbersOnly.length !== 11) return false;
    
    // Verificar se não são todos os dígitos iguais
    if (/^(.)\1{10}$/.test(numbersOnly)) return false;
    
    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbersOnly[i]) * (10 - i);
    }
    let digit1 = (sum % 11 < 2) ? 0 : 11 - (sum % 11);
    
    if (parseInt(numbersOnly[9]) !== digit1) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbersOnly[i]) * (11 - i);
    }
    let digit2 = (sum % 11 < 2) ? 0 : 11 - (sum % 11);
    
    return parseInt(numbersOnly[10]) === digit2;
  };

  // Função para validar CNPJ
  const isValidCNPJ = (cnpj: string) => {
    const numbersOnly = cnpj.replace(/\D/g, '');
    
    // CNPJ deve ter exatamente 14 dígitos
    if (numbersOnly.length !== 14) return false;
    
    // Verificar se não são todos os dígitos iguais
    if (/^(.)\1{13}$/.test(numbersOnly)) return false;
    
    // Validar primeiro dígito verificador
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum1 = 0;
    for (let i = 0; i < 12; i++) {
      sum1 += parseInt(numbersOnly[i]) * weights1[i];
    }
    const digit1 = sum1 % 11 < 2 ? 0 : 11 - (sum1 % 11);
    
    if (parseInt(numbersOnly[12]) !== digit1) return false;
    
    // Validar segundo dígito verificador
    const weights2 = [6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9];
    let sum2 = 0;
    for (let i = 0; i < 13; i++) {
      sum2 += parseInt(numbersOnly[i]) * weights2[i];
    }
    const digit2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11);
    
    return parseInt(numbersOnly[13]) === digit2;
  };



  // Validation functions for each step
  const validateStep1 = () => {
    clearAllErrors();
    
    if (!selectedPlan) {
      // Plano não selecionado - não é campo de formulário
      return false;
      return false;
    }
    if (pets.length === 0) {
      // Pet não adicionado - não é campo de formulário
      return false;
      return false;
    }
    // Verificar se há algum pet sendo editado
    if (isEditingPet) {
      if (!currentPetData.name.trim()) {
        setFieldError('petName', 'Por favor, digite o nome do seu pet.');
        return false;
      }
      if (!currentPetData.breed.trim()) {
        setFieldError('petBreed', 'Por favor, digite a raça do seu pet.');
        return false;
      }
      if (currentPetData.age < 1 || currentPetData.age > 30) {
        setFieldError('petAge', 'Por favor, digite uma idade válida para seu pet (1-30 anos).');
        return false;
      }
      return false; // Não permite avançar se ainda está editando
    }
    return true;
  };

  const validateStep2 = () => {
    console.log('🔍 [DEBUG] validateStep2 iniciado - dados:', {
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      cpf: customerData.cpf,
      zipCode: customerData.zipCode,
      address: customerData.address,
      district: customerData.district,
      city: customerData.city,
      state: customerData.state,
      consentAccepted: consentAccepted
    });
    
    clearAllErrors();
    
    // Validar nome completo
    if (!customerData.name.trim()) {
      console.log('❌ [DEBUG] Falha na validação: Nome vazio');
      setFieldError('name', 'Por favor, digite seu nome completo.');
      return false;
    }
    if (customerData.name.trim().length < 2) {
      console.log('❌ [DEBUG] Falha na validação: Nome muito curto');
      setFieldError('name', 'Nome deve ter pelo menos 2 caracteres.');
      return false;
    }
    
    // Validar email
    if (!customerData.email.trim()) {
      setFieldError('email', 'Por favor, digite seu email.');
      return false;
    }
    if (!isValidEmail(customerData.email)) {
      setFieldError('email', 'Por favor, digite um email válido (exemplo: nome@email.com).');
      return false;
    }
    
    // Validar telefone
    if (!customerData.phone.trim()) {
      setFieldError('phone', 'Por favor, digite seu celular.');
      return false;
    }
    if (!isValidPhone(customerData.phone)) {
      setFieldError('phone', 'Por favor, digite um número de celular válido (exemplo: (11) 99999-9999).');
      return false;
    }
    
    // Validar consentimento (sempre obrigatório)
    if (!consentAccepted) {
      console.log('❌ [DEBUG] Falha na validação: Consentimento não aceito');
      setFieldError('consent', 'É necessário aceitar o consentimento para continuar');
      return false;
    }
    
    
    return true;
  };

  // Calcular preço final - sempre preço cheio
  const calculateFinalPrice = () => {
    let basePrice = selectedPlan?.price || 0;
    let totalPrice = basePrice;
    
    // Multiplicar por quantidade de pets (preço cheio para cada)
    totalPrice = basePrice * pets.length;
    
    // Se anual, multiplicar por 12 meses (preço cheio)
    if (billingPeriod === 'annual') {
      totalPrice = totalPrice * 12;
    }
    
    return Math.round(totalPrice);
  };

  const validateStep3 = () => {
    console.log('🔍 [DEBUG] validateStep3 iniciado', {
      customerData: {
        cpf: customerData.cpf,
        zipCode: customerData.zipCode,
        address: customerData.address,
        city: customerData.city,
        state: customerData.state,
        district: customerData.district
      },
      paymentMethod,
      cardData: paymentMethod === 'credit' ? {
        cardNumber: cardData.cardNumber,
        cardNumberLength: cardData.cardNumber.replace(/\s/g, '').length,
        cardHolder: cardData.cardHolder,
        expirationDate: cardData.expirationDate,
        expirationDateLength: cardData.expirationDate.length,
        securityCode: cardData.securityCode,
        securityCodeLength: cardData.securityCode.length
      } : 'N/A',
      termsAccepted
    });
    
    clearAllErrors();
    
    // Validar dados pessoais e endereço
    if (!customerData.cpf.trim()) {
      console.log('❌ [DEBUG] CPF vazio');
      setFieldError('cpf', 'Por favor, digite seu CPF.');
      return false;
    }
    if (!customerData.zipCode.trim()) {
      console.log('❌ [DEBUG] CEP vazio');
      setFieldError('zipCode', 'Por favor, digite seu CEP.');
      return false;
    }
    if (!customerData.address.trim()) {
      console.log('❌ [DEBUG] Endereço vazio');
      setFieldError('address', 'Por favor, digite seu endereço.');
      return false;
    }
    if (!customerData.city.trim()) {
      console.log('❌ [DEBUG] Cidade vazia');
      setFieldError('city', 'Por favor, digite sua cidade.');
      return false;
    }
    if (!customerData.state.trim()) {
      console.log('❌ [DEBUG] Estado vazio');
      setFieldError('state', 'Por favor, digite seu estado.');
      return false;
    }
    if (paymentMethod === 'pix' && !customerData.district.trim()) {
      console.log('❌ [DEBUG] Bairro vazio para pix');
      setFieldError('district', 'Por favor, digite seu bairro.');
      return false;
    }
    
    // Validação dos dados do cartão
    if (paymentMethod === 'credit') {
      console.log('🔍 [DEBUG] Validando dados do cartão...');
      if (!cardData.cardNumber.trim()) {
        console.log('❌ [DEBUG] Número do cartão vazio');
        setFieldError('cardNumber', 'Por favor, digite o número do cartão.');
        return false;
      }
      if (cardData.cardNumber.replace(/\s/g, '').length < 13) {
        console.log('❌ [DEBUG] Número do cartão inválido, comprimento:', cardData.cardNumber.replace(/\s/g, '').length);
        setFieldError('cardNumber', 'Número do cartão inválido.');
        return false;
      }
      if (!cardData.cardHolder.trim()) {
        console.log('❌ [DEBUG] Nome no cartão vazio');
        setFieldError('cardHolder', 'Por favor, digite o nome no cartão.');
        return false;
      }
      // Validar data de expiração
      if (!cardData.expirationDate.trim() || cardData.expirationDate.length < 5) {
        console.log('❌ [DEBUG] Data de expiração inválida, comprimento:', cardData.expirationDate.length);
        setFieldError('expirationDate', 'Por favor, digite a validade do cartão no formato MM/YY.');
        return false;
      }
      
      // Validar se a data não está expirada
      const expirationParts = cardData.expirationDate.split('/');
      if (expirationParts.length === 2) {
        const month = parseInt(expirationParts[0]);
        const year = 2000 + parseInt(expirationParts[1]); // Converter YY para YYYY
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // getMonth() retorna 0-11
        
        // Validar mês
        if (month < 1 || month > 12) {
          console.log('❌ [DEBUG] Mês inválido:', month);
          setFieldError('expirationDate', 'Mês inválido. Use 01-12.');
          return false;
        }
        
        // Validar se a data não está expirada
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          console.log('❌ [DEBUG] Cartão expirado:', { month, year, currentMonth, currentYear });
          setFieldError('expirationDate', 'Cartão expirado. Digite uma data válida.');
          return false;
        }
      }
      if (!cardData.securityCode.trim() || cardData.securityCode.length < 3) {
        console.log('❌ [DEBUG] CVV inválido, comprimento:', cardData.securityCode.length);
        setFieldError('securityCode', 'Por favor, digite o CVV do cartão.');
        return false;
      }
      console.log('✅ [DEBUG] Todos os dados do cartão são válidos');
    }
    
    if (!termsAccepted) {
      console.log('❌ [DEBUG] Termos não aceitos');
      // Termos - é checkbox, não campo de formulário
      return false;
      return false;
    }
    
    console.log('✅ [DEBUG] validateStep3 passou em todas as validações');
    return true;
  };

  const nextStep = () => {
    console.log('🔘 [DEBUG] nextStep chamado!', { 
      currentStep, 
      paymentMethod,
      cardDataFilled: {
        cardNumber: !!cardData.cardNumber,
        cardHolder: !!cardData.cardHolder,
        expirationDate: !!cardData.expirationDate,
        securityCode: !!cardData.securityCode
      },
      termsAccepted,
      isLoading
    });
    
    clearAllErrors(); // Clear any previous errors
    
    // Se estiver editando um pet, primeiro atualize o pet
    if (currentStep === 1 && isEditingPet) {
      updatePet();
      return;
    }
    
    // Validate current step before proceeding
    if (currentStep === 1 && !validateStep1()) {
      console.log('❌ [DEBUG] Validação step 1 falhou');
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      console.log('❌ [DEBUG] Validação step 2 falhou');
      return;
    }
    if (currentStep === 3 && !validateStep3()) {
      console.log('❌ [DEBUG] Validação step 3 falhou');
      return;
    }
    
    if (currentStep === 1) {
      console.log('🔄 [DEBUG] Avançando para step 2');
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 2) {
      console.log('🛒 [DEBUG] Salvando dados do cliente (step 2)');
      // NEW: Save customer and pets data before moving to step 3
      saveCustomerData();
      // Step advancement is handled inside saveCustomerData function
    } else {
      console.log('💳 [DEBUG] Iniciando processPayment...');
      processPayment();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // NEW: Save customer and pets data (Step 2)
  const saveCustomerData = async () => {
    setIsLoading(true);
    clearAllErrors();
    
    try {
      console.log('🛒 [STEP2] Salvando dados do cliente e pets (SEM CPF)...');
      
      // Prepare client data - WITHOUT CPF in Step 2
      const clientData = {
        full_name: customerData.name,
        email: customerData.email,
        phone: customerData.phone.replace(/\D/g, ''), // Remove formatting
        password: 'temp_password_' + Date.now(), // Temporary password for checkout flow
        // CPF NOT sent in Step 2 - will be added in Step 3
      };
      
      // Prepare pets data
      const petsData = pets.map(pet => ({
        name: pet.name,
        species: pet.species || 'Cão', // Garantir que species não esteja vazio
        breed: pet.breed,
        age: pet.age,
        weight: pet.weight.toString(), // Convert to string as expected by backend
      }));
      
      // Debug: Mostrar dados dos pets que estão sendo enviados
      console.log('🐕 [STEP2] Dados dos pets sendo enviados:', petsData);
      
      const response = await fetch('/api/checkout/save-customer-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientData,
          petsData
        })
      });
      
      const result = await response.json();
      console.log('📥 [STEP2] Resposta do servidor:', { status: response.status, result });
      
      if (response.ok) {
        console.log('✅ [STEP2] Dados salvos com sucesso, clientId:', result.clientId);
        setSavedClientId(result.clientId);
        
        // Check if it's an existing client
        if (!result.isExistingClient) {
          // Success message removed per user request
        }
        
        // Move to step 3
        setCurrentStep(3);
        return true;
      } else {
        console.error('❌ [STEP2] Erro do servidor:', result.error);
        
        // Handle specific errors
        if (result.error.includes('já cadastrado')) {
          setFieldError('email', 'Este email já está cadastrado. Use outro email ou faça login.');
        } else {
          mapApiErrorToField(result.error);
        }
        return false;
      }
      
    } catch (error) {
      console.error('❌ [STEP2] Erro de rede:', error);
      setFieldError('name', 'Erro de conexão. Verifique sua internet e tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const processPayment = async () => {
    setIsLoading(true);
    clearAllErrors();
    
    // Variável para armazenar o clientId final (pode ser atualizado se cliente já existe com o CPF)
    let finalClientId = savedClientId;
    let existingClientData = null;
    
    try {
      // RENEWAL MODE: Skip registration completion for renewal
      if (isRenewalMode) {
        console.log('🔄 [RENEWAL] Modo renovação detectado, pulando registro e indo direto para pagamento');
        finalClientId = savedClientId;
      }
      // STEP 3.1: First complete registration with CPF and address (only for new checkout)
      else if (savedClientId) {
        console.log('📝 [STEP3.1] Completando registro com CPF e endereço...');
        
        const registrationData = {
          clientId: savedClientId,
          cpf: customerData.cpf.replace(/\D/g, ''), // Clean CPF
          addressData: {
            zipCode: customerData.zipCode,
            address: customerData.address,
            number: customerData.number || '',
            complement: customerData.complement || '',
            district: customerData.district,
            state: customerData.state,
            city: customerData.city
          }
        };
        
        const regResponse = await fetch('/api/checkout/complete-registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(registrationData)
        });
        
        const regResult = await regResponse.json();
        
        if (!regResponse.ok) {
          console.error('❌ [STEP3.1] Erro ao completar registro:', regResult.error);
          setGeneralError(regResult.error || 'Erro ao completar registro');
          return;
        }
        
        // Atualizar clientId se um cliente existente com o mesmo CPF foi usado
        finalClientId = regResult.clientId || savedClientId;
        setSavedClientId(finalClientId);
        
        // Se um cliente existente foi encontrado, usar os dados desse cliente
        if (regResult.client && regResult.clientId !== savedClientId) {
          existingClientData = regResult.client;
          console.log('🔄 [STEP3.1] Cliente existente encontrado, usando dados existentes:', {
            existingEmail: existingClientData.email,
            existingName: existingClientData.full_name,
            formEmail: customerData.email,
            formName: customerData.name
          });
        }
        
        console.log('✅ [STEP3.1] Registro completado com sucesso, clientId:', finalClientId);
      }
      
      // STEP 3.2: Now process payment
      console.log('💳 [STEP3.2] Processando pagamento...');
      
      // Preparar dados do cliente com informações do cartão se necessário
      let customer = { ...customerData };
      
      // Se um cliente existente foi encontrado, usar os dados desse cliente
      if (existingClientData) {
        customer = {
          ...customer,
          name: existingClientData.full_name,  // Usar nome do cliente existente
          email: existingClientData.email      // Usar email do cliente existente
        };
      }
      
      if (paymentMethod === 'credit') {
        customer = {
          ...customer,
          ...cardData
        };
      }
      
      // Limpar dados formatados antes de enviar para API (Cielo precisa dados sem formatação)
      const cleanedCustomer = cleanDataForAPI(customer);
      
      // Estrutura correta esperada pelo backend
      // Usar o finalClientId se existir (quando cliente já tinha o CPF cadastrado)
      const checkoutPayload = {
        clientId: finalClientId || savedClientId,
        isRenewal: isRenewalMode,
        renewalContractId: isRenewalMode ? renewalContractId : undefined,
        addressData: {
          cep: cleanedCustomer.zipCode,
          address: cleanedCustomer.address,
          number: cleanedCustomer.number || '',
          complement: cleanedCustomer.complement || '',
          district: cleanedCustomer.district,
          city: cleanedCustomer.city,
          state: cleanedCustomer.state
        },
        paymentData: {
          customer: {
            name: cleanedCustomer.name,
            email: cleanedCustomer.email,
            identity: cleanedCustomer.cpf,
            identityType: 'CPF',
            mobile: cleanedCustomer.phone
          },
          payment: paymentMethod === 'credit' ? {
            cardNumber: cardData.cardNumber.replace(/\s/g, ''),
            holder: cardData.cardHolder,
            expirationDate: cardData.expirationDate,
            securityCode: cardData.securityCode,
            installments: installments
          } : {}
        },
        planData: {
          planId: selectedPlan?.id,
          amount: Math.round((selectedPlan?.price || 0) * 100), // Converter para centavos
          billingPeriod,
          pets
        },
        paymentMethod: paymentMethod === 'credit' ? 'credit_card' : paymentMethod
      };

      console.log('🔄 Processando pagamento...', { paymentMethod, planId: selectedPlan?.id, pets: pets.length });

      // DEBUG: Log detalhado do payload enviado
      console.log('🚀 [CHECKOUT-PAYLOAD] Enviando para /api/checkout/process:', {
        clientId: checkoutPayload.clientId,
        customerEmail: checkoutPayload.paymentData.customer.email,
        customerName: checkoutPayload.paymentData.customer.name,
        paymentMethod: checkoutPayload.paymentMethod,
        planId: checkoutPayload.planData.planId,
        amount: checkoutPayload.planData.amount
      });

      const response = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkoutPayload)
      });

      const result = await response.json();
      console.log('📥 [CHECKOUT-RESPONSE] Resposta do servidor:', { 
        status: response.status, 
        success: response.ok,
        hasFieldError: !!(result.field && result.error),
        errorField: result.field,
        errorMessage: result.error,
        result 
      });

      if (response.ok) {
        console.log('✅ Pagamento processado com sucesso');
        
        // Se for PIX, mostrar o resultado inline na página
        console.log('🔍 [FRONTEND] Debug PIX - Dados recebidos:', {
          paymentMethod,
          hasPaymentResult: !!result.payment,
          paymentResultKeys: result.payment ? Object.keys(result.payment) : [],
          qrCodeBase64_new: result.payment?.pixQrCode ? 'PRESENTE' : 'AUSENTE',
          qrCodeString_new: result.payment?.pixCode ? 'PRESENTE' : 'AUSENTE', 
          qrCodeBase64_legacy: result.payment?.qrCodeBase64 ? 'PRESENTE' : 'AUSENTE',
          qrCodeString_legacy: result.payment?.qrCodeString ? 'PRESENTE' : 'AUSENTE',
          qrCodeLength: (result.payment?.pixQrCode?.length || result.payment?.qrCodeBase64?.length || 0),
          rawResult: JSON.stringify(result, null, 2)
        });
        
        if (paymentMethod === 'pix') {
          // Suportar ambos os formatos: novo (pixQrCode/pixCode) e legado (qrCodeBase64/qrCodeString)
          const qrCodeData = result.payment?.pixQrCode || result.payment?.qrCodeBase64;
          const qrCodeString = result.payment?.pixCode || result.payment?.qrCodeString;
          
          console.log('🔍 [FRONTEND] PIX Data Check:', { 
            hasQrCodeData: !!qrCodeData, 
            qrCodeDataType: typeof qrCodeData,
            qrCodeDataValue: qrCodeData ? qrCodeData.substring(0, 100) + '...' : 'null/undefined',
            hasQrCodeString: !!qrCodeString 
          });
          
          if (qrCodeData && qrCodeData.length > 0) {
            console.log('💳 ✅ [FRONTEND] PIX DETECTADO! Configurando exibição inline...');
            setPixPaymentResult({
              orderId: result.orderId,
              qrCodeBase64: qrCodeData,
              qrCodeString: qrCodeString || ''
            });
            setShowPixResult(true);
            console.log('💳 ✅ [FRONTEND] Estados PIX configurados:', { showPixResult: true });
            return; // Não redireciona para success
          } else {
            console.log('❌ [FRONTEND] PIX sem QR Code válido - dados:', { qrCodeData, type: typeof qrCodeData });
          }
        } else if (paymentMethod === 'credit') {
          // Processar resultado de cartão de crédito
          console.log('💳 [CREDIT CARD] Resultado recebido:', result);
          if (result.payment && result.payment.paymentId) {
            console.log('💳 ✅ [FRONTEND] CARTÃO DE CRÉDITO DETECTADO! Configurando exibição inline...');
            
            // Determinar status baseado na resposta
            let status: 'pending' | 'approved' | 'rejected' = 'pending';
            if (result.payment.status === 2) { // Status 2 = Transacao capturada com sucesso
              status = 'approved';
            } else if (result.payment.status === 3 || // Status 3 = negado
                      result.payment.returnMessage?.includes('rejeitado') || 
                      result.payment.returnMessage?.includes('negado') ||
                      result.payment.returnMessage?.includes('Inválidas') ||
                      result.payment.returnMessage?.includes('Invalidas') ||
                      result.payment.returnCode === '05' ||
                      result.payment.returnCode === '002' ||
                      result.payment.returnCode === '15') { // Código 15 = Autorização negada
              status = 'rejected';
            }
            
            setCreditCardPaymentResult({
              orderId: result.payment.orderId || result.orderId,
              paymentId: result.payment.paymentId,
              status: result.payment.status,
              returnMessage: result.payment.returnMessage || 'Pagamento processado',
              returnCode: result.payment.returnCode
            });
            setCreditCardPaymentStatus(status);
            setShowCreditCardResult(true);
            
            // 🎉 Mostrar popup de sucesso quando cartão for aprovado
            if (status === 'approved') {
              console.log('🎉 [FRONTEND] Cartão aprovado! Redirecionando para /customer/login com popup de sucesso');
              
              // Redirecionar imediatamente com parâmetro para mostrar popup na página de login
              navigate('/customer/login?payment_success=true');
            }
            
            console.log('💳 ✅ [FRONTEND] Estados Cartão de Crédito configurados:', { 
              showCreditCardResult: true, 
              status 
            });
            return; // Não redireciona para success
          } else {
            console.log('❌ [FRONTEND] Cartão de crédito sem dados válidos - dados:', result.payment);
          }
        }
        
        // Para outros métodos, redirecionar para página de sucesso
        const queryParams = new URLSearchParams({
          order: result.orderId,
          method: paymentMethod
        });


        navigate(`/checkout/success?${queryParams.toString()}`);
        console.log('✅ Redirecionando para página de sucesso:', queryParams.toString());
      } else {
        // CORREÇÃO: Suportar novo formato de erro específico por campo
        console.error('❌ Erro do servidor:', result);
        
        // Verificar se é o novo formato de erro estruturado
        if (result.field && result.error) {
          // Novo formato: { field: 'email', error: 'Mensagem', details: '...' }
          mapApiErrorToField(result);
        } else {
          // Formato antigo: { error: 'mensagem' }
          let errorMessage = result.error || result.message || 'Erro ao processar pagamento.';
          
          // Melhorar mensagens de erro para o usuário
          if (errorMessage.includes('Affiliation not found')) {
            errorMessage = 'Credenciais de pagamento inválidas. Entre em contato com o suporte.';
          } else if (errorMessage.includes('Payment method is not enabled')) {
            errorMessage = 'Este método de pagamento não está habilitado. Tente outro método ou entre em contato com o suporte.';
          } else if (errorMessage.includes('EXPIRED_CARD')) {
            errorMessage = 'Cartão expirado. Verifique a data de validade do seu cartão.';
          } else if (errorMessage.includes('INVALID_CARD_NUMBER')) {
            errorMessage = 'Número do cartão inválido. Verifique os dados e tente novamente.';
          } else if (errorMessage.includes('INVALID_CVV')) {
            errorMessage = 'Código de segurança (CVV) inválido. Verifique os 3 ou 4 dígitos no verso do cartão.';
          }
          
          // Mapear erro para campo específico
          mapApiErrorToField(errorMessage);
        }
      }
    } catch (error) {
      console.error('❌ Erro de rede:', error);
      // Erro de rede - mostrar no campo mais relevante
      setFieldError('name', 'Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 py-16 pt-28 md:py-20 md:pt-32">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          {/* Renewal Mode Indicator */}
          {isRenewalMode && (
            <div className="mb-6 p-4 rounded-lg text-center bg-accent text-primary">
              <h2 className="text-lg font-semibold mb-2">🔄 Renovação de Plano</h2>
              <p className="text-sm">Você está renovando seu plano. Seus dados já estão preenchidos, basta escolher a forma de pagamento.</p>
            </div>
          )}

          {/* Progress Steps */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center justify-center max-w-sm mx-auto md:max-w-none">
              {[
                { step: 1, icon: User, label: isRenewalMode ? 'Renovação' : 'Plano & Pet' },
                { step: 2, icon: User, label: 'Seus Dados' },
                { step: 3, icon: CreditCard, label: 'Pagamento' }
              ].map(({ step, icon: Icon, label }) => (
                <div key={step} className="flex items-center flex-shrink-0">
                  <div 
                    className={`w-10 h-10 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step 
                        ? 'text-primary-foreground bg-teal-dark' 
                        : 'text-muted-foreground bg-border'
                    }`}
                    style={{
                      background: currentStep >= step 
                        ? 'rgb(var(--teal-dark))' 
                        : 'rgb(var(--border))'
                    }}
                  >
                    {currentStep > step ? <Check className="w-4 h-4 sm:w-4 sm:h-4 md:w-6 md:h-6" /> : 
                      step === 1 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-4 sm:h-4 md:w-6 md:h-6" viewBox="0 -960 960 960" fill="currentColor">
                          <path d="M180-475q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Zm180-160q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Zm240 0q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Zm180 160q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM266-75q-45 0-75.5-34.5T160-191q0-52 35.5-91t70.5-77q29-31 50-67.5t50-68.5q22-26 51-43t63-17q34 0 63 16t51 42q28 32 49.5 69t50.5 69q35 38 70.5 77t35.5 91q0 47-30.5 81.5T694-75q-54 0-107-9t-107-9q-54 0-107 9t-107 9Z"/>
                        </svg>
                      ) : (
                        <Icon className="w-4 h-4 sm:w-4 sm:h-4 md:w-6 md:h-6" />
                      )
                    }
                  </div>
                  <span className="hidden sm:block ml-1 sm:ml-2 font-medium text-xs sm:text-sm md:text-base text-foreground">
                    {label}
                  </span>
                  {step < 3 && (
                    <div className="flex items-center mx-2 sm:mx-3 md:mx-6">
                      <div 
                        className="w-16 sm:w-24 md:w-32 h-0.5"
                        style={{
                          background: currentStep > step 
                            ? 'rgb(var(--teal-dark))' 
                            : 'rgb(var(--border))'
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>


          {/* Step Content */}
          <div className="rounded-xl shadow-lg p-8 bg-background">
            
            {/* Error and Success Messages */}
            <AnimatePresence>
              {generalError && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6 p-4 rounded-lg border-l-4"
                  style={{
                    background: 'rgb(var(--destructive) / 0.1)',
                    borderColor: 'rgb(var(--destructive))',
                    color: 'rgb(var(--destructive))'
                  }}
                  data-testid="error-message"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{generalError}</span>
                  </div>
                </motion.div>
              )}
              
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  style={{
                    background: 'rgb(var(--success-background))',
                    borderColor: 'rgb(var(--success))',
                    color: 'rgb(var(--success))'
                  }}
                  className="mb-6 p-4 rounded-lg border-l-4 bg-success/10 border-success text-success"
                  data-testid="success-message"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{successMessage}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* Step 1: Plan & Pet */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-bold mb-6 text-foreground">Selecione o Plano e dados do Pet</h2>
                  
                  {/* Plan Selection */}
                  {!selectedPlan && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4 text-foreground">Escolha seu plano:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {plans.map((plan) => (
                          <div
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan)}
                            className="p-4 rounded-lg border-2 cursor-pointer transition-all bg-background border-border"
                            style={{
  

                            }}
                          >
                            <h4 className="font-bold text-lg mb-2 text-foreground">{plan.name}</h4>
                            <p className="text-2xl font-bold mb-2 text-primary">{formatPrice(plan.price)}/mês</p>
                            <p className="text-sm mb-3 text-dark-secondary">{plan.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Plan Display */}
                  {selectedPlan && (
                    <div className="p-6 rounded-lg mb-6 bg-background">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div className="mb-3 md:mb-0">
                          <h3 className="text-xl font-bold text-foreground">{selectedPlan.name}</h3>
                          <p className="text-2xl font-bold text-primary">{formatPrice(selectedPlan.price)}/mês</p>
                        </div>
                        <button
                          onClick={() => setSelectedPlan(null)}
                          className="text-sm px-4 py-2 rounded-lg border w-fit md:w-auto text-muted-foreground border-border bg-background"
                          style={{
                            color: 'rgb(var(--muted-foreground))',

                            background: 'rgb(var(--background))'
                          }}
                        >
                          Trocar Plano
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Pets Section - Only show when a plan is selected */}
                  {selectedPlan && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-foreground">Dados dos Pets</h3>
                    
                    {/* Pets List */}
                    {pets.map((pet, index) => (
                      <div key={pet.id} className="border rounded-lg overflow-hidden">
                        {pet.collapsed ? (
                          /* Collapsed Pet View */
                          <div className="p-4 bg-background flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-foreground">{pet.name}</h4>
                              <p className="text-sm text-dark-secondary">
                                {pet.species} • {pet.breed} • {pet.age} anos
                              </p>
                              <p className="text-sm font-medium text-primary">
                                Plano: {selectedPlan?.name}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => editPet(index)}
                                className="px-3 py-1 text-sm rounded border"
                                style={{
                                  color: 'rgb(var(--primary))',
                                  borderColor: 'rgb(var(--primary))',
                                  background: 'rgb(var(--background))'
                                }}
                              >
                                Editar
                              </button>
                              {pets.length > 1 && !isEditingPet && (
                                <button
                                  onClick={() => deletePet(index)}
                                  className="px-3 py-1 text-sm rounded border"
                                  style={{
                                    color: 'rgb(var(--destructive))',
                                    borderColor: 'rgb(var(--destructive))',
                                    background: 'rgb(var(--background))'
                                  }}
                                >
                                  Excluir
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* Expanded Pet Form */
                          <div className="p-6 bg-background">
                            <h4 className="font-semibold mb-4 text-foreground">
                              {index === 0 ? 'Primeiro Pet' : `${index + 1}º Pet`}
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-foreground">
                                  Nome do Pet *
                                </label>
                                <input
                                  type="text"
                                  value={currentPetData.name}
                                  onChange={(e) => setCurrentPetData({...currentPetData, name: e.target.value})}
                                  className="w-full p-3 rounded-lg border border-border bg-background"
                                  style={{

                                    background: 'rgb(var(--background))'
                                  }}
                                  placeholder="Digite o nome do seu pet"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2 text-foreground">
                                  Espécie *
                                </label>
                                <Select onValueChange={(value) => setCurrentPetData({...currentPetData, species: value})} value={currentPetData.species}>
                                  <SelectTrigger className="mobile-form-input">
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {species.map((speciesItem, index) => (
                                      <React.Fragment key={speciesItem.id}>
                                        <SelectItem value={speciesItem.name}>
                                        {speciesItem.name}
                                      </SelectItem>
                                        {index < species.length - 1 && <SelectSeparator />}
                                      </React.Fragment>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2 text-foreground">
                                  Raça *
                                </label>
                                <input
                                  type="text"
                                  value={currentPetData.breed}
                                  onChange={(e) => setCurrentPetData({...currentPetData, breed: e.target.value})}
                                  className="w-full p-3 rounded-lg border border-border bg-background"
                                  style={{

                                    background: 'rgb(var(--background))'
                                  }}
                                  placeholder="Digite a raça do seu pet"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2 text-foreground">
                                  Idade (anos) *
                                </label>
                                <input
                                  type="number"
                                  value={currentPetData.age}
                                  onChange={(e) => setCurrentPetData({...currentPetData, age: parseInt(e.target.value)})}
                                  className="w-full p-3 rounded-lg border border-border bg-background"
                                  style={{

                                    background: 'rgb(var(--background))'
                                  }}
                                  min="0"
                                  max="30"
                                  required
                                />
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6 pt-4 border-t">
                              <button
                                onClick={() => {
                                  // Save pet data
                                  const updatedPets = [...pets];
                                  updatedPets[index] = {...currentPetData, collapsed: true};
                                  setPets(updatedPets);
                                  setIsEditingPet(false);
                                  setCurrentPetIndex(null);
                                }}
                                disabled={!currentPetData.name || !currentPetData.breed || currentPetData.age < 1 || currentPetData.weight < 1}
                                className="flex-1 px-4 py-2 rounded-lg border transition-opacity"
                                style={{
                                  color: (!currentPetData.name || !currentPetData.breed || currentPetData.age < 1 || currentPetData.weight < 1) ? 'rgb(var(--muted-foreground))' : 'rgb(var(--primary-foreground))',
                                  backgroundColor: (!currentPetData.name || !currentPetData.breed || currentPetData.age < 1 || currentPetData.weight < 1) ? 'var(--bg-cream-dark)' : 'var(--text-teal)',
                                  borderColor: (!currentPetData.name || !currentPetData.breed || currentPetData.age < 1 || currentPetData.weight < 1) ? 'rgb(var(--border))' : 'var(--text-teal)',
                                  opacity: (!currentPetData.name || !currentPetData.breed || currentPetData.age < 1 || currentPetData.weight < 1) ? 0.6 : 1,
                                  cursor: (!currentPetData.name || !currentPetData.breed || currentPetData.age < 1 || currentPetData.weight < 1) ? 'not-allowed' : 'pointer'
                                }}
                              >
                                Salvar Pet
                              </button>
                              
                              <button
                                onClick={() => {
                                  // Cancel - if it's a new pet (not saved yet), remove it
                                  if (index === pets.length - 1 && !pets[index].name) {
                                    const updatedPets = pets.filter((_, i) => i !== index);
                                    setPets(updatedPets);
                                  } else {
                                    // If editing existing pet, just collapse
                                    const updatedPets = [...pets];
                                    updatedPets[index].collapsed = true;
                                    setPets(updatedPets);
                                  }
                                  setIsEditingPet(false);
                                  setCurrentPetIndex(null);
                                }}
                                className="flex-1 px-4 py-2 rounded-lg border"
                                style={{
                                  color: 'var(--text-dark-primary)',
                                  backgroundColor: 'rgb(var(--background))',
    
                                }}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add Pet Button */}
                    {pets.length > 0 && !isEditingPet && (
                      <div className="text-center">
                        <button
                          onClick={addNewPet}
                          className="px-6 py-3 rounded-lg border-2 border-dashed transition-all"
                          style={{
                            color: 'var(--text-teal)',
                            borderColor: 'var(--text-teal)',
                            background: 'rgb(var(--background))'
                          }}
                        >
                          + Adicionar outro pet
                        </button>
                      </div>
                    )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Customer Data */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold mb-6 text-foreground">Seus Dados</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        value={customerData.name}
                        onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                        className="w-full p-3 rounded-lg border border-border bg-background"
                        style={{
                          borderColor: 'rgb(var(--border))',
                          background: 'rgb(var(--background))'
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={customerData.email}
                        onChange={(e) => {
                          setCustomerData({...customerData, email: e.target.value});
                          // Limpar erro quando usuário começar a digitar
                          if (fieldErrors['email']) {
                            clearFieldError('email');
                          }
                        }}
                        className="w-full p-3 rounded-lg border border-border bg-background"
                        style={{
                          borderColor: fieldErrors['email'] ? 'var(--text-error-alt)' : 'rgb(var(--border))',
                          background: 'rgb(var(--background))'
                        }}
                        placeholder="exemplo@email.com"
                        required
                        data-testid="input-email"
                      />
                      {fieldErrors['email'] && (
                        <p className="text-sm mt-1 text-destructive">{fieldErrors['email']}</p>
                      )}
                    </div>


                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Celular *
                      </label>
                      <input
                        type="tel"
                        value={customerData.phone}
                        onChange={(e) => {
                          setCustomerData({...customerData, phone: formatPhone(e.target.value)});
                          // Limpar erro quando usuário começar a digitar
                          if (fieldErrors['phone']) {
                            clearFieldError('phone');
                          }
                        }}
                        className="w-full p-3 rounded-lg border border-border bg-background"
                        style={{
                          borderColor: fieldErrors['phone'] ? 'var(--text-error-alt)' : 'rgb(var(--border))',
                          background: 'rgb(var(--background))'
                        }}
                        placeholder="(11) 99999-9999"
                        required
                        data-testid="input-phone"
                      />
                      {fieldErrors['phone'] && (
                        <p className="text-sm mt-1 text-destructive">{fieldErrors['phone']}</p>
                      )}
                    </div>
                  </div>

                  {/* Consent Checkbox */}
                  <div className="mb-6">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentAccepted}
                        onChange={(e) => setConsentAccepted(e.target.checked)}
                        className="w-5 h-5 text-teal-600 bg-white border-2 border-gray-300 rounded-md appearance-none cursor-pointer relative transition-all"
                        style={{
                          backgroundColor: consentAccepted ? '#277677' : 'rgb(var(--white))',
                          borderColor: consentAccepted ? 'transparent' : 'rgb(var(--border))',
                          backgroundImage: consentAccepted ? 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' height=\'20px\' viewBox=\'0 -960 960 960\' width=\'20px\' fill=\'white\'%3e%3cpath d=\'M400-304 240-464l56-56 104 104 264-264 56 56-320 320Z\'/%3e%3c/svg%3e")' : 'none',
                          backgroundSize: '16px 16px',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                      <span className="text-sm leading-relaxed text-foreground">
                        Eu declaro meu pleno consentimento para recebimento de promoções da Unipet e de seus parceiros comerciais, nos termos da nossa{' '}
                        <button
                          type="button"
                          onClick={() => window.open('/politica-privacidade', '_blank')}

                          className="font-medium opacity-80 transition-opacity text-primary"
                        >
                          Política de Privacidade
                        </button>.
                      </span>
                    </label>
                    {fieldErrors['consent'] && (
                      <p className="text-sm mt-2 text-destructive">{fieldErrors['consent']}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold mb-6 text-foreground">Pagamento</h2>
                  
                  {/* Mobile Layout - vertical stacking */}
                  <div className="lg:hidden space-y-6">
                    {/* Section 1: Cadastre seu endereço */}
                    <div className="space-y-4 p-6 rounded-lg border bg-background border-border">
                      <h3 className="text-lg font-semibold mb-4 text-foreground">Cadastre seu endereço</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">
                          CPF *
                        </label>
                        <input
                          type="text"
                          value={customerData.cpf}
                          onChange={(e) => {
                            // Permitir apenas números
                            const numbersOnly = e.target.value.replace(/\D/g, '');
                            if (numbersOnly.length <= 11) {
                              setCustomerData({...customerData, cpf: formatCPF(numbersOnly)});
                            }
                          }}
                          className="w-full p-3 rounded-lg border border-border bg-background"
                          style={{

                            background: 'rgb(var(--background))'
                          }}
                          placeholder="000.000.000-00"
                          required
                          data-testid="input-cpf"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">
                          CEP *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={customerData.zipCode}
                            onChange={(e) => {
                              // Permitir apenas números
                              const numbersOnly = e.target.value.replace(/\D/g, '');
                              console.log('🔍 [CEP INPUT] Digitado:', e.target.value, 'Números:', numbersOnly, 'Tamanho:', numbersOnly.length);
                              
                              if (numbersOnly.length <= 8) {
                                const formattedCep = formatCEP(numbersOnly);
                                setCustomerData({...customerData, zipCode: formattedCep});
                                
                                // Limpar erros ao digitar
                                setCepError(null);
                                
                                // Buscar CEP automaticamente quando completar 8 dígitos
                                if (numbersOnly.length === 8) {
                                  console.log('🚀 [CEP INPUT] 8 dígitos detectados! Chamando lookupCep...');
                                  lookupCep(numbersOnly);
                                }
                              }
                            }}
                            className="w-full p-3 rounded-lg border pr-10"
                            style={{
                              borderColor: cepError ? 'rgb(var(--error))' : 'rgb(var(--border))',
                              background: 'rgb(var(--background))'
                            }}
                            placeholder="00000-000"
                            required
                            data-testid="input-zipcode"
                          />
                          {isLoadingCep && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                        {fieldErrors['zipCode'] && (
                          <div className="text-sm mt-1 text-destructive">{fieldErrors['zipCode']}</div>
                        )}
                        {cepError && (
                          <div className="text-sm mt-1 text-destructive">{cepError}</div>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2 text-foreground">
                          Endereço *
                        </label>
                        <input
                          type="text"
                          value={customerData.address}
                          onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                          className="w-full p-3 rounded-lg border border-border bg-background"
                          style={{

                            background: 'rgb(var(--background))'
                          }}
                          placeholder="Rua e número"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">
                          Número / Complemento
                        </label>
                        <input
                          type="text"
                          onChange={(e) => {
                            // Permitir apenas números
                            const numbersOnly = e.target.value.replace(/\D/g, '');
                            e.target.value = numbersOnly;
                          }}
                          className="w-full p-3 rounded-lg border border-border bg-background"
                          style={{

                            background: 'rgb(var(--background))'
                          }}
                          placeholder="123"
                          data-testid="input-number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">
                          Bairro *
                        </label>
                        <input
                          type="text"
                          value={customerData.district}
                          onChange={(e) => setCustomerData({...customerData, district: e.target.value})}
                          className="w-full p-3 rounded-lg border border-border bg-background"
                          style={{

                            background: 'rgb(var(--background))'
                          }}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">
                          Estado / Cidade *
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customerData.state}
                            onChange={(e) => setCustomerData({...customerData, state: e.target.value})}
                            className="w-1/3 p-3 rounded-lg border"
                            style={{

                              background: 'rgb(var(--background))'
                            }}
                            placeholder="SP"
                            required
                          />
                          <input
                            type="text"
                            value={customerData.city}
                            onChange={(e) => setCustomerData({...customerData, city: e.target.value})}
                            className="w-2/3 p-3 rounded-lg border"
                            style={{

                              background: 'rgb(var(--background))'
                            }}
                            placeholder="Cidade"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Modalidade de contratação */}
                  <div className="space-y-4 p-6 rounded-lg border bg-background border-border">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Modalidade de contratação</h3>
                    
                    {/* Segmented Control */}
                    <div 
                      className="rounded-md p-1 flex relative border"
                      style={{
                        background: 'var(--bg-gray-50)',
                        borderColor: 'rgb(var(--border))'
                      }}
                    >
                      {/* Modalidade Anual */}
                      {getAvailableBillingPeriods(selectedPlan?.id).includes('annual') && (
                        <div 
                          className="flex-1 px-5 py-3 text-center cursor-pointer rounded font-medium transition-all duration-200 relative z-10"
                          style={{
                            color: billingPeriod === 'annual' ? 'rgb(var(--primary-foreground))' : 'rgb(var(--muted-foreground))',
                            background: billingPeriod === 'annual' ? 'var(--bg-teal)' : 'transparent',
                            boxShadow: billingPeriod === 'annual' ? '0 2px 4px var(--shadow-light)' : 'none'
                          }}
                          onClick={() => setBillingPeriod('annual')}
                        >
                          Anual
                        </div>
                      )}
                      
                      {/* Modalidade Mensal */}
                      {getAvailableBillingPeriods(selectedPlan?.id).includes('monthly') && (
                        <div 
                          className="flex-1 px-5 py-3 text-center cursor-pointer rounded font-medium transition-all duration-200 relative z-10"
                          style={{
                            color: billingPeriod === 'monthly' ? 'rgb(var(--primary-foreground))' : 'rgb(var(--muted-foreground))',
                            background: billingPeriod === 'monthly' ? 'var(--bg-teal)' : 'transparent',
                            boxShadow: billingPeriod === 'monthly' ? '0 2px 4px var(--shadow-light)' : 'none'
                          }}
                          onClick={() => {
                            setBillingPeriod('monthly');
                            // Garantir que o método de pagamento selecionado seja válido para o novo período
                            const availablePaymentMethods = selectedPlan?.availablePaymentMethods || ['cartao', 'pix'];
                            const mapDbToUi = { cartao: 'credit', pix: 'pix' } as const;
                            const allowedUiMethods = availablePaymentMethods
                              .map(method => mapDbToUi[method as keyof typeof mapDbToUi])
                              .filter(Boolean);
                            
                            const methodsForMonthly = allowedUiMethods.filter(method => {
                              const methodConfig = [
                                { value: 'credit', availableFor: ['monthly', 'annual'] },
                                { value: 'pix', availableFor: ['monthly', 'annual'] }
                              ].find(m => m.value === method);
                              return methodConfig?.availableFor.includes('monthly');
                            });
                            
                            if (methodsForMonthly.length > 0 && !methodsForMonthly.includes(paymentMethod)) {
                              setPaymentMethod(methodsForMonthly[0] as 'credit' | 'pix');
                            }
                          }}
                        >
                          Mensal
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Section 3: Formas de pagamento */}
                  <div className="space-y-4 p-4 sm:p-6 rounded-lg border overflow-hidden bg-background border-border">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Formas de pagamento</h3>
                    
                    <div className="space-y-3 w-full">
                      {(() => {
                        const allMethods = [
                          { value: 'credit', dbValue: 'cartao', label: 'Cartão de Crédito', icon: CreditCard, availableFor: ['monthly', 'annual'] },
                          { value: 'pix', dbValue: 'pix', label: 'PIX', icon: PixIcon, availableFor: ['monthly', 'annual'] }
                        ];
                        
                        // Filtrar por métodos disponíveis no plano selecionado
                        const availablePaymentMethods = selectedPlan?.availablePaymentMethods || ['cartao', 'pix'];
                        const filteredByPlan = allMethods.filter(method => 
                          Array.isArray(availablePaymentMethods) && availablePaymentMethods.includes(method.dbValue)
                        );
                        
                        // Filtrar por período de cobrança
                        return filteredByPlan.filter(method => method.availableFor.includes(billingPeriod));
                      })().map(({ value, label, icon: Icon }) => (
                        <label 
                          key={value} 
                          className="relative p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all w-full block overflow-hidden"
                          style={{
                            borderColor: paymentMethod === value ? 'rgb(var(--teal-dark))' : 'rgb(var(--border))',
                            background: paymentMethod === value ? 'var(--bg-cream-lighter)' : 'white'
                          }}
                          onMouseEnter={(e) => {
                            if (paymentMethod !== value) {
                              e.currentTarget.style.borderColor = "rgb(var(--teal-dark))";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (paymentMethod !== value) {
                              e.currentTarget.style.borderColor = "rgb(var(--border))";
                            }
                          }}
                          onClick={() => setPaymentMethod(value as 'credit' | 'pix')}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center flex-1 min-w-0">
                              <div 
                                className="w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center flex-shrink-0"
                                style={{
                                  borderColor: paymentMethod === value ? 'rgb(var(--teal-dark))' : 'rgb(var(--border))',
                                  background: 'rgb(var(--background))'
                                }}
                              >
                                {paymentMethod === value && (
                                  <div 
                                    className="w-3 h-3 rounded-full"
                                   
                                  />
                                )}
                              </div>
                              <Icon className="w-5 h-5 mr-3 flex-shrink-0 text-foreground" />
                              <span className="text-sm sm:text-base text-foreground">{label}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>


                  {/* Dados do Cartão */}
                  {paymentMethod === 'credit' && (
                    <div className="space-y-4 p-6 rounded-lg border bg-muted">
                      <h4 className="text-lg font-semibold text-foreground">Dados do Cartão</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2 text-foreground">
                            Número do Cartão *
                          </label>
                          <input
                            type="text"
                            value={cardData.cardNumber}
                            onChange={(e) => {
                              const value = formatCardNumber(e.target.value);
                              setCardData({...cardData, cardNumber: value});
                            }}
                            className="w-full p-3 rounded-lg border border-border bg-background"
                            style={{

                              background: 'rgb(var(--background))'
                            }}
                            placeholder="1234 5678 9012 3456"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2 text-foreground">
                            Nome no Cartão *
                          </label>
                          <input
                            type="text"
                            value={cardData.cardHolder}
                            onChange={(e) => setCardData({...cardData, cardHolder: e.target.value.toUpperCase()})}
                            className="w-full p-3 rounded-lg border border-border bg-background"
                            style={{

                              background: 'rgb(var(--background))'
                            }}
                            placeholder="NOME COMPLETO"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2 text-foreground">
                            Validade *
                          </label>
                          <input
                            type="text"
                            value={cardData.expirationDate}
                            onChange={(e) => {
                              const value = formatExpirationDate(e.target.value);
                              setCardData({...cardData, expirationDate: value});
                            }}
                            className="w-full p-3 rounded-lg border border-border bg-background"
                            style={{

                              background: 'rgb(var(--background))'
                            }}
                            placeholder="12/2030"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2 text-foreground">
                            CVV *
                          </label>
                          <input
                            type="text"
                            value={cardData.securityCode}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 4) setCardData({...cardData, securityCode: value});
                            }}
                            className="w-full p-3 rounded-lg border border-border bg-background"
                            style={{

                              background: 'rgb(var(--background))'
                            }}
                            placeholder="123"
                            required
                          />
                        </div>

                        {/* Parcelas para Cartão de Crédito */}
                        {paymentMethod === 'credit' && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2 text-foreground">
                              Parcelas
                            </label>
                            <select
                              value={installments}
                              onChange={(e) => setInstallments(parseInt(e.target.value))}
                              className="w-full p-3 rounded-lg border border-border bg-background"
                              style={{

                                background: 'rgb(var(--background))'
                              }}
                            >
                              {Array.from({ length: getMaxInstallments(selectedPlan?.id) }, (_, i) => i + 1).map(i => (
                                <option key={i} value={i}>
                                  {i}x de {formatPrice((selectedPlan?.price || 0) / i)}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section 4: Resumo do pedido */}
                  <div className="space-y-4 p-6 rounded-lg border bg-background border-border">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-foreground">Resumo do pedido</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="block text-sm text-dark-secondary">Plano selecionado:</span>
                        <span className="font-semibold text-foreground">{selectedPlan?.name}</span>
                      </div>
                      <div>
                        <span className="block text-sm text-dark-secondary">Quantidade de pets:</span>
                        <span className="text-foreground">{pets.length} pet{pets.length > 1 ? 's' : ''}</span>
                      </div>
                      <div>
                        <span className="block text-sm text-dark-secondary">Modalidade:</span>
                        <span className="text-foreground">{billingPeriod === 'annual' ? 'Anual (12 meses)' : 'Mensal'}</span>
                      </div>
                      <div>
                        <span className="block text-sm text-dark-secondary">Forma de pagamento:</span>
                        <span className="text-foreground">
                          {paymentMethod === 'credit' ? 'Cartão de Crédito' : 'PIX'}
                        </span>
                      </div>
                    </div>
                  </div>



                  {/* Section 6: Total da 1ª mensalidade */}
                  <div className="p-6 rounded-lg border-2 border-teal-dark bg-primary">
                    <div className="text-center">
                      {/* Logo do cabeçalho */}
                      <div className="mb-4">
                        <img src="/unipet-logo.png" alt="Unipet Plan" className="h-8 w-auto mx-auto" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        Total 1ª mensalidade
                      </h3>
                      <div className="text-3xl font-bold">
                        {formatPrice(calculateFinalPrice())}
                      </div>
                      {billingPeriod === 'monthly' && paymentMethod === 'credit' && installments > 1 && (
                        <div className="text-sm mt-2">
                          Em {installments}x de {formatPrice(calculateFinalPrice() / installments)} no cartão
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ver mensalidades - Container expansível */}
                  <div className="rounded-lg border bg-background border-border">
                    <button
                      onClick={() => setShowMonthlyBreakdown(!showMonthlyBreakdown)}
                      className="w-full p-4 flex items-center justify-between transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground">Ver mensalidades</span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${
                          showMonthlyBreakdown ? 'rotate-180' : ''
                        }`} 

                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showMonthlyBreakdown && (
                      <div className="px-4 pb-4 border-t">
                        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                          {Array.from({ length: 12 }, (_, i) => (
                            <div key={i + 1} className="flex justify-between">
                              <span className="text-dark-secondary">{i + 1})</span>
                              <span className="text-foreground">{formatPrice(Math.round((selectedPlan?.price || 0) * pets.length))}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                    {/* Section 7: Termos de uso */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="w-5 h-5 text-teal-600 bg-white border-2 border-gray-300 rounded-md appearance-none cursor-pointer relative transition-all"
                          style={{
                            backgroundColor: termsAccepted ? 'rgb(var(--teal-dark))' : 'white',
                            borderColor: termsAccepted ? 'rgb(var(--teal-dark))' : 'rgb(var(--border))',
                            backgroundImage: termsAccepted ? 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' height=\'20px\' viewBox=\'0 -960 960 960\' width=\'20px\' fill=\'white\'%3e%3cpath d=\'M400-304 240-464l56-56 104 104 264-264 56 56-320 320Z\'/%3e%3c/svg%3e")' : 'none',
                            backgroundSize: '16px 16px',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                          }}
                        />
                        <label htmlFor="terms" className="text-sm text-foreground">
                          Li e aceito os{' '}
                          <a
                            href="/termos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium no-underline opacity-80 transition-opacity text-primary"

                          >
                            Termos de Uso
                          </a>
                          {' '}da plataforma
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout - 3 columns side by side */}
                  <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
                    
                    {/* Column 1: Cadastre seu endereço */}
                    <div className="space-y-4 p-6 rounded-lg border bg-background border-border">
                      <h3 className="text-lg font-semibold mb-4 text-foreground">Cadastre seu endereço</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-foreground">
                            CPF *
                          </label>
                          <input
                            type="text"
                            value={customerData.cpf}
                            onChange={(e) => {
                              // Permitir apenas números
                              const numbersOnly = e.target.value.replace(/\D/g, '');
                              if (numbersOnly.length <= 11) {
                                setCustomerData({...customerData, cpf: formatCPF(numbersOnly)});
                              }
                            }}
                            className="w-full p-3 rounded-lg border border-border bg-background"
                            style={{

                              background: 'rgb(var(--background))'
                            }}
                            placeholder="000.000.000-00"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-foreground">
                            CEP *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={customerData.zipCode}
                              onChange={(e) => {
                                // Permitir apenas números
                                const numbersOnly = e.target.value.replace(/\D/g, '');
                                console.log('🔍 [CEP INPUT DESKTOP] Digitado:', e.target.value, 'Números:', numbersOnly, 'Tamanho:', numbersOnly.length);
                                
                                if (numbersOnly.length <= 8) {
                                  const formattedCep = formatCEP(numbersOnly);
                                  setCustomerData({...customerData, zipCode: formattedCep});
                                  
                                  // Limpar erros ao digitar
                                  setCepError(null);
                                  
                                  // Buscar CEP automaticamente quando completar 8 dígitos
                                  if (numbersOnly.length === 8) {
                                    console.log('🚀 [CEP INPUT DESKTOP] 8 dígitos detectados! Chamando lookupCep...');
                                    lookupCep(numbersOnly);
                                  }
                                }
                              }}
                              className="w-full p-3 rounded-lg border pr-10"
                              style={{
                                borderColor: cepError ? 'rgb(var(--error))' : 'rgb(var(--border))',
                                background: 'rgb(var(--background))'
                              }}
                              placeholder="00000-000"
                              required
                            />
                            {isLoadingCep && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                          </div>
                          {fieldErrors['zipCode'] && (
                            <div className="text-sm mt-1 text-destructive">{fieldErrors['zipCode']}</div>
                          )}
                          {cepError && (
                            <div className="text-sm mt-1 text-destructive">{cepError}</div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-foreground">
                            Endereço *
                          </label>
                          <input
                            type="text"
                            value={customerData.address}
                            onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                            className="w-full p-3 rounded-lg border border-border bg-background"
                            style={{

                              background: 'rgb(var(--background))'
                            }}
                            placeholder="Rua e número"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-foreground">
                              Número
                            </label>
                            <input
                              type="text"
                              onChange={(e) => {
                                // Permitir apenas números
                                const numbersOnly = e.target.value.replace(/\D/g, '');
                                e.target.value = numbersOnly;
                              }}
                              className="w-full p-3 rounded-lg border border-border bg-background"
                              style={{

                                background: 'rgb(var(--background))'
                              }}
                              placeholder="123"
                              data-testid="input-number-desktop"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-foreground">
                              Complemento
                            </label>
                            <input
                              type="text"
                              className="w-full p-3 rounded-lg border border-border bg-background"
                              style={{

                                background: 'rgb(var(--background))'
                              }}
                              placeholder="Apartamento"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-foreground">
                            Bairro *
                          </label>
                          <input
                            type="text"
                            value={customerData.district}
                            onChange={(e) => setCustomerData({...customerData, district: e.target.value})}
                            className="w-full p-3 rounded-lg border border-border bg-background"
                            style={{

                              background: 'rgb(var(--background))'
                            }}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-foreground">
                              Estado *
                            </label>
                            <input
                              type="text"
                              value={customerData.state}
                              onChange={(e) => setCustomerData({...customerData, state: e.target.value})}
                              className="w-full p-3 rounded-lg border border-border bg-background"
                              style={{

                                background: 'rgb(var(--background))'
                              }}
                              placeholder="SP"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-foreground">
                              Cidade *
                            </label>
                            <input
                              type="text"
                              value={customerData.city}
                              onChange={(e) => setCustomerData({...customerData, city: e.target.value})}
                              className="w-full p-3 rounded-lg border border-border bg-background"
                              style={{

                                background: 'rgb(var(--background))'
                              }}
                              placeholder="Cidade"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Modalidade de contratação + Formas de pagamento */}
                    <div className="space-y-6">
                      {/* Modalidade de contratação */}
                      <div className="space-y-4 p-6 rounded-lg border bg-background border-border">
                        <h3 className="text-lg font-semibold mb-4 text-foreground">Modalidade de contratação</h3>
                        
                        {/* Segmented Control */}
                        <div 
                          className="rounded-md p-1 flex relative border"
                          style={{
                            background: 'var(--bg-gray-50)',

                          }}
                        >
                          <div 
                            className="flex-1 px-5 py-3 text-center cursor-pointer rounded font-medium transition-all duration-200 relative z-10"
                            style={{
                              color: billingPeriod === 'annual' ? 'rgb(var(--primary-foreground))' : 'rgb(var(--muted-foreground))',
                              background: billingPeriod === 'annual' ? 'var(--bg-teal)' : 'transparent',
                              boxShadow: billingPeriod === 'annual' ? '0 2px 4px var(--shadow-light)' : 'none'
                            }}
                            onClick={() => setBillingPeriod('annual')}
                          >
                            Anual
                          </div>
                          <div 
                            className="flex-1 px-5 py-3 text-center cursor-pointer rounded font-medium transition-all duration-200 relative z-10"
                            style={{
                              color: billingPeriod === 'monthly' ? 'rgb(var(--primary-foreground))' : 'rgb(var(--muted-foreground))',
                              background: billingPeriod === 'monthly' ? 'var(--bg-teal)' : 'transparent',
                              boxShadow: billingPeriod === 'monthly' ? '0 2px 4px var(--shadow-light)' : 'none'
                            }}
                            onClick={() => {
                              setBillingPeriod('monthly');
                              setPaymentMethod('credit');
                            }}
                          >
                            Mensal
                          </div>
                        </div>
                      </div>

                      {/* Formas de pagamento */}
                      <div className="space-y-4 p-6 rounded-lg border bg-background border-border">
                        <h3 className="text-lg font-semibold mb-4 text-foreground">Formas de pagamento</h3>
                        
                        <div className="space-y-3">
                          {[
                            { value: 'credit', label: 'Cartão de Crédito', icon: CreditCard, availableFor: ['monthly', 'annual'] },
                            { value: 'pix', label: 'PIX', icon: PixIcon, availableFor: ['annual'] }
                          ].filter(method => method.availableFor.includes(billingPeriod)).map(({ value, label, icon: Icon }) => (
                            <label 
                              key={value} 
                              className="relative flex items-center justify-between p-4 rounded-lg cursor-pointer"
                              style={{
                                borderColor: paymentMethod === value ? 'var(--border-teal)' : 'var(--border-light)',
                                backgroundColor: paymentMethod === value ? 'var(--bg-cream-lighter)' : 'var(--bg-cream-lighter)',
                                border: paymentMethod === value ? '2px solid var(--border-teal)' : '2px solid var(--border-light)'
                              }}
                            >
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value={value}
                                  checked={paymentMethod === value}
                                  onChange={(e) => setPaymentMethod(e.target.value as 'credit' | 'pix')}
                                  className="mr-3"
                                  style={{ accentColor: 'var(--bg-teal)' }}
                                />
                                <Icon className="w-5 h-5 mr-3 text-foreground" />
                                <span className="text-foreground">{label}</span>
                              </div>
                            </label>
                          ))}
                        </div>

                        {/* Credit Card Fields */}
                        {paymentMethod === 'credit' && (
                          <div className="space-y-4 mt-6">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-foreground">
                                Número do cartão*
                              </label>
                              <input
                                type="text"
                                value={cardData.cardNumber}
                                onChange={(e) => {
                                  const value = formatCardNumber(e.target.value);
                                  setCardData({...cardData, cardNumber: value});
                                }}
                                className="w-full p-3 rounded-lg border border-border bg-background"
                                style={{

                                  background: 'rgb(var(--background))'
                                }}
                                placeholder="0000 0000 0000 0000"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2 text-foreground">
                                Nome impresso no cartão*
                              </label>
                              <input
                                type="text"
                                value={cardData.cardHolder}
                                onChange={(e) => setCardData({...cardData, cardHolder: e.target.value.toUpperCase()})}
                                className="w-full p-3 rounded-lg border border-border bg-background"
                                style={{

                                  background: 'rgb(var(--background))'
                                }}
                                placeholder="NOME SOBRENOME"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-foreground">
                                  Vencimento*
                                </label>
                                <input
                                  type="text"
                                  value={cardData.expirationDate}
                                  onChange={(e) => {
                                    const value = formatExpirationDate(e.target.value);
                                    setCardData({...cardData, expirationDate: value});
                                  }}
                                  className="w-full p-3 rounded-lg border border-border bg-background"
                                  style={{

                                    background: 'rgb(var(--background))'
                                  }}
                                  placeholder="(Mês/Ano)"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2 text-foreground">
                                  CVV*
                                </label>
                                <input
                                  type="text"
                                  value={cardData.securityCode}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 4) {
                                      setCardData({...cardData, securityCode: value});
                                    }
                                  }}
                                  className="w-full p-3 rounded-lg border border-border bg-background"
                                  style={{

                                    background: 'rgb(var(--background))'
                                  }}
                                  placeholder="Número de 3 ou 4 dígitos na parte posterior do cartão"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 3: Resumo do pedido */}
                    <div className="space-y-6">
                      {/* Resumo do pedido */}
                      <div className="space-y-4 p-6 rounded-lg border bg-background border-border">
                        <h3 className="text-lg font-semibold mb-4 text-foreground">Resumo do pedido</h3>
                        <div className="space-y-3">
                          <div>
                            <span className="block text-sm text-dark-secondary">{selectedPlan?.name} | {pets[0]?.name} | {billingPeriod === 'annual' ? 'Anual' : 'Mensal'}</span>
                            <span className="text-foreground">{formatPrice(selectedPlan?.price || 0)}</span>
                          </div>
                          <div>
                            <span className="block text-sm text-dark-secondary">Modalidade:</span>
                            <span className="text-foreground">{billingPeriod === 'annual' ? 'Anual (12 meses)' : 'Mensal'}</span>
                          </div>
                          <div>
                            <span className="block text-sm text-dark-secondary">Forma de pagamento:</span>
                            <span className="text-foreground">
                              {paymentMethod === 'credit' ? 'Cartão de Crédito' : 'PIX'}
                            </span>
                          </div>
                        </div>
                      </div>

    

                      {/* Total 1ª mensalidade */}
                      <div className="p-6 rounded-lg border-2 border-teal-dark bg-primary">
                        <div className="text-center">
                          <div className="mb-4">
                            <img src="/unipet-logo.png" alt="Unipet Plan" className="h-8 w-auto mx-auto" />
                          </div>
                          <h3 className="text-xl font-bold mb-2">
                            Total 1ª mensalidade
                          </h3>
                          <div className="text-3xl font-bold">
                            {formatPrice(calculateFinalPrice())}
                          </div>
                          {billingPeriod === 'monthly' && paymentMethod === 'credit' && installments > 1 && (
                            <div className="text-sm mt-2">
                              Em {installments}x de {formatPrice(calculateFinalPrice() / installments)} no cartão
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ver mensalidades */}
                      <div className="rounded-lg border bg-background border-border">
                        <button
                          onClick={() => setShowMonthlyBreakdown(!showMonthlyBreakdown)}
                          className="w-full p-4 flex items-center justify-between transition-colors"
                        >
                          <span className="text-sm font-medium text-foreground">Ver mensalidades</span>
                          <svg 
                            className={`w-4 h-4 transition-transform ${
                              showMonthlyBreakdown ? 'rotate-180' : ''
                            }`} 
  
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {showMonthlyBreakdown && (
                          <div className="px-4 pb-4 border-t">
                            <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                              {Array.from({ length: 12 }, (_, i) => (
                                <div key={i + 1} className="flex justify-between">
                                  <span className="text-dark-secondary">{i + 1})</span>
                                  <span className="text-foreground">{formatPrice(Math.round((selectedPlan?.price || 0) * pets.length))}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Termos de uso */}
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="terms-desktop"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="w-5 h-5 text-teal-600 bg-white border-2 border-gray-300 rounded-md appearance-none cursor-pointer relative transition-all"
                            style={{
                              backgroundColor: termsAccepted ? 'rgb(var(--teal-dark))' : 'white',
                              borderColor: termsAccepted ? 'rgb(var(--teal-dark))' : 'rgb(var(--border))',
                              backgroundImage: termsAccepted ? 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' height=\'20px\' viewBox=\'0 -960 960 960\' width=\'20px\' fill=\'white\'%3e%3cpath d=\'M400-304 240-464l56-56 104 104 264-264 56 56-320 320Z\'/%3e%3c/svg%3e")' : 'none',
                              backgroundSize: '16px 16px',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat'
                            }}
                          />
                          <label htmlFor="terms-desktop" className="text-sm text-foreground">
                            Li e aceito os{' '}
                            <a
                              href="/termos"
                              target="_blank"
                              rel="noopener noreferrer"

                              className="font-medium no-underline opacity-80 transition-opacity text-primary"
                            >
                              Termos de Uso
                            </a>
                          </label>
                        </div>
                        
                        {/* Botão Concluir - Desktop */}
                        <div className="hidden md:block mt-6">
                          <button
                            onClick={nextStep}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center space-x-2 px-8 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-primary-foreground"
                            style={{
                              background: 'var(--btn-ver-planos-bg)',
                              color: 'rgb(var(--primary-foreground))'
                            }}
                          >
                            {isLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 rounded-full animate-spin" 
                                  style={{borderColor: 'rgb(var(--primary-foreground))', borderTopColor: 'transparent'}} />
                                <span>Processando...</span>
                              </>
                            ) : (
                              <>
                                <span>
                                  {currentStep === 3 
                                    ? 'Concluir' 
                                    : (currentStep === 1 && isEditingPet) 
                                    ? 'Atualizar Pet' 
                                    : 'Próximo'
                                  }
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

            {/* DEBUG: Estado do PIX */}
            {console.log('🔍 [RENDER] Estados PIX:', { 
              showPixResult, 
              hasPixPaymentResult: !!pixPaymentResult,
              pixQrCode: pixPaymentResult?.qrCodeBase64 ? 'PRESENTE' : 'AUSENTE'
            })}
            
            {/* PIX Payment Result Display */}
            {(showPixResult && pixPaymentResult) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 rounded-xl p-8"
                data-testid="pix-payment-result"
                style={{
                  background: 'var(--bg-cream-lighter)',
                  border: '2px solid var(--border-teal-light)'
                }}
              >
                <div className="text-center mb-8">
                  {pixPaymentStatus === 'approved' ? (
                    // Payment Confirmed State
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-success">

                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h2 className="text-2xl md:text-2xl font-bold mb-2 text-gold">
                        <span className="md:hidden">
                          Compra Concluída<br />com Sucesso!
                        </span>
                        <span className="hidden md:inline">
                          Compra Concluída com Sucesso!
                        </span>
                      </h2>
                      <p className="text-base md:text-lg text-dark-secondary">
                        Seu pagamento PIX foi confirmado e seu plano foi ativado
                      </p>
                      <p className="text-sm mt-2 text-dark-secondary">
                        Pedido: <span className="font-mono font-bold">{pixPaymentResult.orderId}</span>
                      </p>
                    </>
                  ) : pixPaymentStatus === 'rejected' ? (
                    // Payment Rejected State
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-error">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold mb-2 text-destructive">
                        ❌ Pagamento Rejeitado
                      </h2>
                      <p className="text-lg text-dark-secondary">
                        Houve um problema com o pagamento PIX
                      </p>
                      <p className="text-sm mt-2 text-dark-secondary">
                        Pedido: <span className="font-mono font-bold">{pixPaymentResult.orderId}</span>
                      </p>
                    </>
                  ) : (
                    // Payment Pending State
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-success">

                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold mb-2 text-primary">
                        PIX Gerado com Sucesso!
                      </h2>
                      <p className="text-lg text-dark-secondary">
                        Escaneie o QR Code ou use o código copia e cola para finalizar o pagamento
                      </p>
                      <p className="text-sm mt-2 text-dark-secondary">
                        Pedido: <span className="font-mono font-bold">{pixPaymentResult.orderId}</span>
                      </p>
                    </>
                  )}
                </div>

                {/* Only show QR Code and Copy-Paste when payment is pending */}
                {pixPaymentStatus === 'pending' && (
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* QR Code */}
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-4 text-foreground">
                        QR Code PIX
                      </h3>
                      <div className="bg-white p-6 rounded-lg border inline-block">
                        <img 
                          src={`data:image/png;base64,${pixPaymentResult.qrCodeBase64}`}
                          alt="QR Code PIX" 
                          className="w-48 h-48 mx-auto"
                        />
                      </div>
                      <p className="text-sm mt-4 text-dark-secondary">
                        Abra o app do seu banco e escaneie o QR Code
                    </p>
                  </div>

                  {/* Copy and Paste Code */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">
                      Código Copia e Cola
                    </h3>
                    <div className="bg-white p-4 rounded-lg border mb-4">
                      <p className="text-xs font-mono break-all text-foreground">
                        {pixPaymentResult.qrCodeString}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        if (isCopying) return;
                        setIsCopying(true);
                        await navigator.clipboard.writeText(pixPaymentResult.qrCodeString);
                        setSuccessMessage('Código PIX copiado para a área de transferência!');
                        setTimeout(() => {
                          setIsCopying(false);
                          setSuccessMessage('');
                        }, 1000);
                      }}
                      data-testid="copy-pix-code"
                      className="w-full px-6 py-3 rounded-lg font-semibold transition-all opacity-80 disabled:opacity-50"
                      style={{
                        background: 'var(--text-teal)',
                        color: 'rgb(var(--primary-foreground))'
                      }}
                      disabled={isCopying}
                    >
                      {isCopying ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Copiando...
                        </span>
                      ) : (
                        'Copiar Código'
                      )}
                    </button>
                    <p className="text-sm mt-4 text-dark-secondary">
                      Copie o código e cole no app do seu banco na opção PIX
                    </p>
                  </div>
                </div>
                )}

                {/* Action buttons for completed payments */}
                {pixPaymentStatus === 'approved' && (
                  <div className="text-center">
                    <button
                      onClick={() => navigate('/customer/login')}
                      className="px-8 py-3 rounded-lg font-semibold transition-all opacity-80 bg-primary text-primary-foreground"
                      style={{
                        background: 'var(--btn-ver-planos-bg)',
                        color: 'rgb(var(--primary-foreground))'
                      }}
                    >
                      Área do Cliente
                    </button>
                  </div>
                )}

              </motion.div>
            )}


            {/* Credit Card Payment Result Display */}
            {(showCreditCardResult && creditCardPaymentResult) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 rounded-xl p-8"
                data-testid="credit-card-payment-result"
                style={{
                  background: 'var(--bg-cream-lighter)',
                  border: '2px solid var(--border-teal-light)'
                }}
              >
                <div className="text-center mb-8">
                  {creditCardPaymentStatus === 'rejected' ? (
                    // Payment Rejected State
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-error">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold mb-2 text-destructive">
                        ❌ Pagamento Recusado
                      </h2>
                      <p className="text-lg text-dark-secondary">
                        Houve um problema com o pagamento do cartão
                      </p>
                      <p className="text-sm mt-2 text-dark-secondary">
                        Motivo: {creditCardPaymentResult.returnMessage}
                      </p>
                      <p className="text-sm mt-1 text-dark-secondary">
                        Pedido: <span className="font-mono font-bold">{creditCardPaymentResult.orderId}</span>
                      </p>
                    </>
                  ) : (
                    // Payment Pending State  
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-success">

                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold mb-2 text-primary">
                        Pagamento em Análise
                      </h2>
                      <p className="text-lg text-dark-secondary">
                        Seu pagamento está sendo processado pela operadora
                      </p>
                      <p className="text-sm mt-2 text-dark-secondary">
                        Status: {creditCardPaymentResult.returnMessage}
                      </p>
                      <p className="text-sm mt-1 text-dark-secondary">
                        Pedido: <span className="font-mono font-bold">{creditCardPaymentResult.orderId}</span>
                      </p>
                    </>
                  )}
                </div>

                {/* Retry button for rejected payments */}
                {creditCardPaymentStatus === 'rejected' && (
                  <div className="text-center space-y-4">
                    <button
                      onClick={() => {
                        setShowCreditCardResult(false);
                        setCreditCardPaymentResult(null);
                        setCreditCardPaymentStatus('pending');
                        setCurrentStep(3); // Volta para o step de pagamento
                      }}
                      className="px-8 py-3 rounded-lg font-semibold transition-all opacity-80 bg-primary text-primary-foreground"
                      style={{
                        background: 'var(--btn-ver-planos-bg)',
                        color: 'rgb(var(--primary-foreground))'
                      }}
                    >
                      Tentar Novamente
                    </button>
                    <p className="text-sm text-dark-secondary">
                      Verifique os dados do cartão ou tente outro método de pagamento
                    </p>
                  </div>
                )}

              </motion.div>
            )}


            {/* Navigation Buttons - Hidden when PIX or Credit Card result is displayed */}
            {!showPixResult && !showCreditCardResult && (
            <div className={`mt-8 pt-8 border-t ${currentStep === 3 ? 'md:hidden flex justify-center' : 'flex justify-between'}`}>
              {currentStep !== 3 && (
                <button
                  onClick={() => currentStep === 1 ? navigate('/') : prevStep()}
                  className="flex items-center space-x-2 px-6 py-3 opacity-80 transition-colors text-dark-secondary"
                >
                  <span>{currentStep === 1 ? 'Voltar ao início' : 'Anterior'}</span>
                </button>
              )}

              <button
                onClick={nextStep}
                disabled={isLoading}
                className={`flex items-center justify-center space-x-2 px-8 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-primary-foreground ${currentStep === 3 ? 'w-full md:hidden' : ''}`}
                style={{
                  background: 'var(--btn-ver-planos-bg)',
                  color: 'rgb(var(--primary-foreground))'
                }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 rounded-full animate-spin" 
                      style={{borderColor: 'rgb(var(--primary-foreground))', borderTopColor: 'transparent'}} />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {currentStep === 3 
                        ? 'Concluir' 
                        : (currentStep === 1 && isEditingPet) 
                        ? 'Atualizar Pet' 
                        : 'Próximo'
                      }
                    </span>
                  </>
                )}
              </button>
            </div>
            )}
          </div>
        </div>
      </div>
      <>
        <Footer />
      
      {/* 🎉 Popup de Sucesso para Cartão de Crédito */}
      <AnimatePresence>
        {showCreditCardSuccessPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreditCardSuccessPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--bg-cream-lighter)',
                border: '2px solid var(--btn-ver-planos-bg)'
              }}
            >
              {/* Ícone de Sucesso */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Título */}
              <h2 className="text-2xl font-bold mb-4 text-gold">
                Pagamento Aprovado!
              </h2>
              
              {/* Mensagem */}
              <p className="text-lg mb-6 text-dark-secondary">
                Seu cartão de crédito foi aprovado com sucesso!<br />
                <strong>Seu plano foi ativado</strong> e você já pode acessar a área do cliente.
              </p>
              
              {/* Detalhes do Pagamento */}
              {creditCardPaymentResult && (
                <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-6" style={{border: '1px solid rgb(var(--border))'}}>
                  <p className="text-sm mb-2 text-dark-secondary">
                    <strong>Pedido:</strong> {creditCardPaymentResult.orderId}
                  </p>
                </div>
              )}
              
              {/* Botões */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowCreditCardSuccessPopup(false);
                    navigate('/customer/login');
                  }}
                  className="w-full px-6 py-3 rounded-lg font-semibold transition-all opacity-90"
                  style={{
                    background: 'var(--btn-ver-planos-bg)',
                    color: 'rgb(var(--primary-foreground))'
                  }}
                >
                  Ir para Área do Cliente
                </button>
                
                <button
                  onClick={() => setShowCreditCardSuccessPopup(false)}
                  className="w-full px-6 py-3 rounded-lg font-semibold transition-all opacity-80"
                  style={{
                    background: 'transparent',
                    color: 'rgb(var(--muted-foreground))',
                    border: '1px solid rgb(var(--border))'
                  }}
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </>
    </div>
  );
}