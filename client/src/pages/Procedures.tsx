import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputMasked } from "@/components/ui/input-masked";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, ClipboardList, Eye, DollarSign, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertProcedureSchema } from "@shared/schema";
import { PROCEDURE_TYPES, PROCEDURE_TYPE_LABELS } from "@/lib/constants";

export default function Procedures() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [selectedPlans, setSelectedPlans] = useState<{
    planId: string, 
    receber: string, 
    pagar: string,
    coparticipacao: string, 
    carencia: string, 
    limitesAnuais: string
  }[]>([]);
  const [planErrors, setPlanErrors] = useState<{[key: number]: string}>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: procedures, isLoading } = useQuery({
    queryKey: ["/api/procedures"],
  });

  const { data: plans } = useQuery({
    queryKey: ["/api/plans/active"],
  });

  // Buscar planos do procedimento quando estiver editando
  const { data: existingProcedurePlans } = useQuery({
    queryKey: ["/api/procedures", editingItem?.id, "plans"],
    enabled: !!editingItem?.id,
  });

  // Buscar planos do procedimento quando estiver visualizando
  const { data: viewingProcedurePlans } = useQuery({
    queryKey: ["/api/procedures", viewingItem?.id, "plans"],
    enabled: !!viewingItem?.id,
  });


  const form = useForm({
    resolver: zodResolver(insertProcedureSchema),
    defaultValues: {
      name: "",
      description: "",
      procedureType: "consultas",
      isActive: true,
    },
  });

  // Carregar planos existentes quando estiver editando (apenas uma vez quando o modal abre)
  useEffect(() => {
    if (existingProcedurePlans && Array.isArray(existingProcedurePlans) && editingItem?.id) {
      const planData = existingProcedurePlans.map((item: any) => ({
        planId: item.planId,
        receber: (item.price / 100).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }), // Converter de centavos para reais com formato PT-BR
        pagar: item.pagar || "0,00",
        coparticipacao: item.coparticipacao || "0,00",
        carencia: item.carencia || "",
        limitesAnuais: item.limitesAnuais || ""
      }));
      setSelectedPlans(planData);
    }
    // Limpar planos quando não estiver editando (criando novo)
    else if (!editingItem?.id) {
      setSelectedPlans([]);
    }
  }, [editingItem?.id]); // Dependência apenas no ID do item sendo editado

  // Funções para gerenciar planos selecionados
  const addPlan = () => {
    if (Array.isArray(plans) && plans.length > 0) {
      const unselectedPlans = plans.filter((plan: any) => 
        !selectedPlans.some(sp => sp.planId === plan.id)
      );
      if (unselectedPlans.length > 0) {
        setSelectedPlans([...selectedPlans, { 
          planId: unselectedPlans[0].id, 
          receber: "0,00",
          pagar: "0,00",
          coparticipacao: "0,00",
          carencia: "",
          limitesAnuais: ""
        }]);
      }
    }
  };

  const removePlan = (index: number) => {
    setSelectedPlans(selectedPlans.filter((_, i) => i !== index));
  };

  // Funções para atualizar campos específicos
  const updatePlanField = (index: number, field: string, value: string) => {
    const updated = [...selectedPlans];
    
    // Tratamento especial para o campo carência (apenas números)
    if (field === 'carencia') {
      // Se o valor estiver vazio, mantém vazio
      if (value === '') {
        (updated[index] as any)[field] = '';
      } else {
        // Remove qualquer texto existente e mantém apenas números
        const numericValue = value.replace(/[^\d]/g, '');
        // Se houver números, adiciona " dias", senão deixa vazio
        (updated[index] as any)[field] = numericValue ? `${numericValue} dias` : '';
      }
    } else {
      (updated[index] as any)[field] = value;
    }
    
    setSelectedPlans(updated);
    
    // Validar campos obrigatórios e limpar erro se válido
    if (field === 'receber' && value && planErrors[index]) {
      const newErrors = { ...planErrors };
      delete newErrors[index];
      setPlanErrors(newErrors);
    }
  };

  // Função para atualizar campos booleanos
  const updatePlanBooleanField = (index: number, field: string, value: boolean) => {
    const updated = [...selectedPlans];
    (updated[index] as any)[field] = value;
    setSelectedPlans(updated);
  };

  // Função para converter preço brasileiro para número
  const convertPriceToNumber = (priceStr: string): number => {
    if (!priceStr || priceStr.trim() === '') return 0;
    
    // Remove formatação brasileira e converte para número
    const cleanPrice = priceStr
      .replace(/\./g, '') // Remove separadores de milhares
      .replace(/,/g, '.'); // Converte vírgula decimal para ponto
    
    const numValue = parseFloat(cleanPrice);
    return isNaN(numValue) ? 0 : numValue;
  };

  // Função para filtrar planos já selecionados
  const getAvailablePlans = (currentIndex?: number) => {
    if (!Array.isArray(plans)) return [];
    
    return plans.filter((plan: any) => {
      // Permite o plano atual quando estiver editando uma linha específica
      const isCurrentSelection = currentIndex !== undefined && 
        selectedPlans[currentIndex] && 
        selectedPlans[currentIndex].planId === plan.id;
      
      // Se é a seleção atual, permite; caso contrário, verifica se não está em uso
      return isCurrentSelection || !selectedPlans.some(sp => sp.planId === plan.id);
    });
  };

  const updatePlanId = (index: number, planId: string) => {
    const updated = [...selectedPlans];
    updated[index].planId = planId;
    setSelectedPlans(updated);
    
    // Limpar erro de plano se selecionado
    const errors = { ...planErrors };
    if (planId) {
      delete errors[index];
      setPlanErrors(errors);
    }
  };

  const resetForm = () => {
    form.reset();
    setSelectedPlans([]);
    setPlanErrors({});
    setEditingItem(null);
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      let procedureResponse;
      
      if (editingItem) {
        procedureResponse = await apiRequest("PUT", `/api/procedures/${editingItem.id}`, data);
      } else {
        procedureResponse = await apiRequest("POST", "/api/procedures", data);
      }

      // Salvar relacionamentos com planos usando endpoint atômico
      const procedureId = editingItem ? editingItem.id : procedureResponse.id;
      
      // Preparar planos para o endpoint atômico
      const procedurePlans = selectedPlans
        .filter(plan => plan.planId && plan.receber) // Filtrar entradas válidas
        .map(plan => {
          const numericReceber = convertPriceToNumber(plan.receber);
          const numericCoparticipacao = convertPriceToNumber(plan.coparticipacao);
          return {
            procedureId,
            planId: plan.planId,
            price: Math.round(numericReceber * 100), // Converter para centavos
            coparticipacao: Math.round(numericCoparticipacao * 100),
            carencia: plan.carencia,
            limitesAnuais: plan.limitesAnuais
          };
        })
        .filter(plan => plan.price >= 0); // Filtrar preços válidos
      
      // Usar endpoint atômico para atualizar relacionamentos
      // Isso substitui DELETE + POST em uma única transação
      await apiRequest("PUT", `/api/procedures/${procedureId}/plans`, { procedurePlans });

      return procedureResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procedures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/procedures", editingItem?.id, "plans"] });
      // Invalidar cache dos planos também para atualizar a página de edição de planos
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plans", "active"] });
      toast({
        title: editingItem ? "Procedimento atualizado" : "Procedimento criado",
        description: editingItem ? "Procedimento foi atualizado com sucesso." : "Procedimento foi criado com sucesso.",
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: editingItem ? "Falha ao atualizar procedimento." : "Falha ao criar procedimento.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/procedures/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procedures"] });
      toast({
        title: "Procedimento removido",
        description: "Procedimento foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover procedimento.",
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PUT", `/api/procedures/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procedures"] });
      toast({
        title: "Status atualizado",
        description: "Status do procedimento foi atualizado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do procedimento.",
        variant: "destructive",
      });
    },
  });

  const filteredItems = Array.isArray(procedures) ? procedures?.filter((item: any) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleEdit = async (item: any) => {
    setEditingItem(item);
    form.reset({
      name: item.name || "",
      description: item.description || "",
      procedureType: item.procedureType || "consultas",
      isActive: item.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const handleView = async (item: any) => {
    setViewingItem(item);
    setViewingItem(item);
    setViewDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este procedimento?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleMutation.mutate({ id, isActive: !currentStatus });
  };


  const onSubmit = (data: any) => {
    // Validar planos antes de submeter
    const errors: {[key: number]: string} = {};
    let hasErrors = false;
    
    selectedPlans.forEach((plan, index) => {
      if (!plan.planId) {
        errors[index] = 'Selecione um plano';
        hasErrors = true;
      }
      if (!plan.receber || plan.receber.trim() === '') {
        errors[index] = 'Valor a receber é obrigatório';
        hasErrors = true;
      } else {
        const numValue = convertPriceToNumber(plan.receber);
        if (numValue < 0) {
          errors[index] = 'Valor a receber deve ser maior ou igual a zero';
          hasErrors = true;
        }
      }
    });
    
    if (hasErrors) {
      setPlanErrors(errors);
      toast({
        title: "Erro de validação",
        description: "Verifique os campos dos planos e tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    createMutation.mutate(data);
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">Procedimentos</h1>
          <p className="text-sm text-muted-foreground">Gerencie os procedimentos médicos disponíveis</p>
        </div>
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 xs:gap-4">
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="btn-primary w-full xs:w-auto" data-testid="button-new-procedure">
                <Plus className="h-4 w-4 mr-2" />
                Novo Procedimento
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingItem ? "Editar Procedimento" : "Novo Procedimento"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Procedimento *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-procedure-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="procedureType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Procedimento *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-procedure-type">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROCEDURE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {PROCEDURE_TYPE_LABELS[type as keyof typeof PROCEDURE_TYPE_LABELS]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Seção de Seleção de Planos */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Planos Vinculados</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPlan}
                      disabled={!Array.isArray(plans) || plans.length === 0 || selectedPlans.length >= plans.length}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Plano
                    </Button>
                  </div>
                  
                  {selectedPlans.length > 0 && (
                    <div className="space-y-3">
                      {selectedPlans.map((selectedPlan, index) => {
                        const currentPlan = Array.isArray(plans) ? plans.find((p: any) => p.id === selectedPlan.planId) : null;
                        const showCoparticipacao = currentPlan?.planType === "with_waiting_period";
                        
                        return (
                          <div key={index} className="p-4 border rounded-lg">
                            {/* Layout organizado em 2 linhas: 3 campos em cima, 3 embaixo */}
                            <div className="space-y-4">
                              {/* Primeira linha: Plano, Receber, Pagar */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Plano */}
                                <div>
                                  <label className="text-sm font-medium">Plano</label>
                                  <Select
                                    value={selectedPlan.planId}
                                    onValueChange={(value) => updatePlanId(index, value)}
                                  >
                                    <SelectTrigger className={planErrors[index] && !selectedPlan.planId ? 'border-red-500' : ''}>
                                      <SelectValue placeholder="Selecione um plano" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getAvailablePlans(index).map((plan: any) => (
                                        <SelectItem key={plan.id} value={plan.id}>
                                          {plan.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {planErrors[index] && !selectedPlan.planId && (
                                    <p className="text-xs text-red-500 mt-1">{planErrors[index]}</p>
                                  )}
                                </div>

                                {/* Receber */}
                                <div>
                                  <label className="text-sm font-medium">Receber (R$)</label>
                                  <InputMasked
                                    mask="price"
                                    value={selectedPlan.receber}
                                    onChange={(e) => updatePlanField(index, 'receber', e.target.value)}
                                    placeholder="0,00"
                                    data-testid={`input-plan-receber-${index}`}
                                    className={planErrors[index] ? 'border-red-500' : ''}
                                  />
                                  {planErrors[index] && (
                                    <p className="text-xs text-red-500 mt-1">{planErrors[index]}</p>
                                  )}
                                </div>

                                {/* Pagar */}
                                <div>
                                  <label className="text-sm font-medium">Pagar (R$)</label>
                                  <InputMasked
                                    mask="price"
                                    value={selectedPlan.pagar}
                                    onChange={(e) => updatePlanField(index, 'pagar', e.target.value)}
                                    placeholder="0,00"
                                    data-testid={`input-plan-pagar-${index}`}
                                  />
                                </div>
                              </div>

                              {/* Segunda linha: Coparticipação (condicional), Carência, Limites Anuais */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Coparticipação (condicional) - se não for com coparticipação, deixa espaço vazio */}
                                {showCoparticipacao ? (
                                  <div>
                                    <label className="text-sm font-medium">Coparticipação (R$)</label>
                                    <InputMasked
                                      mask="price"
                                      value={selectedPlan.coparticipacao}
                                      onChange={(e) => updatePlanField(index, 'coparticipacao', e.target.value)}
                                      placeholder="0,00"
                                      data-testid={`input-plan-coparticipacao-${index}`}
                                    />
                                  </div>
                                ) : (
                                  <div></div>
                                )}

                                {/* Carência */}
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <input
                                      type="checkbox"
                                      id={`enable-carencia-${index}`}
                                      checked={(selectedPlan as any).enableCarencia || false}
                                      onChange={(e) => updatePlanBooleanField(index, 'enableCarencia', e.target.checked)}
                                      className="rounded"
                                    />
                                    <label htmlFor={`enable-carencia-${index}`} className="text-sm font-medium">
                                      Carência
                                    </label>
                                  </div>
                                  <Input
                                    value={selectedPlan.carencia}
                                    onChange={(e) => updatePlanField(index, 'carencia', e.target.value)}
                                    placeholder="Digite apenas números"
                                    disabled={!(selectedPlan as any).enableCarencia}
                                    className={!(selectedPlan as any).enableCarencia ? 'bg-gray-100 text-gray-400' : ''}
                                    data-testid={`input-plan-carencia-${index}`}
                                  />
                                </div>
                                
                                {/* Limites Anuais */}
                                <div>
                                  <label className="text-sm font-medium">Limites Anuais</label>
                                  <Input
                                    value={selectedPlan.limitesAnuais}
                                    onChange={(e) => updatePlanField(index, 'limitesAnuais', e.target.value)}
                                    placeholder="Ex: R$ 5.000,00"
                                    data-testid={`input-plan-limites-${index}`}
                                  />
                                </div>
                              </div>
                              {/* Botão Remover na mesma linha dos campos */}
                              <div className="col-span-full flex justify-end">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => removePlan(index)}
                                  className="btn-primary w-10 h-10 p-0 flex-shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {selectedPlans.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      Nenhum plano vinculado. Clique em "Adicionar Plano" para vincular este procedimento a um plano.
                    </div>
                  )}
                  
                  {Array.isArray(plans) && plans.length > 0 && selectedPlans.length >= plans.length && (
                    <div className="text-center py-2 text-sm text-muted-foreground">
                      Todos os planos disponíveis já foram adicionados.
                    </div>
                  )}
                </div>

              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="default"
                  onClick={() => setDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="btn-primary"
                  disabled={createMutation.isPending}
                  data-testid="button-save"
                >
                  {createMutation.isPending ? "Salvando..." : editingItem ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Visualizar Procedimento</DialogTitle>
          </DialogHeader>
          
          {viewingItem && (
            <div className="space-y-6">
              {/* Nome do Procedimento */}
              <div>
                <label className="text-sm font-medium text-foreground">Nome do Procedimento</label>
                <h3 className="text-lg font-medium mt-1">{viewingItem.name}</h3>
                {viewingItem.description && (
                  <p className="text-sm text-muted-foreground mt-2">{viewingItem.description}</p>
                )}
                <Badge variant={viewingItem.isActive ? "default" : "secondary"} className="mt-2">
                  {viewingItem.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              {/* Tipo de Procedimento */}
              <div>
                <label className="text-sm font-medium text-foreground">Tipo de Procedimento</label>
                <p className="text-base mt-1">
                  {PROCEDURE_TYPE_LABELS[viewingItem.procedureType as keyof typeof PROCEDURE_TYPE_LABELS] || 'Consultas'}
                </p>
              </div>

              {/* Planos Vinculados */}
              <div>
                <label className="text-sm font-medium text-foreground">Planos Vinculados</label>
                <div className="mt-2">
                  {viewingProcedurePlans && Array.isArray(viewingProcedurePlans) && viewingProcedurePlans.length > 0 ? (
                    <div className="space-y-2">
                      {viewingProcedurePlans.map((planItem: any) => {
                        const plan = Array.isArray(plans) ? plans.find((p: any) => p.id === planItem.planId) : null;
                        return (
                          <div key={planItem.planId} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                            <div>
                              <p className="font-medium">{plan?.name || 'Plano não encontrado'}</p>
                              {plan?.description && (
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-lg">
                                R$ {(planItem.price / 100).toFixed(2).replace('.', ',')}
                              </p>
                              <p className="text-xs text-muted-foreground">Preço no plano</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">
                      Nenhum plano vinculado a este procedimento.
                    </p>
                  )}
                </div>
              </div>
              
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{color: 'var(--input-foreground)'}} />
            <Input
              placeholder="Buscar procedimentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-procedures"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {/* Management Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">
              Procedimentos ({filteredItems?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredItems?.length ? (
              <div className="space-y-2">
                {filteredItems.map((item: any) => (
                  <div key={item.id} className="border rounded-lg p-3 hover:bg-muted/10 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
                      <div className="flex-1 min-w-0 flex items-center">
                        {/* Nome do Procedimento */}
                        <div className="w-full">
                          <h3 className="font-semibold text-foreground break-words" data-testid={`procedure-name-${item.id}`}>
                            {item.name}
                          </h3>
                        </div>
                      </div>
                      
                      {/* Botões em linha horizontal */}
                      <div className="flex items-center space-x-1 w-full sm:w-auto">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleView(item)}
                          data-testid={`button-view-${item.id}`}
                          className="text-xs"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          data-testid={`button-edit-${item.id}`}
                          className="text-xs"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${item.id}`}
                          className="text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Nenhum procedimento encontrado para a busca." 
                    : "Nenhum procedimento cadastrado ainda."
                  }
                </p>
                {!searchQuery && (
                  <Button
                    variant="default"
                    onClick={() => setDialogOpen(true)}
                    data-testid="button-add-first-procedure"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Procedimento
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}