'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Plus, Loader2 } from 'lucide-react'
import { format, isBefore } from 'date-fns'
import {
  TimeSlot,
  getAvailableTimeSlots,
  formatTimeSlot,
  isTimeSlotInPast,
  DEFAULT_TIME_SLOT_CONFIG,
  type Appointment,
  type TimeSlotConfig
} from '@/lib/utils/time-slots'

interface TimeSlotPickerProps {
  selectedDate: Date
  appointments: Appointment[]
  onTimeSlotSelect: (timeSlot: TimeSlot) => void
  config?: TimeSlotConfig
  className?: string
  currentAppointment?: Appointment // For editing mode - exclude this appointment from conflicts
  selectedTimeSlot?: TimeSlot // Currently selected time slot (for editing)
}

export function TimeSlotPicker({
  selectedDate,
  appointments,
  onTimeSlotSelect,
  config = DEFAULT_TIME_SLOT_CONFIG,
  className,
  currentAppointment,
  selectedTimeSlot
}: TimeSlotPickerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  // Update time slots when selectedDate or appointments change
  useEffect(() => {
    setIsLoading(true)

    // Add small delay to show loading state (simulating calculation/API call)
    const timer = setTimeout(() => {
      // Filter out current appointment from conflicts if editing
      const filteredAppointments = currentAppointment
        ? appointments.filter(apt => apt.id !== currentAppointment.id)
        : appointments

      const newTimeSlots = getAvailableTimeSlots(selectedDate, filteredAppointments, config)
      setTimeSlots(newTimeSlots)
      setIsLoading(false)
    }, 200) // 200ms delay for smooth UX

    return () => clearTimeout(timer)
  }, [selectedDate, appointments, currentAppointment, config])

  // Check if any slot matches the currently selected time slot
  const slotsWithSelection = timeSlots.map(slot => {
    const isCurrentlySelected = selectedTimeSlot &&
      slot.start.getTime() === selectedTimeSlot.start.getTime() &&
      slot.end.getTime() === selectedTimeSlot.end.getTime()

    return {
      ...slot,
      isCurrentlySelected
    }
  })

  const availableSlots = slotsWithSelection.filter(slot => slot.available)
  const occupiedSlots = slotsWithSelection.filter(slot => !slot.available)

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available && !isTimeSlotInPast(slot)) {
      onTimeSlotSelect(slot)
    }
  }

  const getSlotButtonStyle = (slot: any) => {
    const isPast = isTimeSlotInPast(slot)

    if (!slot.available) {
      return 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
    }

    if (isPast) {
      return 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
    }

    if (slot.isCurrentlySelected) {
      return 'bg-primary text-primary-foreground border-primary shadow-md cursor-pointer'
    }

    return 'bg-background border-primary/20 hover:bg-primary/10 hover:border-primary/40 text-foreground cursor-pointer'
  }

  const getSlotLabel = (slot: any) => {
    const isPast = isTimeSlotInPast(slot)

    if (!slot.available) {
      return 'Booked'
    }

    if (isPast) {
      return 'Past'
    }

    if (slot.isCurrentlySelected) {
      return 'Current'
    }

    return 'Available'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Clock className={`h-4 w-4 transition-all duration-200 ${isLoading ? 'animate-pulse text-primary' : ''}`} />
        <h3 className="text-sm font-medium">
          Available Time Slots
        </h3>
        <Badge variant="outline" className={`text-xs transition-all duration-200 ${isLoading ? 'bg-primary/10 border-primary/20' : ''}`}>
          {format(selectedDate, 'MMM d, yyyy')}
        </Badge>
      </div>

      {isLoading ? (
        <div className="text-center py-6 text-muted-foreground">
          <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
          <p className="text-sm">Loading available time slots...</p>
          <p className="text-xs">Checking appointments for {format(selectedDate, 'MMM d, yyyy')}</p>
        </div>
      ) : timeSlots.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No time slots available for this date</p>
          <p className="text-xs">
            {config.excludeWeekends && (selectedDate.getDay() === 0 || selectedDate.getDay() === 6)
              ? 'Weekend appointments not available'
              : 'Outside business hours'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Available Slots */}
          {availableSlots.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Available ({availableSlots.length})
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((slot, index) => {
                  const isPast = isTimeSlotInPast(slot)
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className={`
                        flex items-center justify-between p-3 h-auto
                        ${getSlotButtonStyle(slot)}
                      `}
                      onClick={() => handleSlotClick(slot)}
                      disabled={isPast}
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="h-3 w-3" />
                        <span className="text-xs font-medium">
                          {format(slot.start, 'h:mm a')}
                        </span>
                        {slot.isCurrentlySelected && (
                          <span className="text-xs font-medium bg-primary-foreground/20 px-1 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {slot.duration}m
                      </span>
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Occupied Slots */}
          {occupiedSlots.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Occupied ({occupiedSlots.length})
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {occupiedSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`
                      flex items-center justify-between p-3 border rounded-md
                      ${getSlotButtonStyle(slot)}
                    `}
                  >
                    <span className="text-xs">
                      {format(slot.start, 'h:mm a')}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Booked
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
            <span>{availableSlots.length} available slots</span>
            <span>{occupiedSlots.length} booked</span>
          </div>
        </div>
      )}

      {/* Business Hours Info */}
      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
        <div className="flex items-center justify-between">
          <span>Business Hours:</span>
          <span>
            {config.businessHours.start} - {config.businessHours.end}
          </span>
        </div>
        {config.businessHours.lunchStart && config.businessHours.lunchEnd && (
          <div className="flex items-center justify-between mt-1">
            <span>Lunch Break:</span>
            <span>
              {config.businessHours.lunchStart} - {config.businessHours.lunchEnd}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}