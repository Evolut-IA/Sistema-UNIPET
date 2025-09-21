import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputMasked } from "@/components/ui/input-masked";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/admin/queryClient";
import { insertSiteSettingsSchema, insertRulesSettingsSchema } from "@shared/schema";
import { Globe, Save, FileText, Share, Image } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ImageUpload } from "@/components/ui/image-upload";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: siteSettings, isLoading: siteLoading, error: siteError } = useQuery({
    queryKey: ["/admin/api/settings/site"],
    queryFn: () => apiRequest("GET", "/admin/api/settings/site"),
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const { data: rulesSettings, isLoading: rulesLoading, error: rulesError } = useQuery({
    queryKey: ["/admin/api/settings/rules"],
    queryFn: () => apiRequest("GET", "/admin/api/settings/rules"),
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
    },
  });

  const rulesForm = useForm({
    resolver: zodResolver(insertRulesSettingsSchema),
    defaultValues: {
      fixedPercentage: 0,
    },
  });


  const saveSiteMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/admin/api/settings/site", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/settings/site"] });
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

  const saveRulesMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/admin/api/settings/rules", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/settings/rules"] });
      toast({
        title: "Regras salvas",
        description: "Configurações de regras foram salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações de regras.",
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
        aboutImage: (siteSettings as any).aboutImage || ""
      };
      
      siteForm.reset(mergedSettings);
    }
  }, [siteSettings, siteLoading, siteError, siteForm]);

  useEffect(() => {
    if (rulesSettings && typeof rulesSettings === 'object' && !rulesLoading) {
      const mergedRulesSettings = {
        fixedPercentage: Number((rulesSettings as any).fixedPercentage ?? 0),
      };
      
      rulesForm.reset(mergedRulesSettings);
    }
  }, [rulesSettings, rulesLoading, rulesError, rulesForm]);


  const onSubmitSite = (data: any) => {
    // Remove campos vazios antes de enviar
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => 
        value !== "" && value !== null && value !== undefined
      )
    );
    
    saveSiteMutation.mutate(cleanData);
  };

  const onSubmitRules = (data: any) => {
    saveRulesMutation.mutate(data);
  };


  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text-teal)] break-words">Configurações</h1>
          <p className="text-sm text-[var(--text-dark-secondary)]">Gerencie as configurações do sistema</p>
        </div>
      </div>

      <Tabs defaultValue="site" className="space-y-4 sm:space-y-6">
        <TabsList 
          className="grid w-full grid-cols-2 gap-1" 
          style={{ backgroundColor: 'var(--bg-teal-light)' }}
        >
          <TabsTrigger 
            value="site" 
            className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-[var(--bg-teal)] data-[state=active]:text-[var(--text-light)]"
          >
            <Globe className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Geral</span>
          </TabsTrigger>
          <TabsTrigger 
            value="rules" 
            className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-[var(--bg-teal)] data-[state=active]:text-[var(--text-light)]"
          >
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Regras</span>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-[var(--text-teal)] flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Configurações Gerais</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...siteForm}>
                  <form onSubmit={siteForm.handleSubmit(onSubmitSite)} className="space-y-4 sm:space-y-6">
                    <Accordion type="single" collapsible className="w-full">
                  
                  {/* Contact Information */}
                  <AccordionItem value="contact" data-testid="accordion-contact">
                    <AccordionTrigger className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <div>
                        <span>Informações de Contato</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-6">
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
                    </AccordionContent>
                  </AccordionItem>

                  {/* Social Media */}
                  <AccordionItem value="social" data-testid="accordion-social">
                    <AccordionTrigger className="flex items-center space-x-2">
                      <Share className="h-4 w-4" />
                      <div>
                        <span>Redes Sociais</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-6">
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
                    </AccordionContent>
                  </AccordionItem>

                  {/* Content */}
                  <AccordionItem value="content" data-testid="accordion-content">
                    <AccordionTrigger className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <div>
                        <span>Conteúdo</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-6">
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
                    </AccordionContent>
                  </AccordionItem>

                  {/* Images */}
                  <AccordionItem value="images" data-testid="accordion-images">
                    <AccordionTrigger className="flex items-center space-x-2">
                      <Image className="h-4 w-4" />
                      <div>
                        <span>Imagens</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-6">
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
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>

                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    className="bg-[var(--bg-teal)] text-[var(--text-light)]"
                    disabled={saveSiteMutation.isPending}
                    data-testid="button-save-site"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveSiteMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </TabsContent>



        {/* Rules Settings */}
        <TabsContent value="rules" className="space-y-6" data-testid="tab-content-rules">
          {rulesLoading ? (
            <div className="space-y-4">
              <Card className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-10 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Form {...rulesForm}>
              <form onSubmit={rulesForm.handleSubmit(onSubmitRules)} className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-foreground">Configurações de Regras</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="plans" data-testid="accordion-plans">
                        <AccordionTrigger className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <div>
                            <span>Planos & Procedimentos</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <FormField
                            control={rulesForm.control}
                            name="fixedPercentage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Porcentagem Fixa para Cálculo Automático</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field}
                                    type="number" 
                                    placeholder="Ex: 50" 
                                    min="0" 
                                    max="100"
                                    value={field.value || ""}
                                    onChange={(e) => {
                                      const value = e.target.value === "" ? "" : Number(e.target.value);
                                      field.onChange(value);
                                    }}
                                    data-testid="input-percentage-fixed"
                                  />
                                </FormControl>
                                <FormMessage />
                                <p className="text-sm text-muted-foreground">
                                  Porcentagem que será aplicada automaticamente no campo "Pagar (R$)" quando inserir um valor em "Receber (R$)"
                                </p>
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <div className="flex justify-end pt-6">
                      <Button
                        type="submit"
                        className="btn-primary"
                        disabled={saveRulesMutation.isPending}
                        data-testid="button-save-rules"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saveRulesMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </Form>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
