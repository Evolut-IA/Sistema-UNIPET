import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useLocation } from "wouter";
import { Plus, Search, Edit, Trash2, FileText, Eye, Copy, Columns } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { PasswordDialog } from "@/components/ui/password-dialog";
import { usePasswordDialog } from "@/hooks/use-password-dialog";
import { GUIDE_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const allColumns = [
  "Procedimento",
  "Unidade",
  "Tipo",
  "Valor",
  "Status",
  "Data",
  "Ações",
] as const;

export default function Guides() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([...allColumns]);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const confirmDialog = useConfirmDialog();
  const passwordDialog = usePasswordDialog();

  const { data: guides, isLoading } = useQuery({
    queryKey: ["/api/guides/with-network-units"],
  });

  const deleteGuideMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/guides/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guides/with-network-units"] });
      toast({
        title: "Guia removida",
        description: "Guia foi removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover guia.",
        variant: "destructive",
      });
    },
  });

  const filteredGuides = Array.isArray(guides) ? guides?.filter((guide: any) => {
    const matchesSearch = guide.procedure?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || guide.status === statusFilter;
    const matchesType = typeFilter === "all" || guide.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }) : [];

  const toggleColumn = (col: string) => {
    setVisibleColumns((prev) =>
      prev.includes(col)
        ? prev.filter((c) => c !== col)
        : [...prev, col]
    );
  };

  const handleDelete = (id: string, procedureName: string) => {
    passwordDialog.openDialog({
      title: "Verificação de Senha",
      description: "Digite a senha do administrador para excluir esta guia:",
      onConfirm: async (password) => {
        try {
          passwordDialog.setLoading(true);
          
          // Verificar senha
          const response = await fetch("/api/admin/verify-password", {
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
              title: "Excluir Guia",
              description: `Tem certeza que deseja excluir a guia "${procedureName}"? Esta ação não pode ser desfeita.`,
              confirmText: "Excluir Guia",
              cancelText: "Cancelar",
              onConfirm: () => {
                confirmDialog.setLoading(true);
                deleteGuideMutation.mutate(id, {
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

  const handleViewDetails = (guide: any) => {
    setSelectedGuide(guide);
    setDetailsOpen(true);
  };

  const generateGuideText = () => {
    if (!selectedGuide) return "";

    let text = "";
    
    // Cabeçalho
    text += "=".repeat(50) + "\n";
    text += "INFORMAÇÕES DA GUIA DE ATENDIMENTO\n";
    text += "=".repeat(50) + "\n\n";

    // Informações Básicas
    text += "INFORMAÇÕES BÁSICAS:\n";
    text += "-".repeat(25) + "\n";
    text += `Nome do Procedimento: ${selectedGuide.procedureName}\n`;
    text += `Tipo de Guia: ${selectedGuide.guideType}\n`;
    text += `Status: ${selectedGuide.status === 'open' ? 'Aberta' : 'Fechada'}\n`;
    text += `Valor: R$ ${selectedGuide.value || 'Não informado'}\n\n`;

    // Informações do Cliente e Pet
    if (selectedGuide.clientName || selectedGuide.petName) {
      text += "INFORMAÇÕES DO CLIENTE E PET:\n";
      text += "-".repeat(30) + "\n";
      if (selectedGuide.clientName) {
        text += `Cliente: ${selectedGuide.clientName}\n`;
      }
      if (selectedGuide.petName) {
        text += `Pet: ${selectedGuide.petName}\n`;
      }
      text += "\n";
    }

    // Notas do Procedimento
    if (selectedGuide.procedureNotes) {
      text += "NOTAS DO PROCEDIMENTO:\n";
      text += "-".repeat(25) + "\n";
      text += `${selectedGuide.procedureNotes}\n\n`;
    }

    // Notas Gerais
    if (selectedGuide.generalNotes) {
      text += "NOTAS GERAIS:\n";
      text += "-".repeat(15) + "\n";
      text += `${selectedGuide.generalNotes}\n\n`;
    }

    // Informações do Cadastro
    text += "INFORMAÇÕES DO CADASTRO:\n";
    text += "-".repeat(25) + "\n";
    text += `Data de Criação: ${selectedGuide.createdAt ? format(new Date(selectedGuide.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "Não informado"}\n`;
    if (selectedGuide.updatedAt) {
      text += `Última Atualização: ${format(new Date(selectedGuide.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}\n`;
    }

    text += "\n" + "=".repeat(50) + "\n";
    text += `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}\n`;
    text += "=".repeat(50);

    return text;
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = generateGuideText();
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Informações da guia copiadas para a área de transferência.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar as informações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-warning/20 text-warning";       // Ausente (amarelo)
      case "closed": return "bg-chart-4/20 text-chart-4";     // Positivo (verde)
      case "cancelled": return "bg-chart-5/20 text-chart-5";  // Negativo (vermelho)
      default: return "bg-chart-4/20 text-chart-4";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open": return "Aberta";
      case "closed": return "Fechada";
      case "cancelled": return "Cancelada";
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "consulta": return "Consulta";
      case "exames": return "Exames";
      case "internacao": return "Internação";
      case "reembolso": return "Reembolso";
      default: return type;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">Guias de Atendimento</h1>
          <p className="text-sm text-muted-foreground">Visualize todas as guias geradas pelas unidades da rede</p>
        </div>
      </div>

      {/* Modern Table Container */}
      <div className="container my-10 space-y-4 p-4 border border-border rounded-lg bg-background shadow-sm overflow-x-auto">
        {/* Filters and Column Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por procedimento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search-guides"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48" data-testid="select-type-filter">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                {[{ value: "all", label: "Todos os tipos" }, ...GUIDE_TYPES.map(type => ({ value: type, label: getTypeLabel(type) }))].map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-status-filter">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { value: "all", label: "Todos os status" },
                  { value: "open", label: "Abertas" },
                  { value: "closed", label: "Fechadas" },
                  { value: "cancelled", label: "Canceladas" }
                ].map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns className="h-4 w-4 mr-2" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {allColumns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={visibleColumns.includes(col)}
                  onCheckedChange={() => toggleColumn(col)}
                >
                  {col}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              {visibleColumns.includes("Procedimento") && <TableHead className="w-[200px]">Procedimento</TableHead>}
              {visibleColumns.includes("Unidade") && <TableHead className="w-[180px]">Unidade</TableHead>}
              {visibleColumns.includes("Tipo") && <TableHead className="w-[120px]">Tipo</TableHead>}
              {visibleColumns.includes("Valor") && <TableHead className="w-[120px]">Valor</TableHead>}
              {visibleColumns.includes("Status") && <TableHead className="w-[100px]">Status</TableHead>}
              {visibleColumns.includes("Data") && <TableHead className="w-[120px]">Data</TableHead>}
              {visibleColumns.includes("Ações") && <TableHead className="w-[150px]">Ações</TableHead>}
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
            ) : filteredGuides?.length ? (
              filteredGuides.map((guide: any) => (
                <TableRow key={guide.id}>
                  {visibleColumns.includes("Procedimento") && (
                    <TableCell className="font-medium whitespace-nowrap">
                      {guide.procedure}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Unidade") && (
                    <TableCell className="whitespace-nowrap">
                      {guide.networkUnit ? guide.networkUnit.name : "Não informada"}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Tipo") && (
                    <TableCell className="whitespace-nowrap">
                      {getTypeLabel(guide.type)}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Valor") && (
                    <TableCell className="whitespace-nowrap">
                      R$ {parseFloat(guide.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Status") && (
                    <TableCell className="whitespace-nowrap">
                      <Badge className={cn("whitespace-nowrap", getStatusColor(guide.status))}>
                        {getStatusLabel(guide.status)}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.includes("Data") && (
                    <TableCell className="whitespace-nowrap">
                      {guide.createdAt && format(new Date(guide.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Ações") && (
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(guide)}
                          data-testid={`button-view-${guide.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/guias/${guide.id}/editar`)}
                          data-testid={`button-edit-${guide.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(guide.id, guide.procedure)}
                          disabled={deleteGuideMutation.isPending}
                          data-testid={`button-delete-${guide.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery || typeFilter !== "all" || statusFilter !== "all" 
                      ? "Nenhuma guia encontrada com os filtros aplicados." 
                      : "Nenhuma guia foi gerada pelas unidades da rede ainda."
                    }
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Detalhes da Guia</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedGuide && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Informações Básicas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Procedimento:</strong> <span className="text-foreground">{selectedGuide.procedure}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Tipo:</strong> <span className="text-foreground">{getTypeLabel(selectedGuide.type)}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Valor:</strong> <span className="text-foreground">R$ {parseFloat(selectedGuide.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Status:</strong></span>
                      <Badge className={getStatusColor(selectedGuide.status)}>
                        {getStatusLabel(selectedGuide.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Criada em:</strong> <span className="text-foreground">{selectedGuide.createdAt && format(new Date(selectedGuide.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span></span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Observações</h4>
                  <div className="space-y-2 text-sm">
                    {selectedGuide.procedureNotes && (
                      <div>
                        <span className="font-medium text-primary">Observações do Procedimento:</span>
                        <p className="text-muted-foreground mt-1 p-2 bg-muted/10 rounded">
                          {selectedGuide.procedureNotes}
                        </p>
                      </div>
                    )}
                    {selectedGuide.generalNotes && (
                      <div>
                        <span className="font-medium text-primary">Anotações Gerais:</span>
                        <p className="text-muted-foreground mt-1 p-2 bg-muted/10 rounded">
                          {selectedGuide.generalNotes}
                        </p>
                      </div>
                    )}
                    {!selectedGuide.procedureNotes && !selectedGuide.generalNotes && (
                      <p className="text-muted-foreground italic">Nenhuma observação registrada.</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Copy Button */}
              <div className="flex justify-center mt-4">
                <Button
                  variant="default"
                  onClick={handleCopyToClipboard}
                  className="flex items-center space-x-2"
                  data-testid="button-copy-details"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copiar Informações</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <PasswordDialog
        open={passwordDialog.isOpen}
        onOpenChange={passwordDialog.closeDialog}
        onConfirm={passwordDialog.confirm}
        title={passwordDialog.title}
        description={passwordDialog.description}
        isLoading={passwordDialog.isLoading}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.isOpen}
        onOpenChange={confirmDialog.closeDialog}
        onConfirm={confirmDialog.confirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        isLoading={confirmDialog.isLoading}
      />
    </div>
  );
}
