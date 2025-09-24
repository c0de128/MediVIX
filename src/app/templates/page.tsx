'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { TemplateForm } from '@/components/templates/template-form'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Clock,
  Stethoscope,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { TemplateGridSkeleton, StatsSkeleton } from '@/components/ui/loading-skeletons'
import { SearchInput } from '@/components/ui/search'

interface VisitTemplate {
  id: string
  name: string
  description: string
  duration_minutes: number
  default_notes: string
  common_diagnoses: string[]
  created_at: string
}

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<VisitTemplate | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const queryClient = useQueryClient()

  // Fetch all templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await fetch('/api/templates')
      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }
      return response.json()
    }
  })

  // Filter templates based on search
  const filteredTemplates = templates?.filter((template: VisitTemplate) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.common_diagnoses.some(diagnosis =>
      diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) || []

  const handleTemplateSelect = (template: VisitTemplate) => {
    setSelectedTemplate(template)
    setIsEditDialogOpen(true)
  }

  const handleEditTemplate = (template: VisitTemplate) => {
    setSelectedTemplate(template)
    setIsEditDialogOpen(true)
  }

  const handleDeleteTemplate = (templateId: string) => {
    // Implementation would go here
    console.log('Delete template:', templateId)
  }

  // Get template statistics
  const totalTemplates = templates?.length || 0
  const averageDuration = templates?.reduce((sum: number, template: VisitTemplate) =>
    sum + template.duration_minutes, 0
  ) / totalTemplates || 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              Visit Templates
            </h1>
            <p className="text-muted-foreground">
              Create and manage visit templates for different appointment types
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
              <TabsList>
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </Tabs>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Visit Template</DialogTitle>
                </DialogHeader>
                <TemplateForm
                  template={null}
                  onSuccess={() => {
                    setIsCreateDialogOpen(false)
                    queryClient.invalidateQueries({ queryKey: ['templates'] })
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
                  <p className="text-2xl font-bold">{totalTemplates}</p>
                </div>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                  <p className="text-2xl font-bold">{Math.round(averageDuration)} min</p>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quick Visit</p>
                  <p className="text-2xl font-bold">{templates?.filter((t: VisitTemplate) => t.duration_minutes <= 15).length || 0}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Comprehensive</p>
                  <p className="text-2xl font-bold">{templates?.filter((t: VisitTemplate) => t.duration_minutes >= 30).length || 0}</p>
                </div>
                <Stethoscope className="h-4 w-4 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-sm">
            <SearchInput
              placeholder="Search templates..."
              value={searchQuery}
              onChange={setSearchQuery}
              showClearButton={true}
              size="md"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredTemplates.length} of {totalTemplates} templates
          </p>
        </div>

        {/* Templates Display */}
        {isLoading ? (
          <>
            <StatsSkeleton />
            <TemplateGridSkeleton count={6} />
          </>
        ) : filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Templates Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No templates match your search criteria.' : 'Create your first visit template to get started.'}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template: VisitTemplate) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={() => handleEditTemplate(template)}
                onDelete={() => handleDeleteTemplate(template.id)}
                onClick={() => handleTemplateSelect(template)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTemplates.map((template: VisitTemplate, index: number) => (
                  <div key={template.id}>
                    <TemplateListItem
                      template={template}
                      onEdit={() => handleEditTemplate(template)}
                      onDelete={() => handleDeleteTemplate(template.id)}
                      onClick={() => handleTemplateSelect(template)}
                    />
                    {index < filteredTemplates.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Template Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
            </DialogHeader>
            {selectedTemplate && (
              <TemplateForm
                template={selectedTemplate}
                onSuccess={() => {
                  setIsEditDialogOpen(false)
                  setSelectedTemplate(null)
                  queryClient.invalidateQueries({ queryKey: ['templates'] })
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

// Template Card Component
function TemplateCard({
  template,
  onEdit,
  onDelete,
  onClick
}: {
  template: VisitTemplate
  onEdit: () => void
  onDelete: () => void
  onClick: () => void
}) {
  return (
    <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{template.duration_minutes} minutes</span>
          </div>
          <Badge variant="outline">
            {template.common_diagnoses.length} diagnoses
          </Badge>
        </div>

        {template.common_diagnoses.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Common Diagnoses:</p>
            <div className="flex flex-wrap gap-1">
              {template.common_diagnoses.slice(0, 3).map((diagnosis, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {diagnosis}
                </Badge>
              ))}
              {template.common_diagnoses.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{template.common_diagnoses.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Created {format(new Date(template.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Template List Item Component
function TemplateListItem({
  template,
  onEdit,
  onDelete,
  onClick
}: {
  template: VisitTemplate
  onEdit: () => void
  onDelete: () => void
  onClick: () => void
}) {
  return (
    <div className="cursor-pointer transition-colors hover:bg-muted/50 p-4 rounded-lg" onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-medium">{template.name}</h3>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {template.duration_minutes}m
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {template.common_diagnoses.length} diagnoses
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{template.description}</p>

          {template.common_diagnoses.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {template.common_diagnoses.slice(0, 5).map((diagnosis, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {diagnosis}
                </Badge>
              ))}
              {template.common_diagnoses.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{template.common_diagnoses.length - 5} more
                </Badge>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Created {format(new Date(template.created_at), 'MMM d, yyyy')}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

