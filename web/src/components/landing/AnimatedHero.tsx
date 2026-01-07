'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { RollingText } from './RollingText'

export function AnimatedHero() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return

      const scrollY = window.scrollY
      const threshold = 150 // Distance to complete the animation
      const progress = Math.min(scrollY / threshold, 1)

      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isScrolled = scrollProgress > 0.1
  const headerOpacity = scrollProgress
  const heroOpacity = 1 - scrollProgress
  const heroScale = 1 - (scrollProgress * 0.3)

  return (
    <>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo in header - fades in on scroll */}
            <div
              className="flex items-center gap-2 transition-all duration-300"
              style={{
                opacity: headerOpacity,
                transform: `translateY(${(1 - headerOpacity) * -10}px)`
              }}
            >
              <Image
                src="/logo.svg"
                alt="Sanctum"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl font-bold text-foreground">Sanctum</span>
            </div>

            {/* Spacer when logo is hidden */}
            <div
              className="flex-1 transition-opacity duration-300"
              style={{ opacity: 1 - headerOpacity }}
            />

            <div className="flex items-center gap-4">
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Staff Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-[#5D2850] text-primary-foreground">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />

        {/* Large Logo Section - Main focal point */}
        <div
          className="relative py-16 sm:py-24 transition-all duration-200 ease-out"
          style={{
            opacity: heroOpacity,
            transform: `scale(${heroScale}) translateY(${scrollProgress * -30}px)`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center text-center">
              {/* Logo and Name - Hero Focus */}
              <div className="flex flex-col items-center gap-4 mb-8">
                <Image
                  src="/logo.svg"
                  alt="Sanctum"
                  width={120}
                  height={120}
                  className="w-24 h-24 sm:w-32 sm:h-32"
                  priority
                />
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight">
                  Sanctum
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline and CTA Section - Stays more visible */}
        <div className="relative pb-12 sm:pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight">
                Modern Member Check-In for Your{' '}
                <span className="text-primary">
                  <RollingText
                    words={[
                      'Non-Profit Organization',
                      'Religious Association',
                      'Cultural Community',
                    ]}
                    interval={2500}
                  />
                </span>
              </h2>
              <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Streamline attendance tracking, family management, and donation records for your temple,
                church, mosque, or spiritual community—all in one beautiful app.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-primary hover:bg-[#5D2850] text-primary-foreground px-8 py-6 text-lg">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5 px-8 py-6 text-lg">
                    See How It Works
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                No credit card required • Free for up to 50 members
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
