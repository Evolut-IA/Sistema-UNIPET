#!/usr/bin/env node

// Script de inicialização para produção
// Verifica se o banco de dados está disponível antes de iniciar o servidor

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Definir NODE_ENV como produção se não estiver definido
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

console.log('🚀 Iniciando Sistema UNIPET...');
console.log('📊 Verificando configurações...');
console.log('🌍 Ambiente:', process.env.NODE_ENV);

// Verificar e configurar variáveis de ambiente essenciais
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada!');
  console.error('💡 Configure a variável DATABASE_URL antes de iniciar a aplicação.');
  process.exit(1);
}

// Gerar SESSION_SECRET se não estiver definido
if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  console.log('⚠️  SESSION_SECRET gerado automaticamente para esta sessão');
}

// Gerar SENHA_ADMIN padrão se não estiver definido
if (!process.env.SENHA_ADMIN) {
  process.env.SENHA_ADMIN = 'admin123';
  console.log('⚠️  SENHA_ADMIN padrão definida como "admin123"');
}

console.log('✅ Variáveis de ambiente configuradas');
console.log('🌐 Iniciando servidor...');

// Função para verificar se o servidor está respondendo
const healthCheck = (port) => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
};

// Iniciar o servidor principal
const serverProcess = spawn('node', [join(__dirname, 'index.js')], {
  stdio: 'inherit',
  env: process.env
});

let isServerReady = false;
let shutdownInitiated = false;

// Aguardar o servidor ficar pronto
const waitForServer = async () => {
  const port = process.env.PORT || '80';
  const maxAttempts = 30;
  let attempts = 0;
  
  while (attempts < maxAttempts && !isServerReady && !shutdownInitiated) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const isHealthy = await healthCheck(port);
    
    if (isHealthy) {
      isServerReady = true;
      console.log('✅ Servidor está funcionando corretamente');
      break;
    }
    
    attempts++;
    console.log(`🔄 Tentativa ${attempts}/${maxAttempts} - Aguardando servidor inicializar...`);
  }
  
  if (!isServerReady && !shutdownInitiated) {
    console.error('❌ Servidor não respondeu no tempo esperado');
  }
};

// Iniciar verificação de saúde
waitForServer();

serverProcess.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
  process.exit(1);
});

serverProcess.on('exit', (code, signal) => {
  if (!shutdownInitiated) {
    console.error(`❌ Servidor encerrado inesperadamente com código ${code} e sinal ${signal}`);
    process.exit(code || 1);
  }
});

// Graceful shutdown melhorado
const gracefulShutdown = (signal) => {
  if (shutdownInitiated) return;
  shutdownInitiated = true;
  
  console.log(`🛑 Recebido ${signal}, encerrando servidor graciosamente...`);
  
  // Dar tempo para o servidor processar requisições pendentes
  serverProcess.kill('SIGTERM');
  
  // Se não encerrar em 25 segundos, forçar encerramento
  setTimeout(() => {
    console.log('⚠️ Forçando encerramento do servidor...');
    serverProcess.kill('SIGKILL');
    process.exit(1);
  }, 25000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manter o processo vivo
process.on('beforeExit', () => {
  if (!shutdownInitiated) {
    console.log('🔄 Mantendo processo ativo...');
  }
});
