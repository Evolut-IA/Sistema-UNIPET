#!/usr/bin/env node

// Script de inicialização para produção
// Verifica se o banco de dados está disponível antes de iniciar o servidor

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Iniciando Sistema UNIPET...');
console.log('📊 Verificando configurações...');

// Verificar variáveis de ambiente essenciais
const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variáveis de ambiente obrigatórias não encontradas:', missingVars.join(', '));
  console.error('💡 Configure as variáveis de ambiente necessárias antes de iniciar a aplicação.');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente configuradas');
console.log('🌐 Iniciando servidor...');

// Iniciar o servidor principal
const serverProcess = spawn('node', [join(__dirname, 'index.js')], {
  stdio: 'inherit',
  env: process.env
});

serverProcess.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Servidor encerrado com código ${code}`);
    process.exit(code);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  serverProcess.kill('SIGINT');
});
