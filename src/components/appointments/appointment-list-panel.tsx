'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UpcomingAppointmentsSummary } from '@/components/appointments/upcoming-appointments-summary'
import {
  Calendar,
  Clock,
  User,
  FileText,
  Edit,
  Search,
  Filter,
  SortAsc,
  ChevronRight
} from 'lucide-react'
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'
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

interface AppointmentListPanelProps {
  appointments: Appointment[]
  onAppointmentEdit: (appointment: Appointment) => void
  onAppointmentSelect?: (appointment: Appointment) => void
  isLoading?: boolean
  className?: string
}

type SortOption = 'date-asc' | 'date-desc' | 'patient' | 'status'
type StatusFilter = 'all' | 'scheduled' | 'completed' | 'cancelled'

export function AppointmentListPanel({
  appointments,
  onAppointmentEdit,
  onAppointmentSelect,
  isLoading = false,
  className
}: AppointmentListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('date-asc')

  // Filter appointments based on search query and status
  const filteredAppointments = appointments.filter((apt) => {
    // Status filter
    if (statusFilter !== 'all' && apt.status !== statusFilter) {
      return false
    }

    // Search filter
    if (!searchQuery) return true

    const searchLower = searchQuery.toLowerCase()
    const patientName = apt.patients
      ? `${apt.patients.first_name} ${apt.patients.last_name}`.toLowerCase()
      : ''
    const reason = apt.reason?.toLowerCase() || ''
    const notes = apt.notes?.toLowerCase() || ''
    const status = apt.status.toLowerCase()

    return (
      patientName.includes(searchLower) ||
      reason.includes(searchLower) ||
      notes.includes(searchLower) ||
      status.includes(searchLower)
    )
  })

  // Sort appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      case 'date-desc':
        return new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      case 'patient':
        const nameA = a.patients ? `${a.patients.first_name} ${a.patients.last_name}` : ''
        const nameB = b.patients ? `${b.patients.first_name} ${b.patients.last_name}` : ''
        return nameA.localeCompare(nameB)
      case 'status':
        return a.status.localeCompare(b.status)
      default:
        return 0
    }
  })

  // Current time for determining if appointments are upcoming (used in appointments list rendering)
  const now = new Date()

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

  const handleAppointmentClick = (appointment: Appointment) => {
    if (onAppointmentSelect) {
      onAppointmentSelect(appointment)
    } else {
      onAppointmentEdit(appointment)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upcoming Appointments Summary */}
      <UpcomingAppointmentsSummary
        appointments={appointments}
      />

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={setSearchQuery}
                showClearButton={true}
                size="md"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-asc">Date (Earliest)</SelectItem>
                <SelectItem value="date-desc">Date (Latest)</SelectItem>
                <SelectItem value="patient">Patient Name</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {sortedAppointments.length} of {appointments.length} appointments
            </span>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="h-6 px-2"
              >
                Clear search
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading appointments...</p>
            </div>
          ) : sortedAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No Matching Appointments' : 'No Appointments'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'No appointments match your search criteria.'
                  : 'No appointments have been scheduled yet.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {sortedAppointments.map((appointment) => {
                const startDate = new Date(appointment.start_time)
                const endDate = new Date(appointment.end_time)
                const duration = calculateDuration(startDate, endDate)
                const isUpcoming = isAfter(startDate, now)

                return (
                  <div
                    key={appointment.id}
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50
                      ${getStatusColor(appointment.status)}
                    `}
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">
                            {format(startDate, 'MMM d, yyyy')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(startDate)} - {formatTime(endDate)} ({duration} min)
                          </div>
                        </div>
                        {isUpcoming && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">
                            Upcoming
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {appointment.status.replace('_', ' ')}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
                          <p className="text-sm text-muted-foreground line-clamp-2">
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
    </div>
  )
}