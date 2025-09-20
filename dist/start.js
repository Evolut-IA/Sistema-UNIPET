#!/usr/bin/env node

// server/start.js
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import http from "http";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}
console.log("\u{1F680} Iniciando Sistema UNIPET...");
console.log("\u{1F4CA} Verificando configura\xE7\xF5es...");
console.log("\u{1F30D} Ambiente:", process.env.NODE_ENV);
if (!process.env.DATABASE_URL) {
  console.error("\u274C DATABASE_URL n\xE3o encontrada!");
  console.error("\u{1F4A1} Configure a vari\xE1vel DATABASE_URL antes de iniciar a aplica\xE7\xE3o.");
  process.exit(1);
}
if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  console.log("\u26A0\uFE0F  SESSION_SECRET gerado automaticamente para esta sess\xE3o");
}
if (!process.env.SENHA_ADMIN) {
  process.env.SENHA_ADMIN = "admin123";
  console.log('\u26A0\uFE0F  SENHA_ADMIN padr\xE3o definida como "admin123"');
}
console.log("\u2705 Vari\xE1veis de ambiente configuradas");
console.log("\u{1F310} Iniciando servidor...");
var healthCheck = (port) => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: "localhost",
      port,
      path: "/health",
      method: "GET",
      timeout: 5e3
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
};
var serverProcess = spawn("node", [join(__dirname, "index.js")], {
  stdio: "inherit",
  env: process.env
});
var isServerReady = false;
var shutdownInitiated = false;
var waitForServer = async () => {
  const port = process.env.PORT || "80";
  const maxAttempts = 30;
  let attempts = 0;
  while (attempts < maxAttempts && !isServerReady && !shutdownInitiated) {
    await new Promise((resolve) => setTimeout(resolve, 2e3));
    const isHealthy = await healthCheck(port);
    if (isHealthy) {
      isServerReady = true;
      console.log("\u2705 Servidor est\xE1 funcionando corretamente");
      break;
    }
    attempts++;
    console.log(`\u{1F504} Tentativa ${attempts}/${maxAttempts} - Aguardando servidor inicializar...`);
  }
  if (!isServerReady && !shutdownInitiated) {
    console.error("\u274C Servidor n\xE3o respondeu no tempo esperado");
  }
};
waitForServer();
serverProcess.on("error", (error) => {
  console.error("\u274C Erro ao iniciar servidor:", error);
  process.exit(1);
});
serverProcess.on("exit", (code, signal) => {
  if (!shutdownInitiated) {
    console.error(`\u274C Servidor encerrado inesperadamente com c\xF3digo ${code} e sinal ${signal}`);
    process.exit(code || 1);
  }
});
var gracefulShutdown = (signal) => {
  if (shutdownInitiated) return;
  shutdownInitiated = true;
  console.log(`\u{1F6D1} Recebido ${signal}, encerrando servidor graciosamente...`);
  serverProcess.kill("SIGTERM");
  setTimeout(() => {
    console.log("\u26A0\uFE0F For\xE7ando encerramento do servidor...");
    serverProcess.kill("SIGKILL");
    process.exit(1);
  }, 25e3);
};
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("beforeExit", () => {
  if (!shutdownInitiated) {
    console.log("\u{1F504} Mantendo processo ativo...");
  }
});
