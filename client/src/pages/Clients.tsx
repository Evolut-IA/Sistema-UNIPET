import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";
import type { Client } from "@shared/schema";
import { Plus, Search, Edit, Trash2, Eye, Copy } from "lucide-react";

// Componente do ícone de adicionar pet
const AddPetIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    height="24px" 
    viewBox="0 -960 960 960" 
    width="24px" 
    fill="currentColor"
    className={className}
  >
    <path d="M180-475q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Zm180-160q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Zm240 0q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Zm180 160q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM266-75q-45 0-75.5-34.5T160-191q0-52 35.5-91t70.5-77q29-31 50-67.5t50-68.5q22-26 51-43t63-17q34 0 63 16t51 42q28 32 49.5 69t50.5 69q35 38 70.5 77t35.5 91q0 47-30.5 81.5T694-75q-54 0-107-9t-107-9q-54 0-107 9t-107 9Z"/>
  </svg>
);
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { PasswordDialog } from "@/components/ui/password-dialog";
import { usePasswordDialog } from "@/hooks/use-password-dialog";

export default function Clients() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const confirmDialog = useConfirmDialog();
  const passwordDialog = usePasswordDialog();

  const { data: clients = [], isLoading, isError: clientsError } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Query para buscar pets do cliente selecionado
  const { data: clientPets = [], isLoading: petsLoading } = useQuery<any[]>({
    queryKey: ["/api/clients", selectedClient?.id, "pets"],
    enabled: !!selectedClient?.id,
  });

  const { data: searchResults = [], isLoading: searchLoading, isError: searchError } = useQuery<Client[]>({
    queryKey: ["/api/clients/search", searchQuery],
    enabled: searchQuery.length > 2,
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Cliente removido",
        description: "Cliente foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover cliente.",
        variant: "destructive",
      });
    },
  });

  const displayClients = searchQuery.length > 2 ? searchResults : clients;

  const handleDelete = (id: string, clientName: string) => {
    passwordDialog.openDialog({
      title: "Verificação de Senha",
      description: "Digite a senha do administrador para excluir este cliente:",
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
              title: "Excluir Cliente",
              description: `Tem certeza que deseja excluir o cliente "${clientName}"? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.`,
              confirmText: "Excluir Cliente",
              cancelText: "Cancelar",
              onConfirm: () => {
                confirmDialog.setLoading(true);
                deleteClientMutation.mutate(id, {
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

  const handleViewDetails = (client: any) => {
    setSelectedClient(client);
    setDetailsOpen(true);
  };

  const generateClientText = () => {
    if (!selectedClient) return "";

    let text = "";
    
    // Cabeçalho
    text += "=".repeat(50) + "\n";
    text += "INFORMAÇÕES DO CLIENTE\n";
    text += "=".repeat(50) + "\n\n";

    // Informações Pessoais
    text += "INFORMAÇÕES PESSOAIS:\n";
    text += "-".repeat(25) + "\n";
    text += `Nome Completo: ${selectedClient.fullName}\n`;
    text += `Email: ${selectedClient.email || "Não informado"}\n`;
    text += `Telefone: ${selectedClient.phone}\n`;
    text += `CPF: ${selectedClient.cpf}\n\n`;

    // Informações de Localização
    text += "INFORMAÇÕES DE LOCALIZAÇÃO:\n";
    text += "-".repeat(30) + "\n";
    text += `Cidade: ${selectedClient.city || "Não informado"}\n`;
    text += `Estado: ${selectedClient.state || "Não informado"}\n`;
    text += `CEP: ${selectedClient.cep || "Não informado"}\n`;
    text += `Endereço: ${selectedClient.address || "Não informado"}\n\n`;

    // Informações do Cadastro
    text += "INFORMAÇÕES DO CADASTRO:\n";
    text += "-".repeat(25) + "\n";
    text += `Data de Cadastro: ${selectedClient.createdAt ? format(new Date(selectedClient.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "Não informado"}\n`;
    if (selectedClient.updatedAt) {
      text += `Última Atualização: ${format(new Date(selectedClient.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}\n`;
    }
    text += "\n";

    // Pets do Cliente
    if (clientPets && clientPets.length > 0) {
      text += "PETS DO CLIENTE:\n";
      text += "-".repeat(20) + "\n";
      
      clientPets.forEach((pet: any, index: number) => {
        text += `\nPet ${index + 1}:\n`;
        text += `  Nome: ${pet.name}\n`;
        text += `  Espécie: ${pet.species}\n`;
        if (pet.breed) text += `  Raça: ${pet.breed}\n`;
        if (pet.age) text += `  Idade: ${pet.age}\n`;
        if (pet.sex) text += `  Sexo: ${pet.sex}\n`;
        if (pet.color) text += `  Cor: ${pet.color}\n`;
        if (pet.weight) text += `  Peso: ${pet.weight}kg\n`;
        if (pet.birthDate) text += `  Data de Nascimento: ${format(new Date(pet.birthDate), "dd/MM/yyyy", { locale: ptBR })}\n`;
        if (pet.castrated !== null) text += `  Castrado: ${pet.castrated ? "Sim" : "Não"}\n`;
        if (pet.microchip) text += `  Microchip: ${pet.microchip}\n`;
        if (pet.lastCheckup) text += `  Último Check-up: ${format(new Date(pet.lastCheckup), "dd/MM/yyyy", { locale: ptBR })}\n`;
        
        // Informações de Saúde
        if (pet.previousDiseases || pet.surgeries || pet.allergies || pet.currentMedications || pet.hereditaryConditions || pet.parasiteTreatments) {
          text += `  \n  Informações de Saúde:\n`;
          if (pet.previousDiseases) text += `    Doenças Anteriores: ${pet.previousDiseases}\n`;
          if (pet.surgeries) text += `    Cirurgias: ${pet.surgeries}\n`;
          if (pet.allergies) text += `    Alergias: ${pet.allergies}\n`;
          if (pet.currentMedications) text += `    Medicações Atuais: ${pet.currentMedications}\n`;
          if (pet.hereditaryConditions) text += `    Condições Hereditárias: ${pet.hereditaryConditions}\n`;
          if (pet.parasiteTreatments) text += `    Tratamentos Antiparasitários: ${pet.parasiteTreatments}\n`;
        }
        
        // Vacinas
        if (pet.vaccineData && pet.vaccineData.length > 0) {
          text += `  \n  Vacinas:\n`;
          pet.vaccineData.forEach((vaccine: any) => {
            text += `    ${vaccine.vaccine}: ${format(new Date(vaccine.date), "dd/MM/yyyy", { locale: ptBR })}\n`;
          });
        }
      });
    } else {
      text += "PETS DO CLIENTE:\n";
      text += "-".repeat(20) + "\n";
      text += "Nenhum pet cadastrado para este cliente.\n";
    }

    text += "\n" + "=".repeat(50) + "\n";
    text += `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}\n`;
    text += "=".repeat(50);

    return text;
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = generateClientText();
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Informações do cliente copiadas para a área de transferência.",
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">Clientes & Pets</h1>
          <p className="text-sm text-muted-foreground">Gerencie clientes e seus pets</p>
        </div>
        <Button 
          className="btn-primary w-full sm:w-auto"
          onClick={() => setLocation("/clientes/novo")}
          data-testid="button-new-client"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, CPF, email ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-clients"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">
            {searchQuery.length > 2 ? "Resultados da Busca" : "Todos os Clientes"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || searchLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : displayClients?.length ? (
            <div className="space-y-2">
              {displayClients.map((client: any) => (
                <div key={client.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Nome do Cliente */}
                      <div className="mb-2">
                        <h3 className="font-semibold text-foreground break-words" data-testid={`client-name-${client.id}`}>
                          {client.fullName}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Botões em linha horizontal */}
                    <div className="flex items-center space-x-1 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(client)}
                        data-testid={`button-view-${client.id}`}
                        className="text-xs"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClient(client);
                          handleCopyToClipboard();
                        }}
                        data-testid={`button-copy-${client.id}`}
                        className="text-xs"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/clientes/${client.id}/pets/novo`)}
                        data-testid={`button-add-pet-${client.id}`}
                        className="text-xs"
                      >
                        <AddPetIcon className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/clientes/${client.id}/editar`)}
                        data-testid={`button-edit-${client.id}`}
                        className="text-xs"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(client.id, client.fullName)}
                        disabled={deleteClientMutation.isPending}
                        data-testid={`button-delete-${client.id}`}
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
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery.length > 2 ? "Nenhum cliente encontrado para a busca." : "Nenhum cliente cadastrado ainda."}
              </p>
              {searchQuery.length <= 2 && (
                <Button 
                  className="mt-4"
                  onClick={() => setLocation("/clientes/novo")}
                  data-testid="button-add-first-client"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Cliente
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-primary" />
              <span>Detalhes do Cliente</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedClient && (
            <div 
              className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar no-rounded-scrollbar" 
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#6b7280 #e5e7eb'
              }}
            >
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Informações Pessoais</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span><strong>Nome Completo:</strong> {selectedClient.fullName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong>Email:</strong> {selectedClient.email || "Não informado"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong>Telefone:</strong> {selectedClient.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong>CPF:</strong> {selectedClient.cpf}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Informações de Localização</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span><strong>Cidade:</strong> {selectedClient.city || "Não informado"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong>Estado:</strong> {selectedClient.state || "Não informado"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong>CEP:</strong> {selectedClient.cep || "Não informado"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong>Endereço:</strong> {selectedClient.address || "Não informado"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Informações do Cadastro</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span><strong>Data de Cadastro:</strong> {selectedClient.createdAt && format(new Date(selectedClient.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                  </div>
                  {selectedClient.updatedAt && (
                    <div className="flex items-center space-x-2">
                      <span><strong>Última Atualização:</strong> {format(new Date(selectedClient.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Seção de Pets */}
              <div>
                <h4 className="font-semibold text-foreground mb-2">Pets do Cliente</h4>
                {petsLoading ? (
                  <div className="text-sm text-muted-foreground">Carregando pets...</div>
                ) : clientPets && clientPets.length > 0 ? (
                  <div className="space-y-2">
                    {clientPets.map((pet: any) => (
                      <div key={pet.id} className="border rounded-lg p-3 bg-muted/30">
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          {/* Informações Básicas */}
                          <div className="flex items-center space-x-2">
                            <span><strong>Nome:</strong> {pet.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span><strong>Espécie:</strong> {pet.species}</span>
                          </div>
                          {pet.breed && (
                            <div className="flex items-center space-x-2">
                              <span><strong>Raça:</strong> {pet.breed}</span>
                            </div>
                          )}
                          {pet.age && (
                            <div className="flex items-center space-x-2">
                              <span><strong>Idade:</strong> {pet.age}</span>
                            </div>
                          )}
                          {pet.sex && (
                            <div className="flex items-center space-x-2">
                              <span><strong>Sexo:</strong> {pet.sex}</span>
                            </div>
                          )}
                          {pet.color && (
                            <div className="flex items-center space-x-2">
                              <span><strong>Cor:</strong> {pet.color}</span>
                            </div>
                          )}
                          {pet.weight && (
                            <div className="flex items-center space-x-2">
                              <span><strong>Peso:</strong> {pet.weight}kg</span>
                            </div>
                          )}
                          {pet.birthDate && (
                            <div className="flex items-center space-x-2">
                              <span><strong>Data de Nascimento:</strong> {format(new Date(pet.birthDate), "dd/MM/yyyy", { locale: ptBR })}</span>
                            </div>
                          )}
                          {pet.castrated !== null && (
                            <div className="flex items-center space-x-2">
                              <span><strong>Castrado:</strong> {pet.castrated ? "Sim" : "Não"}</span>
                            </div>
                          )}
                          {pet.microchip && (
                            <div className="flex items-center space-x-2">
                              <span><strong>Microchip:</strong> {pet.microchip}</span>
                            </div>
                          )}
                          {pet.lastCheckup && (
                            <div className="flex items-center space-x-2">
                              <span><strong>Último Check-up:</strong> {format(new Date(pet.lastCheckup), "dd/MM/yyyy", { locale: ptBR })}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Informações de Saúde */}
                        {(pet.previousDiseases || pet.surgeries || pet.allergies || pet.currentMedications || pet.hereditaryConditions || pet.parasiteTreatments) && (
                          <div className="mt-3 pt-2 border-t border-border">
                            <h5 className="font-medium text-foreground mb-2">Informações de Saúde</h5>
                            <div className="grid grid-cols-1 gap-2 text-sm">
                              {pet.previousDiseases && (
                                <div className="flex items-start space-x-2">
                                  <span><strong>Doenças Anteriores:</strong> {pet.previousDiseases}</span>
                                </div>
                              )}
                              {pet.surgeries && (
                                <div className="flex items-start space-x-2">
                                  <span><strong>Cirurgias:</strong> {pet.surgeries}</span>
                                </div>
                              )}
                              {pet.allergies && (
                                <div className="flex items-start space-x-2">
                                  <span><strong>Alergias:</strong> {pet.allergies}</span>
                                </div>
                              )}
                              {pet.currentMedications && (
                                <div className="flex items-start space-x-2">
                                  <span><strong>Medicações Atuais:</strong> {pet.currentMedications}</span>
                                </div>
                              )}
                              {pet.hereditaryConditions && (
                                <div className="flex items-start space-x-2">
                                  <span><strong>Condições Hereditárias:</strong> {pet.hereditaryConditions}</span>
                                </div>
                              )}
                              {pet.parasiteTreatments && (
                                <div className="flex items-start space-x-2">
                                  <span><strong>Tratamentos Antiparasitários:</strong> {pet.parasiteTreatments}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Dados de Vacinação */}
                        {pet.vaccineData && pet.vaccineData.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-border">
                            <h5 className="font-medium text-foreground mb-2">Vacinas</h5>
                            <div className="space-y-1 text-sm">
                              {pet.vaccineData.map((vaccine: any, index: number) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <span><strong>{vaccine.vaccine}:</strong> {format(new Date(vaccine.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Nenhum pet cadastrado para este cliente.</div>
                )}
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
