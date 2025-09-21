import express from 'express';
import rateLimit from 'express-rate-limit';
import { storage } from '../storage.js';
import { autoConfig } from '../config.js';
// Image processing removed - now using direct Supabase Storage

const router = express.Router();

// Rate limiting middleware for chat
const chatRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute per IP
  message: {
    error: 'Muitas mensagens enviadas. Tente novamente em um minuto.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware for input sanitization
const sanitizeInput = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.body.message) {
    req.body.message = req.body.message.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    req.body.message = req.body.message.substring(0, 2000); // Limit message length
  }
  next();
};

// Get chat settings - Convert bytea to base64 for frontend compatibility
router.get('/settings', async (req, res) => {
  try {
    let settings = await storage.getChatSettings();
    
    if (!settings) {
      console.log('📋 [CHAT-BYTEA] No chat settings found, creating default settings...');
      settings = await storage.createDefaultChatSettings();
    }
    
    // Chat icons from Supabase Storage URLs
    const responseSettings = { ...settings };
    
    // Chat icons served directly from Supabase Storage URLs only
    if (settings.botIconUrl) {
      responseSettings.botIcon = settings.botIconUrl as any;
    }
    
    if (settings.userIconUrl) {
      responseSettings.userIcon = settings.userIconUrl as any;
    }
    
    console.log('✅ [CHAT] Chat settings retrieved:', {
      hasBotIcon: !!responseSettings.botIcon,
      hasUserIcon: !!responseSettings.userIcon,
      botIconUrl: responseSettings.botIcon,
      userIconUrl: responseSettings.userIcon
    });
    
    res.json(responseSettings);
  } catch (error) {
    console.error('❌ [CHAT] Error fetching chat settings:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'SETTINGS_FETCH_ERROR'
    });
  }
});


// Send message to AI webhook
router.post('/send', chatRateLimit, sanitizeInput, async (req, res) => {
  try {
    const { message, sessionId, timestamp } = req.body;
    const startTime = Date.now();

    if (!message || !sessionId) {
      return res.status(400).json({
        error: 'Mensagem e ID da sessão são obrigatórios',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Check if chat is enabled
    const settings = await storage.getChatSettings();
    if (!settings?.isEnabled) {
      return res.status(503).json({
        error: 'Chat temporariamente indisponível',
        code: 'CHAT_DISABLED'
      });
    }


    const webhookUrl = autoConfig.get('WEBHOOK');
    if (!webhookUrl) {
      console.error('❌ WEBHOOK environment variable not configured');
      return res.status(500).json({
        error: 'Serviço temporariamente indisponível',
        code: 'WEBHOOK_NOT_CONFIGURED'
      });
    }

    // Get client info for logging
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    let botResponse = '';
    let status = 'completed';
    let errorMessage = '';

    try {
      // Send to webhook
      console.log('🤖 Sending message to AI webhook:', {
        sessionId,
        messageLength: message.length,
        webhook: webhookUrl.substring(0, 50) + '...'
      });

      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'UnipetPlan-ChatBot/1.0'
        },
        body: JSON.stringify({
          message,
          sessionId,
          timestamp,
          source: 'unipet-chat'
        }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      console.log('🔍 [WEBHOOK] Response status:', webhookResponse.status);
      console.log('🔍 [WEBHOOK] Response headers:', Object.fromEntries(webhookResponse.headers.entries()));

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.log('❌ [WEBHOOK] Error response:', errorText);
        throw new Error(`Webhook responded with status: ${webhookResponse.status} - ${errorText}`);
      }

      const responseText = await webhookResponse.text();
      console.log('✅ [WEBHOOK] Response text:', responseText);
      
      let webhookData;
      try {
        webhookData = JSON.parse(responseText);
        console.log('✅ [WEBHOOK] Parsed response:', webhookData);
      } catch (parseError) {
        console.log('❌ [WEBHOOK] JSON parse error:', parseError);
        console.log('❌ [WEBHOOK] Raw response was:', responseText);
        throw new Error('Invalid JSON response from webhook');
      }

      // Handle different response formats from webhook
      if (Array.isArray(webhookData) && webhookData.length > 0) {
        // n8n format: [{"output": "message"}]
        botResponse = webhookData[0].output || webhookData[0].response || webhookData[0].message;
      } else if (webhookData.output) {
        // Direct n8n format: {"output": "message"}
        botResponse = webhookData.output;
      } else if (webhookData.response) {
        // Standard format: {"response": "message"}
        botResponse = webhookData.response;
      } else if (webhookData.message) {
        // Alternative format: {"message": "message"}
        botResponse = webhookData.message;
      } else {
        botResponse = 'Desculpe, não consegui processar sua mensagem.';
      }
      
      console.log('✅ [WEBHOOK] Extracted response:', botResponse);

      // Validate response format
      if (typeof botResponse !== 'string') {
        botResponse = 'Desculpe, recebi uma resposta inválida do servidor.';
      }

      botResponse = botResponse.substring(0, 4000); // Limit response length

    } catch (webhookError) {
      console.error('❌ Webhook error:', webhookError);
      status = 'error';
      errorMessage = webhookError instanceof Error ? webhookError.message : 'Unknown webhook error';
      botResponse = 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.';
    }

    const responseTime = Date.now() - startTime;

    // Note: Chat conversations are no longer persisted to database

    res.json({
      response: botResponse,
      sessionId,
      timestamp: new Date().toISOString(),
      responseTime
    });

  } catch (error) {
    console.error('❌ Error in chat send endpoint:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// Note: Conversation history and analytics routes removed 
// as chat conversations are no longer persisted to database

export default router;