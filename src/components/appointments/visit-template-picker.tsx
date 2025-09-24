'use client'

import { useState, useEffect } from 'react'
import { useTemplates } from '@/hooks/use-templates'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { Card } from '@/components/ui/card'
import { Check, ChevronDown, Clock, FileText, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VisitTemplate {
  id: string
  name: string
  description?: string
  duration_minutes: number
  procedures?: string[]
  required_equipment?: string[]
  is_active: boolean
}

interface VisitTemplatePickerProps {
  value?: string
  onSelect: (templateId: string, template: VisitTemplate) => void
  onCreateNew?: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function VisitTemplatePicker({
  value,
  onSelect,
  onCreateNew,
  disabled = false,
  placeholder = 'Select a visit template...',
  className
}: VisitTemplatePickerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { data: templates, isLoading } = useTemplates(searchQuery)

  const selectedTemplate = templates?.find(t => t.id === value)

  const handleSelect = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId)
    if (template) {
      onSelect(templateId, template as any)
      setOpen(false)
    }
  }

  const recentTemplates = templates?.slice(0, 3)
  const commonTemplates = templates?.filter(t =>
    ['Annual Physical', 'Follow-up Visit', 'Consultation'].includes(t.name)
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between',
            !selectedTemplate && 'text-muted-foreground',
            className
          )}
        >
          {selectedTemplate ? (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="truncate">{selectedTemplate.name}</span>
              <Badge variant="secondary" className="ml-2">
                <Clock className="h-3 w-3 mr-1" />
                {selectedTemplate.duration_minutes} min
              </Badge>
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search templates..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">
                  No templates found.
                </p>
                {onCreateNew && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOpen(false)
                      onCreateNew()
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Create New Template
                  </Button>
                )}
              </div>
            </CommandEmpty>

            {/* Recent Templates */}
            {recentTemplates && recentTemplates.length > 0 && !searchQuery && (
              <>
                <CommandGroup heading="Recent">
                  {recentTemplates.map(template => (
                    <CommandItem
                      key={template.id}
                      value={template.id}
                      onSelect={handleSelect}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center w-full">
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === template.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{template.name}</span>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {template.duration_minutes}m
                            </Badge>
                          </div>
                          {template.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Common Templates */}
            {commonTemplates && commonTemplates.length > 0 && !searchQuery && (
              <>
                <CommandGroup heading="Common">
                  {commonTemplates.map(template => (
                    <CommandItem
                      key={template.id}
                      value={template.id}
                      onSelect={handleSelect}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center w-full">
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === template.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{template.name}</span>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {template.duration_minutes}m
                            </Badge>
                          </div>
                          {template.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* All Templates */}
            {templates && templates.length > 0 && (
              <CommandGroup heading={searchQuery ? 'Search Results' : 'All Templates'}>
                {templates
                  .filter(t =>
                    !searchQuery ||
                    !recentTemplates?.includes(t) &&
                    !commonTemplates?.includes(t)
                  )
                  .map(template => (
                    <CommandItem
                      key={template.id}
                      value={template.id}
                      onSelect={handleSelect}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center w-full">
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === template.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{template.name}</span>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {template.duration_minutes}m
                            </Badge>
                          </div>
                          {template.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {template.description}
                            </p>
                          )}
                          {(template as any).procedures && (template as any).procedures.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {(template as any).procedures.slice(0, 3).map((procedure: any, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {procedure}
                                </Badge>
                              ))}
                              {(template as any).procedures.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{(template as any).procedures.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}

            {/* Create New Option */}
            {onCreateNew && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      onCreateNew()
                    }}
                    className="cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="font-medium">Create New Template</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}