import { z } from "zod";
import crypto from 'crypto';
import { randomUUID } from 'crypto';

// Webhook notification interface from Cielo
export interface CieloWebhookNotification {
  PaymentId: string;
  ChangeType: number; // 1 = Payment status change, 2 = Recurrency, 3 = Chargeback
  ClientOrderId?: string;
  RequestId?: string;
}

// Webhook validation and processing service
export class CieloWebhookService {
  private webhookSecret: string;
  
  constructor() {
    this.webhookSecret = process.env.CIELO_WEBHOOK_SECRET || '';
    
    // ✅ SECURITY: Enforce webhook secret in production environments
    const isProduction = process.env.NODE_ENV === 'production';
    const isStaging = process.env.NODE_ENV === 'staging';
    
    if (!this.webhookSecret) {
      if (isProduction || isStaging) {
        // 🚨 CRITICAL: Never allow webhook processing without secret in production
        throw new Error('SECURITY ERROR: CIELO_WEBHOOK_SECRET is mandatory in production/staging environments');
      } else {
        console.warn('⚠️ [CIELO-WEBHOOK] CIELO_WEBHOOK_SECRET não configurado - validação de assinatura desabilitada (apenas development)');
      }
    }
  }

  /**
   * Validate webhook signature to ensure it comes from Cielo
   */
  validateWebhookSignature(
    payload: string,
    signature: string,
    correlationId: string
  ): boolean {
    // ✅ SECURITY: Check environment and enforce strict validation
    const isProduction = process.env.NODE_ENV === 'production';
    const isStaging = process.env.NODE_ENV === 'staging';
    
    if (!this.webhookSecret) {
      if (isProduction || isStaging) {
        // 🚨 CRITICAL: Never allow webhook validation to pass in production without secret
        console.error('🚨 [CIELO-WEBHOOK] SECURITY BREACH ATTEMPT: Webhook received without configured secret in production', { 
          correlationId,
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        });
        return false; // Always fail in production
      } else {
        // Only warn and allow in development
        console.warn('⚠️ [CIELO-WEBHOOK] Webhook secret não configurado, pulando validação (development only)', { correlationId });
        return true;
      }
    }
    
    // Validate signature is provided
    if (!signature || signature.trim() === '') {
      console.error('🚨 [CIELO-WEBHOOK] Assinatura ausente na requisição', { 
        correlationId,
        environment: process.env.NODE_ENV
      });
      return false;
    }

    try {
      // Cielo uses HMAC-SHA256 for webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload, 'utf8')
        .digest('hex');

      const providedSignature = signature.replace('sha256=', '');
      
      // Use constant-time comparison to prevent timing attacks
      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      );

      if (!isValid) {
        console.error('🚨 [CIELO-WEBHOOK] Assinatura inválida detectada', {
          correlationId,
          expectedLength: expectedSignature.length,
          providedLength: providedSignature.length
        });
      }

      return isValid;
    } catch (error) {
      console.error('🚨 [CIELO-WEBHOOK] Erro na validação de assinatura', {
        correlationId,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return false;
    }
  }

  /**
   * Process webhook notification from Cielo
   */
  async processWebhookNotification(
    notification: CieloWebhookNotification,
    correlationId: string
  ): Promise<void> {
    try {
      console.log('📥 [CIELO-WEBHOOK] Processando notificação', {
        correlationId,
        paymentId: notification.PaymentId,
        changeType: notification.ChangeType,
        clientOrderId: notification.ClientOrderId
      });

      // Log security audit event
      this.logSecurityAuditEvent('webhook_received', {
        paymentId: notification.PaymentId,
        changeType: notification.ChangeType,
        clientOrderId: notification.ClientOrderId
      }, correlationId);

      switch (notification.ChangeType) {
        case 1: // Payment status change
          await this.handlePaymentStatusChange(notification, correlationId);
          break;
        case 2: // Recurrency 
          await this.handleRecurrencyNotification(notification, correlationId);
          break;
        case 3: // Chargeback
          await this.handleChargebackNotification(notification, correlationId);
          break;
        default:
          console.warn('⚠️ [CIELO-WEBHOOK] Tipo de mudança desconhecido', {
            correlationId,
            changeType: notification.ChangeType
          });
      }

      console.log('✅ [CIELO-WEBHOOK] Notificação processada com sucesso', {
        correlationId,
        paymentId: notification.PaymentId
      });

    } catch (error) {
      console.error('❌ [CIELO-WEBHOOK] Erro ao processar notificação', {
        correlationId,
        paymentId: notification.PaymentId,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      // Log security audit event for failed processing
      this.logSecurityAuditEvent('webhook_processing_failed', {
        paymentId: notification.PaymentId,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }, correlationId);
      
      throw error;
    }
  }

  /**
   * Handle payment status change notifications
   */
  private async handlePaymentStatusChange(
    notification: CieloWebhookNotification,
    correlationId: string
  ): Promise<void> {
    try {
      // Import CieloService dynamically to avoid circular dependencies
      const { CieloService } = await import('./cielo-service.js');
      const cieloService = new CieloService();

      // Query the current payment status from Cielo
      const paymentDetails = await cieloService.queryPayment(notification.PaymentId);
      
      console.log('💳 [CIELO-WEBHOOK] Status de pagamento atualizado', {
        correlationId,
        paymentId: notification.PaymentId,
        status: paymentDetails.payment?.status,
        returnCode: paymentDetails.payment?.returnCode,
        returnMessage: paymentDetails.payment?.returnMessage
      });

      // Update payment status in database
      await this.updatePaymentStatusInDatabase(
        notification.PaymentId,
        notification.ClientOrderId || '',
        paymentDetails.payment?.status || 0,
        paymentDetails.payment?.returnCode || '',
        paymentDetails.payment?.returnMessage || '',
        correlationId
      );

      // Handle specific status changes
      const status = paymentDetails.payment?.status;
      if (status === 2) { // Payment approved
        await this.handlePaymentApproved(notification, paymentDetails, correlationId);
      } else if (status === 3) { // Payment declined
        await this.handlePaymentDeclined(notification, paymentDetails, correlationId);
      } else if (status === 10) { // Payment cancelled
        await this.handlePaymentCancelled(notification, paymentDetails, correlationId);
      }

    } catch (error) {
      console.error('❌ [CIELO-WEBHOOK] Erro ao processar mudança de status de pagamento', {
        correlationId,
        paymentId: notification.PaymentId,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  }

  /**
   * Handle recurrency notifications
   */
  private async handleRecurrencyNotification(
    notification: CieloWebhookNotification,
    correlationId: string
  ): Promise<void> {
    console.log('🔄 [CIELO-WEBHOOK] Notificação de recorrência recebida', {
      correlationId,
      paymentId: notification.PaymentId
    });

    // This would typically involve:
    // 1. Updating subscription status
    // 2. Generating next billing cycle
    // 3. Notifying customer
  }

  /**
   * Handle chargeback notifications
   */
  private async handleChargebackNotification(
    notification: CieloWebhookNotification,
    correlationId: string
  ): Promise<void> {
    console.log('⚠️ [CIELO-WEBHOOK] Notificação de chargeback recebida', {
      correlationId,
      paymentId: notification.PaymentId
    });

    // Log critical security event
    this.logSecurityAuditEvent('chargeback_received', {
      paymentId: notification.PaymentId,
      clientOrderId: notification.ClientOrderId
    }, correlationId);

    // This would typically involve:
    // 1. Flagging the transaction
    // 2. Notifying finance team
    // 3. Updating customer account status
    // 4. Initiating dispute process if necessary
  }

  /**
   * Handle approved payment
   */
  private async handlePaymentApproved(
    notification: CieloWebhookNotification,
    paymentDetails: any,
    correlationId: string
  ): Promise<void> {
    console.log('✅ [CIELO-WEBHOOK] Pagamento aprovado', {
      correlationId,
      paymentId: notification.PaymentId,
      amount: paymentDetails.payment?.amount
    });

    try {
      // Import storage and bcrypt dynamically to avoid circular dependencies
      const { storage } = await import('../storage.js');
      const bcrypt = await import('bcryptjs');

      // Try to retrieve client data from ClientOrderId (should contain client info)
      // For now, we'll focus on logging the approval - client creation logic 
      // is already implemented in the checkout process
      
      console.log('🔄 [CIELO-WEBHOOK] Processando aprovação de pagamento', {
        correlationId,
        paymentId: notification.PaymentId,
        clientOrderId: notification.ClientOrderId
      });

      // Log successful payment approval for audit
      this.logSecurityAuditEvent('payment_approved', {
        paymentId: notification.PaymentId,
        clientOrderId: notification.ClientOrderId,
        amount: paymentDetails.payment?.amount
      }, correlationId);

      // Generate official payment receipt automatically
      await this.generatePaymentReceipt(notification, paymentDetails, correlationId);

      // This would typically involve:
      // 1. Activating customer plan ✓ (to be implemented)
      // 2. Sending confirmation email ✓ (to be implemented)  
      // 3. Updating customer status ✓ (to be implemented)
      // 4. Triggering post-payment workflows ✓ (to be implemented)
      
      console.log('✅ [CIELO-WEBHOOK] Pagamento aprovado processado com sucesso', {
        correlationId,
        paymentId: notification.PaymentId
      });

    } catch (error) {
      console.error('❌ [CIELO-WEBHOOK] Erro ao processar pagamento aprovado', {
        correlationId,
        paymentId: notification.PaymentId,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      // Log error but don't throw - we don't want to break the webhook processing
      this.logSecurityAuditEvent('payment_approved_processing_failed', {
        paymentId: notification.PaymentId,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }, correlationId);
    }
  }

  /**
   * Handle declined payment
   */
  private async handlePaymentDeclined(
    notification: CieloWebhookNotification,
    paymentDetails: any,
    correlationId: string
  ): Promise<void> {
    console.log('❌ [CIELO-WEBHOOK] Pagamento recusado', {
      correlationId,
      paymentId: notification.PaymentId,
      returnCode: paymentDetails.payment?.returnCode,
      returnMessage: paymentDetails.payment?.returnMessage
    });

    // This would typically involve:
    // 1. Notifying customer of failed payment
    // 2. Offering alternative payment methods
    // 3. Setting retry schedule for subscription payments
  }

  /**
   * Handle cancelled payment
   */
  private async handlePaymentCancelled(
    notification: CieloWebhookNotification,
    paymentDetails: any,
    correlationId: string
  ): Promise<void> {
    console.log('🚫 [CIELO-WEBHOOK] Pagamento cancelado', {
      correlationId,
      paymentId: notification.PaymentId
    });

  }

  /**
   * Update payment status in database
   */
  private async updatePaymentStatusInDatabase(
    paymentId: string,
    clientOrderId: string,
    status: number,
    returnCode: string,
    returnMessage: string,
    correlationId: string
  ): Promise<void> {
    try {
      // Import storage dynamically to avoid circular dependencies
      const { storage } = await import('../storage.js');
      
      // Find contract by Cielo payment ID
      const contract = await storage.getContractByCieloPaymentId(paymentId);
      
      if (!contract) {
        console.warn('⚠️ [CIELO-WEBHOOK] Contrato não encontrado para paymentId', {
          correlationId,
          paymentId,
          clientOrderId
        });
        return;
      }

      // Map Cielo status to contract status
      let contractStatus: 'active' | 'inactive' | 'suspended' | 'cancelled' = 'inactive';
      let updatedAt = new Date();
      let receivedDate: Date | null = null;

      switch (status) {
        case 1: // Authorized
          contractStatus = 'inactive'; // Authorized but not captured yet
          break;
        case 2: // Paid/Captured
          contractStatus = 'active'; // Successfully paid and captured
          receivedDate = updatedAt;
          break;
        case 3: // Denied
          contractStatus = 'inactive'; // Payment denied
          break;
        case 10: // Voided/Cancelled
          contractStatus = 'cancelled'; // Payment cancelled
          break;
        case 11: // Refunded
          contractStatus = 'inactive'; // Refunded, may need manual review
          break;
        case 12: // Pending
          contractStatus = 'inactive'; // Still pending
          break;
        default:
          contractStatus = 'inactive'; // Unknown status, default to inactive
      }

      // Prepare update data
      const updateData: any = {
        status: contractStatus,
        returnCode: returnCode || '',
        returnMessage: returnMessage || '',
        updatedAt
      };

      // Add received date if payment is successful
      if (receivedDate) {
        updateData.receivedDate = receivedDate;
      }

      // Update the contract
      const updatedContract = await storage.updateContract(contract.id, updateData);
      
      console.log('✅ [CIELO-WEBHOOK] Contrato atualizado no banco de dados', {
        correlationId,
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        paymentId,
        oldStatus: contract.status,
        newStatus: contractStatus,
        cieloStatus: status,
        returnCode,
        returnMessage
      });

      // Log security audit event for successful database update
      this.logSecurityAuditEvent('contract_status_updated', {
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        paymentId,
        oldStatus: contract.status,
        newStatus: contractStatus,
        cieloStatus: status
      }, correlationId);
      
    } catch (error) {
      console.error('❌ [CIELO-WEBHOOK] Erro ao atualizar status no banco de dados', {
        correlationId,
        paymentId,
        clientOrderId,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Log security audit event for failed database update
      this.logSecurityAuditEvent('contract_update_failed', {
        paymentId,
        clientOrderId,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }, correlationId);
      
      throw error;
    }
  }

  /**
   * Generate official payment receipt automatically
   */
  private async generatePaymentReceipt(
    notification: CieloWebhookNotification,
    paymentDetails: any,
    correlationId: string
  ): Promise<void> {
    try {
      console.log('📄 [CIELO-WEBHOOK] Iniciando geração automática de comprovante', {
        correlationId,
        paymentId: notification.PaymentId
      });

      // Import necessary services
      const { storage } = await import('../storage.js');
      const { PaymentReceiptService } = await import('./payment-receipt-service.js');

      // Try to find contract/client data from payment or order
      let contractData = null;
      let clientData = null;

      // First, try to find contract by Cielo payment ID
      try {
        const contracts = await storage.getAllContracts();
        contractData = contracts.find(c => c.cieloPaymentId === notification.PaymentId);
        
        if (contractData) {
          // Get client data from contract
          clientData = await storage.getClientById(contractData.clientId);
          console.log('✅ [CIELO-WEBHOOK] Dados do contrato encontrados', {
            correlationId,
            contractId: contractData.id,
            clientName: clientData?.full_name
          });
        } else {
          console.warn('⚠️ [CIELO-WEBHOOK] Contrato não encontrado pelo PaymentId', {
            correlationId,
            paymentId: notification.PaymentId
          });
        }
      } catch (error) {
        console.error('❌ [CIELO-WEBHOOK] Erro ao buscar contrato', {
          correlationId,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }

      // If we still don't have client data, try to find by ClientOrderId
      if (!clientData && notification.ClientOrderId) {
        try {
          const clients = await storage.getAllClients();
          // ClientOrderId might contain email or client ID
          clientData = clients.find(c => 
            notification.ClientOrderId?.includes(c.email) ||
            notification.ClientOrderId?.includes(c.id)
          );

          if (clientData) {
            console.log('✅ [CIELO-WEBHOOK] Cliente encontrado pelo ClientOrderId', {
              correlationId,
              clientName: clientData.full_name
            });
          }
        } catch (error) {
          console.error('❌ [CIELO-WEBHOOK] Erro ao buscar cliente', {
            correlationId,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }

      // If we still don't have client data, we can't generate receipt
      if (!clientData) {
        console.warn('⚠️ [CIELO-WEBHOOK] Não foi possível encontrar dados do cliente para gerar comprovante', {
          correlationId,
          paymentId: notification.PaymentId,
          clientOrderId: notification.ClientOrderId
        });
        return;
      }

      // Get plan and pet data if available
      let planName = null;
      let petName = null;
      
      if (contractData) {
        try {
          const plan = await storage.getPlan(contractData.planId);
          const pet = await storage.getPet(contractData.petId);
          planName = plan?.name;
          petName = pet?.name;
        } catch (error) {
          console.error('❌ [CIELO-WEBHOOK] Erro ao buscar dados do plano/pet', {
            correlationId,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }

      // Generate receipt using PaymentReceiptService
      const receiptService = new PaymentReceiptService();
      const receiptData = {
        contractId: contractData?.id,
        cieloPaymentId: notification.PaymentId,
        clientName: clientData.full_name,
        clientEmail: clientData.email,
        petName: petName || undefined,
        planName: planName || undefined
      };

      console.log('📄 [CIELO-WEBHOOK] Gerando comprovante oficial com dados:', {
        correlationId,
        clientName: receiptData.clientName,
        petName: receiptData.petName,
        planName: receiptData.planName
      });

      const result = await receiptService.generatePaymentReceipt(receiptData, correlationId);

      if (result.success) {
        console.log('✅ [CIELO-WEBHOOK] Comprovante oficial gerado automaticamente', {
          correlationId,
          receiptId: result.receiptId,
          pdfUrl: result.pdfUrl
        });

        // Log success audit event
        this.logSecurityAuditEvent('payment_receipt_generated', {
          paymentId: notification.PaymentId,
          receiptId: result.receiptId,
          clientEmail: clientData.email
        }, correlationId);

      } else {
        console.error('❌ [CIELO-WEBHOOK] Erro na geração do comprovante', {
          correlationId,
          error: result.error
        });

        // Log failure audit event
        this.logSecurityAuditEvent('payment_receipt_generation_failed', {
          paymentId: notification.PaymentId,
          error: result.error,
          clientEmail: clientData.email
        }, correlationId);
      }

    } catch (error) {
      console.error('❌ [CIELO-WEBHOOK] Erro crítico na geração automática de comprovante', {
        correlationId,
        paymentId: notification.PaymentId,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });

      // Log critical failure
      this.logSecurityAuditEvent('payment_receipt_generation_critical_error', {
        paymentId: notification.PaymentId,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }, correlationId);
    }
  }

  /**
   * Log security audit events
   */
  private logSecurityAuditEvent(event: string, details: any, correlationId: string): void {
    const auditLog = {
      timestamp: new Date().toISOString(),
      event,
      service: 'CieloWebhookService',
      correlationId,
      details: {
        ...details,
        ipAddress: 'webhook', // Will be populated by the route handler
        userAgent: 'Cielo-Webhook'
      }
    };

    console.log('🔒 [SECURITY-AUDIT] Cielo Webhook Security Event', auditLog);
  }

  /**
   * Get webhook configuration for Cielo dashboard
   */
  getWebhookConfiguration(): {
    url: string;
    events: string[];
    format: string;
  } {
    const baseUrl = process.env.WEBHOOK_BASE_URL || 'https://localhost:3000';

    return {
      url: `${baseUrl}/api/webhooks/cielo`,
      events: [
        'payment.status.changed',
        'recurrency.created',
        'chargeback.received'
      ],
      format: 'JSON'
    };
  }
}

export default CieloWebhookService;