/**
 * Standardized API response utilities for MediVIX
 * Provides consistent response formats across all endpoints
 */

import { NextResponse } from 'next/server'

// Base response interface
interface BaseResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp?: string
  meta?: ResponseMeta
}

// Metadata interface for pagination, counts, etc.
interface ResponseMeta {
  total?: number
  count?: number
  page?: number
  limit?: number
  has_more?: boolean
  filters?: Record<string, any>
  [key: string]: any
}

// Error details interface
interface ErrorDetails {
  field?: string
  message: string
  code?: string
}

/**
 * Create a successful response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  meta?: ResponseMeta,
  status: number = 200
): NextResponse {
  const response: BaseResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }

  if (message) response.message = message
  if (meta) response.meta = meta

  return NextResponse.json(response, { status })
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  status: number = 400,
  details?: ErrorDetails[]
): NextResponse {
  const response: BaseResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString()
  }

  if (details) {
    response.meta = { error_details: details }
  }

  return NextResponse.json(response, { status })
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(
  details: ErrorDetails[],
  message: string = 'Validation failed'
): NextResponse {
  return errorResponse(message, 400, details)
}

/**
 * Create a not found response
 */
export function notFoundResponse(
  resource: string = 'Resource'
): NextResponse {
  return errorResponse(`${resource} not found`, 404)
}

/**
 * Create a server error response
 */
export function serverErrorResponse(
  message: string = 'Internal server error',
  details?: string
): NextResponse {
  const response: BaseResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  }

  if (details && process.env.NODE_ENV === 'development') {
    response.meta = { error_details: details }
  }

  return NextResponse.json(response, { status: 500 })
}

/**
 * Create a created response (201)
 */
export function createdResponse<T>(
  data: T,
  message?: string,
  meta?: ResponseMeta
): NextResponse {
  return successResponse(data, message, meta, 201)
}

/**
 * Create a no content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 10,
  filters?: Record<string, any>
): NextResponse {
  const hasMore = page * limit < total
  const meta: ResponseMeta = {
    total,
    count: data.length,
    page,
    limit,
    has_more: hasMore,
    filters
  }

  return successResponse(data, undefined, meta)
}

/**
 * Format Zod validation errors
 */
export function formatZodErrors(errors: any[]): ErrorDetails[] {
  return errors.map(error => ({
    field: error.path?.join('.') || 'unknown',
    message: error.message,
    code: error.code
  }))
}

/**
 * Handle common API errors and return appropriate responses
 */
export function handleApiError(error: any): NextResponse {
  console.error('API Error:', error)

  // Zod validation errors
  if (error.name === 'ZodError') {
    return validationErrorResponse(formatZodErrors(error.errors))
  }

  // Database errors
  if (error.code) {
    switch (error.code) {
      case 'PGRST116': // PostgreSQL: row not found
        return notFoundResponse()
      case '23505': // PostgreSQL: unique constraint violation
        return errorResponse('Record already exists', 409)
      case '23503': // PostgreSQL: foreign key violation
        return errorResponse('Referenced record does not exist', 400)
      default:
        return serverErrorResponse('Database error', error.message)
    }
  }

  // Network/fetch errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return serverErrorResponse('External service unavailable')
  }

  // Default server error
  return serverErrorResponse(
    'Internal server error',
    process.env.NODE_ENV === 'development' ? error.message : undefined
  )
}

/**
 * Response format for health checks
 */
export function healthCheckResponse(
  status: 'healthy' | 'unhealthy' | 'degraded',
  checks: Record<string, any> = {}
): NextResponse {
  const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 207 : 503

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks
  }, { status: httpStatus })
}

/**
 * Response format for API documentation/info
 */
export function apiInfoResponse(): NextResponse {
  return successResponse({
    name: 'MediVIX API',
    version: process.env.npm_package_version || '1.0.0',
    description: 'Medical office management system API',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      patients: '/api/patients',
      appointments: '/api/appointments',
      templates: '/api/templates',
      medical_history: '/api/medical-history',
      diagnose: '/api/diagnose',
      drugs: '/api/drugs',
      health: '/api/health',
      database_status: '/api/database/status'
    },
    documentation: {
      timezone_support: 'All appointment endpoints support timezone parameters',
      drug_lookup: 'Drug information and interaction checking available',
      ai_diagnosis: 'AI-powered diagnosis suggestions with Mistral AI',
      local_development: 'SQLite database option for offline development'
    }
  })
}