# Deploy no EasyPanel

Este projeto está configurado para deploy no EasyPanel usando Buildpacks com o construtor `heroku/builder:24`.

## Configuração

### Arquivos de Configuração Criados

- `Procfile` - Define o comando de start da aplicação
- `app.json` - Configuração para Heroku/EasyPanel
- `easypanel.json` - Configuração específica do EasyPanel
- `.buildpacks` - Especifica o buildpack do Node.js
- `env.example` - Exemplo de variáveis de ambiente

### Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente no EasyPanel:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-super-secret-session-key
SENHA_ADMIN=your-admin-password
```

**Nota**: A variável `PORT` é definida automaticamente pelo EasyPanel.

**⚠️ IMPORTANTE**: Todas essas variáveis são obrigatórias para o funcionamento correto da aplicação.

### Passos para Deploy

1. **Conecte o repositório** no EasyPanel
2. **Configure as variáveis de ambiente** usando o arquivo `env.example` como referência
3. **Configure o banco de dados** PostgreSQL
4. **Execute o deploy** - o EasyPanel irá:
   - Instalar dependências (`npm install`)
   - Executar o build (`npm run build` via postinstall)
   - Iniciar a aplicação (`npm start`)

### Buildpacks Utilizados

- **heroku/nodejs** - Para aplicações Node.js
- **Construtor**: `heroku/builder:24`

### Scripts de Build

- `npm run build` - Compila o frontend (Vite) e backend (esbuild)
- `npm start` - Inicia a aplicação em produção
- `npm run postinstall` - Executado automaticamente após `npm install`

### Estrutura do Projeto

```
├── client/          # Frontend React
├── server/          # Backend Express
├── shared/          # Código compartilhado
├── dist/            # Build de produção
├── Procfile         # Comando de start
├── app.json         # Configuração Heroku
├── easypanel.json   # Configuração EasyPanel
└── .buildpacks      # Buildpack specification
```

### Troubleshooting

Se houver problemas no deploy:

#### Problemas Comuns

1. **Erro "cross-env: not found"**
   - ✅ **CORRIGIDO**: Removido cross-env dos scripts de produção
   - O NODE_ENV agora é definido diretamente no código

2. **Erro "vite: not found" durante o build**
   - ✅ **CORRIGIDO**: Movidas dependências de build para `dependencies`
   - Vite, esbuild, TypeScript e outras ferramentas de build agora são instaladas em produção

3. **Erro "Cannot find package '@replit/vite-plugin-runtime-error-modal'"**
   - ✅ **CORRIGIDO**: Plugins do Replit agora são importados condicionalmente apenas em desenvolvimento
   - Em produção, apenas o plugin React é usado

4. **Erro "Cannot find module '@tailwindcss/typography'"**
   - ✅ **CORRIGIDO**: Movido `@tailwindcss/typography` para `dependencies`
   - Plugin necessário para o build do Tailwind CSS

5. **Erro 404 - Página não encontrada**
   - ✅ **CORRIGIDO**: Caminho dos arquivos estáticos corrigido de `public` para `dist/public`

6. **Erro de conexão com banco de dados**
   - Verifique se `DATABASE_URL` está configurada corretamente
   - Confirme se o banco PostgreSQL está acessível
   - Verifique se as credenciais estão corretas

7. **Servidor não inicia**
   - Verifique se todas as variáveis de ambiente obrigatórias estão configuradas
   - Confirme se a porta está disponível (definida automaticamente pelo EasyPanel)
   - Verifique os logs de inicialização

8. **Build falha**
   - Verifique se todas as dependências estão no `package.json`
   - Confirme se o Node.js versão >=18 está sendo usado

#### Verificações

1. **Variáveis de ambiente obrigatórias**:
   ```bash
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   SESSION_SECRET=...
   SENHA_ADMIN=...
   ```
   (PORT é definida automaticamente pelo EasyPanel)

2. **Teste local**:
   ```bash
   npm run build
   npm start
   ```

3. **Logs importantes**:
   - "Database URL configured: Yes"
   - "Database connection successful!"
   - "serving on port 3000"
