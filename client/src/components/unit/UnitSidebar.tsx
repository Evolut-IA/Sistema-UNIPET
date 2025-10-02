import { Link, useLocation } from "wouter";
import { useParams } from "wouter";
import { cn } from "@/lib/admin/utils";
import {
  Home,
  Users,
  FileText,
  ClipboardList,
  LogOut
} from "lucide-react";

export default function UnitSidebar() {
  const [location] = useLocation();
  const { slug } = useParams();
  const unitName = localStorage.getItem('unit-name') || 'Unidade';
  
  const navigation = [
    {
      name: "Principal",
      items: [
        { name: "Dashboard", href: `/unit/${slug}/dashboard`, icon: Home }
      ]
    },
    {
      name: "Gestão",
      items: [
        { name: "Guias de Atendimento", href: `/unit/${slug}/dashboard#guias`, icon: FileText },
        { name: "Clientes & Pets", href: `/unit/${slug}/dashboard#clientes`, icon: Users },
        { name: "Procedimentos", href: `/unit/${slug}/dashboard#procedimentos`, icon: ClipboardList }
      ]
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('unit-token');
    localStorage.removeItem('unit-slug');
    localStorage.removeItem('unit-name');
    window.location.href = `/${slug}`;
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#eaeaea]">
      {/* Logo */}
      <div className="p-6 border-b border-[#eaeaea]">
        <h1 className="text-lg font-bold text-[#2d3748]">SISTEMA UNIPET</h1>
        <p className="text-xs text-gray-500 mt-1">Plano de Saúde Pet</p>
      </div>

      {/* Unit Name */}
      <div className="px-6 py-3 bg-gray-50 border-b border-[#eaeaea]">
        <p className="text-sm font-medium text-gray-700 truncate">{unitName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navigation.map((section) => (
          <div key={section.name}>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.name}
            </h3>
            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || 
                               (item.href.includes('#') && location.includes(item.href.split('#')[0]));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-[#e6f7f7] text-[#0e7074]"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    <Icon 
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                        isActive
                          ? "text-[#0e7074]"
                          : "text-gray-400 group-hover:text-gray-500"
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-[#eaeaea]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );
}