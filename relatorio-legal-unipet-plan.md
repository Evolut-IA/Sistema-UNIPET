# RELATÓRIO LEGAL PARA POLÍTICAS DE PRIVACIDADE E TERMOS DE USO
## UNIPET PLAN - Sistema de Planos de Saúde para Pets

**Data de Análise:** 24 de setembro de 2025  
**Versão:** 1.0  
**Analista:** Replit Agent - Assistente Legal Especializado

---

## 1. INTRODUÇÃO E VISÃO GERAL DO SITE

### 1.1 Identificação da Plataforma
- **Nome:** UNIPET PLAN
- **Descrição:** Sistema robusto de plano de saúde para pets com frontend e backend otimizados
- **Finalidade:** Comercialização de planos de saúde para animais de estimação
- **Público-Alvo:** Proprietários de animais de estimação (cães, gatos, aves, tartarugas, coelhos, etc.)
- **Tecnologia:** Aplicação web full-stack com React.js (frontend) e Node.js/Express (backend)

### 1.2 Modelo de Negócio
O UNIPET PLAN opera como uma plataforma de seguros de saúde para pets, oferecendo:
- Múltiplos planos de cobertura (BASIC, COMFORT, PLATINUM, INFINITY)
- Rede credenciada de clínicas e hospitais veterinários
- Sistema de coparticipação em procedimentos
- Atendimento ao cliente através de protocolos
- Sistema de pagamentos online (cartão de crédito e PIX)

---

## 2. ANÁLISE DETALHADA DE COLETA DE DADOS

### 2.1 Formulário de Contato (/contact)
**Localização:** `client/src/pages/contact.tsx`

**Dados Coletados:**
- **Dados Pessoais do Proprietário:**
  - Nome completo (obrigatório, mínimo 2 caracteres)
  - E-mail (obrigatório, validação de formato)
  - Telefone (obrigatório, mínimo 10 dígitos)
  - Cidade de residência (obrigatório, mínimo 2 caracteres)
  
- **Dados do Animal:**
  - Nome do pet (obrigatório)
  - Tipo de animal (obrigatório) - Opções: Cão, Gato, Aves, Tartarugas/jabutis, Coelhos/hamsters, Porquinho da índia, Outros
  - Faixa etária do pet (obrigatório) - Opções: 0-1 ano, 1-3 anos, 3-7 anos, 7+ anos
  
- **Dados Comerciais:**
  - Plano de interesse (obrigatório) - Seleção entre os planos disponíveis
  - Mensagem opcional (campo livre de texto)

**Finalidade:** Solicitação de cotação personalizada e primeiro contato comercial.

**Validação e Segurança:**
- Validação através de schema Zod
- Sanitização de dados de entrada
- Rate limiting aplicado
- Envio via API POST `/api/contact`

### 2.2 Sistema de Checkout Completo (/checkout)
**Localização:** `client/src/pages/checkout.tsx`

**Dados Coletados:**

#### 2.2.1 Informações do Cliente
- **Dados Pessoais:**
  - Nome completo
  - E-mail (com validação de formato)
  - CPF (com máscara e validação)
  - Telefone (com máscara de formato brasileiro)
  
- **Endereço Completo:**
  - CEP (com busca automática via ViaCEP)
  - Logradouro (preenchido automaticamente)
  - Número (obrigatório)
  - Complemento (opcional)
  - Bairro (preenchido automaticamente)
  - Cidade (preenchida automaticamente)
  - Estado (preenchido automaticamente)

#### 2.2.2 Informações dos Pets (Múltiplos)
- Nome do pet (obrigatório)
- Espécie (obrigatório)
- Raça (opcional)
- Idade (obrigatório, numérico)
- Peso (obrigatório, numérico em kg)

**Observação:** O sistema permite cadastro de múltiplos pets (até 5) por cliente.

#### 2.2.3 Dados de Pagamento
- **Cartão de Crédito:**
  - Número do cartão (com máscara)
  - Nome do portador
  - Data de validade (MM/AA)
  - Código de segurança (CVV)
  - Número de parcelas (1x a 12x, dependendo do plano)
  
- **PIX:**
  - Gera QR Code e código Copia e Cola
  - Não requer dados adicionais do usuário

**Dados NÃO Persistidos por Segurança:**
- Número do cartão de crédito
- CVV
- Dados sensíveis de pagamento (apenas tokens são armazenados)

### 2.3 Sistema de Login de Cliente (/customer/login)
**Localização:** `client/src/pages/customer-login.tsx`

**Dados Coletados:**
- E-mail (utilizado como identificador principal)
- CPF (utilizado como senha/chave de acesso)

**Funcionalidade de Segurança:**
- Autenticação via sessões Express.js
- Cookies httpOnly com tempo de expiração (24 horas)
- Hash do CPF para autenticação

### 2.4 Dashboard do Cliente (Área Restrita)
**Funcionalidades que Coletam/Processam Dados:**
- **Perfil do Cliente:** Edição de dados pessoais e endereço
- **Gerenciamento de Pets:** Adição, edição e upload de fotos dos pets
- **Histórico Financeiro:** Visualização de pagamentos e faturas
- **Contratos:** Visualização de planos contratados
- **Protocolos:** Sistema de atendimento e reclamações
- **Pesquisas de Satisfação:** Avaliações pós-atendimento

---

## 3. INTEGRAÇÕES COM TERCEIROS

### 3.1 Cielo E-commerce (Gateway de Pagamento)
**Localização:** `server/services/cielo-service.ts`

**Dados Compartilhados:**
- Dados pessoais do cliente (nome, CPF, e-mail)
- Endereço completo para faturamento
- Informações do cartão de crédito (transmissão segura)
- Valor da transação e parcelas

**Medidas de Segurança:**
- Comunicação via HTTPS
- Certificados SSL/TLS validados
- Rate limiting para requisições
- Logs de correlação para auditoria
- Retry logic com exponential backoff
- Sanitização de mensagens de erro para não expor dados sensíveis

**Ambiente:**
- Configurado para produção e sandbox
- Credenciais gerenciadas via variáveis de ambiente

### 3.2 ViaCEP (Consulta de Endereços)
**Localização:** `server/services/cep-service.ts`

**Dados Compartilhados:**
- Código postal (CEP) brasileiro

**Dados Recebidos:**
- Logradouro, bairro, cidade, estado
- Códigos IBGE, DDD, GIA, SIAFI

**Finalidade:** Preenchimento automático de endereço para melhorar experiência do usuário e garantir dados corretos.

**Medidas de Segurança:**
- Timeout de 5 segundos para requisições
- Validação de formato do CEP
- Tratamento de erros e fallback manual

### 3.3 Supabase Storage (Armazenamento de Arquivos)
**Dados Armazenados:**
- Imagens dos pets (formato base64 ou arquivos)
- Recibos de pagamento em PDF
- Documentos do sistema

**Segurança:**
- Object keys únicos para controle de acesso
- Não exposição de URLs públicas sensíveis

### 3.4 PostgreSQL (Banco de Dados Principal)
**Localização:** `shared/schema.ts`

**Principais Tabelas de Dados Pessoais:**

#### 3.4.1 Clientes (clients)
- Dados pessoais completos
- Endereço residencial
- Credenciais de acesso (email/CPF)
- Timestamps de criação/atualização

#### 3.4.2 Pets (pets)
- Dados do animal
- Informações médicas/veterinárias
- Histórico de saúde
- Imagens

#### 3.4.3 Contratos (contracts)
- Informações contratuais
- Dados de pagamento (tokens, não dados sensíveis)
- Status dos planos
- Comprovantes de transação

#### 3.4.4 Histórico de Serviços (service_history)
- Atendimentos realizados
- Procedimentos executados
- Valores cobrados e coparticipação

#### 3.4.5 Protocolos (protocols)
- Solicitações e reclamações
- Comunicação com clientes
- Resoluções de casos

---

## 4. SISTEMA DE AUTENTICAÇÃO E AUTORIZAÇÃO

### 4.1 Autenticação de Clientes
**Localização:** `server/auth.ts`

**Método:** Sessões baseadas em cookies
- **Identificador:** E-mail
- **Credencial:** CPF (hasheado)
- **Duração:** 24 horas
- **Segurança:** httpOnly, sameSite: 'lax'

### 4.2 Autenticação Administrativa
- Sistema separado para administração
- Controle de permissões por papel (role)
- Acesso a dashboard administrativo

### 4.3 Middleware de Proteção
- `requireAuth()`: Proteção de rotas de cliente
- `requireAdmin()`: Proteção de rotas administrativas
- Rate limiting para prevenir ataques

---

## 5. ASPECTOS DE SEGURANÇA E PROTEÇÃO DE DADOS

### 5.1 Medidas Técnicas Implementadas

#### 5.1.1 Segurança de Comunicação
- **HTTPS obrigatório** para todas as transações
- **Certificados SSL/TLS** validados
- **Headers de segurança** implementados (Helmet.js)
- **CORS configurado** adequadamente

#### 5.1.2 Proteção de Dados Sensíveis
- **Hash de senhas** com bcrypt
- **Não persistência** de dados de cartão de crédito
- **Tokenização** de transações financeiras
- **Sanitização** de logs para não expor dados pessoais

#### 5.1.3 Controle de Acesso
- **Rate limiting** por IP
- **Middleware de autenticação** em todas as rotas protegidas
- **Validação de entrada** com schemas Zod
- **Prevenção de injeção SQL** através de ORM (Drizzle)

#### 5.1.4 Auditoria e Logs
- **Correlation IDs** para rastreamento
- **Logs estruturados** de todas as transações
- **Timestamps** em todas as operações
- **Histórico de alterações** nos dados

### 5.2 Consentimentos e Bases Legais

#### 5.2.1 Consentimento no Checkout
- **Checkbox de Política de Privacidade** (obrigatório)
- **Checkbox de Termos e Condições** (obrigatório)
- **Consentimento específico** para coleta de dados do pet
- **Finalidade específica** informada (contratação do plano)

#### 5.2.2 Transparência
- **Políticas dinâmicas** editáveis pelo administrador
- **Acesso fácil** às políticas durante todo o processo
- **Linguagem clara** e específica sobre uso dos dados

---

## 6. FUNCIONALIDADES E CARACTERÍSTICAS DO SISTEMA

### 6.1 Planos Oferecidos
1. **BASIC** - Faturamento mensal, pagamento apenas à vista
2. **COMFORT** - Faturamento anual, parcelamento 1x a 12x
3. **PLATINUM** - Faturamento anual, parcelamento 1x a 12x  
4. **INFINITY** - Faturamento mensal, pagamento apenas à vista

### 6.2 Sistema de Coparticipação
- **Variável por plano** e procedimento
- **Transparência** nos valores cobrados
- **Cálculo automático** no momento do atendimento

### 6.3 Rede Credenciada
- **Cadastro de unidades** com dados completos
- **Serviços disponíveis** por unidade
- **Localização e contato** de cada estabelecimento
- **Sistema de agendamento** integrado

### 6.4 Atendimento ao Cliente
- **Protocolos numerados** para rastreamento
- **Categorização** por tipo (reclamação, informação, emergência, etc.)
- **Histórico completo** de interações
- **Status tracking** das solicitações

### 6.5 Sistema Financeiro
- **Múltiplos métodos** de pagamento (cartão, PIX)
- **Parcelamento inteligente** baseado no plano
- **Recibos automáticos** em PDF
- **Controle de inadimplência**

---

## 7. ANÁLISE DE CONFORMIDADE COM LGPD

### 7.1 Bases Legais Identificadas

#### 7.1.1 Consentimento (Art. 7º, I)
- **Formulário de contato:** Consentimento livre e informado
- **Checkout:** Checkboxes obrigatórios para consentimento
- **Marketing:** Possível uso para comunicação promocional

#### 7.1.2 Execução de Contrato (Art. 7º, V)
- **Dados para prestação do serviço:** Nome, CPF, endereço, dados do pet
- **Processamento de pagamentos:** Necessário para cumprimento contratual
- **Histórico médico do pet:** Essencial para cobertura do plano

#### 7.1.3 Legítimo Interesse (Art. 7º, IX)
- **Prevenção à fraude:** Validações de CPF e dados de pagamento
- **Melhoria do serviço:** Analytics de uso (se implementado)

### 7.2 Direitos dos Titulares

#### 7.2.1 Direitos Potencialmente Atendidos
- **Acesso:** Dashboard do cliente permite visualização dos dados
- **Correção:** Sistema permite edição de dados pessoais
- **Exclusão:** Funcionalidade de cancelamento de conta

#### 7.2.2 Direitos Que Requerem Atenção
- **Portabilidade:** Necessita implementação de exportação de dados
- **Revogação de consentimento:** Processo simplificado necessário
- **Oposição:** Mecanismo específico para opt-out

### 7.3 Transferência Internacional
- **Cielo:** Processamento nacional (Brasil)
- **ViaCEP:** Serviço nacional (Brasil)
- **Supabase:** Verificar localização dos servidores
- **Replit:** Verificar política de transferência de dados

---

## 8. COOKIES E TECNOLOGIAS DE RASTREAMENTO

### 8.1 Cookies Identificados

#### 8.1.1 Cookies de Sessão
- **Nome:** `connect.sid`
- **Finalidade:** Manutenção da sessão do usuário
- **Duração:** 24 horas
- **Tipo:** httpOnly, funcional

#### 8.1.2 Cookies de Terceiros
- **Cielo:** Possíveis cookies de segurança para transações
- **Análise necessária:** Verificar implementação de analytics

### 8.2 Recomendações para Cookies
- **Implementar banner** de consentimento de cookies
- **Categorizar cookies** (funcionais, analytics, marketing)
- **Permitir granularidade** na escolha do usuário
- **Política específica** de cookies

---

## 9. RECOMENDAÇÕES LEGAIS

### 9.1 Política de Privacidade

#### 9.1.1 Elementos a Incluir
1. **Identificação do Controlador**
   - Razão social, CNPJ, endereço
   - Dados do DPO (se aplicável)
   - Canais de contato específicos para privacidade

2. **Dados Coletados - Detalhamento Específico**
   - Formulário de contato: finalidades específicas
   - Processo de checkout: base legal (execução contratual)
   - Dados dos pets: necessidade para prestação do serviço
   - Dados de pagamento: processamento e não armazenamento

3. **Compartilhamento com Terceiros**
   - Cielo: processamento de pagamentos
   - ViaCEP: melhoria da experiência do usuário
   - Supabase: armazenamento técnico
   - Base legal para cada compartilhamento

4. **Período de Retenção**
   - Dados contratuais: durante vigência + prazo legal
   - Dados de contato: até revogação do consentimento
   - Dados financeiros: conforme legislação fiscal
   - Dados médicos dos pets: conforme regulamentação veterinária

5. **Direitos dos Titulares**
   - Lista completa dos direitos LGPD
   - Processo específico para exercício
   - Prazos para atendimento
   - Canal dedicado

6. **Medidas de Segurança**
   - Criptografia de dados em trânsito e repouso
   - Controles de acesso
   - Monitoramento de segurança
   - Plano de resposta a incidentes

#### 9.1.2 Política Dinâmica Existente
- Sistema já permite **edição administrativa** das políticas
- **Versionamento** necessário para controle de alterações
- **Notificação de mudanças** para usuários ativos

### 9.2 Termos de Uso

#### 9.2.1 Elementos Identificados Existentes
1. **Elegibilidade e Capacidade**
   - Maiores de 18 anos
   - Proprietário legal do pet
   - Área de cobertura

2. **Serviços Oferecidos**
   - Planos de saúde específicos
   - Rede credenciada
   - Sistema de coparticipação
   - Limitações e exclusões

3. **Responsabilidades do Usuário**
   - Veracidade das informações
   - Pagamento em dia
   - Uso adequado da rede credenciada

4. **Propriedade Intelectual**
   - Proteção de marca e conteúdo
   - Direitos autorais do sistema

#### 9.2.2 Elementos a Reforçar
1. **Condições de Pagamento**
   - Especificar regras de parcelamento por plano
   - Consequências da inadimplência
   - Política de reajuste de preços

2. **Uso da Plataforma Digital**
   - Responsabilidades na área do cliente
   - Segurança de login e senhas
   - Uso proibido do sistema

3. **Atendimento e Protocolos**
   - Como funciona o sistema de protocolos
   - Prazos de resposta
   - Escalação de reclamações

4. **Rescisão e Cancelamento**
   - Procedimentos específicos
   - Carências e penalidades
   - Direito de arrependimento

### 9.3 Adequações Técnicas Recomendadas

#### 9.3.1 Consentimento Granular
- **Separar consentimentos** por finalidade
- **Permitir revogação** específica
- **Registrar histórico** de consentimentos

#### 9.3.2 Exercício de Direitos
- **Portal do titular** na área do cliente
- **Automatização** de solicitações simples
- **Processo manual** para casos complexos

#### 9.3.3 Segurança Adicional
- **Auditoria regular** de acessos
- **Criptografia** de dados sensíveis em repouso
- **Backup seguro** e testado regularmente

#### 9.3.4 Monitoramento
- **Logs de acesso** a dados pessoais
- **Alertas** de atividades suspeitas
- **Relatórios** periódicos de conformidade

---

## 10. RISCOS IDENTIFICADOS E MITIGAÇÕES

### 10.1 Riscos de Alto Impacto

#### 10.1.1 Vazamento de Dados de Pagamento
- **Risco:** Acesso não autorizado a dados de cartão
- **Mitigação Atual:** Não persistência de dados sensíveis
- **Recomendação:** Auditoria de segurança da Cielo

#### 10.1.2 Acesso Não Autorizado às Contas
- **Risco:** CPF como senha é previsível
- **Mitigação Atual:** Hash + rate limiting
- **Recomendação:** Implementar senha real + 2FA opcional

#### 10.1.3 Compartilhamento Excessivo com Terceiros
- **Risco:** ViaCEP e outros serviços
- **Mitigação Atual:** Dados mínimos necessários
- **Recomendação:** Análise de DPA com fornecedores

### 10.2 Riscos de Compliance

#### 10.2.1 Base Legal Inadequada
- **Risco:** Uso de dados sem base legal sólida
- **Mitigação:** Revisar todas as finalidades
- **Recomendação:** Mapeamento completo por base legal

#### 10.2.2 Direitos dos Titulares
- **Risco:** Não atendimento em prazo legal
- **Mitigação:** Sistematizar processos
- **Recomendação:** SLA interno definido

### 10.3 Riscos Operacionais

#### 10.3.1 Indisponibilidade de Terceiros
- **Risco:** Falha da Cielo ou ViaCEP
- **Mitigação:** Tratamento de erro adequado
- **Recomendação:** Plano de contingência

#### 10.3.2 Perda de Dados
- **Risco:** Falha de hardware/software
- **Mitigação:** PostgreSQL com backup
- **Recomendação:** Teste regular de restore

---

## 11. CONCLUSÕES E PRÓXIMOS PASSOS

### 11.1 Avaliação Geral
O sistema UNIPET PLAN apresenta uma **arquitetura tecnicamente robusta** com boas práticas de segurança implementadas. A coleta de dados é **proporcional e adequada** às finalidades do negócio, com medidas técnicas apropriadas para proteção.

### 11.2 Pontos Fortes Identificados
- ✅ **Não persistência** de dados sensíveis de pagamento
- ✅ **Criptografia** de comunicações
- ✅ **Validação** rigorosa de dados de entrada
- ✅ **Consentimento explícito** no processo de contratação
- ✅ **Políticas dinâmicas** editáveis
- ✅ **Separação de ambientes** (produção/sandbox)

### 11.3 Áreas de Melhoria Prioritárias
1. **Política de Cookies** - Implementação urgente
2. **Portal do Titular** - Exercício automatizado de direitos
3. **DPAs com Terceiros** - Formalização de acordos
4. **Auditoria de Segurança** - Avaliação externa periódica

### 11.4 Cronograma Sugerido
- **Imediato (30 dias):** Política de cookies + banner
- **Curto prazo (60 dias):** Portal do titular básico
- **Médio prazo (90 dias):** DPAs formalizados
- **Longo prazo (120 dias):** Auditoria externa completa

### 11.5 Investimento Recomendado
- **Consultoria jurídica especializada** em LGPD
- **Auditoria técnica de segurança**
- **Desenvolvimento** de funcionalidades de privacidade
- **Treinamento** da equipe em proteção de dados

---

## 12. ANEXOS

### 12.1 Fluxo de Dados Mapeados
```
[Cliente] → [Formulário] → [Validação] → [PostgreSQL]
                       ↓
[Cliente] → [Checkout] → [Cielo API] → [Armazenamento Token]
                       ↓
[Sistema] → [ViaCEP] → [Preenchimento Automático]
                       ↓
[Cliente] → [Dashboard] → [Supabase] → [Imagens Pets]
```

### 12.2 Bases Legais por Categoria
| Dado | Base Legal | Justificativa |
|------|------------|---------------|
| Nome, Email, Telefone | Consentimento | Contato comercial |
| CPF, Endereço | Execução contratual | Identificação e cobrança |
| Dados Pet | Execução contratual | Prestação do serviço |
| Dados Pagamento | Execução contratual | Processamento financeiro |
| Dados Médicos Pet | Execução contratual | Cobertura dos procedimentos |

### 12.3 Período de Retenção Sugerido
| Categoria | Período | Justificativa |
|-----------|---------|---------------|
| Dados Contratuais Ativos | Vigência do contrato | Prestação do serviço |
| Dados Contratuais Encerrados | 5 anos | Código Civil brasileiro |
| Dados de Pagamento (tokens) | 5 anos | Legislação fiscal |
| Dados de Contato (sem contrato) | 2 anos ou revogação | Consentimento |
| Logs de Acesso | 6 meses | Segurança da informação |

---

**IMPORTANTE:** Este relatório foi elaborado com base na análise técnica do código-fonte e funcionalidades identificadas. Recomenda-se revisão por advogado especializado em proteção de dados e direito digital para adequação às especificidades legais da operação.

---

*Relatório elaborado em 24/09/2025 - Documento confidencial destinado exclusivamente para fins de adequação legal*