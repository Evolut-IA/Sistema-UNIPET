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
import Procedures from "@/pages/Procedures";
import ContactSubmissions from "@/pages/ContactSubmissions";
import Settings from "@/pages/Settings";
import Administration from "@/pages/Administration";
import UnitDashboard from "@/pages/UnitDashboard";
import UnitRoute from "@/components/UnitRoute";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { useLocation } from "wouter";
import type { ThemeSettings } from "@shared/schema";
import { applyThemeToCSSVariables } from "@/lib/theme-defaults";

function Router() {
  return (
    <Switch>
      {/* Specific admin routes with Layout - more explicit routing */}
      <Route path="/" nest>
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
            <Route path="/procedimentos" component={Procedures} />
            <Route path="/perguntas-frequentes" component={FAQ} />
            <Route path="/formularios" component={ContactSubmissions} />
            <Route path="/configuracoes" component={Settings} />
            <Route path="/administracao" component={Administration} />
          </Switch>
        </Layout>
      </Route>
      
      {/* Unit routes without admin Layout - handle unit specific routes */}
      <Route path="/:slug" component={UnitRoute} />
      
      {/* Fallback 404 for unmatched routes */}
      <Route component={NotFound} />
    </Switch>
  );
}


function App() {
  // Theme is already loaded by theme-loader.js before React renders
  // This effect listens for theme updates and updates the cache
  useEffect(() => {
    // Listen for theme updates from the theme editor
    const handleThemeUpdate = (event: CustomEvent) => {
      const themeSettings = event.detail;
      // Update the cache for next page load
      localStorage.setItem('cached-theme', JSON.stringify(themeSettings));
      // Apply the new theme
      applyThemeToCSSVariables(themeSettings);
    };

    window.addEventListener('theme-updated' as any, handleThemeUpdate as any);
    
    return () => {
      window.removeEventListener('theme-updated' as any, handleThemeUpdate as any);
    };
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
