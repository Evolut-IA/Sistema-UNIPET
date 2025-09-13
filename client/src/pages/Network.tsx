import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
import { Plus, Search, Edit, Trash2, Building2, ExternalLink, Phone, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Network() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const filteredUnits = units?.filter((unit: any) =>
    unit.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover esta unidade?")) {
      deleteUnitMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleUnitMutation.mutate({ id, isActive: !currentStatus });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rede Credenciada</h1>
          <p className="text-muted-foreground">Gerencie as unidades credenciadas</p>
        </div>
        <Button 
          className="btn-primary"
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
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
      <div className="space-y-4">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredUnits?.length ? (
          filteredUnits.map((unit: any) => (
            <Card key={unit.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Building2 className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-semibold text-foreground" data-testid={`unit-name-${unit.id}`}>
                        {unit.name}
                      </h3>
                      <Badge variant={unit.isActive ? "default" : "secondary"}>
                        {unit.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{unit.address}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{unit.phone}</span>
                      </div>
                    </div>

                    {unit.services && unit.services.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-foreground mb-2">Serviços oferecidos:</p>
                        <div className="flex flex-wrap gap-1">
                          {unit.services.slice(0, 5).map((service: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {unit.services.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{unit.services.length - 5} mais
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={unit.isActive}
                        onCheckedChange={() => handleToggleStatus(unit.id, unit.isActive)}
                        disabled={toggleUnitMutation.isPending}
                        data-testid={`switch-unit-status-${unit.id}`}
                      />
                      <span className="text-sm text-muted-foreground">
                        {unit.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    <div className="flex space-x-2">
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
                        onClick={() => handleDelete(unit.id)}
                        disabled={deleteUnitMutation.isPending}
                        data-testid={`button-delete-${unit.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "Nenhuma unidade encontrada para a busca." 
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

    </div>
  );
}
