import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, DollarSign, Search, Check, X, FileText } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface Procedure {
  id: string;
  name: string;
  description: string;
  procedureType: string;
  coparticipationValue?: string;
  coveragePercentage?: number;
  isActive: boolean;
  createdAt: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface Client {
  id: string;
  full_name: string;
  email: string;
}

export default function CustomerCoparticipation() {
  const [, navigate] = useLocation();
  const [, setClient] = useState<Client | null>(null);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPlan, setSelectedPlan] = useState<string>("all");
  const [coparticipationFilter, setCoparticipationFilter] = useState<string>("all");

  useEffect(() => {
    const checkAuthAndLoadProcedures = async () => {
      try {
        // Check authentication
        const authResponse = await fetch('/api/clients/me', {
          credentials: 'include'
        });

        if (!authResponse.ok) {
          navigate('/customer/login');
          return;
        }

        const authResult = await authResponse.json();
        setClient(authResult.client);

        // Load plans for filter dropdown
        const plansResponse = await fetch('/api/clients/plans', {
          credentials: 'include'
        });

        if (plansResponse.ok) {
          const plansResult = await plansResponse.json();
          setPlans(plansResult.plans || []);
        }

        // Load procedures
        const proceduresResponse = await fetch('/api/clients/procedures', {
          credentials: 'include'
        });

        if (proceduresResponse.ok) {
          const proceduresResult = await proceduresResponse.json();
          setProcedures(proceduresResult.procedures || []);
        } else {
          setError('Erro ao carregar procedimentos');
        }

      } catch (error) {
        console.error('Error loading procedures:', error);
        setError('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadProcedures();
  }, [navigate]);

  const formatCurrency = (value?: string): string => {
    if (!value || value === '0' || value === '0.00') return 'Sem coparticipação';
    try {
      const numValue = parseFloat(value);
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(numValue);
    } catch {
      return 'Valor inválido';
    }
  };

  const formatPercentage = (value?: number): string => {
    if (!value || value === 0) return 'N/A';
    return `${value}%`;
  };

  const getUniqueCategories = (): string[] => {
    const categories = procedures.map(proc => proc.procedureType).filter(Boolean);
    return [...new Set(categories)].sort();
  };

  const loadProceduresForPlan = async (planId?: string) => {
    try {
      const url = planId && planId !== 'all' 
        ? `/api/clients/procedures?planId=${planId}`
        : '/api/clients/procedures';
      
      const response = await fetch(url, {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        setProcedures(result.procedures || []);
      }
    } catch (error) {
      console.error('Error loading procedures for plan:', error);
    }
  };

  const filterProcedures = (): Procedure[] => {
    return procedures.filter(procedure => {
      const matchesSearch = procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           procedure.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || procedure.procedureType === selectedCategory;
      
      const matchesCoparticipation = coparticipationFilter === "all" || 
                                   (coparticipationFilter === "with" && procedure.coparticipationValue && 
                                    procedure.coparticipationValue !== '0' && 
                                    procedure.coparticipationValue !== '0.00') ||
                                   (coparticipationFilter === "without" && (!procedure.coparticipationValue || 
                                    procedure.coparticipationValue === '0' || 
                                    procedure.coparticipationValue === '0.00'));
      
      return matchesSearch && matchesCategory && matchesCoparticipation;
    });
  };

  // Handle plan filter change
  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId);
    loadProceduresForPlan(planId);
  };

  const hasCoparticipation = (procedure: Procedure): boolean => {
    return Boolean(procedure.coparticipationValue && 
           procedure.coparticipationValue !== '0' && 
           procedure.coparticipationValue !== '0.00');
  };

  const getProcedureIcon = (procedureType: string) => {
    switch (procedureType?.toLowerCase()) {
      case 'consulta':
      case 'consultoria':
        return <span>🩺</span>;
      case 'cirurgia':
      case 'cirúrgico':
        return <span>⚕️</span>;
      case 'exame':
      case 'diagnóstico':
        return <span>🔬</span>;
      case 'vacina':
      case 'vacinação':
        return <span>💉</span>;
      case 'emergência':
      case 'urgência':
        return <span>🚨</span>;
      default:
        return <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M718-313 604-426l57-56 57 56 141-141 57 56-198 198ZM440-501Zm0 381L313-234q-72-65-123.5-116t-85-96q-33.5-45-49-87T40-621q0-94 63-156.5T260-840q52 0 99 22t81 62q34-40 81-62t99-22q81 0 136 45.5T831-680h-85q-18-40-53-60t-73-20q-51 0-88 27.5T463-660h-46q-31-45-70.5-72.5T260-760q-57 0-98.5 39.5T120-621q0 33 14 67t50 78.5q36 44.5 98 104T440-228q26-23 61-53t56-50l9 9 19.5 19.5L605-283l9 9q-22 20-56 49.5T498-172l-58 52Z"/></svg>;
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
            <p style={{ color: 'var(--text-dark-secondary)' }}>Carregando procedimentos...</p>
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

  const filteredProcedures = filterProcedures();

  return (
    <>
      <Header />
      <div className="min-h-screen pt-16" style={{ background: 'var(--bg-cream-light)' }}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          
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
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words" style={{ color: 'var(--text-dark-primary)' }}>
                Procedimentos
              </h1>
              <p className="mb-4" style={{ color: 'var(--text-dark-secondary)' }}>
                Consulte os procedimentos disponíveis e seus valores de coparticipação. {procedures.length > 0 ? `${procedures.length} ${procedures.length === 1 ? 'procedimento encontrado' : 'procedimentos encontrados'}` : 'Nenhum procedimento disponível'}
              </p>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6"
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-dark-primary)' }}>
              Filtros
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark-primary)' }}>
                  Buscar procedimento
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                    style={{ color: 'var(--text-dark-secondary)' }} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Digite o nome do procedimento..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    style={{ borderColor: 'var(--border-gray)' }}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark-primary)' }}>
                  Categoria
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  style={{ borderColor: 'var(--border-gray)' }}
                >
                  <option value="all">Todas as categorias</option>
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Plan Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark-primary)' }}>
                  Filtrar por Plano
                </label>
                <select
                  value={selectedPlan}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  style={{ borderColor: 'var(--border-gray)' }}
                >
                  <option value="all">Todos os planos</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                  ))}
                </select>
              </div>

              {/* Coparticipation Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark-primary)' }}>
                  Coparticipação
                </label>
                <select
                  value={coparticipationFilter}
                  onChange={(e) => setCoparticipationFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  style={{ borderColor: 'var(--border-gray)' }}
                >
                  <option value="all">Todos os procedimentos</option>
                  <option value="with">Com coparticipação</option>
                  <option value="without">Sem coparticipação</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Procedures List */}
          {filteredProcedures.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-8 text-center"
            >
              <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-teal)' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-dark-primary)' }}>
                Nenhum procedimento encontrado
              </h3>
              <p className="mb-6" style={{ color: 'var(--text-dark-secondary)' }}>
                Não há procedimentos que correspondam aos filtros selecionados.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedPlan("all");
                  setCoparticipationFilter("all");
                  loadProceduresForPlan();
                }}
                className="px-6 py-3 rounded-lg font-medium"
                style={{ background: 'var(--btn-ver-planos-bg)', color: 'var(--btn-ver-planos-text)' }}
              >
                Limpar Filtros
              </button>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {filteredProcedures.map((procedure, index) => (
                <motion.div
                  key={procedure.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
                >
                  {/* Procedure Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                        style={{ background: 'var(--bg-cream-light)' }}>
                        {getProcedureIcon(procedure.procedureType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-bold break-words" style={{ color: 'var(--text-dark-primary)' }}>
                          {procedure.name}
                        </h3>
                        <p className="text-xs sm:text-sm break-words" style={{ color: 'var(--text-teal)' }}>
                          {procedure.procedureType}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right flex-shrink-0 hidden sm:block">
                      <div className="flex items-center space-x-2 mb-1">
                        {hasCoparticipation(procedure) ? (
                          <Check className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'var(--text-teal)' }} />
                        ) : (
                          <X className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'var(--text-dark-secondary)' }} />
                        )}
                        <span className="text-xs sm:text-sm font-medium break-words" style={{ 
                          color: hasCoparticipation(procedure) ? 'var(--text-teal)' : 'var(--text-dark-secondary)' 
                        }}>
                          {hasCoparticipation(procedure) ? 'Com coparticipação' : 'Sem coparticipação'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Procedure Info Grid - Mobile: Coparticipação first, then Description, then Coverage */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    
                    {/* Mobile: Coparticipação Status - Show first on mobile */}
                    <div className="block md:hidden space-y-3 order-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {hasCoparticipation(procedure) ? (
                          <Check className="w-4 h-4" style={{ color: 'var(--text-teal)' }} />
                        ) : (
                          <X className="w-4 h-4" style={{ color: 'var(--text-dark-secondary)' }} />
                        )}
                        <h4 className="font-semibold text-sm" style={{ 
                          color: hasCoparticipation(procedure) ? 'var(--text-teal)' : 'var(--text-dark-secondary)' 
                        }}>
                          {hasCoparticipation(procedure) ? 'Com coparticipação' : 'Sem coparticipação'}
                        </h4>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div className="space-y-3 order-2 md:order-none">
                      <h4 className="font-semibold flex items-center space-x-2 text-sm sm:text-base" style={{ color: 'var(--text-dark-primary)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="var(--text-teal)" className="sm:w-4 sm:h-4"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                        <span>Descrição</span>
                      </h4>
                      <div className="text-xs sm:text-sm" style={{ color: 'var(--text-dark-secondary)' }}>
                        <p className="break-words">{procedure.description || 'Nenhuma descrição disponível'}</p>
                      </div>
                    </div>

                    {/* Coparticipation Value */}
                    <div className="space-y-3 order-3 md:order-none">
                      <h4 className="font-semibold flex items-center space-x-2 text-sm sm:text-base break-words" style={{ color: 'var(--text-dark-primary)' }}>
                        <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: 'var(--text-teal)' }} />
                        <span>Valor da Coparticipação</span>
                      </h4>
                      <div className="text-xs sm:text-sm" style={{ color: 'var(--text-dark-secondary)' }}>
                        <div className="p-3 rounded-lg" style={{ background: 'var(--bg-cream-light)' }}>
                          <p className="font-medium text-base sm:text-lg break-words" style={{ 
                            color: hasCoparticipation(procedure) ? 'var(--text-teal)' : 'var(--text-dark-secondary)' 
                          }}>
                            {formatCurrency(procedure.coparticipationValue)}
                          </p>
                          {hasCoparticipation(procedure) && (
                            <p className="text-xs mt-1 break-words" style={{ color: 'var(--text-dark-secondary)' }}>
                              Valor que você paga além do plano
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Coverage Percentage */}
                    <div className="space-y-3 order-4 md:order-none">
                      <h4 className="font-semibold flex items-center space-x-2 text-sm sm:text-base break-words" style={{ color: 'var(--text-dark-primary)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="var(--text-teal)" className="sm:w-4 sm:h-4 flex-shrink-0"><path d="M300-520q-58 0-99-41t-41-99q0-58 41-99t99-41q58 0 99 41t41 99q0 58-41 99t-99 41Zm0-80q25 0 42.5-17.5T360-660q0-25-17.5-42.5T300-720q-25 0-42.5 17.5T240-660q0 25 17.5 42.5T300-600Zm360 440q-58 0-99-41t-41-99q0-58 41-99t99-41q58 0 99 41t41 99q0 58-41 99t-99 41Zm0-80q25 0 42.5-17.5T720-300q0-25-17.5-42.5T660-360q-25 0-42.5 17.5T600-300q0 25 17.5 42.5T660-240Zm-444 80-56-56 584-584 56 56-584 584Z"/></svg>
                        <span>Cobertura do Plano</span>
                      </h4>
                      <div className="text-xs sm:text-sm" style={{ color: 'var(--text-dark-secondary)' }}>
                        <div className="p-3 rounded-lg" style={{ background: 'var(--bg-cream-light)' }}>
                          <p className="font-medium text-base sm:text-lg break-words" style={{ color: 'var(--text-teal)' }}>
                            {formatPercentage(procedure.coveragePercentage)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Summary */}
          {procedures.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 sm:mt-8 bg-white rounded-xl shadow-lg p-4 sm:p-6"
            >
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: 'var(--text-dark-primary)' }}>
                Resumo
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center p-3 sm:p-4 rounded-lg" style={{ background: 'var(--bg-cream-light)' }}>
                  <p className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--text-teal)' }}>
                    {procedures.length}
                  </p>
                  <p className="text-xs sm:text-sm break-words" style={{ color: 'var(--text-dark-secondary)' }}>
                    Total de Procedimentos
                  </p>
                </div>
                <div className="text-center p-3 sm:p-4 rounded-lg" style={{ background: 'var(--bg-cream-light)' }}>
                  <p className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--text-teal)' }}>
                    {procedures.filter(p => hasCoparticipation(p)).length}
                  </p>
                  <p className="text-xs sm:text-sm break-words" style={{ color: 'var(--text-dark-secondary)' }}>
                    Com Coparticipação
                  </p>
                </div>
                <div className="text-center p-3 sm:p-4 rounded-lg" style={{ background: 'var(--bg-cream-light)' }}>
                  <p className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--text-teal)' }}>
                    {procedures.filter(p => !hasCoparticipation(p)).length}
                  </p>
                  <p className="text-xs sm:text-sm break-words" style={{ color: 'var(--text-dark-secondary)' }}>
                    Sem Coparticipação
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}