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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Search, Edit, Trash2, HelpCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertFaqItemSchema } from "@shared/schema";

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: faqItems, isLoading } = useQuery({
    queryKey: ["/api/faq"],
  });

  const form = useForm({
    resolver: zodResolver(insertFaqItemSchema),
    defaultValues: {
      question: "",
      answer: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingItem) {
        await apiRequest("PUT", `/api/faq/${editingItem.id}`, data);
      } else {
        await apiRequest("POST", "/api/faq", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faq"] });
      toast({
        title: editingItem ? "Item atualizado" : "Item criado",
        description: editingItem ? "Item foi atualizado com sucesso." : "Item foi criado com sucesso.",
      });
      setDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: editingItem ? "Falha ao atualizar item." : "Falha ao criar item.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/faq/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faq"] });
      toast({
        title: "Item removido",
        description: "Item foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover item.",
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PUT", `/api/faq/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faq"] });
      toast({
        title: "Status atualizado",
        description: "Status do item foi atualizado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do item.",
        variant: "destructive",
      });
    },
  });

  const filteredItems = Array.isArray(faqItems) ? faqItems?.filter((item: any) =>
    item.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleEdit = (item: any) => {
    setEditingItem(item);
    form.reset({
      question: item.question || "",
      answer: item.answer || "",
      isActive: item.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este item?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleMutation.mutate({ id, isActive: !currentStatus });
  };

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  const activeItems = filteredItems?.filter((item: any) => item.isActive) || [];

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">FAQ</h1>
          <p className="text-sm text-muted-foreground">Gerencie as perguntas frequentes</p>
        </div>
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 xs:gap-4">
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingItem(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="btn-primary w-full xs:w-auto" data-testid="button-new-faq">
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Dialog Content */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setEditingItem(null);
          form.reset();
        }
      }}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingItem ? "Editar Item" : "Novo Item FAQ"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pergunta *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-question" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resposta *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} data-testid="textarea-answer" />
                      </FormControl>
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
                        <FormLabel className="text-base">Item Ativo</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Itens ativos são exibidos no FAQ público
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-faq-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

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

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar perguntas e respostas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-faq"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {/* Management Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">
              Itens ({filteredItems?.length || 0})
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
              <div className="space-y-3">
                {filteredItems.map((item: any) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-foreground text-sm" data-testid={`faq-question-${item.id}`}>
                        {item.question}
                      </h4>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {item.answer}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={item.isActive}
                        onCheckedChange={() => handleToggleStatus(item.id, item.isActive)}
                        disabled={toggleMutation.isPending}
                        data-testid={`switch-faq-status-${item.id}`}
                      />
                      
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        data-testid={`button-edit-${item.id}`}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${item.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Nenhum item encontrado para a busca." 
                    : "Nenhum item cadastrado ainda."
                  }
                </p>
                {!searchQuery && (
                  <Button
                    variant="default"
                    onClick={() => setDialogOpen(true)}
                    data-testid="button-add-first-faq"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Item
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
