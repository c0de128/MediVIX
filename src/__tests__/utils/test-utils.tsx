import React from 'react'
import '@testing-library/jest-dom'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      gcTime: 0,
    },
  },
})

// All the providers for testing
export function AllTheProviders({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

// Custom render function
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data generators
export const generateMockPatient = (overrides = {}) => ({
  id: '550e8400-e29b-41d4-a716-446655440000',
  first_name: 'John',
  last_name: 'Doe',
  dob: '1990-01-01',
  phone: '+1234567890',
  email: 'john.doe@example.com',
  allergies: [],
  chronic_conditions: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const generateMockAppointment = (overrides = {}) => ({
  id: '660e8400-e29b-41d4-a716-446655440001',
  patient_id: '550e8400-e29b-41d4-a716-446655440000',
  start_time: new Date().toISOString(),
  end_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  reason: 'Regular checkup',
  status: 'scheduled',
  notes: '',
  created_at: new Date().toISOString(),
  ...overrides,
})

export const generateMockDiagnosis = (overrides = {}) => ({
  diagnoses: [
    { name: 'Common Cold', confidence: 75 },
    { name: 'Flu', confidence: 45 },
    { name: 'Allergies', confidence: 20 },
  ],
  followups: [
    { type: 'test' as const, detail: 'Flu test recommended', urgency: 'medium' as const },
    { type: 'followup' as const, detail: 'Follow-up in 3-5 days if symptoms persist', urgency: 'low' as const },
  ],
  ...overrides,
})

// Add a simple test to satisfy Jest requirement
describe('Test Utils', () => {
  it('should export test utilities', () => {
    expect(generateMockPatient).toBeDefined()
    expect(generateMockAppointment).toBeDefined()
    expect(generateMockDiagnosis).toBeDefined()
  })
})