import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, ArrowLeft } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Sanctum"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl font-bold text-foreground">Sanctum</span>
            </Link>
            <div className="flex items-center gap-4">
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

      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and scale as your community grows. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <Card className="border-2 border-border relative">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-muted-foreground">Starter</CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-5xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground mt-2">Perfect for small communities just getting started</p>
              </CardHeader>
              <CardContent className="pt-4">
                <Link href="/signup">
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground mb-6">
                    Get Started Free
                  </Button>
                </Link>
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">What&apos;s included</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">Up to 50 members</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">QR code check-in</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">Member mobile app access</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">Basic attendance reports</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">1 staff account</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">Family grouping</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="h-5 w-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Donation tracking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="h-5 w-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Custom branding</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Growth */}
            <Card className="border-2 border-primary shadow-xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-primary">Growth</CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-5xl font-bold text-foreground">$49</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground mt-2">For growing organizations that need more power</p>
              </CardHeader>
              <CardContent className="pt-4">
                <Link href="/signup">
                  <Button className="w-full bg-primary hover:bg-[#5D2850] text-primary-foreground mb-6">
                    Start 14-Day Free Trial
                  </Button>
                </Link>
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Everything in Starter, plus</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">Up to 500 members</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">5 staff accounts</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">Donation & payment tracking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">Advanced reports & analytics</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">Export data (CSV, PDF)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">Email support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="h-5 w-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Multi-location</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="h-5 w-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">API access</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="border-2 border-border relative">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-muted-foreground">Enterprise</CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-5xl font-bold text-foreground">Custom</span>
                </div>
                <p className="text-muted-foreground mt-2">For large organizations with complex needs</p>
              </CardHeader>
              <CardContent className="pt-4">
                <Link href="/signup">
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground mb-6">
                    Contact Sales
                  </Button>
                </Link>
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Everything in Growth, plus</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">Unlimited members</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">Unlimited staff accounts</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">Multi-location support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">Custom branding & colors</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">API access</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">Priority phone support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">Dedicated account manager</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span className="text-sm">Custom integrations</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
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
              <h3 className="text-lg font-semibold text-foreground mb-2">Can I switch plans later?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. When upgrading, you will get immediate access to new features. When downgrading, changes take effect at the end of your billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards (Visa, Mastercard, American Express) and can arrange ACH bank transfers for annual Enterprise plans.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Is there a setup fee?</h3>
              <p className="text-muted-foreground">
                No, there are no setup fees for any plan. You only pay the monthly subscription. Enterprise customers may request custom onboarding assistance.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">What happens if I exceed my member limit?</h3>
              <p className="text-muted-foreground">
                We will notify you when you are approaching your limit. You can upgrade to the next tier anytime. We won&apos;t automatically charge you or lock out existing members.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Do you offer discounts for non-profits?</h3>
              <p className="text-muted-foreground">
                Yes! All religious organizations automatically qualify for our non-profit pricing. The prices shown on this page already reflect our non-profit rates.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Absolutely. You can cancel your subscription at any time from your dashboard. You will continue to have access until the end of your current billing period.
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
            Join hundreds of religious organizations already using Sanctum.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-primary hover:bg-[#5D2850] text-primary-foreground px-8">
              Start Your Free Trial
            </Button>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required for Starter plan
          </p>
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
    </div>
  )
}
