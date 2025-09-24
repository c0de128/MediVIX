/**
 * Medical triage and symptom-based fallback system
 * Provides intelligent fallbacks when AI diagnosis is unavailable
 */

import type { DiagnosisResponse } from './mistral'

interface RedFlagSymptom {
  symptom: string[]
  condition: string
  urgency: 'immediate' | 'urgent'
  action: string
}

interface SymptomPattern {
  keywords: string[]
  diagnosis: string
  confidence: number
  category: string
  reasoning: string
  commonTests: string[]
  followupTimeframe: string
}

// Critical red flag symptoms requiring immediate medical attention
const RED_FLAG_SYMPTOMS: RedFlagSymptom[] = [
  {
    symptom: ['chest pain', 'crushing chest pain', 'chest pressure', 'chest tightness', 'heart attack'],
    condition: 'Acute Coronary Syndrome',
    urgency: 'immediate',
    action: 'Call 911 immediately or go to nearest emergency room'
  },
  {
    symptom: ['sudden severe headache', 'worst headache of life', 'thunderclap headache'],
    condition: 'Possible Subarachnoid Hemorrhage',
    urgency: 'immediate',
    action: 'Call 911 immediately - potential stroke or brain hemorrhage'
  },
  {
    symptom: ['difficulty breathing', 'shortness of breath', 'can\'t breathe'],
    condition: 'Respiratory Emergency',
    urgency: 'immediate',
    action: 'Seek immediate emergency care'
  },
  {
    symptom: ['severe abdominal pain', 'rebound tenderness', 'rigid abdomen'],
    condition: 'Acute Abdomen',
    urgency: 'immediate',
    action: 'Go to emergency room immediately'
  },
  {
    symptom: ['altered mental status', 'confusion', 'unconscious', 'unresponsive'],
    condition: 'Altered Consciousness',
    urgency: 'immediate',
    action: 'Call 911 immediately'
  },
  {
    symptom: ['high fever', 'fever over 103', 'fever with rash'],
    condition: 'Possible Sepsis or Meningitis',
    urgency: 'urgent',
    action: 'Seek emergency care within 1 hour'
  },
  {
    symptom: ['severe allergic reaction', 'anaphylaxis', 'throat swelling'],
    condition: 'Anaphylaxis',
    urgency: 'immediate',
    action: 'Use EpiPen if available and call 911 immediately'
  }
]

// Common symptom patterns for basic triage
const SYMPTOM_PATTERNS: SymptomPattern[] = [
  {
    keywords: ['cough', 'runny nose', 'sneezing', 'congestion', 'sore throat', 'nasal discharge'],
    diagnosis: 'Upper Respiratory Infection (Common Cold)',
    confidence: 70,
    category: 'infectious',
    reasoning: 'Combination of upper respiratory symptoms consistent with viral infection',
    commonTests: ['No testing usually needed', 'Rapid strep test if severe sore throat'],
    followupTimeframe: '7-10 days if symptoms worsen or persist'
  },
  {
    keywords: ['fever', 'body aches', 'fatigue', 'chills', 'malaise'],
    diagnosis: 'Viral Syndrome (Flu-like illness)',
    confidence: 75,
    category: 'infectious',
    reasoning: 'Systemic symptoms suggesting viral infection',
    commonTests: ['Flu test if within 48 hours of onset', 'Supportive care'],
    followupTimeframe: '5-7 days if symptoms worsen'
  },
  {
    keywords: ['headache', 'head pain', 'temple pain'],
    diagnosis: 'Primary Headache Disorder',
    confidence: 60,
    category: 'neurological',
    reasoning: 'Isolated headache symptoms most commonly represent benign headache disorders',
    commonTests: ['Usually no testing needed', 'Consider imaging if severe or with neurological signs'],
    followupTimeframe: '1-2 weeks if headaches become frequent'
  },
  {
    keywords: ['migraine', 'severe headache', 'throbbing headache', 'photophobia', 'phonophobia'],
    diagnosis: 'Migraine Headache',
    confidence: 80,
    category: 'neurological',
    reasoning: 'Classic migraine presentation with characteristic features',
    commonTests: ['Clinical diagnosis based on criteria', 'Neuroimaging if atypical features'],
    followupTimeframe: '2-3 weeks if not responding to treatment'
  },
  {
    keywords: ['vomiting', 'nausea', 'dizzy', 'dizziness', 'vertigo'],
    diagnosis: 'Vestibular Disorder or Migraine-Associated Vertigo',
    confidence: 65,
    category: 'neurological',
    reasoning: 'Combination of vestibular and gastrointestinal symptoms',
    commonTests: ['Basic neurological examination', 'Consider brain imaging if concerning features'],
    followupTimeframe: '1 week if symptoms persist'
  },
  {
    keywords: ['bone pain', 'fracture', 'broken bone', 'injury', 'trauma', 'fall'],
    diagnosis: 'Possible Musculoskeletal Injury',
    confidence: 75,
    category: 'orthopedic',
    reasoning: 'History and symptoms suggest possible fracture or significant musculoskeletal injury',
    commonTests: ['X-ray imaging of affected area', 'Physical examination by orthopedic specialist'],
    followupTimeframe: 'Immediate evaluation if suspected fracture'
  },
  {
    keywords: ['joint pain', 'swelling', 'arthritis', 'stiffness'],
    diagnosis: 'Inflammatory Joint Disease',
    confidence: 70,
    category: 'rheumatological',
    reasoning: 'Joint symptoms suggesting inflammatory or degenerative joint disease',
    commonTests: ['Joint X-rays', 'Laboratory studies (ESR, CRP, RF, anti-CCP)'],
    followupTimeframe: '1-2 weeks for rheumatology evaluation'
  },
  {
    keywords: ['pain', 'swelling', 'inflammation'],
    diagnosis: 'Non-specific Inflammatory Condition',
    confidence: 50,
    category: 'general',
    reasoning: 'Generic pain and swelling symptoms requiring further evaluation',
    commonTests: ['Physical examination', 'Laboratory studies if systemic symptoms'],
    followupTimeframe: '1 week if symptoms persist or worsen'
  },
  {
    keywords: ['nausea', 'vomiting', 'diarrhea', 'stomach pain'],
    diagnosis: 'Gastroenteritis',
    confidence: 65,
    category: 'gastrointestinal',
    reasoning: 'GI symptoms suggesting viral or bacterial gastroenteritis',
    commonTests: ['Stool culture if severe or bloody', 'Hydration assessment'],
    followupTimeframe: '3-5 days if symptoms persist'
  },
  {
    keywords: ['back pain', 'lower back pain', 'muscle pain'],
    diagnosis: 'Musculoskeletal Pain Syndrome',
    confidence: 70,
    category: 'musculoskeletal',
    reasoning: 'Common presentation of mechanical back pain',
    commonTests: ['X-rays usually not needed acutely', 'Consider if pain persists >6 weeks'],
    followupTimeframe: '2-3 weeks if no improvement'
  },
  {
    keywords: ['rash', 'skin irritation', 'itching', 'hives'],
    diagnosis: 'Contact Dermatitis or Allergic Reaction',
    confidence: 60,
    category: 'dermatological',
    reasoning: 'Skin symptoms suggesting allergic or contact reaction',
    commonTests: ['Allergy testing if recurrent', 'Patch testing for contact allergies'],
    followupTimeframe: '1 week if rash spreads or worsens'
  },
  {
    keywords: ['anxiety', 'panic', 'worry', 'stress'],
    diagnosis: 'Anxiety Disorder',
    confidence: 55,
    category: 'psychiatric',
    reasoning: 'Psychological symptoms suggesting anxiety-related condition',
    commonTests: ['PHQ-9 depression screening', 'GAD-7 anxiety screening'],
    followupTimeframe: '1-2 weeks for mental health evaluation'
  }
]

/**
 * Check for red flag symptoms requiring immediate medical attention
 * Uses precise matching to avoid false positives
 */
export function checkRedFlagSymptoms(symptoms: string[]): RedFlagSymptom[] {
  const symptomsLower = symptoms.map(s => s.toLowerCase().trim())
  const detectedRedFlags: RedFlagSymptom[] = []
  const combinedSymptoms = symptomsLower.join(' ')

  for (const redFlag of RED_FLAG_SYMPTOMS) {
    let matched = false

    for (const flagSymptom of redFlag.symptom) {
      const flagSymptomLower = flagSymptom.toLowerCase()

      // Precise matching - requires the full phrase or exact word match
      const exactMatch = symptomsLower.some(symptom =>
        symptom === flagSymptomLower ||
        symptom.includes(flagSymptomLower) && flagSymptomLower.length > 3
      )

      // Also check combined symptoms for multi-word red flags
      const phraseMatch = combinedSymptoms.includes(flagSymptomLower) &&
                         flagSymptomLower.split(' ').length > 1

      if (exactMatch || phraseMatch) {
        matched = true
        break
      }
    }

    if (matched) {
      detectedRedFlags.push(redFlag)
    }
  }

  return detectedRedFlags
}

/**
 * Generate symptom-based triage when AI diagnosis is unavailable
 */
export function generateSymptomBasedTriage(
  symptoms: string[],
  duration: string,
  severity: string,
  patientAge?: number
): DiagnosisResponse {
  // First check for red flags
  const redFlags = checkRedFlagSymptoms(symptoms)

  if (redFlags.length > 0) {
    return {
      emergency_level: redFlags[0].urgency,
      red_flags: redFlags.map(rf => `${rf.condition}: ${rf.action}`),
      diagnoses: [{
        name: redFlags[0].condition,
        confidence: 95,
        reasoning: 'RED FLAG SYMPTOMS DETECTED - Immediate medical evaluation required',
        category: 'emergency'
      }],
      followups: [{
        type: 'immediate_care',
        detail: redFlags[0].action,
        urgency: redFlags[0].urgency,
        timeframe: 'Immediately',
        rationale: 'Critical symptoms require immediate medical evaluation'
      }],
      warning_signs: ['Any worsening of symptoms', 'New symptoms develop'],
      patient_education: 'SEEK IMMEDIATE MEDICAL ATTENTION - Do not delay treatment'
    }
  }

  // Find matching symptom patterns using sophisticated weighted scoring
  const symptomsLower = symptoms.map(s => s.toLowerCase().trim())
  const matchingPatterns: Array<{ pattern: SymptomPattern; matchScore: number; specificityScore: number }> = []

  for (const pattern of SYMPTOM_PATTERNS) {
    let matchScore = 0
    let specificityScore = 0
    let totalKeywords = pattern.keywords.length

    for (const keyword of pattern.keywords) {
      const keywordLower = keyword.toLowerCase()
      let keywordMatched = false

      for (const symptom of symptomsLower) {
        // Exact match (highest score)
        if (symptom === keywordLower) {
          matchScore += 3
          specificityScore += 3
          keywordMatched = true
          break
        }
        // Contains match (medium score) - but only for longer keywords to avoid false positives
        else if (keywordLower.length > 4 && symptom.includes(keywordLower)) {
          matchScore += 2
          specificityScore += 1
          keywordMatched = true
          break
        }
        // Partial match (low score) - only for very specific terms
        else if (symptom.length > 3 && keywordLower.includes(symptom) && keywordLower.length > 6) {
          matchScore += 1
          keywordMatched = true
          break
        }
      }

      // Bonus for multi-word specific matches
      if (keywordMatched && keyword.includes(' ')) {
        specificityScore += 2
      }
    }

    // Calculate match percentage and specificity bonus
    const matchPercentage = matchScore / (totalKeywords * 3) // Maximum possible score per keyword is 3
    const finalScore = matchScore + specificityScore + (matchPercentage * 5)

    // Only consider patterns with meaningful matches (at least 20% match or high specificity)
    if (matchScore > 0 && (matchPercentage > 0.2 || specificityScore > 3)) {
      matchingPatterns.push({ pattern, matchScore: finalScore, specificityScore })
    }
  }

  // Sort by combined score (match score + specificity)
  matchingPatterns.sort((a, b) => b.matchScore - a.matchScore)

  if (matchingPatterns.length === 0) {
    // No specific pattern matched - general guidance
    return {
      emergency_level: 'routine',
      diagnoses: [{
        name: 'Non-specific symptoms requiring medical evaluation',
        confidence: 30,
        reasoning: 'Symptoms do not match common patterns - professional evaluation recommended',
        category: 'unspecified'
      }],
      followups: [{
        type: 'followup',
        detail: 'Schedule appointment with primary care provider for evaluation',
        urgency: 'medium',
        timeframe: '1-2 weeks',
        rationale: 'Professional medical evaluation needed for proper diagnosis'
      }],
      warning_signs: ['Symptoms worsen significantly', 'New concerning symptoms develop', 'Fever develops'],
      patient_education: 'Monitor symptoms and seek medical care if condition worsens'
    }
  }

  // Use best matching pattern with enhanced confidence calculation
  const bestMatch = matchingPatterns[0]
  const pattern = bestMatch.pattern

  // Calculate confidence based on match quality, specificity, and clinical factors
  let baseConfidence = pattern.confidence
  const matchQuality = Math.min(bestMatch.matchScore / 20, 1) // Normalize to 0-1
  const specificityBonus = Math.min(bestMatch.specificityScore / 10, 0.2) // Up to 20% bonus

  let adjustedConfidence = Math.floor(baseConfidence * (0.7 + (matchQuality * 0.3) + specificityBonus))
  adjustedConfidence = Math.max(Math.min(adjustedConfidence, 85), 30) // Cap between 30-85%

  // Adjust urgency based on severity, duration, and symptom category
  let urgency: 'immediate' | 'high' | 'medium' | 'low' = 'medium'

  if (pattern.category === 'orthopedic' && severity === 'severe') urgency = 'high'
  else if (pattern.category === 'neurological' && severity === 'severe') urgency = 'high'
  else if (severity === 'severe') urgency = 'high'
  else if (severity === 'mild') urgency = 'low'

  // Enhanced emergency level determination
  let emergencyLevel: 'immediate' | 'urgent' | 'routine' = 'routine'
  if (pattern.category === 'orthopedic' && symptoms.some(s => s.toLowerCase().includes('fracture'))) {
    emergencyLevel = 'urgent'
  }

  // Enhanced diagnostic reasoning with specific medical details
  const detailedReasoning = `
Clinical Assessment: ${pattern.reasoning}
Symptom Analysis: Presented symptoms (${symptoms.join(', ')}) show ${Math.round(matchQuality * 100)}% concordance with ${pattern.diagnosis.toLowerCase()}.
Severity Assessment: ${severity} presentation over ${duration} timeframe.
Diagnostic Confidence: ${adjustedConfidence}% based on symptom pattern recognition and clinical correlation.
Recommended Evaluation: ${pattern.commonTests.join(' or ')}.
  `.trim()

  return {
    emergency_level: emergencyLevel,
    diagnoses: [{
      name: pattern.diagnosis,
      confidence: adjustedConfidence,
      reasoning: detailedReasoning,
      category: pattern.category
    }],
    followups: [
      {
        type: 'followup',
        detail: `Clinical follow-up ${pattern.followupTimeframe}`,
        urgency: urgency,
        timeframe: pattern.followupTimeframe,
        rationale: 'Monitor therapeutic response and assess for complications or alternative diagnoses'
      },
      {
        type: 'test',
        detail: generateTestRecommendations(pattern, symptoms, severity),
        urgency: pattern.category === 'orthopedic' ? 'high' : urgency,
        timeframe: pattern.category === 'orthopedic' ? 'Within 2-4 hours if fracture suspected' : 'If symptoms persist beyond expected timeline',
        rationale: `Diagnostic testing indicated based on ${pattern.category} presentation and symptom severity`
      }
    ],
    warning_signs: generateWarningSignsForCategory(pattern.category, symptoms),
    patient_education: generatePatientEducation(pattern, symptoms, severity)
  }
}

/**
 * Generate specific test recommendations based on pattern and symptoms
 */
function generateTestRecommendations(pattern: SymptomPattern, symptoms: string[], severity: string): string {
  const category = pattern.category

  if (category === 'orthopedic') {
    if (symptoms.some(s => s.toLowerCase().includes('fracture') || s.toLowerCase().includes('bone'))) {
      return 'X-ray imaging of affected area. If X-ray shows fracture: orthopedic consultation within 24 hours. If negative but high clinical suspicion: consider CT or MRI.'
    }
    return 'X-ray imaging if pain persists >48 hours or inability to bear weight'
  }

  if (category === 'neurological') {
    if (symptoms.some(s => s.toLowerCase().includes('migraine'))) {
      return 'Clinical diagnosis based on International Headache Society criteria. Neuroimaging (CT/MRI) if atypical features, focal neurological signs, or new onset after age 50.'
    }
    if (severity === 'severe') {
      return 'Neurological examination. Consider CT head if altered mental status, focal signs, or concerning features.'
    }
  }

  if (category === 'rheumatological') {
    return 'Laboratory studies: ESR, CRP, RF, anti-CCP antibodies. Joint X-rays. Rheumatology referral if inflammatory markers elevated.'
  }

  return pattern.commonTests.join(' or ')
}

/**
 * Generate category-specific warning signs
 */
function generateWarningSignsForCategory(category: string, symptoms: string[]): string[] {
  const baseWarnings = [
    'Symptoms significantly worsen',
    'New concerning symptoms develop'
  ]

  switch (category) {
    case 'orthopedic':
      return [...baseWarnings,
        'Numbness or tingling in affected area',
        'Loss of function or inability to move',
        'Signs of infection (fever, increased pain, redness)',
        'Circulation changes (color, temperature)'
      ]

    case 'neurological':
      return [...baseWarnings,
        'Sudden severe headache (worst of life)',
        'Vision changes or loss',
        'Weakness or numbness',
        'Confusion or altered mental status',
        'Neck stiffness with fever'
      ]

    case 'infectious':
      return [...baseWarnings,
        'High fever >101.3°F (38.5°C)',
        'Difficulty breathing',
        'Signs of dehydration',
        'Persistent vomiting'
      ]

    default:
      return [...baseWarnings,
        'High fever develops',
        'Difficulty breathing',
        'Severe pain not responding to treatment'
      ]
  }
}

/**
 * Generate category-specific patient education
 */
function generatePatientEducation(pattern: SymptomPattern, symptoms: string[], severity: string): string {
  const category = pattern.category

  if (category === 'orthopedic') {
    return `For suspected musculoskeletal injury: Apply RICE protocol (Rest, Ice, Compression, Elevation). Avoid weight-bearing if fracture suspected. Seek immediate care if numbness, severe pain, or circulation changes occur.`
  }

  if (category === 'neurological' && symptoms.some(s => s.toLowerCase().includes('migraine'))) {
    return `Migraine management: Rest in dark, quiet room. Apply cold compress. Stay hydrated. Take prescribed migraine medications as directed. Identify and avoid triggers. Seek emergency care if "worst headache of life" or neurological symptoms develop.`
  }

  return `Self-care for ${pattern.diagnosis.toLowerCase()}: Rest, adequate hydration, symptom monitoring. Follow prescribed treatments. Seek medical attention if symptoms worsen or new concerning signs develop.`
}

/**
 * Validate AI diagnosis response for safety and completeness
 */
export function validateAIDiagnosisResponse(response: DiagnosisResponse): {
  isValid: boolean
  warnings: string[]
  enhancedResponse: DiagnosisResponse
} {
  const warnings: string[] = []
  let enhancedResponse = { ...response }

  // Check for missing critical fields
  if (!response.diagnoses || response.diagnoses.length === 0) {
    warnings.push('No diagnoses provided')
    return { isValid: false, warnings, enhancedResponse }
  }

  // Validate emergency level is set
  if (!response.emergency_level) {
    enhancedResponse.emergency_level = 'routine'
    warnings.push('Emergency level not specified - defaulting to routine')
  }

  // Ensure warning signs are present
  if (!response.warning_signs || response.warning_signs.length === 0) {
    enhancedResponse.warning_signs = [
      'Symptoms worsen significantly',
      'New concerning symptoms develop',
      'Fever develops or increases'
    ]
    warnings.push('Warning signs added')
  }

  // Ensure patient education is present
  if (!response.patient_education) {
    enhancedResponse.patient_education = 'Monitor symptoms carefully and seek medical attention if condition worsens or does not improve as expected.'
    warnings.push('Patient education added')
  }

  // Validate confidence scores
  for (const diagnosis of enhancedResponse.diagnoses) {
    if (diagnosis.confidence > 95) {
      diagnosis.confidence = 85 // Cap confidence for safety
      warnings.push(`High confidence reduced for safety: ${diagnosis.name}`)
    }
  }

  return { isValid: true, warnings, enhancedResponse }
}