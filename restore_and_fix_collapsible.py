#!/usr/bin/env python3

# Read the current file to get the imports and basic structure
with open('client/src/pages/customer-financial.tsx', 'r') as f:
    lines = f.readlines()

# Get the first 520 lines (up to before the sections we need to modify)
header_lines = []
for i in range(min(520, len(lines))):
    header_lines.append(lines[i])

# Now manually write the corrected sections with collapsible functionality
content = ''.join(header_lines)

# Add the corrected sections
content += """          </motion.div>

          {/* Active Contracts Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 bg-white rounded-xl shadow-lg p-6"
          >
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => setContractsExpanded(!contractsExpanded)}
            >
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-dark-primary)' }}>
                Contratos
              </h3>
              {contractsExpanded ? (
                <ChevronUp className="w-5 h-5" style={{ color: 'var(--text-dark-secondary)' }} />
              ) : (
                <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-dark-secondary)' }} />
              )}
            </div>
            {contractsExpanded && (
              <div className="space-y-4">
                {contracts.length > 0 ? (
                  contracts.map((contract) => {
                    const renewalDate = contract.expirationDate ? new Date(contract.expirationDate) : null;
                    const renewalDay = renewalDate && !isNaN(renewalDate.getTime()) ? renewalDate.getDate() : null;
                    const isRenewalNeeded = contract.daysRemaining <= 5 && !contract.isExpired;
                    const isExpired = contract.isExpired;
                    
                    return (
                      <div key={contract.id} className="p-4 rounded-lg border" style={{ borderColor: 'var(--border-gray)', background: 'var(--bg-cream-light)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(contract.status)}
                            <h4 className="font-medium" style={{ color: 'var(--text-dark-primary)' }}>
                              {contract.planName} - {contract.petName}
                            </h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 rounded-full text-sm font-medium"
                              style={{ 
                                background: contract.status === 'active' ? 'var(--text-teal)' : 'var(--text-dark-secondary)', 
                                color: 'white' 
                              }}>
                              {getStatusLabel(contract.status)}
                            </span>
                            {(isRenewalNeeded || isExpired) && (
                              <button
                                onClick={() => handleRenewalCheckout(contract)}
                                className="px-4 py-1 bg-red-500 text-white text-sm font-medium rounded-full transition-colors"
                              >
                                Regularizar
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p style={{ color: 'var(--text-dark-secondary)' }}>Contrato: #{contract.contractNumber}</p>
                            <p style={{ color: 'var(--text-dark-secondary)' }}>Data de Início: {formatDate(contract.startDate)}</p>
                          </div>
                          <div>
                            <p style={{ color: 'var(--text-dark-secondary)' }}>
                              Tipo: <span className="font-medium" style={{ color: 'var(--text-dark-primary)' }}>
                                {getPlanTypeLabel(contract.billingPeriod || 'monthly')}
                              </span>
                            </p>
                            {renewalDay && (
                              <p style={{ color: 'var(--text-dark-secondary)' }}>
                                Dia da renovação: <span className="font-medium" style={{ color: 'var(--text-dark-primary)' }}>
                                  {renewalDay}
                                </span>
                              </p>
                            )}
                          </div>
                          <div>
                            {renewalDate && !isNaN(renewalDate.getTime()) && (
                              <p style={{ color: 'var(--text-dark-secondary)' }}>
                                Próxima renovação: <span className="font-medium" style={{ color: 'var(--text-dark-primary)' }}>
                                  {formatDate(renewalDate.toISOString())}
                                </span>
                              </p>
                            )}
                            <div className="mt-1">
                              {getCountdownDisplay(contract.daysRemaining, contract.isExpired)}
                            </div>
                          </div>
                          <div>
                            <p style={{ color: 'var(--text-dark-secondary)' }}>
                              Valor: <span className="font-medium text-lg" style={{ color: 'var(--text-teal)' }}>
                                {getCurrentContractValue(contract)}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center" style={{ background: 'var(--bg-cream-light)' }}>
                    <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-dark-secondary)' }} />
                    <p style={{ color: 'var(--text-dark-secondary)' }}>Nenhum contrato encontrado.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Payment History Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 bg-white rounded-xl shadow-lg p-6"
          >
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => setHistoryExpanded(!historyExpanded)}
            >
              <div className="flex items-center">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-dark-primary)' }}>
                  Histórico de Pagamentos
                </h3>
                {isLoadingPayments && (
                  <div className="inline-flex items-center ml-3">
                    <div className="w-4 h-4 border-2 rounded-full animate-spin" 
                      style={{borderColor: 'var(--text-teal)', borderTopColor: 'transparent'}}></div>
                    <span className="ml-2 text-sm" style={{ color: 'var(--text-dark-secondary)' }}>
                      Carregando...
                    </span>
                  </div>
                )}
              </div>
              {historyExpanded ? (
                <ChevronUp className="w-5 h-5" style={{ color: 'var(--text-dark-secondary)' }} />
              ) : (
                <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-dark-secondary)' }} />
              )}
            </div>
            {historyExpanded && (
              <div className="space-y-4">
                {paymentError ? (
                  <div className="p-6 text-center rounded-lg" style={{ background: 'rgb(var(--error-bg))', borderColor: 'rgb(var(--error-border))' }}>
                    <XCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgb(var(--error-red))' }} />
                    <p className="font-medium mb-2" style={{ color: 'rgb(var(--error-red))' }}>
                      Erro ao carregar histórico de pagamentos
                    </p>
                    <p className="text-sm mb-4" style={{ color: 'rgb(var(--error-red-dark))' }}>
                      {paymentError}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ 
                        background: 'rgb(var(--error-red))', 
                        color: 'white',
                        transition: 'background-color 0.2s'
                      }}


                    >
                      Tentar Novamente
                    </button>
                  </div>
                ) : paymentHistory.length > 0 ? (
                  paymentHistory.map((payment) => (
                    <div key={payment.id} className="p-4 rounded-lg border" style={{ borderColor: 'var(--border-gray)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <div>
                            <h4 className="font-medium" style={{ color: 'var(--text-dark-primary)' }}>
                              {payment.planName} - {payment.petName}
                            </h4>
                            <p className="text-sm" style={{ color: 'var(--text-dark-secondary)' }}>
                              Contrato: #{payment.contractNumber}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg" style={{ color: 'var(--text-teal)' }}>
                            {formatCurrency(payment.amount)}
                          </p>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(payment.status)}
                            <span className="text-sm" style={{ color: 'var(--text-dark-secondary)' }}>
                              {getStatusLabel(payment.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p style={{ color: 'var(--text-dark-secondary)' }}>
                            Método: {getPaymentMethodLabel(payment.paymentMethod)}
                          </p>
                          {payment.receivedDate && (
                            <p style={{ color: 'var(--text-dark-secondary)' }}>
                              Data: {formatDate(payment.receivedDate)}
                            </p>
                          )}
                        </div>
                        
                        {/* Payment Receipt Information */}
                        {(payment.proofOfSale || payment.authorizationCode || payment.tid) && (
                          <div className="p-3 rounded bg-gray-50">
                            <h5 className="font-medium mb-2" style={{ color: 'var(--text-dark-primary)' }}>
                              Comprovante de Pagamento
                            </h5>
                            {payment.proofOfSale && (
                              <p className="text-xs" style={{ color: 'var(--text-dark-secondary)' }}>
                                NSU: {payment.proofOfSale}
                              </p>
                            )}
                            {payment.authorizationCode && (
                              <p className="text-xs" style={{ color: 'var(--text-dark-secondary)' }}>
                                Código de Autorização: {payment.authorizationCode}
                              </p>
                            )}
                            {payment.tid && (
                              <p className="text-xs" style={{ color: 'var(--text-dark-secondary)' }}>
                                TID: {payment.tid}
                              </p>
                            )}
                            {payment.returnMessage && (
                              <p className="text-xs mt-1" style={{ color: 'var(--text-dark-secondary)' }}>
                                Status: {payment.returnMessage}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* PIX Information */}
                      {payment.paymentMethod === 'pix' && (payment.pixQrCode || payment.pixCode) && (
                        <div className="mt-3 p-3 rounded" style={{ background: 'var(--bg-cream-light)' }}>
                          <h5 className="font-medium mb-2" style={{ color: 'var(--text-dark-primary)' }}>
                            Informações PIX
                          </h5>
                          {payment.pixCode && (
                            <p className="text-xs font-mono" style={{ color: 'var(--text-dark-secondary)' }}>
                              Código PIX: {payment.pixCode}
                            </p>
                          )}
                          {payment.pixQrCode && (
                            <div className="mt-2">
                              <p className="text-xs mb-1" style={{ color: 'var(--text-dark-secondary)' }}>QR Code PIX disponível</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center" style={{ background: 'var(--bg-cream-light)' }}>
                    <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-dark-secondary)' }} />
                    <p style={{ color: 'var(--text-dark-secondary)' }}>Nenhum histórico de pagamento encontrado.</p>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-dark-secondary)' }}>
                      Seus pagamentos aparecerão aqui após serem processados.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Official Payment Receipts Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 bg-white rounded-xl shadow-lg p-6"
          >
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => setReceiptsExpanded(!receiptsExpanded)}
            >
              <div className="flex items-center">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-dark-primary)' }}>
                  Comprovante UNIPET
                </h3>
                {isLoadingReceipts && (
                  <div className="inline-flex items-center ml-3">
                    <div className="w-4 h-4 border-2 rounded-full animate-spin" 
                      style={{borderColor: 'var(--text-teal)', borderTopColor: 'transparent'}}></div>
                    <span className="ml-2 text-sm" style={{ color: 'var(--text-dark-secondary)' }}>
                      Carregando...
                    </span>
                  </div>
                )}
              </div>
              {receiptsExpanded ? (
                <ChevronUp className="w-5 h-5" style={{ color: 'var(--text-dark-secondary)' }} />
              ) : (
                <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-dark-secondary)' }} />
              )}
            </div>
            {receiptsExpanded && (
              <div className="space-y-4">
                {receiptsError ? (
                  <div className="p-6 text-center rounded-lg" style={{ background: 'rgb(var(--error-bg))', borderColor: 'rgb(var(--error-border))' }}>
                    <XCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgb(var(--error-red))' }} />
                    <p className="font-medium mb-2" style={{ color: 'rgb(var(--error-red))' }}>
                      Erro ao carregar comprovantes oficiais
                    </p>
                    <p className="text-sm mb-4" style={{ color: 'rgb(var(--error-red-dark))' }}>
                      {receiptsError}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ 
                        background: 'rgb(var(--error-red))', 
                        color: 'white',
                        transition: 'background-color 0.2s'
                      }}


                    >
                      Tentar Novamente
                    </button>
                  </div>
                ) : paymentReceipts.length > 0 ? (
                  paymentReceipts.map((receipt) => (
                    <div key={receipt.id} className="p-4 rounded-lg border" style={{ borderColor: 'var(--border-gray)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5" style={{ color: 'var(--text-teal)' }} />
                          <div>
                            <h4 className="font-medium" style={{ color: 'var(--text-dark-primary)' }}>
                              Comprovante #{receipt.receiptNumber}
                            </h4>
                            {receipt.planName && receipt.petName && (
                              <p className="text-sm" style={{ color: 'var(--text-dark-secondary)' }}>
                                {receipt.planName} - {receipt.petName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg" style={{ color: 'var(--text-teal)' }}>
                            {formatCurrency(receipt.paymentAmount)}
                          </p>
                          <div className="flex items-center justify-end space-x-2">
                            <span className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{ 
                                background: getReceiptStatusColor(receipt.status) + '20',
                                color: getReceiptStatusColor(receipt.status)
                              }}>
                              {getReceiptStatusLabel(receipt.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p style={{ color: 'var(--text-dark-secondary)' }}>
                            Método: {getPaymentMethodLabel(receipt.paymentMethod)}
                          </p>
                          <p style={{ color: 'var(--text-dark-secondary)' }}>
                            Data do Pagamento: {formatDate(receipt.paymentDate)}
                          </p>
                        </div>
                        
                        {/* Official Cielo Information */}
                        {(receipt.proofOfSale || receipt.authorizationCode || receipt.tid) && (
                          <div className="p-3 rounded" style={{ background: 'var(--bg-cream-light)' }}>
                            <h5 className="font-medium mb-2" style={{ color: 'var(--text-dark-primary)' }}>
                              Dados Oficiais da Cielo
                            </h5>
                            {receipt.proofOfSale && (
                              <p className="text-xs" style={{ color: 'var(--text-dark-secondary)' }}>
                                Comprovante de Venda: {receipt.proofOfSale}
                              </p>
                            )}
                            {receipt.authorizationCode && (
                              <p className="text-xs" style={{ color: 'var(--text-dark-secondary)' }}>
                                Código de Autorização: {receipt.authorizationCode}
                              </p>
                            )}
                            {receipt.tid && (
                              <p className="text-xs" style={{ color: 'var(--text-dark-secondary)' }}>
                                TID: {receipt.tid}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Download Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDownloadReceipt(receipt.id)}
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors"
                          style={{ 
                            background: 'var(--text-teal)', 
                            color: 'white',
                            transition: 'background-color 0.2s'
                          }}


                        >
                          <Download className="w-4 h-4" />
                          <span>Baixar Comprovante PDF</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center" style={{ background: 'var(--bg-cream-light)' }}>
                    <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-dark-secondary)' }} />
                    <p style={{ color: 'var(--text-dark-secondary)' }}>Nenhum comprovante oficial encontrado.</p>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-dark-secondary)' }}>
                      Comprovantes são gerados automaticamente quando pagamentos são aprovados pela Cielo.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

        </div>
      </div>

      <Footer />
    </>
  );
}
"""

# Write the complete fixed file
with open('client/src/pages/customer-financial.tsx', 'w') as f:
    f.write(content)

print("File restored and fixed with collapsible functionality!")