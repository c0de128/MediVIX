'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { MainNav } from './main-nav'
import { MobileNav } from './mobile-nav'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-24 items-center px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout: Three-Column Grid with Centered Logo */}
        <div className="hidden md:grid w-full grid-cols-3 items-center">

          {/* Left Column: Spacer */}
          <div></div>

          {/* Center Column: Logo */}
          <div className="flex justify-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logos/MediVIX-logo.png"
                alt="MediVIX Logo"
                width={270}
                height={72}
                className="h-16 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Right Column: Navigation */}
          <div className="flex justify-end">
            <MainNav />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="flex items-center space-x-2 md:hidden">
              <Image
                src="/images/logos/MediVIX-logo.png"
                alt="MediVIX Logo"
                width={225}
                height={60}
                className="h-16 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <MobileNav onItemClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  )
}