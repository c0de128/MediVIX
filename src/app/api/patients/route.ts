import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'
import { withErrorHandling, ApiNotFoundError, ApiConflictError } from '@/lib/error-handling'
import { patientSchemas } from '@/lib/validation/schemas'
import { apiRateLimit, createOperationRateLimit } from '@/lib/rate-limiting'
import { addSecurityHeaders } from '@/lib/security-headers'

// Use centralized validation schema
const PatientSchema = patientSchemas.create

// Query parameters validation schema
const queryParamsSchema = z.object({
  search: z.string().max(100).optional().nullable(),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100').optional().nullable(),
  offset: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 0, 'Offset must be non-negative').optional().nullable(),
}).transform(data => ({
  search: data.search || undefined,
  limit: data.limit || undefined,
  offset: data.offset || undefined,
}))

// GET /api/patients - List all patients
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Apply rate limiting
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }
  const { searchParams } = new URL(request.url)

  // Validate query parameters
  const queryParams = queryParamsSchema.parse({
    search: searchParams.get('search'),
    limit: searchParams.get('limit'),
    offset: searchParams.get('offset'),
  })

  const { search, limit, offset } = queryParams

  let query = supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })

    // Add search functionality with sanitized input
    if (search) {
      // Sanitize search input to prevent injection attacks
      const sanitizedSearch = search.replace(/[%_]/g, '\\$&')
      query = query.or(`first_name.ilike.%${sanitizedSearch}%,last_name.ilike.%${sanitizedSearch}%,email.ilike.%${sanitizedSearch}%`)
    }

    // Add pagination
    if (limit) {
      query = query.limit(limit)
    }
    if (offset) {
      query = query.range(offset, offset + (limit || 50) - 1)
    }

  const { data: patients, error } = await query

  if (error) {
    throw error
  }

  const response = NextResponse.json(patients)
  return addSecurityHeaders(response)
})

// POST /api/patients - Create new patient
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Apply rate limiting for create operations
  const rateLimitResponse = await createOperationRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const body = await request.json()

  // Validate input data
  const validatedData = PatientSchema.parse(body)

  // Handle empty strings for optional fields
  const patientData = {
    ...validatedData,
    phone: validatedData.phone || null,
    email: validatedData.email || null,
  }

  const { data: patient, error } = await supabase
    .from('patients')
    .insert(patientData)
    .select()
    .single()

  if (error) {
    throw error
  }

  const response = NextResponse.json(patient, { status: 201 })
  return addSecurityHeaders(response)
})