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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertThemeSettingsSchema } from "@shared/schema";
import { Palette, Type, Layout, MousePointer, FormInput, Package, BarChart3, Save } from "lucide-react";

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

// Color input component with picker
const ColorInput = ({ value, onChange, label, testId }: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  testId: string;
}) => {
  return (
    <div className="flex items-center space-x-3">
      <div 
        className="w-10 h-10 rounded border cursor-pointer flex-shrink-0"
        style={{ backgroundColor: value }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full opacity-0 cursor-pointer"
          data-testid={testId}
        />
      </div>
      <div className="flex-1">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="mt-1"
          data-testid={`${testId}-input`}
        />
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
          <span>Editor de Tema</span>
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
                  <span>Foundation</span>
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
                            label="Background color"
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
                            label="Text color"
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
                            label="Muted background color"
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
                            label="Muted text color"
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
                  <span>Typography</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="sansSerifFont"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sans-serif font</FormLabel>
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
                          <FormLabel>Serif font</FormLabel>
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
                          <FormLabel>Monospace font</FormLabel>
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
                  <span>Shape & Spacing</span>
                </AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="borderRadius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Border radius</FormLabel>
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
                  <span>Actions</span>
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
                            label="Primary background"
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
                            label="Primary text"
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
                            label="Secondary background"
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
                            label="Secondary text"
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
                            label="Accent background"
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
                            label="Accent text"
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
                            label="Destructive background"
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
                            label="Destructive text"
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
                  <span>Forms</span>
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
                            label="Input background"
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
                            label="Input border"
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
                            label="Focus border"
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
                  <span>Containers</span>
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
                            label="Card background"
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
                            label="Card text"
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
                            label="Popover background"
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
                            label="Popover text"
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
                  <span>Charts</span>
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
                            label="Chart 1"
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
                            label="Chart 2"
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
                            label="Chart 3"
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
                            label="Chart 4"
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
                            label="Chart 5"
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
                <span>{saveThemeMutation.isPending ? "Salvando..." : "Salvar Tema"}</span>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}