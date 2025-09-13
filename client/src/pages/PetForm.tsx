import { useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPetSchema } from "@shared/schema";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function PetForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEdit = Boolean(params.id);
  const clientId = params.clientId;

  const { data: pet, isLoading: petLoading } = useQuery({
    queryKey: ["/api/pets", params.id],
    enabled: isEdit,
  });

  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ["/api/clients", clientId],
    enabled: Boolean(clientId),
  });

  const { data: plans } = useQuery({
    queryKey: ["/api/plans/active"],
  });

  const form = useForm({
    resolver: zodResolver(insertPetSchema.extend({
      birthDate: insertPetSchema.shape.birthDate.optional(),
    })),
    defaultValues: {
      clientId: clientId || "",
      name: "",
      species: "",
      breed: "",
      birthDate: undefined,
      age: "",
      sex: "",
      castrated: false,
      color: "",
      weight: "",
      microchip: "",
      previousDiseases: "",
      surgeries: "",
      allergies: "",
      currentMedications: "",
      hereditaryConditions: "",
      vaccineData: [],
      lastCheckup: undefined,
      parasite_treatments: "",
      planId: "",
    },
  });

  useEffect(() => {
    if (pet) {
      form.reset({
        clientId: pet.clientId,
        name: pet.name || "",
        species: pet.species || "",
        breed: pet.breed || "",
        birthDate: pet.birthDate ? new Date(pet.birthDate) : undefined,
        age: pet.age || "",
        sex: pet.sex || "",
        castrated: pet.castrated || false,
        color: pet.color || "",
        weight: pet.weight || "",
        microchip: pet.microchip || "",
        previousDiseases: pet.previousDiseases || "",
        surgeries: pet.surgeries || "",
        allergies: pet.allergies || "",
        currentMedications: pet.currentMedications || "",
        hereditaryConditions: pet.hereditaryConditions || "",
        vaccineData: pet.vaccineData || [],
        lastCheckup: pet.lastCheckup ? new Date(pet.lastCheckup) : undefined,
        parasite_treatments: pet.parasite_treatments || "",
        planId: pet.planId || "",
      });
    } else if (clientId) {
      form.setValue("clientId", clientId);
    }
  }, [pet, clientId, form]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEdit) {
        await apiRequest("PUT", `/api/pets/${params.id}`, data);
      } else {
        await apiRequest("POST", "/api/pets", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId, "pets"] });
      toast({
        title: isEdit ? "Pet atualizado" : "Pet cadastrado",
        description: isEdit ? "Pet foi atualizado com sucesso." : "Pet foi cadastrado com sucesso.",
      });
      setLocation("/clientes");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: isEdit ? "Falha ao atualizar pet." : "Falha ao cadastrar pet.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  if ((isEdit && petLoading) || (clientId && clientLoading)) {
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
            {isEdit ? "Editar Pet" : "Novo Pet"}
          </h1>
          <p className="text-muted-foreground">
            {client && `Cliente: ${client.fullName}`}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Pet *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-pet-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="species"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Espécie *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-species">
                            <SelectValue placeholder="Selecione a espécie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cão">Cão</SelectItem>
                          <SelectItem value="Gato">Gato</SelectItem>
                          <SelectItem value="Ave">Ave</SelectItem>
                          <SelectItem value="Roedor">Roedor</SelectItem>
                          <SelectItem value="Réptil">Réptil</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Raça</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-breed" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idade</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: 2 anos" data-testid="input-age" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-sex">
                            <SelectValue placeholder="Selecione o sexo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Macho">Macho</SelectItem>
                          <SelectItem value="Fêmea">Fêmea</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="castrated"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-castrated"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Castrado/Esterilizado</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor/Pelagem</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-color" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso Atual (kg)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.1" data-testid="input-weight" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="microchip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Microchip</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-microchip" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="planId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano de Saúde</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-plan">
                            <SelectValue placeholder="Selecione um plano" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {plans?.map((plan: any) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name} - R$ {parseFloat(plan.price).toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Histórico Médico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="previousDiseases"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doenças Prévias</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="textarea-previous-diseases" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="surgeries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cirurgias ou Tratamentos Passados</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="textarea-surgeries" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alergias Conhecidas</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="textarea-allergies" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentMedications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medicamentos Atuais</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="textarea-current-medications" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hereditaryConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condições Hereditárias</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="textarea-hereditary-conditions" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preventive Care */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Cuidados Preventivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="parasite_treatments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tratamentos Antipulgas/Parasitas</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="textarea-parasite-treatments" />
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
    </div>
  );
}
