import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/lib/supabase'

type Patient = Database['public']['Tables']['patients']['Row']
type PatientInsert = Database['public']['Tables']['patients']['Insert']
type PatientUpdate = Database['public']['Tables']['patients']['Update']

interface PatientWithHistory extends Patient {
  medical_history: any[]
  upcoming_appointments: any[]
}

// API functions
const patientsApi = {
  getAll: async (search?: string): Promise<Patient[]> => {
    const url = new URL('/api/patients', window.location.origin)
    if (search) url.searchParams.set('search', search)

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error('Failed to fetch patients')
    }
    return response.json()
  },

  getById: async (id: string): Promise<PatientWithHistory> => {
    const response = await fetch(`/api/patients/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch patient')
    }
    const data = await response.json()

    // Transform API response to match component expectations
    // API returns: { patient, medical_history, upcoming_appointments }
    // Component expects: { ...patient, medical_history, upcoming_appointments }
    return {
      ...data.patient,
      medical_history: data.medical_history || [],
      upcoming_appointments: data.upcoming_appointments || []
    }
  },

  create: async (patient: PatientInsert): Promise<Patient> => {
    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create patient')
    }
    return response.json()
  },

  update: async ({ id, ...patient }: { id: string } & PatientUpdate): Promise<Patient> => {
    const response = await fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update patient')
    }
    return response.json()
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/patients/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete patient')
    }
  },
}

// Hooks
export function usePatients(search?: string) {
  return useQuery({
    queryKey: ['patients', search],
    queryFn: () => patientsApi.getAll(search),
  })
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => patientsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: patientsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}

export function useUpdatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: patientsApi.update,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patients', variables.id] })
    },
  })
}

export function useDeletePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: patientsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}