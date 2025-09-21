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
}

// Componente de loading global
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

  // Query para verificar autenticação
  const { data: authStatus, isLoading, error } = useQuery<AuthStatusResponse>({
    queryKey: ['/admin/api/auth/status'],
    queryFn: async () => {
      const response = await fetch('/admin/api/auth/status', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Auth check failed');
      }
      return response.json();
    },
    retry: false,
    staleTime: 0
  });

  useEffect(() => {
    if (isLoading) return;

    if (error || !authStatus?.authenticated) {
      console.log("🚀 [AUTH-GUARD] Redirecionando para login - usuário não autenticado");
      window.location.href = "/admin/login";
      return;
    }
  }, [authStatus, isLoading, error, navigate]);

  if (isLoading) {
    return <AuthLoading />;
  }

  if (error || !authStatus?.authenticated) {
    return <AuthLoading />;
  }

  return <>{children}</>;
}