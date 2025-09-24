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
    <nav className="flex items-center space-x-6 lg:space-x-8 xl:space-x-10 min-w-max h-20 py-5">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 text-base font-medium transition-colors hover:text-primary whitespace-nowrap h-20 px-4 py-5 rounded-md',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="h-6 w-6" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}