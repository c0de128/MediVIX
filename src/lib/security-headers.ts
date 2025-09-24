import { NextRequest, NextResponse } from 'next/server'

export interface SecurityHeadersOptions {
  csp?: string | boolean // Content Security Policy
  hsts?: boolean // HTTP Strict Transport Security
  nosniff?: boolean // X-Content-Type-Options
  frameOptions?: 'DENY' | 'SAMEORIGIN' | string // X-Frame-Options
  xssProtection?: boolean // X-XSS-Protection
  referrerPolicy?: string // Referrer-Policy
  permissionsPolicy?: string // Permissions-Policy
}

const defaultOptions: SecurityHeadersOptions = {
  csp: true,
  hsts: true,
  nosniff: true,
  frameOptions: 'DENY',
  xssProtection: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
}

// Default Content Security Policy for medical applications
const defaultCSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Unsafe eval needed for Next.js dev
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.supabase.co wss://realtime.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests"
].join('; ')

export function addSecurityHeaders(
  response: NextResponse,
  options: SecurityHeadersOptions = {}
): NextResponse {
  const config = { ...defaultOptions, ...options }

  // Content Security Policy
  if (config.csp) {
    const cspValue = typeof config.csp === 'string' ? config.csp : defaultCSP
    response.headers.set('Content-Security-Policy', cspValue)
  }

  // HTTP Strict Transport Security
  if (config.hsts) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // Prevent MIME type sniffing
  if (config.nosniff) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
  }

  // Frame options
  if (config.frameOptions) {
    response.headers.set('X-Frame-Options', config.frameOptions)
  }

  // XSS Protection
  if (config.xssProtection) {
    response.headers.set('X-XSS-Protection', '1; mode=block')
  }

  // Referrer Policy
  if (config.referrerPolicy) {
    response.headers.set('Referrer-Policy', config.referrerPolicy)
  }

  // Permissions Policy
  if (config.permissionsPolicy) {
    response.headers.set('Permissions-Policy', config.permissionsPolicy)
  }

  // Additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Download-Options', 'noopen')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

  return response
}

// Wrapper function to apply security headers to API routes
export function withSecurityHeaders(options?: SecurityHeadersOptions) {
  return function <T extends Function>(handler: T): T {
    return (async (request: NextRequest, ...args: any[]) => {
      const response = await handler(request, ...args)

      // Only add headers to NextResponse objects
      if (response instanceof NextResponse) {
        return addSecurityHeaders(response, options)
      }

      return response
    }) as unknown as T
  }
}

// Helper function to validate origins for CORS
export function isValidOrigin(origin: string, allowedOrigins: string[]): boolean {
  if (!origin) return false

  return allowedOrigins.some(allowed => {
    if (allowed === '*') return true
    if (allowed === origin) return true
    if (allowed.startsWith('*.')) {
      const domain = allowed.substring(2)
      return origin.endsWith(domain)
    }
    return false
  })
}

// CORS configuration for medical applications
export function configureCORS(
  response: NextResponse,
  allowedOrigins: string[] = ['http://localhost:3000', 'http://localhost:3007'],
  allowedMethods: string[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: string[] = ['Content-Type', 'Authorization', 'X-Requested-With']
): NextResponse {
  // Set CORS headers
  response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '))
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '))
  response.headers.set('Access-Control-Max-Age', '86400') // 24 hours

  return response
}

// Input sanitization helpers
export class InputSanitizer {
  // Remove potentially dangerous characters
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>\"']/g, '') // Remove HTML/script injection characters
      .replace(/\0/g, '') // Remove null bytes
      .trim()
  }

  // Sanitize email addresses
  static sanitizeEmail(email: string): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const sanitized = this.sanitizeString(email).toLowerCase()
    return emailRegex.test(sanitized) ? sanitized : ''
  }

  // Sanitize phone numbers
  static sanitizePhone(phone: string): string {
    // Keep only digits, spaces, hyphens, parentheses, and plus sign
    return phone.replace(/[^0-9\s\-\(\)\+]/g, '').trim()
  }

  // Sanitize numeric inputs
  static sanitizeNumeric(input: string): string {
    return input.replace(/[^0-9.-]/g, '')
  }

  // Validate and sanitize UUIDs
  static sanitizeUUID(uuid: string): string {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const sanitized = uuid.toLowerCase().trim()
    return uuidRegex.test(sanitized) ? sanitized : ''
  }

  // Sanitize arrays of strings
  static sanitizeArray(arr: string[]): string[] {
    return arr
      .filter(item => typeof item === 'string')
      .map(item => this.sanitizeString(item))
      .filter(item => item.length > 0)
  }

  // Check for potential SQL injection patterns
  static hasSQLInjectionPattern(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(--|#|\/\*|\*\/)/,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+['"][^'"]*['"]\s*=\s*['"][^'"]*['"])/i
    ]

    return sqlPatterns.some(pattern => pattern.test(input))
  }

  // Check for potential XSS patterns
  static hasXSSPattern(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi
    ]

    return xssPatterns.some(pattern => pattern.test(input))
  }
}