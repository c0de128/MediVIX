import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const appointmentUpdateSchema = z.object({
  patient_id: z.string().uuid().optional(),
  visit_template_id: z.string().uuid().optional(),
  appointment_date: z.string().datetime().optional(),
  duration_minutes: z.number().min(15).max(480).optional(),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
  notes: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { data, error } = await supabase
      .from('appointments')
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
        visit_templates (
          id,
          name,
          description,
          duration_minutes,
          procedures
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        )
      }

      console.error('Error fetching appointment:', error)
      return NextResponse.json(
        { error: 'Failed to fetch appointment' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/appointments/[id]:', error)
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
    const validatedData = appointmentUpdateSchema.parse(body)

    // Check if appointment exists
    const { data: existingAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        )
      }

      console.error('Error fetching appointment:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch appointment' },
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

    // Check if visit template exists (if being updated)
    if (validatedData.visit_template_id) {
      const { data: template, error: templateError } = await supabase
        .from('visit_templates')
        .select('id, duration_minutes')
        .eq('id', validatedData.visit_template_id)
        .single()

      if (templateError || !template) {
        return NextResponse.json(
          { error: 'Visit template not found' },
          { status: 404 }
        )
      }

      // Use template duration if not specified
      if (!validatedData.duration_minutes) {
        validatedData.duration_minutes = template.duration_minutes
      }
    }

    // Check for scheduling conflicts (if time or duration is being updated)
    if (validatedData.appointment_date || validatedData.duration_minutes) {
      const appointmentDate = new Date(validatedData.appointment_date || existingAppointment.appointment_date)
      const duration = validatedData.duration_minutes || existingAppointment.duration_minutes
      const endTime = new Date(appointmentDate.getTime() + duration * 60000)

      const { data: conflicts, error: conflictError } = await supabase
        .from('appointments')
        .select('id, appointment_date, duration_minutes')
        .neq('id', id) // Exclude current appointment
        .neq('status', 'cancelled')
        .gte('appointment_date', appointmentDate.toISOString())
        .lt('appointment_date', endTime.toISOString())

      if (conflictError) {
        console.error('Error checking conflicts:', conflictError)
        return NextResponse.json(
          { error: 'Failed to check scheduling conflicts' },
          { status: 500 }
        )
      }

      if (conflicts && conflicts.length > 0) {
        return NextResponse.json(
          { error: 'Scheduling conflict detected. Please choose a different time.' },
          { status: 409 }
        )
      }
    }

    const { data, error } = await supabase
      .from('appointments')
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
        visit_templates (
          id,
          name,
          description,
          duration_minutes,
          procedures
        )
      `)
      .single()

    if (error) {
      console.error('Error updating appointment:', error)
      return NextResponse.json(
        { error: 'Failed to update appointment' },
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

    console.error('Error in PUT /api/appointments/[id]:', error)
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
      .from('appointments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting appointment:', error)
      return NextResponse.json(
        { error: 'Failed to delete appointment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Appointment deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/appointments/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}