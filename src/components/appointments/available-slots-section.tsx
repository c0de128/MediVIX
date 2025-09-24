'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, Plus, AlertCircle } from 'lucide-react'
import { format, isBefore } from 'date-fns'
import {
  TimeSlot,
  getAvailableTimeSlots,
  formatTime,
  isTimeSlotInPast,
  DEFAULT_TIME_SLOT_CONFIG,
  type Appointment,
  type TimeSlotConfig
} from '@/lib/utils/time-slots'

interface AvailableSlotsSectionProps {
  selectedDate: Date
  appointments: Appointment[]
  onTimeSlotSelect: (timeSlot: TimeSlot) => void
  config?: TimeSlotConfig
  className?: string
}

export function AvailableSlotsSection({
  selectedDate,
  appointments,
  onTimeSlotSelect,
  config = DEFAULT_TIME_SLOT_CONFIG,
  className
}: AvailableSlotsSectionProps) {
  const timeSlots = getAvailableTimeSlots(selectedDate, appointments, config)
  const availableSlots = timeSlots.filter(slot => slot.available && !isTimeSlotInPast(slot))
  const occupiedSlots = timeSlots.filter(slot => !slot.available)
  const pastSlots = timeSlots.filter(slot => slot.available && isTimeSlotInPast(slot))

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available && !isTimeSlotInPast(slot)) {
      onTimeSlotSelect(slot)
    }
  }

  const getSlotButtonStyle = (slot: TimeSlot) => {
    const isPast = isTimeSlotInPast(slot)

    if (!slot.available) {
      return 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed opacity-60'
    }

    if (isPast) {
      return 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed opacity-60'
    }

    return 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 cursor-pointer transform hover:scale-105 transition-all duration-200'
  }

  const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6
  const shouldShowWeekendMessage = config.excludeWeekends && isWeekend

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-100 rounded-full">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              Available Time Slots
            </CardTitle>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">
                {format(selectedDate, 'EEEE, MMM d, yyyy')}
              </span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-700 font-medium">
                {availableSlots.length} Available
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-red-700 font-medium">
                {occupiedSlots.length} Booked
              </span>
            </div>
            {pastSlots.length > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600 font-medium">
                  {pastSlots.length} Past
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {shouldShowWeekendMessage ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-full">
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-900 mb-1">Weekend Not Available</h3>
                  <p className="text-sm text-amber-700">
                    Appointments are not available on weekends. Please select a weekday.
                  </p>
                </div>
              </div>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">No Time Slots Available</h3>
                  <p className="text-sm text-gray-600">
                    No appointment slots are available for this date.
                  </p>
                </div>
              </div>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-red-900 mb-1">All Slots Booked</h3>
                  <p className="text-sm text-red-700">
                    All available time slots for this date are already booked.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Available Slots Grid */}
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Available Slots ({availableSlots.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="lg"
                      className={`
                        h-16 flex flex-col items-center justify-center gap-1 p-4
                        ${getSlotButtonStyle(slot)}
                      `}
                      onClick={() => handleSlotClick(slot)}
                    >
                      <div className="flex items-center gap-1">
                        <Plus className="h-3 w-3" />
                        <span className="font-semibold text-sm">
                          {format(slot.start, 'h:mm a')}
                        </span>
                      </div>
                      <span className="text-xs opacity-75">
                        {slot.duration} min
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Occupied Slots (if any) */}
              {occupiedSlots.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Booked Slots ({occupiedSlots.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {occupiedSlots.map((slot, index) => (
                      <div
                        key={index}
                        className={`
                          h-12 flex items-center justify-center border rounded-md
                          ${getSlotButtonStyle(slot)}
                        `}
                      >
                        <span className="text-xs font-medium">
                          {format(slot.start, 'h:mm a')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Business Hours Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Business Hours:</span>
              </div>
              <span className="text-blue-700 font-medium">
                {config.businessHours.start} - {config.businessHours.end}
              </span>
            </div>
            {config.businessHours.lunchStart && config.businessHours.lunchEnd && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-blue-700">Lunch Break:</span>
                <span className="text-blue-600">
                  {config.businessHours.lunchStart} - {config.businessHours.lunchEnd}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}