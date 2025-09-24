import { dbInterface } from '@/lib/database/config'
import { healthCheckResponse } from '@/lib/api-response'

export async function GET() {
  const startTime = Date.now()

  try {
    // Check database health
    const dbHealthStart = Date.now()
    const dbHealth = await dbInterface.healthCheck()
    const dbResponseTime = Date.now() - dbHealthStart

    // Enhanced AI service check
    const aiServiceCheck = {
      status: process.env.MISTRAL_API_KEY ? 'configured' : 'not_configured',
      available: Boolean(process.env.MISTRAL_API_KEY),
      configured: Boolean(process.env.MISTRAL_API_KEY),
      api_key_present: Boolean(process.env.MISTRAL_API_KEY)
    }

    // System information
    const systemInfo = {
      node_version: process.version,
      platform: process.platform,
      architecture: process.arch,
      memory_usage: process.memoryUsage(),
      uptime: Math.floor(process.uptime()),
      pid: process.pid
    }

    // Enhanced environment info
    const environmentInfo = {
      node_env: process.env.NODE_ENV || 'development',
      database_type: process.env.DATABASE_TYPE || 'supabase',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: 'en-US'
    }

    // Performance metrics
    const performanceMetrics = {
      response_time_ms: Date.now() - startTime,
      database_response_time_ms: dbResponseTime,
      memory: {
        rss: Math.round(systemInfo.memory_usage.rss / 1024 / 1024), // MB
        heap_used: Math.round(systemInfo.memory_usage.heapUsed / 1024 / 1024), // MB
        heap_total: Math.round(systemInfo.memory_usage.heapTotal / 1024 / 1024), // MB
        external: Math.round(systemInfo.memory_usage.external / 1024 / 1024) // MB
      },
      uptime_seconds: systemInfo.uptime
    }

    // Determine overall status
    const isHealthy = dbHealth.status === 'healthy' && aiServiceCheck.available
    const overallStatus = isHealthy ? 'healthy' : 'degraded'

    const checks = {
      database: {
        status: dbHealth.status,
        type: dbHealth.database,
        response_time_ms: dbResponseTime,
        connection: dbHealth.status === 'healthy' ? 'established' : 'failed',
        ...(dbHealth.stats && { stats: dbHealth.stats }),
        ...(dbHealth.error && { error: dbHealth.error })
      },
      ai_service: aiServiceCheck,
      environment: environmentInfo,
      system: systemInfo,
      performance: performanceMetrics
    }

    return healthCheckResponse(overallStatus, checks)

  } catch (error) {
    console.error('Health check failed:', error)

    const errorResponseTime = Date.now() - startTime

    return healthCheckResponse('unhealthy', {
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      response_time_ms: errorResponseTime,
      timestamp: new Date().toISOString()
    })
  }
}