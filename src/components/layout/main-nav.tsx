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

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center justify-center flex-wrap gap-4 lg:gap-6 xl:gap-8">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 text-sm lg:text-base font-medium transition-colors hover:text-primary whitespace-nowrap px-3 py-2 rounded-md',
              isActive
                ? 'text-foreground bg-accent'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}