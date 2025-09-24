import { Skeleton } from './skeleton'
import { Card, CardContent, CardHeader } from './card'

// Patient card skeleton
export function PatientCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
      </CardContent>
    </Card>
  )
}

// Patient list skeleton
export function PatientListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[180px]" />
            <Skeleton className="h-4 w-[120px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[60px]" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Template card skeleton
export function TemplateCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-6 w-[80px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-[120px]" />
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-5 w-[60px]" />
              <Skeleton className="h-5 w-[80px]" />
              <Skeleton className="h-5 w-[70px]" />
            </div>
          </div>
          <div className="pt-3 border-t">
            <Skeleton className="h-3 w-[100px]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Template grid skeleton
export function TemplateGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <TemplateCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Appointment skeleton
export function AppointmentSkeleton() {
  return (
    <div className="p-3 rounded-lg border space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-[120px]" />
        </div>
        <Skeleton className="h-5 w-[60px]" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-4 w-[80px]" />
      </div>
    </div>
  )
}

// Calendar day skeleton
export function CalendarDaySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <AppointmentSkeleton key={i} />
      ))}
    </div>
  )
}

// Form skeleton
export function FormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[200px]" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-[150px]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-[180px]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[50px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Skeleton className="h-10 w-[80px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </CardContent>
    </Card>
  )
}

// Statistics skeleton
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[60px]" />
              </div>
              <Skeleton className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Table skeleton
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center space-x-4 p-4 border-b">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center space-x-4 p-4 border-b">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Page loading skeleton
export function PageLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[120px]" />
      </div>

      {/* Stats */}
      <StatsSkeleton />

      {/* Content */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-[300px]" />
        <TableSkeleton />
      </div>
    </div>
  )
}

// Loading overlay
export function LoadingOverlay({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) {
  if (isLoading) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
        <div className="opacity-50">{children}</div>
      </div>
    )
  }

  return <>{children}</>
}