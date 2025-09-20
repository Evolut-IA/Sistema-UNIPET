import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense, lazy } from "react";
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
import { queryClient as adminQueryClient } from "./lib/admin/queryClient";

// Componente de loading global com fallback robusto
function GlobalLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{background: 'linear-gradient(to bottom right, var(--bg-teal), var(--bg-teal-dark))'}}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-6" style={{borderColor: 'var(--bg-gold)'}}></div>
        <div className="text-lg" style={{color: 'var(--text-gold)'}}>Carregando...</div>
      </div>
    </div>
  );
}

// Import admin pages
const AdminClients = lazy(() => import('./pages/admin/Clients'));
const AdminClientForm = lazy(() => import('./pages/admin/ClientForm'));
const AdminPetForm = lazy(() => import('./pages/admin/PetForm'));
const AdminGuides = lazy(() => import('./pages/admin/Guides'));
const AdminGuideForm = lazy(() => import('./pages/admin/GuideForm'));
const AdminPlans = lazy(() => import('./pages/admin/Plans'));
const AdminPlanForm = lazy(() => import('./pages/admin/PlanForm'));
const AdminNetwork = lazy(() => import('./pages/admin/Network'));
const AdminNetworkForm = lazy(() => import('./pages/admin/NetworkForm'));
const AdminProcedures = lazy(() => import('./pages/admin/Procedures'));
const AdminFAQ = lazy(() => import('./pages/admin/FAQ'));
const AdminContactSubmissions = lazy(() => import('./pages/admin/ContactSubmissions'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminAdministration = lazy(() => import('./pages/admin/Administration'));
const AdminUnitDashboard = lazy(() => import('./pages/admin/UnitDashboard'));
const AdminNotFound = lazy(() => import('./pages/admin/not-found'));

// AdminRouter - handles all admin routes with base="/admin"
function AdminRouter() {
  return (
    <WouterRouter base="/admin">
      <QueryClientProvider client={adminQueryClient}>
        <AdminLayout>
          <Switch>
            {/* Dashboard route */}
            <Route path="/" component={AdminDashboard} />
            
            {/* Client management routes */}
            <Route path="/clientes" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminClients />
              </Suspense>
            } />
            <Route path="/clientes/novo" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminClientForm />
              </Suspense>
            } />
            <Route path="/clientes/:id/editar" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminClientForm />
              </Suspense>
            } />
            <Route path="/clientes/:clientId/pets/novo" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminPetForm />
              </Suspense>
            } />
            
            {/* Pet management routes */}
            <Route path="/pets/:id/editar" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminPetForm />
              </Suspense>
            } />
            
            {/* Guide management routes */}
            <Route path="/guias" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminGuides />
              </Suspense>
            } />
            <Route path="/guias/novo" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminGuideForm />
              </Suspense>
            } />
            <Route path="/guias/:id/editar" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminGuideForm />
              </Suspense>
            } />
            
            {/* Plan management routes */}
            <Route path="/planos" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminPlans />
              </Suspense>
            } />
            <Route path="/planos/novo" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminPlanForm />
              </Suspense>
            } />
            <Route path="/planos/:id/editar" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminPlanForm />
              </Suspense>
            } />
            
            {/* Network management routes */}
            <Route path="/rede" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminNetwork />
              </Suspense>
            } />
            <Route path="/rede/novo" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminNetworkForm />
              </Suspense>
            } />
            <Route path="/rede/:id/editar" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminNetworkForm />
              </Suspense>
            } />
            
            {/* Other admin routes */}
            <Route path="/procedimentos" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminProcedures />
              </Suspense>
            } />
            <Route path="/perguntas-frequentes" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminFAQ />
              </Suspense>
            } />
            <Route path="/formularios" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminContactSubmissions />
              </Suspense>
            } />
            <Route path="/configuracoes" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminSettings />
              </Suspense>
            } />
            <Route path="/administracao" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminAdministration />
              </Suspense>
            } />
            
            {/* Unit Dashboard (special case) */}
            <Route path="/unidade/:slug" component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminUnitDashboard />
              </Suspense>
            } />
            
            {/* Fallback */}
            <Route component={() => 
              <Suspense fallback={<GlobalLoading />}>
                <AdminNotFound />
              </Suspense>
            } />
          </Switch>
        </AdminLayout>
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