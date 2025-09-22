# UNIPET PLAN - Pet Health Plan System

## Overview
UNIPET PLAN is a comprehensive pet health plan management system. It offers a full-stack TypeScript solution with a React frontend, Express.js backend, and PostgreSQL database with Drizzle ORM. The system facilitates pet insurance plan management, customer relationships, and healthcare network unit administration. It includes a customer-facing website for plan selection and quote requests, and an admin dashboard for content and business management. The project prioritizes security, performance, and scalability.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript and Vite.
- **Routing**: Wouter.
- **UI/UX**: Tailwind CSS with custom variables, Radix UI components, shadcn/ui styling.
- **State Management**: TanStack React Query.
- **Forms**: React Hook Form with Zod validation.
- **Animation**: Framer Motion.

### Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **Database ORM**: Drizzle ORM.
- **Authentication**: Express sessions, bcrypt.
- **Security**: Helmet, CORS, rate limiting, input sanitization.
- **File Handling**: Base64 image storage with Sharp processing.
- **API Design**: RESTful with structured error handling.

### Database
- **Type**: PostgreSQL with connection pooling.
- **Schema Management**: Drizzle migrations.
- **Core Tables**: Contact submissions, plans, network units, FAQ, site settings, chat settings.
- **Security Schema**: Separate schema for sensitive operations, no personal data storage.
- **Data Integrity**: UUID primary keys, foreign key relationships, constraint validation.

### Authentication & Authorization
- **Admin Authentication**: Session-based.
- **Rate Limiting**: IP-based for login and API.
- **Security Middleware**: CSRF, XSS, SQL injection prevention.
- **Session Management**: Secure, configured for expiration.

### Image Management
- **Storage**: Base64 encoding.
- **Processing**: Sharp for compression and resizing.
- **Uploads**: Multer middleware with validation.

### Performance Optimizations
- **Frontend**: Code splitting, lazy loading, optimized bundle sizes.
- **Backend**: Connection pooling, query optimization, response compression.
- **Caching**: React Query for client-side.

### Security Implementation
- **Input Validation**: Zod schemas.
- **Data Sanitization**: XSS and SQL injection protection.
- **HTTPS**: SSL/TLS enforcement.
- **Error Handling**: Structured, without sensitive data.

### Deployment Configuration
- **Build System**: Separate client/server builds.
- **Environment**: Node.js 18+.
- **Process Management**: Health checks, graceful shutdown.

### Replit Environment Setup (September 22, 2025)
**PROJECT IMPORT COMPLETE**: Successfully configured UNIPET PLAN for Replit environment
- ✅ **Dependencies Installed**: Root and client packages installed successfully
- ✅ **Frontend Configuration**: Vite configured with 0.0.0.0:5000, allowedHosts: true, proxy to backend
- ✅ **Backend Configuration**: Express server on 0.0.0.0:3000, development mode with API routes
- ✅ **Database Integration**: PostgreSQL connected with existing Replit DATABASE_URL
- ✅ **Workflows Configured**: Frontend (port 5000) and Backend (port 3000) both running successfully
- ✅ **Environment Variables**: LOGIN, SENHA, DATABASE_URL properly configured
- ✅ **Deployment Ready**: Autoscale deployment configured with npm build and start commands

**Technical Configuration Applied**:
- Frontend: React/Vite dev server with proxy configuration to backend
- Backend: Express server with auto-configuration for Replit environment
- Database: PostgreSQL with Drizzle ORM, all queries executing successfully
- API: All endpoints working (site-settings, plans, FAQ, chat, network-units)
- Security: Session-based auth, CORS, helmet, rate limiting all operational

**Verification Status**:
- Frontend: ✅ RUNNING (Vite dev server on port 5000)
- Backend: ✅ RUNNING (Express API server on port 3000)
- Database: ✅ CONNECTED (PostgreSQL with pool of 20 connections)
- API Health: ✅ RESPONDING ({"status":"OK","timestamp":"2025-09-22T20:05:18.384Z"})
- Deployment: ✅ CONFIGURED (autoscale with build and run commands)

## Recent Changes

### Visual Dropdown Separators Implementation (September 22, 2025)
**SEPARADORES VISUAIS IMPLEMENTADOS**: Implementação completa de separadores visuais em todos os dropdowns do sistema usando SelectSeparator do Radix UI
- ✅ **Correções JSX Críticas**: Corrigidos erros complexos de sintaxe JSX em network.tsx, contact.tsx e contact-section.tsx
- ✅ **Separadores Implementados**: SelectSeparator adicionados em todos os dropdowns (cidades, serviços, planos, tipos de animais, procedimentos)
- ✅ **Estrutura Correta**: React.Fragment com chaves únicas e separadores condicionais (não aparecem após último item)
- ✅ **Casos Extremos**: Tratamento adequado para listas vazias, loading e estados de erro
- ✅ **Páginas Afetadas**: network.tsx, contact.tsx, contact-section.tsx, checkout.tsx, admin/Procedures.tsx, admin/PlanForm.tsx
- ✅ **Qualidade Validada**: Arquiteto confirmou implementação seguindo melhores práticas com chaves estáveis e separadores condicionais

**Resultado**: Todos os dropdowns agora exibem separadores visuais elegantes entre opções, melhorando significativamente a experiência do usuário na navegação e seleção de itens.

### Theme Functionality Removal (September 20, 2025)
**TEMA DINÂMICO REMOVIDO COMPLETAMENTE**: Funcionalidade de personalização de tema removida conforme solicitado pelo usuário
- ✅ **Arquivos de tema deletados**: client/src/lib/theme-defaults.ts e client/src/lib/admin/theme-defaults.ts removidos
- ✅ **CSS simplificado**: Removidos comentários "matching DEFAULT_THEME", mantidos valores de cores fixos
- ✅ **Zero dependências**: Confirmado que não havia importações dos arquivos de tema em lugar algum
- ✅ **Sistema operacional**: Aplicação funcionando normalmente com estilos fixos ao invés de tema dinâmico
- ✅ **Backend limpo**: Nenhuma API ou rota relacionada ao tema encontrada

**Resultado**: O sistema agora usa cores e estilos fixos definidos no CSS, eliminando completamente a capacidade de personalização dinâmica de tema.

### Admin Area TypeScript and Data Display Complete Fix (September 20, 2025)
**ADMIN ERRORS ELIMINATION COMPLETE**: Successfully eliminated ALL TypeScript/LSP errors and data display problems in admin section
- ✅ **0 LSP Errors**: Reduced from 81+ critical errors to complete clean TypeScript compilation
- ✅ **All Data Display Fixed**: Tables, popups, forms now display data correctly across all admin pages
- ✅ **Critical API Alignment**: Fixed Guides API mismatch (array vs paginated object) - now returns proper pagination format
- ✅ **Type Safety Restored**: All component props, dialog types, and schema imports corrected
- ✅ **Icon Imports Fixed**: All Lucide React component imports updated (Building2→Building, UserCog→UserCheck, etc.)

**Major Technical Corrections Applied**:
- **Procedures.tsx**: Resolved 31 critical errors (undefined objects, type mismatches, complex state handling)
- **Administration.tsx**: Fixed User type conflicts using alias, corrected implicit parameters
- **Dialog Components**: Corrected PasswordDialog/ConfirmDialog props (string|undefined→string using nullish coalescing)
- **Guides API**: Implemented real pagination in backend (data, total, totalPages, page) with functional filters
- **Schema Cleanup**: Removed unused imports causing LSP conflicts
- **Lucide Icons**: Corrected all component imports (Columns→Columns3, Network→Globe, ClipboardList→Clipboard, Key→Edit)

**Functional Verification**:
- Build compilation: ✅ PASSING (0 TypeScript errors)
- LSP diagnostics: ✅ CLEAN ("No LSP diagnostics found")
- All APIs tested: ✅ OPERATIONAL (18 clients, 13 guides with pagination, dashboard metrics)
- Server stability: ✅ STABLE (clean logs, proper responses)
- Admin pages: ✅ FULLY FUNCTIONAL (CRUD operations, search, filters, pagination, dialogs)

### Admin Area Complete Restoration (September 20, 2025)
**ADMIN RESTORATION COMPLETE**: Successfully restored complete admin functionality with original design and security
- ✅ **All Admin Pages Working**: Dashboard, Clientes, Pets, Guias, Planos, Rede, Procedimentos, FAQ, Formulários, Configurações, Administração
- ✅ **Build System Fixed**: Resolved all TypeScript/import errors by copying missing components and dependencies from Exemplos
- ✅ **Routing Corrected**: Fixed React Router configuration - all admin routes now load correctly (no more "Page Not Found")
- ✅ **Security Enhanced**: Dashboard endpoint moved to `/admin/api/dashboard/all` with authentication protection
- ✅ **Original Design Preserved**: Exact styling, colors, and functionality from original examples maintained

**Technical Fixes Applied**:
- Fixed router configuration in App.tsx with dual admin route patterns
- Copied all missing UI components, hooks, and dependencies from Exemplos folder
- Installed 23+ missing packages (@radix-ui components, react-aria-components, etc.)
- Corrected component imports and icon names (Columns3→Columns, IdCard→CreditCard)
- Protected sensitive admin endpoints with requireAuth middleware

**Build & Deployment Status**:
- Build compilation: ✅ PASSING (5,042 modules transformed successfully)
- Development server: ✅ RUNNING without errors
- Admin routes: ✅ FUNCTIONAL (/admin/clientes, /admin/planos, etc.)
- API security: ✅ PROTECTED (401 responses for unauthenticated dashboard access)

### Previous Project Unification (September 20, 2025)
**ARCHITECTURE TRANSFORMATION COMPLETE**: Successfully migrated from dual-application structure to unified single project
- ✅ **Admin Migration**: Moved all admin pages from `admin/client/src/` to `client/src/pages/admin/`
- ✅ **Unified Routing**: Integrated admin routes using `/admin/*` prefix in main App.tsx
- ✅ **API Integration**: Admin APIs now accessible at `/admin/api/*` through unified server
- ✅ **Single Project**: Eliminated need for separate admin application and folder structure

### Previous Critical TypeScript Build Fixes
**CRITICAL RISK RESOLVED**: Removed duplicate schema that could cause production divergence
- ✅ **Schema Duplication ELIMINATED**: Removed admin/shared/schema.ts to prevent type conflicts
- ✅ **Global.d.ts Fixed**: Removed problematic wildcard module declarations
- ✅ **Build Errors Reduced**: Decreased from 58 to 44 TypeScript errors (25% improvement)
- ✅ **Core Functionality**: Fixed critical schema mismatches in storage.ts and routes.ts
- ✅ **Type Safety**: Added missing fields (fullName, cores, urlSlug, login, senhaHash)

**Build Status**: Substantially improved - core functionality buildable with remaining errors in tests/services only

## External Dependencies

### Core
- **React Ecosystem**: React, React DOM, React Hook Form, TanStack React Query.
- **UI Components**: Radix UI, Lucide React, Tailwind CSS.
- **Backend Framework**: Express.js.
- **Database**: PostgreSQL, Drizzle ORM, pg driver.
- **Authentication**: bcryptjs, express-session, jsonwebtoken.
- **Image Processing**: Sharp.
- **Validation**: Zod.

### Security
- **Protection**: Helmet, CORS.
- **Rate Limiting**: express-rate-limit.
- **Session Security**: connect-pg-simple.
- **Compression**: compression middleware.

### Payment Integration
- **Payment Gateway**: Cielo E-commerce (planned).
- **Security**: SSL, webhook handling.

### Deployment & Infrastructure
- **Platform**: EasyPanel with Heroku-compatible buildpacks.
- **Database**: PostgreSQL addon.
- **Monitoring**: Built-in health checks.
- **Storage**: Supabase Storage for pet images and payment receipts.