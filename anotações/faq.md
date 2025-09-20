# FAQ

## Visão Geral
- **Arquivo**: client\src\pages\FAQ.tsx
- **Componente Principal**: FAQ
- **Propósito**: Formulário para entrada de dados

## Funcionalidades

### Hooks Utilizados
- **useState**: Gerencia estado local
- **useQuery**: Consulta de dados
- **useMutation**: Mutação de dados

### APIs Consumidas
- **GET /api/faq**: Buscar faq
- **PUT /api/faq/${editingItem.id}**: Atualizar faq
- **GET /api/faq**: Buscar faq
- **GET /api/faq**: Buscar faq
- **DELETE /api/faq/${id}**: Excluir faq
- **GET /api/faq**: Buscar faq
- **DELETE /api/faq/${id}**: Excluir faq
- **GET /api/faq**: Buscar faq

## Elementos de Interface

### Componentes UI
- **Button**: Botão interativo (9 uso(s))
- **Input**: Campo de entrada (2 uso(s))
- **Table**: Tabela de dados (1 uso(s))
- **Dialog**: Modal/popup (2 uso(s))
- **Form**: Formulário (1 uso(s))

## Integração com Banco de Dados

### Tabelas Utilizadas
- Nenhuma tabela específica identificada



## Dependências

### Bibliotecas
- **react**: useState
- **@tanstack/react-query**: useQuery, useMutation, useQueryClient
- **react-hook-form**: useForm
- **@hookform/resolvers/zod**: zodResolver
- **lucide-react**: Plus, Search, Edit, Trash2, HelpCircle, Columns3 as Columns, ChevronLeft, ChevronRight
- **date-fns**: format
- **date-fns/locale**: ptBR

### Componentes
- **@/components/ui/card**: Card, CardContent, CardHeader, CardTitle
- **@/components/ui/button**: Button
- **@/components/ui/input**: Input
- **@/components/ui/textarea**: Textarea
- **@/components/ui/switch**: Switch
- **@/components/ui/badge**: Badge
- **@/components/ui/dialog**: Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
- **@/components/ui/form**: Form, FormControl, FormField, FormItem, FormLabel, FormMessage
- **@/components/ui/accordion**: Accordion, AccordionContent, AccordionItem, AccordionTrigger
- **@/components/ui/table**: Table, TableBody, TableCell, TableHead, TableHeader, TableRow, 
- **@/components/ui/dropdown-menu**: DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, 

### Utilitários
- **@/lib/queryClient**: apiRequest
- **@/lib/utils**: cn

### Hooks
- **@/hooks/use-toast**: useToast
- **@/hooks/use-column-preferences**: useColumnPreferences

### Tipos
- **@shared/schema**: insertFaqItemSchema

---
*Documentação gerada automaticamente em 20/09/2025, 09:39:32*