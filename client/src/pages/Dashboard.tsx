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
  ArrowUp,
  ArrowRight,
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

  const recentClients = clients.slice(0, 3);
  const recentSubmissions = contactSubmissions.slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Geral</h1>
          <p className="text-muted-foreground">Visão geral do sistema de gestão</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            className="btn-primary"
            onClick={() => setLocation("/guias/novo")}
            data-testid="button-new-guide"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Guia
          </Button>
          <div className="flex items-center space-x-2">
            <User className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Administrador</p>
              <p className="text-xs text-muted-foreground">Sistema</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <>
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-active-clients">
                      {stats?.activeClients?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +12% este mês
                    </p>
                  </>
                )}
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pets Cadastrados</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <>
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-registered-pets">
                      {stats?.registeredPets?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +8% este mês
                    </p>
                  </>
                )}
              </div>
              <PawPrint className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Guias Abertas</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <>
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-open-guides">
                      {stats?.openGuides?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1 flex items-center">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      +3% hoje
                    </p>
                  </>
                )}
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Mensal</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <>
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-monthly-revenue">
                      R$ {((stats?.monthlyRevenue || 0) / 1000).toFixed(1)}K
                    </p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +15% este mês
                    </p>
                  </>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Guides */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Guias Recentes</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary"
              onClick={() => setLocation("/guias")}
              data-testid="button-view-all-guides"
            >
              Ver todas
            </Button>
          </CardHeader>
          <CardContent>
            {guidesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-2 h-2 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentGuides?.length ? (
              <div className="space-y-4">
                {recentGuides.map((guide: any) => (
                  <div key={guide.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-foreground" data-testid={`guide-procedure-${guide.id}`}>
                          {guide.procedure}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tipo: {guide.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {guide.createdAt && format(new Date(guide.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        R$ {parseFloat(guide.value || 0).toFixed(2)}
                      </p>
                      <Badge variant="outline">{guide.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhuma guia encontrada</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="p-4 h-auto text-left justify-start"
                onClick={() => setLocation("/clientes/novo")}
                data-testid="button-quick-new-client"
              >
                <div>
                  <Users className="h-6 w-6 text-primary mb-2" />
                  <p className="font-medium text-foreground">Novo Cliente</p>
                  <p className="text-sm text-muted-foreground">Cadastrar cliente e pet</p>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="p-4 h-auto text-left justify-start"
                onClick={() => setLocation("/guias/novo")}
                data-testid="button-quick-new-guide"
              >
                <div>
                  <FileText className="h-6 w-6 text-primary mb-2" />
                  <p className="font-medium text-foreground">Nova Guia</p>
                  <p className="text-sm text-muted-foreground">Gerar guia de atendimento</p>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="p-4 h-auto text-left justify-start"
                onClick={() => setLocation("/clientes")}
                data-testid="button-quick-search-client"
              >
                <div>
                  <Users className="h-6 w-6 text-primary mb-2" />
                  <p className="font-medium text-foreground">Buscar Cliente</p>
                  <p className="text-sm text-muted-foreground">Localizar por CPF/nome</p>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="p-4 h-auto text-left justify-start"
                onClick={() => setLocation("/configuracoes")}
                data-testid="button-quick-reports"
              >
                <div>
                  <TrendingUp className="h-6 w-6 text-primary mb-2" />
                  <p className="font-medium text-foreground">Relatórios</p>
                  <p className="text-sm text-muted-foreground">Gerar relatórios</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Novos Clientes</CardTitle>
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
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border-b pb-3">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                ))}
              </div>
            ) : recentClients.length ? (
              <div className="space-y-3">
                {recentClients.map((client: any) => (
                  <div key={client.id} className="border-b pb-3 last:border-b-0">
                    <p className="font-medium text-foreground" data-testid={`client-name-${client.id}`}>
                      {client.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Cadastrado em {client.createdAt && format(new Date(client.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhum cliente encontrado</p>
            )}
          </CardContent>
        </Card>

        {/* Network Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Status da Rede</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary"
              onClick={() => setLocation("/rede")}
              data-testid="button-manage-network"
            >
              Gerenciar
            </Button>
          </CardHeader>
          <CardContent>
            {networkLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                ))}
              </div>
            ) : networkUnits?.length ? (
              <div className="space-y-4">
                {networkUnits.slice(0, 3).map((unit: any) => (
                  <div key={unit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${unit.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-medium text-foreground" data-testid={`unit-name-${unit.id}`}>
                          {unit.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{unit.address}</p>
                        <p className="text-xs text-muted-foreground">{unit.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={unit.isActive ? "default" : "secondary"}>
                        {unit.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                      {unit.googleMapsUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={unit.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhuma unidade encontrada</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Formulários Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {submissionsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32 mb-1" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                ))}
              </div>
            ) : recentSubmissions.length ? (
              <div className="space-y-3">
                {recentSubmissions.map((submission: any) => (
                  <div key={submission.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-foreground text-sm" data-testid={`submission-name-${submission.id}`}>
                      {submission.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{submission.email}</p>
                    <p className="text-xs text-muted-foreground">Interesse: {submission.planInterest}</p>
                    <p className="text-xs text-muted-foreground">
                      {submission.createdAt && format(new Date(submission.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhum formulário encontrado</p>
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Banco de Dados</span>
                </div>
                <span className="text-xs text-green-600">Online</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">API Externa</span>
                </div>
                <span className="text-xs text-green-600">Conectado</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Chat IA</span>
                </div>
                <span className="text-xs text-green-600">Ativo</span>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Sistema operacional:</p>
                <p className="text-sm font-medium text-foreground">100% funcional</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Distribuição de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plano Básico</span>
                <span className="font-medium text-foreground">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: "45%"}}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plano Confort</span>
                <span className="font-medium text-foreground">35%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: "35%"}}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plano Premium</span>
                <span className="font-medium text-foreground">20%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{width: "20%"}}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
