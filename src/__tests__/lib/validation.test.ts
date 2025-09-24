import { patientSchemas, appointmentSchemas, baseSchemas } from '@/lib/validation/schemas'

describe('Validation Schemas', () => {
  describe('Base Schemas', () => {
    it('should validate valid email', () => {
      const result = baseSchemas.email.safeParse('test@example.com')
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = baseSchemas.email.safeParse('invalid-email')
      expect(result.success).toBe(false)
    })

    it('should validate valid phone number', () => {
      const result = baseSchemas.phone.safeParse('+1234567890')
      expect(result.success).toBe(true)
    })

    it('should reject invalid phone number', () => {
      const result = baseSchemas.phone.safeParse('abc123')
      expect(result.success).toBe(false)
    })

    it('should validate valid date', () => {
      const result = baseSchemas.date.safeParse('2024-01-15')
      expect(result.success).toBe(true)
    })

    it('should reject invalid date', () => {
      const result = baseSchemas.date.safeParse('not-a-date')
      expect(result.success).toBe(false)
    })
  })

  describe('Patient Schemas', () => {
    it('should validate complete patient data', () => {
      const patientData = {
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
        gender: 'male',
        phone: '+1234567890',
        email: 'john@example.com',
        allergies: ['Peanuts'],
        chronic_conditions: ['Hypertension'],
        emergency_contact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '+0987654321'
        }
      }

      const result = patientSchemas.create.safeParse(patientData)
      expect(result.success).toBe(true)
    })

    it('should reject patient with invalid name', () => {
      const patientData = {
        first_name: '123', // Invalid - contains numbers
        last_name: 'Doe',
        date_of_birth: '1990-01-01'
      }

      const result = patientSchemas.create.safeParse(patientData)
      expect(result.success).toBe(false)
    })

    it('should reject patient with future birth date', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)

      const patientData = {
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: futureDate.toISOString()
      }

      const result = patientSchemas.create.safeParse(patientData)
      expect(result.success).toBe(false)
    })
  })

  describe('Appointment Schemas', () => {
    it('should validate complete appointment data', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7) // 7 days from now
      const endDate = new Date(futureDate)
      endDate.setMinutes(endDate.getMinutes() + 30) // 30 minutes later

      const appointmentData = {
        patient_id: '550e8400-e29b-41d4-a716-446655440000',
        start_time: futureDate.toISOString(),
        end_time: endDate.toISOString(),
        reason: 'Regular checkup',
        status: 'scheduled' as const,
        notes: 'Patient requested early morning slot'
      }

      const result = appointmentSchemas.create.safeParse(appointmentData)
      expect(result.success).toBe(true)
    })

    it('should reject appointment with end time before start time', () => {
      const appointmentData = {
        patient_id: '550e8400-e29b-41d4-a716-446655440000',
        start_time: '2024-12-01T10:30:00Z',
        end_time: '2024-12-01T10:00:00Z', // End before start
        reason: 'Regular checkup'
      }

      const result = appointmentSchemas.create.safeParse(appointmentData)
      expect(result.success).toBe(false)
    })

    it('should reject appointment with invalid status', () => {
      const appointmentData = {
        patient_id: '550e8400-e29b-41d4-a716-446655440000',
        start_time: '2024-12-01T10:00:00Z',
        end_time: '2024-12-01T10:30:00Z',
        status: 'invalid-status' // Not in enum
      }

      const result = appointmentSchemas.create.safeParse(appointmentData)
      expect(result.success).toBe(false)
    })
  })
})