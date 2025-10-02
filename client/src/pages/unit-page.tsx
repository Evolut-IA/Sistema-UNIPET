import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Phone, 
  MessageSquare, 
  Clock, 
  CheckCircle
} from "lucide-react";
import { formatBrazilianPhoneForDisplay } from "@/hooks/use-site-settings";

interface NetworkUnit {
  id: string;
  name: string;
  address: string;
  cidade: string;
  phone: string;
  services: string[];
  imageUrl?: string;
  whatsapp?: string;
  googleMapsUrl?: string;
  urlSlug: string;
}

export default function UnitPage() {
  const [, paramsUnidade] = useRoute("/unidade/:slug");
  const [, paramsSlug] = useRoute("/:slug");
  const [, setLocation] = useLocation();
  const [unit, setUnit] = useState<NetworkUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const slug = paramsUnidade?.slug || paramsSlug?.slug;
    if (slug) {
      loadUnit(slug);
    }
  }, [paramsUnidade?.slug, paramsSlug?.slug]);

  const loadUnit = async (slug: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/network-units/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Unidade não encontrada");
        } else {
          setError("Erro ao carregar informações da unidade");
        }
        return;
      }

      const data = await response.json();
      setUnit(data);
    } catch (error) {
      console.error("Erro ao buscar unidade:", error);
      setError("Erro ao carregar informações da unidade");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (unit?.whatsapp) {
      const number = unit.whatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/55${number}`, '_blank');
    }
  };

  const handleCall = () => {
    if (unit?.phone) {
      const number = unit.phone.replace(/\D/g, '');
      window.location.href = `tel:${number}`;
    }
  };

  const handleMaps = () => {
    if (unit?.googleMapsUrl) {
      window.open(unit.googleMapsUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando informações...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-6xl mb-4">😔</div>
                <h2 className="text-2xl font-bold mb-2">Oops!</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button 
                  onClick={() => setLocation("/")}
                  variant="default"
                >
                  Voltar ao Início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!unit) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            ← Voltar
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">{unit.name}</h1>
          <p className="text-muted-foreground">Unidade Credenciada UNIPET Plan</p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Image Card */}
          {unit.imageUrl && (
            <Card className="overflow-hidden">
              <img 
                src={unit.imageUrl} 
                alt={unit.name}
                className="w-full h-64 object-cover"
              />
            </Card>
          )}

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
              <CardDescription>Entre em contato conosco</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Endereço</p>
                  <p className="text-sm text-muted-foreground">
                    {unit.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {unit.cidade}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Telefone</p>
                  <p className="text-sm text-muted-foreground">
                    {formatBrazilianPhoneForDisplay(unit.phone)}
                  </p>
                </div>
              </div>

              {/* WhatsApp */}
              {unit.whatsapp && (
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">
                      {formatBrazilianPhoneForDisplay(unit.whatsapp)}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button 
                  onClick={handleCall}
                  variant="outline"
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Ligar
                </Button>
                
                {unit.whatsapp && (
                  <Button 
                    onClick={handleWhatsApp}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
                
                {unit.googleMapsUrl && (
                  <Button 
                    onClick={handleMaps}
                    variant="outline"
                    className="flex-1"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Ver no Mapa
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Card */}
        {unit.services && unit.services.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Serviços Disponíveis</CardTitle>
              <CardDescription>
                Confira os serviços oferecidos nesta unidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {unit.services.map((service, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{service}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hours Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Horário de Atendimento</CardTitle>
            <CardDescription>
              Nossos horários de funcionamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Segunda a Sexta</p>
                  <p className="text-sm text-muted-foreground">08:00 - 18:00</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Sábado</p>
                  <p className="text-sm text-muted-foreground">08:00 - 12:00</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Domingo</p>
                  <p className="text-sm text-muted-foreground">Fechado</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-8 p-6 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">Informações Importantes</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Esta unidade é credenciada ao UNIPET Plan</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Apresente sua carteirinha do pet no atendimento</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Consulte a cobertura do seu plano antes do atendimento</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}