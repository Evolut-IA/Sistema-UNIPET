# UNIPET PLAN - Pet Health Plan System

## Overview
UNIPET PLAN is a comprehensive pet health plan management system designed to streamline pet insurance plan administration, customer relationships, and healthcare network unit management. It features a customer-facing website for plan selection and quote requests, alongside an admin dashboard for content and business management. The system is built with a full-stack TypeScript solution, utilizing a React frontend, Express.js backend, and PostgreSQL database. The project emphasizes security, performance, and scalability, aiming to simplify pet healthcare administration and improve user experience.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
-   **Framework**: React 18 with TypeScript and Vite.
-   **Routing**: Wouter.
-   **UI/UX**: Tailwind CSS, Radix UI components, shadcn/ui styling.
-   **State Management**: TanStack React Query.
-   **Forms**: React Hook Form with Zod validation.
-   **Animation**: Framer Motion.
-   **Performance**: Code splitting, lazy loading, optimized bundle sizes.

### Backend
-   **Runtime**: Node.js with Express.js.
-   **Language**: TypeScript with ES modules.
-   **Database ORM**: Drizzle ORM.
-   **Authentication**: Express sessions, bcrypt, JWT.
-   **Security**: Helmet, CORS, rate limiting, input sanitization.
-   **File Handling**: Supabase Storage integration with Sharp for image processing (resizing, compression).
-   **API Design**: RESTful with structured error handling.
-   **Performance**: Connection pooling, query optimization, response compression.

### Database
-   **Type**: PostgreSQL with connection pooling.
-   **Schema Management**: Drizzle migrations.
-   **Core Tables**: Contact submissions, plans, network units, FAQ, site settings, chat settings, clients, pets, contracts, payments.
-   **Data Integrity**: UUID primary keys, foreign key relationships, constraint validation.

### Authentication & Authorization
-   **Admin Authentication**: Session-based.
-   **Rate Limiting**: IP-based for login and API.
-   **Security Middleware**: CSRF, XSS, SQL injection prevention.
-   **Session Management**: Secure, configured for expiration.
-   **Development Bypasses**: Strictly conditional on `NODE_ENV === 'development'` for all admin routes.

### Image Management
-   **Storage**: Supabase Storage for network unit and site settings images.
-   **Processing**: Sharp for compression and resizing (1200x800, JPEG conversion, 90% quality).
-   **Public Accessibility**: Images served via Supabase CDN URLs.

### Security Implementation
-   **Input Validation**: Zod schemas.
-   **Data Sanitization**: XSS and SQL injection protection.
-   **HTTPS**: SSL/TLS enforcement.
-   **Error Handling**: Structured, without sensitive data.

### Deployment Configuration
-   **Build System**: Separate client/server builds.
-   **Environment**: Node.js 18+.
-   **Process Management**: Health checks, graceful shutdown.

### Feature Specifications
-   **FAQ Management**: Admin interface for creating, updating, deleting, and toggling status of FAQ items. Public pages only display active FAQs. Deletion requires password confirmation.
-   **Site Settings Management**: Admin configuration for site-wide settings, including image uploads (main, network, about) handled by Supabase Storage. Form uses one-time initialization pattern to preserve user uploads - the form is initialized ONCE on page load and never auto-resets, preventing uploaded image URLs from being overwritten by cache invalidations. Changes reflect on public pages after save and page refresh.
-   **Network Unit Management**: Admin interface for creating, editing, and toggling status of network units. Supports image uploads to Supabase Storage and includes a 'cidade' (city) field. Deletion requires password confirmation.
-   **Procedures Management**: Admin interface for managing procedures with password-protected deletion.
-   **Client Management**: Admin interface for creating and editing clients. In the 'Editar Cliente' page, pets can be added and edited but not deleted from the client view - pet management (including deletion) is handled separately through dedicated pet management pages.
-   **Brazilian Phone Formatting**: Consistent display formatting for all phone numbers across the admin interface (e.g., +55 (XX) XXXXX-XXXX).
-   **Responsive Layouts**: Dynamic grid adjustments for plan displays and content sections, ensuring consistent card sizing and proper centering.
-   **Image Conditional Rendering**: Public pages (hero, features, about) only display images when configured in admin settings - no hardcoded fallback images.
-   **Copy to Clipboard**: Detail popups (Payments, Contracts, Network Units) include a "Copiar" button to copy formatted information to clipboard with visual feedback (idle → copying → copied states).
-   **Password-Protected Deletions**: All admin deletion operations (FAQ, Procedures, Network Units, Administration users) require password verification via backend endpoint before execution.

## External Dependencies

-   **React Ecosystem**: React, React DOM, React Hook Form, TanStack React Query.
-   **UI Components**: Radix UI, Lucide React, Tailwind CSS.
-   **Backend Framework**: Express.js.
-   **Database**: PostgreSQL, Drizzle ORM, pg driver.
-   **Authentication**: bcryptjs, express-session, jsonwebtoken.
-   **Image Processing**: Sharp.
-   **Validation**: Zod.
-   **Security**: Helmet, CORS, express-rate-limit, connect-pg-simple.
-   **Compression**: compression middleware.
-   **Payment Gateway**: Cielo E-commerce.
-   **Address Lookup**: ViaCEP (for Brazilian postal codes).
-   **Deployment Platform**: EasyPanel with Heroku-compatible buildpacks.
-   **Cloud Storage**: Supabase Storage (for pet images and payment receipts).