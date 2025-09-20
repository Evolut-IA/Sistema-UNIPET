# UnitDashboard

## Visão Geral
- **Arquivo**: client\src\pages\UnitDashboard.tsx
- **Componente Principal**: UnitDashboard
- **Propósito**: Dashboard com métricas e visualizações

## Funcionalidades

### Hooks Utilizados
- **useState**: Gerencia estado local
- **useEffect**: Efeitos colaterais

### APIs Consumidas
- **GET /api/unit/verify-session**: Buscar unit
- **POST /api/unit/login**: Criar unit
- **POST /api/unit/logout**: Criar unit
- **POST /api/unit/${authState.unit?.id}/guides**: Criar unit
- **POST /api/unit/${authState.unit.id}/clients**: Criar unit
- **POST /api/unit/${authState.unit.id}/coverage**: Criar unit
- **POST /api/unit/${authState.unit.id}/clients**: Criar unit
- **POST /api/clients/${client.id}/pets**: Criar clients
- **POST /api/unit/${authState.unit.id}/clients**: Criar unit
- **POST /api/clients/${clientId}/pets**: Criar clients
- **POST /api/plans/${selectedPet.planId}**: Criar plans
- **POST /api/procedures/active**: Criar procedures
- **POST /api/unit/${authState.unit.id}/coverage**: Criar unit
- **POST /api/unit/guides**: Criar unit
- **PUT /api/unit/guides/${guideId}/status**: Atualizar unit

## Elementos de Interface

### Componentes UI
- **Button**: Botão interativo (14 uso(s))
- **Input**: Campo de entrada (6 uso(s))
- **Card**: Container de conteúdo (7 uso(s))
- **Select**: Seletor dropdown (6 uso(s))
- **Tabs**: Navegação por abas (2 uso(s))

## Integração com Banco de Dados

### Tabelas Utilizadas
- **clients**: Clientes cadastrados
  - Operações: SELECT, INSERT, UPDATE
- **pets**: Pets dos clientes
  - Operações: SELECT, INSERT, UPDATE
- **plans**: Planos de saúde
  - Operações: SELECT, INSERT, UPDATE
- **guides**: Guias de atendimento
  - Operações: SELECT, INSERT, UPDATE
- **procedures**: Procedimentos médicos
  - Operações: SELECT, INSERT, UPDATE



## Dependências

### Bibliotecas
- **react**: useState, useEffect, useMemo
- **lucide-react**: Calendar, FileText, User, PawPrint, MapPin, Clock, DollarSign, CheckCircle, XCircle, Eye, Users, CreditCard, Plus, IdCard, TableProperties, Search, Calculator, AlertCircle, Info
- **wouter**: Link

### Componentes
- **@/components/ui/button**: Button
- **@/components/ui/card**: Card, CardContent, CardDescription, CardHeader, CardTitle
- **@/components/ui/badge**: Badge
- **@/components/ui/tabs**: Tabs, TabsContent, TabsList, TabsTrigger
- **@/components/ui/input**: Input
- **@/components/ui/label**: Label
- **@/components/ui/textarea**: Textarea
- **@/components/ui/select**: Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- **@/components/DigitalCard**: DigitalCard

---
*Documentação gerada automaticamente em 20/09/2025, 09:39:32*