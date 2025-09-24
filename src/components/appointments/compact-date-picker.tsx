'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react'
import { format, addDays, subDays, isToday, isWeekend } from 'date-fns'

interface CompactDatePickerProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  excludeWeekends?: boolean
  className?: string
}

export function CompactDatePicker({
  selectedDate,
  onDateChange,
  excludeWeekends = true,
  className
}: CompactDatePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Validate business rules
      if (excludeWeekends && isWeekend(date)) {
        return // Don't allow weekend selection if excluded
      }

      onDateChange(date)
      setIsCalendarOpen(false)
    }
  }

  const handlePreviousDay = () => {
    let newDate = subDays(selectedDate, 1)

    // Skip weekends if excluded
    if (excludeWeekends) {
      while (isWeekend(newDate)) {
        newDate = subDays(newDate, 1)
      }
    }

    onDateChange(newDate)
  }

  const handleNextDay = () => {
    let newDate = addDays(selectedDate, 1)

    // Skip weekends if excluded
    if (excludeWeekends) {
      while (isWeekend(newDate)) {
        newDate = addDays(newDate, 1)
      }
    }

    onDateChange(newDate)
  }

  const handleToday = () => {
    const today = new Date()
    if (!excludeWeekends || !isWeekend(today)) {
      onDateChange(today)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Main Date Display with Calendar Picker */}
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 p-0 h-auto font-semibold text-lg hover:bg-transparent"
          >
            <CalendarIcon className="h-5 w-5 text-primary" />
            <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => {
              // Disable weekends if excluded
              if (excludeWeekends && isWeekend(date)) {
                return true
              }
              return false
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Quick Navigation */}
      <div className="flex items-center gap-1 ml-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousDay}
          className="h-8 w-8 p-0"
          title={`Previous ${excludeWeekends ? 'Business Day' : 'Day'}`}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          disabled={isToday(selectedDate) || (excludeWeekends && isWeekend(new Date()))}
          className="h-8 px-2 text-xs"
          title="Go to Today"
        >
          <Clock className="h-3 w-3 mr-1" />
          Today
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextDay}
          className="h-8 w-8 p-0"
          title={`Next ${excludeWeekends ? 'Business Day' : 'Day'}`}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}