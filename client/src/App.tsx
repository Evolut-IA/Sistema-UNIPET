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
import { applyThemeToCSSVariables } from "@/lib/theme-defaults";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/clientes" component={Clients} />
        <Route path="/clientes/novo" component={ClientForm} />
        <Route path="/clientes/:id/editar" component={ClientForm} />
        <Route path="/clientes/:clientId/pets/novo" component={PetForm} />
        <Route path="/pets/:id/editar" component={PetForm} />
        <Route path="/guias" component={Guides} />
        <Route path="/guias/novo" component={GuideForm} />
        <Route path="/guias/:id/editar" component={GuideForm} />
        <Route path="/planos" component={Plans} />
        <Route path="/planos/novo" component={PlanForm} />
        <Route path="/planos/:id/editar" component={PlanForm} />
        <Route path="/rede" component={Network} />
        <Route path="/rede/novo" component={NetworkForm} />
        <Route path="/rede/:id/editar" component={NetworkForm} />
        <Route path="/perguntas-frequentes" component={FAQ} />
        <Route path="/formularios" component={ContactSubmissions} />
        <Route path="/configuracoes" component={Settings} />
        <Route path="/administracao" component={Administration} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}


function App() {
  // Load and apply saved theme settings on app initialization
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const response = await fetch('/api/settings/theme');
        if (response.ok) {
          const themeSettings: ThemeSettings = await response.json();
          applyThemeToCSSVariables(themeSettings);
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
