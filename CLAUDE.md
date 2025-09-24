# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MediVIX is an AI-powered medical office management system built with Next.js 15, TypeScript, Supabase, and Mistral AI. It provides patient management, appointment scheduling, AI-powered diagnosis suggestions, and medical history tracking.

## Key Commands

### Development
```bash
npm run dev        # Start development server (default port 3000)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Testing
```bash
npm test           # Run Jest unit and integration tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:ci    # Run tests in CI mode
npm run test:e2e   # Run Playwright E2E tests
npm run test:e2e:ui # Run Playwright with UI mode
npm run test:all   # Run all test suites
```

### Type Checking
```bash
npx tsc --noEmit   # Run TypeScript type checking
```

## Architecture & Key Patterns

### Project Structure
- **Next.js App Router**: All pages are in `src/app/` using the App Router pattern
- **API Routes**: Located in `src/app/api/` with route handlers
- **Components**: Organized in `src/components/` with subdirectories for different features
  - UI components use shadcn/ui library in `src/components/ui/`
  - Feature components organized by domain (patients, appointments, diagnosis, etc.)
- **State Management**: Uses TanStack Query (React Query) for server state
- **Database**: Supabase PostgreSQL with TypeScript types defined in `src/lib/supabase.ts`

### Core Libraries & Integrations

1. **Supabase Client** (`src/lib/supabase.ts`)
   - Single client instance shared across the application
   - Full TypeScript type definitions for all database tables
   - Row Level Security (RLS) enabled on all tables

2. **Mistral AI Integration** (`src/lib/mistral.ts`)
   - Uses `mistral-medium` model for diagnosis and follow-up suggestions
   - Structured JSON responses with confidence scores
   - Error handling with fallback responses

3. **React Query Setup** (`src/lib/query-client.ts` & `src/components/providers/query-provider.tsx`)
   - Custom hooks in `src/hooks/` for data fetching
   - Automatic caching and background refetching

### API Route Pattern

All API routes follow RESTful conventions:
- `GET /api/[resource]` - List all resources
- `POST /api/[resource]` - Create new resource
- `GET /api/[resource]/[id]` - Get single resource
- `PUT /api/[resource]/[id]` - Update resource
- `DELETE /api/[resource]/[id]` - Delete resource

Routes include proper error handling with standardized error responses.

### Available API Endpoints

**Core Resources:**
- `/api/patients` - Patient CRUD operations
- `/api/appointments` - Appointment scheduling and management
- `/api/medical-history` - Patient medical history tracking
- `/api/templates` - Visit template management
- `/api/diagnose` - AI-powered diagnosis using Mistral API

**Additional Endpoints:**
- `/api/drugs` - Drug information lookup and management
- `/api/appointments/slots` - Available appointment time slots
- `/api/database/status` - Database connection and status check

**Utility Endpoints:**
- `/api/health` - Application health check with database connectivity test
- `/api/rls/test` - Row Level Security testing endpoint

### Database Schema

Four main tables with relationships:
- `patients` - Core patient information with allergies, chronic conditions, emergency contacts, and insurance info
- `appointments` - Scheduling with status tracking and visit template references
- `visit_templates` - Pre-configured visit types with duration, notes, and common diagnoses
- `medical_history` - Patient medical records linked to appointments with symptoms, treatment, and follow-up notes

All tables use UUID primary keys, have proper indexes for performance, and include RLS policies. The schema includes 5 pre-seeded visit templates and sample patient data.

### Component Patterns

- **Layout Components**: Use `DashboardLayout` wrapper for consistent navigation
- **Form Components**: Use react-hook-form with Zod validation
- **UI Components**: Built on shadcn/ui with consistent theming
- **Data Fetching**: Custom hooks using React Query for all API calls

### Security Considerations

- Environment variables for all sensitive data (Supabase keys, Mistral API key)
- Row Level Security enabled on all database tables
- Comprehensive input validation using Zod schemas in `src/lib/validation/schemas.ts`
  - Includes validation for patients, appointments, medical history, visit templates, and AI diagnosis
- Rate limiting implemented in `src/lib/rate-limiting.ts`
- Security headers configured in `src/lib/security-headers.ts`
- Error handling utilities in `src/lib/error-handling.ts` and `src/lib/user-feedback.ts`

## Environment Setup

Required environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
MISTRAL_API_KEY=your-mistral-api-key
```

## Testing Strategy

### Test Structure
- **Unit Tests**: Located in `src/__tests__/` mirroring source structure
- **Component Tests**: Test React components with React Testing Library
- **API Tests**: Test Next.js API routes with mocked dependencies
- **E2E Tests**: Playwright tests in `e2e/` directory

### Test Coverage
- Currently configured for 70% minimum coverage across branches, functions, lines, and statements
- Run `npm run test:coverage` to see coverage report

## Development Workflow

1. **Before starting development**: Ensure database schema is executed in Supabase (see `database/schema.sql`)
2. **Adding new features**: Follow existing patterns in corresponding directories
3. **API changes**: Update TypeScript types in `src/lib/supabase.ts`
4. **Component development**: Use existing UI components from `src/components/ui/`
5. **Data fetching**: Use custom hooks in `src/hooks/` (e.g., `use-patients.ts`, `use-templates.ts`)
6. **Form validation**: Add Zod schemas to `src/lib/validation/schemas.ts` for new data types
7. **Testing changes**: Write tests for new features, run `npm test` before committing

## MCP Servers Integration

MediVIX is configured to work with Model Context Protocol (MCP) servers for enhanced development capabilities:

### Available MCP Servers
- **PostgreSQL**: Direct SQL access to Supabase database for complex queries
- **Brave Search**: Medical research, drug information, and ICD code lookup
- **Memory**: Persistent knowledge graph for patient context and preferences
- **Time**: Timezone handling for telemedicine appointments
- **Fetch**: Access to medical APIs, drug databases, and documentation
- **SQLite**: Local database for offline development and caching
- **Sequential Thinking**: Complex medical workflow reasoning and diagnosis paths

### Setup
1. Run `scripts\install-mcp-servers.bat` to install all servers
2. Configure Claude Desktop with `config\claude_desktop_config.json`
3. Add API keys to `.env.local` (see `.env.example`)
4. See `docs\mcp-setup-guide.md` for detailed instructions
5. Refer to `docs\mcp-servers-usage.md` for usage examples

## Important Notes

- **No authentication** implemented yet - all routes are public
- **Windows environment**: Use appropriate path separators and commands
- **Port conflicts**: Development server defaults to port 3000
- **Database must be initialized** before API endpoints will work properly
- **Type safety**: Strict TypeScript mode is enabled - all code must be properly typed
- **MCP Servers**: Optional but highly recommended for enhanced development with Claude Desktop