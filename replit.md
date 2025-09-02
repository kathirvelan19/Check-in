# Class Attendance - Fast App

## Overview

This is an offline-capable class attendance tracking application built for teachers and staff. The system operates as a frontend-only application that allows teachers to record daily attendance, manage student rosters, and export attendance reports as Excel files without requiring a backend server or network connectivity. The application uses local storage for data persistence and provides a complete attendance management workflow.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: React hooks with local component state and React Query for data synchronization

### Data Storage
- **Primary Storage**: Browser localStorage for persistent offline data storage
- **Database Schema**: Defined using Zod schemas for type safety and validation
- **Data Models**: Staff accounts, student rosters, and attendance records with structured relationships
- **Backup Strategy**: CSV import/export functionality for data portability

### Authentication & Authorization  
- **Authentication**: Simple code-based staff authentication stored locally
- **Session Management**: Persistent login state using localStorage
- **Access Control**: Staff-scoped data isolation ensuring each teacher only accesses their own rosters and attendance data

### Core Features Architecture
- **Roster Management**: CSV parsing and validation with bulk import capabilities
- **Attendance Tracking**: Daily attendance recording with three status types (Present, Absent, On Duty)
- **Reporting System**: Excel export functionality using ExcelJS with customizable formatting options
- **Search & Filtering**: Client-side search and date-range filtering for attendance records

### Offline-First Design
- **Data Persistence**: All data stored locally in browser storage
- **No Network Dependencies**: Complete functionality without internet connectivity
- **Export Capabilities**: Generate Excel reports for external sharing and record-keeping
- **Data Integrity**: Input validation and error handling for reliable offline operation

## External Dependencies

### UI & Styling
- **Radix UI**: Comprehensive set of accessible React components for dialogs, dropdowns, forms, and navigation
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Icon library for consistent iconography
- **class-variance-authority**: Utility for creating type-safe component variants

### Data Processing
- **Zod**: Schema validation library for type-safe data validation
- **ExcelJS**: Client-side Excel file generation and manipulation
- **date-fns**: Date utility library for date formatting and calculations

### Development Tools
- **Vite**: Modern build tool with fast development server and optimized production builds  
- **TypeScript**: Type safety and enhanced development experience
- **PostCSS**: CSS processing with Tailwind CSS integration
- **Replit Integration**: Development environment plugins for Replit-specific features

### Server Infrastructure (Development)
- **Express.js**: Minimal server setup for development environment
- **Drizzle ORM**: Type-safe SQL query builder configured for PostgreSQL (optional database integration)
- **Neon Database**: Serverless PostgreSQL database service (configured but not actively used in current offline-first implementation)

The application is designed to function entirely offline, with server components primarily serving the development environment and providing optional future database integration capabilities.