'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  getDay
} from 'date-fns'

interface Appointment {
  id: string
  start_time: string
  end_time: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

interface StandardCalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  appointments: Appointment[]
  className?: string
}

export function StandardCalendar({
  selectedDate,
  onDateSelect,
  appointments,
  className
}: StandardCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate)

  // Get calendar grid dates
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  // Generate calendar days
  const calendarDays = []
  let day = startDate
  while (day <= endDate) {
    calendarDays.push(day)
    day = addDays(day, 1)
  }

  // Get appointment count for a specific date
  const getAppointmentCount = (date: Date) => {
    return appointments.filter(apt =>
      isSameDay(new Date(apt.start_time), date) && apt.status !== 'cancelled'
    ).length
  }

  // Get appointment indicator style based on count
  const getAppointmentIndicator = (count: number) => {
    if (count === 0) return null

    let colorClass = 'bg-blue-500'
    if (count > 3) colorClass = 'bg-red-500'
    else if (count > 1) colorClass = 'bg-yellow-500'

    return (
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex items-center gap-0.5">
        <div className={`h-1.5 w-1.5 rounded-full ${colorClass}`} />
        {count > 1 && (
          <span className="text-xs font-medium text-muted-foreground min-w-4 text-center">
            {count}
          </span>
        )}
      </div>
    )
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }

  const handleDateClick = (date: Date) => {
    onDateSelect(date)
  }

  // Week day headers
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-3">
            {/* Week day headers */}
            {weekDays.map(day => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              const appointmentCount = getAppointmentCount(day)
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isSelected = isSameDay(day, selectedDate)
              const isCurrentDay = isToday(day)

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`
                    relative aspect-square p-3 text-sm border rounded-md transition-colors flex items-center justify-center
                    ${isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : isCurrentDay
                      ? 'bg-accent text-accent-foreground border-accent'
                      : isCurrentMonth
                      ? 'bg-background hover:bg-muted border-border'
                      : 'bg-muted/50 text-muted-foreground border-muted'
                    }
                    ${isCurrentMonth ? 'hover:bg-muted' : ''}
                  `}
                >
                  <span className={`
                    ${isSelected || isCurrentDay ? 'font-semibold' : ''}
                    ${!isCurrentMonth ? 'opacity-50' : ''}
                  `}>
                    {format(day, 'd')}
                  </span>
                  {getAppointmentIndicator(appointmentCount)}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>1 appointment</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              <span>2-3 appointments</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span>4+ appointments</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}