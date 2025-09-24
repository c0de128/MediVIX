import { z } from 'zod'

// Common validation patterns
const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
const nameRegex = /^[a-zA-Z\s\-'\.]+$/

// Base schemas for reusability
export const baseSchemas = {
  id: z.string().uuid('Invalid ID format'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(nameRegex, 'Name contains invalid characters'),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(phoneRegex, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  date: z.string()
    .min(1, 'Date is required')
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  optionalDate: z.string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), 'Invalid date format'),
  positiveNumber: z.number()
    .positive('Must be a positive number'),
  nonEmptyString: z.string()
    .min(1, 'This field is required')
    .trim(),
  optionalString: z.string().optional().or(z.literal('')),
}

// Patient validation schemas
export const patientSchemas = {
  create: z.object({
    first_name: baseSchemas.name,
    last_name: baseSchemas.name,
    dob: baseSchemas.date
      .refine((date) => {
        const birthDate = new Date(date)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        return age >= 0 && age <= 150
      }, 'Invalid date of birth'),
    phone: baseSchemas.phone,
    email: baseSchemas.email,
    insurance_provider: z.string().max(100, 'Insurance provider name too long').optional(),
    insurance_id: z.string().max(50, 'Insurance ID too long').optional(),
    emergency_contact_name: z.string().max(100, 'Emergency contact name too long').optional(),
    emergency_contact_phone: baseSchemas.phone,
    emergency_contact_relationship: z.string().max(50, 'Relationship description too long').optional(),
    allergies: z.array(z.string().max(100, 'Allergy description too long')).optional(),
    medications: z.array(z.string().max(200, 'Medication description too long')).optional(),
    chronic_conditions: z.array(z.string().max(200, 'Medical condition description too long')).optional(),
  }),

  update: z.object({
    id: baseSchemas.id,
    first_name: baseSchemas.name,
    last_name: baseSchemas.name,
    dob: baseSchemas.date,
    phone: baseSchemas.phone,
    email: baseSchemas.email,
    insurance_provider: z.string().max(100, 'Insurance provider name too long').optional(),
    insurance_id: z.string().max(50, 'Insurance ID too long').optional(),
    emergency_contact_name: z.string().max(100, 'Emergency contact name too long').optional(),
    emergency_contact_phone: baseSchemas.phone,
    emergency_contact_relationship: z.string().max(50, 'Relationship description too long').optional(),
    allergies: z.array(z.string().max(100, 'Allergy description too long')).optional(),
    medications: z.array(z.string().max(200, 'Medication description too long')).optional(),
    chronic_conditions: z.array(z.string().max(200, 'Medical condition description too long')).optional(),
  }),

  search: z.object({
    query: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
    limit: z.number().min(1).max(100).optional(),
    offset: z.number().min(0).optional(),
  }),
}

// Visit Template validation schemas
export const visitTemplateSchemas = {
  create: z.object({
    name: z.string()
      .min(1, 'Template name is required')
      .max(100, 'Template name must be less than 100 characters'),
    description: z.string()
      .min(1, 'Description is required')
      .max(500, 'Description must be less than 500 characters'),
    duration_minutes: z.number()
      .min(5, 'Duration must be at least 5 minutes')
      .max(480, 'Duration cannot exceed 8 hours'),
    default_notes: z.string()
      .max(1000, 'Default notes must be less than 1000 characters')
      .optional(),
    common_diagnoses: z.array(
      z.string()
        .min(1, 'Diagnosis cannot be empty')
        .max(200, 'Diagnosis description too long')
    ).optional(),
    procedures: z.array(
      z.string()
        .min(1, 'Procedure cannot be empty')
        .max(200, 'Procedure description too long')
    ).optional(),
    required_equipment: z.array(
      z.string()
        .min(1, 'Equipment cannot be empty')
        .max(100, 'Equipment description too long')
    ).optional(),
    is_active: z.boolean().default(true),
  }),

  update: z.object({
    id: baseSchemas.id,
    name: z.string()
      .min(1, 'Template name is required')
      .max(100, 'Template name must be less than 100 characters'),
    description: z.string()
      .min(1, 'Description is required')
      .max(500, 'Description must be less than 500 characters'),
    duration_minutes: z.number()
      .min(5, 'Duration must be at least 5 minutes')
      .max(480, 'Duration cannot exceed 8 hours'),
    default_notes: z.string()
      .max(1000, 'Default notes must be less than 1000 characters')
      .optional(),
    common_diagnoses: z.array(
      z.string()
        .min(1, 'Diagnosis cannot be empty')
        .max(200, 'Diagnosis description too long')
    ).optional(),
    procedures: z.array(
      z.string()
        .min(1, 'Procedure cannot be empty')
        .max(200, 'Procedure description too long')
    ).optional(),
    required_equipment: z.array(
      z.string()
        .min(1, 'Equipment cannot be empty')
        .max(100, 'Equipment description too long')
    ).optional(),
    is_active: z.boolean().default(true),
  }),
}

// Appointment validation schemas
export const appointmentSchemas = {
  create: z.object({
    patient_id: baseSchemas.id,
    visit_template_id: baseSchemas.id.optional(),
    start_time: z.string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid start time')
      .refine((date) => new Date(date) > new Date(), 'Appointment must be in the future'),
    end_time: z.string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid end time'),
    reason: z.string()
      .max(200, 'Reason must be less than 200 characters')
      .optional(),
    status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
    notes: z.string()
      .max(1000, 'Notes must be less than 1000 characters')
      .optional(),
  }).refine((data) => {
    const startTime = new Date(data.start_time)
    const endTime = new Date(data.end_time)
    return endTime > startTime
  }, {
    message: 'End time must be after start time',
    path: ['end_time'],
  }),

  update: z.object({
    id: baseSchemas.id,
    patient_id: baseSchemas.id,
    visit_template_id: baseSchemas.id.optional(),
    start_time: z.string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid start time'),
    end_time: z.string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid end time'),
    reason: z.string()
      .max(200, 'Reason must be less than 200 characters')
      .optional(),
    status: z.enum(['scheduled', 'completed', 'cancelled']),
    notes: z.string()
      .max(1000, 'Notes must be less than 1000 characters')
      .optional(),
  }).refine((data) => {
    const startTime = new Date(data.start_time)
    const endTime = new Date(data.end_time)
    return endTime > startTime
  }, {
    message: 'End time must be after start time',
    path: ['end_time'],
  }),

  search: z.object({
    patient_id: baseSchemas.id.optional(),
    status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
    date: baseSchemas.optionalDate,
    limit: z.number().min(1).max(100).optional(),
    offset: z.number().min(0).optional(),
  }),
}

// Medical History validation schemas
export const medicalHistorySchemas = {
  create: z.object({
    patient_id: baseSchemas.id,
    appointment_id: baseSchemas.id.optional(),
    diagnosis: z.string()
      .min(1, 'Diagnosis is required')
      .max(500, 'Diagnosis must be less than 500 characters'),
    symptoms: z.array(
      z.string()
        .min(1, 'Symptom cannot be empty')
        .max(200, 'Symptom description too long')
    ).optional(),
    treatment: z.string()
      .max(1000, 'Treatment description must be less than 1000 characters')
      .optional(),
    follow_up_notes: z.string()
      .max(1000, 'Follow-up notes must be less than 1000 characters')
      .optional(),
    medications_prescribed: z.array(
      z.string()
        .min(1, 'Medication cannot be empty')
        .max(200, 'Medication description too long')
    ).optional(),
    date_recorded: baseSchemas.date.optional(),
  }),

  update: z.object({
    id: baseSchemas.id,
    patient_id: baseSchemas.id,
    appointment_id: baseSchemas.id.optional(),
    diagnosis: z.string()
      .min(1, 'Diagnosis is required')
      .max(500, 'Diagnosis must be less than 500 characters'),
    symptoms: z.array(
      z.string()
        .min(1, 'Symptom cannot be empty')
        .max(200, 'Symptom description too long')
    ).optional(),
    treatment: z.string()
      .max(1000, 'Treatment description must be less than 1000 characters')
      .optional(),
    follow_up_notes: z.string()
      .max(1000, 'Follow-up notes must be less than 1000 characters')
      .optional(),
    medications_prescribed: z.array(
      z.string()
        .min(1, 'Medication cannot be empty')
        .max(200, 'Medication description too long')
    ).optional(),
    date_recorded: baseSchemas.date.optional(),
  }),
}

// AI Diagnosis validation schemas
export const diagnosisSchemas = {
  create: z.object({
    patient_id: baseSchemas.id,
    symptoms: z.array(z.string().min(1, 'Symptom cannot be empty'))
      .min(1, 'At least one symptom is required')
      .max(20, 'Too many symptoms - please consolidate'),
    duration: z.string()
      .min(1, 'Duration is required')
      .max(100, 'Duration description too long'),
    severity: z.enum(['mild', 'moderate', 'severe'], {
      errorMap: () => ({ message: 'Severity must be mild, moderate, or severe' })
    }),
    additional_notes: z.string()
      .max(1000, 'Additional notes too long')
      .optional(),
    patient_history: z.string()
      .max(5000, 'Patient history too long')
      .optional(),
    diagnoses_count: z.number()
      .min(1, 'Must request at least 1 diagnosis')
      .max(10, 'Cannot request more than 10 diagnoses')
      .default(3),
  }),
}

// Authentication validation schemas
export const authSchemas = {
  login: z.object({
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password too long'),
  }),

  register: z.object({
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password too long')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    confirmPassword: z.string(),
    firstName: baseSchemas.name,
    lastName: baseSchemas.name,
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),

  resetPassword: z.object({
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required'),
  }),

  changePassword: z.object({
    currentPassword: z.string()
      .min(1, 'Current password is required'),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password too long')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
}

// Export all schemas for easy access
export const validationSchemas = {
  patient: patientSchemas,
  visitTemplate: visitTemplateSchemas,
  appointment: appointmentSchemas,
  medicalHistory: medicalHistorySchemas,
  diagnosis: diagnosisSchemas,
  auth: authSchemas,
  base: baseSchemas,
}

// Type exports
export type PatientCreateData = z.infer<typeof patientSchemas.create>
export type PatientUpdateData = z.infer<typeof patientSchemas.update>
export type VisitTemplateCreateData = z.infer<typeof visitTemplateSchemas.create>
export type VisitTemplateUpdateData = z.infer<typeof visitTemplateSchemas.update>
export type AppointmentCreateData = z.infer<typeof appointmentSchemas.create>
export type AppointmentUpdateData = z.infer<typeof appointmentSchemas.update>
export type MedicalHistoryCreateData = z.infer<typeof medicalHistorySchemas.create>
export type MedicalHistoryUpdateData = z.infer<typeof medicalHistorySchemas.update>
export type DiagnosisCreateData = z.infer<typeof diagnosisSchemas.create>
export type LoginData = z.infer<typeof authSchemas.login>
export type RegisterData = z.infer<typeof authSchemas.register>