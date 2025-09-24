import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'
import {
  convertAppointmentTimezone,
  checkAppointmentConflict,
  COMMON_TIMEZONES
} from '@/lib/timezone'

const appointmentSchema = z.object({
  patient_id: z.string().uuid(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  reason: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
  notes: z.string().optional(),
  timezone: z.string().optional().default('America/New_York'), // Default to Eastern Time
}).refine((data) => {
  const startTime = new Date(data.start_time)
  const endTime = new Date(data.end_time)
  return endTime > startTime
}, {
  message: 'End time must be after start time',
  path: ['end_time'],
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patient_id')
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const timezone = searchParams.get('timezone') || 'America/New_York'

    let query = supabase
      .from('appointments')
      .select(`
        *,
        patients (
          id,
          first_name,
          last_name,
          dob
        )
      `)
      .order('start_time', { ascending: true })

    if (patientId) {
      query = query.eq('patient_id', patientId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      query = query
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching appointments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      )
    }

    // Add timezone information to response
    const appointmentsWithTimezone = data?.map(appointment => ({
      ...appointment,
      timezone: timezone,
      timezone_options: COMMON_TIMEZONES
    }))

    return NextResponse.json(appointmentsWithTimezone)
  } catch (error) {
    console.error('Error in GET /api/appointments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = appointmentSchema.parse(body)

    // Check if patient exists
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

    // Check for scheduling conflicts
    const startTime = new Date(validatedData.start_time)
    const endTime = new Date(validatedData.end_time)

    const { data: conflicts, error: conflictError } = await supabase
      .from('appointments')
      .select('id, start_time, end_time')
      .neq('status', 'cancelled')
      .gte('start_time', startTime.toISOString())
      .lt('start_time', endTime.toISOString())

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

    const { data, error } = await supabase
      .from('appointments')
      .insert([validatedData])
      .select(`
        *,
        patients (
          id,
          first_name,
          last_name,
          dob
        )
      `)
      .single()

    if (error) {
      console.error('Error creating appointment:', error)
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in POST /api/appointments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}