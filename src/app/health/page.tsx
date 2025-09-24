'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { HealthStatusCard } from '@/components/health/health-status-card'
import { SystemMetrics } from '@/components/health/system-metrics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react'

interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  environment: string
  checks: {
    database?: {
      status: string
      type: string
      response_time_ms?: number
      connection?: string
      stats?: any
      error?: string
    }
    ai_service?: {
      status: string
      available: boolean
      configured?: boolean
      api_key_present?: boolean
    }
    environment?: {
      node_env: string
      database_type: string
      timezone?: string
      locale?: string
    }
    system?: {
      node_version: string
      platform: string
      architecture: string
      memory_usage: any
      uptime: number
      pid: number
    }
    performance?: {
      response_time_ms: number
      database_response_time_ms: number
      memory: {
        rss: number
        heap_used: number
        heap_total: number
        external: number
      }
      uptime_seconds: number
    }
  }
}

export default function HealthPage() {
  const { toast } = useToast()
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  // Fetch health data
  const {
    data: healthData,
    isLoading,
    isError,
    refetch,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['health'],
    queryFn: async (): Promise<HealthData> => {
      const response = await fetch('/api/health')
      if (!response.ok) {
        throw new Error('Failed to fetch health data')
      }
      return response.json()
    },
    refetchInterval: autoRefresh ? 30000 : false, // Refetch every 30 seconds if auto-refresh is on
    refetchOnWindowFocus: true,
    staleTime: 10000, // Consider data stale after 10 seconds
  })

  // Manual refresh function
  const handleManualRefresh = async () => {
    try {
      await refetch()
      toast({
        title: 'Health Status Refreshed',
        description: 'System health data has been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh health data. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Auto-refresh toggle
  const toggleAutoRefresh = (checked: boolean) => {
    setAutoRefresh(checked)
    if (checked) {
      toast({
        title: 'Auto-refresh Enabled',
        description: 'Health data will automatically update every 30 seconds.',
      })
    } else {
      toast({
        title: 'Auto-refresh Disabled',
        description: 'Health data will only update when manually refreshed.',
      })
    }
  }

  // Calculate system metrics from enhanced API data
  const systemMetrics = healthData ? {
    version: healthData.version,
    environment: healthData.environment,
    uptime: healthData.checks.performance?.uptime_seconds
      ? formatUptime(healthData.checks.performance.uptime_seconds)
      : 'Unknown',
    responseTime: healthData.checks.performance?.response_time_ms || 0,
    totalServices: Object.keys(healthData.checks).length - 2, // Exclude system and performance
    healthyServices: [
      healthData.checks.database?.status === 'healthy',
      healthData.checks.ai_service?.available,
      healthData.checks.environment?.node_env
    ].filter(Boolean).length,
    lastUpdate: healthData.timestamp,
    totalChecks: 1 // This would be tracked over time
  } : undefined

  // Helper function to format uptime
  function formatUptime(seconds: number) {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  // Get overall status info
  const getOverallStatusInfo = (status?: string) => {
    switch (status) {
      case 'healthy':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          text: 'All Systems Operational',
          description: 'All services are running normally'
        }
      case 'degraded':
        return {
          icon: AlertCircle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          text: 'Service Degraded',
          description: 'Some services are experiencing issues'
        }
      case 'unhealthy':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          text: 'System Issues Detected',
          description: 'Critical services are unavailable'
        }
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          text: 'Status Unknown',
          description: 'Unable to determine system status'
        }
    }
  }

  const overallStatus = getOverallStatusInfo(healthData?.status)
  const StatusIcon = overallStatus.icon

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              System Health
            </h1>
            <p className="text-muted-foreground">
              Monitor system status and diagnostics in real-time
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-refresh toggle */}
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => toggleAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>

            {/* Manual refresh button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overall Status Banner */}
        <Card className={`border-2 ${
          healthData?.status === 'healthy' ? 'border-green-200 bg-green-50' :
          healthData?.status === 'degraded' ? 'border-yellow-200 bg-yellow-50' :
          healthData?.status === 'unhealthy' ? 'border-red-200 bg-red-50' :
          'border-gray-200 bg-gray-50'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${overallStatus.bgColor}`}>
                  <StatusIcon className={`h-6 w-6 ${overallStatus.color}`} />
                </div>
                <div>
                  <CardTitle className="text-xl">{overallStatus.text}</CardTitle>
                  <p className="text-muted-foreground">{overallStatus.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={healthData?.status === 'healthy' ? 'default' : 'destructive'}>
                  {healthData?.status || 'Unknown'}
                </Badge>
                {dataUpdatedAt && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(dataUpdatedAt).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* System Metrics */}
        {systemMetrics && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Metrics
            </h2>
            <SystemMetrics metrics={systemMetrics} />
          </div>
        )}

        {/* Service Status Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Service Status</h2>

          {isError ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-800">Failed to Load Health Data</h3>
                <p className="text-red-600 mb-4">Unable to retrieve system health information</p>
                <Button variant="outline" onClick={handleManualRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Database Status */}
              {healthData?.checks?.database && (
                <HealthStatusCard
                  title="Database"
                  status={healthData.checks.database.status === 'healthy' ? 'healthy' : 'unhealthy'}
                  description={`${healthData.checks.database.type} Connection`}
                  details={healthData.checks.database.stats || { type: healthData.checks.database.type }}
                  lastChecked={healthData.timestamp}
                  type="database"
                />
              )}

              {/* AI Service Status */}
              {healthData?.checks?.ai_service && (
                <HealthStatusCard
                  title="AI Service"
                  status={healthData.checks.ai_service.available ? 'healthy' : 'unhealthy'}
                  description="Mistral AI Configuration"
                  details={{
                    configured: healthData.checks.ai_service.available,
                    status: healthData.checks.ai_service.status
                  }}
                  lastChecked={healthData.timestamp}
                  type="ai_service"
                />
              )}

              {/* Environment Status */}
              {healthData?.checks?.environment && (
                <HealthStatusCard
                  title="Environment"
                  status="healthy"
                  description="System Configuration"
                  details={healthData.checks.environment}
                  lastChecked={healthData.timestamp}
                  type="environment"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}