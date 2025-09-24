// RLS Policy Management and Testing Utilities
import { supabase } from './supabase'

export interface RLSTestResult {
  operation: string
  table: string
  success: boolean
  error?: string
  rowsAffected?: number
}

export class RLSManager {
  /**
   * Test RLS policies by attempting various operations
   */
  static async testRLSPolicies(): Promise<RLSTestResult[]> {
    const results: RLSTestResult[] = []

    // Test patients table access
    try {
      const { data, error, count } = await supabase
        .from('patients')
        .select('id', { count: 'exact' })
        .limit(1)

      results.push({
        operation: 'SELECT',
        table: 'patients',
        success: !error,
        error: error?.message,
        rowsAffected: count || 0
      })
    } catch (err) {
      results.push({
        operation: 'SELECT',
        table: 'patients',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }

    // Test appointments table access
    try {
      const { data, error, count } = await supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .limit(1)

      results.push({
        operation: 'SELECT',
        table: 'appointments',
        success: !error,
        error: error?.message,
        rowsAffected: count || 0
      })
    } catch (err) {
      results.push({
        operation: 'SELECT',
        table: 'appointments',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }

    // Test visit templates access
    try {
      const { data, error, count } = await supabase
        .from('visit_templates')
        .select('id', { count: 'exact' })
        .limit(1)

      results.push({
        operation: 'SELECT',
        table: 'visit_templates',
        success: !error,
        error: error?.message,
        rowsAffected: count || 0
      })
    } catch (err) {
      results.push({
        operation: 'SELECT',
        table: 'visit_templates',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }

    // Test insert operation (should fail for clients)
    try {
      const { error } = await supabase
        .from('patients')
        .insert({
          first_name: 'Test',
          last_name: 'User',
          dob: '1990-01-01'
        })

      results.push({
        operation: 'INSERT',
        table: 'patients',
        success: !error,
        error: error?.message
      })
    } catch (err) {
      results.push({
        operation: 'INSERT',
        table: 'patients',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }

    return results
  }

  /**
   * Check current user authentication status
   */
  static async getCurrentUserInfo() {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return { authenticated: false, error: error.message }
    }

    return {
      authenticated: !!user,
      userId: user?.id,
      email: user?.email,
      role: user?.role
    }
  }

  /**
   * Test audit log functionality
   */
  static async testAuditLog(): Promise<RLSTestResult> {
    try {
      const { data, error } = await supabase
        .from('simple_audit_log')
        .select('*')
        .limit(10)

      return {
        operation: 'SELECT',
        table: 'simple_audit_log',
        success: !error,
        error: error?.message,
        rowsAffected: data?.length || 0
      }
    } catch (err) {
      return {
        operation: 'SELECT',
        table: 'simple_audit_log',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }
  }

  /**
   * Generate RLS security report
   */
  static async generateSecurityReport() {
    const userInfo = await this.getCurrentUserInfo()
    const rlsTests = await this.testRLSPolicies()
    const auditTest = await this.testAuditLog()

    const report = {
      timestamp: new Date().toISOString(),
      userInfo,
      rlsTests,
      auditTest,
      summary: {
        totalTests: rlsTests.length + 1,
        passed: rlsTests.filter(t => t.success).length + (auditTest.success ? 1 : 0),
        failed: rlsTests.filter(t => !t.success).length + (auditTest.success ? 0 : 1)
      }
    }

    return report
  }

  /**
   * Simulate healthcare provider access patterns
   */
  static async simulateProviderWorkflow() {
    const workflow: RLSTestResult[] = []

    // Step 1: View patient list
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .limit(5)

      workflow.push({
        operation: 'VIEW_PATIENT_LIST',
        table: 'patients',
        success: !error,
        error: error?.message,
        rowsAffected: data?.length || 0
      })
    } catch (err) {
      workflow.push({
        operation: 'VIEW_PATIENT_LIST',
        table: 'patients',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }

    // Step 2: View appointments
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, start_time, reason, status')
        .limit(5)

      workflow.push({
        operation: 'VIEW_APPOINTMENTS',
        table: 'appointments',
        success: !error,
        error: error?.message,
        rowsAffected: data?.length || 0
      })
    } catch (err) {
      workflow.push({
        operation: 'VIEW_APPOINTMENTS',
        table: 'appointments',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }

    // Step 3: Access visit templates
    try {
      const { data, error } = await supabase
        .from('visit_templates')
        .select('id, name, duration_minutes')

      workflow.push({
        operation: 'ACCESS_TEMPLATES',
        table: 'visit_templates',
        success: !error,
        error: error?.message,
        rowsAffected: data?.length || 0
      })
    } catch (err) {
      workflow.push({
        operation: 'ACCESS_TEMPLATES',
        table: 'visit_templates',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }

    return workflow
  }
}

// Export individual functions for easier testing
export const {
  testRLSPolicies,
  getCurrentUserInfo,
  testAuditLog,
  generateSecurityReport,
  simulateProviderWorkflow
} = RLSManager