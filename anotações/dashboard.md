# Dashboard

## Visão Geral
- **Arquivo**: client\src\pages\Dashboard.tsx
- **Componente Principal**: Dashboard
- **Propósito**: Dashboard com métricas e visualizações

## Funcionalidades

### Hooks Utilizados
- **useState**: Gerencia estado local
- **useEffect**: Efeitos colaterais
- **useQuery**: Consulta de dados

### APIs Consumidas
- **GET /api/dashboard/all**: Buscar dashboard
- **GET /api/dashboard/all?${params}**: Buscar dashboard

## Elementos de Interface

### Componentes UI
- Componentes UI básicos

## Integração com Banco de Dados

### Tabelas Utilizadas
- **clients**: Clientes cadastrados
- **pets**: Pets dos clientes
- **plans**: Planos de saúde
- **guides**: Guias de atendimento
- **networkUnits**: Unidades da rede



## Dependências

### Bibliotecas
- **react**: useState, useEffect, useMemo
- **@tanstack/react-query**: useQuery
- **wouter**: useLocation
- **lucide-react**: Users, PawPrint, FileText, TrendingUp, Plus, User, ExternalLink
- **date-fns**: format
- **date-fns/locale**: ptBR
- **recharts**: PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
- **@internationalized/date**: CalendarDate

### Componentes
- **@/components/ui/card**: Card, CardContent, CardHeader, CardTitle
- **@/components/ui/button**: Button
- **@/components/ui/badge**: Badge
- **@/components/ui/skeleton**: Skeleton
- **@/components/ui/alert**: Alert, AlertDescription
- **@/components/ui/chart**: ChartContainer, ChartTooltip, ChartTooltipContent
- **@/components/DateFilterComponent**: DateFilterComponent

### Utilitários
- **@/lib/date-utils**: getDateRangeParams

---
*Documentação gerada automaticamente em 20/09/2025, 09:39:32*