# Overview

Sistema UNIPET is a comprehensive pet management system built for veterinary practices and pet insurance companies. The application provides a complete solution for managing clients, pets, health plans, service guides, credentialed network units, and contact submissions. It features a modern web interface with administrative capabilities, user management, and configurable site settings.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## Pet Form planId Validation Fix (September 15, 2025)
Fixed validation error when saving pets with empty health plan (planId) field:

### Problem Resolved:
- **Issue**: Error 400 when saving pets with empty planId field in the form
- **Cause**: Empty string ("") planId was failing validation as it expected null/undefined for optional fields
- **Solution**: Remove empty string planId from request data before validation

### Technical Implementation:
- Modified `PUT /api/pets/:id` and `POST /api/pets` endpoints in `server/routes.ts`
- Added logic to delete planId from request data when it's an empty string
- This allows proper handling of optional plan selection in the pet form

## Dashboard Statistics Fix (September 15, 2025)
Fixed critical issue where Dashboard page was displaying incorrect statistics that didn't reflect real database data:

### Problems Resolved:
1. **activeClients**: Was counting all clients instead of only those with guides. Now correctly shows 5 active clients (clients who have guides).
2. **registeredPets**: Working correctly, showing 13 total pets in the system.
3. **openGuides**: Working correctly, showing 4 open guides.
4. **monthlyRevenue**: Was hardcoded to 0. Now dynamically calculates total revenue from all guides: R$ 1,695.00.
5. **totalPlans & activePlans**: Working correctly, showing 4 total plans, all active.

### Technical Implementation:
- Modified `getDashboardStats()` method in `server/storage.ts`
- Resolved Drizzle ORM caching issues by implementing proper server restart workflow
- Implemented revenue calculation using reduce method on guide values
- Added debug logging to ensure proper execution path

### API Response (working):
```json
{"activeClients":5,"registeredPets":13,"openGuides":4,"monthlyRevenue":1695,"totalPlans":4,"activePlans":4,"inactivePlans":0}
```

The Dashboard now accurately reflects real business data from the database.

# System Architecture

## Frontend Architecture
The client-side is built with React and TypeScript, utilizing modern development patterns:
- **UI Framework**: React with TypeScript for type safety
- **Styling**: TailwindCSS for utility-first styling with custom CSS variables for theming
- **Component Library**: Radix UI primitives with shadcn/ui components for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation for type-safe forms
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
The server-side follows a RESTful API design pattern:
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the stack
- **API Design**: RESTful endpoints with consistent error handling and logging
- **Session Management**: Express sessions with PostgreSQL storage via connect-pg-simple
- **File Structure**: Modular route handlers with centralized storage layer

## Data Storage Solutions
The application uses PostgreSQL as the primary database:
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Code-first approach with Drizzle migrations
- **Connection**: PostgreSQL with SSL support for production environments
- **Data Models**: Comprehensive schemas for clients, pets, plans, guides, network units, users, and settings

## Authentication and Authorization
User management system with role-based access:
- **Authentication**: Username/password authentication with secure session management
- **Authorization**: Permission-based system with granular access controls
- **User Roles**: Admin roles with configurable permissions for different system sections
- **Session Security**: Secure session configuration with configurable secrets

## External Dependencies
The system integrates with several external services and platforms:
- **Deployment**: Configured for Heroku deployment with PostgreSQL addon
- **Alternative Deployment**: EasyPanel configuration for containerized deployment
- **Development Tools**: Replit integration for cloud-based development
- **Fonts**: Google Fonts integration (Inter, DM Sans, Fira Code, etc.)
- **Image Handling**: Base64 image storage with upload validation and preview functionality
- **Communication**: WhatsApp integration for client communication
- **Maps**: Google Maps integration for location services