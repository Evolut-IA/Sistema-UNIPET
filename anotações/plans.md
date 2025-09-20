# Plans

## Visão Geral
- **Arquivo**: client\src\pages\Plans.tsx
- **Componente Principal**: Plans
- **Propósito**: Listagem e gerenciamento de dados

## Funcionalidades

### Hooks Utilizados
- **useState**: Gerencia estado local
- **useQuery**: Consulta de dados
- **useMutation**: Mutação de dados

### APIs Consumidas
- **GET /api/plans**: Buscar plans
- **DELETE /api/plans/${id}**: Excluir plans
- **GET /api/plans**: Buscar plans
- **DELETE /api/plans/${id}**: Excluir plans
- **GET /api/plans**: Buscar plans
- **DELETE /api/admin/verify-password**: Excluir admin

## Elementos de Interface

### Componentes UI
- **Button**: Botão interativo (8 uso(s))
- **Input**: Campo de entrada (1 uso(s))
- **Table**: Tabela de dados (1 uso(s))

## Integração com Banco de Dados

### Tabelas Utilizadas
- **plans**: Planos de saúde
  - Operações: INSERT, UPDATE, DELETE



## Dependências

### Bibliotecas
- **react**: useState
- **@tanstack/react-query**: useQuery, useMutation, useQueryClient
- **wouter**: useLocation
- **lucide-react**: Plus, Search, Edit, Trash2, CreditCard, Columns3 as Columns, ChevronLeft, ChevronRight

### Componentes
- **@/components/ui/card**: Card, CardContent
- **@/components/ui/button**: Button
- **@/components/ui/input**: Input
- **@/components/ui/badge**: Badge
- **@/components/ui/switch**: Switch
- **@/components/ui/table**: Table, TableBody, TableCell, TableHead, TableHeader, TableRow, 
- **@/components/ui/dropdown-menu**: DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, 
- **@/components/ui/confirm-dialog**: ConfirmDialog
- **@/components/ui/password-dialog**: PasswordDialog

### Utilitários
- **@/lib/queryClient**: apiRequest
- **@/lib/utils**: cn

### Hooks
- **@/hooks/use-toast**: useToast
- **@/hooks/use-confirm-dialog**: useConfirmDialog
- **@/hooks/use-password-dialog**: usePasswordDialog
- **@/hooks/use-column-preferences**: useColumnPreferences

---
*Documentação gerada automaticamente em 20/09/2025, 09:39:32*