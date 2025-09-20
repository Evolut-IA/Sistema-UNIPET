# NetworkForm

## Visão Geral
- **Arquivo**: client\src\pages\NetworkForm.tsx
- **Componente Principal**: NetworkForm
- **Propósito**: Formulário para entrada de dados

## Funcionalidades

### Hooks Utilizados
- **useState**: Gerencia estado local
- **useEffect**: Efeitos colaterais
- **useQuery**: Consulta de dados
- **useMutation**: Mutação de dados

### APIs Consumidas
- **GET /api/network-units**: Buscar network-units
- **GET /api/procedures**: Buscar procedures
- **PUT /api/network-units/${params.id}**: Atualizar network-units
- **GET /api/network-units**: Buscar network-units
- **GET /api/network-units**: Buscar network-units

## Elementos de Interface

### Componentes UI
- **Button**: Botão interativo (3 uso(s))
- **Input**: Campo de entrada (3 uso(s))
- **Form**: Formulário (1 uso(s))

## Integração com Banco de Dados

### Tabelas Utilizadas
- **procedures**: Procedimentos médicos
  - Operações: SELECT, INSERT, UPDATE



## Dependências

### Bibliotecas
- **react**: useEffect, useState
- **@tanstack/react-query**: useQuery, useMutation, useQueryClient
- **react-hook-form**: useForm, useFieldArray
- **@hookform/resolvers/zod**: zodResolver
- **wouter**: useLocation, useParams
- **lucide-react**: ArrowLeft, ExternalLink

### Componentes
- **@/components/ui/card**: Card, CardContent, CardHeader, CardTitle
- **@/components/ui/button**: Button
- **@/components/ui/form**: Form, FormControl, FormField, FormItem, FormLabel, FormMessage
- **@/components/ui/input**: Input
- **@/components/ui/input-masked**: InputMasked
- **@/components/ui/switch**: Switch
- **@/components/ui/checkbox**: Checkbox
- **@/components/ui/image-upload**: ImageUpload

### Hooks
- **@/hooks/use-toast**: useToast

### Utilitários
- **@/lib/queryClient**: apiRequest
- **@/lib/utils**: generateSlug

### Tipos
- **@shared/schema**: insertNetworkUnitSchema

---
*Documentação gerada automaticamente em 20/09/2025, 09:39:32*