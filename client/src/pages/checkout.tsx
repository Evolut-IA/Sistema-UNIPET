import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft, ArrowRight, Plus, Trash2, Heart, User, CreditCard as PaymentIcon } from 'lucide-react';
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
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
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
  const [petsData, setPetsData] = useState<PetData[]>([]);
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
  
  const [billingFrequency, setBillingFrequency] = useState<'monthly' | 'annual'>('monthly');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [collapsedPets, setCollapsedPets] = useState<boolean[]>([false]); // Controla quais pets estão colapsados

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
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
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
          customer: {
            name: customerData.name,
            email: customerData.email,
            cpf: customerData.cpf,
            phone: customerData.phone
          },
          address: {
            address: customerData.address,
            city: customerData.city,
            state: customerData.state,
            zipCode: customerData.zipCode
          },
          pets: petsData.map(pet => ({
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            age: pet.age,
            weight: pet.weight
          })),
          planId: selectedPlan?.id
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
        if (paymentData.method === 'pix' && result.pixData) {
          navigate(`/checkout-success?order=${result.orderId}&method=pix&pixQrCode=${encodeURIComponent(result.pixData.qrCode || '')}&pixCopyPaste=${encodeURIComponent(result.pixData.copyPaste || '')}`);
        } else {
          navigate(`/checkout-success?order=${result.orderId}&method=${paymentData.method}`);
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
            <div className="flex justify-center items-center space-x-8">
              {[
                { number: 1, icon: Heart, label: 'Plano & Pet' },
                { number: 2, icon: User, label: 'Seus Dados' },
                { number: 3, icon: PaymentIcon, label: 'Pagamento' }
              ].map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                        currentStep >= step.number
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-gray-300 text-gray-500 border-gray-300'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`text-sm mt-2 ${
                      currentStep >= step.number ? 'text-white font-medium' : 'text-gray-300'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div
                      className={`w-16 h-1 mx-4 ${
                        currentStep > step.number ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <h2 className="text-2xl font-bold mb-6">
                  Selecione o Plano e dados do Pet
                </h2>
                
                {!selectedPlan ? (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Escolha seu plano:</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {plans.map((plan) => (
                          <div
                            key={plan.id}
                            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-teal-300 transition-colors"
                            onClick={() => handlePlanSelect(plan)}
                          >
                            <h4 className="font-bold text-lg mb-2">{plan.name}</h4>
                            <p className="text-teal-600 font-bold text-xl mb-2">
                              {formatPrice(plan.price)}/mês
                            </p>
                            <p className="text-gray-600 text-sm">{plan.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => navigate('/plans')}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Voltar ao início
                      </button>
                      <button
                        disabled
                        className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                      >
                        Próximo
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Plano Selecionado */}
                    <div className="bg-gray-200 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-lg">{selectedPlan.name}</h4>
                        <p className="text-teal-600 font-bold">
                          {formatPrice(selectedPlan.price)}/mês
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedPlan(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Trocar Plano
                      </button>
                    </div>

                    {/* Dados dos Pets */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Dados dos Pets</h3>
                      
                      {/* Pets Existentes */}
                      {petsData.map((pet, index) => (
                        <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{pet.name}</h4>
                              <p className="text-gray-600 text-sm">
                                {pet.species} • {pet.name} • {pet.age} anos
                              </p>
                              <p className="text-gray-600 text-sm">Plano: {selectedPlan.name}</p>
                            </div>
                            <button 
                              onClick={() => togglePetCollapse(index)}
                              className="text-teal-600 hover:text-teal-800 text-sm"
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Adicionar Novo Pet */}
                      {petsData.length === 0 ? (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold mb-4">Primeiro Pet</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Nome do Pet *</label>
                              <input
                                type="text"
                                value=""
                                onChange={(e) => {
                                  // Criar o primeiro pet se não existir
                                  if (petsData.length === 0) {
                                    setPetsData([{
                                      name: e.target.value,
                                      species: '',
                                      breed: '',
                                      age: 0,
                                      weight: 0
                                    }]);
                                  } else {
                                    updatePet(0, 'name', e.target.value);
                                  }
                                }}
                                placeholder="Digite o nome do seu pet"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Espécie *</label>
                              <Select onValueChange={(value) => {
                                // Criar o primeiro pet se não existir
                                if (petsData.length === 0) {
                                  setPetsData([{
                                    name: '',
                                    species: value,
                                    breed: '',
                                    age: 0,
                                    weight: 0
                                  }]);
                                } else {
                                  updatePet(0, 'species', value);
                                }
                              }}>
                                <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg">
                                  <SelectValue placeholder="Selecione a espécie" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="dog">Cachorro</SelectItem>
                                  <SelectItem value="cat">Gato</SelectItem>
                                  <SelectItem value="bird">Aves</SelectItem>
                                  <SelectItem value="turtle">Tartarugas ou jabutis</SelectItem>
                                  <SelectItem value="rabbit">Coelhos ou hamsters</SelectItem>
                                  <SelectItem value="guinea_pig">Porquinho da índia</SelectItem>
                                  <SelectItem value="other">Outros</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Raça *</label>
                              <input
                                type="text"
                                value=""
                                onChange={(e) => {
                                  // Criar o primeiro pet se não existir
                                  if (petsData.length === 0) {
                                    setPetsData([{
                                      name: '',
                                      species: '',
                                      breed: e.target.value,
                                      age: 0,
                                      weight: 0
                                    }]);
                                  } else {
                                    updatePet(0, 'breed', e.target.value);
                                  }
                                }}
                                placeholder="Digite a raça do seu pet"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Idade (anos) *</label>
                              <input
                                type="number"
                                value=""
                                onChange={(e) => {
                                  // Criar o primeiro pet se não existir
                                  if (petsData.length === 0) {
                                    setPetsData([{
                                      name: '',
                                      species: '',
                                      breed: '',
                                      age: parseInt(e.target.value) || 0,
                                      weight: 0
                                    }]);
                                  } else {
                                    updatePet(0, 'age', parseInt(e.target.value) || 0);
                                  }
                                }}
                                placeholder="1"
                                min="0"
                                max="25"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-3 mt-4">
                            <button 
                              onClick={() => {
                                // Limpa os dados do primeiro pet
                                setPetsData([]);
                              }}
                              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                              Cancelar
                            </button>
                            <button 
                              onClick={() => {
                                // Valida se os campos obrigatórios estão preenchidos
                                const currentPet = petsData[0];
                                if (currentPet?.name && currentPet?.species && currentPet?.age > 0) {
                                  // Pet válido, formulário será escondido automaticamente
                                }
                              }}
                              disabled={!petsData[0]?.name || !petsData[0]?.species || !petsData[0]?.age}
                              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                              Salvar Pet
                            </button>
                          </div>
                        </div>
                      ) : petsData.some(pet => !pet.name) ? (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold mb-4">
                            {petsData.length === 0 ? 'Primeiro Pet' : 'Dados do Pet'}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Nome do Pet *</label>
                              <input
                                type="text"
                                value={petsData[petsData.length - 1]?.name || ''}
                                onChange={(e) => updatePet(petsData.length - 1, 'name', e.target.value)}
                                placeholder="Digite o nome do seu pet"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Espécie *</label>
                              <Select onValueChange={(value) => updatePet(petsData.length - 1, 'species', value)}>
                                <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg">
                                  <SelectValue placeholder={petsData[petsData.length - 1]?.species || "Selecione a espécie"} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="dog">Cachorro</SelectItem>
                                  <SelectItem value="cat">Gato</SelectItem>
                                  <SelectItem value="bird">Aves</SelectItem>
                                  <SelectItem value="turtle">Tartarugas ou jabutis</SelectItem>
                                  <SelectItem value="rabbit">Coelhos ou hamsters</SelectItem>
                                  <SelectItem value="guinea_pig">Porquinho da índia</SelectItem>
                                  <SelectItem value="other">Outros</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Raça *</label>
                              <input
                                type="text"
                                value={petsData[petsData.length - 1]?.breed || ''}
                                onChange={(e) => updatePet(petsData.length - 1, 'breed', e.target.value)}
                                placeholder="Digite a raça do seu pet"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Idade (anos) *</label>
                              <input
                                type="number"
                                value={petsData[petsData.length - 1]?.age || ''}
                                onChange={(e) => updatePet(petsData.length - 1, 'age', parseInt(e.target.value) || 0)}
                                placeholder="1"
                                min="0"
                                max="25"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-3 mt-4">
                            <button 
                              onClick={() => {
                                // Se é o primeiro pet, limpa os dados
                                if (petsData.length === 1) {
                                  updatePet(0, 'name', '');
                                  updatePet(0, 'species', '');
                                  updatePet(0, 'breed', '');
                                  updatePet(0, 'age', 0);
                                } else {
                                  // Remove o último pet adicionado
                                  removePet(petsData.length - 1);
                                }
                              }}
                              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                              Cancelar
                            </button>
                            <button 
                              onClick={() => {
                                // Valida se os campos obrigatórios estão preenchidos
                                const currentPet = petsData[petsData.length - 1];
                                if (currentPet?.name && currentPet?.species && currentPet?.age > 0) {
                                  // Pet válido, apenas fecha o formulário inline
                                  // Não precisa fazer nada pois já está salvo no estado
                                }
                              }}
                              disabled={!petsData[petsData.length - 1]?.name || !petsData[petsData.length - 1]?.species || !petsData[petsData.length - 1]?.age}
                              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                              Salvar Pet
                            </button>
                          </div>
                        </div>
                      ) : petsData.length < 5 ? (
                        <button
                          onClick={addPet}
                          disabled={!canAddNewPet()}
                          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-500 hover:border-teal-300 hover:text-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          + Adicionar outro pet
                        </button>
                      ) : null}
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => navigate('/plans')}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Voltar ao início
                      </button>
                      <button
                        onClick={handleNextStep}
                        disabled={petsData.length === 0}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                      >
                        Próximo
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}

          {/* Seções dos Steps 2 e 3 agora em um bloco else limpo */}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">
                  Seus Dados
                </h2>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        value={customerData.name}
                        onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder=""
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={customerData.email}
                        onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="exemplo@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Celular *
                    </label>
                    <input
                      type="text"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="marketing-consent"
                      className="mt-1"
                    />
                    <label htmlFor="marketing-consent" className="text-sm text-gray-600">
                      Eu declaro meu pleno consentimento para recebimento de promoções da Unipet e de seus parceiros comerciais, nos termos da nossa{' '}
                      <a href="#" className="text-teal-600 hover:underline">
                        Política de Privacidade
                      </a>
                      .
                    </label>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6">
                  <button
                    onClick={handlePrevStep}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={!customerData.name || !customerData.email || !customerData.phone}
                    className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">
                  Pagamento
                </h2>
                
                {/* Layout de 3 colunas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Coluna 1: Cadastre seu endereço */}
                  <div className="bg-gray-100 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Cadastre seu endereço</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">CPF *</label>
                        <input
                          type="text"
                          value={customerData.cpf}
                          onChange={(e) => setCustomerData({...customerData, cpf: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          placeholder="000.000.000-00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CEP *</label>
                        <input
                          type="text"
                          value={customerData.zipCode}
                          onChange={(e) => setCustomerData({...customerData, zipCode: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          placeholder="00000-000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Endereço *</label>
                        <input
                          type="text"
                          value={customerData.address}
                          onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          placeholder="Rua e número"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Número</label>
                          <input
                            type="text"
                            value={customerData.addressNumber || ''}
                            onChange={(e) => setCustomerData({...customerData, addressNumber: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="123"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Complemento</label>
                          <input
                            type="text"
                            value={customerData.complement || ''}
                            onChange={(e) => setCustomerData({...customerData, complement: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="Apartamento"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Bairro *</label>
                        <input
                          type="text"
                          value={customerData.neighborhood || ''}
                          onChange={(e) => setCustomerData({...customerData, neighborhood: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          placeholder="Bairro"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Estado *</label>
                          <input
                            type="text"
                            value={customerData.state}
                            onChange={(e) => setCustomerData({...customerData, state: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="SP"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Cidade *</label>
                          <input
                            type="text"
                            value={customerData.city}
                            onChange={(e) => setCustomerData({...customerData, city: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="Cidade"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coluna 2: Modalidade e Formas de pagamento */}
                  <div className="space-y-6">
                    {/* Modalidade de contratação */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Modalidade de contratação</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setBillingFrequency('annual')}
                          className={`px-4 py-2 rounded-lg ${
                            billingFrequency === 'annual' 
                              ? 'bg-gray-300 text-gray-600' 
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          Anual
                        </button>
                        <button
                          onClick={() => setBillingFrequency('monthly')}
                          className={`px-4 py-2 rounded-lg ${
                            billingFrequency === 'monthly' 
                              ? 'bg-teal-600 text-white' 
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          Mensal
                        </button>
                      </div>
                    </div>

                    {/* Formas de pagamento */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Formas de pagamento</h3>
                      <div className="space-y-2">
                        <div 
                          className={`p-4 border-2 rounded-lg cursor-pointer ${
                            paymentData.method === 'credit_card' 
                              ? 'border-teal-600 bg-teal-50' 
                              : 'border-gray-200 hover:border-teal-300'
                          }`}
                          onClick={() => setPaymentData({...paymentData, method: 'credit_card'})}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              checked={paymentData.method === 'credit_card'}
                              onChange={() => {}}
                              className="text-teal-600"
                            />
                            <PaymentIcon className="w-5 h-5" />
                            <span>Cartão de Crédito</span>
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
                            CVV *
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
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="Número de 3 ou 4 dígitos"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  </div>

                  {/* Coluna 3: Resumo do pedido */}
                  <div className="space-y-4">
                    <div className="bg-teal-600 text-white rounded-lg p-6 text-center">
                      <div className="text-lg font-bold">Unipet Plan</div>
                      <div className="text-2xl font-bold mt-2">
                        Total 1ª mensalidade
                      </div>
                      <div className="text-3xl font-bold">
                        {formatPrice(calculateTotal())}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-3">{selectedPlan?.name} | {billingFrequency === 'monthly' ? 'Mensal' : 'Anual'}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Modalidade:</span>
                          <span>{billingFrequency === 'monthly' ? 'Mensal' : 'Anual'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Forma de pagamento:</span>
                          <span>{paymentData.method === 'credit_card' ? 'Cartão de Crédito' : 'PIX'}</span>
                        </div>
                      </div>
                      
                      <Select onValueChange={(value) => {
                        if (paymentData.creditCard) {
                          setPaymentData({
                            ...paymentData,
                            creditCard: {
                              ...paymentData.creditCard,
                              installments: parseInt(value)
                            }
                          });
                        }
                      }}>
                        <SelectTrigger className="w-full mt-4 p-2 border border-gray-300 rounded text-sm">
                          <SelectValue placeholder={`${paymentData.creditCard?.installments || 1}x de ${formatPrice(calculateTotal() / (paymentData.creditCard?.installments || 1))}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {(() => {
                            const isBasicOrInfinity = selectedPlan && ['BASIC', 'INFINITY'].some(type => selectedPlan.name.toUpperCase().includes(type));
                            const maxInstallments = isBasicOrInfinity ? 1 : 12;
                            const options = [];
                            
                            for (let i = 1; i <= maxInstallments; i++) {
                              const installmentValue = calculateTotal() / i;
                              options.push(
                                <SelectItem key={i} value={i.toString()}>
                                  {i}x de {formatPrice(installmentValue)} {i === 1 ? 'à vista' : ''}
                                </SelectItem>
                              );
                            }
                            
                            return options;
                          })()}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        Li e aceito os <a href="#" className="text-teal-600 hover:underline">Termos de Uso</a>
                      </label>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={!acceptedTerms || isLoading}
                      className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Processando...' : 'Concluir'}
                    </button>
                  </div>
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
      </div>
    </div>
  );
}