import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeConfig } from "./config/app-config";
import { errorHandler, logInfo } from "./utils/error-handler";

// Inicializar configurações robustas
initializeConfig();

// Verificar se o elemento root existe
const rootElement = document.getElementById("root");

if (!rootElement) {
  const error = new Error("Root element not found");
  errorHandler.handleError(error, { context: 'initialization', phase: 'root-check' });
  throw error;
}

// Função de inicialização robusta
async function initializeApp(): Promise<void> {
  try {
    logInfo('🚀 Iniciando aplicação...', { 
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Verificar se o navegador suporta recursos necessários
    if (!window.fetch) {
      throw new Error('Fetch API não suportada');
    }

    if (!window.Promise) {
      throw new Error('Promises não suportadas');
    }

    // Verificar conectividade
    if (!navigator.onLine) {
      logInfo('⚠️ Aplicação iniciando offline', { 
        online: navigator.onLine,
        connectionType: (navigator as any).connection?.effectiveType || 'unknown'
      });
    }

    // Criar root do React
    const root = createRoot(rootElement!);
    
    // Renderizar aplicação
    root.render(<App />);

    logInfo('✅ Aplicação inicializada com sucesso', {
      reactVersion: React.version,
      nodeEnv: process.env.NODE_ENV
    });

  } catch (error) {
    const appError = error instanceof Error ? error : new Error(String(error));
    
    errorHandler.handleError(appError, { 
      context: 'initialization', 
      phase: 'app-startup' 
    });

    // Mostrar erro de inicialização robusto
    showInitializationError(appError);
  }
}

// Função para mostrar erro de inicialização de forma robusta
function showInitializationError(error: Error): void {
  try {
    // Remover qualquer conteúdo existente
    if (rootElement) {
      rootElement.innerHTML = '';
    }

    // Criar elemento de erro robusto
    const errorDiv = document.createElement("div");
    errorDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, var(--bg-red-2) 0%, var(--bg-red-3) 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        color: white;
        text-align: center;
        padding: 20px;
        box-sizing: border-box;
      ">
        <div style="font-size: 48px; margin-bottom: 20px;">🚨</div>
        <h1 style="font-size: 24px; margin-bottom: 16px; margin: 0 0 16px 0;">
          Falha na inicialização
        </h1>
        <p style="font-size: 16px; margin-bottom: 24px; max-width: 500px; line-height: 1.5;">
          Erro: ${error.message}
        </p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
          <button onclick="window.location.href='/'" style="
            background: var(--bg-teal);
            color: var(--text-light);
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
            min-width: 140px;
          " onmouseover="this.style.background='var(--bg-teal-dark)'" onmouseout="this.style.background='var(--bg-teal)'"> 
            🏠 Página Inicial
          </button>
        </div>
        <div style="
          margin-top: 24px;
          font-size: 12px;
          opacity: 0.8;
          max-width: 600px;
        ">
          <p>Se o problema persistir, tente:</p>
          <ul style="text-align: left; display: inline-block; margin: 8px 0;">
            <li>Limpar cache do navegador</li>
            <li>Verificar conexão com a internet</li>
            <li>Usar um navegador diferente</li>
            <li>Contatar suporte técnico</li>
          </ul>
        </div>
        <div style="
          margin-top: 16px;
          font-size: 10px;
          opacity: 0.6;
          font-family: monospace;
        ">
          ${error.stack ? error.stack.split('\n').slice(0, 3).join('\n') : 'Stack trace não disponível'}
        </div>
      </div>
    `;

    // Adicionar ao DOM
    document.body.appendChild(errorDiv);

    // Log adicional
    console.error('❌ Falha crítica na inicialização:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });

  } catch (fallbackError) {
    // Fallback extremo se até o erro falhar
    console.error('❌ Falha no fallback de erro:', fallbackError);
    
    // Mensagem simples no console
    console.error(`
      🚨 FALHA CRÍTICA NA APLICAÇÃO
      ==============================
      Erro: ${error.message}
      Stack: ${error.stack}
      
      Por favor:
      1. Recarregue a página
      2. Limpe o cache do navegador
      3. Verifique sua conexão
      4. Contate o suporte se o problema persistir
    `);
  }
}

// Função para verificar saúde da aplicação
function checkAppHealth(): void {
  try {
    // Verificar se o DOM está funcionando
    if (!document.body) {
      throw new Error('DOM não está funcionando corretamente');
    }

    // Verificar se o JavaScript está funcionando
    if (typeof window === 'undefined') {
      throw new Error('Objeto window não disponível');
    }

    // Verificar se as APIs básicas estão funcionando
    if (typeof JSON === 'undefined') {
      throw new Error('JSON API não disponível');
    }

    logInfo('✅ Verificação de saúde da aplicação passou', {
      dom: !!document.body,
      window: !!window,
      json: !!JSON
    });

  } catch (error) {
    errorHandler.handleError(error, { 
      context: 'health-check', 
      phase: 'startup' 
    });
  }
}

// Função para configurar listeners de recuperação
function setupRecoveryListeners(): void {
  // Listener para quando a conexão volta
  window.addEventListener('online', () => {
    logInfo('🌐 Conexão restaurada', { timestamp: new Date().toISOString() });
    
    // Tentar recarregar dados se necessário
    if (window.location.pathname !== '/') {
      logInfo('🔄 Tentando restaurar estado da aplicação...');
    }
  });

  // Listener para quando a conexão cai
  window.addEventListener('offline', () => {
    logInfo('📡 Conexão perdida', { timestamp: new Date().toISOString() });
    
    // Mostrar notificação para o usuário
    showOfflineNotification();
  });

  // Listener para mudanças na visibilidade da página
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      logInfo('👁️ Página oculta', { timestamp: new Date().toISOString() });
    } else {
      logInfo('👁️ Página visível', { timestamp: new Date().toISOString() });
    }
  });

  // Listener para erros de recursos
  window.addEventListener('error', (event) => {
    if (event.target && event.target !== window) {
      const target = event.target as HTMLElement;
      logInfo('📦 Erro de recurso detectado', {
        type: target.tagName,
        src: (target as any).src || (target as any).href
      });
    }
  }, true);
}

// Função para mostrar notificação offline
function showOfflineNotification(): void {
  try {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-gold);
        color: var(--text-light);
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px var(--shadow-dark);
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        📡 <span>Você está offline. Algumas funcionalidades podem não funcionar.</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Remover após 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);

  } catch (error) {
    console.warn('⚠️ Falha ao mostrar notificação offline:', error);
  }
}

// Inicializar aplicação de forma robusta
try {
  // Verificar saúde primeiro
  checkAppHealth();
  
  // Configurar listeners de recuperação
  setupRecoveryListeners();
  
  // Inicializar aplicação
  initializeApp();

} catch (criticalError) {
  // Erro crítico que impede a inicialização
  console.error('🚨 ERRO CRÍTICO NA INICIALIZAÇÃO:', criticalError);
  
  // Tentar mostrar erro de inicialização
  if (criticalError instanceof Error) {
    showInitializationError(criticalError);
  } else {
    showInitializationError(new Error('Erro crítico desconhecido'));
  }
}
