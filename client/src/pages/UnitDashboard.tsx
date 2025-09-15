import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, FileText, User, PawPrint, MapPin, Clock, DollarSign, CheckCircle, XCircle, Eye } from "lucide-react";
import { Link } from "wouter";

interface NetworkUnit {
  id: string;
  name: string;
  address: string;
  urlSlug: string;
}

interface Guide {
  id: string;
  clientId: string;
  petId: string;
  type: string;
  procedure: string;
  procedureNotes?: string;
  generalNotes?: string;
  value?: string;
  status: string;
  unitStatus?: string;
  createdAt: string;
  client?: {
    name: string;
    email: string;
    phone: string;
  };
  pet?: {
    name: string;
    species: string;
    breed: string;
  };
}

interface AuthState {
  isAuthenticated: boolean;
  unit: NetworkUnit | null;
  token: string | null;
}

export default function UnitDashboard() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    unit: null,
    token: null
  });
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginData, setLoginData] = useState({ login: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Load guides when authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.unit) {
      loadGuides();
    }
  }, [authState.isAuthenticated, authState.unit]);

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/unit/verify-session", {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.valid && data.unit) {
          setAuthState({
            isAuthenticated: true,
            unit: data.unit,
            token: null // Using cookies for auth
          });
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await fetch("/api/unit/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAuthState({
          isAuthenticated: true,
          unit: data.unit,
          token: data.token
        });
        setLoginData({ login: "", password: "" });
      } else {
        setLoginError(data.message || "Erro ao fazer login");
      }
    } catch (error) {
      setLoginError("Erro de conexão");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/unit/logout", {
        method: "POST",
        credentials: 'include'
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setAuthState({
        isAuthenticated: false,
        unit: null,
        token: null
      });
      setGuides([]);
    }
  };

  const loadGuides = async () => {
    try {
      const response = await fetch(`/api/unit/${authState.unit?.id}/guides`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setGuides(data);
      }
    } catch (error) {
      console.error("Failed to load guides:", error);
    }
  };

  const updateGuideStatus = async (guideId: string, unitStatus: string) => {
    try {
      const response = await fetch(`/api/unit/guides/${guideId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ unitStatus })
      });

      if (response.ok) {
        loadGuides(); // Reload guides
        setSelectedGuide(null);
      }
    } catch (error) {
      console.error("Failed to update guide status:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-800" },
      accepted: { label: "Aceito", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejeitado", className: "bg-red-100 text-red-800" },
      completed: { label: "Finalizado", className: "bg-blue-100 text-blue-800" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { label: status, className: "bg-gray-100 text-gray-800" };
    
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatCurrency = (value?: string) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Acesso de Unidades</CardTitle>
            <CardDescription>
              Faça login para acessar o painel da sua unidade credenciada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login">Login</Label>
                <Input
                  id="login"
                  type="text"
                  value={loginData.login}
                  onChange={(e) => setLoginData(prev => ({ ...prev, login: e.target.value }))}
                  placeholder="Digite seu login"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Digite sua senha"
                  required
                />
              </div>
              {loginError && (
                <div className="text-red-600 text-sm text-center">
                  {loginError}
                </div>
              )}
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <PawPrint className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {authState.unit?.name}
                </h1>
                <p className="text-sm text-gray-500 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {authState.unit?.address}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Painel de Guias</h2>
          <p className="text-gray-600">
            Gerencie as guias de atendimento enviadas para sua unidade
          </p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="accepted">Aceitas</TabsTrigger>
            <TabsTrigger value="rejected">Rejeitadas</TabsTrigger>
            <TabsTrigger value="completed">Finalizadas</TabsTrigger>
          </TabsList>

          {["pending", "accepted", "rejected", "completed"].map(status => (
            <TabsContent key={status} value={status}>
              <div className="grid gap-4">
                {guides
                  .filter(guide => guide.unitStatus === status)
                  .map(guide => (
                    <Card key={guide.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold">{guide.procedure}</h3>
                              {getStatusBadge(guide.unitStatus || "pending")}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>{guide.client?.name || "Cliente não encontrado"}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <PawPrint className="h-4 w-4" />
                                <span>{guide.pet?.name || "Pet não encontrado"}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>{new Date(guide.createdAt).toLocaleDateString('pt-BR')}</span>
                              </div>
                            </div>
                            {guide.value && (
                              <div className="flex items-center space-x-2 mt-2 text-sm">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-600">
                                  {formatCurrency(guide.value)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedGuide(guide)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateGuideStatus(guide.id, "accepted")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateGuideStatus(guide.id, "rejected")}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                
                {guides.filter(guide => guide.unitStatus === status).length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhuma guia {status === "pending" ? "pendente" : 
                                      status === "accepted" ? "aceita" :
                                      status === "rejected" ? "rejeitada" : "finalizada"}
                      </h3>
                      <p className="text-gray-500">
                        As guias aparecerão aqui quando houver solicitações.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Guide Details Modal */}
        {selectedGuide && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedGuide.procedure}</CardTitle>
                    <CardDescription>
                      Criada em {new Date(selectedGuide.createdAt).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedGuide(null)}>
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Cliente</Label>
                    <p className="text-sm text-gray-600">{selectedGuide.client?.name}</p>
                    <p className="text-sm text-gray-600">{selectedGuide.client?.email}</p>
                    <p className="text-sm text-gray-600">{selectedGuide.client?.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Pet</Label>
                    <p className="text-sm text-gray-600">{selectedGuide.pet?.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedGuide.pet?.species} - {selectedGuide.pet?.breed}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Tipo de Atendimento</Label>
                  <p className="text-sm text-gray-600">{selectedGuide.type}</p>
                </div>

                {selectedGuide.procedureNotes && (
                  <div>
                    <Label className="text-sm font-medium">Observações do Procedimento</Label>
                    <p className="text-sm text-gray-600">{selectedGuide.procedureNotes}</p>
                  </div>
                )}

                {selectedGuide.generalNotes && (
                  <div>
                    <Label className="text-sm font-medium">Observações Gerais</Label>
                    <p className="text-sm text-gray-600">{selectedGuide.generalNotes}</p>
                  </div>
                )}

                {selectedGuide.value && (
                  <div>
                    <Label className="text-sm font-medium">Valor</Label>
                    <p className="text-sm font-medium text-green-600">
                      {formatCurrency(selectedGuide.value)}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedGuide.unitStatus || "pending")}
                  </div>
                </div>

                {selectedGuide.unitStatus === "pending" && (
                  <div className="flex space-x-2 pt-4">
                    <Button
                      onClick={() => updateGuideStatus(selectedGuide.id, "accepted")}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aceitar Guia
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateGuideStatus(selectedGuide.id, "rejected")}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar Guia
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}