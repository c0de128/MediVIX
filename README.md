# MediVIX - Medical Office Management System

AI-powered medical office management system built with Next.js, Supabase, and Mistral AI.

## Features

- **Patient Management**: CRUD operations for patient records with medical history
- **Appointment Scheduling**: Calendar-based appointment system with visit templates
- **AI Diagnosis Tool**: Mistral AI-powered symptom analysis and diagnosis suggestions
- **Visit Templates**: Pre-configured templates for common visit types
- **Medical History**: Searchable timeline of patient visits and treatments

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Mistral AI API
- **State Management**: TanStack Query (React Query)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd medivix
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon public key
- `MISTRAL_API_KEY`: Your Mistral AI API key

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL editor in your Supabase dashboard
3. Copy and run the SQL script from `database/schema.sql`

This will create all necessary tables, indexes, and sample data.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
medivix/
├── src/
│   ├── app/                  # Next.js app router pages
│   │   ├── api/             # API routes
│   │   ├── patients/        # Patient management pages
│   │   ├── appointments/    # Appointment scheduling pages
│   │   ├── diagnose/        # AI diagnosis tool
│   │   └── templates/       # Visit templates management
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   └── custom/         # Custom application components
│   └── lib/                # Utility functions
│       ├── supabase.ts     # Supabase client
│       ├── mistral.ts      # Mistral AI client
│       └── utils.ts        # General utilities
├── database/
│   └── schema.sql          # Database schema and sample data
└── public/                 # Static assets
```

## API Endpoints

- `GET /api/patients` - List all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/[id]` - Get patient details with history
- `PUT /api/patients/[id]` - Update patient
- `DELETE /api/patients/[id]` - Delete patient

- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/[id]` - Update appointment
- `DELETE /api/appointments/[id]` - Delete appointment

- `GET /api/templates` - List visit templates
- `POST /api/templates` - Create visit template

- `POST /api/diagnose` - AI diagnosis and follow-up suggestions

## Development

### Adding New Components

1. Create component in `src/components/`
2. Export from `src/components/index.ts`
3. Import and use in pages

### Database Changes

1. Update `src/lib/supabase.ts` type definitions
2. Create migration in `database/migrations/`
3. Update schema documentation

### AI Integration

The Mistral AI integration supports:
- Symptom analysis
- Diagnosis suggestions with confidence scores
- Follow-up recommendations (tests, referrals, appointments)

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `MISTRAL_API_KEY`

## Security

- Row Level Security (RLS) enabled on all Supabase tables
- Environment variables for all API keys
- Input validation with Zod schemas
- HIPAA compliance considerations built-in

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request