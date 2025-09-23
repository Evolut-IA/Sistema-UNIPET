import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator
} from '@/components/ui/select';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

interface PetData {
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
}

interface CustomerData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface PaymentData {
  method: 'credit_card' | 'pix';
  creditCard?: {
    cardNumber: string;
    holder: string;
    expirationDate: string;
    securityCode: string;
    installments: number;
  };
}

export default function Checkout() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/checkout/:planId?');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [petsData, setPetsData] = useState<PetData[]>([{
    name: '',
    species: '',
    breed: '',
    age: 0,
    weight: 0
  }]);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  
  const [paymentData, setPaymentData] = useState<PaymentData>({
    method: 'credit_card',
    creditCard: {
      cardNumber: '',
      holder: '',
      expirationDate: '',
      securityCode: '',
      installments: 1
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [collapsedPets, setCollapsedPets] = useState<boolean[]>([false]); // Controla quais pets estão colapsados
  const [pixData, setPixData] = useState<{ qrCode: string; copyPasteCode: string; orderId: string } | null>(null);

  // Função para validar se o último pet permite adicionar um novo
  const canAddNewPet = () => {
    if (petsData.length >= 5) return false;
    const lastPet = petsData[petsData.length - 1];
    if (!lastPet) return false;
    return lastPet.name.trim() !== '' && lastPet.species.trim() !== '' && lastPet.age > 0;
  };

  // Funções para gerenciar múltiplos pets
  const addPet = () => {
    if (canAddNewPet()) {
      // Colapsar todos os pets anteriores
      const newCollapsedState = new Array(petsData.length).fill(true);
      newCollapsedState.push(false); // Novo pet fica aberto
      setCollapsedPets(newCollapsedState);
      
      // Adicionar novo pet
      setPetsData([...petsData, {
        name: '',
        species: '',
        breed: '',
        age: 0,
        weight: 0
      }]);
    }
  };

  const removePet = (index: number) => {
    if (petsData.length > 1) {
      setPetsData(petsData.filter((_, i) => i !== index));
      setCollapsedPets(collapsedPets.filter((_, i) => i !== index));
    }
  };

  // Função para expandir/colapsar um pet específico
  const togglePetCollapse = (index: number) => {
    const newCollapsedState = [...collapsedPets];
    newCollapsedState[index] = !newCollapsedState[index];
    setCollapsedPets(newCollapsedState);
  };

  const updatePet = (index: number, field: keyof PetData, value: string | number) => {
    const updatedPets = [...petsData];
    updatedPets[index] = { ...updatedPets[index], [field]: value } as PetData;
    setPetsData(updatedPets);
  };

  // Validação para pets - todos os campos obrigatórios devem estar preenchidos
  const isPetsDataValid = () => {
    return petsData.every(pet => pet.name && pet.species && pet.age);
  };
  
  // Validação para dados do cliente
  const isCustomerDataValid = () => {
    return customerData.name && customerData.email && customerData.cpf && customerData.phone;
  };
  
  // Validação para pagamento
  const isPaymentDataValid = () => {
    if (paymentData.method === 'credit_card' && paymentData.creditCard) {
      const isCardDataValid = paymentData.creditCard.cardNumber && 
                              paymentData.creditCard.holder && 
                              paymentData.creditCard.expirationDate && 
                              paymentData.creditCard.securityCode;
      
      // Validar regras de parcelas baseadas no plano
      const installments = paymentData.creditCard.installments || 1;
      const isBasicOrInfinity = selectedPlan && ['BASIC', 'INFINITY'].some(type => selectedPlan.name.toUpperCase().includes(type));
      
      let isInstallmentsValid = false;
      if (isBasicOrInfinity) {
        // Planos Basic/Infinity: apenas 1x
        isInstallmentsValid = installments === 1;
      } else {
        // Outros planos: 1x a 12x
        isInstallmentsValid = installments >= 1 && installments <= 12;
      }
      
      return isCardDataValid && isInstallmentsValid;
    }
    return paymentData.method === 'pix';
  };

  // Fetch plans on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  // Set selected plan based on route parameter
  useEffect(() => {
    if (params?.planId && plans.length > 0) {
      const plan = plans.find(p => p.id === params.planId);
      if (plan) {
        setSelectedPlan(plan);
        setCurrentStep(2); // Skip plan selection if coming from direct link
      }
    }
  }, [params?.planId, plans]);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setCurrentStep(2);
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/plans');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Validar regras de parcelas antes de enviar
      if (paymentData.method === 'credit_card' && paymentData.creditCard) {
        const installments = paymentData.creditCard.installments || 1;
        const isBasicOrInfinity = selectedPlan && ['BASIC', 'INFINITY'].some(type => selectedPlan.name.toUpperCase().includes(type));
        
        if (isBasicOrInfinity && installments !== 1) {
          alert('Planos Basic e Infinity permitem apenas pagamento à vista (1x).');
          setIsLoading(false);
          return;
        }
        
        if (!isBasicOrInfinity && (installments < 1 || installments > 12)) {
          alert('Este plano permite parcelamento de 1x a 12x.');
          setIsLoading(false);
          return;
        }
      }
      // Primeiro salvar dados do cliente
      const clientResponse = await fetch('/api/checkout/save-customer-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientData: {
            full_name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            password: '123456', // Senha padrão temporária
            address: customerData.address,
            city: customerData.city,
            state: customerData.state,
            zipCode: customerData.zipCode
          },
          petsData: petsData.map(pet => ({
            name: pet.name,
            species: pet.species,
            breed: pet.breed || '',
            age: String(pet.age || 1),
            weight: String(pet.weight || 1),
            sex: 'Macho',
            planId: selectedPlan?.id
          }))
        }),
      });

      if (!clientResponse.ok) {
        throw new Error('Erro ao salvar dados do cliente');
      }

      const clientData = await clientResponse.json();

      // Processar pagamento
      const paymentRequestData = {
        clientId: clientData.clientId,
        addressData: {
          address: customerData.address,
          number: '123', // Número padrão
          complement: '',
          city: customerData.city,
          state: customerData.state,
          zipCode: customerData.zipCode
        },
        paymentData: {
          customer: {
            name: customerData.name,
            email: customerData.email,
            cpf: customerData.cpf
          },
          payment: paymentData.method === 'credit_card' ? {
            cardNumber: paymentData.creditCard?.cardNumber,
            holder: paymentData.creditCard?.holder,
            expirationDate: paymentData.creditCard?.expirationDate,
            securityCode: paymentData.creditCard?.securityCode,
            installments: paymentData.creditCard?.installments || 1
          } : undefined
        },
        planData: {
          planId: selectedPlan?.id,
          amount: calculateTotal(),
          billingPeriod: 'monthly' // Pode ser alterado conforme necessário
        },
        paymentMethod: paymentData.method
      };

      const response = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequestData),
      });

      if (response.ok) {
        const result = await response.json();
        if (paymentData.method === 'pix' && result.payment?.pixQrCode) {
          // Para PIX, armazenar dados no estado ao invés de navegar
          setPixData({
            qrCode: result.payment.pixQrCode,
            copyPasteCode: result.payment.pixCode,
            orderId: result.payment.orderId
          });
        } else {
          navigate(`/checkout-success?order=${result.payment?.orderId}&method=${paymentData.method}`);
        }
      } else {
        console.error('Checkout failed');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  // Calcular valor total com descontos por pet (price já está em centavos)
  const calculateTotal = () => {
    if (!selectedPlan) return 0;
    
    let totalCents = 0;
    const basePriceCents = selectedPlan.price; // Já está em centavos
    
    // Calcular preço por pet com desconto individual
    petsData.forEach((_, index) => {
      let petPriceCents = basePriceCents;
      
      // Aplicar desconto apenas para planos Basic/Infinity e pets a partir do 2º
      if (['BASIC', 'INFINITY'].some(type => selectedPlan.name.toUpperCase().includes(type)) && index > 0) {
        const discountPercentage = index === 1 ? 5 :  // 2º pet: 5%
                                 index === 2 ? 10 : // 3º pet: 10%
                                 15;                 // 4º+ pets: 15%
        petPriceCents = Math.round(basePriceCents * (1 - discountPercentage / 100));
      }
      
      totalCents += petPriceCents;
    });
    
    return totalCents;
  };

  // Função para identificar se o plano tem desconto por múltiplos pets
  const isPlanEligibleForDiscount = (planName: string) => {
    const name = planName.toLowerCase();
    return name === 'basic' || name === 'infinity';
  };

  // Função para calcular desconto por pet
  const calculatePetDiscount = (petIndex: number) => {
    if (petIndex === 0) return 0; // Primeiro pet não tem desconto
    if (petIndex === 1) return 5; // 2º pet: 5%
    if (petIndex === 2) return 10; // 3º pet: 10%
    return 15; // 4º e 5º pet: 15%
  };


  return (
    <div className="min-h-screen" style={{backgroundColor: '#277677'}}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step
                        ? 'bg-white/20 text-white border border-white'
                        : 'bg-teal-700 text-white border border-white/30'
                    }`}
                  >
                    {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        currentStep > step ? 'bg-white' : 'bg-teal-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 1 ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-center mb-6">
                  Escolha seu Plano
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`bg-white border-2 rounded-lg p-6 cursor-pointer transition-all shadow-lg ${
                        selectedPlan?.id === plan.id
                          ? 'border-teal-600 ring-2 ring-teal-300'
                          : 'border-gray-200 hover:border-teal-300 hover:shadow-xl'
                      }`}
                      onClick={() => handlePlanSelect(plan)}
                    >
                      <h3 className="text-xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                      <p className="text-2xl font-bold text-teal-600 mb-4">
                        {formatPrice(plan.price)}
                      </p>
                      <p className="text-gray-600 mb-4 text-sm">{plan.description}</p>
                    </div>
                  ))}
                </div>

                {/* Navigation Buttons for Step 1 (now inside white container) */}
                <div className="flex justify-center mt-8 pt-6 border-t">
                  <button
                    onClick={handleNextStep}
                    disabled={!selectedPlan}
                    className="flex items-center justify-center w-full md:w-auto px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'var(--btn-ver-planos-bg)',
                      color: 'var(--btn-ver-planos-text)',
                      border: 'none'
                    }}
                  >
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8">

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    Dados dos Pets
                  </h2>
                  {petsData.length < 5 && (
                    <button
                      type="button"
                      onClick={addPet}
                      disabled={!canAddNewPet()}
                      className="hidden md:flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'var(--btn-cotacao-gratuita-bg)',
                        color: 'var(--btn-cotacao-gratuita-text)',
                        border: 'var(--btn-cotacao-gratuita-border)'
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar Pet
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {petsData.map((pet, index) => {
                    const isCollapsed = collapsedPets[index];
                    
                    return (
                      <div key={index} className={`border border-gray-200 rounded-lg relative ${isCollapsed ? 'py-3 px-4' : 'p-6'}`}>
                        <div className={`flex justify-between items-center ${isCollapsed ? 'mb-0' : 'mb-4'}`}>
                          <div className="flex flex-col md:flex-row md:items-center">
                          <h3 
                            className="text-lg font-semibold cursor-pointer flex items-center"
                            onClick={() => togglePetCollapse(index)}
                          >
                            Pet {index + 1}
                            {selectedPlan && isPlanEligibleForDiscount(selectedPlan.name) && calculatePetDiscount(index) > 0 && (
                              <span className="hidden md:inline text-sm text-green-600 ml-2">
                                ({calculatePetDiscount(index)}% desconto)
                              </span>
                            )}
                            {isCollapsed && pet.name && (
                              <span className="text-sm text-gray-600 ml-2 font-normal">
                                - {pet.name}
                              </span>
                            )}
                          </h3>
                          
                          {/* Texto de desconto - Versão Mobile (embaixo do título) */}
                          {selectedPlan && isPlanEligibleForDiscount(selectedPlan.name) && calculatePetDiscount(index) > 0 && (
                            <span className="md:hidden text-xs text-green-600 mt-1">
                              ({calculatePetDiscount(index)}% desconto)
                            </span>
                          )}
                          </div>
                          
                          {petsData.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePet(index)}
                              className="hidden md:flex items-center px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remover
                            </button>
                          )}
                        </div>

                        {!isCollapsed && (
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Nome do Pet
                              </label>
                              <input
                                type="text"
                                value={pet.name}
                                onChange={(e) => updatePet(index, 'name', e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                                placeholder="Nome do seu pet"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Espécie
                              </label>
                              <Select value={pet.species} onValueChange={(value) => updatePet(index, 'species', value)}>
                                <SelectTrigger 
                                  className="w-full p-3 rounded-lg border text-sm"
                                  style={{
                                    borderColor: 'var(--border-gray)',
                                    background: 'white'
                                  }}
                                >
                                  <SelectValue placeholder="Selecione a espécie" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Cão">Cão</SelectItem>
                                  <SelectSeparator />
                                  <SelectItem value="Gato">Gato</SelectItem>
                                  <SelectSeparator />
                                  <SelectItem value="Aves">Aves</SelectItem>
                                  <SelectSeparator />
                                  <SelectItem value="Tartarugas ou jabutis">Tartarugas ou jabutis</SelectItem>
                                  <SelectSeparator />
                                  <SelectItem value="Coelhos ou hamsters">Coelhos ou hamsters</SelectItem>
                                  <SelectSeparator />
                                  <SelectItem value="Porquinho da índia">Porquinho da índia</SelectItem>
                                  <SelectSeparator />
                                  <SelectItem value="Outros">Outros</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Raça
                              </label>
                              <input
                                type="text"
                                value={pet.breed}
                                onChange={(e) => updatePet(index, 'breed', e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                                placeholder="Raça do pet (opcional)"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Idade (anos)
                              </label>
                              <input
                                type="number"
                                value={pet.age}
                                onChange={(e) => updatePet(index, 'age', parseInt(e.target.value) || 0)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                                placeholder="Idade"
                              />
                              
                              {/* Botão Remover - Versão Mobile (embaixo do campo Idade) */}
                              {petsData.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removePet(index)}
                                  className="md:hidden flex items-center justify-center w-full mt-3 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Remover
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Botão Adicionar Pet - Versão Mobile (embaixo dos pets) */}
                {petsData.length < 5 && (
                  <div className="flex md:hidden justify-center mt-4">
                    <button
                      type="button"
                      onClick={addPet}
                      disabled={!canAddNewPet()}
                      className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'var(--btn-cotacao-gratuita-bg)',
                        color: 'var(--btn-cotacao-gratuita-text)',
                        border: 'var(--btn-cotacao-gratuita-border)'
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar Pet
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-center mb-6">
                  Dados do Cliente
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={customerData.name}
                      onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      CPF
                    </label>
                    <input
                      type="text"
                      value={customerData.cpf}
                      onChange={(e) => setCustomerData({...customerData, cpf: e.target.value})}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-center mb-6">
                  Pagamento
                </h2>
                
                <div className="space-y-6">
                  {/* Seleção de método de pagamento */}
                  <div>
                    <label className="block text-lg font-medium mb-4">
                      Método de Pagamento
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentData.method === 'credit_card' 
                            ? 'border-teal-600 bg-teal-50' 
                            : 'border-gray-200 hover:border-teal-300'
                        }`}
                        onClick={() => setPaymentData({...paymentData, method: 'credit_card'})}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            paymentData.method === 'credit_card' 
                              ? 'border-teal-600 bg-teal-600' 
                              : 'border-gray-300'
                          }`}>
                            {paymentData.method === 'credit_card' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                          </div>
                          <div>
                            <h3 className="font-medium">Cartão de Crédito</h3>
                            <p className="text-sm text-gray-600">Visa, Mastercard, Elo</p>
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentData.method === 'pix' 
                            ? 'border-teal-600 bg-teal-50' 
                            : 'border-gray-200 hover:border-teal-300'
                        }`}
                        onClick={() => setPaymentData({...paymentData, method: 'pix'})}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            paymentData.method === 'pix' 
                              ? 'border-teal-600 bg-teal-600' 
                              : 'border-gray-300'
                          }`}>
                            {paymentData.method === 'pix' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                          </div>
                          <div>
                            <h3 className="font-medium">PIX</h3>
                            <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Formulário de cartão de crédito */}
                  {paymentData.method === 'credit_card' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Dados do Cartão</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2">
                            Número do Cartão
                          </label>
                          <input
                            type="text"
                            value={paymentData.creditCard?.cardNumber || ''}
                            onChange={(e) => setPaymentData({
                              ...paymentData,
                              creditCard: {
                                ...paymentData.creditCard!,
                                cardNumber: e.target.value
                              }
                            })}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="0000 0000 0000 0000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Nome no Cartão
                          </label>
                          <input
                            type="text"
                            value={paymentData.creditCard?.holder || ''}
                            onChange={(e) => setPaymentData({
                              ...paymentData,
                              creditCard: {
                                ...paymentData.creditCard!,
                                holder: e.target.value
                              }
                            })}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="Nome conforme cartão"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Validade
                          </label>
                          <input
                            type="text"
                            value={paymentData.creditCard?.expirationDate || ''}
                            onChange={(e) => setPaymentData({
                              ...paymentData,
                              creditCard: {
                                ...paymentData.creditCard!,
                                expirationDate: e.target.value
                              }
                            })}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="MM/AAAA"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            value={paymentData.creditCard?.securityCode || ''}
                            onChange={(e) => setPaymentData({
                              ...paymentData,
                              creditCard: {
                                ...paymentData.creditCard!,
                                securityCode: e.target.value
                              }
                            })}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Parcelas
                          </label>
                          <select
                            value={paymentData.creditCard?.installments || 1}
                            onChange={(e) => setPaymentData({
                              ...paymentData,
                              creditCard: {
                                ...paymentData.creditCard!,
                                installments: parseInt(e.target.value)
                              }
                            })}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                            disabled={selectedPlan && ['BASIC', 'INFINITY'].some(type => selectedPlan.name.toUpperCase().includes(type))}
                          >
                            {selectedPlan && ['BASIC', 'INFINITY'].some(type => selectedPlan.name.toUpperCase().includes(type)) ? (
                              <option value={1}>1x à vista (único disponível)</option>
                            ) : (
                              [...Array(12)].map((_, i) => {
                                const totalCents = calculateTotal();
                                const installmentValue = totalCents / (i + 1) / 100;
                                return (
                                  <option key={i + 1} value={i + 1}>
                                    {i + 1}x {i === 0 ? 'à vista' : `de R$ ${installmentValue.toFixed(2)}`}
                                  </option>
                                );
                              })
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Informações do PIX */}
                  {paymentData.method === 'pix' && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Pagamento via PIX</h3>
                      <p className="text-sm text-gray-600">
                        Após confirmar o pedido, você receberá um QR Code para pagamento instantâneo via PIX.
                      </p>
                    </div>
                  )}
                  
                  {/* Resumo do pedido */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3">Resumo do Pedido</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Plano:</span>
                        <span className="font-medium">{selectedPlan?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantidade de Pets:</span>
                        <span className="font-medium">{petsData.length}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total:</span>
                        <span>R$ {formatPrice(calculateTotal())}</span>
                      </div>
                    </div>
                  </div>

                  {/* Seção do PIX - aparece após processamento */}
                  {pixData && paymentData.method === 'pix' && (
                    <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* QR Code */}
                        <div className="text-center">
                          <h4 className="font-medium mb-3 text-gray-700">Escaneie o QR Code</h4>
                          <div className="bg-white p-4 rounded-lg border shadow-sm inline-block">
                            <img 
                              src={`data:image/png;base64,${pixData.qrCode}`}
                              alt="QR Code PIX" 
                              className="w-48 h-48 mx-auto"
                            />
                          </div>
                        </div>
                        
                        {/* Código Copia e Cola */}
                        <div>
                          <h4 className="font-medium mb-3 text-gray-700">Ou copie o código PIX</h4>
                          <div className="bg-white p-4 rounded-lg border">
                            <div className="text-sm text-gray-600 mb-2">Código PIX:</div>
                            <div className="bg-gray-50 p-3 rounded text-xs font-mono break-all border">
                              {pixData.copyPasteCode}
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(pixData.copyPasteCode);
                                alert('Código PIX copiado!');
                              }}
                              className="mt-3 w-full text-white py-2 px-4 rounded-lg transition-colors"
                              style={{
                                background: 'var(--btn-cotacao-gratuita-bg)',
                                border: 'none'
                              }}
                            >
                              Copiar Código PIX
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Como pagar - largura total */}
                      <div className="mt-6 text-sm text-gray-600">
                        <p className="font-medium mb-1">Como pagar:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Vá na opção PIX</li>
                          <li>Escaneie o QR Code ou cole o código</li>
                          <li>Confirme o pagamento</li>
                        </ol>
                      </div>
                      
                      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2 text-blue-800">
                          <span className="text-lg">ℹ️</span>
                          <div>
                            <p className="font-medium">Pedido #{pixData.orderId}</p>
                            <p className="text-sm">O pagamento PIX é processado instantaneamente. Após a confirmação, você receberá um e-mail com os detalhes do seu plano.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons for Steps 2, 3 and 4 */}
            <div className="flex flex-col md:flex-row md:justify-between gap-3 md:gap-0 mt-8 pt-6 border-t">
              <button
                onClick={handlePrevStep}
                className="flex items-center justify-center w-full md:w-auto px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </button>

              <button
                onClick={handleNextStep}
                disabled={
                  isLoading || 
                  (currentStep === 2 && !isPetsDataValid()) ||
                  (currentStep === 3 && !isCustomerDataValid()) ||
                  (currentStep === 4 && !isPaymentDataValid())
                }
                className="flex items-center justify-center w-full md:w-auto px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--btn-ver-planos-bg)',
                  color: 'var(--btn-ver-planos-text)',
                  border: 'none'
                }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    {currentStep === 4 ? 'Finalizar' : 'Próximo'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}