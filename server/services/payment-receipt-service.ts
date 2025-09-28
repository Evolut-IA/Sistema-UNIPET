// Import pdfmake properly for ES modules
import pdfMake from 'pdfmake/build/pdfmake.js';
import * as vfsFonts from 'pdfmake/build/vfs_fonts.js';
import { CieloService, type CieloPaymentResponse } from './cielo-service.js';
import { supabaseStorage } from '../supabase-storage.js';
import { storage } from '../storage.js';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

// Configure pdfMake with fonts (ES module compatible)
pdfMake.vfs = (vfsFonts as any).vfs;

interface PaymentReceiptData {
  contractId?: string;
  cieloPaymentId: string;
  
  // Dados do cliente expandidos
  clientName: string;
  clientEmail: string;
  clientCPF?: string;
  clientPhone?: string;
  clientAddress?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Dados dos pets (array completo)
  pets?: Array<{
    name: string;
    species: string; // 'Cão' ou 'Gato'
    breed?: string;
    age?: number;
    weight?: number;
    sex?: string; // 'M' ou 'F'
    planName: string;
    planType: string; // 'BASIC', 'INFINITY', 'COMFORT', 'PLATINUM'
    value: number; // em centavos
    discount?: number; // percentual (5, 10, 15)
    discountedValue?: number; // valor com desconto em centavos
  }>;
  
  // Dados do pagamento
  paymentMethod?: string; // 'credit_card' ou 'pix'
  installments?: number;
  installmentValue?: number; // valor da parcela em centavos
  totalDiscount?: number; // desconto total em centavos
  finalAmount?: number; // valor final em centavos
  
  // Dados do plano geral
  planFeatures?: {
    hasCoparticipation: boolean;
    hasWaitingPeriod: boolean;
    billingType: 'monthly' | 'annual';
  };
  
  // Compatibilidade com versão anterior
  petName?: string;
  planName?: string;
}

export interface GenerateReceiptResult {
  success: boolean;
  receiptId?: string;
  receiptNumber?: string; // ✅ Retornar receiptNumber para referência
  pdfUrl?: string; // ✅ Added missing pdfUrl property
  error?: string;
}

export class PaymentReceiptService {
  private cieloService: CieloService;
  private unipetLogoBase64: string | null = null;

  constructor() {
    this.cieloService = new CieloService();
    this.loadUnipetLogo();
  }

  /**
   * Load UNIPET logo as base64 for PDF inclusion
   */
  private loadUnipetLogo(): void {
    try {
      const logoPath = path.resolve('./client/public/unipet-logo.png');
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        this.unipetLogoBase64 = logoBuffer.toString('base64');
        console.log('✅ [RECEIPT-SERVICE] Logo UNIPET carregado com sucesso');
      } else {
        console.warn('⚠️ [RECEIPT-SERVICE] Logo UNIPET não encontrado em:', logoPath);
      }
    } catch (error) {
      console.error('❌ [RECEIPT-SERVICE] Erro ao carregar logo UNIPET:', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }

  /**
   * Generate official payment receipt using real Cielo transaction data
   */
  async generatePaymentReceipt(
    receiptData: PaymentReceiptData,
    correlationId?: string
  ): Promise<GenerateReceiptResult> {
    const logId = correlationId || randomUUID();
    
    try {
      console.log('📄 [RECEIPT-SERVICE] Iniciando geração de comprovante oficial', {
        correlationId: logId,
        cieloPaymentId: receiptData.cieloPaymentId,
        clientEmail: receiptData.clientEmail
      });

      // ✅ IDEMPOTÊNCIA: Verificar se já existe recibo para este cieloPaymentId
      console.log('🔍 [RECEIPT-SERVICE] Verificando se recibo já existe...');
      const existingReceipt = await storage.getPaymentReceiptByCieloPaymentId(receiptData.cieloPaymentId);
      if (existingReceipt) {
        console.log('✅ [RECEIPT-SERVICE] Recibo já existe, retornando existente', {
          correlationId: logId,
          existingReceiptId: existingReceipt.id,
          receiptNumber: existingReceipt.receiptNumber
        });
        return {
          success: true,
          receiptId: existingReceipt.id,
          receiptNumber: existingReceipt.receiptNumber,
          pdfUrl: existingReceipt.pdfUrl
        };
      }

      // Step 1: Query official payment data from Cielo API
      console.log('🔍 [RECEIPT-SERVICE] Consultando dados oficiais na Cielo API...');
      const cieloPaymentDetails = await this.cieloService.queryPayment(receiptData.cieloPaymentId);
      
      if (!cieloPaymentDetails || !cieloPaymentDetails.payment) {
        console.error('❌ [RECEIPT-SERVICE] Dados do pagamento não encontrados na Cielo', {
          correlationId: logId,
          paymentId: receiptData.cieloPaymentId
        });
        return {
          success: false,
          error: 'Dados do pagamento não encontrados na API Cielo'
        };
      }

      const payment = cieloPaymentDetails.payment;
      
      // Validate that payment is approved/completed or PIX pending
      // Accept status 2 (approved), status 12 (PIX pending) and mapped status ('approved' or 'pending')
      const statusStr = String(payment.status);
      const isPaymentValid = payment.status === 2 || 
                            payment.status === 12 || // PIX pendente (QR Code gerado)
                            statusStr === 'approved' || 
                            statusStr === 'pending' || // PIX com status mapeado 'pending'
                            statusStr === '2' || 
                            statusStr === '12';
      
      if (!isPaymentValid) {
        console.warn('⚠️ [RECEIPT-SERVICE] Tentativa de gerar comprovante para pagamento com status inválido', {
          correlationId: logId,
          paymentId: receiptData.cieloPaymentId,
          status: payment.status,
          returnMessage: payment.returnMessage
        });
        return {
          success: false,
          error: `Status do pagamento não permite geração de comprovante. Status: ${payment.status || 'Desconhecido'}`
        };
      }
      
      // Log para status PIX pendente
      if (payment.status === 12 || statusStr === '12' || statusStr === 'pending') {
        console.log('📄 [RECEIPT-SERVICE] Gerando comprovante para pagamento PIX pendente', {
          correlationId: logId,
          paymentId: receiptData.cieloPaymentId,
          status: payment.status
        });
      }

      console.log('✅ [RECEIPT-SERVICE] Dados oficiais obtidos da Cielo', {
        correlationId: logId,
        proofOfSale: payment.proofOfSale,
        tid: payment.tid,
        authorizationCode: payment.authorizationCode,
        amount: payment.amount,
        receivedDate: payment.receivedDate
      });

      // ✅ INTEGRIDADE: Gerar receiptNumber UMA ÚNICA VEZ
      const receiptNumber = this.generateReceiptNumber();
      console.log('🔢 [RECEIPT-SERVICE] Número do recibo gerado:', receiptNumber);
      
      // Step 2: Generate PDF with official data (passando receiptNumber)
      const pdfBuffer = await this.generatePDF(receiptData, payment, receiptNumber);
      
      // Step 3: Generate filename usando o receiptNumber consistente
      const fileName = `comprovante_${receiptNumber}.pdf`;

      // Step 4: Upload PDF to Supabase Storage (BUCKET PRIVADO) - com fallback
      let uploadResult: any = { success: false, error: 'Storage não disponível' };
      
      try {
        console.log('📤 [RECEIPT-SERVICE] Tentando upload do PDF para Supabase Storage...');
        uploadResult = await supabaseStorage.uploadReceiptPDF(fileName, pdfBuffer);
        
        if (uploadResult.success) {
          console.log('✅ [RECEIPT-SERVICE] PDF enviado para Supabase Storage PRIVADO', {
            correlationId: logId,
            objectKey: uploadResult.objectKey
          });
        }
      } catch (uploadError) {
        console.warn('⚠️ [RECEIPT-SERVICE] Supabase Storage não disponível, salvando apenas registro', {
          correlationId: logId,
          error: uploadError instanceof Error ? uploadError.message : 'Erro desconhecido'
        });
        // Continuar sem o upload do PDF, apenas salvar o registro no banco
        uploadResult = {
          success: false,
          objectKey: null,
          publicUrl: null,
          error: 'Storage não configurado - comprovante salvo sem PDF'
        };
      }

      // Step 5: Save receipt record to database (com fallback para quando não houver storage)
      const receiptRecord = {
        id: randomUUID(),
        contractId: receiptData.contractId || null,
        cieloPaymentId: receiptData.cieloPaymentId,
        receiptNumber: receiptNumber,
        paymentAmount: (payment.amount / 100), // ✅ TIPOS: Converter para número (não string)
        paymentDate: new Date(payment.receivedDate),
        paymentMethod: this.getPaymentMethodFromCielo(payment.type),
        status: 'generated' as const,
        pdfFileName: fileName,
        pdfObjectKey: uploadResult.objectKey || 'pending_storage', // Fallback quando storage não disponível
        pdfUrl: uploadResult.publicUrl || uploadResult.objectKey || 'pending_storage', // Fallback para URL
        proofOfSale: payment.proofOfSale || null,
        authorizationCode: payment.authorizationCode || null,
        tid: payment.tid || null,
        returnCode: payment.returnCode || null,
        returnMessage: payment.returnMessage || null,
        clientName: receiptData.clientName,
        clientEmail: receiptData.clientEmail,
        petName: receiptData.petName || null,
        planName: receiptData.planName || null,
        petsData: receiptData.pets || null, // Save the complete pets array
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('💾 [RECEIPT-SERVICE] Salvando registro do comprovante no banco...');
      const savedReceipt = await storage.createPaymentReceipt(receiptRecord);

      console.log('✅ [RECEIPT-SERVICE] Comprovante oficial gerado com sucesso', {
        correlationId: logId,
        receiptId: savedReceipt.id,
        receiptNumber: receiptNumber,
        pdfUrl: uploadResult.publicUrl
      });

      return {
        success: true,
        receiptId: savedReceipt.id,
        receiptNumber: receiptNumber, // ✅ Retornar receiptNumber para referência
        pdfUrl: uploadResult.publicUrl || uploadResult.objectKey!
      };

    } catch (error) {
      console.error('❌ [RECEIPT-SERVICE] Erro na geração do comprovante', {
        correlationId: logId,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });

      return {
        success: false,
        error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  /**
   * Generate PDF document with official Cielo payment data following invoice format
   * ✅ INTEGRIDADE: receiptNumber é passado como parâmetro para garantir consistência
   */
  private async generatePDF(
    receiptData: PaymentReceiptData,
    cieloPayment: CieloPaymentResponse['payment'],
    receiptNumber: string // ✅ Parâmetro para usar número consistente
  ): Promise<Buffer> {
    const currentDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const paymentDate = new Date(cieloPayment.receivedDate).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const amount = (cieloPayment.amount / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    // ✅ INTEGRIDADE: receiptNumber agora vem como parâmetro (não gerar novamente)

    // Create document definition following invoice example format
    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [60, 80, 60, 80],
      content: [
        // Header with logo and company info
        {
          columns: [
            // Left side - Company info with logo
            {
              width: '50%',
              stack: [
                // Logo (if available)
                ...(this.unipetLogoBase64 ? [{
                  image: `data:image/png;base64,${this.unipetLogoBase64}`,
                  width: 120,
                  marginBottom: 10
                }] : []),
                { text: 'Plano de Saúde para Pets', style: 'companySubtitle' },
                { text: 'AVENIDA DOM SEVERINO, 1372, FATIMA', style: 'companyAddress' },
                { text: 'Teresina/PI', style: 'companyAddress' },
                { text: 'CEP: 64049-370', style: 'companyAddress' },
                { text: 'Brasil', style: 'companyAddress' },
                { text: 'contato@unipetplan.com.br', style: 'companyContact' },
                { text: 'CNPJ: 61.863.611/0001-58', style: 'companyContact' }
              ]
            },
            // Right side - Bill to section
            {
              width: '50%',
              stack: [
                { text: 'Dados do Cliente', style: 'billToTitle', marginBottom: 10 },
                { text: receiptData.clientName, style: 'billToText', bold: true },
                { text: receiptData.clientEmail, style: 'billToText' },
                ...(receiptData.clientCPF ? [{ text: `CPF: ${receiptData.clientCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}`, style: 'billToText' }] : []),
                ...(receiptData.clientPhone ? [{ text: `Telefone: ${receiptData.clientPhone}`, style: 'billToText' }] : []),
                ...(receiptData.clientAddress ? [
                  { text: `${receiptData.clientAddress.street}, ${receiptData.clientAddress.number}${receiptData.clientAddress.complement ? ' - ' + receiptData.clientAddress.complement : ''}`, style: 'billToText' },
                  { text: `${receiptData.clientAddress.neighborhood} - ${receiptData.clientAddress.city}/${receiptData.clientAddress.state}`, style: 'billToText' },
                  { text: `CEP: ${receiptData.clientAddress.zipCode.replace(/(\d{5})(\d{3})/, '$1-$2')}`, style: 'billToText' }
                ] : []),
                // Resumo dos pets (se múltiplos)
                ...(receiptData.pets && receiptData.pets.length > 1 ? [
                  { text: `Total de pets: ${receiptData.pets.length}`, style: 'billToText', bold: true, marginTop: 5 }
                ] : [])
              ]
            }
          ],
          marginBottom: 40
        },

        // Receipt title and number
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'Comprovante', style: 'receiptTitle' },
                { text: `Comprovante número: ${receiptNumber}`, style: 'receiptNumber' },
                { text: `Data de emissão: ${currentDate}`, style: 'receiptDate' },
                { text: `Data do pagamento: ${paymentDate}`, style: 'receiptDate' }
              ]
            },
            {
              width: '50%',
              stack: [
                { text: amount, style: 'totalAmount', alignment: 'right' },
                { text: `pago em ${paymentDate}`, style: 'paidDate', alignment: 'right' }
              ]
            }
          ],
          marginBottom: 40
        },

        // Service description table
        {
          table: {
            headerRows: 1,
            widths: ['*', '15%', '20%', '20%'],
            body: [
              // Header
              [
                { text: 'Descrição', style: 'tableHeader' },
                { text: 'Qtd', style: 'tableHeader', alignment: 'center' },
                { text: 'Valor Unitário', style: 'tableHeader', alignment: 'right' },
                { text: 'Valor', style: 'tableHeader', alignment: 'right' }
              ],
              // Service items - múltiplos pets se disponível
              ...(receiptData.pets && receiptData.pets.length > 0 ? 
                receiptData.pets.map((pet, index) => {
                  // Usar valores já calculados se disponíveis, senão usar fallback
                  const unitValue = pet.discountedValue || pet.value || 0;
                  const originalValue = pet.value || 0;
                  const hasDiscount = pet.discount && pet.discount > 0;
                  
                  return [
                    {
                      stack: [
                        { text: pet.planName || receiptData.planName || 'Plano de Saúde Pet', style: 'serviceDescription', bold: true },
                        { text: `Pagamento referente ao plano contratado`, style: 'serviceDetails' },
                        { text: `Pet: ${pet.name}`, style: 'serviceDetails' },
                        { text: `Espécie: ${pet.species || 'Não informado'}`, style: 'serviceDetails' },
                        ...(pet.breed ? [{ text: `Raça: ${pet.breed}`, style: 'serviceDetails' }] : []),
                        ...(pet.age ? [{ text: `Idade: ${pet.age} ${pet.age === 1 ? 'ano' : 'anos'}`, style: 'serviceDetails' }] : []),
                        ...(pet.sex ? [{ text: `Sexo: ${pet.sex === 'M' ? 'Macho' : pet.sex === 'F' ? 'Fêmea' : pet.sex}`, style: 'serviceDetails' }] : []),
                        ...(hasDiscount ? [
                          { text: `Desconto aplicado: ${pet.discount}%`, style: 'serviceDetails', color: '#16a34a' },
                          { text: `Valor original: ${(originalValue / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, style: 'serviceDetails', decoration: 'lineThrough' }
                        ] : [])
                      ]
                    },
                    { text: '1', style: 'tableCell', alignment: 'center' },
                    { text: (unitValue / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), style: 'tableCell', alignment: 'right' },
                    { text: (unitValue / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), style: 'tableCell', alignment: 'right' }
                  ];
                }) :
                // Fallback para pets únicos (compatibilidade)
                [[
                  {
                    stack: [
                      { text: receiptData.planName || 'Plano de Saúde Pet', style: 'serviceDescription', bold: true },
                      { text: `Pagamento referente ao plano contratado`, style: 'serviceDetails' },
                      { text: `Pet: ${receiptData.petName || 'N/A'}`, style: 'serviceDetails' }
                    ]
                  },
                  { text: '1', style: 'tableCell', alignment: 'center' },
                  { text: amount, style: 'tableCell', alignment: 'right' },
                  { text: amount, style: 'tableCell', alignment: 'right' }
                ]]
              )
            ]
          },
          layout: {
            fillColor: function (rowIndex: number) {
              return rowIndex === 0 ? 'rgb(var(--muted))' : null;
            }
          },
          marginBottom: 30
        },

        // Totals section - Cálculo detalhado quando houver pets e descontos
        {
          columns: [
            { width: '60%', text: '' },
            {
              width: '40%',
              table: {
                widths: ['60%', '40%'],
                body: [
                  // Subtotal (soma dos valores sem desconto)
                  ...(receiptData.pets && receiptData.pets.length > 0 && receiptData.totalDiscount ? [
                    ['Subtotal', { 
                      text: ((receiptData.pets.reduce((sum, pet) => sum + (pet.value || 0), 0)) / 100).toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }), 
                      alignment: 'right' 
                    }],
                    // Desconto total
                    ['Desconto Total', { 
                      text: `- ${(receiptData.totalDiscount / 100).toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      })}`, 
                      alignment: 'right', 
                      color: '#16a34a' 
                    }]
                  ] : [
                    ['Subtotal', { text: amount, alignment: 'right' }]
                  ]),
                  
                  // Total final
                  [{ text: 'Total', bold: true }, { 
                    text: receiptData.finalAmount ? 
                      (receiptData.finalAmount / 100).toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }) : amount, 
                    alignment: 'right', 
                    bold: true 
                  }],
                  
                  // Parcelamento (se houver)
                  ...(receiptData.installments && receiptData.installments > 1 ? [
                    [`${receiptData.installments}x de`, { 
                      text: receiptData.installmentValue ? 
                        (receiptData.installmentValue / 100).toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }) : 
                        ((receiptData.finalAmount || cieloPayment.amount) / receiptData.installments / 100).toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }), 
                      alignment: 'right' 
                    }]
                  ] : []),
                  
                  // Valor pago
                  [{ 
                    text: receiptData.paymentMethod === 'pix' ? 'Valor PIX' : 'Valor Pago', 
                    bold: true, 
                    color: '#16a34a' 
                  }, { 
                    text: receiptData.finalAmount ? 
                      (receiptData.finalAmount / 100).toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }) : amount, 
                    alignment: 'right', 
                    bold: true, 
                    color: '#16a34a' 
                  }]
                ]
              },
              layout: 'lightHorizontalLines'
            }
          ],
          marginBottom: 40
        },

        // Official Cielo Transaction Data
        { text: 'DADOS OFICIAIS DA TRANSAÇÃO CIELO', style: 'sectionHeader' },
        {
          table: {
            widths: ['35%', '65%'],
            body: [
              ['Método de Pagamento:', { text: this.getPaymentMethodLabel(cieloPayment.type), style: 'dataValue' }],
              ['Status:', { text: cieloPayment.returnMessage || 'Aprovado', style: 'dataValue', color: 'rgb(var(--success))' }],
              ['NSU (Proof of Sale):', { text: cieloPayment.proofOfSale || 'N/A', style: 'dataValue' }],
              ['TID (Transaction ID):', { text: cieloPayment.tid || 'N/A', style: 'dataValue' }],
              ...(cieloPayment.authorizationCode ? [['Código de Autorização:', { text: cieloPayment.authorizationCode, style: 'dataValue' }]] : []),
              ['Código de Retorno:', { text: cieloPayment.returnCode || 'N/A', style: 'dataValue' }],
              ['Payment ID Cielo:', { text: cieloPayment.paymentId || 'N/A', style: 'dataValue' }],
              ['Data/Hora Processamento:', { text: paymentDate, style: 'dataValue' }]
            ]
          },
          layout: 'lightHorizontalLines',
          marginBottom: 30
        },

        // Informações do Plano (se disponível)
        ...(receiptData.planFeatures ? [
          { text: 'CARACTERÍSTICAS DO PLANO', style: 'sectionHeader' },
          {
            table: {
              widths: ['35%', '65%'],
              body: [
                ['Tipo de Cobrança:', { 
                  text: receiptData.planFeatures.billingType === 'annual' ? 'Anual' : 'Mensal', 
                  style: 'dataValue' 
                }],
                ['Coparticipação:', { 
                  text: receiptData.planFeatures.hasCoparticipation ? 'Com coparticipação' : 'Sem coparticipação', 
                  style: 'dataValue' 
                }],
                ['Carência:', { 
                  text: receiptData.planFeatures.hasWaitingPeriod ? 'Com período de carência' : 'Sem período de carência', 
                  style: 'dataValue' 
                }],
                ...(receiptData.pets && receiptData.pets.length > 1 ? [
                  ['Pets Cobertos:', { 
                    text: receiptData.pets.map(pet => `${pet.name} (${pet.species})`).join(', '), 
                    style: 'dataValue' 
                  }]
                ] : [])
              ]
            },
            layout: 'lightHorizontalLines',
            marginBottom: 30
          }
        ] : []),

        // Footer information
        {
          table: {
            widths: ['*'],
            body: [
              [{
                stack: [
                  { text: 'INFORMAÇÕES IMPORTANTES', style: 'footerTitle' },
                  { text: '• Este comprovante foi gerado automaticamente com dados oficiais da API Cielo', style: 'footerText' },
                  { text: '• Mantenha este comprovante como prova de pagamento do seu plano de saúde pet', style: 'footerText' },
                  ...(receiptData.pets && receiptData.pets.length > 1 ? [
                    { text: `• Este comprovante inclui cobertura para ${receiptData.pets.length} pets`, style: 'footerText' }
                  ] : []),
                  { text: '• Para dúvidas ou suporte, entre em contato: contato@unipetplan.com.br', style: 'footerText' },
                  { text: `• Documento gerado em ${currentDate} - Sistema UNIPET PLAN`, style: 'footerText' }
                ],
                fillColor: '#f8f9fa',
                border: [true, true, true, true],
                borderColor: '#dee2e6'
              }]
            ]
          }
        }
      ],

      // Styles following the invoice example
      styles: {
        companyName: {
          fontSize: 20,
          bold: true,
          color: '#f39c12',
          marginBottom: 2
        },
        companySubtitle: {
          fontSize: 12,
          color: '#666',
          marginBottom: 8
        },
        companyAddress: {
          fontSize: 10,
          color: '#333',
          marginBottom: 1
        },
        companyContact: {
          fontSize: 10,
          color: '#333',
          marginBottom: 1
        },
        billToTitle: {
          fontSize: 14,
          bold: true,
          color: '#333'
        },
        billToText: {
          fontSize: 11,
          color: '#333',
          marginBottom: 2
        },
        receiptTitle: {
          fontSize: 18,
          bold: true,
          color: '#333'
        },
        receiptNumber: {
          fontSize: 12,
          color: '#666',
          marginBottom: 2
        },
        receiptDate: {
          fontSize: 11,
          color: '#666',
          marginBottom: 2
        },
        totalAmount: {
          fontSize: 20,
          bold: true,
          color: '#16a34a'
        },
        paidDate: {
          fontSize: 11,
          color: '#666'
        },
        tableHeader: {
          fontSize: 11,
          bold: true,
          color: '#FFFFFF',
          marginTop: 5,
          marginBottom: 5
        },
        tableCell: {
          fontSize: 11,
          color: '#333',
          marginTop: 3,
          marginBottom: 3
        },
        serviceDescription: {
          fontSize: 12,
          color: '#333'
        },
        serviceDetails: {
          fontSize: 10,
          color: '#666',
          marginTop: 2
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          color: '#1e7b69',
          marginBottom: 10
        },
        dataValue: {
          fontSize: 11,
          color: '#333',
          marginTop: 2,
          marginBottom: 2
        },
        footerTitle: {
          fontSize: 12,
          bold: true,
          color: '#1e7b69',
          marginBottom: 8
        },
        footerText: {
          fontSize: 10,
          color: '#666',
          marginBottom: 4
        }
      }
    };

    return new Promise((resolve, reject) => {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      
      pdfDoc.getBuffer((buffer: Buffer) => {
        if (buffer) {
          resolve(buffer);
        } else {
          reject(new Error('Failed to generate PDF buffer'));
        }
      });
    });
  }

  /**
   * Generate unique receipt number
   */
  private generateReceiptNumber(): string {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `UNIPET${timestamp}${random}`;
  }

  /**
   * Convert Cielo payment type to readable payment method
   */
  private getPaymentMethodFromCielo(paymentType: string): string {
    switch (paymentType?.toLowerCase()) {
      case 'creditcard':
        return 'credit_card';
      case 'pix':
        return 'pix';
      default:
        return 'other';
    }
  }

  /**
   * Get readable payment method label
   */
  private getPaymentMethodLabel(paymentType: string): string {
    switch (paymentType?.toLowerCase()) {
      case 'creditcard':
        return 'Cartão de Crédito';
      case 'pix':
        return 'PIX';
      default:
        return 'Outros';
    }
  }

  /**
   * Get payment receipts by client email
   */
  async getClientPaymentReceipts(clientEmail: string): Promise<any[]> {
    try {
      const receipts = await storage.getPaymentReceiptsByClientEmail(clientEmail);
      return receipts || [];
    } catch (error) {
      console.error('❌ [RECEIPT-SERVICE] Erro ao buscar comprovantes do cliente', {
        clientEmail,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return [];
    }
  }

  /**
   * Get payment receipt by ID
   */
  async getPaymentReceiptById(receiptId: string): Promise<any | null> {
    try {
      return await storage.getPaymentReceiptById(receiptId);
    } catch (error) {
      console.error('❌ [RECEIPT-SERVICE] Erro ao buscar comprovante por ID', {
        receiptId,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return null;
    }
  }

  /**
   * Update receipt status (e.g., when downloaded)
   */
  async updateReceiptStatus(receiptId: string, status: 'generated' | 'downloaded' | 'sent'): Promise<boolean> {
    try {
      await storage.updatePaymentReceiptStatus(receiptId, status);
      return true;
    } catch (error) {
      console.error('❌ [RECEIPT-SERVICE] Erro ao atualizar status do comprovante', {
        receiptId,
        status,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return false;
    }
  }

  /**
   * ✅ FALLBACK: Regenerate PDF directly from database receipt data
   * This method is used when the original PDF is missing from storage
   */
  async regeneratePDFFromReceipt(receiptData: any): Promise<{ success: boolean; pdfBuffer?: Buffer; error?: string }> {
    try {
      console.log(`🔄 [RECEIPT-SERVICE] Regenerando PDF a partir dos dados do comprovante: ${receiptData.receiptNumber}`);

      // Create PDF data structure from database receipt
      const pdfData: PaymentReceiptData = {
        cieloPaymentId: receiptData.cieloPaymentId || 'regenerated',
        clientName: receiptData.clientName,
        clientEmail: receiptData.clientEmail,
        petName: receiptData.petName || 'Pet não informado',
        planName: receiptData.planName || 'Plano não informado',
        pets: receiptData.petsData || undefined, // Use the complete pets data if available
        contractId: receiptData.contractId || undefined
      };

      // Generate PDF buffer directly using a mock payment structure
      const mockCieloPayment = {
        amount: receiptData.paymentAmount * 100, // Convert back to cents
        installments: 1,
        type: receiptData.paymentMethod,
        currency: 'BRL',
        country: 'BRA',
        provider: 'Simulado',
        proofOfSale: receiptData.proofOfSale || 'N/A',
        authorizationCode: receiptData.authorizationCode || 'N/A',
        tid: receiptData.tid || 'N/A',
        status: 2, // Captured
        returnCode: '4',
        returnMessage: 'Operação realizada com sucesso',
        receivedDate: receiptData.paymentDate,
        capture: true,
        authenticate: false,
        paymentId: receiptData.cieloPaymentId || 'regenerated'
      };
      
      const pdfBuffer = await this.generatePDF(pdfData, mockCieloPayment, receiptData.receiptNumber);

      console.log(`✅ [RECEIPT-SERVICE] PDF regenerado com sucesso: ${receiptData.receiptNumber}`);

      return {
        success: true,
        pdfBuffer
      };

    } catch (error) {
      console.error(`❌ [RECEIPT-SERVICE] Erro ao regenerar PDF:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}