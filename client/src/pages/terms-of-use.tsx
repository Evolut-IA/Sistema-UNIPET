import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SiteSettings } from "@shared/schema";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const defaultTermsOfUse = `
# Termos de Uso

## 1. Aceitação dos Termos

Ao acessar e utilizar o site da UNIPET PLAN, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve utilizar nossos serviços.

## 2. Descrição dos Serviços

A UNIPET PLAN oferece planos de saúde para animais de estimação, conectando proprietários de pets a uma rede credenciada de clínicas e hospitais veterinários.

## 3. Elegibilidade

Para utilizar nossos serviços, você deve:
- Ter pelo menos 18 anos de idade
- Fornecer informações precisas e atualizadas
- Ser o proprietário legal do animal de estimação
- Residir em uma área atendida por nossa rede credenciada

## 4. Cadastro e Conta

### 4.1 Responsabilidades do Usuário
- Manter a confidencialidade de suas informações de acesso
- Notificar imediatamente sobre uso não autorizado de sua conta
- Fornecer informações verdadeiras e atualizadas
- Atualizar dados quando necessário

### 4.2 Suspensão de Conta
Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos.

## 5. Planos e Pagamentos

### 5.1 Contratação
- Os planos estão sujeitos à aprovação e análise
- Preços podem variar conforme localização e tipo de animal
- Carências podem ser aplicadas conforme regulamentação

### 5.2 Pagamentos
- Mensalidades devem ser pagas nas datas de vencimento
- Atraso no pagamento pode resultar em suspensão dos serviços
- Reajustes seguem regulamentação do setor

## 6. Uso da Rede Credenciada

### 6.1 Agendamento
- Consultas devem ser agendadas diretamente com a clínica escolhida
- Apresentação da carteirinha ou documento é obrigatória
- Alguns serviços podem requerer autorização prévia

### 6.2 Coparticipação
- Alguns planos incluem coparticipação em determinados procedimentos
- Valores de coparticipação serão informados no momento do atendimento

## 7. Limitações e Exclusões

### 7.1 Condições Pré-existentes
- Doenças diagnosticadas antes da contratação podem ter cobertura limitada
- Período de carência aplica-se conforme contrato

### 7.2 Procedimentos Não Cobertos
- Procedimentos estéticos
- Reprodução assistida
- Tratamentos experimentais
- Outras exclusões conforme contrato específico

## 8. Propriedade Intelectual

Todo o conteúdo do site, incluindo textos, imagens, logos e design, é propriedade da UNIPET PLAN e está protegido por leis de direitos autorais.

## 9. Privacidade

O tratamento de dados pessoais segue nossa Política de Privacidade, que faz parte integrante destes Termos de Uso.

## 10. Limitação de Responsabilidade

A UNIPET PLAN não se responsabiliza por:
- Interrupções no serviço por motivos técnicos
- Atos de terceiros, incluindo prestadores credenciados
- Danos indiretos ou consequenciais

## 11. Rescisão

### 11.1 Pelo Usuário
- Cancelamento pode ser solicitado a qualquer momento
- Condições de cancelamento conforme contrato

### 11.2 Pela UNIPET PLAN
- Podemos encerrar serviços por violação destes termos
- Inadimplência pode resultar em cancelamento automático

## 12. Alterações nos Termos

Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. Alterações significativas serão comunicadas com antecedência.

## 13. Lei Aplicável

Estes Termos de Uso são regidos pelas leis brasileiras. Disputas serão resolvidas no foro da comarca de nossa sede.

## 14. Contato

Para dúvidas sobre estes Termos de Uso, entre em contato através dos canais disponíveis em nosso site.

**Última atualização:** ${new Date().toLocaleDateString('pt-BR')}
`;

export default function TermsOfUse() {
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/site-settings");
      return await res.json();
    },
  });

  const content = settings?.termsOfUse || defaultTermsOfUse;

  // Convert markdown-like content to HTML
  const formatContent = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold mb-6" style={{ color: 'var(--text-dark-primary)' }}>{line.substring(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold mb-4 mt-8" style={{ color: 'var(--text-dark-primary)' }}>{line.substring(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-medium mb-3 mt-6" style={{ color: 'var(--text-dark-primary)' }}>{line.substring(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="mb-2 ml-4" style={{ color: 'var(--text-dark-secondary)' }}>{line.substring(2)}</li>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={index} className="font-semibold mb-4" style={{ color: 'var(--text-dark-secondary)' }}>{line.substring(2, line.length - 2)}</p>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="mb-4 leading-relaxed" style={{ color: 'var(--text-dark-secondary)' }}>{line}</p>;
      });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-cream-light)' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center transition-colors" style={{ color: 'var(--text-teal)' }}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Link>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-lg shadow-sm border p-8" style={{ backgroundColor: 'var(--bg-cream-lighter)', borderColor: 'var(--border-gray)' }}>
            {formatContent(content)}
          </div>
        </div>
      </div>
    </div>
  );
}