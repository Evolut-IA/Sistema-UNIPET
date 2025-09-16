import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { Plus, Search, Edit, Trash2, Building2, ExternalLink, Phone, MapPin, Eye, Copy } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { PasswordDialog } from "@/components/ui/password-dialog";
import { usePasswordDialog } from "@/hooks/use-password-dialog";

export default function Network() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
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
    <div className="p-6 space-y-6">
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

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou endereço..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-units"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Units List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">
            Unidades ({filteredUnits?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredUnits?.length ? (
          filteredUnits.map((unit: any) => (
            <div key={unit.id} className="border rounded-lg p-3 hover:bg-muted/10 transition-colors">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
                  <div className="flex-1 min-w-0 flex items-center">
                    {/* Nome da Unidade */}
                    <div className="w-full">
                      <h3 className="font-semibold text-foreground break-words" data-testid={`unit-name-${unit.id}`}>
                        {unit.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto sm:ml-3">
                    {/* Switch com Badge do lado direito */}
                    <div className="flex items-center">
                      <Switch
                        checked={unit.isActive}
                        onCheckedChange={() => handleToggleStatus(unit.id, unit.isActive)}
                        disabled={toggleUnitMutation.isPending}
                        data-testid={`switch-unit-status-${unit.id}`}
                      />
                    </div>
                    
                    {/* Botões em linha horizontal */}
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleViewDetails(unit)}
                        data-testid={`button-view-${unit.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setSelectedUnit(unit);
                          handleCopyToClipboard();
                        }}
                        data-testid={`button-copy-${unit.id}`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {unit.googleMapsUrl && (
                        <Button
                          variant="default"
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
                        variant="default"
                        size="sm"
                        onClick={() => setLocation(`/rede/${unit.id}/editar`)}
                        data-testid={`button-edit-${unit.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDelete(unit.id, unit.name)}
                        disabled={deleteUnitMutation.isPending}
                        data-testid={`button-delete-${unit.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
            </div>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
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
            </CardContent>
          </Card>
        )}
        </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl">
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
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span><strong className="text-primary">Nome:</strong> <span className="text-foreground">{selectedUnit.name}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span><strong className="text-primary">Endereço:</strong> <span className="text-foreground">{selectedUnit.address}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span><strong className="text-primary">Telefone:</strong> <span className="text-foreground">{selectedUnit.phone}</span></span>
                    </div>
                    {selectedUnit.whatsapp && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span><strong className="text-primary">WhatsApp:</strong> <span className="text-foreground">{selectedUnit.whatsapp}</span></span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Status:</strong> <span className="text-foreground">{selectedUnit.isActive ? "Ativo" : "Inativo"}</span></span>
                    </div>
                  </div>
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
