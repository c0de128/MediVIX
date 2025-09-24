'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle
} from 'lucide-react'
import { format, addDays, subDays, isToday, isBefore, isWeekend } from 'date-fns'
import { cn } from '@/lib/utils'

interface DateSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  excludeWeekends?: boolean
  className?: string
  showQuickNav?: boolean
}

export function DateSelector({
  selectedDate,
  onDateChange,
  excludeWeekends = true,
  className,
  showQuickNav = true
}: DateSelectorProps) {
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

  const isSelectedWeekend = isWeekend(selectedDate)
  const isPastDate = isBefore(selectedDate, new Date()) && !isToday(selectedDate)

  return (
    <div className={className}>
      <Card className="border-2 border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            Select Appointment Date
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Current Date Display */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <CalendarIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {isToday(selectedDate) && (
                      <Badge variant="secondary" className="text-xs">Today</Badge>
                    )}
                    {isPastDate && (
                      <Badge variant="destructive" className="text-xs">Past Date</Badge>
                    )}
                    {isSelectedWeekend && excludeWeekends && (
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                        Weekend
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Calendar Picker */}
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Change Date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
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
            </div>

            {/* Quick Navigation */}
            {showQuickNav && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousDay}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous {excludeWeekends ? 'Business Day' : 'Day'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToday}
                    disabled={isToday(selectedDate) || (excludeWeekends && isWeekend(new Date()))}
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Today
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextDay}
                    className="flex items-center gap-2"
                  >
                    Next {excludeWeekends ? 'Business Day' : 'Day'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Quick Date Options */}
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 7].map((days) => {
                    let targetDate = addDays(new Date(), days)

                    // Skip to next business day if weekends excluded
                    if (excludeWeekends) {
                      while (isWeekend(targetDate)) {
                        targetDate = addDays(targetDate, 1)
                      }
                    }

                    const isSelected = targetDate.toDateString() === selectedDate.toDateString()

                    return (
                      <Button
                        key={days}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => onDateChange(targetDate)}
                        className={cn(
                          "text-xs",
                          isSelected && "bg-blue-600 text-white"
                        )}
                      >
                        {format(targetDate, 'MMM d')}
                        <span className="ml-1 opacity-75">
                          ({format(targetDate, 'EEE')})
                        </span>
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Weekend Warning */}
            {isSelectedWeekend && excludeWeekends && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <strong>Weekend Selected:</strong> Appointments may not be available on weekends.
                  Consider selecting a business day.
                </div>
              </div>
            )}

            {/* Past Date Warning */}
            {isPastDate && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <strong>Past Date Selected:</strong> This date has already passed.
                  Please select a future date for scheduling.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}