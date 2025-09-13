import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Clients() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: clients, isLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
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

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este cliente?")) {
      deleteClientMutation.mutate(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-titulo">Clientes & Pets</h1>
          <p className="text-subtitulo">Gerencie clientes e seus pets</p>
        </div>
        <Button 
          className="btn-primary"
          onClick={() => setLocation("/clients/new")}
          data-testid="button-new-client"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
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
          <CardTitle className="text-titulo">
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
            <div className="space-y-4">
              {displayClients.map((client: any) => (
                <div key={client.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-titulo text-lg" data-testid={`client-name-${client.id}`}>
                        {client.fullName}
                      </h3>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-subtitulo">
                        <p><span className="font-medium">Email:</span> {client.email || "Não informado"}</p>
                        <p><span className="font-medium">Telefone:</span> {client.phone}</p>
                        <p><span className="font-medium">CPF:</span> {client.cpf}</p>
                        <p><span className="font-medium">Cidade:</span> {client.city || "Não informado"}</p>
                        <p><span className="font-medium">Estado:</span> {client.state || "Não informado"}</p>
                        <p><span className="font-medium">Cadastrado:</span> {client.createdAt && format(new Date(client.createdAt), "dd/MM/yyyy", { locale: ptBR })}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/clients/${client.id}/pets/new`)}
                        data-testid={`button-add-pet-${client.id}`}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar Pet
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/clients/${client.id}/edit`)}
                        data-testid={`button-edit-${client.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(client.id)}
                        disabled={deleteClientMutation.isPending}
                        data-testid={`button-delete-${client.id}`}
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
              <p className="text-subtitulo">
                {searchQuery.length > 2 ? "Nenhum cliente encontrado para a busca." : "Nenhum cliente cadastrado ainda."}
              </p>
              {searchQuery.length <= 2 && (
                <Button 
                  className="mt-4"
                  onClick={() => setLocation("/clients/new")}
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
    </div>
  );
}
