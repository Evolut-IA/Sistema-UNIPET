import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputMasked } from "@/components/ui/input-masked";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertNetworkUnitSchema } from "@shared/schema";
import { ArrowLeft } from "lucide-react";
import { AVAILABLE_SERVICES } from "@/lib/constants";
import { ImageUpload } from "@/components/ui/image-upload";

export default function NetworkForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const isEdit = Boolean(params.id);

  const { data: unit, isLoading } = useQuery({
    queryKey: ["/api/network-units", params.id],
    enabled: isEdit,
  });

  const form = useForm({
    resolver: zodResolver(insertNetworkUnitSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      services: [],
      imageUrl: "",
      isActive: true,
      whatsapp: "",
      googleMapsUrl: "",
    },
  });

  useEffect(() => {
    if (unit) {
      const services = unit.services || [];
      setSelectedServices(services);
      form.reset({
        name: unit.name || "",
        address: unit.address || "",
        phone: unit.phone || "",
        services: services,
        imageUrl: unit.imageUrl || "",
        isActive: unit.isActive ?? true,
        whatsapp: unit.whatsapp || "",
        googleMapsUrl: unit.googleMapsUrl || "",
      });
    }
  }, [unit, form]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEdit) {
        await apiRequest("PUT", `/api/network-units/${params.id}`, data);
      } else {
        await apiRequest("POST", "/api/network-units", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/network-units"] });
      toast({
        title: isEdit ? "Unidade atualizada" : "Unidade cadastrada",
        description: isEdit ? "Unidade foi atualizada com sucesso." : "Unidade foi cadastrada com sucesso.",
      });
      setLocation("/rede");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: isEdit ? "Falha ao atualizar unidade." : "Falha ao cadastrar unidade.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate({
      ...data,
      services: selectedServices,
    });
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setSelectedServices([...selectedServices, service]);
    } else {
      setSelectedServices(selectedServices.filter(s => s !== service));
    }
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
          onClick={() => setLocation("/rede")}
          data-testid="button-back-to-network"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEdit ? "Editar Unidade" : "Nova Unidade"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? "Atualize as informações da unidade" : "Cadastre uma nova unidade da rede"}
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
                      <FormLabel>Nome da Unidade *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-unit-name" />
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
                      <FormLabel>Endereço *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-address" />
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
                      <FormLabel>Telefone *</FormLabel>
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
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <InputMasked 
                          mask="whatsapp"
                          {...field} 
                          data-testid="input-whatsapp" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagem da unidade *</FormLabel>
                      <FormControl>
                        <ImageUpload 
                          value={field.value} 
                          onChange={field.onChange}
                          data-testid="input-image-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="googleMapsUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link do Google Maps</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://maps.google.com/..." data-testid="input-maps-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 col-span-full">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Unidade Ativa</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Unidades ativas são exibidas na rede credenciada
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-unit-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Serviços Oferecidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {AVAILABLE_SERVICES.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service}`}
                      checked={selectedServices.includes(service)}
                      onCheckedChange={(checked) => handleServiceChange(service, checked as boolean)}
                      data-testid={`checkbox-service-${service.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
                    />
                    <label 
                      htmlFor={`service-${service}`}
                      className="text-sm text-foreground cursor-pointer"
                    >
                      {service}
                    </label>
                  </div>
                ))}
              </div>
              {selectedServices.length > 0 && (
                <div className="mt-4 p-3 bg-accent border border-accent-foreground/20 rounded-lg">
                  <p className="text-sm font-medium text-accent-foreground mb-1">
                    Serviços selecionados ({selectedServices.length}):
                  </p>
                  <p className="text-sm text-accent-foreground/80">
                    {selectedServices.join(", ")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/rede")}
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
