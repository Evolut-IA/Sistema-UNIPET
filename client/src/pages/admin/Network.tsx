import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { Switch } from "@/components/admin/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
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
import { Plus, Search, Edit, Trash2, Building, ExternalLink, Eye, Copy, Globe, MoreHorizontal, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/admin/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { useConfirmDialog } from "@/hooks/admin/use-confirm-dialog";
import { PasswordDialog } from "@/components/admin/ui/password-dialog";
import { usePasswordDialog } from "@/hooks/admin/use-password-dialog";
import { useColumnPreferences } from "@/hooks/admin/use-column-preferences";
import type { NetworkUnit } from "@shared/schema";

const allColumns = [
  "Nome",
  "Telefone",
  "Status",
  "Ações",
] as const;

export default function Network() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<NetworkUnit | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied'>('idle');
  const [location, setLocation] = useLocation();
  const { visibleColumns, toggleColumn } = useColumnPreferences('network.columns', allColumns);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const confirmDialog = useConfirmDialog();
  const passwordDialog = usePasswordDialog();

  const { data: units, isLoading } = useQuery<NetworkUnit[]>({
    queryKey: ["/admin/api/network-units"],
  });

  const deleteUnitMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/admin/api/network-units/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/network-units"] });
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
      await apiRequest("PUT", `/admin/api/network-units/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/network-units"] });
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

  const filteredUnits = Array.isArray(units) ? units.filter((unit: NetworkUnit) =>
    unit.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.address?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];
  
  const totalUnits = filteredUnits.length;
  const totalPages = Math.ceil(totalUnits / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayUnits = filteredUnits.slice(startIndex, endIndex);


  const handleDelete = (id: string, unitName: string) => {
    passwordDialog.openDialog({
      title: "Verificação de Senha",
      description: "Digite a senha do administrador para excluir esta unidade:",
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

  const handleViewDetails = (unit: NetworkUnit) => {
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
    if (selectedUnit.services && Array.isArray(selectedUnit.services) && selectedUnit.services.length > 0) {
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
    if (copyState !== 'idle') return;
    
    try {
      setCopyState('copying');
      const text = generateUnitText();
      await navigator.clipboard.writeText(text);
      
      setCopyState('copied');
      
      setTimeout(() => {
        setCopyState('idle');
      }, 2000);
    } catch (error) {
      setCopyState('idle');
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

        <div className="flex gap-2">
          <Button 
            variant="admin-action"
            size="sm"
            onClick={() => setLocation("/rede/novo")}
            data-testid="button-new-unit"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                style={{
                  borderColor: 'var(--border-gray)',
                  background: 'white'
                }}
              >
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {allColumns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={visibleColumns.includes(col)}
                  onCheckedChange={() => toggleColumn(col)}
                  className="mb-1"
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
            ) : displayUnits && displayUnits.length > 0 ? (
              displayUnits.map((unit: NetworkUnit) => (
                <TableRow key={unit.id} className="bg-accent">
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
                      {unit.services && Array.isArray(unit.services) && unit.services.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {unit.services.slice(0, 2).map((service: string, index: number) => (
                            <Badge key={index} variant="neutral" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {unit.services.length > 2 && (
                            <Badge variant="neutral" className="text-xs">
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
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? "Nenhuma unidade encontrada." 
                      : "Nenhuma unidade cadastrada ainda."
                    }
                  </p>
                  {!searchQuery && (
                    <Button 
                      variant="outline"
                      size="sm"
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
        {totalUnits > 10 && (
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
        <DialogContent hideCloseButton>
          <DialogHeader className="flex flex-row items-center justify-between pr-2">
            <DialogTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-primary" />
              <span>Detalhes da Unidade</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleCopyToClipboard}
                disabled={copyState === 'copying'}
                className={`gap-2 h-8 transition-all duration-300 ${
                  copyState === 'copied' ? 'bg-[#e6f4f4] border-[#277677] text-[#277677]' : ''
                }`}
                data-testid="button-copy-details"
              >
                {copyState === 'copying' && <Loader2 className="h-4 w-4 animate-spin" />}
                {copyState === 'copied' && <Check className="h-4 w-4" />}
                {copyState === 'idle' && <Copy className="h-4 w-4" />}
                {copyState === 'copying' ? 'Copiando...' : copyState === 'copied' ? 'Copiado!' : 'Copiar'}
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


                {selectedUnit.services && Array.isArray(selectedUnit.services) && selectedUnit.services.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Serviços Oferecidos</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUnit.services.map((service: string, index: number) => (
                        <Badge key={index} variant="neutral">
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
                    variant="outline"
                    size="sm"
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
