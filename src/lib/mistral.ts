import { Mistral } from '@mistralai/mistralai'

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || 'placeholder-api-key',
})

export interface DiagnosisResponse {
  emergency_level?: 'immediate' | 'urgent' | 'routine'
  red_flags?: string[]
  diagnoses: Array<{
    name: string
    confidence: number
    reasoning?: string
    icd10_code?: string
    category?: string
  }>
  followups: Array<{
    type: 'test' | 'referral' | 'followup' | 'education' | 'immediate_care'
    detail: string
    urgency: 'immediate' | 'high' | 'medium' | 'low'
    timeframe?: string
    rationale?: string
  }>
  warning_signs?: string[]
  patient_education?: string
}

// Mistral models to try in fallback order (most capable first)
const MISTRAL_MODELS = [
  'mistral-large-latest',
  'mistral-medium-latest',
  'mistral-small-latest'
]

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Extract and clean JSON from potentially malformed Mistral responses
 */
function extractAndParseJSON(content: string): DiagnosisResponse {
  try {
    // Try direct parsing first
    return JSON.parse(content)
  } catch (error) {
    console.log('Direct JSON parsing failed, attempting extraction...')

    // Try to find JSON object in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch (extractError) {
        console.log('JSON extraction failed, attempting cleanup...')
      }
    }

    // Try to clean up common issues in the JSON
    let cleanedContent = content
      .replace(/```json\n?/g, '') // Remove json code block markers
      .replace(/```\n?/g, '')     // Remove closing code block markers
      .replace(/^\s*/, '')        // Remove leading whitespace
      .replace(/\s*$/, '')        // Remove trailing whitespace
      .trim()

    // Look for content between first { and last }
    const firstBrace = cleanedContent.indexOf('{')
    const lastBrace = cleanedContent.lastIndexOf('}')

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanedContent = cleanedContent.substring(firstBrace, lastBrace + 1)
      try {
        return JSON.parse(cleanedContent)
      } catch (cleanupError) {
        console.log('JSON cleanup failed')
      }
    }

    throw new Error(`Unable to parse Mistral response as JSON: ${content.substring(0, 200)}...`)
  }
}

/**
 * Enhanced getDiagnosis with model fallback and retry logic
 */
export async function getDiagnosis(
  patientHistory: string,
  symptoms: string
): Promise<DiagnosisResponse> {
  const prompt = `You are an experienced medical assistant specializing in clinical decision support. Use structured diagnostic reasoning to provide accurate, evidence-based recommendations.

CRITICAL: Respond ONLY with valid JSON. No explanatory text before or after the JSON object.

**CLINICAL PRESENTATION:**

Patient Background:
${patientHistory}

Chief Complaint and Symptoms:
${symptoms}

**SYSTEMATIC DIAGNOSTIC APPROACH:**

**STEP 1: RED FLAG ASSESSMENT**
First, identify any red flag symptoms requiring immediate attention:
- Chest pain with cardiac risk factors (MI, PE, aortic dissection)
- Severe headache with neurological signs (stroke, meningitis, intracranial pressure)
- Abdominal pain with peritoneal signs (appendicitis, perforation, obstruction)
- Respiratory distress (pneumothorax, severe asthma, PE)
- Altered mental status (sepsis, hypoglycemia, stroke)
- Severe allergic reactions or anaphylaxis

**STEP 2: VINDICATE FRAMEWORK ANALYSIS**
Systematically consider each category:
- **V**ascular: Cardiovascular, cerebrovascular conditions
- **I**nfectious: Bacterial, viral, fungal, parasitic infections
- **N**eoplastic: Malignancies, benign tumors
- **D**rugs/Toxins: Medication effects, substance abuse, poisoning
- **I**nflammatory: Autoimmune, inflammatory conditions
- **C**ongenital: Genetic disorders, developmental abnormalities
- **A**utoimmune: Systemic lupus, rheumatoid arthritis, etc.
- **T**rauma: Injuries, physical damage
- **E**ndocrine: Hormonal imbalances, metabolic disorders

**STEP 3: CLINICAL DECISION RULES**
Apply relevant evidence-based criteria:
- Age and gender-specific considerations
- Ottawa rules for injuries
- Wells score for PE/DVT
- CAGE questionnaire for substance abuse
- PHQ-9 for depression screening
- Consider family history patterns

**STEP 4: DIFFERENTIAL DIAGNOSIS PRIORITIZATION**
Rank by:
1. Life-threatening conditions (treat first)
2. Statistical likelihood (common things are common)
3. Symptom constellation match
4. Patient risk factors
5. Treatability and urgency

**REQUIRED JSON RESPONSE FORMAT:**
{
  "emergency_level": "immediate|urgent|routine",
  "red_flags": ["list any concerning symptoms requiring immediate attention"],
  "diagnoses": [
    {
      "name": "Specific Diagnosis (use standard medical terminology)",
      "confidence": 85,
      "reasoning": "Evidence-based rationale using VINDICATE framework",
      "icd10_code": "A00.0 (if known)",
      "category": "infectious|cardiovascular|respiratory|neurological|orthopedic|rheumatological|etc"
    }
  ],
  "followups": [
    {
      "type": "test|referral|followup|education|immediate_care",
      "detail": "Specific action with clinical justification and expected timeline",
      "urgency": "immediate|high|medium|low",
      "timeframe": "specific timeframe (e.g., 'within 2 hours', '1-2 weeks')",
      "rationale": "why this action is recommended"
    }
  ],
  "warning_signs": ["symptoms that warrant immediate medical attention"],
  "patient_education": "Key points for patient understanding and self-care"
}

**CRITICAL SAFETY REQUIREMENTS:**
- Always err on the side of caution for serious conditions
- Include appropriate disclaimers about seeking professional medical care
- Consider patient age, comorbidities, and medication interactions
- Prioritize patient safety over diagnostic precision
- Include specific warning signs for deterioration

RESPOND ONLY WITH VALID JSON - NO OTHER TEXT.`

  let lastError: Error | null = null

  // Try each model in fallback order
  for (const model of MISTRAL_MODELS) {
    console.log(`Attempting diagnosis with model: ${model}`)

    // Retry logic for each model
    for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
      try {
        const response = await mistral.chat.complete({
          model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          responseFormat: {
            type: 'json_object',
          },
          temperature: 0.3, // Lower temperature for more consistent responses
          maxTokens: 2048,   // Ensure adequate response length
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
          throw new Error(`No response from Mistral AI (${model})`)
        }

        // Parse and validate the JSON response
        const parsedResponse = extractAndParseJSON(content)

        // Validate required fields
        if (!parsedResponse.diagnoses || parsedResponse.diagnoses.length === 0) {
          throw new Error('Invalid response: missing diagnoses')
        }

        console.log(`Successfully got diagnosis from ${model} on attempt ${attempt}`)
        return parsedResponse

      } catch (error: any) {
        lastError = error
        const isRateLimit = error.message?.includes('429') || error.message?.includes('capacity')
        const isServerError = error.message?.includes('500') || error.message?.includes('502') || error.message?.includes('503')

        console.log(`Model ${model} attempt ${attempt} failed:`, error.message)

        // If this is the last attempt for this model, don't wait
        if (attempt === RETRY_CONFIG.maxAttempts) {
          break
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          RETRY_CONFIG.baseDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
          RETRY_CONFIG.maxDelayMs
        )

        // Add extra delay for rate limits
        const finalDelay = isRateLimit ? delay * 2 : delay

        console.log(`Waiting ${finalDelay}ms before retry...`)
        await sleep(finalDelay)
      }
    }
  }

  // If all models and retries failed, throw the last error
  console.error('All Mistral models failed after retries:', lastError)
  throw new Error(`Failed to get AI diagnosis after trying all models: ${lastError?.message}`)
}

export async function getFollowUpSuggestions(
  diagnosis: string,
  patientHistory: string
): Promise<DiagnosisResponse['followups']> {
  const prompt = `Based on the diagnosis "${diagnosis}" and patient history, suggest appropriate follow-up actions:

Patient History: ${patientHistory}

**RESPONSE FORMAT (JSON):**
{
  "followups": [
    {
      "type": "test|referral|followup|education",
      "detail": "Specific action with clinical justification",
      "urgency": "immediate|high|medium|low",
      "timeframe": "when to complete this action"
    }
  ]
}

Provide specific, actionable recommendations with appropriate urgency levels and timeframes.`

  try {
    const response = await mistral.chat.complete({
      model: 'mistral-large-latest', // Updated to current available model
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      responseFormat: {
        type: 'json_object',
      },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from Mistral AI')
    }

    const contentString = typeof content === 'string' ? content : JSON.stringify(content)
    const parsed = JSON.parse(contentString)
    return parsed.followups || parsed
  } catch (error) {
    console.error('Error calling Mistral AI for follow-ups:', error)
    throw new Error('Failed to get follow-up suggestions')
  }
}