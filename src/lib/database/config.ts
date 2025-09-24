/**
 * Database configuration utility
 * Allows switching between Supabase (production) and SQLite (local development)
 */

// Environment variable to control database type
const DB_TYPE = process.env.DATABASE_TYPE || 'supabase' // 'supabase' or 'sqlite'

// Export database type for other modules
export const isDevelopmentMode = DB_TYPE === 'sqlite'
export const isProductionMode = DB_TYPE === 'supabase'

console.log(`Database mode: ${DB_TYPE}${isDevelopmentMode ? ' (local development)' : ' (production)'}`)

// Re-export appropriate database client based on configuration
export const db = isDevelopmentMode
  ? require('./sqlite').sqliteUtils
  : require('@/lib/supabase').supabase

// Unified database interface for common operations
export const dbInterface = {
  async getPatients() {
    if (isDevelopmentMode) {
      return db.getPatients()
    } else {
      const { data, error } = await db
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    }
  },

  async getPatient(id: string) {
    if (isDevelopmentMode) {
      return db.getPatient(id)
    } else {
      const { data, error } = await db
        .from('patients')
        .select(`
          *,
          medical_history (
            diagnosis,
            symptoms,
            treatment,
            created_at
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      return data
    }
  },

  async createPatient(patientData: any) {
    if (isDevelopmentMode) {
      return db.createPatient(patientData)
    } else {
      const { data, error } = await db
        .from('patients')
        .insert([patientData])
        .select()
        .single()

      if (error) throw error
      return data
    }
  },

  async getAppointments(filters?: any) {
    if (isDevelopmentMode) {
      return db.getAppointments(filters)
    } else {
      let query = db
        .from('appointments')
        .select(`
          *,
          patients (
            id,
            first_name,
            last_name,
            dob
          )
        `)
        .order('start_time', { ascending: true })

      if (filters?.patient_id) {
        query = query.eq('patient_id', filters.patient_id)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.date) {
        const startOfDay = new Date(filters.date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(filters.date)
        endOfDay.setHours(23, 59, 59, 999)

        query = query
          .gte('start_time', startOfDay.toISOString())
          .lte('start_time', endOfDay.toISOString())
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    }
  },

  async createAppointment(appointmentData: any) {
    if (isDevelopmentMode) {
      const result = db.createAppointment(appointmentData)
      // Return the created appointment with patient data
      return {
        ...appointmentData,
        id: result.lastInsertRowid,
        patients: {
          id: appointmentData.patient_id,
          first_name: 'Demo',
          last_name: 'Patient'
        }
      }
    } else {
      const { data, error } = await db
        .from('appointments')
        .insert([appointmentData])
        .select(`
          *,
          patients (
            id,
            first_name,
            last_name,
            dob
          )
        `)
        .single()

      if (error) throw error
      return data
    }
  },

  async getVisitTemplates() {
    if (isDevelopmentMode) {
      return db.getVisitTemplates()
    } else {
      const { data, error } = await db
        .from('visit_templates')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    }
  },

  async getMedicalHistory(patientId: string) {
    if (isDevelopmentMode) {
      return db.getMedicalHistory(patientId)
    } else {
      const { data, error } = await db
        .from('medical_history')
        .select(`
          *,
          appointments (
            start_time,
            reason
          )
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    }
  },

  async createMedicalHistory(historyData: any) {
    if (isDevelopmentMode) {
      // Implement SQLite medical history creation if needed
      return historyData
    } else {
      const { data, error } = await db
        .from('medical_history')
        .insert([historyData])
        .select()
        .single()

      if (error) throw error
      return data
    }
  },

  // Database health check
  async healthCheck() {
    try {
      if (isDevelopmentMode) {
        const stats = db.getStats()
        return {
          status: 'healthy',
          database: 'SQLite',
          stats
        }
      } else {
        const { data, error } = await db
          .from('patients')
          .select('count', { count: 'exact' })
          .limit(1)

        if (error) throw error

        return {
          status: 'healthy',
          database: 'Supabase',
          connection: 'established'
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        database: isDevelopmentMode ? 'SQLite' : 'Supabase',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}