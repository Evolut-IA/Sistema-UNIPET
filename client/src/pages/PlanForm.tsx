import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputMasked } from "@/components/ui/input-masked";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPlanSchema } from "@shared/schema";
import { ArrowLeft } from "lucide-react";
import { PLAN_TYPES, PROCEDURE_TYPE_LABELS } from "@/lib/constants";

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

  // Buscar procedimentos vinculados ao plano quando estiver editando
  const { data: planProcedures } = useQuery({
    queryKey: ["/api/plans", params.id, "procedures"],
    enabled: isEdit && !!params.id,
  });

  const form = useForm({
    resolver: zodResolver(insertPlanSchema),
    defaultValues: {
      name: "",
      price: "",
      planType: "with_waiting_period",
      description: "",
      image: "",
      buttonText: "Contratar Plano",
      displayOrder: 0,
      isActive: true,
      coparticipacaoPercentual: undefined,
    },
  });




  const getPlanTypeLabel = (type: string) => {
    switch (type) {
      case "with_waiting_period": return "Com Coparticipação";
      case "without_waiting_period": return "Sem Coparticipação";
      default: return type;
    }
  };




  useEffect(() => {
    if (plan && typeof plan === 'object') {
      form.reset({
        name: (plan as any).name || "",
        price: (plan as any).price ? ((plan as any).price / 100).toFixed(2) : "",
        planType: (plan as any).planType || "with_waiting_period",
        description: (plan as any).description || "",
        image: (plan as any).image || "",
        buttonText: (plan as any).buttonText || "Contratar Plano",
        displayOrder: (plan as any).displayOrder || 0,
        isActive: (plan as any).isActive ?? true,
        coparticipacaoPercentual: (plan as any).coparticipacaoPercentual || undefined,
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
        price: Math.round(parseFloat(data.price) * 100), // Convert to cents
        coparticipacaoPercentual: data.coparticipacaoPercentual || null,
      };

      let planId;
      if (isEdit) {
        await apiRequest("PUT", `/api/plans/${params.id}`, planData);
        planId = params.id;
      } else {
        const response = await apiRequest("POST", "/api/plans", planData);
        planId = response.id;
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
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isEdit ? "Editar Plano" : "Novo Plano"}
        </h1>
        <p className="text-muted-foreground">
          {isEdit ? "Atualize as informações do plano" : "Crie um novo plano de saúde"}
        </p>
      </div>

      {/* Back Button */}
      <Button
        variant="default"
        onClick={() => setLocation("/planos")}
        data-testid="button-back-to-plans"
        className="w-full sm:w-auto"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

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
                          {PLAN_TYPES.flatMap((type, index) => [
                            <SelectItem key={type} value={type} className="py-3 pl-10 pr-4">
                              {getPlanTypeLabel(type)}
                            </SelectItem>,
                            ...(index < PLAN_TYPES.length - 1 ? [<Separator key={`separator-${type}`} />] : [])
                          ])}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo de Coparticipação - aparece apenas para planos Com Coparticipação */}
                {form.watch("planType") === "with_waiting_period" && (
                  <FormField
                    control={form.control}
                    name="coparticipacaoPercentual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Percentual de Coparticipação (%)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="1"
                            max="100"
                            placeholder="Ex: 20"
                            onChange={(e) => {
                              const value = e.target.value;
                              // Aceita apenas números de 1 a 100
                              if (value === '' || (Number(value) >= 1 && Number(value) <= 100)) {
                                field.onChange(value === '' ? undefined : Number(value));
                              }
                            }}
                            value={field.value || ''}
                            data-testid="input-coparticipacao-percentual"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Digite um valor entre 1 e 100%
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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

          {/* Seção de Procedimentos */}
          {isEdit && (
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Procedimentos</CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(planProcedures) && planProcedures.length > 0 ? (
                  <div className="space-y-6">
                    {(() => {
                      // Group procedures by type
                      const groupedProcedures = planProcedures.reduce((groups: any, item: any) => {
                        const type = item.procedure.procedureType || 'consultas';
                        if (!groups[type]) {
                          groups[type] = [];
                        }
                        groups[type].push(item);
                        return groups;
                      }, {});

                      // Render each group
                      return Object.entries(groupedProcedures).map(([type, procedures]: [string, any]) => (
                        <div key={type} className="space-y-3">
                          <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                            {PROCEDURE_TYPE_LABELS[type as keyof typeof PROCEDURE_TYPE_LABELS]}
                          </h3>
                          <div className="space-y-2 ml-4">
                            {procedures.map((item: any) => (
                              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                  <h4 className="font-medium text-foreground">{item.procedure.name}</h4>
                                  {item.procedure.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{item.procedure.description}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-lg">
                                    R$ {(item.price / 100).toFixed(2).replace('.', ',')}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Preço no plano</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum procedimento vinculado a este plano.</p>
                    <p className="text-sm mt-1">
                      Para vincular procedimentos, acesse a página de Procedimentos e configure os preços para este plano.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="default"
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
