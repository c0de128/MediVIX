'use client'

import { useState, useEffect } from 'react'
import { Input } from './input'
import { Button } from './button'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  onClear?: () => void
  className?: string
  debounceMs?: number
  showClearButton?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function SearchInput({
  placeholder = 'Search...',
  value: controlledValue,
  onChange,
  onSearch,
  onClear,
  className,
  debounceMs = 300,
  showClearButton = true,
  size = 'md'
}: SearchProps) {
  const [internalValue, setInternalValue] = useState(controlledValue || '')
  const [debouncedValue, setDebouncedValue] = useState(controlledValue || '')

  const isControlled = controlledValue !== undefined
  const searchValue = isControlled ? controlledValue : internalValue

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchValue)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchValue, debounceMs])

  // Call onSearch when debounced value changes
  useEffect(() => {
    if (onSearch && debouncedValue !== (controlledValue || '')) {
      onSearch(debouncedValue)
    }
  }, [debouncedValue, onSearch, controlledValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value

    if (isControlled) {
      onChange?.(newValue)
    } else {
      setInternalValue(newValue)
    }
  }

  const handleClear = () => {
    const newValue = ''

    if (isControlled) {
      onChange?.(newValue)
    } else {
      setInternalValue(newValue)
    }

    onClear?.()
  }

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10',
    lg: 'h-12 text-lg'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className={cn(
        'absolute left-3 text-muted-foreground pointer-events-none z-10',
        iconSizes[size]
      )} />

      <Input
        type="search"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleInputChange}
        className={cn(
          'pl-10 pr-10',
          sizeClasses[size]
        )}
      />

      {showClearButton && searchValue && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'absolute right-1 h-6 w-6 p-0 hover:bg-muted',
            size === 'sm' && 'h-5 w-5',
            size === 'lg' && 'h-8 w-8'
          )}
          onClick={handleClear}
        >
          <X className={cn(iconSizes[size])} />
        </Button>
      )}
    </div>
  )
}

// Advanced search component with filters
interface AdvancedSearchProps {
  onSearch: (query: string, filters: Record<string, any>) => void
  filters?: {
    label: string
    key: string
    type: 'text' | 'select' | 'date' | 'boolean'
    options?: { label: string; value: string }[]
    placeholder?: string
  }[]
  className?: string
}

export function AdvancedSearch({
  onSearch,
  filters = [],
  className
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})

  const handleSearch = () => {
    onSearch(query, filterValues)
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleReset = () => {
    setQuery('')
    setFilterValues({})
    onSearch('', {})
  }

  return (
    <div className={cn('space-y-4 p-4 border rounded-lg bg-background', className)}>
      {/* Main search */}
      <SearchInput
        placeholder="Search..."
        value={query}
        onChange={setQuery}
        className="w-full"
      />

      {/* Filters */}
      {filters.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              <label className="text-sm font-medium">
                {filter.label}
              </label>

              {filter.type === 'text' && (
                <Input
                  placeholder={filter.placeholder}
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                />
              )}

              {filter.type === 'select' && (
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                >
                  <option value="">{filter.placeholder || 'Select...'}</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {filter.type === 'date' && (
                <Input
                  type="date"
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                />
              )}

              {filter.type === 'boolean' && (
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filterValues[filter.key] || false}
                    onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">{filter.placeholder || 'Enable'}</span>
                </label>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button onClick={handleSearch} size="sm">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Button onClick={handleReset} variant="outline" size="sm">
          Reset
        </Button>
      </div>
    </div>
  )
}