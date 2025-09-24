'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AIDiagnosisInterface } from '@/components/diagnosis/ai-diagnosis-interface'
import { DiagnosisCard } from '@/components/diagnosis/diagnosis-card'
import { FollowUpRecommendations } from '@/components/diagnosis/follow-up-recommendations'
import { PatientList } from '@/components/patients/patient-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, History, Users, FileText } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

interface DiagnosisResult {
  id: string
  diagnosis: string
  confidence: number
  reasoning: string
  differential_diagnoses: Array<{
    condition: string
    probability: number
    reasoning: string
  }>
  recommendations: Array<{
    type: string
    description: string
    urgency: 'low' | 'medium' | 'high'
  }>
  follow_up: Array<{
    timeframe: string
    action: string
  }>
  created_at: string
  patient: {
    id: string
    first_name: string
    last_name: string
  }
}

export default function DiagnosisPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiagnosisResult | null>(null)
  const [savedDiagnoses, setSavedDiagnoses] = useState<DiagnosisResult[]>([])

  // Mock function to fetch patient's diagnosis history
  const { data: diagnosisHistory } = useQuery({
    queryKey: ['diagnosis-history', selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return []
      // This would be a real API call in production
      return []
    },
    enabled: !!selectedPatientId,
  })

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId)
    setCurrentDiagnosis(null)
  }

  const handleDiagnosisComplete = (result: any) => {
    const diagnosisResult: DiagnosisResult = {
      id: Date.now().toString(),
      ...result,
      created_at: new Date().toISOString(),
      patient: {
        id: selectedPatientId || '',
        first_name: 'Selected',
        last_name: 'Patient',
      },
    }
    setCurrentDiagnosis(diagnosisResult)
  }

  const handleSaveDiagnosis = () => {
    if (currentDiagnosis) {
      setSavedDiagnoses(prev => [currentDiagnosis, ...prev])
      // Here you would also save to the backend
      console.log('Saving diagnosis to patient records...')
    }
  }

  const handleShareDiagnosis = () => {
    if (currentDiagnosis) {
      // Implementation for sharing diagnosis
      console.log('Sharing diagnosis...')
    }
  }

  const handleExportDiagnosis = () => {
    if (currentDiagnosis) {
      // Implementation for exporting diagnosis as PDF
      console.log('Exporting diagnosis...')
    }
  }

  // Generate descriptive titles based on recommendation content
  const generateDescriptiveTitle = (type: string, description: string): string => {
    const desc = description.toLowerCase()

    // Laboratory Tests
    if (desc.includes('blood') || desc.includes('lab') || desc.includes('cbc') ||
        desc.includes('chemistry') || desc.includes('panel') || desc.includes('coagulation') ||
        desc.includes('pt/inr') || desc.includes('aptt') || desc.includes('glucose') ||
        desc.includes('lipid') || desc.includes('liver function')) {
      return 'Laboratory Tests'
    }

    // Imaging Studies
    if (desc.includes('x-ray') || desc.includes('xray') || desc.includes('imaging') ||
        desc.includes('ultrasound') || desc.includes('mri') || desc.includes('ct scan') ||
        desc.includes('scan') || desc.includes('radiograph') || desc.includes('echo')) {
      return 'Imaging Study'
    }

    // Follow-up Appointments
    if (desc.includes('follow-up') || desc.includes('followup') || desc.includes('follow up') ||
        desc.includes('revisit') || desc.includes('return visit') || desc.includes('check-up') ||
        desc.includes('monitor') && desc.includes('visit')) {
      return 'Follow-up Appointment'
    }

    // Medication Related
    if (desc.includes('medication') || desc.includes('prescription') || desc.includes('drug') ||
        desc.includes('dosage') || desc.includes('pharmacist') || desc.includes('med review')) {
      return 'Medication Review'
    }

    // Specialist Referrals
    if (desc.includes('referral') || desc.includes('specialist') || desc.includes('consult') ||
        desc.includes('orthopedic') || desc.includes('cardiology') || desc.includes('neurology')) {
      return 'Specialist Referral'
    }

    // Lifestyle/Education
    if (desc.includes('lifestyle') || desc.includes('education') || desc.includes('exercise') ||
        desc.includes('diet') || desc.includes('physical therapy') || desc.includes('rehabilitation')) {
      return 'Lifestyle Modification'
    }

    // Physical Therapy
    if (desc.includes('physical therapy') || desc.includes('physiotherapy') || desc.includes('rehab')) {
      return 'Physical Therapy'
    }

    // Surgery/Procedures
    if (desc.includes('surgery') || desc.includes('procedure') || desc.includes('surgical')) {
      return 'Surgical Consultation'
    }

    // Fall back to type-based titles
    switch (type.toLowerCase()) {
      case 'test': return 'Medical Testing'
      case 'followup': return 'Follow-up Care'
      case 'appointment': return 'Medical Appointment'
      case 'medication': return 'Medication Management'
      case 'referral': return 'Medical Referral'
      case 'education': return 'Patient Education'
      default: return 'Medical Recommendation'
    }
  }

  const transformAIDataToRecommendations = (diagnosis: DiagnosisResult) => {
    const recommendations: Array<{
      id: string
      type: 'appointment' | 'test' | 'medication' | 'lifestyle' | 'monitoring'
      title: string
      description: string
      urgency: 'low' | 'medium' | 'high'
      timeframe: string
      completed: boolean
    }> = []

    // Transform AI recommendations
    if (diagnosis.recommendations) {
      diagnosis.recommendations.forEach((rec, index) => {
        let mappedType: 'appointment' | 'test' | 'medication' | 'lifestyle' | 'monitoring' = 'appointment'

        // Map AI recommendation types to component types
        if (rec.type.toLowerCase().includes('test') || rec.type.toLowerCase().includes('lab')) {
          mappedType = 'test'
        } else if (rec.type.toLowerCase().includes('medication') || rec.type.toLowerCase().includes('drug')) {
          mappedType = 'medication'
        } else if (rec.type.toLowerCase().includes('lifestyle') || rec.type.toLowerCase().includes('education')) {
          mappedType = 'lifestyle'
        } else if (rec.type.toLowerCase().includes('monitor') || rec.type.toLowerCase().includes('watch')) {
          mappedType = 'monitoring'
        }

        // Map urgency levels
        let mappedUrgency: 'low' | 'medium' | 'high' = 'medium'
        if (rec.urgency === 'immediate' || rec.urgency === 'high') {
          mappedUrgency = 'high'
        } else if (rec.urgency === 'low') {
          mappedUrgency = 'low'
        }

        recommendations.push({
          id: `rec-${index}`,
          type: mappedType,
          title: generateDescriptiveTitle(rec.type || '', rec.description || ''),
          description: rec.description || 'Follow AI-generated recommendation',
          urgency: mappedUrgency,
          timeframe: rec.timeframe || 'As soon as possible',
          completed: false,
        })
      })
    }

    // Transform AI follow-up items
    if (diagnosis.follow_up) {
      diagnosis.follow_up.forEach((follow, index) => {
        let mappedType: 'appointment' | 'test' | 'medication' | 'lifestyle' | 'monitoring' = 'appointment'

        // Determine type based on action content
        if (follow.action.toLowerCase().includes('test') || follow.action.toLowerCase().includes('lab')) {
          mappedType = 'test'
        } else if (follow.action.toLowerCase().includes('medication') || follow.action.toLowerCase().includes('drug')) {
          mappedType = 'medication'
        } else if (follow.action.toLowerCase().includes('monitor')) {
          mappedType = 'monitoring'
        } else if (follow.action.toLowerCase().includes('lifestyle') || follow.action.toLowerCase().includes('exercise')) {
          mappedType = 'lifestyle'
        }

        // Map urgency
        let mappedUrgency: 'low' | 'medium' | 'high' = 'medium'
        if (follow.urgency === 'immediate' || follow.urgency === 'high') {
          mappedUrgency = 'high'
        } else if (follow.urgency === 'low') {
          mappedUrgency = 'low'
        }

        recommendations.push({
          id: `follow-${index}`,
          type: mappedType,
          title: generateDescriptiveTitle('followup', follow.action),
          description: follow.action,
          urgency: mappedUrgency,
          timeframe: follow.timeframe,
          completed: false,
        })
      })
    }

    return recommendations
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-blue-600" />
              AI Diagnosis
            </h1>
            <p className="text-muted-foreground">
              AI-powered medical diagnosis assistance with patient selection
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Patient Selection Sidebar */}
          <div className="lg:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Select Patient
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                  <PatientList
                    onPatientSelect={handlePatientSelect}
                    selectedPatientId={selectedPatientId || undefined}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-7">
            {selectedPatientId ? (
              <Tabs defaultValue="diagnosis" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="diagnosis">New Diagnosis</TabsTrigger>
                  <TabsTrigger value="history">Diagnosis History</TabsTrigger>
                </TabsList>

                <TabsContent value="diagnosis" className="space-y-6">
                  {/* AI Diagnosis Interface */}
                  <AIDiagnosisInterface
                    selectedPatientId={selectedPatientId}
                    onPatientSelect={handlePatientSelect}
                    onDiagnosisComplete={handleDiagnosisComplete}
                  />

                  {/* Current Diagnosis Results */}
                  {currentDiagnosis && (
                    <div className="space-y-6">
                      <DiagnosisCard
                        diagnosis={currentDiagnosis}
                        onSave={handleSaveDiagnosis}
                        onShare={handleShareDiagnosis}
                        onExport={handleExportDiagnosis}
                        showActions={true}
                      />

                      {/* Follow-up Recommendations */}
                      <FollowUpRecommendations
                        recommendations={transformAIDataToRecommendations(currentDiagnosis)}
                        patientId={selectedPatientId}
                        onScheduleAppointment={(rec) => {
                          console.log('Schedule appointment for:', rec)
                        }}
                        onMarkComplete={(id) => {
                          console.log('Mark complete:', id)
                        }}
                        onAddNote={(id, note) => {
                          console.log('Add note:', id, note)
                        }}
                        onSetReminder={(id, date) => {
                          console.log('Set reminder:', id, date)
                        }}
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  {/* Diagnosis History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Previous Diagnoses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {savedDiagnoses.length === 0 && (!diagnosisHistory || diagnosisHistory.length === 0) ? (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Previous Diagnoses</h3>
                          <p className="text-muted-foreground">
                            This patient has no previous AI diagnosis records.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {savedDiagnoses.map((diagnosis) => (
                            <DiagnosisCard
                              key={diagnosis.id}
                              diagnosis={diagnosis}
                              showActions={false}
                              compact={true}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <CardContent className="text-center">
                  <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Select a Patient</h3>
                  <p className="text-muted-foreground mb-6">
                    Choose a patient from the list to start AI diagnosis analysis
                  </p>
                  <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                    <p className="font-medium mb-2">How it works:</p>
                    <ol className="text-left space-y-1">
                      <li>1. Select a patient from the left panel</li>
                      <li>2. Enter symptoms and medical information</li>
                      <li>3. Get AI-powered diagnosis suggestions</li>
                      <li>4. Review follow-up recommendations</li>
                      <li>5. Save results to patient records</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}