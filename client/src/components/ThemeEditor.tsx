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
import { DEFAULT_THEME, applyThemeToCSSVariables } from "@/lib/theme-defaults";

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
    defaultValues: DEFAULT_THEME,
  });

  const saveThemeMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/api/settings/theme", data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/theme"] });
      
      // Dispatch event to update cache for next page load
      const event = new CustomEvent('theme-updated', { detail: data });
      window.dispatchEvent(event);
      
      // Update localStorage cache
      localStorage.setItem('cached-theme', JSON.stringify(data));
      
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
    applyThemeToCSSVariables(watchedValues);
  }, [watchedValues]);

  const onSubmit = (data: any) => {
    saveThemeMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
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
                              value={field.value || DEFAULT_THEME.primaryBackground}
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
                              value={field.value || DEFAULT_THEME.primaryText}
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
                              value={field.value || DEFAULT_THEME.accentBackground}
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
                              value={field.value || DEFAULT_THEME.accentText}
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
                              value={field.value || DEFAULT_THEME.secondaryBackground}
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
                              value={field.value || DEFAULT_THEME.secondaryText}
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
                              value={field.value || DEFAULT_THEME.destructiveBackground}
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
                              value={field.value || DEFAULT_THEME.destructiveText}
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
                              value={field.value || DEFAULT_THEME.backgroundColor}
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
                              value={field.value || DEFAULT_THEME.textColor}
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
                              value={field.value || DEFAULT_THEME.cardBackground}
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
                              value={field.value || DEFAULT_THEME.cardText}
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
                              value={field.value || DEFAULT_THEME.popoverBackground}
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
                              value={field.value || DEFAULT_THEME.popoverText}
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
                              value={field.value || DEFAULT_THEME.chart1Color}
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
                              value={field.value || DEFAULT_THEME.chart2Color}
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
                              value={field.value || DEFAULT_THEME.chart3Color}
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
                              value={field.value || DEFAULT_THEME.chart4Color}
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
                              value={field.value || DEFAULT_THEME.chart3Color}
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
                              value={field.value || DEFAULT_THEME.chart5Color}
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
                              value={field.value || DEFAULT_THEME.inputBackground}
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
                              value={field.value || DEFAULT_THEME.textColor}
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
                              value={field.value || DEFAULT_THEME.mutedTextColor}
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
                              value={field.value || DEFAULT_THEME.inputBorder}
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
                              value={field.value || DEFAULT_THEME.focusBorder}
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

              {/* Fontes do Sistema */}
              <AccordionItem value="fonts" data-testid="accordion-fonts">
                <AccordionTrigger className="flex items-center space-x-2">
                  <Type className="h-4 w-4" />
                  <div>
                    <span>Fontes do Sistema</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="sansSerifFont"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fonte Sans-Serif</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-sans-serif-font">
                              <SelectValue placeholder="Selecione uma fonte sans-serif" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="DM Sans">DM Sans</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                            <SelectItem value="Lato">Lato</SelectItem>
                            <SelectItem value="Poppins">Poppins</SelectItem>
                            <SelectItem value="Montserrat">Montserrat</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="serifFont"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fonte Serif</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-serif-font">
                              <SelectValue placeholder="Selecione uma fonte serif" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                            <SelectItem value="Merriweather">Merriweather</SelectItem>
                            <SelectItem value="Crimson Text">Crimson Text</SelectItem>
                            <SelectItem value="Lora">Lora</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="monospaceFont"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fonte Monospace</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-monospace-font">
                              <SelectValue placeholder="Selecione uma fonte monospace" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Fira Code">Fira Code</SelectItem>
                            <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                            <SelectItem value="Source Code Pro">Source Code Pro</SelectItem>
                            <SelectItem value="Monaco">Monaco</SelectItem>
                            <SelectItem value="Courier New">Courier New</SelectItem>
                            <SelectItem value="Consolas">Consolas</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Arredondamento dos Elementos */}
              <AccordionItem value="radius" data-testid="accordion-radius">
                <AccordionTrigger className="flex items-center space-x-2">
                  <Layout className="h-4 w-4" />
                  <div>
                    <span>Arredondamento dos Elementos</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="borderRadius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Raio da Borda</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-border-radius">
                              <SelectValue placeholder="Selecione o arredondamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">Sem arredondamento (0rem)</SelectItem>
                            <SelectItem value="0.25">Pequeno (0.25rem)</SelectItem>
                            <SelectItem value="0.375">Pequeno-médio (0.375rem)</SelectItem>
                            <SelectItem value="0.5">Médio (0.5rem)</SelectItem>
                            <SelectItem value="0.75">Médio-grande (0.75rem)</SelectItem>
                            <SelectItem value="1">Grande (1rem)</SelectItem>
                            <SelectItem value="1.5">Muito grande (1.5rem)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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