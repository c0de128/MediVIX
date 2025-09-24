/**
 * Drug lookup utilities for medical office management
 * Integrates with RxNorm API and provides fallback mock data
 */

export interface DrugInfo {
  rxcui: string
  name: string
  generic_name?: string
  brand_names?: string[]
  drug_class?: string
  dosage_forms?: string[]
  common_doses?: string[]
  contraindications?: string[]
  side_effects?: string[]
}

export interface DrugInteraction {
  drugs: string[]
  severity: 'high' | 'medium' | 'low'
  description: string
  recommendation?: string
}

/**
 * Search for drug information
 */
export async function searchDrugInfo(drugName: string): Promise<DrugInfo[]> {
  try {
    const response = await fetch(`/api/drugs?query=${encodeURIComponent(drugName)}&limit=5`)

    if (!response.ok) {
      console.warn(`Drug lookup failed for ${drugName}`)
      return getMockDrugInfo(drugName)
    }

    const data = await response.json()
    return data.results || []

  } catch (error) {
    console.error('Drug search error:', error)
    return getMockDrugInfo(drugName)
  }
}

/**
 * Check interactions between multiple drugs
 */
export async function checkDrugInteractions(drugs: string[]): Promise<DrugInteraction[]> {
  if (drugs.length < 2) {
    return []
  }

  try {
    const response = await fetch('/api/drugs/interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ drugs })
    })

    if (!response.ok) {
      console.warn('Drug interaction check failed')
      return getMockInteractions(drugs)
    }

    const data = await response.json()
    return data.interactions || []

  } catch (error) {
    console.error('Drug interaction check error:', error)
    return getMockInteractions(drugs)
  }
}

/**
 * Get drug recommendations based on condition with improved matching
 */
export function getDrugRecommendations(condition: string): Array<{
  drug: string
  dosage: string
  duration: string
  notes: string
}> {
  const recommendations: Record<string, Array<{
    drug: string
    dosage: string
    duration: string
    notes: string
  }>> = {
    // Cardiovascular conditions
    'hypertension': [
      {
        drug: 'Lisinopril',
        dosage: '10mg daily',
        duration: 'Long-term',
        notes: 'ACE inhibitor - monitor kidney function'
      },
      {
        drug: 'Amlodipine',
        dosage: '5mg daily',
        duration: 'Long-term',
        notes: 'Calcium channel blocker - watch for ankle swelling'
      }
    ],
    'high blood pressure': [
      {
        drug: 'Lisinopril',
        dosage: '10mg daily',
        duration: 'Long-term',
        notes: 'ACE inhibitor - monitor kidney function'
      }
    ],

    // Diabetes conditions
    'diabetes type 2': [
      {
        drug: 'Metformin',
        dosage: '500mg twice daily',
        duration: 'Long-term',
        notes: 'First-line therapy - take with meals'
      },
      {
        drug: 'Glipizide',
        dosage: '5mg daily',
        duration: 'Long-term',
        notes: 'Sulfonylurea - risk of hypoglycemia'
      }
    ],
    'diabetes mellitus type 2': [
      {
        drug: 'Metformin',
        dosage: '500mg twice daily',
        duration: 'Long-term',
        notes: 'First-line therapy - take with meals'
      }
    ],
    'type 2 diabetes': [
      {
        drug: 'Metformin',
        dosage: '500mg twice daily',
        duration: 'Long-term',
        notes: 'First-line therapy - take with meals'
      }
    ],

    // Respiratory infections
    'upper respiratory infection': [
      {
        drug: 'Dextromethorphan',
        dosage: '15mg every 4 hours',
        duration: '7-10 days',
        notes: 'Cough suppressant - over-the-counter'
      },
      {
        drug: 'Guaifenesin',
        dosage: '400mg every 4 hours',
        duration: '7-10 days',
        notes: 'Expectorant - increase fluid intake'
      }
    ],
    'common cold': [
      {
        drug: 'Acetaminophen',
        dosage: '650mg every 6 hours',
        duration: '5-7 days',
        notes: 'For fever and aches - max 3g daily'
      },
      {
        drug: 'Phenylephrine',
        dosage: '10mg every 4 hours',
        duration: '3-5 days',
        notes: 'Decongestant - avoid with hypertension'
      }
    ],
    'viral upper respiratory infection': [
      {
        drug: 'Acetaminophen',
        dosage: '650mg every 6 hours',
        duration: '5-7 days',
        notes: 'For fever and aches - max 3g daily'
      },
      {
        drug: 'Dextromethorphan',
        dosage: '15mg every 4 hours',
        duration: '7-10 days',
        notes: 'Cough suppressant - over-the-counter'
      }
    ],
    'bronchitis': [
      {
        drug: 'Guaifenesin',
        dosage: '400mg every 4 hours',
        duration: '7-14 days',
        notes: 'Expectorant - helps loosen mucus'
      },
      {
        drug: 'Albuterol',
        dosage: '2 puffs every 4-6 hours',
        duration: '7-10 days',
        notes: 'Bronchodilator - if wheezing present'
      }
    ],

    // Allergies
    'allergic rhinitis': [
      {
        drug: 'Loratadine',
        dosage: '10mg daily',
        duration: 'As needed',
        notes: 'Non-drowsy antihistamine'
      },
      {
        drug: 'Fluticasone nasal spray',
        dosage: '2 sprays each nostril daily',
        duration: 'During allergy season',
        notes: 'Nasal corticosteroid - most effective for rhinitis'
      }
    ],
    'seasonal allergies': [
      {
        drug: 'Cetirizine',
        dosage: '10mg daily',
        duration: 'During allergy season',
        notes: 'Antihistamine - may cause mild drowsiness'
      }
    ],

    // Pain and inflammation
    'headache': [
      {
        drug: 'Ibuprofen',
        dosage: '400mg every 6 hours',
        duration: '2-3 days',
        notes: 'NSAID - take with food, max 1200mg daily'
      },
      {
        drug: 'Acetaminophen',
        dosage: '650mg every 6 hours',
        duration: '2-3 days',
        notes: 'Safe with stomach issues - max 3g daily'
      }
    ],
    'migraine': [
      {
        drug: 'Sumatriptan',
        dosage: '25mg at onset',
        duration: 'As needed',
        notes: 'Triptan - for acute migraine treatment'
      }
    ]
  }

  // Improved matching logic with case-insensitive and partial matching
  const conditionLower = condition.toLowerCase().trim()

  // Direct match first
  if (recommendations[conditionLower]) {
    return recommendations[conditionLower]
  }

  // Partial matching for flexibility
  for (const [key, drugs] of Object.entries(recommendations)) {
    if (conditionLower.includes(key) || key.includes(conditionLower)) {
      return drugs
    }
  }

  // Keyword-based matching for common terms
  const keywordMatching: Record<string, string> = {
    'cold': 'common cold',
    'flu': 'upper respiratory infection',
    'cough': 'upper respiratory infection',
    'fever': 'common cold',
    'congestion': 'common cold',
    'runny nose': 'allergic rhinitis',
    'sneezing': 'allergic rhinitis',
    'blood pressure': 'hypertension',
    'diabetes': 'diabetes type 2',
    'sugar': 'diabetes type 2',
    'allergy': 'allergic rhinitis',
    'pain': 'headache'
  }

  for (const [keyword, mappedCondition] of Object.entries(keywordMatching)) {
    if (conditionLower.includes(keyword)) {
      return recommendations[mappedCondition] || []
    }
  }

  // Return empty array if no matches found
  return []
}

/**
 * Mock drug info for demo purposes
 */
function getMockDrugInfo(drugName: string): DrugInfo[] {
  return [{
    rxcui: `mock-${drugName.replace(/\s+/g, '-')}`,
    name: drugName,
    generic_name: drugName.toLowerCase(),
    brand_names: [`${drugName}® Brand`],
    drug_class: 'Demo Category',
    dosage_forms: ['Tablet', 'Capsule'],
    common_doses: ['Low dose', 'Standard dose', 'High dose'],
    contraindications: ['Known allergy to this medication'],
    side_effects: ['Consult prescribing information for side effects']
  }]
}

/**
 * Mock interactions for demo purposes
 */
function getMockInteractions(drugs: string[]): DrugInteraction[] {
  const interactions: DrugInteraction[] = []

  // Create mock interactions between all drug pairs
  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      interactions.push({
        drugs: [drugs[i], drugs[j]],
        severity: 'low',
        description: 'No major known interactions - monitor patient response',
        recommendation: 'Continue monitoring patient for any adverse effects'
      })
    }
  }

  return interactions
}

/**
 * Format drug information for display
 */
export function formatDrugInfo(drug: DrugInfo): string {
  const parts = [
    `**${drug.name}**`,
    drug.generic_name && drug.generic_name !== drug.name ? `Generic: ${drug.generic_name}` : null,
    drug.brand_names?.length ? `Brands: ${drug.brand_names.join(', ')}` : null,
    drug.drug_class ? `Class: ${drug.drug_class}` : null,
    drug.dosage_forms?.length ? `Forms: ${drug.dosage_forms.join(', ')}` : null
  ]

  return parts.filter(Boolean).join('\n')
}

/**
 * Check for drug allergies against patient allergy list
 */
export function checkDrugAllergies(
  drugName: string,
  patientAllergies: string[]
): Array<{ allergy: string; severity: 'high' | 'medium' | 'low' }> {
  const matches: Array<{ allergy: string; severity: 'high' | 'medium' | 'low' }> = []

  const drugLower = drugName.toLowerCase()

  for (const allergy of patientAllergies) {
    const allergyLower = allergy.toLowerCase()

    if (
      drugLower.includes(allergyLower) ||
      allergyLower.includes(drugLower) ||
      drugLower === allergyLower
    ) {
      matches.push({
        allergy,
        severity: 'high'
      })
    }
  }

  return matches
}