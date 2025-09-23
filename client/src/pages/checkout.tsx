import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { motion } from 'framer-motion';
import { CheckCircle, CreditCard, User, ArrowLeft } from 'lucide-react';

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

export default function Checkout() {
  const [location, navigate] = useLocation();
  const [, params] = useRoute('/checkout/:planId?');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [petData, setPetData] = useState<PetData>({
    name: '',
    species: '',
    breed: '',
    age: 0,
    weight: 0
  });
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
  
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);

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
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan?.id,
          petData,
          customerData,
          paymentMethod: 'credit_card'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        navigate(`/checkout-success?order=${result.orderId}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Checkout - UNIPET PLAN
            </h1>
            <div className="flex justify-center items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        currentStep > step ? 'bg-teal-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-center mb-6">
                  Escolha seu Plano
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                        selectedPlan?.id === plan.id
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-gray-200 hover:border-teal-300'
                      }`}
                      onClick={() => handlePlanSelect(plan)}
                    >
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-2xl font-bold text-teal-600 mb-4">
                        {formatPrice(plan.price)}
                      </p>
                      <p className="text-gray-600 mb-4">{plan.description}</p>
                      <ul className="space-y-2">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-teal-600 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-center mb-6">
                  Dados do Pet
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nome do Pet
                    </label>
                    <input
                      type="text"
                      value={petData.name}
                      onChange={(e) => setPetData({...petData, name: e.target.value})}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="Nome do seu pet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Espécie
                    </label>
                    <select
                      value={petData.species}
                      onChange={(e) => setPetData({...petData, species: e.target.value})}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Selecione a espécie</option>
                      <option value="Cão">Cão</option>
                      <option value="Gato">Gato</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Raça
                    </label>
                    <input
                      type="text"
                      value={petData.breed}
                      onChange={(e) => setPetData({...petData, breed: e.target.value})}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="Raça do pet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Idade (anos)
                    </label>
                    <input
                      type="number"
                      value={petData.age}
                      onChange={(e) => setPetData({...petData, age: parseInt(e.target.value) || 0})}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="Idade"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      value={petData.weight}
                      onChange={(e) => setPetData({...petData, weight: parseInt(e.target.value) || 0})}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="Peso"
                    />
                  </div>
                </div>
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

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={handlePrevStep}
                className="flex items-center px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </button>

              <button
                onClick={handleNextStep}
                disabled={isLoading}
                className="flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    {currentStep === 3 ? 'Finalizar' : 'Próximo'}
                    <CreditCard className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}