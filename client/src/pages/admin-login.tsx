import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLoginSchema } from "@shared/schema";
import type { z } from "zod";

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    mode: 'onBlur'
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    setSubmitError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/admin/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for session cookies
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Redirecionar para dashboard admin
        navigate('/admin');
      } else {
        setSubmitError(result.error || 'Erro no login');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setSubmitError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-cream-light)'}}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--text-dark-primary)'}}>Área Administrativa</h1>
            <p style={{color: 'var(--text-dark-secondary)'}}>Acesse o painel administrativo</p>
          </div>

          {/* Login Form */}
          <div className="rounded-xl shadow-lg p-8" style={{background: 'var(--bg-cream-lighter)'}}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Login Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium" style={{color: 'var(--text-dark-primary)'}}>
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </label>
                <input
                  type="text"
                  {...register("login")}
                  className="w-full p-3 border rounded-lg transition-all duration-200"
                  style={{
                    borderColor: 'var(--border-gray)',
                    outline: 'none',
                    borderRadius: '12px',
                    borderWidth: '2px',
                    padding: '12px 16px',
                    height: '48px'
                  }}
                  placeholder="Digite seu login"
                  data-testid="input-admin-login"
                />
                {errors.login && (
                  <p className="text-red-500 text-sm mt-1">{errors.login.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium" style={{color: 'var(--text-dark-primary)'}}>
                  <Lock className="w-4 h-4" />
                  <span>Senha</span>
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
                  placeholder="Digite sua senha"
                  data-testid="input-admin-password"
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
                  data-testid="error-message"
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
                data-testid="button-admin-login"
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
                    <span>Acessar Painel</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-6">
            <p className="text-sm" style={{color: 'var(--text-dark-secondary)'}}>
              Sistema de administração - Acesso restrito
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}