'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
// import { Progress } from '@/components/ui/progress' // Temporarily commented out to fix compilation
import { ChevronLeft, ChevronRight, Plus, X, AlertTriangle, CheckCircle } from 'lucide-react'

interface SymptomData {
  onset: {
    when: string
    suddenOrGradual: 'sudden' | 'gradual' | ''
    triggers: string[]
  }
  location: {
    primary: string
    radiates: boolean
    radiationSites: string[]
  }
  duration: {
    howLong: string
    constant: boolean
    intermittent: boolean
  }
  character: {
    quality: string
    description: string
  }
  aggravating: string[]
  relieving: string[]
  timing: {
    pattern: string
    timeOfDay: string[]
    frequency: string
  }
  severity: {
    scale: number
    impact: string
    worstEver: boolean
  }
  associatedSymptoms: string[]
}

interface GuidedSymptomCollectionProps {
  onComplete: (symptomData: SymptomData, structuredSymptoms: string[]) => void
  onCancel: () => void
}

const COMMON_SYMPTOMS = [
  'Pain', 'Headache', 'Nausea', 'Vomiting', 'Fever', 'Chills', 'Fatigue',
  'Dizziness', 'Shortness of breath', 'Chest pain', 'Abdominal pain',
  'Back pain', 'Joint pain', 'Muscle pain', 'Cough', 'Sore throat',
  'Runny nose', 'Congestion', 'Rash', 'Swelling'
]

const PAIN_QUALITIES = [
  'Sharp', 'Dull', 'Aching', 'Burning', 'Stabbing', 'Cramping',
  'Throbbing', 'Pressure', 'Tight', 'Shooting'
]

const TIMING_PATTERNS = [
  'Constant', 'Intermittent', 'Comes and goes', 'Getting worse',
  'Getting better', 'Same since started', 'Cyclical', 'Random'
]

export function GuidedSymptomCollection({ onComplete, onCancel }: GuidedSymptomCollectionProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [symptomData, setSymptomData] = useState<SymptomData>({
    onset: { when: '', suddenOrGradual: '', triggers: [] },
    location: { primary: '', radiates: false, radiationSites: [] },
    duration: { howLong: '', constant: false, intermittent: false },
    character: { quality: '', description: '' },
    aggravating: [],
    relieving: [],
    timing: { pattern: '', timeOfDay: [], frequency: '' },
    severity: { scale: 5, impact: '', worstEver: false },
    associatedSymptoms: []
  })

  const [newTrigger, setNewTrigger] = useState('')
  const [newAggravator, setNewAggravator] = useState('')
  const [newReliever, setNewReliever] = useState('')
  const [newSymptom, setNewSymptom] = useState('')

  const steps = [
    { title: 'Onset', subtitle: 'When did it start?' },
    { title: 'Location', subtitle: 'Where is it located?' },
    { title: 'Duration', subtitle: 'How long have you had it?' },
    { title: 'Character', subtitle: 'What does it feel like?' },
    { title: 'Aggravating', subtitle: 'What makes it worse?' },
    { title: 'Relieving', subtitle: 'What makes it better?' },
    { title: 'Timing', subtitle: 'When does it occur?' },
    { title: 'Severity', subtitle: 'How severe is it?' },
    { title: 'Associated', subtitle: 'Any other symptoms?' }
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const addToList = (list: string[], newItem: string, setter: (items: string[]) => void) => {
    if (newItem.trim() && !list.includes(newItem.trim())) {
      setter([...list, newItem.trim()])
    }
  }

  const removeFromList = (list: string[], index: number, setter: (items: string[]) => void) => {
    setter(list.filter((_, i) => i !== index))
  }

  const updateSymptomData = (updates: Partial<SymptomData>) => {
    setSymptomData(prev => ({ ...prev, ...updates }))
  }

  const handleComplete = () => {
    // Generate structured symptoms from OLDCARTS data
    const structuredSymptoms = []

    if (symptomData.character.quality) {
      structuredSymptoms.push(`${symptomData.character.quality} ${symptomData.location.primary || 'pain'}`)
    } else if (symptomData.location.primary) {
      structuredSymptoms.push(symptomData.location.primary)
    }

    // Add associated symptoms
    structuredSymptoms.push(...symptomData.associatedSymptoms)

    // Add onset context if sudden
    if (symptomData.onset.suddenOrGradual === 'sudden') {
      structuredSymptoms.push('sudden onset')
    }

    // Add severity context
    if (symptomData.severity.scale >= 8) {
      structuredSymptoms.push('severe symptoms')
    } else if (symptomData.severity.scale <= 3) {
      structuredSymptoms.push('mild symptoms')
    }

    onComplete(symptomData, structuredSymptoms)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Onset
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="when">When did this symptom first start?</Label>
              <Input
                id="when"
                placeholder="e.g., 3 days ago, this morning, last week"
                value={symptomData.onset.when}
                onChange={(e) => updateSymptomData({
                  onset: { ...symptomData.onset, when: e.target.value }
                })}
              />
            </div>

            <div>
              <Label>How did it start?</Label>
              <Select
                value={symptomData.onset.suddenOrGradual}
                onValueChange={(value: 'sudden' | 'gradual') =>
                  updateSymptomData({
                    onset: { ...symptomData.onset, suddenOrGradual: value }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select onset type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sudden">Sudden onset</SelectItem>
                  <SelectItem value="gradual">Gradual onset</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>What triggered it? (if known)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., exercise, stress, eating"
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToList(symptomData.onset.triggers, newTrigger, (triggers) =>
                        updateSymptomData({ onset: { ...symptomData.onset, triggers } })
                      )
                      setNewTrigger('')
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    addToList(symptomData.onset.triggers, newTrigger, (triggers) =>
                      updateSymptomData({ onset: { ...symptomData.onset, triggers } })
                    )
                    setNewTrigger('')
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {symptomData.onset.triggers.map((trigger, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {trigger}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFromList(symptomData.onset.triggers, index, (triggers) =>
                        updateSymptomData({ onset: { ...symptomData.onset, triggers } })
                      )}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )

      case 1: // Location
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="primary-location">Primary location of symptom</Label>
              <Input
                id="primary-location"
                placeholder="e.g., chest, head, stomach, lower back"
                value={symptomData.location.primary}
                onChange={(e) => updateSymptomData({
                  location: { ...symptomData.location, primary: e.target.value }
                })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="radiates"
                checked={symptomData.location.radiates}
                onCheckedChange={(checked) => updateSymptomData({
                  location: { ...symptomData.location, radiates: !!checked }
                })}
              />
              <Label htmlFor="radiates">Does it spread or radiate to other areas?</Label>
            </div>

            {symptomData.location.radiates && (
              <div>
                <Label>Where does it radiate to?</Label>
                <Input
                  placeholder="e.g., down left arm, to jaw, to leg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement
                      const sites = symptomData.location.radiationSites
                      if (target.value && !sites.includes(target.value)) {
                        updateSymptomData({
                          location: {
                            ...symptomData.location,
                            radiationSites: [...sites, target.value]
                          }
                        })
                        target.value = ''
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {symptomData.location.radiationSites.map((site, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {site}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          const sites = symptomData.location.radiationSites.filter((_, i) => i !== index)
                          updateSymptomData({
                            location: { ...symptomData.location, radiationSites: sites }
                          })
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 2: // Duration
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="duration">How long have you had this symptom?</Label>
              <Input
                id="duration"
                placeholder="e.g., 2 hours, 3 days, 1 week"
                value={symptomData.duration.howLong}
                onChange={(e) => updateSymptomData({
                  duration: { ...symptomData.duration, howLong: e.target.value }
                })}
              />
            </div>

            <div>
              <Label>Is it constant or does it come and go?</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="constant"
                    checked={symptomData.duration.constant}
                    onCheckedChange={(checked) => updateSymptomData({
                      duration: {
                        ...symptomData.duration,
                        constant: !!checked,
                        intermittent: checked ? false : symptomData.duration.intermittent
                      }
                    })}
                  />
                  <Label htmlFor="constant">Constant (always present)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="intermittent"
                    checked={symptomData.duration.intermittent}
                    onCheckedChange={(checked) => updateSymptomData({
                      duration: {
                        ...symptomData.duration,
                        intermittent: !!checked,
                        constant: checked ? false : symptomData.duration.constant
                      }
                    })}
                  />
                  <Label htmlFor="intermittent">Intermittent (comes and goes)</Label>
                </div>
              </div>
            </div>
          </div>
        )

      case 3: // Character
        return (
          <div className="space-y-4">
            <div>
              <Label>Quality/Character (what does it feel like?)</Label>
              <Select
                value={symptomData.character.quality}
                onValueChange={(value) => updateSymptomData({
                  character: { ...symptomData.character, quality: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  {PAIN_QUALITIES.map(quality => (
                    <SelectItem key={quality} value={quality}>{quality}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Describe it in your own words</Label>
              <Textarea
                id="description"
                placeholder="e.g., feels like a knife stabbing, burning sensation, pressure like an elephant sitting on chest"
                value={symptomData.character.description}
                onChange={(e) => updateSymptomData({
                  character: { ...symptomData.character, description: e.target.value }
                })}
              />
            </div>
          </div>
        )

      case 4: // Aggravating
        return (
          <div className="space-y-4">
            <div>
              <Label>What makes it worse?</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., movement, coughing, eating, stress"
                  value={newAggravator}
                  onChange={(e) => setNewAggravator(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToList(symptomData.aggravating, newAggravator, (factors) =>
                        updateSymptomData({ aggravating: factors })
                      )
                      setNewAggravator('')
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    addToList(symptomData.aggravating, newAggravator, (factors) =>
                      updateSymptomData({ aggravating: factors })
                    )
                    setNewAggravator('')
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {symptomData.aggravating.map((factor, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {factor}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFromList(symptomData.aggravating, index, (factors) =>
                        updateSymptomData({ aggravating: factors })
                      )}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )

      case 5: // Relieving
        return (
          <div className="space-y-4">
            <div>
              <Label>What makes it better or provides relief?</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., rest, heat, cold, medication, position change"
                  value={newReliever}
                  onChange={(e) => setNewReliever(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToList(symptomData.relieving, newReliever, (factors) =>
                        updateSymptomData({ relieving: factors })
                      )
                      setNewReliever('')
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    addToList(symptomData.relieving, newReliever, (factors) =>
                      updateSymptomData({ relieving: factors })
                    )
                    setNewReliever('')
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {symptomData.relieving.map((factor, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {factor}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFromList(symptomData.relieving, index, (factors) =>
                        updateSymptomData({ relieving: factors })
                      )}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )

      case 6: // Timing
        return (
          <div className="space-y-4">
            <div>
              <Label>What is the pattern over time?</Label>
              <Select
                value={symptomData.timing.pattern}
                onValueChange={(value) => updateSymptomData({
                  timing: { ...symptomData.timing, pattern: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  {TIMING_PATTERNS.map(pattern => (
                    <SelectItem key={pattern} value={pattern}>{pattern}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="frequency">How often does it occur?</Label>
              <Input
                id="frequency"
                placeholder="e.g., every few hours, once daily, several times per week"
                value={symptomData.timing.frequency}
                onChange={(e) => updateSymptomData({
                  timing: { ...symptomData.timing, frequency: e.target.value }
                })}
              />
            </div>
          </div>
        )

      case 7: // Severity
        return (
          <div className="space-y-4">
            <div>
              <Label>Rate your pain/symptom severity (1-10 scale)</Label>
              <div className="px-3 py-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={symptomData.severity.scale}
                  onChange={(e) => updateSymptomData({
                    severity: { ...symptomData.severity, scale: parseInt(e.target.value) }
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 (Mild)</span>
                  <span className="font-medium">Current: {symptomData.severity.scale}</span>
                  <span>10 (Worst possible)</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="impact">How does it impact your daily activities?</Label>
              <Textarea
                id="impact"
                placeholder="e.g., can't work, difficulty sleeping, can't exercise"
                value={symptomData.severity.impact}
                onChange={(e) => updateSymptomData({
                  severity: { ...symptomData.severity, impact: e.target.value }
                })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="worst-ever"
                checked={symptomData.severity.worstEver}
                onCheckedChange={(checked) => updateSymptomData({
                  severity: { ...symptomData.severity, worstEver: !!checked }
                })}
              />
              <Label htmlFor="worst-ever">Is this the worst you've ever experienced?</Label>
            </div>
          </div>
        )

      case 8: // Associated Symptoms
        return (
          <div className="space-y-4">
            <div>
              <Label>Are you experiencing any other symptoms?</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., nausea, fever, dizziness"
                  value={newSymptom}
                  onChange={(e) => setNewSymptom(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToList(symptomData.associatedSymptoms, newSymptom, (symptoms) =>
                        updateSymptomData({ associatedSymptoms: symptoms })
                      )
                      setNewSymptom('')
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    addToList(symptomData.associatedSymptoms, newSymptom, (symptoms) =>
                      updateSymptomData({ associatedSymptoms: symptoms })
                    )
                    setNewSymptom('')
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick select common symptoms */}
              <div className="mt-2">
                <Label className="text-sm">Quick select common symptoms:</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {COMMON_SYMPTOMS.map((symptom) => (
                    <Button
                      key={symptom}
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => {
                        if (!symptomData.associatedSymptoms.includes(symptom)) {
                          updateSymptomData({
                            associatedSymptoms: [...symptomData.associatedSymptoms, symptom]
                          })
                        }
                      }}
                      disabled={symptomData.associatedSymptoms.includes(symptom)}
                    >
                      {symptom}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {symptomData.associatedSymptoms.map((symptom, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {symptom}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFromList(symptomData.associatedSymptoms, index, (symptoms) =>
                        updateSymptomData({ associatedSymptoms: symptoms })
                      )}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Guided Symptom Assessment
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title} - {steps[currentStep].subtitle}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="min-h-[300px]">
            {renderStepContent()}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button onClick={handleComplete}>
                Complete Assessment
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Red flag warning */}
      {symptomData.severity.scale >= 8 || symptomData.severity.worstEver ||
       symptomData.onset.suddenOrGradual === 'sudden' && (
        <Card className="mt-4 border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-800">Important Notice</p>
                <p className="text-orange-700 mt-1">
                  Based on your responses, these symptoms may require urgent medical attention.
                  Please consider seeking immediate care if symptoms worsen or if you feel this is an emergency.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}