import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users, QrCode, CreditCard, Building2, Shield, Smartphone } from 'lucide-react'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { RollingText } from '@/components/landing/RollingText'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { ProductShowcase } from '@/components/landing/ProductShowcase'
import { GetQuoteButton } from '@/components/landing/GetQuoteButton'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
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
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline attendance tracking, family management, and donation records for your temple,
              church, mosque, or spiritual community—all in one beautiful app.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md sm:max-w-none mx-auto">
              <GetQuoteButton className="w-full sm:w-auto px-8 py-6 text-lg" />
              <Link href="#demo" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full border-primary text-primary hover:bg-primary/5 hover:scale-105 px-8 py-6 text-lg transition-all duration-200">
                  See How It Works
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Custom pricing for your organization • Free demo included
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="bg-card rounded-2xl shadow-2xl border border-border p-2 sm:p-4 max-w-5xl mx-auto">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Product Showcase */}
      <ProductShowcase id="demo" />

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Powerful features for your community
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage attendance, families, and donations—all in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-background">
              <CardContent className="pt-8 pb-6 px-6">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <QrCode className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">QR Code Check-In</h3>
                <p className="text-muted-foreground">
                  Members scan their personal QR code at the door. Fast, touchless, and accurate attendance tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-background">
              <CardContent className="pt-8 pb-6 px-6">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Family Management</h3>
                <p className="text-muted-foreground">
                  Group family members together. Track attendance for the whole family with a single scan.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-background">
              <CardContent className="pt-8 pb-6 px-6">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <CreditCard className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Donation Tracking</h3>
                <p className="text-muted-foreground">
                  Record cash, check, and card donations. Generate reports for tax purposes and transparency.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-background">
              <CardContent className="pt-8 pb-6 px-6">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Smartphone className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Mobile App for Members</h3>
                <p className="text-muted-foreground">
                  Members download one app, enter your organization code, and they are ready to check in.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-background">
              <CardContent className="pt-8 pb-6 px-6">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Multi-Location Support</h3>
                <p className="text-muted-foreground">
                  Running multiple branches? Manage them all from one dashboard with unified reporting.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-background">
              <CardContent className="pt-8 pb-6 px-6">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Privacy First</h3>
                <p className="text-muted-foreground">
                  Your data belongs to you. We never share member information. GDPR and privacy compliant.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Get started in minutes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple setup, no technical expertise required
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Sign Up Your Organization</h3>
              <p className="text-muted-foreground">
                Create your account in under 2 minutes. You will receive a unique organization code to share with members.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Members Download the App</h3>
              <p className="text-muted-foreground">
                Members install the free app, enter your code, and register with their phone number.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Start Checking In</h3>
              <p className="text-muted-foreground">
                Scan QR codes at the front desk. View attendance, manage families, and record donations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Pricing that fits your community
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Every organization is unique. We work with you to create a plan that matches your needs.
            </p>
          </div>

          <Card className="max-w-3xl mx-auto border-2 border-primary/20 shadow-xl">
            <CardContent className="pt-10 pb-8 px-8 sm:px-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Flexible pricing based on your needs
                </h3>
                <p className="text-muted-foreground">
                  Our pricing adapts to what matters most for your community
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Community Size</h4>
                    <p className="text-sm text-muted-foreground">From 50 to 50,000+ members</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Locations</h4>
                    <p className="text-sm text-muted-foreground">Single site or multi-campus</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Features</h4>
                    <p className="text-sm text-muted-foreground">Pick what you need</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Support Level</h4>
                    <p className="text-sm text-muted-foreground">Self-serve to dedicated rep</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <GetQuoteButton
                  size="lg"
                  className="bg-primary hover:bg-[#5D2850] hover:scale-105 hover:shadow-lg text-primary-foreground px-10 py-6 text-lg transition-all duration-200"
                  label="Contact Us"
                  showArrow
                />
                <p className="text-sm text-muted-foreground mt-6">
                  Free demo included • No commitment required
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Ready to modernize your community management?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Get a custom demo and see how Sanctum can work for your organization.
          </p>
          <GetQuoteButton variant="secondary" className="px-8 py-6 text-lg bg-background text-foreground hover:bg-background/90 hover:scale-105 hover:shadow-lg transition-all duration-200" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.svg"
                  alt="Sanctum"
                  width={32}
                  height={32}
                  className="w-8 h-8 invert"
                />
                <span className="font-bold">Sanctum</span>
              </div>
              <p className="text-sm text-background/70">
                Modern member management for religious communities.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><Link href="#features" className="hover:text-background">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-background">Pricing</Link></li>
                <li><Link href="/signup" className="hover:text-background">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><Link href="/help" className="hover:text-background">Help Center</Link></li>
                <li><a href="mailto:kedarvyas17@gmail.com" className="hover:text-background">Contact Us</a></li>
                <li><Link href="/faq" className="hover:text-background">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><Link href="/privacy" className="hover:text-background">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-background">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 mt-12 pt-8 text-center text-sm text-background/50">
            © {new Date().getFullYear()} Sanctum. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
