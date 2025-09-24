'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { CalendarDaySkeleton } from '@/components/ui/loading-skeletons'
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns'

interface Appointment {
  id: string
  patient_id: string
  start_time: string
  end_time: string
  reason?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  patients?: {
    first_name: string
    last_name: string
    dob: string
  }
}

interface AppointmentCalendarProps {
  onDateSelect?: (date: Date) => void
  onAppointmentSelect?: (appointment: Appointment) => void
  onCreateAppointment?: (date: Date) => void
  selectedDate?: Date
  patientId?: string
}

export function AppointmentCalendar({
  onDateSelect,
  onAppointmentSelect,
  onCreateAppointment,
  selectedDate: propSelectedDate,
  patientId
}: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(propSelectedDate || new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')

  // Fetch appointments for the current month
  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ['appointments', currentMonth, patientId],
    queryFn: async () => {
      const start = startOfMonth(currentMonth)
      const end = endOfMonth(currentMonth)

      const params = new URLSearchParams()
      if (patientId) params.set('patient_id', patientId)

      const response = await fetch(`/api/appointments?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }

      const data = await response.json()
      // Filter appointments within the current month
      return data.filter((apt: Appointment) => {
        const aptDate = new Date(apt.start_time)
        return aptDate >= start && aptDate <= end
      })
    }
  })

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    if (!appointments) return []
    return appointments.filter((apt: Appointment) =>
      isSameDay(new Date(apt.start_time), date)
    )
  }

  // Get appointment count for calendar display
  const getAppointmentCount = (date: Date) => {
    return getAppointmentsForDate(date).length
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      onDateSelect?.(date)
    }
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const selectedDateAppointments = getAppointmentsForDate(selectedDate)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar View */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Appointment Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">
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
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md border"
            components={{
              Day: ({ day }) => {
                const count = getAppointmentCount(day.date)
                const isSelected = isSameDay(day.date, selectedDate)

                return (
                  <div className="relative w-full h-full">
                    <div className={`text-center ${isSelected ? 'font-bold' : ''}`}>
                      {format(day.date, 'd')}
                    </div>
                    {count > 0 && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          count > 3 ? 'bg-red-500' :
                          count > 1 ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                      </div>
                    )}
                  </div>
                )
              }
            }}
          />

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>1 appointment</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span>2-3 appointments</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>4+ appointments</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day View - Appointments for Selected Date */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {format(selectedDate, 'MMM d, yyyy')}
            </CardTitle>
            {onCreateAppointment && (
              <Button
                size="sm"
                onClick={() => onCreateAppointment(selectedDate)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? 's' : ''}
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CalendarDaySkeleton />
          ) : selectedDateAppointments.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No appointments scheduled
              </p>
              {onCreateAppointment && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => onCreateAppointment(selectedDate)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Schedule Appointment
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {selectedDateAppointments
                .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                .map((appointment: any) => {
                  const startTime = format(new Date(appointment.start_time), 'h:mm a')
                  const endTime = format(new Date(appointment.end_time), 'h:mm a')
                  const duration = Math.round((new Date(appointment.end_time).getTime() - new Date(appointment.start_time).getTime()) / 60000)

                  return (
                    <div
                      key={appointment.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${getStatusColor(appointment.status)}`}
                      onClick={() => onAppointmentSelect?.(appointment)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium text-sm">
                            {startTime} - {endTime}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {appointment.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      {appointment.patients && (
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-3 w-3" />
                          <span className="text-sm">
                            {appointment.patients.first_name} {appointment.patients.last_name}
                          </span>
                        </div>
                      )}

                      {appointment.reason && (
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-3 w-3" />
                          <span className="text-xs text-muted-foreground">
                            {appointment.reason}
                          </span>
                        </div>
                      )}

                      {appointment.notes && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg">Monthly Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {appointments?.filter((a: any) => a.status === 'scheduled').length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Scheduled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {appointments?.filter((a: any) => a.status === 'completed').length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {appointments?.filter((a: any) => a.status === 'cancelled').length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Cancelled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {appointments?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}