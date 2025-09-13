import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
import { Plus, Search, Edit, Trash2, CreditCard } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Plans() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["/api/plans"],
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: "Plano removido",
        description: "Plano foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover plano.",
        variant: "destructive",
      });
    },
  });

  const togglePlanMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PUT", `/api/plans/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: "Status atualizado",
        description: "Status do plano foi atualizado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do plano.",
        variant: "destructive",
      });
    },
  });

  const filteredPlans = plans?.filter((plan: any) =>
    plan.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este plano?")) {
      deletePlanMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    togglePlanMutation.mutate({ id, isActive: !currentStatus });
  };

  const getPlanTypeLabel = (type: string) => {
    switch (type) {
      case "com_coparticipacao": return "Com Coparticipação";
      case "sem_coparticipacao": return "Sem Coparticipação";
      default: return type;
    }
  };

  const getPlanTypeColor = (type: string) => {
    switch (type) {
      case "com_coparticipacao": return "bg-blue-100 text-blue-800";
      case "sem_coparticipacao": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Planos de Saúde</h1>
          <p className="text-muted-foreground">Gerencie os planos de saúde disponíveis</p>
        </div>
        <Button 
          className="btn-primary"
          onClick={() => setLocation("/planos/novo")}
          data-testid="button-new-plan"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome do plano..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-plans"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredPlans?.length ? (
          filteredPlans.map((plan: any) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <CardTitle className="text-foreground text-lg" data-testid={`plan-name-${plan.id}`}>
                      {plan.name}
                    </CardTitle>
                  </div>
                  <Switch
                    checked={plan.isActive}
                    onCheckedChange={() => handleToggleStatus(plan.id, plan.isActive)}
                    disabled={togglePlanMutation.isPending}
                    data-testid={`switch-plan-status-${plan.id}`}
                  />
                </div>
                <Badge className={getPlanTypeColor(plan.planType)}>
                  {getPlanTypeLabel(plan.planType)}
                </Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-4">
                  <p className="text-3xl font-bold text-foreground">
                    R$ {parseFloat(plan.price || 0).toFixed(2)}
                    <span className="text-lg font-normal text-muted-foreground">/mês</span>
                  </p>
                </div>

                {plan.features && plan.features.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">Principais benefícios:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {plan.features.slice(0, 3).map((feature: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-xs text-muted-foreground italic">
                          +{plan.features.length - 3} benefícios adicionais
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex space-x-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setLocation(`/planos/${plan.id}/editar`)}
                    data-testid={`button-edit-${plan.id}`}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(plan.id)}
                    disabled={deletePlanMutation.isPending}
                    data-testid={`button-delete-${plan.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "Nenhum plano encontrado para a busca." 
                : "Nenhum plano cadastrado ainda."
              }
            </p>
            {!searchQuery && (
              <Button 
                className="btn-primary"
                onClick={() => setLocation("/planos/novo")}
                data-testid="button-add-first-plan"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Plano
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Summary Card */}
      {filteredPlans && filteredPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{filteredPlans.length}</p>
                <p className="text-sm text-muted-foreground">Total de Planos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {filteredPlans.filter((p: any) => p.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Planos Ativos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {filteredPlans.filter((p: any) => !p.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Planos Inativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
