# PlanForm

## Visão Geral
- **Arquivo**: client\src\pages\PlanForm.tsx
- **Componente Principal**: PlanForm
- **Propósito**: Formulário para entrada de dados

## Funcionalidades

### Hooks Utilizados
- **useEffect**: Efeitos colaterais
- **useQuery**: Consulta de dados
- **useMutation**: Mutação de dados

### APIs Consumidas
- **GET /api/plans**: Buscar plans
- **GET /api/plans**: Buscar plans
- **PUT /api/plans/${params.id}**: Atualizar plans
- **GET /api/plans**: Buscar plans
- **GET /api/plans**: Buscar plans
- **PUT /api/plans/${params.id}**: Atualizar plans
- **GET /api/plans**: Buscar plans
- **GET /api/plans**: Buscar plans

## Elementos de Interface

### Componentes UI
- **Button**: Botão interativo (3 uso(s))
- **Input**: Campo de entrada (1 uso(s))
- **Form**: Formulário (1 uso(s))
- **Select**: Seletor dropdown (1 uso(s))

## Integração com Banco de Dados

### Tabelas Utilizadas
- **plans**: Planos de saúde
  - Operações: SELECT, INSERT, UPDATE
- **procedures**: Procedimentos médicos
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
- **@/components/ui/switch**: Switch

### Hooks
- **@/hooks/use-toast**: useToast

### Utilitários
- **@/lib/queryClient**: apiRequest
- **@/lib/constants**: PLAN_TYPES, PROCEDURE_TYPE_LABELS

### Tipos
- **@shared/schema**: insertPlanSchema

---
*Documentação gerada automaticamente em 20/09/2025, 09:39:32*