'use client'

import { useState } from 'react'
import { usePatients } from '@/hooks/use-patients'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PatientListSkeleton, LoadingOverlay } from '@/components/ui/loading-skeletons'
import { SearchInput } from '@/components/ui/search'
import { Plus, User, Phone, Mail, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface PatientListProps {
  onPatientSelect?: (patientId: string) => void
  onCreatePatient?: () => void
  selectedPatientId?: string
}

export function PatientList({
  onPatientSelect,
  onCreatePatient,
  selectedPatientId
}: PatientListProps) {
  const [search, setSearch] = useState('')
  const { data: patients, isLoading, error } = usePatients(search)

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading patients: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="Search patients..."
            value={search}
            onChange={setSearch}
            showClearButton={true}
            size="md"
          />
        </div>
        {onCreatePatient && (
          <Button onClick={onCreatePatient}>
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <PatientListSkeleton count={5} />
        ) : patients?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No patients found</h3>
              <p className="text-muted-foreground mb-4">
                {search ? 'No patients match your search.' : 'Get started by adding your first patient.'}
              </p>
              {onCreatePatient && (
                <Button onClick={onCreatePatient}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          patients?.map((patient) => (
            <Card
              key={patient.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedPatientId === patient.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onPatientSelect?.(patient.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {patient.dob ? (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(new Date(patient.dob), 'MMM d, yyyy')}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>DOB not provided</span>
                          </div>
                        )}
                        {patient.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{patient.phone}</span>
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{patient.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {(patient as any).insurance_provider && (
                      <Badge variant="secondary" className="text-xs">
                        {(patient as any).insurance_provider}
                      </Badge>
                    )}
                    {(patient as any).emergency_contact_name && (
                      <Badge variant="outline" className="text-xs">
                        Emergency Contact
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}