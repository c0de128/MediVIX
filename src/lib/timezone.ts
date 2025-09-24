/**
 * Timezone utility functions for appointment scheduling
 * Handles timezone conversion and display for medical office management
 */

import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz'
import { parseISO, formatISO } from 'date-fns'

// Common medical practice timezones
export const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', abbreviation: 'EST/EDT' },
  { value: 'America/Chicago', label: 'Central Time (CT)', abbreviation: 'CST/CDT' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', abbreviation: 'MST/MDT' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', abbreviation: 'PST/PDT' },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)', abbreviation: 'MST' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', abbreviation: 'AKST/AKDT' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)', abbreviation: 'HST' },
] as const

export type TimezoneValue = typeof COMMON_TIMEZONES[number]['value']

/**
 * Get the user's detected timezone
 */
export function getDetectedTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (error) {
    console.warn('Could not detect timezone, falling back to UTC')
    return 'UTC'
  }
}

/**
 * Convert a datetime string to a specific timezone
 */
export function convertToTimezone(
  dateString: string,
  targetTimezone: string,
  sourceTimezone?: string
): Date {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString

  if (sourceTimezone) {
    // Convert from source timezone to UTC, then to target timezone
    const utcDate = fromZonedTime(date, sourceTimezone)
    return toZonedTime(utcDate, targetTimezone)
  }

  // Assume input is UTC, convert to target timezone
  return toZonedTime(date, targetTimezone)
}

/**
 * Format a date in a specific timezone
 */
export function formatInTimezone(
  date: Date | string,
  timezone: string,
  formatString: string = 'MMM d, yyyy h:mm a'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatInTimeZone(dateObj, timezone, formatString)
}

/**
 * Format appointment time for display with timezone info
 */
export function formatAppointmentTime(
  startTime: string | Date,
  endTime: string | Date,
  timezone: string,
  showTimezone: boolean = true
): string {
  const startFormatted = formatInTimezone(startTime, timezone, 'h:mm a')
  const endFormatted = formatInTimezone(endTime, timezone, 'h:mm a')
  const dateFormatted = formatInTimezone(startTime, timezone, 'MMM d, yyyy')

  const timezoneInfo = COMMON_TIMEZONES.find(tz => tz.value === timezone)
  const tzAbbreviation = timezoneInfo?.abbreviation || timezone

  if (showTimezone) {
    return `${dateFormatted} • ${startFormatted} - ${endFormatted} (${tzAbbreviation})`
  }

  return `${dateFormatted} • ${startFormatted} - ${endFormatted}`
}

/**
 * Convert appointment times between timezones for scheduling
 */
export function convertAppointmentTimezone(
  startTime: string,
  endTime: string,
  fromTimezone: string,
  toTimezone: string
): { startTime: string; endTime: string } {
  const convertedStart = convertToTimezone(startTime, toTimezone, fromTimezone)
  const convertedEnd = convertToTimezone(endTime, toTimezone, fromTimezone)

  return {
    startTime: formatISO(convertedStart),
    endTime: formatISO(convertedEnd)
  }
}

/**
 * Get timezone offset information for display
 */
export function getTimezoneOffset(timezone: string, date: Date = new Date()): string {
  try {
    const offset = formatInTimeZone(date, timezone, 'xxx')
    return offset
  } catch (error) {
    console.warn(`Could not get offset for timezone ${timezone}`)
    return '+00:00'
  }
}

/**
 * Check if two appointment times would conflict across timezones
 */
export function checkAppointmentConflict(
  existingStart: string,
  existingEnd: string,
  newStart: string,
  newEnd: string,
  timezone?: string
): boolean {
  const convertToUTC = (dateString: string) => {
    if (timezone) {
      return fromZonedTime(parseISO(dateString), timezone)
    }
    return parseISO(dateString)
  }

  const existing = {
    start: convertToUTC(existingStart),
    end: convertToUTC(existingEnd)
  }

  const newAppt = {
    start: convertToUTC(newStart),
    end: convertToUTC(newEnd)
  }

  // Check if appointments overlap
  return (
    (newAppt.start < existing.end && newAppt.end > existing.start) ||
    (existing.start < newAppt.end && existing.end > newAppt.start)
  )
}

/**
 * Calculate appointment duration in minutes
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime

  return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
}

/**
 * Generate appointment time slots for a given day and timezone
 */
export function generateTimeSlots(
  date: Date,
  timezone: string,
  startHour: number = 8,
  endHour: number = 17,
  slotDuration: number = 30
): Array<{ start: string; end: string; display: string }> {
  const slots: Array<{ start: string; end: string; display: string }> = []

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const slotStart = new Date(date)
      slotStart.setHours(hour, minute, 0, 0)

      const slotEnd = new Date(slotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration)

      // Convert to UTC for storage
      const utcStart = fromZonedTime(slotStart, timezone)
      const utcEnd = fromZonedTime(slotEnd, timezone)

      slots.push({
        start: formatISO(utcStart),
        end: formatISO(utcEnd),
        display: formatInTimezone(slotStart, timezone, 'h:mm a')
      })
    }
  }

  return slots
}

/**
 * Format duration for display (e.g., "1h 30m")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}m`
}