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

// Select input component with same style as ColorInput
const SelectInput = ({ value, onChange, title, description, testId, options }: {
  value: string;
  onChange: (value: string) => void;
  title: string;
  description: string;
  testId: string;
  options: { value: string; label: string }[];
}) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-lg border-2 border-muted flex items-center justify-center flex-shrink-0 bg-muted">
        <Type className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex-1">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
      
      <div className="w-32">
        <Select onValueChange={onChange} value={value} data-testid={testId}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.flatMap((option, index) => [
              <SelectItem key={option.value} value={option.value} className="py-3 pl-10 pr-4">
                {option.label}
              </SelectItem>,
              ...(index < options.length - 1 ? [<Separator key={`separator-${option.value}`} />] : [])
            ])}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Number input component with same style as ColorInput
const NumberInput = ({ value, onChange, title, description, testId, unit, min, max, step }: {
  value: string;
  onChange: (value: string) => void;
  title: string;
  description: string;
  testId: string;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
}) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-lg border-2 border-muted flex items-center justify-center flex-shrink-0 bg-muted">
        <Layout className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex-1">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
      
      <div className="flex items-center space-x-2 w-32">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type="number"
          step={step}
          min={min}
          max={max}
          data-testid={testId}
          className="h-8"
        />
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
};

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
    queryKey: ["/admin/api/settings/theme"],
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
      await apiRequest("PUT", "/admin/api/settings/theme", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/api/settings/theme"] });
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
            <Accordion type="multiple" className="w-full">
              
              {/* Foundation */}
              <AccordionItem value="foundation" data-testid="accordion-foundation">
                <AccordionTrigger className="flex items-center space-x-2">
                  <Layout className="h-4 w-4" />
                  <div>
                    <span>Fundo e Texto Principal</span>
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
                            title="Fundo da Página"
                            description="Cor de fundo que aparece atrás de todo o conteúdo da página"
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
                            title="Texto Principal"
                            description="Cor dos títulos, cabeçalhos e textos mais importantes"
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
                            title="Fundo dos Cards"
                            description="Cor de fundo dos cartões, caixas e seções de conteúdo"
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
                            title="Texto Secundário"
                            description="Cor de subtítulos, descrições e textos menos importantes"
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
                    <span>Fontes do Sistema</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="sansSerifFont"
                      render={({ field }) => (
                        <FormItem>
                          <SelectInput
                            value={field.value || "DM Sans"}
                            onChange={field.onChange}
                            title="Fonte Principal"
                            description="Para títulos, botões e textos importantes"
                            testId="select-sans-serif"
                            options={fontOptions}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="serifFont"
                      render={({ field }) => (
                        <FormItem>
                          <SelectInput
                            value={field.value || "Georgia"}
                            onChange={field.onChange}
                            title="Fonte Elegante"
                            description="Para textos longos e conteúdo especial"
                            testId="select-serif"
                            options={serifFontOptions}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="monospaceFont"
                      render={({ field }) => (
                        <FormItem>
                          <SelectInput
                            value={field.value || "Fira Code"}
                            onChange={field.onChange}
                            title="Fonte de Código"
                            description="Para números, códigos e dados técnicos"
                            testId="select-monospace"
                            options={monospaceFontOptions}
                          />
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
                    <span>Arredondamento dos Elementos</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="borderRadius"
                    render={({ field }) => (
                      <FormItem>
                        <NumberInput
                          value={field.value || "0.5"}
                          onChange={field.onChange}
                          title="Nível de Arredondamento"
                          description="Quanto maior o valor, mais arredondados ficam os elementos"
                          testId="input-border-radius"
                          unit="rem"
                          min={0}
                          max={1.3}
                          step={0.1}
                        />
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
                    <span>Cores dos Botões</span>
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
                            title="Fundo do Botão Principal"
                            description="Cor de fundo dos botões mais importantes como 'Salvar'"
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
                            title="Texto do Botão Principal"
                            description="Cor do texto dentro dos botões principais"
                            testId="color-primary-text"
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
                            title="Fundo dos Elementos em Destaque"
                            description="Cor de fundo dos elementos em destaque como links e selecionados"
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
                            title="Contorno dos Elementos em Destaque"
                            description="Cor do contorno dos elementos em destaque"
                            testId="color-accent-text"
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
                    <span>Cores dos Campos</span>
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
                            title="Contorno dos Campos"
                            description="Cor do contorno das caixas de texto e campos de entrada"
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
                            title="Contorno dos Containers"
                            description="Cor do contorno ao redor dos containers e seções"
                            testId="color-input-border"
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
                    <span>Cores dos Cards</span>
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
                            title="Fundo dos Cards"
                            description="Cor de fundo dos cartões e caixas de informação"
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
                            title="Texto dos Cards"
                            description="Cor do texto dentro dos cards"
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
                            title="Fundo das Janelas"
                            description="Cor das janelas que aparecem sobre o conteúdo"
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
                            title="Texto das Janelas"
                            description="Cor do texto das janelas flutuantes"
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
                            title="Gráfico Cor 1"
                            description="Primeira cor usada em gráficos e estatísticas"
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
                            value={field.value || "#10b981"}
                            onChange={field.onChange}
                            title="Gráfico Cor 2"
                            description="Segunda cor usada em gráficos"
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
                            value={field.value || "#f59e0b"}
                            onChange={field.onChange}
                            title="Gráfico Cor 3"
                            description="Terceira cor usada em gráficos"
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
                            value={field.value || "#22c55e"}
                            onChange={field.onChange}
                            title="Gráfico Cor 4"
                            description="Quarta cor usada em gráficos"
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
                            value={field.value || "#ef4444"}
                            onChange={field.onChange}
                            title="Gráfico Cor 5"
                            description="Quinta cor usada em gráficos"
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