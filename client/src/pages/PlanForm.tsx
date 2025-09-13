import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPlanSchema } from "@shared/schema";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { PROCEDURE_SECTIONS, PLAN_TYPES, PAYMENT_METHODS, PAYMENT_MODALITIES } from "@/lib/constants";

export default function PlanForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEdit = Boolean(params.id);

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

  const onSubmit = (data: any) => {
    mutation.mutate({
      ...data,
      price: parseFloat(data.price).toString(),
    });
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
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00"
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
                              {type === "com_coparticipacao" ? "Com Coparticipação" : "Sem Coparticipação"}
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

          {/* Payment Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Configuração de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Modalities */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Modalidades de Pagamento
                </label>
                <div className="space-y-2">
                  {PAYMENT_MODALITIES.map((modality) => (
                    <div key={modality} className="flex items-center space-x-2">
                      <Checkbox
                        id={`modality-${modality}`}
                        checked={(form.getValues("modalidadesDePagamento") || []).includes(modality)}
                        onCheckedChange={(checked) => handlePaymentModalityChange(modality, checked as boolean)}
                        data-testid={`checkbox-modality-${modality}`}
                      />
                      <label 
                        htmlFor={`modality-${modality}`}
                        className="text-sm text-foreground capitalize cursor-pointer"
                      >
                        {modality === "mensal" ? "Pagamento Mensal" : "Pagamento Anual"}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PAYMENT_MODALITIES.map((modality) => (
                  <div key={modality}>
                    <label className="text-sm font-medium text-foreground mb-3 block capitalize">
                      Tipos de Pagamento - {modality === "mensal" ? "Mensal" : "Anual"}
                    </label>
                    <div className="space-y-2">
                      {PAYMENT_METHODS.map((method) => (
                        <div key={method} className="flex items-center space-x-2">
                          <Checkbox
                            id={`method-${modality}-${method}`}
                            checked={(form.getValues(`tiposDePagamento.${modality}`) || []).includes(method)}
                            onCheckedChange={(checked) => handlePaymentMethodChange(modality, method, checked as boolean)}
                            data-testid={`checkbox-payment-${modality}-${method.toLowerCase().replace(/\s+/g, '-')}`}
                          />
                          <label 
                            htmlFor={`method-${modality}-${method}`}
                            className="text-sm text-foreground cursor-pointer"
                          >
                            {method}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Procedures */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">Procedimentos Inclusos</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendProcedure({ section: "", name: "", price: 0 })}
                data-testid="button-add-procedure"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {procedureFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name={`procedures.${index}.section` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seção</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid={`select-procedure-section-${index}`}>
                                <SelectValue placeholder="Seção" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PROCEDURE_SECTIONS.map((section) => (
                                <SelectItem key={section} value={section}>
                                  {section}
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
                      name={`procedures.${index}.name` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Procedimento</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Nome do procedimento"
                              data-testid={`input-procedure-name-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`procedures.${index}.price` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              placeholder="0.00"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid={`input-procedure-price-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeProcedure(index)}
                        className="w-full"
                        data-testid={`button-remove-procedure-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {procedureFields.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum procedimento adicionado ainda.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

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
