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

  const { data: recentGuides = [], isLoading: guidesLoading, isError: guidesError } = useQuery<Guide[]>({
    queryKey: ["/api/guides/recent"],
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
                <p className="text-xs sm:text-sm text-muted-foreground">Guias Abertas</p>
                {statsLoading ? (
                  <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mt-1" />
                ) : (
                  <>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate" data-testid="metric-open-guides">
                      {stats?.openGuides?.toLocaleString() || 0}
                    </p>
                  </>
                )}
              </div>
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
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
                      R$ {((stats?.monthlyRevenue || 0) / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}K
                    </p>
                  </>
                )}
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            </div>
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
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground min-w-0">Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Banco de Dados</span>
                </div>
                <span className="text-xs text-primary">Online</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-muted-foreground">API Externa</span>
                </div>
                <span className="text-xs text-primary">Conectado</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Chat IA</span>
                </div>
                <span className="text-xs text-primary">Ativo</span>
              </div>

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Sistema operacional:</p>
                <p className="text-sm font-medium text-foreground">100% funcional</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground min-w-0">Distribuição de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            {distributionLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : distributionError ? (
              <Alert>
                <AlertDescription>
                  Erro ao carregar distribuição de planos. Tente novamente.
                </AlertDescription>
              </Alert>
            ) : planDistribution?.length ? (
              <div className="space-y-3">
                {planDistribution.map((plan, index: number) => {
                  const chartColors = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4'];
                  const chartColor = chartColors[index % chartColors.length] || 'bg-chart-1';
                  
                  return (
                    <div key={plan.planId} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{plan.planName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">({plan.petCount} pets)</span>
                          <span className="font-medium text-foreground">{plan.percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className={`${chartColor} h-2 rounded-full`} style={{width: `${plan.percentage}%`}}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhum plano com pets encontrado</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
