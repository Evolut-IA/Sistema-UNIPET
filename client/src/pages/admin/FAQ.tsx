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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Edit, Trash2, HelpCircle, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/admin/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useColumnPreferences } from "@/hooks/use-column-preferences";
import { insertFaqItemSchema } from "@shared/schema";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const allColumns = [
  "Pergunta",
  "Status", 
  "Data",
  "Ações",
] as const;

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { visibleColumns, toggleColumn } = useColumnPreferences('faq.columns', allColumns);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: faqItems, isLoading } = useQuery({
    queryKey: ["/admin/api/faq"],
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
        await apiRequest("PUT", `/admin/api/faq/${editingItem.id}`, data);
      } else {
        await apiRequest("POST", "/admin/api/faq", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/faq"] });
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
      await apiRequest("DELETE", `/admin/api/faq/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/faq"] });
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
      await apiRequest("PUT", `/admin/api/faq/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/faq"] });
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

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);

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

  const getStatusColor = (isActive: boolean) => {
    return "border border-border rounded-lg bg-background text-foreground";
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? "Ativo" : "Inativo";
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">FAQ</h1>
          <p className="text-sm text-muted-foreground">Gerencie as perguntas frequentes</p>
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
        <DialogContent className="">
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
                    size="sm"
                    onClick={() => setDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="admin-action"
                    size="sm"
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

      {/* Filters and Column Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar perguntas e respostas..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset para página 1 ao buscar
              }}
              className="pl-10 w-64"
              data-testid="input-search-faq"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingItem(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="admin-action" size="sm" data-testid="button-new-faq">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
          </Dialog>
          
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
              {visibleColumns.includes("Pergunta") && <TableHead className="w-[300px] bg-accent">Pergunta</TableHead>}
              {visibleColumns.includes("Status") && <TableHead className="w-[100px] bg-accent">Status</TableHead>}
              {visibleColumns.includes("Data") && <TableHead className="w-[120px] bg-accent">Data</TableHead>}
              {visibleColumns.includes("Ações") && <TableHead className="w-[200px] bg-accent">Ações</TableHead>}
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
            ) : paginatedItems?.length ? (
              paginatedItems.map((item: any) => (
                <TableRow key={item.id} className="bg-accent">
                  {visibleColumns.includes("Pergunta") && (
                    <TableCell className="font-medium bg-accent">
                      <div className="max-w-[280px]">
                        <p className="truncate" title={item.question} data-testid={`faq-question-${item.id}`}>
                          {item.question}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-1" title={item.answer}>
                          {item.answer}
                        </p>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes("Status") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      <Badge className={cn("whitespace-nowrap", getStatusColor(item.isActive))}>
                        {getStatusLabel(item.isActive)}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.includes("Data") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      {item.createdAt && format(new Date(item.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Ações") && (
                    <TableCell className="whitespace-nowrap bg-accent">
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
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${item.id}`}
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
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "Nenhum item encontrado para a busca." 
                      : "Nenhum item cadastrado ainda."
                    }
                  </p>
                  {!searchQuery && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDialogOpen(true)}
                      data-testid="button-add-first-faq"
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Item
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>

        {/* Pagination */}
        {totalItems > 10 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Mostrando {startIndex + 1} a {Math.min(startIndex + pageSize, totalItems)} de {totalItems} itens</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-muted-foreground">Página {currentPage} de {totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
