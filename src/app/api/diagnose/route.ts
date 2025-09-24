import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getDiagnosis } from '@/lib/mistral'
import { getEnhancedDiagnosis } from '@/lib/enhanced-diagnosis'
import { getDrugRecommendations, checkDrugAllergies } from '@/lib/drug-lookup'
import {
  generateSymptomBasedTriage,
  checkRedFlagSymptoms,
  validateAIDiagnosisResponse
} from '@/lib/medical-triage'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
  handleApiError
} from '@/lib/api-response'
import { diagnosisSchemas } from '@/lib/validation/schemas'

// POST /api/diagnose - Get AI diagnosis and follow-up suggestions
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input data
    const { patient_id, symptoms, duration, severity, additional_notes } = diagnosisSchemas.create.parse(body)

    // Get patient details and medical history
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select(`
        *,
        medical_history (
          diagnosis,
          symptoms,
          treatment,
          created_at
        )
      `)
      .eq('id', patient_id)
      .single()

    if (patientError) {
      if (patientError.code === 'PGRST116') {
        return notFoundResponse('Patient')
      }
      console.error('Database error:', patientError)
      return serverErrorResponse('Failed to fetch patient data')
    }

    // Enhanced patient history formatting
    const birthDate = new Date(patient.dob)
    const age = new Date().getFullYear() - birthDate.getFullYear()
    const gender = patient.gender || 'Not specified'
    const allergies = patient.allergies?.length ? patient.allergies.join(', ') : 'None known'
    const chronicConditions = patient.chronic_conditions?.length ? patient.chronic_conditions.join(', ') : 'None'
    const currentMedications = patient.medications?.length ? patient.medications.join(', ') : 'None'

    // Create structured medical timeline
    const pastDiagnoses = patient.medical_history
      ?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5) // Last 5 diagnoses
      .map((h: any) => {
        const date = new Date(h.created_at).toLocaleDateString()
        const symptoms = h.symptoms?.join(', ') || 'not documented'
        const treatment = h.treatment ? ` - Treatment: ${h.treatment}` : ''
        return `${h.diagnosis} (${date}) - Symptoms: ${symptoms}${treatment}`
      })
      .join('\n') || 'No significant past medical history documented'

    // Calculate risk factors
    const riskFactors = []
    if (age > 65) riskFactors.push('Advanced age (>65)')
    if (chronicConditions !== 'None') riskFactors.push('Multiple chronic conditions')
    if (patient.allergies?.includes('Penicillin')) riskFactors.push('Antibiotic allergies')

    const symptomsString = symptoms.join(', ')

    // Check for immediate red flags
    const redFlags = checkRedFlagSymptoms(symptoms)
    const emergencyWarning = redFlags.length > 0
      ? `\n**CRITICAL: RED FLAG SYMPTOMS DETECTED** - ${redFlags.map(rf => rf.condition).join(', ')}`
      : ''

    const patientHistory = `
**PATIENT DEMOGRAPHICS:**
Age: ${age} years
Gender: ${gender}
Primary Allergies: ${allergies}
Current Medications: ${currentMedications}

**CHRONIC CONDITIONS:**
${chronicConditions}

**RISK FACTORS:**
${riskFactors.length > 0 ? riskFactors.join(', ') : 'None identified'}

**RECENT MEDICAL HISTORY (Last 5 visits):**
${pastDiagnoses}

**CURRENT PRESENTATION:**
Chief Complaint: ${symptomsString}
Duration: ${duration}
Severity: ${severity}
${additional_notes ? `Additional Clinical Notes: ${additional_notes}` : 'No additional notes provided'}
${emergencyWarning}
    `.trim()

    // Get enhanced AI diagnosis with MCP integration and detailed workflows
    let aiResponse
    let isAIGenerated = false

    try {
      console.log('Attempting enhanced diagnosis with MCP integration...')
      aiResponse = await getEnhancedDiagnosis(
        patientHistory,
        symptoms,
        age,
        gender
      )
      isAIGenerated = aiResponse.mcp_enhanced || true

      // Validate AI response for safety and completeness
      const validation = validateAIDiagnosisResponse(aiResponse)
      if (!validation.isValid) {
        console.warn('AI response validation failed:', validation.warnings)
        throw new Error('AI response validation failed')
      }

      // Log validation warnings
      if (validation.warnings.length > 0) {
        console.log('AI response validation warnings:', validation.warnings)
      }

      aiResponse = validation.enhancedResponse

    } catch (error) {
      console.error('Mistral AI error:', error)
      isAIGenerated = false

      // Use intelligent symptom-based triage fallback
      aiResponse = generateSymptomBasedTriage(symptoms, duration, severity, age)

      console.log('Using symptom-based triage fallback for:', {
        symptoms: symptomsString,
        patientId: patient_id,
        age
      })
    }

    // Get drug recommendations based on primary diagnosis
    const primaryDiagnosis = aiResponse.diagnoses?.[0]
    const primaryDiagnosisName = primaryDiagnosis?.name || 'Unknown'
    const drugRecommendations = getDrugRecommendations(primaryDiagnosisName)

    // Check for potential drug allergies
    const allergyWarnings = []
    for (const drugRec of drugRecommendations) {
      const allergies = checkDrugAllergies(drugRec.drug, patient.allergies || [])
      if (allergies.length > 0) {
        allergyWarnings.push({
          drug: drugRec.drug,
          allergies: allergies
        })
      }
    }

    // Transform enhanced AI response to match frontend interface
    const diagnosisResult = {
      diagnosis: primaryDiagnosisName,
      confidence: (primaryDiagnosis?.confidence || 0) / 100, // Convert percentage to decimal
      reasoning: primaryDiagnosis?.reasoning || `Based on symptoms: ${symptomsString}. Duration: ${duration}. Severity: ${severity}.`,

      // Enhanced fields from new AI response
      emergency_level: aiResponse.emergency_level || 'routine',
      red_flags: aiResponse.red_flags || [],
      warning_signs: aiResponse.warning_signs || [],
      patient_education: aiResponse.patient_education || '',
      icd10_code: primaryDiagnosis?.icd10_code,
      category: primaryDiagnosis?.category,

      // Enhanced MCP-powered features
      clinical_decision_tree: (aiResponse as any).clinical_decision_tree,
      evidence_based_reasoning: (aiResponse as any).evidence_based_reasoning,
      diagnostic_workflow: (aiResponse as any).diagnostic_workflow,
      research_sources: (aiResponse as any).research_sources,
      mcp_enhanced: (aiResponse as any).mcp_enhanced,

      differential_diagnoses: aiResponse.diagnoses?.slice(1).map(d => ({
        condition: d.name,
        probability: d.confidence / 100,
        reasoning: d.reasoning || 'Alternative diagnosis based on symptom presentation.',
        category: d.category,
        icd10_code: d.icd10_code
      })) || [],

      recommendations: aiResponse.followups?.map(f => ({
        type: f.type,
        description: f.detail,
        urgency: f.urgency,
        timeframe: f.timeframe || 'As clinically indicated',
        rationale: f.rationale
      })) || [],

      follow_up: aiResponse.followups
        ?.filter(f => f.type === 'followup' || f.type === 'immediate_care')
        .map(f => ({
          timeframe: f.timeframe || (f.urgency === 'immediate' ? 'Immediately' : f.urgency === 'high' ? '24-48 hours' : f.urgency === 'medium' ? '1-2 weeks' : '1 month'),
          action: f.detail,
          urgency: f.urgency,
          rationale: f.rationale
        })) || [],

      drug_recommendations: drugRecommendations,
      allergy_warnings: allergyWarnings,

      // Metadata
      is_ai_generated: isAIGenerated,
      generated_at: new Date().toISOString()
    }

    // Log the diagnosis request for audit purposes
    console.log(`AI Diagnosis completed for patient ${patient_id}:`, {
      symptoms: symptomsString,
      diagnosis: diagnosisResult.diagnosis,
      confidence: diagnosisResult.confidence
    })

    return successResponse(diagnosisResult, 'Diagnosis completed successfully')

  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/diagnose - Get diagnosis history for a patient
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patient_id')

    if (!patientId) {
      return errorResponse('Patient ID is required')
    }

    // Get recent medical history for the patient
    const { data: history, error } = await supabase
      .from('medical_history')
      .select(`
        *,
        appointments (
          start_time,
          reason
        )
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Database error:', error)
      return serverErrorResponse('Failed to fetch diagnosis history')
    }

    return successResponse(history || [], 'Diagnosis history retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}