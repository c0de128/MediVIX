import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Validation schema for patient updates
const PatientUpdateSchema = z.object({
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  dob: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }).optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  allergies: z.array(z.string()).optional(),
  chronic_conditions: z.array(z.string()).optional()
})

// GET /api/patients/[id] - Get patient details with medical history
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate UUID format
    if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return NextResponse.json(
        { error: 'Invalid patient ID' },
        { status: 400 }
      )
    }

    // Get patient details
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single()

    if (patientError) {
      if (patientError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Patient not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', patientError)
      return NextResponse.json(
        { error: 'Failed to fetch patient' },
        { status: 500 }
      )
    }

    // Get patient's medical history
    const { data: medicalHistory, error: historyError } = await supabase
      .from('medical_history')
      .select(`
        *,
        appointments (
          start_time,
          end_time,
          reason,
          status
        )
      `)
      .eq('patient_id', id)
      .order('created_at', { ascending: false })

    if (historyError) {
      console.error('History fetch error:', historyError)
      // Continue without history rather than failing completely
    }

    // Get upcoming appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', id)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })

    if (appointmentsError) {
      console.error('Appointments fetch error:', appointmentsError)
    }

    return NextResponse.json({
      patient,
      medical_history: medicalHistory || [],
      upcoming_appointments: appointments || []
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/patients/[id] - Update patient
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate UUID format
    if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return NextResponse.json(
        { error: 'Invalid patient ID' },
        { status: 400 }
      )
    }

    // Validate input data
    const validatedData = PatientUpdateSchema.parse(body)

    // Handle empty strings for optional fields
    const updateData = {
      ...validatedData,
      phone: validatedData.phone || null,
      email: validatedData.email || null,
      updated_at: new Date().toISOString()
    }

    const { data: patient, error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Patient not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update patient' },
        { status: 500 }
      )
    }

    return NextResponse.json(patient)
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

// DELETE /api/patients/[id] - Delete patient
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate UUID format
    if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return NextResponse.json(
        { error: 'Invalid patient ID' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete patient' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Patient deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}