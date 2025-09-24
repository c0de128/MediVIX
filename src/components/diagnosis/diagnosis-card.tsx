'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Share
} from 'lucide-react'
import { format } from 'date-fns'

interface DiagnosisResult {
  id?: string
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
  created_at?: string
  patient?: {
    id: string
    first_name: string
    last_name: string
  }
}

interface DiagnosisCardProps {
  diagnosis: DiagnosisResult
  onSave?: () => void
  onShare?: () => void
  onExport?: () => void
  showActions?: boolean
  compact?: boolean
}

export function DiagnosisCard({
  diagnosis,
  onSave,
  onShare,
  onExport,
  showActions = true,
  compact = false
}: DiagnosisCardProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 border-green-200'
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return CheckCircle
    if (confidence >= 0.6) return AlertTriangle
    return AlertTriangle
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate':
      case 'high':
        return 'destructive'
      case 'urgent':
      case 'medium':
        return 'default'
      case 'routine':
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const ConfidenceIcon = getConfidenceIcon(diagnosis.confidence)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">AI Diagnosis Results</CardTitle>
              {diagnosis.patient && (
                <p className="text-sm text-muted-foreground">
                  Patient: {diagnosis.patient.first_name} {diagnosis.patient.last_name}
                </p>
              )}
              {diagnosis.created_at && (
                <p className="text-xs text-muted-foreground">
                  Generated: {format(new Date(diagnosis.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              )}
            </div>
          </div>

          {showActions && (
            <div className="flex items-center gap-2">
              {onShare && (
                <Button variant="outline" size="sm" onClick={onShare}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
              {onSave && (
                <Button size="sm" onClick={onSave}>
                  <FileText className="h-4 w-4 mr-2" />
                  Save to Records
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Primary Diagnosis */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Primary Diagnosis
          </h3>

          <div className={`p-4 rounded-lg border-2 ${getConfidenceColor(diagnosis.confidence)}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold">{diagnosis.diagnosis}</h4>
              <div className="flex items-center gap-2">
                <ConfidenceIcon className="h-4 w-4" />
                <Badge variant="outline" className="bg-white">
                  {Math.round(diagnosis.confidence * 100)}% confidence
                </Badge>
              </div>
            </div>
            <p className="text-sm leading-relaxed">{diagnosis.reasoning}</p>
          </div>
        </div>

        {!compact && (
          <>
            {/* Differential Diagnoses */}
            {diagnosis.differential_diagnoses && diagnosis.differential_diagnoses.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Differential Diagnoses</h3>
                <div className="space-y-3">
                  {diagnosis.differential_diagnoses.map((diff, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{diff.condition}</h5>
                        <Badge variant="outline">
                          {Math.round(diff.probability * 100)}% probability
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{diff.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Recommendations */}
            {diagnosis.recommendations && diagnosis.recommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Recommendations
                </h3>
                <div className="grid gap-3">
                  {diagnosis.recommendations.map((rec, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <Badge
                          variant={getUrgencyColor(rec.urgency)}
                          className="mt-1"
                        >
                          {rec.type}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">{rec.description}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-muted-foreground">Urgency:</span>
                            <Badge variant={getUrgencyColor(rec.urgency)} className="text-xs">
                              {rec.urgency}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Follow-up Plan */}
            {diagnosis.follow_up && diagnosis.follow_up.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Follow-up Plan
                </h3>
                <div className="space-y-2">
                  {diagnosis.follow_up.map((follow, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded border-l-4 border-blue-200 bg-blue-50">
                      <Badge variant="outline" className="whitespace-nowrap">
                        {follow.timeframe}
                      </Badge>
                      <span className="text-sm">{follow.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Medical Disclaimer */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-amber-800">Medical Disclaimer</p>
              <p className="text-amber-700 mt-1">
                This AI diagnosis is for educational and assistive purposes only.
                Always consult with qualified healthcare professionals for proper medical diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}