import { NextResponse } from 'next/server'
import { dbInterface, isDevelopmentMode } from '@/lib/database/config'

// GET /api/database/status - Get database status and configuration
export async function GET() {
  try {
    const healthCheck = await dbInterface.healthCheck()

    const response = {
      ...healthCheck,
      development_mode: isDevelopmentMode,
      configuration: {
        database_type: process.env.DATABASE_TYPE || 'supabase',
        environment: process.env.NODE_ENV || 'development'
      },
      endpoints: {
        switch_to_sqlite: '/api/database/switch?type=sqlite',
        switch_to_supabase: '/api/database/switch?type=supabase',
        reinitialize: '/api/database/reinitialize'
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Database status check failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to check database status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/database/status - Force health check refresh
export async function POST() {
  try {
    // Force a fresh health check
    const healthCheck = await dbInterface.healthCheck()

    return NextResponse.json({
      message: 'Health check refreshed',
      timestamp: new Date().toISOString(),
      ...healthCheck
    })

  } catch (error) {
    console.error('Database health check failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}