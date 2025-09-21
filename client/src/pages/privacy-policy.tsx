import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SiteSettings } from "@shared/schema";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const defaultPrivacyPolicy = `
# Política de Privacidade

## 1. Informações Gerais

A UNIPET PLAN está comprometida em proteger a privacidade e os dados pessoais de nossos usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais.

## 2. Informações que Coletamos

### 2.1 Informações Pessoais
- Nome completo
- Endereço de e-mail
- Número de telefone
- Cidade de residência
- Informações sobre seu pet (nome, tipo, idade)

### 2.2 Informações de Uso
- Dados de navegação no site
- Endereço IP
- Tipo de dispositivo e navegador
- Páginas visitadas e tempo de permanência

## 3. Como Utilizamos suas Informações

Utilizamos suas informações pessoais para:
- Processar solicitações de cotação de planos
- Entrar em contato para esclarecimentos sobre serviços
- Enviar informações sobre nossos planos e serviços
- Melhorar nossos serviços e experiência do usuário
- Cumprir obrigações legais e regulamentares

## 4. Compartilhamento de Informações

Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
- Quando necessário para prestação de serviços solicitados
- Para cumprimento de obrigações legais
- Com seu consentimento expresso

## 5. Segurança dos Dados

Implementamos medidas de segurança técnicas e organizacionais adequadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.

## 6. Seus Direitos

Você tem o direito de:
- Acessar suas informações pessoais
- Corrigir dados incorretos ou incompletos
- Solicitar a exclusão de seus dados
- Revogar seu consentimento a qualquer momento

## 7. Cookies

Utilizamos cookies para melhorar sua experiência de navegação. Você pode configurar seu navegador para recusar cookies, mas isso pode afetar algumas funcionalidades do site.

## 8. Alterações nesta Política

Podemos atualizar esta Política de Privacidade periodicamente. Recomendamos que você revise esta página regularmente para se manter informado sobre nossas práticas de privacidade.

## 9. Contato

Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco através dos canais disponíveis em nosso site.

**Última atualização:** ${new Date().toLocaleDateString('pt-BR')}
`;

export default function PrivacyPolicy() {
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/site-settings");
      return await res.json();
    },
  });

  const content = settings?.privacyPolicy || defaultPrivacyPolicy;

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