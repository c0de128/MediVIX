'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Clock,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertTriangle,
  Bell,
  Users,
  Stethoscope,
  TestTube,
  Pill,
  FileText,
  Plus
} from 'lucide-react'
import { format, addDays, addWeeks, addMonths } from 'date-fns'

interface Recommendation {
  id: string
  type: 'appointment' | 'test' | 'medication' | 'lifestyle' | 'monitoring'
  title: string
  description: string
  urgency: 'low' | 'medium' | 'high'
  timeframe: string
  completed?: boolean
  dueDate?: Date
  assignedTo?: string
  notes?: string
}

interface FollowUpRecommendationsProps {
  recommendations: Recommendation[]
  patientId?: string
  onScheduleAppointment?: (recommendation: Recommendation) => void
  onMarkComplete?: (recommendationId: string) => void
  onAddNote?: (recommendationId: string, note: string) => void
  onSetReminder?: (recommendationId: string, date: Date) => void
  compact?: boolean
}

export function FollowUpRecommendations({
  recommendations,
  patientId,
  onScheduleAppointment,
  onMarkComplete,
  onAddNote,
  onSetReminder,
  compact = false
}: FollowUpRecommendationsProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return CalendarIcon
      case 'test':
        return TestTube
      case 'medication':
        return Pill
      case 'lifestyle':
        return Users
      case 'monitoring':
        return Stethoscope
      default:
        return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'test':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'medication':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'lifestyle':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'monitoring':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
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

  const getDueDateFromTimeframe = (timeframe: string): Date => {
    const today = new Date()
    const lowerTimeframe = timeframe.toLowerCase()

    if (lowerTimeframe.includes('day')) {
      const days = parseInt(lowerTimeframe.match(/\d+/)?.[0] || '1')
      return addDays(today, days)
    } else if (lowerTimeframe.includes('week')) {
      const weeks = parseInt(lowerTimeframe.match(/\d+/)?.[0] || '1')
      return addWeeks(today, weeks)
    } else if (lowerTimeframe.includes('month')) {
      const months = parseInt(lowerTimeframe.match(/\d+/)?.[0] || '1')
      return addMonths(today, months)
    }

    return addWeeks(today, 1) // Default to 1 week
  }

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    // Sort by urgency first (high -> medium -> low), then by completion status
    const urgencyOrder = { high: 3, medium: 2, low: 1 }
    const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
    if (urgencyDiff !== 0) return urgencyDiff

    // Incomplete items first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }

    return 0
  })

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-blue-600" />
            Follow-up Actions ({recommendations.filter(r => !r.completed).length} pending)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedRecommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className="flex items-center gap-3 p-2 rounded border">
                <Checkbox
                  checked={rec.completed || false}
                  onCheckedChange={() => onMarkComplete?.(rec.id)}
                />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${rec.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {rec.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{rec.timeframe}</p>
                </div>
                <Badge variant={getUrgencyColor(rec.urgency)} className="text-xs">
                  {rec.urgency}
                </Badge>
              </div>
            ))}
            {recommendations.length > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{recommendations.length - 3} more recommendations
              </p>
            )}
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
            <Clock className="h-5 w-5 text-blue-600" />
            Follow-up Recommendations
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {recommendations.filter(r => !r.completed).length} pending
            </Badge>
            <Badge variant="secondary">
              {recommendations.filter(r => r.completed).length} completed
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {sortedRecommendations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Follow-up Required</h3>
            <p className="text-muted-foreground">
              All recommendations have been completed or no follow-up actions are needed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedRecommendations.map((rec) => {
              const TypeIcon = getTypeIcon(rec.type)
              const typeColorClass = getTypeColor(rec.type)
              const dueDate = rec.dueDate || getDueDateFromTimeframe(rec.timeframe)

              return (
                <div
                  key={rec.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    rec.completed
                      ? 'bg-muted/30 border-muted'
                      : 'bg-background border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <Checkbox
                      checked={rec.completed || false}
                      onCheckedChange={() => onMarkComplete?.(rec.id)}
                      className="mt-1"
                    />

                    {/* Type Icon */}
                    <div className={`p-2 rounded-lg border ${typeColorClass}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={`font-semibold ${rec.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {rec.title}
                          </h4>
                          <p className={`text-sm ${rec.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                            {rec.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={getUrgencyColor(rec.urgency)}>
                            {rec.urgency}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {rec.type}
                          </Badge>
                        </div>
                      </div>

                      {/* Timeline and Due Date */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{rec.timeframe}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>Due: {format(dueDate, 'MMM d, yyyy')}</span>
                        </div>
                        {rec.assignedTo && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{rec.assignedTo}</span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {rec.notes && (
                        <div className="p-2 bg-muted/50 rounded text-xs">
                          <strong>Notes:</strong> {rec.notes}
                        </div>
                      )}

                      {/* Actions */}
                      {!rec.completed && (
                        <div className="flex items-center gap-2 pt-2">
                          {rec.type === 'appointment' && onScheduleAppointment && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onScheduleAppointment(rec)}
                            >
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              Schedule
                            </Button>
                          )}

                          {onSetReminder && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <Bell className="h-3 w-3 mr-1" />
                                  Remind
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={(date) => {
                                    if (date) {
                                      setSelectedDate(date)
                                      onSetReminder(rec.id, date)
                                    }
                                  }}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          )}

                          {onAddNote && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const note = prompt('Add a note for this recommendation:')
                                if (note) onAddNote(rec.id, note)
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Note
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Summary Stats */}
        <Separator />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {recommendations.filter(r => r.completed).length}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {recommendations.filter(r => !r.completed && r.urgency === 'high').length}
            </div>
            <div className="text-xs text-muted-foreground">High Priority</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {recommendations.filter(r => !r.completed && r.type === 'appointment').length}
            </div>
            <div className="text-xs text-muted-foreground">Appointments</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {recommendations.filter(r => !r.completed && r.type === 'test').length}
            </div>
            <div className="text-xs text-muted-foreground">Tests</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}