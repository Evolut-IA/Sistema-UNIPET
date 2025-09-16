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
import { PLAN_TYPES } from "@/lib/constants";

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
      description: "",
      image: "",
      buttonText: "Contratar Plano",
      displayOrder: 0,
      isActive: true,
    },
  });




  const getPlanTypeLabel = (type: string) => {
    switch (type) {
      case "with_waiting_period": return "Com Carência";
      case "without_waiting_period": return "Sem Carência";
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
