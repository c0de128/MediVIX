import { render, screen } from '@testing-library/react'
import { DiagnosisCard } from '@/components/diagnosis/diagnosis-card'
import '@testing-library/jest-dom'

const mockDiagnosis = {
  diagnosis: 'Common Cold',
  confidence: 0.85,
  reasoning: 'Based on symptoms of runny nose and mild fever',
  differential_diagnoses: [
    { condition: 'Flu', probability: 0.60, reasoning: 'Similar symptoms' },
    { condition: 'Allergies', probability: 0.30, reasoning: 'Seasonal pattern' }
  ],
  recommendations: [
    { type: 'test', description: 'Flu test if symptoms worsen', urgency: 'medium' as const }
  ],
  follow_up: [
    { timeframe: '3-5 days', action: 'Return if symptoms persist' }
  ]
}

describe('DiagnosisCard', () => {
  it('should render primary diagnosis', () => {
    render(<DiagnosisCard diagnosis={mockDiagnosis} />)

    expect(screen.getByText('Common Cold')).toBeInTheDocument()
    expect(screen.getByText('AI Diagnosis Results')).toBeInTheDocument()
  })

  it('should display confidence level', () => {
    render(<DiagnosisCard diagnosis={mockDiagnosis} />)

    expect(screen.getByText('85% confidence')).toBeInTheDocument()
  })

  it('should show differential diagnoses', () => {
    render(<DiagnosisCard diagnosis={mockDiagnosis} />)

    expect(screen.getByText('Flu')).toBeInTheDocument()
    expect(screen.getByText('Allergies')).toBeInTheDocument()
  })

  it('should display recommendations', () => {
    render(<DiagnosisCard diagnosis={mockDiagnosis} />)

    expect(screen.getByText(/Flu test if symptoms worsen/i)).toBeInTheDocument()
  })

  it('should show follow-up information', () => {
    render(<DiagnosisCard diagnosis={mockDiagnosis} />)

    expect(screen.getByText('3-5 days')).toBeInTheDocument()
    expect(screen.getByText('Return if symptoms persist')).toBeInTheDocument()
  })
})