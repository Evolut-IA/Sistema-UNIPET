# Settings

## Visão Geral
- **Arquivo**: client\src\pages\Settings.tsx
- **Componente Principal**: Settings
- **Propósito**: Formulário para entrada de dados

## Funcionalidades

### Hooks Utilizados
- **useEffect**: Efeitos colaterais
- **useQuery**: Consulta de dados
- **useMutation**: Mutação de dados

### APIs Consumidas
- **GET /api/settings/site**: Buscar settings
- **GET /api/settings/site**: Buscar settings
- **GET /api/settings/rules**: Buscar settings
- **GET /api/settings/rules**: Buscar settings
- **GET /api/settings/site**: Buscar settings
- **GET /api/settings/site**: Buscar settings
- **GET /api/settings/rules**: Buscar settings
- **GET /api/settings/rules**: Buscar settings

## Elementos de Interface

### Componentes UI
- **Button**: Botão interativo (2 uso(s))
- **Input**: Campo de entrada (7 uso(s))
- **Card**: Container de conteúdo (2 uso(s))
- **Form**: Formulário (2 uso(s))
- **Tabs**: Navegação por abas (1 uso(s))

## Integração com Banco de Dados

### Tabelas Utilizadas
- **plans**: Planos de saúde
  - Operações: SELECT, INSERT, UPDATE



## Dependências

### Bibliotecas
- **react**: useState, useEffect
- **@tanstack/react-query**: useQuery, useMutation, useQueryClient
- **react-hook-form**: useForm
- **@hookform/resolvers/zod**: zodResolver
- **lucide-react**: Settings as SettingsIcon, Globe, Palette, Save, Loader2, FileText, Contact, Share2, Type, Image

### Componentes
- **@/components/ui/card**: Card, CardContent, CardHeader, CardTitle
- **@/components/ui/button**: Button
- **@/components/ui/form**: Form, FormControl, FormField, FormItem, FormLabel, FormMessage
- **@/components/ui/input**: Input
- **@/components/ui/input-masked**: InputMasked
- **@/components/ui/textarea**: Textarea
- **@/components/ui/select**: Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- **@/components/ui/switch**: Switch
- **@/components/ui/tabs**: Tabs, TabsContent, TabsList, TabsTrigger
- **@/components/ui/accordion**: Accordion, AccordionContent, AccordionItem, AccordionTrigger
- **@/components/ThemeEditor**: ThemeEditor
- **@/components/ui/image-upload**: ImageUpload

### Hooks
- **@/hooks/use-toast**: useToast

### Utilitários
- **@/lib/queryClient**: apiRequest

### Tipos
- **@shared/schema**: insertSiteSettingsSchema, insertRulesSettingsSchema

---
*Documentação gerada automaticamente em 20/09/2025, 09:39:32*