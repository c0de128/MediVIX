'use client'

import { useState } from 'react'
import { usePatient } from '@/hooks/use-patients'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Shield,
  UserPlus,
  Edit,
  Heart,
  Clock,
  FileText
} from 'lucide-react'
import { format } from 'date-fns'

interface PatientCardProps {
  patientId: string
  onEdit?: () => void
}

export function PatientCard({ patientId, onEdit }: PatientCardProps) {
  const { data: patient, isLoading, error } = usePatient(patientId)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading patient: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!patient) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Patient not found
          </div>
        </CardContent>
      </Card>
    )
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {patient.first_name} {patient.last_name}
              </CardTitle>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                {patient.dob && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(patient.dob), 'MMM d, yyyy')}
                      ({calculateAge(patient.dob)} years old)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Accordion type="multiple" className="w-full" defaultValue={["contact", "insurance", "emergency", "medical", "history", "appointments"]}>
          <AccordionItem value="contact">
            <AccordionTrigger>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5" />
                <span className="font-semibold">Contact Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              {patient.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.phone}</span>
                </div>
              )}
              {patient.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.email}</span>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="insurance">
            <AccordionTrigger>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Insurance Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              {(patient as any).insurance_provider ? (
                <div>
                  <div className="font-medium">{(patient as any).insurance_provider}</div>
                  {(patient as any).insurance_id && (
                    <div className="text-sm text-muted-foreground">
                      Policy #: {(patient as any).insurance_id}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted-foreground">No insurance information on file</div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="emergency">
            <AccordionTrigger>
              <div className="flex items-center space-x-3">
                <UserPlus className="h-5 w-5" />
                <span className="font-semibold">Emergency Contact</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              {(patient as any).emergency_contact_name ? (
                <div>
                  <div className="font-medium">{(patient as any).emergency_contact_name}</div>
                  {(patient as any).emergency_contact_phone && (
                    <div className="text-sm text-muted-foreground">
                      {(patient as any).emergency_contact_phone}
                    </div>
                  )}
                  {(patient as any).emergency_contact_relationship && (
                    <div className="text-sm text-muted-foreground">
                      Relationship: {(patient as any).emergency_contact_relationship}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted-foreground">No emergency contact on file</div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="medical">
            <AccordionTrigger>
              <div className="flex items-center space-x-3">
                <Heart className="h-5 w-5" />
                <span className="font-semibold">Medical Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              {patient.allergies && patient.allergies.length > 0 && (
                <div>
                  <div className="font-medium text-sm mb-2">Allergies</div>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(patient as any).medications && (patient as any).medications.length > 0 && (
                <div>
                  <div className="font-medium text-sm mb-2">Current Medications</div>
                  <div className="flex flex-wrap gap-2">
                    {(patient as any).medications.map((medication: any, index: number) => (
                      <Badge key={index} variant="secondary">
                        {medication}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(patient as any).medical_conditions && (patient as any).medical_conditions.length > 0 && (
                <div>
                  <div className="font-medium text-sm mb-2">Medical Conditions</div>
                  <div className="flex flex-wrap gap-2">
                    {(patient as any).medical_conditions.map((condition: any, index: number) => (
                      <Badge key={index} variant="outline">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(!patient.allergies || patient.allergies.length === 0) &&
               (!(patient as any).medications || (patient as any).medications.length === 0) &&
               (!(patient as any).medical_conditions || (patient as any).medical_conditions.length === 0) && (
                <div className="text-muted-foreground">No medical information on file</div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="history">
            <AccordionTrigger>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Recent Medical History</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {patient.medical_history && patient.medical_history.length > 0 ? (
                <div className="space-y-3">
                  {patient.medical_history.slice(0, 5).map((entry: any, index: number) => (
                    <div key={index} className="border-l-2 border-muted pl-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{entry.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(entry.date_recorded), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {entry.description}
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {entry.entry_type}
                      </Badge>
                    </div>
                  ))}
                  {patient.medical_history.length > 5 && (
                    <div className="text-sm text-muted-foreground">
                      And {patient.medical_history.length - 5} more entries...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted-foreground">No medical history on file</div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="appointments">
            <AccordionTrigger>
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5" />
                <span className="font-semibold">Upcoming Appointments</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {patient.upcoming_appointments && patient.upcoming_appointments.length > 0 ? (
                <div className="space-y-3">
                  {patient.upcoming_appointments.map((appointment: any, index: number) => {
                    // Handle both start_time and appointment_date formats
                    const appointmentDate = appointment.start_time || appointment.appointment_date
                    const endTime = appointment.end_time

                    // Calculate duration if not provided
                    let duration = appointment.duration_minutes
                    if (!duration && appointmentDate && endTime) {
                      const startMs = new Date(appointmentDate).getTime()
                      const endMs = new Date(endTime).getTime()
                      duration = Math.round((endMs - startMs) / (1000 * 60)) // Convert to minutes
                    }

                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">
                            {appointmentDate ?
                              format(new Date(appointmentDate), 'MMM d, yyyy h:mm a') :
                              'Date TBD'
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.reason || 'Appointment'}
                            {duration && ` • ${duration} minutes`}
                          </div>
                        </div>
                        <Badge>{appointment.status || 'scheduled'}</Badge>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground">No upcoming appointments</div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}