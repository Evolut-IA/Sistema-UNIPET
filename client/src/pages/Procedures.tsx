import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Edit, Trash2, ClipboardList, Eye, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertProcedureSchema } from "@shared/schema";

export default function Procedures() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [planValues, setPlanValues] = useState<{[key: string]: { price: number, isIncluded: boolean, id?: string }}>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: procedures, isLoading } = useQuery({
    queryKey: ["/api/procedures"],
  });

  const { data: plans } = useQuery({
    queryKey: ["/api/plans"],
  });

  const form = useForm({
    resolver: zodResolver(insertProcedureSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      let procedure;
      if (editingItem) {
        procedure = await apiRequest("PUT", `/api/procedures/${editingItem.id}`, data);
      } else {
        procedure = await apiRequest("POST", "/api/procedures", data);
      }

      // Save plan values
      const activePlans = Object.entries(planValues)
        .filter(([_, value]) => value.isIncluded);
      
      for (const [planId, value] of activePlans) {
        const planProcedureData = {
          planId,
          procedureId: procedure.id,
          price: Math.round(value.price), // Ensure integer for cents
          isIncluded: true
        };
        
        if (value.id) {
          // Update existing plan procedure
          await apiRequest("PUT", `/api/plan-procedures/${value.id}`, planProcedureData);
        } else {
          // Create new plan procedure
          await apiRequest("POST", "/api/plan-procedures", planProcedureData);
        }
      }
      
      // Delete plan procedures that are no longer included
      if (editingItem) {
        const existingPlanProcedures = await apiRequest("GET", `/api/procedures/${procedure.id}/plan-procedures`);
        for (const pp of existingPlanProcedures) {
          const currentValue = planValues[pp.planId];
          if (!currentValue || !currentValue.isIncluded) {
            await apiRequest("DELETE", `/api/plan-procedures/${pp.id}`);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procedures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plan-procedures"] });
      toast({
        title: editingItem ? "Procedimento atualizado" : "Procedimento criado",
        description: editingItem ? "Procedimento foi atualizado com sucesso." : "Procedimento foi criado com sucesso.",
      });
      setDialogOpen(false);
      setEditingItem(null);
      setPlanValues({});
      form.reset();
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
      isActive: item.isActive ?? true,
    });
    
    // Load existing plan values for editing
    try {
      const existingPlanProcedures = await apiRequest("GET", `/api/procedures/${item.id}/plan-procedures`);
      const loadedPlanValues: {[key: string]: { price: number, isIncluded: boolean, id: string }} = {};
      
      existingPlanProcedures.forEach((pp: any) => {
        loadedPlanValues[pp.planId] = {
          price: pp.price || 0,
          isIncluded: pp.isIncluded ?? true,
          id: pp.id
        };
      });
      
      setPlanValues(loadedPlanValues);
    } catch (error) {
      // If error loading existing values, reset to empty
      setPlanValues({});
    }
    
    setDialogOpen(true);
  };

  const handleView = async (item: any) => {
    setViewingItem(item);
    // Fetch plan procedures for this procedure
    try {
      const planProcedures = await apiRequest("GET", `/api/procedures/${item.id}/plan-procedures`);
      setViewingItem({ ...item, planProcedures });
    } catch (error) {
      setViewingItem(item);
    }
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

  const handlePlanValueChange = (planId: string, field: 'price' | 'isIncluded', value: string | boolean) => {
    setPlanValues(prev => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        [field]: field === 'price' ? Math.round(parseFloat(value as string) * 100) : value, // Convert to cents for price
        price: prev[planId]?.price || 0,
        isIncluded: prev[planId]?.isIncluded || false,
        id: prev[planId]?.id
      }
    }));
  };

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">Procedimentos</h1>
          <p className="text-sm text-muted-foreground">Gerencie os procedimentos médicos e seus valores por plano</p>
        </div>
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 xs:gap-4">
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingItem(null);
              setPlanValues({});
              form.reset();
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
          setEditingItem(null);
          setPlanValues({});
          form.reset();
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

                {/* Plan Values */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Valores por Plano</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure os valores deste procedimento para cada plano de saúde
                  </p>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                    {Array.isArray(plans) && plans.map((plan: any) => (
                      <div key={plan.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={planValues[plan.id]?.isIncluded || false}
                          onCheckedChange={(checked) => 
                            handlePlanValueChange(plan.id, 'isIncluded', checked === true)
                          }
                          data-testid={`checkbox-plan-${plan.id}`}
                        />
                        
                        <div className="flex-1">
                          <p className="font-medium text-sm">{plan.name}</p>
                          <p className="text-xs text-muted-foreground">{plan.description}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={planValues[plan.id]?.price ? (planValues[plan.id].price / 100).toFixed(2) : ""}
                            onChange={(e) => 
                              handlePlanValueChange(plan.id, 'price', e.target.value)
                            }
                            disabled={!planValues[plan.id]?.isIncluded}
                            className="w-24"
                            data-testid={`input-plan-price-${plan.id}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
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
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{viewingItem.name}</h3>
                {viewingItem.description && (
                  <p className="text-sm text-muted-foreground mt-1">{viewingItem.description}</p>
                )}
                <Badge variant={viewingItem.isActive ? "default" : "secondary"} className="mt-2">
                  {viewingItem.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Valores por Plano</h4>
                <div className="space-y-2">
                  {viewingItem.planProcedures?.length ? (
                    viewingItem.planProcedures.map((pp: any) => (
                      <div key={pp.id} className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm">{pp.plan?.name}</span>
                        <span className="font-medium">R$ {pp.price ? (pp.price / 100).toFixed(2) : '0.00'}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum valor configurado para planos</p>
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
              Gerenciamento ({filteredItems?.length || 0} procedimentos)
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
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(item)}
                          data-testid={`button-view-${item.id}`}
                          className="text-xs"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          data-testid={`button-edit-${item.id}`}
                          className="text-xs"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="outline"
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
                    variant="outline"
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