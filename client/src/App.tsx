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

function App() {
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
