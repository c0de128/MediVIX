import { format, addMinutes, isAfter, isBefore, isSameDay, startOfDay, endOfDay } from 'date-fns'

export interface TimeSlot {
  start: Date
  end: Date
  available: boolean
  duration: number // in minutes
}

export interface Appointment {
  id: string
  start_time: string
  end_time: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

export interface BusinessHours {
  start: string // HH:mm format, e.g., "09:00"
  end: string // HH:mm format, e.g., "17:00"
  lunchStart?: string // Optional lunch break start
  lunchEnd?: string // Optional lunch break end
}

export interface TimeSlotConfig {
  defaultDuration: number // Default appointment duration in minutes
  bufferTime: number // Buffer time between appointments in minutes
  businessHours: BusinessHours
  excludeWeekends?: boolean
}

// Default configuration
export const DEFAULT_TIME_SLOT_CONFIG: TimeSlotConfig = {
  defaultDuration: 30,
  bufferTime: 0,
  businessHours: {
    start: "09:00",
    end: "17:00",
    lunchStart: "12:00",
    lunchEnd: "13:00"
  },
  excludeWeekends: true
}

/**
 * Parse time string (HH:mm) and combine with date
 */
function parseTimeToDate(date: Date, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

/**
 * Check if a date is a weekend
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday or Saturday
}

/**
 * Check if two time periods overlap
 */
function timePeriodsOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return isBefore(start1, end2) && isAfter(end1, start2)
}

/**
 * Generate all possible time slots for a given date
 */
export function generateTimeSlots(
  date: Date,
  config: TimeSlotConfig = DEFAULT_TIME_SLOT_CONFIG
): TimeSlot[] {
  const slots: TimeSlot[] = []

  // Skip weekends if configured
  if (config.excludeWeekends && isWeekend(date)) {
    return slots
  }

  const businessStart = parseTimeToDate(date, config.businessHours.start)
  const businessEnd = parseTimeToDate(date, config.businessHours.end)
  const lunchStart = config.businessHours.lunchStart
    ? parseTimeToDate(date, config.businessHours.lunchStart)
    : null
  const lunchEnd = config.businessHours.lunchEnd
    ? parseTimeToDate(date, config.businessHours.lunchEnd)
    : null

  let currentTime = new Date(businessStart)

  while (isBefore(currentTime, businessEnd)) {
    const slotEnd = addMinutes(currentTime, config.defaultDuration)

    // Skip if slot would extend past business hours
    if (isAfter(slotEnd, businessEnd)) {
      break
    }

    // Skip lunch break if configured
    const isLunchTime = lunchStart && lunchEnd &&
      timePeriodsOverlap(currentTime, slotEnd, lunchStart, lunchEnd)

    if (!isLunchTime) {
      slots.push({
        start: new Date(currentTime),
        end: new Date(slotEnd),
        available: true,
        duration: config.defaultDuration
      })
    }

    // Move to next slot (including buffer time)
    currentTime = addMinutes(currentTime, config.defaultDuration + config.bufferTime)
  }

  return slots
}

/**
 * Calculate available time slots for a specific date, considering existing appointments
 */
export function getAvailableTimeSlots(
  date: Date,
  appointments: Appointment[],
  config: TimeSlotConfig = DEFAULT_TIME_SLOT_CONFIG
): TimeSlot[] {
  // Get all possible slots for the date
  const allSlots = generateTimeSlots(date, config)

  // Filter out appointments for this specific date that are not cancelled
  const dayAppointments = appointments.filter(apt =>
    isSameDay(new Date(apt.start_time), date) && apt.status !== 'cancelled'
  )

  // Mark slots as unavailable if they conflict with existing appointments
  return allSlots.map(slot => {
    const hasConflict = dayAppointments.some(apt => {
      const aptStart = new Date(apt.start_time)
      const aptEnd = new Date(apt.end_time)
      return timePeriodsOverlap(slot.start, slot.end, aptStart, aptEnd)
    })

    return {
      ...slot,
      available: !hasConflict
    }
  })
}

/**
 * Get appointments for a specific date
 */
export function getAppointmentsForDate(
  date: Date,
  appointments: Appointment[]
): Appointment[] {
  return appointments
    .filter(apt => isSameDay(new Date(apt.start_time), date))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
}

/**
 * Format time slot for display
 */
export function formatTimeSlot(slot: TimeSlot): string {
  return `${format(slot.start, 'h:mm a')} - ${format(slot.end, 'h:mm a')}`
}

/**
 * Format time for display
 */
export function formatTime(date: Date): string {
  return format(date, 'h:mm a')
}

/**
 * Check if current time has passed (for same day appointments)
 */
export function isTimeSlotInPast(slot: TimeSlot): boolean {
  const now = new Date()
  return isSameDay(slot.start, now) && isBefore(slot.start, now)
}

/**
 * Get next available time slot for a date
 */
export function getNextAvailableSlot(
  date: Date,
  appointments: Appointment[],
  config: TimeSlotConfig = DEFAULT_TIME_SLOT_CONFIG
): TimeSlot | null {
  const availableSlots = getAvailableTimeSlots(date, appointments, config)
  const now = new Date()

  // For today, find first slot that hasn't passed
  if (isSameDay(date, now)) {
    return availableSlots.find(slot =>
      slot.available && isAfter(slot.start, now)
    ) || null
  }

  // For future dates, return first available slot
  return availableSlots.find(slot => slot.available) || null
}

/**
 * Calculate duration between two dates in minutes
 */
export function calculateDuration(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
}

/**
 * Suggest appointment duration based on reason or type
 */
export function suggestAppointmentDuration(reason?: string): number {
  if (!reason) return DEFAULT_TIME_SLOT_CONFIG.defaultDuration

  const reasonLower = reason.toLowerCase()

  // Common appointment types and their typical durations
  if (reasonLower.includes('consultation') || reasonLower.includes('physical')) {
    return 45
  }
  if (reasonLower.includes('follow-up') || reasonLower.includes('check-up')) {
    return 15
  }
  if (reasonLower.includes('procedure') || reasonLower.includes('surgery')) {
    return 90
  }
  if (reasonLower.includes('therapy') || reasonLower.includes('counseling')) {
    return 60
  }

  return DEFAULT_TIME_SLOT_CONFIG.defaultDuration
}