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
PORT=3000
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-super-secret-session-key
```

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

1. Verifique se todas as variáveis de ambiente estão configuradas
2. Confirme se o banco de dados está acessível
3. Verifique os logs de build no EasyPanel
4. Teste localmente com `npm run build && npm start`
