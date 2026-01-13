'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { QuoteFormModal } from './QuoteFormModal'

export function LandingHeader() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Name - Larger */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="Sanctum"
                width={48}
                height={48}
                className="w-12 h-12"
              />
              <span className="text-2xl font-bold text-foreground">Sanctum</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Pricing
              </Link>
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Staff Login
              </Link>
            </div>

            {/* Action Button */}
            <div className="flex items-center">
              <Button
                onClick={() => setIsQuoteModalOpen(true)}
                variant="outline"
                className="border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground hover:scale-105 hover:shadow-lg px-6 transition-all duration-200"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <QuoteFormModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />
    </>
  )
}
