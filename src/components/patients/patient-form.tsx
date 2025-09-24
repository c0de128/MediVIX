'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreatePatient, useUpdatePatient } from '@/hooks/use-patients'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, X, Save, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { patientSchemas, type PatientCreateData } from '@/lib/validation/schemas'
import { fieldValidators, sanitizeUtils } from '@/lib/validation/utils'
import { showErrorToast, showSuccessToast, setFormErrors } from '@/lib/user-feedback'
import { LoadingOverlay } from '@/components/ui/loading-skeletons'

type PatientFormData = PatientCreateData

interface PatientFormProps {
  patient?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function PatientForm({ patient, onSuccess, onCancel }: PatientFormProps) {
  const { toast } = useToast()
  const createMutation = useCreatePatient()
  const updateMutation = useUpdatePatient()
  const isEditing = !!patient

  const [allergies, setAllergies] = useState<string[]>(patient?.allergies || [])
  const [medications, setMedications] = useState<string[]>(patient?.medications || [])
  const [conditions, setConditions] = useState<string[]>(patient?.chronic_conditions || [])
  const [newAllergy, setNewAllergy] = useState('')
  const [newMedication, setNewMedication] = useState('')
  const [newCondition, setNewCondition] = useState('')

  const form = useForm<PatientFormData>({
    resolver: zodResolver(isEditing ? patientSchemas.update : patientSchemas.create),
    defaultValues: {
      first_name: patient?.first_name || '',
      last_name: patient?.last_name || '',
      dob: patient?.dob ? patient.dob.split('T')[0] : '',
      phone: patient?.phone || '',
      email: patient?.email || '',
      insurance_provider: patient?.insurance_provider || '',
      insurance_id: patient?.insurance_id || '',
      emergency_contact_name: patient?.emergency_contact_name || '',
      emergency_contact_phone: patient?.emergency_contact_phone || '',
      emergency_contact_relationship: patient?.emergency_contact_relationship || '',
      allergies: patient?.allergies || [],
      medications: patient?.medications || [],
      chronic_conditions: patient?.chronic_conditions || [],
    },
  })

  const onSubmit = async (data: PatientFormData) => {
    try {
      // Sanitize form data before submission
      const sanitizedData = {
        ...data,
        first_name: sanitizeUtils.sanitizeString(data.first_name),
        last_name: sanitizeUtils.sanitizeString(data.last_name),
        phone: data.phone ? sanitizeUtils.sanitizePhone(data.phone) : '',
        email: data.email ? sanitizeUtils.sanitizeEmail(data.email) : '',
        insurance_provider: data.insurance_provider ? sanitizeUtils.sanitizeString(data.insurance_provider) : '',
        insurance_id: data.insurance_id ? sanitizeUtils.sanitizeString(data.insurance_id) : '',
        emergency_contact_name: data.emergency_contact_name ? sanitizeUtils.sanitizeString(data.emergency_contact_name) : '',
        emergency_contact_phone: data.emergency_contact_phone ? sanitizeUtils.sanitizePhone(data.emergency_contact_phone) : '',
        emergency_contact_relationship: data.emergency_contact_relationship ? sanitizeUtils.sanitizeString(data.emergency_contact_relationship) : '',
        allergies: sanitizeUtils.sanitizeArray(allergies),
        medications: sanitizeUtils.sanitizeArray(medications),
        chronic_conditions: sanitizeUtils.sanitizeArray(conditions),
      }

      if (isEditing) {
        await updateMutation.mutateAsync({ id: patient.id, ...sanitizedData })
        showSuccessToast('Success', 'Patient updated successfully')
      } else {
        await createMutation.mutateAsync(sanitizedData as any)
        showSuccessToast('Success', 'Patient created successfully')
      }

      onSuccess?.()
    } catch (error: any) {
      // Set form field errors if validation failed
      setFormErrors(error, form.setError as any)
      // Show error toast
      showErrorToast(error)
    }
  }

  // Real-time validation handlers
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    form.setValue('email', value)

    // Real-time email validation
    const emailError = fieldValidators.validateEmailField(value)
    if (emailError) {
      form.setError('email', { message: emailError })
    } else {
      form.clearErrors('email')
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    form.setValue('phone', value)

    // Real-time phone validation
    const phoneError = fieldValidators.validatePhoneField(value)
    if (phoneError) {
      form.setError('phone', { message: phoneError })
    } else {
      form.clearErrors('phone')
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    form.setValue('dob', value)

    // Real-time date validation
    const dateError = fieldValidators.validateDateField(value)
    const ageError = value ? fieldValidators.validateAge(value) : null

    if (dateError) {
      form.setError('dob', { message: dateError })
    } else if (ageError) {
      form.setError('dob', { message: ageError })
    } else {
      form.clearErrors('dob')
    }
  }

  const addItem = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>, inputSetter: React.Dispatch<React.SetStateAction<string>>) => {
    if (value.trim()) {
      setter(prev => [...prev, value.trim()])
      inputSetter('')
    }
  }

  const removeItem = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index))
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <LoadingOverlay isLoading={isLoading}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Patient' : 'Add New Patient'}</CardTitle>
        </CardHeader>
        <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  {...form.register('first_name')}
                  error={form.formState.errors.first_name?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  {...form.register('last_name')}
                  error={form.formState.errors.last_name?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  {...form.register('dob')}
                  onChange={handleDateChange}
                  error={form.formState.errors.dob?.message}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...form.register('phone')}
                  onChange={handlePhoneChange}
                  error={form.formState.errors.phone?.message}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  onChange={handleEmailChange}
                  error={form.formState.errors.email?.message}
                  placeholder="patient@example.com"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Insurance Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Insurance Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insurance_provider">Insurance Provider</Label>
                <Input
                  id="insurance_provider"
                  {...form.register('insurance_provider')}
                  error={form.formState.errors.insurance_provider?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance_id">Policy Number</Label>
                <Input
                  id="insurance_id"
                  {...form.register('insurance_id')}
                  error={form.formState.errors.insurance_id?.message}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Emergency Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Name</Label>
                <Input
                  id="emergency_contact_name"
                  {...form.register('emergency_contact_name')}
                  error={form.formState.errors.emergency_contact_name?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  {...form.register('emergency_contact_phone')}
                  onChange={(e) => {
                    const value = e.target.value
                    form.setValue('emergency_contact_phone', value)
                    const phoneError = fieldValidators.validatePhoneField(value)
                    if (phoneError) {
                      form.setError('emergency_contact_phone', { message: phoneError })
                    } else {
                      form.clearErrors('emergency_contact_phone')
                    }
                  }}
                  error={form.formState.errors.emergency_contact_phone?.message}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                <Input
                  id="emergency_contact_relationship"
                  {...form.register('emergency_contact_relationship')}
                  error={form.formState.errors.emergency_contact_relationship?.message}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Medical Information</h3>

            {/* Allergies */}
            <div className="space-y-2">
              <Label>Allergies</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add allergy"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addItem(newAllergy, setAllergies, setNewAllergy)
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addItem(newAllergy, setAllergies, setNewAllergy)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="flex items-center gap-1">
                    {allergy}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeItem(index, setAllergies)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div className="space-y-2">
              <Label>Current Medications</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add medication"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addItem(newMedication, setMedications, setNewMedication)
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addItem(newMedication, setMedications, setNewMedication)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {medications.map((medication, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {medication}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeItem(index, setMedications)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Medical Conditions */}
            <div className="space-y-2">
              <Label>Medical Conditions</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add condition"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addItem(newCondition, setConditions, setNewCondition)
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addItem(newCondition, setConditions, setNewCondition)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {conditions.map((condition, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {condition}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeItem(index, setConditions)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Patient' : 'Create Patient'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </LoadingOverlay>
  )
}