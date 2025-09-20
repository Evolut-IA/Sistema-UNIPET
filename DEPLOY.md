# Sistema UNIPET - Configuração para Deploy no EasyPanel

Este projeto foi configurado para deploy no EasyPanel utilizando Heroku Buildpacks.

## Configurações de Deploy

### Porta e Servidor
- **Porta**: O servidor está configurado para usar a porta 80 (padrão do EasyPanel)
- **Health Check**: Endpoint `/health` disponível para verificação de saúde
- **Graceful Shutdown**: Implementado para evitar erros de SIGTERM

### Variáveis de Ambiente Necessárias
- `DATABASE_URL`: URL de conexão com o banco de dados PostgreSQL
- `SESSION_SECRET`: Chave secreta para sessões (gerada automaticamente se não fornecida)
- `SENHA`: Senha do administrador (padrão: "admin123" se não fornecida)

### Arquivos de Configuração
- `Procfile`: Define o comando de inicialização (`web: npm start`)
- `easypanel.json`: Configuração específica do EasyPanel
- `.dockerignore`: Arquivos ignorados no build

### Processo de Build
1. Instala dependências (`npm ci`)
2. Executa build automático (`npm run build`)
3. Compila frontend (Vite) e backend (esbuild)
4. Inicia servidor com verificação de saúde

### Melhorias Implementadas
- **Health Check Automático**: Verifica se o servidor está respondendo
- **Graceful Shutdown**: Encerramento seguro do processo
- **Tratamento de Sinais**: SIGTERM e SIGINT tratados adequadamente
- **Timeout de Inicialização**: 60 segundos para o servidor ficar disponível
- **Logs Detalhados**: Acompanhamento do processo de inicialização

### Comandos Úteis
```bash
# Verificar saúde do servidor
npm run health

# Build local
npm run build

# Iniciar em desenvolvimento
npm run dev
```

### Troubleshooting
Se o deploy falhar:
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Consulte os logs de build e runtime no EasyPanel
3. Verifique se o endpoint `/health` está respondendo
4. Confirme se a porta 80 está sendo usada corretamente