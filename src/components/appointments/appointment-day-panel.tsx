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
  type TimeSlot,
  type Appointment as TimeSlotAppointment,
  type TimeSlotConfig
} from '@/lib/utils/time-slots'

interface Appointment extends TimeSlotAppointment {
  reason?: string
  notes?: string
  patients?: {
    first_name: string
    last_name: string
    dob: string
  }
}

interface AppointmentDayPanelProps {
  selectedDate: Date
  appointments: Appointment[]
  onTimeSlotSelect: (timeSlot: TimeSlot) => void
  onAppointmentEdit: (appointment: Appointment) => void
  onAppointmentDelete?: (appointment: Appointment) => void
  onNewAppointment: (date: Date) => void
  timeSlotConfig?: TimeSlotConfig
  className?: string
}

export function AppointmentDayPanel({
  selectedDate,
  appointments,
  onTimeSlotSelect,
  onAppointmentEdit,
  onAppointmentDelete,
  onNewAppointment,
  timeSlotConfig,
  className
}: AppointmentDayPanelProps) {
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </CardTitle>
          <Button
            onClick={() => onNewAppointment(selectedDate)}
            className="inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                No appointments scheduled for this date
              </div>
              <Button
                onClick={() => onNewAppointment(selectedDate)}
                className="inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Schedule First Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {dayAppointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  className="border-l-4 border-l-primary"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <Clock className="h-4 w-4" />
                            {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                          </div>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ({calculateDuration(new Date(appointment.start_time), new Date(appointment.end_time))} min)
                          </span>
                        </div>

                        {appointment.patients && (
                          <div className="flex items-center gap-1 text-sm mb-1">
                            <User className="h-4 w-4" />
                            <span className="font-medium">
                              {appointment.patients.first_name} {appointment.patients.last_name}
                            </span>
                          </div>
                        )}

                        {appointment.reason && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                            <FileText className="h-4 w-4" />
                            <span>{appointment.reason}</span>
                          </div>
                        )}

                        {appointment.notes && (
                          <div className="text-sm text-muted-foreground">
                            <strong>Notes:</strong> {appointment.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAppointmentEdit(appointment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {onAppointmentDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAppointmentDelete(appointment)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}