# Procedures

## Visão Geral
- **Arquivo**: client\src\pages\Procedures.tsx
- **Componente Principal**: Procedures
- **Propósito**: Formulário para entrada de dados

## Funcionalidades

### Hooks Utilizados
- **useState**: Gerencia estado local
- **useEffect**: Efeitos colaterais
- **useQuery**: Consulta de dados
- **useMutation**: Mutação de dados

### APIs Consumidas
- **GET /api/procedures**: Buscar procedures
- **GET /api/plans/active**: Buscar plans
- **GET /api/settings/rules**: Buscar settings
- **GET /api/procedures**: Buscar procedures
- **GET /api/procedures**: Buscar procedures
- **PUT /api/procedures/${editingItem.id}**: Atualizar procedures
- **GET /api/procedures**: Buscar procedures
- **DELETE /api/procedures/${procedureId}/plans**: Excluir procedures
- **GET /api/procedures**: Buscar procedures
- **GET /api/procedures**: Buscar procedures
- **GET /api/plans**: Buscar plans
- **GET /api/plans**: Buscar plans
- **DELETE /api/procedures/${id}**: Excluir procedures
- **GET /api/procedures**: Buscar procedures
- **DELETE /api/procedures/${id}**: Excluir procedures
- **GET /api/procedures**: Buscar procedures

## Elementos de Interface

### Componentes UI
- **Button**: Botão interativo (15 uso(s))
- **Input**: Campo de entrada (4 uso(s))
- **Dialog**: Modal/popup (3 uso(s))
- **Form**: Formulário (1 uso(s))
- **Select**: Seletor dropdown (2 uso(s))

## Integração com Banco de Dados

### Tabelas Utilizadas
- **plans**: Planos de saúde
  - Operações: SELECT, INSERT, UPDATE, DELETE
- **procedures**: Procedimentos médicos
  - Operações: SELECT, INSERT, UPDATE, DELETE



## Dependências

### Bibliotecas
- **react**: useState, useEffect
- **@tanstack/react-query**: useQuery, useMutation, useQueryClient
- **react-hook-form**: useForm
- **@hookform/resolvers/zod**: zodResolver
- **date-fns**: format
- **date-fns/locale**: ptBR
- **lucide-react**: Plus, Search, Edit, Trash2, ClipboardList, Eye, DollarSign, X, Columns3 as Columns, ChevronLeft, ChevronRight, Copy, FileText

### Componentes
- **@/components/ui/card**: Card, CardContent, CardHeader, CardTitle
- **@/components/ui/button**: Button
- **@/components/ui/input**: Input
- **@/components/ui/input-masked**: InputMasked
- **@/components/ui/textarea**: Textarea
- **@/components/ui/switch**: Switch
- **@/components/ui/badge**: Badge
- **@/components/ui/dialog**: Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger
- **@/components/ui/form**: Form, FormControl, FormField, FormItem, FormLabel, FormMessage
- **@/components/ui/custom-checkbox**: CustomCheckbox
- **@/components/ui/select**: Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- **@/components/ui/table**: Table, TableBody, TableCell, TableHead, TableHeader, TableRow, 
- **@/components/ui/dropdown-menu**: DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, 

### Utilitários
- **@/lib/utils**: cn
- **@/lib/queryClient**: apiRequest
- **@/lib/constants**: PROCEDURE_TYPES, PROCEDURE_TYPE_LABELS

### Hooks
- **@/hooks/use-toast**: useToast
- **@/hooks/use-column-preferences**: useColumnPreferences

### Tipos
- **@shared/schema**: insertProcedureSchema

---
*Documentação gerada automaticamente em 20/09/2025, 09:39:32*