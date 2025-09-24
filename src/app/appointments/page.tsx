'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AppointmentDayPanel } from '@/components/appointments/appointment-day-panel'
import { AppointmentListPanel } from '@/components/appointments/appointment-list-panel'
import { AppointmentForm } from '@/components/appointments/appointment-form'
import { AvailableSlotsSection } from '@/components/appointments/available-slots-section'
import { TodaysAppointments } from '@/components/appointments/todays-appointments'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { format, addMinutes } from 'date-fns'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  TimeSlot,
  DEFAULT_TIME_SLOT_CONFIG,
  type TimeSlotConfig
} from '@/lib/utils/time-slots'

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

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [activeTab, setActiveTab] = useState<'day' | 'list'>('day')

  const queryClient = useQueryClient()

  // Configurable time slot settings
  const timeSlotConfig: TimeSlotConfig = {
    ...DEFAULT_TIME_SLOT_CONFIG,
    defaultDuration: 30,
    bufferTime: 0,
    businessHours: {
      start: "08:00",
      end: "18:00",
      lunchStart: "12:00",
      lunchEnd: "13:00"
    },
    excludeWeekends: true
  }

  // Fetch all appointments
  const { data: allAppointments, isLoading } = useQuery({
    queryKey: ['appointments', 'all'],
    queryFn: async () => {
      const response = await fetch('/api/appointments')
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }
      return response.json()
    }
  })

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedAppointment(null)
    setActiveTab('day')
  }

  const handleAppointmentEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsEditDialogOpen(true)
  }

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot)
    setSelectedDate(timeSlot.start)
    setIsCreateDialogOpen(true)
  }

  const handleNewAppointment = (date: Date) => {
    setSelectedDate(date)
    setSelectedTimeSlot(null)
    setIsCreateDialogOpen(true)
  }

  const handleAppointmentCreated = () => {
    setIsCreateDialogOpen(false)
    setSelectedTimeSlot(null)
    queryClient.invalidateQueries({ queryKey: ['appointments'] })
  }

  const handleAppointmentUpdated = () => {
    setIsEditDialogOpen(false)
    setSelectedAppointment(null)
    queryClient.invalidateQueries({ queryKey: ['appointments'] })
  }

  // Get default appointment times for new appointments
  const getDefaultAppointmentTimes = () => {
    if (selectedTimeSlot) {
      return {
        start_time: format(selectedTimeSlot.start, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(selectedTimeSlot.end, "yyyy-MM-dd'T'HH:mm")
      }
    }

    // Default to 9 AM for selected date
    const defaultStart = new Date(selectedDate)
    defaultStart.setHours(9, 0, 0, 0)
    const defaultEnd = addMinutes(defaultStart, timeSlotConfig.defaultDuration)

    return {
      start_time: format(defaultStart, "yyyy-MM-dd'T'HH:mm"),
      end_time: format(defaultEnd, "yyyy-MM-dd'T'HH:mm")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Section 1: Appointment Management Tabs */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'day' | 'list')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="day">
                Day Details
              </TabsTrigger>
              <TabsTrigger value="list">
                All Appointments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="day" className="mt-6">
              <AppointmentDayPanel
                selectedDate={selectedDate}
                appointments={allAppointments || []}
                onTimeSlotSelect={handleTimeSlotSelect}
                onAppointmentEdit={handleAppointmentEdit}
                onNewAppointment={handleNewAppointment}
                timeSlotConfig={timeSlotConfig}
              />
            </TabsContent>

            <TabsContent value="list" className="mt-6">
              <AppointmentListPanel
                appointments={allAppointments || []}
                onAppointmentEdit={handleAppointmentEdit}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>


        {/* Section 4: Available Time Slots (only shown in Day Details view) */}
        {activeTab === 'day' && (
          <div className="animate-fadeIn">
            <AvailableSlotsSection
              selectedDate={selectedDate}
              appointments={allAppointments || []}
              onTimeSlotSelect={handleTimeSlotSelect}
              config={timeSlotConfig}
            />
          </div>
        )}
      </div>

      {/* Create Appointment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTimeSlot
                ? `New Appointment - ${format(selectedTimeSlot.start, 'MMM d, h:mm a')}`
                : 'Create New Appointment'
              }
            </DialogTitle>
          </DialogHeader>
          <AppointmentForm
            selectedDate={selectedDate}
            {...(selectedTimeSlot ? getDefaultAppointmentTimes() : {})}
            onSuccess={handleAppointmentCreated}
            onCancel={() => setIsCreateDialogOpen(false)}
            allAppointments={allAppointments || []}
            timeSlotConfig={timeSlotConfig}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <AppointmentForm
              appointment={selectedAppointment}
              onSuccess={handleAppointmentUpdated}
              onCancel={() => setIsEditDialogOpen(false)}
              allAppointments={allAppointments || []}
              timeSlotConfig={timeSlotConfig}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}