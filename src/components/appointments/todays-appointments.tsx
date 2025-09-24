'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  User,
  FileText,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'
import {
  getAppointmentsForDate,
  formatTime,
  calculateDuration,
  type Appointment,
  type TimeSlotConfig
} from '@/lib/utils/time-slots'

interface TodaysAppointmentsProps {
  selectedDate: Date
  appointments: Appointment[]
  onAppointmentEdit: (appointment: Appointment) => void
  onAppointmentDelete?: (appointment: Appointment) => void
  onNewAppointment: (date: Date) => void
  timeSlotConfig?: TimeSlotConfig
  className?: string
}

export function TodaysAppointments({
  selectedDate,
  appointments,
  onAppointmentEdit,
  onAppointmentDelete,
  onNewAppointment,
  timeSlotConfig,
  className
}: TodaysAppointmentsProps) {
  const dayAppointments = getAppointmentsForDate(selectedDate, appointments)

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
          <Clock className="h-5 w-5 text-primary" />
          Today's Appointments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {dayAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              No appointments scheduled for this date
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNewAppointment(selectedDate)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule First Appointment
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {dayAppointments.map((appointment) => {
              const startTime = new Date(appointment.start_time)
              const endTime = new Date(appointment.end_time)
              const duration = calculateDuration(startTime, endTime)

              return (
                <div
                  key={appointment.id}
                  onClick={() => onAppointmentEdit(appointment)}
                  className={`
                    p-4 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer
                    ${getStatusColor(appointment.status)}
                  `}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">
                          {formatTime(startTime)} - {formatTime(endTime)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {duration} minutes
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {appointment.status.replace('_', ' ')}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            onAppointmentEdit(appointment)
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {onAppointmentDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              onAppointmentDelete(appointment)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {appointment.patients && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm">
                          {appointment.patients.first_name} {appointment.patients.last_name}
                        </span>
                      </div>
                    )}

                    {appointment.reason && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">
                          {appointment.reason}
                        </span>
                      </div>
                    )}

                    {appointment.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground">
                          {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}