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
import { PasswordDialog } from "@/components/ui/password-dialog";
import { usePasswordDialog } from "@/hooks/use-password-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

export default function ClientForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const passwordDialog = usePasswordDialog();
  const confirmDialog = useConfirmDialog();

  const isEdit = Boolean(params.id);

  const { data: client, isLoading } = useQuery<any>({
    queryKey: ["/api/clients", params.id],
    enabled: isEdit,
  });

  const { data: pets = [], isLoading: petsLoading } = useQuery<any[]>({
    queryKey: ["/api/clients", params.id, "pets"],
    enabled: isEdit,
  });

  const deletePetMutation = useMutation({
    mutationFn: (petId: string) => apiRequest(`/api/pets/${petId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients", params.id, "pets"] });
      toast({
        title: "Pet excluído",
        description: "O pet foi excluído com sucesso.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o pet. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleDeletePet = (petId: string, petName: string) => {
    passwordDialog.openDialog({
      title: "Verificação de Senha",
      description: "Digite a senha do administrador para excluir este pet:",
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
              title: "Excluir Pet",
              description: `Tem certeza que deseja excluir o pet "${petName}"? Esta ação não pode ser desfeita.`,
              confirmText: "Excluir Pet",
              cancelText: "Cancelar",
              onConfirm: () => {
                confirmDialog.setLoading(true);
                deletePetMutation.mutate(petId, {
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
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isEdit ? "Editar Cliente" : "Novo Cliente"}
        </h1>
        <p className="text-muted-foreground">
          {isEdit ? "Atualize as informações do cliente" : "Cadastre um novo cliente"}
        </p>
      </div>

      {/* Back Button */}
      <Button
        variant="default"
        onClick={() => setLocation("/clientes")}
        data-testid="button-back-to-clients"
        className="w-full sm:w-auto"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

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

              <div className="flex justify-center flex-col md:flex-row gap-3 md:gap-4">
                <Button
                  type="button"
                  variant="default"
                  onClick={() => setLocation("/clientes")}
                  data-testid="button-cancel"
                  className="md:w-auto w-full md:h-10 h-12 md:text-sm text-base"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="btn-primary md:w-auto w-full md:h-10 h-12 md:text-sm text-base"
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
                variant="default"
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
                <div className="h-20 bg-muted rounded"></div>
                <div className="h-20 bg-muted rounded"></div>
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
                        variant="default"
                        size="sm"
                        onClick={() => setLocation(`/pets/${pet.id}/editar`)}
                        data-testid={`button-edit-pet-${pet.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDeletePet(pet.id, pet.name)}
                        disabled={deletePetMutation.isPending}
                        data-testid={`button-delete-pet-${pet.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
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
                  variant="default"
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
