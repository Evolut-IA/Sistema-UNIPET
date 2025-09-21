import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { spawn } from "child_process";
import { createProxyMiddleware } from 'http-proxy-middleware';
// Import UNIPET modules
import { registerRoutes as registerUnipetRoutes } from "./server/routes.js";
import { initializeDatabase, closeDatabase } from "./server/db.js";
// Import ADMIN modules - using existing server routes with admin prefix
// Note: Admin now integrated into main client app, APIs mounted at /admin/api/*
const app = express();
// Trust proxy para produção
app.set("trust proxy", 1);
// Configure JSON parsing to preserve line breaks and special characters
app.use(express.json({
    limit: '50mb', // Increased for admin system that handles images
    verify: (req, res, buf) => {
        // Store raw buffer for potential custom parsing
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({
    extended: false,
    limit: '50mb'
}));
// Cookie parser for admin system
app.use(cookieParser());
// Logging middleware otimizado
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api") || path.startsWith("/admin/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            // Only log response bodies in development
            if (process.env.NODE_ENV !== 'production' && capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }
            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }
            console.log(logLine);
        }
    });
    next();
});
// Health check route
app.get("/api/health", (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        services: {
            unipet: 'active',
            admin: 'active'
        }
    });
});
// Admin health check
app.get("/admin/health", (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'admin'
    });
});
/**
 * Função principal de inicialização do servidor unificado
 */
async function initializeUnifiedServer() {
    try {
        console.log('🚀 Inicializando servidor unificado UNIPET + Admin...');
        // 1. Inicializar banco de dados (compartilhado)
        console.log('🔌 Inicializando banco de dados...');
        await initializeDatabase();
        console.log('✅ Banco de dados inicializado com sucesso');
        // 2. Registrar rotas do UNIPET em /api/*
        console.log('🛣️ Registrando rotas do UNIPET (/api/*)...');
        const unipetServer = await registerUnipetRoutes(app);
        console.log('✅ Rotas do UNIPET registradas');
        // 3. Registrar rotas do ADMIN em /admin/api/* (agora integrado)
        console.log('🔧 Registrando rotas do ADMIN (/admin/api/*)...');
        console.log('📝 Admin agora integrado no projeto principal - usando server/routes.js existente');
        // Create admin sub-app and mount existing routes at /admin/api/*
        const adminApp = express();
        // Configure admin-specific middleware
        adminApp.use(express.json({ limit: '50mb' }));
        adminApp.use(express.urlencoded({ extended: false, limit: '50mb' }));
        adminApp.use(cookieParser());
        // Re-use the existing UNIPET routes but mount them under /admin/api
        await registerUnipetRoutes(adminApp);
        // Mount admin sub-app under /admin path (so /admin/api/* routes are accessible)
        app.use('/admin', adminApp);
        console.log('✅ Admin APIs montadas usando rotas existentes em /admin/api/*');
        // 4. Admin agora integrado no frontend principal - não precisa de arquivos separados
        console.log('📁 Admin integrado no cliente principal - usando dist/client para todas as rotas');
        // 4. Configurar serving de arquivos estáticos
        console.log('📁 Configurando arquivos estáticos...');
        // Serve UNIPET frontend (always serve static files if they exist)
        const unipetBuildPath = path.join(process.cwd(), 'dist', 'client');
        const cacheMaxAge = process.env.NODE_ENV === 'production' ? '1y' : '0';
        app.use(express.static(unipetBuildPath, {
            maxAge: cacheMaxAge,
            etag: true,
            lastModified: true,
            setHeaders: (res, filePath) => {
                if (filePath.endsWith('.svg')) {
                    res.setHeader('Content-Type', 'image/svg+xml');
                }
                // Disable cache in development for easier debugging
                if (process.env.NODE_ENV !== 'production') {
                    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                    res.setHeader('Pragma', 'no-cache');
                    res.setHeader('Expires', '0');
                }
            }
        }));
        // Admin now integrated into main client - no separate static files needed
        // SPA routing (catch-all for non-API routes, including /admin/*)
        app.get('*', (req, res) => {
            if (!req.path.startsWith('/api') && !req.path.startsWith('/admin/api')) {
                res.sendFile(path.join(unipetBuildPath, 'index.html'));
            }
        });
        console.log('✅ Arquivos estáticos configurados (UNIPET sempre servido)');
        // 5. Configurar tratamento de erros
        console.log('🛡️ Configurando tratamento de erros...');
        app.use((err, _req, res, _next) => {
            console.error('Erro no servidor:', err);
            res.status(500).json({ error: 'Erro interno do servidor' });
        });
        // 6. Iniciar servidor
        const port = 5000; // Fixed port for unified server
        const host = '0.0.0.0';
        unipetServer.listen(port, host, () => {
            console.log('\n🎉 SERVIDOR UNIFICADO INICIADO COM SUCESSO!');
            console.log('==========================================');
            console.log(`🌐 URL: http://${host}:${port}`);
            console.log(`🏠 Host: ${host} (Aceita conexões externas)`);
            console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📁 Diretório: ${process.cwd()}`);
            console.log(`🔌 Banco: Conectado e saudável`);
            console.log('\n📋 SERVIÇOS DISPONÍVEIS:');
            console.log('  🦄 UNIPET:');
            console.log('    • Frontend: / (raiz)');
            console.log('    • APIs: /api/*');
            console.log('    • Health: /api/health');
            console.log('  🔧 ADMIN:');
            console.log('    • Frontend: /admin');
            console.log('    • APIs: /admin/api/*');
            console.log('    • Health: /admin/health');
            console.log('\n🔒 FUNCIONALIDADES:');
            console.log('  • Roteamento unificado');
            console.log('  • Banco de dados compartilhado');
            console.log('  • Sessions e cookies configurados');
            console.log('  • Tratamento de erros global');
            if (process.env.NODE_ENV === 'production') {
                console.log('  • Arquivos estáticos servidos');
                console.log('  • Cache otimizado');
            }
            else {
                console.log('  • Admin com Hot Reload (Vite)');
                console.log('  • UNIPET frontend externo (recomendado)');
            }
            console.log('==========================================\n');
        });
        // 7. Configurar graceful shutdown
        let isShuttingDown = false;
        const gracefulShutdown = async (signal) => {
            if (isShuttingDown) {
                console.log(`🛑 Encerramento já em andamento, ignorando ${signal}`);
                return;
            }
            isShuttingDown = true;
            console.log(`\n🛑 Recebido ${signal}, encerrando graciosamente...`);
            try {
                // Fechar servidor HTTP
                unipetServer.close(() => {
                    console.log('✅ Servidor HTTP fechado');
                });
                // Fechar conexões do banco
                await closeDatabase();
                console.log('✅ Encerramento gracioso concluído');
                process.exit(0);
            }
            catch (error) {
                console.error('❌ Erro durante encerramento:', error);
                process.exit(1);
            }
        };
        // Capturar sinais de encerramento
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));
        // Capturar erros não tratados - APENAS LOGAR, NÃO ENCERRAR
        process.on('uncaughtException', (error) => {
            console.error('🚨 EXCEÇÃO NÃO CAPTURADA:', error);
            console.error('⚠️ Erro capturado, mas servidor continuará rodando');
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('🚨 PROMISE REJECTION NÃO TRATADA:', reason);
            console.error('Promise:', promise);
            console.error('⚠️ Promise rejection capturada, mas servidor continuará rodando');
        });
    }
    catch (error) {
        console.error('❌ FALHA NA INICIALIZAÇÃO DO SERVIDOR:', error);
        console.error('⚠️ Erro na inicialização, mas tentando continuar...');
    }
}
/**
 * Configura proxy para o sistema admin rodando em processo separado
 */
function setupAdminProxy() {
    // Start admin server as separate process
    const adminPort = 3002;
    // Spawn admin server
    const adminProcess = spawn('npm', ['run', 'dev'], {
        cwd: path.join(process.cwd(), 'admin'),
        env: { ...process.env, PORT: adminPort.toString() },
        stdio: 'inherit'
    });
    adminProcess.on('error', (error) => {
        console.error('❌ Erro ao iniciar processo admin:', error);
    });
    adminProcess.on('exit', (code, signal) => {
        console.log(`📦 Processo admin encerrado com código ${code} e sinal ${signal}`);
    });
    // Configure professional proxy middleware with full WebSocket and streaming support
    const adminProxy = createProxyMiddleware({
        target: `http://localhost:${adminPort}`,
        changeOrigin: true,
        ws: true, // Enable WebSocket proxying for HMR
        pathRewrite: {
            '^/admin/api': '/api', // Rewrite /admin/api/* to /api/*
        },
        // Enhanced logging for debugging
        // Advanced proxy options
        secure: false,
        xfwd: true,
        // Timeout configurations
        timeout: 30000,
        proxyTimeout: 30000,
        // Handle streaming and multipart data properly
        // Custom error handling
        onError: (err, req, res) => {
            console.error('❌ Erro detalhado no proxy admin:', {
                error: err.message,
                url: req.url,
                method: req.method,
                headers: req.headers
            });
            if (res && typeof res.status === 'function' && !res.headersSent) {
                res.status(503).json({
                    error: 'Admin service unavailable',
                    message: 'Please ensure admin server is running on port ' + adminPort,
                    details: process.env.NODE_ENV !== 'production' ? err.message : undefined
                });
            }
        },
        // Custom request interceptor for debugging
        onProxyReq: (proxyReq, req, res) => {
            // Log API requests
            if (req.url?.startsWith('/admin/api')) {
                console.log(`🔄 Proxy Admin API: ${req.method} ${req.url} → http://localhost:${adminPort}${req.url.replace('/admin', '')}`);
            }
            // Ensure proper headers for streaming and multipart
            if (req.headers['content-type']?.includes('multipart/form-data')) {
                // Don't modify content-type for multipart uploads
                proxyReq.setHeader('content-type', req.headers['content-type']);
            }
        },
        // Custom response interceptor
        onProxyRes: (proxyRes, req, res) => {
            // Add custom headers for debugging
            if (process.env.NODE_ENV !== 'production') {
                res.setHeader('X-Proxy-Source', 'unified-admin-proxy');
                res.setHeader('X-Admin-Port', adminPort.toString());
            }
            // Log successful API responses
            if (req.url?.startsWith('/admin/api') && proxyRes.statusCode && proxyRes.statusCode < 400) {
                console.log(`✅ Admin API Success: ${req.method} ${req.url} → ${proxyRes.statusCode}`);
            }
            else if (req.url?.startsWith('/admin/api') && proxyRes.statusCode && proxyRes.statusCode >= 400) {
                console.log(`❌ Admin API Error: ${req.method} ${req.url} → ${proxyRes.statusCode}`);
            }
        }
    });
    // Apply proxy middleware only to /admin/api/* routes
    app.use('/admin/api', adminProxy);
}
// Inicializar servidor unificado
initializeUnifiedServer().catch((error) => {
    console.error('❌ ERRO CRÍTICO NA INICIALIZAÇÃO:', error);
    console.error('⚠️ Erro crítico, mas tentando continuar...');
});
