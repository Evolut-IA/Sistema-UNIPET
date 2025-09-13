import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { Plus, Search, Edit, Trash2, FileText, Eye, Copy } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { PasswordDialog } from "@/components/ui/password-dialog";
import { usePasswordDialog } from "@/hooks/use-password-dialog";
import { GUIDE_TYPES } from "@/lib/constants";

export default function Guides() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const confirmDialog = useConfirmDialog();
  const passwordDialog = usePasswordDialog();

  const { data: guides, isLoading } = useQuery({
    queryKey: ["/api/guides"],
  });

  const deleteGuideMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/guides/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guides"] });
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

  const filteredGuides = guides?.filter((guide: any) => {
    const matchesSearch = guide.procedure?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || guide.status === statusFilter;
    const matchesType = typeFilter === "all" || guide.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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
      case "open": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Guias de Atendimento</h1>
          <p className="text-muted-foreground">Gerencie as guias de atendimento</p>
        </div>
        <Button 
          className="btn-primary"
          onClick={() => setLocation("/guias/novo")}
          data-testid="button-new-guide"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Guia
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por procedimento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-guides"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger data-testid="select-type-filter">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {GUIDE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="open">Abertas</SelectItem>
                <SelectItem value="closed">Fechadas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Guides List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Guias ({filteredGuides?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : filteredGuides?.length ? (
            <div className="space-y-2">
              {filteredGuides.map((guide: any) => (
                <div key={guide.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-foreground" data-testid={`guide-procedure-${guide.id}`}>
                          {guide.procedure}
                        </h3>
                        <Badge className={getStatusColor(guide.status)}>
                          {getStatusLabel(guide.status)}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <span className="font-medium">Tipo:</span>
                        <span>{getTypeLabel(guide.type)}</span>
                      </div>

                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <span className="font-medium">Valor:</span>
                        <span>R$ {parseFloat(guide.value || 0).toFixed(2)}</span>
                      </div>

                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <span className="font-medium">Criada:</span>
                        <span>{guide.createdAt && format(new Date(guide.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1 ml-3">
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchQuery || typeFilter !== "all" || statusFilter !== "all" 
                  ? "Nenhuma guia encontrada com os filtros aplicados." 
                  : "Nenhuma guia cadastrada ainda."
                }
              </p>
              {!searchQuery && typeFilter === "all" && statusFilter === "all" && (
                <Button 
                  className="btn-primary"
                  onClick={() => setLocation("/guias/novo")}
                  data-testid="button-add-first-guide"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Guia
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Detalhes da Guia</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                className="flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copiar</span>
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedGuide && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Informações Básicas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Procedimento:</strong> {selectedGuide.procedure}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong>Tipo:</strong> {getTypeLabel(selectedGuide.type)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong>Valor:</strong> R$ {parseFloat(selectedGuide.value || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong>Status:</strong></span>
                      <Badge className={getStatusColor(selectedGuide.status)}>
                        {getStatusLabel(selectedGuide.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong>Criada em:</strong> {selectedGuide.createdAt && format(new Date(selectedGuide.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Observações</h4>
                  <div className="space-y-2 text-sm">
                    {selectedGuide.procedureNotes && (
                      <div>
                        <span className="font-medium text-foreground">Observações do Procedimento:</span>
                        <p className="text-muted-foreground mt-1 p-2 bg-gray-50 rounded">
                          {selectedGuide.procedureNotes}
                        </p>
                      </div>
                    )}
                    {selectedGuide.generalNotes && (
                      <div>
                        <span className="font-medium text-foreground">Anotações Gerais:</span>
                        <p className="text-muted-foreground mt-1 p-2 bg-gray-50 rounded">
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
