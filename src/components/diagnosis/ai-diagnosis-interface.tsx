'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { usePatients } from '@/hooks/use-patients'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, Plus, X, Send, Loader2, AlertTriangle, Stethoscope } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { GuidedSymptomCollection } from './guided-symptom-collection'

const diagnosisSchema = z.object({
  patient_id: z.string().uuid('Please select a patient'),
  symptoms: z.array(z.string()).min(1, 'At least one symptom is required'),
  duration: z.string().min(1, 'Duration is required'),
  severity: z.enum(['mild', 'moderate', 'severe']),
  additional_notes: z.string().optional(),
})

type DiagnosisFormData = z.infer<typeof diagnosisSchema>

interface DiagnosisResult {
  diagnosis: string
  confidence: number
  reasoning: string
  emergency_level?: 'immediate' | 'urgent' | 'routine'
  red_flags?: string[]
  warning_signs?: string[]
  patient_education?: string
  icd10_code?: string
  category?: string
  differential_diagnoses: Array<{
    condition: string
    probability: number
    reasoning: string
    category?: string
    icd10_code?: string
  }>
  recommendations: Array<{
    type: string
    description: string
    urgency: string
    timeframe?: string
    rationale?: string
  }>
  follow_up: Array<{
    timeframe: string
    action: string
    urgency?: string
    rationale?: string
  }>
  drug_recommendations?: Array<{
    drug: string
    dosage: string
    duration: string
    notes: string
  }>
  allergy_warnings?: Array<{
    drug: string
    allergies: Array<{ allergy: string; severity: string }>
  }>
  is_ai_generated?: boolean
  generated_at?: string
}

interface AIDiagnosisInterfaceProps {
  selectedPatientId?: string
  onPatientSelect?: (patientId: string) => void
  onDiagnosisComplete?: (result: DiagnosisResult) => void
}

export function AIDiagnosisInterface({
  selectedPatientId,
  onPatientSelect,
  onDiagnosisComplete
}: AIDiagnosisInterfaceProps) {
  const { toast } = useToast()
  const { data: patients } = usePatients()
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [newSymptom, setNewSymptom] = useState('')
  const [showGuidedCollection, setShowGuidedCollection] = useState(false)
  const [structuredSymptomData, setStructuredSymptomData] = useState<any>(null)

  const form = useForm<DiagnosisFormData>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: {
      patient_id: selectedPatientId || '',
      symptoms: [],
      duration: '',
      severity: 'moderate',
      additional_notes: '',
    },
  })

  useEffect(() => {
    if (selectedPatientId) {
      form.setValue('patient_id', selectedPatientId)
    }
  }, [selectedPatientId, form])

  const diagnosisMutation = useMutation({
    mutationFn: async (data: DiagnosisFormData) => {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to get diagnosis')
      }

      const result = await response.json()

      // Handle wrapped response format from successResponse()
      if (result.success && result.data) {
        return result.data
      }

      // Handle direct response format (fallback)
      return result
    },
    onSuccess: (result) => {
      console.log('Diagnosis result received:', result)
      onDiagnosisComplete?.(result)
      toast({
        title: 'Diagnosis Complete',
        description: 'AI analysis has been completed successfully.',
      })
    },
    onError: (error: any) => {
      console.error('Diagnosis mutation error:', error)
      toast({
        title: 'Diagnosis Failed',
        description: error.message || 'Failed to get AI diagnosis',
        variant: 'destructive',
      })
    },
  })

  // Common symptoms organized by category
  const commonSymptoms = {
    general: ['Fever', 'Fatigue', 'Weight Loss', 'Night Sweats', 'Chills', 'Loss of Appetite'],
    pain: ['Headache', 'Back Pain', 'Chest Pain', 'Abdominal Pain', 'Joint Pain', 'Muscle Pain'],
    respiratory: ['Cough', 'Shortness of Breath', 'Sore Throat', 'Runny Nose', 'Congestion', 'Wheezing'],
    gastrointestinal: ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Heartburn', 'Bloating'],
    neurological: ['Dizziness', 'Confusion', 'Memory Problems', 'Numbness', 'Tingling', 'Weakness']
  }

  const addSymptom = () => {
    if (newSymptom.trim() && !symptoms.includes(newSymptom.trim())) {
      const updatedSymptoms = [...symptoms, newSymptom.trim()]
      setSymptoms(updatedSymptoms)
      form.setValue('symptoms', updatedSymptoms)
      setNewSymptom('')
    }
  }

  const addCommonSymptom = (symptom: string) => {
    if (!symptoms.includes(symptom)) {
      const updatedSymptoms = [...symptoms, symptom]
      setSymptoms(updatedSymptoms)
      form.setValue('symptoms', updatedSymptoms)
    }
  }

  const removeSymptom = (index: number) => {
    const updatedSymptoms = symptoms.filter((_, i) => i !== index)
    setSymptoms(updatedSymptoms)
    form.setValue('symptoms', updatedSymptoms)
  }

  const handleGuidedSymptomComplete = (symptomData: any, structuredSymptoms: string[]) => {
    setStructuredSymptomData(symptomData)
    setSymptoms(structuredSymptoms)
    form.setValue('symptoms', structuredSymptoms)

    // Auto-populate duration and severity from guided collection
    if (symptomData.duration?.howLong) {
      form.setValue('duration', symptomData.duration.howLong)
    }

    // Map severity scale to severity level
    const severityLevel = symptomData.severity?.scale >= 7 ? 'severe'
      : symptomData.severity?.scale >= 4 ? 'moderate' : 'mild'
    form.setValue('severity', severityLevel)

    // Add structured notes to additional_notes
    const structuredNotes = formatStructuredNotes(symptomData)
    form.setValue('additional_notes', structuredNotes)

    setShowGuidedCollection(false)

    toast({
      title: 'Symptom Assessment Complete',
      description: 'Your detailed symptom information has been captured.',
    })
  }

  const formatStructuredNotes = (symptomData: any): string => {
    const notes = []

    if (symptomData.onset?.when) {
      notes.push(`Onset: ${symptomData.onset.when}${symptomData.onset.suddenOrGradual ? ` (${symptomData.onset.suddenOrGradual})` : ''}`)
    }

    if (symptomData.location?.primary) {
      notes.push(`Location: ${symptomData.location.primary}`)
      if (symptomData.location.radiates && symptomData.location.radiationSites?.length) {
        notes.push(`Radiates to: ${symptomData.location.radiationSites.join(', ')}`)
      }
    }

    if (symptomData.character?.quality && symptomData.character?.description) {
      notes.push(`Character: ${symptomData.character.quality} - ${symptomData.character.description}`)
    }

    if (symptomData.aggravating?.length) {
      notes.push(`Aggravated by: ${symptomData.aggravating.join(', ')}`)
    }

    if (symptomData.relieving?.length) {
      notes.push(`Relieved by: ${symptomData.relieving.join(', ')}`)
    }

    if (symptomData.timing?.pattern) {
      notes.push(`Pattern: ${symptomData.timing.pattern}`)
    }

    if (symptomData.severity?.impact) {
      notes.push(`Impact: ${symptomData.severity.impact}`)
    }

    return notes.join('\n')
  }

  const onSubmit = async (data: DiagnosisFormData) => {
    const formData = {
      ...data,
      symptoms,
    }
    diagnosisMutation.mutate(formData)
  }

  const isLoading = diagnosisMutation.isPending

  if (showGuidedCollection) {
    return (
      <div className="space-y-6">
        <GuidedSymptomCollection
          onComplete={handleGuidedSymptomComplete}
          onCancel={() => setShowGuidedCollection(false)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI-Powered Medical Diagnosis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter patient symptoms and get AI-assisted diagnostic recommendations
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Patient Selection */}
            <div className="space-y-2">
              <Label htmlFor="patient_id">Patient *</Label>
              <Select
                value={form.watch('patient_id')}
                onValueChange={(value) => {
                  form.setValue('patient_id', value)
                  onPatientSelect?.(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients?.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.patient_id && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.patient_id.message}
                </p>
              )}
            </div>

            <Separator />

            {/* Symptoms Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Symptoms *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGuidedCollection(true)}
                  className="text-sm"
                >
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Guided Assessment
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Enter symptom (e.g., headache, fever, nausea)"
                  value={newSymptom}
                  onChange={(e) => setNewSymptom(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSymptom()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addSymptom}
                  disabled={!newSymptom.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Common Symptoms */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Common Symptoms (click to add):</Label>
                <div className="space-y-2">
                  {Object.entries(commonSymptoms).map(([category, categorySymptoms]) => (
                    <div key={category} className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground capitalize">{category}</p>
                      <div className="flex flex-wrap gap-1">
                        {categorySymptoms.map((symptom) => (
                          <Button
                            key={symptom}
                            type="button"
                            variant={symptoms.includes(symptom) ? "secondary" : "outline"}
                            size="sm"
                            className={`text-xs h-7 ${symptoms.includes(symptom) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 hover:border-blue-300'}`}
                            onClick={() => addCommonSymptom(symptom)}
                            disabled={symptoms.includes(symptom)}
                          >
                            {symptoms.includes(symptom) ? '✓ ' : ''}{symptom}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                💡 Use <strong>Guided Assessment</strong> for comprehensive symptom evaluation using medical standards (OLDCARTS)
              </div>

              {symptoms.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((symptom, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {symptom}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeSymptom(index)}
                      />
                    </Badge>
                  ))}
                </div>
              )}

              {form.formState.errors.symptoms && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.symptoms.message}
                </p>
              )}
            </div>

            {/* Duration and Severity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 3 days, 2 weeks, 1 month"
                  {...form.register('duration')}
                  error={form.formState.errors.duration?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity *</Label>
                <Select
                  value={form.watch('severity')}
                  onValueChange={(value) => form.setValue('severity', value as 'mild' | 'moderate' | 'severe')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.severity && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.severity.message}
                  </p>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="additional_notes">Additional Notes</Label>
              <Textarea
                id="additional_notes"
                placeholder="Any additional context, patient history, or observations..."
                {...form.register('additional_notes')}
                error={form.formState.errors.additional_notes?.message}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading || symptoms.length === 0}
                className="min-w-[150px]"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Send className="h-4 w-4 mr-2" />
                Get AI Diagnosis
              </Button>
            </div>
          </form>

          {/* Medical Disclaimer */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Medical Disclaimer</p>
                <p className="text-amber-700 mt-1">
                  This AI diagnosis tool is for assistive purposes only. Always consult with qualified healthcare professionals for proper medical diagnosis and treatment. Do not use this tool as a substitute for professional medical advice.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}