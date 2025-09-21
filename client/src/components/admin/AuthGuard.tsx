import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

interface AuthStatusResponse {
  authenticated: boolean;
  admin?: {
    login: string;
  };
}

// Session storage keys for caching
const AUTH_CACHE_KEY = 'admin_auth_status';
const AUTH_CACHE_TIMESTAMP_KEY = 'admin_auth_timestamp';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache duration

// Memory cache to avoid multiple checks in the same session
let memoryAuthCache: { authenticated: boolean; timestamp: number } | null = null;

// Track if this is the initial auth check for the session
let isInitialAuthCheck = true;

// Componente de loading global - apenas para verificação inicial
function AuthLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{background: 'linear-gradient(to bottom right, var(--bg-teal), var(--bg-teal-dark))'}}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin mx-auto mb-6"></div>
        <div className="text-lg text-white">Verificando autenticação...</div>
      </div>
    </div>
  );
}

// Utility functions for session storage cache
const getCachedAuthStatus = (): AuthStatusResponse | null => {
  try {
    const cached = sessionStorage.getItem(AUTH_CACHE_KEY);
    const timestamp = sessionStorage.getItem(AUTH_CACHE_TIMESTAMP_KEY);
    
    if (!cached || !timestamp) return null;
    
    const age = Date.now() - parseInt(timestamp);
    if (age > CACHE_DURATION) {
      // Cache expired
      sessionStorage.removeItem(AUTH_CACHE_KEY);
      sessionStorage.removeItem(AUTH_CACHE_TIMESTAMP_KEY);
      return null;
    }
    
    return JSON.parse(cached);
  } catch {
    return null;
  }
};

const setCachedAuthStatus = (status: AuthStatusResponse) => {
  try {
    sessionStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(status));
    sessionStorage.setItem(AUTH_CACHE_TIMESTAMP_KEY, Date.now().toString());
    
    // Update memory cache as well
    memoryAuthCache = {
      authenticated: status.authenticated,
      timestamp: Date.now()
    };
  } catch {
    // Silently fail if sessionStorage is not available
  }
};

const clearAuthCache = () => {
  try {
    sessionStorage.removeItem(AUTH_CACHE_KEY);
    sessionStorage.removeItem(AUTH_CACHE_TIMESTAMP_KEY);
    memoryAuthCache = null;
  } catch {
    // Silently fail if sessionStorage is not available
  }
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const [, navigate] = useLocation();
  const [showLoading, setShowLoading] = useState(false);
  const hasRedirected = useRef(false);

  // Check memory cache first for instant response on subsequent navigations
  const getMemoryCachedAuth = (): AuthStatusResponse | null => {
    if (!memoryAuthCache) return null;
    
    const age = Date.now() - memoryAuthCache.timestamp;
    if (age > CACHE_DURATION) {
      memoryAuthCache = null;
      return null;
    }
    
    return { 
      authenticated: memoryAuthCache.authenticated,
      admin: memoryAuthCache.authenticated ? { login: 'admin' } : undefined
    };
  };

  // Get initial data from cache
  const initialData = getCachedAuthStatus() || getMemoryCachedAuth();
  
  // Query para verificar autenticação com caching otimizado
  const { data: authStatus, isLoading, error, isFetching } = useQuery<AuthStatusResponse>({
    queryKey: ['/admin/api/auth/status'],
    queryFn: async () => {
      const response = await fetch('/admin/api/auth/status', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Auth check failed');
      }
      const result = await response.json();
      
      // Cache the successful result
      if (result.authenticated) {
        setCachedAuthStatus(result);
      } else {
        clearAuthCache();
      }
      
      return result;
    },
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes - data is considered fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Do refetch on mount for security
    initialData, // Use cached data as initial data
    placeholderData: initialData, // Use cached data as placeholder while fetching
  });

  // Handle loading state - only show loading on initial check or when no cached data
  useEffect(() => {
    const shouldShowLoading = isLoading && !authStatus && isInitialAuthCheck;
    setShowLoading(shouldShowLoading);
    
    if (!isLoading) {
      isInitialAuthCheck = false;
    }
  }, [isLoading, authStatus]);

  // Handle authentication status
  useEffect(() => {
    // Skip if still loading and we don't have any data
    if (isLoading && !authStatus) return;
    
    // Prevent multiple redirects
    if (hasRedirected.current) return;

    if (error || !authStatus?.authenticated) {
      console.log("🚀 [AUTH-GUARD] Redirecionando para login - usuário não autenticado");
      clearAuthCache(); // Clear any stale cache
      hasRedirected.current = true;
      window.location.href = "/admin/login";
      return;
    }
  }, [authStatus, isLoading, error, navigate]);

  // Background indicator for when auth is being refetched (optional)
  const showBackgroundRefresh = isFetching && authStatus?.authenticated && !isLoading;

  // Show loading only on initial auth check when no cached data is available
  if (showLoading) {
    return <AuthLoading />;
  }

  // If we have auth data (from cache or query) and user is not authenticated, show loading while redirecting
  if (error || (authStatus && !authStatus.authenticated)) {
    return <AuthLoading />;
  }

  // If we have cached data showing user is authenticated, render children immediately
  // even if background refetch is happening
  if (authStatus?.authenticated) {
    return (
      <>
        {/* Optional: Show subtle background refresh indicator */}
        {showBackgroundRefresh && (
          <div className="fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-sm rounded-full p-2">
            <div className="w-4 h-4 border-2 border-t-transparent border-teal-600 rounded-full animate-spin"></div>
          </div>
        )}
        {children}
      </>
    );
  }

  // Fallback loading state (should rarely be reached with caching)
  return <AuthLoading />;
}