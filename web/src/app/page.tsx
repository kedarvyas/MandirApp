import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users, QrCode, CreditCard, Building2, Shield, Smartphone, ArrowRight, Check } from 'lucide-react'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { MobileAppPreview } from '@/components/landing/MobileAppPreview'
import { RollingText } from '@/components/landing/RollingText'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-2xl text-primary-foreground">॰</span>
              </div>
              <span className="text-xl font-bold text-foreground">Sanctum</span>
            </div>
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

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="bg-card rounded-2xl shadow-2xl border border-border p-2 sm:p-4 max-w-5xl mx-auto">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Everything you need to manage your community
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Purpose-built for religious organizations of all sizes
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

      {/* Platform Preview Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Two apps, one seamless experience
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Staff manage everything from the web dashboard. Members check in with the mobile app.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Dashboard Side */}
            <div>
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-3">
                  Staff Dashboard
                </span>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Manage your community
                </h3>
                <p className="text-muted-foreground">
                  Track attendance, manage members, record donations, and view analytics—all from one intuitive dashboard.
                </p>
              </div>
              <div className="bg-card rounded-xl shadow-lg border border-border p-2">
                <DashboardPreview />
              </div>
            </div>

            {/* Mobile Side */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="mb-6 text-center lg:text-left">
                <span className="inline-block px-3 py-1 bg-[#4A7C59]/10 text-[#4A7C59] rounded-full text-sm font-medium mb-3">
                  Member App
                </span>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Check in with a tap
                </h3>
                <p className="text-muted-foreground">
                  Members simply show their QR code at the door. Fast, touchless, and works offline.
                </p>
              </div>
              <MobileAppPreview />
            </div>
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

      {/* Testimonial/Trust Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Trusted by communities worldwide
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Whether you have 50 members or 5,000, Sanctum scales with your community.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              <div>
                <div className="text-4xl font-bold">500+</div>
                <div className="text-primary-foreground/70 mt-1">Organizations</div>
              </div>
              <div>
                <div className="text-4xl font-bold">50K+</div>
                <div className="text-primary-foreground/70 mt-1">Active Members</div>
              </div>
              <div>
                <div className="text-4xl font-bold">1M+</div>
                <div className="text-primary-foreground/70 mt-1">Check-Ins</div>
              </div>
              <div>
                <div className="text-4xl font-bold">99.9%</div>
                <div className="text-primary-foreground/70 mt-1">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade as you grow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <Card className="border-2 border-border">
              <CardContent className="pt-8 pb-6 px-6">
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">Starter</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground mb-6">Perfect for small communities</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#4A7C59]" />
                    Up to 50 members
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#4A7C59]" />
                    QR code check-in
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#4A7C59]" />
                    Basic reports
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#4A7C59]" />
                    1 staff account
                  </li>
                </ul>
                <Link href="/signup">
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="border-2 border-primary shadow-xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <CardContent className="pt-8 pb-6 px-6">
                <h3 className="text-lg font-semibold text-primary mb-2">Growth</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-foreground">$49</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground mb-6">For growing organizations</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#4A7C59]" />
                    Up to 500 members
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#4A7C59]" />
                    Everything in Starter
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#4A7C59]" />
                    Donation tracking
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#4A7C59]" />
                    5 staff accounts
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#4A7C59]" />
                    Email support
                  </li>
                </ul>
                <Link href="/signup">
                  <Button className="w-full bg-primary hover:bg-[#5D2850] text-primary-foreground">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Tier */}
            <Card className="border-2 border-border">
              <CardContent className="pt-8 pb-6 px-6">
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-foreground">Custom</span>
                </div>
                <p className="text-muted-foreground mb-6">For large organizations</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#4A7C59]" />
                    Unlimited members
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#4A7C59]" />
                    Everything in Growth
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#4A7C59]" />
                    Multi-location
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#4A7C59]" />
                    Unlimited staff
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#4A7C59]" />
                    Priority support
                  </li>
                </ul>
                <Link href="/signup">
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Contact Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Link href="/pricing" className="text-primary hover:underline">
              View full pricing details →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to modernize your community management?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of religious organizations already using Sanctum to streamline their operations.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-primary hover:bg-[#5D2850] text-primary-foreground px-8 py-6 text-lg">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center">
                  <span className="text-lg text-foreground">॰</span>
                </div>
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
                <li><a href="#" className="hover:text-background">Documentation</a></li>
                <li><a href="#" className="hover:text-background">Contact Us</a></li>
                <li><a href="#" className="hover:text-background">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><a href="#" className="hover:text-background">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-background">Terms of Service</a></li>
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
