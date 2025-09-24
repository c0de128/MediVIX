import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/lib/supabase'

type VisitTemplate = Database['public']['Tables']['visit_templates']['Row']
type VisitTemplateInsert = Database['public']['Tables']['visit_templates']['Insert']

// API functions
const templatesApi = {
  getAll: async (search?: string): Promise<VisitTemplate[]> => {
    const url = new URL('/api/templates', window.location.origin)
    if (search) url.searchParams.set('search', search)

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error('Failed to fetch templates')
    }
    return response.json()
  },

  create: async (template: VisitTemplateInsert): Promise<VisitTemplate> => {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create template')
    }
    return response.json()
  },
}

// Hooks
export function useTemplates(search?: string) {
  return useQuery({
    queryKey: ['templates', search],
    queryFn: () => templatesApi.getAll(search),
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: templatesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}