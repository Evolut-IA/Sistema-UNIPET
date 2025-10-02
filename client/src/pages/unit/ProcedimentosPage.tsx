import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import UnitLayout from '@/components/unit/UnitLayout';
import UnitProcedures from "@/components/unit/UnitProcedures";

export default function ProcedimentosPage() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, [slug]);

  const checkAuthentication = async () => {
    const token = localStorage.getItem('unit-token');
    const unitSlug = localStorage.getItem('unit-slug');
    
    if (!token || unitSlug !== slug) {
      setLocation(`/${slug}`);
      return;
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-cream-light)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0e7074] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <UnitLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900">Procedimentos</h1>
          <p className="text-gray-500 mt-1">Visualize todos os procedimentos disponíveis</p>
        </div>
        
        <UnitProcedures unitSlug={slug || ''} />
      </div>
    </UnitLayout>
  );
}