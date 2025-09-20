# Network

## Visão Geral
- **Arquivo**: client\src\pages\Network.tsx
- **Componente Principal**: Network
- **Propósito**: Listagem e gerenciamento de dados

## Funcionalidades

### Hooks Utilizados
- **useState**: Gerencia estado local
- **useQuery**: Consulta de dados
- **useMutation**: Mutação de dados

### APIs Consumidas
- **GET /api/network-units**: Buscar network-units
- **DELETE /api/network-units/${id}**: Excluir network-units
- **GET /api/network-units**: Buscar network-units
- **DELETE /api/network-units/${id}**: Excluir network-units
- **GET /api/network-units**: Buscar network-units
- **DELETE /api/admin/verify-password**: Excluir admin

## Elementos de Interface

### Componentes UI
- **Button**: Botão interativo (13 uso(s))
- **Input**: Campo de entrada (1 uso(s))
- **Table**: Tabela de dados (1 uso(s))
- **Dialog**: Modal/popup (1 uso(s))

## Integração com Banco de Dados

### Tabelas Utilizadas
- Nenhuma tabela específica identificada



## Dependências

### Bibliotecas
- **react**: useState
- **@tanstack/react-query**: useQuery, useMutation, useQueryClient
- **wouter**: useLocation
- **lucide-react**: Plus, Search, Edit, Trash2, Building2, ExternalLink, Phone, MapPin, Eye, Copy, Globe, Columns3 as Columns, ChevronLeft, ChevronRight

### Componentes
- **@/components/ui/card**: Card, CardContent, CardHeader, CardTitle
- **@/components/ui/button**: Button
- **@/components/ui/input**: Input
- **@/components/ui/badge**: Badge
- **@/components/ui/switch**: Switch
- **@/components/ui/dialog**: Dialog, DialogContent, DialogHeader, DialogTitle
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