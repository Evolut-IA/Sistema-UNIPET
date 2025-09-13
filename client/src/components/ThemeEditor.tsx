import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertThemeSettingsSchema } from "@shared/schema";
import { Palette, Type, Layout, MousePointer, FormInput, Package, BarChart3, Save, Pipette } from "lucide-react";

// Predefined font options
const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "DM Sans", label: "DM Sans" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Poppins", label: "Poppins" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
];

const serifFontOptions = [
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Crimson Text", label: "Crimson Text" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "PT Serif", label: "PT Serif" },
];

const monospaceFontOptions = [
  { value: "Fira Code", label: "Fira Code" },
  { value: "JetBrains Mono", label: "JetBrains Mono" },
  { value: "Monaco", label: "Monaco" },
  { value: "Menlo", label: "Menlo" },
  { value: "Courier New", label: "Courier New" },
  { value: "Source Code Pro", label: "Source Code Pro" },
];

// Color input component with clean picker
const ColorInput = ({ value, onChange, label, testId }: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  testId: string;
}) => {
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);

  useEffect(() => {
    setHexInput(value);
  }, [value]);

  const handleHexChange = (newHex: string) => {
    // Ensure the hex starts with # and is valid
    let formattedHex = newHex;
    if (!formattedHex.startsWith('#')) {
      formattedHex = '#' + formattedHex;
    }
    
    // Validate hex color
    if (/^#[0-9A-F]{6}$/i.test(formattedHex)) {
      setHexInput(formattedHex);
      onChange(formattedHex);
    } else if (formattedHex.length <= 7) {
      setHexInput(formattedHex);
    }
  };

  const handleColorPickerChange = (newColor: string) => {
    setHexInput(newColor);
    onChange(newColor);
  };

  return (
    <div className="flex items-center space-x-3">
      <Popover open={open} onOpenChange={setOpen}>
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
                  value={hexInput}
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
                    value={value}
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
                      style={{ backgroundColor: value }}
                    />
                    <span className="text-sm font-mono text-muted-foreground">{value}</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setOpen(false)}
                    className="text-xs px-3 py-1 h-7"
                  >
                    Pronto
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <div className="flex-1">
        <label className="text-sm font-medium text-foreground">{label}</label>
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
      chart2Color: "#277677",
      chart3Color: "#277677",
      chart4Color: "#277677",
      chart5Color: "#277677",
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
        <CardTitle className="text-titulo flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>Personalizar Aparência</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Accordion type="multiple" className="w-full">
              
              {/* Foundation */}
              <AccordionItem value="foundation" data-testid="accordion-foundation">
                <AccordionTrigger className="flex items-center space-x-2">
                  <Layout className="h-4 w-4" />
                  <div>
                    <span>Cores Básicas</span>
                    <p className="text-sm text-muted-foreground mt-1">Configure as cores principais do sistema</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="backgroundColor"
                      render={({ field }) => (
                        <FormItem>
                          <ColorInput
                            value={field.value || "#faf9f7"}
                            onChange={field.onChange}
                            label="Cor do Fundo Principal - Esta é a cor que aparece atrás de todo o conteúdo"
                            testId="color-background"
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
                            label="Cor dos Textos Principais - Cor dos títulos e textos importantes"
                            testId="color-text"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="mutedBackgroundColor"
                      render={({ field }) => (
                        <FormItem>
                          <ColorInput
                            value={field.value || "#e0e0e0"}
                            onChange={field.onChange}
                            label="Cor de Fundo Secundário - Cor de áreas menos destacadas, como cards e seções"
                            testId="color-muted-bg"
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
                            value={field.value || "#1a1a1a"}
                            onChange={field.onChange}
                            label="Cor dos Textos Secundários - Cor de subtítulos e descrições"
                            testId="color-muted-text"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Typography */}
              <AccordionItem value="typography" data-testid="accordion-typography">
                <AccordionTrigger className="flex items-center space-x-2">
                  <Type className="h-4 w-4" />
                  <div>
                    <span>Tipografia e Fontes</span>
                    <p className="text-sm text-muted-foreground mt-1">Escolha as fontes que aparecerão em todo o sistema</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="sansSerifFont"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fonte Principal - Usada em títulos, botões e textos importantes</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value} data-testid="select-sans-serif">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {fontOptions.map((font) => (
                                  <SelectItem key={font.value} value={font.value}>
                                    {font.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="serifFont"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fonte Elegante - Usada em textos longos e conteúdo especial</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value} data-testid="select-serif">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {serifFontOptions.map((font) => (
                                  <SelectItem key={font.value} value={font.value}>
                                    {font.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="monospaceFont"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fonte de Código - Usada para números, códigos e dados técnicos</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value} data-testid="select-monospace">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {monospaceFontOptions.map((font) => (
                                  <SelectItem key={font.value} value={font.value}>
                                    {font.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Shape & Spacing */}
              <AccordionItem value="spacing" data-testid="accordion-spacing">
                <AccordionTrigger className="flex items-center space-x-2">
                  <Layout className="h-4 w-4" />
                  <div>
                    <span>Formato e Espaçamento</span>
                    <p className="text-sm text-muted-foreground mt-1">Configure o arredondamento dos cantos dos elementos</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="borderRadius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arredondamento dos Cantos - Quanto mais alto, mais arredondados ficam os botões e cards</FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.1"
                              min="0"
                              max="2"
                              data-testid="input-border-radius"
                            />
                          </FormControl>
                          <span className="text-muted-foreground">rem</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Actions */}
              <AccordionItem value="actions" data-testid="accordion-actions">
                <AccordionTrigger className="flex items-center space-x-2">
                  <MousePointer className="h-4 w-4" />
                  <div>
                    <span>Botões e Ações</span>
                    <p className="text-sm text-muted-foreground mt-1">Cores dos botões, links e elementos clicáveis</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Primary */}
                    <FormField
                      control={form.control}
                      name="primaryBackground"
                      render={({ field }) => (
                        <FormItem>
                          <ColorInput
                            value={field.value || "#277677"}
                            onChange={field.onChange}
                            label="Botão Principal (Fundo) - Cor dos botões mais importantes como 'Salvar'"
                            testId="color-primary-bg"
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
                            label="Botão Principal (Texto) - Cor do texto dentro dos botões principais"
                            testId="color-primary-text"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Secondary */}
                    <FormField
                      control={form.control}
                      name="secondaryBackground"
                      render={({ field }) => (
                        <FormItem>
                          <ColorInput
                            value={field.value || "#0f1419"}
                            onChange={field.onChange}
                            label="Botão Secundário (Fundo) - Cor dos botões menos importantes"
                            testId="color-secondary-bg"
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
                            label="Botão Secundário (Texto) - Cor do texto dos botões secundários"
                            testId="color-secondary-text"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Accent */}
                    <FormField
                      control={form.control}
                      name="accentBackground"
                      render={({ field }) => (
                        <FormItem>
                          <ColorInput
                            value={field.value || "#e3ecf6"}
                            onChange={field.onChange}
                            label="Destaque (Fundo) - Cor de elementos em destaque como links e selecionados"
                            testId="color-accent-bg"
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
                            label="Destaque (Texto) - Cor do texto dos elementos em destaque"
                            testId="color-accent-text"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Destructive */}
                    <FormField
                      control={form.control}
                      name="destructiveBackground"
                      render={({ field }) => (
                        <FormItem>
                          <ColorInput
                            value={field.value || "#277677"}
                            onChange={field.onChange}
                            label="Botão de Perigo (Fundo) - Cor dos botões perigosos como 'Excluir'"
                            testId="color-destructive-bg"
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
                            label="Botão de Perigo (Texto) - Cor do texto dos botões perigosos"
                            testId="color-destructive-text"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Forms */}
              <AccordionItem value="forms" data-testid="accordion-forms">
                <AccordionTrigger className="flex items-center space-x-2">
                  <FormInput className="h-4 w-4" />
                  <div>
                    <span>Campos e Formulários</span>
                    <p className="text-sm text-muted-foreground mt-1">Cores dos campos de texto, caixas de seleção e bordas</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="inputBackground"
                      render={({ field }) => (
                        <FormItem>
                          <ColorInput
                            value={field.value || "#f7f9fa"}
                            onChange={field.onChange}
                            label="Fundo dos Campos - Cor de fundo das caixas de texto e seleção"
                            testId="color-input-bg"
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
                            label="Borda dos Campos - Cor da borda ao redor dos campos de texto"
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
                            label="Borda Ativa - Cor da borda quando você clica em um campo"
                            testId="color-focus-border"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Containers */}
              <AccordionItem value="containers" data-testid="accordion-containers">
                <AccordionTrigger className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <div>
                    <span>Cards e Janelas</span>
                    <p className="text-sm text-muted-foreground mt-1">Cores dos cartões, janelas e caixas de conteúdo</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="cardBackground"
                      render={({ field }) => (
                        <FormItem>
                          <ColorInput
                            value={field.value || "#ffffff"}
                            onChange={field.onChange}
                            label="Fundo dos Cards - Cor de fundo dos cartões e caixas de informação"
                            testId="color-card-bg"
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
                            label="Texto dos Cards - Cor do texto dentro dos cards"
                            testId="color-card-text"
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
                            label="Fundo das Janelas - Cor das janelas que aparecem sobre o conteúdo"
                            testId="color-popover-bg"
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
                            label="Texto das Janelas - Cor do texto das janelas flutuantes"
                            testId="color-popover-text"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Charts */}
              <AccordionItem value="charts" data-testid="accordion-charts">
                <AccordionTrigger className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <div>
                    <span>Gráficos e Estatísticas</span>
                    <p className="text-sm text-muted-foreground mt-1">Cores das barras, linhas e elementos dos gráficos</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="chart1Color"
                      render={({ field }) => (
                        <FormItem>
                          <ColorInput
                            value={field.value || "#277677"}
                            onChange={field.onChange}
                            label="Gráfico Cor 1 - Primeira cor usada em gráficos e estatísticas"
                            testId="color-chart-1"
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
                            value={field.value || "#277677"}
                            onChange={field.onChange}
                            label="Gráfico Cor 2 - Segunda cor usada em gráficos"
                            testId="color-chart-2"
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
                            value={field.value || "#277677"}
                            onChange={field.onChange}
                            label="Gráfico Cor 3 - Terceira cor usada em gráficos"
                            testId="color-chart-3"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="chart4Color"
                      render={({ field }) => (
                        <FormItem>
                          <ColorInput
                            value={field.value || "#277677"}
                            onChange={field.onChange}
                            label="Gráfico Cor 4 - Quarta cor usada em gráficos"
                            testId="color-chart-4"
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
                            value={field.value || "#277677"}
                            onChange={field.onChange}
                            label="Gráfico Cor 5 - Quinta cor usada em gráficos"
                            testId="color-chart-5"
                          />
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