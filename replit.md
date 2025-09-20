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

## Recent Changes

### Project Unification Successfully Completed (September 20, 2025)
**ARCHITECTURE TRANSFORMATION COMPLETE**: Successfully migrated from dual-application structure to unified single project
- ✅ **Admin Migration**: Moved all admin pages from `admin/client/src/` to `client/src/pages/admin/`
- ✅ **Unified Routing**: Integrated admin routes using `/admin/*` prefix in main App.tsx
- ✅ **API Integration**: Admin APIs now accessible at `/admin/api/*` through unified server
- ✅ **Single Project**: Eliminated need for separate admin application and folder structure
- ✅ **Preserved Functionality**: All admin features working with database connectivity confirmed

**Architecture Improvements**:
- Single unified Express server serving both public and admin applications
- Admin frontend integrated into main React application with proper route segregation
- Simplified development workflow with single build process
- Maintained security boundaries with admin-specific middleware and authentication

**Technical Implementation**:
- Used WouterRouter with `base="/admin"` for proper route scoping
- Updated all admin API calls to use `/admin/api/*` endpoints
- Removed duplicate admin application folder and build artifacts
- Ensured admin components use dedicated AdminLayout and styling

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