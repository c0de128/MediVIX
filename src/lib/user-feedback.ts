import { toast } from '@/hooks/use-toast'
import { ApiError, ErrorType, isApiError } from './error-handling'

// User-friendly error messages
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.VALIDATION]: 'Please check your input and try again',
  [ErrorType.AUTHENTICATION]: 'Please log in to continue',
  [ErrorType.AUTHORIZATION]: 'You do not have permission to perform this action',
  [ErrorType.NOT_FOUND]: 'The requested resource was not found',
  [ErrorType.CONFLICT]: 'This resource already exists or conflicts with existing data',
  [ErrorType.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again',
  [ErrorType.EXTERNAL_SERVICE]: 'External service is temporarily unavailable',
  [ErrorType.DATABASE]: 'Database operation failed. Please try again',
  [ErrorType.INTERNAL]: 'An unexpected error occurred. Please try again',
}

// Extract user-friendly message from error
export function getUserFriendlyMessage(error: unknown): string {
  if (isApiError(error)) {
    // For validation errors, show specific field errors
    if (error.type === ErrorType.VALIDATION && error.details) {
      if (Array.isArray(error.details)) {
        const fieldErrors = error.details.map((detail: any) => {
          if (detail.field && detail.message) {
            return `${detail.field}: ${detail.message}`
          }
          return detail.message || 'Invalid input'
        })
        return fieldErrors.join(', ')
      }
    }

    return error.message || ERROR_MESSAGES[error.type] || ERROR_MESSAGES[ErrorType.INTERNAL]
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred'
}

// Extract error title for display
export function getErrorTitle(error: unknown): string {
  if (isApiError(error)) {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return 'Validation Error'
      case ErrorType.AUTHENTICATION:
        return 'Authentication Required'
      case ErrorType.AUTHORIZATION:
        return 'Permission Denied'
      case ErrorType.NOT_FOUND:
        return 'Not Found'
      case ErrorType.CONFLICT:
        return 'Conflict'
      case ErrorType.RATE_LIMIT:
        return 'Rate Limited'
      case ErrorType.EXTERNAL_SERVICE:
        return 'Service Unavailable'
      case ErrorType.DATABASE:
        return 'Database Error'
      default:
        return 'Error'
    }
  }

  return 'Error'
}

// Show error toast with user-friendly message
export function showErrorToast(error: unknown) {
  const title = getErrorTitle(error)
  const message = getUserFriendlyMessage(error)

  toast({
    title,
    description: message,
    variant: 'destructive',
  })
}

// Show success toast
export function showSuccessToast(title: string, description?: string) {
  toast({
    title,
    description,
  })
}

// Show info toast
export function showInfoToast(title: string, description?: string) {
  toast({
    title,
    description,
  })
}

// Show warning toast
export function showWarningToast(title: string, description?: string) {
  toast({
    title,
    description,
    variant: 'destructive',
  })
}

// Handle API response errors
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: any
    try {
      errorData = await response.json()
    } catch {
      errorData = {
        type: ErrorType.INTERNAL,
        message: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
        timestamp: new Date().toISOString(),
      }
    }

    throw errorData
  }

  return response.json()
}

// Wrapper for API calls with automatic error handling
export async function apiCall<T>(
  url: string,
  options?: RequestInit,
  showToastOnError = true
): Promise<T> {
  try {
    const response = await fetch(url, options)
    return await handleApiResponse<T>(response)
  } catch (error) {
    if (showToastOnError) {
      showErrorToast(error)
    }
    throw error
  }
}

// Form error utility
export interface FormFieldError {
  field: string
  message: string
}

export function extractFormErrors(error: unknown): FormFieldError[] {
  if (isApiError(error) && error.type === ErrorType.VALIDATION && error.details) {
    if (Array.isArray(error.details)) {
      return error.details
        .filter((detail: any) => detail.field && detail.message)
        .map((detail: any) => ({
          field: detail.field,
          message: detail.message,
        }))
    }
  }

  return []
}

// Set form errors on React Hook Form
export function setFormErrors(
  error: unknown,
  setError: (name: string, error: { message: string }) => void
) {
  const formErrors = extractFormErrors(error)
  formErrors.forEach(({ field, message }) => {
    setError(field, { message })
  })
}

// Loading state utilities
export interface LoadingState {
  isLoading: boolean
  error: string | null
  data: any | null
}

export function createLoadingState(): LoadingState {
  return {
    isLoading: false,
    error: null,
    data: null,
  }
}

export function setLoadingState(
  state: LoadingState,
  loading: boolean,
  error: unknown = null,
  data: any = null
): LoadingState {
  return {
    isLoading: loading,
    error: error ? getUserFriendlyMessage(error) : null,
    data,
  }
}

// Retry utility
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      // Don't retry on validation errors or client errors (4xx)
      if (isApiError(error)) {
        if (error.statusCode >= 400 && error.statusCode < 500) {
          throw error
        }
      }

      // Wait before retrying (except on last attempt)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }

  throw lastError
}

// Network status utilities
export function isOnline(): boolean {
  return navigator.onLine
}

export function showOfflineToast() {
  toast({
    title: 'No Internet Connection',
    description: 'Please check your connection and try again',
    variant: 'destructive',
  })
}

export function showOnlineToast() {
  toast({
    title: 'Connection Restored',
    description: 'You are back online',
  })
}