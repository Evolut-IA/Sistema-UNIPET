import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Global flag to track auth failures and prevent redirect loops
let isRedirectingToLogin = false;

// Variável que será definida após a criação do queryClient
let adminQueryClient: QueryClient;

// Global function to handle 401 errors and redirect to login
function handleUnauthorized() {
  if (isRedirectingToLogin) {
    return; // Evitar múltiplos redirecionamentos
  }
  
  console.log("🔒 [ADMIN-CLIENT] 401 detected - clearing cache and redirecting to login");
  isRedirectingToLogin = true;
  
  // Limpar todo o cache se disponível
  if (adminQueryClient) {
    adminQueryClient.clear();
  }
  
  // Redirecionar para login após um pequeno delay para evitar race conditions
  setTimeout(() => {
    window.location.href = '/admin/login';
    isRedirectingToLogin = false;
  }, 100);
}

// Utility function to ensure API URLs are correctly prefixed for admin
function resolveApiUrl(url: string): string {
  if (url.startsWith('/admin/api/')) {
    return url; // URL já tem o prefixo correto
  }
  if (url.startsWith('/api/')) {
    return `/admin${url}`; // Adiciona prefixo admin se necessário
  }
  return url;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Interceptar 401s globalmente
    if (res.status === 401) {
      handleUnauthorized();
      throw new Error('UNAUTHORIZED');
    }
    
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const resolvedUrl = resolveApiUrl(url);
  const res = await fetch(resolvedUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : null,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // Para respostas com status 204 (No Content), não tentar fazer JSON.parse
  if (res.status === 204) {
    return null;
  }
  
  return await res.json();
}

// Enhanced query function that supports queryKeys with parameters and handles 401s globally
export const getQueryFn: <T>() => QueryFunction<T> =
  () =>
  async ({ queryKey }) => {
    // Handle queryKey format: [path] or [path, params]
    const basePath = queryKey[0] as string;
    const params = queryKey[1] as Record<string, any> | undefined;
    
    // Construct URL with parameters
    let url = basePath;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url = `${basePath}?${searchParams.toString()}`;
    }
    
    const resolvedUrl = resolveApiUrl(url);
    
    console.log(`🔍 [ADMIN-CLIENT] Fetching: ${resolvedUrl}`);
    
    const res = await fetch(resolvedUrl, {
      credentials: "include",
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    console.log(`🔍 [ADMIN-CLIENT] Response status for ${resolvedUrl}: ${res.status}`);

    // Interceptar 401s globalmente - sempre redirecionar para login
    if (res.status === 401) {
      handleUnauthorized();
      throw new Error('UNAUTHORIZED');
    }

    await throwIfResNotOk(res);
    
    // Para respostas com status 204 (No Content), não tentar fazer JSON.parse
    if (res.status === 204) {
      return null;
    }
    
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn(),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos para dados gerais
      gcTime: 10 * 60 * 1000, // 10 minutos
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Definir a referência para o handler global
adminQueryClient = queryClient;

// Configurações específicas para diferentes tipos de dados
export const queryOptions = {
  // Settings change rarely - cache longer
  settings: {
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  },
  // Dashboard data changes more frequently but still cacheable
  dashboard: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  },
  // Real-time data - minimal caching
  realtime: {
    staleTime: 0,
    gcTime: 1 * 60 * 1000, // 1 minuto
  }
};
