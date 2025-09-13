# 🛠️ ORIENTAÇÕES PRÁTICAS PARA ALTERAÇÕES NO SITE - SISTEMA UNIPET

## 🎯 Como Fazer Alterações que Realmente Funcionam

Este documento fornece orientações diretas e práticas para realizar alterações no site do Sistema UNIPET de forma que realmente funcione - alterando o backend e transparecendo corretamente no frontend, sem quebrar código ou causar erros.

---

## 🚨 REGRAS FUNDAMENTAIS

### ⚠️ ANTES DE QUALQUER ALTERAÇÃO:
1. **SEMPRE faça backup**: `git add . && git commit -m "backup antes de alterações"`
2. **Teste em desenvolvimento**: `npm run dev` e verifique se funciona
3. **Verifique o console**: Sempre olhe o console do navegador para erros
4. **Mantenha o tema consistente**: Use as variáveis CSS do sistema, nunca cores hardcoded

---

## 🔧 COMO REMOVER UMA DIV OU ELEMENTO

### 1. Identificar o Elemento
```bash
# Buscar por classes ou IDs específicos
grep -r "nome-da-classe" client/src/
grep -r "data-testid" client/src/
```

### 2. Verificar Dependências
- O elemento é usado em outros componentes?
- Tem referências em testes?
- Faz parte da navegação?
- É usado em formulários?

### 3. Remover Seguramente
```tsx
// ❌ ANTES - Elemento a ser removido
<div className="bg-card p-4 rounded-lg">
  <h3 className="text-foreground font-semibold">Título</h3>
  <p className="text-muted-foreground">Conteúdo</p>
</div>

// ✅ DEPOIS - Elemento removido
// (simplesmente remover a div e seu conteúdo)
```

### 4. Verificar se Não Quebrou
- Layout ainda funciona?
- Grid/Flexbox não quebrou?
- Responsividade mantida?
- Espaçamento correto?

---

## 🎨 COMO ALTERAR CORES E APARÊNCIA

### ✅ SEMPRE Use o Sistema de Tema
```tsx
// ✅ CORRETO - Usar variáveis do sistema
<div className="bg-primary text-primary-foreground">
  <Button className="bg-accent text-accent-foreground">
    Botão
  </Button>
</div>

// ❌ NUNCA - Cores hardcoded
<div className="bg-blue-500 text-white">
  <Button className="bg-green-500 text-white">
    Botão
  </Button>
</div>
```

### Adicionar Nova Cor ao Sistema
```css
/* 1. Adicionar em client/src/index.css */
:root {
  --nova-cor: hsl(180 50% 50%);
}

.dark {
  --nova-cor: hsl(180 50% 70%);
}
```

```typescript
/* 2. Mapear em tailwind.config.ts */
colors: {
  "nova-cor": "var(--nova-cor)",
}
```

```tsx
/* 3. Usar nos componentes */
<div className="bg-nova-cor text-foreground">
  Conteúdo
</div>
```

---

## 📝 COMO ADICIONAR NOVOS CAMPOS

### 1. Atualizar Schema (Backend)
```typescript
// shared/schema.ts
export const clients = pgTable("clients", {
  // ... campos existentes
  novoCampo: text("novo_campo"), // Novo campo
});
```

### 2. Atualizar Validação
```typescript
// Atualizar insertClientSchema
export const insertClientSchema = createInsertSchema(clients)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    novoCampo: z.string().optional(), // Nova validação
  });
```

### 3. Atualizar Storage (Backend)
```typescript
// server/storage.ts
async createClient(client: InsertClient): Promise<Client> {
  const result = await db.insert(schema.clients)
    .values(client) // Inclui automaticamente o novo campo
    .returning();
  return result[0];
}
```

### 4. Atualizar Frontend
```tsx
// client/src/pages/ClientForm.tsx
const form = useForm({
  resolver: zodResolver(insertClientSchema),
  defaultValues: {
    // ... campos existentes
    novoCampo: "", // Novo campo
  },
});

// No JSX
<FormField
  control={form.control}
  name="novoCampo"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Novo Campo</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## 🔄 COMO MODIFICAR APIs

### 1. Adicionar Nova Rota (Backend)
```typescript
// server/routes.ts
app.get("/api/novo-endpoint", async (req, res) => {
  try {
    const data = await storage.novoMetodo();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar dados" });
  }
});
```

### 2. Adicionar Método no Storage
```typescript
// server/storage.ts
async novoMetodo(): Promise<any[]> {
  return await db.select().from(schema.tabela);
}
```

### 3. Usar no Frontend
```tsx
// Usar React Query
const { data, isLoading } = useQuery({
  queryKey: ["/api/novo-endpoint"],
  queryFn: () => apiRequest("GET", "/api/novo-endpoint"),
});
```

---

## 📄 COMO MODIFICAR PÁGINAS ESPECÍFICAS

### Dashboard
```tsx
// client/src/pages/Dashboard.tsx
// Para adicionar nova métrica:
<Card>
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Nova Métrica</p>
        <p className="text-3xl font-bold text-foreground">
          {stats?.novaMetrica || 0}
        </p>
      </div>
      <Icone className="h-8 w-8 text-primary" />
    </div>
  </CardContent>
</Card>
```

### Configurações
```tsx
// client/src/pages/Settings.tsx
// Para adicionar nova aba:
<TabsList className="grid w-full grid-cols-3">
  <TabsTrigger value="site">Site</TabsTrigger>
  <TabsTrigger value="theme">Tema</TabsTrigger>
  <TabsTrigger value="nova-aba">Nova Aba</TabsTrigger>
</TabsList>

<TabsContent value="nova-aba">
  {/* Conteúdo da nova aba */}
</TabsContent>
```

---

## 🗃️ COMO MODIFICAR BANCO DE DADOS

### Adicionar Nova Tabela
```typescript
// shared/schema.ts
export const novaTabela = pgTable("nova_tabela", {
  id: text("id").primaryKey().default(nanoid()),
  nome: text("nome").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### Adicionar Campo em Tabela Existente
```typescript
// shared/schema.ts
export const clients = pgTable("clients", {
  // ... campos existentes
  novoCampo: text("novo_campo"), // Novo campo
});
```

### Executar Migração
```bash
# Gerar migração
npm run db:generate

# Aplicar migração
npm run db:push
```

---

## 🎯 COMO MODIFICAR SISTEMA DE TEMA

### Adicionar Nova Variável de Cor
```css
/* client/src/index.css */
:root {
  --nova-cor: hsl(180 50% 50%);
  --nova-cor-foreground: hsl(180 50% 10%);
}

.dark {
  --nova-cor: hsl(180 50% 70%);
  --nova-cor-foreground: hsl(180 50% 90%);
}
```

### Mapear no Tailwind
```typescript
// tailwind.config.ts
colors: {
  "nova-cor": "var(--nova-cor)",
  "nova-cor-foreground": "var(--nova-cor-foreground)",
}
```

### Usar nos Componentes
```tsx
<div className="bg-nova-cor text-nova-cor-foreground">
  Conteúdo com nova cor
</div>
```

---

## ⚡ COMO MODIFICAR QUERIES E DADOS

### Atualizar Query Existente
```tsx
// client/src/lib/queryClient.ts
const { data: clients } = useQuery<Client[]>({
  queryKey: ["/api/clients"],
  queryFn: () => apiRequest("GET", "/api/clients"),
  // Adicionar novas opções se necessário
  staleTime: 5 * 60 * 1000, // 5 minutos
});
```

### Adicionar Nova Query
```tsx
const { data: novaData } = useQuery({
  queryKey: ["/api/nova-rota"],
  queryFn: () => apiRequest("GET", "/api/nova-rota"),
});
```

### Invalidar Cache
```tsx
// Após criar/editar/deletar
queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
```

---

## 🔍 COMO DEBUGGAR PROBLEMAS

### Erros de TypeScript
```bash
# Verificar tipos
npm run check

# Erro comum: Property 'X' does not exist on type '{}'
# Solução: Verificar se a query está tipada corretamente
const { data: clients } = useQuery<Client[]>({
  queryKey: ["/api/clients"],
});
```

### Erros de Tema
```tsx
// Erro: Cores não aplicam
// Solução: Verificar se está usando variáveis CSS
<div className="bg-primary text-primary-foreground">
  {/* Em vez de bg-blue-500 text-white */}
</div>
```

### Erros de Validação
```typescript
// Erro: Validação falha
// Solução: Verificar se schema está sincronizado
const form = useForm({
  resolver: zodResolver(insertClientSchema), // Deve estar atualizado
});
```

### Erros de API
```typescript
// Erro: 404 Not Found
// Solução: Verificar se rota existe no backend
app.get("/api/endpoint", async (req, res) => {
  // Rota deve existir em server/routes.ts
});
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

### Antes de Fazer Alterações
- [ ] **Backup**: `git add . && git commit -m "backup"`
- [ ] **Análise**: Identificar arquivos afetados
- [ ] **Dependências**: Verificar impactos em outros componentes

### Durante o Desenvolvimento
- [ ] **Schema**: Atualizar definições de dados
- [ ] **Storage**: Modificar métodos de acesso
- [ ] **Routes**: Atualizar endpoints da API
- [ ] **Tipos**: Sincronizar TypeScript
- [ ] **Componentes**: Modificar UI
- [ ] **Tema**: Usar sistema de cores consistente

### Após as Alterações
- [ ] **Console**: Verificar ausência de erros
- [ ] **Funcionalidade**: Testar todas as funcionalidades modificadas
- [ ] **Responsividade**: Verificar em diferentes dispositivos
- [ ] **Tema**: Validar consistência visual
- [ ] **Performance**: Verificar tempo de carregamento

---

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### "Property does not exist on type '{}'"
**Causa**: Query não está tipada corretamente
**Solução**: Adicionar tipo genérico na query
```tsx
const { data } = useQuery<Client[]>({ ... });
```

### "Cores não aplicam"
**Causa**: Usando cores hardcoded em vez de variáveis CSS
**Solução**: Usar variáveis do sistema de tema
```tsx
<div className="bg-primary text-primary-foreground">
```

### "Validação falha"
**Causa**: Schema não está sincronizado entre frontend e backend
**Solução**: Atualizar validação Zod
```typescript
const form = useForm({
  resolver: zodResolver(insertClientSchema), // Deve estar atualizado
});
```

### "404 Not Found"
**Causa**: Rota não existe no backend
**Solução**: Verificar se rota existe em `server/routes.ts`

### "Layout quebrou"
**Causa**: Remoção de elemento afetou grid/flexbox
**Solução**: Verificar estrutura de layout e ajustar

---

## 📚 COMANDOS ÚTEIS

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Verificar tipos
npm run check

# Migrações do banco
npm run db:generate
npm run db:push

# Git
git add .
git commit -m "descrição da alteração"
git push
```

---

## 🎯 RESUMO: FLUXO PARA QUALQUER ALTERAÇÃO

1. **Backup**: `git add . && git commit -m "backup"`
2. **Identificar**: O que precisa ser alterado
3. **Backend**: Atualizar schema, storage, routes (se necessário)
4. **Frontend**: Atualizar tipos, componentes, queries
5. **Tema**: Usar variáveis CSS consistentes
6. **Testar**: Verificar console, funcionalidade, responsividade
7. **Commit**: `git add . && git commit -m "alteração realizada"`

---

*Documento criado em: 19 de dezembro de 2024*  
*Versão: 1.0*  
*Sistema: UNIPET - Gestão de Planos de Saúde Pet*