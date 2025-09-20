# Guides

## Visão Geral
- **Arquivo**: client\src\pages\Guides.tsx
- **Componente Principal**: Guides
- **Propósito**: Listagem e gerenciamento de dados

## Funcionalidades

### Hooks Utilizados
- **useState**: Gerencia estado local
- **useEffect**: Efeitos colaterais
- **useQuery**: Consulta de dados
- **useMutation**: Mutação de dados

### APIs Consumidas
- **GET /api/guides/with-network-units**: Buscar guides
- **GET /api/guides/with-network-units?${params}**: Buscar guides
- **DELETE /api/guides/${id}**: Excluir guides
- **GET /api/guides/with-network-units**: Buscar guides
- **DELETE /api/admin/verify-password**: Excluir admin

## Elementos de Interface

### Componentes UI
- **Button**: Botão interativo (7 uso(s))
- **Input**: Campo de entrada (1 uso(s))
- **Table**: Tabela de dados (1 uso(s))
- **Dialog**: Modal/popup (1 uso(s))
- **Select**: Seletor dropdown (2 uso(s))

## Integração com Banco de Dados

### Tabelas Utilizadas
- **guides**: Guias de atendimento
  - Operações: SELECT, INSERT, UPDATE, DELETE



## Dependências

### Bibliotecas
- **react**: useState, useEffect
- **@tanstack/react-query**: useQuery, useMutation, useQueryClient
- **wouter**: useLocation
- **lucide-react**: Plus, Search, Edit, Trash2, FileText, Eye, Copy, Columns3 as Columns, ChevronLeft, ChevronRight
- **date-fns**: format
- **date-fns/locale**: ptBR
- **@internationalized/date**: CalendarDate

### Componentes
- **@/components/ui/card**: Card, CardContent, CardHeader, CardTitle
- **@/components/ui/button**: Button
- **@/components/ui/input**: Input
- **@/components/ui/badge**: Badge
- **@/components/ui/select**: Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- **@/components/ui/separator**: Separator
- **@/components/ui/dialog**: Dialog, DialogContent, DialogHeader, DialogTitle
- **@/components/ui/table**: Table, TableBody, TableCell, TableHead, TableHeader, TableRow, 
- **@/components/ui/dropdown-menu**: DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, 
- **@/components/ui/confirm-dialog**: ConfirmDialog
- **@/components/ui/password-dialog**: PasswordDialog
- **@/components/DateFilterComponent**: DateFilterComponent

### Utilitários
- **@/lib/queryClient**: apiRequest
- **@/lib/date-utils**: getDateRangeParams
- **@/lib/constants**: GUIDE_TYPES
- **@/lib/utils**: cn

### Hooks
- **@/hooks/use-toast**: useToast
- **@/hooks/use-confirm-dialog**: useConfirmDialog
- **@/hooks/use-password-dialog**: usePasswordDialog
- **@/hooks/use-column-preferences**: useColumnPreferences

---
*Documentação gerada automaticamente em 20/09/2025, 09:39:32*