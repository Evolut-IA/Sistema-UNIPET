# ClientForm

## Visão Geral
- **Arquivo**: client\src\pages\ClientForm.tsx
- **Componente Principal**: ClientForm
- **Propósito**: Formulário para entrada de dados

## Funcionalidades

### Hooks Utilizados
- **useEffect**: Efeitos colaterais
- **useQuery**: Consulta de dados
- **useMutation**: Mutação de dados

### APIs Consumidas
- **GET /api/clients**: Buscar clients
- **GET /api/clients**: Buscar clients
- **DELETE /api/pets/${petId}**: Excluir pets
- **GET /api/clients**: Buscar clients
- **DELETE /api/admin/verify-password**: Excluir admin
- **DELETE /api/clients/${params.id}**: Excluir clients
- **GET /api/clients**: Buscar clients
- **GET /api/clients**: Buscar clients

## Elementos de Interface

### Componentes UI
- **Button**: Botão interativo (7 uso(s))
- **Input**: Campo de entrada (7 uso(s))
- **Form**: Formulário (1 uso(s))

## Integração com Banco de Dados

### Tabelas Utilizadas
- **clients**: Clientes cadastrados
  - Operações: INSERT, UPDATE, DELETE
- **pets**: Pets dos clientes
  - Operações: INSERT, UPDATE, DELETE



## Dependências

### Bibliotecas
- **react**: useEffect
- **@tanstack/react-query**: useQuery, useMutation, useQueryClient
- **react-hook-form**: useForm
- **@hookform/resolvers/zod**: zodResolver
- **wouter**: useLocation, useParams
- **lucide-react**: ArrowLeft, Plus, Edit, Trash2

### Componentes
- **@/components/ui/card**: Card, CardContent, CardHeader, CardTitle
- **@/components/ui/button**: Button
- **@/components/ui/form**: Form, FormControl, FormField, FormItem, FormLabel, FormMessage
- **@/components/ui/input**: Input
- **@/components/ui/input-masked**: InputMasked
- **@/components/ui/badge**: Badge
- **@/components/ui/password-dialog**: PasswordDialog
- **@/components/ui/confirm-dialog**: ConfirmDialog

### Hooks
- **@/hooks/use-toast**: useToast
- **@/hooks/use-password-dialog**: usePasswordDialog
- **@/hooks/use-confirm-dialog**: useConfirmDialog

### Utilitários
- **@/lib/queryClient**: apiRequest

### Tipos
- **@shared/schema**: insertClientSchema

---
*Documentação gerada automaticamente em 20/09/2025, 09:39:32*