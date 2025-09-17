import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Search, Edit, Trash2, Building2, ExternalLink, Phone, MapPin, Eye, Copy, Globe, Columns3 as Columns, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { PasswordDialog } from "@/components/ui/password-dialog";
import { usePasswordDialog } from "@/hooks/use-password-dialog";
import { cn } from "@/lib/utils";

const allColumns = [
  "Nome",
  "Endereço",
  "Telefone",
  "Serviços",
  "Status",
  "Ações",
] as const;

export default function Network() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([...allColumns]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const confirmDialog = useConfirmDialog();
  const passwordDialog = usePasswordDialog();

  const { data: units, isLoading } = useQuery({
    queryKey: ["/api/network-units"],
  });

  const deleteUnitMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/network-units/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/network-units"] });
      toast({
        title: "Unidade removida",
        description: "Unidade foi removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover unidade.",
        variant: "destructive",
      });
    },
  });

  const toggleUnitMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PUT", `/api/network-units/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/network-units"] });
      toast({
        title: "Status atualizado",
        description: "Status da unidade foi atualizado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar status da unidade.",
        variant: "destructive",
      });
    },
  });

  const filteredUnits = Array.isArray(units) ? units?.filter((unit: any) =>
    unit.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.address?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];
  
  const totalUnits = filteredUnits.length;
  const totalPages = Math.ceil(totalUnits / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayUnits = filteredUnits.slice(startIndex, endIndex);

  const toggleColumn = (col: string) => {
    setVisibleColumns((prev) =>
      prev.includes(col)
        ? prev.filter((c) => c !== col)
        : [...prev, col]
    );
  };

  const handleDelete = (id: string, unitName: string) => {
    passwordDialog.openDialog({
      title: "Verificação de Senha",
      description: "Digite a senha do administrador para excluir esta unidade:",
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
              title: "Excluir Unidade",
              description: `Tem certeza que deseja excluir a unidade "${unitName}"? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.`,
              confirmText: "Excluir Unidade",
              cancelText: "Cancelar",
              onConfirm: () => {
                confirmDialog.setLoading(true);
                deleteUnitMutation.mutate(id, {
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
    toggleUnitMutation.mutate({ id, isActive: !currentStatus });
  };

  const handleViewDetails = (unit: any) => {
    setSelectedUnit(unit);
    setDetailsOpen(true);
  };

  const generateUnitText = () => {
    if (!selectedUnit) return "";

    let text = "";
    
    // Cabeçalho
    text += "=".repeat(50) + "\n";
    text += "INFORMAÇÕES DA UNIDADE\n";
    text += "=".repeat(50) + "\n\n";

    // Informações Básicas
    text += "INFORMAÇÕES BÁSICAS:\n";
    text += "-".repeat(25) + "\n";
    text += `Nome: ${selectedUnit.name}\n`;
    text += `Endereço: ${selectedUnit.address}\n`;
    text += `Telefone: ${selectedUnit.phone}\n`;
    if (selectedUnit.whatsapp) {
      text += `WhatsApp: ${selectedUnit.whatsapp}\n`;
    }
    text += `Status: ${selectedUnit.isActive ? 'Ativo' : 'Inativo'}\n\n`;

    // Serviços
    if (selectedUnit.services && selectedUnit.services.length > 0) {
      text += "SERVIÇOS OFERECIDOS:\n";
      text += "-".repeat(20) + "\n";
      selectedUnit.services.forEach((service: string, index: number) => {
        text += `${index + 1}. ${service}\n`;
      });
      text += "\n";
    }

    // Localização
    if (selectedUnit.googleMapsUrl) {
      text += "LOCALIZAÇÃO:\n";
      text += "-".repeat(15) + "\n";
      text += `Google Maps: ${selectedUnit.googleMapsUrl}\n\n`;
    }

    text += "=".repeat(50) + "\n";
    text += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    text += "=".repeat(50);

    return text;
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = generateUnitText();
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Informações da unidade copiadas para a área de transferência.",
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

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">Rede Credenciada</h1>
          <p className="text-sm text-muted-foreground">Gerencie as unidades credenciadas</p>
        </div>
        <Button 
          className="btn-primary w-full sm:w-auto"
          onClick={() => setLocation("/rede/novo")}
          data-testid="button-new-unit"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Unidade
        </Button>
      </div>

      {/* Filters and Column Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou endereço..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset para página 1 ao buscar
              }}
              className="pl-10 w-64"
              data-testid="input-search-units"
            />
          </div>
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
              {visibleColumns.includes("Nome") && <TableHead className="w-[200px] bg-accent">Nome</TableHead>}
              {visibleColumns.includes("Endereço") && <TableHead className="w-[250px] bg-accent">Endereço</TableHead>}
              {visibleColumns.includes("Telefone") && <TableHead className="w-[140px] bg-accent">Telefone</TableHead>}
              {visibleColumns.includes("Serviços") && <TableHead className="w-[200px] bg-accent">Serviços</TableHead>}
              {visibleColumns.includes("Status") && <TableHead className="w-[100px] bg-accent">Status</TableHead>}
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
            ) : displayUnits?.length ? (
              displayUnits.map((unit: any) => (
                <TableRow key={unit.id} className="bg-accent hover:bg-accent/80">
                  {visibleColumns.includes("Nome") && (
                    <TableCell className="font-medium whitespace-nowrap bg-accent" data-testid={`unit-name-${unit.id}`}>
                      {unit.name}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Endereço") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      {unit.address || "Não informado"}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Telefone") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      {unit.phone || "Não informado"}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Serviços") && (
                    <TableCell className="bg-accent">
                      {unit.services && unit.services.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {unit.services.slice(0, 2).map((service: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {unit.services.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{unit.services.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        "Não informado"
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Status") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      <Switch
                        checked={unit.isActive}
                        onCheckedChange={() => handleToggleStatus(unit.id, unit.isActive)}
                        disabled={toggleUnitMutation.isPending}
                        data-testid={`switch-unit-status-${unit.id}`}
                      />
                    </TableCell>
                  )}
                  {visibleColumns.includes("Ações") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      <div className="flex items-center space-x-1">
                        {unit.urlSlug && unit.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            data-testid={`button-access-unit-${unit.id}`}
                            title={`Acessar página da unidade: ${unit.name}`}
                          >
                            <a href={`/${unit.urlSlug}`} target="_blank" rel="noopener noreferrer">
                              <Globe className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(unit)}
                          data-testid={`button-view-${unit.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {unit.googleMapsUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            data-testid={`button-maps-${unit.id}`}
                          >
                            <a href={unit.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/rede/${unit.id}/editar`)}
                          data-testid={`button-edit-${unit.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(unit.id, unit.name)}
                          disabled={deleteUnitMutation.isPending}
                          data-testid={`button-delete-${unit.id}`}
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
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? "Nenhuma unidade encontrada." 
                      : "Nenhuma unidade cadastrada ainda."
                    }
                  </p>
                  {!searchQuery && (
                    <Button 
                      className="btn-primary"
                      onClick={() => setLocation("/rede/novo")}
                      data-testid="button-add-first-unit"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Primeira Unidade
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {totalUnits > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <div className="flex items-center text-sm text-muted-foreground">
              <span>
                Mostrando {Math.min((currentPage - 1) * pageSize + 1, totalUnits)} até{" "}
                {Math.min(currentPage * pageSize, totalUnits)} de {totalUnits} unidade{totalUnits !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
                data-testid="button-previous-page"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="flex items-center text-sm font-medium">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                data-testid="button-next-page"
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span>Detalhes da Unidade</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedUnit && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Informações Básicas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Nome:</strong> <span className="text-foreground">{selectedUnit.name}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Endereço:</strong> <span className="text-foreground">{selectedUnit.address}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Telefone:</strong> <span className="text-foreground">{selectedUnit.phone}</span></span>
                    </div>
                    {selectedUnit.whatsapp && (
                      <div className="flex items-center space-x-2">
                        <span><strong className="text-primary">WhatsApp:</strong> <span className="text-foreground">{selectedUnit.whatsapp}</span></span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Status:</strong> <span className="text-foreground">{selectedUnit.isActive ? "Ativo" : "Inativo"}</span></span>
                    </div>
                  </div>
                </div>

                {/* Botão Copiar Informações */}
                <div>
                  <Button
                    variant="default"
                    onClick={handleCopyToClipboard}
                    className="w-full"
                    data-testid="button-copy-unit-details"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Informações
                  </Button>
                </div>

                {selectedUnit.services && selectedUnit.services.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Serviços Oferecidos</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUnit.services.map((service: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedUnit.googleMapsUrl && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Localização</h4>
                  <Button
                    variant="default"
                    asChild
                    className="w-full"
                  >
                    <a href={selectedUnit.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver no Google Maps
                    </a>
                  </Button>
                </div>
              )}
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
