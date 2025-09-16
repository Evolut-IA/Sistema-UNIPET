import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputMasked } from "@/components/ui/input-masked";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSiteSettingsSchema } from "@shared/schema";
import { Settings as SettingsIcon, Globe, Palette, Save, Loader2 } from "lucide-react";
import ThemeEditor from "@/components/ThemeEditor";
import { ImageUpload } from "@/components/ui/image-upload";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: siteSettings, isLoading: siteLoading, error: siteError } = useQuery({
    queryKey: ["/api/settings/site"],
    queryFn: () => apiRequest("GET", "/api/settings/site"),
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });



  const siteForm = useForm({
    resolver: zodResolver(insertSiteSettingsSchema),
    defaultValues: {
      whatsapp: "",
      email: "",
      phone: "",
      instagramUrl: "",
      facebookUrl: "",
      linkedinUrl: "",
      youtubeUrl: "",
      cnpj: "",
      businessHours: "",
      ourStory: "",
      privacyPolicy: "",
      termsOfUse: "",
      address: "",
      mainImage: "",
      networkImage: "",
      aboutImage: "",
      cores: {},
    },
  });


  const saveSiteMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/api/settings/site", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/site"] });
      toast({
        title: "Configurações salvas",
        description: "Configurações do site foram salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações do site.",
        variant: "destructive",
      });
    },
  });


  // Update forms when data loads
  useEffect(() => {
    if (siteSettings && typeof siteSettings === 'object' && !siteLoading) {
      // Merge with default values to ensure all fields are present
      const mergedSettings = {
        whatsapp: (siteSettings as any).whatsapp || "",
        email: (siteSettings as any).email || "",
        phone: (siteSettings as any).phone || "",
        instagramUrl: (siteSettings as any).instagramUrl || "",
        facebookUrl: (siteSettings as any).facebookUrl || "",
        linkedinUrl: (siteSettings as any).linkedinUrl || "",
        youtubeUrl: (siteSettings as any).youtubeUrl || "",
        cnpj: (siteSettings as any).cnpj || "",
        businessHours: (siteSettings as any).businessHours || "",
        ourStory: (siteSettings as any).ourStory || "",
        privacyPolicy: (siteSettings as any).privacyPolicy || "",
        termsOfUse: (siteSettings as any).termsOfUse || "",
        address: (siteSettings as any).address || "",
        mainImage: (siteSettings as any).mainImage || "",
        networkImage: (siteSettings as any).networkImage || "",
        aboutImage: (siteSettings as any).aboutImage || "",
        cores: (siteSettings as any).cores || {},
      };
      
      siteForm.reset(mergedSettings);
    }
  }, [siteSettings, siteLoading, siteError, siteForm]);


  const onSubmitSite = (data: any) => {
    // Remove campos vazios antes de enviar
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => 
        value !== "" && value !== null && value !== undefined
      )
    );
    
    saveSiteMutation.mutate(cleanData);
  };


  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">Configurações</h1>
          <p className="text-sm text-muted-foreground">Gerencie as configurações do sistema</p>
        </div>
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 xs:gap-4">
          <Button 
            className="btn-primary w-full xs:w-auto"
            onClick={() => {
              const activeTab = document.querySelector('[data-state="active"]')?.getAttribute('value');
              if (activeTab === 'site') {
                siteForm.handleSubmit(onSubmitSite)();
              }
            }}
            disabled={saveSiteMutation.isPending}
            data-testid="button-save-settings"
          >
            {saveSiteMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="site" className="space-y-4 sm:space-y-6">
        <TabsList 
          className="grid w-full grid-cols-2 gap-1" 
          style={{ backgroundColor: 'var(--background)' }}
        >
          <TabsTrigger 
            value="site" 
            className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Globe className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Site</span>
          </TabsTrigger>
          <TabsTrigger 
            value="theme" 
            className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Palette className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Tema</span>
          </TabsTrigger>
        </TabsList>

        {/* Site Settings */}
        <TabsContent value="site" className="space-y-4 sm:space-y-6">
          {siteLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-10 bg-muted rounded"></div>
                      <div className="h-10 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Form {...siteForm}>
              <form onSubmit={siteForm.handleSubmit(onSubmitSite)} className="space-y-4 sm:space-y-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-foreground">Informações de Contato</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <FormField
                        control={siteForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <InputMasked 
                                {...field} 
                                type="email" 
                                mask="email"
                                data-testid="input-site-email" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={siteForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <InputMasked 
                                mask="phone"
                                {...field} 
                                data-testid="input-site-phone" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={siteForm.control}
                        name="whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp</FormLabel>
                            <FormControl>
                              <InputMasked 
                                mask="whatsapp"
                                {...field} 
                                data-testid="input-site-whatsapp" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={siteForm.control}
                        name="cnpj"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CNPJ</FormLabel>
                            <FormControl>
                              <InputMasked 
                                mask="cnpj"
                                {...field} 
                                data-testid="input-site-cnpj" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={siteForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-site-address" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={siteForm.control}
                        name="businessHours"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Horário de Atendimento</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: Segunda à Sexta, 8h às 18h" data-testid="input-business-hours" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Social Media */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-foreground">Redes Sociais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <FormField
                        control={siteForm.control}
                        name="instagramUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://instagram.com/..." data-testid="input-instagram" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={siteForm.control}
                        name="facebookUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://facebook.com/..." data-testid="input-facebook" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={siteForm.control}
                        name="linkedinUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://linkedin.com/..." data-testid="input-linkedin" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={siteForm.control}
                        name="youtubeUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>YouTube</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://youtube.com/..." data-testid="input-youtube" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-foreground">Conteúdo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={siteForm.control}
                      name="ourStory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nossa História</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} data-testid="textarea-our-story" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={siteForm.control}
                      name="privacyPolicy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Política de Privacidade</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={6} data-testid="textarea-privacy-policy" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={siteForm.control}
                      name="termsOfUse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Termos de Uso</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={6} data-testid="textarea-terms-of-use" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Images */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-foreground">Imagens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                      <FormField
                        control={siteForm.control}
                        name="mainImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Imagem Principal</FormLabel>
                            <FormControl>
                              <ImageUpload 
                                value={field.value} 
                                onChange={field.onChange}
                                data-testid="input-main-image"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={siteForm.control}
                        name="networkImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Imagem da Rede</FormLabel>
                            <FormControl>
                              <ImageUpload 
                                value={field.value} 
                                onChange={field.onChange}
                                data-testid="input-network-image"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={siteForm.control}
                        name="aboutImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Imagem Sobre Nós</FormLabel>
                            <FormControl>
                              <ImageUpload 
                                value={field.value} 
                                onChange={field.onChange}
                                data-testid="input-about-image"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="btn-primary"
                    disabled={saveSiteMutation.isPending}
                    data-testid="button-save-site"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveSiteMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </TabsContent>


        {/* Theme Settings */}
        <TabsContent value="theme" className="space-y-6" data-testid="tab-content-theme">
          <ThemeEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
