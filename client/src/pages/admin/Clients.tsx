import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
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
import { useLocation } from "wouter";
import type { Client, Pet } from "@shared/schema";
import { Plus, Search, Edit, Trash2, Eye, Copy, FileText, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

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
import { apiRequest } from "@/lib/admin/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { useConfirmDialog } from "@/hooks/admin/use-confirm-dialog";
import { PasswordDialog } from "@/components/admin/ui/password-dialog";
import { usePasswordDialog } from "@/hooks/admin/use-password-dialog";
import { useColumnPreferences } from "@/hooks/admin/use-column-preferences";

const allColumns = [
  "Nome",
  "Telefone",
  "Email",
  "Ações",
] as const;

export default function Clients() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { visibleColumns, toggleColumn } = useColumnPreferences('clients.columns', allColumns);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const confirmDialog = useConfirmDialog();
  const passwordDialog = usePasswordDialog();

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/admin/api/clients"],
  });

  // Query para buscar pets do cliente selecionado
  const { data: clientPets = [], isLoading: petsLoading } = useQuery<Pet[]>({
    queryKey: ["/admin/api/clients", selectedClient?.id, "pets"],
    enabled: !!selectedClient?.id,
  });

  const { data: searchResults = [], isLoading: searchLoading } = useQuery<Client[]>({
    queryKey: ["/admin/api/clients/search", searchQuery],
    enabled: searchQuery.length > 2,
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/admin/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/clients"] });
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

  const filteredClients = searchQuery.length > 2 ? searchResults : clients;
  const totalClients = filteredClients.length;
  const totalPages = Math.ceil(totalClients / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayClients = filteredClients.slice(startIndex, endIndex);


  const handleDelete = (id: string, clientName: string) => {
    passwordDialog.openDialog({
      title: "Verificação de Senha",
      description: "Digite a senha do administrador para excluir este cliente:",
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

  const handleViewDetails = (client: Client) => {
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
      
      clientPets.forEach((pet: Pet, index: number) => {
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
        if (pet.vaccineData && Array.isArray(pet.vaccineData) && pet.vaccineData.length > 0) {
          text += `  \n  Vacinas:\n`;
          pet.vaccineData.forEach((vaccine: { vaccine: string; date: string }) => {
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
      </div>

      {/* Filters and Column Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF, email ou telefone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset para página 1 ao buscar
              }}
              className="pl-10 w-80"
              data-testid="input-search-clients"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            className="btn-primary"
            size="sm"
            onClick={() => setLocation("/clientes/novo")}
            data-testid="button-new-client"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
          
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
              {visibleColumns.includes("Nome") && <TableHead className="w-[200px] bg-accent">Nome</TableHead>}
              {visibleColumns.includes("Telefone") && <TableHead className="w-[140px] bg-accent">Telefone</TableHead>}
              {visibleColumns.includes("Email") && <TableHead className="w-[180px] bg-accent">Email</TableHead>}
              {visibleColumns.includes("CPF") && <TableHead className="w-[120px] bg-accent">CPF</TableHead>}
              {visibleColumns.includes("Cidade") && <TableHead className="w-[120px] bg-accent">Cidade</TableHead>}
              {visibleColumns.includes("Data") && <TableHead className="w-[120px] bg-accent">Data</TableHead>}
              {visibleColumns.includes("Ações") && <TableHead className="w-[200px] bg-accent">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || searchLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={visibleColumns.length} className="text-center py-6">
                    <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : displayClients && displayClients.length > 0 ? (
              displayClients.map((client: Client) => (
                <TableRow key={client.id} className="bg-accent">
                  {visibleColumns.includes("Nome") && (
                    <TableCell className="font-medium whitespace-nowrap bg-accent">
                      {client.fullName || client.full_name}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Telefone") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      {client.phone}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Email") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      {client.email || "Não informado"}
                    </TableCell>
                  )}
                  {visibleColumns.includes("CPF") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      {client.cpf}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Cidade") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      {client.city || "Não informado"}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Data") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      {client.createdAt && format(new Date(client.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Ações") && (
                    <TableCell className="whitespace-nowrap bg-accent">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(client)}
                          data-testid={`button-view-${client.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/clientes/${client.id}/pets/novo`)}
                          data-testid={`button-add-pet-${client.id}`}
                        >
                          <AddPetIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/clientes/${client.id}/editar`)}
                          data-testid={`button-edit-${client.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(client.id, client.fullName || client.full_name)}
                          disabled={deleteClientMutation.isPending}
                          data-testid={`button-delete-${client.id}`}
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
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery.length > 2
                      ? "Nenhum cliente encontrado para a busca."
                      : "Nenhum cliente cadastrado ainda."
                    }
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
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>

        {/* Pagination */}
        {totalClients > 10 && (
          <div className="flex items-center justify-between px-2 py-4">
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">
                  {totalClients > 0 ? (
                    <>Mostrando {startIndex + 1} a {Math.min(endIndex, totalClients)} de {totalClients} clientes</>
                  ) : (
                    "Nenhum cliente encontrado"
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium">
                  Página {currentPage} de {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
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
              <Eye className="h-5 w-5 text-primary" />
              <span>Detalhes do Cliente</span>
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
          
          {selectedClient && (
            <div 
              className="space-y-4 overflow-y-auto flex-1 pr-2" 
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'hsl(var(--muted-foreground)) hsl(var(--muted))'
              }}
            >
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Informações Pessoais</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Nome Completo:</strong> <span className="text-foreground">{selectedClient.fullName}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Email:</strong> <span className="text-foreground">{selectedClient.email || "Não informado"}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Telefone:</strong> <span className="text-foreground">{selectedClient.phone}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">CPF:</strong> <span className="text-foreground">{selectedClient.cpf}</span></span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Informações de Localização</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Cidade:</strong> <span className="text-foreground">{selectedClient.city || "Não informado"}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Estado:</strong> <span className="text-foreground">{selectedClient.state || "Não informado"}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">CEP:</strong> <span className="text-foreground">{selectedClient.cep || "Não informado"}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Endereço:</strong> <span className="text-foreground">{selectedClient.address || "Não informado"}</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Informações do Cadastro</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span><strong className="text-primary">Data de Cadastro:</strong> <span className="text-foreground">{selectedClient.createdAt && format(new Date(selectedClient.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span></span>
                  </div>
                  {selectedClient.updatedAt && (
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Última Atualização:</strong> <span className="text-foreground">{format(new Date(selectedClient.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span></span>
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
                            <span><strong className="text-primary">Nome:</strong> <span className="text-foreground">{pet.name}</span></span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span><strong className="text-primary">Espécie:</strong> <span className="text-foreground">{pet.species}</span></span>
                          </div>
                          {pet.breed && (
                            <div className="flex items-center space-x-2">
                              <span><strong className="text-primary">Raça:</strong> <span className="text-foreground">{pet.breed}</span></span>
                            </div>
                          )}
                          {pet.age && (
                            <div className="flex items-center space-x-2">
                              <span><strong className="text-primary">Idade:</strong> <span className="text-foreground">{pet.age}</span></span>
                            </div>
                          )}
                          {pet.sex && (
                            <div className="flex items-center space-x-2">
                              <span><strong className="text-primary">Sexo:</strong> <span className="text-foreground">{pet.sex}</span></span>
                            </div>
                          )}
                          {pet.color && (
                            <div className="flex items-center space-x-2">
                              <span><strong className="text-primary">Cor:</strong> <span className="text-foreground">{pet.color}</span></span>
                            </div>
                          )}
                          {pet.weight && (
                            <div className="flex items-center space-x-2">
                              <span><strong className="text-primary">Peso:</strong> <span className="text-foreground">{pet.weight}kg</span></span>
                            </div>
                          )}
                          {pet.birthDate && (
                            <div className="flex items-center space-x-2">
                              <span><strong className="text-primary">Data de Nascimento:</strong> <span className="text-foreground">{format(new Date(pet.birthDate), "dd/MM/yyyy", { locale: ptBR })}</span></span>
                            </div>
                          )}
                          {pet.castrated !== null && (
                            <div className="flex items-center space-x-2">
                              <span><strong className="text-primary">Castrado:</strong> <span className="text-foreground">{pet.castrated ? "Sim" : "Não"}</span></span>
                            </div>
                          )}
                          {pet.microchip && (
                            <div className="flex items-center space-x-2">
                              <span><strong className="text-primary">Microchip:</strong> <span className="text-foreground">{pet.microchip}</span></span>
                            </div>
                          )}
                          {pet.lastCheckup && (
                            <div className="flex items-center space-x-2">
                              <span><strong className="text-primary">Último Check-up:</strong> <span className="text-foreground">{format(new Date(pet.lastCheckup), "dd/MM/yyyy", { locale: ptBR })}</span></span>
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
                                  <span><strong className="text-primary">Doenças Anteriores:</strong> <span className="text-foreground">{pet.previousDiseases}</span></span>
                                </div>
                              )}
                              {pet.surgeries && (
                                <div className="flex items-start space-x-2">
                                  <span><strong className="text-primary">Cirurgias:</strong> <span className="text-foreground">{pet.surgeries}</span></span>
                                </div>
                              )}
                              {pet.allergies && (
                                <div className="flex items-start space-x-2">
                                  <span><strong className="text-primary">Alergias:</strong> <span className="text-foreground">{pet.allergies}</span></span>
                                </div>
                              )}
                              {pet.currentMedications && (
                                <div className="flex items-start space-x-2">
                                  <span><strong className="text-primary">Medicações Atuais:</strong> <span className="text-foreground">{pet.currentMedications}</span></span>
                                </div>
                              )}
                              {pet.hereditaryConditions && (
                                <div className="flex items-start space-x-2">
                                  <span><strong className="text-primary">Condições Hereditárias:</strong> <span className="text-foreground">{pet.hereditaryConditions}</span></span>
                                </div>
                              )}
                              {pet.parasiteTreatments && (
                                <div className="flex items-start space-x-2">
                                  <span><strong className="text-primary">Tratamentos Antiparasitários:</strong> <span className="text-foreground">{pet.parasiteTreatments}</span></span>
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
                                  <span><strong className="text-primary">{vaccine.vaccine}:</strong> <span className="text-foreground">{format(new Date(vaccine.date), "dd/MM/yyyy", { locale: ptBR })}</span></span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Botões de Ação do Pet */}
                        <div className="mt-3 pt-2 border-t border-border">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setDetailsOpen(false);
                                setLocation(`/guias/novo?clientId=${selectedClient.id}&petId=${pet.id}`);
                              }}
                              className="text-xs"
                            >
                              <FileText className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setDetailsOpen(false);
                                setLocation(`/pets/${pet.id}/editar`);
                              }}
                              className="text-xs"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
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