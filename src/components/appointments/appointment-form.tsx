'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, User, Save, Loader2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { appointmentSchemas, type AppointmentCreateData } from '@/lib/validation/schemas'
import { fieldValidators, sanitizeUtils, validateData } from '@/lib/validation/utils'
import { format, addMinutes } from 'date-fns'
import { TimeSlotPicker } from './time-slot-picker'
import { DateSelector } from './date-selector'
import { TimeSlot, DEFAULT_TIME_SLOT_CONFIG, type TimeSlotConfig } from '@/lib/utils/time-slots'

type AppointmentFormData = AppointmentCreateData

interface Patient {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  phone?: string
  email?: string
}

interface VisitTemplate {
  id: string
  name: string
  description: string
  duration_minutes: number
  default_notes?: string
}

interface AppointmentFormProps {
  appointment?: any
  selectedDate?: Date
  selectedPatientId?: string
  onSuccess?: () => void
  onCancel?: () => void
  allAppointments?: any[] // All appointments for time slot conflict checking
  timeSlotConfig?: TimeSlotConfig
}

export function AppointmentForm({
  appointment,
  selectedDate = new Date(),
  selectedPatientId,
  onSuccess,
  onCancel,
  allAppointments = [],
  timeSlotConfig = DEFAULT_TIME_SLOT_CONFIG
}: AppointmentFormProps) {
  const { toast } = useToast()
  const isEditing = !!appointment
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [useTimeSlotPicker, setUseTimeSlotPicker] = useState(false) // Toggle between picker and manual input
  const [appointmentDate, setAppointmentDate] = useState<Date>(selectedDate) // For appointment date changes

  // Fetch patients for selection
  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await fetch('/api/patients')
      if (!response.ok) throw new Error('Failed to fetch patients')
      return response.json()
    }
  })

  // Fetch visit templates
  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await fetch('/api/templates')
      if (!response.ok) throw new Error('Failed to fetch templates')
      return response.json()
    }
  })

  // Helper function to format datetime for datetime-local input
  const formatDateTimeLocal = (dateTimeString: string | Date) => {
    const date = new Date(dateTimeString)
    // Convert to local timezone and format as yyyy-MM-ddTHH:mm
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const form = useForm<any>({
    resolver: zodResolver(isEditing ? appointmentSchemas.update : appointmentSchemas.create),
    defaultValues: {
      patient_id: selectedPatientId || appointment?.patient_id || '',
      visit_template_id: appointment?.visit_template_id || '',
      start_time: appointment?.start_time
        ? formatDateTimeLocal(appointment.start_time)
        : format(selectedDate, "yyyy-MM-dd'T'09:00"),
      end_time: appointment?.end_time
        ? formatDateTimeLocal(appointment.end_time)
        : format(addMinutes(selectedDate, 30), "yyyy-MM-dd'T'09:30"),
      reason: appointment?.reason || '',
      status: appointment?.status || 'scheduled',
      notes: appointment?.notes || '',
    },
  })

  // Initialize selected time slot and date for editing
  useEffect(() => {
    if (isEditing && appointment?.start_time && appointment?.end_time) {
      const startDate = new Date(appointment.start_time)
      const endDate = new Date(appointment.end_time)
      const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))

      // Set the appointment date from the existing appointment
      setAppointmentDate(startDate)

      setSelectedTimeSlot({
        start: startDate,
        end: endDate,
        available: true,
        duration
      })

      // Default to time slot picker for editing to show current appointment clearly
      setUseTimeSlotPicker(true)
    }
  }, [isEditing, appointment])

  // Watch for template selection to auto-fill duration
  const selectedTemplateId = form.watch('visit_template_id')
  const startTime = form.watch('start_time')

  useEffect(() => {
    if (selectedTemplateId && templates) {
      const template = templates.find((t: VisitTemplate) => t.id === selectedTemplateId)
      if (template && startTime) {
        const start = new Date(startTime)
        const end = addMinutes(start, template.duration_minutes)
        form.setValue('end_time', format(end, "yyyy-MM-dd'T'HH:mm"))

        // Auto-fill notes if template has default notes
        if (template.default_notes && !form.getValues('notes')) {
          form.setValue('notes', template.default_notes)
        }
      }
    }
  }, [selectedTemplateId, startTime, templates, form])

  const onSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true)
    try {
      // Validate data using our validation utils
      const validation = validateData(
        isEditing ? appointmentSchemas.update : appointmentSchemas.create,
        data
      )

      if (!validation.success) {
        toast({
          title: 'Validation Error',
          description: validation.errors.join(', '),
          variant: 'destructive',
        })
        return
      }

      // Additional validation for time slot conflicts when using time slot picker
      if (useTimeSlotPicker && selectedTimeSlot) {
        const filteredAppointments = isEditing
          ? allAppointments.filter(apt => apt.id !== appointment.id)
          : allAppointments

        const hasConflict = filteredAppointments.some(apt => {
          const aptStart = new Date(apt.start_time)
          const aptEnd = new Date(apt.end_time)

          // Check if appointment times overlap
          return (
            (selectedTimeSlot.start < aptEnd && selectedTimeSlot.end > aptStart) &&
            apt.status !== 'cancelled'
          )
        })

        if (hasConflict) {
          toast({
            title: 'Scheduling Conflict',
            description: 'The selected time slot conflicts with another appointment. Please choose a different time.',
            variant: 'destructive',
          })
          return
        }

        // Validate business hours
        const slotStart = selectedTimeSlot.start
        const dayOfWeek = slotStart.getDay()

        if (timeSlotConfig.excludeWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
          toast({
            title: 'Weekend Appointment',
            description: 'Weekend appointments are not allowed according to current business hours.',
            variant: 'destructive',
          })
          return
        }
      }

      // Sanitize data
      const sanitizedData = {
        ...validation.data,
        reason: data.reason ? sanitizeUtils.sanitizeString(data.reason) : '',
        notes: data.notes ? sanitizeUtils.sanitizeString(data.notes) : '',
      }

      const url = isEditing ? `/api/appointments/${appointment.id}` : '/api/appointments'
      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save appointment')
      }

      toast({
        title: 'Success',
        description: `Appointment ${isEditing ? 'updated' : 'created'} successfully`,
      })

      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }


  // Handle date change
  const handleDateChange = (newDate: Date) => {
    setAppointmentDate(newDate)

    // Clear selected time slot when date changes
    setSelectedTimeSlot(null)

    // Update form times to default for new date if not using manual input
    if (useTimeSlotPicker) {
      const defaultStart = new Date(newDate)
      defaultStart.setHours(9, 0, 0, 0)
      const defaultEnd = addMinutes(defaultStart, timeSlotConfig.defaultDuration)

      form.setValue('start_time', formatDateTimeLocal(defaultStart))
      form.setValue('end_time', formatDateTimeLocal(defaultEnd))
    }
  }

  // Handle time slot selection from picker
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot)

    // Update form with selected time slot
    const startTimeLocal = formatDateTimeLocal(timeSlot.start)
    const endTimeLocal = formatDateTimeLocal(timeSlot.end)

    form.setValue('start_time', startTimeLocal)
    form.setValue('end_time', endTimeLocal)

    // Clear any time-related errors
    form.clearErrors(['start_time', 'end_time'])
  }

  const selectedPatient = patients?.find((p: Patient) => p.id === form.watch('patient_id'))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {isEditing ? 'Edit Appointment' : 'Schedule New Appointment'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Patient Information</h3>

            {selectedPatient && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4" />
                  <span className="font-medium">
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  DOB: {selectedPatient.dob ?
                    format(new Date(selectedPatient.dob), 'MMM d, yyyy') :
                    selectedPatient.date_of_birth ?
                    format(new Date(selectedPatient.date_of_birth), 'MMM d, yyyy') :
                    'Not provided'
                  }
                </p>
                {selectedPatient.phone && (
                  <p className="text-sm text-muted-foreground">
                    Phone: {selectedPatient.phone}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="patient_id">Patient *</Label>
              <Select
                value={form.watch('patient_id')}
                onValueChange={(value) => form.setValue('patient_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients?.map((patient: Patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.patient_id && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {String(form.formState.errors.patient_id?.message || 'Invalid patient')}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Appointment Details</h3>

            <div className="space-y-2">
              <Label htmlFor="visit_template_id">Visit Template</Label>
              <Select
                value={form.watch('visit_template_id')}
                onValueChange={(value) => form.setValue('visit_template_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((template: VisitTemplate) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.duration_minutes}min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-4">
              <DateSelector
                selectedDate={appointmentDate}
                onDateChange={handleDateChange}
                excludeWeekends={timeSlotConfig.excludeWeekends}
                showQuickNav={true}
              />
            </div>

            {/* Time Selection Method Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Time Selection</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Manual</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUseTimeSlotPicker(!useTimeSlotPicker)}
                  className={useTimeSlotPicker ? 'bg-primary text-primary-foreground' : ''}
                >
                  {useTimeSlotPicker ? 'Use Time Slots' : 'Use Manual Input'}
                </Button>
              </div>
            </div>

            {useTimeSlotPicker ? (
              /* Time Slot Picker */
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <TimeSlotPicker
                    selectedDate={appointmentDate}
                    appointments={allAppointments}
                    onTimeSlotSelect={handleTimeSlotSelect}
                    config={timeSlotConfig}
                    currentAppointment={isEditing ? appointment : undefined}
                    selectedTimeSlot={selectedTimeSlot || undefined}
                  />
                </div>

                {/* Display selected time slot */}
                {selectedTimeSlot && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        Selected: {format(selectedTimeSlot.start, 'h:mm a')} - {format(selectedTimeSlot.end, 'h:mm a')}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({selectedTimeSlot.duration} minutes)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Manual Date/Time Input */
              <div className="space-y-4">
                {/* Date Input */}
                <div className="space-y-2">
                  <Label htmlFor="manual_date">Appointment Date *</Label>
                  <Input
                    id="manual_date"
                    type="date"
                    value={format(appointmentDate, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value)
                      handleDateChange(newDate)
                    }}
                    className="w-full"
                  />
                </div>

                {/* Time Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time_only">Start Time *</Label>
                    <Input
                      id="start_time_only"
                      type="time"
                      value={form.watch('start_time') ? format(new Date(form.watch('start_time')), 'HH:mm') : '09:00'}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':')
                        const startDateTime = new Date(appointmentDate)
                        startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

                        const formattedDateTime = formatDateTimeLocal(startDateTime)
                        form.setValue('start_time', formattedDateTime)

                        // Auto-update end time based on template
                        if (selectedTemplateId && templates) {
                          const template = templates.find((t: VisitTemplate) => t.id === selectedTemplateId)
                          if (template) {
                            const endDateTime = addMinutes(startDateTime, template.duration_minutes)
                            form.setValue('end_time', formatDateTimeLocal(endDateTime))
                          }
                        }
                      }}
                      error={String(form.formState.errors.start_time?.message || '')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time_only">End Time *</Label>
                    <Input
                      id="end_time_only"
                      type="time"
                      value={form.watch('end_time') ? format(new Date(form.watch('end_time')), 'HH:mm') : '09:30'}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':')
                        const endDateTime = new Date(appointmentDate)
                        endDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

                        const formattedDateTime = formatDateTimeLocal(endDateTime)
                        form.setValue('end_time', formattedDateTime)

                        // Validate end time is after start time
                        const startTimeValue = form.getValues('start_time')
                        if (startTimeValue && endDateTime <= new Date(startTimeValue)) {
                          form.setError('end_time', { message: 'End time must be after start time' })
                        } else {
                          form.clearErrors('end_time')
                        }
                      }}
                      error={String(form.formState.errors.end_time?.message || '')}
                    />
                  </div>
                </div>

                {/* Time Duration Display */}
                {form.watch('start_time') && form.watch('end_time') && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        Duration: {Math.round((new Date(form.watch('end_time')).getTime() - new Date(form.watch('start_time')).getTime()) / (1000 * 60))} minutes
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(form.watch('start_time')), 'h:mm a')} - {format(new Date(form.watch('end_time')), 'h:mm a')} on {format(appointmentDate, 'EEEE, MMM d, yyyy')}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Input
                id="reason"
                {...form.register('reason')}
                error={String(form.formState.errors.reason?.message || '')}
                placeholder="Annual checkup, follow-up, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value) => form.setValue('status', value as 'scheduled' | 'completed' | 'cancelled')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...form.register('notes')}
                error={String(form.formState.errors.notes?.message || '')}
                placeholder="Additional notes for this appointment..."
                rows={3}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Appointment' : 'Schedule Appointment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}