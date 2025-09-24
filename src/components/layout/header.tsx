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
      {/* Desktop Layout: Vertical Stacked Layout */}
      <div className="hidden md:block px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="flex justify-center pt-6 pb-4">
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

        {/* Dividing Line */}
        <div className="border-t border-border/60 mx-auto max-w-4xl"></div>

        {/* Navigation Section */}
        <div className="flex justify-center py-4">
          <MainNav />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logos/MediVIX-logo.png"
              alt="MediVIX Logo"
              width={225}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="border-t">
            <MobileNav onItemClick={() => setMobileMenuOpen(false)} />
          </div>
        )}
      </div>
    </header>
  )
}