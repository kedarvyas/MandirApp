import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
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
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">

            <div className="bg-card rounded-xl p-6 border border-border mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-3">Overview</h2>
              <p className="text-muted-foreground">
                Sanctum (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and web platform.
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Information We Collect</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-medium text-foreground mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Name and contact information (phone number, email address)</li>
                    <li>Profile photo (optional)</li>
                    <li>Organization membership information</li>
                    <li>Family group associations</li>
                    <li>Check-in history and attendance records</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-2">Automatically Collected Information</h3>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Device information (device type, operating system)</li>
                    <li>Push notification tokens (if notifications are enabled)</li>
                    <li>App usage analytics</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">How We Use Your Information</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>To facilitate member check-ins at your organization</li>
                    <li>To manage family groups and memberships</li>
                    <li>To send push notifications about announcements and events</li>
                    <li>To provide attendance reports to organization administrators</li>
                    <li>To improve our services and user experience</li>
                    <li>To communicate with you about your account</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Data Sharing</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-muted-foreground mb-4">
                    We do not sell, trade, or rent your personal information to third parties. Your data may be shared with:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li><strong>Your Organization:</strong> Administrators can view member profiles and attendance data</li>
                    <li><strong>Service Providers:</strong> We use trusted third-party services (e.g., Supabase for database, Expo for push notifications) that process data on our behalf</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Data Security</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-muted-foreground">
                    We implement industry-standard security measures to protect your data, including encryption in transit and at rest, secure authentication via phone OTP, and isolated organization data. However, no method of transmission over the internet is 100% secure.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Your Rights</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-muted-foreground mb-4">You have the right to:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Access your personal data</li>
                    <li>Update or correct your information</li>
                    <li>Delete your account and associated data</li>
                    <li>Opt out of push notifications</li>
                    <li>Request a copy of your data</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Children&apos;s Privacy</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-muted-foreground">
                    Our service may be used by families with children. Children&apos;s accounts are managed by their parent or guardian through the family group feature. We do not knowingly collect personal information from children under 13 without parental consent.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Changes to This Policy</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-muted-foreground">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Contact Us</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-muted-foreground">
                    If you have questions about this Privacy Policy or our data practices, please contact us at:{' '}
                    <a href="mailto:kedarvyas17@gmail.com" className="text-primary hover:underline">
                      kedarvyas17@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
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
              <Link href="/" className="hover:text-background">
                Home
              </Link>
              <Link href="/terms" className="hover:text-background">
                Terms
              </Link>
              <Link href="/help" className="hover:text-background">
                Help
              </Link>
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
