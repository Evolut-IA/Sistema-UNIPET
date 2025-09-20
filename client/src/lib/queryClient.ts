import { QueryClient } from "@tanstack/react-query";

// Função para gerar timestamp único para evitar cache
function generateCacheBuster(): string {
  return `t=${Date.now()}`;
}

// Função para adicionar headers anti-cache
function addAntiCacheHeaders(headers: HeadersInit = {}): HeadersInit {
  return {
    ...headers,
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Request-Timestamp': Date.now().toString(),
  };
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const text = await res.text();
      let errorMessage = res.statusText;
      
      // Tentar parsear como JSON para extrair a mensagem de erro
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.error || errorData.message || text || res.statusText;
      } catch {
        // Se não for JSON válido, usar o texto diretamente
        errorMessage = text || res.statusText;
      }
      
      throw new Error(errorMessage);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: {
    noCache?: boolean;
    timeout?: number;
  }
): Promise<Response> {
  const { noCache = true, timeout = 10000 } = options || {};
  
  // Adicionar timestamp para evitar cache
  const separator = url.includes('?') ? '&' : '?';
  const cacheBuster = noCache ? `${separator}${generateCacheBuster()}` : '';
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const res = await fetch(`${url}${cacheBuster}`, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        ...(noCache ? addAntiCacheHeaders() : {}),
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false, // Evitar re-fetch desnecessário
      staleTime: 10 * 60 * 1000, // 10 minutos - aumentar stale time
      gcTime: 30 * 60 * 1000, // 30 minutos - aumentar garbage collection
      retry: 1, // Retry apenas 1 vez
      retryDelay: 1000,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Função para limpar cache específico
export function invalidateCache(queryKey: string[]) {
  queryClient.invalidateQueries({ queryKey });
}

// Função para limpar todo o cache
export function clearAllCache() {
  queryClient.clear();
}

// Função para forçar refresh de dados específicos
export function forceRefresh(queryKey: string[]) {
  queryClient.refetchQueries({ queryKey, exact: true });
}
