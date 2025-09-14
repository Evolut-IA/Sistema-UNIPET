# Overview

Sistema UNIPET is a comprehensive pet management system built for veterinary practices and pet insurance companies. The application provides a complete solution for managing clients, pets, health plans, service guides, credentialed network units, and contact submissions. It features a modern web interface with administrative capabilities, user management, and configurable site settings.

# User Preferences

Preferred communication style: Simple, everyday language.

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