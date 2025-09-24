import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const medicalHistorySchema = z.object({
  patient_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional(),
  entry_type: z.enum(['diagnosis', 'treatment', 'medication', 'lab_result', 'procedure', 'note']),
  title: z.string().min(1),
  description: z.string(),
  date_recorded: z.string().datetime().optional(),
  provider_name: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['active', 'resolved', 'chronic', 'inactive']).default('active'),
  medications: z.array(z.string()).optional(),
  lab_values: z.record(z.any()).optional(),
  attachments: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patient_id')
    const entryType = searchParams.get('entry_type')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')

    let query = supabase
      .from('medical_history')
      .select(`
        *,
        patients (
          id,
          first_name,
          last_name,
          dob
        ),
        appointments (
          id,
          start_time,
          end_time,
          reason,
          status
        )
      `)
      .order('created_at', { ascending: false })

    if (patientId) {
      query = query.eq('patient_id', patientId)
    }

    // Note: entry_type and status filters will be applied after data transformation
    // if the original columns don't exist in the database schema yet

    if (limit) {
      const limitNum = parseInt(limit, 10)
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching medical history:', error)
      return NextResponse.json(
        { error: 'Failed to fetch medical history' },
        { status: 500 }
      )
    }

    // Transform data to ensure compatibility with frontend component
    let transformedData = data?.map((entry: any) => ({
      ...entry,
      // Map old schema fields to new expected fields for backward compatibility
      entry_type: entry.entry_type || 'diagnosis',
      title: entry.title || entry.diagnosis || 'Medical Record',
      description: entry.description || `${entry.treatment || ''} ${entry.follow_up_notes || ''}`.trim() || 'No description available',
      date_recorded: entry.date_recorded || entry.created_at,
      provider_name: entry.provider_name || 'Healthcare Provider',
      status: entry.status || 'resolved',
      severity: entry.severity || 'medium',
      medications: entry.medications || [],
      lab_values: entry.lab_values || {},
      attachments: entry.attachments || []
    })) || []

    // Apply client-side filters for transformed data
    if (entryType && entryType !== 'all') {
      transformedData = transformedData.filter((entry: any) => entry.entry_type === entryType)
    }

    if (status && status !== 'all') {
      transformedData = transformedData.filter((entry: any) => entry.status === status)
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error in GET /api/medical-history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = medicalHistorySchema.parse(body)

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

    // Check if appointment exists (if provided)
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
      if (appointment.patient_id !== validatedData.patient_id) {
        return NextResponse.json(
          { error: 'Appointment does not belong to the specified patient' },
          { status: 400 }
        )
      }
    }

    // Set default date_recorded if not provided
    if (!validatedData.date_recorded) {
      validatedData.date_recorded = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('medical_history')
      .insert([validatedData])
      .select(`
        *,
        patients (
          id,
          first_name,
          last_name,
          dob
        ),
        appointments (
          id,
          start_time,
          end_time,
          reason,
          status
        )
      `)
      .single()

    if (error) {
      console.error('Error creating medical history entry:', error)
      return NextResponse.json(
        { error: 'Failed to create medical history entry' },
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

    console.error('Error in POST /api/medical-history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}