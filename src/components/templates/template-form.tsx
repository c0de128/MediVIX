'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Plus, X, Loader2, Save } from 'lucide-react'

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  duration_minutes: z.number().min(5, 'Duration must be at least 5 minutes').max(480, 'Duration cannot exceed 8 hours'),
  default_notes: z.string().optional(),
  common_diagnoses: z.array(z.string()).min(1, 'At least one diagnosis is required'),
})

type TemplateFormData = z.infer<typeof templateSchema>

interface VisitTemplate {
  id: string
  name: string
  description: string
  duration_minutes: number
  default_notes: string
  common_diagnoses: string[]
  created_at: string
}

interface TemplateFormProps {
  template: VisitTemplate | null
  onSuccess: () => void
}

export function TemplateForm({ template, onSuccess }: TemplateFormProps) {
  const { toast } = useToast()
  const [diagnoses, setDiagnoses] = useState<string[]>(template?.common_diagnoses || [])
  const [newDiagnosis, setNewDiagnosis] = useState('')
  const isEditing = !!template

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template?.name || '',
      description: template?.description || '',
      duration_minutes: template?.duration_minutes || 30,
      default_notes: template?.default_notes || '',
      common_diagnoses: template?.common_diagnoses || [],
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      const url = isEditing ? `/api/templates/${template.id}` : '/api/templates'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${isEditing ? 'update' : 'create'} template`)
      }

      return response.json()
    },
    onSuccess: () => {
      toast({
        title: isEditing ? 'Template Updated' : 'Template Created',
        description: `Template has been ${isEditing ? 'updated' : 'created'} successfully.`,
      })
      onSuccess()
    },
    onError: (error: any) => {
      toast({
        title: `Failed to ${isEditing ? 'Update' : 'Create'} Template`,
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const addDiagnosis = () => {
    if (newDiagnosis.trim() && !diagnoses.includes(newDiagnosis.trim())) {
      const updatedDiagnoses = [...diagnoses, newDiagnosis.trim()]
      setDiagnoses(updatedDiagnoses)
      form.setValue('common_diagnoses', updatedDiagnoses)
      setNewDiagnosis('')
    }
  }

  const removeDiagnosis = (index: number) => {
    const updatedDiagnoses = diagnoses.filter((_, i) => i !== index)
    setDiagnoses(updatedDiagnoses)
    form.setValue('common_diagnoses', updatedDiagnoses)
  }

  const handleSubmit = (data: TemplateFormData) => {
    const formData = {
      ...data,
      common_diagnoses: diagnoses,
    }
    mutation.mutate(formData)
  }

  // Common diagnoses suggestions
  const commonDiagnosisSuggestions = [
    'Common Cold', 'Influenza', 'Hypertension', 'Type 2 Diabetes',
    'Asthma', 'Allergic Rhinitis', 'Gastroesophageal Reflux',
    'Urinary Tract Infection', 'Bronchitis', 'Sinusitis',
    'Migraine', 'Back Pain', 'Anxiety', 'Depression'
  ]

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Template Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Template Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Annual Physical Exam, Follow-up Visit"
          {...form.register('name')}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe the purpose and typical use cases for this template"
          rows={3}
          {...form.register('description')}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes) *</Label>
        <Input
          id="duration"
          type="number"
          placeholder="30"
          {...form.register('duration_minutes', { valueAsNumber: true })}
        />
        {form.formState.errors.duration_minutes && (
          <p className="text-sm text-destructive">
            {form.formState.errors.duration_minutes.message}
          </p>
        )}
      </div>

      {/* Default Notes */}
      <div className="space-y-2">
        <Label htmlFor="default_notes">Default Notes (Optional)</Label>
        <Textarea
          id="default_notes"
          placeholder="Any standard notes or instructions that should be included with this visit type"
          rows={3}
          {...form.register('default_notes')}
        />
      </div>

      <Separator />

      {/* Common Diagnoses */}
      <div className="space-y-4">
        <Label>Common Diagnoses *</Label>

        {/* Add Diagnosis Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter diagnosis (e.g., Hypertension, Type 2 Diabetes)"
            value={newDiagnosis}
            onChange={(e) => setNewDiagnosis(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addDiagnosis()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addDiagnosis}
            disabled={!newDiagnosis.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Diagnosis Suggestions */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Quick add common diagnoses:</p>
          <div className="flex flex-wrap gap-1">
            {commonDiagnosisSuggestions
              .filter(suggestion => !diagnoses.includes(suggestion))
              .slice(0, 8)
              .map((suggestion) => (
                <Button
                  key={suggestion}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    const updatedDiagnoses = [...diagnoses, suggestion]
                    setDiagnoses(updatedDiagnoses)
                    form.setValue('common_diagnoses', updatedDiagnoses)
                  }}
                >
                  + {suggestion}
                </Button>
              ))}
          </div>
        </div>

        {/* Selected Diagnoses */}
        {diagnoses.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected Diagnoses ({diagnoses.length}):</p>
            <div className="flex flex-wrap gap-2">
              {diagnoses.map((diagnosis, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {diagnosis}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeDiagnosis(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {form.formState.errors.common_diagnoses && (
          <p className="text-sm text-destructive">
            {form.formState.errors.common_diagnoses.message}
          </p>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending || diagnoses.length === 0}
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  )
}