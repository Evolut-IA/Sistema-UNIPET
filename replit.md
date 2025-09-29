# UNIPET PLAN - Pet Health Plan System

## Overview
UNIPET PLAN is a comprehensive pet health plan management system designed to streamline pet insurance plan management, customer relationships, and healthcare network unit administration. It features a customer-facing website for plan selection and quote requests, alongside an admin dashboard for content and business management. The system is built with a full-stack TypeScript solution, utilizing a React frontend, Express.js backend, and PostgreSQL database with Drizzle ORM. The project emphasizes security, performance, and scalability, aiming to simplify pet healthcare administration.

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
-   **Authentication**: Express sessions, bcrypt.
-   **Security**: Helmet, CORS, rate limiting, input sanitization.
-   **File Handling**: Base64 image storage with Sharp processing.
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

### Image Management
-   **Storage**: Base64 encoding.
-   **Processing**: Sharp for compression and resizing.

### Security Implementation
-   **Input Validation**: Zod schemas.
-   **Data Sanitization**: XSS and SQL injection protection.
-   **HTTPS**: SSL/TLS enforcement.
-   **Error Handling**: Structured, without sensitive data.

### Deployment Configuration
-   **Build System**: Separate client/server builds.
-   **Environment**: Node.js 18+.
-   **Process Management**: Health checks, graceful shutdown.

## External Dependencies

### Core
-   **React Ecosystem**: React, React DOM, React Hook Form, TanStack React Query.
-   **UI Components**: Radix UI, Lucide React, Tailwind CSS.
-   **Backend Framework**: Express.js.
-   **Database**: PostgreSQL, Drizzle ORM, pg driver.
-   **Authentication**: bcryptjs, express-session, jsonwebtoken.
-   **Image Processing**: Sharp.
-   **Validation**: Zod.

### Security
-   **Protection**: Helmet, CORS.
-   **Rate Limiting**: express-rate-limit.
-   **Session Security**: connect-pg-simple.
-   **Compression**: compression middleware.

### Payment Integration
-   **Payment Gateway**: Cielo E-commerce.

### Address Lookup
-   **API**: ViaCEP (for Brazilian postal codes).

### Deployment & Infrastructure
-   **Platform**: EasyPanel with Heroku-compatible buildpacks.
-   **Database**: PostgreSQL addon.
-   **Storage**: Supabase Storage (for pet images and payment receipts).