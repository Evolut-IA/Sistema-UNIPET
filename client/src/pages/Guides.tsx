import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { Plus, Search, Edit, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GUIDE_TYPES } from "@/lib/constants";

export default function Guides() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover esta guia?")) {
      deleteGuideMutation.mutate(id);
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
          onClick={() => setLocation("/guides/new")}
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
            <div className="space-y-4">
              {filteredGuides.map((guide: any) => (
                <div key={guide.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground text-lg" data-testid={`guide-procedure-${guide.id}`}>
                          {guide.procedure}
                        </h3>
                        <Badge className={getStatusColor(guide.status)}>
                          {getStatusLabel(guide.status)}
                        </Badge>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <p><span className="font-medium">Tipo:</span> {getTypeLabel(guide.type)}</p>
                        <p><span className="font-medium">Valor:</span> R$ {parseFloat(guide.value || 0).toFixed(2)}</p>
                        <p><span className="font-medium">Criada em:</span> {guide.createdAt && format(new Date(guide.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                        {guide.procedureNotes && (
                          <p className="col-span-full"><span className="font-medium">Observações:</span> {guide.procedureNotes}</p>
                        )}
                        {guide.generalNotes && (
                          <p className="col-span-full"><span className="font-medium">Anotações gerais:</span> {guide.generalNotes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/guides/${guide.id}/edit`)}
                        data-testid={`button-edit-${guide.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(guide.id)}
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
                  onClick={() => setLocation("/guides/new")}
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
    </div>
  );
}
