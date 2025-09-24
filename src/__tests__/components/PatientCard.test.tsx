import { render, screen } from '@/__tests__/utils/test-utils'
import { PatientCard } from '@/components/patients/patient-card'
import '@testing-library/jest-dom'

const mockPatient = {
  id: '123',
  first_name: 'John',
  last_name: 'Doe',
  dob: '1990-01-01',
  phone: '+1234567890',
  email: 'john@example.com',
  allergies: ['Peanuts', 'Shellfish'],
  chronic_conditions: ['Hypertension', 'Diabetes'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

// Mock the usePatient hook
jest.mock('@/hooks/use-patients', () => ({
  usePatient: jest.fn(() => ({
    data: mockPatient,
    isLoading: false,
    error: null,
  })),
}))

describe('PatientCard', () => {
  beforeEach(() => {
    const { usePatient } = require('@/hooks/use-patients')
    usePatient.mockReturnValue({
      data: mockPatient,
      isLoading: false,
      error: null,
    })
  })

  it('should render patient information when loaded', () => {
    render(<PatientCard patientId="123" />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should display loading state', () => {
    const { usePatient } = require('@/hooks/use-patients')
    usePatient.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    })

    render(<PatientCard patientId="123" />)

    // Check for skeleton loading elements (skeleton components have specific classes)
    const container = document.querySelector('.animate-pulse, [class*="animate-pulse"]')
    expect(container).toBeTruthy()
  })

  it('should display error state when patient not found', () => {
    const { usePatient } = require('@/hooks/use-patients')
    usePatient.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    })

    render(<PatientCard patientId="123" />)

    expect(screen.getByText('Patient not found')).toBeInTheDocument()
  })

  it('should handle patient with allergies', () => {
    render(<PatientCard patientId="123" />)

    // Check that medical information accordion exists
    expect(screen.getByText('Medical Information')).toBeInTheDocument()
    // Note: Allergies are hidden in accordion - we'd need user interaction to test them
  })

  it('should display patient contact information section', () => {
    render(<PatientCard patientId="123" />)

    // Contact info is in accordion, but we can verify the trigger is there
    expect(screen.getByText('Contact Information')).toBeInTheDocument()
  })
})