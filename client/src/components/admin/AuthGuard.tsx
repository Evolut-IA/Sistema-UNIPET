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

  // Query para verificar status de autenticação admin usando o fetcher padrão
  const { data: authStatus, isLoading, error } = useQuery<AuthStatusResponse>({
    queryKey: ['/admin/api/auth/status'],
    // Using standard queryClient fetcher that handles 401s globally
    retry: 0, // Não retry em caso de 401
    refetchOnWindowFocus: false, 
    refetchOnMount: true, 
    staleTime: 0, // Sempre buscar dados frescos
    gcTime: 0, // Não manter cache
  });

  // Simplified redirection logic - 401s are handled globally by handleUnauthorized()
  useEffect(() => {
    // Se ainda está carregando, não fazer nada
    if (isLoading) {
      return;
    }

    // Se houver erro e for UNAUTHORIZED, o handleUnauthorized() global já lidou com o redirecionamento
    if (error) {
      if (error.message === 'UNAUTHORIZED') {
        console.log("🔒 [AUTH-GUARD] 401 handled globally, waiting for redirect...");
        return;
      }
      
      // Para outros erros (não-401), redirecionar localmente
      console.error("❌ [AUTH-GUARD] Non-401 authentication error:", error.message);
      navigate("/admin/login");
      return;
    }

    // Se não há dados de auth status ou não está autenticado
    if (!authStatus || !authStatus.authenticated) {
      console.log("🔒 [AUTH-GUARD] Not authenticated, redirecting to admin login");
      navigate("/admin/login");
      return;
    }

    // Verificação final - garantir que temos um admin válido
    if (!authStatus.admin?.login) {
      console.error("❌ [AUTH-GUARD] Invalid admin data, missing login");
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
  console.log("✅ [AUTH-GUARD] User authenticated successfully");

  // Se chegou até aqui, está autenticado - renderizar children
  return <>{children}</>;
}