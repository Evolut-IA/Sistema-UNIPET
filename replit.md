# Pet Health CRM System

## Overview

This is a modern CRM (Customer Relationship Management) system specifically designed for pet health insurance plans. The application manages client information, pet registrations, health service guides, insurance plans, credentialed network units, and customer support features. Built as a full-stack TypeScript application with a React frontend and Express backend, it provides comprehensive tools for managing pet health insurance operations including client onboarding, service tracking, network management, and administrative functions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for consistent theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation for type-safe forms

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API architecture with structured route handlers
- **Validation**: Zod schemas for request/response validation

### Database Design
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle migrations with shared schema definitions
- **Key Entities**:
  - Users (authentication and authorization)
  - Clients (customer information and contact details)
  - Pets (animal profiles with health information)
  - Plans (insurance plan configurations and pricing)
  - Network Units (credentialed service providers)
  - Guides (service request tracking)
  - FAQ Items (customer support content)
  - Contact Submissions (customer inquiries)
  - Site Settings (application configuration)

### Authentication & Authorization
- **User Management**: Role-based access control with configurable permissions
- **Session Management**: Express sessions with PostgreSQL storage
- **Security**: Permission-based feature access for different user roles

### UI/UX Design System
- **Design Philosophy**: Modern, clean interface optimized for pet health management
- **Color Scheme**: Custom CSS variables with teal-based primary colors (#277677)
- **Typography**: DM Sans font family for professional appearance
- **Responsive Design**: Mobile-first approach with collapsible sidebar navigation
- **Accessibility**: Semantic HTML and ARIA compliance through Radix UI components

### File Structure
- `/client` - React frontend application
- `/server` - Express backend API
- `/shared` - Common TypeScript types and Zod schemas
- `/migrations` - Database migration files

## External Dependencies

### Database & Hosting
- **Neon Database**: Serverless PostgreSQL hosting for production workloads
- **Replit**: Development environment and deployment platform

### Frontend Libraries
- **React Ecosystem**: React 18, React DOM, React Router (Wouter)
- **UI Framework**: Radix UI primitives with Shadcn/ui component system
- **State Management**: TanStack Query for server state and caching
- **Form Management**: React Hook Form with Hookform Resolvers
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Icons**: Lucide React icon library
- **Date Handling**: date-fns for date formatting and manipulation

### Backend Libraries
- **Express.js**: Web application framework with middleware support
- **Database**: Drizzle ORM with Neon serverless driver
- **Validation**: Zod for schema validation and TypeScript inference
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: TSX for TypeScript execution and hot reloading

### Development Tools
- **Build Tools**: Vite for frontend bundling, ESBuild for backend compilation
- **Type Safety**: TypeScript with strict configuration across frontend and backend
- **Code Quality**: Shared TypeScript configuration with path mapping
- **Replit Integration**: Custom plugins for development experience and error handling