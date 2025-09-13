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

  const filteredItems = faqItems?.filter((item: any) =>
    item.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">FAQ</h1>
          <p className="text-muted-foreground">Gerencie as perguntas frequentes</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingItem(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="btn-primary" data-testid="button-new-faq">
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          </DialogTrigger>
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
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Public FAQ Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              Visualização Pública ({activeItems.length} itens)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeItems.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {activeItems.map((item: any, index: number) => (
                  <AccordionItem key={item.id} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhum item ativo para exibição pública.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Management Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">
              Gerenciamento ({filteredItems?.length || 0} itens)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Ativo" : "Inativo"}
                      </Badge>
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
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        data-testid={`button-edit-${item.id}`}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="outline"
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
                    variant="outline"
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

      {/* Statistics */}
      {filteredItems && filteredItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{filteredItems.length}</p>
                <p className="text-sm text-muted-foreground">Total de Itens</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {filteredItems.filter((item: any) => item.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Itens Ativos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {filteredItems.filter((item: any) => !item.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Itens Inativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
