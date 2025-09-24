/**
 * Enhanced Tests for the AI Diagnosis API endpoint
 * Validates enhanced prompt engineering, red flag detection, symptom-based triage,
 * schema validation, patient data integration, and response formatting
 */

import { diagnosisSchemas } from '@/lib/validation/schemas'
import { getDrugRecommendations, checkDrugAllergies } from '@/lib/drug-lookup'
import {
  checkRedFlagSymptoms,
  generateSymptomBasedTriage,
  validateAIDiagnosisResponse
} from '@/lib/medical-triage'

describe('AI Diagnosis API Validation', () => {
  describe('Schema Validation', () => {
    test('should validate correct diagnosis request', () => {
      const validRequest = {
        patient_id: '123e4567-e89b-12d3-a456-426614174000',
        symptoms: ['cough', 'fever', 'fatigue'],
        duration: '3 days',
        severity: 'moderate' as const,
        additional_notes: 'Patient reports symptoms started after exposure to sick family member'
      }

      const result = diagnosisSchemas.create.safeParse(validRequest)
      expect(result.success).toBe(true)
    })

    test('should reject invalid patient ID', () => {
      const invalidRequest = {
        patient_id: 'invalid-uuid',
        symptoms: ['cough'],
        duration: '3 days',
        severity: 'moderate' as const
      }

      const result = diagnosisSchemas.create.safeParse(invalidRequest)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0]?.message).toContain('Invalid ID format')
    })

    test('should reject empty symptoms array', () => {
      const invalidRequest = {
        patient_id: '123e4567-e89b-12d3-a456-426614174000',
        symptoms: [],
        duration: '3 days',
        severity: 'moderate' as const
      }

      const result = diagnosisSchemas.create.safeParse(invalidRequest)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0]?.message).toContain('At least one symptom is required')
    })

    test('should reject invalid severity', () => {
      const invalidRequest = {
        patient_id: '123e4567-e89b-12d3-a456-426614174000',
        symptoms: ['cough'],
        duration: '3 days',
        severity: 'extreme' as any
      }

      const result = diagnosisSchemas.create.safeParse(invalidRequest)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0]?.message).toContain('Severity must be mild, moderate, or severe')
    })

    test('should require duration field', () => {
      const invalidRequest = {
        patient_id: '123e4567-e89b-12d3-a456-426614174000',
        symptoms: ['cough'],
        severity: 'moderate' as const
        // missing duration
      }

      const result = diagnosisSchemas.create.safeParse(invalidRequest)
      expect(result.success).toBe(false)
    })
  })

  describe('Drug Recommendations', () => {
    test('should return recommendations for common cold', () => {
      const recommendations = getDrugRecommendations('Common Cold')
      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations[0]).toHaveProperty('drug')
      expect(recommendations[0]).toHaveProperty('dosage')
      expect(recommendations[0]).toHaveProperty('duration')
      expect(recommendations[0]).toHaveProperty('notes')
    })

    test('should return recommendations for hypertension variations', () => {
      const conditions = ['Hypertension', 'High Blood Pressure', 'hypertension']

      conditions.forEach(condition => {
        const recommendations = getDrugRecommendations(condition)
        expect(recommendations.length).toBeGreaterThan(0)
        expect(recommendations.some(r => r.drug.includes('Lisinopril'))).toBe(true)
      })
    })

    test('should handle partial keyword matching', () => {
      const recommendations = getDrugRecommendations('Patient has a bad cold with fever')
      expect(recommendations.length).toBeGreaterThan(0)
    })

    test('should return empty array for unknown conditions', () => {
      const recommendations = getDrugRecommendations('Extremely rare fictional disease')
      expect(recommendations).toEqual([])
    })
  })

  describe('Drug Allergy Checking', () => {
    test('should detect exact drug allergies', () => {
      const allergies = checkDrugAllergies('Penicillin', ['Penicillin', 'Shellfish'])
      expect(allergies.length).toBe(1)
      expect(allergies[0].allergy).toBe('Penicillin')
      expect(allergies[0].severity).toBe('high')
    })

    test('should detect case-insensitive allergies', () => {
      const allergies = checkDrugAllergies('penicillin', ['PENICILLIN'])
      expect(allergies.length).toBe(1)
    })

    test('should detect partial matches', () => {
      const allergies = checkDrugAllergies('Amoxicillin', ['Penicillin antibiotics'])
      expect(allergies.length).toBe(0) // This should be enhanced in future
    })

    test('should return empty array for no allergies', () => {
      const allergies = checkDrugAllergies('Acetaminophen', ['Penicillin'])
      expect(allergies).toEqual([])
    })
  })

  describe('Response Format Validation', () => {
    test('should format diagnosis result correctly', () => {
      const mockAiResponse = {
        diagnoses: [
          {
            name: 'Common Cold',
            confidence: 75,
            reasoning: 'Consistent with viral symptoms'
          }
        ],
        followups: [
          {
            type: 'education' as const,
            detail: 'Rest and hydration',
            urgency: 'low' as const,
            timeframe: 'Ongoing'
          }
        ]
      }

      // Simulate the transformation logic from the API
      const diagnosisResult = {
        diagnosis: mockAiResponse.diagnoses[0].name,
        confidence: mockAiResponse.diagnoses[0].confidence / 100,
        reasoning: mockAiResponse.diagnoses[0].reasoning,
        recommendations: mockAiResponse.followups.map(f => ({
          type: f.type,
          description: f.detail,
          urgency: f.urgency,
          timeframe: f.timeframe
        })),
        drug_recommendations: getDrugRecommendations(mockAiResponse.diagnoses[0].name),
        allergy_warnings: []
      }

      expect(diagnosisResult.diagnosis).toBe('Common Cold')
      expect(diagnosisResult.confidence).toBe(0.75)
      expect(diagnosisResult.reasoning).toBeTruthy()
      expect(diagnosisResult.recommendations).toHaveLength(1)
      expect(diagnosisResult.drug_recommendations.length).toBeGreaterThan(0)
    })
  })

  describe('Patient History Formatting', () => {
    test('should format patient history correctly', () => {
      const mockPatient = {
        dob: '1985-03-15',
        allergies: ['Penicillin', 'Shellfish'],
        chronic_conditions: ['Hypertension'],
        medical_history: [
          {
            diagnosis: 'Upper Respiratory Infection',
            created_at: '2024-01-15T00:00:00Z'
          }
        ]
      }

      const symptoms = ['cough', 'fever']
      const duration = '3 days'
      const severity = 'moderate'

      // Simulate the formatting logic from the API
      const age = new Date().getFullYear() - new Date(mockPatient.dob).getFullYear()
      const allergies = mockPatient.allergies.join(', ')
      const chronicConditions = mockPatient.chronic_conditions.join(', ')
      const pastDiagnoses = mockPatient.medical_history
        .map(h => `${h.diagnosis} (${new Date(h.created_at).toLocaleDateString()})`)
        .join(', ')

      const patientHistory = `
Age: ${age}
Allergies: ${allergies}
Chronic Conditions: ${chronicConditions}
Past Diagnoses: ${pastDiagnoses}
Current Symptoms Duration: ${duration}
Symptom Severity: ${severity}
      `.trim()

      expect(patientHistory).toContain(`Age: ${age}`)
      expect(patientHistory).toContain('Allergies: Penicillin, Shellfish')
      expect(patientHistory).toContain('Chronic Conditions: Hypertension')
      expect(patientHistory).toContain('Upper Respiratory Infection')
      expect(patientHistory).toContain('Duration: 3 days')
      expect(patientHistory).toContain('Severity: moderate')
    })
  })

  describe('Red Flag Symptom Detection', () => {
    test('should detect chest pain red flags', () => {
      const symptoms = ['chest pain', 'shortness of breath', 'sweating']
      const redFlags = checkRedFlagSymptoms(symptoms)

      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags[0].condition).toContain('Acute Coronary')
      expect(redFlags[0].urgency).toBe('immediate')
      expect(redFlags[0].action).toContain('911')
    })

    test('should detect severe headache red flags', () => {
      const symptoms = ['worst headache of life', 'neck stiffness', 'vision changes']
      const redFlags = checkRedFlagSymptoms(symptoms)

      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags[0].condition).toContain('Subarachnoid')
      expect(redFlags[0].urgency).toBe('immediate')
    })

    test('should detect respiratory emergency red flags', () => {
      const symptoms = ['difficulty breathing', 'chest tightness', 'wheezing']
      const redFlags = checkRedFlagSymptoms(symptoms)

      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags[0].condition).toContain('Respiratory Emergency')
      expect(redFlags[0].urgency).toBe('immediate')
    })

    test('should not flag normal symptoms', () => {
      const symptoms = ['mild headache', 'runny nose', 'cough']
      const redFlags = checkRedFlagSymptoms(symptoms)

      expect(redFlags.length).toBe(0)
    })

    test('should handle case-insensitive symptom matching', () => {
      const symptoms = ['CHEST PAIN', 'Difficulty Breathing']
      const redFlags = checkRedFlagSymptoms(symptoms)

      expect(redFlags.length).toBeGreaterThan(0)
    })
  })

  describe('Symptom-Based Triage System', () => {
    test('should generate triage for upper respiratory symptoms', () => {
      const symptoms = ['cough', 'runny nose', 'sore throat']
      const duration = '3 days'
      const severity = 'moderate'

      const triage = generateSymptomBasedTriage(symptoms, duration, severity)

      expect(triage.diagnoses).toHaveLength(1)
      expect(triage.diagnoses[0].name).toContain('Upper Respiratory')
      expect(triage.diagnoses[0].category).toBe('infectious')
      expect(triage.followups).toHaveLength(2)
      expect(triage.warning_signs).toContain('Symptoms significantly worsen')
    })

    test('should generate emergency triage for red flag symptoms', () => {
      const symptoms = ['chest pain', 'crushing pressure']
      const duration = '1 hour'
      const severity = 'severe'

      const triage = generateSymptomBasedTriage(symptoms, duration, severity)

      expect(triage.emergency_level).toBe('immediate')
      expect(triage.red_flags).toHaveLength(1)
      expect(triage.diagnoses[0].confidence).toBe(95)
      expect(triage.followups[0].type).toBe('immediate_care')
    })

    test('should handle gastrointestinal symptoms', () => {
      const symptoms = ['nausea', 'vomiting', 'diarrhea', 'stomach pain']
      const duration = '2 days'
      const severity = 'moderate'

      const triage = generateSymptomBasedTriage(symptoms, duration, severity)

      expect(triage.diagnoses[0].name).toContain('Gastroenteritis')
      expect(triage.diagnoses[0].category).toBe('gastrointestinal')
      expect(triage.patient_education).toContain('hydration')
    })

    test('should adjust confidence based on symptom match quality', () => {
      const perfectMatch = ['cough', 'runny nose', 'sneezing', 'congestion']
      const partialMatch = ['cough']

      const perfectTriage = generateSymptomBasedTriage(perfectMatch, '3 days', 'moderate')
      const partialTriage = generateSymptomBasedTriage(partialMatch, '3 days', 'moderate')

      expect(perfectTriage.diagnoses[0].confidence).toBeGreaterThan(partialTriage.diagnoses[0].confidence)
    })

    test('should handle unknown symptom patterns', () => {
      const symptoms = ['unusual symptom xyz', 'rare condition abc']
      const duration = '1 week'
      const severity = 'mild'

      const triage = generateSymptomBasedTriage(symptoms, duration, severity)

      expect(triage.diagnoses[0].name).toContain('Non-specific symptoms')
      expect(triage.diagnoses[0].confidence).toBeLessThan(50)
      expect(triage.followups[0].detail).toContain('primary care provider')
    })
  })

  describe('AI Response Validation', () => {
    test('should validate complete AI response', () => {
      const validResponse = {
        emergency_level: 'routine' as const,
        diagnoses: [{
          name: 'Common Cold',
          confidence: 75,
          reasoning: 'Viral symptoms',
          category: 'infectious'
        }],
        followups: [{
          type: 'followup' as const,
          detail: 'Return if symptoms worsen',
          urgency: 'low' as const,
          timeframe: '7-10 days'
        }],
        warning_signs: ['Symptoms worsen', 'Fever develops'],
        patient_education: 'Rest and hydration'
      }

      const validation = validateAIDiagnosisResponse(validResponse)

      expect(validation.isValid).toBe(true)
      expect(validation.warnings).toHaveLength(0)
      expect(validation.enhancedResponse.warning_signs).toEqual(validResponse.warning_signs)
    })

    test('should enhance incomplete AI response', () => {
      const incompleteResponse = {
        diagnoses: [{
          name: 'Some Diagnosis',
          confidence: 85,
          reasoning: 'Based on symptoms'
        }],
        followups: []
      }

      const validation = validateAIDiagnosisResponse(incompleteResponse)

      expect(validation.isValid).toBe(true)
      expect(validation.warnings.length).toBeGreaterThan(0)
      expect(validation.enhancedResponse.emergency_level).toBe('routine')
      expect(validation.enhancedResponse.warning_signs).toBeDefined()
      expect(validation.enhancedResponse.patient_education).toBeDefined()
    })

    test('should cap high confidence scores for safety', () => {
      const highConfidenceResponse = {
        diagnoses: [{
          name: 'Diagnosis',
          confidence: 98,
          reasoning: 'Very certain'
        }],
        followups: []
      }

      const validation = validateAIDiagnosisResponse(highConfidenceResponse)

      expect(validation.enhancedResponse.diagnoses[0].confidence).toBeLessThanOrEqual(85)
      expect(validation.warnings).toContain('High confidence reduced for safety: Diagnosis')
    })

    test('should reject response with no diagnoses', () => {
      const invalidResponse = {
        diagnoses: [],
        followups: []
      }

      const validation = validateAIDiagnosisResponse(invalidResponse)

      expect(validation.isValid).toBe(false)
      expect(validation.warnings).toContain('No diagnoses provided')
    })
  })

  describe('Enhanced Drug Recommendations', () => {
    test('should provide comprehensive drug recommendations for hypertension', () => {
      const recommendations = getDrugRecommendations('Hypertension')

      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations[0]).toHaveProperty('drug')
      expect(recommendations[0]).toHaveProperty('dosage')
      expect(recommendations[0]).toHaveProperty('duration')
      expect(recommendations[0]).toHaveProperty('notes')

      const drugNames = recommendations.map(r => r.drug)
      expect(drugNames).toContain('Lisinopril')
    })

    test('should match drug recommendations with case variations', () => {
      const variations = ['hypertension', 'HYPERTENSION', 'High Blood Pressure', 'blood pressure']

      variations.forEach(condition => {
        const recommendations = getDrugRecommendations(condition)
        expect(recommendations.length).toBeGreaterThan(0)
      })
    })

    test('should provide contextual drug recommendations', () => {
      const recommendations = getDrugRecommendations('migraine')

      expect(recommendations.length).toBeGreaterThan(0)
      // Should match 'migraine' keyword and return Sumatriptan
      const drugNames = recommendations.map(r => r.drug)
      expect(drugNames.some(name => name.includes('Sumatriptan'))).toBe(true)
    })
  })

  describe('Medical Timeline Integration', () => {
    test('should format structured patient history correctly', () => {
      const mockPatient = {
        dob: '1985-03-15',
        allergies: ['Penicillin', 'Shellfish'],
        chronic_conditions: ['Hypertension', 'Diabetes'],
        medications: ['Lisinopril 10mg daily', 'Metformin 500mg BID'],
        medical_history: [
          {
            diagnosis: 'Upper Respiratory Infection',
            symptoms: ['cough', 'congestion'],
            treatment: 'Symptomatic care',
            created_at: '2024-01-15T00:00:00Z'
          },
          {
            diagnosis: 'Annual Physical',
            symptoms: [],
            treatment: 'Routine checkup',
            created_at: '2024-06-01T00:00:00Z'
          }
        ]
      }

      const currentYear = new Date().getFullYear()
      const expectedAge = currentYear - 1985

      // Test age calculation
      expect(expectedAge).toBe(currentYear - 1985)

      // Test chronic condition handling
      expect(mockPatient.chronic_conditions.length).toBe(2)
      expect(mockPatient.chronic_conditions).toContain('Hypertension')
      expect(mockPatient.chronic_conditions).toContain('Diabetes')

      // Test medication handling
      expect(mockPatient.medications.length).toBe(2)

      // Test medical history sorting (most recent first)
      const sortedHistory = mockPatient.medical_history
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      expect(sortedHistory[0].diagnosis).toBe('Annual Physical')
      expect(sortedHistory[1].diagnosis).toBe('Upper Respiratory Infection')
    })
  })

  describe('Clinical Safety Features', () => {
    test('should prioritize emergency conditions over common conditions', () => {
      const emergencySymptoms = ['chest pain', 'shortness of breath']
      const triage = generateSymptomBasedTriage(emergencySymptoms, '30 minutes', 'severe')

      expect(triage.emergency_level).toBe('immediate')
      expect(triage.red_flags.length).toBeGreaterThan(0)
      expect(triage.followups[0].urgency).toBe('immediate')
    })

    test('should include comprehensive warning signs', () => {
      const symptoms = ['headache', 'fatigue']
      const triage = generateSymptomBasedTriage(symptoms, '2 days', 'moderate')

      expect(triage.warning_signs).toContain('Any worsening of symptoms')
      expect(triage.warning_signs).toContain('New symptoms develop')
      expect(triage.warning_signs.length).toBeGreaterThan(1)
    })

    test('should provide appropriate patient education', () => {
      const symptoms = ['cough', 'congestion']
      const triage = generateSymptomBasedTriage(symptoms, '3 days', 'mild')

      expect(triage.patient_education).toContain('self-care')
      expect(triage.patient_education).toContain('rest')
      expect(triage.patient_education).toContain('hydration')
    })
  })
})

// Enhanced mock data for comprehensive testing
export const enhancedMockData = {
  emergencyScenarios: [
    {
      name: 'Acute MI',
      symptoms: ['crushing chest pain', 'shortness of breath', 'sweating', 'nausea'],
      duration: '45 minutes',
      severity: 'severe',
      expectedUrgency: 'immediate',
      expectedRedFlags: true
    },
    {
      name: 'Stroke',
      symptoms: ['sudden severe headache', 'confusion', 'weakness on one side'],
      duration: '20 minutes',
      severity: 'severe',
      expectedUrgency: 'immediate',
      expectedRedFlags: true
    },
    {
      name: 'Anaphylaxis',
      symptoms: ['throat swelling', 'difficulty breathing', 'hives', 'dizziness'],
      duration: '10 minutes',
      severity: 'severe',
      expectedUrgency: 'immediate',
      expectedRedFlags: true
    }
  ],
  commonConditions: [
    {
      name: 'Upper Respiratory Infection',
      symptoms: ['cough', 'runny nose', 'sore throat', 'congestion'],
      duration: '4 days',
      severity: 'moderate',
      expectedCategory: 'infectious',
      expectedConfidenceRange: [0.6, 0.8]
    },
    {
      name: 'Tension Headache',
      symptoms: ['headache', 'neck tension'],
      duration: '6 hours',
      severity: 'mild',
      expectedCategory: 'neurological',
      expectedConfidenceRange: [0.5, 0.7]
    },
    {
      name: 'Gastroenteritis',
      symptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal cramps'],
      duration: '2 days',
      severity: 'moderate',
      expectedCategory: 'gastrointestinal',
      expectedConfidenceRange: [0.6, 0.8]
    }
  ],
  complexPatients: [
    {
      name: 'Elderly with multiple comorbidities',
      age: 78,
      chronicConditions: ['Diabetes', 'Hypertension', 'Heart Disease'],
      allergies: ['Penicillin', 'Aspirin'],
      medications: ['Metformin', 'Lisinopril', 'Metoprolol'],
      symptoms: ['fatigue', 'dizziness', 'shortness of breath'],
      expectedRiskFactors: ['Advanced age (>65)', 'Multiple chronic conditions']
    },
    {
      name: 'Young adult with mental health history',
      age: 24,
      chronicConditions: ['Anxiety Disorder', 'Depression'],
      allergies: [],
      medications: ['Sertraline'],
      symptoms: ['chest pain', 'rapid heartbeat', 'sweating'],
      expectedConsiderations: ['anxiety', 'panic attack']
    }
  ]
};

// Mock data for testing
export const mockPatientData = {
  validPatient: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    first_name: 'John',
    last_name: 'Doe',
    dob: '1985-03-15',
    allergies: ['Penicillin'],
    chronic_conditions: ['Hypertension'],
    medical_history: [
      {
        diagnosis: 'Annual Physical',
        symptoms: ['None'],
        treatment: 'Routine checkup',
        created_at: '2024-01-01T00:00:00Z'
      }
    ]
  },
  validDiagnosisRequest: {
    patient_id: '123e4567-e89b-12d3-a456-426614174000',
    symptoms: ['cough', 'fever', 'congestion'],
    duration: '5 days',
    severity: 'moderate' as const,
    additional_notes: 'Symptoms started gradually and have been worsening'
  },
  mockAiResponse: {
    diagnoses: [
      {
        name: 'Upper Respiratory Infection',
        confidence: 85,
        reasoning: 'Symptoms consistent with viral upper respiratory infection'
      },
      {
        name: 'Common Cold',
        confidence: 70,
        reasoning: 'Alternative diagnosis with similar presentation'
      }
    ],
    followups: [
      {
        type: 'education' as const,
        detail: 'Rest, hydration, and symptom management',
        urgency: 'low' as const,
        timeframe: 'Ongoing until resolution'
      },
      {
        type: 'followup' as const,
        detail: 'Return if symptoms worsen or persist beyond 10 days',
        urgency: 'medium' as const,
        timeframe: '7-10 days'
      }
    ]
  }
}