import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputMasked } from "@/components/ui/input-masked";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertClientSchema } from "@shared/schema";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ClientForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEdit = Boolean(params.id);

  const { data: client, isLoading } = useQuery<any>({
    queryKey: ["/api/clients", params.id],
    enabled: isEdit,
  });

  const { data: pets = [], isLoading: petsLoading } = useQuery<any[]>({
    queryKey: ["/api/clients", params.id, "pets"],
    enabled: isEdit,
  });

  const form = useForm({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      cpf: "",
      cep: "",
      address: "",
      number: "",
      complement: "",
      district: "",
      state: "",
      city: "",
    },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        fullName: client.fullName || "",
        email: client.email || "",
        phone: client.phone || "",
        cpf: client.cpf || "",
        cep: client.cep || "",
        address: client.address || "",
        number: client.number || "",
        complement: client.complement || "",
        district: client.district || "",
        state: client.state || "",
        city: client.city || "",
      });
    }
  }, [client, form]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEdit) {
        await apiRequest("PUT", `/api/clients/${params.id}`, data);
      } else {
        await apiRequest("POST", "/api/clients", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: isEdit ? "Cliente atualizado" : "Cliente cadastrado",
        description: isEdit ? "Cliente foi atualizado com sucesso." : "Cliente foi cadastrado com sucesso.",
      });
      setLocation("/clientes");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: isEdit ? "Falha ao atualizar cliente." : "Falha ao cadastrar cliente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  if (isEdit && isLoading) {
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
          onClick={() => setLocation("/clientes")}
          data-testid="button-back-to-clients"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEdit ? "Editar Cliente" : "Novo Cliente"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? "Atualize as informações do cliente" : "Cadastre um novo cliente"}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-full-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <InputMasked 
                          type="email" 
                          mask="email"
                          {...field} 
                          data-testid="input-email" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular *</FormLabel>
                      <FormControl>
                        <InputMasked 
                          mask="phone"
                          {...field} 
                          data-testid="input-phone" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF *</FormLabel>
                      <FormControl>
                        <InputMasked 
                          mask="cpf"
                          {...field} 
                          data-testid="input-cpf" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <InputMasked 
                          mask="cep"
                          {...field} 
                          data-testid="input-cep" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-complement" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-district" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-state" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/clientes")}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="btn-primary"
                  disabled={mutation.isPending}
                  data-testid="button-save"
                >
                  {mutation.isPending ? "Salvando..." : isEdit ? "Atualizar" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Pets Section - Only show when editing */}
      {isEdit && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Pets do Cliente</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation(`/clientes/${params.id}/pets/novo`)}
                data-testid="button-add-pet"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Pet
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {petsLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ) : pets.length > 0 ? (
              <div className="space-y-4">
                {pets.map((pet: any) => (
                  <div
                    key={pet.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">{pet.name}</h3>
                        <Badge variant="secondary">{pet.species}</Badge>
                        {pet.breed && (
                          <Badge variant="outline">{pet.breed}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {pet.birthDate && (
                          <span>Nascimento: {new Date(pet.birthDate).toLocaleDateString('pt-BR')}</span>
                        )}
                        {pet.planId && (
                          <span className="ml-4">Plano: {pet.planId}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/pets/${pet.id}/editar`)}
                        data-testid={`button-edit-pet-${pet.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Este cliente ainda não possui pets cadastrados.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setLocation(`/clientes/${params.id}/pets/novo`)}
                  data-testid="button-add-first-pet"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Pet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
