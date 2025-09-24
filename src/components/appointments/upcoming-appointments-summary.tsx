'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, User, FileText, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { calculateDuration, formatTime } from '@/lib/utils/time-slots'

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

interface UpcomingAppointmentsSummaryProps {
  appointments: Appointment[]
  className?: string
}

export function UpcomingAppointmentsSummary({
  appointments,
  className
}: UpcomingAppointmentsSummaryProps) {
  // Get upcoming appointments - any appointment after current time that's not cancelled
  const now = new Date()

  const upcomingAppointments = appointments
    .filter(apt => {
      const appointmentDate = new Date(apt.start_time)
      return appointmentDate > now && apt.status !== 'cancelled'
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5) // Show only the next 5 upcoming appointments

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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Upcoming Appointments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">
                {upcomingAppointments.length > 0
                  ? `Next ${upcomingAppointments.length} appointment${upcomingAppointments.length !== 1 ? 's' : ''}`
                  : 'No upcoming appointments scheduled'
                }
              </span>
              {upcomingAppointments.length === 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  All scheduled appointments are in the past
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs text-muted-foreground">Scheduled</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">Cancelled</span>
              </div>
            </div>
          </div>

          {/* Upcoming Appointments List */}
          {upcomingAppointments.length > 0 && (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {upcomingAppointments.map((appointment) => {
                const startDate = new Date(appointment.start_time)
                const endDate = new Date(appointment.end_time)
                const duration = calculateDuration(startDate, endDate)

                return (
                  <div
                    key={appointment.id}
                    className="p-3 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium text-sm">
                            {format(startDate, 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(startDate)} - {formatTime(endDate)} ({duration} min)
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      {appointment.patients && (
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-gray-500" />
                          <span className="text-sm font-medium">
                            {appointment.patients.first_name} {appointment.patients.last_name}
                          </span>
                        </div>
                      )}

                      {appointment.reason && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3 text-gray-500" />
                          <span className="text-sm text-muted-foreground">
                            {appointment.reason}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}