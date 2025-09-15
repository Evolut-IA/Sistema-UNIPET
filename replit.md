# Overview

Sistema UNIPET is a comprehensive pet management system built with React, TypeScript, Express.js, and PostgreSQL. The application provides a complete solution for managing pet healthcare services, including client and pet records, health plans, veterinary guides, credentialed network units, and administrative features. The system is designed as a full-stack web application with a modern React frontend and a RESTful API backend, specifically configured for deployment on cloud platforms like EasyPanel using Heroku buildpacks.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using **React 18** with **TypeScript** and follows a component-based architecture:

- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Custom design system built on Radix UI components with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Responsive Design**: Mobile-first approach with custom breakpoints and responsive components

The application uses a modular structure with shared components, custom hooks, and utility functions. The UI components follow the shadcn/ui pattern with consistent styling and accessibility features.

## Backend Architecture

The backend is built with **Express.js** and **TypeScript** using an API-first approach:

- **Framework**: Express.js with custom middleware for logging and error handling
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints following resource-based conventions
- **Build Process**: esbuild for fast TypeScript compilation and bundling
- **Development**: Hot reload with tsx for development server

The server architecture emphasizes separation of concerns with dedicated route handlers, storage layer abstraction, and centralized error handling.

## Data Storage Solutions

**Primary Database**: PostgreSQL with Drizzle ORM for schema management and migrations:

- **Schema Definition**: Centralized schema definitions in TypeScript with automatic type generation
- **Migrations**: Version-controlled database migrations using Drizzle Kit
- **Connection Management**: Connection pooling and SSL support for production environments
- **Data Models**: Comprehensive entities including users, clients, pets, plans, guides, network units, and system settings

The database design supports complex relationships between entities and includes audit trails with created/updated timestamps.

## Authentication and Authorization

**User Management System**:
- Role-based access control with customizable permissions
- Session-based authentication with secure password hashing
- Administrative interface for user management
- Protected routes with permission-based access control

The system implements a flexible permission system allowing fine-grained control over feature access.

## Deployment Configuration

**Production Deployment**: Optimized for EasyPanel and Heroku-compatible platforms:

- **Build Process**: Multi-stage build with frontend (Vite) and backend (esbuild) compilation
- **Health Checks**: Built-in health monitoring endpoint for deployment platforms
- **Environment Configuration**: Comprehensive environment variable management
- **Process Management**: Graceful shutdown handling and proper signal management
- **Port Configuration**: Flexible port assignment for cloud deployment requirements

# External Dependencies

## Third-Party UI Libraries

- **Radix UI**: Comprehensive set of low-level UI primitives for accessibility and behavior
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Icon library for consistent iconography
- **date-fns**: Date manipulation and formatting library with internationalization support

## Development and Build Tools

- **Vite**: Fast build tool with hot module replacement and optimized production builds
- **esbuild**: High-performance JavaScript bundler for backend compilation
- **TypeScript**: Static type checking for both frontend and backend
- **ESLint & Prettier**: Code quality and formatting tools

## Database and Backend

- **PostgreSQL**: Primary database with support for Neon Database and other PostgreSQL providers
- **Drizzle ORM**: Type-safe ORM with automatic schema validation and migration support
- **Express.js**: Web framework for RESTful API development

## Form and Validation

- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation for forms and API data
- **@hookform/resolvers**: Integration layer between React Hook Form and Zod

## State Management and Data Fetching

- **TanStack Query**: Server state management with caching, background updates, and optimistic updates
- **Wouter**: Lightweight routing library for single-page application navigation

## Deployment and Production

- **Heroku Buildpacks**: Compatible build process for various cloud platforms
- **PostgreSQL**: Production database with SSL support and connection pooling
- **Environment Variables**: Secure configuration management for sensitive data