#!/usr/bin/env node

// Script para verificar configuração antes do deploy
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Verificando configuração para deploy...\n');

const checks = [];

// Verificar se arquivos necessários existem
const requiredFiles = [
  'Procfile',
  'package.json',
  'easypanel.json',
  'server/index.ts',
  'server/start.js'
];

console.log('📁 Verificando arquivos necessários:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  checks.push({ name: `Arquivo ${file}`, status: exists });
});

// Verificar package.json
console.log('\n📦 Verificando package.json:');
try {
  const packageJson = JSON.parse(fs.readFileSync(join(__dirname, 'package.json'), 'utf8'));
  
  const hasStartScript = packageJson.scripts && packageJson.scripts.start;
  console.log(`  ${hasStartScript ? '✅' : '❌'} Script "start" definido`);
  checks.push({ name: 'Script start', status: hasStartScript });
  
  const hasBuildScript = packageJson.scripts && packageJson.scripts.build;
  console.log(`  ${hasBuildScript ? '✅' : '❌'} Script "build" definido`);
  checks.push({ name: 'Script build', status: hasBuildScript });
  
  const hasPostinstall = packageJson.scripts && packageJson.scripts.postinstall;
  console.log(`  ${hasPostinstall ? '✅' : '❌'} Script "postinstall" definido`);
  checks.push({ name: 'Script postinstall', status: hasPostinstall });
  
  const hasEngines = packageJson.engines && packageJson.engines.node;
  console.log(`  ${hasEngines ? '✅' : '❌'} Versão do Node.js especificada`);
  checks.push({ name: 'Node.js version', status: hasEngines });
  
} catch (error) {
  console.log('  ❌ Erro ao ler package.json');
  checks.push({ name: 'package.json válido', status: false });
}

// Verificar Procfile
console.log('\n🚀 Verificando Procfile:');
try {
  const procfile = fs.readFileSync(join(__dirname, 'Procfile'), 'utf8');
  const hasWebProcess = procfile.includes('web:');
  console.log(`  ${hasWebProcess ? '✅' : '❌'} Processo "web" definido`);
  checks.push({ name: 'Processo web no Procfile', status: hasWebProcess });
  
  const hasNpmStart = procfile.includes('npm start');
  console.log(`  ${hasNpmStart ? '✅' : '❌'} Comando "npm start" configurado`);
  checks.push({ name: 'npm start no Procfile', status: hasNpmStart });
} catch (error) {
  console.log('  ❌ Erro ao ler Procfile');
  checks.push({ name: 'Procfile válido', status: false });
}

// Verificar easypanel.json
console.log('\n⚙️ Verificando easypanel.json:');
try {
  const easypanel = JSON.parse(fs.readFileSync(join(__dirname, 'easypanel.json'), 'utf8'));
  
  const hasCorrectPort = easypanel.ports && easypanel.ports.some(p => p.port === 80);
  console.log(`  ${hasCorrectPort ? '✅' : '❌'} Porta 80 configurada`);
  checks.push({ name: 'Porta 80 no easypanel.json', status: hasCorrectPort });
  
  const hasHealthCheck = easypanel.healthCheck && easypanel.healthCheck.enabled;
  console.log(`  ${hasHealthCheck ? '✅' : '❌'} Health check habilitado`);
  checks.push({ name: 'Health check habilitado', status: hasHealthCheck });
  
  const hasHerokuBuildpack = easypanel.buildpack && easypanel.buildpack.includes('heroku');
  console.log(`  ${hasHerokuBuildpack ? '✅' : '❌'} Heroku buildpack configurado`);
  checks.push({ name: 'Heroku buildpack', status: hasHerokuBuildpack });
} catch (error) {
  console.log('  ❌ Erro ao ler easypanel.json');
  checks.push({ name: 'easypanel.json válido', status: false });
}

// Verificar server/index.ts
console.log('\n🖥️ Verificando servidor:');
try {
  const serverCode = fs.readFileSync(join(__dirname, 'server/index.ts'), 'utf8');
  
  const hasPortEnvVar = serverCode.includes('process.env.PORT');
  console.log(`  ${hasPortEnvVar ? '✅' : '❌'} Usa variável PORT do ambiente`);
  checks.push({ name: 'Variável PORT configurada', status: hasPortEnvVar });
  
  const hasHealthEndpoint = serverCode.includes('/health');
  console.log(`  ${hasHealthEndpoint ? '✅' : '❌'} Endpoint /health implementado`);
  checks.push({ name: 'Endpoint /health', status: hasHealthEndpoint });
  
  const hasGracefulShutdown = serverCode.includes('SIGTERM') || serverCode.includes('SIGINT');
  console.log(`  ${hasGracefulShutdown ? '✅' : '❌'} Graceful shutdown implementado`);
  checks.push({ name: 'Graceful shutdown', status: hasGracefulShutdown });
} catch (error) {
  console.log('  ❌ Erro ao ler server/index.ts');
  checks.push({ name: 'server/index.ts válido', status: false });
}

// Resumo final
console.log('\n📊 Resumo da verificação:');
const passedChecks = checks.filter(c => c.status).length;
const totalChecks = checks.length;
const percentage = Math.round((passedChecks / totalChecks) * 100);

console.log(`  ✅ ${passedChecks}/${totalChecks} verificações passaram (${percentage}%)`);

if (percentage === 100) {
  console.log('\n🎉 Projeto está pronto para deploy no EasyPanel!');
  process.exit(0);
} else {
  console.log('\n⚠️ Alguns problemas foram encontrados. Verifique os itens marcados com ❌');
  console.log('\n❌ Verificações que falharam:');
  checks.filter(c => !c.status).forEach(c => {
    console.log(`  - ${c.name}`);
  });
  process.exit(1);
}