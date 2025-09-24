'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { CompactDatePicker } from './compact-date-picker'
import {
  getAppointmentsForDate,
  type Appointment,
  type TimeSlotConfig
} from '@/lib/utils/time-slots'

interface SelectedDateSummaryProps {
  selectedDate: Date
  appointments: Appointment[]
  onDateChange: (date: Date) => void
  onNewAppointment: (date: Date) => void
  timeSlotConfig?: TimeSlotConfig
  className?: string
}

export function SelectedDateSummary({
  selectedDate,
  appointments,
  onDateChange,
  onNewAppointment,
  timeSlotConfig,
  className
}: SelectedDateSummaryProps) {
  const dayAppointments = getAppointmentsForDate(selectedDate, appointments)
  const activeAppointments = dayAppointments.filter(apt => apt.status !== 'cancelled')

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CompactDatePicker
              selectedDate={selectedDate}
              onDateChange={onDateChange}
              excludeWeekends={timeSlotConfig?.excludeWeekends}
            />
          </div>
          <Button onClick={() => onNewAppointment(selectedDate)}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {activeAppointments.length} appointment{activeAppointments.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="text-muted-foreground">
            {format(selectedDate, 'EEEE')}
          </div>
          {dayAppointments.length !== activeAppointments.length && (
            <div className="text-muted-foreground">
              ({dayAppointments.length - activeAppointments.length} cancelled)
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}