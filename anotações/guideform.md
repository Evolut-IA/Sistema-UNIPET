# GuideForm

## Visão Geral
- **Arquivo**: client\src\pages\GuideForm.tsx
- **Componente Principal**: GuideForm
- **Propósito**: Formulário para entrada de dados

## Funcionalidades

### Hooks Utilizados
- **useEffect**: Efeitos colaterais
- **useQuery**: Consulta de dados
- **useMutation**: Mutação de dados

### APIs Consumidas
- **GET /api/guides**: Buscar guides
- **GET /api/plans/active**: Buscar plans
- **GET /api/clients**: Buscar clients
- **GET /api/pets**: Buscar pets
- **PUT /api/guides/${params.id}**: Atualizar guides
- **GET /api/guides**: Buscar guides
- **GET /api/guides**: Buscar guides

## Elementos de Interface

### Componentes UI
- **Button**: Botão interativo (3 uso(s))
- **Input**: Campo de entrada (1 uso(s))
- **Form**: Formulário (1 uso(s))
- **Select**: Seletor dropdown (2 uso(s))

## Integração com Banco de Dados

### Tabelas Utilizadas
- **clients**: Clientes cadastrados
  - Operações: SELECT, INSERT, UPDATE
- **pets**: Pets dos clientes
  - Operações: SELECT, INSERT, UPDATE
- **plans**: Planos de saúde
  - Operações: SELECT, INSERT, UPDATE
- **guides**: Guias de atendimento
  - Operações: SELECT, INSERT, UPDATE



## Dependências

### Bibliotecas
- **react**: useEffect, useState
- **@tanstack/react-query**: useQuery, useMutation, useQueryClient
- **react-hook-form**: useForm
- **@hookform/resolvers/zod**: zodResolver
- **wouter**: useLocation, useParams
- **lucide-react**: ArrowLeft

### Componentes
- **@/components/ui/card**: Card, CardContent, CardHeader, CardTitle
- **@/components/ui/button**: Button
- **@/components/ui/form**: Form, FormControl, FormField, FormItem, FormLabel, FormMessage
- **@/components/ui/input**: Input
- **@/components/ui/input-masked**: InputMasked
- **@/components/ui/textarea**: Textarea
- **@/components/ui/select**: Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- **@/components/ui/separator**: Separator

### Hooks
- **@/hooks/use-toast**: useToast

### Utilitários
- **@/lib/queryClient**: apiRequest
- **@/lib/constants**: GUIDE_TYPES

### Tipos
- **@shared/schema**: insertGuideSchema

---
*Documentação gerada automaticamente em 20/09/2025, 09:39:32*