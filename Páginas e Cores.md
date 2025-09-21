📄 PÁGINAS DO PROJETO (35 total)
Área Pública (13 páginas)
/ - Home (página inicial)
/planos - Planos de saúde
/sobre - Sobre a empresa
/contato - Formulário de contato
/faq - Perguntas frequentes
/rede-credenciada - Rede credenciada
/rede - Rede (alternativa)
/politica-privacidade - Política de privacidade
/termos-uso - Termos de uso
/checkout/:planId - Checkout de planos
/checkout/success - Sucesso do checkout
/telemedicine - Telemedicina
/not-found - Página não encontrada
Área do Cliente (8 páginas)
/customer/login - Login do cliente
/customer/dashboard - Dashboard do cliente
/customer/pets - Pets do cliente
/customer/profile - Perfil do cliente
/customer/surveys - Pesquisas do cliente
/customer/coparticipation - Coparticipação
/customer/financial - Financeiro do cliente
/customer/telemedicine - Telemedicina do cliente
Área Administrativa (14 páginas)
/admin/login - Login administrativo
/admin/ - Dashboard principal
/admin/clientes - Gestão de clientes
/admin/clientes/novo - Novo cliente
/admin/clientes/:id/editar - Editar cliente
/admin/clientes/:clientId/pets/novo - Novo pet
/admin/pets/:id/editar - Editar pet
/admin/guias - Gestão de guias
/admin/guias/novo - Nova guia
/admin/guias/:id/editar - Editar guia
/admin/planos - Gestão de planos
/admin/planos/novo - Novo plano
/admin/planos/:id/editar - Editar plano
/admin/rede - Gestão da rede
/admin/rede/novo - Nova unidade da rede
/admin/rede/:id/editar - Editar unidade
/admin/procedimentos - Procedimentos
/admin/perguntas-frequentes - FAQ administrativo
/admin/formularios - Submissões de contato
/admin/configuracoes - Configurações
/admin/administracao - Administração
/admin/unidade/:slug - Dashboard da unidade
/admin/not-found - Página não encontrada admin
🔗 POPUPS/MODAIS DO PROJETO
Dialogs de Confirmação
ConfirmDialog - Dialog de confirmação de exclusão

Localização: client/src/components/ui/confirm-dialog.tsx e client/src/components/admin/ui/confirm-dialog.tsx
Uso: Confirmar exclusões e ações destrutivas
Gatilho: Botões de excluir/deletar
PasswordDialog - Dialog de verificação de senha

Localização: client/src/components/ui/password-dialog.tsx e client/src/components/admin/ui/password-dialog.tsx
Uso: Autenticação para ações sensíveis
Gatilho: Ações que requerem verificação
ConfirmationModal - Modal de confirmação customizado

Localização: client/src/components/ui/confirmation-modal.tsx
Uso: Confirmações gerais com portal
Gatilho: Várias ações que precisam confirmação
Dialogs Principais
Dialog - Dialog base do sistema

Localização: client/src/components/ui/dialog.tsx e client/src/components/admin/ui/dialog.tsx
Uso: Base para todos os dialogs
Gatilho: Usado por outros componentes
AlertDialog - Dialog de alerta

Localização: client/src/components/ui/alert-dialog.tsx e client/src/components/admin/ui/alert-dialog.tsx
Uso: Alertas e avisos importantes
Gatilho: Situações de erro ou aviso
Componentes Responsivos
Drawer - Gaveta responsiva

Localização: client/src/components/ui/drawer.tsx
Uso: Painel lateral para mobile
Gatilho: Menus e formulários em mobile
ResponsivePopover - Popover inteligente

Localização: client/src/components/ui/responsive-popup-demo.tsx
Uso: Popover que vira drawer em mobile
Gatilho: Menus e ações contextuais
Sheet - Painel lateral

Localização: Referenciado no demo
Uso: Formulários e conteúdo lateral
Gatilho: Ações que precisam de espaço
Componentes de Navegação e Interface
DropdownMenu - Menu suspenso

Localização: client/src/components/ui/dropdown-menu.tsx
Uso: Menus de ações e navegação
Gatilho: Botões com múltiplas opções
Tooltip - Dica de ferramenta

Localização: client/src/components/ui/tooltip.tsx
Uso: Informações contextuais
Gatilho: Hover sobre elementos
Toast - Notificações

Localização: client/src/components/ui/toast.tsx e client/src/components/ui/toaster.tsx
Uso: Notificações temporárias
Gatilho: Ações realizadas com sucesso/erro
Command - Paleta de comandos

Localização: client/src/components/ui/command.tsx
Uso: Busca e seleção rápida
Gatilho: Ctrl+K ou botões específicos
Select - Seletor personalizado

Localização: client/src/components/ui/select.tsx
Uso: Campos de seleção
Gatilho: Clique em campos select
Demo e Exemplos
ResponsivePopupDemo - Demonstração de popups
Localização: client/src/components/ui/responsive-popup-demo.tsx e client/src/components/admin/ui/responsive-popup-demo.tsx
Uso: Teste e demonstração dos componentes
Gatilho: Página de demonstração
📊 RESUMO
Total de Páginas: 35
Total de Tipos de Popup: 14
Áreas: Pública, Cliente, Administrativa
Framework de Roteamento: Wouter
Framework de UI: Radix UI + Tailwind CSS
Responsividade: Todos os popups são responsivos com adaptação para mobile


Relatório de Fontes de Cores - Páginas e Popups
📋 SISTEMA DE CORES GERAL
Arquivos de Base:
client/cores.css - Sistema principal com 73+ variáveis CSS customizadas
client/src/admin.css - Cores específicas para área administrativa
client/tailwind.config.js - Configuração do Tailwind CSS que mapeia variáveis para classes
client/src/styles/admin-input-fix.css - Correções específicas para inputs da admin
client/src/styles/chat-scrollbar.css - Cores do scrollbar personalizado do chat
client/src/styles/faq-line-breaks.css - Estilos específicos para FAQ
🌍 PÁGINAS PÚBLICAS
Página Inicial (/)
Fontes de Cores:

client/cores.css - Cores principais (--bg-teal, --bg-cream-light, --text-light)
client/tailwind.config.js - Mapeamento para classes Tailwind (bg-primary, text-foreground)
Exemplo de uso: style={{background: 'var(--bg-cream-lighter)'}}
Planos (/planos)
Fontes de Cores:

client/cores.css - Variáveis de botões (--btn-ver-planos-bg, --btn-cotacao-gratuita-bg)
client/tailwind.config.js - Classes Tailwind (bg-teal, text-primary)
Checkout (/checkout/:planId)
Fontes de Cores:

client/cores.css - Extenso uso de variáveis (--bg-cream-lighter, --bg-teal)
client/tailwind.config.js - Classes Tailwind personalizadas
FAQ (/faq)
Fontes de Cores:

client/cores.css - Cores base
client/src/styles/faq-line-breaks.css - Estilos específicos (usa --bg-cream-light, --border-gray)
🔧 ÁREA ADMINISTRATIVA
Todas as páginas Admin (/admin/*)**
Fontes de Cores:

client/src/admin.css - Sistema completo admin (sobrescreve cores.css)
client/src/styles/admin-input-fix.css - Correções específicas de inputs
client/tailwind.config.js - Mapeamento base
Cores específicas admin:

--primary: #277677 (teal principal)
--chart-1 a --chart-5 para gráficos
--sidebar-* para cores da barra lateral
--admin-div-bg: #e0e0e0 para backgrounds
🔗 POPUPS E MODAIS
ConfirmDialog, PasswordDialog, ConfirmationModal
Fontes de Cores:

client/cores.css - Cores destrutivas (--destructive, --destructive-foreground)
client/src/admin.css - Override para versões admin
Cores inline específicas: var(--bg-teal), var(--text-light), var(--bg-gold)
Drawer, Sheet, ResponsivePopover
Fontes de Cores:

client/cores.css - Cores de overlay (--background, --muted, --popover)
client/tailwind.config.js - Classes responsivas
Toast, Tooltip, DropdownMenu
Fontes de Cores:

client/cores.css - Cores de feedback e navegação
client/tailwind.config.js - Classes específicas
🎨 RESUMO DAS FONTES PRINCIPAIS
Hierarquia de Cores:
client/cores.css - Arquivo mestre (usado em páginas públicas e cliente)
client/src/admin.css - Override completo para área administrativa
client/tailwind.config.js - Mapeamento para classes Tailwind
Arquivos específicos - Correções e estilos especializados
Aplicação por Área:
Páginas públicas: cores.css + Tailwind
Área cliente: cores.css + classes específicas
Área admin: admin.css sobrescreve + correções específicas
Popups: Combinação de variáveis inline + arquivos base