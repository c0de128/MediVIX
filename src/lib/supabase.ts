import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          first_name: string
          last_name: string
          dob: string
          phone: string | null
          email: string | null
          allergies: string[]
          chronic_conditions: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          dob: string
          phone?: string | null
          email?: string | null
          allergies?: string[]
          chronic_conditions?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          dob?: string
          phone?: string | null
          email?: string | null
          allergies?: string[]
          chronic_conditions?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          start_time: string
          end_time: string
          reason: string | null
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          start_time: string
          end_time: string
          reason?: string | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          start_time?: string
          end_time?: string
          reason?: string | null
          status?: string
          notes?: string | null
          created_at?: string
        }
      }
      visit_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          duration_minutes: number
          default_notes: string | null
          common_diagnoses: string[]
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          duration_minutes?: number
          default_notes?: string | null
          common_diagnoses?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          duration_minutes?: number
          default_notes?: string | null
          common_diagnoses?: string[]
          created_at?: string
        }
      }
      medical_history: {
        Row: {
          id: string
          patient_id: string
          appointment_id: string | null
          diagnosis: string | null
          symptoms: string[]
          treatment: string | null
          follow_up_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          appointment_id?: string | null
          diagnosis?: string | null
          symptoms?: string[]
          treatment?: string | null
          follow_up_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          appointment_id?: string | null
          diagnosis?: string | null
          symptoms?: string[]
          treatment?: string | null
          follow_up_notes?: string | null
          created_at?: string
        }
      }
    }
  }
}