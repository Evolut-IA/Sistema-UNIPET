import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

interface AuthStatusResponse {
  authenticated: boolean;
  admin?: {
    login: string;
  };
  error?: string;
}

// Componente de loading global com fallback robusto
function AuthLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{background: 'linear-gradient(to bottom right, var(--bg-teal), var(--bg-teal-dark))'}}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-6" style={{borderColor: 'var(--bg-gold)'}}></div>
        <div className="text-lg" style={{color: 'var(--text-gold)'}}>Verificando autenticação...</div>
      </div>
    </div>
  );
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [, navigate] = useLocation();

  // Query para verificar status de autenticação admin
  const { data: authStatus, isLoading, error } = useQuery<AuthStatusResponse>({
    queryKey: ['/admin/api/auth/status'],
    retry: 1, // Tentar apenas uma vez para evitar loops
    refetchOnWindowFocus: false, // Não refetch automaticamente ao focar janela
    refetchOnMount: true, // Sempre verificar ao montar componente
    staleTime: 0, // Sempre verificar se os dados estão atualizados
    gcTime: 0, // Não manter cache para forçar verificação atual
  });

  // Consolidar todos os redirecionamentos em um único useEffect
  useEffect(() => {
    // Se ainda está carregando, não fazer nada
    if (isLoading) {
      return;
    }

    // Se houver erro na verificação, tratar como não autenticado
    if (error) {
      console.error("❌ [AUTH-GUARD] Authentication check failed:", error);
      navigate("/admin/login");
      return;
    }

    // Se não há dados de auth status, tratar como não autenticado
    if (!authStatus) {
      console.log("🔒 [AUTH-GUARD] No auth status data, redirecting to admin login");
      navigate("/admin/login");
      return;
    }

    // Se obtivemos uma resposta e não está autenticado, redirecionar para login
    if (!authStatus.authenticated) {
      console.log("🔒 [AUTH-GUARD] Not authenticated, redirecting to admin login");
      navigate("/admin/login");
      return;
    }

    // Se chegou até aqui, está autenticado
    console.log("✅ [AUTH-GUARD] User authenticated as:", authStatus.admin?.login);
  }, [authStatus, isLoading, error, navigate]);

  // Mostrar loading durante verificação
  if (isLoading) {
    return <AuthLoading />;
  }

  // Se houver erro ou não está autenticado, mostrar loading enquanto redireciona
  if (error || !authStatus || !authStatus.authenticated) {
    return <AuthLoading />;
  }

  // Se chegou até aqui, está autenticado - renderizar children
  return <>{children}</>;
}