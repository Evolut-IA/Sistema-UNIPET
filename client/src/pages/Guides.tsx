import { useState, useEffect } from "react";
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
import { Plus, Search, Edit, Trash2, FileText, Eye, Copy, Columns3 as Columns, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDate } from "@internationalized/date";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { PasswordDialog } from "@/components/ui/password-dialog";
import { usePasswordDialog } from "@/hooks/use-password-dialog";
import { useColumnPreferences } from "@/hooks/use-column-preferences";
import { DateFilterComponent } from "@/components/DateFilterComponent";
import { getDateRangeParams } from "@/lib/date-utils";
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
  const { visibleColumns, toggleColumn } = useColumnPreferences('guides.columns', allColumns);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const confirmDialog = useConfirmDialog();
  const passwordDialog = usePasswordDialog();

  const [dateFilter, setDateFilter] = useState<{
    startDate: CalendarDate | null;
    endDate: CalendarDate | null;
  }>({ startDate: null, endDate: null });

  const [debouncedDateFilter, setDebouncedDateFilter] = useState<{
    startDate: CalendarDate | null;
    endDate: CalendarDate | null;
  }>({ startDate: null, endDate: null });

  // Debounce date filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDateFilter(dateFilter);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [dateFilter]);

  const handleDateRangeChange = (startDate: CalendarDate | null, endDate: CalendarDate | null) => {
    setDateFilter({ startDate, endDate });
    setCurrentPage(1); // Reset para página 1 ao filtrar por data
  };

  // Get date range parameters for API calls using debounced values
  const dateParams = getDateRangeParams(debouncedDateFilter.startDate, debouncedDateFilter.endDate);

  const { data: guides, isLoading } = useQuery({
    queryKey: ["/api/guides/with-network-units", currentPage, searchQuery, statusFilter, typeFilter, dateParams],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...dateParams
      });
      const response = await fetch(`/api/guides/with-network-units?${params}`);
      if (!response.ok) throw new Error('Failed to fetch guides');
      return response.json();
    },
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

  const guidesData = guides?.data || [];
  const totalGuides = guides?.total || 0;
  const totalPages = guides?.totalPages || 1;
  const currentPageData = guides?.page || 1;


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
    text += `Status: ${getStatusLabel(selectedGuide.status)}\n`;
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
      case "open": return "bg-chart-4/20 text-accent-foreground";     // Positivo (verde) com cor de destaque
      case "closed": return "bg-warning/20 text-accent-foreground";    // Aviso (amarelo) com cor de destaque
      case "cancelled": return "bg-chart-5/20 text-accent-foreground"; // Negativo (vermelho) com cor de destaque
      default: return "bg-chart-4/20 text-accent-foreground";
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

      {/* Date Filter */}
      <DateFilterComponent
        onDateRangeChange={handleDateRangeChange}
        isLoading={isLoading ||
          (dateFilter.startDate !== debouncedDateFilter.startDate ||
            dateFilter.endDate !== debouncedDateFilter.endDate)}
        initialRange={dateFilter}
      />

      {/* Filters and Column Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por procedimento..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset para página 1 ao buscar
              }}
              className="pl-10 w-64"
              data-testid="input-search-guides"
            />
          </div>
          <Select value={typeFilter} onValueChange={(value) => {
            setTypeFilter(value);
            setCurrentPage(1); // Reset para página 1 ao filtrar
          }}>
            <SelectTrigger className="w-48" data-testid="select-type-filter">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              {[{ value: "all", label: "Todos os tipos" }, ...GUIDE_TYPES.map(type => ({ value: type, label: getTypeLabel(type) }))].map((item) => (
                <SelectItem key={item.value} value={item.value} className="data-[state=selected]:bg-primary data-[state=selected]:text-primary-foreground">
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1); // Reset para página 1 ao filtrar
          }}>
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
                <SelectItem key={status.value} value={status.value} className="data-[state=selected]:bg-primary data-[state=selected]:text-primary-foreground">
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
                className="data-[state=checked]:bg-transparent focus:bg-muted/50"
              >
                {col}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Modern Table Container */}
      <div className="container my-10 space-y-4 border border-border rounded-lg bg-accent shadow-sm">

        {/* Table */}
        <div className="rounded-lg overflow-hidden">
          <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-accent">
              {visibleColumns.includes("Procedimento") && <TableHead className="w-[200px] bg-accent">Procedimento</TableHead>}
              {visibleColumns.includes("Unidade") && <TableHead className="w-[180px] bg-accent">Unidade</TableHead>}
              {visibleColumns.includes("Tipo") && <TableHead className="w-[120px] bg-accent">Tipo</TableHead>}
              {visibleColumns.includes("Valor") && <TableHead className="w-[120px] bg-accent">Valor</TableHead>}
              {visibleColumns.includes("Status") && <TableHead className="w-[100px] bg-accent">Status</TableHead>}
              {visibleColumns.includes("Data") && <TableHead className="w-[120px] bg-accent">Data</TableHead>}
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
            ) : guidesData?.length ? (
              guidesData.map((guide: any) => (
                <TableRow key={guide.id} className="bg-accent hover:bg-accent/80">
                  {visibleColumns.includes("Procedimento") && (
                    <TableCell className="font-medium whitespace-nowrap bg-accent">
                      {guide.procedure}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Unidade") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      {guide.networkUnit ? guide.networkUnit.name : "Não informada"}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Tipo") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      {getTypeLabel(guide.type)}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Valor") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      R$ {parseFloat(guide.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Status") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      <Badge className={cn("whitespace-nowrap", getStatusColor(guide.status))}>
                        {getStatusLabel(guide.status)}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.includes("Data") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      {guide.createdAt && format(new Date(guide.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Ações") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(guide)}
                          data-testid={`button-view-${guide.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow className="bg-accent">
                <TableCell colSpan={visibleColumns.length} className="text-center py-12 bg-accent">
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
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Mostrando {(currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, totalGuides)} de {totalGuides} guias
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

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader className="flex flex-row items-center justify-between pr-2">
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Detalhes da Guia</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleCopyToClipboard}
                className="gap-2 h-8"
                data-testid="button-copy-details"
              >
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
              <Button
                variant="outline" 
                onClick={() => setDetailsOpen(false)}
                className="h-8"
              >
                Fechar
              </Button>
            </div>
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
