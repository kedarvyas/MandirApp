'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, ArrowLeft, ArrowRight, Users, Building2, Zap, HeadphonesIcon, BarChart3, Shield } from 'lucide-react'
import { QuoteFormModal } from '@/components/landing/QuoteFormModal'
import { LandingHeader } from '@/components/landing/LandingHeader'

export default function PricingPage() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <LandingHeader />

      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            Pricing That Fits Your Community
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Every organization is unique. We work with you to create a custom plan that matches your specific needs and budget.
          </p>
        </div>
      </section>

      {/* Main Pricing Card */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-primary/20 shadow-2xl">
            <CardContent className="pt-10 pb-8 px-8 sm:px-12">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-foreground mb-3">
                  Custom Pricing for Your Organization
                </h2>
                <p className="text-muted-foreground text-lg">
                  Get a personalized quote based on your community&apos;s size and needs
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">Community Size</h3>
                    <p className="text-muted-foreground">From 50 to 50,000+ members. Pay only for what you need.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">Locations</h3>
                    <p className="text-muted-foreground">Single site or multi-campus. We scale with you.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">Features</h3>
                    <p className="text-muted-foreground">Choose the features that matter most to your community.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <HeadphonesIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">Support Level</h3>
                    <p className="text-muted-foreground">From self-serve to dedicated account management.</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="bg-primary hover:bg-[#5D2850] text-primary-foreground px-12 py-6 text-lg"
                >
                  Get Your Custom Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Free consultation • No commitment required • Response within 24 hours
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Included */}
      <section className="py-16 bg-card/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              What&apos;s Included in Every Plan
            </h2>
            <p className="text-muted-foreground">
              All plans include these core features to help your community thrive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
              <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">QR Code Check-In</h4>
                <p className="text-sm text-muted-foreground">Fast, touchless attendance</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
              <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Mobile App Access</h4>
                <p className="text-sm text-muted-foreground">iOS & Android for members</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
              <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Family Management</h4>
                <p className="text-sm text-muted-foreground">Group members into families</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
              <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Staff Dashboard</h4>
                <p className="text-sm text-muted-foreground">Web-based management</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
              <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Attendance Reports</h4>
                <p className="text-sm text-muted-foreground">Track patterns & trends</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
              <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Secure Data Storage</h4>
                <p className="text-sm text-muted-foreground">Your data stays private</p>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-4">Premium Features Available</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Donation Tracking
              </span>
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Multi-Location
              </span>
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Advanced Analytics
              </span>
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Custom Branding
              </span>
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                API Access
              </span>
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Priority Support
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Custom Pricing */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Custom Pricing?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Fair Pricing</h3>
              <p className="text-muted-foreground text-sm">
                Pay based on your actual usage, not arbitrary tiers that don&apos;t fit your needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Right Features</h3>
              <p className="text-muted-foreground text-sm">
                Get exactly the features you need without paying for ones you won&apos;t use.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Non-Profit Friendly</h3>
              <p className="text-muted-foreground text-sm">
                Special consideration for religious organizations and non-profits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-card/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">How does the pricing consultation work?</h3>
              <p className="text-muted-foreground">
                Simply fill out our quote form with details about your organization. We&apos;ll review your needs and send you a custom proposal within 24 hours. No obligation, no pressure.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                Yes! Every organization gets a free trial period to test the platform with their community before committing to a paid plan.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards (Visa, Mastercard, American Express) and can arrange ACH bank transfers or invoicing for annual plans.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Can I change my plan later?</h3>
              <p className="text-muted-foreground">
                Absolutely! As your community grows or your needs change, we&apos;ll work with you to adjust your plan accordingly.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Do you offer discounts for non-profits?</h3>
              <p className="text-muted-foreground">
                Yes! All religious organizations and registered non-profits receive special pricing. This is factored into every custom quote we provide.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">What if we need to cancel?</h3>
              <p className="text-muted-foreground">
                You can cancel anytime. We&apos;ll help you export your data, and you&apos;ll have access until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Let&apos;s discuss how Sanctum can help your community thrive.
          </p>
          <Button
            size="lg"
            onClick={() => setIsQuoteModalOpen(true)}
            className="bg-primary hover:bg-[#5D2850] text-primary-foreground px-8"
          >
            Get Your Custom Quote
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Sanctum"
                width={32}
                height={32}
                className="w-8 h-8 invert"
              />
              <span className="font-bold">Sanctum</span>
            </div>
            <div className="flex gap-6 text-sm text-background/70">
              <Link href="/" className="hover:text-background">Home</Link>
              <Link href="/signup" className="hover:text-background">Get Started</Link>
              <a href="#" className="hover:text-background">Privacy</a>
              <a href="#" className="hover:text-background">Terms</a>
            </div>
          </div>
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/50">
            © {new Date().getFullYear()} Sanctum. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Quote Modal */}
      <QuoteFormModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />
    </div>
  )
}
