import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Search, Eye, Trash2, Calendar, User, Phone, MapPin, PawPrint, Copy } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { PasswordDialog } from "@/components/ui/password-dialog";
import { usePasswordDialog } from "@/hooks/use-password-dialog";

// Componente do ícone oficial do WhatsApp
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width="24"
    height="24"
    viewBox="0 0 48 48"
    className={className}
  >
    <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"></path>
    <path fill="#fff" d="M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.127-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.875,2.589C4.953,43.798,4.911,43.803,4.868,43.803z"></path>
    <path fill="#cfd8dc" d="M24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,4C24.014,4,24.014,4,24.014,4C12.998,4,4.032,12.962,4.027,23.979c-0.001,3.367,0.849,6.685,2.461,9.622l-2.585,9.439c-0.094,0.345,0.002,0.713,0.254,0.967c0.19,0.192,0.447,0.297,0.711,0.297c0.085,0,0.17-0.011,0.254-0.033l9.687-2.54c2.828,1.468,5.998,2.243,9.197,2.244c11.024,0,19.99-8.963,19.995-19.98c0.002-5.339-2.075-10.359-5.848-14.135C34.378,6.083,29.357,4.002,24.014,4L24.014,4z"></path>
    <path fill="#40c351" d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"></path>
    <path fill="#fff" fillRule="evenodd" d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831C20.612,19.329,19.69,16.983,19.268,16.045z" clipRule="evenodd"></path>
  </svg>
);

export default function ContactSubmissions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const confirmDialog = useConfirmDialog();
  const passwordDialog = usePasswordDialog();

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

  const filteredSubmissions = Array.isArray(submissions) ? submissions?.filter((submission: any) =>
    submission.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.petName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleViewDetails = (submission: any) => {
    setSelectedSubmission(submission);
    setDetailsOpen(true);
  };

  const generateSubmissionText = () => {
    if (!selectedSubmission) return "";

    let text = "";
    
    // Cabeçalho
    text += "=".repeat(50) + "\n";
    text += "INFORMAÇÕES DO FORMULÁRIO DE CONTATO\n";
    text += "=".repeat(50) + "\n\n";

    // Informações Pessoais
    text += "INFORMAÇÕES PESSOAIS:\n";
    text += "-".repeat(25) + "\n";
    text += `Nome: ${selectedSubmission.name}\n`;
    text += `Email: ${selectedSubmission.email}\n`;
    text += `Telefone: ${selectedSubmission.phone}\n\n`;

    // Informações do Pet
    text += "INFORMAÇÕES DO PET:\n";
    text += "-".repeat(20) + "\n";
    text += `Nome do Pet: ${selectedSubmission.petName}\n`;
    text += `Tipo de Animal: ${selectedSubmission.animalType}\n`;
    text += `Idade do Pet: ${selectedSubmission.petAge}\n\n`;

    // Interesse no Plano
    text += "INTERESSE NO PLANO:\n";
    text += "-".repeat(20) + "\n";
    text += `Plano de Interesse: ${selectedSubmission.planInterest}\n\n`;

    // Mensagem
    if (selectedSubmission.message) {
      text += "MENSAGEM:\n";
      text += "-".repeat(10) + "\n";
      text += `${selectedSubmission.message}\n\n`;
    }

    // Informações do Cadastro
    text += "INFORMAÇÕES DO CADASTRO:\n";
    text += "-".repeat(25) + "\n";
    text += `Data de Envio: ${selectedSubmission.createdAt ? format(new Date(selectedSubmission.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "Não informado"}\n`;

    text += "\n" + "=".repeat(50) + "\n";
    text += `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}\n`;
    text += "=".repeat(50);

    return text;
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = generateSubmissionText();
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Informações do formulário copiadas para a área de transferência.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar as informações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleWhatsApp = (submission: any) => {
    // Remove caracteres não numéricos do telefone
    const phoneNumber = submission.phone.replace(/\D/g, '');
    
    // Adiciona código do país se não tiver (Brasil = 55)
    const formattedPhone = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`;
    
    // Mensagem inicial profissional
    const message = `Olá ${submission.name},\n\nRecebi seu interesse no plano ${submission.planInterest} para o(a) ${submission.petName} (${submission.animalType}, ${submission.petAge}).\n\nGostaria de agendar uma conversa para apresentar as opções disponíveis e esclarecer suas dúvidas sobre nossos planos de saúde pet.\n\nQual seria o melhor horário para conversarmos?`;
    
    // Codifica a mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Abre o WhatsApp Web/App
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDelete = (id: string, submissionName: string) => {
    passwordDialog.openDialog({
      title: "Verificação de Senha",
      description: "Digite a senha do administrador para excluir este formulário:",
      onConfirm: async (password) => {
        try {
          passwordDialog.setLoading(true);
          
          // Verificar senha
          const response = await fetch("/api/admin/verify-password", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
          });
          
          const result = await response.json();
          
          if (result.valid) {
            // Senha correta, mostrar confirmação de exclusão
            confirmDialog.openDialog({
              title: "Excluir Formulário",
              description: `Tem certeza que deseja excluir o formulário de "${submissionName}"? Esta ação não pode ser desfeita.`,
              confirmText: "Excluir Formulário",
              cancelText: "Cancelar",
              onConfirm: () => {
                confirmDialog.setLoading(true);
                deleteMutation.mutate(id, {
                  onSettled: () => {
                    confirmDialog.setLoading(false);
                  }
                });
              },
            });
          } else {
            toast({
              title: "Senha incorreta",
              description: "A senha do administrador está incorreta.",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Erro",
            description: "Erro ao verificar senha. Tente novamente.",
            variant: "destructive",
          });
        } finally {
          passwordDialog.setLoading(false);
        }
      },
    });
  };

  const getPlanInterestColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case "básico": return "bg-chart-1/20 text-chart-1";
      case "confort": return "bg-chart-4/20 text-chart-4";
      case "premium": return "bg-chart-2/20 text-chart-2";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">Formulários de Contato</h1>
          <p className="text-sm text-muted-foreground">Visualize e gerencie os formulários recebidos</p>
        </div>
        <div className="flex items-center gap-2 p-2 sm:p-0">
          <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
          <span className="text-xs sm:text-sm text-muted-foreground">
            {Array.isArray(submissions) ? submissions.length : 0} formulários recebidos
          </span>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{color: 'var(--input-foreground)'}} />
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
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : filteredSubmissions?.length ? (
            <div className="space-y-2">
              {filteredSubmissions.map((submission: any) => (
                <div key={submission.id} className="border rounded-lg p-3 hover:bg-muted/10 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
                    <div className="flex-1 min-w-0 flex items-center">
                      {/* Nome do Formulário */}
                      <div className="w-full">
                        <h3 className="font-semibold text-foreground break-words" data-testid={`submission-name-${submission.id}`}>
                          {submission.name}
                        </h3>
                        <Badge className={`${getPlanInterestColor(submission.planInterest)} lg:hidden`} data-testid={`badge-plan-interest-${submission.id}`}>
                          {submission.planInterest}
                        </Badge>
                      </div>
                    </div>

                    {/* Botões em linha horizontal */}
                    <div className="flex items-center space-x-1 w-full sm:w-auto sm:ml-3">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleWhatsApp(submission)}
                        data-testid={`button-whatsapp-${submission.id}`}
                        title="Enviar mensagem no WhatsApp"
                      >
                        <WhatsAppIcon className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleViewDetails(submission)}
                        data-testid={`button-view-${submission.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDelete(submission.id, submission.name)}
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
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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


      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="">
          <DialogHeader className="flex flex-row items-center justify-between pr-2">
            <DialogTitle className="text-primary">Detalhes do Formulário</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleCopyToClipboard}
                className="gap-2 h-8"
                data-testid="button-copy-submission-details"
              >
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
              <Button
                variant="outline" 
                onClick={() => setDetailsOpen(false)}
                className="h-8"
              >
                Fechar
              </Button>
            </div>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-primary">Nome Completo</label>
                  <p className="text-foreground">{selectedSubmission.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary">Email</label>
                  <p className="text-foreground">{selectedSubmission.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary">Telefone</label>
                  <p className="text-foreground">{selectedSubmission.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary">Cidade</label>
                  <p className="text-foreground">{selectedSubmission.city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary">Nome do Pet</label>
                  <p className="text-foreground">{selectedSubmission.petName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary">Tipo de Animal</label>
                  <p className="text-foreground">{selectedSubmission.animalType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary">Idade do Pet</label>
                  <p className="text-foreground">{selectedSubmission.petAge}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary">Plano de Interesse</label>
                  <div className="mt-1">
                    <Badge className={getPlanInterestColor(selectedSubmission.planInterest)}>
                      {selectedSubmission.planInterest}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary">Data de Recebimento</label>
                  <p className="text-foreground">
                    {selectedSubmission.createdAt && format(new Date(selectedSubmission.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
              
              {selectedSubmission.message && (
                <div>
                  <label className="text-sm font-medium text-primary">Mensagem</label>
                  <div className="mt-1 p-3 bg-muted/10 rounded-lg">
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedSubmission.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <PasswordDialog
        open={passwordDialog.isOpen}
        onOpenChange={passwordDialog.closeDialog}
        onConfirm={passwordDialog.confirm}
        title={passwordDialog.title}
        description={passwordDialog.description}
        isLoading={passwordDialog.isLoading}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.isOpen}
        onOpenChange={confirmDialog.closeDialog}
        onConfirm={confirmDialog.confirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        isLoading={confirmDialog.isLoading}
      />
    </div>
  );
}
