'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Circle,
  ChevronDown,
  Database,
  Brain,
  Server,
  Clock
} from 'lucide-react'
import { useState } from 'react'

interface HealthStatusCardProps {
  title: string
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
  description?: string
  details?: Record<string, any>
  lastChecked?: string
  responseTime?: number
  type?: 'database' | 'ai_service' | 'environment' | 'general'
}

export function HealthStatusCard({
  title,
  status,
  description,
  details,
  lastChecked,
  responseTime,
  type = 'general'
}: HealthStatusCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'healthy':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          badge: 'default' as const,
          text: 'Healthy'
        }
      case 'degraded':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          badge: 'destructive' as const,
          text: 'Degraded'
        }
      case 'unhealthy':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          badge: 'destructive' as const,
          text: 'Unhealthy'
        }
      default:
        return {
          icon: Circle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          badge: 'secondary' as const,
          text: 'Unknown'
        }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'database':
        return Database
      case 'ai_service':
        return Brain
      case 'environment':
        return Server
      default:
        return CheckCircle
    }
  }

  const statusInfo = getStatusInfo(status)
  const StatusIcon = statusInfo.icon
  const TypeIcon = getTypeIcon(type)

  return (
    <Card className={`transition-colors ${statusInfo.borderColor} border-2`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
              <TypeIcon className={`h-5 w-5 ${statusInfo.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusInfo.badge} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusInfo.text}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Response Time and Last Checked */}
        <div className="flex items-center justify-between text-sm">
          {responseTime && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{responseTime}ms</span>
            </div>
          )}
          {lastChecked && (
            <div className="text-muted-foreground">
              Last checked: {new Date(lastChecked).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Details Section */}
        {details && Object.keys(details).length > 0 && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            >
              View Details
              <ChevronDown className={`h-4 w-4 transition-transform ${
                isDetailsOpen ? 'rotate-180' : ''
              }`} />
            </Button>
            {isDetailsOpen && (
              <div className="space-y-2 mt-2 animate-in slide-in-from-top-1 duration-200">
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                  {Object.entries(details).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {typeof value === 'boolean' ? (value ? '✓' : '✗') : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}