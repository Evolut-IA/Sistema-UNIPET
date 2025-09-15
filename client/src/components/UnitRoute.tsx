import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import UnitDashboard from "@/pages/UnitDashboard";
import NotFound from "@/pages/not-found";

// Component to handle dynamic unit routes
export default function UnitRoute() {
  const [location] = useLocation();
  const [isValidUnit, setIsValidUnit] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUnitRoute();
  }, [location]);

  const checkUnitRoute = async () => {
    // Extract slug from current path
    const slug = location.substring(1); // Remove leading slash
    
    // Skip known admin routes
    const adminRoutes = [
      '', 'clientes', 'pets', 'guias', 'planos', 'rede', 
      'perguntas-frequentes', 'formularios', 'configuracoes', 'administracao'
    ];
    
    if (adminRoutes.includes(slug) || slug.includes('/')) {
      setIsValidUnit(false);
      setLoading(false);
      return;
    }

    try {
      // Check if this slug corresponds to a valid unit
      const response = await fetch(`/api/unit/${slug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setIsValidUnit(data.exists && data.isActive);
      } else {
        setIsValidUnit(false);
      }
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
    return <UnitDashboard />;
  }

  return <NotFound />;
}