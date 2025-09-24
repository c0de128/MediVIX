import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  generateTimeSlots,
  COMMON_TIMEZONES,
  checkAppointmentConflict
} from '@/lib/timezone'
import { dbInterface } from '@/lib/database/config'

// Validation schema for time slot generation
const timeSlotsSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  timezone: z.string().default('America/New_York'),
  start_hour: z.number().min(0).max(23).default(8),
  end_hour: z.number().min(1).max(24).default(17),
  slot_duration: z.number().min(15).max(120).default(30), // minutes
  provider_id: z.string().optional() // future use for multi-provider scheduling
})

// GET /api/appointments/slots - Generate available time slots
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const queryParams = {
      date: searchParams.get('date') || new Date().toISOString().split('T')[0],
      timezone: searchParams.get('timezone') || 'America/New_York',
      start_hour: parseInt(searchParams.get('start_hour') || '8'),
      end_hour: parseInt(searchParams.get('end_hour') || '17'),
      slot_duration: parseInt(searchParams.get('slot_duration') || '30'),
      provider_id: searchParams.get('provider_id') || undefined
    }

    // Validate input parameters
    const validatedParams = timeSlotsSchema.parse(queryParams)

    // Generate all possible time slots for the date
    const requestedDate = new Date(validatedParams.date)
    const allSlots = generateTimeSlots(
      requestedDate,
      validatedParams.timezone,
      validatedParams.start_hour,
      validatedParams.end_hour,
      validatedParams.slot_duration
    )

    // Get existing appointments for the date to check conflicts
    const existingAppointments = await dbInterface.getAppointments({
      date: validatedParams.date
    })

    // Filter out conflicted slots
    const availableSlots = allSlots.filter(slot => {
      return !existingAppointments.some(appointment =>
        checkAppointmentConflict(
          appointment.start_time,
          appointment.end_time,
          slot.start,
          slot.end,
          validatedParams.timezone
        )
      )
    })

    // Group slots by time periods
    const timeSlots = {
      morning: availableSlots.filter(slot => {
        const hour = new Date(slot.start).getUTCHours()
        return hour >= 8 && hour < 12
      }),
      afternoon: availableSlots.filter(slot => {
        const hour = new Date(slot.start).getUTCHours()
        return hour >= 12 && hour < 17
      }),
      evening: availableSlots.filter(slot => {
        const hour = new Date(slot.start).getUTCHours()
        return hour >= 17 && hour < 20
      })
    }

    return NextResponse.json({
      date: validatedParams.date,
      timezone: validatedParams.timezone,
      timezone_info: COMMON_TIMEZONES.find(tz => tz.value === validatedParams.timezone),
      total_slots: allSlots.length,
      available_slots: availableSlots.length,
      booked_slots: existingAppointments.length,
      slots: {
        all: availableSlots,
        by_period: timeSlots
      },
      parameters: validatedParams
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Time slots generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate time slots' },
      { status: 500 }
    )
  }
}

// POST /api/appointments/slots/check - Check slot availability
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { start_time, end_time, timezone, exclude_appointment_id } = body

    if (!start_time || !end_time) {
      return NextResponse.json(
        { error: 'start_time and end_time are required' },
        { status: 400 }
      )
    }

    // Get appointments for the same date
    const appointmentDate = new Date(start_time).toISOString().split('T')[0]
    const existingAppointments = await dbInterface.getAppointments({
      date: appointmentDate
    })

    // Filter out the appointment being updated (if any)
    const relevantAppointments = existingAppointments.filter(
      appt => appt.id !== exclude_appointment_id
    )

    // Check for conflicts
    const conflicts = relevantAppointments.filter(appointment =>
      checkAppointmentConflict(
        appointment.start_time,
        appointment.end_time,
        start_time,
        end_time,
        timezone
      )
    )

    const isAvailable = conflicts.length === 0

    return NextResponse.json({
      available: isAvailable,
      conflicts: conflicts.map(conflict => ({
        id: conflict.id,
        start_time: conflict.start_time,
        end_time: conflict.end_time,
        patient_name: `${conflict.patients?.first_name || ''} ${conflict.patients?.last_name || ''}`.trim(),
        reason: conflict.reason,
        timezone: conflict.timezone || 'America/New_York'
      })),
      suggested_slots: !isAvailable ? [] : [], // Could add logic to suggest alternative times
      timezone: timezone || 'America/New_York'
    })

  } catch (error) {
    console.error('Slot availability check error:', error)
    return NextResponse.json(
      { error: 'Failed to check slot availability' },
      { status: 500 }
    )
  }
}