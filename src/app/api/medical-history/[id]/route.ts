import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const medicalHistoryUpdateSchema = z.object({
  patient_id: z.string().uuid().optional(),
  appointment_id: z.string().uuid().optional(),
  entry_type: z.enum(['diagnosis', 'treatment', 'medication', 'lab_result', 'procedure', 'note']).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  date_recorded: z.string().datetime().optional(),
  provider_name: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['active', 'resolved', 'chronic', 'inactive']).optional(),
  medications: z.array(z.string()).optional(),
  lab_values: z.record(z.any()).optional(),
  attachments: z.array(z.string()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { data, error } = await supabase
      .from('medical_history')
      .select(`
        *,
        patients (
          id,
          first_name,
          last_name,
          date_of_birth,
          phone,
          email
        ),
        appointments (
          id,
          appointment_date,
          status,
          visit_templates (
            name,
            description
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Medical history entry not found' },
          { status: 404 }
        )
      }

      console.error('Error fetching medical history entry:', error)
      return NextResponse.json(
        { error: 'Failed to fetch medical history entry' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/medical-history/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const validatedData = medicalHistoryUpdateSchema.parse(body)

    // Check if medical history entry exists
    const { data: existingEntry, error: fetchError } = await supabase
      .from('medical_history')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Medical history entry not found' },
          { status: 404 }
        )
      }

      console.error('Error fetching medical history entry:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch medical history entry' },
        { status: 500 }
      )
    }

    // Check if patient exists (if patient_id is being updated)
    if (validatedData.patient_id) {
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('id', validatedData.patient_id)
        .single()

      if (patientError || !patient) {
        return NextResponse.json(
          { error: 'Patient not found' },
          { status: 404 }
        )
      }
    }

    // Check if appointment exists (if appointment_id is being updated)
    if (validatedData.appointment_id) {
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('id, patient_id')
        .eq('id', validatedData.appointment_id)
        .single()

      if (appointmentError || !appointment) {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        )
      }

      // Verify appointment belongs to the specified patient
      const patientId = validatedData.patient_id || existingEntry.patient_id
      if (appointment.patient_id !== patientId) {
        return NextResponse.json(
          { error: 'Appointment does not belong to the specified patient' },
          { status: 400 }
        )
      }
    }

    const { data, error } = await supabase
      .from('medical_history')
      .update(validatedData)
      .eq('id', id)
      .select(`
        *,
        patients (
          id,
          first_name,
          last_name,
          date_of_birth,
          phone,
          email
        ),
        appointments (
          id,
          appointment_date,
          status,
          visit_templates (
            name,
            description
          )
        )
      `)
      .single()

    if (error) {
      console.error('Error updating medical history entry:', error)
      return NextResponse.json(
        { error: 'Failed to update medical history entry' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in PUT /api/medical-history/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { error } = await supabase
      .from('medical_history')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting medical history entry:', error)
      return NextResponse.json(
        { error: 'Failed to delete medical history entry' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Medical history entry deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/medical-history/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}