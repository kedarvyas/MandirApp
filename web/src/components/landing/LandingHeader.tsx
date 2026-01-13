'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuoteFormModal } from './QuoteFormModal'

export function LandingHeader() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/login', label: 'Staff Login' },
    { href: '/faq', label: 'FAQs', mobileOnly: true },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo and Name */}
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <Image
                src="/logo.svg"
                alt="Sanctum"
                width={48}
                height={48}
                className="w-10 h-10 md:w-12 md:h-12"
              />
              <span className="text-xl md:text-2xl font-bold text-foreground">Sanctum</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks
                .filter((link) => !link.mobileOnly)
                .map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
            </div>

            {/* Desktop Action Button + Mobile Menu Toggle */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsQuoteModalOpen(true)}
                variant="outline"
                className="hidden sm:inline-flex border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground hover:scale-105 hover:shadow-lg px-6 transition-all duration-200"
              >
                Get Started
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-foreground hover:bg-accent rounded-lg transition-colors"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 px-3 text-foreground hover:bg-accent rounded-lg transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2">
                <Button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    setIsQuoteModalOpen(true)
                  }}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <QuoteFormModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />
    </>
  )
}
