import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { Switch } from "@/components/admin/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import { useLocation } from "wouter";
import { Plus, Search, Edit, Trash2, CreditCard, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest, getQueryOptions } from "@/lib/admin/queryClient";
import { createSmartInvalidation } from "@/lib/admin/cacheUtils";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { useConfirmDialog } from "@/hooks/admin/use-confirm-dialog";
import { PasswordDialog } from "@/components/admin/ui/password-dialog";
import { usePasswordDialog } from "@/hooks/admin/use-password-dialog";
import { useColumnPreferences } from "@/hooks/admin/use-column-preferences";
import type { Plan } from "@shared/schema";
import { cn } from "@/lib/utils";

const allColumns = [
  "Nome",
  "Preço",
  "Tipo",
  "Status",
  "Ações",
] as const;

export default function Plans() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { visibleColumns, toggleColumn } = useColumnPreferences('plans.columns', allColumns);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();
  const smartCache = createSmartInvalidation(queryClient);
  const { toast } = useToast();
  const confirmDialog = useConfirmDialog();
  const passwordDialog = usePasswordDialog();

  const { data: plans, isLoading } = useQuery<Plan[]>({
    queryKey: ["/admin/api/plans"],
    ...getQueryOptions('plans'),
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/admin/api/plans/${id}`);
    },
    onMutate: async (id: string) => {
      // Optimistically remove plan from cache
      await queryClient.cancelQueries({ queryKey: ["/admin/api/plans"] });
      const previousPlans = queryClient.getQueryData(["/admin/api/plans"]);
      
      queryClient.setQueryData(["/admin/api/plans"], (old: any[]) => {
        return old?.filter(plan => plan.id !== id) || [];
      });
      
      return { previousPlans };
    },
    onSuccess: (_, id) => {
      smartCache.invalidatePlanData(id);
      toast({
        title: "Plano removido",
        description: "Plano foi removido com sucesso.",
      });
    },
    onError: (_, __, context) => {
      // Restore previous data on error
      if (context?.previousPlans) {
        queryClient.setQueryData(["/admin/api/plans"], context.previousPlans);
      }
      toast({
        title: "Erro",
        description: "Falha ao remover plano.",
        variant: "destructive",
      });
    },
  });

  const togglePlanMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PUT", `/admin/api/plans/${id}`, { isActive });
    },
    onMutate: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      // Optimistically update plan status
      await queryClient.cancelQueries({ queryKey: ["/admin/api/plans"] });
      const previousPlans = queryClient.getQueryData(["/admin/api/plans"]);
      
      smartCache.updatePlanOptimistically(id, { isActive });
      
      return { previousPlans };
    },
    onSuccess: (_, { id }) => {
      smartCache.invalidatePlanData(id);
      toast({
        title: "Status atualizado",
        description: "Status do plano foi atualizado.",
      });
    },
    onError: (_, __, context) => {
      // Restore previous data on error
      if (context?.previousPlans) {
        queryClient.setQueryData(["/admin/api/plans"], context.previousPlans);
      }
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do plano.",
        variant: "destructive",
      });
    },
  });

  const allFilteredPlans = Array.isArray(plans) ? plans.filter((plan: Plan) =>
    plan.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const totalPlans = allFilteredPlans.length;
  const totalPages = Math.ceil(totalPlans / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const filteredPlans = allFilteredPlans.slice(startIndex, endIndex);


  const handleDelete = (id: string, planName: string) => {
    passwordDialog.openDialog({
      title: "Verificação de Senha",
      description: "Digite a senha do administrador para excluir este plano:",
      onConfirm: async (password) => {
        try {
          passwordDialog.setLoading(true);
          
          // Verificar senha
          const response = await fetch("/admin/api/admin/verify-password", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
          });
          
          const result = await response.json();
          
          if (result.valid) {
            // Senha correta, mostrar confirmação de exclusão
            confirmDialog.openDialog({
              title: "Excluir Plano",
              description: `Tem certeza que deseja excluir o plano "${planName}"? Esta ação não pode ser desfeita.`,
              confirmText: "Excluir Plano",
              cancelText: "Cancelar",
              onConfirm: () => {
                confirmDialog.setLoading(true);
                deletePlanMutation.mutate(id, {
                  onSettled: () => {
                    confirmDialog.setLoading(false);
                  }
                });
              },
            });
          } else {
            toast({
              title: "Senha incorreta",
              description: "A senha do administrador está incorreta.",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Erro",
            description: "Erro ao verificar senha. Tente novamente.",
            variant: "destructive",
          });
        } finally {
          passwordDialog.setLoading(false);
        }
      },
    });
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    togglePlanMutation.mutate({ id, isActive: !currentStatus });
  };

  const getPlanTypeLabel = (type: string) => {
    switch (type) {
      case "with_waiting_period": return "Com Coparticipação";
      case "without_waiting_period": return "Sem Coparticipação";
      default: return type;
    }
  };

  const getPlanTypeColor = (type: string) => {
    switch (type) {
      case "with_waiting_period": return "border border-border rounded-lg bg-background text-foreground";
      case "without_waiting_period": return "border border-border rounded-lg bg-background text-foreground";
      default: return "border border-border rounded-lg bg-background text-foreground";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">Planos de Saúde</h1>
          <p className="text-sm text-muted-foreground">Gerencie os planos de saúde disponíveis</p>
        </div>
      </div>

      {/* Filters and Column Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do plano..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset para página 1 ao buscar
              }}
              className="pl-10 w-64"
              data-testid="input-search-plans"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            className="btn-primary"
            size="sm"
            onClick={() => setLocation("/planos/novo")}
            data-testid="button-new-plan"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {allColumns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={visibleColumns.includes(col)}
                  onCheckedChange={() => toggleColumn(col)}
                  className="data-[state=checked]:bg-transparent"
                >
                  {col}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Modern Table Container */}
      <div className="container my-10 space-y-4 border border-border rounded-lg bg-accent shadow-sm">

        {/* Table */}
        <div className="rounded-lg overflow-hidden">
          <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-accent">
              {visibleColumns.includes("Nome") && <TableHead className="w-[200px] bg-accent">Nome</TableHead>}
              {visibleColumns.includes("Preço") && <TableHead className="w-[150px] bg-accent">Preço</TableHead>}
              {visibleColumns.includes("Tipo") && <TableHead className="w-[180px] bg-accent">Tipo</TableHead>}
              {visibleColumns.includes("Status") && <TableHead className="w-[100px] bg-accent">Status</TableHead>}
              {visibleColumns.includes("Ações") && <TableHead className="w-[150px] bg-accent">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={visibleColumns.length} className="text-center py-6">
                    <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredPlans?.length ? (
              filteredPlans.map((plan: any) => (
                <TableRow key={plan.id} className="bg-accent">
                  {visibleColumns.includes("Nome") && (
                    <TableCell className="font-medium whitespace-nowrap bg-accent" data-testid={`plan-name-${plan.id}`}>
                      {plan.name}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Preço") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      <span className="font-bold text-foreground">
                        R$ {(parseFloat(plan.price || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-muted-foreground">/mês</span>
                      </span>
                    </TableCell>
                  )}
                  {visibleColumns.includes("Tipo") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      <Badge className={cn("whitespace-nowrap", getPlanTypeColor(plan.planType))}>
                        {getPlanTypeLabel(plan.planType)}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.includes("Status") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      <Switch
                        checked={plan.isActive}
                        onCheckedChange={() => handleToggleStatus(plan.id, plan.isActive)}
                        disabled={togglePlanMutation.isPending}
                        data-testid={`switch-plan-status-${plan.id}`}
                      />
                    </TableCell>
                  )}
                  {visibleColumns.includes("Ações") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/planos/${plan.id}/editar`)}
                          data-testid={`button-edit-${plan.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(plan.id, plan.name)}
                          disabled={deletePlanMutation.isPending}
                          data-testid={`button-delete-${plan.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow className="bg-accent">
                <TableCell colSpan={visibleColumns.length} className="text-center py-12 bg-accent">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? "Nenhum plano encontrado para a busca." 
                      : "Nenhum plano cadastrado ainda."
                    }
                  </p>
                  {!searchQuery && (
                    <Button 
                      className="btn-primary"
                      size="sm"
                      onClick={() => setLocation("/planos/novo")}
                      data-testid="button-add-first-plan"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Plano
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
        
        {/* Pagination */}
        {totalPlans > 10 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} a {Math.min(endIndex, totalPlans)} de {totalPlans} planos
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isLoading}
                data-testid="button-previous-page"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else {
                    const start = Math.max(1, currentPage - 2);
                    const end = Math.min(totalPages, start + 4);
                    pageNumber = start + i;
                    if (pageNumber > end) return null;
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      disabled={isLoading}
                      data-testid={`button-page-${pageNumber}`}
                      className="w-10"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || isLoading}
                data-testid="button-next-page"
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
          </div>
        )}
      </div>

      {/* Password Dialog */}
      <PasswordDialog
        open={passwordDialog.isOpen}
        onOpenChange={passwordDialog.closeDialog}
        onConfirm={passwordDialog.confirm}
        title={passwordDialog.title ?? "Verificação de Senha"}
        description={passwordDialog.description ?? "Digite a senha do administrador para continuar:"}
        isLoading={passwordDialog.isLoading ?? false}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.isOpen}
        onOpenChange={confirmDialog.closeDialog}
        onConfirm={confirmDialog.confirm}
        title={confirmDialog.title ?? "Confirmar exclusão"}
        description={confirmDialog.description ?? "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."}
        confirmText={confirmDialog.confirmText ?? "Excluir"}
        cancelText={confirmDialog.cancelText ?? "Cancelar"}
        isLoading={confirmDialog.isLoading ?? false}
      />
    </div>
  );
}
