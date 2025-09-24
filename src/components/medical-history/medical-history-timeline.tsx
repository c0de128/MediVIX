'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Clock,
  Activity,
  Heart,
  Pill,
  FileText,
  TestTube,
  Stethoscope,
  Calendar,
  User,
  Plus,
  Filter
} from 'lucide-react'
import { format } from 'date-fns'

interface MedicalHistoryTimelineProps {
  patientId: string
  onAddEntry?: () => void
  limit?: number
}

const getEntryIcon = (entryType: string) => {
  switch (entryType) {
    case 'diagnosis':
      return Stethoscope
    case 'treatment':
      return Activity
    case 'medication':
      return Pill
    case 'lab_result':
      return TestTube
    case 'procedure':
      return Heart
    case 'note':
      return FileText
    default:
      return FileText
  }
}

const getEntryColor = (entryType: string) => {
  switch (entryType) {
    case 'diagnosis':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'treatment':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'medication':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'lab_result':
      return 'text-purple-600 bg-purple-50 border-purple-200'
    case 'procedure':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'note':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

const getSeverityColor = (severity?: string) => {
  switch (severity) {
    case 'high':
      return 'destructive'
    case 'medium':
      return 'default'
    case 'low':
      return 'secondary'
    default:
      return 'outline'
  }
}

export function MedicalHistoryTimeline({ patientId, onAddEntry, limit }: MedicalHistoryTimelineProps) {
  const [entryTypeFilter, setEntryTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: medicalHistory, isLoading, error } = useQuery({
    queryKey: ['medical-history', patientId, entryTypeFilter, statusFilter, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        patient_id: patientId,
        ...(entryTypeFilter !== 'all' && { entry_type: entryTypeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(limit && { limit: limit.toString() }),
      })

      const response = await fetch(`/api/medical-history?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch medical history')
      }
      return response.json()
    },
    enabled: !!patientId,
  })

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading medical history: {(error as Error).message}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Medical History Timeline
          </CardTitle>
          <div className="flex items-center gap-2">
            {onAddEntry && (
              <Button size="sm" onClick={onAddEntry}>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={entryTypeFilter} onValueChange={setEntryTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Entry Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="diagnosis">Diagnosis</SelectItem>
                <SelectItem value="treatment">Treatment</SelectItem>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="lab_result">Lab Result</SelectItem>
                <SelectItem value="procedure">Procedure</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="chronic">Chronic</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="h-10 w-10 rounded-full mt-1" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[300px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : medicalHistory?.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No medical history found</h3>
            <p className="text-muted-foreground mb-4">
              {entryTypeFilter !== 'all' || statusFilter !== 'all'
                ? 'No entries match your current filters.'
                : 'This patient has no medical history records yet.'}
            </p>
            {onAddEntry && (
              <Button onClick={onAddEntry}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Entry
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {medicalHistory?.map((entry: any, index: number) => {
              const Icon = getEntryIcon(entry.entry_type)
              const iconColorClass = getEntryColor(entry.entry_type)

              return (
                <div key={entry.id} className="relative">
                  {/* Timeline line */}
                  {index < medicalHistory.length - 1 && (
                    <div className="absolute left-5 top-10 h-full w-px bg-border" />
                  )}

                  <div className="flex items-start space-x-4">
                    {/* Timeline icon */}
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${iconColorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Entry content */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-lg">{entry.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(entry.date_recorded), 'MMM d, yyyy h:mm a')}</span>
                            {entry.provider_name && (
                              <>
                                <Separator orientation="vertical" className="h-3" />
                                <User className="h-3 w-3" />
                                <span>{entry.provider_name}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {entry.entry_type.replace('_', ' ')}
                          </Badge>
                          <Badge variant={getSeverityColor(entry.severity)} className="capitalize">
                            {entry.status}
                          </Badge>
                          {entry.severity && (
                            <Badge variant={getSeverityColor(entry.severity)} className="capitalize">
                              {entry.severity}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {entry.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {entry.description}
                        </p>
                      )}

                      {/* Additional information */}
                      <div className="space-y-2">
                        {entry.medications && entry.medications.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Medications: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {entry.medications.map((medication: string, medIndex: number) => (
                                <Badge key={medIndex} variant="secondary" className="text-xs">
                                  {medication}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {entry.lab_values && Object.keys(entry.lab_values).length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Lab Values: </span>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                              {Object.entries(entry.lab_values).map(([key, value]: [string, any]) => (
                                <div key={key} className="text-xs">
                                  <span className="font-medium">{key}:</span> {value}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {entry.attachments && entry.attachments.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Attachments: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {entry.attachments.map((attachment: string, attIndex: number) => (
                                <Badge key={attIndex} variant="outline" className="text-xs">
                                  {attachment}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Related appointment */}
                      {entry.appointments && (
                        <div className="border-l-2 border-muted pl-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Related to appointment on{' '}
                              {entry.appointments.start_time ?
                                format(new Date(entry.appointments.start_time), 'MMM d, yyyy') :
                                entry.appointments.appointment_date ?
                                format(new Date(entry.appointments.appointment_date), 'MMM d, yyyy') :
                                'Date TBD'
                              }
                            </span>
                            {entry.appointments.visit_templates?.name && (
                              <span>({entry.appointments.visit_templates.name})</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {limit && medicalHistory?.length >= limit && (
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing recent {limit} entries. View patient details for complete history.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}