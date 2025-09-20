# Administration

## Visão Geral
- **Arquivo**: client\src\pages\Administration.tsx
- **Componente Principal**: Administration
- **Propósito**: Formulário para entrada de dados

## Funcionalidades

### Hooks Utilizados
- **useState**: Gerencia estado local
- **useQuery**: Consulta de dados
- **useMutation**: Mutação de dados

### APIs Consumidas
- **GET /api/users**: Buscar users
- **GET /api/network-units/credentials**: Buscar network-units
- **PUT /api/users/${editingUser.id}**: Atualizar users
- **GET /api/users**: Buscar users
- **GET /api/users**: Buscar users
- **DELETE /api/users/${id}**: Excluir users
- **GET /api/users**: Buscar users
- **DELETE /api/network-units/${data.id}/credentials**: Excluir network-units
- **GET /api/network-units/credentials**: Buscar network-units
- **DELETE /api/users/${id}**: Excluir users
- **GET /api/users**: Buscar users

## Elementos de Interface

### Componentes UI
- **Button**: Botão interativo (20 uso(s))
- **Input**: Campo de entrada (6 uso(s))
- **Table**: Tabela de dados (3 uso(s))
- **Dialog**: Modal/popup (3 uso(s))
- **Form**: Formulário (2 uso(s))
- **Select**: Seletor dropdown (1 uso(s))

## Integração com Banco de Dados

### Tabelas Utilizadas
- **users**: Usuários do sistema
  - Operações: SELECT, INSERT, UPDATE, DELETE
- **clients**: Clientes cadastrados
  - Operações: SELECT, INSERT, UPDATE, DELETE
- **pets**: Pets dos clientes
  - Operações: SELECT, INSERT, UPDATE, DELETE
- **plans**: Planos de saúde
  - Operações: SELECT, INSERT, UPDATE, DELETE
- **guides**: Guias de atendimento
  - Operações: SELECT, INSERT, UPDATE, DELETE
- **networkUnits**: Unidades da rede
  - Operações: SELECT, INSERT, UPDATE, DELETE



## Dependências

### Bibliotecas
- **react**: useState
- **@tanstack/react-query**: useQuery, useMutation, useQueryClient
- **react-hook-form**: useForm
- **@hookform/resolvers/zod**: zodResolver
- **zod**: z
- **lucide-react**: UserCog, Plus, Search, Edit, Trash2, Shield, User, Key, Network, Lock, Eye, EyeOff, Columns3 as Columns, ChevronLeft, ChevronRight, Globe
- **date-fns**: format
- **date-fns/locale**: ptBR

### Componentes
- **@/components/ui/card**: Card, CardContent, CardHeader, CardTitle
- **@/components/ui/button**: Button
- **@/components/ui/input**: Input
- **@/components/ui/input-masked**: InputMasked
- **@/components/ui/badge**: Badge
- **@/components/ui/switch**: Switch
- **@/components/ui/dialog**: Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
- **@/components/ui/form**: Form, FormControl, FormField, FormItem, FormLabel, FormMessage
- **@/components/ui/select**: Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- **@/components/ui/separator**: Separator
- **@/components/ui/checkbox**: Checkbox
- **@/components/ui/table**: Table, TableBody, TableCell, TableHead, TableHeader, TableRow, 
- **@/components/ui/dropdown-menu**: DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, 

### Hooks
- **@/hooks/use-toast**: useToast
- **@/hooks/use-column-preferences**: useColumnPreferences

### Utilitários
- **@/lib/queryClient**: apiRequest

### Tipos
- **@shared/schema**: insertUserSchema

---
*Documentação gerada automaticamente em 20/09/2025, 09:39:32*