import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfServicePage() {
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
            Terms of Service
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
              <h2 className="text-xl font-semibold text-foreground mb-3">Agreement to Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using Sanctum&apos;s mobile application and web platform, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services.
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Description of Service</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-muted-foreground">
                    Sanctum provides a member check-in and management platform for religious organizations. Our services include:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
                    <li>Mobile app for members to check in via QR codes</li>
                    <li>Web dashboard for organization staff to manage members</li>
                    <li>Attendance tracking and reporting</li>
                    <li>Family group management</li>
                    <li>Push notifications for announcements</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">User Accounts</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>You must provide accurate and complete information when creating an account</li>
                    <li>You are responsible for maintaining the security of your account</li>
                    <li>You must notify us immediately of any unauthorized access</li>
                    <li>One person may not maintain multiple accounts</li>
                    <li>You must be at least 13 years old to create an account (or have parental consent)</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Acceptable Use</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-muted-foreground mb-4">You agree not to:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Use the service for any illegal purpose</li>
                    <li>Attempt to gain unauthorized access to any part of the service</li>
                    <li>Interfere with or disrupt the service or servers</li>
                    <li>Upload malicious code or content</li>
                    <li>Impersonate another person or organization</li>
                    <li>Share your QR code with unauthorized individuals</li>
                    <li>Use the service to spam or harass others</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Organization Responsibilities</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-muted-foreground mb-4">Organizations using Sanctum agree to:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Use member data only for legitimate organizational purposes</li>
                    <li>Protect member privacy and handle data responsibly</li>
                    <li>Ensure authorized staff maintain account security</li>
                    <li>Comply with applicable data protection laws</li>
                    <li>Not share organization codes publicly without consideration</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Intellectual Property</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-muted-foreground">
                    The Sanctum service, including its original content, features, and functionality, is owned by Sanctum and is protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our content without permission.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Termination</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-muted-foreground">
                    We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason at our sole discretion. Upon termination, your right to use the service will cease immediately.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Disclaimer of Warranties</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-muted-foreground">
                    The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, secure, or error-free. Your use of the service is at your own risk.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Limitation of Liability</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-muted-foreground">
                    To the maximum extent permitted by law, Sanctum shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Changes to Terms</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-muted-foreground">
                    We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms on this page. Your continued use of the service after changes constitutes acceptance of the new terms.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Contact Us</h2>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-muted-foreground">
                    If you have questions about these Terms of Service, please contact us at:{' '}
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
              <Link href="/privacy" className="hover:text-background">
                Privacy
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
