import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Validation schema for visit template data
const TemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  duration_minutes: z.number().min(5, 'Duration must be at least 5 minutes').max(480, 'Duration cannot exceed 8 hours'),
  default_notes: z.string().optional(),
  common_diagnoses: z.array(z.string()).default([])
})

// GET /api/templates - List all visit templates
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let query = supabase
      .from('visit_templates')
      .select('*')
      .order('name', { ascending: true })

    // Add search functionality
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: templates, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      )
    }

    return NextResponse.json(templates)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/templates - Create new visit template
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input data
    const validatedData = TemplateSchema.parse(body)

    // Handle optional fields
    const templateData = {
      ...validatedData,
      description: validatedData.description || null,
      default_notes: validatedData.default_notes || null,
    }

    const { data: template, error } = await supabase
      .from('visit_templates')
      .insert(templateData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      )
    }

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}