import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import UnitLayout from '@/components/unit/UnitLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Users, ClipboardList } from "lucide-react";
import UnitGuides from "@/components/unit/UnitGuides";
import UnitClients from "@/components/unit/UnitClients";
import UnitProcedures from "@/components/unit/UnitProcedures";

export default function UnitDashboard() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('guides');

  useEffect(() => {
    checkAuthentication();
    
    // Handle hash changes for navigation
    const hash = window.location.hash.replace('#', '');
    if (hash && ['guias', 'clientes', 'procedimentos'].includes(hash)) {
      if (hash === 'guias') setActiveTab('guides');
      else if (hash === 'clientes') setActiveTab('clients');
      else if (hash === 'procedimentos') setActiveTab('procedures');
    }
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
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900">Portal da Unidade</h1>
          <p className="text-gray-500 mt-1">Visualize todas as guias geradas pelas unidades da rede</p>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white shadow-sm rounded-lg p-1">
            <TabsTrigger value="guides" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Guias de Atendimento
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clientes & Pets
            </TabsTrigger>
            <TabsTrigger value="procedures" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Procedimentos
            </TabsTrigger>
          </TabsList>

          {/* Guides Tab */}
          <TabsContent value="guides" className="mt-0">
            <UnitGuides unitSlug={slug || ''} />
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="mt-0">
            <UnitClients unitSlug={slug || ''} />
          </TabsContent>

          {/* Procedures Tab */}
          <TabsContent value="procedures" className="mt-0">
            <UnitProcedures unitSlug={slug || ''} />
          </TabsContent>
        </Tabs>
      </div>
    </UnitLayout>
  );
}