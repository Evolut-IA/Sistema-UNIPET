import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertThemeSettingsSchema } from "@shared/schema";
import { Palette, Type, Layout, MousePointer, FormInput, Package, BarChart3, Save, Pipette } from "lucide-react";

// Color input component with clean picker
const ColorInput = ({ value, onChange, title, description, testId }: {
  value: string;
  onChange: (value: string) => void;
  title: string;
  description: string;
  testId: string;
}) => {
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  // Reset temporary value when opening popover
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTempValue(value);
    }
    setOpen(newOpen);
  };

  const handleHexChange = (newHex: string) => {
    // Ensure the hex starts with # and is valid
    let formattedHex = newHex;
    if (!formattedHex.startsWith('#')) {
      formattedHex = '#' + formattedHex;
    }
    
    // Just update temp value, don't apply yet
    if (/^#[0-9A-F]{6}$/i.test(formattedHex)) {
      setTempValue(formattedHex);
    } else if (formattedHex.length <= 7) {
      setTempValue(formattedHex);
    }
  };

  const handleColorPickerChange = (newColor: string) => {
    setTempValue(newColor);
  };

  const handleConfirm = () => {
    // Apply the change only when confirming
    if (/^#[0-9A-F]{6}$/i.test(tempValue)) {
      onChange(tempValue);
    }
    setOpen(false);
  };

  const handleCancel = () => {
    // Reset to original value and close
    setTempValue(value);
    setOpen(false);
  };

  return (
    <div className="flex items-center space-x-3">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div 
            className="w-10 h-10 rounded-lg border-2 border-muted cursor-pointer flex-shrink-0 transition-all duration-200 hover:scale-105 hover:shadow-md"
            style={{ backgroundColor: value }}
            data-testid={testId}
          />
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Pipette className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium text-sm">Escolher Cor</h4>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Código HEX
                </label>
                <Input
                  value={tempValue}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="#000000"
                  className="mt-1 font-mono text-sm"
                  maxLength={7}
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Seletor Visual
                </label>
                <div className="mt-2 relative">
                  <input
                    type="color"
                    value={tempValue}
                    onChange={(e) => handleColorPickerChange(e.target.value)}
                    className="w-full h-12 rounded-md border border-input cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: tempValue }}
                    />
                    <span className="text-sm font-mono text-muted-foreground">{tempValue}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCancel}
                      className="text-xs px-3 py-1 h-7"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleConfirm}
                      className="text-xs px-3 py-1 h-7"
                      disabled={!/^#[0-9A-F]{6}$/i.test(tempValue)}
                    >
                      Pronto
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <div className="flex-1">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
    </div>
  );
};

export default function ThemeEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: themeSettings, isLoading } = useQuery({
    queryKey: ["/api/settings/theme"],
  });

  const form = useForm({
    resolver: zodResolver(insertThemeSettingsSchema),
    defaultValues: {
      // Foundation
      backgroundColor: "#faf9f7",
      textColor: "#1a1a1a",
      mutedBackgroundColor: "#e0e0e0",
      mutedTextColor: "#1a1a1a",
      
      // Typography
      sansSerifFont: "DM Sans",
      serifFont: "Georgia",
      monospaceFont: "Fira Code",
      
      // Shape & Spacing
      borderRadius: "0.5",
      
      // Actions
      primaryBackground: "#277677",
      primaryText: "#ffffff",
      secondaryBackground: "#0f1419",
      secondaryText: "#ffffff",
      accentBackground: "#e3ecf6",
      accentText: "#277677",
      destructiveBackground: "#277677",
      destructiveText: "#ffffff",
      
      // Forms
      inputBackground: "#f7f9fa",
      inputBorder: "#e1eaef",
      focusBorder: "#277677",
      
      // Containers
      cardBackground: "#ffffff",
      cardText: "#1a1a1a",
      popoverBackground: "#ffffff",
      popoverText: "#1a1a1a",
      
      // Charts
      chart1Color: "#277677",
      chart2Color: "#10b981",
      chart3Color: "#f59e0b",
      chart4Color: "#22c55e",
      chart5Color: "#ef4444",
    },
  });

  const saveThemeMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/api/settings/theme", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/theme"] });
      toast({
        title: "Tema salvo",
        description: "Configurações do tema foram salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações do tema.",
        variant: "destructive",
      });
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (themeSettings) {
      form.reset(themeSettings);
    }
  }, [themeSettings, form]);

  // Apply theme changes in real-time
  const watchedValues = form.watch();
  useEffect(() => {
    const root = document.documentElement;
    
    // Foundation
    root.style.setProperty('--background', watchedValues.backgroundColor);
    root.style.setProperty('--foreground', watchedValues.textColor);
    root.style.setProperty('--muted', watchedValues.mutedBackgroundColor);
    root.style.setProperty('--muted-foreground', watchedValues.mutedTextColor);
    
    // Typography
    root.style.setProperty('--font-sans', `'${watchedValues.sansSerifFont}', sans-serif`);
    root.style.setProperty('--font-serif', `'${watchedValues.serifFont}', serif`);
    root.style.setProperty('--font-mono', `'${watchedValues.monospaceFont}', monospace`);
    
    // Shape & Spacing
    root.style.setProperty('--radius', `${watchedValues.borderRadius}rem`);
    
    // Actions
    root.style.setProperty('--primary', watchedValues.primaryBackground);
    root.style.setProperty('--primary-foreground', watchedValues.primaryText);
    root.style.setProperty('--secondary', watchedValues.secondaryBackground);
    root.style.setProperty('--secondary-foreground', watchedValues.secondaryText);
    root.style.setProperty('--accent', watchedValues.accentBackground);
    root.style.setProperty('--accent-foreground', watchedValues.accentText);
    root.style.setProperty('--destructive', watchedValues.destructiveBackground);
    root.style.setProperty('--destructive-foreground', watchedValues.destructiveText);
    
    // Forms
    root.style.setProperty('--input', watchedValues.inputBackground);
    root.style.setProperty('--border', watchedValues.inputBorder);
    root.style.setProperty('--ring', watchedValues.focusBorder);
    
    // Containers
    root.style.setProperty('--card', watchedValues.cardBackground);
    root.style.setProperty('--card-foreground', watchedValues.cardText);
    root.style.setProperty('--popover', watchedValues.popoverBackground);
    root.style.setProperty('--popover-foreground', watchedValues.popoverText);
    
    // Sidebar (additional mapping)
    root.style.setProperty('--sidebar', watchedValues.cardBackground);
    root.style.setProperty('--sidebar-foreground', watchedValues.cardText);
    root.style.setProperty('--sidebar-primary', watchedValues.primaryBackground);
    root.style.setProperty('--sidebar-primary-foreground', watchedValues.primaryText);
    root.style.setProperty('--sidebar-accent', watchedValues.accentBackground);
    root.style.setProperty('--sidebar-accent-foreground', watchedValues.accentText);
    root.style.setProperty('--sidebar-border', watchedValues.inputBorder);
    root.style.setProperty('--sidebar-ring', watchedValues.focusBorder);
    
    // Charts
    root.style.setProperty('--chart-1', watchedValues.chart1Color);
    root.style.setProperty('--chart-2', watchedValues.chart2Color);
    root.style.setProperty('--chart-3', watchedValues.chart3Color);
    root.style.setProperty('--chart-4', watchedValues.chart4Color);
    root.style.setProperty('--chart-5', watchedValues.chart5Color);
  }, [watchedValues]);

  const onSubmit = (data: any) => {
    saveThemeMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>Personalizar Aparência</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              
              {/* Cores */}
              <AccordionItem value="colors" data-testid="accordion-colors">
                <AccordionTrigger className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <div>
                    <span>Cores</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-8">
                  
                  {/* Cores dos Botões */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      Cores dos Botões
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="primaryBackground"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#277677"}
                              onChange={field.onChange}
                              title="Fundo do Botão"
                              description="Cor de fundo dos botões principais"
                              testId="color-button-bg"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="primaryText"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#ffffff"}
                              onChange={field.onChange}
                              title="Texto do Botão"
                              description="Cor do texto dentro dos botões"
                              testId="color-button-text"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="accentBackground"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#e3ecf6"}
                              onChange={field.onChange}
                              title="Fundo do botão em destaque"
                              description="Cor de fundo dos botões em destaque"
                              testId="color-button-highlight-bg"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="accentText"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#277677"}
                              onChange={field.onChange}
                              title="Texto do Botão em destaque"
                              description="Cor do texto dos botões em destaque"
                              testId="color-button-highlight-text"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="secondaryBackground"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#0f1419"}
                              onChange={field.onChange}
                              title="Fundo do Botão Secundário"
                              description="Cor de fundo dos botões secundários"
                              testId="color-secondary-button-bg"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="secondaryText"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#ffffff"}
                              onChange={field.onChange}
                              title="Texto do Botão Secundário"
                              description="Cor do texto dos botões secundários"
                              testId="color-secondary-button-text"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="destructiveBackground"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#dc2626"}
                              onChange={field.onChange}
                              title="Fundo do Botão Destrutivo"
                              description="Cor de fundo dos botões destrutivos"
                              testId="color-destructive-button-bg"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="destructiveText"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#ffffff"}
                              onChange={field.onChange}
                              title="Texto do Botão Destrutivo"
                              description="Cor do texto dos botões destrutivos"
                              testId="color-destructive-button-text"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Fundo e texto principal */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      Fundo e texto principal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="backgroundColor"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#faf9f7"}
                              onChange={field.onChange}
                              title="Fundo da Página"
                              description="Cor de fundo da página principal"
                              testId="color-page-bg"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="textColor"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#1a1a1a"}
                              onChange={field.onChange}
                              title="Texto Principal"
                              description="Cor do texto principal da página"
                              testId="color-main-text"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cardBackground"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#ffffff"}
                              onChange={field.onChange}
                              title="Fundo dos Cards"
                              description="Cor de fundo dos cards e containers"
                              testId="color-cards-bg"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cardText"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#1a1a1a"}
                              onChange={field.onChange}
                              title="Texto Secundário"
                              description="Cor do texto dentro dos cards"
                              testId="color-secondary-text"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="popoverBackground"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#ffffff"}
                              onChange={field.onChange}
                              title="Fundo das divs internas"
                              description="Cor de fundo das divs internas"
                              testId="color-internal-divs-bg"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="popoverText"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#1a1a1a"}
                              onChange={field.onChange}
                              title="Texto das divs"
                              description="Cor do texto das divs internas"
                              testId="color-internal-divs-text"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Cores dos Gráficos */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      Cores dos Gráficos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="chart1Color"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#277677"}
                              onChange={field.onChange}
                              title="Visão Geral em Gráficos"
                              description="Cor principal dos gráficos de visão geral"
                              testId="color-overview-charts"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="chart2Color"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#10b981"}
                              onChange={field.onChange}
                              title="Distribuição de Planos"
                              description="Cor dos gráficos de distribuição de planos"
                              testId="color-plans-distribution"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="chart3Color"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#f59e0b"}
                              onChange={field.onChange}
                              title="Icones"
                              description="Cor dos ícones nos gráficos"
                              testId="color-charts-icons"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Cores de Status */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      Cores de Status
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="chart4Color"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#22c55e"}
                              onChange={field.onChange}
                              title="Positivo (verde)"
                              description="Cor para status positivos e sucessos"
                              testId="color-status-positive"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="chart3Color"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#eab308"}
                              onChange={field.onChange}
                              title="Ausente (amarelo)"
                              description="Cor para status de ausência e avisos"
                              testId="color-status-warning"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="chart5Color"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#ef4444"}
                              onChange={field.onChange}
                              title="Negativo (vermelho)"
                              description="Cor para status negativos e erros"
                              testId="color-status-negative"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Cores de textarea */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      Cores de textarea
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="inputBackground"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#f7f9fa"}
                              onChange={field.onChange}
                              title="Fundo"
                              description="Cor de fundo dos campos de texto"
                              testId="color-textarea-bg"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="textColor"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#1a1a1a"}
                              onChange={field.onChange}
                              title="Texto Digitado"
                              description="Cor do texto escrito nos campos"
                              testId="color-textarea-text"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="mutedTextColor"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#666666"}
                              onChange={field.onChange}
                              title="Texto placeholder"
                              description="Cor do texto de exemplo nos campos"
                              testId="color-textarea-placeholder"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="inputBorder"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#e1eaef"}
                              onChange={field.onChange}
                              title="Borda dos Campos"
                              description="Cor da borda dos campos de texto"
                              testId="color-input-border"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="focusBorder"
                        render={({ field }) => (
                          <FormItem>
                            <ColorInput
                              value={field.value || "#277677"}
                              onChange={field.onChange}
                              title="Borda ao Focar"
                              description="Cor da borda quando o campo está focado"
                              testId="color-focus-border"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={saveThemeMutation.isPending}
                className="flex items-center space-x-2"
                data-testid="button-save-theme"
              >
                <Save className="h-4 w-4" />
                <span>{saveThemeMutation.isPending ? "Salvando Alterações..." : "Aplicar Tema"}</span>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}