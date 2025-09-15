import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";
import type { Client, Guide, NetworkUnit, ContactSubmission } from "@shared/schema";
import {
  Users,
  PawPrint,
  FileText,
  TrendingUp,
  Plus,
  User,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: stats = {} as any, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: allGuides = [], isLoading: guidesLoading, isError: guidesError } = useQuery<Guide[]>({
    queryKey: ["/api/guides"],
  });

  const { data: networkUnits = [], isLoading: networkLoading, isError: networkError } = useQuery<NetworkUnit[]>({
    queryKey: ["/api/network-units/active"],
  });

  const { data: clients = [], isLoading: clientsLoading, isError: clientsError } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: contactSubmissions = [], isLoading: submissionsLoading, isError: submissionsError } = useQuery<ContactSubmission[]>({
    queryKey: ["/api/contact-submissions"],
  });

  const { data: plans = [], isLoading: plansLoading, isError: plansError } = useQuery<any[]>({
    queryKey: ["/api/plans"],
  });

  const { data: planDistribution = [], isLoading: distributionLoading, isError: distributionError } = useQuery<{
    planId: string;
    planName: string;
    petCount: number;
    percentage: number;
  }[]>({
    queryKey: ["/api/dashboard/plan-distribution"],
  });

  const recentClients = clients.slice(0, 3);
  const recentSubmissions = contactSubmissions.slice(0, 3);

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">Dashboard Geral</h1>
          <p className="text-sm text-muted-foreground">Visão geral do sistema de gestão</p>
        </div>
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 xs:gap-4">
          <Button 
            className="btn-primary w-full xs:w-auto"
            onClick={() => setLocation("/guias/novo")}
            data-testid="button-new-guide"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Guia
          </Button>
          <div className="flex items-center gap-2 p-2 xs:p-0">
            <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-foreground truncate">Administrador</p>
              <p className="text-xs text-muted-foreground">Sistema</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Clientes Ativos</p>
                {statsLoading ? (
                  <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mt-1" />
                ) : (
                  <>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate" data-testid="metric-active-clients">
                      {stats?.activeClients?.toLocaleString() || 0}
                    </p>
                  </>
                )}
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Pets Cadastrados</p>
                {statsLoading ? (
                  <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mt-1" />
                ) : (
                  <>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate" data-testid="metric-registered-pets">
                      {stats?.registeredPets?.toLocaleString() || 0}
                    </p>
                  </>
                )}
              </div>
              <PawPrint className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Receita Mensal</p>
                {statsLoading ? (
                  <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 mt-1" />
                ) : (
                  <>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate" data-testid="metric-monthly-revenue">
                      R$ {(stats?.monthlyRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </>
                )}
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-foreground min-w-0">Todas as Guias</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary"
              onClick={() => setLocation("/guias")}
              data-testid="button-view-all-guides"
            >
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            {guidesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : guidesError ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Erro ao carregar guias</p>
              </div>
            ) : allGuides?.length ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Total de Guias</span>
                  <span className="text-xl font-bold text-foreground">{allGuides.length}</span>
                </div>
                {allGuides.slice(0, 5).map((guide: any) => (
                  <div key={guide.id} className="flex items-center justify-between p-3 bg-background border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {guide.procedure}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cliente: {guide.clientName || 'N/A'} • Pet: {guide.petName || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        guide.status === 'open' 
                          ? 'bg-green-100 text-green-800' 
                          : guide.status === 'closed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {guide.status === 'open' ? 'Aberta' : guide.status === 'closed' ? 'Fechada' : 'Cancelada'}
                      </span>
                      {guide.value && (
                        <span className="text-sm font-medium text-foreground">
                          R$ {parseFloat(guide.value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {allGuides.length > 5 && (
                  <div className="text-center pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setLocation("/guias")}
                    >
                      Ver mais {allGuides.length - 5} guias
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhuma guia encontrada</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumos das Páginas */}
      <div className="space-y-6">
        {/* Primeiro Par: Formulários e Planos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumo de Formulários */}
          <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-foreground min-w-0">Resumo de Formulários</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary"
              onClick={() => setLocation("/formularios")}
              data-testid="button-view-all-submissions"
            >
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            {submissionsLoading || plansLoading ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-8" />
                    </div>
                  ))}
                </div>
              </div>
            ) : contactSubmissions?.length ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Total de Formulários</span>
                  <span className="text-xl font-bold text-foreground">{contactSubmissions.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {plans.map((plan: any) => {
                    const count = contactSubmissions.filter((s: any) => 
                      s.planInterest?.toLowerCase() === plan.name?.toLowerCase()
                    ).length;
                    return (
                      <div key={plan.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm text-muted-foreground">Interesse no plano {plan.name}</span>
                        <span className="text-xl font-bold text-primary">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhum formulário encontrado</p>
            )}
          </CardContent>
        </Card>

        {/* Resumo de Planos */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-foreground min-w-0">Resumo de Planos</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary"
              onClick={() => setLocation("/planos")}
              data-testid="button-view-all-plans"
            >
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-8" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Total de Planos</span>
                  <span className="text-xl font-bold text-foreground">{stats?.totalPlans || 0}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">Planos Ativos</span>
                    <span className="text-xl font-bold text-primary">{stats?.activePlans || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">Planos Inativos</span>
                    <span className="text-xl font-bold text-destructive">{stats?.inactivePlans || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        {/* Segundo Par: Rede e Clientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumo da Rede */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-foreground min-w-0">Resumo da Rede</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary"
              onClick={() => setLocation("/rede")}
              data-testid="button-view-all-network"
            >
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            {networkLoading ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-8" />
                    </div>
                  ))}
                </div>
              </div>
            ) : networkUnits?.length ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Total de Unidades</span>
                  <span className="text-xl font-bold text-foreground">{networkUnits.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">Unidades Ativas</span>
                    <span className="text-xl font-bold text-primary">
                      {networkUnits.filter((u: any) => u.isActive).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">Unidades Inativas</span>
                    <span className="text-xl font-bold text-destructive">
                      {networkUnits.filter((u: any) => !u.isActive).length}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhuma unidade encontrada</p>
            )}
          </CardContent>
        </Card>

        {/* Resumo de Clientes */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-foreground min-w-0">Resumo de Clientes</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary"
              onClick={() => setLocation("/clientes")}
              data-testid="button-view-all-clients"
            >
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            {clientsLoading ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-8" />
                    </div>
                  ))}
                </div>
              </div>
            ) : clients?.length ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Total de Clientes</span>
                  <span className="text-xl font-bold text-foreground">{clients.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">Clientes Ativos</span>
                    <span className="text-xl font-bold text-primary">
                      {clients.filter((c: any) => c.isActive !== false).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">Com Pets Cadastrados</span>
                    <span className="text-xl font-bold text-muted-foreground">
                      {clients.filter((c: any) => c.pets && c.pets.length > 0).length}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhum cliente encontrado</p>
            )}
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Additional sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground min-w-0">Distribuição de Planos</CardTitle>
              {!distributionLoading && !distributionError && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Atualizado
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {distributionLoading ? (
              <div className="space-y-4">
                {/* Loading do resumo total */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <Skeleton className="h-4 w-40" />
                  <div className="text-right space-y-1">
                    <Skeleton className="h-6 w-8" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                
                {/* Loading dos planos */}
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-3 h-3 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : distributionError ? (
              <Alert>
                <AlertDescription>
                  Erro ao carregar distribuição de planos. Tente novamente.
                </AlertDescription>
              </Alert>
            ) : planDistribution?.length && planDistribution.some(plan => plan.petCount > 0) ? (
              <div className="space-y-4">
                {/* Resumo total */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Total de Pets com Planos</span>
                    {planDistribution.some(plan => plan.petCount > 0) && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Dados atualizados"></div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-foreground">
                      {planDistribution.reduce((sum, plan) => sum + plan.petCount, 0)}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {planDistribution.reduce((sum, plan) => sum + plan.percentage, 0)}% total
                    </div>
                  </div>
                </div>
                
                {/* Distribuição por plano */}
                {planDistribution.map((plan, index: number) => {
                  // Cores específicas para cada plano
                  const planColors = {
                    'BASIC': { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-100' },
                    'COMFORT': { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100' },
                    'PLATINUM': { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-100' },
                    'INFINITY': { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-100' },
                    'PREMIUM': { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100' }
                  };
                  
                  const colors = planColors[plan.planName as keyof typeof planColors] || 
                    { bg: 'bg-gray-500', text: 'text-gray-700', light: 'bg-gray-100' };
                  
                  return (
                    <div key={plan.planId} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${colors.bg}`}></div>
                          <span className="text-sm font-medium text-foreground">{plan.planName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {plan.petCount} pet{plan.petCount !== 1 ? 's' : ''}
                          </span>
                          <span className={`text-sm font-bold ${colors.text} min-w-[3rem] text-right`}>
                            {plan.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div 
                          className={`${colors.bg} h-3 rounded-full transition-all duration-500 ease-in-out`} 
                          style={{width: `${plan.percentage}%`}}
                          role="progressbar"
                          aria-valuenow={plan.percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${plan.planName}: ${plan.percentage}% (${plan.petCount} pets)`}
                          title={`${plan.planName}: ${plan.petCount} pet${plan.petCount !== 1 ? 's' : ''} (${plan.percentage}%)`}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : planDistribution?.length ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <PawPrint className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">
                    Planos disponíveis, mas nenhum pet associado
                  </p>
                </div>
                
                {/* Mostrar planos mesmo sem pets */}
                {planDistribution.map((plan) => {
                  const planColors = {
                    'BASIC': { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-100' },
                    'COMFORT': { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100' },
                    'PLATINUM': { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-100' },
                    'INFINITY': { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-100' },
                    'PREMIUM': { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100' }
                  };
                  
                  const colors = planColors[plan.planName as keyof typeof planColors] || 
                    { bg: 'bg-gray-500', text: 'text-gray-700', light: 'bg-gray-100' };
                  
                  return (
                    <div key={plan.planId} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colors.bg} opacity-50`}></div>
                        <span className="text-sm text-muted-foreground">{plan.planName}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">0 pets (0%)</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <PawPrint className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  Nenhum plano ativo encontrado
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure planos ativos para ver a distribuição
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
