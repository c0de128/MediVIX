import { NextRequest, NextResponse } from 'next/server'

// In-memory store for rate limiting (in production, use Redis or similar)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
  skipSuccessfulRequests?: boolean // Don't count successful requests
}

export function createRateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false
  } = options

  return async function rateLimit(request: NextRequest, response?: NextResponse): Promise<NextResponse | null> {
    // Get client identifier (IP address)
    const identifier = getClientIdentifier(request)
    const now = Date.now()

    // Clean up expired entries
    cleanupExpiredEntries(now)

    // Get or create request count for this identifier
    let requestData = requestCounts.get(identifier)

    if (!requestData || now > requestData.resetTime) {
      // Create new window
      requestData = {
        count: 1,
        resetTime: now + windowMs
      }
      requestCounts.set(identifier, requestData)
    } else {
      // Increment count in current window
      requestData.count++
    }

    // Check if limit exceeded
    if (requestData.count > maxRequests) {
      return NextResponse.json(
        {
          error: message,
          retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((requestData.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(requestData.resetTime).toISOString()
          }
        }
      )
    }

    // Add rate limit headers to successful responses
    if (response) {
      response.headers.set('X-RateLimit-Limit', maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', (maxRequests - requestData.count).toString())
      response.headers.set('X-RateLimit-Reset', new Date(requestData.resetTime).toISOString())
    }

    return null // No rate limit exceeded
  }
}

function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers (considering proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const clientIp = request.headers.get('cf-connecting-ip') // Cloudflare

  let ip = forwarded?.split(',')[0] || realIp || clientIp || 'unknown'

  // Remove IPv6 prefix if present
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7)
  }

  return ip
}

function cleanupExpiredEntries(now: number) {
  for (const [key, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(key)
    }
  }
}

// Predefined rate limiters for different endpoints
export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many API requests from this IP, please try again later.'
})

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts from this IP, please try again later.'
})

export const createOperationRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 create operations per minute
  message: 'Too many create requests from this IP, please slow down.'
})

// Wrapper function to apply rate limiting to API routes
export function withRateLimit(rateLimiter: ReturnType<typeof createRateLimit>) {
  return function <T extends Function>(handler: T): T {
    return (async (request: NextRequest, ...args: any[]) => {
      const rateLimitResponse = await rateLimiter(request)
      if (rateLimitResponse) {
        return rateLimitResponse
      }
      return handler(request, ...args)
    }) as unknown as T
  }
}