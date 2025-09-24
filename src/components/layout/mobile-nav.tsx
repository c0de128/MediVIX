'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Users,
  Calendar,
  Brain,
  FileText,
  Activity
} from 'lucide-react'

const navItems = [
  {
    title: 'Patients',
    href: '/patients',
    icon: Users,
    description: 'Manage patient records and medical history'
  },
  {
    title: 'Appointments',
    href: '/appointments',
    icon: Calendar,
    description: 'Schedule and manage appointments'
  },
  {
    title: 'AI Diagnosis',
    href: '/diagnosis',
    icon: Brain,
    description: 'AI-powered medical diagnosis assistance'
  },
  {
    title: 'Visit Templates',
    href: '/templates',
    icon: FileText,
    description: 'Manage visit templates and procedures'
  },
  {
    title: 'Health Check',
    href: '/health',
    icon: Activity,
    description: 'System health and diagnostics'
  }
]

interface MobileNavProps {
  onItemClick?: () => void
}

export function MobileNav({ onItemClick }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <div className="border-t bg-background">
      <div className="container py-4">
        <nav className="grid gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <div className="flex flex-col">
                  <span>{item.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}