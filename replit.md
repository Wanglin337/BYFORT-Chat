# BYFORT - Mobile Banking Application

## Overview

BYFORT is a mobile-first banking application designed to replicate the familiar chat interface of WhatsApp while providing essential financial services. The application enables users to manage their digital wallet balance, perform transactions (top-up, withdrawal, money transfers), and access an admin panel for transaction management. Built as a full-stack web application with a mobile-responsive design, it features real-time balance updates, transaction history, and notification systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: Zustand with persistence for authentication state, providing a simple and efficient global state solution
- **UI Components**: Radix UI primitives with custom styling through shadcn/ui components for consistent design
- **Styling**: Tailwind CSS with custom CSS variables for theming, including WhatsApp-inspired color schemes
- **Forms**: React Hook Form with Zod validation for robust form handling and validation
- **Data Fetching**: TanStack Query (React Query) for server state management with automatic caching and refetching

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript throughout the stack for consistent type checking
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL session store for persistent authentication
- **File Handling**: Multer for transaction proof image uploads with file type validation
- **Development**: Vite integration for hot module replacement and development server

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting for scalability
- **ORM**: Drizzle ORM with schema-first approach, providing excellent TypeScript integration
- **Schema Design**: Three main entities - users (authentication and balance), transactions (financial operations), and notifications (real-time updates)
- **Development Storage**: In-memory storage class for rapid prototyping and testing

### Authentication and Authorization
- **Session-Based Auth**: Traditional session-based authentication using phone number and PIN
- **Password Security**: PIN-based authentication (ready for bcrypt hashing in production)
- **State Persistence**: Client-side auth state persisted using Zustand's persist middleware
- **Admin Access**: Simple role-based access with dedicated admin routes and interfaces

### Mobile-First Design
- **Responsive Layout**: Mobile-first design with max-width container for desktop compatibility
- **WhatsApp UI**: Familiar chat interface with green color scheme for user comfort
- **Touch Interactions**: Optimized for mobile touch interactions and gestures
- **Notification System**: Toast-based notifications with real-time updates for transaction status

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle Kit**: Database migration and schema management tools

### UI and Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide React**: Modern icon library with consistent design
- **Class Variance Authority**: Type-safe CSS class management for component variants

### Development Tools
- **Vite**: Fast build tool with HMR for development efficiency
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server
- **Replit Integration**: Development environment integration with error handling and cartographer

### Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation for forms and API payloads
- **Hookform Resolvers**: Integration layer between React Hook Form and Zod

### Real-time Features
- **TanStack Query**: Automatic background refetching for real-time balance updates
- **Polling Strategy**: Interval-based polling for notifications and balance updates
- **Optimistic Updates**: Client-side state updates for immediate feedback

The application follows a modern full-stack architecture with strong typing throughout, mobile-first design principles, and real-time capabilities essential for a banking application.