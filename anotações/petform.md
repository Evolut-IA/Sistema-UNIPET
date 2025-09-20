# PetForm

## Visão Geral
- **Arquivo**: client\src\pages\PetForm.tsx
- **Componente Principal**: PetForm
- **Propósito**: Formulário para entrada de dados

## Funcionalidades

### Hooks Utilizados
- **useEffect**: Efeitos colaterais
- **useQuery**: Consulta de dados
- **useMutation**: Mutação de dados

### APIs Consumidas
- **GET /api/pets**: Buscar pets
- **GET /api/clients**: Buscar clients
- **GET /api/plans/active**: Buscar plans
- **PUT /api/pets/${params.id}**: Atualizar pets
- **GET /api/pets**: Buscar pets
- **GET /api/pets**: Buscar pets
- **GET /api/clients**: Buscar clients

## Elementos de Interface

### Componentes UI
- **Button**: Botão interativo (3 uso(s))
- **Input**: Campo de entrada (6 uso(s))
- **Form**: Formulário (1 uso(s))
- **Select**: Seletor dropdown (3 uso(s))

## Integração com Banco de Dados

### Tabelas Utilizadas
- **clients**: Clientes cadastrados
  - Operações: SELECT, INSERT, UPDATE
- **pets**: Pets dos clientes
  - Operações: SELECT, INSERT, UPDATE
- **plans**: Planos de saúde
  - Operações: SELECT, INSERT, UPDATE



## Dependências

### Bibliotecas
- **@tanstack/react-query**: useQuery, useMutation, useQueryClient
- **react-hook-form**: useForm
- **@hookform/resolvers/zod**: zodResolver
- **wouter**: useLocation, useParams
- **lucide-react**: ArrowLeft, Plus, Trash2

### Componentes
- **@/components/ui/card**: Card, CardContent, CardHeader, CardTitle
- **@/components/ui/button**: Button
- **@/components/ui/form**: Form, FormControl, FormField, FormItem, FormLabel, FormMessage
- **@/components/ui/input**: Input
- **@/components/ui/textarea**: Textarea
- **@/components/ui/select**: Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- **@/components/ui/separator**: Separator
- **@/components/ui/checkbox**: Checkbox

### Hooks
- **@/hooks/use-toast**: useToast

### Utilitários
- **@/lib/queryClient**: apiRequest

### Tipos
- **@shared/schema**: insertPetSchema

---
*Documentação gerada automaticamente em 20/09/2025, 09:39:32*