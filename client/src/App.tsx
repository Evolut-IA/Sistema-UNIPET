import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Plans from "@/pages/plans";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import FAQ from "@/pages/faq";
import Network from "@/pages/network";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfUse from "@/pages/terms-of-use";
import CheckoutPage from "@/pages/checkout";
import CheckoutSuccessPage from "@/pages/checkout-success";
import CustomerLoginPage from "@/pages/customer-login";
import CustomerDashboard from "@/pages/customer-dashboard";
import CustomerPets from "@/pages/customer-pets";
import CustomerProfile from "@/pages/customer-profile";
import CustomerSurveys from "@/pages/customer-surveys";
import CustomerCoparticipation from "@/pages/customer-coparticipation";
import CustomerFinancial from "@/pages/customer-financial";
import TelemedicinePage from "@/pages/telemedicine";
import AdminLoginPage from "@/pages/admin-login";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ScrollToTop from "@/components/scroll-to-top";
import ErrorBoundary from "@/components/error-boundary";
import PageLayout from "@/components/layout/page-layout";

// Admin imports
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminLayout from "@/components/admin/Layout";
import AuthGuard from "@/components/admin/AuthGuard";
import { queryClient as adminQueryClient } from "./lib/admin/queryClient";

// Componente de loading global com fallback robusto
function GlobalLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-primary to-teal-dark">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-transparent border-gold rounded-full animate-spin mx-auto mb-6"></div>
        <div className="text-lg text-gold">Carregando...</div>
      </div>
    </div>
  );
}

// Import admin pages - direct imports for instant navigation
import AdminClients from './pages/admin/Clients';
import AdminClientForm from './pages/admin/ClientForm';
import AdminPetForm from './pages/admin/PetForm';
import AdminGuides from './pages/admin/Guides';
import AdminGuideForm from './pages/admin/GuideForm';
import AdminPlans from './pages/admin/Plans';
import AdminPlanForm from './pages/admin/PlanForm';
import AdminNetwork from './pages/admin/Network';
import AdminNetworkForm from './pages/admin/NetworkForm';
import AdminProcedures from './pages/admin/Procedures';
import AdminFAQ from './pages/admin/FAQ';
import AdminContactSubmissions from './pages/admin/ContactSubmissions';
import AdminSettings from './pages/admin/Settings';
import AdminAdministration from './pages/admin/Administration';
import AdminUnitDashboard from './pages/admin/UnitDashboard';
import AdminNotFound from './pages/admin/not-found';

// AdminRouter - handles all admin routes with base="/admin"
function AdminRouter() {
  return (
    <WouterRouter base="/admin">
      <QueryClientProvider client={adminQueryClient}>
        <AuthGuard>
          <AdminLayout>
          <Switch>
            {/* Dashboard route */}
            <Route path="/" component={AdminDashboard} />
            
            {/* Client management routes */}
            <Route path="/clientes" component={AdminClients} />
            <Route path="/clientes/novo" component={AdminClientForm} />
            <Route path="/clientes/:id/editar" component={AdminClientForm} />
            <Route path="/clientes/:clientId/pets/novo" component={AdminPetForm} />
            
            {/* Pet management routes */}
            <Route path="/pets/:id/editar" component={AdminPetForm} />
            
            {/* Guide management routes */}
            <Route path="/guias" component={AdminGuides} />
            <Route path="/guias/novo" component={AdminGuideForm} />
            <Route path="/guias/:id/editar" component={AdminGuideForm} />
            
            {/* Plan management routes */}
            <Route path="/planos" component={AdminPlans} />
            <Route path="/planos/novo" component={AdminPlanForm} />
            <Route path="/planos/:id/editar" component={AdminPlanForm} />
            
            {/* Network management routes */}
            <Route path="/rede" component={AdminNetwork} />
            <Route path="/rede/novo" component={AdminNetworkForm} />
            <Route path="/rede/:id/editar" component={AdminNetworkForm} />
            
            {/* Other admin routes */}
            <Route path="/procedimentos" component={AdminProcedures} />
            <Route path="/perguntas-frequentes" component={AdminFAQ} />
            <Route path="/formularios" component={AdminContactSubmissions} />
            <Route path="/configuracoes" component={AdminSettings} />
            <Route path="/administracao" component={AdminAdministration} />
            
            {/* Unit Dashboard (special case) */}
            <Route path="/unidade/:slug" component={AdminUnitDashboard} />
            
            {/* Fallback */}
            <Route component={AdminNotFound} />
          </Switch>
          </AdminLayout>
        </AuthGuard>
      </QueryClientProvider>
    </WouterRouter>
  );
}

// Componente de roteamento principal
function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        
        {/* Admin Login Route (must come before other admin routes) */}
        <Route path="/admin/login" component={AdminLoginPage} />
        
        {/* Admin Routes - all routes starting with /admin */}
        <Route path="/admin" component={AdminRouter} />
        <Route path="/admin/:rest*" component={AdminRouter} />
        
        {/* Checkout Routes (standalone) */}
        <Route path="/checkout/1" component={CheckoutPage} />
        <Route path="/checkout/2" component={CheckoutPage} />
        <Route path="/checkout/3" component={CheckoutPage} />
        <Route path="/checkout/4" component={CheckoutPage} />
        <Route path="/checkout/:planId?" component={CheckoutPage} />
        <Route path="/checkout/success" component={CheckoutSuccessPage} />
        
        {/* Customer Area Routes (standalone) */}
        <Route path="/customer/login" component={CustomerLoginPage} />
        <Route path="/customer/dashboard" component={CustomerDashboard} />
        <Route path="/customer/pets" component={CustomerPets} />
        <Route path="/customer/profile" component={CustomerProfile} />
        <Route path="/customer/surveys" component={CustomerSurveys} />
        <Route path="/customer/coparticipation" component={CustomerCoparticipation} />
        <Route path="/customer/financial" component={CustomerFinancial} />
        <Route path="/customer/telemedicine" component={TelemedicinePage} />
        
        {/* Public Routes with Layout */}
        <Route>
          <PageLayout>
            <div className="min-h-screen bg-background">
              <Header />
              <main>
                <Suspense fallback={<GlobalLoading />}>
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/planos" component={Plans} />
                  <Route path="/sobre" component={About} />
                  <Route path="/contato" component={Contact} />
                  <Route path="/faq" component={FAQ} />
                  <Route path="/rede-credenciada" component={Network} />
                  <Route path="/rede" component={Network} />
                  <Route path="/politica-privacidade" component={PrivacyPolicy} />
                  <Route path="/termos-uso" component={TermsOfUse} />
                  <Route component={NotFound} />
                </Switch>
              </Suspense>
              </main>
              <Footer />
            </div>
          </PageLayout>
        </Route>
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <ReactQueryDevtools initialIsOpen={false} />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;