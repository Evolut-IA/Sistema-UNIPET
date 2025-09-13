import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputMasked } from "@/components/ui/input-masked";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPlanSchema, insertPlanProcedureSchema } from "@shared/schema";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { PLAN_TYPES } from "@/lib/constants";

export default function PlanForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEdit = Boolean(params.id);
  const [benefitProcedures, setBenefitProcedures] = useState<Record<string, any[]>>({});

  const { data: plan, isLoading } = useQuery({
    queryKey: ["/api/plans", params.id],
    enabled: isEdit,
  });

  const form = useForm({
    resolver: zodResolver(insertPlanSchema),
    defaultValues: {
      name: "",
      price: "",
      planType: "with_waiting_period",
      features: [],
      description: "",
      image: "",
      buttonText: "Contratar Plano",
      displayOrder: 0,
      isActive: true,
    },
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control: form.control,
    name: "features",
  });

  // Funções para gerenciar procedimentos por benefício
  const addProcedureToBenefit = (benefitName: string) => {
    setBenefitProcedures(prev => ({
      ...prev,
      [benefitName]: [
        ...(prev[benefitName] || []),
        { procedureName: "", description: "", price: 0, isIncluded: true }
      ]
    }));
  };

  const removeProcedureFromBenefit = (benefitName: string, index: number) => {
    setBenefitProcedures(prev => ({
      ...prev,
      [benefitName]: prev[benefitName]?.filter((_, i) => i !== index) || []
    }));
  };

  const updateProcedureInBenefit = (benefitName: string, index: number, field: string, value: any) => {
    setBenefitProcedures(prev => ({
      ...prev,
      [benefitName]: prev[benefitName]?.map((proc, i) => 
        i === index ? { ...proc, [field]: value } : proc
      ) || []
    }));
  };

  const getPlanTypeLabel = (type: string) => {
    switch (type) {
      case "com_coparticipacao": return "Com Coparticipação";
      case "sem_coparticipacao": return "Sem Coparticipação";
      default: return type;
    }
  };


  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name || "",
        price: plan.price || "",
        planType: plan.planType || "with_waiting_period",
        features: plan.features || [],
        description: plan.description || "",
        image: plan.image || "",
        buttonText: plan.buttonText || "Contratar Plano",
        displayOrder: plan.displayOrder || 0,
        isActive: plan.isActive ?? true,
      });
    }
  }, [plan, form]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEdit) {
        await apiRequest("PUT", `/api/plans/${params.id}`, data);
      } else {
        await apiRequest("POST", "/api/plans", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: isEdit ? "Plano atualizado" : "Plano criado",
        description: isEdit ? "Plano foi atualizado com sucesso." : "Plano foi criado com sucesso.",
      });
      setLocation("/planos");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: isEdit ? "Falha ao atualizar plano." : "Falha ao criar plano.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: any) => {
    try {
      // Primeiro, salva o plano
      const planData = {
        ...data,
        price: parseFloat(data.price).toString(),
      };

      let planId;
      if (isEdit) {
        await apiRequest("PUT", `/api/plans/${params.id}`, planData);
        planId = params.id;
      } else {
        const response = await apiRequest("POST", "/api/plans", planData);
        planId = response.id;
      }

      // Depois, salva os procedimentos para cada benefício
      for (const [benefitName, procedures] of Object.entries(benefitProcedures)) {
        for (const procedure of procedures as any[]) {
          if (procedure.procedureName.trim()) {
            await apiRequest("POST", "/api/plan-procedures", {
              planId,
              benefitName,
              procedureName: procedure.procedureName,
              description: procedure.description || "",
              price: Math.round((procedure.price || 0) * 100), // converte para centavos
              isIncluded: procedure.isIncluded,
              displayOrder: 0
            });
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: isEdit ? "Plano atualizado" : "Plano criado",
        description: isEdit ? "Plano foi atualizado com sucesso." : "Plano foi criado com sucesso.",
      });
      setLocation("/planos");
    } catch (error) {
      toast({
        title: "Erro",
        description: isEdit ? "Falha ao atualizar plano." : "Falha ao criar plano.",
        variant: "destructive",
      });
    }
  };


  if (isEdit && isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => setLocation("/planos")}
          data-testid="button-back-to-plans"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEdit ? "Editar Plano" : "Novo Plano"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? "Atualize as informações do plano" : "Crie um novo plano de saúde"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Plano *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-plan-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Mensal (R$) *</FormLabel>
                      <FormControl>
                        <InputMasked 
                          {...field} 
                          mask="price"
                          placeholder="0,00"
                          data-testid="input-price" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="planType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo do Plano *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-plan-type">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PLAN_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {getPlanTypeLabel(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Plano Ativo</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Planos ativos podem ser contratados por clientes
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-plan-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">Benefícios do Plano</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendFeature("")}
                data-testid="button-add-feature"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {featureFields.map((field, index) => (
                  <div key={field.id} className="flex space-x-2">
                    <FormField
                      control={form.control}
                      name={`features.${index}` as const}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Descreva o benefício"
                              data-testid={`input-feature-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      data-testid={`button-remove-feature-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {featureFields.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum benefício adicionado ainda.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Procedimentos por Benefício */}
          {featureFields.map((field, index) => {
            const benefitName = form.getValues(`features.${index}`) || "";
            const procedures = benefitProcedures[benefitName] || [];
            
            return (
              <Card key={field.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-foreground">
                    {benefitName || `Benefício ${index + 1}`}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addProcedureToBenefit(benefitName)}
                    data-testid={`button-add-procedure-${index}`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Procedimento
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {procedures.map((procedure, procIndex) => (
                      <div key={procIndex} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 border rounded-lg">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Nome do Procedimento
                          </label>
                          <Input
                            value={procedure.procedureName}
                            onChange={(e) => updateProcedureInBenefit(benefitName, procIndex, "procedureName", e.target.value)}
                            placeholder="Ex: Consulta Clínica"
                            data-testid={`input-procedure-name-${index}-${procIndex}`}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Preço (R$)
                          </label>
                          <InputMasked
                            mask="price"
                            value={procedure.price}
                            onChange={(e) => updateProcedureInBenefit(benefitName, procIndex, "price", parseFloat(e.target.value.replace(",", ".")) || 0)}
                            placeholder="0,00"
                            data-testid={`input-procedure-price-${index}-${procIndex}`}
                          />
                        </div>

                        <div className="flex items-end space-x-2" style={{ marginTop: '1.5rem' }}>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={procedure.isIncluded}
                              onCheckedChange={(checked) => updateProcedureInBenefit(benefitName, procIndex, "isIncluded", checked)}
                              data-testid={`switch-procedure-included-${index}-${procIndex}`}
                            />
                            <label className="text-sm text-foreground">Incluído</label>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeProcedureFromBenefit(benefitName, procIndex)}
                            data-testid={`button-remove-procedure-${index}-${procIndex}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {procedures.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">
                        Nenhum procedimento adicionado para este benefício.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/planos")}
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="btn-primary"
              disabled={mutation.isPending}
              data-testid="button-save"
            >
              {mutation.isPending ? "Salvando..." : isEdit ? "Atualizar" : "Criar Plano"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
