import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// Error types
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  CONFLICT = 'CONFLICT_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  DATABASE = 'DATABASE_ERROR',
  INTERNAL = 'INTERNAL_SERVER_ERROR',
}

export interface ApiError {
  type: ErrorType
  message: string
  details?: any
  statusCode: number
  timestamp: string
  path?: string
}

// Create standardized API error response
export function createApiError(
  type: ErrorType,
  message: string,
  statusCode: number,
  details?: any,
  path?: string
): ApiError {
  return {
    type,
    message,
    details,
    statusCode,
    timestamp: new Date().toISOString(),
    path,
  }
}

// Handle different error types and return appropriate responses
export function handleApiError(error: unknown, path?: string): NextResponse {
  console.error('API Error:', error)

  // Validation errors (Zod)
  if (error instanceof ZodError) {
    const validationErrors = error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }))

    const apiError = createApiError(
      ErrorType.VALIDATION,
      'Invalid input data',
      400,
      validationErrors,
      path
    )

    return NextResponse.json(apiError, { status: 400 })
  }

  // Supabase/PostgreSQL errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as any

    // Handle specific database errors
    switch (dbError.code) {
      case '23505': // unique_violation
        const apiError = createApiError(
          ErrorType.CONFLICT,
          'Resource already exists',
          409,
          { postgres_error: dbError.message },
          path
        )
        return NextResponse.json(apiError, { status: 409 })

      case '23503': // foreign_key_violation
        const fkError = createApiError(
          ErrorType.VALIDATION,
          'Referenced resource does not exist',
          400,
          { postgres_error: dbError.message },
          path
        )
        return NextResponse.json(fkError, { status: 400 })

      case '23502': // not_null_violation
        const nullError = createApiError(
          ErrorType.VALIDATION,
          'Required field is missing',
          400,
          { postgres_error: dbError.message },
          path
        )
        return NextResponse.json(nullError, { status: 400 })

      case 'PGRST200': // PostgREST relationship not found
        const relError = createApiError(
          ErrorType.DATABASE,
          'Database relationship error',
          500,
          { postgres_error: dbError.message },
          path
        )
        return NextResponse.json(relError, { status: 500 })

      default:
        const dbApiError = createApiError(
          ErrorType.DATABASE,
          'Database operation failed',
          500,
          { postgres_error: dbError.message, code: dbError.code },
          path
        )
        return NextResponse.json(dbApiError, { status: 500 })
    }
  }

  // HTTP errors with status codes
  if (error && typeof error === 'object' && 'status' in error) {
    const httpError = error as any
    let errorType = ErrorType.INTERNAL

    switch (httpError.status) {
      case 401:
        errorType = ErrorType.AUTHENTICATION
        break
      case 403:
        errorType = ErrorType.AUTHORIZATION
        break
      case 404:
        errorType = ErrorType.NOT_FOUND
        break
      case 409:
        errorType = ErrorType.CONFLICT
        break
      case 429:
        errorType = ErrorType.RATE_LIMIT
        break
    }

    const apiError = createApiError(
      errorType,
      httpError.message || 'HTTP error occurred',
      httpError.status,
      httpError,
      path
    )

    return NextResponse.json(apiError, { status: httpError.status })
  }

  // Generic error fallback
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  const apiError = createApiError(
    ErrorType.INTERNAL,
    message,
    500,
    error instanceof Error ? { stack: error.stack } : { error },
    path
  )

  return NextResponse.json(apiError, { status: 500 })
}

// Async wrapper for API routes with error handling
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      // Extract path from request if available
      const request = args.find(arg => arg && typeof arg === 'object' && 'url' in arg)
      const path = request?.url ? new URL(request.url).pathname : undefined

      return handleApiError(error, path)
    }
  }
}

// Custom error classes
export class ApiValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'ApiValidationError'
  }
}

export class ApiNotFoundError extends Error {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with id ${id}` : ''} not found`)
    this.name = 'ApiNotFoundError'
  }
}

export class ApiConflictError extends Error {
  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'ApiConflictError'
  }
}

export class ApiAuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'ApiAuthenticationError'
  }
}

export class ApiAuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message)
    this.name = 'ApiAuthorizationError'
  }
}

// Error handler for specific error types
export function throwApiError(error: unknown): never {
  if (error instanceof ApiValidationError) {
    throw error
  }
  if (error instanceof ApiNotFoundError) {
    throw error
  }
  if (error instanceof ApiConflictError) {
    throw error
  }
  if (error instanceof ApiAuthenticationError) {
    throw error
  }
  if (error instanceof ApiAuthorizationError) {
    throw error
  }

  // Default to internal server error
  throw new Error(error instanceof Error ? error.message : 'Internal server error')
}

// Utility to check if error is API error
export function isApiError(error: unknown): error is ApiError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'type' in error &&
    'message' in error &&
    'statusCode' in error &&
    'timestamp' in error
  )
}

// Format error for logging
export function formatErrorForLogging(error: unknown, context?: string): string {
  const timestamp = new Date().toISOString()
  const contextStr = context ? `[${context}] ` : ''

  if (error instanceof Error) {
    return `${timestamp} ${contextStr}${error.name}: ${error.message}\n${error.stack}`
  }

  if (isApiError(error)) {
    return `${timestamp} ${contextStr}API Error - ${error.type}: ${error.message}\nDetails: ${JSON.stringify(error.details, null, 2)}`
  }

  return `${timestamp} ${contextStr}Unknown Error: ${JSON.stringify(error, null, 2)}`
}