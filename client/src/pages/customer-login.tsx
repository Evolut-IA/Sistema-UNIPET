import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Lock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientLoginSchema } from "@shared/schema";
import type { z } from "zod";
// Fixed import path and schema validation
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

type LoginFormData = z.infer<typeof clientLoginSchema>;

export default function CustomerLoginPage() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPaymentSuccessPopup, setShowPaymentSuccessPopup] = useState(false);

  // Detectar parâmetro payment_success na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_success') === 'true') {
      setShowPaymentSuccessPopup(true);
      console.log('🎉 [LOGIN] Popup de sucesso do pagamento ativado!');
      
      // Dispara confetti quando o popup aparece
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
        });
      }, 300);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(clientLoginSchema),
    mode: 'onBlur'
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/clients/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for session cookies
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Redirecionar para dashboard
        navigate('/customer/dashboard');
      } else {
        setSubmitError(result.error || 'Erro no login');
      }
    } catch (error) {
      console.error('Login error:', error);
      setSubmitError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-16" style={{background: 'var(--bg-cream-light)'}}>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--text-dark-primary)'}}>Área do Cliente</h1>
              <p style={{color: 'var(--text-dark-secondary)'}}>Acesse sua conta com seu email e senha</p>
            </div>

            {/* Login Form */}
            <div className="rounded-xl shadow-lg p-8" style={{background: 'var(--bg-cream-lighter)'}}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium" style={{color: 'var(--text-dark-primary)'}}>
                    <User className="w-4 h-4" />
                    <span>Email</span>
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full p-3 border rounded-lg transition-all duration-200"
                    style={{
                      borderColor: 'var(--border-gray)',
                      outline: 'none',
                      borderRadius: '12px',
                      borderWidth: '2px',
                      padding: '12px 16px',
                      height: '48px'
                    }}
                    placeholder="Digite seu email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium" style={{color: 'var(--text-dark-primary)'}}>
                    <Lock className="w-4 h-4" />
                    <span>CPF</span>
                  </label>
                  <input
                    type="password"
                    {...register("password")}
                    className="w-full p-3 border rounded-lg transition-all duration-200"
                    style={{
                      borderColor: 'var(--border-gray)',
                      outline: 'none',
                      borderRadius: '12px',
                      borderWidth: '2px',
                      padding: '12px 16px',
                      height: '48px'
                    }}
                    placeholder="Digite seu CPF"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit Error Message */}
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg text-sm"
                    style={{background: 'var(--bg-cream-lighter)', border: '1px solid #ef4444', color: '#ef4444'}}
                  >
                    {submitError}
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'var(--btn-ver-planos-bg)',
                    color: 'var(--btn-ver-planos-text)'
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 rounded-full animate-spin" 
                        style={{borderColor: 'var(--text-light)', borderTopColor: 'transparent'}}></div>
                      <span>Entrando...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Fazer Login</span>
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* Additional Info */}
            <div className="text-center mt-6">
              <p className="text-sm" style={{color: 'var(--text-dark-secondary)'}}>
                Não tem conta? 
                <button 
                  onClick={() => navigate('/checkout')}
                  className="ml-1 font-medium transition-colors duration-200"
                  style={{color: 'var(--text-teal)'}}


                >
                  Contrate um plano
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
      
      {/* 🎉 Popup de Sucesso do Pagamento */}
      <AnimatePresence>
        {showPaymentSuccessPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPaymentSuccessPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative rounded-lg shadow-xl max-w-md w-full mx-4 border"
              onClick={(e) => e.stopPropagation()}
              style={{background: 'var(--bg-teal)'}}
            >
              {/* Header */}
              <div className="flex items-center justify-center p-6 pb-4">
                <div className="text-3xl mb-2">🎉</div>
              </div>
              
              {/* Content */}
              <div className="px-6 pb-6 text-center">
                <h2 className="text-xl font-semibold mb-3 text-[var(--text-light)]">
                  Pagamento Aprovado!
                </h2>
                <p className="text-sm mb-6 text-[var(--text-light)] opacity-90">
                  Seu plano foi contratado com sucesso! Faça login para acessar sua área do cliente.
                </p>
                
                {/* Action */}
                <button
                  onClick={() => setShowPaymentSuccessPopup(false)}
                  className="w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
                  style={{
                    background: 'var(--text-light)',
                    color: 'var(--bg-teal)'
                  }}
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}