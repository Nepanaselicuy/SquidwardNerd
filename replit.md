# HR Management System (SIIhadirin)

## Overview

This is a comprehensive HR management system called "SIIhadirin" built with a modern full-stack architecture. The application provides employee attendance tracking, leave management, notifications, and calendar functionality with an Indonesian-language interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server
- **Wouter** for client-side routing (lightweight React Router alternative)
- **TanStack Query** for server state management and API caching
- **Tailwind CSS** with **shadcn/ui** component library for styling
- **React Hook Form** with **Zod** validation for form handling

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design pattern
- **Memory-based storage** with interface for easy database integration
- **Middleware** for request logging and error handling

### Component Design
- **shadcn/ui** component system with Radix UI primitives
- **Modular page structure** with separate routes for each feature
- **Responsive design** with mobile-first approach
- **Custom hooks** for reusable business logic

## Key Components

### Data Layer
- **Schema definitions** in `shared/schema.ts` using Drizzle ORM
- **Type-safe database models** for employees, attendance, leave requests, notifications, and events
- **Zod schemas** for runtime validation derived from database schema

### API Layer
- **Employee management** - CRUD operations for employee data
- **Attendance tracking** - Check-in/out functionality with history
- **Leave management** - Request submission and approval workflow
- **Notifications** - Real-time updates and messaging
- **Company events** - Calendar integration and event management

### UI Components
- **Dashboard** - Overview with quick actions and statistics
- **Attendance page** - Clock in/out with daily and historical views
- **Leave page** - Leave request forms and status tracking
- **Notifications** - Message center with read/unread states
- **Calendar** - Monthly view with company events
- **Profile** - Employee information management

## Data Flow

1. **Client requests** are routed through Wouter to appropriate page components
2. **TanStack Query** manages API calls with automatic caching and invalidation
3. **Express API routes** handle business logic and data operations
4. **Memory storage** simulates database operations with typed interfaces
5. **Real-time updates** through query invalidation on mutations

## External Dependencies

### Database Integration
- **Drizzle ORM** configured for PostgreSQL with migration support
- **@neondatabase/serverless** for Neon database connectivity
- **Connection pooling** and session management ready

### UI Framework
- **Radix UI** primitives for accessible components
- **Lucide React** for consistent iconography
- **Class Variance Authority** for component variant management
- **Tailwind CSS** for utility-first styling

### Development Tools
- **TypeScript** for type safety across the stack
- **ESBuild** for production bundling
- **Vite plugins** for development experience
- **PostCSS** with Autoprefixer for CSS processing

## Deployment Strategy

### Development Setup
- **Vite dev server** with HMR for frontend development
- **tsx** for running TypeScript server with hot reloading
- **Concurrent development** with API and frontend serving

### Production Build
- **Vite build** outputs static assets to `dist/public`
- **ESBuild** bundles server code to `dist/index.js`
- **Static file serving** through Express in production
- **Environment-based configuration** for database connections

### Architecture Benefits
- **Type safety** across the entire stack prevents runtime errors
- **Modular design** allows easy feature additions and modifications
- **Responsive UI** provides optimal experience across devices
- **Caching strategy** reduces server load and improves performance
- **Indonesian localization** provides native language support for users

The system is designed to scale from the current memory-based storage to a full PostgreSQL database without requiring significant architectural changes, thanks to the abstracted storage interface and Drizzle ORM integration.