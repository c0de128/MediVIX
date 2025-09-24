'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Activity,
  Clock,
  Database,
  Zap,
  Server,
  CheckCircle2
} from 'lucide-react'

interface SystemMetricsProps {
  metrics?: {
    uptime?: string
    version?: string
    environment?: string
    responseTime?: number
    totalChecks?: number
    healthyServices?: number
    totalServices?: number
    lastUpdate?: string
  }
}

export function SystemMetrics({ metrics }: SystemMetricsProps) {
  const healthPercentage = metrics?.totalServices
    ? Math.round((metrics.healthyServices || 0) / metrics.totalServices * 100)
    : 0

  const formatUptime = (uptime?: string) => {
    if (!uptime) return 'Unknown'

    // If uptime is in seconds, convert to readable format
    if (uptime.match(/^\d+$/)) {
      const seconds = parseInt(uptime)
      const days = Math.floor(seconds / 86400)
      const hours = Math.floor((seconds % 86400) / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)

      if (days > 0) return `${days}d ${hours}h ${minutes}m`
      if (hours > 0) return `${hours}h ${minutes}m`
      return `${minutes}m`
    }

    return uptime
  }

  const getResponseTimeColor = (responseTime?: number) => {
    if (!responseTime) return 'text-muted-foreground'
    if (responseTime < 100) return 'text-green-600'
    if (responseTime < 500) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* System Health Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{healthPercentage}%</span>
              <Badge variant={healthPercentage >= 100 ? 'default' : 'secondary'}>
                {metrics?.healthyServices || 0}/{metrics?.totalServices || 0} Services
              </Badge>
            </div>
            <Progress
              value={healthPercentage}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              Overall system health status
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Response Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className={`text-2xl font-bold ${getResponseTimeColor(metrics?.responseTime)}`}>
              {metrics?.responseTime ? `${metrics.responseTime}ms` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average API response time
            </p>
            {metrics?.responseTime && (
              <div className="flex items-center gap-1 mt-2">
                <div className={`w-2 h-2 rounded-full ${
                  metrics.responseTime < 100 ? 'bg-green-500' :
                  metrics.responseTime < 500 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-xs">
                  {metrics.responseTime < 100 ? 'Excellent' :
                   metrics.responseTime < 500 ? 'Good' : 'Slow'}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Uptime */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">
              {formatUptime(metrics?.uptime)}
            </div>
            <p className="text-xs text-muted-foreground">
              Continuous operation time
            </p>
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600">Running</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Environment</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Environment:</span>
              <Badge variant="outline" className="text-xs">
                {metrics?.environment || 'Unknown'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Version:</span>
              <span className="text-sm font-mono">
                {metrics?.version || 'Unknown'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Checks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Health Checks</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {metrics?.totalChecks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total checks performed
            </p>
            {metrics?.lastUpdate && (
              <p className="text-xs text-muted-foreground">
                Last check: {new Date(metrics.lastUpdate).toLocaleTimeString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Status Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status Summary</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Overall Status:</span>
              <Badge
                variant={healthPercentage >= 100 ? 'default' : 'destructive'}
                className="text-xs"
              >
                {healthPercentage >= 100 ? 'Healthy' :
                 healthPercentage >= 75 ? 'Degraded' : 'Critical'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Services:</span>
              <span className="text-sm font-bold text-green-600">
                {metrics?.healthyServices || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Services:</span>
              <span className="text-sm font-bold">
                {metrics?.totalServices || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}