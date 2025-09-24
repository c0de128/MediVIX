import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// RxNorm API base URL (free, no API key required)
const RXNORM_API_BASE = 'https://rxnav.nlm.nih.gov/REST'

// Validation schema for drug search
const drugSearchSchema = z.object({
  query: z.string().min(1, 'Drug name is required').max(100, 'Query too long'),
  limit: z.number().min(1).max(50).optional().default(10)
})

// Interface for RxNorm API responses
interface RxNormConcept {
  rxcui: string
  name: string
  synonym: string
}

interface DrugInfo {
  rxcui: string
  name: string
  generic_name?: string
  brand_names?: string[]
  drug_class?: string
  interactions?: string[]
  dosage_forms?: string[]
}

// GET /api/drugs?query=drugname - Search for drugs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Validate input
    const { query: validatedQuery, limit: validatedLimit } = drugSearchSchema.parse({
      query,
      limit
    })

    // Search for drugs using RxNorm API
    const searchUrl = `${RXNORM_API_BASE}/drugs.json?name=${encodeURIComponent(validatedQuery)}`

    console.log(`Searching RxNorm for: ${validatedQuery}`)

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MediVIX/1.0 (Medical Office Management Demo)'
      }
    })

    if (!response.ok) {
      console.error(`RxNorm API error: ${response.status}`)
      // Return mock data for demo purposes
      return NextResponse.json(getMockDrugData(validatedQuery))
    }

    const data = await response.json()

    // Transform RxNorm response to our format
    const drugs = await processDrugSearchResults(data, validatedLimit)

    return NextResponse.json({
      query: validatedQuery,
      results: drugs,
      count: drugs.length,
      source: 'RxNorm API'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Drug search error:', error)

    // Return mock data as fallback
    const query = new URL(request.url).searchParams.get('query') || 'unknown'
    return NextResponse.json({
      ...getMockDrugData(query),
      note: 'Using mock data due to API unavailability'
    })
  }
}

// POST /api/drugs/interactions - Check drug interactions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { drugs } = body

    if (!drugs || !Array.isArray(drugs) || drugs.length === 0) {
      return NextResponse.json(
        { error: 'Drugs array is required' },
        { status: 400 }
      )
    }

    // For demo purposes, return mock interaction data
    const interactions = getMockInteractions(drugs)

    return NextResponse.json({
      drugs,
      interactions,
      severity_levels: {
        high: 'Major - Avoid combination',
        medium: 'Moderate - Monitor closely',
        low: 'Minor - Be aware'
      },
      source: 'Mock data for demo'
    })

  } catch (error) {
    console.error('Drug interaction check error:', error)
    return NextResponse.json(
      { error: 'Failed to check drug interactions' },
      { status: 500 }
    )
  }
}

async function processDrugSearchResults(data: any, limit: number): Promise<DrugInfo[]> {
  const drugs: DrugInfo[] = []

  if (data?.drugGroup?.conceptGroup) {
    for (const group of data.drugGroup.conceptGroup.slice(0, limit)) {
      if (group?.conceptProperties) {
        for (const concept of group.conceptProperties.slice(0, 3)) {
          const drugInfo = await getDrugDetails(concept.rxcui)
          if (drugInfo) {
            drugs.push(drugInfo)
          }
        }
      }
    }
  }

  return drugs.slice(0, limit)
}

async function getDrugDetails(rxcui: string): Promise<DrugInfo | null> {
  try {
    // Get basic drug information
    const detailsUrl = `${RXNORM_API_BASE}/rxcui/${rxcui}/properties.json`
    const response = await fetch(detailsUrl)

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const properties = data?.properties

    if (!properties) {
      return null
    }

    return {
      rxcui: rxcui,
      name: properties.name || 'Unknown',
      generic_name: properties.name,
      drug_class: 'Not specified',
      dosage_forms: ['Oral', 'Injectable'], // Mock data
      brand_names: ['Brand name not available'] // Mock data
    }

  } catch (error) {
    console.error(`Error fetching details for RXCUI ${rxcui}:`, error)
    return null
  }
}

function getMockDrugData(query: string) {
  const mockDrugs = [
    {
      rxcui: 'mock-001',
      name: `${query} (Generic)`,
      generic_name: query.toLowerCase(),
      brand_names: [`${query}® Brand`, `${query}® XR`],
      drug_class: 'Demo Category',
      dosage_forms: ['Tablet', 'Capsule', 'Liquid'],
      interactions: ['Consult pharmacist for interactions']
    }
  ]

  return {
    query,
    results: mockDrugs,
    count: mockDrugs.length,
    source: 'Mock data for demo'
  }
}

function getMockInteractions(drugs: string[]) {
  const interactions = []

  // Generate some mock interactions based on common drug combinations
  const knownInteractions = {
    'warfarin': {
      'aspirin': { severity: 'high', description: 'Increased bleeding risk' },
      'ibuprofen': { severity: 'medium', description: 'May increase anticoagulation effect' }
    },
    'metformin': {
      'alcohol': { severity: 'medium', description: 'Risk of lactic acidosis' }
    },
    'lisinopril': {
      'potassium': { severity: 'medium', description: 'Risk of hyperkalemia' }
    }
  }

  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      const drug1 = drugs[i].toLowerCase()
      const drug2 = drugs[j].toLowerCase()

      if (knownInteractions[drug1]?.[drug2]) {
        interactions.push({
          drugs: [drugs[i], drugs[j]],
          ...knownInteractions[drug1][drug2]
        })
      } else {
        // Generate a generic interaction for demo
        interactions.push({
          drugs: [drugs[i], drugs[j]],
          severity: 'low',
          description: 'No major interactions known - monitor patient response'
        })
      }
    }
  }

  return interactions
}