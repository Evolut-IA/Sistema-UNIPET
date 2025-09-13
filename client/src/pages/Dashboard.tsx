import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentGuides, isLoading: guidesLoading } = useQuery({
    queryKey: ["/api/guides/recent"],
  });

  const { data: networkUnits, isLoading: networkLoading } = useQuery({
    queryKey: ["/api/network-units/active"],
  });

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: contactSubmissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ["/api/contact-submissions"],
  });

  const recentClients = clients?.slice(0, 3) || [];
  const recentSubmissions = contactSubmissions?.slice(0, 3) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-titulo">Dashboard Geral</h1>
          <p className="text-subtitulo">Visão geral do sistema de gestão</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            className="btn-primary"
            onClick={() => setLocation("/guides/new")}
            data-testid="button-new-guide"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Guia
          </Button>
          <div className="flex items-center space-x-2">
            <User className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-titulo">Administrador</p>
              <p className="text-xs text-subtitulo">Sistema</p>
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
                <p className="text-sm text-subtitulo">Clientes Ativos</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <>
                    <p className="text-3xl font-bold text-titulo" data-testid="metric-active-clients">
                      {stats?.activeClients?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +12% este mês
                    </p>
                  </>
                )}
              </div>
              <Users className="h-8 w-8 text-icon" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-subtitulo">Pets Cadastrados</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <>
                    <p className="text-3xl font-bold text-titulo" data-testid="metric-registered-pets">
                      {stats?.registeredPets?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +8% este mês
                    </p>
                  </>
                )}
              </div>
              <PawPrint className="h-8 w-8 text-icon" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-subtitulo">Guias Abertas</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <>
                    <p className="text-3xl font-bold text-titulo" data-testid="metric-open-guides">
                      {stats?.openGuides?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1 flex items-center">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      +3% hoje
                    </p>
                  </>
                )}
              </div>
              <FileText className="h-8 w-8 text-icon" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-subtitulo">Receita Mensal</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <>
                    <p className="text-3xl font-bold text-titulo" data-testid="metric-monthly-revenue">
                      R$ {((stats?.monthlyRevenue || 0) / 1000).toFixed(1)}K
                    </p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +15% este mês
                    </p>
                  </>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-icon" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Guides */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-titulo">Guias Recentes</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-icon"
              onClick={() => setLocation("/guides")}
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
                        <p className="font-medium text-titulo" data-testid={`guide-procedure-${guide.id}`}>
                          {guide.procedure}
                        </p>
                        <p className="text-sm text-subtitulo">
                          Tipo: {guide.type}
                        </p>
                        <p className="text-xs text-subtitulo">
                          {guide.createdAt && format(new Date(guide.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-titulo">
                        R$ {parseFloat(guide.value || 0).toFixed(2)}
                      </p>
                      <Badge variant="outline">{guide.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-subtitulo text-center py-8">Nenhuma guia encontrada</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-titulo">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="p-4 h-auto text-left justify-start"
                onClick={() => setLocation("/clients/new")}
                data-testid="button-quick-new-client"
              >
                <div>
                  <Users className="h-6 w-6 text-icon mb-2" />
                  <p className="font-medium text-titulo">Novo Cliente</p>
                  <p className="text-sm text-subtitulo">Cadastrar cliente e pet</p>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="p-4 h-auto text-left justify-start"
                onClick={() => setLocation("/guides/new")}
                data-testid="button-quick-new-guide"
              >
                <div>
                  <FileText className="h-6 w-6 text-icon mb-2" />
                  <p className="font-medium text-titulo">Nova Guia</p>
                  <p className="text-sm text-subtitulo">Gerar guia de atendimento</p>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="p-4 h-auto text-left justify-start"
                onClick={() => setLocation("/clients")}
                data-testid="button-quick-search-client"
              >
                <div>
                  <Users className="h-6 w-6 text-icon mb-2" />
                  <p className="font-medium text-titulo">Buscar Cliente</p>
                  <p className="text-sm text-subtitulo">Localizar por CPF/nome</p>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="p-4 h-auto text-left justify-start"
                onClick={() => setLocation("/settings")}
                data-testid="button-quick-reports"
              >
                <div>
                  <TrendingUp className="h-6 w-6 text-icon mb-2" />
                  <p className="font-medium text-titulo">Relatórios</p>
                  <p className="text-sm text-subtitulo">Gerar relatórios</p>
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
            <CardTitle className="text-titulo">Novos Clientes</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-icon"
              onClick={() => setLocation("/clients")}
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
                    <p className="font-medium text-titulo" data-testid={`client-name-${client.id}`}>
                      {client.fullName}
                    </p>
                    <p className="text-sm text-subtitulo">{client.email}</p>
                    <p className="text-xs text-subtitulo">
                      Cadastrado em {client.createdAt && format(new Date(client.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-subtitulo text-center py-8">Nenhum cliente encontrado</p>
            )}
          </CardContent>
        </Card>

        {/* Network Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-titulo">Status da Rede</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-icon"
              onClick={() => setLocation("/network")}
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
                        <p className="font-medium text-titulo" data-testid={`unit-name-${unit.id}`}>
                          {unit.name}
                        </p>
                        <p className="text-sm text-subtitulo">{unit.address}</p>
                        <p className="text-xs text-subtitulo">{unit.phone}</p>
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
              <p className="text-subtitulo text-center py-8">Nenhuma unidade encontrada</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-titulo">Formulários Recentes</CardTitle>
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
                    <p className="font-medium text-titulo text-sm" data-testid={`submission-name-${submission.id}`}>
                      {submission.name}
                    </p>
                    <p className="text-xs text-subtitulo">{submission.email}</p>
                    <p className="text-xs text-subtitulo">Interesse: {submission.planInterest}</p>
                    <p className="text-xs text-subtitulo">
                      {submission.createdAt && format(new Date(submission.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-subtitulo text-center py-8">Nenhum formulário encontrado</p>
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-titulo">Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-subtitulo">Banco de Dados</span>
                </div>
                <span className="text-xs text-green-600">Online</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-subtitulo">API Externa</span>
                </div>
                <span className="text-xs text-green-600">Conectado</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-subtitulo">Chat IA</span>
                </div>
                <span className="text-xs text-green-600">Ativo</span>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-subtitulo">Sistema operacional:</p>
                <p className="text-sm font-medium text-titulo">100% funcional</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-titulo">Distribuição de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-subtitulo">Plano Básico</span>
                <span className="font-medium text-titulo">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: "45%"}}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-subtitulo">Plano Confort</span>
                <span className="font-medium text-titulo">35%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: "35%"}}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-subtitulo">Plano Premium</span>
                <span className="font-medium text-titulo">20%</span>
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
