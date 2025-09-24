import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withErrorHandling } from '@/lib/error-handling'
import { RLSManager } from '@/lib/rls-manager'
import { addSecurityHeaders } from '@/lib/security-headers'

// GET /api/rls/test - Test RLS policies and generate security report
export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    // Generate comprehensive security report
    const securityReport = await RLSManager.generateSecurityReport()

    // Add additional system information
    const systemInfo = {
      databaseConnection: true,
      timestamp: new Date().toISOString(),
      apiVersion: '1.0.0'
    }

    // Test current database connection
    try {
      const { error: connectionError } = await supabase
        .from('visit_templates')
        .select('id')
        .limit(1)

      systemInfo.databaseConnection = !connectionError
    } catch (error) {
      systemInfo.databaseConnection = false
    }

    const response = NextResponse.json({
      status: 'success',
      systemInfo,
      securityReport,
      recommendations: generateSecurityRecommendations(securityReport)
    })

    return addSecurityHeaders(response)
  } catch (error: any) {
    const response = NextResponse.json({
      status: 'error',
      message: 'Failed to generate security report',
      error: error.message
    }, { status: 500 })

    return addSecurityHeaders(response)
  }
})

// POST /api/rls/test - Run specific RLS tests
export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { testType } = body

    let testResults

    switch (testType) {
      case 'basic':
        testResults = await RLSManager.testRLSPolicies()
        break
      case 'workflow':
        testResults = await RLSManager.simulateProviderWorkflow()
        break
      case 'audit':
        testResults = await RLSManager.testAuditLog()
        break
      default:
        testResults = await RLSManager.testRLSPolicies()
    }

    const response = NextResponse.json({
      status: 'success',
      testType,
      results: testResults,
      timestamp: new Date().toISOString()
    })

    return addSecurityHeaders(response)
  } catch (error: any) {
    const response = NextResponse.json({
      status: 'error',
      message: 'Failed to run RLS tests',
      error: error.message
    }, { status: 500 })

    return addSecurityHeaders(response)
  }
})

function generateSecurityRecommendations(report: any) {
  const recommendations = []

  // Check authentication status
  if (!report.userInfo.authenticated) {
    recommendations.push({
      priority: 'high',
      category: 'authentication',
      message: 'User authentication should be implemented for production use',
      action: 'Implement Supabase Auth or similar authentication system'
    })
  }

  // Check failed tests
  const failedTests = report.rlsTests.filter((test: any) => !test.success)
  if (failedTests.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'rls_policies',
      message: `${failedTests.length} RLS tests failed`,
      action: 'Review and update RLS policies in Supabase dashboard',
      details: failedTests.map((test: any) => `${test.operation} on ${test.table}: ${test.error}`)
    })
  }

  // Check audit logging
  if (!report.auditTest.success) {
    recommendations.push({
      priority: 'medium',
      category: 'audit_logging',
      message: 'Audit logging is not functioning properly',
      action: 'Check audit log table and triggers in database'
    })
  }

  // General security recommendations
  recommendations.push({
    priority: 'medium',
    category: 'security',
    message: 'Consider implementing additional security measures',
    action: 'Add user roles, session management, and data encryption'
  })

  return recommendations
}