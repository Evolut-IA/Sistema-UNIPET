# UNIPET PLAN - Pet Health Plan System

## Overview
UNIPET PLAN is a comprehensive pet health plan management system designed to streamline pet insurance plan management, customer relationships, and healthcare network unit administration. It features a customer-facing website for plan selection and quote requests, alongside an admin dashboard for content and business management. The system is built with a full-stack TypeScript solution, utilizing a React frontend, Express.js backend, and PostgreSQL database with Drizzle ORM. The project emphasizes security, performance, and scalability, aiming to simplify pet healthcare administration.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (September 30, 2025)

### Bug Fix: Settings Page - Values Not Displaying
- **Issue**: Settings values were not being displayed in the '/admin/configuracoes' page (General and Rules tabs).
- **Root Cause**: Missing GET endpoints for `/admin/api/settings/site` and `/admin/api/settings/rules` - frontend was trying to fetch from non-existent endpoints.
- **Solution**:
  - Added `getRulesSettings()` and `updateRulesSettings()` methods to IStorage interface and implementations
  - Added imports for `RulesSettings` and `InsertRulesSettings` types in storage.ts
  - Created GET `/admin/api/settings/site` endpoint to retrieve site settings
  - Created PUT `/admin/api/settings/site` endpoint to update site settings  
  - Created GET `/admin/api/settings/rules` endpoint to retrieve rules settings
  - Created PUT `/admin/api/settings/rules` endpoint to update rules settings
  - Added development-only auth bypass for all `/admin/api/settings` routes in global middleware
- **Impact**: Settings page now properly loads and displays all existing values from the database for both General and Rules tabs

### Feature: Supabase Storage Integration for Site Settings Images
- **Implementation**: Site configuration images (mainImage, networkImage, aboutImage) are now stored in and served from Supabase Storage instead of base64 encoding in the database.
- **Backend Changes**:
  - Added `uploadSiteSettingsImage` method to `SupabaseStorageService` in `server/supabase-storage.ts`
  - Created POST `/admin/api/settings/upload-image` endpoint with development-only auth bypass
  - Images are processed with Sharp (resize to 1200x800, JPEG conversion, 90% quality)
  - Images stored in Supabase bucket `pet-images` under `site-settings/` path with imageType prefix
  - Added development bypass in global admin middleware for settings upload endpoint
- **Frontend Changes**:
  - Created `SiteSettingsImageUpload` component in `client/src/components/admin/ui/site-settings-image-upload.tsx`
  - Created `useSiteSettingsImageUpload` hook in `client/src/hooks/use-site-settings-image-upload.ts`
  - Hook handles file validation, preview generation, and API upload via FormData
  - Updated `Settings.tsx` to use new upload component with `imageType` parameter
  - Changed form fields from bytea (`mainImage`, `networkImage`, `aboutImage`) to URL fields (`mainImageUrl`, `networkImageUrl`, `aboutImageUrl`)
- **Security**: Upload endpoint requires admin authentication in production, file type/size validation, and Sharp re-encoding
- **Storage**: Images are publicly accessible via Supabase CDN URLs
- **Result**: Site settings images are now properly managed through Supabase Storage with consistent upload workflow across the admin interface

### Feature: FAQ Management System Improvements
- **Implementation**: Fixed FAQ status toggle and delete functionality in the admin interface.
- **Backend Changes**:
  - Fixed `GET /admin/api/faq` endpoint to use `getAllFaqItems()` instead of `getFaqItems()` to show both active and inactive FAQs
  - Added missing `POST /admin/api/faq` endpoint for creating new FAQ items
  - Added missing `PUT /admin/api/faq/:id` endpoint for updating FAQ items
  - Added missing `DELETE /admin/api/faq/:id` endpoint for deleting FAQ items
  - Added development-only auth bypass for FAQ routes
- **Frontend Changes**:
  - Fixed FAQ creation form to automatically calculate `displayOrder` based on existing items
  - Removed close button (X icon) from FAQ dialog popups using `hideCloseButton` prop
  - FAQ status toggle now properly filters content between public and admin views
- **Validation**: FAQ creation/update requires `displayOrder` field (number) as per schema requirements
- **Result**: 
  - Admin page shows all FAQs regardless of status
  - Public pages (/faq and home) only show active FAQs
  - Delete button works correctly
  - Status toggle successfully controls FAQ visibility

## Recent Changes (September 30, 2025)

### Bug Fix: Plan Layout Centering on Desktop with Fixed Card Sizes
- **Issue**: When fewer than 4 plans are active, plan containers needed to center while maintaining consistent sizes.
- **Root Cause**: Dynamic grid columns were causing cards to expand/shrink based on available space.
- **Solution**: 
  - Set fixed max-width (max-w-[280px]) on plan cards to maintain consistent sizing
  - Used w-fit on grid container with flex wrapper for proper centering
  - Kept grid-cols-4 fixed to preserve layout structure
- **Impact**: Plans now center automatically when fewer than 4 are active, while maintaining their original size across all configurations.

### Bug Fix: Missing Cidade Field in Network Unit Form
- **Issue**: Network units could not be created because the form was missing the required 'cidade' (city) field, causing validation to fail silently.
- **Root Cause**: The schema requires 'cidade' as mandatory, but the form did not include this field in defaultValues or the UI.
- **Solution**: 
  - Added 'cidade' field to form defaultValues
  - Added 'cidade' field to the form reset logic for edit mode
  - Added visual input field for 'cidade' in the Basic Information section
- **Impact**: Users can now successfully create and edit network units.

### Feature: Supabase Storage Integration for Network Unit Images
- **Implementation**: Network unit images are now stored in and served from Supabase Storage instead of base64 encoding in the database.
- **Backend Changes**:
  - Added `uploadNetworkUnitImage` method to `SupabaseStorageService` in `server/supabase-storage.ts`
  - Created POST `/admin/api/network-units/upload-image` endpoint protected with `requireAdmin` middleware
  - Configured multer for in-memory file upload (5MB limit, image-only filter)
  - Images are processed with Sharp (resize to 1200x800, JPEG conversion, 90% quality)
  - Images stored in Supabase bucket `pet-images` under `network-units/` path
- **Frontend Changes**:
  - Created `NetworkUnitImageUpload` component in `client/src/components/ui/network-unit-image-upload.tsx`
  - Created `useNetworkUnitImageUpload` hook in `client/src/hooks/use-network-unit-image-upload.ts`
  - Hook handles file validation, preview generation, and API upload via FormData
  - Updated `NetworkForm.tsx` to use new upload component with `unitId` parameter
- **Security**: Upload endpoint requires admin authentication, file type/size validation, and Sharp re-encoding
- **Storage**: Images are publicly accessible via Supabase CDN URLs

### Feature: Brazilian Phone Number Formatting
- **Implementation**: Applied consistent Brazilian phone formatting across all admin interface pages.
- **Scope**: All phone, contact, WhatsApp, and mobile number fields now display in format "+55 (XX) XXXXX-XXXX" or "+55 (XX) XXXX-XXXX".
- **Function**: Uses existing `formatBrazilianPhoneForDisplay` utility from `@/hooks/use-site-settings`.
- **Pages Updated**:
  - `/admin/rede` (Network.tsx): Table column, detail modal (phone & WhatsApp), copy-to-clipboard text
  - `/admin/clientes` (Clients.tsx): Table column, detail modal, generated client text
  - `/admin/contatos` (ContactSubmissions.tsx): Table column, generated submission text
  - `/admin/dashboard-unidade` (UnitDashboard.tsx): Client list, digital cards, guide details modal
- **Database**: Phone numbers remain stored without formatting; formatting applied only on display.

### Bug Fix: Network Units Status Toggle
- **Issue**: Status toggle button in /admin/rede page was not working correctly - when clicked to deactivate, units remained active.
- **Root Cause**: 
  1. Frontend: Switch component was passing current value and inverting it, causing double-inversion with Radix UI
  2. Backend: Missing PUT route for updating network unit status
  3. Backend: Admin route was filtering only active units, causing deactivated units to disappear from the page
- **Solution**:
  1. Fixed Network.tsx: onCheckedChange now passes new value directly without manual inversion
  2. Added PUT /admin/api/network-units/:id route in server/routes.ts
  3. Route validates with updateNetworkUnitSchema and calls storage.updateNetworkUnit
  4. Changed admin route to use getAllNetworkUnits() instead of getNetworkUnits() to show both active and inactive units

### Security Fix: Development Auth Bypass Protection
- **Issue**: Development auth bypasses were not checking NODE_ENV, exposing admin routes in production.
- **Impact**: Critical security vulnerability - all admin bypasses would work in production.
- **Solution**: Added `process.env.NODE_ENV === 'development'` check to ALL auth bypasses:
  - POST /admin/api/clients
  - GET /admin/api/clients  
  - PUT /admin/api/clients
  - GET /admin/api/plans
  - All /admin/api/network-units routes
- **Result**: In production, all admin routes now require proper authentication.

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