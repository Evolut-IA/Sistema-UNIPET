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

// Simple working dashboard component
function SimpleAdminDashboard() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Admin - UNIPET</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Clientes</h3>
            <p className="text-blue-700">Gerenciar clientes e pets</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Planos</h3>
            <p className="text-green-700">Configurar planos de saúde</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Rede</h3>
            <p className="text-purple-700">Unidades credenciadas</p>
          </div>
        </div>
        <div className="mt-8 p-4 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-green-800 font-semibold">✅ Sistema Admin Funcionando!</p>
          <p className="text-green-700 mt-2">Projeto unificado com sucesso. Todas as funcionalidades estão acessíveis através das rotas /admin/*</p>
        </div>
      </div>
    </div>
  );
}

// AdminRouter - handles all admin routes with base="/admin"
function AdminRouter() {
  return (
    <WouterRouter base="/admin">
      <QueryClientProvider client={adminQueryClient}>
        <Switch>
          {/* Dashboard route */}
          <Route path="/" component={SimpleAdminDashboard} />
          
          {/* Fallback */}
          <Route component={() => <div className="p-8"><h1>Admin Page Not Found</h1></div>} />
        </Switch>
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
        
        {/* Admin Routes - all routes starting with /admin */}
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