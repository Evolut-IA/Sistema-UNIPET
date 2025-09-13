import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Search, Eye, Trash2, Calendar, User, Phone, MapPin, PawPrint } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ContactSubmissions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["/api/contact-submissions"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/contact-submissions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-submissions"] });
      toast({
        title: "Formulário removido",
        description: "Formulário foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover formulário.",
        variant: "destructive",
      });
    },
  });

  const filteredSubmissions = submissions?.filter((submission: any) =>
    submission.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.petName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (submission: any) => {
    setSelectedSubmission(submission);
    setDetailsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este formulário?")) {
      deleteMutation.mutate(id);
    }
  };

  const getPlanInterestColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case "básico": return "bg-blue-100 text-blue-800";
      case "confort": return "bg-green-100 text-green-800";
      case "premium": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Formulários de Contato</h1>
          <p className="text-muted-foreground">Visualize e gerencie os formulários recebidos</p>
        </div>
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            {submissions?.length || 0} formulários recebidos
          </span>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, email, telefone ou pet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-submissions"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">
            Formulários ({filteredSubmissions?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : filteredSubmissions?.length ? (
            <div className="space-y-4">
              {filteredSubmissions.map((submission: any) => (
                <div key={submission.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <User className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground" data-testid={`submission-name-${submission.id}`}>
                          {submission.name}
                        </h3>
                        <Badge className={getPlanInterestColor(submission.planInterest)}>
                          {submission.planInterest}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{submission.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{submission.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{submission.city}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{submission.createdAt && format(new Date(submission.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <PawPrint className="h-4 w-4" />
                          <span>{submission.petName} ({submission.animalType}, {submission.petAge})</span>
                        </div>
                      </div>

                      {submission.message && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-muted-foreground">
                          <p className="line-clamp-2">{submission.message}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(submission)}
                        data-testid={`button-view-${submission.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(submission.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${submission.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "Nenhum formulário encontrado para a busca." 
                  : "Nenhum formulário recebido ainda."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {filteredSubmissions && filteredSubmissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{filteredSubmissions.length}</p>
              <p className="text-sm text-muted-foreground">Total de Formulários</p>
            </CardContent>
          </Card>
          
          {["Básico", "Confort", "Premium"].map(plan => {
            const count = filteredSubmissions.filter((s: any) => s.planInterest === plan).length;
            return (
              <Card key={plan}>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                  <p className="text-sm text-muted-foreground">Interesse em {plan}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalhes do Formulário</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Nome Completo</label>
                  <p className="text-muted-foreground">{selectedSubmission.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <p className="text-muted-foreground">{selectedSubmission.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Telefone</label>
                  <p className="text-muted-foreground">{selectedSubmission.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Cidade</label>
                  <p className="text-muted-foreground">{selectedSubmission.city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Nome do Pet</label>
                  <p className="text-muted-foreground">{selectedSubmission.petName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Tipo de Animal</label>
                  <p className="text-muted-foreground">{selectedSubmission.animalType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Idade do Pet</label>
                  <p className="text-muted-foreground">{selectedSubmission.petAge}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Plano de Interesse</label>
                  <Badge className={getPlanInterestColor(selectedSubmission.planInterest)}>
                    {selectedSubmission.planInterest}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Data de Recebimento</label>
                  <p className="text-muted-foreground">
                    {selectedSubmission.createdAt && format(new Date(selectedSubmission.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
              
              {selectedSubmission.message && (
                <div>
                  <label className="text-sm font-medium text-foreground">Mensagem</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedSubmission.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
