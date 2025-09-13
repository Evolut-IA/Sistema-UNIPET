import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Building2,
  HelpCircle,
  Mail,
  MessageCircle,
  UserCog,
  Settings,
  Stethoscope
} from "lucide-react";

const navigation = [
  {
    name: "Principal",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard }
    ]
  },
  {
    name: "Gestão",
    items: [
      { name: "Clientes & Pets", href: "/clients", icon: Users },
      { name: "Guias de Atendimento", href: "/guides", icon: FileText },
      { name: "Planos de Saúde", href: "/plans", icon: CreditCard },
      { name: "Rede Credenciada", href: "/network", icon: Building2 }
    ]
  },
  {
    name: "Suporte",
    items: [
      { name: "FAQ", href: "/faq", icon: HelpCircle },
      { name: "Formulários", href: "/contact-submissions", icon: Mail },
      { name: "Chat IA", href: "/chat", icon: MessageCircle }
    ]
  },
  {
    name: "Sistema",
    items: [
      { name: "Administração", href: "/administration", icon: UserCog },
      { name: "Configurações", href: "/settings", icon: Settings }
    ]
  }
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col h-full bg-container border-r border-border">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Stethoscope className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-titulo">PetSaúde CRM</h1>
            <p className="text-sm text-subtitulo">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-6 pb-6 space-y-6 overflow-y-auto">
        {navigation.map((section) => (
          <div key={section.name}>
            <h3 className="text-xs font-semibold text-subtitulo uppercase tracking-wider mb-3">
              {section.name}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-subtitulo hover:bg-accent hover:text-accent-foreground"
                      )}
                      data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </a>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
