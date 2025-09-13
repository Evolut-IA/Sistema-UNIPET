import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertGuideSchema } from "@shared/schema";
import { ArrowLeft, Search } from "lucide-react";
import { GUIDE_TYPES } from "@/lib/constants";

export default function GuideForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedPet, setSelectedPet] = useState<any>(null);

  const isEdit = Boolean(params.id);

  const { data: guide, isLoading: guideLoading } = useQuery({
    queryKey: ["/api/guides", params.id],
    enabled: isEdit,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["/api/clients/search", clientSearch],
    enabled: clientSearch.length > 2,
  });

  const { data: pets, isLoading: petsLoading } = useQuery({
    queryKey: ["/api/clients", selectedClient?.id, "pets"],
    enabled: Boolean(selectedClient?.id),
  });

  const { data: plans } = useQuery({
    queryKey: ["/api/plans/active"],
  });

  const form = useForm({
    resolver: zodResolver(insertGuideSchema),
    defaultValues: {
      clientId: "",
      petId: "",
      type: "",
      procedure: "",
      procedureNotes: "",
      generalNotes: "",
      value: "",
      status: "open",
    },
  });

  useEffect(() => {
    if (guide) {
      form.reset({
        clientId: guide.clientId || "",
        petId: guide.petId || "",
        type: guide.type || "",
        procedure: guide.procedure || "",
        procedureNotes: guide.procedureNotes || "",
        generalNotes: guide.generalNotes || "",
        value: guide.value || "",
        status: guide.status || "open",
      });
    }
  }, [guide, form]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEdit) {
        await apiRequest("PUT", `/api/guides/${params.id}`, data);
      } else {
        await apiRequest("POST", "/api/guides", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guides"] });
      toast({
        title: isEdit ? "Guia atualizada" : "Guia criada",
        description: isEdit ? "Guia foi atualizada com sucesso." : "Guia foi criada com sucesso.",
      });
      setLocation("/guias");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: isEdit ? "Falha ao atualizar guia." : "Falha ao criar guia.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (!selectedClient || !selectedPet) {
      toast({
        title: "Erro",
        description: "Selecione um cliente e um pet.",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({
      ...data,
      clientId: selectedClient.id,
      petId: selectedPet.id,
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "consulta": return "Guia de Consulta";
      case "exames": return "Guia de Exames";
      case "internacao": return "Guia de Internação";
      case "reembolso": return "Guia de Reembolso";
      default: return type;
    }
  };

  if (isEdit && guideLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => setLocation("/guias")}
          data-testid="button-back-to-guides"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEdit ? "Editar Guia" : "Nova Guia"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? "Atualize as informações da guia" : "Crie uma nova guia de atendimento"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Client and Pet Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Seleção de Cliente e Pet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Client Search */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Buscar Cliente (CPF, Nome, Email ou Telefone)
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Digite para buscar cliente..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-client"
                  />
                </div>
                
                {searchLoading && (
                  <p className="text-sm text-muted-foreground mt-2">Buscando...</p>
                )}
                
                {searchResults && searchResults.length > 0 && (
                  <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                    {searchResults.map((client: any) => (
                      <button
                        key={client.id}
                        type="button"
                        className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                        onClick={() => {
                          setSelectedClient(client);
                          setClientSearch(client.fullName);
                          setSelectedPet(null);
                        }}
                        data-testid={`button-select-client-${client.id}`}
                      >
                        <p className="font-medium text-foreground">{client.fullName}</p>
                        <p className="text-sm text-muted-foreground">{client.cpf} - {client.phone}</p>
                      </button>
                    ))}
                  </div>
                )}
                
                {selectedClient && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-medium text-green-800">Cliente selecionado:</p>
                    <p className="text-green-700">{selectedClient.fullName} - {selectedClient.cpf}</p>
                  </div>
                )}
              </div>

              {/* Pet Selection */}
              {selectedClient && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Selecionar Pet
                  </label>
                  {petsLoading ? (
                    <p className="text-sm text-muted-foreground">Carregando pets...</p>
                  ) : pets && pets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pets.map((pet: any) => (
                        <button
                          key={pet.id}
                          type="button"
                          className={`p-3 border rounded-lg text-left transition-colors ${
                            selectedPet?.id === pet.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedPet(pet)}
                          data-testid={`button-select-pet-${pet.id}`}
                        >
                          <p className="font-medium text-foreground">{pet.name}</p>
                          <p className="text-sm text-muted-foreground">{pet.species} - {pet.breed}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Este cliente não possui pets cadastrados.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guide Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Informações da Guia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Guia *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-guide-type">
                            <SelectValue placeholder="Selecione o tipo de guia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GUIDE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {getTypeLabel(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="procedure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Procedimento *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Descreva o procedimento" data-testid="input-procedure" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00"
                          data-testid="input-value" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="open">Aberta</SelectItem>
                          <SelectItem value="closed">Fechada</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="procedureNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anotações sobre o Procedimento</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Observações específicas sobre o procedimento..."
                          data-testid="textarea-procedure-notes" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="generalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anotações Gerais</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Observações gerais sobre a guia..."
                          data-testid="textarea-general-notes" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/guias")}
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="btn-primary"
              disabled={mutation.isPending || !selectedClient || !selectedPet}
              data-testid="button-save"
            >
              {mutation.isPending ? "Salvando..." : isEdit ? "Atualizar" : "Criar Guia"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
