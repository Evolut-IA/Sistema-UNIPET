# UNIPET PLAN - Pet Health Plan System

## Overview
UNIPET PLAN is a comprehensive pet health plan management system designed to streamline pet insurance plan management, customer relationships, and healthcare network unit administration. It features a customer-facing website for plan selection and quote requests, alongside an admin dashboard for content and business management. The system is built with a full-stack TypeScript solution, utilizing a React frontend, Express.js backend, and PostgreSQL database with Drizzle ORM. The project emphasizes security, performance, scalability, and aims to simplify pet healthcare administration.

## Recent Changes
- **September 25, 2025**: Pet Sex Field Made Selectable
  - Added sex selection dropdown field in checkout form (Step 2 - Pet Information)
  - User can now select between "Macho" (Male) or "Fêmea" (Female) for each pet
  - Removed automatic default value of 'Macho' from backend endpoints
  - Made sex field editable in customer pets management page (/customer/pets)
  - Field now uses consistent Select component styling across checkout and pets page
  - Ensures accurate pet information registration according to user input

## Recent Changes
- **September 25, 2025**: Fixed CEP (Postal Code) Not Being Saved During Checkout
  - Corrected field name mismatch between frontend and backend
  - Frontend was sending 'cep' field but backend was trying to read 'zipCode'
  - Updated all backend endpoints to correctly read 'addressData.cep' instead of 'addressData.zipCode'
  - CEP is now properly saved to the clients table during checkout process
  - Fixed in multiple endpoints: complete-registration, simple-process, and payment processing

- **September 25, 2025**: Fixed Pet Duplication During Checkout
  - Corrected issue where pets were being saved twice during checkout process (once in /api/checkout/save-customer-data and again in /api/checkout/simple-process)
  - Removed duplicate pet creation code from /api/checkout/simple-process endpoint
  - Pets are now correctly saved only once in the /api/checkout/save-customer-data endpoint
  - Issue manifested as double the number of pets being saved (e.g., 5 pets became 10 in database)
  - Solution maintains data integrity while preserving all checkout functionality

- **September 25, 2025**: FAQ Question Titles Desktop Typography Enhancement
  - Increased FAQ question title size for desktop version only (lg:text-base) while maintaining mobile size (text-sm)
  - Applied responsive typography using Tailwind CSS classes to AccordionTrigger in faq-section.tsx
  - Affects both Home page and FAQ page since they use the same FaqSection component
  - Change activates at 1024px+ (desktop breakpoint) without affecting mobile experience
  - Preserves existing design consistency and accessibility standards

- **September 24, 2025**: Financial Information Page Complete Fix
  - Removed duplicate /api/clients/payment-history endpoint (lines 3161-3229) that was causing conflicts
  - Fixed PDF download functionality for payment receipts - regenerates PDF when needed
  - Corrected PDF response headers to return binary data instead of JSON
  - Added test client (test@unipetplan.com.br, password: test123) with contracts and payment receipts
  - All financial page endpoints verified working: contracts, payment-history, payment-receipts, and PDF downloads
  - PDF generation uses pdfmake with proper binary response handling

- **September 24, 2025**: Checkout Plan Billing and Installment Rules Fix
  - Updated database: COMFORT and PLATINUM plans now have 'annual' billing frequency (BASIC and INFINITY remain 'monthly')
  - Fixed checkout step 1 to display correct billing frequency ('faturamento anual' for COMFORT/PLATINUM, 'faturamento mensal' for BASIC/INFINITY)
  - Verified installment rules in checkout step 4: BASIC/INFINITY allow only 1x payment, COMFORT/PLATINUM allow 1x to 12x installments
  - Updated Plan interface in checkout.tsx to include billingFrequency field for proper data handling

- **September 24, 2025**: Consistent Select Component Styling
  - Applied uniform styling to all dropdown/select components across the application
  - Updated Parcelas field in checkout page (step 4 payment) with shadcn Select component
  - Updated Castrado field in customer pets page with consistent Select styling
  - Updated "Filtrar por Tipo" and "Filtrar por Cobertura" filters in admin UnitDashboard
  - All Select components now use consistent className "w-full p-3 rounded-lg border text-sm"
  - Applied consistent borderColor styling using CSS variable --border-gray and white background

- **September 24, 2025**: Social Media Icons Hover Animation
  - Added smooth scale animation (hover:scale-95) on social media icons
  - Applied transition-all duration-300 for clean and smooth effect
  - Updated icons in footer, contact page, and contact section components
  - Animation matches the style of "Ver todas as dúvidas" button for consistency

- **September 24, 2025**: Login Fields Styling Update
  - Applied search field styling to customer login page (Email and CPF fields)
  - Applied same styling to admin login page (Login and Senha fields)
  - Added icons inside input fields with proper positioning
  - Set white background (#FFFFFF) and gray border (#e5e7eb)
  - Adjusted border-radius to 8px and padding for icon accommodation

- **September 23, 2025**: Automatic CEP Address Lookup Implementation
  - Added automatic address lookup via ViaCEP API when Brazilian postal code (CEP) is entered
  - Implemented conditional field display - initially shows only CEP field
  - Other address fields appear automatically after CEP is typed (5+ digits)
  - Auto-fills street, neighborhood, city, and state when valid CEP is found
  - Added loading indicator during API call and error handling for invalid CEPs
  - Formatted CEP input automatically with mask (00000-000)
  - Keeps user-entered data for number and complement fields

- **September 23, 2025**: Complete Database Integration for Checkout System
  - Added integration with `/api/checkout/complete-registration` endpoint to save CPF and address data
  - Enhanced checkout form with complete address fields (street, number, complement, district, city, state, ZIP)
  - Modified checkout flow to make three sequential API calls: save-customer-data → complete-registration → process
  - Ensured all customer data, pets, contracts, and payment information are correctly saved in PostgreSQL
  - Verified credit card data is NOT persisted for security compliance
  - Automatic payment receipt generation for approved transactions
  - Successfully tested full checkout workflow with database persistence

- **September 23, 2025**: PIX Payment Completion Workflow Implementation
  - Added PIX payment status polling system that checks payment confirmation every 3 seconds
  - Implemented congratulations popup component with bilingual support (Portuguese/English)
  - Integrated automatic redirection to '/customer/login' when PIX payment status becomes approved (cieloStatus === 2)
  - Enhanced checkout page with payment tracking states and cleanup mechanisms
  - Successfully tested the complete workflow with both frontend and backend running

- **September 23, 2025**: Structural improvements to Plans page
  - Removed container div from `/planos` page to place PlansSection directly in main element
  - Removed internal container div from PlansSection component to place title, subtitle, and pricing grid directly in section
  - This eliminates unnecessary nesting and provides cleaner DOM structure for better spacing control

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
-   **Core Tables**: Contact submissions, plans, network units, FAQ, site settings, chat settings.
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
-   **Payment Gateway**: Cielo E-commerce (planned).

### Deployment & Infrastructure
-   **Platform**: EasyPanel with Heroku-compatible buildpacks.
-   **Database**: PostgreSQL addon.
-   **Storage**: Supabase Storage for pet images and payment receipts.