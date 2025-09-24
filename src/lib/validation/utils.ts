import { z } from 'zod'
import { NextRequest } from 'next/server'
import { InputSanitizer } from '@/lib/security-headers'

// Validation result type
export type ValidationResult<T> = {
  success: true
  data: T
} | {
  success: false
  errors: string[]
}

// Generic validation function
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.parse(data)
    return {
      success: true,
      data: result,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(issue =>
          `${issue.path.join('.')}: ${issue.message}`
        ),
      }
    }
    return {
      success: false,
      errors: ['Validation failed'],
    }
  }
}

// Safe validation function that returns partial data
export function validatePartial<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { data: Partial<T>; errors: string[] } {
  try {
    const result = schema.parse(data)
    return {
      data: result,
      errors: [],
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validData: any = {}
      const errors: string[] = []

      // Extract valid fields
      Object.entries(data as Record<string, unknown> || {}).forEach(([key, value]) => {
        try {
          const fieldSchema = (schema as any).shape?.[key]
          if (fieldSchema) {
            const fieldResult = fieldSchema.parse(value)
            validData[key] = fieldResult
          }
        } catch {
          // Field is invalid, skip it
        }
      })

      error.issues.forEach(issue => {
        errors.push(`${issue.path.join('.')}: ${issue.message}`)
      })

      return {
        data: validData,
        errors,
      }
    }

    return {
      data: {},
      errors: ['Validation failed'],
    }
  }
}

// API validation middleware
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json()
    return validateData(schema, body)
  } catch (error) {
    return {
      success: false,
      errors: ['Invalid JSON in request body'],
    }
  }
}

// Query parameter validation
export function validateSearchParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  const params: Record<string, unknown> = {}

  for (const [key, value] of searchParams.entries()) {
    // Handle arrays (e.g., ?tags=tag1&tags=tag2)
    if (params[key]) {
      if (Array.isArray(params[key])) {
        (params[key] as unknown[]).push(value)
      } else {
        params[key] = [params[key], value]
      }
    } else {
      params[key] = value
    }
  }

  return validateData(schema, params)
}

// Form validation helper for React Hook Form
export function createFormValidator<T>(schema: z.ZodSchema<T>) {
  return {
    schema,
    validate: (data: unknown) => validateData(schema, data),
    validatePartial: (data: unknown) => validatePartial(schema, data),
  }
}

// Sanitization utilities
export const sanitizeUtils = {
  // Remove HTML tags and dangerous content
  sanitizeString: (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim()
  },

  // Sanitize phone number
  sanitizePhone: (phone: string): string => {
    return phone.replace(/[^\d\+\-\(\)\s]/g, '').trim()
  },

  // Sanitize email
  sanitizeEmail: (email: string): string => {
    return email.toLowerCase().trim()
  },

  // Sanitize array input
  sanitizeArray: (arr: unknown): string[] => {
    if (!Array.isArray(arr)) return []
    return arr
      .filter(item => typeof item === 'string')
      .map(item => sanitizeUtils.sanitizeString(item))
      .filter(item => item.length > 0)
  },

  // Remove SQL injection patterns (enhanced)
  sanitizeSql: (input: string): string => {
    return input
      .replace(/[';\\x00\\n\\r\\x1a]/g, '')
      .replace(/\b(DROP|DELETE|INSERT|UPDATE|SELECT|UNION|CREATE|ALTER|EXEC|EXECUTE)\b/gi, '')
  },

  // Validate input for potential security threats
  validateInput: (input: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Check for SQL injection patterns
    if (InputSanitizer.hasSQLInjectionPattern(input)) {
      errors.push('Input contains SQL injection patterns')
    }

    // Check for XSS patterns
    if (InputSanitizer.hasXSSPattern(input)) {
      errors.push('Input contains XSS patterns')
    }

    // Check for excessively long input
    if (input.length > 10000) {
      errors.push('Input exceeds maximum length')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // Sanitize UUID
  sanitizeUUID: (uuid: string): string => {
    return InputSanitizer.sanitizeUUID(uuid)
  },
}

// Validation error formatting
export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) return ''
  if (errors.length === 1) return errors[0]

  return `Multiple errors found:\n${errors.map(error => `• ${error}`).join('\n')}`
}

// Async validation utilities
export class AsyncValidator<T> {
  private schema: z.ZodSchema<T>

  constructor(schema: z.ZodSchema<T>) {
    this.schema = schema
  }

  async validate(data: unknown): Promise<ValidationResult<T>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(validateData(this.schema, data))
      }, 0)
    })
  }

  async validateWithCustomRules(
    data: unknown,
    customRules: Array<(data: T) => Promise<string | null>>
  ): Promise<ValidationResult<T>> {
    const baseValidation = validateData(this.schema, data)

    if (!baseValidation.success) {
      return baseValidation
    }

    try {
      const customErrors: string[] = []

      for (const rule of customRules) {
        const error = await rule(baseValidation.data)
        if (error) {
          customErrors.push(error)
        }
      }

      if (customErrors.length > 0) {
        return {
          success: false,
          errors: customErrors,
        }
      }

      return baseValidation
    } catch (error) {
      return {
        success: false,
        errors: ['Custom validation failed'],
      }
    }
  }
}

// Field-level validation helpers
export const fieldValidators = {
  // Real-time email validation
  validateEmailField: (email: string): string | null => {
    if (!email) return null
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Invalid email format'
    }
    return null
  },

  // Real-time phone validation
  validatePhoneField: (phone: string): string | null => {
    if (!phone) return null
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    if (!/^[\+]?[1-9][\d]{7,14}$/.test(cleanPhone)) {
      return 'Invalid phone number format'
    }
    return null
  },

  // Password strength validation
  validatePasswordStrength: (password: string): {
    isValid: boolean
    score: number
    feedback: string[]
  } => {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) score += 1
    else feedback.push('Password should be at least 8 characters')

    if (/[a-z]/.test(password)) score += 1
    else feedback.push('Add lowercase letters')

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('Add uppercase letters')

    if (/\d/.test(password)) score += 1
    else feedback.push('Add numbers')

    if (/[^a-zA-Z\d]/.test(password)) score += 1
    else feedback.push('Add special characters')

    return {
      isValid: score >= 4,
      score,
      feedback,
    }
  },

  // Date validation
  validateDateField: (date: string): string | null => {
    if (!date) return null
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      return 'Invalid date format'
    }
    return null
  },

  // Age validation
  validateAge: (birthDate: string): string | null => {
    const birth = new Date(birthDate)
    const today = new Date()
    const age = today.getFullYear() - birth.getFullYear()

    if (age < 0 || age > 150) {
      return 'Invalid age'
    }
    return null
  },
}

// Export utility function for creating validation middleware
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest) => {
    return validateRequestBody(request, schema)
  }
}