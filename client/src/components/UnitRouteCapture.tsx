import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import UnitPage from "@/pages/unit-page";
import NotFound from "@/pages/not-found";

export default function UnitRouteCapture() {
  const [location] = useLocation();
  const [isValidUnit, setIsValidUnit] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUnitRoute();
  }, [location]);

  const checkUnitRoute = async () => {
    // Extract slug from current path
    const pathWithoutQuery = location.split('?')[0] || ''; 
    const slug = pathWithoutQuery.substring(1); // Remove leading slash
    
    // Skip if it's a known route
    const knownRoutes = [
      '', 'planos', 'sobre', 'contato', 'faq', 'rede-credenciada', 'rede',
      'politica-privacidade', 'termos-uso', 'checkout', 'customer', 'admin'
    ];
    
    if (knownRoutes.some(route => slug.startsWith(route)) || slug.includes('/')) {
      setIsValidUnit(false);
      setLoading(false);
      return;
    }

    try {
      // Check if this slug corresponds to a valid unit
      const response = await fetch(`/api/network-units/${slug}`);
      const isValid = response.ok;
      setIsValidUnit(isValid);
    } catch (error) {
      console.error("Error checking unit route:", error);
      setIsValidUnit(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isValidUnit) {
    return <UnitPage />;
  }

  return <NotFound />;
}