import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import ClientForm from "@/pages/ClientForm";
import PetForm from "@/pages/PetForm";
import Guides from "@/pages/Guides";
import GuideForm from "@/pages/GuideForm";
import Plans from "@/pages/Plans";
import PlanForm from "@/pages/PlanForm";
import Network from "@/pages/Network";
import NetworkForm from "@/pages/NetworkForm";
import FAQ from "@/pages/FAQ";
import ContactSubmissions from "@/pages/ContactSubmissions";
import Settings from "@/pages/Settings";
import Administration from "@/pages/Administration";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import type { ThemeSettings } from "@shared/schema";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/clients" component={Clients} />
        <Route path="/clients/new" component={ClientForm} />
        <Route path="/clients/:id/edit" component={ClientForm} />
        <Route path="/clients/:clientId/pets/new" component={PetForm} />
        <Route path="/pets/:id/edit" component={PetForm} />
        <Route path="/guides" component={Guides} />
        <Route path="/guides/new" component={GuideForm} />
        <Route path="/guides/:id/edit" component={GuideForm} />
        <Route path="/plans" component={Plans} />
        <Route path="/plans/new" component={PlanForm} />
        <Route path="/plans/:id/edit" component={PlanForm} />
        <Route path="/network" component={Network} />
        <Route path="/network/new" component={NetworkForm} />
        <Route path="/network/:id/edit" component={NetworkForm} />
        <Route path="/faq" component={FAQ} />
        <Route path="/contact-submissions" component={ContactSubmissions} />
        <Route path="/settings" component={Settings} />
        <Route path="/administration" component={Administration} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

// Function to apply theme settings to CSS variables
const applyThemeSettings = (themeSettings: ThemeSettings) => {
  const root = document.documentElement;
  
  // Foundation
  root.style.setProperty('--background', themeSettings.backgroundColor || '#faf9f7');
  root.style.setProperty('--foreground', themeSettings.textColor || '#1a1a1a');
  root.style.setProperty('--muted', themeSettings.mutedBackgroundColor || '#e0e0e0');
  root.style.setProperty('--muted-foreground', themeSettings.mutedTextColor || '#1a1a1a');
  
  // Typography
  root.style.setProperty('--font-sans', `'${themeSettings.sansSerifFont || 'DM Sans'}', sans-serif`);
  root.style.setProperty('--font-serif', `'${themeSettings.serifFont || 'Georgia'}', serif`);
  root.style.setProperty('--font-mono', `'${themeSettings.monospaceFont || 'Fira Code'}', monospace`);
  
  // Shape & Spacing
  root.style.setProperty('--radius', `${themeSettings.borderRadius || '0.5'}rem`);
  
  // Actions
  root.style.setProperty('--primary', themeSettings.primaryBackground || '#277677');
  root.style.setProperty('--primary-foreground', themeSettings.primaryText || '#ffffff');
  root.style.setProperty('--secondary', themeSettings.secondaryBackground || '#0f1419');
  root.style.setProperty('--secondary-foreground', themeSettings.secondaryText || '#ffffff');
  root.style.setProperty('--accent', themeSettings.accentBackground || '#e3ecf6');
  root.style.setProperty('--accent-foreground', themeSettings.accentText || '#277677');
  root.style.setProperty('--destructive', themeSettings.destructiveBackground || '#277677');
  root.style.setProperty('--destructive-foreground', themeSettings.destructiveText || '#ffffff');
  
  // Forms
  root.style.setProperty('--input', themeSettings.inputBackground || '#f7f9fa');
  root.style.setProperty('--border', themeSettings.inputBorder || '#e1eaef');
  root.style.setProperty('--ring', themeSettings.focusBorder || '#277677');
  
  // Containers
  root.style.setProperty('--card', themeSettings.cardBackground || '#ffffff');
  root.style.setProperty('--card-foreground', themeSettings.cardText || '#1a1a1a');
  root.style.setProperty('--popover', themeSettings.popoverBackground || '#ffffff');
  root.style.setProperty('--popover-foreground', themeSettings.popoverText || '#1a1a1a');
  
  // Sidebar (additional mapping)
  root.style.setProperty('--sidebar', themeSettings.cardBackground || '#ffffff');
  root.style.setProperty('--sidebar-foreground', themeSettings.cardText || '#1a1a1a');
  root.style.setProperty('--sidebar-primary', themeSettings.primaryBackground || '#277677');
  root.style.setProperty('--sidebar-primary-foreground', themeSettings.primaryText || '#ffffff');
  root.style.setProperty('--sidebar-accent', themeSettings.accentBackground || '#e3ecf6');
  root.style.setProperty('--sidebar-accent-foreground', themeSettings.accentText || '#277677');
  root.style.setProperty('--sidebar-border', themeSettings.inputBorder || '#e1eaef');
  root.style.setProperty('--sidebar-ring', themeSettings.focusBorder || '#277677');
  
  // Charts
  root.style.setProperty('--chart-1', themeSettings.chart1Color || '#277677');
  root.style.setProperty('--chart-2', themeSettings.chart2Color || '#277677');
  root.style.setProperty('--chart-3', themeSettings.chart3Color || '#277677');
  root.style.setProperty('--chart-4', themeSettings.chart4Color || '#277677');
  root.style.setProperty('--chart-5', themeSettings.chart5Color || '#277677');
};

function App() {
  // Load and apply saved theme settings on app initialization
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const response = await fetch('/api/settings/theme');
        if (response.ok) {
          const themeSettings: ThemeSettings = await response.json();
          applyThemeSettings(themeSettings);
        }
      } catch (error) {
        console.log('Theme settings not available, using default theme');
      }
    };

    loadThemeSettings();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
