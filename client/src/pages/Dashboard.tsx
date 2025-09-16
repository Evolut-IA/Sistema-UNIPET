import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DateFilterComponent } from "@/components/DateFilterComponent";
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
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { CalendarDate } from "@internationalized/date";
import { getDateRangeParams } from "@/lib/date-utils";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [dateFilter, setDateFilter] = useState<{
    startDate: CalendarDate | null;
    endDate: CalendarDate | null;
  }>({ startDate: null, endDate: null });

  const [debouncedDateFilter, setDebouncedDateFilter] = useState<{
    startDate: CalendarDate | null;
    endDate: CalendarDate | null;
  }>({ startDate: null, endDate: null });

  // Debounce date filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDateFilter(dateFilter);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [dateFilter]);

  const handleDateRangeChange = (startDate: CalendarDate | null, endDate: CalendarDate | null) => {
    setDateFilter({ startDate, endDate });
  };

  // Get date range parameters for API calls using debounced values
  const dateParams = getDateRangeParams(debouncedDateFilter.startDate, debouncedDateFilter.endDate);
  const hasDateFilter = Object.keys(dateParams).length > 0;

  const { data: stats = {} as any, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ["/api/dashboard/stats", dateParams],
    queryFn: async () => {
      const params = new URLSearchParams(dateParams);
      const response = await fetch(`/api/dashboard/stats?${params}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const { data: allGuides = [], isLoading: guidesLoading, isError: guidesError } = useQuery<Guide[]>({
    queryKey: ["/api/guides", dateParams],
    queryFn: async () => {
      const params = new URLSearchParams(dateParams);
      const response = await fetch(`/api/guides?${params}`);
      if (!response.ok) throw new Error('Failed to fetch guides');
      return response.json();
    },
  });

  const { data: networkUnits = [], isLoading: networkLoading, isError: networkError } = useQuery<NetworkUnit[]>({
    queryKey: ["/api/network-units/active", dateParams],
    queryFn: async () => {
      const params = new URLSearchParams(dateParams);
      const response = await fetch(`/api/network-units/active?${params}`);
      if (!response.ok) throw new Error('Failed to fetch network units');
      return response.json();
    },
  });

  const { data: clients = [], isLoading: clientsLoading, isError: clientsError } = useQuery<Client[]>({
    queryKey: ["/api/clients", dateParams],
    queryFn: async () => {
      const params = new URLSearchParams(dateParams);
      const response = await fetch(`/api/clients?${params}`);
      if (!response.ok) throw new Error('Failed to fetch clients');
      return response.json();
    },
  });

  const { data: contactSubmissions = [], isLoading: submissionsLoading, isError: submissionsError } = useQuery<ContactSubmission[]>({
    queryKey: ["/api/contact-submissions", dateParams],
    queryFn: async () => {
      const params = new URLSearchParams(dateParams);
      const response = await fetch(`/api/contact-submissions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch contact submissions');
      return response.json();
    },
  });

  const { data: plans = [], isLoading: plansLoading, isError: plansError } = useQuery<any[]>({
    queryKey: ["/api/plans", dateParams],
    queryFn: async () => {
      const params = new URLSearchParams(dateParams);
      const response = await fetch(`/api/plans?${params}`);
      if (!response.ok) throw new Error('Failed to fetch plans');
      return response.json();
    },
  });

  const { data: planDistribution = [], isLoading: distributionLoading, isError: distributionError } = useQuery<{
    planId: string;
    planName: string;
    petCount: number;
    percentage: number;
  }[]>({
    queryKey: ["/api/dashboard/plan-distribution", dateParams],
    queryFn: async () => {
      const params = new URLSearchParams(dateParams);
      const response = await fetch(`/api/dashboard/plan-distribution?${params}`);
      if (!response.ok) throw new Error('Failed to fetch plan distribution');
      return response.json();
    },
  });

  const { data: planRevenue = [], isLoading: revenueLoading, isError: revenueError } = useQuery<{
    planId: string;
    planName: string;
    petCount: number;
    monthlyPrice: number;
    totalRevenue: number;
  }[]>({
    queryKey: ["/api/dashboard/plan-revenue", dateParams],
    queryFn: async () => {
      const params = new URLSearchParams(dateParams);
      const response = await fetch(`/api/dashboard/plan-revenue?${params}`);
      if (!response.ok) throw new Error('Failed to fetch plan revenue');
      return response.json();
    },
  });

  // Memoize expensive calculations
  const recentClients = useMemo(() => clients.slice(0, 3), [clients]);
  const recentSubmissions = useMemo(() => contactSubmissions.slice(0, 3), [contactSubmissions]);

  // Memoize loading states
  const isAnyLoading = useMemo(() =>
    statsLoading || guidesLoading || distributionLoading || clientsLoading ||
    submissionsLoading || plansLoading || networkLoading || revenueLoading,
    [statsLoading, guidesLoading, distributionLoading, clientsLoading,
      submissionsLoading, plansLoading, networkLoading, revenueLoading]
  );

  // Memoize error states
  const hasErrors = useMemo(() =>
    statsError || guidesError || distributionError || clientsError ||
    submissionsError || plansError || networkError || revenueError,
    [statsError, guidesError, distributionError, clientsError,
      submissionsError, plansError, networkError, revenueError]
  );

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">Dashboard Geral</h1>
          <p className="text-sm text-muted-foreground">Visão geral do sistema de gestão</p>
        </div>
        <div className="flex items-center gap-2 p-2 xs:p-0">
          <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-foreground truncate">Administrador</p>
            <p className="text-xs text-muted-foreground">Sistema</p>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <DateFilterComponent
        onDateRangeChange={handleDateRangeChange}
        isLoading={isAnyLoading ||
          (dateFilter.startDate !== debouncedDateFilter.startDate ||
            dateFilter.endDate !== debouncedDateFilter.endDate)}
        initialRange={dateFilter}
      />

      {/* Error States */}
      {hasErrors && hasDateFilter && (
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao aplicar filtro de data. Tente novamente ou remova o filtro.
          </AlertDescription>
        </Alert>
      )}

      {/* Empty Results Warning */}
      {hasDateFilter && !isAnyLoading &&
        stats?.activeClients === 0 && allGuides?.length === 0 && (
          <Alert>
            <AlertDescription>
              Nenhum dado encontrado para o período selecionado. Tente expandir o intervalo de datas.
            </AlertDescription>
          </Alert>
        )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Receita no Período Selecionado</p>
                {statsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 mt-1" />
                    <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
                  </div>
                ) : (
                  <>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate" data-testid="metric-monthly-revenue">
                      R$ {(stats?.monthlyRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">Receita geral</p>
                      <p className="text-sm sm:text-base font-semibold text-foreground" data-testid="metric-total-revenue">
                        R$ {(stats?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Receita por Plano</p>
                {revenueLoading ? (
                  <Skeleton className="h-6 sm:h-8 w-full mt-1" />
                ) : revenueError ? (
                  <Alert className="mt-2">
                    <AlertDescription className="text-xs">
                      Erro ao carregar receita por plano
                    </AlertDescription>
                  </Alert>
                ) : planRevenue?.length && planRevenue.some(plan => plan.totalRevenue > 0) ? (
                  <div className="space-y-2 mt-2">
                    {planRevenue.map(plan => (
                      <div key={plan.planId} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-foreground truncate">{plan.planName}</span>
                        <span className="text-sm font-bold text-primary ml-2">
                          R$ {plan.totalRevenue.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2 mt-2">
                    <p className="text-xs text-muted-foreground">
                      Nenhuma receita encontrada
                    </p>
                  </div>
                )}
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Charts Grid - Two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Visão Geral em Gráficos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground min-w-0">Visão Geral em Gráficos</CardTitle>
            <p className="text-sm text-muted-foreground">Distribuição visual dos dados do sistema</p>
          </CardHeader>
          <CardContent className="flex justify-center">
            {isAnyLoading ? (
              <div className="flex items-center justify-center h-64 w-full">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <div className="w-full max-w-4xl">
                <ChartContainer
                config={{
                  formularios: {
                    label: "Formulários",
                    color: "var(--chart-1)",
                  },
                  planos: {
                    label: "Planos",
                    color: "var(--chart-1)",
                  },
                  rede: {
                    label: "Unidades de Rede",
                    color: "var(--chart-1)",
                  },
                  clientes: {
                    label: "Clientes",
                    color: "var(--chart-1)",
                  },
                  pets: {
                    label: "Pets",
                    color: "var(--chart-1)",
                  },
                  guias: {
                    label: "Guias",
                    color: "var(--chart-1)",
                  },
                }}
                className="h-72 w-full"
              >
                <BarChart
                  data={[
                    {
                      categoria: "Formulários",
                      categoriaShort: "Formulários",
                      total: contactSubmissions?.length || 0,
                      fill: "var(--color-formularios)",
                    },
                    {
                      categoria: "Planos",
                      categoriaShort: "Planos",
                      total: stats?.totalPlans || 0,
                      fill: "var(--color-planos)",
                    },
                    {
                      categoria: "Unidades",
                      categoriaShort: "Unidades",
                      total: networkUnits?.length || 0,
                      fill: "var(--color-rede)",
                    },
                    {
                      categoria: "Clientes",
                      categoriaShort: "Clientes",
                      total: clients?.length || 0,
                      fill: "var(--color-clientes)",
                    },
                    {
                      categoria: "Pets",
                      categoriaShort: "Pets",
                      total: stats?.registeredPets || 0,
                      fill: "var(--color-pets)",
                    },
                    {
                      categoria: "Guias",
                      categoriaShort: "Guias",
                      total: allGuides?.length || 0,
                      fill: "var(--color-guias)",
                    },
                  ]}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="categoriaShort"
                    tick={{ fontSize: 9 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={55}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                            <p className="font-medium text-foreground">{data.categoria}</p>
                            <p className="text-sm text-muted-foreground">
                              Total: <span className="font-medium text-foreground">{data.total}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar
                    dataKey="total"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribuição de Planos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground min-w-0">Distribuição de Planos</CardTitle>
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
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">Total de Pets com Planos</span>
                    {planDistribution.some(plan => plan.petCount > 0) && (
                      <div className="w-2 h-2 bg-chart-4 rounded-full" title="Dados atualizados"></div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-foreground">
                      {planDistribution.reduce((sum, plan) => sum + plan.petCount, 0)}
                    </span>
                    <div className="text-xs text-foreground">
                      {planDistribution.reduce((sum, plan) => sum + plan.percentage, 0)}% total
                    </div>
                  </div>
                </div>

                {/* Distribuição por plano */}
                {planDistribution.map((plan, index: number) => {
                  // Cores específicas para cada plano
                  const planColors = {
                    'BASIC': { bg: 'bg-chart-1', text: 'text-chart-1', light: 'bg-chart-1/20' },
                    'COMFORT': { bg: 'bg-chart-3', text: 'text-chart-3', light: 'bg-chart-3/20' },
                    'PLATINUM': { bg: 'bg-chart-2', text: 'text-chart-2', light: 'bg-chart-2/20' },
                    'INFINITY': { bg: 'bg-chart-3', text: 'text-chart-3', light: 'bg-chart-3/20' },
                    'PREMIUM': { bg: 'bg-chart-5', text: 'text-chart-5', light: 'bg-chart-5/20' }
                  };

                  const colors = planColors[plan.planName as keyof typeof planColors] ||
                    { bg: 'bg-muted-foreground', text: 'text-muted-foreground', light: 'bg-muted' };

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
                          style={{ width: `${plan.percentage}%` }}
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
                    'BASIC': { bg: 'bg-chart-1', text: 'text-chart-1', light: 'bg-chart-1/20' },
                    'COMFORT': { bg: 'bg-chart-3', text: 'text-chart-3', light: 'bg-chart-3/20' },
                    'PLATINUM': { bg: 'bg-chart-2', text: 'text-chart-2', light: 'bg-chart-2/20' },
                    'INFINITY': { bg: 'bg-chart-3', text: 'text-chart-3', light: 'bg-chart-3/20' },
                    'PREMIUM': { bg: 'bg-chart-5', text: 'text-chart-5', light: 'bg-chart-5/20' }
                  };

                  const colors = planColors[plan.planName as keyof typeof planColors] ||
                    { bg: 'bg-muted-foreground', text: 'text-muted-foreground', light: 'bg-muted' };

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
